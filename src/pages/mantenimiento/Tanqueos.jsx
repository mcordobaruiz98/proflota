import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Fuel, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { theme as t } from "../../styles/theme";

function Tanqueos({ vehiculos, onEditarVehiculo, mostrarToast }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo  = vehiculos.find(v => String(v.firestoreId) === String(id));
  const historial = vehiculo?.tanqueosHistorial || [];

  const [mostrarForm, setMostrarForm] = useState(false);
  const [fecha,       setFecha]       = useState(new Date().toISOString().slice(0,10));
  const [estacion,    setEstacion]    = useState("");
  const [galones,     setGalones]     = useState("");
  const [precioGal,   setPrecioGal]   = useState("");
  const [kmOdom,      setKmOdom]      = useState(vehiculo?.kmOdometro || "");
  const [nota,        setNota]        = useState("");
  const [guardando,   setGuardando]   = useState(false);

  const fmt  = (n) => "$" + Math.round(n||0).toLocaleString("es-CO");
  const fmtN = (n, d=1) => (Math.round((n||0)*Math.pow(10,d))/Math.pow(10,d)).toLocaleString("es-CO",{maximumFractionDigits:d});

  // Rendimiento real entre tanqueos consecutivos
  const calcRendimientos = () => {
    const ordenados = [...historial].sort((a,b) => a.kmOdometro - b.kmOdometro);
    const rends = [];
    for (let i = 1; i < ordenados.length; i++) {
      const kmRecorridos = ordenados[i].kmOdometro - ordenados[i-1].kmOdometro;
      if (kmRecorridos > 0 && ordenados[i].galones > 0) {
        rends.push({
          km: kmRecorridos,
          gal: ordenados[i].galones,
          rendimiento: kmRecorridos / ordenados[i].galones,
          fecha: ordenados[i].fecha,
        });
      }
    }
    return rends;
  };

  const rendimientos = calcRendimientos();
  const rendPromedio = rendimientos.length > 0
    ? rendimientos.reduce((s,r) => s + r.rendimiento, 0) / rendimientos.length
    : 0;

  // Totales
  const totalGalones = historial.reduce((s,t) => s + (t.galones||0), 0);
  const totalGastado = historial.reduce((s,t) => s + (t.total||0), 0);

  const guardar = async () => {
    if (!galones || Number(galones) <= 0) { mostrarToast("Ingresa los galones","error"); return; }
    if (!precioGal || Number(precioGal) <= 0) { mostrarToast("Ingresa el precio por galón","error"); return; }
    if (!kmOdom) { mostrarToast("Ingresa el km del odómetro","error"); return; }

    setGuardando(true);
    const nuevo = {
      id: Date.now(),
      fecha,
      estacion: estacion.trim(),
      galones: Number(galones),
      precioGalon: Number(precioGal),
      total: Number(galones) * Number(precioGal),
      kmOdometro: Number(kmOdom),
      nota: nota.trim(),
    };

    const nuevos = [nuevo, ...historial];
    try {
      await onEditarVehiculo(vehiculo.firestoreId, {
        tanqueosHistorial: nuevos,
        kmOdometro: Number(kmOdom),
      });
      mostrarToast("Tanqueo registrado","exito");
      setEstacion(""); setGalones(""); setPrecioGal(""); setNota("");
      setKmOdom(Number(kmOdom));
      setMostrarForm(false);
    } catch(err) {
      mostrarToast("Error al guardar","error");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (rid) => {
    const nuevos = historial.filter(r => r.id !== rid);
    try {
      await onEditarVehiculo(vehiculo.firestoreId, { tanqueosHistorial: nuevos });
      mostrarToast("Tanqueo eliminado","info");
    } catch(err) {
      mostrarToast("Error al eliminar","error");
    }
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(`/vehiculo/${id}`,{state:{tab:"mant"}})}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Tanqueos</h1>
      </div>

      <div style={styles.contenido}>

        {/* RESUMEN */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
          <div style={styles.card}>
            <p style={styles.labelMini}>Rendimiento real</p>
            <p style={{fontSize:"22px",fontWeight:t.fonts.weightBlack,color:rendPromedio>0?t.colors.green:t.colors.textTertiary,margin:0}}>
              {rendPromedio > 0 ? `${fmtN(rendPromedio)} km/gl` : "—"}
            </p>
            <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>
              {rendimientos.length > 0 ? `${rendimientos.length} medición${rendimientos.length!==1?"es":""}` : "Mín. 2 tanqueos"}
            </p>
          </div>
          <div style={styles.card}>
            <p style={styles.labelMini}>Total gastado</p>
            <p style={{fontSize:"22px",fontWeight:t.fonts.weightBlack,color:t.colors.textPrimary,margin:0}}>
              {fmt(totalGastado)}
            </p>
            <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>
              {fmtN(totalGalones,0)} galones totales
            </p>
          </div>
        </div>

        {/* RENDIMIENTO POR TANQUEO */}
        {rendimientos.length > 0 && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Rendimiento por tramo</p>
            {rendimientos.reverse().map((r,i,arr) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div>
                  <p style={{fontSize:t.fonts.sizeSm,color:t.colors.textPrimary,margin:0,fontWeight:t.fonts.weightSemibold}}>
                    {fmtN(r.rendimiento)} km/gl
                  </p>
                  <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>
                    {r.fecha} · {r.km.toLocaleString("es-CO")} km · {fmtN(r.gal,0)} gl
                  </p>
                </div>
                {r.rendimiento >= rendPromedio
                  ? <TrendingUp size={16} color={t.colors.green} strokeWidth={2} />
                  : <TrendingDown size={16} color={t.colors.red} strokeWidth={2} />
                }
              </div>
            ))}
          </div>
        )}

        {/* BOTÓN AGREGAR */}
        {!mostrarForm && (
          <button
            style={{width:"100%",padding:"13px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",marginBottom:"10px"}}
            onClick={()=>setMostrarForm(true)}
          >
            + Registrar tanqueo
          </button>
        )}

        {/* FORMULARIO */}
        {mostrarForm && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Nuevo tanqueo</p>

            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Fecha</label>
                <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Km odómetro</label>
                <input type="number" placeholder="155000" value={kmOdom}
                  onChange={e=>setKmOdom(e.target.value)} style={styles.input} />
              </div>
            </div>

            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Galones</label>
                <input type="number" placeholder="120" value={galones}
                  onChange={e=>setGalones(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Precio/galón ($)</label>
                <input type="number" placeholder="9850" value={precioGal}
                  onChange={e=>setPrecioGal(e.target.value)} style={styles.input} />
              </div>
            </div>

            {galones && precioGal && (
              <div style={{background:t.colors.bgSection,borderRadius:t.radius.sm,padding:"10px",marginBottom:"10px",textAlign:"center"}}>
                <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>Total: </span>
                <span style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary}}>
                  {fmt(Number(galones) * Number(precioGal))}
                </span>
              </div>
            )}

            <div style={styles.campo}>
              <label style={styles.label}>Estación</label>
              <input type="text" placeholder="Terpel Km 5, Biomax centro..." value={estacion}
                onChange={e=>setEstacion(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Nota (opcional)</label>
              <input type="text" placeholder="Observaciones" value={nota}
                onChange={e=>setNota(e.target.value)} style={styles.input} />
            </div>

            <div style={{display:"flex",gap:"8px"}}>
              <button
                style={{flex:1,padding:"12px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",opacity:guardando?0.75:1}}
                onClick={guardar} disabled={guardando}
              >
                {guardando?"Guardando...":"Guardar tanqueo"}
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
            <p style={styles.cardTitulo}>Historial de tanqueos</p>
            {[...historial].sort((a,b)=>b.id-a.id).map((r,i,arr) => (
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"12px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div style={{display:"flex",gap:"10px",flex:1}}>
                  <div style={{width:"32px",height:"32px",borderRadius:t.radius.sm,background:t.colors.bgSection,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Fuel size={16} color={t.colors.amber} strokeWidth={1.8} />
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>
                      {fmtN(r.galones,0)} gl · {fmt(r.precioGalon)}/gl
                    </p>
                    <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>
                      {r.fecha} · {r.kmOdometro?.toLocaleString("es-CO")} km
                      {r.estacion?` · ${r.estacion}`:""}
                    </p>
                    {r.nota&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>{r.nota}</p>}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginLeft:"10px"}}>
                  <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:t.colors.red}}>{fmt(r.total)}</span>
                  <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}} onClick={()=>eliminar(r.id)}>
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
  labelMini:  { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.05em" },
  campo:      { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"10px" },
  fila2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  label:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:      { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
};

export default Tanqueos;