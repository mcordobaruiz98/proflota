import { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, addDoc,
   updateDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export function useFirestore(uid) {
  console.log("useFirestore uid:", uid);

  const [vehiculos, setVehiculos] = useState([]);
  const [viajes,    setViajes]    = useState([]);
  const [empresas,  setEmpresas]  = useState([]);
  const [rutas,     setRutas]     = useState([]);
  const [cargando,  setCargando]  = useState(true);

  const rutaVehiculos = uid ? `usuarios/${uid}/vehiculos` : null;
  const rutaViajes    = uid ? `usuarios/${uid}/viajes`    : null;
  const rutaEmpresas  = uid ? `usuarios/${uid}/empresas`  : null;
  const rutaRutas     = uid ? `usuarios/${uid}/rutas`     : null;

  useEffect(() => {
    if (!rutaVehiculos) return;
    const q = query(collection(db, rutaVehiculos));
    const unsub = onSnapshot(q, (snap) => {
      setVehiculos(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      setCargando(false);
    });
    return () => unsub();
  }, [rutaVehiculos]);

  useEffect(() => {
    if (!rutaViajes) return;
    const q = query(collection(db, rutaViajes), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setViajes(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [rutaViajes]);

  useEffect(() => {
    if (!rutaEmpresas) return;
    const q = query(collection(db, rutaEmpresas));
    const unsub = onSnapshot(q, (snap) => {
      setEmpresas(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [rutaEmpresas]);

  useEffect(() => {
    if (!rutaRutas) return;
    const q = query(collection(db, rutaRutas));
    const unsub = onSnapshot(q, (snap) => {
      setRutas(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [rutaRutas]);

  const agregarVehiculo = async (datos) => {
    await addDoc(collection(db, rutaVehiculos), { ...datos, creadoEn: new Date().toISOString() });
  };
  const eliminarVehiculo = async (firestoreId) => {
    await deleteDoc(doc(db, rutaVehiculos, firestoreId));
  };

  const agregarViaje = async (datos) => {
    await addDoc(collection(db, rutaViajes), { ...datos, creadoEn: new Date().toISOString() });
  };
  const eliminarViaje = async (firestoreId) => {
    await deleteDoc(doc(db, rutaViajes, firestoreId));
  };

  const agregarEmpresa = async (datos) => {
    await addDoc(collection(db, rutaEmpresas), { ...datos, creadoEn: new Date().toISOString() });
  };
  const eliminarEmpresa = async (firestoreId) => {
    await deleteDoc(doc(db, rutaEmpresas, firestoreId));
  };

let guardandoRuta = false;

const agregarRuta = async (datos) => {
  if (guardandoRuta) return;
  guardandoRuta = true;
  console.log("agregarRuta llamado, rutaRutas:", rutaRutas);
  if (!uid) throw new Error("Sin uid");
  const path = `usuarios/${uid}/rutas`;
  const datosLimpios = JSON.parse(JSON.stringify(datos));
  const ref = collection(db, path);
  await addDoc(ref, {
    ...datosLimpios,
    creadoEn: new Date().toISOString(),
  });
  guardandoRuta = false;
};

  const eliminarRuta = async (firestoreId) => {
    await deleteDoc(doc(db, rutaRutas, firestoreId));
  };

  const editarViaje = async (firestoreId, datos) => {
  const datosLimpios = JSON.parse(JSON.stringify(datos));
  await updateDoc(doc(db, rutaViajes, firestoreId), datosLimpios);
};

  return {
    vehiculos, viajes, empresas, rutas, cargando,
    agregarVehiculo, eliminarVehiculo,
    agregarViaje,    eliminarViaje, editarViaje,
    agregarEmpresa,  eliminarEmpresa,
    agregarRuta,     eliminarRuta,
  };
}