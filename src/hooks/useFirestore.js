import { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, addDoc,
  updateDoc, deleteDoc, query, orderBy,
  runTransaction, writeBatch, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export function useFirestore(uid) {

  const [vehiculos,      setVehiculos]      = useState([]);
  const [viajes,         setViajes]         = useState([]);
  const [empresas,       setEmpresas]       = useState([]);
  const [rutas,          setRutas]          = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [conductores,    setConductores]    = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [peajes,         setPeajes]         = useState([]);
  const [configMant,     setConfigMant]     = useState([]);
  const [gastosVehiculo, setGastosVehiculo] = useState([]);
  const [gastosFijos,    setGastosFijos]    = useState([]);
  const [cuentasCobro, setCuentasCobro]     = useState([]);

  const rutaVehiculos    = uid ? `usuarios/${uid}/vehiculos`       : null;
  const rutaViajes       = uid ? `usuarios/${uid}/viajes`          : null;
  const rutaEmpresas     = uid ? `usuarios/${uid}/empresas`        : null;
  const rutaRutas        = uid ? `usuarios/${uid}/rutas`           : null;
  const rutaMant         = uid ? `usuarios/${uid}/mantenimiento`   : null;
  const rutaConfigMant   = uid ? `usuarios/${uid}/config_mant`     : null;
  const rutaGastos       = uid ? `usuarios/${uid}/gastos_vehiculo` : null;
  const rutaGastosFijos  = uid ? `usuarios/${uid}/gastos_fijos`    : null;
  const rutaConductores  = uid ? `usuarios/${uid}/conductores`     : null;
  const rutaCuentas      = uid ? `usuarios/${uid}/cuentas_cobro`   : null;

  // ── RESET al cambiar de usuario (previene data leakage entre cuentas) ──
  useEffect(() => {
    setVehiculos([]);
    setViajes([]);
    setEmpresas([]);
    setRutas([]);
    setMantenimientos([]);
    setConductores([]);
    setConfigMant([]);
    setGastosVehiculo([]);
    setGastosFijos([]);
    setPeajes([]);
    setCargando(true);
    setCuentasCobro([]);
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

  // Peajes — colección global, pero solo se lee con usuario autenticado
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "peajes"));
    const unsub = onSnapshot(q, (snap) => {
      setPeajes(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [uid]);

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

  // Conductores
  useEffect(() => {
    if (!rutaConductores) return;
    const q = query(collection(db, rutaConductores));
    const unsub = onSnapshot(q, (snap) => {
      setConductores(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [rutaConductores]);

  // Cuenta de cobro
  useEffect(() => {
  if (!rutaCuentas) return;
  const q = query(collection(db, rutaCuentas), orderBy("fecha", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    setCuentasCobro(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
  return () => unsub();
}, [rutaCuentas]);

  // ── CRUD ──

  const agregarVehiculo = async (datos) => {
    const placaNorm = (datos.placa || "").trim().toUpperCase().replace(/[\s\-]/g, "");
    await addDoc(collection(db, rutaVehiculos), { ...datos, placaNorm, creadoEn: new Date().toISOString() });
  };
  const eliminarVehiculo = async (firestoreId) => {
    await deleteDoc(doc(db, rutaVehiculos, firestoreId));
  };
  const editarVehiculo = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    if (datos.placa) {
      datosLimpios.placaNorm = datos.placa.trim().toUpperCase().replace(/[\s\-]/g, "");
    }
    await updateDoc(doc(db, rutaVehiculos, firestoreId), datosLimpios);
  };

  const agregarViaje = async (datos) => {
    const placaNorm = (datos.placa || "").trim().toUpperCase().replace(/[\s\-]/g, "");
    const rutaNorm = (datos.ruta || "").trim().toLowerCase();
    await addDoc(collection(db, rutaViajes), { ...datos, placaNorm, rutaNorm, creadoEn: new Date().toISOString() });
  };
  const eliminarViaje = async (firestoreId) => {
    await deleteDoc(doc(db, rutaViajes, firestoreId));
  };
  const editarViaje = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    if (datos.placa) {
      datosLimpios.placaNorm = datos.placa.trim().toUpperCase().replace(/[\s\-]/g, "");
    }
    if (datos.ruta) {
      datosLimpios.rutaNorm = datos.ruta.trim().toLowerCase();
    }
    await updateDoc(doc(db, rutaViajes, firestoreId), datosLimpios);
  };

  const agregarEmpresa = async (datos) => {
    const razonSocialNorm = (datos.razonSocial || datos.nombre || "").trim().toLowerCase();
    await addDoc(collection(db, rutaEmpresas), { ...datos, razonSocialNorm, creadoEn: new Date().toISOString() });
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
    const rutaNorm = (datos.nombre || datos.ruta || "").trim().toLowerCase();
    await addDoc(collection(db, `usuarios/${uid}/rutas`), {
      ...datosLimpios,
      rutaNorm,
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
  const editarGasto = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await updateDoc(doc(db, rutaGastos, firestoreId), datosLimpios);
  };

  const agregarGastoFijo = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaGastosFijos), { ...datosLimpios, creadoEn: new Date().toISOString() });
  };
  const eliminarGastoFijo = async (firestoreId) => {
    await deleteDoc(doc(db, rutaGastosFijos, firestoreId));
  };

  // Conductores CRUD
  const agregarConductor = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaConductores), { ...datosLimpios, creadoEn: new Date().toISOString() });
  };
  const editarConductor = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await updateDoc(doc(db, rutaConductores, firestoreId), datosLimpios);
  };
  const eliminarConductor = async (firestoreId) => {
    await deleteDoc(doc(db, rutaConductores, firestoreId));
  };

  // Cuenta de cobro CRUD (Transaccional - BE-29 / CR-20)
  const agregarCuenta = async (datos) => {
    if (!rutaCuentas) throw new Error("Usuario no autenticado");
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    delete datosLimpios.numero; // El consecutivo estricto lo asigna la transacción en servidor

    return await runTransaction(db, async (transaction) => {
      const configRef = doc(db, `usuarios/${uid}/config_contable`, "consecutivos");
      const configSnap = await transaction.get(configRef);

      let siguienteNumero = 1;
      if (configSnap.exists()) {
        siguienteNumero = (configSnap.data().ultimoCobro || 0) + 1;
      }

      const nuevaCuentaRef = doc(collection(db, rutaCuentas));
      const cuentaFinal = {
        ...datosLimpios,
        numero: siguienteNumero,
        creadoEn: new Date().toISOString(),
        servidorTimestamp: serverTimestamp(),
      };

      transaction.set(configRef, { ultimoCobro: siguienteNumero, actualizadoEn: serverTimestamp() }, { merge: true });
      transaction.set(nuevaCuentaRef, cuentaFinal);

      return { firestoreId: nuevaCuentaRef.id, numero: siguienteNumero };
    });
  };

  const editarCuenta = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await updateDoc(doc(db, rutaCuentas, firestoreId), {
      ...datosLimpios,
      actualizadoEn: serverTimestamp(),
    });
  };

  const eliminarCuenta = async (firestoreId) => {
    await deleteDoc(doc(db, rutaCuentas, firestoreId));
  };

  // Mantenimiento y Vehículo Atómico (writeBatch - BE-33)
  const registrarMantenimientoConVehiculo = async (datosMant, datosVehiculoUpdate, vehiculoId) => {
    if (!rutaMant) throw new Error("Usuario no autenticado");
    const batch = writeBatch(db);

    const nuevoMantRef = doc(collection(db, rutaMant));
    batch.set(nuevoMantRef, {
      ...JSON.parse(JSON.stringify(datosMant)),
      creadoEn: new Date().toISOString(),
      servidorTimestamp: serverTimestamp(),
    });

    if (vehiculoId && datosVehiculoUpdate && rutaVehiculos) {
      const vehRef = doc(db, rutaVehiculos, vehiculoId);
      batch.update(vehRef, {
        ...JSON.parse(JSON.stringify(datosVehiculoUpdate)),
        actualizadoEn: serverTimestamp(),
      });
    }

    await batch.commit();
    return nuevoMantRef.id;
  };

  return {
    vehiculos, viajes, empresas, rutas, mantenimientos, conductores, configMant, peajes, gastosVehiculo, gastosFijos, cargando, cuentasCobro,
    agregarVehiculo, eliminarVehiculo, editarVehiculo,
    agregarViaje,    eliminarViaje,    editarViaje,
    agregarEmpresa,  eliminarEmpresa,
    agregarRuta,     eliminarRuta,
    agregarMantenimiento, eliminarMantenimiento, registrarMantenimientoConVehiculo,
    agregarConfigMant, eliminarConfigMant,
    agregarGasto, eliminarGasto, editarGasto,
    agregarGastoFijo, eliminarGastoFijo,
    agregarConductor, editarConductor, eliminarConductor,
    agregarCuenta, editarCuenta, eliminarCuenta,
  };
}