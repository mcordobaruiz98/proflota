import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { theme as t } from "../styles/theme";

function AcercaDe() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState({terminos: false, privacidad: false});

  const toggle = (key) => setAbierto(prev => ({...prev, [key]: !prev[key]}));

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Acerca de</h1>
      </div>

      <div style={styles.contenido}>

        {/* LOGO Y NOMBRE */}
        <div style={{textAlign:"center", padding:"30px 20px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px"}}>
          <img src="/logo-navira.png" alt="Navira" style={{ height: "60px", objectFit:"contain"}} />
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:0}}>Versión 1.0 Beta</p>
        </div>

        {/* DESCRIPCIÓN */}
        <div style={styles.card}>
          <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:0, lineHeight:"1.6"}}>
            Aplicación diseñada para transportadores colombianos. Gestiona tu flota, calcula fletes, registra viajes y controla tus ganancias desde el celular.
          </p>
        </div>

        {/* TÉRMINOS */}
        <div style={styles.seccion}>
          <button style={styles.cabecera} onClick={()=>toggle("terminos")}>
            <span style={styles.cabeceraTexto}>Términos y condiciones</span>
            {abierto.terminos
              ? <ChevronUp size={16} color={t.colors.textTertiary}/>
              : <ChevronDown size={16} color={t.colors.textTertiary}/>
            }
          </button>
          {abierto.terminos && (
            <div style={styles.cuerpo}>
              {[
                {titulo:"1. Aceptación", texto:"Al usar esta aplicación aceptas estos términos. Si no estás de acuerdo, no uses la app."},
                {titulo:"2. Uso de la app", texto:"Navira es una herramienta de apoyo para la gestión de flotas de transporte de carga. Las decisiones financieras y operativas son responsabilidad exclusiva del usuario."},
                {titulo:"3. Versión Beta", texto:"Esta es una versión beta. Puede contener errores. El equipo de Navira no se hace responsable por pérdidas derivadas del uso de la app."},
                {titulo:"4. Datos", texto:"Tus datos son tuyos. No los vendemos ni compartimos con terceros. Los usamos únicamente para hacer funcionar la app."},
                {titulo:"5. Acceso", texto:"El acceso está limitado por código de invitación. Navira se reserva el derecho de revocar el acceso en cualquier momento durante la fase beta."},
                {titulo:"6. Contacto", texto:"Para soporte escríbenos al WhatsApp del administrador."},
              ].map((item,i)=>(
                <div key={i} style={{marginBottom:"12px"}}>
                  <p style={{fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 4px"}}>{item.titulo}</p>
                  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:0, lineHeight:"1.6"}}>{item.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRIVACIDAD */}
        <div style={styles.seccion}>
          <button style={styles.cabecera} onClick={()=>toggle("privacidad")}>
            <span style={styles.cabeceraTexto}>Política de privacidad</span>
            {abierto.privacidad
              ? <ChevronUp size={16} color={t.colors.textTertiary}/>
              : <ChevronDown size={16} color={t.colors.textTertiary}/>
            }
          </button>
          {abierto.privacidad && (
            <div style={styles.cuerpo}>
              {[
                {titulo:"1. Datos que recolectamos", texto:"Correo electrónico para autenticación. Datos de vehículos, viajes y gastos que tú mismo ingresas. Fotos de vehículos que tú mismo subes."},
                {titulo:"2. Cómo usamos tus datos", texto:"Para mostrarte tu información dentro de la app y calcular tus ganancias y gastos. No usamos tus datos para publicidad."},
                {titulo:"3. Almacenamiento", texto:"Tus datos se almacenan en Firebase (Google) con cifrado. Solo tú puedes acceder a ellos."},
                {titulo:"4. Tus derechos", texto:"Puedes solicitar la eliminación de tus datos en cualquier momento escribiéndonos."},
                {titulo:"5. Cookies", texto:"No usamos cookies de rastreo."},
                {titulo:"6. Cambios", texto:"Podemos actualizar esta política. Te notificaremos por WhatsApp."},
              ].map((item,i)=>(
                <div key={i} style={{marginBottom:"12px"}}>
                  <p style={{fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 4px"}}>{item.titulo}</p>
                  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:0, lineHeight:"1.6"}}>{item.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <p style={{textAlign:"center", fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, padding:"20px", margin:0}}>
          Desarrollado en Colombia · 2026
        </p>

      </div>
    </div>
  );
}

const styles = {
  pantalla:    { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:      { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:   { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:      { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:   { padding:"0 16px 16px" },
  card:        { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"10px", boxShadow:t.shadows.card },
  seccion:     { background:t.colors.bgCard, borderRadius:t.radius.lg, marginBottom:"10px", overflow:"hidden", boxShadow:t.shadows.card },
  cabecera:    { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"none", border:"none", cursor:"pointer" },
  cabeceraTexto: { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  cuerpo:      { padding:"0 16px 16px" },
};

export default AcercaDe;