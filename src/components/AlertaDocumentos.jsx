import { useNavigate } from "react-router-dom";
import { FileWarning, ChevronRight } from "lucide-react";
import { theme as t } from "../styles/theme";

/**
 * AlertasDocumentos — muestra en Home los documentos próximos a vencer o vencidos
 * de todos los vehículos. Lee vehiculo.hvData (guardado en la Hoja de Vida).
 *
 * Documentos con vencimiento monitoreados:
 *   veh_soat, veh_rtm, veh_poliza, con_licencia
 */

const DOCS_VENCIMIENTO = [
  { clave: "veh_soat", label: "SOAT" },
  { clave: "veh_rtm", label: "RTM (Tecnomecánica)" },
  { clave: "veh_poliza", label: "Póliza todo riesgo" },
  { clave: "con_licencia", label: "Licencia conductor" },
];

const UMBRAL_DIAS = 30; // avisar cuando falten 30 días o menos

function AlertasDocumentos({ vehiculos = [] }) {
  const navigate = useNavigate();

  // Recopilar todas las alertas
  const alertas = [];
  vehiculos.forEach(v => {
    const hv = v.hvData || {};
    DOCS_VENCIMIENTO.forEach(doc => {
      const fechaVenc = hv[doc.clave + "_venc"];
      if (!fechaVenc) return;
      const dias = Math.ceil((new Date(fechaVenc) - new Date()) / (1000 * 60 * 60 * 24));
      if (dias <= UMBRAL_DIAS) {
        alertas.push({
          placa: v.placa,
          vehiculoId: v.firestoreId,
          doc: doc.label,
          dias,
          vencido: dias < 0,
        });
      }
    });
  });

  if (alertas.length === 0) return null;

  // Ordenar: primero los vencidos, luego por días ascendente
  alertas.sort((a, b) => a.dias - b.dias);

  // Contar vencidos y próximos
  const vencidos = alertas.filter(a => a.vencido).length;
  const proximos = alertas.length - vencidos;

  return (
    <div style={styles.contenedor}>
      <div style={styles.encabezado}>
        <FileWarning size={16} color={vencidos > 0 ? t.colors.red : (t.colors.amber || "#F59E0B")} />
        <span style={styles.titulo}>
          {vencidos > 0 && `${vencidos} documento${vencidos !== 1 ? "s" : ""} vencido${vencidos !== 1 ? "s" : ""}`}
          {vencidos > 0 && proximos > 0 && " · "}
          {proximos > 0 && `${proximos} por vencer`}
        </span>
      </div>

      {alertas.slice(0, 4).map((a, i) => (
        <button
          key={i}
          style={styles.alertaItem}
          onClick={() => navigate(`/vehiculo/${a.vehiculoId}`, { state: { tab: "hoja" } })}
        >
          <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
            <span style={{
              width:"8px", height:"8px", borderRadius:"50%",
              background: a.vencido ? t.colors.red : (t.colors.amber || "#F59E0B"),
              flexShrink: 0,
            }} />
            <div style={{textAlign:"left"}}>
              <p style={styles.alertaTexto}>
                <strong>{a.placa}</strong> · {a.doc}
              </p>
              <p style={{
                ...styles.alertaDias,
                color: a.vencido ? t.colors.red : (t.colors.amber || "#F59E0B"),
              }}>
                {a.vencido ? `Venció hace ${Math.abs(a.dias)} día${Math.abs(a.dias) !== 1 ? "s" : ""}` : a.dias === 0 ? "Vence hoy" : `Vence en ${a.dias} día${a.dias !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <ChevronRight size={16} color={t.colors.textTertiary} />
        </button>
      ))}

      {alertas.length > 4 && (
        <p style={styles.masAlertas}>
          y {alertas.length - 4} documento{alertas.length - 4 !== 1 ? "s" : ""} más
        </p>
      )}
    </div>
  );
}

const styles = {
  contenedor:  { margin:"0 16px 10px", padding:"12px 14px", background:t.colors.bgCard, borderRadius:t.radius.lg, border:`1.5px solid ${t.colors.amberBorder || (t.colors.amber || "#F59E0B") + "44"}`, boxShadow:t.shadows.card },
  encabezado:  { display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" },
  titulo:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary },
  alertaItem:  { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", background:"none", border:"none", borderTop:`1px solid ${t.colors.borderLight}`, cursor:"pointer" },
  alertaTexto: { fontSize:t.fonts.sizeXs, color:t.colors.textPrimary, margin:0 },
  alertaDias:  { fontSize:"11px", fontWeight:t.fonts.weightSemibold, margin:"1px 0 0" },
  masAlertas:  { fontSize:"11px", color:t.colors.textTertiary, textAlign:"center", margin:"8px 0 0", fontStyle:"italic" },
};

export default AlertasDocumentos;