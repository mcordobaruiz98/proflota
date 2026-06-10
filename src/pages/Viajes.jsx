import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, CheckCircle, AlertCircle } from "lucide-react";
import { theme as t } from "../styles/theme";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function Viajes({ viajes = [] }) {
  const navigate  = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtro,   setFiltro]   = useState("todos");

  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const fn  = (n,d) => (Math.round(n*Math.pow(10,d))/Math.pow(10,d)).toLocaleString("es-CO",{maximumFractionDigits:d});

  const hoy = new Date();

  const viajesFiltrados = [...viajes].reverse().filter(v => {
    const q = busqueda.toLowerCase();
    const coincide = !q ||
      (v.ruta||"").toLowerCase().includes(q) ||
      (v.placa||"").toLowerCase().includes(q) ||
      (v.mani||"").toLowerCase().includes(q);
    if (!coincide) return false;
    const f = new Date(v.fecha);
    if (filtro==="mes")    return f.getMonth()===hoy.getMonth() && f.getFullYear()===hoy.getFullYear();
    if (filtro==="semana") {
  const inicioSemana = new Date(hoy);
  const dia = hoy.getDay();
  const diff = dia === 0 ? 6 : dia - 1;
  inicioSemana.setDate(hoy.getDate() - diff);
  inicioSemana.setHours(0,0,0,0);
  return f >= inicioSemana;
}
    return true;
  });

  const agrupados = viajesFiltrados.reduce((grupos, viaje) => {
    const f = new Date(viaje.fecha);
    const et = `${MESES[f.getMonth()]} ${f.getFullYear()}`;
    const ex = grupos.find(g=>g.etiqueta===et);
    if (ex) ex.viajes.push(viaje);
    else grupos.push({etiqueta:et, viajes:[viaje]});
    return grupos;
  }, []);

