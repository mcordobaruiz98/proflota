import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Edit3, Save, X, Fuel, Route, Receipt, TrendingUp, Package, CheckCircle, Clock, AlertCircle, Send } from "lucide-react";
import { theme as t } from "../styles/theme";

function DetalleViaje({ viajes = [], vehiculos = [], onEliminar, onEditar, onEditarVehiculo, mostrarToast }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const viaje = viajes.find(v => String(v.firestoreId) === String(id));

  const [editando,        setEditando]        = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [guardando,       setGuardando]       = useState(false);
  const [verFormAnticipo, setVerFormAnticipo] = useState(false);
  const [antDesc,         setAntDesc]         = useState("");
  const [antMonto,        setAntMonto]        = useState("");
  const [retornoE,        setRetornoE]        = useState(false);
  const [fleteRetE,       setFleteRetE]       = useState("");
  const [verBitacora,     setVerBitacora]     = useState(false);
  const [bitTipo,         setBitTipo]         = useState("");
  const [bitNota,         setBitNota]         = useState("");
  const [bitUbicacion,    setBitUbicacion]    = useState("");

  const [fecha,     setFecha]     = useState("");
  const [ruta,      setRuta]      = useState("");
  const [mani,      setMani]      = useState("");
  const [placa,     setPlaca]     = useState("");
  const [emp,       setEmp]       = useState("");
  const [tipoCarga, setTipoCarga] = useState("");
  const [prod,      setProd]      = useState("");
  const [condNom,   setCondNom]   = useState("");
  const [ton,       setTon]       = useState("");
  const [fleteTon,  setFleteTon]  = useState("");
  const [kmCargado, setKmCargado] = useState("");
  const [kmVacio,   setKmVacio]   = useState("");
  const [remesaE,   setRemesaE]   = useState("");
  const [pesoBasE,  setPesoBasE]  = useState("");
  const [lugarCE,   setLugarCE]   = useState("");
  const [lugarDE,   setLugarDE]   = useState("");
  const [obsE,      setObsE]      = useState("");

  const fmt = (n) => "$" + Math.round(n||0).toLocaleString("es-CO");
  const fnD = (n,d) => (Math.round((n||0)*Math.pow(10,d))/Math.pow(10,d)).toLocaleString("es-CO",{maximumFractionDigits:d});

  const compartirWhatsApp = () => {
    if (!viaje) return;
    const lineas = [
      `🚛 *Resumen de viaje — NAVIRA*`,
      ``,
      `📍 *Ruta:* ${viaje.ruta || "—"}`,
      `📅 *Fecha cargue:* ${viaje.fecha || "—"}`,
      viaje.fechaDescarga ? `📅 *Fecha descargue:* ${viaje.fechaDescarga}` : null,
      `🚗 *Placa:* ${viaje.placa || "—"}`,
      viaje.emp ? `🏢 *Empresa:* ${viaje.emp}` : null,
      viaje.condNom ? `👤 *Conductor:* ${viaje.condNom}` : null,
      viaje.prod ? `📦 *Producto:* ${viaje.prod}` : null,
      viaje.ton ? `⚖️ *Toneladas:* ${viaje.ton}` : null,
      viaje.pesoBascula ? `⚖️ *Peso báscula:* ${viaje.pesoBascula} ton` : null,
      viaje.remesa ? `📄 *Remesa:* ${viaje.remesa}` : null,
      viaje.lugarCargue ? `📍 *Cargue:* ${viaje.lugarCargue}` : null,
      viaje.lugarDescargue ? `📍 *Descargue:* ${viaje.lugarDescargue}` : null,
      ``,
      `💰 *Valor flete:* ${fmt(viaje.vViaje || 0)}`,
      `⛽ *Combustible:* ${fmt(viaje.cComb || 0)}`,
      `🛣️ *Peajes:* ${fmt(viaje.peajes || 0)}`,
      `👤 *Conductor:* ${fmt(viaje.conductor || 0)}`,
      (viaje.carp || viaje.gv2 || viaje.extras) ? `📋 *Otros gastos:* ${fmt((viaje.carp||0)+(viaje.gv2||0)+(viaje.extras||0))}` : null,
      ``,
      `📊 *Total gastos:* ${fmt(viaje.total || 0)}`,
      `✅ *Ganancia neta:* ${fmt(viaje.neta || 0)}`,
      ``,
      `_Generado por Navira — Inteligencia en Movimiento_`,
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(lineas)}`;
    window.open(url, "_blank");
  };

  const abrirEdicion = () => {
    setFecha(viaje.fecha || "");
    setRuta(viaje.ruta || "");
    setMani(viaje.mani || "");
    setPlaca(viaje.placa || "");
    setEmp(viaje.emp || "");
    setTipoCarga(viaje.carga || viaje.tipoCarga || "");
    setProd(viaje.prod || "");
    setCondNom(viaje.condNom || "");
    setTon(viaje.ton || "");
    setFleteTon(viaje.fleteTon || "");
    setKmCargado(viaje.kmCargado || "");
    setKmVacio(viaje.kmVacio || "");
    setRemesaE(viaje.remesa || "");
    setPesoBasE(viaje.pesoBascula || "");
    setLugarCE(viaje.lugarCargue || "");
    setLugarDE(viaje.lugarDescargue || "");
    setObsE(viaje.observaciones || "");
    setRetornoE(viaje.tieneRetorno || false);
    setFleteRetE(viaje.valorViajeRetorno || "");
    setEditando(true);
  };

  const guardarEdicion = async () => {
    if (!ruta.trim()) { mostrarToast("Ingresa la ruta del viaje", "error"); return; }
    setGuardando(true);
    try {
      const nuevoVViaje = viaje.modoFlete === "porViaje"
          ? parseFloat(fleteTon)||viaje.vViaje
          : (parseFloat(ton)||viaje.ton) * (parseFloat(fleteTon)||viaje.fleteTon);
      const nuevoRetorno = retornoE ? (parseFloat(fleteRetE) || 0) : 0;
      const totalIngresos = nuevoVViaje + nuevoRetorno;
      const totalGastos = viaje.total || 0;

      await onEditar(viaje.firestoreId, {
        fecha, ruta: ruta.trim(), mani,
        placa, emp, carga: tipoCarga,
        prod, condNom,
        ton:       parseFloat(ton)     || viaje.ton,
        fleteTon:  parseFloat(fleteTon)|| viaje.fleteTon,
        kmCargado: parseFloat(kmCargado)||viaje.kmCargado,
        kmVacio:   parseFloat(kmVacio)  ||viaje.kmVacio,
        kmT: (parseFloat(kmCargado)||viaje.kmCargado||0) + (parseFloat(kmVacio)||viaje.kmVacio||0),
        remesa: remesaE.trim(),
        pesoBascula: parseFloat(pesoBasE) || 0,
        lugarCargue: lugarCE.trim(),
        lugarDescargue: lugarDE.trim(),
        observaciones: obsE.trim(),
        vViaje: totalIngresos,
        tieneRetorno: retornoE,
        valorViajeRetorno: nuevoRetorno,
        valorViajeIda: nuevoVViaje,
        neta: totalIngresos - totalGastos,
      });
      mostrarToast("Viaje actualizado", "exito");
      setEditando(false);
    } catch(err) {
      mostrarToast("Error al guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarViaje = async () => {
    // Restar km del odómetro
    if (viaje.placa && viaje.kmT > 0) {
      const veh = vehiculos.find(v => v.placa === viaje.placa);
      if (veh && veh.kmOdometro) {
        const nuevoKm = Math.max(0, (veh.kmOdometro || 0) - viaje.kmT);
        onEditarVehiculo(veh.firestoreId, { kmOdometro: nuevoKm }).catch(()=>{});
      }
    }
    await onEliminar(viaje.firestoreId);
    mostrarToast("Viaje eliminado", "info");
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
    {label:"Conductor",          valor:viaje.conductor, detalle:viaje.pcond&&viaje.pcond<=100?`${viaje.pcond}%`:null, color:t.colors.green},
    {label:"Carpado/Descarpado", valor:viaje.carp,      detalle:null,                                        color:"#06B6D4"},
    {label:"Gastos de viaje",    valor:viaje.gv2,       detalle:null,                                        color:"#EC4899"},
    {label:"Otros gastos",       valor:viaje.extras,    detalle:null,                                        color:t.colors.textTertiary},
    {label:"Retención en la fuente", valor:viaje.descuentos?.retefuente||0, detalle:null, color:t.colors.red},
    {label:"Reteica",            valor:viaje.descuentos?.reteica||0,    detalle:null, color:t.colors.red},
    {label:"FOPAT",              valor:viaje.descuentos?.fopat||0,      detalle:null, color:t.colors.red},
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
        <div style={{display:"flex", gap:"8px"}}>
          {!editando && (
            <>
              <button
                style={{background:"#25D366",border:"none",borderRadius:t.radius.sm,padding:"8px",cursor:"pointer",display:"flex",alignItems:"center"}}
                onClick={compartirWhatsApp}
                title="Compartir por WhatsApp"
              >
                <Send size={16} color="#fff" strokeWidth={2} />
              </button>
              <button style={styles.btnEditar} onClick={abrirEdicion}>
                <Edit3 size={16} color={t.colors.blue} strokeWidth={2} />
                <span style={{fontSize:t.fonts.sizeXs, color:t.colors.blue, fontWeight:t.fonts.weightSemibold}}>Editar</span>
              </button>
            </>
          )}
          {!confirmarEliminar ? (
            <button style={styles.btnEliminar} onClick={()=>setConfirmarEliminar(true)}>
              <Trash2 size={18} color={t.colors.red} strokeWidth={2} />
            </button>
          ) : (
            <div style={{display:"flex", gap:"6px", alignItems:"center"}}>
              <button
                style={{padding:"8px 12px", background:t.colors.redSoft, border:`1px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.red, cursor:"pointer"}}
                onClick={eliminarViaje}
              >
                Confirmar
              </button>
              <button
                style={{padding:"8px 12px", background:"none", border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, cursor:"pointer", color:t.colors.textSecondary}}
                onClick={()=>setConfirmarEliminar(false)}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODO EDICIÓN */}
      {editando && (
        <div style={styles.contenido}>
          <div style={styles.card}>
            <p style={styles.cardTituloEdit}>Editar datos del viaje</p>

            <div style={styles.campo}>
              <label style={styles.label}>Fecha</label>
              <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={styles.input}/>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Ruta</label>
              <input type="text" placeholder="Origen – Destino" value={ruta} onChange={e=>setRuta(e.target.value)} style={styles.input}/>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Manifiesto</label>
                <input type="text" value={mani} onChange={e=>setMani(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Placa</label>
                <input type="text" value={placa} onChange={e=>setPlaca(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Empresa</label>
              <input type="text" value={emp} onChange={e=>setEmp(e.target.value)} style={styles.input}/>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Tipo de carga</label>
                <input type="text" value={tipoCarga} onChange={e=>setTipoCarga(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Producto</label>
                <input type="text" value={prod} onChange={e=>setProd(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Conductor</label>
              <input type="text" value={condNom} onChange={e=>setCondNom(e.target.value)} style={styles.input}/>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Toneladas</label>
                <input type="number" value={ton} onChange={e=>setTon(e.target.value)} step="0.01" style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Flete ($/ton o total)</label>
                <input type="number" value={fleteTon} onChange={e=>setFleteTon(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Km cargado</label>
                <input type="number" value={kmCargado} onChange={e=>setKmCargado(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Km vacío</label>
                <input type="number" value={kmVacio} onChange={e=>setKmVacio(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>N° Remesa</label>
                <input type="text" value={remesaE} onChange={e=>setRemesaE(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Peso báscula (ton)</label>
                <input type="number" value={pesoBasE} onChange={e=>setPesoBasE(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Lugar de cargue</label>
                <input type="text" value={lugarCE} onChange={e=>setLugarCE(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Lugar de descargue</label>
                <input type="text" value={lugarDE} onChange={e=>setLugarDE(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Observaciones</label>
              <input type="text" value={obsE} onChange={e=>setObsE(e.target.value)} style={styles.input}/>
            </div>

            {/* Flete de retorno */}
            <div style={{marginBottom:"12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",cursor:"pointer",marginBottom:retornoE?"10px":"0"}} onClick={()=>setRetornoE(!retornoE)}>
                <div style={{width:"36px",height:"20px",borderRadius:"10px",background:retornoE?t.colors.blue:"#1E3A5F",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                  <div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:retornoE?"18px":"2px",transition:"left 0.2s",boxShadow:"0 1px 2px rgba(0,0,0,0.3)"}} />
                </div>
                <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textPrimary}}>Flete de retorno</span>
              </div>
              {retornoE && (
                <div style={styles.campo}>
                  <label style={styles.label}>Valor flete retorno ($)</label>
                  <input type="number" placeholder="2500000" value={fleteRetE}
                    onChange={e=>setFleteRetE(e.target.value)} style={styles.input}/>
                </div>
              )}
            </div>

            <div style={{display:"flex", gap:"8px", marginTop:"8px"}}>
              <button
                style={{flex:1, padding:"13px", background:t.colors.green, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", opacity:guardando?0.75:1}}
                onClick={guardarEdicion}
                disabled={guardando}
              >
                <Save size={16} color="#fff" strokeWidth={2}/>
                {guardando?"Guardando...":"Guardar cambios"}
              </button>
              <button
                style={{padding:"13px 16px", background:"none", border:`1.5px solid ${t.colors.border}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, cursor:"pointer", color:t.colors.textSecondary}}
                onClick={()=>setEditando(false)}
              >
                <X size={16} strokeWidth={2}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODO VISTA */}
      {!editando && (
        <>
          {/* HERO */}
          <div style={styles.hero}>
            <p style={styles.heroRuta}>{viaje.ruta||"Sin ruta"}</p>
            <div style={styles.heroPills}>
              {viaje.fecha&&<span style={styles.pill}>📅 {viaje.fecha}</span>}
              {viaje.placa&&<span style={styles.pill}>🚚 {viaje.placa}</span>}
              {viaje.condNom&&<span style={styles.pill}>👤 {viaje.condNom}</span>}
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

            {/* DATOS */}
            {(viaje.carga||viaje.prod||viaje.condNom||viaje.contactoEmpresa||viaje.celularEmpresa)&&(
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <Package size={16} color={t.colors.blue} strokeWidth={2} />
                  <p style={styles.cardTitulo}>Datos del viaje</p>
                </div>
                {viaje.carga&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Tipo de carga</span><span style={styles.filaValor}>{viaje.carga}</span></div>}
                {viaje.prod&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Producto</span><span style={styles.filaValor}>{viaje.prod}</span></div>}
                {viaje.condNom&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Conductor</span><span style={styles.filaValor}>{viaje.condNom}</span></div>}
                {viaje.remesa&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>N° Remesa</span><span style={styles.filaValor}>{viaje.remesa}</span></div>}
                {viaje.pesoBascula>0&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Peso báscula</span><span style={styles.filaValor}>{viaje.pesoBascula} ton</span></div>}
                {viaje.lugarCargue&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Lugar de cargue</span><span style={styles.filaValor}>{viaje.lugarCargue}</span></div>}
                {viaje.lugarDescargue&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Lugar de descargue</span><span style={styles.filaValor}>{viaje.lugarDescargue}</span></div>}
                {viaje.contactoEmpresa&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Contacto empresa</span><span style={styles.filaValor}>{viaje.contactoEmpresa}</span></div>}
                {viaje.celularEmpresa&&<div style={{...styles.fila,borderBottom:`1px solid ${t.colors.borderLight}`}}><span style={styles.filaLabel}>Celular contacto</span><a href={`tel:${viaje.celularEmpresa}`} style={{...styles.filaValor,color:t.colors.blue,textDecoration:"none"}}>{viaje.celularEmpresa}</a></div>}
                {viaje.observaciones&&<div style={{...styles.fila,borderBottom:"none"}}><span style={styles.filaLabel}>Observaciones</span><span style={{...styles.filaValor,color:t.colors.textSecondary,fontStyle:"italic"}}>{viaje.observaciones}</span></div>}
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
                      {p.iv&&<span style={{fontSize:"10px",background:t.colors.greenSoft,color:t.colors.green,padding:"2px 6px",borderRadius:t.radius.full,marginLeft:"6px"}}>Ida y vuelta</span>}
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
                    <span style={styles.filaValor}>{fmt(e.valor||e.v||0)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* BITÁCORA DEL VIAJE */}
            <div style={styles.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                <div style={styles.cardHeader}>
                  <Clock size={16} color={t.colors.blue} strokeWidth={2} />
                  <p style={styles.cardTitulo}>Bitácora del viaje</p>
                </div>
                <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary}}>
                  {(viaje.bitacora||[]).length} evento{(viaje.bitacora||[]).length!==1?"s":""}
                </span>
              </div>

              {/* Botones de evento rápido */}
              {!verBitacora && (
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"10px"}}>
                  {[
                    {id:"cargue",    label:"Cargue",    emoji:"📦"},
                    {id:"descargue", label:"Descargue", emoji:"📤"},
                    {id:"reten",     label:"Retén",     emoji:"🛑"},
                    {id:"espera",    label:"Espera",    emoji:"⏳"},
                    {id:"descanso",  label:"Descanso",  emoji:"😴"},
                    {id:"comida",    label:"Comida",    emoji:"🍽️"},
                    {id:"tanqueo",   label:"Tanqueo",   emoji:"⛽"},
                    {id:"incidente", label:"Incidente", emoji:"⚠️"},
                    {id:"otro",      label:"Otro",      emoji:"📝"},
                  ].map(ev=>(
                    <button key={ev.id}
                      style={{padding:"6px 10px",borderRadius:t.radius.full,border:`1.5px solid ${t.colors.border}`,background:"none",fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}
                      onClick={()=>{setBitTipo(ev.id);setVerBitacora(true);}}
                    >
                      {ev.emoji} {ev.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Formulario inline */}
              {verBitacora && (
                <div style={{background:t.colors.bgSection,borderRadius:t.radius.sm,padding:"12px",marginBottom:"10px"}}>
                  <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary,margin:"0 0 10px"}}>
                    {bitTipo==="cargue"?"📦 Cargue":bitTipo==="descargue"?"📤 Descargue":bitTipo==="reten"?"🛑 Retén":bitTipo==="espera"?"⏳ Espera":bitTipo==="descanso"?"😴 Descanso":bitTipo==="comida"?"🍽️ Comida":bitTipo==="tanqueo"?"⛽ Tanqueo":bitTipo==="incidente"?"⚠️ Incidente":"📝 Otro"}
                  </p>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
                    <input type="text" placeholder="Ubicación" value={bitUbicacion}
                      onChange={e=>setBitUbicacion(e.target.value)}
                      style={{padding:"8px 10px",borderRadius:t.radius.sm,border:`1px solid ${t.colors.border}`,background:t.colors.bgPrimary,color:t.colors.textPrimary,fontSize:t.fonts.sizeXs}} />
                    <input type="text" placeholder="Nota (opcional)" value={bitNota}
                      onChange={e=>setBitNota(e.target.value)}
                      style={{padding:"8px 10px",borderRadius:t.radius.sm,border:`1px solid ${t.colors.border}`,background:t.colors.bgPrimary,color:t.colors.textPrimary,fontSize:t.fonts.sizeXs}} />
                  </div>
                  <div style={{display:"flex",gap:"6px"}}>
                    <button
                      style={{flex:1,padding:"8px",background:t.colors.green,border:"none",borderRadius:t.radius.sm,color:"#fff",fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,cursor:"pointer"}}
                      onClick={async()=>{
                        const evento = {
                          id: Date.now(),
                          tipo: bitTipo,
                          fecha: new Date().toISOString().slice(0,10),
                          hora: new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),
                          ubicacion: bitUbicacion.trim(),
                          nota: bitNota.trim(),
                        };
                        const nuevos = [...(viaje.bitacora||[]), evento];
                        try {
                          await onEditar(viaje.firestoreId, { bitacora: nuevos });
                          setBitTipo(""); setBitNota(""); setBitUbicacion(""); setVerBitacora(false);
                          mostrarToast("Evento registrado","exito");
                        } catch(err) { mostrarToast("Error","error"); }
                      }}
                    >Registrar</button>
                    <button
                      style={{padding:"8px 12px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.sm,color:t.colors.textSecondary,fontSize:t.fonts.sizeXs,cursor:"pointer"}}
                      onClick={()=>{setVerBitacora(false);setBitTipo("");setBitNota("");setBitUbicacion("");}}
                    >✕</button>
                  </div>
                </div>
              )}

              {/* Lista de eventos */}
              {(viaje.bitacora||[]).length > 0 && (
                <div>
                  {[...(viaje.bitacora||[])].sort((a,b)=>b.id-a.id).map((ev,i,arr)=>{
                    const emojis = {cargue:"📦",descargue:"📤",reten:"🛑",espera:"⏳",descanso:"😴",comida:"🍽️",tanqueo:"⛽",incidente:"⚠️",otro:"📝"};
                    return (
                      <div key={ev.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                        <div style={{display:"flex",gap:"8px",flex:1}}>
                          <span style={{fontSize:"16px"}}>{emojis[ev.tipo]||"📝"}</span>
                          <div>
                            <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>
                              {ev.tipo.charAt(0).toUpperCase()+ev.tipo.slice(1)}
                            </p>
                            <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>
                              {ev.fecha} · {ev.hora}{ev.ubicacion?` · ${ev.ubicacion}`:""}
                            </p>
                            {ev.nota&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0",fontStyle:"italic"}}>{ev.nota}</p>}
                          </div>
                        </div>
                        <button
                          style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}}
                          onClick={async()=>{
                            const nuevos = (viaje.bitacora||[]).filter(e=>e.id!==ev.id);
                            try {
                              await onEditar(viaje.firestoreId, { bitacora: nuevos });
                            } catch(err){}
                          }}
                        >
                          <Trash2 size={12} color={t.colors.textTertiary} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ANTICIPOS AL CONDUCTOR */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Receipt size={16} color={t.colors.amber} strokeWidth={2} />
                <p style={styles.cardTitulo}>Anticipo al conductor</p>
              </div>

              {/* Monto entregado */}
              <div style={{...styles.fila, borderBottom:`1px solid ${t.colors.borderLight}`}}>
                <span style={styles.filaLabel}>Entregado</span>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <span style={{color:t.colors.textTertiary,fontSize:t.fonts.sizeXs}}>$</span>
                  <input
                    type="number"
                    value={viaje.anticipoMonto || ""}
                    placeholder="0"
                    onChange={async(e)=>{
                      const val = Number(e.target.value) || 0;
                      try { await onEditar(viaje.firestoreId, { anticipoMonto: val }); } catch(err){}
                    }}
                    style={{width:"120px",padding:"4px 8px",borderRadius:t.radius.sm,border:`1px solid ${t.colors.border}`,background:t.colors.bgPrimary,color:t.colors.textPrimary,fontSize:t.fonts.sizeSm,textAlign:"right"}}
                  />
                </div>
              </div>

              {/* Gastos del anticipo */}
              {(viaje.anticipoGastos || []).map((g, i, arr) => (
                <div key={i} style={{...styles.fila, borderBottom:`1px solid ${t.colors.borderLight}`}}>
                  <span style={styles.filaLabel}>{g.descripcion}</span>
                  <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                    <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.red}}>-{fmt(g.monto)}</span>
                    <button
                      style={{background:"none",border:"none",cursor:"pointer",padding:"2px"}}
                      onClick={async()=>{
                        const nuevos = (viaje.anticipoGastos||[]).filter((_,idx)=>idx!==i);
                        try { await onEditar(viaje.firestoreId, { anticipoGastos: nuevos }); } catch(err){}
                      }}
                    >
                      <Trash2 size={12} color={t.colors.textTertiary} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Agregar gasto */}
              <div style={{padding:"8px 0",borderBottom:`1px solid ${t.colors.borderLight}`}}>
                {!verFormAnticipo ? (
                  <button
                    style={{fontSize:t.fonts.sizeXs,color:t.colors.blue,background:"none",border:"none",cursor:"pointer",fontWeight:t.fonts.weightSemibold}}
                    onClick={()=>setVerFormAnticipo(true)}
                  >
                    + Agregar gasto del conductor
                  </button>
                ) : (
                  <div style={{display:"flex",gap:"6px",alignItems:"flex-end"}}>
                    <div style={{flex:1}}>
                      <input type="text" placeholder="Descripción" value={antDesc}
                        onChange={e=>setAntDesc(e.target.value)}
                        style={{width:"100%",padding:"6px 8px",borderRadius:t.radius.sm,border:`1px solid ${t.colors.border}`,background:t.colors.bgPrimary,color:t.colors.textPrimary,fontSize:t.fonts.sizeXs,marginBottom:"4px"}} />
                      <input type="number" placeholder="Monto" value={antMonto}
                        onChange={e=>setAntMonto(e.target.value)}
                        style={{width:"100%",padding:"6px 8px",borderRadius:t.radius.sm,border:`1px solid ${t.colors.border}`,background:t.colors.bgPrimary,color:t.colors.textPrimary,fontSize:t.fonts.sizeXs}} />
                    </div>
                    <button
                      style={{padding:"6px 10px",background:t.colors.green,border:"none",borderRadius:t.radius.sm,color:"#fff",fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,cursor:"pointer",whiteSpace:"nowrap"}}
                      onClick={async()=>{
                        if (!antDesc.trim()) { mostrarToast("Ingresa descripción","error"); return; }
                        if (!antMonto || Number(antMonto)<=0) { mostrarToast("Ingresa monto","error"); return; }
                        const nuevos = [...(viaje.anticipoGastos||[]), { descripcion: antDesc.trim(), monto: Number(antMonto) }];
                        try {
                          await onEditar(viaje.firestoreId, { anticipoGastos: nuevos });
                          setAntDesc(""); setAntMonto(""); setVerFormAnticipo(false);
                        } catch(err) { mostrarToast("Error","error"); }
                      }}
                    >✓</button>
                    <button
                      style={{padding:"6px 8px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.sm,color:t.colors.textTertiary,fontSize:t.fonts.sizeXs,cursor:"pointer"}}
                      onClick={()=>{setVerFormAnticipo(false);setAntDesc("");setAntMonto("");}}
                    >✕</button>
                  </div>
                )}
              </div>

              {/* Saldo */}
              {(viaje.anticipoMonto > 0) && (() => {
                const entregado = viaje.anticipoMonto || 0;
                const gastado = (viaje.anticipoGastos||[]).reduce((s,g)=>s+g.monto, 0);
                const saldo = entregado - gastado;
                return (
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0"}}>
                    <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary}}>
                      {saldo >= 0 ? "Conductor debe devolver" : "Se le debe al conductor"}
                    </span>
                    <span style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBlack,color:saldo>=0?t.colors.amber:t.colors.red}}>
                      {fmt(Math.abs(saldo))}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* ESTADO DE PAGO */}
            <div style={{...styles.card, border:`1.5px solid ${
              viaje.estadoPago==="pagado"?t.colors.greenBorder:
              (() => {
                const dias = Math.floor((new Date() - new Date(viaje.fecha))/(1000*60*60*24));
                const plazo = viaje.diasPago || 30;
                return dias > plazo ? t.colors.redBorder : t.colors.border;
              })()
            }`}}>
              <div style={styles.cardHeader}>
                {viaje.estadoPago==="pagado"
                  ? <CheckCircle size={16} color={t.colors.green} strokeWidth={2} />
                  : <Clock size={16} color={t.colors.amber} strokeWidth={2} />
                }
                <p style={styles.cardTitulo}>Estado de pago</p>
              </div>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.colors.borderLight}`}}>
                <span style={styles.filaLabel}>Estado</span>
                <button
                  style={{
                    padding:"6px 14px",
                    borderRadius:t.radius.full,
                    border:"none",
                    fontSize:t.fonts.sizeXs,
                    fontWeight:t.fonts.weightBold,
                    cursor:"pointer",
                    background: viaje.estadoPago==="pagado" ? t.colors.greenSoft : t.colors.amberSoft || "#FEF3C7",
                    color: viaje.estadoPago==="pagado" ? t.colors.green : t.colors.amber,
                  }}
                  onClick={async()=>{
                    const nuevo = viaje.estadoPago==="pagado" ? "pendiente" : "pagado";
                    try {
                      await onEditar(viaje.firestoreId, {
                        estadoPago: nuevo,
                        fechaPago: nuevo==="pagado" ? new Date().toISOString().slice(0,10) : null,
                      });
                      mostrarToast(nuevo==="pagado"?"Viaje marcado como pagado":"Viaje marcado como pendiente","exito");
                    } catch(err) {
                      mostrarToast("Error al actualizar","error");
                    }
                  }}
                >
                  {viaje.estadoPago==="pagado" ? "✓ Pagado" : "⏳ Pendiente"}
                </button>
              </div>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.colors.borderLight}`}}>
                <span style={styles.filaLabel}>Plazo de pago</span>
                <select
                  value={viaje.diasPago || 30}
                  onChange={async(e)=>{
                    try {
                      await onEditar(viaje.firestoreId, { diasPago: Number(e.target.value) });
                    } catch(err) {}
                  }}
                  style={{padding:"4px 8px",borderRadius:t.radius.sm,border:`1px solid ${t.colors.border}`,background:t.colors.bgPrimary,color:t.colors.textPrimary,fontSize:t.fonts.sizeXs}}
                >
                  <option value={0}>Contado</option>
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                  <option value={45}>45 días</option>
                  <option value={60}>60 días</option>
                  <option value={90}>90 días</option>
                </select>
              </div>

              {viaje.estadoPago==="pagado" && viaje.fechaPago && (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0"}}>
                  <span style={styles.filaLabel}>Fecha de pago</span>
                  <span style={{...styles.filaValor, color:t.colors.green}}>{viaje.fechaPago}</span>
                </div>
              )}

              {viaje.estadoPago!=="pagado" && (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0"}}>
                  <span style={styles.filaLabel}>Vencimiento</span>
                  {(() => {
                    const plazo = viaje.diasPago || 30;
                    const fechaViaje = new Date(viaje.fecha);
                    const vencimiento = new Date(fechaViaje);
                    vencimiento.setDate(vencimiento.getDate() + plazo);
                    const hoy = new Date();
                    const diasRestantes = Math.ceil((vencimiento - hoy)/(1000*60*60*24));
                    const vencido = diasRestantes < 0;
                    return (
                      <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:vencido?t.colors.red:diasRestantes<=7?t.colors.amber:t.colors.textSecondary}}>
                        {vencido ? `Vencido hace ${Math.abs(diasRestantes)} días` : `En ${diasRestantes} días`}
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  pantalla:        { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary },
  header:          { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:       { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  btnEditar:       { display:"flex", alignItems:"center", gap:"6px", padding:"8px 12px", background:t.colors.blueSoft, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.sm, cursor:"pointer" },
  btnEliminar:     { background:t.colors.redSoft, border:`1.5px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, padding:"8px", cursor:"pointer", display:"flex", alignItems:"center" },
  hero:            { background:t.colors.bgCard, padding:"16px 20px", borderBottom:`1px solid ${t.colors.borderLight}` },
  heroRuta:        { fontSize:"20px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:"0 0 10px", letterSpacing:"-0.3px" },
  heroPills:       { display:"flex", flexWrap:"wrap", gap:"6px" },
  pill:            { fontSize:"11px", background:t.colors.bgSection, color:t.colors.textSecondary, padding:"4px 10px", borderRadius:t.radius.full },
  contenido:       { padding:"12px 16px 30px" },
  dosColumnas:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" },
  kpiCard:         { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"14px", boxShadow:t.shadows.card, border:`1.5px solid ${t.colors.border}` },
  kpiLabel:        { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.05em" },
  kpiVal:          { fontSize:"17px", fontWeight:t.fonts.weightBold, margin:0 },
  card:            { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"10px", boxShadow:t.shadows.card },
  cardTitulo:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:0 },
  cardTituloEdit:  { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 16px" },
  cardHeader:      { display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" },
  fila:            { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0" },
  filaLabel:       { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary },
  filaValor:       { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  campo:           { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"10px" },
  fila2:           { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  label:           { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:           { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
};

export default DetalleViaje;