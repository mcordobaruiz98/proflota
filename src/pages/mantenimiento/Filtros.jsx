/**
 * Hecho por JESUS COSSIO DEV
 * Registro y Control de Filtros del Vehículo
 * Asistente Wizard guiado para transportadores de 30 a 70 años.
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Filter, Plus, CheckCircle2 } from "lucide-react";
import { theme as t } from "../../styles/theme";
import ConfirmarModal from "../../components/ConfirmarModal";
import {
  WizardPantalla,
  WizardHeader,
  WizardProgress,
  WizardBanner,
  WizardCampo,
  WizardInput,
  WizardOpciones,
  WizardNav
} from "../../components/WizardForm";

const TIPOS_FILTRO = [
  { id: "aceite",       label: "Filtro de Aceite",       icono: "🛢️", desc: "Lubricación del motor" },
  { id: "combustible",  label: "Filtro de Combustible",  icono: "⛽", desc: "Purificación de ACPM" },
  { id: "trampa",       label: "Trampa / Separador",     icono: "🔍", desc: "Agua y sedimentos" },
  { id: "aire",         label: "Filtro de Aire",         icono: "💨", desc: "Admisión del motor" },
  { id: "refrigerante", label: "Filtro Refrigerante",    icono: "🌡️", desc: "Sistema de enfriamiento" },
  { id: "hidraulico",   label: "Filtro Hidráulico",      icono: "💧", desc: "Dirección y levante" },
];

function Filtros({ vehiculos = [], mostrarToast, onEditarVehiculo, onAgregar }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo = vehiculos.find(v => String(v.firestoreId) === String(id));
  const [historial, setHistorial] = useState(vehiculo?.filtrosHistorial || []);

const [historialSincronizado, setHistorialSincronizado] = useState(vehiculo?.filtrosHistorial || null);
  if (vehiculo?.filtrosHistorial && vehiculo.filtrosHistorial !== historialSincronizado) {
    setHistorialSincronizado(vehiculo.filtrosHistorial);
    setHistorial(vehiculo.filtrosHistorial);
  }

  // Estados del asistente Wizard
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pasoWizard,  setPasoWizard]  = useState(1); // 1: Tipo/Marca, 2: Km/Fecha, 3: Taller/Costo

  // Campos
  const [tipoFiltro,  setTipoFiltro]  = useState("aceite");
  const [marca,       setMarca]       = useState("");
  const [referencia,  setReferencia]  = useState("");
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
    setMarca("");
    setReferencia("");
    setTaller("");
    setNitTaller("");
    setCosto("");
    setNota("");
    setPasoWizard(1);
    setMostrarForm(false);
  };

  const guardar = async () => {
    if (!kmCambio) {
      if (mostrarToast) mostrarToast("Ingresa el kilometraje del cambio", "error");
      setPasoWizard(2);
      return;
    }
    setGuardando(true);
    const tipoObj = TIPOS_FILTRO.find(x => x.id === tipoFiltro);
    const nuevo = {
      id: Date.now(),
      tipo: tipoFiltro,
      tipoLabel: tipoObj?.label || tipoFiltro,
      marca: marca.trim(),
      referencia: referencia.trim(),
      km: Number(kmCambio),
      fecha,
      taller: taller.trim(),
      costo: Number(costo) || 0,
      nota: nota.trim()
    };
    const nuevos = [nuevo, ...historial];
    setHistorial(nuevos);

    try {
      await onEditarVehiculo(vehiculo.firestoreId, {
        filtrosHistorial: nuevos,
        kmOdometro: Math.max(vehiculo.kmOdometro || 0, Number(kmCambio))
      });

      if (onAgregar) {
        await onAgregar({
          vehiculoId: vehiculo.firestoreId,
          placa: vehiculo.placa || "",
          tipo: "Filtro",
          descripcion: `Cambio de ${tipoObj?.label || tipoFiltro}${marca ? ` · ${marca}` : ""}`,
          fecha,
          km: Number(kmCambio),
          costo: Number(costo) || 0,
          taller: taller || "",
          nitTaller: nitTaller || "",
          nota: nota || "",
          refId: nuevo.id,
        }).catch(() => {});
      }

      if (mostrarToast) mostrarToast("¡Excelente! Filtro registrado con éxito", "exito");
      limpiarFormulario();
    } catch {
      if (mostrarToast) mostrarToast("Error al guardar filtro", "error");
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
      await onEditarVehiculo(vehiculo.firestoreId, { filtrosHistorial: nuevos });
      if (mostrarToast) mostrarToast("Registro de filtro eliminado", "info");
    } catch {
      if (mostrarToast) mostrarToast("Error al eliminar", "error");
    }
  };

  const pasoValido = (() => {
    if (pasoWizard === 1) return Boolean(tipoFiltro);
    if (pasoWizard === 2) return Boolean(kmCambio);
    return true;
  })();

  const ETIQUETAS_WIZARD = [
    "Tipo de filtro",
    "Kilometraje y fecha",
    "Taller y confirmación"
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: ASISTENTE WIZARD GUIADO PARA REGISTRO DE FILTRO
  // ══════════════════════════════════════════════════════════════════════════
  if (mostrarForm) {
    return (
      <WizardPantalla>
        <WizardHeader
          titulo={`Filtros · ${vehiculo?.placa || "Camión"}`}
          onVolver={() => pasoWizard > 1 ? setPasoWizard(p => p - 1) : limpiarFormulario()}
          labelVolver={pasoWizard > 1 ? "Atrás" : "Cancelar"}
        />

        <WizardProgress total={3} actual={pasoWizard} etiquetas={ETIQUETAS_WIZARD} />

        {/* ── PASO 1: TIPO DE FILTRO Y MARCA ── */}
        {pasoWizard === 1 && (
          <>
            <WizardBanner
              icono="🔩"
              titulo="¿Qué filtro le cambiaste al camión?"
              mensaje="Selecciona el tipo de filtro instalado y la marca o referencia."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Tipo de Filtro" obligatorio>
                <WizardOpciones
                  opciones={TIPOS_FILTRO.map(tf => ({
                    valor: tf.id,
                    icono: tf.icono,
                    titulo: tf.label,
                    desc: tf.desc
                  }))}
                  valor={tipoFiltro}
                  onChange={setTipoFiltro}
                />
              </WizardCampo>

              <WizardCampo label="Marca del Filtro" ayuda="Ej: Fleetguard, Donaldson, Baldwin, Wix, Mann...">
                <WizardInput
                  type="text"
                  placeholder="Marca del filtro"
                  value={marca}
                  onChange={e => setMarca(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Referencia o Código (opcional)" ayuda="Ej: LF9009, FF5825, P552100...">
                <WizardInput
                  type="text"
                  placeholder="Número de parte"
                  value={referencia}
                  onChange={e => setReferencia(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 2: KILOMETRAJE Y FECHA ── */}
        {pasoWizard === 2 && (
          <>
            <WizardBanner
              icono="🛣️"
              titulo="¿A qué kilometraje se cambió?"
              mensaje="Registra el odómetro para calcular el intervalo de servicio del filtro."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Kilometraje al momento del cambio" obligatorio ayuda="Odómetro actual en el tablero">
                <WizardInput
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 155000"
                  value={kmCambio}
                  onChange={e => setKmCambio(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Fecha del cambio" obligatorio>
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
              icono="💵"
              titulo="Taller, costo y factura"
              mensaje="Registra el establecimiento donde se compró o instaló y el valor total."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Nombre del Taller o Almacén" ayuda="Ej: Filtros del Norte, CDA La 40...">
                <WizardInput
                  type="text"
                  placeholder="Nombre del establecimiento"
                  value={taller}
                  onChange={e => setTaller(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Costo del filtro e instalación ($)" ayuda="Ej: 120000">
                <WizardInput
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 120000"
                  value={costo}
                  onChange={e => setCosto(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Notas adicionales (opcional)">
                <WizardInput
                  type="text"
                  placeholder="Observaciones"
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
                  {guardando ? "Guardando filtro..." : "Confirmar y Guardar Filtro"}
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
  // RENDER: LISTA DE HISTORIAL DE FILTROS
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
        <h1 style={styles.titulo}>Filtros · {vehiculo?.placa || "Camión"}</h1>
      </div>

      <div style={styles.contenido}>
        {/* BOTÓN REGISTRAR FILTRO */}
        <button
          type="button"
          style={styles.btnAgregar}
          onClick={() => {
            setMostrarForm(true);
            setPasoWizard(1);
          }}
        >
          <Plus size={20} />
          <span>Registrar nuevo cambio de filtro</span>
        </button>
        {/* HISTORIAL */}
        {historial.length === 0 ? (
          <div style={styles.estadoVacio}>
            <Filter size={48} color={t.colors.blueText} strokeWidth={1.5} />
            <p style={{ fontSize: "16px", fontWeight: 700, color: t.colors.textPrimary, margin: "12px 0 4px" }}>
              Sin registros de filtros
            </p>
            <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: 0 }}>
              Registra los cambios de filtro de aceite, combustible, aire y refrigerante.
            </p>
          </div>
        ) : (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Historial de filtros instalados</p>
            {historial.map((r, i, arr) => {
              const tf = TIPOS_FILTRO.find(x => x.id === r.tipo);
              return (
                <div
                  key={r.id}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.colors.borderLight}`
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: 0 }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: t.colors.bgSection, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                      {tf?.icono || "🔩"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "15px", fontWeight: 700, color: t.colors.textPrimary, margin: 0 }}>
                        {tf?.label || r.tipo} {r.marca ? `· ${r.marca}` : ""}
                      </p>
                      <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: "3px 0 0", ...t.numeric }}>
                        {r.fecha} · {r.km?.toLocaleString("es-CO")} km
                        {r.referencia ? ` · Ref: ${r.referencia}` : ""}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Modal accesible de confirmación */}
      <ConfirmarModal
        visible={Boolean(registroAEliminar)}
        titulo="¿Eliminar registro de filtro?"
        mensaje={registroAEliminar ? `¿Deseas eliminar el cambio de filtro de ${registroAEliminar.tipo} del ${registroAEliminar.fecha}?` : ""}
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
  btnAgregar:  { width: "100%", padding: "16px", background: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", marginBottom: "16px" },
  card:        { background: t.colors.bgCard, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: t.shadows.card, border: `1px solid ${t.colors.borderLight}` },
  cardTitulo:  { fontSize: "12px", fontWeight: 800, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" },
  estadoVacio: { textAlign: "center", padding: "36px 20px", background: t.colors.bgCard, borderRadius: "16px", border: `1px dashed ${t.colors.borderLight}`, marginBottom: "16px" }
};

export default Filtros;
