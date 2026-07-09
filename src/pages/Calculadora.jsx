import { useState, useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { theme as t } from "../styles/theme";
import { sanitizar, validarNumero } from "../utils/validar";

const DEFAULT_ADBLUE = 0.18925;

function Calculadora({ vehiculos, viajes, rutas = [], peajes = [], conductores = [], onGuardar, onGuardarRuta, onEliminarRuta, onEditarVehiculo, mostrarToast }) {
  const PEAJES_CO = peajes.length > 0 
  ? [...peajes].sort((a, b) => a.n.localeCompare(b.n, 'es')) 
  : [];
  const navigate = useNavigate();
  const location = useLocation();

  const [fecha,            setFecha]              = useState(new Date().toISOString().slice(0,10));
  const [fechaDescarga,    setFechaDescarga]      = useState("");
  const [mani,             setMani]               = useState("");
  const [remesa,           setRemesa]             = useState("");
  const [pesoBascula,      setPesoBascula]        = useState("");
  const [lugarCargue,      setLugarCargue]        = useState("");
  const [lugarDescargue,   setLugarDescargue]     = useState("");
  const [observaciones,    setObservaciones]      = useState("");
  const [placa,            setPlaca]              = useState(location.state?.placa || "");
  const [tipoCarga,        setTipoCarga]          = useState("");
  const [producto,         setProducto]           = useState("");
  const [ruta,             setRuta]               = useState("");
  const [empresa,          setEmpresa]            = useState("");
  const [conductor,        setConductor]          = useState("");
  const [kmCargado,        setKmCargado]          = useState("");
  const [kmVacio,          setKmVacio]            = useState("");
  const [kmCargadoRet,     setKmCargadoRet]       = useState("");
  const [kmVacioRet,       setKmVacioRet]         = useState("");
  const [tonelaje,         setTonelaje]           = useState("");
  const [fleteTon,         setFleteTon]           = useState("");
  const [modoComb,         setModoComb]           = useState("auto");
  const [rendCargado,      setRendCargado]        = useState("");
  const [rendVacio,        setRendVacio]          = useState("");
  const [galManual,        setGalManual]          = useState("");
  const ultimoViaje = viajes.length > 0 ? viajes[0] : null;
  const [precioAcpm,       setPrecioAcpm]         = useState(() => {
    if (ultimoViaje && ultimoViaje.gTot > 0) return Math.round((ultimoViaje.cAcpm || 0) / ultimoViaje.gTot) || "";
    return "";
  });
  const [precioAdblue,     setPrecioAdblue]       = useState(() => {
    if (ultimoViaje && ultimoViaje.adlt > 0) return Math.round((ultimoViaje.cAdbl || 0) / ultimoViaje.adlt) || "";
    return "";
  });
  const [categoria,           setCategoria]          = useState("VII");
  const [busquedaP,           setBusquedaP]          = useState("");
  const [selP,                setSelP]               = useState("");
  const [peajesRuta,          setPeajesRuta]         = useState([]);
  const [porcCond,            setPorcCond]           = useState("");
  const [carpado,             setCarpado]            = useState("");
  const [gastosViaje,         setGastosViaje]        = useState("");
  const [extras,              setExtras]             = useState([]);
  const [nuevoNom,            setNuevoNom]           = useState("");
  const [nuevoVal,            setNuevoVal]           = useState("");
  const [guardando,           setGuardando]          = useState(false);
  const [modoFlete,           setModoFlete]          = useState("porTon");
  const [modoConductor,       setModoConductor]      = useState("porcentaje");
  const [descRetefuente,      setDescRetefuente]     = useState(false);
  const [pctRetefuente,       setPctRetefuente]      = useState(1);
  const [descReteica,         setDescReteica]        = useState(false);
  const [pctReteica,          setPctReteica]         = useState(1);
  const [descFopat,           setDescFopat]          = useState(false);
  const [pctFopat,            setPctFopat]           = useState(0.1);
  const [descOtro,            setDescOtro]           = useState(false);
  const [pctOtro,             setPctOtro]            = useState(0);
  const [nombreOtro,          setNombreOtro]         = useState("");
  const [tieneRetorno,        setTieneRetorno]       = useState(false);
  const [fleteRetorno,        setFleteRetorno]       = useState("");
  const [tonelajeRetorno,     setTonelajeRetorno]    = useState("");
  const [modoFleteRetorno,    setModoFleteRetorno]   = useState("porTon");
  const [rutaRet,             setRutaRet]            = useState("");
  const [tipoCargaRet,        setTipoCargaRet]       = useState("");
  const [empresaRet,          setempresaRet]         = useState("");
  const [productoRet,         setProductoRet]        = useState("");
  const [maniRet,             setManiRet]            = useState("");
  const [remesaRet,           setRemesaRet]          = useState("");
  const [pesoBasRet,          setPesoBasRet]         = useState("");
  const [lugarCargueRet,      setLugarCargueRet]     = useState("");
  const [lugarDescargueRet,   setLugarDescargueRet]  = useState("");
  const [fechaCargueRet,      setFechaCargueRet]     = useState("");
  const [fechaDescargueRet,   setFechaDescargueRet]  = useState("");
  const [mostrarRutas,        setMostrarRutas]       = useState(false);
  const [guardandoRuta,       setGuardandoRuta]      = useState(false);
  const [nombreRuta,          setNombreRuta]         = useState("");
  const [mostrarGuardar,      setMostrarGuardar]     = useState(false);
  const [rutaCargada,         setRutaCargada]        = useState(null);
  const [secDatos,            setSecDatos]           = useState(true);
  const [secComb,             setSecComb]            = useState(false);
  const [secPeajes,           setSecPeajes]          = useState(false);
  const [secCostos,           setSecCostos]          = useState(false);
  const [secDesc,             setSecDesc]            = useState(false);
  const [sugerenciaPeajes,    setSugerenciaPeajes] = useState(null);
  const [sugerenciaAplicada,  setSugerenciaAplicada] = useState(false);


  const n   = (v) => parseFloat(v) || 0;
  const fmt = (v) => "$" + Math.round(v).toLocaleString("es-CO");
  const fnD = (v, d) => (Math.round(v * Math.pow(10,d)) / Math.pow(10,d))
    .toLocaleString("es-CO", { maximumFractionDigits: d });
  const conductoresFrecuentes = [...new Set(
    viajes
    .map(v => v.condNom)
    .filter(c => c && c.trim() !=="")
  )]

  const empresasFrecuentes = [...new Set(
  viajes.map(v => v.emp).filter(emp => emp && emp.trim() !== "")
  )];

  const productosFrecuentes = [...new Set(
  viajes.map(v => v.prod).filter(p => p && p.trim() !== "")
  )];

  const valorViajeIda = modoFlete === "porTon"
    ?n(tonelaje) * n(fleteTon)
    : n(fleteTon);

  const valorViajeRetorno = tieneRetorno
    ?modoFleteRetorno === "porTon"
      ? n(tonelajeRetorno) * n(fleteRetorno)
      : n(fleteRetorno)
    : 0;

  const valorViaje = valorViajeIda + valorViajeRetorno;

  const kmCargTotal = n(kmCargado) + (tieneRetorno ? n(kmCargadoRet) : 0);
  const kmVacTotal  = n(kmVacio) + (tieneRetorno ? n(kmVacioRet) : 0);
  const kmTotal    = kmCargTotal + kmVacTotal;

  let galCarg = 0, galVac = 0, galTotal = 0;
  if (modoComb === "auto") {
    galCarg  = n(rendCargado) > 0 ? kmCargTotal / n(rendCargado) : 0;
    galVac   = n(rendVacio)   > 0 ? kmVacTotal   / n(rendVacio)   : 0;
    galTotal = galCarg + galVac;
  } else {
    galTotal = n(galManual);
  }

  const vehiculoSel = vehiculos.find(v => v.placa === placa);
  const usaAdblue   = vehiculoSel?.usaAdblue !== false;
  const adblueRatio = usaAdblue ? (vehiculoSel?.adblueRatio || DEFAULT_ADBLUE) : 0;
  const adblLt    = galTotal * adblueRatio;
  const costoAcpm = galTotal * n(precioAcpm);
  const costoAdbl = adblLt   * n(precioAdblue);
  const costoComb = costoAcpm + costoAdbl;

  // Fallback: si la categoría no existe en el peaje (tarifa=0), baja a la siguiente disponible
  const CATS_ORDEN = ["I","II","III","IV","V","VI","VII"];
  const obtenerTarifa = (peaje, cat) => {
    let idx = CATS_ORDEN.indexOf(cat);
    while (idx >= 0) {
      if (peaje.t && peaje.t[CATS_ORDEN[idx]] > 0) return peaje.t[CATS_ORDEN[idx]];
      idx--;
    }
    return 0;
  };

  const totPeajes = peajesRuta.reduce((s,p) => s + obtenerTarifa(p, categoria) * (p.iv?2:1), 0);
  const costoConduct = modoConductor === "porcentaje" ? (n(porcCond)/100) * valorViaje : n(porcCond);
  const totExtras = extras.reduce((s,e) => s + e.valor, 0);
  const valRetefuente = descRetefuente ? (pctRetefuente/100) * valorViaje : 0;
  const valReteica    = descReteica    ? (pctReteica/100)    * valorViaje : 0;
  const valFopat      = descFopat      ? (pctFopat/100)      * valorViaje : 0;
  const valOtro       = descOtro       ? (pctOtro/100)       * valorViaje : 0;
  const totalDesc     = valRetefuente + valReteica + valFopat + valOtro;
  const totalGastos = costoComb + totPeajes + costoConduct + n(carpado) + n(gastosViaje) + totExtras + totalDesc;
  const gananciaNeta = valorViaje - totalGastos;

  const margen = valorViaje > 0 ? (gananciaNeta / valorViaje) * 100 : 0;
  const cxkm   = kmTotal > 0 ? totalGastos / kmTotal : 0;
  const margenColor = margen >= 40 ? t.colors.green : margen >= 20 ? t.colors.amber : t.colors.red;


  const peajesFiltrados = busquedaP
    ? PEAJES_CO.filter(p =>
        p.n.toLowerCase().includes(busquedaP.toLowerCase()) ||
        p.d.toLowerCase().includes(busquedaP.toLowerCase()))
    : PEAJES_CO;

  const agregarPeaje = () => {
    if (!selP) return;
    const p = PEAJES_CO.find(x => x.c === selP);
    if (!p || peajesRuta.find(x => x.c === p.c)) return;
    setPeajesRuta([...peajesRuta, { ...p, iv: false }]);
    setSelP("");
  };

  const toggleIV  = (c) => setPeajesRuta(peajesRuta.map(p => p.c===c ? {...p,iv:!p.iv} : p));
  const quitarP   = (c) => setPeajesRuta(peajesRuta.filter(p => p.c!==c));

  const agregarExtra = () => {
    if (!nuevoNom.trim()) return;
    setExtras([...extras, { n: nuevoNom.trim(), valor: n(nuevoVal) }]);
    setNuevoNom(""); setNuevoVal("");
  };

  const guardarViaje = async () => {
    if (!ruta.trim())  { mostrarToast("Ingresa la ruta del viaje","error"); return; }
    if (!valorViaje)   { mostrarToast("Ingresa tonelaje y flete","error"); return; }
    if (viajes.length >= 5000) { mostrarToast("Límite de viajes alcanzado","error"); return; }
    setGuardando(true);
    await onGuardar({
      fecha, fechaDescarga, mani: sanitizar(mani), placa, tipoCarga, prod: sanitizar(producto),
      ruta: sanitizar(ruta), emp: sanitizar(empresa), condNom: sanitizar(conductor),
      remesa: sanitizar(remesa), pesoBascula: validarNumero(pesoBascula, 0, 999),
      lugarCargue: sanitizar(lugarCargue), lugarDescargue: sanitizar(lugarDescargue),
      observaciones: sanitizar(observaciones).slice(0, 500),
      kmCargado: n(kmCargado), kmVacio: n(kmVacio), kmCargadoRet: n(kmCargadoRet), kmVacioRet: n(kmVacioRet), kmT: kmTotal,
      ton: n(tonelaje), fleteTon: n(fleteTon), vViaje: valorViaje,
      tieneRetorno, valorViajeIda, valorViajeRetorno, tonelajeRetorno: n(tonelajeRetorno), fleteRetorno: n(fleteRetorno),
      rutaRet: sanitizar(rutaRet), tipoCargaRet, productoRet: sanitizar(productoRet),
      empresaRet: sanitizar(empresaRet),
      maniRet: sanitizar(maniRet), remesaRet: sanitizar(remesaRet),
      pesoBasRet: validarNumero(pesoBasRet, 0, 999),
      lugarCargueRet: sanitizar(lugarCargueRet), lugarDescargueRet: sanitizar(lugarDescargueRet),
      fechaCargueRet, fechaDescargueRet,
      gTot: galTotal, galCargado: galCarg, galVacio: galVac,
      adlt: adblLt, cAcpm: costoAcpm, cAdbl: costoAdbl, cComb: costoComb,
      peajes: totPeajes,
      peajesDetalle: peajesRuta.map(p => ({
        n: p.n, d: p.d, tarifa: obtenerTarifa(p, categoria), iv: p.iv,
        total: (obtenerTarifa(p, categoria)) * (p.iv?2:1),
      })),
      pcond: n(porcCond), conductor: costoConduct,
      carp: n(carpado), gv2: n(gastosViaje),
      extras: totExtras, extrasList: extras,
      total: totalGastos, neta: gananciaNeta,
      mrg: margen, margen, cxk: cxkm,
      descuentos: { 
        retefuente: valRetefuente,
        reteica: valReteica,
        fopat: valFopat,
        otro: valOtro,
        nombreOtro: nombreOtro,
        total: totalDesc,
      }
    });
    if (viajes.length === 0) {
      mostrarToast("🎉 ¡Primer viaje registrado! Guárdelo como ruta frecuente y el próximo lo calcula en 10 segundos","exito");
      } else {
          mostrarToast("Viaje guardado correctamente","exito");
      }

      // Volver a donde el usuario estaba — SIEMPRE, fuera del if/else del toast
      if (location.state?.vehiculoId) {
        navigate(`/vehiculo/${location.state.vehiculoId}`, { state: { tab: location.state.volverTab || "viajes" }, replace: true });
      } else {
        navigate(-1);
      }

    // Actualizar odómetro y estado del vehículo automáticamente
    if (placa) {
      const veh = vehiculos.find(v => v.placa === placa);
      if (veh) {
        const cambios = {};
        if (kmTotal > 0) cambios.kmOdometro = (veh.kmOdometro || 0) + kmTotal;
        // Estado automático: viaje en curso → "En viaje" (respeta el taller)
        const hoyStr = new Date().toISOString().slice(0,10);
        const finViaje = fechaDescargueRet || fechaDescarga || "";
        const enCurso = fecha <= hoyStr && (!finViaje || finViaje >= hoyStr);
        if (enCurso && veh.estado !== "en_taller") cambios.estado = "en_viaje";
        if (Object.keys(cambios).length > 0) onEditarVehiculo(veh.firestoreId, cambios).catch(()=>{});
      }
    }

    // Limpiar formulario
    setFecha(new Date().toISOString().slice(0,10)); setFechaDescarga("");
    setMani(""); setRemesa(""); setPesoBascula(""); setLugarCargue(""); setLugarDescargue("");
    setObservaciones(""); setPlaca(""); setTipoCarga(""); setProducto(""); setRuta("");
    setEmpresa(""); setConductor(""); setKmCargado(""); setKmVacio(""); setKmCargadoRet(""); setKmVacioRet("");
    setTonelaje(""); setFleteTon(""); setTieneRetorno(false); setFleteRetorno("");
    setTonelajeRetorno(""); setRutaRet(""); setempresaRet(""); setProductoRet("");
    setManiRet(""); setRemesaRet(""); setPesoBasRet("");
    setLugarCargueRet(""); setLugarDescargueRet(""); setFechaCargueRet(""); setFechaDescargueRet("");
    setExtras([]); setPorcCond(""); setCarpado(""); setGastosViaje("");
    setPeajesRuta([]); setRutaCargada(null);
   
    setGuardando(false);
    navigate(-1);
  };

  const cargarRuta = (rutaGuardada) => {
  setTipoCarga(rutaGuardada.tipoCarga || "");
  setRuta(rutaGuardada.ruta);
  setKmCargado(rutaGuardada.kmCargado || "");
  setKmVacio(rutaGuardada.kmVacio || "");
  setFleteTon(rutaGuardada.fleteTon || "");
  setRendCargado(rutaGuardada.rendCargado || "");
  setRendVacio(rutaGuardada.rendVacio || "");
  setGalManual(rutaGuardada.galManual || "");
  if (rutaGuardada.precioAcpm)   setPrecioAcpm(rutaGuardada.precioAcpm);
  if (rutaGuardada.precioAdblue) setPrecioAdblue(rutaGuardada.precioAdblue);
  setCategoria(rutaGuardada.categoria || "VII");
  setPeajesRuta((rutaGuardada.peajesRuta || []).map(p => ({
    c: p.c, n: p.n, d: p.d, iv: p.iv || false,
    t: { [rutaGuardada.categoria || "VII"]: p.tarifa || 0 },
  })));
  // Datos adicionales
  if (rutaGuardada.producto)        setProducto(rutaGuardada.producto);
  if (rutaGuardada.empresa)         setEmpresa(rutaGuardada.empresa);
  if (rutaGuardada.conductor)       setConductor(rutaGuardada.conductor);
  if (rutaGuardada.lugarCargue)     setLugarCargue(rutaGuardada.lugarCargue);
  if (rutaGuardada.lugarDescargue)  setLugarDescargue(rutaGuardada.lugarDescargue);
  if (rutaGuardada.modoConductor)   setModoConductor(rutaGuardada.modoConductor);
  if (rutaGuardada.porcCond)        setPorcCond(rutaGuardada.porcCond);
  if (rutaGuardada.carpado)         setCarpado(rutaGuardada.carpado);
  if (rutaGuardada.gastosViaje)     setGastosViaje(rutaGuardada.gastosViaje);
  if (rutaGuardada.extrasList)      setExtras(rutaGuardada.extrasList);
    // Descuentos de ley
  if (rutaGuardada.descRetefuente !== undefined) setDescRetefuente(rutaGuardada.descRetefuente);
  if (rutaGuardada.pctRetefuente)   setPctRetefuente(rutaGuardada.pctRetefuente);
  if (rutaGuardada.descReteica !== undefined) setDescReteica(rutaGuardada.descReteica);
  if (rutaGuardada.pctReteica)      setPctReteica(rutaGuardada.pctReteica);
  if (rutaGuardada.descFopat !== undefined) setDescFopat(rutaGuardada.descFopat);
  if (rutaGuardada.pctFopat)        setPctFopat(rutaGuardada.pctFopat);
  setMostrarRutas(false);

  setRutaCargada(rutaGuardada.nombre);
  setMostrarRutas(false);
};

const guardarRutaFrecuente = async () => {
  if (guardandoRuta) return;
  if (!ruta.trim()) { mostrarToast("Ingresa la ruta del viaje primero","error"); return; }
  setGuardandoRuta(true);

  const datos = {
    tipoCarga:   sanitizar(tipoCarga),
    nombre:      sanitizar(nombreRuta.trim() || ruta.trim()),
    ruta:        sanitizar(ruta),
    kmCargado:   n(kmCargado),
    kmVacio:     n(kmVacio),
    fleteTon:    n(fleteTon),
    rendCargado: n(rendCargado),
    rendVacio:   n(rendVacio),
    galManual:   n(galManual),
    precioAcpm:  n(precioAcpm),
    precioAdblue: n(precioAdblue),
    peajesRuta:  peajesRuta.map(p => ({
      c: p.c, n: p.n, d: p.d, iv: p.iv || false,
      tarifa: p.t ? obtenerTarifa(p, categoria) : (p.tarifa || 0),
    })),
    categoria,
    // Datos adicionales
    producto:       sanitizar(producto),
    empresa:        sanitizar(empresa),
    conductor:       sanitizar(conductor),
    lugarCargue:     sanitizar(lugarCargue),
    lugarDescargue:  sanitizar(lugarDescargue),
    modoConductor:   modoConductor,
    porcCond:        n(porcCond),
    carpado:         n(carpado),
    gastosViaje:     n(gastosViaje),
    extrasList:      extras,
    // Descuentos de ley
    descRetefuente:  descRetefuente,
    pctRetefuente:   pctRetefuente,
    descReteica:     descReteica,
    pctReteica:      pctReteica,
    descFopat:       descFopat,
    pctFopat:        pctFopat,
  };

  try {
    await onGuardarRuta(datos);
    mostrarToast("Ruta guardada correctamente", "exito");
    setMostrarGuardar(false);
    setNombreRuta("");
  } catch(err) {
    mostrarToast("Error al guardar la ruta", "error");
  } finally {
    setGuardandoRuta(false);
  }
};

// Pre-llenar rendimiento configurado en el vehículo al seleccionar placa
  useEffect(() => {
    const veh = vehiculos.find(v => v.placa === placa);
    if (!veh) return;
    if (veh.rendCargadoDef > 0 && !rendCargado) setRendCargado(String(veh.rendCargadoDef));
    if (veh.rendVacioDef > 0 && !rendVacio) setRendVacio(String(veh.rendVacioDef));
  }, [placa]);

  // Peajes sugeridos: si la ruta ya se hizo antes, ofrecer los peajes del último viaje
  useEffect(() => {
    if (!ruta.trim() || peajesRuta.length > 0 || sugerenciaAplicada) {
      if (!ruta.trim()) { setSugerenciaPeajes(null); setSugerenciaAplicada(false); }
      return;
    }
    const rutaNorm = ruta.trim().toLowerCase();
    const viajeAnterior = viajes.find(v =>
      (v.ruta || "").trim().toLowerCase() === rutaNorm && (v.peajesDetalle || []).length > 0
    );
    if (viajeAnterior) {
      const totalPeajesAnt = viajeAnterior.peajesDetalle.reduce((s, p) => s + (p.total || p.tarifa || 0), 0);
      setSugerenciaPeajes({
        detalle: viajeAnterior.peajesDetalle,
        total: totalPeajesAnt,
        cantidad: viajeAnterior.peajesDetalle.length,
      });
    } else {
      setSugerenciaPeajes(null);
    }
  }, [ruta]);

  const aplicarPeajesSugeridos = () => {
    if (!sugerenciaPeajes) return;
    const peajesRecuperados = sugerenciaPeajes.detalle.map(p => ({
      c: p.n.replace(/\s/g, "_"),
      n: p.n,
      d: p.d || "",
      iv: p.iv || false,
      t: { [categoria]: p.tarifa || p.total || 0 },
    }));
    setPeajesRuta(peajesRecuperados);
    setSugerenciaPeajes(null);
    setSugerenciaAplicada(true);
    mostrarToast(`${peajesRecuperados.length} peajes cargados de su último viaje`, "exito");
  };

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Calculadora</h1>
      </div>

      {/* ── RUTAS FRECUENTES ── */}
{rutas.length > 0 && (
  <div style={{padding:"10px 16px 0"}}>
    <button
      style={{
        width:"100%", padding:"11px", background:t.colors.blueSoft,
        border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md,
        fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold,
        color:t.colors.blue, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"
      }}
      onClick={()=>setMostrarRutas(!mostrarRutas)}
    >
      📍 {mostrarRutas ? "Cerrar rutas" : `Cargar ruta guardada (${rutas.length})`}
    </button>

    {rutaCargada && (
  <div style={{
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"8px 12px",
    background:t.colors.greenSoft,
    border:`1px solid ${t.colors.greenBorder}`,
    borderRadius:t.radius.md,
    marginTop:"6px"
  }}>
    <span style={{fontSize:t.fonts.sizeXs, color:t.colors.green, fontWeight:t.fonts.weightSemibold}}>
      📍 Ruta cargada: {rutaCargada}
    </span>
    <button
      style={{background:"none", border:"none", cursor:"pointer", fontSize:"14px", color:t.colors.green, padding:0}}
      onClick={()=>setRutaCargada(null)}
    >
      ✕
    </button>
  </div>
)}

    {mostrarRutas && (
      <div style={{background:t.colors.bgCard, borderRadius:t.radius.lg, marginTop:"8px", overflow:"hidden", boxShadow:t.shadows.card}}>
        {rutas.map((r,i,arr)=>(
          <div key={r.firestoreId} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"12px 16px",
            borderBottom: i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`
          }}>
            <div>
              <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>
                {r.nombre}
              </p>
              <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0"}}>
                {r.kmCargado>0?`${r.kmCargado} km`:""} 
                {r.peajesRuta?.length>0?` · ${r.peajesRuta.length} peajes`:""} 
                {r.conductor?` · ${r.conductor}`:""}
                {r.empresa?` · ${r.empresa}`:""}
                {r.producto?` . ${r.producto}`:""}
                </p>
            </div>
            <div style={{display:"flex", gap:"8px"}}>
              <button
                style={{padding:"6px 12px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, cursor:"pointer"}}
                onClick={()=>cargarRuta(r)}
              >
                Cargar
              </button>
              <button
                style={{padding:"6px 10px", background:t.colors.redSoft, border:`1px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, cursor:"pointer"}}
                onClick={()=>onEliminarRuta(r.firestoreId)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      {/* GUÍA PRIMERA VEZ */}
      {viajes.length === 0 && (
        <div style={{margin:"10px 16px 0",padding:"10px 14px",background:"#1565FF15",border:`1.5px solid ${t.colors.blueBorder}`,borderRadius:t.radius.md,display:"flex",gap:"8px",alignItems:"flex-start"}}>
          <span style={{fontSize:"16px"}}>💡</span>
          <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:0,lineHeight:1.5}}>
            <strong style={{color:t.colors.textPrimary}}>Su primer cálculo:</strong> solo necesita ruta, kilómetros, toneladas y flete. Las demás secciones (combustible, peajes, costos) las abre tocándolas. Todo lo demás es opcional.
          </p>
        </div>
      )}

      {/* ── DATOS DEL VIAJE ── */}
      <div style={styles.seccionHeader} onClick={()=>setSecDatos(!secDatos)}>
        <span style={styles.seccionLabel}>Datos del viaje</span>
        {secDatos ? <ChevronUp size={16} color={t.colors.textTertiary}/> : <ChevronDown size={16} color={t.colors.textTertiary}/>}
      </div>
      {secDatos && (<div style={{padding:"0 20px"}}>
      <div style={styles.card}>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de cargue</label>
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de descargue</label>
            <input type="date" value={fechaDescarga} onChange={e=>setFechaDescarga(e.target.value)} style={styles.input} />
          </div>
        </div>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Placa vehículo</label>
            <select value={placa} onChange={e=>setPlaca(e.target.value)}
              style={{...styles.input, color: placa ? t.colors.textPrimary : t.colors.textTertiary}}>
              <option value="">Escoge tu vehículo...</option>
              {vehiculos.map(v=>(
                <option key={v.firestoreId} value={v.placa}>{v.placa} — {v.tipoVehiculo}</option>
              ))}
            </select>
          </div>
          <div style={styles.campo}>
  <label style={styles.label}>Tipo de carga</label>
  <select value={tipoCarga} onChange={e=>setTipoCarga(e.target.value)} style={styles.input}>
    <option value="">Seleccionar...</option>
    <option>Granel sólido</option>
    <option>Granel líquido</option>
    <option>Carga general</option>
    <option>Contenedor cargado</option>
    <option>Contenedor vacío</option>
    <option>Carga refrigerada</option>
    <option>Sin carga</option>
    <option>Carga peligrosa</option>
    <option>Carga sobredimensionada</option>
    <option>Ganado</option>
    <option>Vehículos</option>
  </select>
</div>
        </div>
        <div style={styles.campo}>
          <label style={styles.label}>Ruta (Origen → Destino)</label>
          <input type="text" placeholder="Barranquilla – Bogotá" value={ruta} onChange={e=>setRuta(e.target.value)} style={styles.input} />
        </div>
        <div style={styles.fila2}>
          <div style={styles.campo}>
  <label style={styles.label}>Producto</label>
  {productosFrecuentes.length > 0 && (
    <select
      value={productosFrecuentes.includes(producto) ? producto : "__nuevo__"}
      onChange={e => {
        if (e.target.value === "__nuevo__") {
          setProducto("");
        } else {
          setProducto(e.target.value);
        }
      }}
      style={{...styles.input, marginBottom: "6px", color: t.colors.textPrimary}}
    >
      <option value="__nuevo__">Nuevo producto</option>
      {productosFrecuentes.map((p, i) => (
        <option key={i} value={p}>{p}</option>
      ))}
    </select>
  )}
  {(!productosFrecuentes.includes(producto) || productosFrecuentes.length === 0) && (
  <input 
    type="text" 
    placeholder="Maíz" 
    value={producto}
    onChange={e => setProducto(e.target.value)} 
    style={styles.input} 
    />
)}

</div>
          
          <div style={styles.campo}>
  <label style={styles.label}>Empresa</label>
  {empresasFrecuentes.length > 0 && (
    <select
      value={empresasFrecuentes.includes(empresa) ? empresa : "__nueva__"}
      onChange={e => {
  if (e.target.value === "__nueva__") {
    setEmpresa("");
  } else {
    setEmpresa(e.target.value);
  }
}}
      style={{...styles.input, marginBottom:"6px", color: t.colors.textPrimary}}
    >
      <option value="__nueva__">Nueva empresa</option>
      {empresasFrecuentes.map((emp, i) => (
        <option key={i} value={emp}>{emp}</option>
      ))}
    </select>
  )}
  {(!empresasFrecuentes.includes(empresa)  || empresasFrecuentes.length === 0) && (
  <input 
    type="text" 
    placeholder="TransABC" 
    value={empresa}
    onChange={e => setEmpresa(e.target.value)} 
    style={styles.input} 
    />
)}

</div>

        </div>
        <div style={styles.campo}>
  <label style={styles.label}>Conductor</label>
  <select
    value={conductor}
    onChange={e => setConductor(e.target.value)}
    style={{...styles.input, color: conductor ? t.colors.textPrimary : t.colors.textTertiary}}
  >
    <option value="">Seleccionar conductor</option>
    {conductores.map(c => (
      <option key={c.firestoreId} value={c.nombre}>{c.nombre}{c.catLic ? ` · Cat ${c.catLic}` : ""}</option>
    ))}
    {conductoresFrecuentes.filter(cf => !conductores.some(c => c.nombre === cf)).map((c,i) => (
      <option key={`freq-${i}`} value={c}>{c}</option>
    ))}
  </select>
</div>

  <div style={styles.campo}>
  <label style={styles.label}>Manifiesto</label>
  <input type="text" placeholder="123456789" value={mani}
    onChange={e=>setMani(e.target.value)} style={styles.input}/>
</div>

  <div style={styles.fila2}>
  <div style={styles.campo}>
    <label style={styles.label}>N° Remesa</label>
    <input type="text" placeholder="REM-001" value={remesa}
      onChange={e=>setRemesa(e.target.value)} style={styles.input}/>
  </div>
  <div style={styles.campo}>
    <label style={styles.label}>Peso báscula (ton)</label>
    <input type="number" placeholder="34.5" value={pesoBascula}
      onChange={e=>setPesoBascula(e.target.value)} style={styles.input}/>
  </div>
</div>

<div style={styles.fila2}>
  <div style={styles.campo}>
    <label style={styles.label}>Lugar de cargue</label>
    <input type="text" placeholder="Bodega X, Km 5" value={lugarCargue}
      onChange={e=>setLugarCargue(e.target.value)} style={styles.input}/>
  </div>
  <div style={styles.campo}>
    <label style={styles.label}>Lugar de descargue</label>
    <input type="text" placeholder="Puerto Y" value={lugarDescargue}
      onChange={e=>setLugarDescargue(e.target.value)} style={styles.input}/>
  </div>
</div>

<div style={styles.campo}>
  <label style={styles.label}>Observaciones</label>
  <input type="text" placeholder="Novedades del viaje..." value={observaciones}
    onChange={e=>setObservaciones(e.target.value)} style={styles.input}/>
</div>
        {!tieneRetorno ? (
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Km cargado</label>
            <input type="number" placeholder="300" value={kmCargado} onChange={e=>setKmCargado(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Km vacío</label>
            <input type="number" placeholder="100" value={kmVacio} onChange={e=>setKmVacio(e.target.value)} style={styles.input} />
          </div>
        </div>
        ) : (
        <div>
          <div style={styles.fila2}>
            <div style={styles.campo}>
              <label style={styles.label}>Km cargado ida</label>
              <input type="number" placeholder="450" value={kmCargado} onChange={e=>setKmCargado(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Km vacío ida</label>
              <input type="number" placeholder="120" value={kmVacio} onChange={e=>setKmVacio(e.target.value)} style={styles.input} />
            </div>
          </div>
          <div style={styles.fila2}>
            <div style={styles.campo}>
              <label style={styles.label}>Km cargado retorno</label>
              <input type="number" placeholder="380" value={kmCargadoRet} onChange={e=>setKmCargadoRet(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Km vacío retorno</label>
              <input type="number" placeholder="60" value={kmVacioRet} onChange={e=>setKmVacioRet(e.target.value)} style={styles.input} />
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",marginBottom:"10px",fontSize:t.fonts.sizeXs,color:t.colors.textTertiary}}>
            <span>Cargado: {kmCargTotal.toLocaleString("es-CO")} km</span>
            <span>Vacío: {kmVacTotal.toLocaleString("es-CO")} km</span>
            <span style={{fontWeight:t.fonts.weightBold,color:t.colors.textPrimary}}>Total: {kmTotal.toLocaleString("es-CO")} km</span>
          </div>
        </div>
        )}

        {/* MODO DE FLETE */}
<div style={styles.campo}>
  <label style={styles.label}>Modo de pago del flete</label>
  <select
    value={modoFlete}
    onChange={e => setModoFlete(e.target.value)}
    style={styles.input}
  >
    <option value="porTon">Variable ($/ton)</option>
    <option value="porViaje">Fijo ($/Viaje)</option>
  </select>
</div>

<div style={styles.fila2}>
  <div style={styles.campo}>
    <label style={styles.label}>Toneladas</label>
    <input
      type="number"
      placeholder="33.5"
      step="0.01"
      value={tonelaje}
      onChange={e => setTonelaje(e.target.value)}
      style={styles.input}
    />
  </div>
  {modoFlete === "porTon" ? (
    <div style={styles.campo}>
      <label style={styles.label}>Flete ($/ton)</label>
      <input
        type="number"
        placeholder="80000"
        value={fleteTon}
        onChange={e => setFleteTon(e.target.value)}
        style={styles.input}
      />
    </div>
  ) : (
    <div style={styles.campo}>
      <label style={styles.label}>Valor del viaje ($)</label>
      <input
        type="number"
        placeholder="2500000"
        value={fleteTon}
        onChange={e => setFleteTon(e.target.value)}
        style={styles.input}
      />
    </div>
  )}
    </div>

    {/* VALOR VIAJE */}
        {valorViaje > 0 && (
          <div>
            {/* ... aquí queda tu alerta de "¿Seguro que es $/ton?" si la tienes ... */}
            {(() => {
              const valorIda = modoFlete === "porTon" ? n(tonelaje) * n(fleteTon) : n(fleteTon);
              const valorRet = valorViaje - valorIda;
              if (!tieneRetorno || valorRet <= 0) {
                // Sin retorno: como siempre
                return (
                  <div style={styles.valorViajeBox}>
                    <span style={styles.valorViajeLabel}>
                      {modoFlete === "porTon" && n(fleteTon) > 200000 && (
              <div style={{padding:"8px 12px",background:"#FEF3C7",border:"1.5px solid #F59E0B33",borderRadius:t.radius.sm,marginBottom:"6px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"16px"}}>⚠️</span>
                <div>
                  <p style={{fontSize:t.fonts.sizeXs,color:"#92400E",fontWeight:t.fonts.weightBold,margin:0}}>¿Seguro que es $/ton?</p>
                  <p style={{fontSize:t.fonts.sizeXs,color:"#92400E",margin:"2px 0 0"}}>
                    El flete por tonelada normalmente es entre $40.000 y $200.000/ton. Si el valor es el total del viaje, cambie a modo "Fijo ($/Viaje)".
                  </p>
                </div>
              </div>
            )}
                    </span>
                    <span style={styles.valorViajeNum}>{fmt(valorViaje)}</span>
                  </div>
                );
              }
              // Con retorno: desglose ida + retorno = total
              return (
                <div style={styles.valorViajeBox}>
                  <div style={{width:"100%"}}>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
                      <span style={styles.valorViajeLabel}>Ida </span>
                      <span style={{...styles.valorViajeLabel, fontWeight:700, color:t.colors.textPrimary}}>{fmt(valorIda)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
                      <span style={styles.valorViajeLabel}>Retorno</span>
                      <span style={{...styles.valorViajeLabel, fontWeight:700, color:t.colors.textPrimary}}>{fmt(valorRet)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0 0",marginTop:"2px",borderTop:`1px solid ${t.colors.borderLight}`}}>
                      <span style={{...styles.valorViajeLabel, fontWeight:700}}>Total viaje</span>
                      <span style={styles.valorViajeNum}>{fmt(valorViaje)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

  
        {/* RETORNO */}
      <div style={{marginTop:"10px"}}>
      <div style={{display:"flex", alignItems:"center", gap:"10px", cursor:"pointer"}} onClick={()=>setTieneRetorno(!tieneRetorno)}>
      <div style={{width:"42px",height:"24px",borderRadius:"12px",background:tieneRetorno?t.colors.blue:"#1E3A5F",position:"relative",transition:"background 0.2s",flexShrink:0}}>
        <div style={{width:"20px",height:"20px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:tieneRetorno?"20px":"2px",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}} />
      </div>
        <label style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightMedium, color:t.colors.textPrimary, cursor:"pointer"}}>
        ¿Regresa con carga? (flete de retorno)
        </label>
      </div>

        {tieneRetorno && (
        <div style={{marginTop:"12px", padding:"12px", background:t.colors.bgSection, borderRadius:t.radius.md}}>

        <div style={styles.campo}>
          <label style={styles.label}>Ruta retorno (Origen → Destino)</label>
          <input type="text" placeholder="Cali – Barranquilla" value={rutaRet}
            onChange={e=>setRutaRet(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha cargue retorno</label>
            <input type="date" value={fechaCargueRet} onChange={e=>setFechaCargueRet(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha descargue retorno</label>
            <input type="date" value={fechaDescargueRet} onChange={e=>setFechaDescargueRet(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Lugar de cargue</label>
            <input type="text" placeholder="Bodega, puerto..." value={lugarCargueRet}
              onChange={e=>setLugarCargueRet(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Lugar de descargue</label>
            <input type="text" placeholder="Planta, bodega..." value={lugarDescargueRet}
              onChange={e=>setLugarDescargueRet(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de carga</label>
            <select value={tipoCargaRet} onChange={e=>setTipoCargaRet(e.target.value)} style={styles.input}>
              <option value="">Seleccionar...</option>
              <option>Granel sólido</option>
              <option>Granel líquido</option>
              <option>Carga general</option>
              <option>Contenedor cargado</option>
              <option>Contenedor vacío</option>
              <option>Carga refrigerada</option>
              <option>Sin carga</option>
              <option>Carga peligrosa</option>
              <option>Carga sobredimensionada</option>
              <option>Ganado</option>
              <option>Vehículos</option>
            </select>
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Producto</label>
            <input type="text" placeholder="Carbón, arroz..." value={productoRet}
              onChange={e=>setProductoRet(e.target.value)} style={styles.input} />
          </div>
        </div>

        
          <div style={styles.campo}>
            <label style={styles.label}>Empresa</label>
            <input type="text" placeholder="Nombre empresa" value={empresaRet}
              onChange={e=>setempresaRet(e.target.value)} style={styles.input} />
          </div>
          
        

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Manifiesto</label>
            <input type="text" placeholder="MAN-001" value={maniRet}
              onChange={e=>setManiRet(e.target.value)} style={styles.input} />
          </div>

        <div style={styles.campo}>
            <label style={styles.label}>N° Remesa</label>
            <input type="text" placeholder="REM-001" value={remesaRet}
              onChange={e=>setRemesaRet(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.campo}>
          <label style={styles.label}>Peso báscula (ton)</label>
          <input type="number" placeholder="34.5" value={pesoBasRet}
            onChange={e=>setPesoBasRet(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.campo}>
        <label style={styles.label}>Modo de pago retorno</label>
        <select
          value={modoFleteRetorno}
          onChange={e=>setModoFleteRetorno(e.target.value)}
          style={styles.input}
        >
          <option value="porTon">Variable ($/ton)</option>
          <option value="porViaje">Fijo ($/Viaje)</option>
          </select>
        </div>
          <div style={styles.fila2}>
          <div style={styles.campo}>
          <label style={styles.label}>Toneladas retorno</label>
          <input type="number" placeholder="30" step="0.01" value={tonelajeRetorno}
            onChange={e=>setTonelajeRetorno(e.target.value)} style={styles.input} />
        </div>
        {modoFleteRetorno === "porTon" ? (
          <div style={styles.campo}>
            <label style={styles.label}>Flete retorno ($/ton)</label>
            <input type="number" placeholder="60000" value={fleteRetorno}
              onChange={e=>setFleteRetorno(e.target.value)} style={styles.input} />
          </div>
        ) : (
          <div style={styles.campo}>
            <label style={styles.label}>Valor retorno ($)</label>
            <input type="number" placeholder="1500000" value={fleteRetorno}
              onChange={e=>setFleteRetorno(e.target.value)} style={styles.input} />
          </div>
        )}
      </div>
      {valorViajeRetorno > 0 && (
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px", borderTop:`1px solid ${t.colors.border}`}}>
          <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>Flete retorno</span>
          <span style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.blue}}>{fmt(valorViajeRetorno)}</span>
        </div>
      )}
    </div>
  )}
</div>

      </div>)}

      {/* ── COMBUSTIBLE ── */}
      <div style={styles.seccionHeader} onClick={()=>setSecComb(!secComb)}>
        <span style={styles.seccionLabel}>Combustible / Adblue</span>
        {secComb ? <ChevronUp size={16} color={t.colors.textTertiary}/> : <ChevronDown size={16} color={t.colors.textTertiary}/>}
      </div>
      {secComb && (<div style={{padding:"0 20px"}}>
      <div style={styles.card}>
        <div style={styles.campo}>
          <label style={styles.label}>Modo de cálculo</label>
          <select value={modoComb} onChange={e=>setModoComb(e.target.value)} style={styles.input}>
            <option value="auto">Rendimiento (Km/Gal)</option>
            <option value="manual">Consumo total (Gal/viaje)</option>
          </select>
        </div>
        {modoComb === "auto" ? (
          <div style={styles.fila2}>
            <div style={styles.campo}>
              <label style={styles.label}>Cargado (Km/Gal)</label>
              <input type="number" placeholder="7" step="0.1" value={rendCargado} onChange={e=>setRendCargado(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Vacío (Km/Gal)</label>
              <input type="number" placeholder="11" step="0.1" value={rendVacio} onChange={e=>setRendVacio(e.target.value)} style={styles.input} />
            </div>
          </div>
        ) : (
          <div style={styles.campo}>
            <label style={styles.label}>Total galones</label>
            <input type="number" placeholder="120" value={galManual} onChange={e=>setGalManual(e.target.value)} style={styles.input} />
          </div>
        )}
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Precio ACPM ($/gal)</label>
            <input type="number" placeholder="10500" value={precioAcpm} onChange={e=>setPrecioAcpm(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Precio Adblue ($/lt)</label>
            <input type="number" placeholder="3500" value={precioAdblue} onChange={e=>setPrecioAdblue(e.target.value)} style={styles.input} />
          </div>
        </div>
        {galTotal > 0 && (
          <div style={styles.resumenBox}>
            {modoComb === "auto" && <>
              <div style={styles.resumenFila}><span style={styles.resumenL}>Galones cargado</span><span style={styles.resumenV}>{fnD(galCarg,2)} gal</span></div>
              <div style={styles.resumenFila}><span style={styles.resumenL}>Galones vacío</span><span style={styles.resumenV}>{fnD(galVac,2)} gal</span></div>
            </>}
            <div style={styles.resumenFila}><span style={styles.resumenL}>Total ACPM</span><span style={styles.resumenV}>{fnD(galTotal,2)} gal</span></div>
            <div style={styles.resumenFila}><span style={styles.resumenL}>Adblue ({(adblueRatio*100).toFixed(1)}%)</span><span style={styles.resumenV}>{fnD(adblLt,2)} lt</span></div>
            <div style={{...styles.resumenFila, borderBottom:"none", paddingTop:"8px"}}>
              <span style={{...styles.resumenL, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary}}>Combustible + Adblue</span>
              <span style={{...styles.resumenV, color: t.colors.red, fontWeight: t.fonts.weightBold}}>{fmt(costoComb)}</span>
            </div>
          </div>
        )}
      </div>

      </div>)}

      {/* ── PEAJES ── */}
      <div style={styles.seccionHeader} onClick={()=>setSecPeajes(!secPeajes)}>
        <span style={styles.seccionLabel}>Peajes de ruta</span>
        {secPeajes ? <ChevronUp size={16} color={t.colors.textTertiary}/> : <ChevronDown size={16} color={t.colors.textTertiary}/>}
      </div>
      {secPeajes && (<div style={{padding:"0 20px"}}>
      <div style={styles.card}>
        <div style={styles.campo}>
          <label style={styles.label}>Categoría del vehículo</label>
          <select value={categoria} onChange={e=>setCategoria(e.target.value)} style={styles.input}>
            <option value="I">Automoviles, Camperos, Camionetas (Cat I)</option>
            <option value="II">Buses y Busetas (Cat II)</option>
            <option value="III">Camiones 2 ejes pequeño(Cat III)</option>
            <option value="IV">Camión 2 ejes grandes (Cat IV)</option>
            <option value="V">Camiones 3-4 ejes (Cat V)</option>
            <option value="VI">Camiones 5 ejes (Cat VI)</option>
            <option value="VII">Camiones 6 ejes (Cat VII)</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Buscar peaje por nombre o departamento..."
          value={busquedaP}
          onChange={e=>setBusquedaP(e.target.value)}
          style={{...styles.input, marginBottom:"8px"}}
        />
        <div style={styles.filaAgregar}>
          <select value={selP} onChange={e=>setSelP(e.target.value)}
            style={{...styles.input, flex:1, marginBottom:0}}>
            <option value="">Seleccionar peaje...</option>
            {peajesFiltrados.map(p=>(
              <option key={p.c} value={p.c}>
                {p.n} ({p.d}) — ${(obtenerTarifa(p, categoria)).toLocaleString("es-CO")}
              </option>
            ))}
          </select>
          <button style={styles.btnAgregarP} onClick={agregarPeaje}>
            <Plus size={16} color="#fff" strokeWidth={2.5} />
          </button>
        </div>

        {/* SUGERENCIA DE PEAJES */}
        {sugerenciaPeajes && peajesRuta.length === 0 && (
          <div style={{padding:"10px 12px",background:t.colors.greenSoft,border:`1.5px solid ${t.colors.greenBorder}`,borderRadius:t.radius.md,marginBottom:"10px"}}>
            <p style={{fontSize:t.fonts.sizeXs,color:t.colors.green,fontWeight:t.fonts.weightBold,margin:"0 0 4px"}}>
              Esta ruta ya la ha hecho antes
            </p>
            <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"0 0 8px"}}>
              Usó {sugerenciaPeajes.cantidad} peajes por {fmt(sugerenciaPeajes.total)} — ¿Agregarlos?
            </p>
            <div style={{display:"flex",gap:"8px"}}>
              <button
                style={{flex:1,padding:"9px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,cursor:"pointer"}}
                onClick={aplicarPeajesSugeridos}
              >
                ✓ Sí, cargar peajes
              </button>
              <button
                style={{padding:"9px 14px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,cursor:"pointer"}}
                onClick={()=>{setSugerenciaPeajes(null); setSugerenciaAplicada(true);}}
              >
                No
              </button>
            </div>
          </div>
        )}

        {peajesRuta.length > 0 && (
          <div style={styles.peajesTags}>
            {peajesRuta.map(p=>{
              const tarifa = obtenerTarifa(p, categoria);
              const total  = tarifa*(p.iv?2:1);
              return (
                <div key={p.c} style={styles.peajeTag}>
                  <span style={styles.peajeTagNom}>{p.n} — {fmt(total)}</span>
                  <button
                    style={{...styles.peajeTagBtn, background: p.iv ? t.colors.greenSoft : t.colors.blueSoft, color: p.iv ? t.colors.green : t.colors.blue}}
                    onClick={()=>toggleIV(p.c)}
                  >
                    {p.iv ? "Ida y vuelta" : "Ida"}
                  </button>
                  <button style={styles.peajeTagDel} onClick={()=>quitarP(p.c)}>
                    <X size={12} color={t.colors.red} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.totalPeajesRow}>
          <span style={styles.totalPeajesL}>Total peajes</span>
          <span style={styles.totalPeajesV}>{fmt(totPeajes)}</span>
        </div>
      </div>

      </div>)}

      {/* ── COSTOS ── */}
      <div style={styles.seccionHeader} onClick={()=>setSecCostos(!secCostos)}>
        <span style={styles.seccionLabel}>Costos del viaje</span>
        {secCostos ? <ChevronUp size={16} color={t.colors.textTertiary}/> : <ChevronDown size={16} color={t.colors.textTertiary}/>}
      </div>
      {secCostos && (<div style={{padding:"0 20px"}}>
      <div style={styles.card}>
        <div style={styles.campo}>
  <label style={styles.label}>Modo de pago conductor</label>
  <select
    value={modoConductor}
    onChange={e => {
      setModoConductor(e.target.value);
      setPorcCond("");
    }}
    style={styles.input}
  >
    <option value="porcentaje">Porcentaje del viaje (%)</option>
    <option value="fijo">Valor fijo ($)</option>
  </select>
</div>

<div style={styles.fila2}>
  <div style={styles.campo}>
    {modoConductor === "porcentaje" ? (
      <>
        <label style={styles.label}>% Conductor</label>
        <input type="number" placeholder="10" value={porcCond}
          onChange={e=>setPorcCond(e.target.value)} style={styles.input} />
      </>
    ) : (
      <>
        <label style={styles.label}>Valor conductor ($)</label>
        <input type="number" placeholder="200000" value={porcCond}
          onChange={e=>setPorcCond(e.target.value)} style={styles.input} />
      </>
    )}
  </div>
  <div style={styles.campo}>
    <label style={styles.label}>Carpado/Descarpado</label>
    <input type="number" placeholder="20000" value={carpado}
      onChange={e=>setCarpado(e.target.value)} style={styles.input} />
  </div>
</div>
        <div style={styles.campo}>
          <label style={styles.label}>Gastos de viaje</label>
          <input type="number" placeholder="30000" value={gastosViaje} onChange={e=>setGastosViaje(e.target.value)} style={styles.input} />
        </div>

        {extras.map((e,i)=>(
          <div key={i} style={styles.extraFila}>
            <span style={{fontSize: t.fonts.sizeSm, color: t.colors.textSecondary}}>{e.n}</span>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <span style={{fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold}}>{fmt(e.valor)}</span>
              <button style={{background:"none",border:"none",cursor:"pointer",padding:"2px"}} onClick={()=>setExtras(extras.filter((_,j)=>j!==i))}>
                <X size={14} color={t.colors.red} />
              </button>
            </div>
          </div>
        ))}

        <div style={styles.fila2}>
          <input type="text" placeholder="Nombre del costo" value={nuevoNom}
            onChange={e=>setNuevoNom(e.target.value)}
            style={{...styles.input, marginBottom:0}} />
          <input type="number" placeholder="Valor" value={nuevoVal}
            onChange={e=>setNuevoVal(e.target.value)}
            style={{...styles.input, marginBottom:0}} />
        </div>
        <button style={styles.btnAgregarExtra} onClick={agregarExtra}>
          <Plus size={14} color={t.colors.blue} strokeWidth={2.5} />
          Agregar costo
        </button>
      </div>

      </div>)}

      {/* ── DESCUENTOS DE LEY ── */}
<div style={styles.seccionHeader} onClick={()=>setSecDesc(!secDesc)}>
  <span style={styles.seccionLabel}>Descuentos de ley</span>
  {secDesc ? <ChevronUp size={16} color={t.colors.textTertiary}/> : <ChevronDown size={16} color={t.colors.textTertiary}/>}
</div>
{secDesc && (<div style={{padding:"0 20px"}}>
<div style={styles.card}>
  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"0 0 14px"}}>
    Activa los descuentos que aplique la empresa sobre el valor del viaje.
  </p>

  {[
    {
      id:"retefuente", label:"Retención en la fuente", sub:"Sobre valor del viaje",
      activo:descRetefuente, setActivo:setDescRetefuente,
      pct:pctRetefuente,     setPct:setPctRetefuente,
      val:valRetefuente,
    },
    {
      id:"reteica", label:"Reteica", sub:"Varía por municipio",
      activo:descReteica, setActivo:setDescReteica,
      pct:pctReteica,     setPct:setPctReteica,
      val:valReteica,
    },
    {
      id:"fopat", label:"FOPAT", sub:"Fondo de protección al transportador",
      activo:descFopat, setActivo:setDescFopat,
      pct:pctFopat,     setPct:setPctFopat,
      val:valFopat,
    },
  ].map((d,i,arr)=>(
    <div key={d.id} style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"10px 0",
      borderBottom: i===arr.length-1 ? "none" : `1px solid ${t.colors.borderLight}`,
    }}>
      <div style={{display:"flex", alignItems:"center", gap:"10px", cursor:"pointer"}} onClick={()=>d.setActivo(!d.activo)}>
        <div style={{width:"36px",height:"20px",borderRadius:"10px",background:d.activo?t.colors.blue:"#1E3A5F",position:"relative",transition:"background 0.2s",flexShrink:0}}>
          <div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:d.activo?"18px":"2px",transition:"left 0.2s",boxShadow:"0 1px 2px rgba(0,0,0,0.3)"}} />
        </div>
        <div>
          <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>{d.label}</p>
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"2px 0 0"}}>{d.sub}</p>
        </div>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
        <input
          type="number" value={d.pct} min="0" max="100" step="0.001"
          onChange={e=>d.setPct(parseFloat(e.target.value)||0)}
          style={{...styles.input, width:"60px", textAlign:"right", marginBottom:0, padding:"6px 8px"}}
        />
        <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>%</span>
        <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.red, minWidth:"80px", textAlign:"right"}}>
          {d.activo && d.val>0 ? fmt(d.val) : "—"}
        </span>
      </div>
    </div>
  ))}

  {/* OTRO */}
  <div style={{borderTop:`1px solid ${t.colors.borderLight}`, paddingTop:"10px", marginTop:"4px"}}>
    <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px", cursor:"pointer"}} onClick={()=>setDescOtro(!descOtro)}>
      <div style={{width:"36px",height:"20px",borderRadius:"10px",background:descOtro?t.colors.blue:"#1E3A5F",position:"relative",transition:"background 0.2s",flexShrink:0}}>
        <div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:descOtro?"18px":"2px",transition:"left 0.2s",boxShadow:"0 1px 2px rgba(0,0,0,0.3)"}} />
      </div>
      <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>Otro descuento</p>
    </div>
    {descOtro && (
      <div style={styles.fila2}>
        <div style={styles.campo}>
          <label style={styles.label}>Nombre</label>
          <input
            type="text" placeholder="Ej: Pronto pago"
            value={nombreOtro} onChange={e=>setNombreOtro(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.campo}>
          <label style={styles.label}>Porcentaje (%)</label>
          <input
            type="number" placeholder="0" value={pctOtro} min="0" max="100" step="0.1"
            onChange={e=>setPctOtro(parseFloat(e.target.value)||0)}
            style={styles.input}
          />
        </div>
      </div>
    )}
    {descOtro && valOtro>0 && (
      <div style={{display:"flex", justifyContent:"space-between", marginTop:"4px"}}>
        <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>{nombreOtro||"Otro"}</span>
        <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.red}}>{fmt(valOtro)}</span>
      </div>
    )}
  </div>

  {/* TOTAL DESCUENTOS */}
  {totalDesc > 0 && (
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${t.colors.border}`, paddingTop:"10px", marginTop:"8px"}}>
      <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary}}>Total descuentos</span>
      <span style={{fontSize:t.fonts.sizeLg, fontWeight:t.fonts.weightBold, color:t.colors.red}}>{fmt(totalDesc)}</span>
    </div>
  )}
</div>  

      </div>)}

      {/* ── RESULTADO ── */}
      <div style={{...styles.seccionHeader, cursor:"default"}}>
        <span style={styles.seccionLabel}>Resultado del viaje</span>
      </div>
      <div style={styles.card}>
        <div style={styles.fila2}>
          <div style={styles.metCard}>
            <p style={styles.metLabel}>Total viaje</p>
            <p style={{...styles.metVal, color: t.colors.blue}}>{valorViaje>0?fmt(valorViaje):"$—"}</p>
          </div>
          <div style={styles.metCard}>
            <p style={styles.metLabel}>Total gastos</p>
            <p style={{...styles.metVal, color: t.colors.red}}>{totalGastos>0?fmt(totalGastos):"$—"}</p>
          </div>
        </div>

        {/* GANANCIA — protagonista */}
        <div style={{
          ...styles.gananciaResultBox,
          background: gananciaNeta >= 0 ? t.colors.greenSoft : t.colors.redSoft,
          borderColor: gananciaNeta >= 0 ? t.colors.greenBorder : t.colors.redBorder,
        }}>
          <p style={styles.gananciaResultLabel}>Ganancia neta</p>
          <p style={{...styles.gananciaResultVal, color: gananciaNeta>=0?t.colors.green:t.colors.red}}>
            {valorViaje>0?fmt(gananciaNeta):"$—"}
          </p>
        </div>

        {valorViaje > 0 && <>
          {[
            {l:`ACPM (${fnD(galTotal,1)} gal)`,  v: costoAcpm},
            {l:`Adblue (${fnD(adblLt,1)} lt)`,   v: costoAdbl},
            {l:"Peajes",                          v: totPeajes},
            {l: modoConductor === "porcentaje" ?  "Conductor (" + n(porcCond) + "%)" : "Conductor (valor fijo)", v: costoConduct},
            {l:"Carpado/Descarpado",              v: n(carpado)},
            {l:"Gastos de viaje",                 v: n(gastosViaje)},
            {l:"Otros gastos",                    v: totExtras},
            {l:"Descuentos de ley",               v: totalDesc},
          ].filter(r=>r.v>0).map(r=>(
            <div key={r.l} style={styles.desgloseFila}>
              <span style={styles.desgloseL}>{r.l}</span>
              <span style={styles.desgloseV}>{fmt(r.v)}</span>
            </div>
          ))}
          <div style={styles.desgloseFila}><span style={styles.desgloseL}>Recorrido total</span><span style={styles.desgloseV}>{kmTotal>0?kmTotal.toLocaleString("es-CO")+" km":"—"}</span></div>
          <div style={styles.desgloseFila}><span style={styles.desgloseL}>Costo/km</span><span style={styles.desgloseV}>{kmTotal>0?fmt(cxkm)+"/km":"—"}</span></div>
          <div style={{...styles.desgloseFila, borderBottom:"none"}}>
            <span style={styles.desgloseL}>Margen neto</span>
            <span style={{...styles.desgloseV, color: margenColor, fontWeight: t.fonts.weightBold}}>{margen.toFixed(1)}%</span>
          </div>
          <div style={styles.barraFondo}>
            <div style={{...styles.barraRelleno, width:`${Math.min(Math.max(margen,0),100)}%`, background: margenColor}} />
          </div>
        </>}

        {/* GUARDAR RUTA */}
        <div style={{borderTop:`1px solid ${t.colors.borderLight}`, paddingTop:"10px", marginBottom:"12px"}}>
          {!mostrarGuardar ? (
            <button
              style={{width:"100%", padding:"9px", background:"none", border:`1.5px dashed ${t.colors.blueBorder}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.blue, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", fontWeight:t.fonts.weightSemibold}}
              onClick={()=>setMostrarGuardar(true)}
            >+ Guardar como ruta frecuente</button>
          ) : (
            <div>
              <div style={styles.campo}>
                <label style={styles.label}>Nombre de la ruta</label>
                <input type="text" placeholder="Ej: Barranquilla - Bogotá" value={nombreRuta} onChange={e=>setNombreRuta(e.target.value)} style={styles.input} />
              </div>
              <div style={{display:"flex", gap:"8px"}}>
                <button style={{flex:1, padding:"10px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", opacity:guardandoRuta?0.75:1}} onClick={guardarRutaFrecuente} disabled={guardandoRuta}>
                  {guardandoRuta?"Guardando...":"Guardar ruta"}
                </button>
                <button style={{padding:"10px 14px", background:"none", border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, cursor:"pointer"}} onClick={()=>{setMostrarGuardar(false);setNombreRuta("");}}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          style={{...styles.btnGuardar, opacity: guardando?0.75:1}}
          onClick={guardarViaje}
          disabled={guardando}
        >
          <Save size={18} color="#fff" strokeWidth={2} />
          {guardando ? "Guardando..." : "Guardar viaje"}
        </button>
      </div>

    </div>
  );
}

const styles = {
  pantalla:         { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:           { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:        { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:           { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  seccionLabel:     { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", padding:"0" },
  seccionHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px 8px", cursor:"pointer" },
  card:             { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", margin:"0 16px 4px", boxShadow:t.shadows.card },
  campo:            { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"10px" },
  fila2:            { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  label:            { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:            { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
  valorViajeBox:    { display:"flex", justifyContent:"space-between", alignItems:"center", background:t.colors.bgCard, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md, padding:"12px 14px", marginTop:"4px" },
  valorViajeLabel:  { fontSize:t.fonts.sizeSm, color:t.colors.blue, fontWeight:t.fonts.weightMedium },
  valorViajeNum:    { fontSize:"20px", fontWeight:t.fonts.weightBlack, color:t.colors.blue },
  resumenBox:       { background:t.colors.bgSection, borderRadius:t.radius.sm, padding:"10px 12px", marginTop:"8px" },
  resumenFila:      { display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeXs, padding:"4px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  resumenL:         { color:t.colors.textSecondary },
  resumenV:         { fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  filaAgregar:      { display:"flex", gap:"8px", alignItems:"center", marginBottom:"10px" },
  btnAgregarP:      { padding:"11px 14px", background:t.colors.blue, border:"none", borderRadius:t.radius.sm, cursor:"pointer", flexShrink:0 },
  peajesTags:       { display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"10px" },
  peajeTag:         { display:"inline-flex", alignItems:"center", background:t.colors.bgSection, border:`1px solid ${t.colors.border}`, borderRadius:t.radius.full, overflow:"hidden", fontSize:t.fonts.sizeXs },
  peajeTagNom:      { padding:"5px 10px", color:t.colors.textPrimary, fontWeight:t.fonts.weightMedium },
  peajeTagBtn:      { padding:"5px 8px", border:"none", borderLeft:`1px solid ${t.colors.border}`, cursor:"pointer", fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold },
  peajeTagDel:      { padding:"5px 8px", background:"none", border:"none", borderLeft:`1px solid ${t.colors.border}`, cursor:"pointer", display:"flex", alignItems:"center" },
  totalPeajesRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px" },
  totalPeajesL:     { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary },
  totalPeajesV:     { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary },
  extraFila:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  btnAgregarExtra:  { display:"flex", alignItems:"center", gap:"6px", width:"100%", padding:"10px", background:"none", border:`1.5px dashed ${t.colors.blueBorder}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.blue, cursor:"pointer", justifyContent:"center", marginTop:"8px", fontWeight:t.fonts.weightSemibold },
  metCard:          { background:t.colors.bgSection, borderRadius:t.radius.sm, padding:"12px", marginBottom:"10px" },
  metLabel:         { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.05em" },
  metVal:           { fontSize:"17px", fontWeight:t.fonts.weightBold, margin:0 },
  gananciaResultBox:{ borderRadius:t.radius.md, padding:"16px", border:"1.5px solid", marginBottom:"14px", textAlign:"center" },
  gananciaResultLabel:{ fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, textTransform:"uppercase", letterSpacing:"0.08em", color:t.colors.textSecondary, margin:"0 0 6px" },
  gananciaResultVal:{ fontSize:"32px", fontWeight:t.fonts.weightBlack, margin:0, letterSpacing:"-0.5px" },
  desgloseFila:     { display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeSm, padding:"7px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  desgloseL:        { color:t.colors.textSecondary },
  desgloseV:        { fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  barraFondo:       { height:"6px", borderRadius:"3px", background:t.colors.bgSection, overflow:"hidden", margin:"10px 0 14px" },
  barraRelleno:     { height:"100%", borderRadius:"3px", transition:"width 0.4s ease" },
  btnGuardar:       { width:"100%", padding:"15px", background:t.colors.green, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" },
};


// v2 - fix conductor
export default Calculadora;