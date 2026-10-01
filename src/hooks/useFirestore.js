// Hecho por JESUS COSSIO DEV
/**
 * useFirestore.js — Capa de persistencia en tiempo real con Firestore
 * Incluye:
 * - Error handlers en todos los onSnapshot (FE-10)
 * - serverTimestamp() en escrituras y actualizaciones (FE-50)
 * - Incremento atómico de odómetro con increment() (FE-45)
 * - Desmontaje seguro de listeners y prevención de fugas (CR-14)
 */
import { useState, useEffect, useRef } from "react";
import {
  collection, doc, onSnapshot, addDoc,
  updateDoc, deleteDoc, query, orderBy,
  runTransaction, writeBatch, serverTimestamp, increment
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
  const [cuentasCobro,   setCuentasCobro]   = useState([]);

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
  // Se ajusta durante el render: React descarta el render y reintenta de forma
  // sincrona, por lo que los datos de la cuenta anterior nunca llegan a pintarse.
  const [uidActivo, setUidActivo] = useState(uid);
  if (uid !== uidActivo) {
    setUidActivo(uid);
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
  }

  // Handler genérico de error para onSnapshot (FE-10)
  const manejarErrorSnapshot = (nombre) => (err) => {
    console.warn(`[Firestore onSnapshot] Error en ${nombre}:`, err.message || err);
    setCargando(false);
  };

  // 1. Vehículos
  useEffect(() => {
    if (!rutaVehiculos) return;
    const q = query(collection(db, rutaVehiculos));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVehiculos(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
        setCargando(false);
      },
      manejarErrorSnapshot("vehiculos")
    );
    return () => unsub();
  }, [rutaVehiculos]);

  // 2. Viajes
  useEffect(() => {
    if (!rutaViajes) return;
    const q = query(collection(db, rutaViajes), orderBy("fecha", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setViajes(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("viajes")
    );
    return () => unsub();
  }, [rutaViajes]);

  // 3. Empresas
  useEffect(() => {
    if (!rutaEmpresas) return;
    const q = query(collection(db, rutaEmpresas));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEmpresas(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("empresas")
    );
    return () => unsub();
  }, [rutaEmpresas]);

  // 4. Rutas
  useEffect(() => {
    if (!rutaRutas) return;
    const q = query(collection(db, rutaRutas));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRutas(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("rutas")
    );
    return () => unsub();
  }, [rutaRutas]);

  // 5. Mantenimientos
  useEffect(() => {
    if (!rutaMant) return;
    const q = query(collection(db, rutaMant), orderBy("fecha", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMantenimientos(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("mantenimientos")
    );
    return () => unsub();
  }, [rutaMant]);

  // 6. Peajes globales
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "peajes"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPeajes(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("peajes")
    );
    return () => unsub();
  }, [uid]);

  // 7. Configuración Mantenimiento
  useEffect(() => {
    if (!rutaConfigMant) return;
    const q = query(collection(db, rutaConfigMant));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setConfigMant(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("config_mant")
    );
    return () => unsub();
  }, [rutaConfigMant]);

  // 8. Gastos de Vehículo
  useEffect(() => {
    if (!rutaGastos) return;
    const q = query(collection(db, rutaGastos), orderBy("fecha", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setGastosVehiculo(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("gastos_vehiculo")
    );
    return () => unsub();
  }, [rutaGastos]);

  // 9. Gastos Fijos
  useEffect(() => {
    if (!rutaGastosFijos) return;
    const q = query(collection(db, rutaGastosFijos));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setGastosFijos(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("gastos_fijos")
    );
    return () => unsub();
  }, [rutaGastosFijos]);

  // 10. Conductores
  useEffect(() => {
    if (!rutaConductores) return;
    const q = query(collection(db, rutaConductores));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setConductores(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("conductores")
    );
    return () => unsub();
  }, [rutaConductores]);

  // 11. Cuentas de Cobro
  useEffect(() => {
    if (!rutaCuentas) return;
    const q = query(collection(db, rutaCuentas), orderBy("fecha", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCuentasCobro(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      },
      manejarErrorSnapshot("cuentas_cobro")
    );
    return () => unsub();
  }, [rutaCuentas]);

  // ── OPERACIONES CRUD (Con serverTimestamp y validación) ──

  // Vehículos
  const agregarVehiculo = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    const placaNorm = (datosLimpios.placa || "").trim().toUpperCase().replace(/[\s-]/g, "");
    await addDoc(collection(db, rutaVehiculos), {
      ...datosLimpios,
      placaNorm,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  };

  const eliminarVehiculo = async (firestoreId) => {
    await deleteDoc(doc(db, rutaVehiculos, firestoreId));
  };

  const editarVehiculo = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    if (datosLimpios.placa) {
      datosLimpios.placaNorm = datosLimpios.placa.trim().toUpperCase().replace(/[\s-]/g, "");
    }
    await updateDoc(doc(db, rutaVehiculos, firestoreId), {
      ...datosLimpios,
      actualizadoEn: serverTimestamp(),
    });
  };

  // Incremento atómico de Odómetro (FE-45)
  const incrementarOdometro = async (vehiculoFirestoreId, kmAdicionales) => {
    const kmNum = Number(kmAdicionales) || 0;
    if (!vehiculoFirestoreId || kmNum <= 0) return;
    await updateDoc(doc(db, rutaVehiculos, vehiculoFirestoreId), {
      kmOdometro: increment(kmNum),
      actualizadoEn: serverTimestamp(),
    });
  };

  // Viajes
  const agregarViaje = async (datos, vehiculoFirestoreId = null) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    if (datosLimpios.placa) {
      datosLimpios.placaNorm = datosLimpios.placa.trim().toUpperCase().replace(/[\s-]/g, "");
    }
    if (datosLimpios.ruta) {
      datosLimpios.rutaNorm = datosLimpios.ruta.trim().toLowerCase();
    }
    const docRef = await addDoc(collection(db, rutaViajes), {
      ...datosLimpios,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });

    // Si viene asociado a un vehículo y tiene kilometraje, incrementar odómetro atómicamente (FE-45)
    if (vehiculoFirestoreId && datosLimpios.kmT > 0) {
      try {
        await incrementarOdometro(vehiculoFirestoreId, datosLimpios.kmT);
      } catch (e) {
        console.warn("No se pudo actualizar odómetro automáticamente:", e);
      }
    }
    return docRef;
  };

  const eliminarViaje = async (firestoreId) => {
    await deleteDoc(doc(db, rutaViajes, firestoreId));
  };

  const editarViaje = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    if (datosLimpios.placa) {
      datosLimpios.placaNorm = datosLimpios.placa.trim().toUpperCase().replace(/[\s-]/g, "");
    }
    if (datosLimpios.ruta) {
      datosLimpios.rutaNorm = datosLimpios.ruta.trim().toLowerCase();
    }
    await updateDoc(doc(db, rutaViajes, firestoreId), {
      ...datosLimpios,
      actualizadoEn: serverTimestamp(),
    });
  };

  // Empresas
  const agregarEmpresa = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    const razonSocialNorm = (datosLimpios.razonSocial || datosLimpios.nombre || "").trim().toLowerCase();
    await addDoc(collection(db, rutaEmpresas), {
      ...datosLimpios,
      razonSocialNorm,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  };

  const eliminarEmpresa = async (firestoreId) => {
    await deleteDoc(doc(db, rutaEmpresas, firestoreId));
  };

const guardandoRutaRef = useRef(false);
  const agregarRuta = async (datos) => {
    if (guardandoRutaRef.current) return;
    guardandoRutaRef.current = true;
    try {
      if (!uid) throw new Error("Sin uid");
      const datosLimpios = JSON.parse(JSON.stringify(datos));
      const rutaNorm = (datosLimpios.nombre || datosLimpios.ruta || "").trim().toLowerCase();
      await addDoc(collection(db, `usuarios/${uid}/rutas`), {
        ...datosLimpios,
        rutaNorm,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      });
    } finally {
      guardandoRutaRef.current = false;
    }
  };

  const eliminarRuta = async (firestoreId) => {
    await deleteDoc(doc(db, rutaRutas, firestoreId));
  };

  // Mantenimiento
  const agregarMantenimiento = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaMant), {
      ...datosLimpios,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  };

  const eliminarMantenimiento = async (firestoreId) => {
    await deleteDoc(doc(db, rutaMant, firestoreId));
  };

  // Config Mantenimiento
  const agregarConfigMant = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaConfigMant), {
      ...datosLimpios,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  };

  const eliminarConfigMant = async (firestoreId) => {
    await deleteDoc(doc(db, rutaConfigMant, firestoreId));
  };

  // Gastos
  const agregarGasto = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaGastos), {
      ...datosLimpios,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  };

  const eliminarGasto = async (firestoreId) => {
    await deleteDoc(doc(db, rutaGastos, firestoreId));
  };

  const editarGasto = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await updateDoc(doc(db, rutaGastos, firestoreId), {
      ...datosLimpios,
      actualizadoEn: serverTimestamp(),
    });
  };

  // Gastos Fijos
  const agregarGastoFijo = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaGastosFijos), {
      ...datosLimpios,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  };

  const eliminarGastoFijo = async (firestoreId) => {
    await deleteDoc(doc(db, rutaGastosFijos, firestoreId));
  };

  // Conductores
  const agregarConductor = async (datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await addDoc(collection(db, rutaConductores), {
      ...datosLimpios,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  };

  const editarConductor = async (firestoreId, datos) => {
    const datosLimpios = JSON.parse(JSON.stringify(datos));
    await updateDoc(doc(db, rutaConductores, firestoreId), {
      ...datosLimpios,
      actualizadoEn: serverTimestamp(),
    });
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
    vehiculos, viajes, empresas, rutas, mantenimientos, conductores,
    configMant, peajes, gastosVehiculo, gastosFijos, cargando, cuentasCobro,
    agregarVehiculo, eliminarVehiculo, editarVehiculo, incrementarOdometro,
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

export default useFirestore;