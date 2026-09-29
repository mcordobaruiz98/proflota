import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { auth, googleProvider, functions } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { purgarCacheFirestore } from "../lib/purgarCache";
import { borrarEspacioUsuario } from "../lib/userStorage";

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

  // Registro con correo y contraseña (BE-01 y CR-01: validación centralizada en servidor)
  const registrar = async (nombre, correo, contrasena, codigo, aceptoTerminos) => {
    if (!aceptoTerminos) {
      throw { code: "auth/terminos-no-aceptados" };
    }
    const cred = await createUserWithEmailAndPassword(auth, correo, contrasena);
    await updateProfile(cred.user, { displayName: nombre });
    try {
      const validarAlta = httpsCallable(functions, "validarAltaUsuario");
      await validarAlta({ codigoBeta: codigo, aceptoTerminos: true, nombre });
    } catch (errAlta) {
      await signOut(auth).catch(() => {});
      throw { code: "auth/codigo-invalido", message: errAlta.message || "Código beta inválido." };
    }
  };

  // Login con correo y contraseña
  const login = async (correo, contrasena) => {
    const resultado = await signInWithEmailAndPassword(
      auth, correo, contrasena
    );
    return resultado.user;
  };

  // Login con Google (BE-01 y CR-01: validación centralizada en servidor)
  const loginGoogle = async (codigoBeta, aceptoTerminos) => {
    const resultado = await signInWithPopup(auth, googleProvider);
    const esNuevo = resultado._tokenResponse?.isNewUser || false;
    if (esNuevo) {
      if (!aceptoTerminos) {
        await deleteUser(resultado.user).catch(() => {});
        throw { code: "auth/terminos-no-aceptados" };
      }
      try {
        const validarAlta = httpsCallable(functions, "validarAltaUsuario");
        await validarAlta({ codigoBeta, aceptoTerminos: true, nombre: resultado.user.displayName });
      } catch (errAlta) {
        await signOut(auth).catch(() => {});
        throw { code: "auth/codigo-invalido", message: errAlta.message || "Código beta inválido." };
      }
    }
    return resultado.user;
  };

  // Cerrar sesión
  // BE-16: además de cerrar sesión, se purga la caché de Firestore. Firestore
  // está configurado con persistencia, así que los documentos leídos quedan en
  // IndexedDB y el siguiente usuario de ese navegador podría leerlos.
  //
  // OJO: aquí NO se borra el espacio de localStorage del usuario. Sus metas y
  // preferencias son suyas; borrarlas en cada salida dejaría la app sin
  // memoria al volver a entrar, que es justo lo contrario de lo que.namespacear
  // por uid pretende. Ese espacio solo se borra al dar de baja la cuenta
  // (eliminarCuenta) o cuando el usuario lo pide explícitamente desde
  // Configuración.
  const cerrarSesion = async () => {
    await signOut(auth);
    await purgarCacheFirestore();
  };

  // Eliminar cuenta y todos los datos (derecho de supresión — Ley 1581/2012)
  //
  // BE-09: la baja la hace el servidor con Admin SDK. La versión anterior
  // borraba desde el cliente una lista fija de colecciones, y esa lista ya
  // estaba desactualizada (no incluía cuentas_cobro), además de no poder
  // tocar telegram_sesiones ni discoverir colecciones nuevas.
  const eliminarCuenta = async () => {
    const user = auth.currentUser;
    if (!user) throw { code: "auth/no-user" };
    const uid = user.uid;

    const baja = httpsCallable(functions, "bajaDefinitiva");
    const { data } = await baja({});

    // FE-17: quitar lo que quedó en el navegador de esta cuenta.
    borrarEspacioUsuario(uid);
    // FE-16: la caché de Firestore puede contener documentos ya borrados en
    // el servidor, así que se purga igual.
    await purgarCacheFirestore();

    console.log(
      `[eliminarCuenta] Baja de ${uid}: ${data?.documentosEliminados ?? 0} documentos, ` +
      `${data?.archivosEliminados ?? 0} archivos`
    );
    return data;
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