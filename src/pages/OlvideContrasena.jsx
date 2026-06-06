import { useState }    from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useAuth }     from "../hooks/useAuth";
import { theme as t }  from "../styles/theme";

function OlvideContrasena() {
  const navigate = useNavigate();
  const { recuperarContrasena } = useAuth();

  const [correo,   setCorreo]   = useState("");
  const [enviado,  setEnviado]  = useState(false);
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);

  const mensajeError = (c) => {
    switch(c){
      case "auth/user-not-found": return "No existe una cuenta con ese correo";
      case "auth/invalid-email":  return "Correo inválido";
      default:                    return "Error al enviar el correo. Intenta de nuevo";
    }
  };

  const handleEnviar = async () => {
    if (!correo.trim()){setError("Ingresa tu correo");return;}
    setCargando(true);setError("");
    try { await recuperarContrasena(correo); setEnviado(true); }
    catch(e){setError(mensajeError(e.code));}
    finally{setCargando(false);}
  };

  if (enviado) {
    return (
      <div style={styles.pantalla}>
        <div style={styles.header}>
          <button style={styles.btnVolver} onClick={()=>navigate("/login")}>
            <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          </button>
        </div>
        <div style={styles.exitoWrap}>
          <div style={styles.exitoIcono}>
            <Mail size={40} color={t.colors.green} strokeWidth={1.5} />
          </div>
          <h2 style={styles.exitoTitulo}>Correo enviado</h2>
          <p style={styles.exitoSub}>Enviamos un enlace de recuperación a:</p>
          <p style={styles.exitoCorreo}>{correo}</p>
          <p style={styles.exitoInstruccion}>
            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </p>
          <button style={styles.btnLogin} onClick={()=>navigate("/login")}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate("/login")}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
      </div>

      <div style={styles.tituloWrap}>
        <div style={styles.tituloIcono}>
          <Mail size={32} color={t.colors.blue} strokeWidth={1.5} />
        </div>
        <h1 style={styles.titulo}>¿Olvidaste tu contraseña?</h1>
        <p style={styles.sub}>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
      </div>

      <div style={styles.card}>
        <div style={styles.campo}>
          <label style={styles.label}>Correo electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" value={correo}
            onChange={e=>{setCorreo(e.target.value);setError("");}}
            style={styles.input} autoFocus />
        </div>
        {error&&<div style={styles.errorBox}>{error}</div>}
        <button style={{...styles.btnEnviar,opacity:cargando?0.75:1}} onClick={handleEnviar} disabled={cargando}>
          <Send size={16} color="#fff" strokeWidth={2} />
          {cargando?"Enviando...":"Enviar enlace de recuperación"}
        </button>
      </div>

      <p style={styles.loginLink}>
        ¿Recordaste tu contraseña?{" "}
        <button style={styles.btnLoginLink} onClick={()=>navigate("/login")}>Inicia sesión</button>
      </p>
    </div>
  );
}

const styles = {
  pantalla:       { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:         { padding:"16px 20px 0" },
  btnVolver:      { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  tituloWrap:     { padding:"24px 24px 20px", textAlign:"center" },
  tituloIcono:    { width:"72px", height:"72px", background:t.colors.blueSoft, borderRadius:t.radius.xl, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
  titulo:         { fontSize:"24px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:"0 0 10px", letterSpacing:"-0.3px" },
  sub:            { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:0, lineHeight:"1.5" },
  card:           { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"20px", margin:"0 16px 16px", boxShadow:t.shadows.card },
  campo:          { display:"flex", flexDirection:"column", gap:"6px", marginBottom:"14px" },
  label:          { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:          { width:"100%", padding:"13px 14px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeMd, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", boxSizing:"border-box" },
  errorBox:       { background:t.colors.redSoft, border:`1.5px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, padding:"11px 14px", fontSize:t.fonts.sizeSm, color:t.colors.red, marginBottom:"16px", textAlign:"center", fontWeight:t.fonts.weightMedium },
  btnEnviar:      { width:"100%", padding:"14px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" },
  loginLink:      { textAlign:"center", fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, padding:"0 20px" },
  btnLoginLink:   { background:"none", border:"none", color:t.colors.blue, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, cursor:"pointer", padding:0 },
  exitoWrap:      { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"40px 24px", margin:"24px 16px", textAlign:"center", boxShadow:t.shadows.card },
  exitoIcono:     { width:"80px", height:"80px", background:t.colors.greenSoft, borderRadius:t.radius.full, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
  exitoTitulo:    { fontSize:"22px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 10px" },
  exitoSub:       { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 6px" },
  exitoCorreo:    { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.blue, margin:"0 0 16px" },
  exitoInstruccion:{ fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 24px", lineHeight:"1.6" },
  btnLogin:       { width:"100%", padding:"13px", background:t.colors.green, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, cursor:"pointer" },
};

export default OlvideContrasena;