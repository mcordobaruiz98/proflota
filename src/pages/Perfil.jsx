import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Save, Users, Settings, HelpCircle, Info, LogOut, ChevronUp, ChevronRight, Eye, EyeOff } from "lucide-react";
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

  const [editNombre,     setEditNombre]     = useState(false);
  const [editContrasena, setEditContrasena] = useState(false);
  const [confirmarCerrar, setConfirmarCerrar] = useState(false);

  const esGoogle = usuario?.providerData?.[0]?.providerId?.includes("google");

  const guardarNombre = async () => {
    if (!nombre.trim()) { mostrarToast("Ingresa tu nombre","error"); return; }
    setGuardandoNom(true);
    try {
      await cambiarNombre(nombre.trim());
      mostrarToast("Nombre actualizado","exito");
      setEditNombre(false);
    } catch(err) {
      mostrarToast("Error al actualizar nombre","error");
    } finally {
      setGuardandoNom(false);
    }
  };

  const guardarContrasena = async () => {
    if (!contActual)               { mostrarToast("Ingresa tu contraseña actual","error"); return; }
    if (contNueva.length < 6)      { mostrarToast("La nueva contraseña debe tener mínimo 6 caracteres","error"); return; }
    if (contNueva !== contConfirm) { mostrarToast("Las contraseñas no coinciden","error"); return; }
    setGuardandoCont(true);
    try {
      await cambiarContrasena(contActual, contNueva);
      mostrarToast("Contraseña actualizada","exito");
      setContActual(""); setContNueva(""); setContConfirm("");
      setEditContrasena(false);
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
          <ArrowLeft size={18} color={t.colors.blueText} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Perfil</h1>
      </div>

      <div style={styles.contenido}>

        {/* IDENTIDAD */}
        <div style={{textAlign:"center", padding:"14px 0 22px"}}>
          <div style={{width:"78px", height:"78px", borderRadius:"50%", background:`linear-gradient(135deg, ${t.colors.blue}33, ${t.colors.green}33)`, border:`2px solid ${t.colors.blueBorder}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px"}}>
            <span style={{fontSize:"30px", fontWeight:t.fonts.weightBlack, background:`linear-gradient(135deg, ${t.colors.blueText}, ${t.colors.green})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
              {(usuario?.displayName||usuario?.email||"U")[0].toUpperCase()}
            </span>
          </div>
          <p style={{fontSize:"17px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0}}>
            {usuario?.displayName || "Sin nombre"}
          </p>
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"4px 0 0"}}>
            {usuario?.email}{esGoogle ? " · Google" : ""}
          </p>
        </div>

        {/* MI FLOTA */}
        <p style={styles.seccionTitulo}>Mi flota</p>
        <div style={styles.card}>
          <div style={styles.filaMenu} onClick={()=>navigate("/conductores")}>
            <div style={styles.filaIzq}>
              <div style={{...styles.iconoBox, background:t.colors.blueSoft}}>
                <Users size={16} color={t.colors.blueText} strokeWidth={2}/>
              </div>
              <div>
                <p style={styles.filaLabel}>Conductores</p>
                <p style={styles.filaSub}>Directorio, licencias y alertas</p>
              </div>
            </div>
            <ChevronRight size={17} color={t.colors.textTertiary}/>
          </div>
        </div>

        {/* MI CUENTA */}
        <p style={styles.seccionTitulo}>Mi cuenta</p>
        <div style={styles.card}>

          {/* Editar nombre — colapsable */}
          <div style={{...styles.filaMenu, borderBottom: (!esGoogle || editNombre) ? `1px solid ${t.colors.borderLight}` : "none"}} onClick={()=>setEditNombre(!editNombre)}>
            <div style={styles.filaIzq}>
              <div style={{...styles.iconoBox, background:t.colors.blueSoft}}>
                <User size={16} color={t.colors.blueText} strokeWidth={2}/>
              </div>
              <p style={styles.filaLabel}>Editar nombre</p>
            </div>
            {editNombre ? <ChevronUp size={17} color={t.colors.textTertiary}/> : <ChevronRight size={17} color={t.colors.textTertiary}/>}
          </div>
          {editNombre && (
            <div style={{padding:"12px 4px 14px", borderBottom: !esGoogle ? `1px solid ${t.colors.borderLight}` : "none"}}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e=>setNombre(e.target.value)}
                style={styles.input}
              />
              <button
                style={{...styles.btnAccion, opacity:guardandoNom?0.75:1}}
                onClick={guardarNombre}
                disabled={guardandoNom}
              >
                <Save size={15} color="#fff" strokeWidth={2}/>
                {guardandoNom?"Guardando...":"Guardar"}
              </button>
            </div>
          )}

          {/* Cambiar contraseña — colapsable, solo cuentas de correo */}
          {!esGoogle && (
            <>
              <div style={styles.filaMenu} onClick={()=>setEditContrasena(!editContrasena)}>
                <div style={styles.filaIzq}>
                  <div style={{...styles.iconoBox, background:t.colors.blueSoft}}>
                    <Lock size={16} color={t.colors.blueText} strokeWidth={2}/>
                  </div>
                  <p style={styles.filaLabel}>Cambiar contraseña</p>
                </div>
                {editContrasena ? <ChevronUp size={17} color={t.colors.textTertiary}/> : <ChevronRight size={17} color={t.colors.textTertiary}/>}
              </div>
              {editContrasena && (
                <div style={{padding:"12px 4px 14px"}}>
                  <div style={{position:"relative"}}>
                    <input
                      type={verActual?"text":"password"}
                      placeholder="Contraseña actual"
                      value={contActual}
                      onChange={e=>setContActual(e.target.value)}
                      style={styles.input}
                    />
                    <button style={styles.btnOjo} onClick={()=>setVerActual(!verActual)}>
                      {verActual ? <EyeOff size={16} color={t.colors.textTertiary}/> : <Eye size={16} color={t.colors.textTertiary}/>}
                    </button>
                  </div>
                  <div style={{position:"relative"}}>
                    <input
                      type={verNueva?"text":"password"}
                      placeholder="Nueva contraseña (mín. 6)"
                      value={contNueva}
                      onChange={e=>setContNueva(e.target.value)}
                      style={styles.input}
                    />
                    <button style={styles.btnOjo} onClick={()=>setVerNueva(!verNueva)}>
                      {verNueva ? <EyeOff size={16} color={t.colors.textTertiary}/> : <Eye size={16} color={t.colors.textTertiary}/>}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={contConfirm}
                    onChange={e=>setContConfirm(e.target.value)}
                    style={styles.input}
                  />
                  <button
                    style={{...styles.btnAccion, opacity:guardandoCont?0.75:1}}
                    onClick={guardarContrasena}
                    disabled={guardandoCont}
                  >
                    <Save size={15} color="#fff" strokeWidth={2}/>
                    {guardandoCont?"Guardando...":"Cambiar contraseña"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* MÁS */}
        <p style={styles.seccionTitulo}>Más</p>
        <div style={styles.card}>
          {[
            {label:"Configuración",   sub:"Preferencias y datos",  ruta:"/configuracion", Icono:Settings},
            {label:"Ayuda y soporte", sub:"Contáctanos",           ruta:"/ayuda",         Icono:HelpCircle},
            {label:"Acerca de",       sub:"Términos y privacidad", ruta:"/acerca",        Icono:Info},
          ].map((item,i,arr)=>(
            <div
              key={item.ruta}
              style={{...styles.filaMenu, borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}
              onClick={()=>navigate(item.ruta)}
            >
              <div style={styles.filaIzq}>
                <div style={styles.iconoBox}>
                  <item.Icono size={16} color={t.colors.textSecondary} strokeWidth={2}/>
                </div>
                <div>
                  <p style={styles.filaLabel}>{item.label}</p>
                  <p style={styles.filaSub}>{item.sub}</p>
                </div>
              </div>
              <ChevronRight size={17} color={t.colors.textTertiary}/>
            </div>
          ))}
        </div>

        {/* CERRAR SESIÓN — al final */}
        {!confirmarCerrar ? (
          <button
            style={styles.btnCerrarSesion}
            onClick={()=>setConfirmarCerrar(true)}
          >
            <LogOut size={16} color={t.colors.redText} strokeWidth={2}/>
            Cerrar sesión
          </button>
        ) : (
          <div style={{...styles.cardConfirm}}>
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

        <p style={{textAlign:"center", fontSize:"11px", color:t.colors.textTertiary, marginTop:"18px"}}>NAVIRA v1.1</p>

      </div>
    </div>
  );
}

const styles = {
  pantalla:       { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:         { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:      { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blueText, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:         { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:      { padding:"4px 16px 16px" },
  seccionTitulo:  { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"14px 4px 8px" },
  card:           { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"4px 14px", marginBottom:"4px", boxShadow:t.shadows.card, border:`1px solid ${t.colors.borderLight}` },
  cardConfirm:    { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginTop:"14px", boxShadow:t.shadows.card, border:`1px solid ${t.colors.borderLight}` },
  filaMenu:       { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", cursor:"pointer" },
  filaIzq:        { display:"flex", alignItems:"center", gap:"12px" },
  iconoBox:       { width:"34px", height:"34px", borderRadius:"9px", background:t.colors.bgSection, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  filaLabel:      { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0 },
  filaSub:        { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0" },
  input:          { width:"100%", boxSizing:"border-box", padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", marginBottom:"8px" },
  btnOjo:         { position:"absolute", right:"10px", top:"9px", background:"none", border:"none", cursor:"pointer", padding:"2px", display:"flex", alignItems:"center" },
  btnAccion:      { width:"100%", padding:"11px", background:`linear-gradient(135deg, ${t.colors.green}, ${t.colors.greenDeep || "#12A150"})`, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", boxShadow:t.shadows.md },
  btnCerrarSesion:{ width:"100%", padding:"13px", background:"none", color:t.colors.redText, border:`1.5px solid ${t.colors.redBorder}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginTop:"14px" },
};

export default Perfil;