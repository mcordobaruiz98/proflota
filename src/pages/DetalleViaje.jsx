import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Fuel, Route, Receipt, TrendingUp, Package } from "lucide-react";
import { theme as t } from "../styles/theme";

function DetalleViaje({ viajes = [], onEliminar }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const viaje = viajes.find(v => String(v.firestoreId) === String(id));

  const fmt = (n) => "$" + Math.round(n||0).toLocaleString("es-CO");
  const fnD = (n,d) => (Math.round((n||0)*Math.pow(10,d))/Math.pow(10,d)).toLocaleString("es-CO",{maximumFractionDigits:d});

  const eliminarViaje = async () => {
    if (!window.confirm("¿Eliminar este viaje?")) return;
    await onEliminar(viaje.firestoreId);
    navigate(-1);
  };

  if (!viaje) {
    return (
      <div style={styles.pantalla}>
        <div style={styles.header}>
          <button style={styles.btnVolver} onClick={()=>navigate(-1)}>
            <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
            <span>Volver</span>
          </button>
        </div>
        <div style={{textAlign:"center",padding:"60px 20px",color:t.colors.textSecondary}}>
          <p>Viaje no encontrado.</p>
        </div>
      </div>
    );
  }

  const margen      = viaje.mrg || 0;
  const margenColor = margen>=40?t.colors.green:margen>=20?t.colors.amber:t.colors.red;
  const positivo    = (viaje.neta||0) >= 0;

  const gastos = [
    {label:"ACPM",               valor:viaje.cAcpm,     detalle:viaje.gTot?`${fnD(viaje.gTot,1)} gal`:null, color:"#3B82F6"},
    {label:"Adblue",             valor:viaje.cAdbl,     detalle:viaje.adlt?`${fnD(viaje.adlt,1)} lt`:null,  color:"#8B5CF6"},
    {label:"Peajes",             valor:viaje.peajes,    detalle:null,                                        color:t.colors.amber},
    {label:"Conductor", valor:viaje.conductor, detalle:viaje.pcond&&viaje.pcond<=100?`${viaje.pcond}%`:null, color:t.colors.green},
    {label:"Carpado/Descarpado", valor:viaje.carp,      detalle:null,                                        color:"#06B6D4"},
    {label:"Gastos de viaje",    valor:viaje.gv2,       detalle:null,                                        color:"#EC4899"},
    {label:"Otros gastos",       valor:viaje.extras,    detalle:null,                                        color:t.colors.textTertiary},
    {label:"Retencion en la fuente", valor:viaje.descuentos?.retefuente ||0, detalle:null, color:t.colors.red},
    {label:"Reteica",            valor:viaje.descuentos?.reteica ||0, detalle:null, color:t.colors.red},
    {label:"FOPAT",              valor:viaje.descuentos?.fopat ||0, detalle:null, color:t.colors.red},
    {label:viaje.descuentos?.nombreOtro||"Otro descuento", valor:viaje.descuentos?.otro||0, detalle:null, color:t.colors.red},
  ].filter(g=>g.valor>0);

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <button style={styles.btnEliminar} onClick={eliminarViaje}>
          <Trash2 size={18} color={t.colors.red} strokeWidth={2} />
        </button>
      </div>

      {/* HERO */}
      <div style={styles.hero}>
        <p style={styles.heroRuta}>{viaje.ruta||"Sin ruta"}</p>
        <div style={styles.heroPills}>
          {viaje.fecha&&<span style={styles.pill}>📅 {viaje.fecha}</span>}
          {viaje.placa&&<span style={styles.pill}>🚚 {viaje.placa}</span>}
          {viaje.emp&&<span style={styles.pill}>👤{viaje.condNom}</span>}
          {viaje.mani&&<span style={styles.pill}>📄 Man. {viaje.mani}</span>}
          {viaje.emp&&<span style={styles.pill}>🏢 {viaje.emp}</span>}
          
        </div>
      </div>

      <div style={styles.contenido}>

        {/* MÉTRICAS KPI */}
        <div style={styles.dosColumnas}>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Valor viaje</p>
            <p style={{...styles.kpiVal, color:t.colors.blue}}>{fmt(viaje.vViaje)}</p>
          </div>
          <div style={{...styles.kpiCard, background:positivo?t.colors.greenSoft:t.colors.redSoft, border:`1.5px solid ${positivo?t.colors.greenBorder:t.colors.redBorder}`}}>
            <p style={styles.kpiLabel}>Ganancia neta</p>
            <p style={{...styles.kpiVal, color:positivo?t.colors.green:t.colors.red}}>{fmt(viaje.neta)}</p>
          </div>
        </div>
        <div style={styles.dosColumnas}>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Total gastos</p>
            <p style={{...styles.kpiVal, color:t.colors.red}}>{fmt(viaje.total)}</p>
          </div>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Margen neto</p>
            <p style={{...styles.kpiVal, color:margenColor}}>{margen.toFixed(1)}%</p>
            <div style={{height:"4px",borderRadius:"2px",background:t.colors.bgSection,overflow:"hidden",marginTop:"8px"}}>
              <div style={{height:"100%",borderRadius:"2px",background:margenColor,width:`${Math.min(margen,100)}%`}} />
            </div>
          </div>
        </div>

        {/* DESGLOSE */}
        {gastos.length>0&&(
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Receipt size={16} color={t.colors.blue} strokeWidth={2} />
              <p style={styles.cardTitulo}>Desglose de gastos</p>
            </div>
            {gastos.map((g,i,arr)=>(
              <div key={g.label} style={{...styles.fila,borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{width:"28px",height:"28px",borderRadius:"50%",background:g.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <div style={{width:"8px",height:"8px",borderRadius:"50%",background:g.color}} />
                  </div>
                  <div>
                    <span style={styles.filaLabel}>{g.label}</span>
                    {g.detalle&&<span style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary}}> · {g.detalle}</span>}
                  </div>
                </div>
                <span style={styles.filaValor}>{fmt(g.valor)}</span>
              </div>
            ))}
          </div>
        )}

        {/* INDICADORES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <TrendingUp size={16} color={t.colors.blue} strokeWidth={2} />
            <p style={styles.cardTitulo}>Indicadores del viaje</p>
          </div>
          <div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}>
            <span style={styles.filaLabel}>Recorrido total</span>
            <span style={styles.filaValor}>{viaje.kmT?viaje.kmT.toLocaleString("es-CO")+" km":"—"}</span>
          </div>
          <div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}>
            <span style={styles.filaLabel}>Costo por km</span>
            <span style={styles.filaValor}>{viaje.kmT&&viaje.total?fmt(viaje.total/viaje.kmT)+"/km":"—"}</span>
          </div>
          <div style={{...styles.fila,borderBottom:"none"}}>
            <span style={styles.filaLabel}>Tonelaje</span>
            <span style={styles.filaValor}>{viaje.ton?fnD(viaje.ton,2)+" ton":"—"}</span>
          </div>
        </div>

        {/* CARGA */}
        {(viaje.carga||viaje.prod||viaje.condNom||viaje.contactoEmpresa||viaje.celularEmpresa)&&(
        <div style={styles.card}>
            <div style={styles.cardHeader}>
             <Package size={16} color={t.colors.blue} strokeWidth={2} />
            <p style={styles.cardTitulo}>Datos del viaje</p>
          </div>
          {viaje.carga&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Tipo de carga</span><span style={styles.filaValor}>{viaje.carga}</span></div>}
          {viaje.prod&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Producto</span><span style={styles.filaValor}>{viaje.prod}</span></div>}
          {viaje.condNom&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Conductor</span><span style={styles.filaValor}>{viaje.condNom}</span></div>}
          {viaje.contactoEmpresa&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Contacto empresa</span><span style={styles.filaValor}>{viaje.contactoEmpresa}</span></div>}
          {viaje.celularEmpresa&&<div style={{...styles.fila,borderBottom:"none"}}><span style={styles.filaLabel}>Celular contacto</span><a href={`tel:${viaje.celularEmpresa}`} style={{...styles.filaValor,color:t.colors.blue,textDecoration:"none"}}>{viaje.celularEmpresa}</a></div>}
        </div>
      )}

        {/* PEAJES */}
        {viaje.peajesDetalle&&viaje.peajesDetalle.length>0&&(
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Route size={16} color={t.colors.blue} strokeWidth={2} />
              <p style={styles.cardTitulo}>Peajes ({viaje.peajesDetalle.length})</p>
            </div>
            {viaje.peajesDetalle.map((p,i,arr)=>(
              <div key={i} style={{...styles.fila,borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div>
                  <span style={styles.filaLabel}>{p.n}</span>
                  <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary}}> · {p.d}</span>
                  {p.iv&&<span style={{fontSize:"10px",background:t.colors.greenSoft,color:t.colors.green,padding:"2px 6px",borderRadius:t.radius.full,marginLeft:"6px"}}>I+V</span>}
                </div>
                <span style={styles.filaValor}>{fmt(p.total)}</span>
              </div>
            ))}
          </div>
        )}

        {/* OTROS GASTOS */}
        {viaje.extrasList&&viaje.extrasList.length>0&&(
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Fuel size={16} color={t.colors.blue} strokeWidth={2} />
              <p style={styles.cardTitulo}>Otros gastos</p>
            </div>
            {viaje.extrasList.map((e,i,arr)=>(
              <div key={i} style={{...styles.fila,borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <span style={styles.filaLabel}>{e.n}</span>
                <span style={styles.filaValor}>{fmt(e.valor|| e.v || 0)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  pantalla:    { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary },
  header:      { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:   { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  btnEliminar: { background:t.colors.redSoft, border:`1.5px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, padding:"8px", cursor:"pointer", display:"flex", alignItems:"center" },
  hero:        { background:t.colors.bgCard, padding:"16px 20px", borderBottom:`1px solid ${t.colors.borderLight}` },
  heroRuta:    { fontSize:"20px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:"0 0 10px", letterSpacing:"-0.3px" },
  heroPills:   { display:"flex", flexWrap:"wrap", gap:"6px" },
  pill:        { fontSize:"11px", background:t.colors.bgSection, color:t.colors.textSecondary, padding:"4px 10px", borderRadius:t.radius.full },
  contenido:   { padding:"12px 16px 30px" },
  dosColumnas: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" },
  kpiCard:     { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"14px", boxShadow:t.shadows.card, border:`1.5px solid ${t.colors.border}` },
  kpiLabel:    { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.05em" },
  kpiVal:      { fontSize:"17px", fontWeight:t.fonts.weightBold, margin:0 },
  card:        { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"10px", boxShadow:t.shadows.card },
  cardHeader:  { display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" },
  cardTitulo:  { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:0 },
  fila:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0" },
  filaLabel:   { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary },
  filaValor:   { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
};

export default DetalleViaje;