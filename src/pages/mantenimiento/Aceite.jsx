/**
 * Hecho por JESUS COSSIO DEV
 * Registro y Control de Cambio de Aceite de Motor
 * Asistente Wizard guiado para transportadores de 30 a 70 años.
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Droplet, Plus, CheckCircle2 } from "lucide-react";
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

const VISCOSIDADES = ["15W-40", "20W-50", "10W-40", "5W-30", "5W-40", "15W-50", "Otra"];
const MARCAS_ACEITE = ["Mobil", "Shell Rimula", "Castrol", "Chevron Delo", "Valvoline", "Kendall", "Total", "Otra"];

function Aceite({ vehiculos = [], onAgregar, mostrarToast, onEditarVehiculo, onRegistrarMantenimientoConVehiculo }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo  = vehiculos.find(v => String(v.firestoreId) === String(id));
  const [historial, setHistorial] = useState(vehiculo?.aceiteHistorial || []);

  const [historialSincronizado, setHistorialSincronizado] = useState(vehiculo?.aceiteHistorial || null);
  if (vehiculo?.aceiteHistorial && vehiculo.aceiteHistorial !== historialSincronizado) {
    setHistorialSincronizado(vehiculo.aceiteHistorial);
    setHistorial(vehiculo.aceiteHistorial);
  }

  // Estados del asistente Wizard
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pasoWizard,  setPasoWizard]  = useState(1); // 1: Marca/Viscosidad, 2: Km/Galones, 3: Taller/Costo

  // Campos
  const [marca,       setMarca]       = useState("Mobil");
  const [referencia,  setReferencia]  = useState("");
  const [viscosidad,  setViscosidad]  = useState("15W-40");
  const [galones,     setGalones]     = useState("");
  const [kmCambio,    setKmCambio]    = useState(vehiculo?.kmOdometro ? String(vehiculo.kmOdometro) : "");
  const [fecha,       setFecha]       = useState(new Date().toISOString().slice(0, 10));
  const [taller,      setTaller]      = useState("");
  const [nitTaller,   setNitTaller]   = useState("");
  const [costo,       setCosto]       = useState("");
  const [nota,        setNota]        = useState("");
  const [guardando,   setGuardando]   = useState(false);

  // Modal para eliminar
  const [registroAEliminar, setRegistroAEliminar] = useState(null);

  const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");

  const limpiarFormulario = () => {
    setReferencia("");
    setGalones("");
    setTaller("");
    setNitTaller("");
    setCosto("");
    setNota("");
    setPasoWizard(1);
    setMostrarForm(false);
  };

  const guardar = async () => {
    if (!marca.trim()) {
      if (mostrarToast) mostrarToast("Selecciona la marca del aceite", "error");
      setPasoWizard(1);
      return;
    }
    if (!kmCambio) {
      if (mostrarToast) mostrarToast("Ingresa el kilometraje del cambio", "error");
      setPasoWizard(2);
      return;
    }
    setGuardando(true);
    const nuevo = {
      id: Date.now(),
      marca,
      referencia: referencia.trim(),
      viscosidad,
      galones: Number(galones) || 0,
      km: Number(kmCambio),
      fecha,
      taller: taller.trim(),
      nitTaller: nitTaller.trim(),
      costo: Number(costo) || 0,
      nota: nota.trim()
    };
    const nuevos = [nuevo, ...historial];
    setHistorial(nuevos);

    const datosMant = {
      vehiculoId: vehiculo.firestoreId,
      placa: vehiculo.placa || "",
      tipo: "Aceite",
      descripcion: `Cambio de aceite ${marca} ${viscosidad}${referencia ? ` · ${referencia}` : ""}`,
      fecha,
      km: Number(kmCambio),
      costo: Number(costo) || 0,
      taller: taller || "",
      nitTaller: nitTaller || "",
      nota: nota || "",
      refId: nuevo.id
    };
    const datosVehiculoUpdate = {
      aceiteHistorial: nuevos,
      kmOdometro: Math.max(vehiculo.kmOdometro || 0, Number(kmCambio))
    };

    try {
      if (onRegistrarMantenimientoConVehiculo) {
        await onRegistrarMantenimientoConVehiculo(datosMant, datosVehiculoUpdate, vehiculo.firestoreId).catch(() => {});
      } else {
        await onEditarVehiculo(vehiculo.firestoreId, datosVehiculoUpdate);
        if (onAgregar) await onAgregar(datosMant).catch(() => {});
      }

      if (mostrarToast) mostrarToast("¡Excelente! Cambio de aceite registrado", "exito");
      limpiarFormulario();
    } catch {
      if (mostrarToast) mostrarToast("Error al guardar registro", "error");
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarEliminar = async () => {
    if (!registroAEliminar) return;
    const nuevos = historial.filter(r => r.id !== registroAEliminar.id);
    setHistorial(nuevos);
    setRegistroAEliminar(null);
    try {
      await onEditarVehiculo(vehiculo.firestoreId, { aceiteHistorial: nuevos });
      if (mostrarToast) mostrarToast("Registro de aceite eliminado", "info");
    } catch {
      if (mostrarToast) mostrarToast("Error al eliminar", "error");
    }
  };

  const pasoValido = (() => {
    if (pasoWizard === 1) return Boolean(marca);
    if (pasoWizard === 2) return Boolean(kmCambio);
    return true;
  })();

  const ETIQUETAS_WIZARD = [
    "Marca y viscosidad",
    "Kilometraje y galones",
    "Taller y confirmación"
  ];

  const ultimo = historial[0];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: ASISTENTE WIZARD GUIADO PARA CAMBIO DE ACEITE
  // ══════════════════════════════════════════════════════════════════════════
  if (mostrarForm) {
    return (
      <WizardPantalla>
        <WizardHeader
          titulo={`Aceite · ${vehiculo?.placa || "Camión"}`}
          onVolver={() => pasoWizard > 1 ? setPasoWizard(p => p - 1) : limpiarFormulario()}
          labelVolver={pasoWizard > 1 ? "Atrás" : "Cancelar"}
        />

        <WizardProgress total={3} actual={pasoWizard} etiquetas={ETIQUETAS_WIZARD} />

        {/* ── PASO 1: MARCA Y VISCOSIDAD ── */}
        {pasoWizard === 1 && (
          <>
            <WizardBanner
              icono="🛢️"
              titulo="¿Qué aceite le aplicaron al motor?"
              mensaje="Selecciona la marca y viscosidad del aceite lubricante utilizado."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Marca del Aceite" obligatorio>
                <WizardSelect value={marca} onChange={e => setMarca(e.target.value)}>
                  {MARCAS_ACEITE.map(m => <option key={m} value={m}>{m}</option>)}
                </WizardSelect>
              </WizardCampo>

              <WizardCampo label="Viscosidad del Aceite" obligatorio>
                <WizardSelect value={viscosidad} onChange={e => setViscosidad(e.target.value)}>
                  {VISCOSIDADES.map(v => <option key={v} value={v}>{v}</option>)}
                </WizardSelect>
              </WizardCampo>

              <WizardCampo label="Línea o Referencia (opcional)" ayuda="Ej: Delvac Modern, Rimula R4X, Rubia TIR...">
                <WizardInput
                  type="text"
                  placeholder="Referencia comercial"
                  value={referencia}
                  onChange={e => setReferencia(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 2: KILOMETRAJE Y GALONES ── */}
        {pasoWizard === 2 && (
          <>
            <WizardBanner
              icono="🛣️"
              titulo="¿A qué kilometraje y cuántos galones?"
              mensaje="Ingresa el kilometraje actual para programar la próxima alerta de cambio."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Kilometraje al momento del cambio" obligatorio ayuda="El odómetro actual del camión">
                <WizardInput
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 155000"
                  value={kmCambio}
                  onChange={e => setKmCambio(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Galones de aceite aplicados" ayuda="Capacidad de cárter (Ej: 10, 11 o 12 galones)">
                <WizardInput
                  type="number"
                  inputMode="decimal"
                  placeholder="Ej: 12"
                  value={galones}
                  onChange={e => setGalones(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Fecha del cambio de aceite" obligatorio>
                <WizardInput
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 3: TALLER Y COSTO ── */}
        {pasoWizard === 3 && (
          <>
            <WizardBanner
              icono="🔧"
              titulo="Taller, costo y factura"
              mensaje="Registra el lubricentro o taller donde se realizó y el valor total de la factura."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Nombre del Taller / Lubricentro" ayuda="Ej: Serviteca El Retén, CDA La Portada...">
                <WizardInput
                  type="text"
                  placeholder="Nombre del establecimiento"
                  value={taller}
                  onChange={e => setTaller(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Costo total del cambio ($)" ayuda="Aceite + mano de obra (Ej: 380000)">
                <WizardInput
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 380000"
                  value={costo}
                  onChange={e => setCosto(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Notas u observaciones (opcional)">
                <WizardInput
                  type="text"
                  placeholder="Ej: Incluyó filtro de aceite nuevo"
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                />
              </WizardCampo>

              <div style={{ marginTop: "24px" }}>
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
                  {guardando ? "Guardando registro..." : "Confirmar y Guardar Cambio"}
                </button>
              </div>
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
  // RENDER: LISTA DE HISTORIAL DE ACEITE
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
        <h1 style={styles.titulo}>Aceite de Motor</h1>
      </div>

      <div style={styles.contenido}>
        {/* TARJETA ÚLTIMO CAMBIO */}
        {ultimo && (
          <div style={styles.cardUltimo}>
            <p style={styles.labelUltimo}>Último cambio registrado</p>
            <p style={{ fontSize: "22px", fontWeight: 900, color: "#FFFFFF", margin: "0 0 6px" }}>
              {ultimo.marca} {ultimo.viscosidad}
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", margin: 0, ...t.numeric }}>
              📅 {ultimo.fecha} · 🛣️ {ultimo.km?.toLocaleString("es-CO")} km
              {ultimo.galones > 0 ? ` · 🛢️ ${ultimo.galones} gal` : ""}
            </p>
            {ultimo.taller && (
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>
                📍 Taller: {ultimo.taller}
              </p>
            )}
          </div>
        )}

        {/* BOTÓN REGISTRAR CAMBIO */}
        <button
          type="button"
          style={styles.btnAgregar}
          onClick={() => {
            setMostrarForm(true);
            setPasoWizard(1);
          }}
        >
          <Plus size={20} />
          <span>Registrar nuevo cambio de aceite</span>
        </button>

        {/* HISTORIAL */}
        {historial.length === 0 ? (
          <div style={styles.estadoVacio}>
            <Droplet size={48} color={t.colors.blueText} strokeWidth={1.5} />
            <p style={{ fontSize: "16px", fontWeight: 700, color: t.colors.textPrimary, margin: "12px 0 4px" }}>
              Sin registros de aceite
            </p>
            <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: 0 }}>
              Registra el cambio de aceite para controlar los periodos de lubricación del motor.
            </p>
          </div>
        ) : (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Historial de cambios</p>
            {historial.map((r, i, arr) => (
              <div
                key={r.id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.colors.borderLight}`
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: t.colors.textPrimary, margin: 0 }}>
                    {r.marca} {r.viscosidad} {r.referencia ? `· ${r.referencia}` : ""}
                  </p>
                  <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: "3px 0 0", ...t.numeric }}>
                    {r.fecha} · {r.km?.toLocaleString("es-CO")} km
                    {r.galones > 0 ? ` · ${r.galones} gal` : ""}
                  </p>
                  {r.taller && (
                    <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "3px 0 0" }}>
                      Taller: {r.taller}
                    </p>
                  )}
                  {r.nota && (
                    <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "3px 0 0" }}>
                      {r.nota}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "10px" }}>
                  {r.costo > 0 && (
                    <span style={{ fontSize: "15px", fontWeight: 800, color: t.colors.redText, ...t.numeric }}>
                      {fmt(r.costo)}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="Eliminar registro"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "6px" }}
                    onClick={() => setRegistroAEliminar(r)}
                  >
                    <Trash2 size={16} color={t.colors.red} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal accesible de confirmación */}
      <ConfirmarModal
        visible={Boolean(registroAEliminar)}
        titulo="¿Eliminar registro de aceite?"
        mensaje={registroAEliminar ? `¿Deseas eliminar el registro de ${registroAEliminar.marca} ${registroAEliminar.viscosidad} del ${registroAEliminar.fecha}?` : ""}
        textoBotonConfirmar="Eliminar registro"
        esPeligroso={true}
        onCancelar={() => setRegistroAEliminar(null)}
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
  cardUltimo:  { background: "linear-gradient(135deg, #0284C7, #0369A1)", borderRadius: "16px", padding: "18px", marginBottom: "16px", boxShadow: "0 4px 14px rgba(2,132,199,0.25)" },
  labelUltimo: { fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 },
  btnAgregar:  { width: "100%", padding: "16px", background: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", marginBottom: "16px" },
  card:        { background: t.colors.bgCard, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: t.shadows.card, border: `1px solid ${t.colors.borderLight}` },
  cardTitulo:  { fontSize: "12px", fontWeight: 800, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" },
  estadoVacio: { textAlign: "center", padding: "36px 20px", background: t.colors.bgCard, borderRadius: "16px", border: `1px dashed ${t.colors.borderLight}`, marginBottom: "16px" }
};

export default Aceite;