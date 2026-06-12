import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Droplets, Wind, Fuel, Filter, Thermometer, Droplet } from "lucide-react";
import { theme as t } from "../../styles/theme";

const TIPOS_FILTRO = [
  { id:"aceite",       label:"Filtro de aceite",       Icono:Droplets,     color:t.colors.amber },
  { id:"aire",         label:"Filtro de aire",         Icono:Wind,         color:t.colors.blue },
  { id:"combustible",  label:"Filtro de combustible",  Icono:Fuel,         color:t.colors.green },
  { id:"trampa",       label:"Trampa de combustible",  Icono:Filter,       color:t.colors.textSecondary },
  { id:"refrigerante", label:"Filtro de refrigerante", Icono:Thermometer,  color:t.colors.red },
  { id:"hidraulico",   label:"Filtro hidráulico",      Icono:Droplet,      color:"#3B82F6" },
];

function Filtros({ vehiculos, mostrarToast }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo   = vehiculos.find(v => String(v.firestoreId) === String(id));
  const claveLocal = `filtros_${id}`;

  const [historial, setHistorial] = useState(() => {
    const g = localStorage.getItem(claveLocal);
    return g ? JSON.parse(g) : [];
  });

  const [tipoFiltro,  setTipoFiltro]  = useState("aceite");
  const [marca,       setMarca]       = useState("");
  const [referencia,  setReferencia]  = useState("");
  const [kmCambio,    setKmCambio]    = useState("");
  const [fecha,       setFecha]       = useState(new Date().toISOString().slice(0,10));
  const [taller,      setTaller]      = useState("");
  const [costo,       setCosto]       = useState("");
  const [nota,        setNota]        = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando,   setGuardando]   = useState(false);

  const fmt = (n) => "$" + Math.round(n||0).toLocaleString("es-CO");

  const guardar = () => {
    if (!kmCambio) { mostrarToast("Ingresa el km del cambio","error"); return; }
    setGuardando(true);
    const nuevo = { id:Date.now(), tipo:tipoFiltro, marca, referencia, km:Number(kmCambio), fecha, taller, costo:Number(costo)||0, nota };
    const nuevos = [nuevo, ...historial];
    setHistorial(nuevos);
    localStorage.setItem(claveLocal, JSON.stringify(nuevos));
    setMarca(""); setReferencia(""); setKmCambio(""); setTaller(""); setCosto(""); setNota("");
    setMostrarForm(false);
    mostrarToast("Filtro registrado","exito");
    setGuardando(false);
  };

  const eliminar = (rid) => {
    const nuevos = historial.filter(r => r.id !== rid);
    setHistorial(nuevos);
    localStorage.setItem(claveLocal, JSON.stringify(nuevos));
    mostrarToast("Registro eliminado","info");
  };

  const IconoFiltro = ({ tipo, size = 18 }) => {
    const tf = TIPOS_FILTRO.find(x => x.id === tipo);
    if (!tf) return null;
    return (
      <div style={{width:"32px",height:"32px",borderRadius:t.radius.sm,background:t.colors.bgSection,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <tf.Icono size={size} color={tf.color} strokeWidth={1.8} />
      </div>
    );
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(/vehiculo/%{id}, {state:{tab: "mant"}})}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Filtros</h1>
      </div>

      <div style={styles.contenido}>

        {/* RESUMEN POR TIPO */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Último cambio por tipo</p>
          {TIPOS_FILTRO.map((tf,i,arr) => {
            const ult = historial.filter(r=>r.tipo===tf.id).sort((a,b)=>b.km-a.km)[0];
            return (
              <div key={tf.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <IconoFiltro tipo={tf.id} />
                  <div>
                    <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>{tf.label}</p>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  {ult ? (
                    <>
                      <p style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightSemibold,color:t.colors.textSecondary,margin:0}}>{ult.fecha}</p>
                      <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>{ult.km.toLocaleString("es-CO")} km</p>
                    </>
                  ) : (
                    <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:0}}>Sin registro</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTÓN AGREGAR */}
        {!mostrarForm && (
          <button
            style={{width:"100%",padding:"13px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",marginBottom:"10px"}}
            onClick={()=>setMostrarForm(true)}
          >
            + Registrar cambio de filtro
          </button>
        )}

        {/* FORMULARIO */}
        {mostrarForm && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Nuevo cambio de filtro</p>

            <div style={styles.campo}>
              <label style={styles.label}>Tipo de filtro</label>
              <select value={tipoFiltro} onChange={e=>setTipoFiltro(e.target.value)} style={styles.input}>
                {TIPOS_FILTRO.map(tf=><option key={tf.id} value={tf.id}>{tf.label}</option>)}
              </select>
            </div>

            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Marca</label>
                <input type="text" placeholder="Fleetguard, Mann..." value={marca}
                  onChange={e=>setMarca(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Referencia</label>
                <input type="text" placeholder="LF3349" value={referencia}
                  onChange={e=>setReferencia(e.target.value)} style={styles.input}/>
              </div>
            </div>

            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Km al cambiar</label>
                <input type="number" placeholder="145000" value={kmCambio}
                  onChange={e=>setKmCambio(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Fecha</label>
                <input type="date" value={fecha}
                  onChange={e=>setFecha(e.target.value)} style={styles.input}/>
              </div>
            </div>

            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Taller</label>
                <input type="text" placeholder="Nombre del taller" value={taller}
                  onChange={e=>setTaller(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Costo ($)</label>
                <input type="number" placeholder="45000" value={costo}
                  onChange={e=>setCosto(e.target.value)} style={styles.input}/>
              </div>
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Nota</label>
              <input type="text" placeholder="Observaciones" value={nota}
                onChange={e=>setNota(e.target.value)} style={styles.input}/>
            </div>

            <div style={{display:"flex",gap:"8px"}}>
              <button
                style={{flex:1,padding:"12px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",opacity:guardando?0.75:1}}
                onClick={guardar} disabled={guardando}
              >
                {guardando?"Guardando...":"Guardar"}
              </button>
              <button
                style={{padding:"12px 16px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.md,cursor:"pointer",color:t.colors.textSecondary,fontSize:t.fonts.sizeSm}}
                onClick={()=>setMostrarForm(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {historial.length > 0 && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Historial de filtros</p>
            {historial.map((r,i,arr) => {
              const tf = TIPOS_FILTRO.find(x=>x.id===r.tipo);
              return (
                <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"12px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                  <div style={{display:"flex",gap:"10px",flex:1}}>
                    <IconoFiltro tipo={r.tipo} size={16} />
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>
                        {tf?.label}
                      </p>
                      <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>
                        {r.fecha} · {r.km.toLocaleString("es-CO")} km
                        {r.marca?` · ${r.marca}`:""}
                        {r.referencia?` ${r.referencia}`:""}
                      </p>
                      {r.taller&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>{r.taller}</p>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginLeft:"10px"}}>
                    {r.costo>0&&<span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.red}}>{fmt(r.costo)}</span>}
                    <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}} onClick={()=>eliminar(r.id)}>
                      <Trash2 size={14} color={t.colors.red} strokeWidth={1.8}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
  cardTitulo: { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 12px" },
  campo:      { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"10px" },
  fila2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  label:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:      { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
};

export default Filtros;