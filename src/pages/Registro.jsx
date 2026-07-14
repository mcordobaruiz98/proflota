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
  const [codigo,     setCodigo]     = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const mensajeError = (codigo) => {
    switch (codigo) {
      case "auth/email-already-in-use": return "Ya existe una cuenta con ese correo";
      case "auth/invalid-email":        return "Correo inválido";
      case "auth/weak-password":        return "La contraseña es muy débil";
      case "auth/codigo-invalido":      return "Código de acceso incorrecto. Contáctanos para obtener tu código";
      case "auth/terminos-no-aceptados": return "Debes aceptar los Términos y la Política de Privacidad";
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
    if (!codigo.trim())           e.codigo     = "Ingresa el código de acceso";
    if (!aceptaTerminos)          e.terminos   = "Debes aceptar los Términos y la Política de Privacidad";
    return e;
  };

  const handleRegistro = async () => {
    const e = validar();
    if (Object.keys(e).length > 0) { setErrores(e); return; }
    setCargando(true);
    try {
      await registrar(nombre.trim(), correo, contrasena, codigo.trim(), aceptaTerminos);
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

        <form onSubmit={e => e.preventDefault()} autoComplete="on">

          <div style={styles.campo}>
            <label style={styles.label}>Nombre completo</label>
            <input
              type="text"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrores({ ...errores, nombre: null }); }}
              style={styles.input}
              autoComplete="name"
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
              autoComplete="email"
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
                autoComplete="new-password"
              />
              <button type="button" style={styles.btnOjo} onClick={() => setVerPass(!verPass)}>
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
                autoComplete="new-password"
              />
              <button type="button" style={styles.btnOjo} onClick={() => setVerConf(!verConf)}>
                {verConf ? "●" : "○"}
              </button>
            </div>
            {errores.confirmar && <p style={styles.error}>{errores.confirmar}</p>}
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Código de acceso beta</label>
            <input
              type="text"
              placeholder="Ingresa tu código de invitación"
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value.trim().toUpperCase()); setErrores({ ...errores, codigo: null }); }}
              style={styles.input}
              autoComplete="off"
            />
            {errores.codigo && <p style={styles.error}>{errores.codigo}</p>}
          </div>

        </form>

        {/* ACEPTACIÓN DE TÉRMINOS — Ley 1581/2012 */}
        <div style={{display:"flex",gap:"10px",alignItems:"flex-start",margin:"4px 0 12px",cursor:"pointer"}} onClick={()=>{setAceptaTerminos(!aceptaTerminos); setErrores({...errores, terminos:null});}}>
          <div style={{
            width:"20px",height:"20px",borderRadius:"5px",flexShrink:0,marginTop:"1px",
            border:`2px solid ${aceptaTerminos ? "#22C55E" : (errores.terminos ? "#EF4444" : "#1E3A5F")}`,
            background: aceptaTerminos ? "#22C55E" : "transparent",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",
          }}>
            {aceptaTerminos && <span style={{color:"#fff",fontSize:"13px",fontWeight:900,lineHeight:1}}>✓</span>}
          </div>
          <p style={{fontSize:"12px",color:"#8B9CB3",margin:0,lineHeight:1.5}}>
            Acepto los{" "}
            <span style={{color:"#1565FF",fontWeight:600,textDecoration:"underline"}} onClick={(e)=>{e.stopPropagation(); navigate("/acerca");}}>Términos y Condiciones</span>
            {" "}y autorizo el tratamiento de mis datos personales conforme a la{" "}
            <span style={{color:"#1565FF",fontWeight:600,textDecoration:"underline"}} onClick={(e)=>{e.stopPropagation(); navigate("/acerca");}}>Política de Privacidad</span>
            {" "}(Ley 1581 de 2012).
          </p>
        </div>
        {errores.terminos && <p style={{fontSize:"12px",color:"#EF4444",margin:"-6px 0 10px 30px"}}>{errores.terminos}</p>}

        {errores.general && (
          <div style={styles.errorBox}>{errores.general}</div>
        )}

        <button
          style={{ ...styles.btnPrimario, opacity: (cargando || !aceptaTerminos) ? 0.6 : 1 }}
          onClick={handleRegistro}
          disabled={cargando}
        >
          {cargando ? <><span className="navira-spinner" /> Creando cuenta...</> : "Crear cuenta"}
        </button>

      </div>

      <p style={styles.version}>NAVIRA v1.0</p>

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