import { useNavigate }  from "react-router-dom";
import { useAuth }      from "../hooks/useAuth";
import { Settings, HelpCircle, Info, ChevronRight, LogOut } from "lucide-react";
import { theme as t }   from "../styles/theme";

function Perfil() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();

  const iniciales = usuario?.displayName
    ? usuario.displayName.slice(0,2).toUpperCase()
    : usuario?.email
    ? usuario.email.slice(0,2).toUpperCase()
    : "US";

  const handleCerrar = async () => {
    if (!window.confirm("¿Cerrar sesión?")) return;
    await cerrarSesion();
    navigate("/login");
  };

  const opciones = [
    {Icono:Settings,     label:"Configuración",     sub:"Preferencias de la app",          accion:()=>navigate("/configuracion"), color:"#6B7280"},
    {Icono:HelpCircle,   label:"Ayuda y soporte",   sub:"Preguntas frecuentes y contacto",  accion:()=>navigate("/ayuda"),          color:t.colors.blue},
    {Icono:Info,         label:"Acerca de nosotros", sub:"FleteApp v1.0",                    accion:()=>navigate("/acerca"),         color:t.colors.green},
  ];

  return (
    <div style={styles.pantalla}>

      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(-1)}>← Volver</button>
        <h1 style={styles.titulo}>Perfil</h1>
        <div style={{width:"60px"}} />
      </div>

      {/* AVATAR */}
      <div style={styles.avatarCard}>
        <div style={styles.avatarCirculo}>
          <span style={styles.avatarLetras}>{iniciales}</span>
        </div>
        <p style={styles.avatarNombre}>{usuario?.displayName||"Usuario"}</p>
        <p style={styles.avatarEmail}>{usuario?.email||""}</p>
      </div>

      {/* OPCIONES */}
      <div style={styles.seccionLabel}>Configuración</div>
      <div style={styles.seccion}>
        {opciones.map((op,i,arr)=>(
          <button key={op.label}
            style={{...styles.opcion,borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}
            onClick={op.accion}
          >
            <div style={styles.opcionIzq}>
              <div style={{...styles.opcionIconoWrap,background:op.color+"15"}}>
                <op.Icono size={18} color={op.color} strokeWidth={2} />
              </div>
              <div>
                <p style={styles.opcionLabel}>{op.label}</p>
                <p style={styles.opcionSub}>{op.sub}</p>
              </div>
            </div>
            <ChevronRight size={16} color={t.colors.textTertiary} />
          </button>
        ))}
      </div>

      {/* CERRAR SESIÓN */}
      <button style={styles.btnCerrar} onClick={handleCerrar}>
        <LogOut size={16} color={t.colors.red} strokeWidth={2} />
        Cerrar sesión
      </button>

      <p style={styles.version}>FleteApp v1.0</p>
    </div>
  );
}

const styles = {
  pantalla:       { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:         { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:      { background:"none", border:"none", fontSize:t.fonts.sizeSm, color:t.colors.blue, cursor:"pointer", padding:0, fontWeight:t.fonts.weightSemibold },
  titulo:         { fontSize:"20px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  avatarCard:     { background:t.colors.bgCard, padding:"32px 20px", textAlign:"center", borderBottom:`1px solid ${t.colors.borderLight}` },
  avatarCirculo:  { width:"80px", height:"80px", borderRadius:t.radius.full, background:`linear-gradient(135deg, #15803D, ${t.colors.green})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", boxShadow:"0 4px 14px rgba(22,163,74,0.3)" },
  avatarLetras:   { fontSize:"28px", fontWeight:t.fonts.weightBlack, color:"#fff" },
  avatarNombre:   { fontSize:"20px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 4px" },
  avatarEmail:    { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:0 },
  seccionLabel:   { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", padding:"16px 20px 8px" },
  seccion:        { background:t.colors.bgCard, margin:"0 16px", borderRadius:t.radius.lg, overflow:"hidden", boxShadow:t.shadows.card },
  opcion:         { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"none", border:"none", cursor:"pointer", textAlign:"left" },
  opcionIzq:      { display:"flex", alignItems:"center", gap:"12px" },
  opcionIconoWrap:{ width:"38px", height:"38px", borderRadius:t.radius.sm, display:"flex", alignItems:"center", justifyContent:"center" },
  opcionLabel:    { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0 },
  opcionSub:      { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0" },
  btnCerrar:      { display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", width:"calc(100% - 32px)", margin:"12px 16px 0", padding:"13px", background:t.colors.redSoft, border:`1.5px solid ${t.colors.redBorder}`, borderRadius:t.radius.lg, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:t.colors.red, cursor:"pointer" },
  version:        { textAlign:"center", fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, padding:"16px 0 0" },
};

export default Perfil;