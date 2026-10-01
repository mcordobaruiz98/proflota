/**
 * Hecho por JESUS COSSIO DEV
 * FE-08: Borrador persistente + beforeunload | FE-41: Targets táctiles | FE-44: Tuteo guiado
 * FE-WIZARD: Máximo 3 campos por pantalla, fondo claro, opciones en tarjetas
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Plus, X, ChevronDown, ChevronUp, MapPin, Lightbulb, AlertTriangle, Check, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { theme as t } from "../styles/theme";
import { sanitizar, validarNumero } from "../utils/validar";
import { alPulsarEnterOEspacio } from "../utils/teclado";
import { CIUDADES_COLOMBIA, obtenerListaProductos, guardarProductoPersonalizado } from "../data/colombiaData";
import {
  WizardPantalla, WizardHeader, WizardProgress, WizardBanner,
  WizardCampo, WizardInput, WizardSelect, WizardOpciones,
  WizardCard, WizardNav, WizardStepDots,
} from "../components/WizardForm";

const BORRADOR_KEY = "navira_borrador_calculadora";

const DEFAULT_ADBLUE = 0.18925;

function Calculadora({ vehiculos, viajes, rutas = [], peajes = [], conductores = [], empresas = [], onGuardar, onGuardarRuta, onEliminarRuta, onEditarVehiculo, onAgregarEmpresa, mostrarToast }) {
  const guardandoRef = useRef(false);
  const guardandoRutaRef = useRef(false);

  // Memoizar ordenamiento de peajes (FE-46 por JESUS COSSIO DEV)
  const PEAJES_CO = useMemo(() => {
    return peajes.length > 0
      ? [...peajes].sort((a, b) => (a.n || "").localeCompare(b.n || "", "es"))
      : [];
  }, [peajes]);
  const navigate = useNavigate();
  const location = useLocation();

  // ── FE-08: Borrador guardado (leído una sola vez, antes de los estados) ───────
  // Antes se restauraba con un useEffect que llamaba a 21 setState al montar.
  // Eso provocaba un segundo render en cascada y eslint-plugin-react-hooks lo
  // marcaba (set-state-in-effect). Se lee aquí de forma lazy y cada estado toma
  // su valor inicial del borrador, así no hay flash de formulario vacío.
  const [borrador] = useState(() => {
    try {
      const raw = localStorage.getItem(BORRADOR_KEY);
      if (!raw) return null;
      const b = JSON.parse(raw);
      return b && typeof b === "object" ? b : null;
    } catch {
      return null;
    }
  });
const valBorrador = (campo, porDefecto) => {
    const v = borrador?.[campo];
    return v === undefined || v === null || v === "" ? porDefecto : v;
  };

  // Datos que llegan desde la Cotización rápida (Cotizador → "Crear viaje completo
  // con estos datos"). Tienen prioridad sobre el borrador: el usuario pidió crear el
  // viaje con esos datos, así que un borrador viejo no debe pisarlos.
  const [precarga] = useState(() =>
    location.state && typeof location.state === "object" ? location.state : null,
  );
  const valorInicial = (campo, porDefecto) => {
    const v = precarga?.[campo];
    if (v !== undefined && v !== null && v !== "") return v;
    return valBorrador(campo, porDefecto);
  };
  const SEPARADOR_RUTA = " → ";
  const componerRuta = (o, d) => (o && d ? `${o}${SEPARADOR_RUTA}${d}` : (o || d || ""));
  // Rutas guardadas o en borrador con el separador antiguo ("-") se normalizan al
  // actual, para que el resumen y la lista se vean igual sin editar los datos.
  const normalizarRuta = (v) => String(v || "").replace(/\s+-\s+/g, SEPARADOR_RUTA).trim();

  const [fecha,            setFecha]              = useState(() => valBorrador("fecha", new Date().toISOString().slice(0,10)));
  const [fechaDescarga,    setFechaDescarga]      = useState("");
  const [mani,             setMani]               = useState("");
  const [remesa,           setRemesa]             = useState("");
  const [pesoBascula,      setPesoBascula]        = useState("");
  const [lugarCargue,      setLugarCargue]        = useState("");
  const [lugarDescargue,   setLugarDescargue]     = useState("");
  const [observaciones,    setObservaciones]      = useState("");
  const [placa,            setPlaca]              = useState(valorInicial("placa", ""));
  const [tipoCarga,        setTipoCarga]          = useState(valBorrador("tipoCarga", ""));
  const [producto,         setProducto]           = useState(valBorrador("producto", ""));
  const [origen,           setOrigen]             = useState(valorInicial("origen", ""));
  const [destino,          setDestino]            = useState(valorInicial("destino", ""));
  // La ruta se compone desde origen/destino para que el resumen la muestre y el
  // guardado no se bloquee cuando los datos vienen precargados (Cotizador) sin
  // pasar por los manejadores de los campos. Mismo formato que los manejadores.
  const [ruta,             setRuta]               = useState(() => {
    const rutaPrecargada = componerRuta(valorInicial("origen", ""), valorInicial("destino", ""));
    return rutaPrecargada || normalizarRuta(valBorrador("ruta", ""));
  });
  const [empresa,          setEmpresa]            = useState(valBorrador("empresa", ""));
  const [nitEmpresa,       setNitEmpresa]         = useState(valBorrador("nitEmpresa", ""));
  const [conductor,        setConductor]          = useState(valBorrador("conductor", ""));
  const [listaProductos,   setListaProductos]     = useState(obtenerListaProductos);
  const [modoOtroProd,     setModoOtroProd]       = useState(false);
  const [otroProdTexto,    setOtroProdTexto]      = useState("");
  const [kmCargado,        setKmCargado]          = useState(valorInicial("kmCargado", ""));
  const [kmVacio,          setKmVacio]            = useState(valorInicial("kmVacio", ""));
  const [kmCargadoRet,     setKmCargadoRet]       = useState("");
  const [kmVacioRet,       setKmVacioRet]         = useState("");
  const [tonelaje,         setTonelaje]           = useState(valorInicial("tonelaje", ""));
  const [fleteTon,         setFleteTon]           = useState(valorInicial("fleteTon", ""));
  const [modoComb,         setModoComb]           = useState("auto");
  const [rendCargado,      setRendCargado]        = useState(valorInicial("rendCargado", ""));
  const [rendVacio,        setRendVacio]          = useState(valorInicial("rendVacio", ""));
  const [galManual,        setGalManual]          = useState("");
  const ultimoViaje = viajes.length > 0 ? viajes[0] : null;
  const [precioAcpm,       setPrecioAcpm]         = useState(() => {
    const recibido = valorInicial("precioAcpm", null);
    if (recibido !== null) return recibido;
    if (ultimoViaje && ultimoViaje.gTot > 0) return Math.round((ultimoViaje.cAcpm || 0) / ultimoViaje.gTot) || "";
    return "";
  });
  const [precioAdblue,     setPrecioAdblue]       = useState(() => {
    const guardado = valBorrador("precioAdblue", null);
    if (guardado !== null) return guardado;
    if (ultimoViaje && ultimoViaje.adlt > 0) return Math.round((ultimoViaje.cAdbl || 0) / ultimoViaje.adlt) || "";
    return "";
  });
  const [categoria,        setCategoria]          = useState(valBorrador("categoria", "VII"));
  const [busquedaP,        setBusquedaP]          = useState("");
  const [selP,             setSelP]               = useState("");
  const [peajesRuta,       setPeajesRuta]         = useState(() => {
    // El cotizador maneja el peaje como un total en $, no como casetas del catálogo.
    // Para no perder ese costo se traslada como un único peaje agregado, visible
    // y editable en el desglose (igual que uno agregado a mano).
    const total = parseFloat(precarga?.peajesTotal);
    if (!total || total <= 0) return [];
    return [{
      c: "cotizador_peajes",
      n: "Peajes (total cotizado)",
      d: "Total de la cotización rápida",
      iv: false,
      t: { [categoria || "VII"]: total },
      tarifa: total
    }];
  });
  const [porcCond,         setPorcCond]           = useState(valBorrador("porcCond", ""));
  const [carpado,          setCarpado]            = useState(valBorrador("carpado", ""));
  const [gastosViaje,      setGastosViaje]        = useState(valBorrador("gastosViaje", ""));
  const [extras,           setExtras]             = useState([]);
  const [nuevoNom,         setNuevoNom]           = useState("");
  const [nuevoVal,         setNuevoVal]           = useState("");
  const [guardando,        setGuardando]          = useState(false);
  const [modoFlete,        setModoFlete]          = useState(() => {
    const v = valorInicial("modoFlete", "porTon");
    return ["porTon", "porKm", "total"].includes(v) ? v : "porTon";
  });
  const [modoConductor,    setModoConductor]      = useState("porcentaje");
  const [conductorDeLista, setConductorDeLista]  = useState(false);
  const [descRetefuente,   setDescRetefuente]     = useState(false);
  const [pctRetefuente,    setPctRetefuente]      = useState(1);
  const [descReteica,      setDescReteica]        = useState(false);
  const [pctReteica,       setPctReteica]         = useState(1);
  const [descFopat,        setDescFopat]          = useState(false);
  const [pctFopat,         setPctFopat]           = useState(0.1);
  const [descOtro,         setDescOtro]           = useState(false);
  const [pctOtro,          setPctOtro]            = useState(0);
  const [nombreOtro,       setNombreOtro]         = useState("");
  const [tieneRetorno,     setTieneRetorno]       = useState(false);
  const [pctAnticipoFlete,  setPctAnticipoFlete]   = useState("60");
  const [montoAnticipoFlete,setMontoAnticipoFlete] = useState("");
  const [pctAnticipoFleteRet, setPctAnticipoFleteRet] = useState("60");
  const [montoAnticipoFleteRet, setMontoAnticipoFleteRet] = useState("");
  const [fleteRetorno,     setFleteRetorno]       = useState("");
  const [prevPlaca,            setPrevPlaca]            = useState(placa);
  const [tonelajeRetorno,  setTonelajeRetorno]    = useState("");
  const [modoFleteRetorno, setModoFleteRetorno]   = useState("porTon");
  const [rutaRet,          setRutaRet]            = useState("");
  const [tipoCargaRet,     setTipoCargaRet]       = useState("");
  const [empresaRet,       setempresaRet]         = useState("");
  const [nitEmpresaRet,    setNitEmpresaRet]      = useState("");
  const [productoRet,      setProductoRet]        = useState("");
  const [maniRet,          setManiRet]            = useState("");
  const [remesaRet,        setRemesaRet]          = useState("");
  const [pesoBasRet,       setPesoBasRet]         = useState("");
  const [lugarCargueRet,   setLugarCargueRet]     = useState("");
  const [lugarDescargueRet,setLugarDescargueRet]  = useState("");
  const [fechaCargueRet,   setFechaCargueRet]     = useState("");
  const [fechaDescargueRet,setFechaDescargueRet]  = useState("");
  const [mostrarRutas,     setMostrarRutas]       = useState(false);
  const [guardandoRuta,    setGuardandoRuta]      = useState(false);
  const [nombreRuta,       setNombreRuta]         = useState("");
  const [mostrarGuardar,   setMostrarGuardar]     = useState(false);
  const [rutaCargada,      setRutaCargada]        = useState(null);
  const [guardarComoFrecuente, setGuardarComoFrecuente] = useState(false);
  const [nombreRutaFrecuente, setNombreRutaFrecuente]   = useState("");
  const [nombrePeajeManual,   setNombrePeajeManual]     = useState("");
  const [tarifaPeajeManual,   setTarifaPeajeManual]     = useState("");
  const [modoPeajeManual,     setModoPeajeManual]       = useState(false);
  const [secDatos,         setSecDatos]           = useState(true);
  const [secComb,          setSecComb]            = useState(false);
  const [secPeajes,        setSecPeajes]          = useState(false);
  const [secCostos,        setSecCostos]          = useState(false);
  const [secDesc,          setSecDesc]            = useState(false);

  // ── WIZARD (FE-08 / FE-41 / FE-44) ──────────────────────────────────────────
  const [modoGuiado,       setModoGuiado]         = useState(true);
  const [pasoActual,       setPasoActual]         = useState(1);
  const [subPasoWizard,    setSubPasoWizard]      = useState(1);
  const TOTAL_SUBPASOS_WIZARD = 5; // 5 pasos agrupados optimizados
  const borradorGuardadoRef = useRef(borrador !== null);


  const n   = (v) => parseFloat(v) || 0;
  const fmt = (v) => "$" + Math.round(v).toLocaleString("es-CO");
  const fnD = (v, d) => (Math.round(v * Math.pow(10,d)) / Math.pow(10,d))
    .toLocaleString("es-CO", { maximumFractionDigits: d });
  const conductoresFrecuentes = [...new Set(
    viajes
    .map(v => v.condNom)
    .filter(c => c && c.trim() !=="")
  )]

  // Un conductor tecado a mano es de un solo viaje: no es dato maestro, asi que
  // no se guarda en el borrador ni en las plantillas de ruta. Si coincide con
  // alguien del directorio, se trata como conductor de la lista.
  const conductorMaestro = conductores.some(c => c.nombre === conductor);
  const conductorPersistido = conductorMaestro ? conductor : "";

  // Empresas del directorio (con NIT) + las que aparecen en viajes
  const empresasDirectorio = empresas.map(e => (e.razonSocial || e.nombre || "").trim()).filter(Boolean);
  const empresasDeViajes = viajes.map(v => v.emp).filter(emp => emp && emp.trim() !== "");
  const empresasFrecuentes = [...new Set([...empresasDirectorio, ...empresasDeViajes])];

  // Buscar NIT de una empresa en el directorio
  const nitDeEmpresa = (nombre) => {
    const norm = (nombre || "").trim().toLowerCase();
    const emp = empresas.find(e => (e.razonSocial || e.nombre || "").trim().toLowerCase() === norm);
    return emp?.nit || "";
  };

  const valorViajeIda = modoFlete === "porTon"
    ?n(tonelaje) * n(fleteTon)
    : n(fleteTon);

  const valorViajeRetorno = tieneRetorno
    ?modoFleteRetorno === "porTon"
      ? n(tonelajeRetorno) * n(fleteRetorno)
      : n(fleteRetorno)
    : 0;

  const [prevValorViajeIda,     setPrevValorViajeIda]     = useState(valorViajeIda);
  const [prevValorViajeRetorno, setPrevValorViajeRetorno] = useState(valorViajeRetorno);

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

  // Estado de cada sección (para los pasos numerados) — solo presentación
  const okDatos  = !!ruta.trim() && valorViaje > 0;
  const okComb   = costoComb > 0;
  const okPeajes = peajesRuta.length > 0;
  const okCostos = costoConduct > 0 || n(carpado) > 0 || n(gastosViaje) > 0 || extras.length > 0;
  const okDesc   = totalDesc > 0;

  // Lógica de anticipo para el viaje de Ida (depende de valorViajeIda para recalculado)
  if (valorViajeIda !== prevValorViajeIda) {
    setPrevValorViajeIda(valorViajeIda);
    if (pctAnticipoFlete !== "" && valorViajeIda > 0) {
      const val = Math.round(valorViajeIda * (parseFloat(pctAnticipoFlete) / 100));
      setMontoAnticipoFlete(val ? String(val) : "");
    }
  }

  if (valorViajeRetorno !== prevValorViajeRetorno) {
    setPrevValorViajeRetorno(valorViajeRetorno);
    if (pctAnticipoFleteRet !== "" && valorViajeRetorno > 0) {
      const val = Math.round(valorViajeRetorno * (parseFloat(pctAnticipoFleteRet) / 100));
      setMontoAnticipoFleteRet(val ? String(val) : "");
    }
  }

  const manejarMontoAnticipoChange = (valStr) => {
    let valNum = parseFloat(valStr) || 0;
    if (valorViajeIda > 0 && valNum > valorViajeIda) {
      valNum = valorViajeIda;
      valStr = String(valorViajeIda);
    }
    setMontoAnticipoFlete(valStr);
    if (valorViajeIda > 0) {
      const pct = Math.round((valNum / valorViajeIda) * 100);
      setPctAnticipoFlete(String(pct));
    } else {
      setPctAnticipoFlete("");
    }
  };

  const manejarPctAnticipoChange = (pctStr) => {
    setPctAnticipoFlete(pctStr);
    const pctNum = parseFloat(pctStr) || 0;
    const val = Math.round(valorViajeIda * (pctNum / 100));
    setMontoAnticipoFlete(val ? String(val) : "");
  };

  const manejarMontoAnticipoRetChange = (valStr) => {
    let valNum = parseFloat(valStr) || 0;
    if (valorViajeRetorno > 0 && valNum > valorViajeRetorno) {
      valNum = valorViajeRetorno;
      valStr = String(valorViajeRetorno);
    }
    setMontoAnticipoFleteRet(valStr);
    if (valorViajeRetorno > 0) {
      const pct = Math.round((valNum / valorViajeRetorno) * 100);
      setPctAnticipoFleteRet(String(pct));
    } else {
      setPctAnticipoFleteRet("");
    }
  };

  const manejarPctAnticipoRetChange = (pctStr) => {
    setPctAnticipoFleteRet(pctStr);
    const pctNum = parseFloat(pctStr) || 0;
    const val = Math.round(valorViajeRetorno * (pctNum / 100));
    setMontoAnticipoFleteRet(val ? String(val) : "");
  };

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

  const agregarPeajeManual = () => {
    if (!nombrePeajeManual.trim() || !n(tarifaPeajeManual)) {
      if (mostrarToast) mostrarToast("Ingresa el nombre y la tarifa del pe  aje", "error");
      return;
    }
    const nuevoId = "manual_" + Date.now();
    const tarifaVal = n(tarifaPeajeManual);
    const nuevoPeaje = {
      c: nuevoId,
      n: nombrePeajeManual.trim(),
      d: "Peaje Manual",
      iv: false,
      t: { [categoria || "VII"]: tarifaVal },
      tarifa: tarifaVal
    };
    setPeajesRuta([...peajesRuta, nuevoPeaje]);
    setNombrePeajeManual("");
    setTarifaPeajeManual("");
    setModoPeajeManual(false);
    if (mostrarToast) mostrarToast(`✓ Peaje "${nuevoPeaje.n}" agregado (${fmt(tarifaVal)})`, "info");
  };

  const guardarViaje = async (guardarTambienFrecuente = false) => {
    if (guardandoRef.current) return;
    if (!ruta.trim())  { mostrarToast("Ingresa la ruta del viaje","error"); return; }
    if (!valorViaje)   { mostrarToast("Ingresa tonelaje y flete","error"); return; }
    if (viajes.length >= 5000) { mostrarToast("Límite de viajes alcanzado","error"); return; }
    guardandoRef.current = true;
    setGuardando(true);
    try {
      // Guardar también como ruta frecuente si fue seleccionado
      if ((guardarComoFrecuente || guardarTambienFrecuente) && onGuardarRuta) {
        try {
          const nomFinal = (nombreRutaFrecuente || "").trim() || (origen && destino ? componerRuta(origen, destino) : (nombreRuta || ruta).trim());
          await onGuardarRuta({
            tipoCarga: sanitizar(tipoCarga),
            nombre: sanitizar(nomFinal),
            ruta: sanitizar(origen && destino ? componerRuta(origen, destino) : (ruta || nomFinal)),
            origen: sanitizar(origen),
            destino: sanitizar(destino),
            kmCargado: n(kmCargado),
            kmVacio: n(kmVacio),
            tonelaje: n(tonelaje),
            modoFlete,
            fleteTon: n(fleteTon),
            rendCargado: n(rendCargado),
            rendVacio: n(rendVacio),
            galManual: n(galManual),
            modoComb,
            precioAcpm: n(precioAcpm),
            precioAdblue: n(precioAdblue),
            peajesRuta: peajesRuta.map(p => ({
              c: p.c, n: p.n, d: p.d, iv: p.iv || false,
              tarifa: p.t ? obtenerTarifa(p, categoria) : (p.tarifa || 0),
              t: p.t || {}
            })),
            categoria,
            producto: sanitizar(producto),
            empresa: sanitizar(empresa),
            nitEmpresa: sanitizar(nitEmpresa),
            conductor: conductorPersistido,
            placa: sanitizar(placa),
            modoConductor,
            porcCond: n(porcCond),
            carpado: n(carpado),
            gastosViaje: n(gastosViaje),
            extrasList: extras,
            descRetefuente,
            pctRetefuente,
            descReteica,
            pctReteica,
            descFopat,
            pctFopat,
            descOtro,
            pctOtro,
            nombreOtro,
            pctAnticipoFlete: n(pctAnticipoFlete),
            pctAnticipoFleteRet: n(pctAnticipoFleteRet),
          });
        } catch (errRuta) {
          console.error("Error guardando ruta frecuente complementaria:", errRuta);
        }
      }

      // Auto-registrar empresa nueva en el directorio invisible (opción B)
      if (empresa.trim() && nitEmpresa.trim() && onAgregarEmpresa) {
        const yaExiste = empresas.some(e =>
          (e.razonSocial || e.nombre || "").trim().toLowerCase() === empresa.trim().toLowerCase()
        );
        if (!yaExiste) {
          onAgregarEmpresa({
            razonSocial: empresa.trim(),
            nit: nitEmpresa.trim(),
            tipo: "cliente",
            ciudad: "", contacto: "", telefono: "", correo: "",
          }).catch(() => {}); // silencioso, no interrumpe el guardado del viaje
        }
      }
      // Auto-registrar empresa de retorno nueva en el directorio
      if (empresaRet.trim() && nitEmpresaRet.trim() && onAgregarEmpresa) {
        const yaExisteRet = empresas.some(e =>
          (e.razonSocial || e.nombre || "").trim().toLowerCase() === empresaRet.trim().toLowerCase()
        );
        if (!yaExisteRet) {
          onAgregarEmpresa({
            razonSocial: empresaRet.trim(),
            nit: nitEmpresaRet.trim(),
            tipo: "cliente",
            ciudad: "", contacto: "", telefono: "", correo: "",
          }).catch(() => {});
        }
      }
      await onGuardar({
        fecha, fechaDescarga, mani: sanitizar(mani), placa, tipoCarga, prod: sanitizar(producto),
        ruta: sanitizar(ruta), emp: sanitizar(empresa), nitEmpresa: nitEmpresa.trim(), condNom: sanitizar(conductor),
        remesa: sanitizar(remesa), pesoBascula: validarNumero(pesoBascula, 0, 999),
        lugarCargue: sanitizar(lugarCargue), lugarDescargue: sanitizar(lugarDescargue),
        observaciones: sanitizar(observaciones).slice(0, 500),
        kmCargado: n(kmCargado), kmVacio: n(kmVacio), kmCargadoRet: n(kmCargadoRet), kmVacioRet: n(kmVacioRet), kmT: kmTotal,
        ton: n(tonelaje), modoFlete, fleteTon: n(fleteTon), vViaje: valorViaje,
        anticipoFletePct: n(pctAnticipoFlete),
        anticipoFleteMonto: n(montoAnticipoFlete),
        anticipoFletePctRet: n(pctAnticipoFleteRet),
        anticipoFleteMontoRet: n(montoAnticipoFleteRet),
        saldoFlete: valorViaje - n(montoAnticipoFlete) - n(montoAnticipoFleteRet),
        tieneRetorno, valorViajeIda, valorViajeRetorno, tonelajeRetorno: n(tonelajeRetorno), fleteRetorno: n(fleteRetorno),
        rutaRet: sanitizar(rutaRet), tipoCargaRet, productoRet: sanitizar(productoRet),
        empresaRet: sanitizar(empresaRet), nitEmpresaRet: nitEmpresaRet.trim(),
        maniRet: sanitizar(maniRet), remesaRet: sanitizar(remesaRet),
        pesoBasRet: validarNumero(pesoBasRet, 0, 999),
        lugarCargueRet: sanitizar(lugarCargueRet), lugarDescargueRet: sanitizar(lugarDescargueRet),
        fechaCargueRet, fechaDescargueRet,
        modoComb, gTot: galTotal, galCargado: galCarg, galVacio: galVac,
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

      // Actualizar odómetro y estado — esperado y con aviso si falla
      if (placa) {
        const veh = vehiculos.find(v => v.placa === placa);
        if (veh) {
          const cambios = {};
          if (kmTotal > 0) cambios.kmOdometro = (veh.kmOdometro || 0) + kmTotal;
          const ahora = new Date();
          const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,"0")}-${String(ahora.getDate()).padStart(2,"0")}`;
          const finViaje = fechaDescargueRet || fechaDescarga || "";
          const enCurso = fecha <= hoyStr && (!finViaje || finViaje >= hoyStr);
          if (enCurso && veh.estado !== "en_taller") cambios.estado = "en_viaje";
          if (Object.keys(cambios).length > 0) {
            try {
              await onEditarVehiculo(veh.firestoreId, cambios);
            } catch (e) {
              console.error("Odómetro no actualizado:", e);
              mostrarToast("Viaje guardado, pero el odómetro no se actualizó","error");
            }
          }
        }
      }

      // Toast de éxito
      if (viajes.length === 0) {
        mostrarToast(`🎉 ¡Primer viaje! Ganancia: ${fmt(gananciaNeta)} — Guárdelo como ruta frecuente`,"exito");
      } else {
        mostrarToast(`✓ Viaje guardado — Ganancia: ${fmt(gananciaNeta)} (${margen.toFixed(1)}%)`,"exito");
      }

      // Limpiar formulario (solo si guardó exitosamente)
      setFecha(new Date().toISOString().slice(0,10)); setFechaDescarga("");
      setMani(""); setRemesa(""); setPesoBascula(""); setLugarCargue(""); setLugarDescargue("");
      setObservaciones(""); setPlaca(""); setTipoCarga(""); setProducto(""); setRuta(""); setModoFlete("");
      setEmpresa(""); setNitEmpresa(""); setConductor(""); setConductorDeLista(false); setKmCargado(""); setKmVacio(""); setKmCargadoRet(""); setKmVacioRet(""); setModoComb("");
      setTonelaje(""); setFleteTon(""); setTieneRetorno(false); setFleteRetorno("");
      setTonelajeRetorno(""); setRutaRet(""); setempresaRet(""); setNitEmpresaRet(""); setProductoRet("");
      setManiRet(""); setRemesaRet(""); setPesoBasRet("");
      setLugarCargueRet(""); setLugarDescargueRet(""); setFechaCargueRet(""); setFechaDescargueRet("");
      setExtras([]); setPorcCond(""); setCarpado(""); setGastosViaje("");
      setPeajesRuta([]); setRutaCargada(null);
      setPctAnticipoFlete("60"); setMontoAnticipoFlete("");
      setPctAnticipoFleteRet("60"); setMontoAnticipoFleteRet("");
      // FE-08: Limpiar borrador al guardar exitosamente
      try { localStorage.removeItem(BORRADOR_KEY); } catch { void 0; }
      borradorGuardadoRef.current = false;
      if (modoGuiado) setPasoActual(1);

      // Navegación de retorno
      if (location.state?.vehiculoId) {
        navigate(`/vehiculo/${location.state.vehiculoId}`, { state: { tab: location.state.volverTab || "viajes" }, replace: true });
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error al guardar viaje:", err);
      mostrarToast("No se pudo guardar el viaje. Verifique su conexión e intente de nuevo","error");
      // NO limpia el formulario: el usuario conserva lo digitado para reintentar
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  const cargarRuta = (rutaGuardada) => {
    if (!rutaGuardada) return;
    setTipoCarga(rutaGuardada.tipoCarga || "");
    setRuta(normalizarRuta(rutaGuardada.ruta));

    // Origen y Destino independientes
    if (rutaGuardada.origen && rutaGuardada.destino) {
      setOrigen(rutaGuardada.origen);
      setDestino(rutaGuardada.destino);
    } else if (rutaGuardada.ruta) {
      const partes = rutaGuardada.ruta.split(/→|-/).map(s => s.trim());
      if (partes.length >= 2) {
        setOrigen(partes[0]);
        setDestino(partes[1]);
      } else {
        setOrigen(rutaGuardada.ruta);
        setDestino("");
      }
    }

    setKmCargado(rutaGuardada.kmCargado ? String(rutaGuardada.kmCargado) : "");
    setKmVacio(rutaGuardada.kmVacio ? String(rutaGuardada.kmVacio) : "");
    if (rutaGuardada.tonelaje) setTonelaje(String(rutaGuardada.tonelaje));
    if (rutaGuardada.modoFlete) setModoFlete(rutaGuardada.modoFlete);
    if (rutaGuardada.fleteTon) setFleteTon(String(rutaGuardada.fleteTon));
    if (rutaGuardada.rendCargado) setRendCargado(String(rutaGuardada.rendCargado));
    if (rutaGuardada.rendVacio) setRendVacio(String(rutaGuardada.rendVacio));
    if (rutaGuardada.galManual) setGalManual(String(rutaGuardada.galManual));
    if (rutaGuardada.modoComb) setModoComb(rutaGuardada.modoComb);
    if (rutaGuardada.precioAcpm) setPrecioAcpm(String(rutaGuardada.precioAcpm));
    if (rutaGuardada.precioAdblue) setPrecioAdblue(String(rutaGuardada.precioAdblue));
    if (rutaGuardada.categoria) setCategoria(rutaGuardada.categoria || "VII");

    // Peajes detallados
    if (Array.isArray(rutaGuardada.peajesRuta)) {
      setPeajesRuta(rutaGuardada.peajesRuta.map(p => ({
        c: p.c,
        n: p.n,
        d: p.d,
        iv: p.iv || false,
        t: p.t || { [rutaGuardada.categoria || "VII"]: p.tarifa || 0 },
        tarifa: p.tarifa || 0
      })));
    }

    // Datos de carga, empresa y conductor
    if (rutaGuardada.producto) setProducto(rutaGuardada.producto);
    if (rutaGuardada.empresa) setEmpresa(rutaGuardada.empresa);
    if (rutaGuardada.nitEmpresa) setNitEmpresa(rutaGuardada.nitEmpresa);
    if (rutaGuardada.conductor) setConductor(rutaGuardada.conductor);
    if (rutaGuardada.placa) setPlaca(rutaGuardada.placa);
    if (rutaGuardada.lugarCargue) setLugarCargue(rutaGuardada.lugarCargue);
    if (rutaGuardada.lugarDescargue) setLugarDescargue(rutaGuardada.lugarDescargue);
    if (rutaGuardada.modoConductor) setModoConductor(rutaGuardada.modoConductor);
    if (rutaGuardada.porcCond) setPorcCond(String(rutaGuardada.porcCond));
    if (rutaGuardada.carpado !== undefined) setCarpado(String(rutaGuardada.carpado));
    if (rutaGuardada.gastosViaje !== undefined) setGastosViaje(String(rutaGuardada.gastosViaje));
    if (rutaGuardada.extrasList) setExtras(rutaGuardada.extrasList);

    // Descuentos de ley
    if (rutaGuardada.descRetefuente !== undefined) setDescRetefuente(rutaGuardada.descRetefuente);
    if (rutaGuardada.pctRetefuente) setPctRetefuente(rutaGuardada.pctRetefuente);
    if (rutaGuardada.descReteica !== undefined) setDescReteica(rutaGuardada.descReteica);
    if (rutaGuardada.pctReteica) setPctReteica(rutaGuardada.pctReteica);
    if (rutaGuardada.descFopat !== undefined) setDescFopat(rutaGuardada.descFopat);
    if (rutaGuardada.pctFopat) setPctFopat(rutaGuardada.pctFopat);
    if (rutaGuardada.descOtro !== undefined) setDescOtro(rutaGuardada.descOtro);
    if (rutaGuardada.pctOtro) setPctOtro(rutaGuardada.pctOtro);
    if (rutaGuardada.nombreOtro) setNombreOtro(rutaGuardada.nombreOtro);
    if (rutaGuardada.pctAnticipoFlete !== undefined) setPctAnticipoFlete(String(rutaGuardada.pctAnticipoFlete));
    if (rutaGuardada.pctAnticipoFleteRet !== undefined) setPctAnticipoFleteRet(String(rutaGuardada.pctAnticipoFleteRet));

    setRutaCargada(rutaGuardada.nombre || rutaGuardada.ruta);
    setMostrarRutas(false);
    if (mostrarToast) mostrarToast(`✓ Ruta "${rutaGuardada.nombre || rutaGuardada.ruta}" cargada con éxito. Solo ajusta las fechas y confirma el viaje.`, "exito");
  };

  const guardarRutaFrecuente = async (nombrePersonalizado = "") => {
    if (guardandoRutaRef.current || guardandoRuta) return;
    const nombreFinal = (nombrePersonalizado || nombreRutaFrecuente || nombreRuta || (origen && destino ? componerRuta(origen, destino) : ruta)).trim();
    if (!nombreFinal) {
      if (mostrarToast) mostrarToast("Ingresa la ruta o un nombre para guardarla", "error");
      return;
    }
    guardandoRutaRef.current = true;
    setGuardandoRuta(true);

    const datos = {
      tipoCarga: sanitizar(tipoCarga),
      nombre: sanitizar(nombreFinal),
      ruta: sanitizar(origen && destino ? componerRuta(origen, destino) : (ruta || nombreFinal)),
      origen: sanitizar(origen),
      destino: sanitizar(destino),
      kmCargado: n(kmCargado),
      kmVacio: n(kmVacio),
      tonelaje: n(tonelaje),
      modoFlete: modoFlete,
      fleteTon: n(fleteTon),
      rendCargado: n(rendCargado),
      rendVacio: n(rendVacio),
      galManual: n(galManual),
      modoComb: modoComb,
      precioAcpm: n(precioAcpm),
      precioAdblue: n(precioAdblue),
      peajesRuta: peajesRuta.map(p => ({
        c: p.c,
        n: p.n,
        d: p.d,
        iv: p.iv || false,
        tarifa: p.t ? obtenerTarifa(p, categoria) : (p.tarifa || 0),
        t: p.t || {}
      })),
      categoria,
      producto: sanitizar(producto),
      empresa: sanitizar(empresa),
      nitEmpresa: sanitizar(nitEmpresa),
      conductor: conductorPersistido,
      placa: sanitizar(placa),
      modoConductor: modoConductor,
      porcCond: n(porcCond),
      carpado: n(carpado),
      gastosViaje: n(gastosViaje),
      extrasList: extras,
      descRetefuente,
      pctRetefuente,
      descReteica,
      pctReteica,
      descFopat,
      pctFopat,
      descOtro,
      pctOtro,
      nombreOtro,
      pctAnticipoFlete: n(pctAnticipoFlete),
      pctAnticipoFleteRet: n(pctAnticipoFleteRet),
    };

    try {
      await onGuardarRuta(datos);
      if (mostrarToast) mostrarToast(`✓ Ruta frecuente "${nombreFinal}" guardada con éxito`, "exito");
      setMostrarGuardar(false);
      setNombreRuta("");
      setNombreRutaFrecuente("");
    } catch(err) {
      console.error(err);
      if (mostrarToast) mostrarToast("Error al guardar la ruta frecuente", "error");
    } finally {
      guardandoRutaRef.current = false;
      setGuardandoRuta(false);
    }
  };

// Pre-llenar rendimiento configurado en el vehículo al seleccionar placa
  const vehPlaca = vehiculos.find(v => v.placa === placa);
  if (placa !== prevPlaca) {
    setPrevPlaca(placa);
    if (vehPlaca) {
      if (vehPlaca.rendCargadoDef > 0 && !rendCargado) setRendCargado(String(vehPlaca.rendCargadoDef));
      if (vehPlaca.rendVacioDef > 0 && !rendVacio) setRendVacio(String(vehPlaca.rendVacioDef));
    }
  }

  // ── FE-08: Guardar borrador con debounce 800ms ────────────────────────────────
  const guardarBorradorRef = useRef(null);
  useEffect(() => {
    if (!borradorGuardadoRef.current && !ruta && !placa && !tonelaje) return; // no guardar vacío al inicio
    clearTimeout(guardarBorradorRef.current);
    guardarBorradorRef.current = setTimeout(() => {
      try {
        const borrador = {
          fecha, placa, tipoCarga, ruta, empresa, nitEmpresa,
          conductor: conductorPersistido, producto, tonelaje, fleteTon, modoFlete,
          kmCargado, kmVacio, rendCargado, rendVacio,
          precioAcpm, precioAdblue, categoria, porcCond, carpado, gastosViaje,
        };
        localStorage.setItem(BORRADOR_KEY, JSON.stringify(borrador));
        borradorGuardadoRef.current = true;
    } catch { void 0; }
    }, 800);
    return () => clearTimeout(guardarBorradorRef.current);
  }, [fecha, placa, tipoCarga, ruta, empresa, nitEmpresa, conductorPersistido, producto,
      tonelaje, fleteTon, modoFlete, kmCargado, kmVacio, rendCargado, rendVacio,
      precioAcpm, precioAdblue, categoria, porcCond, carpado, gastosViaje]);

  // ── FE-08: beforeunload listener ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ruta || placa || tonelaje) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [ruta, placa, tonelaje]);



  const MODO_FLETE_OPCIONES = [
    { value:"porTon",   label:"Por tonelada",  icono:"⚖️",  sub:"Flete × Tons" },
    { value:"global",   label:"Flete global",  icono:"💵",  sub:"Monto fijo" },
    { value:"porKm",    label:"Por kilómetro", icono:"📏",  sub:"Valor × km" },
  ];

  const MODO_COMB_OPCIONES = [
    { value:"auto",   label:"Por rendimiento", icono:"⚙️",  sub:"Km/Galón" },
    { value:"manual", label:"Total galones",   icono:"⛽",  sub:"Ingreso directo" },
  ];

  const MODO_CONDUCTOR_OPCIONES = [
    { value:"porcentaje", label:"Porcentaje",  icono:"%" },
    { value:"fijo",       label:"Valor fijo",  icono:"$" },
  ];

  // ── BANNERS sub-pasos wizard (5 Pasos Agrupados) ───────────────────────────
  const WIZARD_SUB_PASOS = [
    { icono:"🚛", titulo:"1. Camión, Fechas y Conductor", mensaje:"Selecciona el vehículo, la fecha de cargue/descargue y el conductor asignado." },
    { icono:"📍", titulo:"2. Carga, Ruta y Flete",        mensaje:"Define la mercancía, origen/destino, empresa, tonelaje, kilómetros y valor del flete." },
    { icono:"⛽", titulo:"3. Combustible",                 mensaje:"Calcula el consumo de ACPM (por rendimiento o galones totales) y su precio." },
    { icono:"🛣️", titulo:"4. Peajes, Gastos y Conductor",  mensaje:"Agrega peajes de la ruta, gastos operativos y el pago al conductor." },
    { icono:"✅", titulo:"5. Resumen y Guardar",          mensaje:"Revisa la ganancia neta estimada, los márgenes y guarda el viaje." },
  ];
  const subBanner = WIZARD_SUB_PASOS[subPasoWizard - 1] || WIZARD_SUB_PASOS[0];

  const irSubPasoSiguiente = () => setSubPasoWizard(s => Math.min(s + 1, TOTAL_SUBPASOS_WIZARD));
  const irSubPasoAnterior  = () => setSubPasoWizard(s => Math.max(s - 1, 1));

  const cambiarAModoAvanzado = () => {
    setModoGuiado(false);
    if (subPasoWizard === 1 || subPasoWizard === 2) {
      setSecDatos(true);
    } else if (subPasoWizard === 3) {
      setSecComb(true);
    } else if (subPasoWizard === 4) {
      setSecPeajes(true);
      setSecCostos(true);
    } else if (subPasoWizard === 5) {
      setSecDatos(true);
      setSecComb(true);
      setSecPeajes(true);
      setSecCostos(true);
      setSecDesc(true);
    }
  };

  const cambiarAModoGuiado = () => {
    setModoGuiado(true);
  };

  const manejarCambioProducto = (val) => {
    if (val === "__OTRO__") {
      setModoOtroProd(true);
      setProducto("");
    } else {
      setModoOtroProd(false);
      setProducto(val);
    }
  };

  const guardarNuevoProducto = () => {
    if (!otroProdTexto.trim()) return;
    const nuevo = otroProdTexto.trim();
    guardarProductoPersonalizado(nuevo);
    setListaProductos(obtenerListaProductos());
    setProducto(nuevo);
    setModoOtroProd(false);
    setOtroProdTexto("");
    if (mostrarToast) mostrarToast(`Producto "${nuevo}" guardado en la lista`, "exito");
  };

  const manejarOrigenChange = (val) => {
    setOrigen(val);
    setRuta(componerRuta(val, destino));
  };

  const manejarDestinoChange = (val) => {
    setDestino(val);
    setRuta(componerRuta(origen, val));
  };

  // ── MODO GUIADO: render completo con fondo claro (5 PASOS) ──────────────────
  if (modoGuiado) {
    return (
      <WizardPantalla>
        <datalist id="ciudades-colombia-calc">
          {CIUDADES_COLOMBIA.map(c => <option key={c} value={c} />)}
        </datalist>

        <WizardHeader
          titulo="Calculadora"
          onVolver={() => navigate(-1)}
          badge={
            <button type="button" onClick={cambiarAModoAvanzado}
              style={{ display:"flex",alignItems:"center",gap:"4px",
                background:"#EFF6FF",border:"1.5px solid #BFDBFE",
                borderRadius:"20px",padding:"5px 10px",
                fontSize:"11px",fontWeight:700,color:"#3B82F6",cursor:"pointer" }}>
              <Zap size={11}/> Avanzado
            </button>
          }
        />
        <WizardProgress
          total={TOTAL_SUBPASOS_WIZARD}
          actual={subPasoWizard}
          etiquetas={WIZARD_SUB_PASOS.map(p => p.titulo)}
        />
        <WizardBanner icono={subBanner.icono} titulo={subBanner.titulo} mensaje={subBanner.mensaje} />

        {/* ── PASO 1: Camión, Fechas y Conductor ── */}
        {subPasoWizard === 1 && (
          <WizardCard>
            {/* Selector de Rutas Frecuentes Guardadas */}
            {rutas.length > 0 ? (
              <div style={{ marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setMostrarRutas(!mostrarRutas)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    background: "rgba(37, 99, 235, 0.12)",
                    border: "1.5px dashed rgba(59, 130, 246, 0.5)",
                    borderRadius: "12px",
                    color: "var(--text-primary, #60A5FA)",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    ⭐ <span>Usar datos de una Ruta Frecuente ({rutas.length})</span>
                  </span>
                  {mostrarRutas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {mostrarRutas && (
                  <div style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    maxHeight: "240px",
                    overflowY: "auto",
                    padding: "4px"
                  }}>
                    {rutas.map((r) => (
                      <div
                        key={r.firestoreId || r.id || r.nombre}
                        tabIndex={0}
                        role="button"
                        aria-label={`Seleccionar ruta ${r.nombre || r.ruta || "sin nombre"}`}
                        onClick={() => cargarRuta(r)}
                        onKeyDown={alPulsarEnterOEspacio(() => cargarRuta(r))}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          background: "var(--card-bg, rgba(255,255,255,0.06))",
                          border: "1.5px solid var(--border-color, rgba(255,255,255,0.12))",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary, #F8FAFC)" }}>
                            🛣️ {r.nombre || normalizarRuta(r.ruta)}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary, #94A3B8)", marginTop: "2px" }}>
                            {r.kmCargado ? `${r.kmCargado} km cargado` : ""}
                            {r.empresa ? ` · ${r.empresa}` : ""}
                            {r.producto ? ` · ${r.producto}` : ""}
                            {r.peajesRuta?.length ? ` · ${r.peajesRuta.length} peajes` : ""}
                          </div>
                        </div>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 8px",
                          background: "#2563EB",
                          color: "#FFFFFF",
                          borderRadius: "6px"
                        }}>
                          Cargar
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                marginBottom: "16px",
                padding: "10px 14px",
                background: "rgba(37, 99, 235, 0.08)",
                border: "1px dashed rgba(59, 130, 246, 0.35)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "18px" }}>⭐</span>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary, #60A5FA)", margin: 0 }}>
                    Rutas Frecuentes
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary, #94A3B8)", margin: 0 }}>
                    Al finalizar tu viaje podrás guardarlo como ruta frecuente para precargar combustible y peajes con un solo clic.
                  </p>
                </div>
              </div>
            )}

            {rutaCargada && (
              <div style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1.5px solid #22C55E",
                borderRadius: "10px",
                padding: "10px 12px",
                marginBottom: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#16A34A", display: "block" }}>
                    ✓ Ruta frecuente activa: {rutaCargada}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>
                    Kilómetros, combustible y peajes precargados
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRutaCargada(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#DC2626",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  ✕ Quitar
                </button>
              </div>
            )}

            <WizardCampo label="¿Qué camión va a salir?" obligatorio>
              <WizardSelect value={placa} onChange={e => setPlaca(e.target.value)}>
                <option value="">Seleccionar vehículo...</option>
                {vehiculos.map(v => (
                  <option key={v.firestoreId} value={v.placa}>
                    🚛 {v.placa}{v.tipoVehiculo ? ` · ${v.tipoVehiculo}` : ""}
                  </option>
                ))}
              </WizardSelect>
            </WizardCampo>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <WizardCampo label="Fecha de cargue" obligatorio>
                <WizardInput type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
              </WizardCampo>
              <WizardCampo label="Fecha de descargue">
                <WizardInput type="date" value={fechaDescarga} onChange={e => setFechaDescarga(e.target.value)} />
              </WizardCampo>
            </div>
            <WizardCampo label="¿Quién maneja el camión?" ayuda="Si el conductor no está en la lista, puedes escribir su nombre">
              <WizardSelect value={conductor} onChange={e => { setConductor(e.target.value); setConductorDeLista(e.target.value !== ""); }}>
                <option value="">Seleccionar conductor...</option>
                {conductores.map(c => (
                  <option key={c.firestoreId} value={c.nombre}>{c.nombre}</option>
                ))}
              </WizardSelect>
            </WizardCampo>
            {!conductorDeLista && (
              <WizardCampo label="O escribe el nombre del conductor">
                <WizardInput
                  value={conductor}
                  onChange={e => setConductor(e.target.value)}
                  placeholder="Nombre y apellido del conductor"
                />
              </WizardCampo>
            )}
          </WizardCard>
        )}

        {/* ── PASO 2: Carga, Ruta y Flete ── */}
        {subPasoWizard === 2 && (
          <WizardCard>
            <WizardCampo label="Producto transportado (Top 10 Colombia)" obligatorio ayuda="Selecciona de la lista o agrega uno nuevo">
              <WizardSelect value={modoOtroProd ? "__OTRO__" : producto} onChange={e => manejarCambioProducto(e.target.value)}>
                <option value="">Seleccionar producto...</option>
                {listaProductos.map(p => (
                  <option key={p} value={p}>📦 {p}</option>
                ))}
                <option value="__OTRO__">➕ Otro producto (Escribir nuevo)...</option>
              </WizardSelect>
            </WizardCampo>

            {modoOtroProd && (
              <div style={{ background: "#F0F7FF", border: "1.5px solid #93C5FD", borderRadius: "12px", padding: "12px", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#1E40AF", margin: "0 0 8px" }}>Escribe y guarda el nuevo producto:</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <WizardInput
                    value={otroProdTexto}
                    onChange={e => setOtroProdTexto(e.target.value)}
                    placeholder="Ej: Cacao en grano, Polietileno..."
                  />
                  <button
                    type="button"
                    onClick={guardarNuevoProducto}
                    style={{
                      padding: "0 16px", background: "#2563EB", color: "#fff",
                      border: "none", borderRadius: "10px", fontWeight: 700,
                      fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap"
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <WizardCampo label="Ciudad de Origen" obligatorio ayuda="Lugar de cargue">
                <WizardInput
                  type="text"
                  placeholder="Ej: Barranquilla"
                  list="ciudades-colombia-calc"
                  value={origen}
                  onChange={e => manejarOrigenChange(e.target.value)}
                />
              </WizardCampo>
              <WizardCampo label="Ciudad de Destino" obligatorio ayuda="Lugar de entrega">
                <WizardInput
                  type="text"
                  placeholder="Ej: Bogotá D.C."
                  list="ciudades-colombia-calc"
                  value={destino}
                  onChange={e => manejarDestinoChange(e.target.value)}
                />
              </WizardCampo>
            </div>

            <WizardCampo label="¿Quién contrata el flete (empresa)?" obligatorio>
              <WizardSelect value={empresa} onChange={e => {
                setEmpresa(e.target.value);
                const emp = empresas.find(em => (em.razonSocial||em.nombre||"").trim() === e.target.value);
                if (emp?.nit) setNitEmpresa(emp.nit);
              }}>
                <option value="">Seleccionar empresa...</option>
                {[...new Set([
                  ...empresas.map(em=>(em.razonSocial||em.nombre||"").trim()),
                  ...viajes.map(v=>v.emp).filter(Boolean),
                ])].filter(Boolean).map(e=><option key={e} value={e}>{e}</option>)}
              </WizardSelect>
            </WizardCampo>
            {!empresa && (
              <WizardCampo label="O escribe el nombre de la empresa">
                <WizardInput
                  value={empresa}
                  onChange={e => setEmpresa(e.target.value)}
                  placeholder="Nombre de la empresa"
                />
              </WizardCampo>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <WizardCampo label="Toneladas" obligatorio>
                <WizardInput
                  type="number"
                  value={tonelaje}
                  onChange={e => setTonelaje(e.target.value)}
                  placeholder="Ej: 32"
                />
              </WizardCampo>
              <WizardCampo label="Km Cargado" obligatorio>
                <WizardInput
                  type="number"
                  value={kmCargado}
                  onChange={e => setKmCargado(e.target.value)}
                  placeholder="Ej: 980"
                />
              </WizardCampo>
              <WizardCampo label="Km Vacío">
                <WizardInput
                  type="number"
                  value={kmVacio}
                  onChange={e => setKmVacio(e.target.value)}
                  placeholder="Ej: 50"
                />
              </WizardCampo>
            </div>

            <WizardCampo label="¿Cómo cobran el flete?">
              <WizardOpciones
                opciones={MODO_FLETE_OPCIONES}
                valor={modoFlete}
                onChange={setModoFlete}
                columnas={3}
              />
            </WizardCampo>
            <WizardCampo
              label={modoFlete === "porTon" ? "Valor por tonelada ($)" : modoFlete === "porKm" ? "Valor por km ($)" : "Flete global ($)"}
              obligatorio
            >
              <WizardInput
                type="number"
                value={fleteTon}
                onChange={e => setFleteTon(e.target.value)}
                placeholder="$ 0"
              />
            </WizardCampo>
            {n(fleteTon) > 0 && (
              <div style={{
                background:"#F0FDF4",border:"1.5px solid #BBF7D0",
                borderRadius:"12px",padding:"12px 16px",
              }}>
                <p style={{ fontSize:"14px",color:"#059669",fontWeight:700,margin:0 }}>
                  💰 Flete total estimado: ${Math.round(modoFlete==="porTon" ? n(fleteTon)*n(tonelaje) : modoFlete==="porKm" ? n(fleteTon)*(n(kmCargado)+n(kmVacio)) : n(fleteTon)).toLocaleString("es-CO")}
                </p>
              </div>
            )}
          </WizardCard>
        )}

        {/* ── PASO 3: Combustible ── */}
        {subPasoWizard === 3 && (
          <WizardCard>
            <WizardCampo label="¿Cómo calculas el combustible?">
              <WizardOpciones
                opciones={MODO_COMB_OPCIONES}
                valor={modoComb}
                onChange={setModoComb}
                columnas={2}
              />
            </WizardCampo>
            {modoComb === "auto" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <WizardCampo label="Rendimiento cargado (km/gal)" obligatorio>
                  <WizardInput
                    type="number"
                    value={rendCargado}
                    onChange={e => setRendCargado(e.target.value)}
                    placeholder="Ej: 8.5"
                  />
                </WizardCampo>
                <WizardCampo label="Rendimiento vacío (km/gal)">
                  <WizardInput
                    type="number"
                    value={rendVacio}
                    onChange={e => setRendVacio(e.target.value)}
                    placeholder="Ej: 12"
                  />
                </WizardCampo>
              </div>
            ) : (
              <WizardCampo label="Total de galones consumidos" obligatorio>
                <WizardInput
                  type="number"
                  value={galManual}
                  onChange={e => setGalManual(e.target.value)}
                  placeholder="Total galones"
                />
              </WizardCampo>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <WizardCampo label="Precio ACPM ($/galón)" obligatorio>
                <WizardInput
                  type="number"
                  value={precioAcpm}
                  onChange={e => setPrecioAcpm(e.target.value)}
                  placeholder="Ej: 11500"
                />
              </WizardCampo>
              <WizardCampo label="Precio AdBlue ($/litro)">
                <WizardInput
                  type="number"
                  value={precioAdblue}
                  onChange={e => setPrecioAdblue(e.target.value)}
                  placeholder="Ej: 8000"
                />
              </WizardCampo>
            </div>
          </WizardCard>
        )}

        {/* ── PASO 4: Peajes Detallados, Gastos y Pago Conductor ── */}
        {subPasoWizard === 4 && (
          <WizardCard>
            {/* Categoría para peajes */}
            <WizardCampo label="Categoría del vehículo (peajes)" ayuda="Determina la tarifa exacta en cada caseta">
              <WizardSelect value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="I">Cat I — Automóviles, Camperos, Camionetas</option>
                <option value="II">Cat II — Buses y Busetas</option>
                <option value="III">Cat III — Camiones 2 ejes pequeños</option>
                <option value="IV">Cat IV — Camión 2 ejes grandes</option>
                <option value="V">Cat V — Camiones 3 y 4 ejes (Doble Troque)</option>
                <option value="VI">Cat VI — Camiones 5 ejes (Tractomula 2 troques)</option>
                <option value="VII">Cat VII — Camiones 6+ ejes (Tractomula 3 troques)</option>
              </WizardSelect>
            </WizardCampo>

            {/* Buscador y selector de Peaje */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "13.5px", fontWeight: 700, color: t.colors.textSecondary, margin: "0 0 6px" }}>
                Agregar Peajes de la Ruta (Peaje por Peaje)
              </p>

              <WizardInput
                type="text"
                placeholder="🔍 Buscar peaje por nombre o departamento..."
                value={busquedaP}
                onChange={e => setBusquedaP(e.target.value)}
              />

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <WizardSelect
                  value={selP}
                  onChange={e => setSelP(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Seleccionar peaje de la lista...</option>
                  {peajesFiltrados.slice(0, 100).map(p => {
                    const tarifaCat = obtenerTarifa(p, categoria);
                    return (
                      <option key={p.c} value={p.c}>
                        {p.n} ({p.d}) — ${(tarifaCat).toLocaleString("es-CO")}
                      </option>
                    );
                  })}
                </WizardSelect>
                <button
                  type="button"
                  onClick={agregarPeaje}
                  style={{
                    padding: "0 16px",
                    background: "#2563EB",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Plus size={16} />
                  <span>Agregar</span>
                </button>
              </div>

              <div style={{ marginTop: "6px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setModoPeajeManual(!modoPeajeManual)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563EB",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  {modoPeajeManual ? "✕ Cancelar peaje manual" : "+ ¿No encuentras el peaje? Escríbelo manualmente"}
                </button>
              </div>

              {modoPeajeManual && (
                <div style={{
                  marginTop: "8px",
                  padding: "12px",
                  background: "rgba(37, 99, 235, 0.05)",
                  border: "1.5px dashed #3B82F6",
                  borderRadius: "10px"
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                    <WizardInput
                      placeholder="Nombre del peaje"
                      value={nombrePeajeManual}
                      onChange={e => setNombrePeajeManual(e.target.value)}
                    />
                    <WizardInput
                      type="number"
                      placeholder="Tarifa ($)"
                      value={tarifaPeajeManual}
                      onChange={e => setTarifaPeajeManual(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={agregarPeajeManual}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#2563EB",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Guardar Peaje Manual
                  </button>
                </div>
              )}
            </div>

            {/* Lista Desglosada de Peajes Agregados */}
            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#64748B", margin: "0 0 6px" }}>
                Desglose Detallado ({peajesRuta.length} peaje{peajesRuta.length === 1 ? "" : "s"} agregado{peajesRuta.length === 1 ? "" : "s"})
              </p>

              {peajesRuta.length === 0 ? (
                <div style={{
                  padding: "12px",
                  textAlign: "center",
                  background: "rgba(0,0,0,0.02)",
                  border: "1px dashed #CBD5E1",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  color: "#64748B"
                }}>
                  No hay peajes agregados para esta ruta. Agrega los peajes arriba o deja vacío si no aplica.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {peajesRuta.map(p => {
                    const tarifa = obtenerTarifa(p, categoria);
                    const total = tarifa * (p.iv ? 2 : 1);
                    return (
                      <div
                        key={p.c}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 12px",
                          background: "#FFFFFF",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "10px"
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", display: "block" }}>
                            🛣️ {p.n} {p.d ? `(${p.d})` : ""}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748B" }}>
                            Tarifa: {fmt(tarifa)} {p.iv ? "× 2 (Ida y vuelta)" : "(Solo ida)"}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#0F172A" }}>
                            {fmt(total)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleIV(p.c)}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              background: p.iv ? "rgba(34, 197, 94, 0.15)" : "rgba(37, 99, 235, 0.12)",
                              color: p.iv ? "#16A34A" : "#2563EB"
                            }}
                          >
                            {p.iv ? "Ida/Vuelta" : "Ida"}
                          </button>
                          <button
                            type="button"
                            onClick={() => quitarP(p.c)}
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "none",
                              color: "#EF4444",
                              borderRadius: "6px",
                              padding: "4px 6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total Peajes Destacado */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                padding: "10px 14px",
                background: "rgba(37, 99, 235, 0.08)",
                border: "1.5px solid #93C5FD",
                borderRadius: "10px"
              }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1E40AF" }}>
                  Total Peajes de la Ruta:
                </span>
                <span style={{ fontSize: "16px", fontWeight: 900, color: "#1E40AF" }}>
                  {fmt(totPeajes)}
                </span>
              </div>
            </div>

            {/* Otros gastos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <WizardCampo label="Carpado / Descarpado ($)" ayuda="Dejar en 0 si no aplica">
                <WizardInput
                  type="number"
                  value={carpado}
                  onChange={e => setCarpado(e.target.value)}
                  placeholder="$ 0"
                />
              </WizardCampo>
              <WizardCampo label="Otros gastos de viaje ($)" ayuda="Estadías, viáticos...">
                <WizardInput
                  type="number"
                  value={gastosViaje}
                  onChange={e => setGastosViaje(e.target.value)}
                  placeholder="$ 0"
                />
              </WizardCampo>
            </div>

            {/* Pago conductor */}
            <WizardCampo label="¿Cómo se le paga al conductor?">
              <WizardOpciones
                opciones={MODO_CONDUCTOR_OPCIONES}
                valor={modoConductor}
                onChange={setModoConductor}
                columnas={2}
              />
            </WizardCampo>
            <WizardCampo
              label={modoConductor === "porcentaje" ? "Porcentaje del flete (%)" : "Valor fijo ($)"}
              ayuda={modoConductor === "porcentaje" ? "Ej: 25 significa el 25% del flete" : "Monto fijo en pesos"}
            >
              <WizardInput
                type="number"
                value={porcCond}
                onChange={e => setPorcCond(e.target.value)}
                placeholder={modoConductor === "porcentaje" ? "Ej: 25" : "$ 0"}
              />
            </WizardCampo>
          </WizardCard>
        )}

        {/* ── PASO 5: Resumen y Guardar ── */}
        {subPasoWizard === 5 && (() => {
          const kmTotal = n(kmCargado) + n(kmVacio);
          const galCarg = n(modoComb)==="manual" ? 0 : (n(kmCargado) / (n(rendCargado)||1));
          const galVac  = n(modoComb)==="manual" ? 0 : (n(kmVacio) / (n(rendVacio)||1));
          const galTot  = modoComb==="manual" ? n(galManual) : galCarg + galVac;
          const costoAcpm = galTot * n(precioAcpm);
          const costoAdbl = galTot * ((n(precioAdblue) ? 0.05 : 0) * n(precioAdblue));
          const fleteTotal = modoFlete==="porTon" ? n(fleteTon)*n(tonelaje) : modoFlete==="porKm" ? n(fleteTon)*kmTotal : n(fleteTon);
          const costoConduct = modoConductor==="porcentaje" ? fleteTotal*(n(porcCond)/100) : n(porcCond);
          const totalCostos  = costoAcpm + costoAdbl + totPeajes + costoConduct + n(carpado) + n(gastosViaje);
          const gananciaNeta = fleteTotal - totalCostos;
          const margen = fleteTotal>0 ? (gananciaNeta/fleteTotal)*100 : 0;
          const margenColor = margen>=20?"#10B981":margen>=10?"#F59E0B":"#EF4444";
          return (
            <WizardCard>
              <div style={{ textAlign:"center",marginBottom:"20px" }}>
                <p style={{ fontSize:"13px",fontWeight:700,color:"#3B82F6",
                  textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 6px" }}>
                  Ganancia estimada
                </p>
                <p style={{ fontSize:"36px",fontWeight:900,
                  color:gananciaNeta>=0?"#10B981":"#EF4444",margin:"0 0 4px" }}>
                  {fmt(gananciaNeta)}
                </p>
                <p style={{ fontSize:"15px",fontWeight:700,color:margenColor,margin:0 }}>
                  Margen: {margen.toFixed(1)}%
                </p>
              </div>
              {[
                ["Camión / Placa", placa||"—"],
                ["Conductor",      conductor||"—"],
                ["Ruta",           ruta||"—"],
                ["Producto",       producto||"—"],
                ["Empresa",        empresa||"—"],
                ["Tonelaje",       tonelaje?`${tonelaje} ton`:"—"],
                ["Flete total",    fmt(fleteTotal)],
                ["Combustible",    fmt(costoAcpm + costoAdbl)],
                [`Peajes (${peajesRuta.length} casetas)`, fmt(totPeajes)],
                ["Costo conductor", fmt(costoConduct)],
                ["Otros costos",   fmt(n(carpado)+n(gastosViaje))],
              ].map(([k,v])=>(
                <div key={k} style={{ display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:"1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                  <span style={{ fontSize:"14px",color:"var(--text-secondary, #94A3B8)",fontWeight:600 }}>{k}</span>
                  <span style={{ fontSize:"14px",color:"var(--text-primary, #F8FAFC)",fontWeight:700 }}>{v}</span>
                </div>
              ))}

              {/* Checkbox para Guardar como Ruta Frecuente */}
              <div style={{
                marginTop: "18px",
                padding: "14px",
                background: "rgba(37, 99, 235, 0.12)",
                border: "1.5px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "12px"
              }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={guardarComoFrecuente}
                    onChange={e => {
                      setGuardarComoFrecuente(e.target.checked);
                      if (e.target.checked && !nombreRutaFrecuente) {
                        setNombreRutaFrecuente(origen && destino ? componerRuta(origen, destino) : (nombreRuta || ruta));
                      }
                    }}
                    style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563EB" }}
                  />
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary, #F8FAFC)" }}>
                    ⭐ Guardar también como Ruta Frecuente
                  </span>
                </label>
                <p style={{ fontSize: "11.5px", color: "var(--text-secondary, #94A3B8)", margin: "4px 0 0 28px" }}>
                  Te permitirá precargar kilómetros, combustible y peajes en futuros viajes con un solo clic.
                </p>

                {guardarComoFrecuente && (
                  <div style={{ marginTop: "10px", marginLeft: "28px" }}>
                    <WizardInput
                      placeholder="Nombre de la ruta frecuente (Ej: Barranquilla → Bogotá)"
                      value={nombreRutaFrecuente}
                      onChange={e => setNombreRutaFrecuente(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </WizardCard>
          );
        })()}

        <WizardStepDots total={TOTAL_SUBPASOS_WIZARD} actual={subPasoWizard} />
        <WizardNav
          subPaso={subPasoWizard}
          totalSubPasos={TOTAL_SUBPASOS_WIZARD}
          onAnterior={irSubPasoAnterior}
          onSiguiente={irSubPasoSiguiente}
          onGuardar={guardarViaje}
          guardando={guardando}
          labelGuardar="Guardar viaje"
        />
        <p style={{ textAlign:"center",fontSize:"12px",color:"#9CA3AF",
          margin:"12px 0 0",padding:"0 20px" }}>
          ¿Necesitas opciones de peajes individuales, descuentos o retorno?{" "}
          <button type="button" onClick={cambiarAModoAvanzado}
            style={{ background:"none",border:"none",color:"#3B82F6",
              fontWeight:700,cursor:"pointer",fontSize:"12px",padding:0 }}>
            Usa el modo Avanzado
          </button>
        </p>
      </WizardPantalla>
    );
  }

  // ── MODO AVANZADO: formulario completo ─────────────────────────────────────
  return (
    <div style={styles.pantalla}>
      <datalist id="ciudades-colombia-calc">
        {CIUDADES_COLOMBIA.map(c => <option key={c} value={c} />)}
      </datalist>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blueText} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Calculadora</h1>
        <button
          type="button"
          aria-label="Cambiar a modo guiado"
          onClick={cambiarAModoGuiado}
          style={{
            display:"flex", alignItems:"center", gap:"5px",
            background: t.colors.bgSection,
            border: `1.5px solid ${t.colors.border}`,
            borderRadius: t.radius.full,
            padding:"5px 10px",
            fontSize:"11px", fontWeight: t.fonts.weightBold,
            color: t.colors.textSecondary,
            cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
          }}
        >
          <Zap size={12} strokeWidth={2.5} />
          Guiado
        </button>
      </div>


{rutas.length > 0 && (
  <div style={{padding:"10px 16px 0"}}>
    <button
      style={{
        width:"100%", padding:"11px", background:t.colors.blueSoft,
        border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md,
        fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold,
        color:t.colors.blueText, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"7px"
      }}
      onClick={()=>setMostrarRutas(!mostrarRutas)}
    >
      <MapPin size={15} color={t.colors.blueText} strokeWidth={2.2} />
      {mostrarRutas ? "Cerrar rutas" : `Cargar ruta guardada (${rutas.length})`}
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
    <span style={{fontSize:t.fonts.sizeXs, color:t.colors.green, fontWeight:t.fonts.weightSemibold, display:"flex", alignItems:"center", gap:"6px"}}>
      <MapPin size={13} color={t.colors.green} strokeWidth={2.2} /> Ruta cargada: {rutaCargada}
    </span>
    <button
      style={{background:"none", border:"none", cursor:"pointer", color:t.colors.green, padding:0, display:"flex"}}
      onClick={()=>setRutaCargada(null)}
    >
      <X size={14} color={t.colors.green} />
    </button>
  </div>
)}

    {mostrarRutas && (
      <div style={{background:t.colors.bgCard, borderRadius:t.radius.lg, marginTop:"8px", overflow:"hidden", border:`1px solid ${t.colors.borderLight}`, boxShadow:t.shadows.card}}>
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
                style={{padding:"6px 10px", background:t.colors.redSoft, border:`1px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, cursor:"pointer", display:"flex", alignItems:"center"}}
                onClick={()=>onEliminarRuta(r.firestoreId)}
              >
                <X size={13} color={t.colors.red} />
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
        <div style={{margin:"10px 16px 0",padding:"11px 14px",background:t.colors.blueSoft,border:`1.5px solid ${t.colors.blueBorder}`,borderRadius:t.radius.md,display:"flex",gap:"10px",alignItems:"flex-start"}}>
          <Lightbulb size={17} color={t.colors.blueText} strokeWidth={2} style={{flexShrink:0, marginTop:"1px"}} />
          <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:0,lineHeight:1.5}}>
            <strong style={{color:t.colors.textPrimary}}>Su primer cálculo:</strong> solo necesita ruta, kilómetros, toneladas y flete. Las demás secciones (combustible, peajes, costos) las abre tocándolas. Todo lo demás es opcional.
          </p>
        </div>
      )}

      {/* ── DATOS DEL VIAJE ── */}
      {(!modoGuiado || pasoActual === 1 || pasoActual === 2) && (
      <SeccionHeader num="1" ok={okDatos} label="Datos del viaje" abierta={secDatos} onToggle={()=>setSecDatos(!secDatos)} />
      )}
      {(!modoGuiado || pasoActual === 1 || pasoActual === 2) && secDatos && (<div style={{padding:"0 20px"}}>
      <div style={styles.card}>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-668" style={styles.label}>Fecha de cargue</label>
            <input id="a11y-Calculadora-668" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-672" style={styles.label}>Fecha de descargue</label>
            <input id="a11y-Calculadora-672" type="date" value={fechaDescarga} onChange={e=>setFechaDescarga(e.target.value)} style={styles.input} />
          </div>
        </div>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-678" style={styles.label}>Placa vehículo</label>
            <select id="a11y-Calculadora-678" value={placa} onChange={e=>setPlaca(e.target.value)}
              style={{...styles.input, color: placa ? t.colors.textPrimary : t.colors.textTertiary}}>
              <option value="">Escoge tu vehículo...</option>
              {vehiculos.map(v=>(
                <option key={v.firestoreId} value={v.placa}>{v.placa} — {v.tipoVehiculo}</option>
              ))}
            </select>
          </div>
          <div style={styles.campo}>
  <label htmlFor="a11y-Calculadora-688" style={styles.label}>Tipo de carga</label>
  <select id="a11y-Calculadora-688" value={tipoCarga} onChange={e=>setTipoCarga(e.target.value)} style={styles.input}>
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
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1882" style={styles.label}>Origen (Cargue)</label>
            <input
              id="a11y-Calculadora-1882"
              type="text"
              placeholder="Barranquilla"
              list="ciudades-colombia-calc"
              value={origen}
              onChange={e => manejarOrigenChange(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1893" style={styles.label}>Destino (Entrega)</label>
            <input
              id="a11y-Calculadora-1893"
              type="text"
              placeholder="Bogotá D.C."
              list="ciudades-colombia-calc"
              value={destino}
              onChange={e => manejarDestinoChange(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1907" style={styles.label}>Producto</label>
            <select
              id="a11y-Calculadora-1907"
              value={modoOtroProd ? "__OTRO__" : (listaProductos.includes(producto) ? producto : "__OTRO__")}
              onChange={e => manejarCambioProducto(e.target.value)}
              style={{...styles.input, marginBottom: "6px", color: t.colors.textPrimary}}
            >
              <option value="">Seleccionar producto...</option>
              {listaProductos.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
              <option value="__OTRO__">➕ Otro producto...</option>
            </select>
            {(modoOtroProd || (!listaProductos.includes(producto) && producto)) && (
              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                <input
                  id="a11y-Calculadora-1921"
                  type="text"
                  placeholder="Nombre de producto"
                  value={modoOtroProd ? otroProdTexto : producto}
                  onChange={e => modoOtroProd ? setOtroProdTexto(e.target.value) : setProducto(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                />
                {modoOtroProd && (
                  <button
                    type="button"
                    onClick={guardarNuevoProducto}
                    style={{ padding: "0 12px", background: t.colors.blue, color: "#fff", border: "none", borderRadius: t.radius.sm, fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, cursor: "pointer" }}
                  >
                    Guardar
                  </button>
                )}
              </div>
            )}
          </div>

   <div style={styles.campo}>
  <label htmlFor="a11y-Calculadora-743" style={styles.label}>Empresa</label>
  {empresasFrecuentes.length > 0 && (
    <select id="a11y-Calculadora-743"
      value={empresasFrecuentes.includes(empresa) ? empresa : "__nueva__"}
      onChange={e => {
        if (e.target.value === "__nueva__") {
          setEmpresa("");
          setNitEmpresa("");
        } else {
          setEmpresa(e.target.value);
          setNitEmpresa(nitDeEmpresa(e.target.value)); // trae el NIT si lo tiene
        }
      }}
      style={{...styles.input, marginBottom:"6px", color: t.colors.textPrimary}}
    >
      <option value="__nueva__">Nueva empresa</option>
      {empresasFrecuentes.map((emp, i) => (
        <option key={i} value={emp}>{emp}{nitDeEmpresa(emp) ? " ✓" : ""}</option>
      ))}
    </select>
  )}
  {(!empresasFrecuentes.includes(empresa) || empresasFrecuentes.length === 0) && (
    <>
      <input
        type="text"
        placeholder="TransABC"
        value={empresa}
        onChange={e => setEmpresa(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="NIT (opcional, ej: 900.123.456-7)"
        value={nitEmpresa}
        onChange={e => setNitEmpresa(e.target.value)}
        style={{...styles.input, marginTop:"6px"}}
      />
      <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"4px 0 0"}}>
        El NIT se guarda una vez y se usa para sus cuentas de cobro.
      </p>
    </>
  )}
</div>

        </div>
        <div style={styles.campo}>
  <label htmlFor="a11y-Calculadora-789" style={styles.label}>Conductor</label>
  <select id="a11y-Calculadora-789"
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
  <label htmlFor="a11y-Calculadora-806" style={styles.label}>Manifiesto</label>
  <input id="a11y-Calculadora-806" type="text" placeholder="123456789" value={mani}
    onChange={e=>setMani(e.target.value)} style={styles.input}/>
  {mani.trim() && viajes.some(v => v.mani && v.mani.trim().toLowerCase() === mani.trim().toLowerCase()) && (
    <p style={{fontSize:t.fonts.sizeXs,color:t.colors.amber,margin:"4px 0 0",display:"flex",alignItems:"center",gap:"5px"}}>
      <AlertTriangle size={13} color={t.colors.amber} strokeWidth={2.2} /> Este manifiesto ya existe en otro viaje. Verifique el número.
    </p>
  )}
</div>

  <div style={styles.fila2}>
  <div style={styles.campo}>
    <label htmlFor="a11y-Calculadora-818" style={styles.label}>N° Remesa</label>
    <input id="a11y-Calculadora-818" type="text" placeholder="REM-001" value={remesa}
      onChange={e=>setRemesa(e.target.value)} style={styles.input}/>
  </div>
  <div style={styles.campo}>
    <label htmlFor="a11y-Calculadora-823" style={styles.label}>Peso báscula (ton)</label>
    <input id="a11y-Calculadora-823" type="number" placeholder="34.5" value={pesoBascula}
      onChange={e=>setPesoBascula(e.target.value)} style={styles.input}/>
  </div>
</div>

<div style={styles.fila2}>
  <div style={styles.campo}>
    <label htmlFor="a11y-Calculadora-831" style={styles.label}>Lugar de cargue</label>
    <input id="a11y-Calculadora-831" type="text" placeholder="Bodega X, Km 5" value={lugarCargue}
      onChange={e=>setLugarCargue(e.target.value)} style={styles.input}/>
  </div>
  <div style={styles.campo}>
    <label htmlFor="a11y-Calculadora-836" style={styles.label}>Lugar de descargue</label>
    <input id="a11y-Calculadora-836" type="text" placeholder="Puerto Y" value={lugarDescargue}
      onChange={e=>setLugarDescargue(e.target.value)} style={styles.input}/>
  </div>
</div>

<div style={styles.campo}>
  <label htmlFor="a11y-Calculadora-843" style={styles.label}>Observaciones</label>
  <input id="a11y-Calculadora-843" type="text" placeholder="Novedades del viaje..." value={observaciones}
    onChange={e=>setObservaciones(e.target.value)} style={styles.input}/>
</div>
        {!tieneRetorno ? (
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-850" style={styles.label}>Km cargado</label>
            <input id="a11y-Calculadora-850" type="number" placeholder="300" value={kmCargado} onChange={e=>setKmCargado(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-854" style={styles.label}>Km vacío</label>
            <input id="a11y-Calculadora-854" type="number" placeholder="100" value={kmVacio} onChange={e=>setKmVacio(e.target.value)} style={styles.input} />
          </div>
        </div>
        ) : (
        <div>
          <div style={styles.fila2}>
            <div style={styles.campo}>
              <label htmlFor="a11y-Calculadora-862" style={styles.label}>Km cargado ida</label>
              <input id="a11y-Calculadora-862" type="number" placeholder="450" value={kmCargado} onChange={e=>setKmCargado(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.campo}>
              <label htmlFor="a11y-Calculadora-866" style={styles.label}>Km vacío ida</label>
              <input id="a11y-Calculadora-866" type="number" placeholder="120" value={kmVacio} onChange={e=>setKmVacio(e.target.value)} style={styles.input} />
            </div>
          </div>
          <div style={styles.fila2}>
            <div style={styles.campo}>
              <label htmlFor="a11y-Calculadora-872" style={styles.label}>Km cargado retorno</label>
              <input id="a11y-Calculadora-872" type="number" placeholder="380" value={kmCargadoRet} onChange={e=>setKmCargadoRet(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.campo}>
              <label htmlFor="a11y-Calculadora-876" style={styles.label}>Km vacío retorno</label>
              <input id="a11y-Calculadora-876" type="number" placeholder="60" value={kmVacioRet} onChange={e=>setKmVacioRet(e.target.value)} style={styles.input} />
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
  <label htmlFor="a11y-Calculadora-890" style={styles.label}>Modo de pago del flete</label>
  <select id="a11y-Calculadora-890"
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
    <label htmlFor="a11y-Calculadora-903" style={styles.label}>Toneladas</label>
    <input id="a11y-Calculadora-903"
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
      <label htmlFor="a11y-Calculadora-915" style={styles.label}>Flete ($/ton)</label>
      <input id="a11y-Calculadora-915"
        type="number"
        placeholder="80000"
        value={fleteTon}
        onChange={e => setFleteTon(e.target.value)}
        style={styles.input}
      />
    </div>
  ) : (
    <div style={styles.campo}>
      <label htmlFor="a11y-Calculadora-926" style={styles.label}>Valor del viaje ($)</label>
      <input id="a11y-Calculadora-926"
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
            {modoFlete === "porTon" && n(fleteTon) > 300000 && (
              <div style={{padding:"9px 12px",background:t.colors.amberSoft,border:`1.5px solid ${t.colors.amberBorder}`,borderRadius:t.radius.sm,marginBottom:"6px",display:"flex",alignItems:"flex-start",gap:"9px"}}>
                <AlertTriangle size={16} color={t.colors.amber} strokeWidth={2.2} style={{flexShrink:0, marginTop:"1px"}} />
                <div>
                  <p style={{fontSize:t.fonts.sizeXs,color:t.colors.amber,fontWeight:t.fonts.weightBold,margin:0}}>¿Seguro que es $/ton?</p>
                  <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>
                    El flete por tonelada normalmente es entre $40.000 y $300.000/ton. Si el valor es el total del viaje, cambie a modo &quot;Fijo ($/Viaje)&quot;.
                  </p>
                </div>
              </div>
            )}
            {(() => {
              const valorIda = modoFlete === "porTon" ? n(tonelaje) * n(fleteTon) : n(fleteTon);
              const valorRet = valorViaje - valorIda;
              if (!tieneRetorno || valorRet <= 0) {
                // Sin retorno: como siempre
                return (
                  <div style={styles.valorViajeBox}>
                    <span style={styles.valorViajeLabel}>
                      {modoFlete === "porTon"
                        ? fnD(n(tonelaje),2) + " ton x $" + Math.round(n(fleteTon)).toLocaleString("es-CO") + "/ton"
                        : "Valor fijo por viaje"}
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

        {/* ANTICIPO Y SALDO DEL FLETE (EMPRESA) */}
        {valorViaje > 0 && (
          <div style={{
            marginTop: "12px",
            padding: "12px",
            background: t.colors.bgSection,
            borderRadius: t.radius.md,
            border: `1.5px solid ${t.colors.borderLight}`
          }}>
            <p style={{
              fontSize: t.fonts.sizeSm,
              fontWeight: t.fonts.weightBold,
              color: t.colors.blueText,
              margin: "0 0 10px 0"
            }}>Anticipos del Flete (Empresa)</p>

            {/* Ida */}
            <div style={{ marginBottom: tieneRetorno ? "12px" : "0" }}>
              {tieneRetorno && <p style={{ fontSize: "11px", color: t.colors.textSecondary, fontWeight: 700, margin: "0 0 6px" }}>1. TRAYECTO DE IDA</p>}
              <div style={styles.fila2}>
                <div style={styles.campo}>
                  <label htmlFor="a11y-Calculadora-1012" style={styles.label}>Anticipo Ida (%)</label>
                  <input id="a11y-Calculadora-1012"
                    type="number"
                    placeholder="60"
                    value={pctAnticipoFlete}
                    onChange={e => manejarPctAnticipoChange(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.campo}>
                  <label htmlFor="a11y-Calculadora-1022" style={styles.label}>Valor Anticipo Ida ($)</label>
                  <input id="a11y-Calculadora-1022"
                    type="number"
                    placeholder="Monto recibido"
                    value={montoAnticipoFlete}
                    onChange={e => manejarMontoAnticipoChange(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
              {tieneRetorno && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: t.colors.textTertiary }}>Saldo por cobrar Ida:</span>
                  <span style={{ fontSize: "11px", color: t.colors.textSecondary, fontWeight: 700 }}>{fmt(valorViajeIda - n(montoAnticipoFlete))}</span>
                </div>
              )}
            </div>

            {/* Retorno */}
            {tieneRetorno && (
              <div style={{ borderTop: `1px solid ${t.colors.borderLight}`, paddingTop: "12px", marginBottom: "12px" }}>
                <p style={{ fontSize: "11px", color: t.colors.textSecondary, fontWeight: 700, margin: "0 0 6px" }}>2. TRAYECTO DE RETORNO</p>
                <div style={styles.fila2}>
                  <div style={styles.campo}>
                    <label htmlFor="a11y-Calculadora-1046" style={styles.label}>Anticipo Retorno (%)</label>
                    <input id="a11y-Calculadora-1046"
                      type="number"
                      placeholder="60"
                      value={pctAnticipoFleteRet}
                      onChange={e => manejarPctAnticipoRetChange(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.campo}>
                    <label htmlFor="a11y-Calculadora-1056" style={styles.label}>Valor Anticipo Retorno ($)</label>
                    <input id="a11y-Calculadora-1056"
                      type="number"
                      placeholder="Monto recibido"
                      value={montoAnticipoFleteRet}
                      onChange={e => manejarMontoAnticipoRetChange(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: t.colors.textTertiary }}>Saldo por cobrar Retorno:</span>
                  <span style={{ fontSize: "11px", color: t.colors.textSecondary, fontWeight: 700 }}>{fmt(valorViajeRetorno - n(montoAnticipoFleteRet))}</span>
                </div>
              </div>
            )}

            {/* Consolidado */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0 0",
              marginTop: "8px",
              borderTop: `1px solid ${t.colors.borderLight}`
            }}>
              <span style={{ fontSize: t.fonts.sizeSm, color: t.colors.textSecondary, fontWeight: tieneRetorno ? 700 : 400 }}>
                {tieneRetorno ? "Saldo Total por Cobrar (Flete):" : "Saldo por cobrar (Flete):"}
              </span>
              <span style={{
                fontSize: t.fonts.sizeSm,
                fontWeight: t.fonts.weightBold,
                color: t.colors.green
              }}>{fmt(valorViaje - n(montoAnticipoFlete) - n(montoAnticipoFleteRet))}</span>
            </div>
          </div>
        )}
      </div>


        {/* RETORNO */}
      <div style={{marginTop:"10px"}}>
      <button
        type="button"
        role="switch"
        aria-checked={tieneRetorno}
        aria-label="¿Regresa con carga? (flete de retorno)"
        style={{display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", background:"none", border:"none", padding:0, font:"inherit"}}
        onClick={()=>setTieneRetorno(!tieneRetorno)}
      >
        <div style={{width:"42px",height:"24px",borderRadius:"12px",background:tieneRetorno?t.colors.blue:t.colors.border,position:"relative",transition:"background 0.2s",flexShrink:0}}>
          <div style={{width:"20px",height:"20px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:tieneRetorno?"20px":"2px",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}} />
        </div>
        <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightMedium, color:t.colors.textPrimary, cursor:"pointer"}}>
          ¿Regresa con carga? (flete de retorno)
        </span>
      </button>

        {tieneRetorno && (
        <div style={{marginTop:"12px", padding:"12px", background:t.colors.bgSection, borderRadius:t.radius.md}}>

        <div style={styles.campo}>
          <label htmlFor="a11y-Calculadora-1117" style={styles.label}>Ruta retorno (Origen → Destino)</label>
          <input id="a11y-Calculadora-1117" type="text" placeholder="Cali – Barranquilla" value={rutaRet}
            onChange={e=>setRutaRet(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1124" style={styles.label}>Fecha cargue retorno</label>
            <input id="a11y-Calculadora-1124" type="date" value={fechaCargueRet} onChange={e=>setFechaCargueRet(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1128" style={styles.label}>Fecha descargue retorno</label>
            <input id="a11y-Calculadora-1128" type="date" value={fechaDescargueRet} onChange={e=>setFechaDescargueRet(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1135" style={styles.label}>Lugar de cargue</label>
            <input id="a11y-Calculadora-1135" type="text" placeholder="Bodega, puerto..." value={lugarCargueRet}
              onChange={e=>setLugarCargueRet(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1140" style={styles.label}>Lugar de descargue</label>
            <input id="a11y-Calculadora-1140" type="text" placeholder="Planta, bodega..." value={lugarDescargueRet}
              onChange={e=>setLugarDescargueRet(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1148" style={styles.label}>Tipo de carga</label>
            <select id="a11y-Calculadora-1148" value={tipoCargaRet} onChange={e=>setTipoCargaRet(e.target.value)} style={styles.input}>
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
            <label htmlFor="a11y-Calculadora-1165" style={styles.label}>Producto</label>
            <input id="a11y-Calculadora-1165" type="text" placeholder="Carbón, arroz..." value={productoRet}
              onChange={e=>setProductoRet(e.target.value)} style={styles.input} />
          </div>
        </div>


          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1173" style={styles.label}>Empresa</label>
            {empresasFrecuentes.length > 0 && (
              <select id="a11y-Calculadora-1173"
                value={empresasFrecuentes.includes(empresaRet) ? empresaRet : "__nueva__"}
                onChange={e => {
                  if (e.target.value === "__nueva__") {
                    setempresaRet("");
                    setNitEmpresaRet("");
                  } else {
                    setempresaRet(e.target.value);
                    setNitEmpresaRet(nitDeEmpresa(e.target.value));
                  }
                }}
                style={{...styles.input, marginBottom:"6px", color: t.colors.textPrimary}}
              >
                <option value="__nueva__">Nueva empresa</option>
                {empresasFrecuentes.map((emp, i) => (
                  <option key={i} value={emp}>{emp}{nitDeEmpresa(emp) ? " ✓" : ""}</option>
                ))}
              </select>
            )}
            {(!empresasFrecuentes.includes(empresaRet) || empresasFrecuentes.length === 0) && (
              <>
                <input type="text" placeholder="Nombre empresa" value={empresaRet}
                  onChange={e=>setempresaRet(e.target.value)} style={styles.input} />
                <input type="text" placeholder="NIT (opcional, ej: 900.123.456-7)"
                  value={nitEmpresaRet}
                  onChange={e=>setNitEmpresaRet(e.target.value)}
                  style={{...styles.input, marginTop:"6px"}} />
              </>
            )}
          </div>



        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1210" style={styles.label}>Manifiesto</label>
            <input id="a11y-Calculadora-1210" type="text" placeholder="MAN-001" value={maniRet}
              onChange={e=>setManiRet(e.target.value)} style={styles.input} />
              {maniRet.trim() && viajes.some(v => (v.mani && v.mani.trim().toLowerCase() === maniRet.trim().toLowerCase()) || (v.maniRet && v.maniRet.trim().toLowerCase() === maniRet.trim().toLowerCase())) && (
               <p style={{fontSize:t.fonts.sizeXs,color:t.colors.amber,margin:"4px 0 0",display:"flex",alignItems:"center",gap:"5px"}}>
                <AlertTriangle size={13} color={t.colors.amber} strokeWidth={2.2} /> Este manifiesto ya existe en otro viaje. Verifique el número.
                </p>
              )}
          </div>

        <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1221" style={styles.label}>N° Remesa</label>
            <input id="a11y-Calculadora-1221" type="text" placeholder="REM-001" value={remesaRet}
              onChange={e=>setRemesaRet(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.campo}>
          <label htmlFor="a11y-Calculadora-1228" style={styles.label}>Peso báscula (ton)</label>
          <input id="a11y-Calculadora-1228" type="number" placeholder="34.5" value={pesoBasRet}
            onChange={e=>setPesoBasRet(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.campo}>
        <label htmlFor="a11y-Calculadora-1234" style={styles.label}>Modo de pago retorno</label>
        <select id="a11y-Calculadora-1234"
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
          <label htmlFor="a11y-Calculadora-1246" style={styles.label}>Toneladas retorno</label>
          <input id="a11y-Calculadora-1246" type="number" placeholder="30" step="0.01" value={tonelajeRetorno}
            onChange={e=>setTonelajeRetorno(e.target.value)} style={styles.input} />
        </div>
        {modoFleteRetorno === "porTon" ? (
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1252" style={styles.label}>Flete retorno ($/ton)</label>
            <input id="a11y-Calculadora-1252" type="number" placeholder="60000" value={fleteRetorno}
              onChange={e=>setFleteRetorno(e.target.value)} style={styles.input} />
          </div>
        ) : (
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1258" style={styles.label}>Valor retorno ($)</label>
            <input id="a11y-Calculadora-1258" type="number" placeholder="1500000" value={fleteRetorno}
              onChange={e=>setFleteRetorno(e.target.value)} style={styles.input} />
          </div>
        )}
      </div>
      {valorViajeRetorno > 0 && (
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px", borderTop:`1px solid ${t.colors.border}`}}>
          <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>Flete retorno</span>
          <span style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.blueText}}>{fmt(valorViajeRetorno)}</span>
        </div>
      )}
    </div>
  )}
</div>

      </div>)}

      {/* ── COMBUSTIBLE ── */}
      {(!modoGuiado || pasoActual === 3) && (
      <SeccionHeader num="2" ok={okComb} label="Combustible / Adblue" abierta={secComb} onToggle={()=>setSecComb(!secComb)} />
      )}
      {(!modoGuiado || pasoActual === 3) && secComb && (<div style={{padding:"0 20px"}}>
      <div style={styles.card}>
        <div style={styles.campo}>
          <label htmlFor="a11y-Calculadora-1281" style={styles.label}>Modo de cálculo</label>
          <select id="a11y-Calculadora-1281" value={modoComb} onChange={e=>setModoComb(e.target.value)} style={styles.input}>
            <option value="auto">Rendimiento (Km/Gal)</option>
            <option value="manual">Consumo total (Gal/viaje)</option>
          </select>
        </div>
        {modoComb === "auto" ? (
          <div style={styles.fila2}>
            <div style={styles.campo}>
              <label htmlFor="a11y-Calculadora-1290" style={styles.label}>Cargado (Km/Gal)</label>
              <input id="a11y-Calculadora-1290" type="number" placeholder="7" step="0.1" value={rendCargado} onChange={e=>setRendCargado(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.campo}>
              <label htmlFor="a11y-Calculadora-1294" style={styles.label}>Vacío (Km/Gal)</label>
              <input id="a11y-Calculadora-1294" type="number" placeholder="11" step="0.1" value={rendVacio} onChange={e=>setRendVacio(e.target.value)} style={styles.input} />
            </div>
          </div>
        ) : (
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1300" style={styles.label}>Total galones</label>
            <input id="a11y-Calculadora-1300" type="number" placeholder="120" value={galManual} onChange={e=>setGalManual(e.target.value)} style={styles.input} />
          </div>
        )}
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1306" style={styles.label}>Precio ACPM ($/gal)</label>
            <input id="a11y-Calculadora-1306" type="number" placeholder="10500" value={precioAcpm} onChange={e=>setPrecioAcpm(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label htmlFor="a11y-Calculadora-1310" style={styles.label}>Precio Adblue ($/lt)</label>
            <input id="a11y-Calculadora-1310" type="number" placeholder="3500" value={precioAdblue} onChange={e=>setPrecioAdblue(e.target.value)} style={styles.input} />
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
      {(!modoGuiado || pasoActual === 4) && (
      <SeccionHeader num="3" ok={okPeajes} label="Peajes de ruta" abierta={secPeajes} onToggle={()=>setSecPeajes(!secPeajes)} />
      )}
      {(!modoGuiado || pasoActual === 4) && secPeajes && (<div style={{padding:"0 20px"}}>
      <div style={styles.card}>
        <div style={styles.campo}>
          <label htmlFor="a11y-Calculadora-1337" style={styles.label}>Categoría del vehículo</label>
          <select id="a11y-Calculadora-1337" value={categoria} onChange={e=>setCategoria(e.target.value)} style={styles.input}>
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
          <button type="button" aria-label="Agregar peaje a la ruta" style={styles.btnAgregarP} onClick={agregarPeaje}>
            <Plus size={16} color="#fff" strokeWidth={2.5} />
          </button>
        </div>

        {peajesRuta.length > 0 && (
          <div style={styles.peajesTags}>
            {peajesRuta.map(p=>{
              const tarifa = obtenerTarifa(p, categoria);
              const total  = tarifa*(p.iv?2:1);
              return (
                <div key={p.c} style={styles.peajeTag}>
                  <span style={styles.peajeTagNom}>{p.n} — {fmt(total)}</span>
                  <button
                    style={{...styles.peajeTagBtn, background: p.iv ? t.colors.greenSoft : t.colors.blueSoft, color: p.iv ? t.colors.green : t.colors.blueText}}
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
      {(!modoGuiado || pasoActual === 4) && (
      <SeccionHeader num="4" ok={okCostos} label="Costos del viaje" abierta={secCostos} onToggle={()=>setSecCostos(!secCostos)} />
      )}
      {(!modoGuiado || pasoActual === 4) && secCostos && (<div style={{padding:"0 20px"}}>
      <div style={styles.card}>
        <div style={styles.campo}>
  <label htmlFor="a11y-Calculadora-1406" style={styles.label}>Modo de pago conductor</label>
  <select id="a11y-Calculadora-1406"
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
        <label htmlFor="a11y-Calculadora-1424" style={styles.label}>% Conductor</label>
        <input id="a11y-Calculadora-1424" type="number" placeholder="10" value={porcCond}
          onChange={e=>setPorcCond(e.target.value)} style={styles.input} />
      </>
    ) : (
      <>
        <label htmlFor="a11y-Calculadora-1430" style={styles.label}>Valor conductor ($)</label>
        <input id="a11y-Calculadora-1430" type="number" placeholder="200000" value={porcCond}
          onChange={e=>setPorcCond(e.target.value)} style={styles.input} />
      </>
    )}
  </div>
  <div style={styles.campo}>
    <label htmlFor="a11y-Calculadora-1437" style={styles.label}>Carpado/Descarpado</label>
    <input id="a11y-Calculadora-1437" type="number" placeholder="20000" value={carpado}
      onChange={e=>setCarpado(e.target.value)} style={styles.input} />
  </div>
</div>
        <div style={styles.campo}>
          <label htmlFor="a11y-Calculadora-1443" style={styles.label}>Gastos de viaje</label>
          <input id="a11y-Calculadora-1443" type="number" placeholder="30000" value={gastosViaje} onChange={e=>setGastosViaje(e.target.value)} style={styles.input} />
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
          <Plus size={14} color={t.colors.blueText} strokeWidth={2.5} />
          Agregar costo
        </button>
      </div>

      </div>)}

      {/* ── DESCUENTOS DE LEY ── */}
      {(!modoGuiado || pasoActual === 4) && (
      <SeccionHeader num="5" ok={okDesc} label="Descuentos de ley" abierta={secDesc} onToggle={()=>setSecDesc(!secDesc)} />
      )}
{(!modoGuiado || pasoActual === 4) && secDesc && (<div style={{padding:"0 20px"}}>
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
      <button
        type="button"
        role="switch"
        aria-checked={d.activo}
        aria-label={d.label}
        style={{display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", background:"none", border:"none", padding:0, font:"inherit", textAlign:"left"}}
        onClick={()=>d.setActivo(!d.activo)}
      >
        <div style={{width:"36px",height:"20px",borderRadius:"10px",background:d.activo?t.colors.blue:t.colors.border,position:"relative",transition:"background 0.2s",flexShrink:0}}>
          <div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:d.activo?"18px":"2px",transition:"left 0.2s",boxShadow:"0 1px 2px rgba(0,0,0,0.3)"}} />
        </div>
        <div>
          <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>{d.label}</p>
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"2px 0 0"}}>{d.sub}</p>
        </div>
      </button>
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
    <button
      type="button"
      role="switch"
      aria-checked={descOtro}
      aria-label="Otro descuento"
      style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px", cursor:"pointer", background:"none", border:"none", padding:0, font:"inherit"}}
      onClick={()=>setDescOtro(!descOtro)}
    >
      <div style={{width:"36px",height:"20px",borderRadius:"10px",background:descOtro?t.colors.blue:t.colors.border,position:"relative",transition:"background 0.2s",flexShrink:0}}>
        <div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:descOtro?"18px":"2px",transition:"left 0.2s",boxShadow:"0 1px 2px rgba(0,0,0,0.3)"}} />
      </div>
      <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>Otro descuento</p>
    </button>
    {descOtro && (
      <div style={styles.fila2}>
        <div style={styles.campo}>
          <label htmlFor="a11y-Calculadora-1556" style={styles.label}>Nombre</label>
          <input id="a11y-Calculadora-1556"
            type="text" placeholder="Ej: Pronto pago"
            value={nombreOtro} onChange={e=>setNombreOtro(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.campo}>
          <label htmlFor="a11y-Calculadora-1564" style={styles.label}>Porcentaje (%)</label>
          <input id="a11y-Calculadora-1564"
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
      {(!modoGuiado || pasoActual === 4) && (
      <div style={{...styles.seccionHeader, cursor:"default"}}>
        <span style={styles.seccionHead}>
          <span style={{...styles.stepBadge, background:t.colors.greenSoft, color:t.colors.green}}>
            <Check size={13} strokeWidth={3} />
          </span>
          <span style={styles.seccionLabel}>Resultado del viaje</span>
        </span>
      </div>
      )}
      {(!modoGuiado || pasoActual === 4) && (
      <div style={styles.card}>
        <div style={styles.fila2}>
          <div style={styles.metCard}>
            <p style={styles.metLabel}>Total viaje</p>
            <p style={{...styles.metVal, ...t.numeric, color: t.colors.blueText}}>{valorViaje>0?fmt(valorViaje):"$—"}</p>
          </div>
          <div style={styles.metCard}>
            <p style={styles.metLabel}>Total gastos</p>
            <p style={{...styles.metVal, ...t.numeric, color: t.colors.red}}>{totalGastos>0?fmt(totalGastos):"$—"}</p>
          </div>
        </div>

        {/* GANANCIA — protagonista (titular a lo ancho) */}
        <div style={{
          ...styles.gananciaResultBox,
          background: gananciaNeta >= 0 ? t.colors.greenSoft : t.colors.redSoft,
          borderColor: gananciaNeta >= 0 ? t.colors.greenBorder : t.colors.redBorder,
        }}>
          <p style={styles.gananciaResultLabel}>Ganancia neta</p>
          <p style={{...styles.gananciaResultVal, ...t.numeric, color: gananciaNeta>=0?t.colors.green:t.colors.red}}>
            {valorViaje>0?fmt(gananciaNeta):"$—"}
          </p>
        </div>

        {valorViaje > 0 && <>
          {/* MEDIDOR DE MARGEN + métricas clave */}
          <div style={styles.gaugeRow}>
            <div style={styles.gauge}>
              {(() => {
                const r = 42, circ = 2 * Math.PI * r;
                const pct = Math.min(Math.max(margen, 0), 100);
                const off = circ * (1 - pct / 100);
                return (
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke={t.colors.bgSection} strokeWidth="11" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke={margenColor} strokeWidth="11" strokeLinecap="round"
                      strokeDasharray={circ} strokeDashoffset={off} transform="rotate(-90 50 50)" />
                  </svg>
                );
              })()}
              <div style={styles.gaugeCap}>
                <span style={{...styles.gaugePc, ...t.numeric, color: margenColor}}>{margen.toFixed(0)}%</span>
                <span style={styles.gaugePl}>Margen</span>
              </div>
            </div>
            <div style={styles.gaugeStats}>
              <div style={styles.gStat}><span style={styles.gStatL}>Costo por km</span><span style={{...styles.gStatV, ...t.numeric}}>{kmTotal>0?fmt(cxkm):"—"}</span></div>
              <div style={styles.gStat}><span style={styles.gStatL}>Recorrido</span><span style={{...styles.gStatV, ...t.numeric}}>{kmTotal>0?kmTotal.toLocaleString("es-CO")+" km":"—"}</span></div>
              <div style={styles.gStat}><span style={styles.gStatL}>Ganancia / ton</span><span style={{...styles.gStatV, ...t.numeric, color: gananciaNeta>=0?t.colors.green:t.colors.red}}>{n(tonelaje)>0?fmt(gananciaNeta/n(tonelaje)):"—"}</span></div>
            </div>
          </div>

          {/* DESGLOSE de gastos */}
          <div style={{marginTop:"14px", borderTop:`1px solid ${t.colors.borderLight}`, paddingTop:"4px"}}>
            {[
              {l:`ACPM (${fnD(galTotal,1)} gal)`,  v: costoAcpm},
              {l:`Adblue (${fnD(adblLt,1)} lt)`,   v: costoAdbl},
              {l:"Peajes",                          v: totPeajes},
              {l: modoConductor === "porcentaje" ?  "Conductor (" + n(porcCond) + "%)" : "Conductor (valor fijo)", v: costoConduct},
              {l:"Carpado/Descarpado",              v: n(carpado)},
              {l:"Gastos de viaje",                 v: n(gastosViaje)},
              {l:"Otros gastos",                    v: totExtras},
              {l:"Descuentos de ley",               v: totalDesc},
            ].filter(r=>r.v>0).map((r,idx,arr)=>(
              <div key={r.l} style={{...styles.desgloseFila, borderBottom: idx===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <span style={styles.desgloseL}>{r.l}</span>
                <span style={{...styles.desgloseV, ...t.numeric}}>{fmt(r.v)}</span>
              </div>
            ))}
          </div>
        </>}

        {/* GUARDAR RUTA */}
        <div style={{borderTop:`1px solid ${t.colors.borderLight}`, paddingTop:"12px", marginTop:"14px", marginBottom:"12px"}}>
          {!mostrarGuardar ? (
            <button
              style={{width:"100%", padding:"9px", background:"none", border:`1.5px dashed ${t.colors.blueBorder}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.blueText, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", fontWeight:t.fonts.weightSemibold}}
              onClick={()=>setMostrarGuardar(true)}
            >
              <Plus size={15} color={t.colors.blueText} strokeWidth={2.5} /> Guardar como ruta frecuente
            </button>
          ) : (
            <div>
              <div style={styles.campo}>
                <label htmlFor="a11y-Calculadora-1685" style={styles.label}>Nombre de la ruta</label>
                <input id="a11y-Calculadora-1685" type="text" placeholder="Ej: Barranquilla - Bogotá" value={nombreRuta} onChange={e=>setNombreRuta(e.target.value)} style={styles.input} />
              </div>
              <div style={{display:"flex", gap:"8px"}}>
                <button style={{flex:1, padding:"10px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", opacity:guardandoRuta?0.75:1}} onClick={guardarRutaFrecuente} disabled={guardandoRuta}>
                  {guardandoRuta ? <><span className="navira-spinner" /> Guardando...</> : "Guardar ruta"}
                </button>
                <button style={{padding:"10px 14px", background:"none", border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, cursor:"pointer"}} onClick={()=>{setMostrarGuardar(false);setNombreRuta("");}}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* WIZARD: Navegación Anterior/Siguiente */}
        {modoGuiado && (
          <div style={{
            display:"flex", gap:"10px",
            borderTop:`1px solid ${t.colors.borderLight}`,
            paddingTop:"14px", marginTop:"10px", marginBottom:"12px"
          }}>
            {pasoActual > 1 && (
              <button
                type="button"
                onClick={() => setPasoActual(pasoActual - 1)}
                style={{
                  flex:1, minHeight:"48px", display:"flex", alignItems:"center",
                  justifyContent:"center", gap:"8px",
                  background:"none", border:`1.5px solid ${t.colors.border}`,
                  borderRadius:t.radius.md, fontSize:t.fonts.sizeMd,
                  fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary,
                  cursor:"pointer",
                }}
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
                Anterior
              </button>
            )}
            {pasoActual < 4 && (
              <button
                type="button"
                onClick={() => setPasoActual(pasoActual + 1)}
                style={{
                  flex:2, minHeight:"48px", display:"flex", alignItems:"center",
                  justifyContent:"center", gap:"8px",
                  background: t.colors.blue,
                  border:"none", borderRadius:t.radius.md,
                  fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold,
                  color:"#fff", cursor:"pointer",
                  boxShadow:"0 4px 14px rgba(59,130,246,0.35)",
                }}
              >
                Siguiente
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}

        <button
          style={{...styles.btnGuardar, opacity: guardando?0.75:1}}
          onClick={guardarViaje}
          disabled={guardando}
        >
          {guardando ? (
            <><span className="navira-spinner" /> Guardando...</>
          ) : (
            <><Save size={18} color="#fff" strokeWidth={2} /> Guardar viaje</>
          )}
        </button>
      </div>
      )}

    </div>
  );
}

// Encabezado de sección con paso numerado (solo presentación)
// Definido a nivel de módulo: antes se creaba dentro del render, lo que
// remontaba el header en cada render y hacía que React lo tratara como
// un componente nuevo (react-hooks/static-components).
function SeccionHeader({ num, ok, label, abierta, onToggle }) {
  return (
    <button
      type="button"
      aria-expanded={abierta}
      style={{...styles.seccionHeader, width:"100%", background:"none", border:"none", textAlign:"left", cursor:"pointer", font:"inherit"}}
      onClick={onToggle}
    >
      <span style={styles.seccionHead}>
        <span style={{...styles.stepBadge, ...(ok ? styles.stepBadgeDone : {})}}>
          {ok ? <Check size={13} strokeWidth={3} /> : num}
        </span>
        <span style={styles.seccionLabel}>{label}</span>
      </span>
      {abierta ? <ChevronUp size={16} color={t.colors.textTertiary}/> : <ChevronDown size={16} color={t.colors.textTertiary}/>}
    </button>
  );
}

const styles = {
  pantalla:         { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:           { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:        { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blueText, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:           { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  seccionHead:      { display:"flex", alignItems:"center", gap:"10px" },
  stepBadge:        { width:"22px", height:"22px", borderRadius:"7px", background:t.colors.blueSoft, color:t.colors.blueText, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:t.fonts.weightBold, flexShrink:0 },
  stepBadgeDone:    { background:t.colors.greenSoft, color:t.colors.green },
  seccionLabel:     { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", padding:"0" },
  seccionHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px 8px", cursor:"pointer" },
  card:             { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", margin:"0 16px 4px", border:`1px solid ${t.colors.borderLight}`, boxShadow:t.shadows.card },
  campo:            { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"10px" },
  fila2:            { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  label:            { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:            { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, width:"100%", boxSizing:"border-box" },
  valorViajeBox:    { display:"flex", justifyContent:"space-between", alignItems:"center", background:t.colors.bgSection, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md, padding:"12px 14px", marginTop:"4px" },
  valorViajeLabel:  { fontSize:t.fonts.sizeSm, color:t.colors.blueText, fontWeight:t.fonts.weightMedium },
  valorViajeNum:    { fontSize:"24px", fontWeight:t.fonts.weightBlack, color:t.colors.blueText, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.5px" },
  resumenBox:       { background:t.colors.bgSection, borderRadius:t.radius.sm, padding:"10px 12px", marginTop:"8px" },
  resumenFila:      { display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeXs, padding:"4px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  resumenL:         { color:t.colors.textSecondary },
  resumenV:         { fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, fontVariantNumeric:"tabular-nums" },
  filaAgregar:      { display:"flex", gap:"8px", alignItems:"center", marginBottom:"10px" },
  btnAgregarP:      { padding:"11px 14px", background:t.colors.blue, border:"none", borderRadius:t.radius.sm, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center" },
  peajesTags:       { display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"10px" },
  peajeTag:         { display:"inline-flex", alignItems:"center", background:t.colors.bgSection, border:`1px solid ${t.colors.border}`, borderRadius:t.radius.full, overflow:"hidden", fontSize:t.fonts.sizeXs },
  peajeTagNom:      { padding:"5px 10px", color:t.colors.textPrimary, fontWeight:t.fonts.weightMedium },
  peajeTagBtn:      { padding:"5px 8px", border:"none", borderLeft:`1px solid ${t.colors.border}`, cursor:"pointer", fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold },
  peajeTagDel:      { padding:"5px 8px", background:"none", border:"none", borderLeft:`1px solid ${t.colors.border}`, cursor:"pointer", display:"flex", alignItems:"center" },
  totalPeajesRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px" },
  totalPeajesL:     { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary },
  totalPeajesV:     { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, fontVariantNumeric:"tabular-nums" },
  extraFila:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  btnAgregarExtra:  { display:"flex", alignItems:"center", gap:"6px", width:"100%", padding:"10px", background:"none", border:`1.5px dashed ${t.colors.blueBorder}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.blueText, cursor:"pointer", justifyContent:"center", marginTop:"8px", fontWeight:t.fonts.weightSemibold },
  metCard:          { background:t.colors.bgSection, borderRadius:t.radius.sm, padding:"12px", marginBottom:"10px" },
  metLabel:         { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.05em" },
  metVal:           { fontSize:"17px", fontWeight:t.fonts.weightBold, margin:0 },
  gananciaResultBox:{ borderRadius:t.radius.md, padding:"16px", border:"1.5px solid", marginBottom:"14px", textAlign:"center" },
  gananciaResultLabel:{ fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, textTransform:"uppercase", letterSpacing:"0.08em", color:t.colors.textSecondary, margin:"0 0 6px" },
  gananciaResultVal:{ fontSize:"38px", fontWeight:t.fonts.weightBlack, margin:0, letterSpacing:"-0.8px" },
  gaugeRow:         { display:"flex", alignItems:"center", gap:"16px", marginBottom:"2px" },
  gauge:            { position:"relative", width:"100px", height:"100px", flexShrink:0 },
  gaugeCap:         { position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" },
  gaugePc:          { fontSize:"23px", fontWeight:t.fonts.weightBlack, lineHeight:1 },
  gaugePl:          { fontSize:"9px", letterSpacing:"0.08em", textTransform:"uppercase", color:t.colors.textTertiary, fontWeight:t.fonts.weightBold, marginTop:"3px" },
  gaugeStats:       { flex:1, display:"flex", flexDirection:"column", gap:"11px" },
  gStat:            { display:"flex", justifyContent:"space-between", alignItems:"center" },
  gStatL:           { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary },
  gStatV:           { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary },
  desgloseFila:     { display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeSm, padding:"7px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  desgloseL:        { color:t.colors.textSecondary },
  desgloseV:        { fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  btnGuardar:       { width:"100%", padding:"15px", background:`linear-gradient(135deg, ${t.colors.green} 0%, ${t.colors.greenDeep || "#12A150"} 100%)`, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" },
};


// v2 - fix conductor
export default Calculadora;