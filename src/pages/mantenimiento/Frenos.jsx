import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { theme as t } from "../../styles/theme";

const EJES_POR_VEHICULO = {
  "TURBO SENCILLO":  ["Eje delantero","Eje trasero"],
  "SENCILLO":        ["Eje delantero","Eje trasero"],
  "TURBO":           ["Eje delantero","Eje trasero"],
  "DOBLETROQUE":     ["Eje delantero","Eje medio","Eje trasero"],
  "PATINETA 2S2":    ["Eje delantero","Eje tracción 1","Eje tracción 2","Eje remolque"],
  "PATINETA 2S3":    ["Eje delantero","Eje tracción 1","Eje tracción 2","Eje remolque 1","Eje remolque 2"],
  "TRACTOMULA 3S2":  ["Eje delantero","Eje tracción 1","Eje tracción 2","Eje tracción 3","Eje remolque"],
  "TRACTOMULA 3S3":  ["Eje delantero","Eje tracción 1","Eje tracción 2","Eje tracción 3","Eje remolque 1","Eje remolque 2"],
};

const ESTADOS = [
  { value:"nuevo",      label:"Nuevo",            color:t.colors.blue   },
  { value:"bueno",      label:"Bueno",            color:t.colors.green  },
  { value:"desgastado", label:"Desgastado",       color:t.colors.amber  },
  { value:"cambiar",    label:"Cambiar urgente",  color:t.colors.red    },
];

