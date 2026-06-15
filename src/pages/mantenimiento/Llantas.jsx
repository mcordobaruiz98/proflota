import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { theme as t } from "../../styles/theme";
 
const CONFIGS_VEHICULO = {
  "TURBO SENCILLO":    { total: 4,  label: "Turbo 4 llantas" },
  "SENCILLO":          { total: 6,  label: "Sencillo" },
  "TURBO":             { total: 6,  label: "Turbo" },
  "DOBLETROQUE":       { total: 10, label: "Dobletroque" },
  "PATINETA 2S2":      { total: 14, label: "Patineta 2S2" },
  "PATINETA 2S3":      { total: 18, label: "Patineta 2S3" },
  "TRACTOMULA 3S2":    { total: 18, label: "Tractomula 3S2" },
  "TRACTOMULA 3S3":    { total: 22, label: "Tractomula 3S3" },
};
 
const POSICIONES = {
  4:  ["Del. izq","Del. der","Tras. izq","Tras. der"],
  6:  ["Del. izq","Del. der","Tras. izq int","Tras. izq ext","Tras. der int","Tras. der ext"],
  10: ["Del. izq","Del. der","Med. izq int","Med. izq ext","Med. der int","Med. der ext","Tras. izq int","Tras. izq ext","Tras. der int","Tras. der ext"],
  14: ["Del. izq","Del. der","Trac. izq int","Trac. izq ext","Trac. der int","Trac. der ext","Rem1. izq int","Rem1. izq ext","Rem1. der int","Rem1. der ext","Rem2. izq int","Rem2. izq ext","Rem2. der int","Rem2. der ext"],
  18: ["Del. izq","Del. der","Trac1. izq int","Trac1. izq ext","Trac1. der int","Trac1. der ext","Trac2. izq int","Trac2. izq ext","Trac2. der int","Trac2. der ext","Rem1. izq int","Rem1. izq ext","Rem1. der int","Rem1. der ext","Rem2. izq int","Rem2. izq ext","Rem2. der int","Rem2. der ext"],
  22: ["Del. izq","Del. der","Trac1. izq int","Trac1. izq ext","Trac1. der int","Trac1. der ext","Trac2. izq int","Trac2. izq ext","Trac2. der int","Trac2. der ext","Rem1. izq int","Rem1. izq ext","Rem1. der int","Rem1. der ext","Rem2. izq int","Rem2. izq ext","Rem2. der int","Rem2. der ext","Rem3. izq int","Rem3. izq ext","Rem3. der int","Rem3. der ext"],
};
 
function estadoColor(e) {
  return e==="nueva"?"#0E7490":e==="ok"?"#16A34A":e==="warn"?"#D97706":"#DC2626";
}
 
function DiagramaLlantas({ total, llantas, onSelect, llantaActiva }) {
  const ejesPorTotal = {
    4:  [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:30},{n:4,x:170}] ],
    6:  [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}] ],
    10: [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}], [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}] ],
    14: [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}], [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}], [{n:11,x:18},{n:12,x:35},{n:13,x:165},{n:14,x:182}] ],
    18: [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}], [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}], [{n:11,x:18},{n:12,x:35},{n:13,x:165},{n:14,x:182}], [{n:15,x:18},{n:16,x:35},{n:17,x:165},{n:18,x:182}] ],
    22: [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}], [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}], [{n:11,x:18},{n:12,x:35},{n:13,x:165},{n:14,x:182}], [{n:15,x:18},{n:16,x:35},{n:17,x:165},{n:18,x:182}], [{n:19,x:18},{n:20,x:35},{n:21,x:165},{n:22,x:182}] ],
  };
 
  const ejes   = ejesPorTotal[total] || ejesPorTotal[6];
  const altura = 60 + ejes.length * 60;
  const yBase  = 40;
  const paso   = 60;
 
  return (
    <svg width="200" height={altura} viewBox={`0 0 200 ${altura}`} style={{display:"block",margin:"0 auto"}}>
  <rect x="65" y="10" width="70" height={altura-20} rx="6"
    fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1"/>
  {ejes.map((eje, ei) => {
    const y = yBase + ei * paso;
    return (
      <g key={ei}>
        <line x1="20" x2="180" y1={y} y2={y} stroke="#D1D5DB" strokeWidth="1.5"/>
        {eje.map(l => {
          const datos  = llantas[l.n] || {};
          const color  = estadoColor(datos.estado || "ok");
          const activo = llantaActiva === l.n;
          const lw     = l.n <= 2 ? 10 : 8;
          const lh     = l.n <= 2 ? 22 : 20;
          return (
            <g key={l.n} onClick={()=>onSelect(l.n)} style={{cursor:"pointer"}}>
              <rect
                x={l.x - lw/2} y={y - lh/2}
                width={lw} height={lh} rx="2"
                fill={color}
                stroke={activo ? "#fff" : "none"}
                strokeWidth="2"
              />
              <text
                x={l.x > 100 ? l.x + 4 : l.x - 4}
                y={y + 4}
                textAnchor={l.x > 100 ? "start" : "end"}
                fontSize="9"
                fontWeight="500"
                fill="#000000"
              >
                {l.n}
              </text>
            </g>
          );
        })}
      </g>
    );
  })}
</svg>
  );
}
 
