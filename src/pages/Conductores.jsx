/**
 * Hecho por JESUS COSSIO DEV
 * Gestión y Registro Guiado de Conductores
 * Optimizado para transportadores de 30 a 70 años con modo Wizard claro y acciones directas.
 */
import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, User, Trash2, Edit2, AlertCircle,
  MessageSquare, CheckCircle2, Plus,
  FileText, UploadCloud, Check, ExternalLink, Loader2
} from "lucide-react";
import { theme as t } from "../styles/theme";
import { sanitizar } from "../utils/validar";
import { useSubirArchivo, sanearNombreArchivo } from "../hooks/useSubirArchivo";
import ConfirmarModal from "../components/ConfirmarModal";
import {
  WizardPantalla,
  WizardHeader,
  WizardProgress,
  WizardBanner,
  WizardCampo,
  WizardInput,
  WizardOpciones,
  WizardNav
} from "../components/WizardForm";

function Conductores({ conductores = [], viajes = [], onAgregar, onEditar, onEliminar, mostrarToast }) {
  const guardandoRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { subirArchivo, progreso, subiendo } = useSubirArchivo(mostrarToast);

  // Estados del formulario Wizard (3 Pasos)
  const [verForm, setVerForm] = useState(false);
  const [pasoWizard, setPasoWizard] = useState(1); // 1 a 3
  const [editId, setEditId] = useState(null);

  // Campos
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [licencia, setLicencia] = useState("");
  const [licVence, setLicVence] = useState("");
  const [catLic, setCatLic] = useState("C3");
  const [arl, setArl] = useState("");
  const [eps, setEps] = useState("");
  const [fondoPension, setFondoPension] = useState("");
  const [docCedula, setDocCedula] = useState("");
  const [docRut, setDocRut] = useState("");
  const [docBanco, setDocBanco] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Modal de confirmación para eliminar
  const [modalEliminar, setModalEliminar] = useState({ visible: false, id: null, nombre: "" });

  const hoy = new Date();

  // ── LIQUIDACIÓN SEMANAL ──
  const lunesSemana = (() => {
    const d = new Date();
    const dia = d.getDay();
    d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
    return d.toISOString().slice(0, 10);
  })();
  const [verLiquidacion, setVerLiquidacion] = useState(location.state?.liquidar || false);
  const [liqConductor, setLiqConductor] = useState("");
  const [liqDesde, setLiqDesde] = useState(lunesSemana);
  const [liqHasta, setLiqHasta] = useState(new Date().toISOString().slice(0, 10));

  const fmt = (v) => "$" + Math.round(v || 0).toLocaleString("es-CO");

  const viajesLiq = (liqConductor && liqDesde && liqHasta && liqDesde <= liqHasta)
    ? viajes.filter(v => v.condNom === liqConductor && v.fecha >= liqDesde && v.fecha <= liqHasta)
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
    : [];
  const liqPagoViajes = viajesLiq.reduce((s, v) => s + (v.conductor || 0), 0);
  const liqAnticipos  = viajesLiq.reduce((s, v) => s + (v.anticipoMonto || 0), 0);
  const liqGastosRep  = viajesLiq.reduce((s, v) => s + (v.anticipoGastos || []).reduce((x, g) => x + (g.monto || 0), 0), 0);
  const liqNeto       = liqPagoViajes - liqAnticipos + liqGastosRep;

  const fFecha = (iso) => {
    if (!iso) return "—";
    const [, m, d] = iso.split("-");
    return `${d}/${m}`;
  };

  const compartirLiquidacion = () => {
    const lineas = [
      `*LIQUIDACIÓN — NAVIRA*`,
      ``,
      `*Conductor:* ${liqConductor}`,
      `*Período:* ${fFecha(liqDesde)} al ${fFecha(liqHasta)}`,
      ``,
      `*Viajes del período:*`,
      ...viajesLiq.map(v => `• ${fFecha(v.fecha)} ${v.ruta || "—"} (${v.placa || "—"}): ${fmt(v.conductor || 0)}`),
      ``,
      `Total viajes: ${fmt(liqPagoViajes)}`,
      liqAnticipos > 0 ? `(−) Anticipos entregados: ${fmt(liqAnticipos)}` : null,
      liqGastosRep > 0 ? `(+) Gastos reportados: ${fmt(liqGastosRep)}` : null,
      `━━━━━━━━━━━━`,
      `✅ *A PAGAR: ${fmt(liqNeto)}*`,
      ``,
      `_Generado por NAVIRA — naviraflota.app_`,
    ].filter(l => l !== null).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lineas)}`, "_blank");
  };

  const limpiar = () => {
    setNombre(""); setCedula(""); setTelefono(""); setCorreo("");
    setLicencia(""); setLicVence(""); setCatLic("C3");
    setArl(""); setEps(""); setFondoPension("");
    setDocCedula(""); setDocRut(""); setDocBanco("");
    setEditId(null);
    setPasoWizard(1);
    setVerForm(false);
  };

  const abrirEdicion = (c) => {
    setNombre(c.nombre || ""); setCedula(c.cedula || "");
    setTelefono(c.telefono || ""); setCorreo(c.correo || "");
    setLicencia(c.licencia || ""); setLicVence(c.licVence || "");
    setCatLic(c.catLic || "C3"); setArl(c.arl || ""); setEps(c.eps || "");
    setFondoPension(c.fondoPension || "");
    setDocCedula(c.docCedula || ""); setDocRut(c.docRut || ""); setDocBanco(c.docBanco || "");
    setEditId(c.firestoreId);
    setPasoWizard(1);
    setVerForm(true);
  };

  const confirmarEliminacion = (c) => {
    setModalEliminar({ visible: true, id: c.firestoreId, nombre: c.nombre });
  };

  const ejecutarEliminar = async () => {
    if (!modalEliminar.id) return;
    try {
      await onEliminar(modalEliminar.id);
      mostrarToast("Conductor eliminado", "info");
    } catch {
      mostrarToast("Error al eliminar conductor", "error");
    } finally {
      setModalEliminar({ visible: false, id: null, nombre: "" });
    }
  };

  const guardar = async () => {
    if (guardandoRef.current || guardando) return;
    if (!nombre.trim()) {
      mostrarToast("Ingresa el nombre del conductor", "error");
      setPasoWizard(1);
      return;
    }
    if (!editId && conductores.length >= 50) {
      mostrarToast("Máximo 50 conductores por cuenta", "error");
      return;
    }
    guardandoRef.current = true;
    setGuardando(true);
    const datos = {
      nombre: sanitizar(nombre).slice(0, 100),
      cedula: sanitizar(cedula).slice(0, 20),
      telefono: (telefono || "").replace(/[^0-9+\s-]/g, "").slice(0, 20),
      correo: sanitizar(correo).slice(0, 80),
      licencia: sanitizar(licencia).slice(0, 30),
      licVence,
      catLic: sanitizar(catLic).slice(0, 5),
      arl: sanitizar(arl).slice(0, 50),
      eps: sanitizar(eps).slice(0, 50),
      fondoPension: sanitizar(fondoPension).slice(0, 50),
      docCedula: docCedula || "",
      docRut: docRut || "",
      docBanco: docBanco || "",
    };
    try {
      if (editId) {
        await onEditar(editId, datos);
        mostrarToast("Conductor actualizado con éxito", "exito");
      } else {
        await onAgregar(datos);
        mostrarToast("¡Excelente! Conductor registrado", "exito");
      }
      limpiar();
    } catch {
      mostrarToast("Error al guardar conductor", "error");
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  // Validaciones del asistente
  const pasoValido = (() => {
    if (pasoWizard === 1) return nombre.trim().length >= 2;
    return true;
  })();

  const ETIQUETAS_WIZARD = [
    "Datos Básicos",
    "Licencias y Afiliaciones",
    "Documentos (RUT, Cédula, Banco)"
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: FORMULARIO WIZARD GUIADO (3 PASOS)
  // ══════════════════════════════════════════════════════════════════════════
  if (verForm) {
    return (
      <WizardPantalla>
        <WizardHeader
          titulo={editId ? "Editar Conductor" : "Nuevo Conductor"}
          onVolver={() => pasoWizard > 1 ? setPasoWizard(p => p - 1) : limpiar()}
          labelVolver={pasoWizard > 1 ? "Atrás" : "Cancelar"}
        />

        <WizardProgress total={3} actual={pasoWizard} etiquetas={ETIQUETAS_WIZARD} />

        {/* ── PASO 1: DATOS BÁSICOS ── */}
        {pasoWizard === 1 && (
          <>
            <WizardBanner
              icono="👨‍✈️"
              titulo="1. Datos Básicos del Conductor"
              mensaje="Ingresa el nombre completo, cédula de ciudadanía y celular para contacto y reportes."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Nombre completo" obligatorio ayuda="Ej: Juan Carlos Pérez">
                <WizardInput
                  type="text"
                  placeholder="Nombre y apellido"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
              </WizardCampo>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <WizardCampo label="Número de Cédula" obligatorio ayuda="Cédula de ciudadanía">
                  <WizardInput
                    type="text"
                    placeholder="Ej: 1023456789"
                    value={cedula}
                    onChange={e => setCedula(e.target.value)}
                  />
                </WizardCampo>

                <WizardCampo label="Celular / WhatsApp" obligatorio ayuda="Para enviar liquidaciones">
                  <WizardInput
                    type="tel"
                    placeholder="Ej: 310 123 4567"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                  />
                </WizardCampo>
              </div>

              <WizardCampo label="Correo electrónico (opcional)">
                <WizardInput
                  type="email"
                  placeholder="conductor@ejemplo.com"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 2: LICENCIAS Y AFILIACIONES ── */}
        {pasoWizard === 2 && (
          <>
            <WizardBanner
              icono="🪪"
              titulo="2. Licencias y Afiliaciones"
              mensaje="Categoría del pase, fecha de vencimiento y entidades de seguridad social (ARL y EPS)."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Categoría de Licencia">
                <WizardOpciones
                  opciones={[
                    { valor: "C3", icono: "🚛", titulo: "C3 — Articulados", desc: "Tractomulas y cabezotes" },
                    { valor: "C2", icono: "🚚", titulo: "C2 — Rígidos", desc: "Camiones, doble troque y buses" },
                    { valor: "C1", icono: "🚐", titulo: "C1 — Livianos", desc: "Turbo, camionetas de servicio público" },
                  ]}
                  valor={catLic}
                  onChange={setCatLic}
                />
              </WizardCampo>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <WizardCampo label="Número de Licencia">
                  <WizardInput
                    type="text"
                    placeholder="Ej: 1023456789"
                    value={licencia}
                    onChange={e => setLicencia(e.target.value)}
                  />
                </WizardCampo>

                <WizardCampo label="Fecha de vencimiento" ayuda="Te avisaremos antes de vencer">
                  <WizardInput
                    type="date"
                    value={licVence}
                    onChange={e => setLicVence(e.target.value)}
                  />
                </WizardCampo>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <WizardCampo label="ARL Afiliada" ayuda="Ej: Sura, Positiva, Bolívar...">
                  <WizardInput
                    type="text"
                    placeholder="Nombre de la ARL"
                    value={arl}
                    onChange={e => setArl(e.target.value)}
                  />
                </WizardCampo>

                <WizardCampo label="EPS Afiliada" ayuda="Ej: Sanitas, Sura, Nueva EPS...">
                  <WizardInput
                    type="text"
                    placeholder="Nombre de la EPS"
                    value={eps}
                    onChange={e => setEps(e.target.value)}
                  />
                </WizardCampo>
              </div>

              <WizardCampo label="Fondo de Pensiones (opcional)">
                <WizardInput
                  type="text"
                  placeholder="Ej: Porvenir, Protección, Colfondos..."
                  value={fondoPension}
                  onChange={e => setFondoPension(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 3: DOCUMENTOS (RUT, CÉDULA, BANCO) ── */}
        {pasoWizard === 3 && (
          <>
            <WizardBanner
              icono="📁"
              titulo="3. Documentos Obligatorios"
              mensaje="Adjunta los documentos del conductor en PDF o imagen para tener el expediente al día."
            />
            <div style={stylesWz.cardWrapper}>

              {/* Documento 1: Cédula */}
              <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "14px", marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={18} color="#2563EB" />
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E293B", display: "block" }}>
                        Cédula de Ciudadanía
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        PDF o Foto por ambos lados
                      </span>
                    </div>
                  </div>
                  {docCedula && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#10B981" }}>
                      <Check size={14} /> Adjunta
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    padding: "10px 14px", background: "#EFF6FF", border: "1.5px dashed #93C5FD",
                    borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#2563EB", cursor: "pointer"
                  }}>
                    {subiendo["cedula"] ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    <span>{subiendo["cedula"] ? `Subiendo (${progreso["cedula"] || 0}%)...` : docCedula ? "Reemplazar Cédula" : "Subir Cédula (PDF/Imagen)"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const nombreSaneado = sanearNombreArchivo(file.name);
                          subirArchivo(file, `conductores/${Date.now()}_cedula_${nombreSaneado}`, "cedula", (url) => setDocCedula(url));
                        }
                      }}
                    />
                  </label>
                  {docCedula && (
                    <a href={docCedula} target="_blank" rel="noreferrer" style={{ padding: "10px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "10px", color: "#2563EB", display: "flex", alignItems: "center" }}>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Documento 2: RUT */}
              <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "14px", marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={18} color="#059669" />
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E293B", display: "block" }}>
                        RUT (Registro Único Tributario)
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        PDF actualizado DIAN
                      </span>
                    </div>
                  </div>
                  {docRut && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#10B981" }}>
                      <Check size={14} /> Adjunto
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    padding: "10px 14px", background: "#F0FDF4", border: "1.5px dashed #86EFAC",
                    borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#059669", cursor: "pointer"
                  }}>
                    {subiendo["rut"] ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    <span>{subiendo["rut"] ? `Subiendo (${progreso["rut"] || 0}%)...` : docRut ? "Reemplazar RUT" : "Subir RUT (PDF/Imagen)"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const nombreSaneado = sanearNombreArchivo(file.name);
                          subirArchivo(file, `conductores/${Date.now()}_rut_${nombreSaneado}`, "rut", (url) => setDocRut(url));
                        }
                      }}
                    />
                  </label>
                  {docRut && (
                    <a href={docRut} target="_blank" rel="noreferrer" style={{ padding: "10px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "10px", color: "#059669", display: "flex", alignItems: "center" }}>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Documento 3: Certificación Bancaria */}
              <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "14px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={18} color="#D97706" />
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E293B", display: "block" }}>
                        Certificación Bancaria
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        Para pago de fletes y liquidaciones
                      </span>
                    </div>
                  </div>
                  {docBanco && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#10B981" }}>
                      <Check size={14} /> Adjunta
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    padding: "10px 14px", background: "#FFFBEB", border: "1.5px dashed #FCD34D",
                    borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#D97706", cursor: "pointer"
                  }}>
                    {subiendo["banco"] ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    <span>{subiendo["banco"] ? `Subiendo (${progreso["banco"] || 0}%)...` : docBanco ? "Reemplazar Certificado" : "Subir Certificación Bancaria"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const nombreSaneado = sanearNombreArchivo(file.name);
                          subirArchivo(file, `conductores/${Date.now()}_banco_${nombreSaneado}`, "banco", (url) => setDocBanco(url));
                        }
                      }}
                    />
                  </label>
                  {docBanco && (
                    <a href={docBanco} target="_blank" rel="noreferrer" style={{ padding: "10px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "10px", color: "#D97706", display: "flex", alignItems: "center" }}>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
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
                  {guardando ? "Guardando conductor..." : editId ? "Actualizar Conductor" : "Finalizar y Registrar Conductor"}
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
  // RENDER: LISTA DE CONDUCTORES Y LIQUIDACIÓN
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={styles.pantalla}>
      {/* Header */}
      <div style={styles.header}>
        <button
          type="button"
          aria-label="Volver"
          style={styles.btnVolver}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Conductores</h1>
      </div>

      <div style={styles.contenido}>
        {/* Botón Principal de Agregar Conductor */}
        <button
          type="button"
          style={styles.btnAgregar}
          onClick={() => {
            limpiar();
            setVerForm(true);
          }}
        >
          <Plus size={20} />
          <span>Registrar nuevo conductor</span>
        </button>

        {/* ── MÓDULO DE LIQUIDACIÓN SEMANAL ── */}
        {conductores.length > 0 && (
          <div style={styles.cardLiquidacion}>
            <button
              type="button"
              aria-expanded={verLiquidacion}
              style={styles.btnToggleLiq}
              onClick={() => setVerLiquidacion(!verLiquidacion)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>💵</span>
                <div>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: t.colors.green, display: "block" }}>
                    Liquidación de Conductor
                  </span>
                  <span style={{ fontSize: "12px", color: t.colors.textSecondary }}>
                    Calcula y envía pagos semanales por WhatsApp
                  </span>
                </div>
              </div>
              <span style={{ color: t.colors.textTertiary, fontSize: "14px" }}>
                {verLiquidacion ? "▲ Ocultar" : "▼ Calcular"}
              </span>
            </button>

            {verLiquidacion && (
              <div style={{ marginTop: "14px", borderTop: `1px solid ${t.colors.borderLight}`, paddingTop: "14px" }}>
                <label htmlFor="a11y-Conductores-liqConductor" style={styles.labelCampo}>Selecciona el conductor</label>
                <select
                  id="a11y-Conductores-liqConductor"
                  value={liqConductor}
                  onChange={e => setLiqConductor(e.target.value)}
                  style={styles.inputSelect}
                >
                  <option value="">Seleccionar conductor...</option>
                  {[...new Set([...conductores.map(c => c.nombre), ...viajes.map(v => v.condNom).filter(Boolean)])].map((nom, i) => (
                    <option key={i} value={nom}>{nom}</option>
                  ))}
                </select>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div>
                    <label htmlFor="a11y-Conductores-liqDesde" style={styles.labelCampo}>Desde</label>
                    <input
                      id="a11y-Conductores-liqDesde"
                      type="date"
                      value={liqDesde}
                      onChange={e => setLiqDesde(e.target.value)}
                      style={styles.inputFecha}
                    />
                  </div>
                  <div>
                    <label htmlFor="a11y-Conductores-liqHasta" style={styles.labelCampo}>Hasta</label>
                    <input
                      id="a11y-Conductores-liqHasta"
                      type="date"
                      value={liqHasta}
                      onChange={e => setLiqHasta(e.target.value)}
                      style={styles.inputFecha}
                    />
                  </div>
                </div>

                {liqConductor && viajesLiq.length > 0 && (
                  <div style={styles.boxResumenLiq}>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: t.colors.textPrimary, margin: "0 0 8px" }}>
                      Viajes encontrados ({viajesLiq.length})
                    </p>
                    {viajesLiq.map((v, i) => (
                      <div key={v.firestoreId || i} style={styles.filaViajeLiq}>
                        <span style={{ color: t.colors.textSecondary }}>
                          {fFecha(v.fecha)} · {v.ruta || "—"} ({v.placa || ""})
                        </span>
                        <span style={{ fontWeight: 700, color: t.colors.textPrimary }}>
                          {fmt(v.conductor || 0)}
                        </span>
                      </div>
                    ))}

                    <div style={{ padding: "10px 0 0", borderTop: `1px solid ${t.colors.borderLight}`, marginTop: "8px" }}>
                      <div style={styles.filaTot}>
                        <span style={{ color: t.colors.textSecondary }}>Subtotal viajes</span>
                        <span style={{ fontWeight: 700, color: t.colors.textPrimary }}>{fmt(liqPagoViajes)}</span>
                      </div>
                      {liqAnticipos > 0 && (
                        <div style={styles.filaTot}>
                          <span style={{ color: t.colors.textSecondary }}>(−) Anticipos dados</span>
                          <span style={{ fontWeight: 700, color: t.colors.red }}>−{fmt(liqAnticipos)}</span>
                        </div>
                      )}
                      {liqGastosRep > 0 && (
                        <div style={styles.filaTot}>
                          <span style={{ color: t.colors.textSecondary }}>(+) Gastos reportados</span>
                          <span style={{ fontWeight: 700, color: t.colors.green }}>+{fmt(liqGastosRep)}</span>
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginTop: "10px", padding: "14px 16px",
                      background: liqNeto >= 0 ? t.colors.greenSoft : t.colors.redSoft,
                      border: `1.5px solid ${liqNeto >= 0 ? t.colors.greenBorder : t.colors.redBorder}`,
                      borderRadius: "14px"
                    }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: t.colors.textSecondary, textTransform: "uppercase" }}>
                        Total a Pagar
                      </span>
                      <span style={{ fontSize: "24px", fontWeight: 900, color: liqNeto >= 0 ? t.colors.green : t.colors.red }}>
                        {fmt(liqNeto)}
                      </span>
                    </div>

                    <button
                      type="button"
                      style={styles.btnWhatsapp}
                      onClick={compartirLiquidacion}
                    >
                      <MessageSquare size={18} />
                      Enviar comprobante por WhatsApp
                    </button>
                  </div>
                )}

                {liqConductor && viajesLiq.length === 0 && (
                  <p style={{ fontSize: "13px", color: t.colors.textTertiary, textAlign: "center", margin: "10px 0" }}>
                    No se encontraron viajes de {liqConductor} en el período seleccionado.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Estado Vacío */}
        {conductores.length === 0 && (
          <div style={styles.estadoVacio}>
            <User size={48} color={t.colors.textTertiary} strokeWidth={1.5} />
            <p style={{ fontSize: "16px", fontWeight: 700, color: t.colors.textPrimary, margin: "12px 0 4px" }}>
              No tienes conductores registrados
            </p>
            <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: 0 }}>
              Registra a tus conductores para asignar viajes y calcular sus pagos semanales automáticamente.
            </p>
          </div>
        )}

        {/* Lista de Tarjetas de Conductores */}
        {conductores.map(c => {
          const diasLic = c.licVence ? Math.ceil((new Date(c.licVence) - hoy) / (1000 * 60 * 60 * 24)) : null;
          const licVencida = diasLic !== null && diasLic < 0;
          const licProxima = diasLic !== null && diasLic >= 0 && diasLic <= 30;

          return (
            <div key={c.firestoreId} style={styles.cardConductor}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: 0 }}>
                  <div style={styles.avatar}>
                    <User size={24} color={t.colors.blue} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "17px", fontWeight: 800, color: t.colors.textPrimary, margin: 0 }}>
                      {c.nombre}
                    </p>
                    <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: "3px 0 0" }}>
                      {c.cedula ? `CC: ${c.cedula}` : "Sin cédula registrada"}
                    </p>
                    {c.licencia && (
                      <p style={{ fontSize: "13px", color: t.colors.textTertiary, margin: "3px 0 0" }}>
                        Licencia: {c.licencia} {c.catLic ? `(Cat ${c.catLic})` : ""}
                      </p>
                    )}
                    {diasLic !== null && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        marginTop: "6px", padding: "3px 8px", borderRadius: "8px",
                        background: licVencida ? "#FEE2E2" : licProxima ? "#FEF3C7" : "#D1FAE5"
                      }}>
                        {(licVencida || licProxima) && (
                          <AlertCircle size={13} color={licVencida ? "#DC2626" : "#D97706"} strokeWidth={2} />
                        )}
                        <span style={{
                          fontSize: "12px", fontWeight: 700,
                          color: licVencida ? "#DC2626" : licProxima ? "#D97706" : "#059669"
                        }}>
                          {licVencida ? `Licencia vencida hace ${Math.abs(diasLic)}d` : diasLic === 0 ? "Licencia vence hoy" : `Licencia vence en ${diasLic} días`}
                        </span>
                      </div>
                    )}
                    {(c.arl || c.eps) && (
                      <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "5px 0 0" }}>
                        {c.arl ? `ARL: ${c.arl}` : ""}{c.arl && c.eps ? " · " : ""}{c.eps ? `EPS: ${c.eps}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    aria-label="Editar conductor"
                    style={styles.btnIcono}
                    onClick={() => abrirEdicion(c)}
                  >
                    <Edit2 size={16} color={t.colors.blue} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar conductor"
                    style={styles.btnIcono}
                    onClick={() => confirmarEliminacion(c)}
                  >
                    <Trash2 size={16} color={t.colors.red} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Botón WhatsApp si tiene teléfono */}
              {c.telefono && (
                <div style={{ marginTop: "12px", borderTop: `1px solid ${t.colors.borderLight}`, paddingTop: "10px" }}>
                  <a
                    href={`https://wa.me/${c.telefono.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.btnLlamar}
                  >
                    <MessageSquare size={16} color="#25D366" />
                    <span>WhatsApp: {c.telefono}</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmarModal
        visible={modalEliminar.visible}
        titulo="¿Eliminar conductor?"
        mensaje={`¿Estás seguro de que deseas eliminar a ${modalEliminar.nombre}? Esta acción no se puede deshacer.`}
        textoBotonConfirmar="Eliminar conductor"
        esPeligroso={true}
        onConfirmar={ejecutarEliminar}
        onCancelar={() => setModalEliminar({ visible: false, id: null, nombre: "" })}
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
  pantalla:        { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:          { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:       { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blue, cursor: "pointer", padding: 0, fontSize: "15px", fontWeight: 700 },
  titulo:          { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  contenido:       { padding: "16px" },
  btnAgregar:      { width: "100%", padding: "16px", background: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", marginBottom: "16px" },
  cardLiquidacion: { background: t.colors.bgCard, borderRadius: "16px", padding: "16px", marginBottom: "16px", boxShadow: t.shadows.card, border: `1.5px solid ${t.colors.greenBorder}` },
  btnToggleLiq:    { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", width: "100%", background: "none", border: "none", padding: 0, font: "inherit", textAlign: "left" },
  labelCampo:      { fontSize: "12px", fontWeight: 700, color: t.colors.textSecondary, display: "block", marginBottom: "4px", textTransform: "uppercase" },
  inputSelect:     { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: "12px", border: `1.5px solid ${t.colors.border}`, background: t.colors.bgPrimary, color: t.colors.textPrimary, fontSize: "15px", marginBottom: "10px" },
  inputFecha:      { width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: "12px", border: `1.5px solid ${t.colors.border}`, background: t.colors.bgPrimary, color: t.colors.textPrimary, fontSize: "14px" },
  boxResumenLiq:   { marginTop: "10px" },
  filaViajeLiq:    { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${t.colors.borderLight}`, fontSize: "13px" },
  filaTot:         { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "14px" },
  btnWhatsapp:     { width: "100%", marginTop: "12px", padding: "14px", background: "#25D366", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 2px 8px rgba(37,211,102,0.3)" },
  estadoVacio:     { textAlign: "center", padding: "36px 20px", background: t.colors.bgCard, borderRadius: "16px", border: `1px dashed ${t.colors.borderLight}`, marginBottom: "16px" },
  cardConductor:   { background: t.colors.bgCard, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: t.shadows.card, border: `1px solid ${t.colors.borderLight}` },
  avatar:          { width: "46px", height: "46px", borderRadius: "50%", background: t.colors.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  btnIcono:        { background: "none", border: `1px solid ${t.colors.borderLight}`, borderRadius: "10px", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "36px", minHeight: "36px" },
  btnLlamar:       { display: "flex", alignItems: "center", gap: "8px", color: t.colors.textPrimary, textDecoration: "none", fontSize: "14px", fontWeight: 700 }
};

export default Conductores;