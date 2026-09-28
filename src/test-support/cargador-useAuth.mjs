/**
 * Gancho de resolución de módulos para las pruebas de `useAuth`.
 *
 * `useAuth.js` importa Firebase y las utilidades de localStorage en tiempo de
 * ejecución, así que para probarlo sin red ni credenciales hay que sustituir
 * esos especificadores. Node 24 permite hacerlo con `module.register()` y este
 * gancho, sin flags de línea de comandos (a diferencia de mock.module).
 *
 * El gancho corre en su propio hilo, así que no puede leer el estado del test.
 * Lo que sí corre en el hilo principal son los módulos sustituidos, y por eso
 * cada doble lee de `globalThis.__DOBLES` en lugar de capturar valores.
 */

const DOBLES = {
  // useAuth es un hook, así que sin dispatcher de React no se puede invocar
  // fuera de un componente. Solo nos interesan las funciones asíncronas que
  // devuelve, así que se sustituyen los hooks por valores inertes.
  react: `
    export const useState = (inicial) => [typeof inicial === "function" ? inicial() : inicial, () => {}];
    export const useEffect = () => {};
  `,
  "firebase/auth": `
    const d = globalThis.__DOBLES.auth;
    export const auth = d.auth;
    export const onAuthStateChanged = d.onAuthStateChanged;
    export const signOut = d.signOut;
    export const createUserWithEmailAndPassword = d.createUserWithEmailAndPassword;
    export const signInWithEmailAndPassword = d.signInWithEmailAndPassword;
    export const signInWithPopup = d.signInWithPopup;
    export const GoogleAuthProvider = d.GoogleAuthProvider;
    export const updateProfile = d.updateProfile;
    export const updatePassword = d.updatePassword;
    export const sendPasswordResetEmail = d.sendPasswordResetEmail;
    export const EmailAuthProvider = d.EmailAuthProvider;
    export const reauthenticateWithCredential = d.reauthenticateWithCredential;
    export const deleteUser = d.deleteUser;
  `,
  "firebase/firestore": `
    const d = globalThis.__DOBLES.firestore;
    export const doc = d.doc;
    export const setDoc = d.setDoc;
  `,
  "firebase/functions": `
    const d = globalThis.__DOBLES.functions;
    export const httpsCallable = d.httpsCallable;
  `,
  "../firebase": `
    const d = globalThis.__DOBLES.config;
    export const auth = d.auth;
    export const googleProvider = d.googleProvider;
    export const db = d.db;
    export const functions = d.functions;
  `,
  "../lib/purgarCache": `
    const d = globalThis.__DOBLES.purgarCache;
    export const purgarCacheFirestore = d.purgarCacheFirestore;
  `,
  "../lib/userStorage": `
    const d = globalThis.__DOBLES.userStorage;
    export const leer = d.leer;
    export const escribir = d.escribir;
    export const borrarEspacioUsuario = d.borrarEspacioUsuario;
  `,
};

const prefijo = { "../lib/purgarCache": "purgarCache", "../lib/userStorage": "userStorage" };

function aDataUrl(codigo) {
  return "data:text/javascript;base64," + Buffer.from(codigo, "utf8").toString("base64");
}

export async function resolve(specifier, context, siguiente) {
  if (DOBLES[specifier]) {
    return { url: aDataUrl(DOBLES[specifier]), shortCircuit: true, format: "module" };
  }
  const sufijo = prefijo[specifier];
  if (sufijo) {
    return { url: aDataUrl(DOBLES[specifier]), shortCircuit: true, format: "module" };
  }
  return siguiente(specifier, context);
}
