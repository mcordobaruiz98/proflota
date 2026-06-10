import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { db } from  "../firebase";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

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

  // Registro con correo y contraseña
  const registrar = async (nombre, correo, contrasena, codigo) => {
  const snap = await getDoc(doc(db, "codigos_beta", "principal"));
  if (!snap.exists() || snap.data().codigo !== codigo.toUpperCase().trim()) {
    throw { code: "auth/codigo-invalido" };
  }
  const cred = await createUserWithEmailAndPassword(auth, correo, contrasena);
  await updateProfile(cred.user, { displayName: nombre });
  };

  // Login con correo y contraseña
  const login = async (correo, contrasena) => {
    const resultado = await signInWithEmailAndPassword(
      auth, correo, contrasena
    );
    return resultado.user;
  };

  // Login con Google
  const loginGoogle = async () => {
    const resultado = await signInWithPopup(auth, googleProvider);
    return resultado.user;
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    await signOut(auth);
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

  return { usuario, cargando, registrar, login, loginGoogle, cerrarSesion, recuperarContrasena, cambiarNombre, cambiarContrasena };
}