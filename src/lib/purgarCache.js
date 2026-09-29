/**
 * FE-16 — Purga de la caché local de Firestore al cerrar sesión y en la baja.
 *
 * `db` se crea en firebase.js con persistentLocalCache(), así que los
 * documentos que el usuario leyó siguen en IndexedDB después de signOut().
 * El siguiente usuario que abra la app en ese navegador puede leerlos, y en
 * una estación compartida eso es una fuga entre cuentas.
 *
 * El orden importa: hay que terminar la instancia de Firestore ANTES de
 * borrar la base, porque la base está bloqueada mientras haya pestañas
 * abiertas. clearIndexedDbPersistence() se encarga del borrado y deja la
 * instancia lista para rehidratarse sola en el próximo uso.
 */

import { terminate, clearIndexedDbPersistence } from "firebase/firestore";
import { db } from "../firebase";

const NOMBRE_BD = "firebaseLocalStorageDb";

/**
 * Último recurso: borrar la base a pelo con la API de IndexedDB.
 *
 * clearIndexedDbPersistence() se queda esperando si otra pestaña tiene la base
 * abierta y su promise nunca resuelve, o falla con `blocked`. En un navegador
 * compartido eso significa que los datos del usuario anterior siguen en disco,
 * así que no nos	fiamos solo de la API de Firestore.
 */
function borrarBaseALFuerza() {
  const idb = globalThis.indexedDB;
  if (!idb || typeof idb.deleteDatabase !== "function") return Promise.resolve(false);

  return new Promise((resolve) => {
    let resuelto = false;
    const cerrar = (valor) => {
      if (resuelto) return;
      resuelto = true;
      resolve(valor);
    };
    try {
      const peticion = idb.deleteDatabase(NOMBRE_BD);
      peticion.onsuccess = () => cerrar(true);
      peticion.onerror = () => cerrar(false);
      // Bloqueada por otra pestaña: no insistimos, para no colgar el logout.
      peticion.onblocked = () => cerrar(false);
    } catch {
      cerrar(false);
    }
  });
}

/**
 * clearIndexedDbPersistence() se queda esperando indefinidamente si otra
 * pestaña tiene la base abierta. Como el cierre de sesión la espera, sin este
 * tope el usuario se quedaría con la app colgada: peor que la caché sobreviva.
 */
const ESPERA_MAXIMA_MS = 3000;

function conTope(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rechazar) =>
      setTimeout(() => rechazar(new Error(`tardó más de ${ms} ms`)), ms).unref?.()
    ),
  ]);
}

/** No dejamos que un fallo de purga tumbe el cierre de sesión. */
export async function purgarCacheFirestore({ esperaMaximaMs = ESPERA_MAXIMA_MS } = {}) {
  try {
    await conTope(terminate(db), esperaMaximaMs);
  } catch (e) {
    console.warn("[purgarCacheFirestore] No se pudo terminar Firestore:", e.message);
  }

  try {
    await conTope(clearIndexedDbPersistence(db), esperaMaximaMs);
    return true;
  } catch (e) {
    console.warn(
      "[purgarCacheFirestore] clearIndexedDbPersistence no terminó, intentando borrado directo:",
      e.message
    );
  }

  const forzado = await borrarBaseALFuerza();
  if (!forzado) {
    console.warn(
      "[purgarCacheFirestore] La caché local sigue en disco: revisa si otra pestaña tiene la app abierta."
    );
  }
  return forzado;
}
