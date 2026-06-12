import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { theme as t } from "../../styles/theme";

function HistorialMant({ vehiculos, mantenimientos = [], onEliminar, mostrarToast }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo = vehiculos.find(v => String(v.firestoreId) === String(id));
  const mantVeh  = mantenimientos
    .filter(m => m.vehiculoId === id)
    .sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

  const [confirmando, setConfirmando] = useState(null);

  const fmt = (n) => "$" + Math.round(n||0).toLocaleString("es-CO");

  const totalCosto = mantVeh.reduce((s,m) => s + (m.costo||0), 0);

  const eliminar = async (firestoreId) => {
    await onEliminar(firestoreId);
    setConfirmando(null);
    mostrarToast("Registro eliminado","info");
  };

  const porMes = mantVeh.reduce((acc, m) => {
    const mes = m.fecha ? m.fecha.slice(0,7) : "Sin fecha";
    if (!acc[mes]) acc[mes] = [];
    acc[mes].push(m);
    return acc;
  }, {});

  const meses = Object.keys(porMes).sort((a,b) => b.localeCompare(a));

  const nombreMes = (ym) => {
    if (ym === "Sin fecha") return ym;
    const [y,m] = ym.split("-");
    const nombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    return `${nombres[parseInt(m)-1]} ${y}`;
  };

  if (!vehiculo) return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(`/vehiculo/${id}`, { state: { tab: "mant" } })}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
      </div>
      <p style={{textAlign:"center",padding:"40px",color:t.colors.textSecondary}}>Vehículo no encontrado.</p>
    </div>
  );

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(`/vehiculo/${id}`, { state: { tab: "mant" } })}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Historial</h1>
      </div>

      <div style={styles.contenido}>

        {/* RESUMEN */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Total registros</p>
            <p style={{...styles.kpiVal,color:t.colors.blue}}>{mantVeh.length}</p>
          </div>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Costo total</p>
            <p style={{...styles.kpiVal,color:t.colors.red}}>{fmt(totalCosto)}</p>
          </div>
        </div>

        {/* HISTORIAL POR MES */}
        {mantVeh.length === 0 ? (
          <div style={{background:t.colors.bgCard,borderRadius:t.radius.lg,padding:"40px 20px",textAlign:"center",boxShadow:t.shadows.card}}>
            <p style={{fontSize:"32px",marginBottom:"8px"}}>📋</p>
            <p style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary,margin:"0 0 6px"}}>Sin registros</p>
            <p style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary,margin:0}}>Los mantenimientos registrados aparecerán aquí.</p>
          </div>
        ) : (
          meses.map(mes => {
            const items    = porMes[mes];
            const costoMes = items.reduce((s,m)=>s+(m.costo||0),0);
            return (
              <div key={mes} style={styles.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  <p style={styles.cardTitulo}>{nombreMes(mes)}</p>
                  {costoMes>0&&<span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:t.colors.red}}>{fmt(costoMes)}</span>}
                </div>
                {items.map((m,i,arr)=>(
                  <div key={m.firestoreId} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                    <div style={{flex:1}}>
                      <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>{m.tipo}</p>
                      <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>
                        {m.fecha} · {(m.km||0).toLocaleString("es-CO")} km
                        {m.nota?` · ${m.nota}`:""}
                      </p>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginLeft:"10px",flexShrink:0}}>
                      {m.costo>0&&<span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.red}}>{fmt(m.costo)}</span>}
                      {confirmando===m.firestoreId ? (
                        <div style={{display:"flex",gap:"4px"}}>
                          <button
                            style={{padding:"4px 8px",background:t.colors.redSoft,border:`1px solid ${t.colors.redBorder}`,borderRadius:t.radius.sm,fontSize:"10px",fontWeight:t.fonts.weightBold,color:t.colors.red,cursor:"pointer"}}
                            onClick={()=>eliminar(m.firestoreId)}
                          >Confirmar</button>
                          <button
                            style={{padding:"4px 8px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.sm,fontSize:"10px",cursor:"pointer",color:t.colors.textSecondary}}
                            onClick={()=>setConfirmando(null)}
                          >Cancelar</button>
                        </div>
                      ) : (
                        <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}} onClick={()=>setConfirmando(m.firestoreId)}>
                          <Trash2 size={14} color={t.colors.red} strokeWidth={1.8}/>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}

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
  cardTitulo: { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:0 },
  kpiCard:    { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"14px", boxShadow:t.shadows.card, border:`1.5px solid ${t.colors.border}` },
  kpiLabel:   { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.05em" },
  kpiVal:     { fontSize:"20px", fontWeight:t.fonts.weightBold, margin:0 },
};

export default HistorialMant;