function Frenos({ vehiculos, mostrarToast, onEditarVehiculo, onAgregar }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo   = vehiculos.find(v => String(v.firestoreId) === String(id));
  const tipoVeh    = vehiculo?.tipoVehiculo?.toUpperCase() || "";
  const ejes       = EJES_POR_VEHICULO[tipoVeh] || ["Eje delantero","Eje trasero"];

  const [estadoEjes, setEstadoEjes] = useState(vehiculo?.frenosData || {});

  const [historial,   setHistorial]   = useState(vehiculo?.frenosHistorial || []);

  // Sincronizar cuando los datos cargan/cambian en Firestore (evita borrado al refrescar)
  useEffect(() => {
    if (vehiculo?.frenosData) setEstadoEjes(vehiculo.frenosData);
  }, [vehiculo?.frenosData]);
  useEffect(() => {
    if (vehiculo?.frenosHistorial) setHistorial(vehiculo.frenosHistorial);
  }, [vehiculo?.frenosHistorial]);

  const [ejeEdit,       setEjeEdit]     = useState(null);
  const [estadoSel,     setEstadoSel]   = useState("bueno");
  const [grosor,        setGrosor]      = useState("");
  const [tipo,          setTipo]        = useState("");
  const [nota,          setNota]        = useState("");
  const [mostrarForm,   setMostrarForm] = useState(false);
  const [ejeReg,        setEjeReg]      = useState(ejes[0]);
  const [kmReg,         setKmReg]       = useState("");
  const [fechaReg,      setFechaReg]    = useState(new Date().toISOString().slice(0,10));
  const [tallerReg,     setTallerReg]   = useState("");
  const [nitTallReg,    setnitTallReg]  = useState("");
  const [costoReg,      setCostoReg]    = useState("");
  const [guardando,     setGuardando]   = useState(false);

  const fmt = (n) => "$" + Math.round(n||0).toLocaleString("es-CO");

  const colorEstado = (e) => ESTADOS.find(x=>x.value===e)?.color || t.colors.textSecondary;
  const labelEstado = (e) => ESTADOS.find(x=>x.value===e)?.label || "Sin registro";

  const guardarEstadoEje = () => {
    const nuevos = { ...estadoEjes, [ejeEdit]: { estado:estadoSel, grosor, tipo, nota } };
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
    setEjeEdit(eje);
  };

  const guardarReparacion = () => {
    if (!kmReg) { mostrarToast("Ingresa el km","error"); return; }
    setGuardando(true);
    const nuevo = { id:Date.now(), eje:ejeReg, km:Number(kmReg), fecha:fechaReg, taller:tallerReg, nitTaller:Number(nitTallReg), costo:Number(costoReg)||0 };
    const nuevos = [nuevo, ...historial];
    setHistorial(nuevos);
    onEditarVehiculo(vehiculo.firestoreId, { frenosHistorial: nuevos }).catch(()=>{});

    // Registrar en el historial general de mantenimiento (opción A)
    if (onAgregar) {
      onAgregar({
        vehiculoId: vehiculo.firestoreId,
        placa: vehiculo.placa || "",
        tipo: "Frenos",
        descripcion: `Reparación de frenos · ${ejeReg}`,
        fecha: fechaReg,
        km: Number(kmReg),
        costo: Number(costoReg) || 0,
        taller: tallerReg || "",
        nitTaller: nitTallReg || "",
        refId: nuevo.id,
      }).catch(()=>{});
    }
    setKmReg(""); setTallerReg(""); setnitTallReg(""); setCostoReg("");
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

        {/* ESTADO POR EJE */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Estado por eje</p>
          {ejes.map((eje,i,arr) => {
            const d     = estadoEjes[eje] || {};
            const color = colorEstado(d.estado);
            const label = labelEstado(d.estado);
            return (
              <div key={eje}>
                <div
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i===arr.length-1&&ejeEdit!==eje?"none":`1px solid ${t.colors.borderLight}`,cursor:"pointer"}}
                  onClick={()=>ejeEdit===eje?setEjeEdit(null):abrirEje(eje)}
                >
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <div style={{width:"12px",height:"12px",borderRadius:"50%",background:d.estado?color:t.colors.textTertiary,flexShrink:0}}/>
                    <div>
                      <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>{eje}</p>
                      {d.grosor&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>Grosor: {d.grosor} mm{d.tipo?` · ${d.tipo}`:""}</p>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:d.estado?color:t.colors.textTertiary}}>{label}</span>
                    <span style={{color:t.colors.textTertiary,fontSize:"16px"}}>{ejeEdit===eje?"↑":"›"}</span>
                  </div>
                </div>

                {ejeEdit===eje&&(
                  <div style={{padding:"12px 0", borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
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
                    <div style={styles.campo}>
                      <label style={styles.label}>Nota</label>
                      <input type="text" placeholder="Observaciones" value={nota}
                        onChange={e=>setNota(e.target.value)} style={styles.input}/>
                    </div>
                    <div style={{display:"flex",gap:"8px"}}>
                      <button
                        style={{flex:1,padding:"10px",background:t.colors.blue,color:"#fff",border:"none",borderRadius:t.radius.sm,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer"}}
                        onClick={guardarEstadoEje}
                      >Guardar estado</button>
                      <button
                        style={{padding:"10px 14px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.sm,cursor:"pointer",color:t.colors.textSecondary,fontSize:t.fonts.sizeSm}}
                        onClick={()=>setEjeEdit(null)}
                      >Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* REGISTRAR REPARACIÓN */}
        {!mostrarForm ? (
          <button
            style={{width:"100%",padding:"13px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",marginBottom:"10px"}}
            onClick={()=>setMostrarForm(true)}
          >
            + Registrar reparación de frenos
          </button>
        ) : (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Registrar reparación</p>
            <div style={styles.campo}>
              <label style={styles.label}>Eje</label>
              <select value={ejeReg} onChange={e=>setEjeReg(e.target.value)} style={styles.input}>
                {ejes.map(eje=><option key={eje} value={eje}>{eje}</option>)}
              </select>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Km</label>
                <input type="number" placeholder="145000" value={kmReg}
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
                <input type="text" placeholder="Nombre del taller" value={tallerReg}
                  onChange={e=>setTallerReg(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Nit Taller</label>
                <input type="number" placeholder="111.222.333-4" value={nitTallReg}
                  onChange={e=>setnitTallReg(e.target.value)} style={styles.input}/>
              </div>
            </div>

            <div style={styles.campo}>
                <label style={styles.label}>Costo ($)</label>
                <input type="number" placeholder="500000" value={costoReg}
                  onChange={e=>setCostoReg(e.target.value)} style={styles.input}/>
              </div>

            <div style={{display:"flex",gap:"8px"}}>
              <button
                style={{flex:1,padding:"12px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",opacity:guardando?0.75:1}}
                onClick={guardarReparacion} disabled={guardando}
              >{guardando?"Guardando...":"Guardar"}</button>
              <button
                style={{padding:"12px 16px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.md,cursor:"pointer",color:t.colors.textSecondary,fontSize:t.fonts.sizeSm}}
                onClick={()=>setMostrarForm(false)}
              >Cancelar</button>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {historial.length > 0 && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Historial de reparaciones</p>
            {historial.map((r,i,arr)=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"12px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div style={{flex:1}}>
                  <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>{r.eje}</p>
                  <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>
                    {r.fecha} · {r.km.toLocaleString("es-CO")} km
                    {r.taller?` · ${r.taller}`:""}
                  </p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginLeft:"10px"}}>
                  {r.costo>0&&<span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.red}}>{fmt(r.costo)}</span>}
                  <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}} onClick={()=>eliminarRep(r.id)}>
                    <Trash2 size={14} color={t.colors.red} strokeWidth={1.8}/>
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