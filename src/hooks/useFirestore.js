import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export function useFirestore(uid) {
  console.log("useFirestore uid:", uid);

  const [vehiculos, setVehiculos] = useState([]);
  const [viajes,    setViajes]    = useState([]);
  const [empresas,  setEmpresas]  = useState([]);
  const [cargando,  setCargando]  = useState(true);

  // Rutas base en Firestore
  const rutaVehiculos = uid ? `usuarios/${uid}/vehiculos` : null;
  const rutaViajes    = uid ? `usuarios/${uid}/viajes`    : null;
  const rutaEmpresas  = uid ? `usuarios/${uid}/empresas`  : null;

  // Escucha vehículos en tiempo real
  useEffect(() => {
    if (!rutaVehiculos) return;
    const q = query(collection(db, rutaVehiculos));
    const unsub = onSnapshot(q, (snap) => {
      setVehiculos(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      setCargando(false);
    });
    return () => unsub();
  }, [rutaVehiculos]);

  // Escucha viajes en tiempo real
  useEffect(() => {
    if (!rutaViajes) return;
    const q = query(collection(db, rutaViajes), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setViajes(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [rutaViajes]);

  // Escucha empresas en tiempo real
  useEffect(() => {
    if (!rutaEmpresas) return;
    const q = query(collection(db, rutaEmpresas));
    const unsub = onSnapshot(q, (snap) => {
      setEmpresas(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [rutaEmpresas]);

  // ── VEHÍCULOS ──
  const agregarVehiculo = async (datos) => {
    await addDoc(collection(db, rutaVehiculos), {
      ...datos,
      creadoEn: new Date().toISOString(),
    });
  };

  const eliminarVehiculo = async (firestoreId) => {
    await deleteDoc(doc(db, rutaVehiculos, firestoreId));
  };

  // ── VIAJES ──
  const agregarViaje = async (datos) => {
    await addDoc(collection(db, rutaViajes), {
      ...datos,
      creadoEn: new Date().toISOString(),
    });
  };

  const eliminarViaje = async (firestoreId) => {
    console.log("Eliminando viaje con ID:", firestoreId);
    console.log("Ruta", rutaViajes);
    await deleteDoc(doc(db, rutaViajes, firestoreId));
  };

  // ── EMPRESAS ──
  const agregarEmpresa = async (datos) => {
    await addDoc(collection(db, rutaEmpresas), {
      ...datos,
      creadoEn: new Date().toISOString(),
    });
  };

  const eliminarEmpresa = async (firestoreId) => {
    await deleteDoc(doc(db, rutaEmpresas, firestoreId));
  };

  return {
    vehiculos, viajes, empresas, cargando,
    agregarVehiculo, eliminarVehiculo,
    agregarViaje,    eliminarViaje,
    agregarEmpresa,  eliminarEmpresa,
    agregarRuta,     eliminarRuta
  };

  const rutaRutas = uid ? `usuarios/${uid}/rutas` : null;
const [rutas, setRutas] = useState([]);

useEffect(() => {
  if (!rutaRutas) return;
  const q = query(collection(db, rutaRutas));
  const unsub = onSnapshot(q, (snap) => {
    setRutas(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
  return () => unsub();
}, [rutaRutas]);

const agregarRuta = async (datos) => {
  await addDoc(collection(db, rutaRutas), {
    ...datos,
    creadoEn: new Date().toISOString(),
  });
};

const eliminarRuta = async (firestoreId) => {
  await deleteDoc(doc(db, rutaRutas, firestoreId));
};

}