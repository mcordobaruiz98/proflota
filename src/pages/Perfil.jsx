import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Save, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { theme as t } from "../styles/theme";

function Perfil({ mostrarToast }) {
  const navigate  = useNavigate();
  const { usuario, cerrarSesion, cambiarNombre, cambiarContrasena } = useAuth();

  const [nombre,         setNombre]         = useState(usuario?.displayName || "");
  const [guardandoNom,   setGuardandoNom]   = useState(false);

  const [contActual,     setContActual]     = useState("");
  const [contNueva,      setContNueva]      = useState("");
  const [contConfirm,    setContConfirm]    = useState("");
  const [verActual,      setVerActual]      = useState(false);
  const [verNueva,       setVerNueva]       = useState(false);
  const [guardandoCont,  setGuardandoCont]  = useState(false);

  const [confirmarCerrar, setConfirmarCerrar] = useState(false);

  const guardarNombre = async () => {
    if (!nombre.trim()) { mostrarToast("Ingresa tu nombre","error"); return; }
    setGuardandoNom(true);
    try {
      await cambiarNombre(nombre.trim());
      mostrarToast("Nombre actualizado","exito");
    } catch(err) {
      mostrarToast("Error al actualizar nombre","error");
    } finally {
      setGuardandoNom(false);
    }
  };

  const guardarContrasena = async () => {
    if (!contActual)                        { mostrarToast("Ingresa tu contraseña actual","error"); return; }
    if (contNueva.length < 6)               { mostrarToast("La nueva contraseña debe tener mínimo 6 caracteres","error"); return; }
    if (contNueva !== contConfirm)          { mostrarToast("Las contraseñas no coinciden","error"); return; }
    setGuardandoCont(true);
    try {
      await cambiarContrasena(contActual, contNueva);
      mostrarToast("Contraseña actualizada","exito");
      setContActual(""); setContNueva(""); setContConfirm("");
    } catch(err) {
      if (err.code === "auth/wrong-password") {
        mostrarToast("Contraseña actual incorrecta","error");
      } else {
        mostrarToast("Error al actualizar contraseña","error");
      }
    } finally {
      setGuardandoCont(false);
    }
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Perfil</h1>
      </div>

      <div style={styles.contenido}>

        {/* AVATAR */}
        <div style={{textAlign:"center", marginBottom:"20px"}}>
          <div style={{width:"72px", height:"72px", borderRadius:"50%", background:t.colors.blueSoft, border:`2px solid ${t.colors.blueBorder}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px"}}>
            <span style={{fontSize:"28px", fontWeight:t.fonts.weightBlack, color:t.colors.blue}}>
              {(usuario?.displayName||usuario?.email||"U")[0].toUpperCase()}
            </span>
          </div>
          <p style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0}}>
            {usuario?.displayName || "Sin nombre"}
          </p>
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"4px 0 0"}}>
            {usuario?.email}
          </p>
        </div>

        {/* CAMBIAR NOMBRE */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <User size={16} color={t.colors.blue} strokeWidth={2}/>
            <p style={styles.cardTitulo}>Nombre</p>
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Nombre completo</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={e=>setNombre(e.target.value)}
              style={styles.input}
            />
          </div>
          <button
            style={{width:"100%", padding:"12px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", opacity:guardandoNom?0.75:1}}
            onClick={guardarNombre}
            disabled={guardandoNom}
          >
            <Save size={16} color="#fff" strokeWidth={2}/>
            {guardandoNom?"Guardando...":"Guardar nombre"}
          </button>
        </div>

        {/* CAMBIAR CONTRASEÑA */}
        {!usuario?.providerData?.[0]?.providerId?.includes("google") && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Lock size={16} color={t.colors.blue} strokeWidth={2}/>
              <p style={styles.cardTitulo}>Contraseña</p>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Contraseña actual</label>
              <div style={{position:"relative"}}>
                <input
                  type={verActual?"text":"password"}
                  placeholder="Tu contraseña actual"
                  value={contActual}
                  onChange={e=>setContActual(e.target.value)}
                  style={{...styles.input, paddingRight:"40px"}}
                />
                <button
                  style={{position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:0}}
                  onClick={()=>setVerActual(!verActual)}
                >
                  {verActual ? <EyeOff size={16} color={t.colors.textTertiary}/> : <Eye size={16} color={t.colors.textTertiary}/>}
                </button>
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Nueva contraseña</label>
              <div style={{position:"relative"}}>
                <input
                  type={verNueva?"text":"password"}
                  placeholder="Mínimo 6 caracteres"
                  value={contNueva}
                  onChange={e=>setContNueva(e.target.value)}
                  style={{...styles.input, paddingRight:"40px"}}
                />
                <button
                  style={{position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:0}}
                  onClick={()=>setVerNueva(!verNueva)}
                >
                  {verNueva ? <EyeOff size={16} color={t.colors.textTertiary}/> : <Eye size={16} color={t.colors.textTertiary}/>}
                </button>
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Confirmar nueva contraseña</label>
              <input
                type="password"
                placeholder="Repite la nueva contraseña"
                value={contConfirm}
                onChange={e=>setContConfirm(e.target.value)}
                style={styles.input}
              />
            </div>
            <button
              style={{width:"100%", padding:"12px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", opacity:guardandoCont?0.75:1}}
              onClick={guardarContrasena}
              disabled={guardandoCont}
            >
              <Save size={16} color="#fff" strokeWidth={2}/>
              {guardandoCont?"Guardando...":"Cambiar contraseña"}
            </button>
          </div>
        )}

        {/* CERRAR SESIÓN */}
        <div style={styles.card}>
          {!confirmarCerrar ? (
            <button
              style={{width:"100%", padding:"12px", background:t.colors.redSoft, color:t.colors.red, border:`1px solid ${t.colors.redBorder}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer"}}
              onClick={()=>setConfirmarCerrar(true)}
            >
              Cerrar sesión
            </button>
          ) : (
            <div>
              <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 10px", textAlign:"center"}}>¿Seguro que quieres cerrar sesión?</p>
              <div style={{display:"flex", gap:"8px"}}>
                <button
                  style={{flex:1, padding:"12px", background:t.colors.red, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer"}}
                  onClick={cerrarSesion}
                >
                  Cerrar sesión
                </button>
                <button
                  style={{flex:1, padding:"12px", background:"none", border:`1px solid ${t.colors.border}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, cursor:"pointer", color:t.colors.textSecondary}}
                  onClick={()=>setConfirmarCerrar(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* OTRAS OPCIONES */}
<div style={styles.card}>
  {[
    {label:"Configuración",     ruta:"/configuracion"},
    {label:"Ayuda y soporte",   ruta:"/ayuda"},
    {label:"Acerca de",         ruta:"/acerca"},
  ].map((item,i,arr)=>(
    <div
      key={item.ruta}
      style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`,cursor:"pointer"}}
      onClick={()=>navigate(item.ruta)}
    >
      <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textPrimary}}>{item.label}</span>
      <span style={{color:t.colors.textTertiary,fontSize:"18px"}}>›</span>
    </div>
  ))}
</div>
    </div>
  );
}

const styles = {
  pantalla:   { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:     { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:  { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:     { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:  { padding:"12px 16px 16px" },
  card:       { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"10px", boxShadow:t.shadows.card },
  cardHeader: { display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" },
  cardTitulo: { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:0 },
  campo:      { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"10px" },
  label:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:      { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
};

export default Perfil;

