/**
 * Gancho de resolución de módulos para las pruebas de `purgarCacheFirestore`.
 *
 * Sustituye Firebase y la instancia `db` por dobles, de forma que la prueba
 * ejercite el código real del módulo sin abrir red ni credenciales. Corre en su
 * propio hilo, así que los dobles leen de `globalThis.__DOBLES_PURGA`, que sí
 * es mutable desde el hilo principal entre un test y otro.
 */

const DOBLES = {
  "firebase/firestore": `
    export const terminate = (db) => globalThis.__DOBLES_PURGA.terminate(db);
    export const clearIndexedDbPersistence = (db) => globalThis.__DOBLES_PURGA.clearIndexedDbPersistence(db);
  `,
  "../firebase": `
    export const db = globalThis.__DOBLES_PURGA.db;
  `,
};

function aDataUrl(codigo) {
  return "data:text/javascript;base64," + Buffer.from(codigo, "utf8").toString("base64");
}

export async function resolve(specifier, context, siguiente) {
  if (DOBLES[specifier]) {
    return { url: aDataUrl(DOBLES[specifier]), shortCircuit: true, format: "module" };
  }
  return siguiente(specifier, context);
}
