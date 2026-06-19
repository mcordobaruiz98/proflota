import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { theme as t } from "../../styles/theme";

const EJES_POR_VEHICULO = {
  "TURBO SENCILLO":  ["Eje delantero","Eje trasero"],
  "SENCILLO":        ["Eje delantero","Eje trasero"],
  "TURBO":           ["Eje delantero","Eje trasero"],
  "DOBLETROQUE":     ["Eje delantero","Eje medio","Eje trasero"],
  "CUATRO MANOS":    ["Eje delantero","Eje trasero"],
  "VOLQUETA":        ["Eje delantero","Eje medio","Eje trasero"],
  "PATINETA 2S2":    ["Eje delantero izq","Eje delantero der","Eje tracción 1 izq","Eje tracción 1 der","Eje remolque 1 izq","Eje remolque 1 der","Eje remolque 2 izq","Eje remolque 2 der"],
  "PATINETA 2S3":    ["Eje delantero izq","Eje delantero der","Eje tracción 1 izq","Eje tracción 1 der","Eje remolque 1 izq","Eje remolque 1 der","Eje remolque 2 izq","Eje remolque 2 der","Eje remolque 3 izq","Eje remolque 3 der"],
  "TRACTOMULA 3S2":  ["Eje delantero izq","Eje delantero der","Eje tracción 1 izq","Eje tracción 1 der","Eje tracción 2 izq","Eje tracción 2 der","Eje remolque 1 izq","Eje remolque 1 der","Eje remolque 2 izq","Eje remolque 2 der"],
  "TRACTOMULA 3S3":  ["Eje delantero izq","Eje delantero der","Eje tracción 1 izq","Eje tracción 1 der","Eje tracción 2 izq","Eje tracción 2 der","Eje remolque 1 izq","Eje remolque 1 der","Eje remolque 2 izq","Eje remolque 2 der","Eje remolque 3 izq","Eje remolque 3 der"],
};

const ESTADOS = [
  { value:"nuevo",      label:"Nuevo",            color:t.colors.blue   },
  { value:"bueno",      label:"Bueno",            color:t.colors.green  },
  { value:"desgastado", label:"Desgastado",       color:t.colors.amber  },
  { value:"cambiar",    label:"Cambiar urgente",  color:t.colors.red    },
];

