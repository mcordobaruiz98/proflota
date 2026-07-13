import { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, addDoc,
  updateDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export function useFirestore(uid) {

  const [vehiculos,      setVehiculos]      = useState([]);
  const [viajes,         setViajes]         = useState([]);
  const [empresas,       setEmpresas]       = useState([]);
  const [rutas,          setRutas]          = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [peajes,         setPeajes]         = useState([]);
  const [configMant,     setConfigMant]     = useState([]);
  const [gastosVehiculo, setGastosVehiculo] = useState([]);
  const [gastosFijos,    setGastosFijos]    = useState([]);

  const rutaVehiculos = uid ? `usuarios/${uid}/vehiculos`     : null;
  const rutaViajes    = uid ? `usuarios/${uid}/viajes`        : null;
  const rutaEmpresas  = uid ? `usuarios/${uid}/empresas`      : null;
  const rutaRutas     = uid ? `usuarios/${uid}/rutas`         : null;
  const rutaMant      = uid ? `usuarios/${uid}/mantenimiento` : null;
  const rutaConfigMant = uid ? `usuarios/${uid}/config_mant` : null;
  const rutaGastos     = uid ? `usuarios/${uid}/gastos_vehiculo` : null;
  const rutaGastosFijos = uid ? `usuarios/${uid}/gastos_fijos` : null;

  // ── RESET al cambiar de usuario (previene data leakage entre cuentas) ──
  // Va ANTES de los listeners para que el estado se limpie sincrónicamente
  // antes de que los nuevos snapshots empiecen a llenar datos del nuevo usuario.
  useEffect(() => {
    setVehiculos([]);
    setViajes([]);
    setEmpresas([]);
    setRutas([]);
    setMantenimientos([]);
    setConfigMant([]);
    setGastosVehiculo([]);
    setGastosFijos([]);
    setPeajes([]);
    setCargando(true);
  }, [uid]);

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

  useEffect(() => {
    if (!rutaMant) return;
    const q = query(collection(db, rutaMant), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMantenimientos(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [rutaMant]);

  useEffect(() => {
  const q = query(collection(db, "peajes"));
  const unsub = onSnapshot(q, (snap) => {
    setPeajes(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
  return () => unsub();
}, []);

useEffect(() => {
  if (!rutaConfigMant) return;
  const q = query(collection(db, rutaConfigMant));
  const unsub = onSnapshot(q, (snap) => {
    setConfigMant(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
  return () => unsub();
}, [rutaConfigMant]);

useEffect(() => {
  if (!rutaGastos) return;
  const q = query(collection(db, rutaGastos), orderBy("fecha", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    setGastosVehiculo(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
  return () => unsub();
}, [rutaGastos]);

useEffect(() => {
  if (!rutaGastosFijos) return;
  const q = query(collection(db, rutaGastosFijos));
  const unsub = onSnapshot(q, (snap) => {
    setGastosFijos(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
  return () => unsub();
}, [rutaGastosFijos]);

  const agregarVehiculo = async (datos) => {
    await addDoc(collection(db, rutaVehiculos), { ...datos, creadoEn: new Date().toISOString() });
  };
  const eliminarVehiculo = async (firestoreId) => {
    await deleteDoc(doc(db, rutaVehiculos, firestoreId));
  };
  const editarVehiculo = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await updateDoc(doc(db, rutaVehiculos, firestoreId), datosLimpios);
  };

  const agregarViaje = async (datos) => {
    await addDoc(collection(db, rutaViajes), { ...datos, creadoEn: new Date().toISOString() });
  };
  const eliminarViaje = async (firestoreId) => {
    await deleteDoc(doc(db, rutaViajes, firestoreId));
  };
  const editarViaje = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await updateDoc(doc(db, rutaViajes, firestoreId), datosLimpios);
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
    if (!uid) throw new Error("Sin uid");
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, `usuarios/${uid}/rutas`), {
      ...datosLimpios,
      creadoEn: new Date().toISOString(),
    });
    guardandoRuta = false;
  };
  const eliminarRuta = async (firestoreId) => {
    await deleteDoc(doc(db, rutaRutas, firestoreId));
  };

  const agregarMantenimiento = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaMant), {
      ...datosLimpios,
      creadoEn: new Date().toISOString(),
    });
  };
  const eliminarMantenimiento = async (firestoreId) => {
    await deleteDoc(doc(db, rutaMant, firestoreId));
  };

  const agregarConfigMant = async (datos) => {
  await addDoc(collection(db, rutaConfigMant), {
    ...datos,
    creadoEn: new Date().toISOString(),
  });
};

const eliminarConfigMant = async (firestoreId) => {
  await deleteDoc(doc(db, rutaConfigMant, firestoreId));
};

  const agregarGasto = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaGastos), { ...datosLimpios, creadoEn: new Date().toISOString() });
  };
  const eliminarGasto = async (firestoreId) => {
    await deleteDoc(doc(db, rutaGastos, firestoreId));
  };

  const agregarGastoFijo = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaGastosFijos), { ...datosLimpios, creadoEn: new Date().toISOString() });
  };
  const eliminarGastoFijo = async (firestoreId) => {
    await deleteDoc(doc(db, rutaGastosFijos, firestoreId));
  };

  return {
    vehiculos, viajes, empresas, rutas, mantenimientos, configMant, peajes, gastosVehiculo, gastosFijos, cargando,
    agregarVehiculo, eliminarVehiculo, editarVehiculo,
    agregarViaje,    eliminarViaje,    editarViaje,
    agregarEmpresa,  eliminarEmpresa,
    agregarRuta,     eliminarRuta,
    agregarMantenimiento, eliminarMantenimiento,
    agregarConfigMant, eliminarConfigMant,
    agregarGasto, eliminarGasto,
    agregarGastoFijo, eliminarGastoFijo,
  };
}