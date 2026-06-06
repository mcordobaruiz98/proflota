import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { theme as t } from "../styles/theme";

function Registro() {
  const navigate = useNavigate();
  const { registrar } = useAuth();

  const [nombre,     setNombre]     = useState("");
  const [correo,     setCorreo]     = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar,  setConfirmar]  = useState("");
  const [verPass,    setVerPass]    = useState(false);
  const [verConf,    setVerConf]    = useState(false);
  const [errores,    setErrores]    = useState({});
  const [cargando,   setCargando]   = useState(false);

  const mensajeError = (codigo) => {
    switch (codigo) {
      case "auth/email-already-in-use": return "Ya existe una cuenta con ese correo";
      case "auth/invalid-email":        return "Correo inválido";
      case "auth/weak-password":        return "La contraseña es muy débil";
      default:                          return "Error al crear la cuenta. Intenta de nuevo";
    }
  };

  const validar = () => {
    const e = {};
    if (!nombre.trim())           e.nombre     = "Ingresa tu nombre completo";
    if (!correo.trim())           e.correo     = "Ingresa tu correo";
    if (!correo.includes("@"))    e.correo     = "Correo inválido";
    if (contrasena.length < 6)    e.contrasena = "Mínimo 6 caracteres";
    if (contrasena !== confirmar) e.confirmar  = "Las contraseñas no coinciden";
    return e;
  };

  const handleRegistro = async () => {
    const e = validar();
    if (Object.keys(e).length > 0) { setErrores(e); return; }
    setCargando(true);
    try {
      await registrar(nombre.trim(), correo, contrasena);
      navigate("/");
    } catch (err) {
      setErrores({ general: mensajeError(err.code) });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate("/login")}>
          ← Volver
        </button>
      </div>

      {/* TÍTULO */}
      <div style={styles.tituloWrap}>
        <h1 style={styles.titulo}>Crea tu cuenta</h1>
        <p style={styles.sub}>
          Únete y empieza a controlar tus ganancias hoy.
        </p>
      </div>

      {/* FORMULARIO */}
      <div style={styles.card}>
        <p style={styles.seccionLabel}>Tus datos</p>

        <div style={styles.campo}>
          <label style={styles.label}>Nombre completo</label>
          <input
            type="text"
            placeholder="Juan Pérez"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setErrores({ ...errores, nombre: null }); }}
            style={styles.input}
          />
          {errores.nombre && <p style={styles.error}>{errores.nombre}</p>}
        </div>

        <div style={styles.campo}>
          <label style={styles.label}>Correo electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) => { setCorreo(e.target.value); setErrores({ ...errores, correo: null }); }}
            style={styles.input}
          />
          {errores.correo && <p style={styles.error}>{errores.correo}</p>}
        </div>

        <div style={styles.campo}>
          <label style={styles.label}>Contraseña</label>
          <div style={styles.inputWrap}>
            <input
              type={verPass ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={contrasena}
              onChange={(e) => { setContrasena(e.target.value); setErrores({ ...errores, contrasena: null }); }}
              style={{ ...styles.input, paddingRight: "44px" }}
            />
            <button style={styles.btnOjo} onClick={() => setVerPass(!verPass)}>
              {verPass ? "●" : "○"}
            </button>
          </div>
          {errores.contrasena && <p style={styles.error}>{errores.contrasena}</p>}
        </div>

        <div style={styles.campo}>
          <label style={styles.label}>Confirmar contraseña</label>
          <div style={styles.inputWrap}>
            <input
              type={verConf ? "text" : "password"}
              placeholder="Repite tu contraseña"
              value={confirmar}
              onChange={(e) => { setConfirmar(e.target.value); setErrores({ ...errores, confirmar: null }); }}
              style={{ ...styles.input, paddingRight: "44px" }}
            />
            <button style={styles.btnOjo} onClick={() => setVerConf(!verConf)}>
              {verConf ? "●" : "○"}
            </button>
          </div>
          {errores.confirmar && <p style={styles.error}>{errores.confirmar}</p>}
        </div>

        {errores.general && (
          <div style={styles.errorBox}>{errores.general}</div>
        )}

        <button
          style={{ ...styles.btnPrimario, opacity: cargando ? 0.75 : 1 }}
          onClick={handleRegistro}
          disabled={cargando}
        >
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

      </div>

      <p style={styles.version}>FleteApp v1.0</p>

    </div>
  );
}

const styles = {
  pantalla:     { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:       { padding: "16px 20px 0" },
  btnVolver:    { background: "none", border: "none", fontSize: "15px", color: t.colors.blue, cursor: "pointer", padding: 0, fontWeight: t.fonts.weightSemibold },
  tituloWrap:   { padding: "20px 24px 16px" },
  titulo:       { fontSize: "28px", fontWeight: t.fonts.weightBlack, color: t.colors.textPrimary, margin: "0 0 6px", letterSpacing: "-0.5px" },
  sub:          { fontSize: t.fonts.sizeSm, color: t.colors.textSecondary, margin: 0, lineHeight: "1.5" },
  card:         { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "20px", margin: "0 16px 12px", boxShadow: t.shadows.card },
  seccionLabel: { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" },
  campo:        { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" },
  label:        { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightSemibold, color: t.colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" },
  inputWrap:    { position: "relative" },
  input:        { width: "100%", padding: "13px 14px", borderRadius: t.radius.sm, border: `1.5px solid ${t.colors.border}`, fontSize: t.fonts.sizeMd, background: t.colors.bgPrimary, color: t.colors.textPrimary, outline: "none", boxSizing: "border-box" },
  btnOjo:       { position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: t.colors.textTertiary, padding: "4px" },
  error:        { fontSize: t.fonts.sizeXs, color: t.colors.red, margin: "3px 0 0", fontWeight: t.fonts.weightMedium },
  errorBox:     { background: t.colors.redSoft, border: `1.5px solid ${t.colors.redBorder}`, borderRadius: t.radius.sm, padding: "11px 14px", fontSize: t.fonts.sizeSm, color: t.colors.red, marginBottom: "16px", textAlign: "center", fontWeight: t.fonts.weightMedium },
  btnPrimario:  { width: "100%", padding: "15px", background: t.colors.green, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBold, cursor: "pointer", letterSpacing: "0.02em" },
  version:      { textAlign: "center", fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, paddingTop: "16px" },
};

export default Registro;