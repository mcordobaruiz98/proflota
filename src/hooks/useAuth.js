import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { auth, googleProvider, storage } from "../firebase";
import { getDoc, doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db } from  "../firebase";

export function useAuth() {
  const [usuario,   setUsuario]   = useState(null);
  const [cargando,  setCargando]  = useState(true);

  // Escucha cambios de sesión en tiempo real
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  // Versión actual de los términos — subirla cuando cambien los documentos
  const VERSION_TERMINOS = "1.0";

  // Guarda la evidencia de aceptación de términos (Ley 1581/2012: previa, expresa e informada)
  const guardarAceptacion = async (user) => {
    await setDoc(doc(db, "usuarios", user.uid), {
      aceptoTerminos: true,
      fechaAceptacion: new Date().toISOString(),
      versionTerminos: VERSION_TERMINOS,
      correo: user.email || "",
    }, { merge: true });
  };

  // Registro con correo y contraseña
  const registrar = async (nombre, correo, contrasena, codigo, aceptoTerminos) => {
  if (!aceptoTerminos) {
    throw { code: "auth/terminos-no-aceptados" };
  }
  const snap = await getDoc(doc(db, "codigos_beta", "principal"));
  if (!snap.exists() || snap.data().codigo !== codigo.toUpperCase().trim()) {
    throw { code: "auth/codigo-invalido" };
  }
  const cred = await createUserWithEmailAndPassword(auth, correo, contrasena);
  await updateProfile(cred.user, { displayName: nombre });
  await guardarAceptacion(cred.user);
  };

  // Login con correo y contraseña
  const login = async (correo, contrasena) => {
    const resultado = await signInWithEmailAndPassword(
      auth, correo, contrasena
    );
    return resultado.user;
  };

  // Login con Google
  const loginGoogle = async (codigoBeta, aceptoTerminos) => {
    const resultado = await signInWithPopup(auth, googleProvider);
    const esNuevo = resultado._tokenResponse?.isNewUser || false;
    if (esNuevo) {
      if (!aceptoTerminos) {
        await deleteUser(resultado.user);
        throw { code: "auth/terminos-no-aceptados" };
      }
      const snap = await getDoc(doc(db, "codigos_beta", "principal"));
      if (!snap.exists() || snap.data().codigo !== (codigoBeta || "").toUpperCase().trim()) {
        await deleteUser(resultado.user);
        throw { code: "auth/codigo-invalido" };
      }
      await updateProfile(resultado.user, { displayName: resultado.user.displayName });
      await guardarAceptacion(resultado.user);
    }
    return resultado.user;
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    await signOut(auth);
  };

  // Eliminar cuenta y todos los datos (derecho de supresión — Ley 1581/2012)
  const eliminarCuenta = async () => {
    const user = auth.currentUser;
    if (!user) throw { code: "auth/no-user" };
    const uid = user.uid;

    // 1. Borrar todas las subcolecciones del usuario en Firestore
    const colecciones = ["vehiculos","viajes","empresas","rutas","mantenimiento","config_mant","gastos_vehiculo","gastos_fijos","conductores"];
    for (const col of colecciones) {
      const snap = await getDocs(collection(db, "usuarios", uid, col));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }
    // 2. Borrar el documento raíz del usuario
    await deleteDoc(doc(db, "usuarios", uid)).catch(() => {});
    // 3. Borrar archivos de Storage del usuario (mejor esfuerzo)
    try {
      const carpeta = ref(storage, `usuarios/${uid}`);
      const listado = await listAll(carpeta);
      const borrarRecursivo = async (res) => {
        await Promise.all(res.items.map(item => deleteObject(item).catch(() => {})));
        for (const sub of res.prefixes) {
          const subRes = await listAll(sub);
          await borrarRecursivo(subRes);
        }
      };
      await borrarRecursivo(listado);
    } catch (e) { /* archivos legacy fuera de la carpeta del usuario quedan huérfanos */ }
    // 4. Borrar la cuenta de autenticación
    await deleteUser(user); // puede lanzar auth/requires-recent-login
  };

  // Recuperar contraseña
  const recuperarContrasena = async (correo) => {
    await sendPasswordResetEmail(auth, correo);
  };

  const cambiarNombre = async (nuevoNombre) => {
  await updateProfile(auth.currentUser, { displayName: nuevoNombre });
};

const cambiarContrasena = async (contrasenaActual, nuevaContrasena) => {
  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    contrasenaActual
  );
  await reauthenticateWithCredential(auth.currentUser, credential);
  await updatePassword(auth.currentUser, nuevaContrasena);
};

  return { usuario, cargando, registrar, login, loginGoogle, cerrarSesion, recuperarContrasena, cambiarNombre, cambiarContrasena, eliminarCuenta };
}