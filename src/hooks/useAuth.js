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
  const registrar = async (nombre, correo, contrasena) => {
    const resultado = await createUserWithEmailAndPassword(
      auth, correo, contrasena
    );
    await updateProfile(resultado.user, { displayName: nombre });
    return resultado.user;
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

  return { usuario, cargando, registrar, login, loginGoogle, cerrarSesion, recuperarContrasena };
}