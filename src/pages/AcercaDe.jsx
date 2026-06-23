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
          <img src="/logo-navira.png" alt="Navira" style={{ height: "120px", objectFit:"contain"}} />
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
            <span style={styles.cabeceraTexto}>Términos y Condiciones</span>
            {abierto.terminos
              ? <ChevronUp size={16} color={t.colors.textTertiary}/>
              : <ChevronDown size={16} color={t.colors.textTertiary}/>
            }
          </button>
          {abierto.terminos && (
            <div style={styles.cuerpo}>
              {[
                {texto:"Estos Términos y Condiciones regulan el uso de la aplicación NAVIRA (en adelante \"la Aplicación\"), desarrollada y operada por MARIO ALEJANDRO CORDOBA RUIZ, identificado con celula 1.017.255.866, con domicilio en Barranquilla, Colombia (en adelante \"NAVIRA\" o \"NOSOTROS\")"},
                {texto:"Al registrarse al usar la Aplicación, usted (en adelante \"el Usuario\"), acepta estos terminos en su totalidad. Si no está de acuerdo, no haga uso de la Aplicación"},
                {titulo:"1. Descripción del servicio", texto:"NAVIRA es una aplicación web progresiva (PWA) diseñada para la gestión administrativa de flotas de transporte de carga por carretera en Colombia. Sus funciones incluyen entre otras: * Cálculo de costos y rentabilidades de viajes. * Registros y seguimientos de vehículos. * Control de mantenimiento preventivo. * Gestión de cartera y cuentas por cobrar. * Generación de informes financieros."},
                {texto:"La Aplicación es una herramienta de apoyo administrativo. NAVIRA no presta servicios de trasnporte, intermediación de carga, ni asesoria financiera, contable o legal."},
                {titulo:"2. Registro y Cuentas", texto:"2.1. Para usar la Aplicación, el Usuario debe crear una cuenta proporcionando información verz y actualizada."},
                {texto:"2.2. El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso (correo electrónico y contraseña)."},
                {texto:"2.3. Durante el período de prueba (Beta), el acceso requiere un código de invitación proporcionado por NAVIRA"},
                {texto:"2.4. El Usuario debe ser mayor de edad."},
                {texto:"2.5. Cada cuenta es personal e intransferible."},
                {titulo:"3. Uso aceptable", texto:"El usuario se compromete a:"},
                {texto:"3.1. Utilizar la Aplicación únicamente para fines de gestión de transporte de carga."},
                {texto:"3.2. No introducir información falsa, engañosa o que viole derechos de terceros."},
                {texto:"3.3. No intentar acceder a datos de otros usuarios ni a sistemas internos de la Aplicación."},
                {texto:"3.4. No copiar, modificar, distribuir ni realizar ingeniería inversa del software."},
                {texto:"3.5. No utilizar la Aplicación para actividades ilegales o contrarias a la normativa colombiana de transporte."},
                {titulo:"4. Datos y contenido del usuario", texto:"4.1. El Usuario es propietario de los datos que ingresa en la Aplicación (información de vehículos, viajes, conductores, empresas, gastos)."},
                {texto:"4.1. El Usuario es propietario de los datos que ingresa en la Aplicación (información de vehículos, viajes, conductores, empresas, gastos)."},
                {texto:"4.2. NAVIRA no accede, comparte ni comercializa los datos del Usuario con terceros, salvo lo dispuesto en la Política de Privacidad."},
                {texto:"4.3. El Usuario es responsable de la veracidad y legalidad de la información que registra."},
                {texto:"4.4. NAVIRA podrá utilizar datos agregados y anonimizados (sin identificar al Usuario) para mejorar el servicio y generar estadísticas del sector."},
                {titulo:"5. Almacenamiento y respaldo", texto:"5.1. Los datos del Usuario se almacenan en servidores seguros de Google Cloud (Firebase) con cifrado en tránsito y en reposo."},
                {texto:"5.2. NAVIRA realiza respaldos automáticos, pero no garantiza la recuperación de datos en caso de eventos extraordinarios o fuerza mayor."},
                {texto:"5.3. Se recomienda al Usuario mantener sus propios respaldos de información crítica."},
                {titulo:"6. Disponibilidad del servicio", texto:"6.1. NAVIRA se esfuerza por mantener la Aplicación disponible las 24 horas del día, los 7 días de la semana."},
                {texto:"6.2. NAVIRA no garantiza la disponibilidad ininterrumpida del servicio. Podrán existir interrupciones por mantenimiento, actualizaciones o causas de fuerza mayor."},
                {texto:"6.3. NAVIRA no será responsable por daños derivados de la indisponibilidad temporal del servicio."},
                {titulo:"7. Versión BETA", texto:"7.1. La versión actual de la Aplicación es una versión Beta, lo que significa que está en fase de pruebas y puede contener errores."},
                {texto:"7.2. El Usuario acepta que la funcionalidad, el diseño y las características pueden cambiar sin previo aviso."},
                {texto:"7.3. NAVIRA agradece los reportes de errores y sugerencias de mejora por parte de los beta testers."},
                {texto:"7.4. El acceso a la versión Beta es gratuito. Los planes y precios de la versión comercial se comunicarán oportunamente."},
                {titulo:"8. Tarifas y pagos", texto:"8.1. Durante la fase Beta, el uso de NAVIRA es completamente gratuito."},
                {texto:"8.2. Una vez finalizada la fase Beta, NAVIRA podrá implementar planes de suscripción de pago, los cuales serán comunicados al Usuario con al menos 30 días de anticipación."},
                {texto:"8.3. El Usuario podrá continuar con un plan gratuito limitado o suscribirse a un plan de pago."},
                {titulo:"9. Propiedad intelectual", texto:"9.1. NAVIRA, su logotipo, diseño, código fuente, algoritmos y contenido son propiedad exclusiva de Mario Alejandro Cordoba Ruiz."},
                {texto:"9.2. El uso de la Aplicación no otorga al Usuario ningún derecho de propiedad intelectual sobre la misma."},
                {texto:"9.3. Queda prohibida la reproducción, distribución o modificación total o parcial de la Aplicación sin autorización expresa."},
                {titulo:"10. Versión BETA", texto:"10.1. La Aplicación es una herramienta de apoyo administrativo. Los cálculos, estimaciones y datos proporcionados son orientativos y no constituyen asesoría financiera, contable ni legal."},
                {texto:"10.2. NAVIRA no se hace responsable por decisiones tomadas por el Usuario con base en la información generada por la Aplicación."},
                {texto:"10.3. NAVIRA no se hace responsable por la exactitud de las tarifas de peajes, precios de combustible u otros datos de referencia que puedan variar sin previo aviso por las entidades correspondientes."},
                {texto:"10.4. La responsabilidad máxima de NAVIRA frente al Usuario, por cualquier concepto, estará limitada al valor de las suscripciones pagadas por el Usuario en los últimos 12 meses."},
                {titulo:"11. Cancelación y terminación", texto:"11.1. El Usuario puede cancelar su cuenta en cualquier momento contactando a soporte."},
                {texto:"11.2. NAVIRA se reserva el derecho de suspender o cancelar cuentas que violen estos Términos."},
                {texto:"11.3. Al cancelar la cuenta, los datos del Usuario serán eliminados en un plazo de 30 días calendario, salvo obligaciones legales de retención."},
                {titulo:"12. Cancelación y terminación", texto:"12.1. NAVIRA podrá modificar estos Términos en cualquier momento, notificando al Usuario a través de la Aplicación o por correo electrónico."},
                {texto:"12.2. El uso continuado de la Aplicación después de la notificación constituye aceptación de los nuevos Términos."},
                {titulo:"13. Cancelación y terminación", texto:"13.1.Estos Términos se rigen por las leyes de la República de Colombia."},
                {texto:"13.2. Cualquier controversia será sometida a la jurisdicción de los jueces y tribunales de Barranquilla, Atlántico, Colombia."},
              
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
            <span style={styles.cabeceraTexto}>Política de Privacidad y Tratamiento de Datos Personales</span>
            {abierto.privacidad
              ? <ChevronUp size={16} color={t.colors.textTertiary}/>
              : <ChevronDown size={16} color={t.colors.textTertiary}/>
            }
          </button>
          {abierto.privacidad && (
            <div style={styles.cuerpo}>
              {[
                {texto:"En cumplimiento de la Ley 1581 de 2012 (Ley de Protección de Datos Personales), el Decreto 1377 de 2013 y demás normativa vigente en Colombia, Mario Alejandro Cordoba Ruiz, identificado con NIT/Cédula 1.017.255.866, con domicilio en Barranquilla, Atlántico, Colombia, en calidad de Responsable del Tratamiento de datos personales, presenta la siguiente Política de Privacidad para la aplicación NAVIRA."},
                {titulo:"1. Responsables del tratamiento", texto:"Responsable: Mario Alejandro Cordoba Ruiz. NIT/Cédula: 1.017.255.866, Barranquilla/ Atlantico, Colombia. Correo electronico: naviralatam@gmail.com. Teléfono/WhatsApp:+57 301 658 7224"},
                {titulo:"2. Datos personales que recopilamos", texto:"NAVIRA recopila los siguientes datos personales según las funcionalidades que el Usuario utilice:"},
                {textSecondary:"2.1. Datos de registro: Nombre completo, correo electronico, contraseña (almacenada de forma cifrada por Firebase Authentication), foto de perfil (si inicia sesión con Google)."},
                {texto:"2.2. Durante el período de prueba (Beta), el acceso requiere un código de invitación proporcionado por NAVIRA"},
                {texto:"2.3. El Usuario debe ser mayor de edad."},
                {texto:"2.4. Cada cuenta es personal e intransferible."},
                {texto:"2.5. El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso (correo electrónico y contraseña)."},
                {texto:"2.6. Durante el período de prueba (Beta), el acceso requiere un código de invitación proporcionado por NAVIRA"},
                {texto:"2.7. El Usuario debe ser mayor de edad."},
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