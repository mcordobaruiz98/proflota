/**
 * Hecho por JESUS COSSIO DEV
 * Hook para subida y eliminación de archivos en Firebase Storage
 * Con validaciones seguras, soporte de callback de error / toast accesible (FE-13).
 */
import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

export function sanearNombreArchivo(nombre = "") {
  return String(nombre)
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 100);
}

export function useSubirArchivo(mostrarToast) {
  const [progreso, setProgreso] = useState({});
  const [subiendo, setSubiendo] = useState({});

  const notificarError = (msg, onError) => {
    if (onError) onError(msg);
    else if (mostrarToast) mostrarToast(msg, "error");
    else console.warn("[useSubirArchivo]", msg);
  };

  const subirArchivo = (archivo, ruta, clave, onExito, onError) => {
    if (!archivo) return;

// Valida tipo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!tiposPermitidos.includes(archivo.type)) {
      notificarError("Solo se permiten archivos PDF, JPG, PNG o WEBP", onError);
      return;
    }

    // FE-06 / BE-08: Valida tamaño — máximo 10MB
    if (archivo.size > 10 * 1024 * 1024) {
      notificarError("El archivo no puede superar 10MB", onError);
      return;
    }

    const storageRef = ref(storage, ruta);
    const tarea = uploadBytesResumable(storageRef, archivo);

    setSubiendo((prev) => ({ ...prev, [clave]: true }));

    tarea.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgreso((prev) => ({ ...prev, [clave]: pct }));
      },
      (error) => {
        console.error("Error subiendo archivo:", error);
        setSubiendo((prev) => ({ ...prev, [clave]: false }));
        notificarError("Error al subir el archivo. Intenta de nuevo.", onError);
      },
      async () => {
        try {
          const url = await getDownloadURL(tarea.snapshot.ref);
          setSubiendo((prev) => ({ ...prev, [clave]: false }));
          setProgreso((prev) => ({ ...prev, [clave]: 100 }));
          if (onExito) onExito(url);
        } catch (err) {
          console.error("Error obteniendo URL:", err);
          setSubiendo((prev) => ({ ...prev, [clave]: false }));
          notificarError("Error al procesar el archivo subido.", onError);
        }
      }
    );
  };

  const eliminarArchivo = async (rutaOUrl, onExito, onError) => {
    try {
      const archivoRef = ref(storage, rutaOUrl);
      await deleteObject(archivoRef);
      if (onExito) onExito();
    } catch (error) {
      console.error("Error eliminando archivo:", error);
      notificarError("Error al eliminar el archivo.", onError);
    }
  };

  return { subirArchivo, eliminarArchivo, progreso, subiendo };
}