function DiagramaFrenas({ ejes, estadoEjes, onSelect, ejeActivo, tipoVehiculo }) {
  const tipo = (tipoVehiculo || "").toUpperCase();
  const esTractomula = tipo.includes("TRACTOMULA") || tipo.includes("PATINETA");
  const colorEstado = (e) => ESTADOS.find(x=>x.value===e)?.color || "#475569";

  if (esTractomula) {
    // Agrupar pares izq/der en ejes visuales
    const paresCab = [];
    const paresTrl = [];
    for (let i = 0; i < ejes.length; i += 2) {
      const par = { izq: ejes[i], der: ejes[i+1] };
      if (ejes[i].includes("remolque")) paresTrl.push(par);
      else paresCab.push(par);
    }

    const paso = 55;
    const cabAltura = 30 + paresCab.length * paso + 10;
    const enganY = cabAltura + 20;
    const trlStartY = enganY + 30;
    const trlAltura = paresTrl.length * paso + 20;
    const totalAltura = trlStartY + trlAltura + 10;

    const renderPad = (eje, x, y, side) => {
      const d = estadoEjes[eje] || {};
      const color = d.estado ? colorEstado(d.estado) : "#475569";
      const activo = ejeActivo === eje;
      return (
        <g key={eje} onClick={()=>onSelect(eje)} style={{cursor:"pointer"}}>
          <rect x={x-7} y={y-10} width="14" height="20" rx="3"
            fill={color} fillOpacity="0.8"
            stroke={activo?"#fff":color} strokeWidth={activo?2.5:1}
            filter={activo?"drop-shadow(0 0 4px rgba(255,255,255,0.4))":"none"} />
          <rect x={x-3} y={y-6} width="6" height="12" rx="1.5"
            fill="rgba(0,0,0,0.2)"/>
          <text x={side==="izq"?x-14:x+14} y={y+3} textAnchor={side==="izq"?"end":"start"}
            fontSize="7" fill="#94A3B8" fontWeight="600">
            {side==="izq"?"IZQ":"DER"}
          </text>
        </g>
      );
    };

    const renderEjes = (pares, yBase) => pares.map((par, i) => {
      const y = yBase + i * paso;
      return (
        <g key={i}>
          <line x1="25" x2="175" y1={y} y2={y} stroke="#2A5A8F" strokeWidth="1.5"/>
          {renderPad(par.izq, 32, y, "izq")}
          {renderPad(par.der, 168, y, "der")}
        </g>
      );
    });

    return (
      <svg width="200" height={totalAltura} viewBox={`0 0 200 ${totalAltura}`} style={{display:"block",margin:"0 auto"}}>
        <defs>
          <linearGradient id="cabGradF" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E3A5F"/><stop offset="100%" stopColor="#0F2340"/>
          </linearGradient>
          <linearGradient id="trlGradF" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#162D4A"/><stop offset="100%" stopColor="#0D1B2F"/>
          </linearGradient>
        </defs>
        {/* CABEZOTE */}
        <rect x="68" y="8" width="64" height={cabAltura-8} rx="8" fill="url(#cabGradF)" stroke="#2A5A8F" strokeWidth="1.5"/>
        <rect x="72" y="10" width="56" height="24" rx="6" fill="#1565FF" fillOpacity="0.15" stroke="#1565FF" strokeWidth="0.8"/>
        <rect x="58" y="14" width="8" height="4" rx="1.5" fill="#2A5A8F"/>
        <rect x="134" y="14" width="8" height="4" rx="1.5" fill="#2A5A8F"/>
        <text x="100" y={cabAltura-4} textAnchor="middle" fontSize="8" fill="#4A6A8F" fontWeight="600">CABEZOTE</text>
        {renderEjes(paresCab, 50)}
        {/* ENGANCHE */}
        <line x1="90" x2="110" y1={enganY} y2={enganY} stroke="#2A5A8F" strokeWidth="2"/>
        <circle cx="100" cy={enganY} r="6" fill="#0F2340" stroke="#1565FF" strokeWidth="1.5"/>
        <circle cx="100" cy={enganY} r="2" fill="#1565FF"/>
        {/* TRAILER */}
        <rect x="62" y={trlStartY-10} width="76" height={trlAltura+10} rx="6" fill="url(#trlGradF)" stroke="#2A5A8F" strokeWidth="1.5"/>
        <text x="100" y={trlStartY} textAnchor="middle" fontSize="8" fill="#4A6A8F" fontWeight="600">TRAILER</text>
        {renderEjes(paresTrl, trlStartY + 18)}
      </svg>
    );
  }

  // Vehículo sencillo
  const altura = 60 + ejes.length * 60;
  return (
    <svg width="200" height={altura} viewBox={`0 0 200 ${altura}`} style={{display:"block",margin:"0 auto"}}>
      <defs>
        <linearGradient id="chasisGradF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E3A5F"/><stop offset="100%" stopColor="#0F2340"/>
        </linearGradient>
      </defs>
      <rect x="68" y="10" width="64" height={altura-20} rx="8" fill="url(#chasisGradF)" stroke="#2A5A8F" strokeWidth="1.5"/>
      <rect x="75" y="12" width="50" height="20" rx="4" fill="#1565FF" fillOpacity="0.15" stroke="#1565FF" strokeWidth="0.8"/>
      {ejes.map((eje, i) => {
        const y = 40 + i * 60;
        const d = estadoEjes[eje] || {};
        const color = d.estado ? colorEstado(d.estado) : "#475569";
        const activo = ejeActivo === eje;
        return (
          <g key={eje}>
            <line x1="25" x2="175" y1={y} y2={y} stroke="#2A5A8F" strokeWidth="1.5"/>
            {/* Pad izquierdo */}
            <g onClick={()=>onSelect(eje)} style={{cursor:"pointer"}}>
              <rect x="25" y={y-10} width="14" height="20" rx="3" fill={color} fillOpacity="0.8"
                stroke={activo?"#fff":color} strokeWidth={activo?2.5:1}/>
              <rect x="29" y={y-6} width="6" height="12" rx="1.5" fill="rgba(0,0,0,0.2)"/>
            </g>
            {/* Pad derecho */}
            <g onClick={()=>onSelect(eje)} style={{cursor:"pointer"}}>
              <rect x="161" y={y-10} width="14" height="20" rx="3" fill={color} fillOpacity="0.8"
                stroke={activo?"#fff":color} strokeWidth={activo?2.5:1}/>
              <rect x="165" y={y-6} width="6" height="12" rx="1.5" fill="rgba(0,0,0,0.2)"/>
            </g>
            <text x="100" y={y+3} textAnchor="middle" fontSize="8" fill="#94A3B8" fontWeight="600">
              {eje.replace("Eje ","")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Frenos({ vehiculos, mostrarToast, onEditarVehiculo }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo   = vehiculos.find(v => String(v.firestoreId) === String(id));
  const tipoVeh    = vehiculo?.tipoVehiculo?.toUpperCase() || "";
  const ejes       = EJES_POR_VEHICULO[tipoVeh] || ["Eje delantero","Eje trasero"];

  const [estadoEjes, setEstadoEjes] = useState(vehiculo?.frenosData || {});
  const [historial,   setHistorial]   = useState(vehiculo?.frenosHistorial || []);
  const [ejeEdit,     setEjeEdit]     = useState(null);
  const [estadoSel,   setEstadoSel]   = useState("bueno");
  const [grosor,      setGrosor]      = useState("");
  const [tipo,        setTipo]        = useState("");
  const [nota,        setNota]        = useState("");
  const [fechaFreno,  setFechaFreno]  = useState(new Date().toISOString().slice(0,10));
  const [mostrarForm, setMostrarForm] = useState(false);
  const [ejeReg,      setEjeReg]      = useState(ejes[0]);
  const [kmReg,       setKmReg]       = useState("");
  const [fechaReg,    setFechaReg]    = useState(new Date().toISOString().slice(0,10));
  const [tallerReg,   setTallerReg]   = useState("");
  const [costoReg,    setCostoReg]    = useState("");
  const [guardando,   setGuardando]   = useState(false);

  const fmt = (n) => "$" + Math.round(n||0).toLocaleString("es-CO");
  const colorEstado = (e) => ESTADOS.find(x=>x.value===e)?.color || t.colors.textSecondary;
  const labelEstado = (e) => ESTADOS.find(x=>x.value===e)?.label || "Sin registro";

  const guardarEstadoEje = () => {
    const nuevos = { ...estadoEjes, [ejeEdit]: { estado:estadoSel, grosor, tipo, nota, fecha:fechaFreno } };
    setEstadoEjes(nuevos);
    onEditarVehiculo(vehiculo.firestoreId, { frenosData: nuevos }).catch(()=>{});
    setEjeEdit(null);
    mostrarToast("Estado guardado","exito");
  };

  const abrirEje = (eje) => {
    const d = estadoEjes[eje] || {};
    setEstadoSel(d.estado||"bueno");
    setGrosor(d.grosor||"");
    setTipo(d.tipo||"");
    setNota(d.nota||"");
    setFechaFreno(d.fecha || new Date().toISOString().slice(0,10));
    setEjeEdit(eje);
  };

  const guardarReparacion = () => {
    if (!kmReg) { mostrarToast("Ingresa el km","error"); return; }
    setGuardando(true);
    const nuevo = { id:Date.now(), eje:ejeReg, km:Number(kmReg), fecha:fechaReg, taller:tallerReg, costo:Number(costoReg)||0 };
    const nuevos = [nuevo, ...historial];
    setHistorial(nuevos);
    onEditarVehiculo(vehiculo.firestoreId, { frenosHistorial: nuevos }).catch(()=>{});
    setKmReg(""); setTallerReg(""); setCostoReg("");
    setMostrarForm(false);
    mostrarToast("Reparación registrada","exito");
    setGuardando(false);
  };

  const eliminarRep = (rid) => {
    const nuevos = historial.filter(r=>r.id!==rid);
    setHistorial(nuevos);
    onEditarVehiculo(vehiculo.firestoreId, { frenosHistorial: nuevos }).catch(()=>{});
    mostrarToast("Registro eliminado","info");
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(`/vehiculo/${id}`, { state: { tab: "mant" } })}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Frenos</h1>
      </div>

      <div style={styles.contenido}>

        {/* DIAGRAMA */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Diagrama de frenos</p>
          <DiagramaFrenas
            ejes={ejes}
            estadoEjes={estadoEjes}
            onSelect={abrirEje}
            ejeActivo={ejeEdit}
            tipoVehiculo={tipoVeh}
          />
          <div style={{display:"flex",gap:"12px",marginTop:"12px",flexWrap:"wrap",justifyContent:"center"}}>
            {ESTADOS.map(s=>(
              <span key={s.value} style={{display:"flex",alignItems:"center",gap:"4px",fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>
                <span style={{width:"8px",height:"8px",borderRadius:"2px",background:s.color,display:"inline-block"}}/>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* ESTADO POR EJE */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Estado por posición</p>
          {ejes.map((eje,i,arr) => {
            const d     = estadoEjes[eje] || {};
            const color = colorEstado(d.estado);
            const label = labelEstado(d.estado);
            return (
              <div key={eje}>
                <div
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i===arr.length-1&&ejeEdit!==eje?"none":`1px solid ${t.colors.borderLight}`,cursor:"pointer"}}
                  onClick={()=>ejeEdit===eje?setEjeEdit(null):abrirEje(eje)}
                >
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <div style={{width:"10px",height:"10px",borderRadius:"2px",background:d.estado?color:t.colors.textTertiary,flexShrink:0}}/>
                    <div>
                      <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>{eje}</p>
                      {d.grosor&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>Grosor: {d.grosor} mm{d.tipo?` · ${d.tipo}`:""}{d.fecha?` · ${d.fecha}`:""}</p>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                    <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:d.estado?color:t.colors.textTertiary}}>{label}</span>
                    <span style={{color:t.colors.textTertiary,fontSize:"14px"}}>{ejeEdit===eje?"↑":"›"}</span>
                  </div>
                </div>

                {ejeEdit===eje&&(
                  <div style={{padding:"12px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                    <div style={styles.campo}>
                      <label style={styles.label}>Estado</label>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                        {ESTADOS.map(es=>(
                          <button key={es.value}
                            style={{padding:"6px 12px",borderRadius:t.radius.full,border:`1.5px solid ${estadoSel===es.value?es.color:t.colors.border}`,background:estadoSel===es.value?es.color+"22":"none",fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightSemibold,color:estadoSel===es.value?es.color:t.colors.textSecondary,cursor:"pointer"}}
                            onClick={()=>setEstadoSel(es.value)}
                          >{es.label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={styles.fila2}>
                      <div style={styles.campo}>
                        <label style={styles.label}>Grosor (mm)</label>
                        <input type="text" placeholder="12mm" value={grosor}
                          onChange={e=>setGrosor(e.target.value)} style={styles.input}/>
                      </div>
                      <div style={styles.campo}>
                        <label style={styles.label}>Tipo</label>
                        <input type="text" placeholder="Pastilla, banda..." value={tipo}
                          onChange={e=>setTipo(e.target.value)} style={styles.input}/>
                      </div>
                    </div>
                    <div style={styles.fila2}>
                      <div style={styles.campo}>
                        <label style={styles.label}>Fecha</label>
                        <input type="date" value={fechaFreno}
                          onChange={e=>setFechaFreno(e.target.value)} style={styles.input}/>
                      </div>
                      <div style={styles.campo}>
                        <label style={styles.label}>Nota</label>
                        <input type="text" placeholder="Observaciones" value={nota}
                          onChange={e=>setNota(e.target.value)} style={styles.input}/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:"8px"}}>
                      <button style={{flex:1,padding:"10px",background:t.colors.blue,color:"#fff",border:"none",borderRadius:t.radius.sm,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer"}}
                        onClick={guardarEstadoEje}>Guardar estado</button>
                      <button style={{padding:"10px 14px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.sm,cursor:"pointer",color:t.colors.textSecondary,fontSize:t.fonts.sizeSm}}
                        onClick={()=>setEjeEdit(null)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* REGISTRAR REPARACIÓN */}
        {!mostrarForm && (
          <button style={{width:"100%",padding:"13px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",marginBottom:"10px"}}
            onClick={()=>setMostrarForm(true)}>
            + Registrar reparación
          </button>
        )}

        {mostrarForm && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Nueva reparación</p>
            <div style={styles.campo}>
              <label style={styles.label}>Posición</label>
              <select value={ejeReg} onChange={e=>setEjeReg(e.target.value)} style={styles.input}>
                {ejes.map(e=><option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Km</label>
                <input type="number" placeholder="150000" value={kmReg}
                  onChange={e=>setKmReg(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Fecha</label>
                <input type="date" value={fechaReg}
                  onChange={e=>setFechaReg(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Taller</label>
                <input type="text" placeholder="Nombre taller" value={tallerReg}
                  onChange={e=>setTallerReg(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Costo ($)</label>
                <input type="number" placeholder="350000" value={costoReg}
                  onChange={e=>setCostoReg(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button style={{flex:1,padding:"12px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",opacity:guardando?0.75:1}}
                onClick={guardarReparacion} disabled={guardando}>
                {guardando?"Guardando...":"Guardar"}
              </button>
              <button style={{padding:"12px 16px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.md,cursor:"pointer",color:t.colors.textSecondary,fontSize:t.fonts.sizeSm}}
                onClick={()=>setMostrarForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {historial.length>0&&(
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Historial de reparaciones</p>
            {historial.map((r,i,arr)=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div style={{flex:1}}>
                  <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>{r.eje}</p>
                  <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>
                    {r.fecha} · {r.km?.toLocaleString("es-CO")} km
                    {r.taller?` · ${r.taller}`:""}
                  </p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  {r.costo>0&&<span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.red}}>{fmt(r.costo)}</span>}
                  <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}} onClick={()=>eliminarRep(r.id)}>
                    <Trash2 size={14} color={t.colors.textTertiary} strokeWidth={1.8}/>
                  </button>
                </div>
              </div>
            ))}
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

export default Frenos;