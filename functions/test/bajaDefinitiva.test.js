const test = require("node:test");
const assert = require("node:assert/strict");
const { FieldValue } = require("firebase-admin/firestore");

const functions = require("../index.js");

// ── Doble de Firestore en memoria ────────────────────────────
//
// Modela lo justo que usan borrarArbolDeUsuario, borrarSesionesTelegram y
// desvincularChat: lectura/escritura de documentos, listCollections,
// limit().get() paginado y batch().commit(). No necesita red ni credenciales.

function crearFirestoreFalso(datos = {}) {
  const docs = new Map(Object.entries(datos)); // ruta -> data
  const batches = [];
  const consultas = []; // {coleccion, campo, valor}
  let limitePorLectura = 0;

  function loteDe(coleccion, limite) {
    const prefijo = `${coleccion}/`;
    let salida = [...docs.entries()]
      .filter(([ruta]) => ruta.startsWith(prefijo))
      // Como Firestore: collection.get() solo devuelve hijos directos, nunca
      // los nietos. Sin este filtro, `usuarios/u/viajes` contaría también
      // `usuarios/u/viajes/v1/paradas/p1` y el conteo saldría inflado.
      .filter(([ruta]) => !ruta.slice(prefijo.length).includes("/"))
      .map(([ruta, data]) => ({ ruta, id: ruta.slice(prefijo.length), data }));
    if (limite) salida = salida.slice(0, limite);
    return salida;
  }

  const db = {
    datos: docs,
    batches,
    consultas,
    // controla cuántas filas devuelve cada limit().get()
    setLimitePorLectura(n) {
      limitePorLectura = n;
    },
    doc(ruta) {
      return {
        // Un DocumentReference real expone .path y listCollections() en el mismo
        // objeto; sin path, batch.delete(ref.path) no borraría nada.
        path: ruta,
        ref: { path: ruta },
        async get() {
          const existe = docs.has(ruta);
          return { exists: existe, data: () => docs.get(ruta), ref: { path: ruta } };
        },
        async set(data) {
          const previo = docs.get(ruta) || {};
          docs.set(ruta, { ...previo, ...data });
        },
        // Igual que Firestore: update() falla con NOT_FOUND si el documento no
        // existe, y jamás lo crea. Es la diferencia que evita dejar un
        // documento vacío tras la baja.
        async update(data) {
          if (!docs.has(ruta)) {
            const err = new Error(`5 NOT_FOUND: no entity to update: ${ruta}`);
            err.code = 5;
            throw err;
          }
          const siguiente = { ...docs.get(ruta) };
          for (const [campo, valor] of Object.entries(data)) {
            if (valor instanceof FieldValue) delete siguiente[campo];
            else siguiente[campo] = valor;
          }
          docs.set(ruta, siguiente);
        },
        async delete() {
          docs.delete(ruta);
        },
        collection(coleccion) {
          return db.collection(coleccion);
        },
        async listCollections() {
          const seen = new Set();
          const prefijo = `${ruta}/`;
          for (const rutaDoc of docs.keys()) {
            if (!rutaDoc.startsWith(prefijo)) continue;
            // el primer segmento tras el doc es la subcolección
            const resto = rutaDoc.slice(prefijo.length);
            const col = resto.split("/")[0];
            if (col) seen.add(col);
          }
          return [...seen].map((id) => db.collection(`${ruta}/${id}`));
        },
      };
    },
    collection(coleccion) {
      return {
        // CollectionReference real expone .id con el último segmento
        id: coleccion.split("/").pop(),
        path: coleccion,
        limit(n) {
          return { get: async () => ({ empty: loteDe(coleccion, n).length === 0, docs: loteDe(coleccion, n).map(toQueryDoc) }) };
        },
        async get() {
          const todas = loteDe(coleccion, limitePorLectura);
          return { empty: todas.length === 0, docs: todas.map(toQueryDoc) };
        },
        where(campo, op, valor) {
          consultas.push({ coleccion, campo, op, valor });
          const leer = (limite) => {
            const filtrados = loteDe(coleccion, limitePorLectura).filter(
              (d) => d.data && d.data[campo] === valor
            );
            const recortadas = limite ? filtrados.slice(0, limite) : filtrados;
            return { empty: recortadas.length === 0, docs: recortadas.map(toQueryDoc) };
          };
          return {
            limit(n) {
              return { get: async () => leer(n) };
            },
            async get() {
              return leer();
            },
          };
        },
      };
    },
    batch() {
      const pendientes = [];
      return {
        delete(ref) {
          pendientes.push(ref);
        },
        async commit() {
          batches.push([...pendientes]);
          for (const ref of pendientes) docs.delete(ref.path);
        },
      };
    },
  };

  function toQueryDoc({ ruta, id, data }) {
    // El ref devuelto es un doc() de verdad, no un {path} plano: la baja
    // recursiva necesita listCollections() sobre él para bajar a las
    // subcolecciones de cada documento.
    return { id, data: () => data, ref: db.doc(ruta) };
  }

  return db;
}

