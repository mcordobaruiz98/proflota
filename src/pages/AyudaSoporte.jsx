import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { theme as t } from "../styles/theme";

const FAQS = [
  {
    pregunta: "¿Cómo registro un viaje?",
    respuesta: "Ve a la Calculadora desde el Home o la barra inferior. Llena los datos del viaje, combustible, peajes y costos. Al final toca 'Guardar viaje' para registrarlo.",
  },
  {
    pregunta: "¿Cómo agrego un vehículo?",
    respuesta: "Ve a Vehículos y toca '+ Agregar'. Completa los datos del vehículo, propietario y tenedor. Toca 'Guardar vehículo'.",
  },
  {
    pregunta: "¿Los datos se guardan en la nube?",
    respuesta: "Sí. Todos tus datos se guardan en Firebase y están disponibles desde cualquier dispositivo con tu cuenta.",
  },
  {
    pregunta: "¿Cómo subo documentos a la Hoja de Vida?",
    respuesta: "Entra al detalle de un vehículo → tab 'Hoja de Vida'. Toca '+ Subir' junto a cada documento y selecciona un PDF o imagen desde tu dispositivo.",
  },
  {
    pregunta: "¿Cómo defino mis metas de ganancia?",
    respuesta: "Ve a Objetivos desde el Home. Toca 'Editar metas' y define tu meta diaria, semanal y mensual. Las barras de progreso se actualizan automáticamente.",
  },
  {
    pregunta: "¿Cómo funciona el cálculo de Adblue?",
    respuesta: "El Adblue se calcula automáticamente como el 18.9% del consumo total de ACPM en galones, convertido a litros.",
  },
  {
    pregunta: "¿Puedo usar la app sin internet?",
    respuesta: "Puedes navegar por la app sin internet pero los datos no se sincronizarán hasta que recuperes la conexión.",
  },
];

function AyudaSoporte() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [abiertos, setAbiertos] = useState({});
  

  const toggleFaq = (i) => {
    setAbiertos((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div style={styles.pantalla}>

      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1 style={styles.titulo}>Ayuda y soporte</h1>
        <div style={{ width: "60px" }} />
      </div>

            {/* CONTACTO */}
      <div style={styles.seccionTitulo}>Contacto</div>
      <div style={styles.seccion}>
        <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:0, padding:"14px 16px 4px", lineHeight:1.5}}>
          ¿Encontró un error o tiene una sugerencia? Escríbanos, respondemos rápido.
        </p>

        <div style={{padding:"10px 16px 16px"}}>
          <button
            style={{width:"100%", padding:"13px", background:"#25D366", color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"10px"}}
            onClick={() => {
              const mensaje = encodeURIComponent(
                `Hola, le escribo desde NAVIRA.\n\n` +
                `Mi correo: ${usuario?.email || "—"}\n` +
                `Versión: 1.1 Beta\n\n` +
                `Mi consulta o problema:\n`
              );
              window.open(`https://wa.me/573016587224?text=${mensaje}`, "_blank");
            }}
          >
            💬 Escribir por WhatsApp
          </button>

          <button
            style={{width:"100%", padding:"13px", background:"transparent", color:t.colors.blue, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px"}}
            onClick={() => {
              const asunto = encodeURIComponent("Reporte NAVIRA — Beta");
              const cuerpo = encodeURIComponent(
                `Correo de mi cuenta: ${usuario?.email || "—"}\n` +
                `Versión: 1.1 Beta\n\n` +
                `Describa el problema o sugerencia:\n\n\n` +
                `¿Qué estaba haciendo cuando ocurrió?\n\n`
              );
              window.location.href = `mailto:naviralatam@gmail.com?subject=${asunto}&body=${cuerpo}`;
            }}
          >
            📧 Reportar por correo
          </button>

          <p style={{fontSize:"11px", color:t.colors.textTertiary, margin:"12px 0 0", textAlign:"center"}}>
            NAVIRA está en fase beta. Su reporte nos ayuda a mejorarla.
          </p>
        </div>
      </div>

      {/* FAQS */}
      {/* FAQS */}
<div style={styles.seccionTitulo}>Preguntas frecuentes</div>
<div style={styles.seccion}>
  {FAQS.map((faq, i, arr) => (
    <div key={i} style={{borderBottom: i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
      <button style={styles.filaBtn} onClick={()=>toggleFaq(i)}>
        <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, flex:1, textAlign:"left", paddingRight:"10px"}}>
          {faq.pregunta}
        </span>
        <span style={{fontSize:"11px", color:t.colors.textTertiary, flexShrink:0}}>
          {abiertos[i] ? "▲" : "▼"}
        </span>
      </button>
      {abiertos[i] && (
        <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, lineHeight:"1.6", padding:"0 16px 14px", margin:0}}>
          {faq.respuesta}
        </p>
      )}
    </div>
  ))}
</div>

    </div>
  );
}

import { theme as t } from "../styles/theme";

const styles = {
  pantalla:      { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:     { background:"none", border:"none", fontSize:t.fonts.sizeSm, color:t.colors.blue, cursor:"pointer", padding:0, fontWeight:t.fonts.weightSemibold },
  titulo:        { fontSize:"20px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  seccionTitulo: { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", padding:"16px 20px 8px" },
  seccion:       { background:t.colors.bgCard, borderRadius:t.radius.lg, margin:"0 16px 4px", overflow:"hidden", boxShadow:t.shadows.card },
  fila:          { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:`1px solid ${t.colors.borderLight}` },
  filaBtn:       { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"none", border:"none", cursor:"pointer", textAlign:"left", borderBottom:`1px solid ${t.colors.borderLight}` },
  filaIzq:       { display:"flex", alignItems:"center", gap:"12px" },
  filaIcono:     { fontSize:"20px", width:"38px", height:"38px", background:t.colors.bgSection, borderRadius:t.radius.sm, display:"flex", alignItems:"center", justifyContent:"center" },
  filaLabel:     { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0 },
  filaSub:       { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0" },
  toggle:        { width:"44px", height:"24px", borderRadius:"12px", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 },
  toggleCircle:  { width:"20px", height:"20px", background:"white", borderRadius:"50%", position:"absolute", top:"2px", transition:"transform 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" },
};

export default AyudaSoporte;