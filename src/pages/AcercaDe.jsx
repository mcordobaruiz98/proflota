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
          <ArrowLeft size={18} color={t.colors.blueText} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Acerca de</h1>
      </div>

      <div style={styles.contenido}>

        {/* LOGO Y NOMBRE */}
        <div style={{textAlign:"center", padding:"30px 20px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px"}}>
          <img src="/logo-navira.png" alt="Navira" style={{ height: "120px", objectFit:"contain"}} />
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:0}}>Versión 1.1 Beta</p>
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
                {texto:"Estos Términos y Condiciones regulan el uso de la aplicación NAVIRA (en adelante \"la Aplicación\"), desarrollada y operada por T&T MCR, identificado con celula 1.017.255.866, con domicilio en Barranquilla, Colombia (en adelante \"NAVIRA\" o \"NOSOTROS\")"},
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
                {titulo:"9. Propiedad intelectual", texto:"9.1. NAVIRA, su logotipo, diseño, código fuente, algoritmos y contenido son propiedad exclusiva de T&T MCR."},
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
                {titulo:"14. Canales de terceros", texto:"NAVIRA ofrece canales opcionales de registro de información a través de plataformas de mensajería de terceros, como Telegram. Al vincular su cuenta con dichos canales, el usuario reconoce que: (i) la transmisión de los mensajes se realiza a través de la infraestructura del tercero (Telegram FZ-LLC), sujeta a sus propios términos y políticas de privacidad; (ii) NAVIRA no controla la seguridad, disponibilidad ni el tratamiento de datos que dicho tercero realice sobre los mensajes en tránsito; (iii) la vinculación es voluntaria y puede revocarse en cualquier momento desde la aplicación o dejando de usar el canal."},
                {titulo:"15. Responsabilidad sobre registros por chat", texto:"Los registros creados a través de canales de chat (como el bot de Telegram) tienen la misma validez y efecto dentro de la plataforma que los creados en la aplicación. El usuario es responsable de verificar el resumen presentado por el bot antes de confirmar el guardado. NAVIRA no se hace responsable por errores derivados de información digitada incorrectamente por el usuario en cualquier canal."},

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
                {texto:"En cumplimiento de la Ley 1581 de 2012 (Ley de Protección de Datos Personales), el Decreto 1377 de 2013 y demás normativa vigente en Colombia, T&T MCR, identificado con NIT/Cédula 1.017.255.866, con domicilio en Barranquilla, Atlántico, Colombia, en calidad de Responsable del Tratamiento de datos personales, presenta la siguiente Política de Privacidad para la aplicación NAVIRA."},
                {titulo:"1. Responsables del tratamiento", texto:"Responsable: T&T MCR. NIT/Cédula: 1.017.255.866, Barranquilla/ Atlantico, Colombia. Correo electronico: naviralatam@gmail.com. Teléfono/WhatsApp:+57 301 658 7224"},
                {titulo:"2. Datos personales que recopilamos", texto:"NAVIRA recopila los siguientes datos personales según las funcionalidades que el Usuario utilice:"},
                {texto:"2.1. Datos de registro: Nombre completo, correo electronico, contraseña (almacenada de forma cifrada por Firebase Authentication), foto de perfil (si inicia sesión con Google)."},
                {texto:"2.2. Datos de vehiculos: Placa del vehiculo y remolque (opcional), marca, modelo, tipo de vehículo, propietario y/o tenedor, fotografia del vehículo, kilometraje (odómetro), fechas de vencimiento de documentos (SOAT, RTM, pólizas)."},
                {texto:"2.3. Datos de conductores: Nombre completo, número de cédula, número de teléfono, número de licencia de conducción, categotria y fecha de vencimiento, ARL y EPS."},
                {texto:"2.4. Datos de viaje y operación: Rutas de origen y destino, fechas de cargue y descargue, empresas genradoras de carga y contactos, números de manifiesto y remesa, valores de fletes, peajes, combustible y gastos, bítacora de eventos del viaje (ubicaciones, notas, horarios)."},
                {texto:"2.5. Datos financieros: Ingresos y gastos por viaje, estado de cartera (cuentas por cobrar), gastos mensuales, gastos adicionales de mantenimiento (incluyendo el taller y Nit del taller)"},
                {texto:"2.6. Datos de mantenimiento: Historial de llantas, frenos, aceite y filtros, registros de tanqueo y consumo de combustible, facturas adjuntas (Archivos PDF o PNG/JPG."},
                {texto:"2.7. Datos técnicos recopilados automáticamente: Dirección IP, tipo de dispositivo y navegador, fecha y hora de acceso."},
                {titulo:"3. Finalidades del tratamiento", texto:"Los datos personnales serán tratados para a siguiente finalidades:"},
                {texto:"3.1. Finalidades necesarias para el servicio: Crear y administrar la cuenta del Usuario. Proveer las funcionalidades de la Aplicación (cálculo de viajes, gestión de flota, cartera, mantenimiento). Generar informes financieros solicitados por el Usuario. Almacenar y respaldar la indormación del Usuario en la nube. Enviar alertas dentro de la Aplicación (vencimiento de documentos, mantenimiento, cartera)."},
                {texto:"3.2. Finalidades adicionales (con autorización): Enviar comunicaciones sobre actualizaciones, nuevas funcionalidades o cambios en el servicio. Contactar al Usuario para soporte técnico o atención de solicitudes. Generar estadísticas agregadas y anonimizadas sobre el sector de trasnporte de carga en Colombia, sin identificar al Usuario individualmente."},
                {titulo:"4. Tratamiento de datos sensibles.", texto:"4.1. NAVIRA no recopila datos sensibles en los términos del articulo 5 de la Ley 1581 de 2012 (origen racial, orientación política, convicciones religiosas, datos de salud, biométricos, entre otros)."},
                {texto:"4.2. Los números de cédula y licencia de conducción se recopilan exclusivamente para la gestión administrativa de la flota y no se comparten con terceros."},
                {titulo:"5. Compartición de datos con terceros.", texto:"5.1. NAVIRA no vende, alquila ni comercializa los datos personales del Usuario."},
                {texto:"5.2. Los datos del Usuario podrán ser compartidos únicamente en los siguientes casos: "},
                {texto:"*Google Cloud / Firebase: Los datos se almacenan en la infraestructura de Google Cloud Platform (Firebase), sujeta a los términos de privacidad de Google y sus certificaciones de seguridad internacionales. Los servidores pueden estar ubicados fuera de Colombia, en cumplimiento con lo dispuesto en el artículo 26 de la Ley 1581 de 2012 sobre transferencia internacional de datos a países con niveles adecuados de protección."},
                {texto:"*Requerimiento legal: Cuando sea exigido por autoridad judicial o administrativa colombiana competente, en cumplimiento de la ley."},
                {texto:"*Protección de derechos: Cuando sea necesario para proteger los derechos, la seguridad o la propiedad de NAVIRA o de terceros."},
                {texto:"5.3. En ningún caso se compartirán datos personales con empresas de transporte, generadores de carga, competidores, ni con fines publicitarios de terceros."},
                {titulo:"6. Almacenamiento y seguridad.", texto:"6.1. Los datos se almacenan en Firebase (Google Cloud Platform), que cuenta con certificaciones SOC 1, SOC 2, SOC 3, ISO 27001 e ISO 27017."},
                {texto:"6.2. Las contraseñas se almacenan cifradas mediante los protocolos de seguridad de Firebase Authentication. NAVIRA no tiene acceso a las contraseñas en texto claro."},
                {texto:"6.3. La comunicación entre la Aplicación y los servidores utiliza cifrado TLS/SSL."},
                {texto:"6.4. Los archivos adjuntos (fotografías, facturas) se almacenan en Firebase Storage con controles de acceso por usuario autenticado."},
                {texto:"6.5. NAVIRA implementa las medidas técnicas y organizativas razonables para proteger los datos personales contra acceso no autorizado, pérdida, alteración o destrucción."},
                {titulo:"7. Período de conservación.", texto:"7.1. Los datos personales se conservarán mientras la cuenta del Usuario esté activa."},
                {texto:"7.2. Si el Usuario solicita la eliminación de su cuenta, los datos serán eliminados en un plazo máximo de 30 días calendario, salvo que exista una obligación legal de conservarlos."},
                {texto:"7.3. Los datos anonimizados con fines estadísticos podrán conservarse de forma indefinida, al no constituir datos personales."},
                {titulo:"8. Derechos del titular (Derechos Arco)", texto:"De conformidad con el artículo 8 de la Ley 1581 de 2012, el Usuario tiene derecho a:"},
                {texto:"8.1. Acceder a sus datos personales y conocer el tratamiento que se les da."},
                {texto:"8.2. Rectificar (actualizar o corregir) sus datos cuando sean inexactos, incompletos o estén desactualizados."},
                {texto:"8.3. Cancelar (solicitar la supresión) de sus datos cuando considere que no están siendo tratados conforme a la ley, salvo que exista un deber legal o contractual de conservarlos."},
                {texto:"8.4. Oponerse al tratamiento de sus datos para finalidades específicas."},
                {texto:"8.5. Revocar la autorización otorgada para el tratamiento de datos, cuando no exista obligación legal o contractual que lo impida."},
                {texto:"8.6. Solicitar prueba de la autorización otorgada, salvo los casos exceptuados por la ley."},
                {texto:"8.7. Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la Ley 1581 de 2012, una vez agotado el trámite de consulta o reclamo ante NAVIRA."},
                {titulo:"9. Procedimientos para ejercer sus derechos."},
                {texto:"9.1. El Usuario podrá ejercer sus derechos mediante comunicación escrita dirigida a: correo electrónico: naviralatam@gmail.com. WhatsApp: +57 301 658 7224"},
                {texto:"9.2. La solicitud deberá contener: Nombre completo del titular, número de cédula, correo electrónico registrado en la Aplicación, descripción de la solicitud (Acceso, rectificación, cancelación, oppsición ó revocación)."},
                {texto:"9.3. NAVIRA responderá las consultas en un plazo máximo de diez (10) días hábiles contados a partir de la recepción de la solicitud. Si no fuere posible atender la consulta en dicho plazo, se informará al titular los motivos de la demora y la fecha en que se atenderá, la cual no podrá superar los cinco (5) días hábiles siguientes al vencimiento del primer plazo."},
                {texto:"9.4. Los reclamos se atenderán en un plazo máximo de quince (15) días hábiles, prorrogables por ocho (8) días hábiles adicionales con justificación."},
                {titulo:"10. Cookies y tecnologías similares.", texto:"10.1. NAVIRA utiliza almacenamiento local del navegador (localStorage) para recordar preferencias del Usuario, como el último precio de ACPM ingresado. Esta información se almacena exclusivamente en el dispositivo del Usuario."},
                {texto:"10.2. Firebase Authentication utiliza tokens de sesión para mantener la sesión del Usuario activa. Estos tokens son administrados por Google y están sujetos a sus políticas de seguridad."},
                {texto:"10.3. NAVIRA no utiliza cookies de rastreo, publicidad ni de terceros con fines comerciales."},
                {titulo:"11. Menores de edad.", texto:"11.1. NAVIRA no está dirigida a menores de 18 años."},
                {texto:"11.2. No recopilamos conscientemente datos personales de menores de edad. Si detectamos que un menor se ha registrado, procederemos a eliminar su cuenta y datos."},
                {titulo:"12. Transferencia internacional de datos.", texto:"12.1. Los datos del Usuario se almacenan en servidores de Google Cloud Platform, los cuales pueden estar ubicados en Estados Unidos u otros países donde Google opera centros de datos."},
                {texto:"12.2. Google cumple con estándares internacionales de protección de datos y cuenta con mecanismos de transferencia aprobados, incluyendo cláusulas contractuales tipo y certificaciones de privacidad."},
                {texto:"12.3. Esta transferencia se realiza en cumplimiento del artículo 26 de la Ley 1581 de 2012."},
                {titulo:"13. Modificaciones a esta política.", texto:"13.1. NAVIRA se reserva el derecho de modificar esta Política de Privacidad en cualquier momento."},
                {texto:"13.2. Las modificaciones serán comunicadas al Usuario a través de la Aplicación o por correo electrónico."},
                {texto:"13.3. El uso continuado de la Aplicación después de la notificación constituye aceptación de la política actualizada."},
                {texto:"13.4. La versión vigente estará siempre disponible en la sección \"Acerca de\" dentro de la Aplicación."},
                {titulo:"14. Datos recolectados por el bot de Telegram", texto:"Cuando el usuario registra información a través del bot de Telegram, NAVIRA almacena: el identificador de chat de Telegram asociado a su cuenta (para la vinculación), el estado temporal de la conversación en curso, y los datos del viaje que el usuario confirme guardar. NAVIRA no accede a otros chats, contactos ni información del dispositivo del usuario en Telegram. Los mensajes intercambiados con el bot son procesados exclusivamente para completar el registro solicitado por el usuario."},
                {titulo:"15. Autorización.", texto:"Al registrarse en NAVIRA, el Usuario declara que:"},
                {texto:"* Ha leído y comprendido esta Política de Privacidad."},
                {texto:"* Autoriza de manera libre, expresa, previa e informada el tratamiento de sus datos personales conforme a las finalidades aquí descritas."},
                {texto:"* Conoce sus derechos como titular de datos personales según la Ley 1581 de 2012."},
                {titulo:"Contacto y canal de atención.", texto:"Para cualquier consulta, solicitud o reclamo relacionado con el tratamiento de datos personales:"},
                {texto:"Responsable: T&T MCR. Correo electrónico: naviralatam@gmail.com"},
                {texto:"Autoridad de control: Superintendencia de Industria y Comercio (SIC) www.sic.gov.co Línea gratuita: 01 8000 910 165"},
              ].map((item,i)=>(
                <div key={i} style={{marginBottom:"12px"}}>
                  <p style={{fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 4px"}}>{item.titulo}</p>
                  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:0, lineHeight:"1.6"}}>{item.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FECHA DE ACTUALIZACIÓN */}
        <div style={styles.card}>
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:0, textAlign:"center"}}>
            Última actualización: julio de 2026 · v1.1
          </p>
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
  btnVolver:   { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blueText, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:      { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:   { padding:"0 16px 16px" },
  card:        { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"10px", boxShadow:t.shadows.card, border:`1px solid ${t.colors.borderLight}` },
  seccion:     { background:t.colors.bgCard, borderRadius:t.radius.lg, marginBottom:"10px", overflow:"hidden", boxShadow:t.shadows.card, border:`1px solid ${t.colors.borderLight}` },
  cabecera:    { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"none", border:"none", cursor:"pointer" },
  cabeceraTexto: { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  cuerpo:      { padding:"0 16px 16px" },
};

export default AcercaDe;