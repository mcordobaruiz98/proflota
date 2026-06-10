import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Flame, Database, Globe, Mail, ChevronRight } from "lucide-react";
import { theme as t } from "../styles/theme";

function AcercaDe() {
  const navigate = useNavigate();

  const info = [
    { label: "Versión",          valor: "1.0.0" },
    { label: "Desarrollado por", valor: "MoVia Team" },
    { label: "Contacto",         valor: "soporte@movia.com" },
    { label: "Sitio web",        valor: "www.movia.com" },
  ];

  const tecnologias = [
    { Icono: Smartphone, label: "React",     sub: "Interfaz de usuario",        color: "#61DAFB", bg: "#E0F7FD" },
    { Icono: Flame,      label: "Firebase",  sub: "Base de datos y auth",       color: "#FF9800", bg: "#FFF3E0" },
    { Icono: Database,   label: "Firestore", sub: "Almacenamiento en la nube",  color: "#4285F4", bg: "#E8F0FE" },
  ];

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Acerca de nosotros</h1>
        <div style={{ width: "60px" }} />
      </div>

      {/* LOGO CARD */}
      <div style={styles.logoCard}>
        <div style={styles.logoIconoWrap}>
          <span style={{ fontSize: "40px" }}>🚚</span>
        </div>
        <h2 style={styles.logoNombre}>MoVia</h2>
        <span style={styles.logoBadge}>v1.0.0</span>
        <p style={styles.logoDesc}>
          La herramienta definitiva para transportadores colombianos.
          Calcula fletes, gestiona tu flota y controla tus ganancias
          desde un solo lugar.
        </p>
      </div>

      {/* INFORMACIÓN */}
      <div style={styles.seccionLabel}>Información</div>
      <div style={styles.seccion}>
        {info.map((item, i, arr) => (
          <div
            key={item.label}
            style={{
              ...styles.fila,
              borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.colors.borderLight}`,
            }}
          >
            <span style={styles.filaLabel}>{item.label}</span>
            <span style={styles.filaValor}>{item.valor}</span>
          </div>
        ))}
      </div>

      {/* TECNOLOGÍAS */}
      <div style={styles.seccionLabel}>Tecnologías</div>
      <div style={styles.seccion}>
        {tecnologias.map((tech, i, arr) => (
          <div
            key={tech.label}
            style={{
              ...styles.techFila,
              borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.colors.borderLight}`,
            }}
          >
            <div style={{ ...styles.techIconoWrap, background: tech.bg }}>
              <tech.Icono size={20} color={tech.color} strokeWidth={2} />
            </div>
            <div>
              <p style={styles.techLabel}>{tech.label}</p>
              <p style={styles.techSub}>{tech.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CONTACTO */}
      <div style={styles.seccionLabel}>Contáctanos</div>
      <div style={styles.seccion}>
        <button
          style={{ ...styles.contactoBtn, borderBottom: `1px solid ${t.colors.borderLight}` }}
          onClick={() => window.open("mailto:soporte@movia.com")}
        >
          <div style={{ ...styles.techIconoWrap, background: t.colors.blueSoft }}>
            <Mail size={18} color={t.colors.blue} strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={styles.techLabel}>Correo de soporte</p>
            <p style={styles.techSub}>soporte@movia.com</p>
          </div>
          <ChevronRight size={16} color={t.colors.textTertiary} />
        </button>
        <button
          style={{ ...styles.contactoBtn, borderBottom: "none" }}
          onClick={() => window.open("https://www.movia.com")}
        >
          <div style={{ ...styles.techIconoWrap, background: t.colors.greenSoft }}>
            <Globe size={18} color={t.colors.green} strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={styles.techLabel}>Sitio web</p>
            <p style={styles.techSub}>www.movia.com</p>
          </div>
          <ChevronRight size={16} color={t.colors.textTertiary} />
        </button>
      </div>

      <p style={styles.copy}>© 2026 MoVia. Todos los derechos reservados.</p>

    </div>
  );
}

const styles = {
  pantalla:       { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:         { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:      { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blue, cursor: "pointer", padding: 0, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold },
  titulo:         { fontSize: "20px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  logoCard:       { background: `linear-gradient(135deg, #155E75 0%, ${t.colors.blue} 50%, ${t.colors.green} 100%)`, padding: "32px 24px", textAlign: "center" },
  logoIconoWrap:  { width: "80px", height: "80px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", backdropFilter: "blur(10px)" },
  logoNombre:     { fontSize: "28px", fontWeight: t.fonts.weightBlack, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.5px" },
  logoBadge:      { display: "inline-block", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, padding: "4px 12px", borderRadius: t.radius.full, marginBottom: "14px" },
  logoDesc:       { fontSize: t.fonts.sizeSm, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: "1.6" },
  seccionLabel:   { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", padding: "16px 20px 8px" },
  seccion:        { background: t.colors.bgCard, borderRadius: t.radius.lg, margin: "0 16px 4px", overflow: "hidden", boxShadow: t.shadows.card },
  fila:           { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px" },
  filaLabel:      { fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold, color: t.colors.textPrimary },
  filaValor:      { fontSize: t.fonts.sizeSm, color: t.colors.textSecondary },
  techFila:       { display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px" },
  techIconoWrap:  { width: "38px", height: "38px", borderRadius: t.radius.sm, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  techLabel:      { fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold, color: t.colors.textPrimary, margin: 0 },
  techSub:        { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "2px 0 0" },
  contactoBtn:    { width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" },
  copy:           { textAlign: "center", fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, padding: "20px" },
};

export default AcercaDe;