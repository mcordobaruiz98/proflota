import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

export function useSubirArchivo() {

  const [progreso, setProgreso] = useState({});
  const [subiendo, setSubiendo] = useState({});

  const subirArchivo = (archivo, ruta, clave, onExito) => {
    if (!archivo) return;

    // Valida tipo
    const tiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];
    if (!tiposPermitidos.includes(archivo.type)) {
      alert("Solo se permiten archivos PDF, JPG o PNG");
      return;
    }

    // Valida tamaño — máximo 10MB
    if (archivo.size > 10 * 1024 * 1024) {
      alert("El archivo no puede superar 10MB");
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
        alert("Error al subir el archivo. Intenta de nuevo.");
      },
      async () => {
        const url = await getDownloadURL(tarea.snapshot.ref);
        setSubiendo((prev) => ({ ...prev, [clave]: false }));
        setProgreso((prev) => ({ ...prev, [clave]: 100 }));
        onExito(url);
      }
    );
  };

  const eliminarArchivo = async (rutaOUrl, onExito) => {
    try {
      const archivoRef = ref(storage, rutaOUrl);
      await deleteObject(archivoRef);
      onExito();
    } catch (error) {
      console.error("Error eliminando archivo:", error);
      alert("Error al eliminar el archivo.");
    }
  };

  return { subirArchivo, eliminarArchivo, progreso, subiendo };
}