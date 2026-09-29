import test from "node:test";
import assert from "node:assert/strict";

// userStorage.js usa window.localStorage; le damos un doble en memoria.
function localStorageFalso() {
  const mapa = new Map();
  return {
    get length() {
      return mapa.size;
    },
    key: (i) => [...mapa.keys()][i] ?? null,
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
    get mapa() {
      return mapa;
    },
  };
}

const { leer, escribir, borrarEspacioUsuario, clavesLegacyHuerfanas, limpiarLegacyHuerfanas, CLAVES_CONOCIDAS } =
  await import("./userStorage.js");

function conLocalStorage(fn) {
  const original = globalThis.window;
  const fake = localStorageFalso();
  globalThis.window = { localStorage: fake };
  try {
    return fn(fake);
  } finally {
    globalThis.window = original;
  }
}

// ── Aislamiento entre cuentas (el bug que arregla FE-17) ────

test("FE-17: las claves de un usuario no se mezclan con las de otro", () => {
  conLocalStorage(() => {
    escribir("u1", "meta_diaria", 50000);
    escribir("u2", "meta_diaria", 999);

    assert.equal(leer("u1", "meta_diaria"), 50000, "u1 debe conservar su meta");
    assert.equal(leer("u2", "meta_diaria"), 999, "u2 debe ver la suya, no la de u1");
  });
});

test("FE-17: las preferencias de un usuario no pisan las de otro", () => {
  conLocalStorage(() => {
    escribir("u1", "cfg_notif", false);
    escribir("u2", "cfg_notif", true);

    assert.equal(leer("u1", "cfg_notif"), false);
    assert.equal(leer("u2", "cfg_notif"), true);
  });
});

test("FE-17: un usuario nuevo arranca con los valores por defecto", () => {
  conLocalStorage(() => {
    escribir("u1", "meta_diaria", 123);
    assert.equal(leer("u99", "meta_diaria", 0), 0, "No debe heredar la meta ajena");
  });
});

// ── Migración de las claves antiguas ─────────────────────────

test("FE-17: migra una clave legacy al namespace del usuario y la borra", () => {
  conLocalStorage((ls) => {
    ls.setItem("meta_diaria", "7777");

    const valor = leer("u1", "meta_diaria", 0);

    assert.equal(valor, 7777, "Debe devolver el valor legacy");
    assert.equal(ls.getItem("meta_diaria"), null, "La clave legacy debe desaparecer");
    assert.equal(ls.getItem("navira_u1_meta_diaria"), "7777", "Queda en el namespace");
  });
});

test("FE-17: la migración no se repite en lecturas posteriores", () => {
  conLocalStorage((ls) => {
    ls.setItem("cfg_sonido", "false");
    assert.equal(leer("u1", "cfg_sonido", true), false);

    escribir("u1", "cfg_sonido", true);
    assert.equal(leer("u1", "cfg_sonido", true), true, "Gana el valor ya namespacado");
  });
});

test("FE-17: migrar la clave legacy a una cuenta no borra el original de otra", () => {
  conLocalStorage((ls) => {
    ls.setItem("meta_diaria", "5000");
    leer("u1", "meta_diaria", 0);

    // u2 todavía no ha entrado: la legacy ya no existe, así que no puede robarla
    assert.equal(leer("u2", "meta_diaria", 0), 0);
  });
});

// ── Purga (BE-09 deja el navegador limpio) ───────────────────

test("FE-17: borrarEspacioUsuario quita solo lo de ese uid", () => {
  conLocalStorage((ls) => {
    escribir("u1", "meta_diaria", 1);
    escribir("u1", "cfg_notif", false);
    escribir("u2", "meta_diaria", 2);

    const borrados = borrarEspacioUsuario("u1");

    assert.equal(borrados, 2);
    assert.equal(ls.getItem("navira_u1_meta_diaria"), null);
    assert.equal(ls.getItem("navira_u1_cfg_notif"), null);
    assert.equal(ls.getItem("navira_u2_meta_diaria"), "2", "u2 intacto");
  });
});

test("FE-17: borrarEspacioUsuario no toca claves ajenas al namespace", () => {
  conLocalStorage((ls) => {
    escribir("u1", "meta_diaria", 1);
    ls.setItem("otra_app", "no_tocar");
    ls.setItem("navira_", "suelto");

    borrarEspacioUsuario("u1");

    assert.equal(ls.getItem("otra_app"), "no_tocar", "Datos de otra app intactos");
    assert.equal(ls.getItem("navira_"), "suelto", "Prefijo sin uid no se toca");
  });
});

test("FE-17: borrar un uid inexistente no borra nada ni falla", () => {
  conLocalStorage((ls) => {
    escribir("u1", "meta_diaria", 1);
    assert.equal(borrarEspacioUsuario("no_existe"), 0);
    assert.equal(ls.getItem("navira_u1_meta_diaria"), "1");
  });
});

// ── Huérfanas de cuentas ya borradas ─────────────────────────

test("FE-17: detecta claves legacy huérfanas y las limpia a pedido", () => {
  conLocalStorage((ls) => {
    assert.deepEqual(clavesLegacyHuerfanas(), [], "Sin basura no hay nada que reportar");

    ls.setItem("meta_diaria", "1");
    ls.setItem("cfg_notif", "false");

    const huerfanas = clavesLegacyHuerfanas();
    assert.deepEqual(huerfanas.sort(), ["cfg_notif", "meta_diaria"]);

    assert.equal(limpiarLegacyHuerfanas(), 2);
    assert.deepEqual(clavesLegacyHuerfanas(), []);
  });
});

test("FE-17: sin uid no lee ni escribe nada", () => {
  conLocalStorage((ls) => {
    escribir(null, "meta_diaria", 1);
    assert.equal(leer(null, "meta_diaria", "defecto"), "defecto");
    assert.equal(ls.length, 0, "No debe crear claves sin uid");
  });
});

test("FE-17: CLAVES_CONOCIDAS cubre las claves que usa la app", () => {
  for (const clave of ["cfg_notif", "cfg_sonido", "meta_diaria", "meta_semanal", "meta_mensual_global"]) {
    assert.ok(CLAVES_CONOCIDAS.includes(clave), `Falta ${clave} en CLAVES_CONOCIDAS`);
  }
});
