/**
 * Hecho por JESUS COSSIO DEV
 * Directorio y Registro Guiado de Empresas / Clientes
 * Optimizado para transportadores de 30 a 70 años con flujo Wizard claro.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Search, Trash2, Building2, Mail,
  MapPin, CheckCircle2, MessageSquare, Handshake
} from "lucide-react";
import { theme as t } from "../styles/theme";
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

const TIPOS_EMPRESA = [
  { valor: "Transportadora",       icono: "🚛", titulo: "Empresa Transportadora", desc: "Empresa de transporte habilitada" },
  { valor: "Generadora de carga",  icono: "🏭", titulo: "Generadora de Carga",    desc: "Fábricas, plantas y productores" },
  { valor: "Operador logístico",   icono: "📦", titulo: "Operador Logístico",     desc: "Coordinadores y agencias de carga" },
  { valor: "Comercializadora",     icono: "🏪", titulo: "Comercializadora",       desc: "Distribuidores mayoristas y comercio" },
  { valor: "Otra",                 icono: "🏢", titulo: "Otro tipo",              desc: "Cliente particular o intermediario" },
];

function Empresas({ empresas = [], onAgregar, onEliminar, mostrarToast }) {
  const navigate = useNavigate();
  const [vista, setVista] = useState("lista"); // lista | agregar
  const [pasoWizard, setPasoWizard] = useState(1); // 1: Tipo/Nombre, 2: NIT/Ciudad, 3: Contacto/Tel
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Campos
  const [tipo,        setTipo]        = useState("Transportadora");
  const [razonSocial, setRazonSocial] = useState("");
  const [nit,         setNit]         = useState("");
  const [ciudad,      setCiudad]      = useState("");
  const [contacto,    setContacto]    = useState("");
  const [telefono,    setTelefono]    = useState("");
  const [correo,      setCorreo]      = useState("");

  // Modal para eliminar
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);

  const limpiar = () => {
    setTipo("Transportadora");
    setRazonSocial("");
    setNit("");
    setCiudad("");
    setContacto("");
    setTelefono("");
    setCorreo("");
    setPasoWizard(1);
    setVista("lista");
  };

  const guardar = async () => {
    if (!razonSocial.trim()) {
      if (mostrarToast) mostrarToast("Ingresa el nombre o razón social de la empresa", "error");
      setPasoWizard(1);
      return;
    }
    setGuardando(true);
    try {
      await onAgregar({
        tipo,
        razonSocial: razonSocial.trim(),
        nit: nit.trim(),
        ciudad: ciudad.trim(),
        contacto: contacto.trim(),
        telefono: telefono.trim(),
        correo: correo.trim()
      });
      if (mostrarToast) mostrarToast("¡Excelente! Empresa registrada con éxito", "exito");
      limpiar();
    } catch {
      if (mostrarToast) mostrarToast("Error al guardar empresa", "error");
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarEliminar = async () => {
    if (!empresaAEliminar) return;
    const id = empresaAEliminar.firestoreId;
    setEmpresaAEliminar(null);
    try {
      await onEliminar(id);
      if (mostrarToast) mostrarToast("Empresa eliminada del directorio", "info");
    } catch {
      if (mostrarToast) mostrarToast("Error al eliminar empresa", "error");
    }
  };

  const filtradas = empresas.filter(e =>
    (e.razonSocial || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.ciudad || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.nit || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const pasoValido = (() => {
    if (pasoWizard === 1) return razonSocial.trim().length >= 2;
    return true;
  })();

  const ETIQUETAS_WIZARD = [
    "Tipo y razón social",
    "NIT y ubicación",
    "Contacto y teléfono"
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: ASISTENTE WIZARD GUIADO PARA AGREGAR EMPRESA
  // ══════════════════════════════════════════════════════════════════════════
  if (vista === "agregar") {
    return (
      <WizardPantalla>
        <WizardHeader
          titulo="Nueva Empresa / Cliente"
          onVolver={() => pasoWizard > 1 ? setPasoWizard(p => p - 1) : limpiar()}
          labelVolver={pasoWizard > 1 ? "Atrás" : "Cancelar"}
        />

        <WizardProgress total={3} actual={pasoWizard} etiquetas={ETIQUETAS_WIZARD} />

        {/* ── PASO 1: TIPO Y RAZÓN SOCIAL ── */}
        {pasoWizard === 1 && (
          <>
            <WizardBanner
              icono="🏢"
              titulo="¿Cómo se llama la empresa?"
              mensaje="Ingresa el nombre o razón social de la empresa que te contrata o genera los fletes."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Nombre o Razón Social" obligatorio ayuda="Ej: Coltanques, Bavaria, D1, Servientrega...">
                <WizardInput
                  type="text"
                  placeholder="Nombre de la empresa"
                  value={razonSocial}
                  onChange={e => setRazonSocial(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Tipo de Empresa" obligatorio>
                <WizardOpciones
                  opciones={TIPOS_EMPRESA}
                  valor={tipo}
                  onChange={setTipo}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 2: NIT Y CIUDAD ── */}
        {pasoWizard === 2 && (
          <>
            <WizardBanner
              icono="📑"
              titulo="Identificación y Ubicación"
              mensaje="El NIT aparecerá automáticamente en las cuentas de cobro y manifiestos de carga."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="NIT de la Empresa (opcional)" ayuda="Ej: 900.123.456-7">
                <WizardInput
                  type="text"
                  placeholder="Número de NIT con dígito"
                  value={nit}
                  onChange={e => setNit(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Ciudad o Municipio principal" ayuda="Ej: Bogotá, Medellín, Barranquilla, Cali, Buenaventura...">
                <WizardInput
                  type="text"
                  placeholder="Ciudad sede"
                  value={ciudad}
                  onChange={e => setCiudad(e.target.value)}
                />
              </WizardCampo>
            </div>
          </>
        )}

        {/* ── PASO 3: CONTACTO Y TELÉFONO ── */}
        {pasoWizard === 3 && (
          <>
            <WizardBanner
              icono="👤"
              titulo="Contacto directo y teléfono"
              mensaje="Guarda el despachador o la persona de facturación para llamarlo o escribirle en 1 toque."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Nombre del contacto (opcional)" ayuda="Ej: Ing. Carlos Pérez (Despachador)">
                <WizardInput
                  type="text"
                  placeholder="Persona encargada"
                  value={contacto}
                  onChange={e => setContacto(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Teléfono o WhatsApp" ayuda="Ej: +57 310 000 0000">
                <WizardInput
                  type="tel"
                  placeholder="Número de celular o fijo"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                />
              </WizardCampo>

              <WizardCampo label="Correo electrónico (opcional)" ayuda="Para envío de facturas o soportes">
                <WizardInput
                  type="email"
                  placeholder="facturacion@empresa.com"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
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
                  {guardando ? "Guardando empresa..." : "Confirmar y Guardar Empresa"}
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
  // RENDER: LISTA DEL DIRECTORIO DE EMPRESAS
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={styles.pantalla}>
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
        <h1 style={styles.titulo}>Empresas y Clientes</h1>
      </div>

      <div style={styles.contenido}>
        {/* Botón Principal Registrar Empresa */}
        <button
          type="button"
          style={styles.btnAgregar}
          onClick={() => {
            limpiar();
            setVista("agregar");
          }}
        >
          <Plus size={20} />
          <span>Registrar nueva empresa</span>
        </button>

        {/* Barra de Búsqueda */}
        <div style={styles.buscadorWrap}>
          <Search size={18} color={t.colors.textTertiary} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar por nombre, NIT o ciudad..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={styles.buscadorInput}
          />
        </div>

        {/* Estado Vacío */}
        {empresas.length === 0 && (
          <div style={styles.vacio}>
            <Handshake size={48} color={t.colors.blue} strokeWidth={1.5} />
            <p style={{ fontSize: "16px", fontWeight: 700, color: t.colors.textPrimary, margin: "12px 0 4px" }}>
              Sin empresas registradas
            </p>
            <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: 0 }}>
              Guarda tus clientes frecuentes para generar cuentas de cobro automáticas y vincular viajes.
            </p>
          </div>
        )}

        {empresas.length > 0 && filtradas.length === 0 && (
          <div style={styles.vacio}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: t.colors.textSecondary, margin: 0 }}>
              No se encontraron empresas con &ldquo;{busqueda}&rdquo;
            </p>
          </div>
        )}

        {/* Lista de Tarjetas de Empresas */}
        {filtradas.map(e => (
          <div key={e.firestoreId} style={styles.cardEmpresa}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: 0 }}>
                <div style={styles.avatar}>
                  <Building2 size={24} color={t.colors.blue} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "17px", fontWeight: 800, color: t.colors.textPrimary, margin: 0 }}>
                    {e.razonSocial}
                  </p>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, color: "#1D4ED8",
                    background: "#EFF6FF", padding: "2px 8px", borderRadius: "6px",
                    display: "inline-block", marginTop: "3px"
                  }}>
                    {e.tipo || "Empresa"}
                  </span>
                  {e.nit && (
                    <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: "4px 0 0" }}>
                      NIT: {e.nit}
                    </p>
                  )}
                  {e.ciudad && (
                    <p style={{ fontSize: "13px", color: t.colors.textTertiary, margin: "2px 0 0", display: "flex", alignItems: "center", gap: "3px" }}>
                      <MapPin size={12} /> {e.ciudad}
                    </p>
                  )}
                  {e.contacto && (
                    <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "4px 0 0" }}>
                      Contacto: {e.contacto}
                    </p>
                  )}
                </div>
              </div>

              {/* Botón Eliminar */}
              <button
                type="button"
                aria-label="Eliminar empresa"
                style={styles.btnIcono}
                onClick={() => setEmpresaAEliminar(e)}
              >
                <Trash2 size={16} color={t.colors.red} strokeWidth={2} />
              </button>
            </div>

            {/* Acciones de Contacto */}
            {(e.telefono || e.correo) && (
              <div style={{ marginTop: "12px", borderTop: `1px solid ${t.colors.borderLight}`, paddingTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {e.telefono && (
                  <a
                    href={`https://wa.me/${e.telefono.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.btnContacto}
                  >
                    <MessageSquare size={15} color="#25D366" />
                    <span>WhatsApp: {e.telefono}</span>
                  </a>
                )}
                {e.correo && (
                  <a
                    href={`mailto:${e.correo}`}
                    style={styles.btnContacto}
                  >
                    <Mail size={15} color={t.colors.blue} />
                    <span>{e.correo}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal accesible de confirmación */}
      <ConfirmarModal
        abierto={Boolean(empresaAEliminar)}
        titulo="¿Eliminar empresa del directorio?"
        mensaje={empresaAEliminar ? `¿Estás seguro de que deseas eliminar a ${empresaAEliminar.razonSocial}?` : ""}
        textoConfirmar="Eliminar empresa"
        esPeligro={true}
        onCancelar={() => setEmpresaAEliminar(null)}
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
  pantalla:       { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:         { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:      { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blue, cursor: "pointer", padding: 0, fontSize: "15px", fontWeight: 700 },
  titulo:         { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  contenido:      { padding: "16px" },
  btnAgregar:     { width: "100%", padding: "16px", background: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", marginBottom: "16px" },
  buscadorWrap:   { display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: t.colors.bgCard, borderRadius: "14px", border: `1.5px solid ${t.colors.border}`, marginBottom: "16px" },
  buscadorInput:  { border: "none", background: "transparent", color: t.colors.textPrimary, fontSize: "15px", width: "100%", outline: "none" },
  cardEmpresa:    { background: t.colors.bgCard, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: t.shadows.card, border: `1px solid ${t.colors.borderLight}` },
  avatar:         { width: "46px", height: "46px", borderRadius: "12px", background: t.colors.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  btnIcono:       { background: "none", border: `1px solid ${t.colors.borderLight}`, borderRadius: "10px", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "36px", minHeight: "36px" },
  btnContacto:    { display: "flex", alignItems: "center", gap: "6px", color: t.colors.textPrimary, textDecoration: "none", fontSize: "13px", fontWeight: 600, padding: "4px 8px", background: t.colors.bgSection, borderRadius: "8px" },
  vacio:          { textAlign: "center", padding: "36px 20px", background: t.colors.bgCard, borderRadius: "16px", border: `1px dashed ${t.colors.borderLight}`, marginBottom: "16px" }
};

export default Empresas;
