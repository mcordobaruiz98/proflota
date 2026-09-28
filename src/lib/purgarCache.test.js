/**
 * FE-16 — La caché local de Firestore se purga al cerrar sesión.
 *
 * El riesgo que esto cubre no es el rendimiento: es que los documentos del
 * usuario anterior sigan legibles en el mismo navegador. En una estación de
 * servicio compartida, el siguiente que abra la app los lee sin esfuerzo.
 *
 * Se prueban los tres caminos: el normal, el respaldo cuando otra pestaña
 * bloquea la base, y el fallo total (que nunca debe romper el cierre de
 * sesión, porque perder la sesión es peor que dejar la caché en disco).
 */

import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("../test-support/cargador-purgarCache.mjs", import.meta.url);

const DB = { id: "db-de-prueba" };
const orden = [];

function reiniciar({ clear = "ok", indexedDB = null } = {}) {
  orden.length = 0;
  globalThis.__DOBLES_PURGA = {
    db: DB,
    terminate: async (db) => {
      orden.push(`terminate:${db === DB}`);
    },
    clearIndexedDbPersistence: async (db) => {
      orden.push(`clear:${db === DB}`);
      if (clear === "lanza") throw new Error("blocked por otra pestaña");
      if (clear === "cuelga") return new Promise(() => {});
    },
  };
  if (indexedDB) globalThis.indexedDB = indexedDB;
  else delete globalThis.indexedDB;
}

/** Petición de deleteDatabase falsa que dispara el evento indicado. */
function indexedDBFalso(evento, nombreEsperado) {
  return {
    deleteDatabase(nombre) {
      orden.push(`deleteDatabase:${nombre}`);
      assert.equal(nombre, nombreEsperado, "Debe borrar la base de Firebase");
      const peticion = {};
      setTimeout(() => peticion[evento]?.(), 0);
      return peticion;
    },
  };
}

// Los dobles existen antes del import: el módulo sustituido lee este global al
// cargarse, no al invocarse.
reiniciar();

const { purgarCacheFirestore } = await import("./purgarCache.js");

test("FE-16: termina Firestore y luego borra la caché", async () => {
  reiniciar();
  const ok = await purgarCacheFirestore();

  assert.equal(ok, true);
  assert.deepEqual(orden, ["terminate:true", "clear:true"], "El orden importa: la base está bloqueada mientras haya pestañas");
});

test("FE-16: si la base está bloqueada, borra la base a pelo como respaldo", async () => {
  reiniciar({ clear: "lanza", indexedDB: indexedDBFalso("onsuccess", "firebaseLocalStorageDb") });
  const ok = await purgarCacheFirestore();

  assert.equal(ok, true, "El respaldo debe dejar la caché fuera de disco");
  assert.deepEqual(orden, ["terminate:true", "clear:true", "deleteDatabase:firebaseLocalStorageDb"]);
});

test("FE-16: si el respaldo también falla, avisa pero no rompe el cierre de sesión", async () => {
  reiniciar({ clear: "lanza", indexedDB: indexedDBFalso("onblocked", "firebaseLocalStorageDb") });

  const ok = await purgarCacheFirestore();

  assert.equal(ok, false, "Debe reportar que la caché sigue ahí");
});

test("FE-16: sin IndexedDB disponible tampoco se lanza", async () => {
  reiniciar({ clear: "lanza" });

  const ok = await purgarCacheFirestore();

  assert.equal(ok, false);
});

test("FE-16: si la purga se queda colgada, el cierre de sesión no se cuelga con ella", async () => {
  // Otra pestaña con la base abierta deja el promise sin resolverse nunca. Si
  // logout la esperara sin tope, el usuario vería la app congelada.
  reiniciar({ clear: "cuelga", indexedDB: indexedDBFalso("onsuccess", "firebaseLocalStorageDb") });

  const ok = await purgarCacheFirestore({ esperaMaximaMs: 30 });

  assert.equal(ok, true, "Al cumplirse el tope debe pasar al borrado directo");
  assert.deepEqual(orden, [
    "terminate:true",
    "clear:true",
    "deleteDatabase:firebaseLocalStorageDb",
  ]);
});
