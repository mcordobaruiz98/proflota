import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Truck, Info, Route, TrendingUp, Clock, FileText, Upload, Trash2, Eye, ChevronDown, ChevronUp, Wrench, Camera, Edit2, Save, X } from "lucide-react";
import { useSubirArchivo } from "../hooks/useSubirArchivo";
import { theme as t } from "../styles/theme";


const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const seccionesHV = [
  {
    id: "propietario", titulo: "Documentos propietario",
    documentos: [
      {id:"prop_cedula", label:"Cédula o C. Comercio"},
      {id:"prop_rut",    label:"RUT"},
      {id:"prop_banco",  label:"Certificación bancaria"},
    ],
    campos: [
      {id:"prop_dir",    label:"Dirección",  tipo:"text",  placeholder:"Cra. 1 # 2-3"},
      {id:"prop_tel",    label:"Teléfono",   tipo:"tel",   placeholder:"+57 300 000 0000"},
      {id:"prop_correo", label:"Correo",     tipo:"email", placeholder:"correo@ejemplo.com"},
    ],
  },
  {
    id: "tenedor", titulo: "Documentos tenedor",
    documentos: [
      {id:"ten_cedula",   label:"Cédula o C. Comercio"},
      {id:"ten_rut",      label:"RUT"},
      {id:"ten_banco",    label:"Certificación bancaria"},
      {id:"ten_contrato", label:"Contrato compraventa (opcional)"},
    ],
    campos: [
      {id:"ten_dir",    label:"Dirección", tipo:"text",  placeholder:"Cra. 1 # 2-3"},
      {id:"ten_tel",    label:"Teléfono",  tipo:"tel",   placeholder:"+57 300 000 0000"},
      {id:"ten_correo", label:"Correo",    tipo:"email", placeholder:"correo@ejemplo.com"},
    ],
  },
  {
    id: "vehiculo", titulo: "Documentos vehículo",
    documentos: [
      {id:"veh_tarjeta", label:"Tarjeta propiedad vehículo"},
      {id:"veh_trailer", label:"T. propiedad trailer (opcional)"},
      {id:"veh_soat",    label:"SOAT"},
      {id:"veh_rtm",     label:"RTM"},
      {id:"veh_poliza",  label:"Póliza seguro todo riesgo"},
      {id:"veh_fotos",   label:"Foto frente"},
      {id:"veh_fotos",   label:"Foto costado derecho"},
      {id:"veh_fotos",   label:"Foto costado izquierdo"},
      {id:"veh_fotos",   label:"Foto trasera"},
    ],
    campos: [
      {id:"veh_satelital", label:"Empresa satelital", tipo:"text",     placeholder:"Nombre GPS"},
      {id:"veh_usuario",   label:"Usuario",           tipo:"text",     placeholder:"usuario123"},
      {id:"veh_pass",      label:"Contraseña",        tipo:"text", placeholder:"••••••••"},
    ],
  },
  {
    id: "conductor", titulo: "Documentos conductor",
    documentos: [
      {id:"con_selfie",   label:"Foto tipo selfie"},
      {id:"con_cedula",   label:"Cédula (ambos lados)"},
      {id:"con_licencia", label:"Licencia de conducir"},
      {id:"con_banco",    label:"Cert. bancaria (opcional)"},
      {id:"con_arl",      label:"ARL"},
      {id:"con_segpens",  label:"Seguridad y pensión"},
    ],
    campos: [
      {id:"con_dir",    label:"Dirección",          tipo:"text",  placeholder:"Cra. 1 # 2-3"},
      {id:"con_tel",    label:"Teléfono",            tipo:"tel",   placeholder:"+57 300 000 0000"},
      {id:"con_correo", label:"Correo electrónico",  tipo:"email", placeholder:"correo@ejemplo.com"},
      {id:"con_ref",    label:"Referencia familiar", tipo:"text",  placeholder:"Nombre y teléfono"},
      {id:"con_telref", label:"Telefono referencia familiar", tipo:"tel", placeholder:"+57 300 000 0000"},
    ],
  },
];

function DetalleVehiculo({ vehiculos, viajes = [], mantenimientos = [], configMant = [], gastosVehiculo = [], onAgregarMant, onEliminarMant, onAgregarConfig, onEliminarConfig, onEditarVehiculo, onAgregarGasto, onEliminarGasto, mostrarToast }) {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const [tabActivo, setTabActivo] = useState("info");
  const [filtro,    setFiltro]    = useState("todos");
  const [busquedaH, setBusquedaH] = useState("");
  const hoy = new Date();
  const [mesActual,  setMesActual]  = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());

  const claveMetaLocal = `meta_${id}`;
  const [metaMensual,  setMetaMensual]  = useState(() => Number(localStorage.getItem(claveMetaLocal))||0);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaTemp,     setMetaTemp]     = useState("");

  const claveHVLocal = `hv_${id}`;
  const [hvData, setHvData] = useState(() => {
    const g = localStorage.getItem(claveHVLocal);
    return g ? JSON.parse(g) : {};
  });
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({propietario:true,tenedor:false,vehiculo:false,conductor:false});

  const { subirArchivo, eliminarArchivo, progreso: progresoArchivo, subiendo } = useSubirArchivo();

  const [editando,      setEditando]      = useState(false);
  const [editData,      setEditData]      = useState({});
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  const [gastoDesc,     setGastoDesc]     = useState("");
  const [gastoMonto,    setGastoMonto]    = useState("");
  const [gastoFecha,    setGastoFecha]    = useState(new Date().toISOString().slice(0,10));
  const [guardandoGasto,setGuardandoGasto]= useState(false);
  const [verFormGasto,  setVerFormGasto]  = useState(false);


  const [kmOdometro,    setKmOdometro]    = useState(() => Number(localStorage.getItem(`km_${id}`))||0);
  const [editandoKm,    setEditandoKm]    = useState(false);
  const [kmTemp,        setKmTemp]        = useState("");
  const [tipoMant,      setTipoMant]      = useState("Cambio de aceite");
  const [kmMant,        setKmMant]        = useState("");
  const [costoMant,     setCostoMant]     = useState("");
  const [fechaMant,     setFechaMant]     = useState(new Date().toISOString().slice(0,10));
  const [notaMant,      setNotaMant]      = useState("");
  const [guardandoMant, setGuardandoMant] = useState(false);

  const guardarKm = () => {
  const val = Number(kmTemp)||0;
  setKmOdometro(val);
  localStorage.setItem(`km_${id}`, val);
  setEditandoKm(false);
  setKmTemp("");
};