// ── Contrato del endpoint ────────────────────────────────────

test("BE-09: bajaDefinitiva debe estar publicada como callable", () => {
  assert.ok(functions.bajaDefinitiva, "El callable bajaDefinitiva debe existir");
  const endpoint = functions.bajaDefinitiva.__endpoint;
  assert.ok(endpoint, "Debe tener endpoint de Cloud Functions");
  assert.equal(
    endpoint.timeoutSeconds,
    300,
    "El borrado recursivo necesita margen: 300s"
  );
  assert.equal(endpoint.availableMemoryMb, 256, "Memoria normalizada a 256MB");
});

test("BE-09: el callable debe rechazar peticiones sin sesión", async () => {
  const { HttpsError } = require("firebase-functions/v2/https");
  const app = require("../index.js").bajaDefinitiva;

  // Invocar sin auth debe fallar antes de tocar Firestore.
  await assert.rejects(
    () => app.run({}),
    (err) => {
      assert.equal(err.code, "unauthenticated");
      return true;
    }
  );
  assert.ok(HttpsError, "sanity: HttpsError disponible");
});

test("BE-09: el callable debe exigir autenticación reciente (<=5 min)", async () => {
  const app = functions.bajaDefinitiva;
  const viejo = Math.floor(Date.now() / 1000) - 60 * 60; // hace 1 hora

  await assert.rejects(
    () => app.run({ auth: { uid: "u1", token: { auth_time: viejo } } }),
    (err) => {
      assert.equal(err.code, "failed-precondition");
      assert.match(err.message, /vuelve a iniciar sesión/i);
      return true;
    }
  );
});

// ── BE-09: borrado recursivo del árbol de usuario ────────────

test("BE-09: borrarArbolDeUsuario borra todas las subcolecciones descubtas", async () => {
  const db = crearFirestoreFalso({
    "usuarios/u1": { correo: "a@b.com" },
    "usuarios/u1/vehiculos/v1": { placa: "ABC123" },
    "usuarios/u1/viajes/viaje1": { kmT: 100 },
    // esta es la que la lista fija del cliente omitía
    "usuarios/u1/cuentas_cobro/cc1": { total: 500 },
    "usuarios/u1/config_mant/cfg": { semana: 1 },
  });

  const detalle = await functions.borrarArbolDeUsuario(db, "u1");

  assert.equal(db.datos.size, 0, "No debe quedar ningún documento del usuario");
  assert.equal(detalle.vehiculos, 1);
  assert.equal(detalle.viajes, 1);
  assert.equal(detalle.cuentas_cobro, 1, "cuentas_cobro debe borrarse (la lista vieja la omitía)");
  assert.equal(detalle.config_mant, 1);
});

test("BE-09: borra también las subcolecciones anidadas", async () => {
  // listCollections() de un solo nivel dejaría 'paradas' viva, porque cuelga de
  // un documento de 'viajes' y no del usuario.
  const db = crearFirestoreFalso({
    "usuarios/u13": {},
    "usuarios/u13/viajes/v1": { km: 10 },
    "usuarios/u13/viajes/v1/paradas/p1": { nombre: "Peaje Norte" },
    "usuarios/u13/viajes/v1/paradas/p2": { nombre: "Peaje Sur" },
    "usuarios/u13/viajes/v2": { km: 20 },
  });

  const detalle = await functions.borrarArbolDeUsuario(db, "u13");

  assert.equal(db.datos.size, 0, "Las paradas anidadas no pueden sobrevivir al baja");
  assert.equal(detalle.viajes, 2);
  assert.equal(detalle.paradas, 2);
});

test("BE-09: una colección nueva se borra sin tocar el código", async () => {
  // Simula que el esquema creció: aparece una subcolección que el código nunca
  //heardó. listCollections() debe absorberla.
  const db = crearFirestoreFalso({
    "usuarios/u2": {},
    "usuarios/u2/una_coleccion_del_futuro/doc1": { x: 1 },
  });

  const detalle = await functions.borrarArbolDeUsuario(db, "u2");

  assert.equal(detalle.una_coleccion_del_futuro, 1);
  assert.equal(db.datos.size, 0);
});

