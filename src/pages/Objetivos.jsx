import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Edit3, Save, X } from "lucide-react";
import { theme as t } from "../styles/theme";

function Objetivos({ viajes = [] }) {
  const navigate = useNavigate();

  const claves = { diaria:"meta_diaria", semanal:"meta_semanal", mensual:"meta_mensual_global" };
  const [metas, setMetas] = useState(() => ({
    diaria:  Number(localStorage.getItem(claves.diaria)) ||0,
    semanal: Number(localStorage.getItem(claves.semanal))||0,
    mensual: Number(localStorage.getItem(claves.mensual))||0,
  }));
  const [editando, setEditando] = useState(false);
  const [metaTemp, setMetaTemp] = useState({diaria:"",semanal:"",mensual:""});

  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");

  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate()-hoy.getDay());
  inicioSemana.setHours(0,0,0,0);

  const viajesHoy    = viajes.filter(v=>{const f=new Date(v.fecha);return f.getDate()===hoy.getDate()&&f.getMonth()===hoy.getMonth()&&f.getFullYear()===hoy.getFullYear();});
  const viajesSemana = viajes.filter(v=>new Date(v.fecha)>=inicioSemana);
  const viajesMes    = viajes.filter(v=>{const f=new Date(v.fecha);return f.getMonth()===hoy.getMonth()&&f.getFullYear()===hoy.getFullYear();});

  const netaHoy    = viajesHoy.reduce((s,v)=>s+(v.neta||0),0);
  const netaSemana = viajesSemana.reduce((s,v)=>s+(v.neta||0),0);
  const netaMes    = viajesMes.reduce((s,v)=>s+(v.neta||0),0);

  const calcPct    = (actual,meta) => meta>0?Math.min((actual/meta)*100,100):0;
  const colorPct   = (pct) => pct>=100?t.colors.green:pct>=50?t.colors.amber:t.colors.red;

  const abrirEditar = () => {
    setMetaTemp({
      diaria:  metas.diaria >0?String(metas.diaria) :"",
      semanal: metas.semanal>0?String(metas.semanal):"",
      mensual: metas.mensual>0?String(metas.mensual):"",
    });
    setEditando(true);
  };

  const guardar = () => {
    const nuevas = {diaria:Number(metaTemp.diaria)||0, semanal:Number(metaTemp.semanal)||0, mensual:Number(metaTemp.mensual)||0};
    setMetas(nuevas);
    localStorage.setItem(claves.diaria,  nuevas.diaria);
    localStorage.setItem(claves.semanal, nuevas.semanal);
    localStorage.setItem(claves.mensual, nuevas.mensual);
    setEditando(false);
  };

  const periodos = [
    {icono:"⭐", titulo:"Hoy",        neta:netaHoy,    viajes:viajesHoy.length,    meta:metas.diaria},
    {icono:"📅", titulo:"Esta semana",neta:netaSemana, viajes:viajesSemana.length, meta:metas.semanal},
    {icono:"🗓️", titulo:"Este mes",   neta:netaMes,    viajes:viajesMes.length,    meta:metas.mensual},
  ];

  return (
    <div style={styles.pantalla}>

      <div style={styles.header}>
        <div>
          <p style={styles.headerSub}>Metas de ganancia</p>
          <h1 style={styles.titulo}>Objetivos</h1>
        </div>
        <button style={styles.btnEditar} onClick={abrirEditar}>
          <Edit3 size={14} color={t.colors.blue} strokeWidth={2} />
          Editar metas
        </button>
      </div>

      <div style={styles.contenido}>

        {/* FORMULARIO */}
        {editando&&(
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Metas de ganancia neta</p>
            <div style={styles.fila3}>
              {[{k:"diaria",label:"Diario"},{k:"semanal",label:"Semanal"},{k:"mensual",label:"Mensual"}].map(f=>(
                <div key={f.k} style={styles.campo}>
                  <label style={styles.label}>{f.label}</label>
                  <input type="number" placeholder="0" value={metaTemp[f.k]}
                    onChange={e=>setMetaTemp({...metaTemp,[f.k]:e.target.value})}
                    style={styles.input} />
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
              <button style={styles.btnGuardar} onClick={guardar}>
                <Save size={14} color="#fff" /> Guardar
              </button>
              <button style={styles.btnCancelar} onClick={()=>setEditando(false)}>
                <X size={14} color={t.colors.textSecondary} /> Cancelar
              </button>
            </div>
          </div>
        )}

        {/* CARDS */}
        {periodos.map(p=>{
          const pct   = calcPct(p.neta,p.meta);
          const color = colorPct(pct);
          return (
            <div key={p.titulo} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.cardTopIzq}>
                  <span style={styles.cardIcono}>{p.icono}</span>
                  <p style={styles.cardTituloP}>{p.titulo}</p>
                </div>
                {p.meta>0&&(
                  <p style={styles.cardMeta}>Meta: <span style={{fontWeight:t.fonts.weightBold,color:t.colors.textPrimary}}>{fmt(p.meta)}</span></p>
                )}
              </div>

              <p style={{fontSize:"28px",fontWeight:t.fonts.weightBlack,margin:"8px 0 12px",color:p.neta>=0?t.colors.green:t.colors.red}}>
                {fmt(p.neta)}
              </p>

              {p.meta>0?(
                <>
                  <div style={{height:"6px",borderRadius:"3px",background:t.colors.bgSection,overflow:"hidden",marginBottom:"8px"}}>
                    <div style={{height:"100%",borderRadius:"3px",background:color,width:`${pct}%`,transition:"width 0.4s ease"}} />
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>
                      {p.viajes} viaje{p.viajes!==1?"s":""}
                    </span>
                    <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color}}>
                      {pct.toFixed(0)}%{pct>=100?" 🎉":""}
                    </span>
                  </div>
                </>
              ):(
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>
                    {p.viajes} viaje{p.viajes!==1?"s":""}
                  </span>
                  <button style={styles.btnDefinirMeta} onClick={abrirEditar}>
                    + Definir meta
                  </button>
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}

const styles = {
  pantalla:       { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary },
  header:         { display:"flex", justifyContent:"space-between", alignItems:"flex-end", padding:"20px 20px 16px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  headerSub:      { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 2px", fontWeight:t.fonts.weightMedium, textTransform:"uppercase", letterSpacing:"0.06em" },
  titulo:         { fontSize:"22px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:0, letterSpacing:"-0.3px" },
  btnEditar:      { display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", background:t.colors.blueSoft, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.blue, cursor:"pointer" },
  contenido:      { padding:"12px 16px 30px" },
  card:           { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"12px", boxShadow:t.shadows.card },
  cardTitulo:     { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 14px" },
  fila3:          { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"4px" },
  campo:          { display:"flex", flexDirection:"column", gap:"5px" },
  label:          { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:          { padding:"10px 10px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
  btnGuardar:     { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"10px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, cursor:"pointer" },
  btnCancelar:    { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"10px", background:"none", color:t.colors.textSecondary, border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, cursor:"pointer" },
  cardTop:        { display:"flex", justifyContent:"space-between", alignItems:"center" },
  cardTopIzq:     { display:"flex", alignItems:"center", gap:"8px" },
  cardIcono:      { fontSize:"20px" },
  cardTituloP:    { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0 },
  cardMeta:       { fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:0 },
  btnDefinirMeta: { fontSize:t.fonts.sizeXs, color:t.colors.blue, background:t.colors.blueSoft, border:`1px solid ${t.colors.blueBorder}`, borderRadius:t.radius.sm, padding:"4px 10px", cursor:"pointer", fontWeight:t.fonts.weightSemibold },
};

export default Objetivos;