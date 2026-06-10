import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { theme as t } from "../styles/theme";

function Login() {
  const navigate = useNavigate();
  const { login, loginGoogle } = useAuth();

  const [correo,     setCorreo]     = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verPass,    setVerPass]    = useState(false);
  const [error,      setError]      = useState("");
  const [cargando,   setCargando]   = useState(false);

  const mensajeError = (codigo) => {
    switch (codigo) {
      case "auth/user-not-found":     return "No existe una cuenta con ese correo";
      case "auth/wrong-password":     return "Contraseña incorrecta";
      case "auth/invalid-email":      return "Correo inválido";
      case "auth/too-many-requests":  return "Demasiados intentos. Intenta más tarde";
      case "auth/invalid-credential": return "Correo o contraseña incorrectos";
      default:                        return "Error al iniciar sesión. Intenta de nuevo";
    }
  };

  const handleLogin = async () => {
    if (!correo.trim())     { setError("Ingresa tu correo");     return; }
    if (!contrasena.trim()) { setError("Ingresa tu contraseña"); return; }
    setCargando(true); setError("");
    try {
      await login(correo, contrasena);
      navigate("/");
    } catch (e) {
      setError(mensajeError(e.code));
    } finally {
      setCargando(false);
    }
  };

  const handleGoogle = async () => {
    setCargando(true); setError("");
    try {
      await loginGoogle();
      navigate("/");
    } catch (e) {
      setError("Error al iniciar sesión con Google");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.pantalla}>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcono}>
            <span style={{ fontSize: "32px" }}>🚛</span>
          </div>
          <h1 style={styles.logoNombre}>Movia</h1>
          <p style={styles.logoSub}>Controla tus fletes. Maximiza tus ganancias.</p>
        </div>
      </div>

      {/* CARD */}
      <div style={styles.card}>

        <h2 style={styles.cardTitulo}>Iniciar sesión</h2>

        <div style={styles.campo}>
          <label style={styles.label}>Correo electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) => { setCorreo(e.target.value); setError(""); }}
            style={styles.input}
            autoComplete="email"
          />
        </div>

        <div style={styles.campo}>
          <div style={styles.labelFila}>
            <label style={styles.label}>Contraseña</label>
            <button
              style={styles.btnOlvide}
              onClick={() => navigate("/olvide-contrasena")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div style={styles.inputWrap}>
            <input
              type={verPass ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={contrasena}
              onChange={(e) => { setContrasena(e.target.value); setError(""); }}
              style={{ ...styles.input, paddingRight: "44px" }}
              autoComplete="current-password"
            />
            <button style={styles.btnOjo} onClick={() => setVerPass(!verPass)}>
              {verPass ? "●" : "○"}
            </button>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <button
          style={{
            ...styles.btnPrimario,
            opacity: cargando ? 0.75 : 1,
          }}
          onClick={handleLogin}
          disabled={cargando}
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <div style={styles.separador}>
          <div style={styles.separadorLinea} />
          <span style={styles.separadorTexto}>o continúa con</span>
          <div style={styles.separadorLinea} />
        </div>

        <button
          style={styles.btnGoogle}
          onClick={handleGoogle}
          disabled={cargando}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continuar con Google
        </button>

      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <p style={styles.footerTexto}>¿Aún no tienes cuenta?</p>
        <button
          style={styles.btnRegistro}
          onClick={() => navigate("/registro")}
        >
          Crear cuenta gratis
        </button>
      </div>

    </div>
  );
}

const styles = {
  pantalla:       { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, display: "flex", flexDirection: "column" },
  hero:           { background: `linear-gradient(135deg, #155E75 0%, #0E7490 50%, #16A34A 100%)`, padding: "48px 24px 36px", textAlign: "center" },
  logoWrap:       { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  logoIcono:      { width: "72px", height: "72px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" },
  logoNombre:     { fontSize: "32px", fontWeight: t.fonts.weightBlack, color: "#fff", margin: 0, letterSpacing: "-0.5px" },
  logoSub:        { fontSize: t.fonts.sizeSm, color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: t.fonts.weightMedium },
  card:           { background: t.colors.bgCard, borderRadius: `${t.radius.xl} ${t.radius.xl} 0 0`, padding: "28px 24px 24px", marginTop: "-16px", flex: 1, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" },
  cardTitulo:     { fontSize: t.fonts.sizeXl, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: "0 0 24px" },
  campo:          { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" },
  labelFila:      { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label:          { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightSemibold, color: t.colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" },
  inputWrap:      { position: "relative" },
  input:          { width: "100%", padding: "13px 14px", borderRadius: t.radius.sm, border: `1.5px solid ${t.colors.border}`, fontSize: t.fonts.sizeMd, background: t.colors.bgPrimary, color: t.colors.textPrimary, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
  btnOjo:         { position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: t.colors.textTertiary, padding: "4px" },
  btnOlvide:      { background: "none", border: "none", fontSize: t.fonts.sizeXs, color: t.colors.blue, cursor: "pointer", padding: 0, fontWeight: t.fonts.weightSemibold },
  errorBox:       { background: t.colors.redSoft, border: `1.5px solid ${t.colors.redBorder}`, borderRadius: t.radius.sm, padding: "11px 14px", fontSize: t.fonts.sizeSm, color: t.colors.red, marginBottom: "16px", textAlign: "center", fontWeight: t.fonts.weightMedium },
  btnPrimario:    { width: "100%", padding: "15px", background: t.colors.green, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBold, cursor: "pointer", marginBottom: "20px", letterSpacing: "0.02em" },
  separador:      { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  separadorLinea: { flex: 1, height: "1px", background: t.colors.border },
  separadorTexto: { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, whiteSpace: "nowrap", fontWeight: t.fonts.weightMedium },
  btnGoogle:      { width: "100%", padding: "13px", background: t.colors.bgCard, border: `1.5px solid ${t.colors.border}`, borderRadius: t.radius.md, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold, color: t.colors.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  footer:         { padding: "20px 24px 32px", textAlign: "center", background: t.colors.bgCard },
  footerTexto:    { fontSize: t.fonts.sizeSm, color: t.colors.textSecondary, margin: "0 0 10px" },
  btnRegistro:    { padding: "12px 28px", background: t.colors.blueSoft, border: `1.5px solid ${t.colors.blueBorder}`, borderRadius: t.radius.md, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.blue, cursor: "pointer" },
};

export default Login;