const guardarMantenimiento = async () => {
  if (!kmMant) { mostrarToast("Ingresa el km al realizar el mantenimiento", "error"); return; }
  setGuardandoMant(true);
  try {
    await onAgregarMant({
      vehiculoId: id,
      placa: vehiculo.placa,
      tipo: tipoMant,
      km: Number(kmMant),
      costo: Number(costoMant)||0,
      fecha: fechaMant,
      nota: notaMant.trim(),
    });
    mostrarToast("Mantenimiento registrado", "exito");
    setKmMant(""); setCostoMant(""); setNotaMant("");
  } catch(err) {
    mostrarToast("Error al guardar", "error");
  } finally {
    setGuardandoMant(false);
  }
};

  const vehiculo = vehiculos.find(v => String(v.firestoreId) === String(id));

const mantVehiculo = mantenimientos.filter(m => m.placa === vehiculo?.placa);

  const kmActual = viajes
  .filter(v => v.placa === vehiculo?.placa)
  .reduce((max, v) => Math.max(max, v.kmT || 0), 0);

  const fmt  = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const fnD  = (n,d) => (Math.round(n*Math.pow(10,d))/Math.pow(10,d)).toLocaleString("es-CO",{maximumFractionDigits:d});

  if (!vehiculo) {
    return (
      <div style={styles.pantalla}>
        <div style={styles.header}>
          <button style={styles.btnVolver} onClick={()=>navigate("/vehiculos")}>
            <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
            <span>Volver</span>
          </button>
        </div>
        <div style={styles.noEncontrado}>
          <Truck size={48} color={t.colors.textTertiary} strokeWidth={1.5} />
          <p style={{marginTop:"12px", color:t.colors.textSecondary}}>Vehículo no encontrado.</p>
        </div>
      </div>
    );
  }

  const viajesVehiculo = viajes.filter(v => v.placa === vehiculo.placa);
  const totalViajes    = viajesVehiculo.length;
  const gananciaNeta   = viajesVehiculo.reduce((s,v)=>s+(v.neta||0),0);

  // Tab Viajes
  const hoyFiltro = new Date();
  const viajesFiltrados = viajesVehiculo.filter(v => {
    const f = new Date(v.fecha);
    if (filtro==="mes")    return f.getMonth()===hoyFiltro.getMonth()&&f.getFullYear()===hoyFiltro.getFullYear();
    if (filtro==="semana") { const h=new Date(); h.setDate(hoyFiltro.getDate()-7); return f>=h; }
    return true;
  });

  // Tab Cuentas
  const viajesMes    = viajesVehiculo.filter(v => { const f=new Date(v.fecha); return f.getMonth()===mesActual&&f.getFullYear()===anioActual; });
  const ingresosMes  = viajesMes.reduce((s,v)=>s+(v.vViaje||0),0);
  const gastosMes    = viajesMes.reduce((s,v)=>s+(v.total||0),0);
  const netaMes      = viajesMes.reduce((s,v)=>s+(v.neta||0),0);
  const acpmMes      = viajesMes.reduce((s,v)=>s+(v.cAcpm||0),0);
  const adblMes      = viajesMes.reduce((s,v)=>s+(v.cAdbl||0),0);
  const peajesMes    = viajesMes.reduce((s,v)=>s+(v.peajes||0),0);
  const conductorMes = viajesMes.reduce((s,v)=>s+(v.conductor||0),0);
  const otrosMes     = viajesMes.reduce((s,v)=>s+(v.carp||0)+(v.gv2||0)+(v.extras||0),0);
  const progreso     = metaMensual>0 ? Math.min((netaMes/metaMensual)*100,100) : 0;
  const progresoColor= progreso>=100?t.colors.green:progreso>=50?t.colors.amber:t.colors.red;

  const cambiarMes = (dir) => {
    let m=mesActual+dir, a=anioActual;
    if (m>11){m=0;a++;}
    if (m<0){m=11;a--;}
    setMesActual(m); setAnioActual(a);
  };

  const guardarMeta = () => {
    const val = Number(metaTemp)||0;
    setMetaMensual(val);
    localStorage.setItem(claveMetaLocal, val);
    setEditandoMeta(false); setMetaTemp("");
  };

  // Tab Historial
  const viajesBuscados = viajesVehiculo.filter(v => {
    const q = busquedaH.toLowerCase();
    if (!q) return true;
    return (v.ruta||"").toLowerCase().includes(q)||(v.mani||"").toLowerCase().includes(q);
  }).sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));

  const viajesAgrupadosPorMes = viajesBuscados.reduce((grupos,viaje)=>{
    const f  = new Date(viaje.fecha);
    const et = `${MESES[f.getMonth()]} ${f.getFullYear()}`;
    const ex = grupos.find(g=>g.etiqueta===et);
    if (ex) ex.viajes.push(viaje);
    else grupos.push({etiqueta:et, viajes:[viaje]});
    return grupos;
  },[]);

  // Hoja de vida
  const actualizarHV = (clave, valor) => {
    const nuevo = {...hvData, [clave]:valor};
    setHvData(nuevo);
    localStorage.setItem(claveHVLocal, JSON.stringify(nuevo));
  };

  const manejarArchivo = (e, docId) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const ruta = `vehiculos/${id}/${docId}_${Date.now()}`;
    subirArchivo(archivo, ruta, docId, (url) => {
      actualizarHV(docId, {estado:"cargado", url, ruta, nombre:archivo.name});
    });
  };

  const manejarEliminar = (docId) => {
    const doc = hvData[docId];
    if (!doc||!doc.ruta) { actualizarHV(docId,"pendiente"); return; }
    if (!window.confirm("¿Eliminar este documento?")) return;
    eliminarArchivo(doc.ruta, ()=>actualizarHV(docId,"pendiente"));
  };

  const iniciarEdicion = () => {
    setEditData({
      tipoVehiculo:  vehiculo.tipoVehiculo  || "",
      tipoRemolque:  vehiculo.tipoRemolque  || "",
      placa:         vehiculo.placa          || "",
      placaRemolque: vehiculo.placaRemolque  || "",
      marca:         vehiculo.marca          || "",
      modelo:        vehiculo.modelo         || "",
      propietario:   vehiculo.propietario    || "",
      tenedor:       vehiculo.tenedor        || "",
      fotoUrl:       vehiculo.fotoUrl        || "",
    });
    setEditando(true);
  };

  const guardarEdicion = async () => {
    if (!editData.tipoVehiculo) { mostrarToast("Selecciona el tipo de vehículo","error"); return; }
    if (!editData.placa.trim()) { mostrarToast("La placa es obligatoria","error"); return; }
    if (!editData.propietario.trim()) { mostrarToast("El propietario es obligatorio","error"); return; }
    const placaNueva = editData.placa.trim().toUpperCase();
    if (placaNueva !== vehiculo.placa && vehiculos.find(v => v.placa.toLowerCase() === placaNueva.toLowerCase())) {
      mostrarToast("Ya existe un vehículo con esa placa","error"); return;
    }
    setGuardandoEdit(true);
    try {
      await onEditarVehiculo(vehiculo.firestoreId, {
        ...editData,
        placa: placaNueva,
        placaRemolque: editData.placaRemolque.trim().toUpperCase(),
        propietario: editData.propietario.trim(),
        tenedor: editData.tenedor.trim(),
      });
      mostrarToast("Vehículo actualizado","exito");
      setEditando(false);
    } catch(err) {
      mostrarToast("Error al guardar","error");
    } finally {
      setGuardandoEdit(false);
    }
  };

  const cambiarFotoVehiculo = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const ruta = `vehiculos/${Date.now()}_${archivo.name}`;
    subirArchivo(archivo, ruta, "fotoVehiculo", async (url) => {
      try {
        await onEditarVehiculo(vehiculo.firestoreId, { fotoUrl: url });
        mostrarToast("Foto actualizada","exito");
      } catch(err) {
        mostrarToast("Error al cambiar foto","error");
      }
    });
  };

  const contarDocumentos = (seccion) => {
    const total   = seccion.documentos.length;
    const cargados= seccion.documentos.filter(d=>hvData[d.id]&&hvData[d.id].estado==="cargado").length;
    return {total, cargados};
  };

  const tabs = [
  {id:"info",      label:"Info",    Icono:Info},
  {id:"viajes",    label:"Viajes",  Icono:Route},
  {id:"cuentas",   label:"Cuentas", Icono:TrendingUp},
  {id:"historial", label:"Historial",Icono:Clock},
  {id:"mant",      label:"Mant.",   Icono:Wrench},
  {id:"hvida",     label:"H.Vida",  Icono:FileText},
];

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate("/vehiculos")}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Vehículos</span>
        </button>
      </div>

      {/* BLOQUE SUPERIOR */}
      <div style={styles.bloqueTop}>
        <div style={styles.vehiculoFila}>
          <div style={{position:"relative"}}>
            {vehiculo.fotoUrl ? (
              <img src={vehiculo.fotoUrl} alt={vehiculo.placa} style={{width:"50px",height:"50px",borderRadius:t.radius.md,objectFit:"cover"}} />
            ) : (
              <div style={styles.vehiculoIconoWrap}>
                <Truck size={26} color={t.colors.blue} strokeWidth={1.8} />
              </div>
            )}
            <label style={{position:"absolute",bottom:"-4px",right:"-4px",width:"22px",height:"22px",borderRadius:"50%",background:t.colors.blue,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`2px solid ${t.colors.bgCard}`}}>
              <Camera size={11} color="#fff" strokeWidth={2.5} />
              <input type="file" accept="image/*" style={{display:"none"}} onChange={cambiarFotoVehiculo} />
            </label>
          </div>
          <div>
            <p style={styles.vehiculoPlaca}>{vehiculo.placa}</p>
            <p style={styles.vehiculoTipo}>
              {vehiculo.tipoVehiculo}
              {vehiculo.tipoRemolque?` · ${vehiculo.tipoRemolque}`:""}
            </p>
          </div>
        </div>
        <div style={styles.metricas}>
          <div style={styles.metrica}>
            <p style={styles.metricaVal}>{totalViajes}</p>
            <p style={styles.metricaLabel}>Viajes totales</p>
          </div>
          <div style={styles.metricaSep} />
          <div style={styles.metrica}>
            <p style={{...styles.metricaVal, color:gananciaNeta>=0?t.colors.green:t.colors.red}}>
              {fmt(gananciaNeta)}
            </p>
            <p style={styles.metricaLabel}>Ganancia neta</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabsWrap}>
        {tabs.map(tab => {
          const activo = tabActivo===tab.id;
          return (
            <button
              key={tab.id}
              style={{...styles.tab, ...(activo?styles.tabActivo:{})}}
              onClick={()=>setTabActivo(tab.id)}
            >
              <tab.Icono size={14} color={activo?t.colors.blue:t.colors.textTertiary} strokeWidth={activo?2.5:1.8} />
              <span style={{color:activo?t.colors.blue:t.colors.textTertiary, 
                fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.04em",
                fontWeight: activo ? t.fonts.weightBold : t.fonts.weightMedium,
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTENIDO */}
      <div style={styles.contenido}>

        {/* ── INFO ── */}
        {tabActivo==="info" && (
          <div style={styles.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <p style={{...styles.cardTitulo,margin:0}}>Información del vehículo</p>
              {!editando ? (
                <button style={{display:"flex",alignItems:"center",gap:"5px",padding:"6px 12px",background:t.colors.blueSoft,border:`1.5px solid ${t.colors.blueBorder}`,borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:t.colors.blue,cursor:"pointer"}} onClick={iniciarEdicion}>
                  <Edit2 size={12} /> Editar
                </button>
              ) : (
                <div style={{display:"flex",gap:"6px"}}>
                  <button style={{display:"flex",alignItems:"center",gap:"4px",padding:"6px 12px",background:t.colors.green,border:"none",borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:"#fff",cursor:"pointer",opacity:guardandoEdit?0.75:1}} onClick={guardarEdicion} disabled={guardandoEdit}>
                    <Save size={12} /> {guardandoEdit?"Guardando...":"Guardar"}
                  </button>
                  <button style={{display:"flex",alignItems:"center",gap:"4px",padding:"6px 12px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,cursor:"pointer"}} onClick={()=>setEditando(false)}>
                    <X size={12} /> Cancelar
                  </button>
                </div>
              )}
            </div>

            {!editando ? (
              <>
                {[
                  {label:"Tipo de vehículo", valor:vehiculo.tipoVehiculo},
                  {label:"Tipo de remolque", valor:vehiculo.tipoRemolque},
                  {label:"Placa vehículo",   valor:vehiculo.placa},
                  {label:"Placa remolque",   valor:vehiculo.placaRemolque},
                  {label:"Marca",            valor:vehiculo.marca},
                  {label:"Modelo",           valor:vehiculo.modelo},
                  {label:"Propietario",      valor:vehiculo.propietario},
                  {label:"Tenedor",          valor:vehiculo.tenedor},
                ].map((item,i,arr)=>(
                  <div key={item.label} style={{...styles.fila, borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                    <span style={styles.filaLabel}>{item.label}</span>
                    <span style={styles.filaValor}>{item.valor||"—"}</span>
                  </div>
                ))}
              </>
            ) : (
              <div>
                <div style={styles.campo}>
                  <label style={styles.label}>Tipo de vehículo *</label>
                  <select value={editData.tipoVehiculo} onChange={e=>setEditData({...editData,tipoVehiculo:e.target.value})}
                    style={{...styles.input, color:editData.tipoVehiculo?t.colors.textPrimary:t.colors.textTertiary}}>
                    <option value="">Seleccionar...</option>
                    {["CUATRO MANOS","DOBLETROQUE","PATINETA 2S2","PATINETA 2S3","SENCILLO","TRACTOMULA 3S2","TRACTOMULA 3S3","TURBO","TURBO SENCILLO","VOLQUETA","OTRO"].map(o=>(
                      <option key={o} value={o}>{o.charAt(0)+o.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Tipo de remolque</label>
                  <select value={editData.tipoRemolque} onChange={e=>setEditData({...editData,tipoRemolque:e.target.value})}
                    style={{...styles.input, color:editData.tipoRemolque?t.colors.textPrimary:t.colors.textTertiary}}>
                    <option value="">Sin remolque</option>
                    {["BOTELLERO","CAMA BAJA","CISTERNA","CONTENEDOR","CARROCERIA","FURGON","FURGON REFRIGERADO","NIÑERA","PLANCHA","PORTA CONTENEDORES","VOLCO AUTODESCARGABLE","OTRO"].map(o=>(
                      <option key={o} value={o}>{o.charAt(0)+o.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Placa vehículo *</label>
                    <input type="text" value={editData.placa} maxLength={6}
                      onChange={e=>setEditData({...editData,placa:e.target.value.toUpperCase()})} style={styles.input} />
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Placa remolque</label>
                    <input type="text" value={editData.placaRemolque}
                      onChange={e=>setEditData({...editData,placaRemolque:e.target.value.toUpperCase()})} style={styles.input} />
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Marca</label>
                    <select value={editData.marca} onChange={e=>setEditData({...editData,marca:e.target.value})}
                      style={{...styles.input, color:editData.marca?t.colors.textPrimary:t.colors.textTertiary}}>
                      <option value="">Seleccionar...</option>
                      {["AUTOCAR","ASTRA","BERLIET","BARREIROS","BElAZ","BYD","C.C.C","CATERPILLAR","CARIBE","CHANGAN","CHANGFENG","CITROEN","CHERY","CHEVROLET","CMC","DAEWOO","DAF","DAIHATSU","DFSK","DONGFENG","FAW","FORD","FOTON","FOTON AUMAN","FIAT","FREIGHTLINER","FUTONG","FWD","GMC","HINO","HITACHI","HYUNDAI","INTERNATIONAL","ISUZU","IVECO","JAC","JMC","KAMAZ","KENWORTH","KIA","KING LONG","KOMATSU","KRAZ","LIUGONG","MACK","MAN","MARCOPOLO","MASSEY FERGUSON","MAZDA","MERCEDES BENZ","MITSUBISHI","MG","NISSAN","PEGASSO","PEUGEOT","PETERBILT","RAM","RENAULT","SCANIA","SHACMAN","SINOTRUK","SITRACK","VOLKSWAGEN","VOLVO","WESTERN STAR","YUTONG","OTRO"].map(o=>(
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Modelo (año)</label>
                    <input type="number" value={editData.modelo} min="1970" max="2100"
                      onChange={e=>setEditData({...editData,modelo:e.target.value})} style={styles.input} />
                  </div>
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Propietario *</label>
                  <input type="text" value={editData.propietario}
                    onChange={e=>setEditData({...editData,propietario:e.target.value})} style={styles.input} />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Tenedor</label>
                  <input type="text" value={editData.tenedor}
                    onChange={e=>setEditData({...editData,tenedor:e.target.value})} style={styles.input} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── VIAJES ── */}
        {tabActivo==="viajes" && (
          <div>
            <div style={styles.chips}>
              {[{id:"todos",label:"Todos"},{id:"mes",label:"Este mes"},{id:"semana",label:"Esta semana"}].map(f=>(
                <button key={f.id} style={{...styles.chip,...(filtro===f.id?styles.chipActivo:{})}} onClick={()=>setFiltro(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
            {viajesFiltrados.length===0?(
              <div style={styles.vacio}>
                <Route size={40} color={t.colors.textTertiary} strokeWidth={1.5} />
                <p style={styles.vacioTexto}>Sin viajes registrados</p>
                <p style={styles.vacioSub}>Los viajes aparecerán aquí cuando uses la calculadora.</p>
              </div>
            ):(
              viajesFiltrados.map(viaje=>{
                const ok=(viaje.mrg||0)>=25;
                return (
                  <div key={viaje.firestoreId} style={styles.tarjetaViaje} onClick={()=>navigate(`/viaje/${viaje.firestoreId}`)}>
                    <div style={{...styles.tarjetaFranja, background:ok?t.colors.green:t.colors.amber}} />
                    <div style={styles.tarjetaViajeContenido}>
                      <div style={{flex:1, minWidth:0}}>
                        <p style={styles.tarjetaRuta}>{viaje.ruta||"Sin ruta"}</p>
                        <p style={styles.tarjetaMeta}>{viaje.fecha||""}{viaje.empresa?` · ${viaje.empresa}`:""}</p>
                      </div>
                      <p style={{...styles.tarjetaNeta, color:(viaje.neta||0)>=0?t.colors.green:t.colors.red}}>
                        {(viaje.neta||0)>=0?"+":""}{fmt(viaje.neta||0)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── CUENTAS ── */}
        {tabActivo==="cuentas" && (
          <div>
            {/* Nav mes */}
            <div style={styles.navMes}>
              <button style={styles.btnMes} onClick={()=>cambiarMes(-1)}>‹</button>
              <p style={styles.labelMes}>{MESES[mesActual]} {anioActual}</p>
              <button style={styles.btnMes} onClick={()=>cambiarMes(1)}>›</button>
            </div>

            {/* Ganancia + meta */}
            <div style={styles.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <p style={styles.cardTitulo}>Ganancia neta del mes</p>
                  <p style={{fontSize:"28px",fontWeight:t.fonts.weightBlack,margin:0,color:netaMes>=0?t.colors.green:t.colors.red}}>
                    {fmt(netaMes)}
                  </p>
                </div>
                <button
                  style={styles.btnMeta}
                  onClick={()=>{setEditandoMeta(true);setMetaTemp(metaMensual>0?String(metaMensual):"");}}
                >
                  {metaMensual>0?"Editar ":"+ Meta"}
                </button>
              </div>

              {editandoMeta && (
                <div style={styles.editarMeta}>
                  <p style={styles.cardTitulo}>PUNTO EQUILIBRIO MENSUAL</p>
                  <input type="number" placeholder="Ej: 5000000" value={metaTemp}
                    onChange={e=>setMetaTemp(e.target.value)} style={styles.input} autoFocus />
                  <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
                    <button style={styles.btnGuardarMeta} onClick={guardarMeta}>Guardar</button>
                    <button style={styles.btnCancelarMeta} onClick={()=>setEditandoMeta(false)}>Cancelar</button>
                  </div>
                </div>
              )}

              {metaMensual>0&&!editandoMeta&&(
                <div style={{marginTop:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                    <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>{progreso.toFixed(0)}% del objetivo</span>
                    <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>Punto equilibirio mensual: {fmt(metaMensual)}</span>
                  </div>
                  <div style={styles.barraFondo}>
                    <div style={{...styles.barraRelleno,width:`${progreso}%`,background:progresoColor}} />
                  </div>
                </div>
              )}
            </div>

            {/* Ingresos y gastos */}
            <div style={styles.dosColumnas}>
              <div style={styles.metricaCard}>
                <p style={styles.metricaCardLabel}>Ingresos brutos</p>
                <p style={{...styles.metricaCardVal,color:t.colors.blue}}>{fmt(ingresosMes)}</p>
              </div>
              <div style={styles.metricaCard}>
                <p style={styles.metricaCardLabel}>Total gastos de viaje</p>
                <p style={{...styles.metricaCardVal,color:t.colors.red}}>{fmt(gastosMes)}</p>
              </div>
            </div>

            {/* Distribución */}
            {gastosMes>0&&(
              <div style={styles.card}>
                <p style={styles.cardTitulo}>Distribución de gastos de viaje</p>
                {[
                  {label:"ACPM",      valor:acpmMes,      color:"#3B82F6"},
                  {label:"Adblue",    valor:adblMes,      color:"#8B5CF6"},
                  {label:"Peajes",    valor:peajesMes,    color:t.colors.amber},
                  {label:"Conductor", valor:conductorMes, color:t.colors.green},
                  {label:"Otros",     valor:otrosMes,     color:t.colors.textTertiary},
                ].filter(item=>item.valor>0).map(item=>{
                  const pct=Math.round((item.valor/gastosMes)*100);
                  return (
                    <div key={item.label} style={{marginBottom:"12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                        <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>{item.label}</span>
                        <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold}}>
                          {fmt(item.valor)} <span style={{color:t.colors.textTertiary,fontWeight:t.fonts.weightNormal}}>{pct}%</span>
                        </span>
                      </div>
                      <div style={{height:"5px",borderRadius:"3px",background:t.colors.bgSection,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:"3px",background:item.color,width:`${pct}%`,transition:"width 0.4s ease"}} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Estado vacío */}
            {viajesMes.length===0&&(
              <div style={styles.vacio}>
                <TrendingUp size={40} color={t.colors.textTertiary} strokeWidth={1.5} />
                <p style={styles.vacioTexto}>Sin datos este mes</p>
                <p style={styles.vacioSub}>Registra viajes para ver tus cuentas aquí.</p>
              </div>
            )}

            {/* Viajes del mes */}
            {viajesMes.length>0&&(
              <div style={styles.card}>
                <p style={styles.cardTitulo}>{viajesMes.length} viaje{viajesMes.length!==1?"s":""} este mes</p>
                {[...viajesMes].reverse().map((viaje,i,arr)=>(
                  <div key={viaje.firestoreId}
                    style={{...styles.fila,borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`,cursor:"pointer"}}
                    onClick={()=>navigate(`/viaje/${viaje.firestoreId}`)}
                  >
                    <div>
                      <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,margin:0,color:t.colors.textPrimary}}>{viaje.ruta||"Sin ruta"}</p>
                      <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>{viaje.fecha||""}</p>
                    </div>
                    <p style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBold,margin:0,color:(viaje.neta||0)>=0?t.colors.green:t.colors.red}}>
                      {fmt(viaje.neta||0)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ── GASTOS Y FACTURAS DEL VEHÍCULO ── */}
            {(() => {
              const gastosMesVeh = gastosVehiculo.filter(g => {
                if (g.vehiculoId !== id) return false;
                const f = new Date(g.fecha);
                return f.getMonth() === mesActual && f.getFullYear() === anioActual;
              });
              const totalGastosFijos = gastosMesVeh.reduce((s, g) => s + (g.monto || 0), 0);
              const balanceFinal = netaMes - totalGastosFijos;

              return (
                <>
                  {/* Balance final */}
                  <div style={{...styles.card, border:`1.5px solid ${balanceFinal >= 0 ? t.colors.greenBorder : t.colors.redBorder}`}}>
                    <p style={styles.cardTitulo}>Balance final del mes</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${t.colors.borderLight}`}}>
                      <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>GANANCIA VIAJES</span>
                      <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:netaMes>=0?t.colors.green:t.colors.red}}>{fmt(netaMes)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${t.colors.borderLight}`}}>
                      <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>FACTURAS Y GASTOS</span>
                      <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:totalGastosFijos>0?t.colors.red:t.colors.textTertiary}}>
                        {totalGastosFijos > 0 ? `-${fmt(totalGastosFijos)}` : fmt(0)}
                      </span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0 0"}}>
                      <span style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary}}>UTILIDAD</span>
                      <span style={{fontSize:"22px",fontWeight:t.fonts.weightBlack,color:balanceFinal>=0?t.colors.green:t.colors.red}}>
                        {fmt(balanceFinal)}
                      </span>
                    </div>
                  </div>

                  {/* Lista de gastos + formulario */}
                  <div style={styles.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                      <p style={{...styles.cardTitulo,margin:0}}>Gastos y facturas</p>
                      <button
                        style={{padding:"6px 12px",background:t.colors.blueSoft,border:`1.5px solid ${t.colors.blueBorder}`,borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:t.colors.blue,cursor:"pointer"}}
                        onClick={()=>setVerFormGasto(!verFormGasto)}
                      >
                        {verFormGasto ? "Cancelar" : "+ Agregar"}
                      </button>
                    </div>

                    {verFormGasto && (
                      <div style={{background:t.colors.bgSection,borderRadius:t.radius.sm,padding:"12px",marginBottom:"12px"}}>
                        <div style={styles.campo}>
                          <label style={styles.label}>Descripción</label>
                          <input type="text" placeholder="Ej: Cuota camión, Seguro, GPS..."
                            value={gastoDesc} onChange={e=>setGastoDesc(e.target.value)} style={styles.input} />
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                          <div style={styles.campo}>
                            <label style={styles.label}>Monto</label>
                            <input type="number" placeholder="500000"
                              value={gastoMonto} onChange={e=>setGastoMonto(e.target.value)} style={styles.input} />
                          </div>
                          <div style={styles.campo}>
                            <label style={styles.label}>Fecha</label>
                            <input type="date" value={gastoFecha}
                              onChange={e=>setGastoFecha(e.target.value)} style={styles.input} />
                          </div>
                        </div>
                        <button
                          style={{width:"100%",padding:"11px",background:t.colors.blue,color:"#fff",border:"none",borderRadius:t.radius.sm,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",opacity:guardandoGasto?0.75:1}}
                          disabled={guardandoGasto}
                          onClick={async()=>{
                            if (!gastoDesc.trim()) { mostrarToast("Ingresa una descripción","error"); return; }
                            if (!gastoMonto || Number(gastoMonto)<=0) { mostrarToast("Ingresa un monto válido","error"); return; }
                            setGuardandoGasto(true);
                            try {
                              await onAgregarGasto({
                                vehiculoId: id,
                                placa: vehiculo.placa,
                                descripcion: gastoDesc.trim(),
                                monto: Number(gastoMonto),
                                fecha: gastoFecha,
                              });
                              mostrarToast("Gasto registrado","exito");
                              setGastoDesc(""); setGastoMonto(""); setGastoFecha(new Date().toISOString().slice(0,10));
                              setVerFormGasto(false);
                            } catch(err) {
                              mostrarToast("Error al guardar","error");
                            } finally {
                              setGuardandoGasto(false);
                            }
                          }}
                        >
                          Guardar gasto
                        </button>
                      </div>
                    )}

                    {gastosMesVeh.length === 0 && !verFormGasto && (
                      <p style={{fontSize:t.fonts.sizeSm,color:t.colors.textTertiary,textAlign:"center",padding:"12px 0",margin:0}}>
                        Sin gastos registrados este mes
                      </p>
                    )}

                    {gastosMesVeh.map((g, i, arr) => (
                      <div key={g.firestoreId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>{g.descripcion}</p>
                          <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>{g.fecha}</p>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:t.colors.red}}>-{fmt(g.monto)}</span>
                          <button
                            style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}}
                            onClick={async()=>{
                              try {
                                await onEliminarGasto(g.firestoreId);
                                mostrarToast("Gasto eliminado","exito");
                              } catch(err) {
                                mostrarToast("Error al eliminar","error");
                              }
                            }}
                          >
                            <Trash2 size={14} color={t.colors.textTertiary} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tabActivo==="historial" && (
          <div>
            <div style={styles.buscadorWrap}>
              <input type="text" placeholder="Buscar por ruta o manifiesto..."
                value={busquedaH} onChange={e=>setBusquedaH(e.target.value)} style={styles.buscadorInput} />
            </div>

            {viajesVehiculo.length===0&&(
              <div style={styles.vacio}>
                <Clock size={40} color={t.colors.textTertiary} strokeWidth={1.5} />
                <p style={styles.vacioTexto}>Sin historial todavía</p>
                <p style={styles.vacioSub}>Los viajes guardados aparecerán aquí.</p>
              </div>
            )}

            {viajesVehiculo.length>0&&viajesBuscados.length===0&&(
              <div style={styles.vacio}>
                <p style={styles.vacioTexto}>Sin resultados</p>
                <p style={styles.vacioSub}>No hay viajes con "{busquedaH}"</p>
              </div>
            )}

            {viajesAgrupadosPorMes.map(grupo=>(
              <div key={grupo.etiqueta} style={{marginBottom:"6px"}}>
                <p style={styles.grupoMes}>{grupo.etiqueta}</p>
                {grupo.viajes.map(viaje=>{
                  const ok=(viaje.mrg||0)>=25;
                  return (
                    <div key={viaje.firestoreId} style={styles.tarjetaViaje} onClick={()=>navigate(`/viaje/${viaje.firestoreId}`)}>
                      <div style={{...styles.tarjetaFranja,background:ok?t.colors.green:t.colors.amber}} />
                      <div style={styles.tarjetaViajeContenido}>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={styles.tarjetaRuta}>{viaje.ruta||"Sin ruta"}</p>
                          <p style={styles.tarjetaMeta}>
                            {viaje.fecha||""}
                            {viaje.ton?` · ${fnD(viaje.ton,1)} ton`:""}
                            {viaje.mani?` · Man. ${viaje.mani}`:""}
                          </p>
                        </div>
                        <p style={{...styles.tarjetaNeta,color:(viaje.neta||0)>=0?t.colors.green:t.colors.red}}>
                          {(viaje.neta||0)>=0?"+":""}{fmt(viaje.neta||0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── MANTENIMIENTO ── */}
{tabActivo==="mant" && (
  <div>

    {/* ODÓMETRO */}
    <div style={styles.card}>
      <p style={styles.cardTitulo}>Odómetro actual</p>
      {!editandoKm ? (
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <p style={{fontSize:"28px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:0}}>
              {(kmOdometro||kmActual).toLocaleString("es-CO")} km
            </p>
            <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"4px 0 0"}}>
              Actualiza el km cada vez que tanqueas
            </p>
          </div>
          <button
            style={{padding:"8px 14px", background:t.colors.blueSoft, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.blue, cursor:"pointer"}}
            onClick={()=>{setEditandoKm(true); setKmTemp(String(kmOdometro||kmActual));}}
          >
            Actualizar
          </button>
        </div>
      ) : (
        <div>
          <input type="number" value={kmTemp} onChange={e=>setKmTemp(e.target.value)}
            placeholder="Km actual" style={{...styles.input, marginBottom:"8px"}} autoFocus />
          <div style={{display:"flex", gap:"8px"}}>
            <button style={{flex:1, padding:"10px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer"}}
              onClick={guardarKm}>Guardar</button>
            <button style={{padding:"10px 14px", background:"none", border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, cursor:"pointer", color:t.colors.textSecondary, fontSize:t.fonts.sizeSm}}
              onClick={()=>setEditandoKm(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>

    {/* ALERTAS PERSONALIZADAS */}
    {configMant.filter(c => c.vehiculoId === id).length > 0 && (
      <div style={styles.card}>
        <p style={styles.cardTitulo}>Alertas de mantenimiento</p>
        {configMant.filter(c => c.vehiculoId === id).map(item => {
          const ultimoMant = mantVehiculo
            .filter(m => m.configId === item.firestoreId)
            .sort((a,b) => b.km - a.km)[0];
          const ultimoKm    = ultimoMant ? ultimoMant.km : 0;
          const proximoKm   = ultimoKm + item.intervalo;
          const kmRef       = kmOdometro || kmActual;
          const kmFaltantes = proximoKm - kmRef;
          const pct         = Math.max(0, Math.min(100, ((item.intervalo - kmFaltantes) / item.intervalo) * 100));
          const vencido     = kmFaltantes <= 0;
          const proximo     = kmFaltantes > 0 && kmFaltantes <= (item.alerta || 2000);
          const estado      = vencido ? "vencido" : proximo ? "proximo" : "ok";
          const colorMap    = {
            vencido: {bg:t.colors.redSoft,   border:t.colors.redBorder,   text:t.colors.red,   label:"Vencido"},
            proximo: {bg:t.colors.amberSoft, border:"#FDE68A",            text:t.colors.amber, label:"Próximo"},
            ok:      {bg:t.colors.greenSoft, border:t.colors.greenBorder, text:t.colors.green, label:"Al día"},
          };
          const c = colorMap[estado];
          return (
            <div key={item.firestoreId} style={{marginBottom:"14px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px"}}>
                <div>
                  <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>{item.nombre}</p>
                  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"2px 0 0"}}>
                    {vencido ? `Venció hace ${Math.abs(kmFaltantes).toLocaleString("es-CO")} km` : `Faltan ${kmFaltantes.toLocaleString("es-CO")} km`}
                  </p>
                </div>
                <span style={{fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, padding:"3px 10px", borderRadius:t.radius.full, background:c.bg, color:c.text, border:`0.5px solid ${c.border}`, whiteSpace:"nowrap"}}>
                  {c.label}
                </span>
              </div>
              <div style={{height:"5px", borderRadius:"3px", background:t.colors.bgSection, overflow:"hidden"}}>
                <div style={{height:"100%", borderRadius:"3px", background:c.text, width:`${Math.round(pct)}%`, transition:"width 0.4s ease"}} />
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* AGREGAR ALERTA */}
    <div style={styles.card}>
      <p style={styles.cardTitulo}>Agregar ítem de mantenimiento</p>
      <div style={styles.campo}>
        <label style={styles.label}>Nombre</label>
        <input type="text" placeholder="Ej: Cambio de aceite, Filtro de aire..."
          value={tipoMant} onChange={e=>setTipoMant(e.target.value)} style={styles.input}/>
      </div>
      <div style={styles.fila2}>
        <div style={styles.campo}>
          <label style={styles.label}>Intervalo (km)</label>
          <input type="number" placeholder="15000" value={kmMant}
            onChange={e=>setKmMant(e.target.value)} style={styles.input}/>
        </div>
        <div style={styles.campo}>
          <label style={styles.label}>Alerta a (km antes)</label>
          <input type="number" placeholder="2000" value={costoMant}
            onChange={e=>setCostoMant(e.target.value)} style={styles.input}/>
        </div>
      </div>
      <button
        style={{width:"100%", padding:"12px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", opacity:guardandoMant?0.75:1}}
        onClick={async()=>{
          if (!tipoMant.trim()) { mostrarToast("Ingresa el nombre del ítem","error"); return; }
          setGuardandoMant(true);
          await onAgregarConfig({
            vehiculoId: id,
            placa: vehiculo.placa,
            nombre: tipoMant.trim(),
            intervalo: Number(kmMant)||15000,
            alerta: Number(costoMant)||2000,
          });
          setTipoMant(""); setKmMant(""); setCostoMant("");
          mostrarToast("Ítem agregado","exito");
          setGuardandoMant(false);
        }}
        disabled={guardandoMant}
      >
        + Agregar ítem
      </button>
    </div>

    {/* MÓDULOS DE DETALLE */}
    <div style={styles.card}>
      <p style={styles.cardTitulo}>Módulos de detalle</p>
      {[
        {label:"Llantas",  sub:"Diagrama y estado por posición", ruta:`/vehiculo/${id}/llantas`,       icono:"🛞"},
        {label:"Aceite",   sub:"Marca, viscosidad y cambios",    ruta:`/vehiculo/${id}/aceite`,        icono:"🛢️"},
        {label:"Filtros",  sub:"Aire, combustible, lubricación", ruta:`/vehiculo/${id}/filtros`,       icono:"🔵"},
        {label:"Frenos",   sub:"Estado por eje",                 ruta:`/vehiculo/${id}/frenos`,        icono:"🔴"},
        {label:"Historial",sub:"Todos los mantenimientos",       ruta:`/vehiculo/${id}/historial-mant`,icono:"📋"},
      ].map((item,i,arr)=>(
        <div
          key={item.ruta}
          style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`, cursor:"pointer"}}
          onClick={()=>navigate(item.ruta)}
        >
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
            <span style={{fontSize:"22px"}}>{item.icono}</span>
            <div>
              <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>{item.label}</p>
              <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0"}}>{item.sub}</p>
            </div>
          </div>
          <span style={{color:t.colors.textTertiary, fontSize:"18px"}}>›</span>
        </div>
      ))}
    </div>
  </div>
)}
  
        {/* ── HOJA DE VIDA ── */}
        {tabActivo==="hvida" && (
          <div>
            {seccionesHV.map(seccion=>{
              const {total,cargados} = contarDocumentos(seccion);
              const completa = cargados===total;
              const abierta  = seccionesAbiertas[seccion.id];
              return (
                <div key={seccion.id} style={styles.hvSeccion}>
                  <button style={styles.hvCabecera}
                    onClick={()=>setSeccionesAbiertas(prev=>({...prev,[seccion.id]:!prev[seccion.id]}))}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      <span style={{...styles.hvBadge,background:completa?t.colors.greenSoft:t.colors.amberSoft,color:completa?t.colors.green:t.colors.amber,border:`1px solid ${completa?t.colors.greenBorder:"#FDE68A"}`}}>
                        {cargados}/{total}
                      </span>
                      <span style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary}}>{seccion.titulo}</span>
                    </div>
                    {abierta
                      ? <ChevronUp  size={16} color={t.colors.textTertiary} />
                      : <ChevronDown size={16} color={t.colors.textTertiary} />
                    }
                  </button>

                  {abierta&&(
                    <div style={{padding:"0 16px 16px"}}>
                      {seccion.documentos.map(doc=>{
                        const datos   = hvData[doc.id];
                        const cargado = datos&&datos.estado==="cargado";
                        const estaSubiendo = subiendo[doc.id]||false;
                        const pct = progresoArchivo[doc.id]||0;
                        return (
                          <div key={doc.id} style={styles.hvDocFila}>
                            <div style={{flex:1}}>
                              <p style={styles.hvDocLabel}>{doc.label}</p>
                              {cargado&&(
                                <div style={{marginTop:"4px"}}>
                                  <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,display:"block",marginBottom:"4px"}}>
                                    📎 {datos.nombre}
                                  </span>
                                  <div style={{display:"flex",gap:"6px"}}>
                                    <a href={datos.url} target="_blank" rel="noreferrer" style={styles.hvBtnVer}>
                                      <Eye size={12} color={t.colors.blue} /> Ver
                                    </a>
                                    <button style={styles.hvBtnEliminar} onClick={()=>manejarEliminar(doc.id)}>
                                      <Trash2 size={12} color={t.colors.red} /> Eliminar
                                    </button>
                                  </div>
                                </div>
                              )}
                              {estaSubiendo&&(
                                <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"6px"}}>
                                  <div style={{flex:1,height:"4px",background:t.colors.bgSection,borderRadius:"2px",overflow:"hidden"}}>
                                    <div style={{height:"100%",background:t.colors.blue,borderRadius:"2px",width:`${pct}%`}} />
                                  </div>
                                  <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>{pct}%</span>
                                </div>
                              )}
                            </div>
                            {!cargado&&!estaSubiendo&&(
                              <label style={styles.hvBtnSubir}>
                                <Upload size={12} color={t.colors.blue} /> Subir
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>manejarArchivo(e,doc.id)} />
                              </label>
                            )}
                            {cargado&&!estaSubiendo&&(
                              <span style={styles.hvEstadoCargado}>✓ Cargado</span>
                            )}
                            {estaSubiendo&&(
                              <span style={styles.hvEstadoSubiendo}>Subiendo...</span>
                            )}
                          </div>
                        );
                      })}

                      {seccion.campos.length>0&&<div style={{height:"1px",background:t.colors.borderLight,margin:"8px 0 14px"}} />}

                      {seccion.campos.map(campo=>(
                        <div key={campo.id} style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"10px"}}>
                          <label style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightSemibold,color:t.colors.textSecondary,textTransform:"uppercase",letterSpacing:"0.05em"}}>{campo.label}</label>
                          <input type={campo.tipo} placeholder={campo.placeholder}
                            value={hvData[campo.id]||""}
                            onChange={e=>actualizarHV(campo.id,e.target.value)}
                            style={styles.input} />
                        </div>
                      ))}
                    </div>
                  )}
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
  pantalla:            { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary },
  header:              { display:"flex", alignItems:"center", padding:"16px 20px 8px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:           { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  noEncontrado:        { textAlign:"center", padding:"60px 20px", color:t.colors.textSecondary },
  bloqueTop:           { background:t.colors.bgCard, padding:"16px", borderBottom:`1px solid ${t.colors.borderLight}` },
  vehiculoFila:        { display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" },
  vehiculoIconoWrap:   { width:"50px", height:"50px", background:t.colors.blueSoft, borderRadius:t.radius.md, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  vehiculoPlaca:       { fontSize:"22px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:0, letterSpacing:"0.04em" },
  vehiculoTipo:        { fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"3px 0 0" },
  metricas:            { display:"flex", alignItems:"center", borderTop:`1px solid ${t.colors.borderLight}`, paddingTop:"14px" },
  metrica:             { flex:1, textAlign:"center" },
  metricaVal:          { fontSize:"20px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  metricaLabel:        { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"3px 0 0" },
  metricaSep:          { width:"1px", height:"32px", background:t.colors.borderLight },
  tabsWrap:            { display:"flex", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}`, overflowX:"auto" },
  tab:                 { flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", padding:"12px 2px 10px", border:"none", background:"none", cursor:"pointer", borderBottom:"2px solid transparent", minWidth:"0" },
  tabActivo:           { borderBottom:`2px solid ${t.colors.blue}`, background:t.colors.blueSoft },
  contenido:           { padding:"12px 16px 80px" },
  card:                { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"10px", boxShadow:t.shadows.card },
  cardTitulo:          { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 12px" },
  fila:                { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0" },
  filaLabel:           { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary },
  filaValor:           { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  chips:               { display:"flex", gap:"8px", marginBottom:"12px" },
  chip:                { padding:"6px 14px", borderRadius:t.radius.full, border:`1.5px solid ${t.colors.border}`, background:t.colors.bgCard, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, cursor:"pointer" },
  chipActivo:          { background:t.colors.blue, color:"#fff", border:`1.5px solid ${t.colors.blue}` },
  vacio:               { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"40px 20px", textAlign:"center", marginBottom:"10px", boxShadow:t.shadows.card },
  vacioTexto:          { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"10px 0 6px" },
  vacioSub:            { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:0 },
  tarjetaViaje:        { background:t.colors.bgCard, borderRadius:t.radius.lg, marginBottom:"8px", display:"flex", overflow:"hidden", boxShadow:t.shadows.card, cursor:"pointer" },
  tarjetaFranja:       { width:"4px", flexShrink:0 },
  tarjetaViajeContenido:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 14px", flex:1 },
  tarjetaRuta:         { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  tarjetaMeta:         { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"3px 0 0" },
  tarjetaNeta:         { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, marginLeft:"10px", flexShrink:0 },
  navMes:              { display:"flex", justifyContent:"space-between", alignItems:"center", background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"10px 16px", marginBottom:"10px", boxShadow:t.shadows.card },
  btnMes:              { background:"none", border:"none", fontSize:"22px", color:t.colors.blue, cursor:"pointer", padding:"0 8px" },
  labelMes:            { fontSize:"15px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  btnMeta:             { background:t.colors.blueSoft, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.sm, padding:"6px 12px", fontSize:t.fonts.sizeXs, color:t.colors.blue, fontWeight:t.fonts.weightBold, cursor:"pointer" },
  editarMeta:          { marginTop:"14px", background:t.colors.bgSection, borderRadius:t.radius.sm, padding:"12px" },
  input:               { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
  btnGuardarMeta:      { flex:1, padding:"9px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, cursor:"pointer" },
  btnCancelarMeta:     { flex:1, padding:"9px", background:"none", color:t.colors.textSecondary, border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, cursor:"pointer" },
  barraFondo:          { height:"6px", borderRadius:"3px", background:t.colors.bgSection, overflow:"hidden" },
  barraRelleno:        { height:"100%", borderRadius:"3px", transition:"width 0.4s ease" },
  dosColumnas:         { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" },
  metricaCard:         { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"14px", boxShadow:t.shadows.card },
  metricaCardLabel:    { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.05em" },
  metricaCardVal:      { fontSize:"18px", fontWeight:t.fonts.weightBold, margin:0 },
  buscadorWrap:        { background:t.colors.bgCard, border:`1.5px solid ${t.colors.border}`, borderRadius:t.radius.md, padding:"11px 14px", marginBottom:"12px", boxShadow:t.shadows.card },
  buscadorInput:       { width:"100%", border:"none", outline:"none", fontSize:t.fonts.sizeSm, color:t.colors.textPrimary, background:"transparent" },
  grupoMes:            { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 8px" },
  hvSeccion:           { background:t.colors.bgCard, borderRadius:t.radius.lg, marginBottom:"10px", overflow:"hidden", boxShadow:t.shadows.card },
  hvCabecera:          { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"none", border:"none", cursor:"pointer" },
  hvBadge:             { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, padding:"3px 8px", borderRadius:t.radius.full },
  hvDocFila:           { display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:"12px", marginBottom:"12px", borderBottom:`1px solid ${t.colors.borderLight}` },
  hvDocLabel:          { fontSize:t.fonts.sizeSm, color:t.colors.textPrimary, margin:0, fontWeight:t.fonts.weightMedium },
  hvBtnVer:            { display:"inline-flex", alignItems:"center", gap:"4px", fontSize:t.fonts.sizeXs, color:t.colors.blue, textDecoration:"none", padding:"3px 8px", border:`1px solid ${t.colors.blueBorder}`, borderRadius:t.radius.sm, background:t.colors.blueSoft },
  hvBtnEliminar:       { display:"inline-flex", alignItems:"center", gap:"4px", fontSize:t.fonts.sizeXs, color:t.colors.red, padding:"3px 8px", border:`1px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, background:t.colors.redSoft, cursor:"pointer" },
  hvBtnSubir:          { display:"inline-flex", alignItems:"center", gap:"4px", padding:"6px 12px", borderRadius:t.radius.full, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, cursor:"pointer", background:t.colors.blueSoft, color:t.colors.blue, border:`1.5px solid ${t.colors.blueBorder}`, whiteSpace:"nowrap", flexShrink:0 },
  hvEstadoCargado:     { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.green, whiteSpace:"nowrap", flexShrink:0 },
  hvEstadoSubiendo:    { fontSize:t.fonts.sizeXs, color:t.colors.amber, whiteSpace:"nowrap", flexShrink:0 },
  campo:               { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"12px" },
  label:               { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
};

export default DetalleVehiculo;