test("BE-09: borra en lotes cuando la colección supera 400 documentos", async () => {
  const datos = { "usuarios/u3": {} };
  for (let i = 0; i < 950; i++) datos[`usuarios/u3/viajes/v${i}`] = { i };
  const db = crearFirestoreFalso(datos);

  const detalle = await functions.borrarArbolDeUsuario(db, "u3");

  assert.equal(detalle.viajes, 950);
  assert.equal(db.datos.size, 0);
  // 950 no cabe en un solo commit de 500
  assert.ok(db.batches.length > 1, "Debe partir en varios lotes");
  for (const lote of db.batches) {
    assert.ok(lote.length <= 500, `Lote de ${lote.length} excede el límite de Firestore`);
  }
});

test("BE-09: la firma (firmaUrl) desaparece al borrar el documento raíz", async () => {
  const db = crearFirestoreFalso({
    "usuarios/u4": { firmaUrl: "data:image/png;base64,AAAA" },
  });

  await functions.borrarArbolDeUsuario(db, "u4");

  assert.equal(db.datos.has("usuarios/u4"), false);
});

test("BE-09: no toca documentos de otro usuario", async () => {
  const db = crearFirestoreFalso({
    "usuarios/u5": {},
    "usuarios/u5/viajes/a": {},
    "usuarios/otro/viajes/b": {},
    "usuarios/otro": {},
  });

  await functions.borrarArbolDeUsuario(db, "u5");

  assert.equal(db.datos.has("usuarios/u5"), false);
  assert.equal(db.datos.has("usuarios/otro"), true, "No debe borrar datos ajenos");
  assert.equal(db.datos.has("usuarios/otro/viajes/b"), true);
});

// ── BE-09: la baja completa no deja residuos ──────────────────

test("BE-09: la baja no deja recreado el documento raíz del usuario", async () => {
  const db = crearFirestoreFalso({
    "usuarios/u9": { correo: "a@b.com", telegramChatId: "555" },
    "usuarios/u9/viajes/v1": { km: 10 },
  });
  const borrados = [];

  const r = await functions.bajaDefinitivaDeUsuario(db, "u9", {
    borrarArchivos: async () => 2,
    borrarAuth: async (uid) => borrados.push(uid),
  });

  // Regresión: la versión anterior hacía set(..., {merge:true}) con
  // FieldValue.delete() DESPUÉS de borrar el árbol, y eso recreaba
  // usuarios/u9 como documento vacío. Una baja definitiva no puede dejar nada.
  assert.equal(db.datos.has("usuarios/u9"), false, "No debe quedar usuarios/u9");
  assert.equal(db.datos.size, 0, "No debe quedar ningún documento de ese uid");
  assert.equal(r.telegramChatRevocado, true, "El chatId se revoca antes de borrar la raíz");
  assert.deepEqual(borrados, ["u9"]);
});

test("BE-09: si Storage falla, la cuenta de Auth NO se borra", async () => {
  const db = crearFirestoreFalso({
    "usuarios/u10": { correo: "a@b.com" },
    "usuarios/u10/viajes/v1": {},
  });
  const borrados = [];

  await assert.rejects(
    () =>
      functions.bajaDefinitivaDeUsuario(db, "u10", {
        borrarArchivos: async () => {
          throw new Error("storage caido");
        },
        borrarAuth: async (uid) => borrados.push(uid),
      }),
    /storage caido/
  );

  // Regresión: antes el error de Storage se guardaba en `warning` y la baja
  // continuaba hasta deleteUser, dejando archivos huérfanos sin forma de
  // reintentar. Si no se borra Auth, el usuario puede volver a intentarlo.
  assert.deepEqual(borrados, [], "Auth debe sobrevivir para poder reintentar");
});

test("BE-09: una baja completa borra Firestore, Telegram, Storage y Auth", async () => {
  const db = crearFirestoreFalso({
    "usuarios/u11": { correo: "a@b.com", telegramChatId: "777" },
    "usuarios/u11/cuentas_cobro/c1": { total: 900 },
    "telegram_sesiones/777": { uid: "u11" },
    "telegram_vinculos/V1": { uid: "u11" },
  });
  const authBorrados = [];

  const r = await functions.bajaDefinitivaDeUsuario(db, "u11", {
    borrarArchivos: async () => 4,
    borrarAuth: async (uid) => authBorrados.push(uid),
  });

  assert.equal(db.datos.size, 0, "No debe quedar nada de este uid en Firestore");
  assert.deepEqual(authBorrados, ["u11"], "La cuenta de Auth sí se borra al final");
  assert.equal(r.archivosEliminados, 4);
  assert.equal(r.documentosEliminados, 1, "cuentas_cobro/c1 (el conteo es de subcolecciones)");
  assert.deepEqual(r.porColeccion, { cuentas_cobro: 1 });
  assert.equal(r.telegram.sesiones, 1);
  assert.equal(r.telegram.vinculos, 1);
});

