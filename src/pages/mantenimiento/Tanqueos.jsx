/**
 * Hecho por JESUS COSSIO DEV
 * Registro Guiado de Tanqueos de Combustible (ACPM)
 * Optimizado para transportadores de 30 a 70 años con flujo Wizard claro.
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Fuel, Trash2, TrendingDown, TrendingUp, MapPin, CheckCircle2, Plus } from "lucide-react";
import { theme as t } from "../../styles/theme";
import ConfirmarModal from "../../components/ConfirmarModal";
import {
  WizardPantalla,
  WizardHeader,
  WizardProgress,
  WizardBanner,
  WizardCampo,
  WizardInput,
  WizardSelect,
  WizardNav
} from "../../components/WizardForm";

function Tanqueos({ vehiculos = [], viajes = [], onEditarVehiculo, mostrarToast }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo  = vehiculos.find(v => String(v.firestoreId) === String(id));
  const historial = vehiculo?.tanqueosHistorial || [];

  // Estados del asistente Wizard
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pasoWizard,  setPasoWizard]  = useState(1); // 1: Galones/Precio, 2: Km/Estación, 3: Viaje/Nota

  // Campos
  const [fecha,         setFecha]         = useState(new Date().toISOString().slice(0, 10));
  const [estacion,      setEstacion]      = useState("");
  const [galones,       setGalones]       = useState("");
  const [precioGal,     setPrecioGal]     = useState(vehiculo?.precioAcpmDef ? String(vehiculo.precioAcpmDef) : "10800");
  const [kmOdom,        setKmOdom]        = useState(vehiculo?.kmOdometro ? String(vehiculo.kmOdometro) : "");
  const [viajeAsociado, setViajeAsociado] = useState("");
  const [nota,          setNota]          = useState("");
  const [guardando,     setGuardando]     = useState(false);

  // Modal para eliminar tanqueo
  const [tanqueoAEliminar, setTanqueoAEliminar] = useState(null);

  const viajesVehiculo = viajes
    .filter(v => v.placa === vehiculo?.placa)
    .sort((a,b) => b.fecha.localeCompare(a.fecha));

  const fmt  = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");
  const fmtN = (n, d = 1) => (Math.round((n || 0) * Math.pow(10, d)) / Math.pow(10, d)).toLocaleString("es-CO", { maximumFractionDigits: d });

  // Rendimiento real entre tanqueos consecutivos
  const calcRendimientos = () => {
    const ordenados = [...historial].sort((a, b) => a.kmOdometro - b.kmOdometro);
    const rends = [];
    for (let i = 1; i < ordenados.length; i++) {
      const kmRecorridos = ordenados[i].kmOdometro - ordenados[i-1].kmOdometro;
      if (kmRecorridos > 0 && ordenados[i].galones > 0) {
        rends.push({
          km: kmRecorridos,
          gal: ordenados[i].galones,
          rendimiento: kmRecorridos / ordenados[i].galones,
          fecha: ordenados[i].fecha,
        });
      }
    }
    return rends;
  };

  const rendimientos = calcRendimientos();
  const rendPromedio = rendimientos.length > 0
    ? rendimientos.reduce((s, r) => s + r.rendimiento, 0) / rendimientos.length
    : 0;

  const totalGalones = historial.reduce((s, t) => s + (t.galones || 0), 0);
  const totalGastado = historial.reduce((s, t) => s + (t.total || 0), 0);

  const limpiarFormulario = () => {
    setEstacion("");
    setGalones("");
    setNota("");
    setViajeAsociado("");
    setPasoWizard(1);
    setMostrarForm(false);
  };

  const guardar = async () => {
    if (!galones || Number(galones) <= 0) {
      if (mostrarToast) mostrarToast("Ingresa los galones tanqueados", "error");
      setPasoWizard(1);
      return;
    }
    if (!precioGal || Number(precioGal) <= 0) {
      if (mostrarToast) mostrarToast("Ingresa el precio por galón", "error");
      setPasoWizard(1);
      return;
    }
    if (!kmOdom) {
      if (mostrarToast) mostrarToast("Ingresa el kilometraje actual del odómetro", "error");
      setPasoWizard(2);
      return;
    }

    setGuardando(true);
    const nuevo = {
      // eslint-disable-next-line react-hooks/purity -- guardar solo se invoca desde onClick; Date.now() acuña el id del registro al pulsar, nunca durante render.
      id: Date.now(),
      fecha,
      estacion: estacion.trim(),
      galones: Number(galones),
      precioGalon: Number(precioGal),
      total: Number(galones) * Number(precioGal),
      kmOdometro: Number(kmOdom),
      viajeId: viajeAsociado || null,
      nota: nota.trim(),
    };

    const nuevos = [nuevo, ...historial];
    try {
      await onEditarVehiculo(vehiculo.firestoreId, {
        tanqueosHistorial: nuevos,
        kmOdometro: Number(kmOdom),
      });
if (mostrarToast) mostrarToast("¡Excelente! Tanqueo registrado", "exito");
      limpiarFormulario();
    } catch {
      if (mostrarToast) mostrarToast("Error al registrar tanqueo", "error");
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarEliminar = async () => {
    if (!tanqueoAEliminar) return;
    const nuevos = historial.filter(r => r.id !== tanqueoAEliminar.id);
    setTanqueoAEliminar(null);
    try {
      await onEditarVehiculo(vehiculo.firestoreId, { tanqueosHistorial: nuevos });
if (mostrarToast) mostrarToast("Tanqueo eliminado", "info");
    } catch {
      if (mostrarToast) mostrarToast("Error al eliminar", "error");
    }
  };

  const pasoValido = (() => {
    if (pasoWizard === 1) return Number(galones) > 0 && Number(precioGal) > 0;
    if (pasoWizard === 2) return Boolean(kmOdom);
    return true;
  })();

  const ETIQUETAS_WIZARD = [
    "Galones y precio",
    "Odómetro y estación",
    "Viaje y confirmación"
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: ASISTENTE WIZARD GUIADO PARA REGISTRAR TANQUEO
  // ══════════════════════════════════════════════════════════════════════════
  if (mostrarForm) {
    const totalEstimado = Number(galones || 0) * Number(precioGal || 0);

    return (
      <WizardPantalla>
        <WizardHeader
          titulo={`Tanqueo · ${vehiculo?.placa || "Camión"}`}
          onVolver={() => pasoWizard > 1 ? setPasoWizard(p => p - 1) : limpiarFormulario()}
          labelVolver={pasoWizard > 1 ? "Atrás" : "Cancelar"}
        />

        <WizardProgress total={3} actual={pasoWizard} etiquetas={ETIQUETAS_WIZARD} />

        {/* ── PASO 1: GALONES Y PRECIO ── */}
        {pasoWizard === 1 && (
          <>
            <WizardBanner
              icono="⛽"
              titulo="¿Cuántos galones de ACPM tanqueaste?"
              mensaje="Registra la cantidad y el precio por galón para calcular el gasto total."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Cantidad de Galones" obligatorio ayuda="Ej: 120 o 85.5 galones">
                <WizardInput
                  type="number"
                  inputMode="decimal"
                  placeholder="120"
                  value={galones}
                  onChange={e => setGalones(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Precio por galón ($)" obligatorio ayuda="Ej: 10800 o 9850">
                <WizardInput
                  type="number"
                  inputMode="numeric"
                  placeholder="10800"
                  value={precioGal}
                  onChange={e => setPrecioGal(e.target.value)}
                />
              </WizardCampo>

              {totalEstimado > 0 && (
                <div style={{
                  background: "#ECFDF5", border: "2px solid #A7F3D0", borderRadius: "16px",
                  padding: "16px", textAlign: "center", marginTop: "12px"
                }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#065F46", textTransform: "uppercase", margin: "0 0 2px" }}>
                    Total Factura Combustible
                  </p>
                  <p style={{ fontSize: "28px", fontWeight: 900, color: "#059669", margin: 0 }}>
                    {fmt(totalEstimado)}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PASO 2: ODÓMETRO Y ESTACIÓN ── */}
        {pasoWizard === 2 && (
          <>
            <WizardBanner
              icono="🛣️"
              titulo="¿A qué kilometraje y estación?"
              mensaje="El kilometraje nos permite calcular el rendimiento exacto (Km/galón) del camión."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Kilometraje en el Odómetro" obligatorio ayuda="El número de km actual del tablero">
                <WizardInput
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 155000"
                  value={kmOdom}
                  onChange={e => setKmOdom(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Fecha del tanqueo" obligatorio>
                <WizardInput
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Estación de servicio (opcional)" ayuda="Ej: Terpel La Uribe, Texaco Guaduas, Biomax...">
                <WizardInput
                  type="text"
                  placeholder="Nombre o ubicación de la bomba"
                  value={estacion}
                  onChange={e => setEstacion(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 3: VIAJE ASOCIADO Y GUARDAR ── */}
        {pasoWizard === 3 && (
          <>
            <WizardBanner
              icono="📝"
              titulo="Asociar a un viaje y confirmar"
              mensaje="Si este tanqueo corresponde a un viaje específico, selecciónalo para calcular la ganancia neta."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Asociar a un viaje de este camión (opcional)">
                <WizardSelect value={viajeAsociado} onChange={e => setViajeAsociado(e.target.value)}>
                  <option value="">No asociar a ningún viaje (Gasto general)</option>
                  {viajesVehiculo.slice(0, 10).map(v => (
                    <option key={v.firestoreId} value={v.firestoreId}>
                      📍 {v.ruta} ({v.fecha})
                    </option>
                  ))}
                </WizardSelect>
              </WizardCampo>

              <WizardCampo label="Observaciones o notas (opcional)">
                <WizardInput
                  type="text"
                  placeholder="Ej: Tanque lleno antes de subir La Línea"
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                />
              </WizardCampo>

              {/* Resumen Final */}
              <div style={{
                background: "#FFFFFF", border: "1.5px solid #D1DCF0", borderRadius: "16px",
                padding: "16px", margin: "16px 0", boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#6B7280", fontSize: "14px" }}>Galones:</span>
                  <span style={{ fontWeight: 800, color: "#111827", fontSize: "14px" }}>{galones} gal</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#6B7280", fontSize: "14px" }}>Precio por galón:</span>
                  <span style={{ fontWeight: 800, color: "#111827", fontSize: "14px" }}>{fmt(Number(precioGal))}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #E5E7EB", paddingTop: "8px", marginTop: "4px" }}>
                  <span style={{ fontWeight: 800, color: "#111827", fontSize: "16px" }}>Total a registrar:</span>
                  <span style={{ fontWeight: 900, color: "#059669", fontSize: "18px" }}>{fmt(totalEstimado)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={guardar}
                disabled={guardando}
                style={{
                  width: "100%", padding: "16px", borderRadius: "14px",
                  background: "#10B981", color: "#FFFFFF", border: "none",
                  fontSize: "17px", fontWeight: 800, cursor: "pointer",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
                }}
              >
                <CheckCircle2 size={20} />
                {guardando ? "Guardando tanqueo..." : "Confirmar y Guardar Tanqueo"}
              </button>
            </div>
          </>
        )}

        {/* Navegación inferior */}
        {pasoWizard < 3 && (
          <WizardNav
            pasoActual={pasoWizard}
            totalPasos={3}
            onAtras={() => setPasoWizard(p => p - 1)}
            onSiguiente={() => setPasoWizard(p => p + 1)}
            deshabilitarSiguiente={!pasoValido}
            labelSiguiente="Siguiente →"
          />
        )}
      </WizardPantalla>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: LISTA DE TANQUEOS Y RENDIMIENTOS
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button
          type="button"
          aria-label="Volver"
          style={styles.btnVolver}
          onClick={() => navigate(`/vehiculo/${id}`, { state: { tab: "mant" } })}
        >
          <ArrowLeft size={18} color={t.colors.blueText} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Tanqueos · {vehiculo?.placa || "Camión"}</h1>
      </div>

      <div style={styles.contenido}>
        {/* RESUMEN DE RENDIMIENTO */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div style={styles.card}>
            <p style={styles.labelMini}>Rendimiento real</p>
            <p style={{ fontSize: "22px", fontWeight: t.fonts.weightBlack, color: rendPromedio > 0 ? t.colors.green : t.colors.textTertiary, margin: 0, ...t.numeric }}>
              {rendPromedio > 0 ? `${fmtN(rendPromedio)} km/gl` : "—"}
            </p>
            <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "3px 0 0" }}>
              {rendimientos.length > 0 ? `${rendimientos.length} medición${rendimientos.length !== 1 ? "es" : ""}` : "Mín. 2 tanqueos"}
            </p>
          </div>
          <div style={styles.card}>
            <p style={styles.labelMini}>Total gastado</p>
            <p style={{ fontSize: "22px", fontWeight: t.fonts.weightBlack, color: t.colors.textPrimary, margin: 0, ...t.numeric }}>
              {fmt(totalGastado)}
            </p>
            <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "3px 0 0", ...t.numeric }}>
              {fmtN(totalGalones, 0)} galones totales
            </p>
          </div>
        </div>

        {/* BOTÓN REGISTRAR TANQUEO */}
        <button
          type="button"
          style={styles.btnAgregar}
          onClick={() => {
            setMostrarForm(true);
            setPasoWizard(1);
          }}
        >
          <Plus size={20} />
          <span>Registrar nuevo tanqueo</span>
        </button>

        {/* RENDIMIENTO POR TRAMO */}
        {rendimientos.length > 0 && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Rendimiento por tramo</p>
            {rendimientos.reverse().map((r, i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.colors.borderLight}` }}>
                <div>
                  <p style={{ fontSize: "15px", color: t.colors.textPrimary, margin: 0, fontWeight: 800, ...t.numeric }}>
                    {fmtN(r.rendimiento)} km/gal
                  </p>
                  <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "2px 0 0", ...t.numeric }}>
                    {r.fecha} · {r.km.toLocaleString("es-CO")} km · {fmtN(r.gal, 0)} gl
                  </p>
                </div>
                {r.rendimiento >= rendPromedio
                  ? <TrendingUp size={18} color={t.colors.green} strokeWidth={2} />
                  : <TrendingDown size={18} color={t.colors.redText} strokeWidth={2} />
                }
              </div>
            ))}
          </div>
        )}

        {/* HISTORIAL DE TANQUEOS */}
        {historial.length === 0 ? (
          <div style={styles.estadoVacio}>
            <Fuel size={44} color={t.colors.textTertiary} strokeWidth={1.5} />
            <p style={{ fontSize: "16px", fontWeight: 700, color: t.colors.textPrimary, margin: "12px 0 4px" }}>
              Sin tanqueos registrados
            </p>
            <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: 0 }}>
              Registra cada tanqueada de ACPM para controlar el gasto y rendimiento de combustible.
            </p>
          </div>
        ) : (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Historial de tanqueos</p>
            {[...historial].sort((a, b) => b.id - a.id).map((r, i, arr) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.colors.borderLight}` }}>
                <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: 0 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: t.colors.bgSection, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Fuel size={18} color={t.colors.amber || "#F59E0B"} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: t.colors.textPrimary, margin: 0, ...t.numeric }}>
                      {fmtN(r.galones, 0)} gl · {fmt(r.precioGalon)}/gl
                    </p>
                    <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: "2px 0 0", ...t.numeric }}>
                      {r.fecha} · {r.kmOdometro?.toLocaleString("es-CO")} km
                      {r.estacion ? ` · ${r.estacion}` : ""}
                    </p>
                    {(() => {
                      const viajeAsoc = r.viajeId ? viajes.find(v => v.firestoreId === r.viajeId) : null;
                      return viajeAsoc ? (
                        <p style={{ fontSize: "11px", color: t.colors.blueText, fontWeight: 700, margin: "4px 0 0", display: "flex", alignItems: "center", gap: "3px" }}>
                          <MapPin size={12} color={t.colors.blueText} strokeWidth={2.2} />
                          Viaje: {viajeAsoc.ruta} ({viajeAsoc.fecha})
                        </p>
                      ) : null;
                    })()}
                    {r.nota && <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "3px 0 0" }}>{r.nota}</p>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "10px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: t.colors.redText, ...t.numeric }}>
                    {fmt(r.total)}
                  </span>
                  <button
                    type="button"
                    aria-label="Eliminar tanqueo"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "6px" }}
                    onClick={() => setTanqueoAEliminar(r)}
                  >
                    <Trash2 size={16} color={t.colors.textTertiary} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal accesible de confirmación */}
      <ConfirmarModal
        visible={Boolean(tanqueoAEliminar)}
        titulo="¿Eliminar registro de tanqueo?"
        mensaje={tanqueoAEliminar ? `¿Deseas eliminar el tanqueo de ${tanqueoAEliminar.galones} galones del ${tanqueoAEliminar.fecha}?` : ""}
        textoBotonConfirmar="Eliminar tanqueo"
        esPeligroso={true}
        onCancelar={() => setTanqueoAEliminar(null)}
        onConfirmar={ejecutarEliminar}
      />
    </div>
  );
}

const stylesWz = {
  cardWrapper: {
    padding: "0 20px 20px",
  }
};

const styles = {
  pantalla:    { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:      { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:   { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blueText, cursor: "pointer", padding: 0, fontSize: "15px", fontWeight: 700 },
  titulo:      { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  contenido:   { padding: "16px" },
  btnAgregar:  { width: "100%", padding: "16px", background: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", marginBottom: "16px" },
  card:        { background: t.colors.bgCard, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: t.shadows.card, border: `1px solid ${t.colors.borderLight}` },
  cardTitulo:  { fontSize: "12px", fontWeight: 800, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" },
  labelMini:   { fontSize: "12px", color: t.colors.textTertiary, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 },
  estadoVacio: { textAlign: "center", padding: "36px 20px", background: t.colors.bgCard, borderRadius: "16px", border: `1px dashed ${t.colors.borderLight}`, marginBottom: "16px" }
};

export default Tanqueos;
