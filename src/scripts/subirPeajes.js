import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * BE-07 / CR-06 / FE-07: Ingesta delegada a Cloud Function
 * El cliente no escribe directamente en Firestore (colección peajes protegida con allow write: if false;).
 */
export async function subirPeajes() {
  try {
    const ingestar = httpsCallable(functions, "ingestarPeajes");
    const res = await ingestar();
    console.log("[subirPeajes] Sincronización exitosa desde Cloud Function:", res.data);
    return true;
  } catch(err) {
    console.error("Error al invocar ingesta de peajes en Cloud Function:", err);
    return false;
  }
}