test("BE-10: borrarSesionesTelegram elimina sesiones y vínculos del uid", async () => {
  const db = crearFirestoreFalso({
    "telegram_sesiones/chat1": { uid: "u6" },
    "telegram_sesiones/chat2": { uid: "u6" },
    "telegram_sesiones/chat3": { uid: "otroUsuario" },
    "telegram_vinculos/AAA111": { uid: "u6" },
    "telegram_vinculos/BBB222": { uid: "otroUsuario" },
  });

  const r = await functions.borrarSesionesTelegram(db, "u6");

  assert.equal(r.sesiones, 2, "Debe borrar las 2 sesiones del uid");
  assert.equal(r.vinculos, 1);
  assert.equal(db.datos.has("telegram_sesiones/chat1"), false);
  assert.equal(db.datos.has("telegram_sesiones/chat3"), true, "Sesión ajena intacta");
  assert.equal(db.datos.has("telegram_vinculos/BBB222"), true, "Vínculo ajeno intacto");
});

test("BE-10: las sesiones se borran en vueltas hasta agotar el filtro", async () => {
  // Una sola consulta sin limit puede truncarse en el backend y dejar sesiones
  // vivas. Con 1000 sesiones el código tiene que dar varias vueltas.
  const datos = {};
  for (let i = 0; i < 1000; i++) datos[`telegram_sesiones/chat${i}`] = { uid: "u12" };
  datos["telegram_sesiones/ajena"] = { uid: "otro" };
  const db = crearFirestoreFalso(datos);

  const r = await functions.borrarSesionesTelegram(db, "u12");

  assert.equal(r.sesiones, 1000, "Debe borrar las 1000 sesiones del uid");
  assert.equal(db.datos.has("telegram_sesiones/chat999"), false, "La última no puede quedarse atrás");
  assert.equal(db.datos.has("telegram_sesiones/ajena"), true, "Sesión ajena intacta");
});

test("BE-10: desvincularChat borra la sesión y revoca el telegramChatId", async () => {
  const db = crearFirestoreFalso({
    "telegram_sesiones/999": { uid: "u7", paso: "placa" },
    "usuarios/u7": { correo: "x@y.com", telegramChatId: "999" },
  });

  const uid = await functions.desvincularChat("999", db);

  assert.equal(uid, "u7");
  assert.equal(db.datos.has("telegram_sesiones/999"), false, "La sesión debe borrarse");
  assert.equal(
    db.datos.get("usuarios/u7").telegramChatId,
    undefined,
    "El telegramChatId debe quedar revocado (campo eliminado)"
  );
  // el resto del doc del usuario sobrevive: solo se desvincula, no se da de baja
  assert.equal(db.datos.get("usuarios/u7").correo, "x@y.com");
});

test("BE-10: desvincular un chat cuya cuenta ya se dio de baja no resucita el documento", async () => {
  // Sesión huérfana de una cuenta borrada: el merge lo recrearía como
  // usuarios/u9 vacío, y la app lo leería como un usuario existente.
  const db = crearFirestoreFalso({ "telegram_sesiones/888": { uid: "u9", paso: "placa" } });

  const uid = await functions.desvincularChat("888", db);

  assert.equal(uid, "u9", "El uid se conoce aunque el documento ya no exista");
  assert.equal(db.datos.has("usuarios/u9"), false, "No debe crear usuarios/u9");
  assert.equal(db.datos.size, 0, "Solo debe quedar el borrado de la sesión");
});

test("BE-10: desvincularChat en un chat sin sesión es un no-op seguro", async () => {
  const db = crearFirestoreFalso({ "usuarios/u8": { telegramChatId: "555" } });

  const uid = await functions.desvincularChat("555", db);

  assert.equal(uid, null, "No debe inventar un uid");
  // sin sesión no hay a quién revocar; el doc del usuario no se toca
  assert.equal(db.datos.get("usuarios/u8").telegramChatId, "555");
});

test("BE-10: desvincularChat limpia una sesión huérfana sin uid", async () => {
  const db = crearFirestoreFalso({
    "telegram_sesiones/777": { paso: "placa" }, // sin uid
  });

  const uid = await functions.desvincularChat("777", db);

  assert.equal(uid, null);
  assert.equal(db.datos.size, 0, "El doc huérfano también debe desaparecer");
});
