/**
 * FE-17 — Hook para conocer el uid activo.
 *
 * Las claves de localStorage ahora están namespacadas por uid, así que los
 * componentes necesitan el uid para leer y escribir en su propio espacio.
 * Se expone como hook porque el uid llega de forma asíncrona (onAuthStateChanged)
 * y varios componentes lo necesitan ya montado.
 */

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export function useUid() {
  const [uid, setUid] = useState(() => auth.currentUser?.uid || null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid || null));
    return () => unsub();
  }, []);

  return uid;
}