function Llantas({ vehiculos, onAgregar, mostrarToast, onEditarVehiculo }) {
  const navigate = useNavigate();
  const { id }   = useParams();
 
  const vehiculo   = vehiculos.find(v => String(v.firestoreId) === String(id));
  const tipoVeh    = vehiculo?.tipoVehiculo?.toUpperCase() || "";
  const cfgVeh     = CONFIGS_VEHICULO[tipoVeh] || { total: 6, label: tipoVeh };
  const totalLl    = cfgVeh.total;
  const posiciones = POSICIONES[totalLl] || [];
 
  const [llantas,   setLlantas]   = useState(vehiculo?.llantasData || {});
  const [seleccionada, setSeleccionada] = useState(null);
  const [guardando,    setGuardando]    = useState(false);
 
  const [marca,  setMarca]  = useState("");
  const [ref,    setRef]    = useState("");
  const [prof,   setProf]   = useState("");
  const [kmMont, setKmMont] = useState("");
  const [estado, setEstado] = useState("ok");
  const [obs,    setObs]    = useState("");
 
  const guardarLocal = (nuevas) => {
    onEditarVehiculo(vehiculo.firestoreId, { llantasData: nuevas }).catch(()=>{});
  };
 
  const abrirDetalle = (n) => {
    setSeleccionada(n);
    const d = llantas[n] || {};
    setMarca(d.marca||""); setRef(d.ref||"");
    setProf(d.prof||""); setKmMont(d.km||"");
    setEstado(d.estado||"ok"); setObs(d.obs||"");
  };
 
  const guardarLlanta = () => {
    const nuevas = {
      ...llantas,
      [seleccionada]: { marca, ref, prof, km: kmMont, estado, obs }
    };
    setLlantas(nuevas);
    guardarLocal(nuevas);
    setSeleccionada(null);
    mostrarToast("Llanta guardada","exito");
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
        <h1 style={styles.titulo}>Llantas</h1>
      </div>
 
      <div style={styles.contenido}>
 
        {/* INFO VEHÍCULO */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Vehículo</p>
          <p style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0}}>{vehiculo.placa}</p>
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"2px 0 0"}}>{cfgVeh.label} · {totalLl} llantas</p>
        </div>
 
        {/* DIAGRAMA */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Toca una llanta para editar</p>
          <DiagramaLlantas
            total={totalLl}
            llantas={llantas}
            onSelect={abrirDetalle}
            llantaActiva={seleccionada}
          />
          <div style={{display:"flex", gap:"12px", marginTop:"12px", flexWrap:"wrap", justifyContent:"center"}}>
            {[{e:"nueva",l:"Nueva",c:"#0E7490"},{e:"ok",l:"Buena",c:"#16A34A"},{e:"warn",l:"Desgastada",c:"#D97706"},{e:"bad",l:"Cambiar",c:"#DC2626"}].map(s=>(
              <span key={s.e} style={{display:"flex",alignItems:"center",gap:"4px",fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>
                <span style={{width:"10px",height:"10px",borderRadius:"50%",background:s.c,display:"inline-block"}}/>
                {s.l}
              </span>
            ))}
          </div>
        </div>
 
        {/* DETALLE LLANTA */}
        {seleccionada && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>
              Llanta {seleccionada} — {posiciones[seleccionada-1]||""}
            </p>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Marca</label>
                <input type="text" placeholder="Michelin, Bridgestone..." value={marca}
                  onChange={e=>setMarca(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Referencia</label>
                <input type="text" placeholder="295/80 R22.5" value={ref}
                  onChange={e=>setRef(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Profundidad (mm)</label>
                <input type="text" placeholder="15mm" value={prof}
                  onChange={e=>setProf(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Km al montar</label>
                <input type="number" placeholder="120000" value={kmMont}
                  onChange={e=>setKmMont(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Estado</label>
              <select value={estado} onChange={e=>setEstado(e.target.value)} style={styles.input}>
                <option value="nueva">Nueva</option>
                <option value="ok">Buena</option>
                <option value="warn">Desgastada</option>
                <option value="bad">Cambiar — requiere reemplazo</option>
              </select>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Observaciones</label>
              <input type="text" placeholder="Reparada, pinchada, etc." value={obs}
                onChange={e=>setObs(e.target.value)} style={styles.input}/>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button
                style={{flex:1,padding:"12px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}
                onClick={guardarLlanta}
              >
                <Save size={16} color="#fff" strokeWidth={2}/>
                Guardar
              </button>
              <button
                style={{padding:"12px 16px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.md,cursor:"pointer",color:t.colors.textSecondary,fontSize:t.fonts.sizeSm}}
                onClick={()=>setSeleccionada(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
 
        {/* TABLA RESUMEN */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Resumen de llantas</p>
          {Array.from({length:totalLl},(_,i)=>i+1).map((n,i,arr)=>{
            const d = llantas[n]||{};
            const color = estadoColor(d.estado||"ok");
            const estadoLabel = d.estado==="nueva"?"Nueva":d.estado==="warn"?"Desgastada":d.estado==="bad"?"Cambiar":"Buena";
            return (
              <div key={n}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`,cursor:"pointer"}}
                onClick={()=>abrirDetalle(n)}
              >
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{width:"10px",height:"10px",borderRadius:"50%",background:color,flexShrink:0}}/>
                  <div>
                    <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>
                      Llanta {n} — {posiciones[n-1]||""}
                    </p>
                    {d.marca&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>{d.marca}{d.ref?` · ${d.ref}`:""}</p>}
                  </div>
                </div>
                <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightSemibold,color,whiteSpace:"nowrap"}}>{estadoLabel}</span>
              </div>
            );
          })}
        </div>
 
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
 
export default Llantas;