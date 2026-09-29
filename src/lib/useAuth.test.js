/**
 * FE-16 / FE-17 — El cierre de sesión normal NO debe borrar las metas ni las
 * preferencias del usuario.
 *
 * Regresión: `cerrarSesion` llamaba a borrarEspacioUsuario(uid), así que cada
 * vez que el usuario salía y volvía a entrar perdía sus metas y ajustes. Eso
 * contradecía el objetivo de namespacear por uid, que es precisamente que cada
 * cuenta conserve lo suyo.
 *
 * Se prueba sobre el código real de useAuth sustituyendo sus imports por dobles
 * (ver test-support/cargador-useAuth.mjs), de modo que no hace red ni necesita
 * credenciales.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

const UID = "usuario-de-prueba";
const llamadas = { purgas: 0, borrados: [] };

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
  };
}

globalThis.window = { localStorage: localStorageFalso() };

// Se registra el gancho antes de importar nada que lo atraviese.
register("../test-support/cargador-useAuth.mjs", import.meta.url);

const asincrono = () => {};
const firebaseAuth = {
  auth: { currentUser: { uid: UID, email: "a@b.com" } },
  onAuthStateChanged: () => asincrono,
  signOut: asincrono,
  createUserWithEmailAndPassword: asincrono,
  signInWithEmailAndPassword: asincrono,
  signInWithPopup: asincrono,
  updateProfile: asincrono,
  updatePassword: asincrono,
  sendPasswordResetEmail: asincrono,
  reauthenticateWithCredential: asincrono,
  deleteUser: asincrono,
  GoogleAuthProvider: function GoogleAuthProvider() {},
  EmailAuthProvider: { credential: () => ({}) },
};

const userStorageReal = await import("./userStorage.js");

globalThis.__DOBLES = {
  auth: firebaseAuth,
  firestore: { doc: () => ({}), setDoc: asincrono },
  functions: {
    httpsCallable: () => async () => ({ data: { documentosEliminados: 3, archivosEliminados: 1 } }),
  },
  config: { auth: firebaseAuth.auth, googleProvider: {}, db: {}, functions: {} },
  purgarCache: { purgarCacheFirestore: async () => { llamadas.purgas += 1; } },
  userStorage: {
    ...userStorageReal,
    borrarEspacioUsuario: (uid) => {
      const n = userStorageReal.borrarEspacioUsuario(uid);
      llamadas.borrados.push(uid);
      return n;
    },
  },
};

const { useAuth } = await import("../hooks/useAuth.js");

test("FE-17: cerrar sesión conserva las metas y preferencias del usuario", async () => {
  userStorageReal.escribir(UID, "meta_diaria", 42000);
  userStorageReal.escribir(UID, "cfg_sonido", false);

  await useAuth().cerrarSesion();

  assert.deepEqual(llamadas.borrados, [], "No debe purgar el espacio del usuario al salir");
  assert.equal(
    userStorageReal.leer(UID, "meta_diaria", 0),
    42000,
    "La meta debe sobrevivir al cierre de sesión"
  );
  assert.equal(userStorageReal.leer(UID, "cfg_sonido", true), false, "Los ajustes deben sobrevivir");
});

test("FE-16: cerrar sesión sí purga la caché de Firestore", async () => {
  const antes = llamadas.purgas;
  await useAuth().cerrarSesion();
  assert.equal(llamadas.purgas, antes + 1, "Debe purgar la caché IndexedDB al salir");
});

test("FE-17/FE-16: la baja de cuenta sí borra el espacio local del usuario", async () => {
  userStorageReal.escribir(UID, "meta_diaria", 42000);
  const purgasAntes = llamadas.purgas;

  const data = await useAuth().eliminarCuenta();

  assert.deepEqual(llamadas.borrados, [UID], "La baja debe borrar el espacio del uid");
  assert.equal(llamadas.purgas, purgasAntes + 1, "La baja también purga la caché");
  assert.equal(data.documentosEliminados, 3);
  assert.equal(
    userStorageReal.leer(UID, "meta_diaria", 0),
    0,
    "Tras la baja no debe quedar meta de ese uid"
  );
});
