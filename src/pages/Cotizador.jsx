/**
 * Hecho por JESUS COSSIO DEV
 * Cotizador Rápido — Rediseño Guiado Accesible para transportadores de 30 a 70 años.
 * Incluye Modo Guiado (Wizard 5 pasos, tarjetas táctiles, max 3 campos) y Modo Compacto/Avanzado.
 */
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, ChevronDown, ChevronUp, Sparkles, RotateCcw } from "lucide-react";
import { theme as t } from "../styles/theme";
import { CIUDADES_COLOMBIA } from "../data/colombiaData";
import {
  WizardPantalla,
  WizardHeader,
  WizardProgress,
  WizardBanner,
  WizardCampo,
  WizardInput,
  WizardSelect,
  WizardOpciones,
  WizardNav
} from "../components/WizardForm";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");

// Parser numérico colombiano: distingue decimal de miles y remueve signos $
const num = (v) => {
  let t = String(v ?? "").trim().replace(/[$\s]/g, "");
  if (!t) return 0;
  if (t.includes(",")) {
    const n = parseFloat(t.replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? 0 : n;
  }
  const partes = t.split(".");
  if (partes.length === 2 && partes[1].length <= 2) {
    const n = parseFloat(t);
    return isNaN(n) ? 0 : n;
  }
  const n = parseFloat(t.replace(/\./g, ""));
  return isNaN(n) ? 0 : n;
};

const DEFAULT_ADBLUE = 0.05;
const STORAGE_KEY = "navira_cotizador_rapido";

function Cotizador({ vehiculos = [], rutas = [], mostrarToast }) {
  const navigate = useNavigate();

  // Modo de visualización: Guiado (Wizard claro) vs Compacto (Oscuro tradicional)
  const [modoGuiado, setModoGuiado] = useState(true);
  const [pasoWizard, setPasoWizard] = useState(1); // 1 a 5

  // Borrador guardado; se lee una sola vez al iniciar (sin setState en effect)
  const [datosIniciales] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : {};
    } catch {
      return {};
    }
  });

  // Datos principales
  const [placa, setPlaca] = useState(() => datosIniciales.placa || "");
  const [toneladas, setToneladas] = useState(() => datosIniciales.toneladas || "34");
  const [fleteOfrecido, setFleteOfrecido] = useState(() => datosIniciales.fleteOfrecido || "");
  const [modoFlete, setModoFlete] = useState(() => datosIniciales.modoFlete || "porTon"); // porTon | total

  // Ruta / distancia
  const [origen, setOrigen] = useState(() => datosIniciales.origen || "");
  const [destino, setDestino] = useState(() => datosIniciales.destino || "");
  const [kmCargado, setKmCargado] = useState(() => datosIniciales.kmCargado || "");
  const [kmVacio, setKmVacio] = useState(() => datosIniciales.kmVacio || "");

  // Combustible
  const [rendCargado, setRendCargado] = useState(() => datosIniciales.rendCargado || "5.5");
  const [rendVacio, setRendVacio] = useState(() => datosIniciales.rendVacio || "7.0");
  const [precioAcpm, setPrecioAcpm] = useState(() => datosIniciales.precioAcpm || "10800");

  // Costos
  const [peajes, setPeajes] = useState(() => datosIniciales.peajes || "");
  const [modoConductor, setModoConductor] = useState(() => datosIniciales.modoConductor || "porcentaje");
  const [valorConductor, setValorConductor] = useState(() => datosIniciales.valorConductor || "10");
  const [otrosGastos, setOtrosGastos] = useState(() => datosIniciales.otrosGastos || "");

  // Utilidad deseada
  const [modoUtilidad, setModoUtilidad] = useState("porcentaje"); // porcentaje | porViaje | porTon
  const [utilidadDeseada, setUtilidadDeseada] = useState(() => datosIniciales.utilidadDeseada || "25");

  // Atajo de rutas
  const [mostrarRutas, setMostrarRutas] = useState(false);
  const rutasDisponibles = rutas.filter(r => r.nombre || r.ruta);

  // Guardar borrador en localStorage con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          placa, toneladas, fleteOfrecido, modoFlete, origen, destino, kmCargado, kmVacio,
          rendCargado, rendVacio, precioAcpm, peajes, modoConductor,
          valorConductor, otrosGastos, utilidadDeseada
        }));
      } catch {
        // Almacenamiento no disponible o lleno: ignorar, el borrador se pierde
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [placa, toneladas, fleteOfrecido, modoFlete, origen, destino, kmCargado, kmVacio, rendCargado, rendVacio, precioAcpm, peajes, modoConductor, valorConductor, otrosGastos, utilidadDeseada]);

  const limpiarCotizacion = () => {
    setFleteOfrecido("");
    setOrigen("");
    setDestino("");
    setKmCargado("");
    setKmVacio("");
    setPeajes("");
    setOtrosGastos("");
    setPasoWizard(1);
    try { localStorage.removeItem(STORAGE_KEY); } catch {
      // Almacenamiento no disponible: ignorar
    }
    if (mostrarToast) mostrarToast("Formulario limpio para una nueva cotización", "info");
  };

  const cargarRuta = (r) => {
    if (r.origen && r.destino) {
      setOrigen(r.origen);
      setDestino(r.destino);
    } else if (r.ruta && r.ruta.includes("→")) {
      const [o, d] = r.ruta.split("→").map(s => s.trim());
      setOrigen(o || "");
      setDestino(d || "");
    } else if (r.ruta && r.ruta.includes(" - ")) {
      const [o, d] = r.ruta.split(" - ").map(s => s.trim());
      setOrigen(o || "");
      setDestino(d || "");
    } else if (r.ruta) {
      setOrigen(r.ruta);
    }
    setKmCargado(String(r.kmCargado || ""));
    setKmVacio(String(r.kmVacio || ""));
    if (r.rendCargado) setRendCargado(String(r.rendCargado));
    if (r.rendVacio) setRendVacio(String(r.rendVacio));
    if (r.precioAcpm) setPrecioAcpm(String(r.precioAcpm));
    const totP = (r.peajesRuta || []).reduce((s, p) => s + (p.tarifa || 0) * (p.iv ? 2 : 1), 0) || r.peajes || 0;
    setPeajes(String(totP || ""));
    if (r.modoConductor) setModoConductor(r.modoConductor === "fijo" ? "fijo" : "porcentaje");
    if (r.porcCond) setValorConductor(String(r.porcCond));
    const gastos = (r.carpado || 0) + (r.gastosViaje || 0) + (r.extrasList || []).reduce((s, e) => s + (e.valor || 0), 0);
    setOtrosGastos(gastos ? String(gastos) : "");
    setMostrarRutas(false);
    if (mostrarToast) mostrarToast(`Datos de "${r.nombre || r.ruta}" cargados con éxito`, "info");
  };

  const cargarVehiculo = (p) => {
    setPlaca(p);
    const v = vehiculos.find(veh => veh.placa === p);
    if (v?.rendCargadoDef) setRendCargado(String(v.rendCargadoDef));
    if (v?.rendVacioDef) setRendVacio(String(v.rendVacioDef));
  };

  // Cálculo
  const calculo = useMemo(() => {
    const ton = num(toneladas);
    const flete = num(fleteOfrecido);
    if (!flete) return null;

    const valorViaje = modoFlete === "porTon" ? ton * flete : flete;
    if (valorViaje <= 0) return null;

    const kmC = num(kmCargado);
    const kmV = num(kmVacio);
    const rC = num(rendCargado) || 5.5;
    const rV = num(rendVacio) || rC || 7.0;
    const galCarg = rC > 0 ? kmC / rC : 0;
    const galVac = rV > 0 ? kmV / rV : 0;
    const galTotal = galCarg + galVac;

    const vehiculo = vehiculos.find(v => v.placa === placa);
    const usaAdblue = vehiculo?.usaAdblue !== false;
    const adblueRatio = usaAdblue ? (vehiculo?.adblueRatio || DEFAULT_ADBLUE) : 0;
    const pAcpm = num(precioAcpm) || 10800;
    const costoAcpm = galTotal * pAcpm;
    const costoAdbl = galTotal * adblueRatio * 6000;
    const costoComb = costoAcpm + costoAdbl;

    const totPeajes = num(peajes);
    const costoConduct = modoConductor === "fijo" ? num(valorConductor) : (num(valorConductor) / 100) * valorViaje;
    const gastos = num(otrosGastos);

    const totalGastos = costoComb + totPeajes + costoConduct + gastos;
    const gananciaNeta = valorViaje - totalGastos;
    const margen = valorViaje > 0 ? (gananciaNeta / valorViaje) * 100 : 0;
    const kmTotal = kmC + kmV;
    const gananciaPorKm = kmTotal > 0 ? gananciaNeta / kmTotal : 0;

    const fleteMinimoTotal = totalGastos;
    const fleteMinimoPorTon = ton > 0 ? fleteMinimoTotal / ton : 0;

    const pctVariable = modoConductor === "porcentaje" ? (num(valorConductor) / 100) : 0;
    const costosFijos = costoComb + totPeajes + gastos + (modoConductor === "fijo" ? num(valorConductor) : 0);

    const fleteParaUtilidad = (utilidadObjetivo) => {
      const denom = (1 - pctVariable);
      if (denom <= 0) return 0;
      const f = (costosFijos + utilidadObjetivo) / denom;
      return f > 0 ? f : 0;
    };

    let tarifaPiso = 0, tarifaObjetivo = 0, tarifaIdeal = 0;
    const uDeseada = num(utilidadDeseada);
    if (uDeseada > 0) {
      let utilObjetivoPesos;
      if (modoUtilidad === "porViaje") {
        utilObjetivoPesos = uDeseada;
      } else if (modoUtilidad === "porTon") {
        utilObjetivoPesos = uDeseada * ton;
      } else {
        utilObjetivoPesos = costosFijos * (uDeseada / 100);
      }
      tarifaObjetivo = fleteParaUtilidad(utilObjetivoPesos);
      tarifaPiso = fleteParaUtilidad(utilObjetivoPesos * 0.6);
      tarifaIdeal = fleteParaUtilidad(utilObjetivoPesos * 1.4);
    }

    return {
      valorViaje, costoComb, totPeajes, costoConduct, gastos,
      totalGastos, gananciaNeta, margen, kmTotal, gananciaPorKm, galTotal,
      fleteMinimoTotal, fleteMinimoPorTon,
      tarifaPiso, tarifaObjetivo, tarifaIdeal, ton,
    };
  }, [placa, toneladas, fleteOfrecido, modoFlete, kmCargado, kmVacio, rendCargado, rendVacio, precioAcpm, peajes, modoConductor, valorConductor, otrosGastos, modoUtilidad, utilidadDeseada, vehiculos]);

  const veredicto = useMemo(() => {
    if (!calculo) return null;
    const m = calculo.margen;
    if (calculo.gananciaNeta < 0) return { label: "No cubre costos", color: "#EF4444", bg: "#FEF2F2", borde: "#FCA5A5", emoji: "❌", consejo: "Si aceptas este viaje saldrás a pérdidas. Negocia una mejor tarifa o recházalo." };
    if (m < 15) return { label: "Margen muy ajustado", color: "#D97706", bg: "#FFFBEB", borde: "#FDE68A", emoji: "⚠️", consejo: "La ganancia es baja ante cualquier imprevisto en carretera. Intenta subir el flete." };
    if (m < 25) return { label: "Margen aceptable", color: "#2563EB", bg: "#EFF6FF", borde: "#BFDBFE", emoji: "👍", consejo: "Es un viaje razonable que cubre todos tus costos y te deja ganancia." };
    return { label: "¡Excelente negocio!", color: "#059669", bg: "#ECFDF5", borde: "#A7F3D0", emoji: "🔥", consejo: "Este flete tiene muy buena rentabilidad. ¡Aprovéchalo y asegúralo!" };
  }, [calculo]);

  // Validaciones del asistente
  const pasoValido = useMemo(() => {
    if (pasoWizard === 1) {
      return num(fleteOfrecido) > 0 && (modoFlete === "total" || num(toneladas) > 0);
    }
    if (pasoWizard === 2) {
      return num(kmCargado) > 0;
    }
    return true;
  }, [pasoWizard, fleteOfrecido, modoFlete, toneladas, kmCargado]);

  // ETIQUETAS PASOS WIZARD
  const ETIQUETAS_WIZARD = [
    "Flete ofrecido",
    "Distancia de viaje",
    "Combustible y peajes",
    "Conductor y gastos",
    "Resultado y recomendación"
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: MODO GUIADO (LIGHT UI - ASISTENTE AMIGABLE)
  // ══════════════════════════════════════════════════════════════════════════
  if (modoGuiado) {
    return (
      <WizardPantalla>
        {/* Header superior */}
        <WizardHeader
          titulo="Cotizador Rápido"
          onVolver={() => pasoWizard > 1 ? setPasoWizard(p => p - 1) : navigate(-1)}
          labelVolver={pasoWizard > 1 ? "Atrás" : "Salir"}
          badge={
            <button
              type="button"
              onClick={() => setModoGuiado(false)}
              style={{
                fontSize: "12px", fontWeight: 700, padding: "7px 12px",
                borderRadius: "20px", border: "1.5px solid #3B82F6",
                background: "#EFF6FF", color: "#1D4ED8", cursor: "pointer"
              }}
            >
              Modo compacto
            </button>
          }
        />

        {/* Progreso */}
        <WizardProgress total={5} actual={pasoWizard} etiquetas={ETIQUETAS_WIZARD} />

        {/* ── PASO 1: ¿QUÉ FLETE TE OFRECEN? ── */}
        {pasoWizard === 1 && (
          <>
            <WizardBanner
              icono="💰"
              titulo="¿Qué flete te están ofreciendo?"
              mensaje="Indica cuánto te ofrecen pagar para evaluar si te conviene antes de aceptar."
            />
            <div style={stylesWz.cardWrapper}>
              {/* Vehículo */}
              <WizardCampo label="¿Para qué camión es la cotización?" ayuda="Opcional: te ayuda a cargar rendimientos exactos">
                <WizardSelect value={placa} onChange={e => cargarVehiculo(e.target.value)}>
                  <option value="">Sin vehículo específico</option>
                  {vehiculos.map(v => (
                    <option key={v.placa} value={v.placa}>
                      🚛 {v.placa} {v.tipo ? `(${v.tipo})` : ""}
                    </option>
                  ))}
                </WizardSelect>
              </WizardCampo>

              {/* Modo Flete */}
              <WizardCampo label="¿Cómo te van a pagar el flete?" obligatorio>
                <WizardOpciones
                  opciones={[
                    { valor: "porTon", icono: "⚖️", titulo: "Por Tonelada", desc: "Ej: $140.000 / ton" },
                    { valor: "total", icono: "💵", titulo: "Flete Total", desc: "Ej: $4.800.000 viaje completo" }
                  ]}
                  valor={modoFlete}
                  onChange={setModoFlete}
                />
              </WizardCampo>

              {/* Valor del flete */}
              <WizardCampo
                label={modoFlete === "porTon" ? "Tarifa por tonelada ofrecida ($)" : "Valor total del flete ($)"}
                obligatorio
                ayuda={modoFlete === "porTon" ? "Ej: 141000" : "Ej: 4800000"}
              >
                <WizardInput
                  type="text"
                  inputMode="decimal"
                  placeholder={modoFlete === "porTon" ? "$141.000" : "$4.800.000"}
                  value={fleteOfrecido}
                  onChange={e => setFleteOfrecido(e.target.value)}
                />
              </WizardCampo>

              {/* Toneladas si aplica */}
              {modoFlete === "porTon" && (
                <WizardCampo label="¿Cuántas toneladas vas a cargar?" obligatorio ayuda="Ej: 34 toneladas">
                  <WizardInput
                    type="text"
                    inputMode="decimal"
                    placeholder="34"
                    value={toneladas}
                    onChange={e => setToneladas(e.target.value)}
                  />
                </WizardCampo>
              )}
            </div>
          </>
        )}

        {/* ── PASO 2: DISTANCIA Y RUTA ── */}
        {pasoWizard === 2 && (
          <>
            <WizardBanner
              icono="🛣️"
              titulo="¿Cuál es la ruta y la distancia?"
              mensaje="Ingresa el origen y destino con sugerencias de Colombia, más los kilómetros del viaje."
            />
            <div style={stylesWz.cardWrapper}>
              {rutasDisponibles.length > 0 && (
                <div style={{ marginBottom: "18px" }}>
                  <button
                    type="button"
                    onClick={() => setMostrarRutas(!mostrarRutas)}
                    style={{
                      width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "14px 16px", background: "#F0F7FF", border: "1.5px dashed #93C5FD",
                      borderRadius: "14px", color: "#1E40AF", fontSize: "14px", fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    <span>📋 Usar datos de una ruta frecuente</span>
                    {mostrarRutas ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {mostrarRutas && (
                    <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {rutasDisponibles.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => cargarRuta(r)}
                          style={{
                            textAlign: "left", padding: "12px 14px", background: "#FFFFFF",
                            border: "1.5px solid #D1DCF0", borderRadius: "10px", color: "#111827",
                            fontSize: "14px", fontWeight: 600, cursor: "pointer"
                          }}
                        >
                          📍 {r.nombre || r.ruta}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <datalist id="ciudades-colombia-cotizador">
                {CIUDADES_COLOMBIA.map(c => <option key={c} value={c} />)}
              </datalist>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <WizardCampo label="Ciudad de Origen" ayuda="Lugar de cargue">
                  <WizardInput
                    type="text"
                    placeholder="Ej: Barranquilla"
                    list="ciudades-colombia-cotizador"
                    value={origen}
                    onChange={e => setOrigen(e.target.value)}
                  />
                </WizardCampo>
                <WizardCampo label="Ciudad de Destino" ayuda="Lugar de entrega">
                  <WizardInput
                    type="text"
                    placeholder="Ej: Bogotá D.C."
                    list="ciudades-colombia-cotizador"
                    value={destino}
                    onChange={e => setDestino(e.target.value)}
                  />
                </WizardCampo>
              </div>

              <WizardCampo label="Kilómetros cargado (Ida)" obligatorio ayuda="Distancia desde el cargue hasta la entrega">
                <WizardInput
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 380"
                  value={kmCargado}
                  onChange={e => setKmCargado(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Kilómetros vacío (opcional)" ayuda="Desplazamiento para buscar el viaje o regreso en vacío">
                <WizardInput
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 60 (o deja 0 si no aplica)"
                  value={kmVacio}
                  onChange={e => setKmVacio(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 3: COMBUSTIBLE Y PEAJES ── */}
        {pasoWizard === 3 && (
          <>
            <WizardBanner
              icono="⛽"
              titulo="Combustible y Peajes de la ruta"
              mensaje="Estimamos el ACPM y el costo de casetas de peaje para descontarlos del flete."
            />
            <div style={stylesWz.cardWrapper}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <WizardCampo label="Rendimiento cargado" ayuda="Km por galón (Ej: 5.5)">
                  <WizardInput
                    type="text"
                    inputMode="decimal"
                    placeholder="5.5"
                    value={rendCargado}
                    onChange={e => setRendCargado(e.target.value)}
                  />
                </WizardCampo>
                <WizardCampo label="Rendimiento vacío" ayuda="Km por galón (Ej: 7.0)">
                  <WizardInput
                    type="text"
                    inputMode="decimal"
                    placeholder="7.0"
                    value={rendVacio}
                    onChange={e => setRendVacio(e.target.value)}
                  />
                </WizardCampo>
              </div>

              <WizardCampo label="Precio del galón de ACPM ($)" ayuda="Precio actual en estación (Ej: 10800)">
                <WizardInput
                  type="text"
                  inputMode="numeric"
                  placeholder="10800"
                  value={precioAcpm}
                  onChange={e => setPrecioAcpm(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Total en Peajes ($)" ayuda="Suma de todas las casetas del trayecto">
                <WizardInput
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 890000"
                  value={peajes}
                  onChange={e => setPeajes(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 4: CONDUCTOR Y OTROS GASTOS ── */}
        {pasoWizard === 4 && (
          <>
            <WizardBanner
              icono="👨‍✈️"
              titulo="Pago al conductor y otros gastos"
              mensaje="Define cómo se le paga al conductor y suma gastos como carpado, cargue o viáticos."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="¿Cómo le pagas al conductor?">
                <WizardOpciones
                  opciones={[
                    { valor: "porcentaje", icono: "📊", titulo: "Porcentaje (%)", desc: "Ej: 10% o 12% del flete" },
                    { valor: "fijo", icono: "💵", titulo: "Valor Fijo ($)", desc: "Ej: $500.000 por viaje" }
                  ]}
                  valor={modoConductor}
                  onChange={setModoConductor}
                />
              </WizardCampo>

              <WizardCampo
                label={modoConductor === "porcentaje" ? "Porcentaje al conductor (%)" : "Valor fijo al conductor ($)"}
                ayuda={modoConductor === "porcentaje" ? "Ingresa solo el número (Ej: 10)" : "Ej: 500000"}
              >
                <WizardInput
                  type="text"
                  inputMode="decimal"
                  placeholder={modoConductor === "porcentaje" ? "10" : "500000"}
                  value={valorConductor}
                  onChange={e => setValorConductor(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Otros gastos del viaje ($)" ayuda="Carpado, desvare, cargue/descargue, viáticos adicionales">
                <WizardInput
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 200000 (o 0 si no hay)"
                  value={otrosGastos}
                  onChange={e => setOtrosGastos(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 5: RESULTADO Y RECOMENDACIÓN ── */}
        {pasoWizard === 5 && (
          <>
            <WizardBanner
              icono="📊"
              titulo="Resultado de tu cotización"
              mensaje="Aquí tienes la ganancia neta estimada, el margen y la recomendación para negociar."
            />

            <div style={stylesWz.cardWrapper}>
              {calculo && veredicto ? (
                <>
                  {/* Tarjeta Veredicto Semáforo */}
                  <div style={{
                    background: veredicto.bg,
                    border: `2px solid ${veredicto.borde}`,
                    borderRadius: "16px",
                    padding: "18px",
                    textAlign: "center",
                    marginBottom: "16px"
                  }}>
                    <span style={{ fontSize: "36px", display: "block", marginBottom: "4px" }}>{veredicto.emoji}</span>
                    <span style={{ fontSize: "18px", fontWeight: 900, color: veredicto.color, display: "block" }}>
                      {veredicto.label}
                    </span>
                    <p style={{ fontSize: "13px", color: "#4B5563", margin: "6px 0 0", lineHeight: 1.4 }}>
                      {veredicto.consejo}
                    </p>
                  </div>

                  {/* Ganancia Neta Destacada */}
                  <div style={{
                    background: "#FFFFFF",
                    border: "1.5px solid #D1DCF0",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "center",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    marginBottom: "16px"
                  }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", margin: "0 0 4px" }}>
                      Ganancia Neta Libre Estimada
                    </p>
                    <p style={{ fontSize: "34px", fontWeight: 900, color: veredicto.color, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                      {fmt(calculo.gananciaNeta)}
                    </p>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "4px 12px", background: "#EFF6FF", borderRadius: "20px"
                    }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#1E40AF" }}>
                        {calculo.margen.toFixed(1)}% de margen
                      </span>
                      {calculo.kmTotal > 0 && (
                        <span style={{ fontSize: "13px", color: "#6B7280" }}>
                          · {fmt(calculo.gananciaPorKm)}/km
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desglose de Gastos en Tarjeta Clara */}
                  <div style={{
                    background: "#F8FAFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "14px",
                    padding: "16px",
                    marginBottom: "16px"
                  }}>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#1E293B", margin: "0 0 12px" }}>
                      📋 Desglose del viaje
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={stylesWz.filaDesglose}>
                        <span style={{ color: "#374151" }}>Valor Total del Flete</span>
                        <span style={{ fontWeight: 800, color: "#111827" }}>{fmt(calculo.valorViaje)}</span>
                      </div>
                      {calculo.costoComb > 0 && (
                        <div style={stylesWz.filaDesglose}>
                          <span style={{ color: "#4B5563" }}>⛽ ACPM ({calculo.galTotal.toFixed(0)} gal aprox)</span>
                          <span style={{ fontWeight: 700, color: "#DC2626" }}>−{fmt(calculo.costoComb)}</span>
                        </div>
                      )}
                      {calculo.totPeajes > 0 && (
                        <div style={stylesWz.filaDesglose}>
                          <span style={{ color: "#4B5563" }}>🛣️ Peajes</span>
                          <span style={{ fontWeight: 700, color: "#DC2626" }}>−{fmt(calculo.totPeajes)}</span>
                        </div>
                      )}
                      {calculo.costoConduct > 0 && (
                        <div style={stylesWz.filaDesglose}>
                          <span style={{ color: "#4B5563" }}>👨‍✈️ Pago al Conductor</span>
                          <span style={{ fontWeight: 700, color: "#DC2626" }}>−{fmt(calculo.costoConduct)}</span>
                        </div>
                      )}
                      {calculo.gastos > 0 && (
                        <div style={stylesWz.filaDesglose}>
                          <span style={{ color: "#4B5563" }}>📦 Otros Gastos (Carpado/Viáticos)</span>
                          <span style={{ fontWeight: 700, color: "#DC2626" }}>−{fmt(calculo.gastos)}</span>
                        </div>
                      )}
                      <div style={{ borderTop: "1.5px solid #CBD5E1", paddingTop: "8px", marginTop: "4px", ...stylesWz.filaDesglose }}>
                        <span style={{ fontWeight: 800, color: "#1E293B" }}>Total Costos del Viaje</span>
                        <span style={{ fontWeight: 800, color: "#DC2626" }}>−{fmt(calculo.totalGastos)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Flete mínimo para no perder */}
                  <div style={{
                    padding: "14px 16px",
                    background: "#EFF6FF",
                    borderRadius: "14px",
                    border: "1.5px solid #BFDBFE",
                    textAlign: "center",
                    marginBottom: "18px"
                  }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", margin: "0 0 2px" }}>
                      Flete mínimo de supervivencia (Punto de Equilibrio)
                    </p>
                    <p style={{ fontSize: "16px", fontWeight: 800, color: "#1E3A8A", margin: 0 }}>
                      {num(toneladas) > 0 ? `${fmt(calculo.fleteMinimoPorTon)}/ton · ` : ""}{fmt(calculo.fleteMinimoTotal)} total
                    </p>
                  </div>

                  {/* Tarifa sugerida para negociar */}
                  {calculo.tarifaObjetivo > 0 && (
                    <div style={{
                      background: "#FFFFFF",
                      border: "1.5px solid #D1DCF0",
                      borderRadius: "16px",
                      padding: "16px",
                      marginBottom: "18px"
                    }}>
                      <p style={{ fontSize: "14px", fontWeight: 800, color: "#111827", margin: "0 0 10px", textAlign: "center" }}>
                        🎯 Tarifa sugerida para contraofertar
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div style={stylesWz.tarjetaTarifa}>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#D97706" }}>PISO</span>
                          <span style={{ fontSize: "14px", fontWeight: 900, color: "#111827" }}>
                            {fmt(modoFlete === "porTon" && calculo.ton > 0 ? calculo.tarifaPiso / calculo.ton : calculo.tarifaPiso)}
                          </span>
                          <span style={{ fontSize: "10px", color: "#6B7280" }}>Mínimo</span>
                        </div>
                        <div style={{ ...stylesWz.tarjetaTarifa, background: "#EFF6FF", border: "2px solid #3B82F6" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#2563EB" }}>META</span>
                          <span style={{ fontSize: "15px", fontWeight: 900, color: "#1E40AF" }}>
                            {fmt(modoFlete === "porTon" && calculo.ton > 0 ? calculo.tarifaObjetivo / calculo.ton : calculo.tarifaObjetivo)}
                          </span>
                          <span style={{ fontSize: "10px", color: "#2563EB" }}>Recomendada</span>
                        </div>
                        <div style={stylesWz.tarjetaTarifa}>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669" }}>IDEAL</span>
                          <span style={{ fontSize: "14px", fontWeight: 900, color: "#111827" }}>
                            {fmt(modoFlete === "porTon" && calculo.ton > 0 ? calculo.tarifaIdeal / calculo.ton : calculo.tarifaIdeal)}
                          </span>
                          <span style={{ fontSize: "10px", color: "#6B7280" }}>Excelente</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones finales */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => navigate("/calculadora", {
                        state: {
                          placa,
                          flete: calculo.valorViaje,
                          kmCargado,
                          kmVacio,
                          peajes,
                          rendCargado,
                          rendVacio,
                          precioAcpm
                        }
                      })}
                      style={{
                        width: "100%", padding: "16px", borderRadius: "14px",
                        background: "#3B82F6", color: "#FFFFFF", border: "none",
                        fontSize: "16px", fontWeight: 800, cursor: "pointer",
                        display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
                        boxShadow: "0 4px 14px rgba(59,130,246,0.3)"
                      }}
                    >
                      <Sparkles size={18} />
                      Crear viaje completo con estos datos
                    </button>

                    <button
                      type="button"
                      onClick={limpiarCotizacion}
                      style={{
                        width: "100%", padding: "14px", borderRadius: "14px",
                        background: "#FFFFFF", color: "#4B5563", border: "1.5px solid #D1DCF0",
                        fontSize: "15px", fontWeight: 700, cursor: "pointer",
                        display: "flex", justifyContent: "center", alignItems: "center", gap: "6px"
                      }}
                    >
                      <RotateCcw size={16} />
                      Cotizar otro flete desde cero
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 10px" }}>
                  <p style={{ fontSize: "16px", color: "#4B5563", margin: "0 0 16px" }}>
                    Ingresa al menos el valor del flete y los kilómetros cargados para calcular el resultado.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPasoWizard(1)}
                    style={{
                      padding: "12px 24px", background: "#3B82F6", color: "#FFFFFF",
                      borderRadius: "12px", border: "none", fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    Volver al Paso 1
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Barra de navegación inferior */}
        {pasoWizard < 5 && (
          <WizardNav
            pasoActual={pasoWizard}
            totalPasos={5}
            onAtras={() => setPasoWizard(p => p - 1)}
            onSiguiente={() => setPasoWizard(p => p + 1)}
            deshabilitarSiguiente={!pasoValido}
            labelSiguiente={pasoWizard === 4 ? "Ver resultado del flete →" : "Siguiente →"}
          />
        )}
      </WizardPantalla>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: MODO COMPACTO / AVANZADO (Para usuarios que prefieren la vista clásica)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Cotizador rápido</h1>
        <button
          onClick={() => setModoGuiado(true)}
          style={{
            marginLeft: "auto", fontSize: "11px", fontWeight: 700,
            padding: "5px 10px", borderRadius: "12px", background: t.colors.blue,
            color: "#fff", border: "none", cursor: "pointer"
          }}
        >
          Modo guiado ✦
        </button>
      </div>

      <div style={styles.contenido}>
        <div style={styles.introBox}>
          <Zap size={18} color={t.colors.blue} />
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:0, lineHeight:1.5}}>
            ¿Le ofrecen un flete? Sepa al instante si le conviene, antes de aceptar.
          </p>
        </div>

        {/* Atajo: cargar de ruta frecuente */}
        {rutasDisponibles.length > 0 && (
          <div style={{marginBottom:"14px"}}>
            <button style={styles.btnRutaFrec} onClick={() => setMostrarRutas(!mostrarRutas)}>
              <span>📋 Cargar datos de una ruta frecuente</span>
              {mostrarRutas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {mostrarRutas && (
              <div style={{marginTop:"6px"}}>
                {rutasDisponibles.map((r, i) => (
                  <button key={i} style={styles.rutaFrecItem} onClick={() => cargarRuta(r)}>
                    {r.nombre || r.ruta}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vehículo */}
        <label htmlFor="a11y-Cotizador-213" style={styles.label}>Vehículo (opcional)</label>
        <select id="a11y-Cotizador-213" value={placa} onChange={e => cargarVehiculo(e.target.value)} style={styles.input}>
          <option value="">Sin vehículo específico</option>
          {vehiculos.map(v => <option key={v.placa} value={v.placa}>{v.placa}</option>)}
        </select>

        {/* Flete */}
        <label htmlFor="a11y-Cotizador-220" style={styles.label}>Flete que le ofrecen *</label>
        <div style={{display:"flex", gap:"8px", marginBottom:"6px"}}>
          <button onClick={()=>setModoFlete("porTon")} style={{...styles.toggleBtn, ...(modoFlete==="porTon"?styles.toggleActivo:{})}}>Por tonelada</button>
          <button onClick={()=>setModoFlete("total")} style={{...styles.toggleBtn, ...(modoFlete==="total"?styles.toggleActivo:{})}}>Total</button>
        </div>
        <input id="a11y-Cotizador-220" type="text" inputMode="decimal" placeholder={modoFlete==="porTon"?"141000":"4794000"} value={fleteOfrecido}
          onChange={e => setFleteOfrecido(e.target.value)} style={styles.input} />

        {modoFlete === "porTon" && (
          <>
            <label htmlFor="a11y-Cotizador-230" style={styles.label}>Toneladas *</label>
            <input id="a11y-Cotizador-230" type="text" inputMode="decimal" placeholder="34" value={toneladas}
              onChange={e => setToneladas(e.target.value)} style={styles.input} />
          </>
        )}

        {/* RUTA Y DISTANCIA */}
        <p style={styles.subSeccion}>📍 Ruta y Distancia</p>
        <div style={styles.grid2}>
          <div>
            <label htmlFor="a11y-Cotizador-880" style={styles.label}>Origen</label>
            <input
              id="a11y-Cotizador-880"
              type="text"
              placeholder="Barranquilla"
              list="ciudades-colombia-cotizador"
              value={origen}
              onChange={e => setOrigen(e.target.value)}
              style={styles.input}
            />
          </div>
          <div>
            <label htmlFor="a11y-Cotizador-891" style={styles.label}>Destino</label>
            <input
              id="a11y-Cotizador-891"
              type="text"
              placeholder="Bogotá D.C."
              list="ciudades-colombia-cotizador"
              value={destino}
              onChange={e => setDestino(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.grid2}>
          <div>
            <label htmlFor="a11y-Cotizador-240" style={styles.label}>Km cargado</label>
            <input id="a11y-Cotizador-240" type="text" inputMode="numeric" placeholder="380" value={kmCargado}
              onChange={e => setKmCargado(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label htmlFor="a11y-Cotizador-245" style={styles.label}>Km vacío</label>
            <input id="a11y-Cotizador-245" type="text" inputMode="numeric" placeholder="60" value={kmVacio}
              onChange={e => setKmVacio(e.target.value)} style={styles.input} />
          </div>
        </div>

        {/* COMBUSTIBLE */}
        <p style={styles.subSeccion}>⛽ Combustible</p>
        <div style={styles.grid2}>
          <div>
            <label htmlFor="a11y-Cotizador-255" style={styles.label}>Rend. cargado (km/gal)</label>
            <input id="a11y-Cotizador-255" type="text" inputMode="decimal" placeholder="5.5" value={rendCargado}
              onChange={e => setRendCargado(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label htmlFor="a11y-Cotizador-260" style={styles.label}>Rend. vacío (km/gal)</label>
            <input id="a11y-Cotizador-260" type="text" inputMode="decimal" placeholder="7.0" value={rendVacio}
              onChange={e => setRendVacio(e.target.value)} style={styles.input} />
          </div>
        </div>
        <label htmlFor="a11y-Cotizador-265" style={styles.label}>Precio galón ACPM</label>
        <input id="a11y-Cotizador-265" type="text" inputMode="numeric" placeholder="10800" value={precioAcpm}
          onChange={e => setPrecioAcpm(e.target.value)} style={styles.input} />

        {/* COSTOS */}
        <p style={styles.subSeccion}>💸 Costos</p>
        <label htmlFor="a11y-Cotizador-271" style={styles.label}>Total peajes</label>
        <input id="a11y-Cotizador-271" type="text" inputMode="numeric" placeholder="890000" value={peajes}
          onChange={e => setPeajes(e.target.value)} style={styles.input} />

        <label htmlFor="a11y-Cotizador-275" style={styles.label}>Pago del conductor</label>
        <div style={{display:"flex", gap:"8px", marginBottom:"6px"}}>
          <button onClick={()=>setModoConductor("porcentaje")} style={{...styles.toggleBtn, ...(modoConductor==="porcentaje"?styles.toggleActivo:{})}}>Porcentaje</button>
          <button onClick={()=>setModoConductor("fijo")} style={{...styles.toggleBtn, ...(modoConductor==="fijo"?styles.toggleActivo:{})}}>Valor fijo</button>
        </div>
        <input id="a11y-Cotizador-275" type="text" inputMode="decimal" placeholder={modoConductor==="porcentaje"?"10 (%)":"500000"} value={valorConductor}
          onChange={e => setValorConductor(e.target.value)} style={styles.input} />

        <label htmlFor="a11y-Cotizador-283" style={styles.label}>Otros gastos (carpado, viáticos...)</label>
        <input id="a11y-Cotizador-283" type="text" inputMode="numeric" placeholder="200000" value={otrosGastos}
          onChange={e => setOtrosGastos(e.target.value)} style={styles.input} />

        {/* UTILIDAD DESEADA */}
        <p style={styles.subSeccion}>🎯 ¿Cuánto quiere ganar? (opcional)</p>
        <div style={{display:"flex", gap:"6px", marginBottom:"6px"}}>
          <button onClick={()=>setModoUtilidad("porcentaje")} style={{...styles.toggleBtn, fontSize:"11px", ...(modoUtilidad==="porcentaje"?styles.toggleActivo:{})}}>% sobre costos</button>
          <button onClick={()=>setModoUtilidad("porViaje")} style={{...styles.toggleBtn, fontSize:"11px", ...(modoUtilidad==="porViaje"?styles.toggleActivo:{})}}>$ por viaje</button>
          <button onClick={()=>setModoUtilidad("porTon")} style={{...styles.toggleBtn, fontSize:"11px", ...(modoUtilidad==="porTon"?styles.toggleActivo:{})}}>$ por ton</button>
        </div>
        <input type="text" inputMode="decimal"
          placeholder={modoUtilidad==="porcentaje"?"30 (%)":modoUtilidad==="porViaje"?"900000":"25000"}
          value={utilidadDeseada}
          onChange={e => setUtilidadDeseada(e.target.value)} style={styles.input} />

        {/* TARIFA SUGERIDA */}
        {calculo && calculo.tarifaObjetivo > 0 && (
          <div style={styles.rangoBox}>
            <p style={{fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 12px", textAlign:"center"}}>
              Tarifa sugerida {modoFlete==="porTon" && calculo.ton>0 ? "(por tonelada)" : "(total viaje)"}
            </p>
            <div style={{display:"flex", justifyContent:"space-between", gap:"8px"}}>
              {[
                { label:"PISO", desc:"mínimo aceptable", val:calculo.tarifaPiso, color:t.colors.amber||"#F59E0B" },
                { label:"OBJETIVO", desc:"su meta", val:calculo.tarifaObjetivo, color:t.colors.blue, destacado:true },
                { label:"IDEAL", desc:"si negocia bien", val:calculo.tarifaIdeal, color:t.colors.green },
              ].map((tier, i) => {
                const mostrarPorTon = modoFlete==="porTon" && calculo.ton>0;
                const valor = mostrarPorTon ? tier.val / calculo.ton : tier.val;
                return (
                  <div key={i} style={{flex:1, textAlign:"center", padding:"12px 6px", background:tier.destacado?tier.color+"18":t.colors.bgSection, borderRadius:t.radius.md, border:tier.destacado?`2px solid ${tier.color}`:`1px solid ${t.colors.borderLight}`}}>
                    <p style={{fontSize:"10px", fontWeight:t.fonts.weightBold, color:tier.color, margin:"0 0 4px", letterSpacing:"0.05em"}}>{tier.label}</p>
                    <p style={{fontSize:tier.destacado?"16px":"14px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:0, lineHeight:1.1}}>{fmt(valor)}</p>
                    <p style={{fontSize:"9px", color:t.colors.textTertiary, margin:"3px 0 0"}}>{tier.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {calculo && veredicto && (
          <div style={{...styles.resultado, background: veredicto.color+"11", border:`2px solid ${veredicto.color}`}}>
            <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px"}}>
              <span style={{fontSize:"20px"}}>{veredicto.emoji}</span>
              <span style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBlack, color:veredicto.color}}>{veredicto.label}</span>
            </div>

            <div style={{textAlign:"center", marginBottom:"14px"}}>
              <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 2px", textTransform:"uppercase"}}>Ganancia neta</p>
              <p style={{fontSize:"38px", fontWeight:t.fonts.weightBlack, color:veredicto.color, margin:0, letterSpacing:"-1px"}}>{fmt(calculo.gananciaNeta)}</p>
              <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:veredicto.color, margin:"2px 0 0"}}>
                {calculo.margen.toFixed(1)}% margen{calculo.kmTotal > 0 ? ` · ${fmt(calculo.gananciaPorKm)}/km` : ""}
              </p>
            </div>

            <div style={styles.desglose}>
              <div style={styles.desgloseRow}><span>Flete</span><span style={{fontWeight:t.fonts.weightBold}}>{fmt(calculo.valorViaje)}</span></div>
              {calculo.costoComb > 0 && <div style={styles.desgloseRow}><span>Combustible ({calculo.galTotal.toFixed(0)} gal)</span><span>−{fmt(calculo.costoComb)}</span></div>}
              {calculo.totPeajes > 0 && <div style={styles.desgloseRow}><span>Peajes</span><span>−{fmt(calculo.totPeajes)}</span></div>}
              {calculo.costoConduct > 0 && <div style={styles.desgloseRow}><span>Conductor</span><span>−{fmt(calculo.costoConduct)}</span></div>}
              {calculo.gastos > 0 && <div style={styles.desgloseRow}><span>Otros gastos</span><span>−{fmt(calculo.gastos)}</span></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const stylesWz = {
  cardWrapper: {
    padding: "0 20px 20px",
  },
  filaDesglose: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  },
  tarjetaTarifa: {
    textAlign: "center",
    padding: "10px 4px",
    background: "#F8FAFF",
    borderRadius: "12px",
    border: "1px solid #D1DCF0",
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  }
};

const styles = {
  pantalla:   { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:     { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:  { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:     { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:  { padding:"16px" },
  introBox:   { display:"flex", alignItems:"center", gap:"10px", padding:"12px", background:t.colors.bgSection, borderRadius:t.radius.md, marginBottom:"18px" },
  subSeccion: { fontSize:"11px", fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"20px 0 4px", paddingBottom:"6px", borderBottom:`1px solid ${t.colors.borderLight}` },
  label:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, display:"block", margin:"12px 0 5px" },
  input:      { width:"100%", boxSizing:"border-box", padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, background:t.colors.bgPrimary, color:t.colors.textPrimary, fontSize:t.fonts.sizeSm },
  grid2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  toggleBtn:  { flex:1, padding:"8px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, background:"transparent", color:t.colors.textSecondary, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, cursor:"pointer" },
  toggleActivo:{ background:t.colors.blue, color:"#fff", borderColor:t.colors.blue },
  btnRutaFrec:{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 12px", background:t.colors.bgSection, border:`1.5px dashed ${t.colors.border}`, borderRadius:t.radius.sm, color:t.colors.textSecondary, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, cursor:"pointer" },
  rutaFrecItem:{ width:"100%", textAlign:"left", padding:"10px 12px", background:t.colors.bgCard, border:`1px solid ${t.colors.borderLight}`, borderRadius:t.radius.sm, color:t.colors.textPrimary, fontSize:t.fonts.sizeXs, cursor:"pointer", marginBottom:"4px" },
  resultado:  { borderRadius:t.radius.lg, padding:"18px", marginTop:"22px" },
  rangoBox:   { borderRadius:t.radius.lg, padding:"16px", marginTop:"16px", background:t.colors.bgCard, border:`1.5px solid ${t.colors.border}` },
  desglose:   { display:"flex", flexDirection:"column", gap:"6px" },
  desgloseRow:{ display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeXs, color:t.colors.textSecondary },
};

export default Cotizador;