if (cargando) return (
  <div style={styles.pantalla}>
    <div style={{padding:"16px"}}>
      <SkeletonCard filas={4}/>
      <SkeletonCard filas={4}/>
    </div>
  </div>
);

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <p style={styles.headerSub}>Historial completo</p>
          <h1 style={styles.titulo}>Viajes</h1>
        </div>
        <button style={styles.btnNuevo} onClick={()=>navigate("/calculadora")}>
          <Plus size={16} color="#fff" strokeWidth={2.5} />
          Nuevo
        </button>
      </div>

      {/* BUSCADOR */}
      <div style={styles.buscadorWrap}>
        <Search size={16} color={t.colors.textTertiary} style={{flexShrink:0}} />
        <input
          type="text"
          placeholder="Buscar por placa, ruta o manifiesto..."
          value={busqueda}
          onChange={e=>setBusqueda(e.target.value)}
          style={styles.buscadorInput}
        />
      </div>

      {/* CHIPS */}
      <div style={styles.chips}>
        {[{id:"todos",label:"Todos"},{id:"mes",label:"Este mes"},{id:"semana",label:"Esta semana"}].map(f=>(
          <button
            key={f.id}
            style={{...styles.chip, ...(filtro===f.id?styles.chipActivo:{})}}
            onClick={()=>setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ESTADO VACÍO */}
      {viajes.length === 0 && (
        <div style={styles.vacio}>
          <p style={{fontSize:"36px", marginBottom:"10px"}}>🗺️</p>
          <p style={styles.vacioTexto}>Sin viajes registrados</p>
          <p style={styles.vacioSub}>Usa la calculadora para registrar tu primer viaje.</p>
          <button style={styles.btnCalcular} onClick={()=>navigate("/calculadora")}>
            Calcular flete
          </button>
        </div>
      )}

      {viajes.length > 0 && viajesFiltrados.length === 0 && (
        <div style={styles.vacio}>
          <p style={{fontSize:"36px", marginBottom:"10px"}}>🔍</p>
          <p style={styles.vacioTexto}>Sin resultados</p>
          <p style={styles.vacioSub}>No hay viajes que coincidan con "{busqueda}"</p>
        </div>
      )}

      {/* LISTA AGRUPADA */}
      <div style={styles.lista}>
        {agrupados.map(grupo => {
          const netaGrupo = grupo.viajes.reduce((s,v)=>s+(v.neta||0),0);
          return (
            <div key={grupo.etiqueta}>
              <div style={styles.grupoHeader}>
                <p style={styles.grupoMes}>{grupo.etiqueta}</p>
                <p style={{...styles.grupoNeta, color:netaGrupo>=0?t.colors.green:t.colors.red}}>
                  {netaGrupo>=0?"+":""}{fmt(netaGrupo)}
                </p>
              </div>
              {grupo.viajes.map(viaje => {
                const ok = (viaje.mrg||0) >= 25;
                return (
                  <div
                    key={viaje.firestoreId}
                    style={styles.tarjeta}
                    onClick={()=>navigate(`/viaje/${viaje.firestoreId}`)}
                  >
                    {/* Indicador lateral */}
                    <div style={{...styles.indicador, background:ok?t.colors.green:t.colors.amber}} />

                    <div style={styles.tarjetaContenido}>
                      <div style={styles.tarjetaInfo}>
                        <p style={styles.tarjetaRuta}>{viaje.ruta||"Sin ruta"}</p>
                        <p style={styles.tarjetaMeta}>
                          {viaje.fecha||""}
                          {viaje.placa?` · ${viaje.placa}`:""}
                          {viaje.ton?` · ${fn(viaje.ton,1)} ton`:""}
                        </p>
                        <div style={styles.pills}>
                          {viaje.mani && <span style={styles.pill}>Man. {viaje.mani}</span>}
                          {viaje.mrg!==undefined && (
                            <span style={{...styles.pill, background:ok?t.colors.greenSoft:t.colors.amberSoft, color:ok?t.colors.green:t.colors.amber}}>
                              {viaje.mrg.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={styles.tarjetaDer}>
                        <p style={{...styles.tarjetaNeta, color:(viaje.neta||0)>=0?t.colors.green:t.colors.red}}>
                          {(viaje.neta||0)>=0?"+":""}{fmt(viaje.neta||0)}
                        </p>
                        <p style={styles.tarjetaFlete}>{fmt(viaje.vViaje||0)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

    </div>
  );
}

const styles = {
  pantalla:       { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"20px" },
  header:         { display:"flex", justifyContent:"space-between", alignItems:"flex-end", padding:"20px 20px 16px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  headerSub:      { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 2px", fontWeight:t.fonts.weightMedium, textTransform:"uppercase", letterSpacing:"0.06em" },
  titulo:         { fontSize:"22px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:0, letterSpacing:"-0.3px" },
  btnNuevo:       { display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer" },
  buscadorWrap:   { display:"flex", alignItems:"center", gap:"10px", margin:"12px 16px 0", background:t.colors.bgCard, border:`1.5px solid ${t.colors.border}`, borderRadius:t.radius.md, padding:"11px 14px", boxShadow:t.shadows.card },
  buscadorInput:  { flex:1, border:"none", outline:"none", fontSize:t.fonts.sizeSm, color:t.colors.textPrimary, background:"transparent" },
  chips:          { display:"flex", gap:"8px", padding:"10px 16px 4px" },
  chip:           { padding:"6px 14px", borderRadius:t.radius.full, border:`1.5px solid ${t.colors.border}`, background:t.colors.bgCard, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, cursor:"pointer" },
  chipActivo:     { background:t.colors.blue, color:"#fff", border:`1.5px solid ${t.colors.blue}` },
  vacio:          { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"50px 20px", textAlign:"center", margin:"12px 16px", boxShadow:t.shadows.card },
  vacioTexto:     { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 6px" },
  vacioSub:       { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 20px" },
  btnCalcular:    { padding:"12px 28px", background:t.colors.green, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer" },
  lista:          { padding:"4px 16px 16px" },
  grupoHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center", margin:"14px 0 8px" },
  grupoMes:       { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.07em", margin:0 },
  grupoNeta:      { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, margin:0 },
  tarjeta:        { background:t.colors.bgCard, borderRadius:t.radius.lg, marginBottom:"8px", display:"flex", overflow:"hidden", boxShadow:t.shadows.card, cursor:"pointer" },
  indicador:      { width:"4px", flexShrink:0 },
  tarjetaContenido:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 14px", flex:1 },
  tarjetaInfo:    { flex:1, minWidth:0 },
  tarjetaRuta:    { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  tarjetaMeta:    { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"3px 0 5px" },
  pills:          { display:"flex", gap:"4px", flexWrap:"wrap" },
  pill:           { fontSize:"10px", background:t.colors.bgSection, color:t.colors.textSecondary, padding:"2px 7px", borderRadius:t.radius.full },
  tarjetaDer:     { textAlign:"right", marginLeft:"10px", flexShrink:0 },
  tarjetaNeta:    { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, margin:0 },
  tarjetaFlete:   { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0" },
};

export default Viajes;