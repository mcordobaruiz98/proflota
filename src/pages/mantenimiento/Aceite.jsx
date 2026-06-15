import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, Trash2 } from "lucide-react";
import { theme as t } from "../../styles/theme";

const VISCOSIDADES = ["15W-40","20W-50","10W-40","5W-30","5W-40","15W-50","Otra"];
const MARCAS_ACEITE = ["Mobil","Shell Rimula","Castrol","Chevron Delo","Valvoline","Kendall","Total","Otra"];

function Aceite({ vehiculos, onAgregar, mostrarToast, onEditarVehiculo }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo   = vehiculos.find(v => String(v.firestoreId) === String(id));

  const [historial, setHistorial] = useState(vehiculo?.aceiteHistorial || []);

  const [marca,       setMarca]       = useState("");
  const [referencia,  setReferencia]  = useState("");
  const [viscosidad,  setViscosidad]  = useState("15W-40");
  const [galones,     setGalones]      = useState("");
  const [kmCambio,    setKmCambio]    = useState("");
  const [fecha,       setFecha]       = useState(new Date().toISOString().slice(0,10));
  const [taller,      setTaller]      = useState("");
  const [telTaller,   setTelTaller]   = useState("");
  const [costo,       setCosto]       = useState("");
  const [nota,        setNota]        = useState("");
  const [guardando,   setGuardando]   = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  const fmt = (n) => "$" + Math.round(n||0).toLocaleString("es-CO");

  const guardar = () => {
    if (!marca.trim()) { mostrarToast("Ingresa la marca del aceite","error"); return; }
    if (!kmCambio)     { mostrarToast("Ingresa el km del cambio","error"); return; }
    setGuardando(true);
    const nuevo = { id:Date.now(), marca, referencia, viscosidad, galones:Number(galones)||0, km:Number(kmCambio), fecha, taller, telTaller, costo:Number(costo)||0, nota };
    const nuevos = [nuevo, ...historial];
    setHistorial(nuevos);
    onEditarVehiculo(vehiculo.firestoreId, { aceiteHistorial: nuevos }).catch(()=>{});
    setMarca(""); setReferencia(""); setGalones(""); setKmCambio(""); setTaller(""); setTelTaller(""); setCosto(""); setNota("");
    setMostrarForm(false);
    mostrarToast("Cambio de aceite registrado","exito");
    setGuardando(false);
  };

  const eliminar = (rid) => {
    const nuevos = historial.filter(r => r.id !== rid);
    setHistorial(nuevos);
    onEditarVehiculo(vehiculo.firestoreId, { aceiteHistorial: nuevos }).catch(()=>{});
    mostrarToast("Registro eliminado","info");
  };

  const ultimo = historial[0];

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(`/vehiculo/${id}`, { state: { tab: "mant" } })}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Aceite</h1>
      </div>

      <div style={styles.contenido}>

        {/* ÚLTIMO CAMBIO */}
        {ultimo && (
          <div style={{...styles.card, background:`linear-gradient(135deg, #155E75, ${t.colors.blue})`, border:"none"}}>
            <p style={{fontSize:t.fonts.sizeXs, color:"rgba(255,255,255,0.75)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:t.fonts.weightBold}}>Último cambio</p>
            <p style={{fontSize:"22px", fontWeight:t.fonts.weightBlack, color:"#fff", margin:"0 0 4px"}}>{ultimo.marca} {ultimo.viscosidad}</p>
            <p style={{fontSize:t.fonts.sizeXs, color:"rgba(255,255,255,0.75)", margin:0}}>
              {ultimo.fecha} · {ultimo.km.toLocaleString("es-CO")} km
              {ultimo.galones>0?` · ${ultimo.galones} galones`:""}
              {ultimo.taller?` · ${ultimo.taller}`:""}
            </p>
          </div>
        )}

        {/* BOTÓN AGREGAR */}
        {!mostrarForm && (
          <button
            style={{width:"100%", padding:"13px", background:t.colors.green, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", marginBottom:"10px"}}
            onClick={()=>setMostrarForm(true)}
          >
            + Registrar cambio de aceite
          </button>
        )}

        {/* FORMULARIO */}
        {mostrarForm && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Nuevo cambio de aceite</p>

            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Marca</label>
                <select value={marca} onChange={e=>setMarca(e.target.value)}
                  style={{...styles.input, color:marca?t.colors.textPrimary:t.colors.textTertiary}}>
                  <option value="">Seleccionar...</option>
                  {MARCAS_ACEITE.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Referencia</label>
                <input type="text" placeholder="Rimula R4X" value={referencia}
                  onChange={e=>setReferencia(e.target.value)} style={styles.input}/>
              </div>
            </div>

            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Viscosidad</label>
                <select value={viscosidad} onChange={e=>setViscosidad(e.target.value)} style={styles.input}>
                  {VISCOSIDADES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Galones</label>
                <input type="number" placeholder="12" value={galones}
                  onChange={e=>setGalones(e.target.value)} style={styles.input}/>
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

            <div style={styles.campo}>
              <label style={styles.label}>Taller</label>
              <input type="text" placeholder="Nombre del taller" value={taller}
                onChange={e=>setTaller(e.target.value)} style={styles.input}/>
            </div>

            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Tel. taller</label>
                <input type="tel" placeholder="+57 300 000 0000" value={telTaller}
                  onChange={e=>setTelTaller(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Costo ($)</label>
                <input type="number" placeholder="180000" value={costo}
                  onChange={e=>setCosto(e.target.value)} style={styles.input}/>
              </div>
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Nota</label>
              <input type="text" placeholder="Observaciones adicionales" value={nota}
                onChange={e=>setNota(e.target.value)} style={styles.input}/>
            </div>

            <div style={{display:"flex",gap:"8px"}}>
              <button
                style={{flex:1,padding:"12px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",opacity:guardando?0.75:1}}
                onClick={guardar} disabled={guardando}
              >
                <Save size={16} color="#fff" style={{marginRight:"6px",verticalAlign:"-2px"}}/>
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
            <p style={styles.cardTitulo}>Historial de cambios</p>
            {historial.map((r,i,arr)=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"12px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div style={{flex:1}}>
                  <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>
                    {r.marca} {r.viscosidad} {r.referencia?`· ${r.referencia}`:""}
                  </p>
                  <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>
                    {r.fecha} · {r.km.toLocaleString("es-CO")} km
                    {r.galones>0?` · ${r.galones} gal`:""}
                  </p>
                  {r.taller&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>{r.taller}{r.telTaller?` · ${r.telTaller}`:""}</p>}
                  {r.nota&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>{r.nota}</p>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginLeft:"10px"}}>
                  {r.costo>0&&<span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.red}}>{fmt(r.costo)}</span>}
                  <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}} onClick={()=>eliminar(r.id)}>
                    <Trash2 size={14} color={t.colors.red} strokeWidth={1.8}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {historial.length === 0 && !mostrarForm && (
          <div style={{background:t.colors.bgCard,borderRadius:t.radius.lg,padding:"40px 20px",textAlign:"center",boxShadow:t.shadows.card}}>
            <p style={{fontSize:"32px",marginBottom:"8px"}}>🛢️</p>
            <p style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary,margin:"0 0 6px"}}>Sin registros de aceite</p>
            <p style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary,margin:0}}>Registra el primer cambio de aceite.</p>
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

export default Aceite;