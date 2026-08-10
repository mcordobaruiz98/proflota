import { useNavigate } from "react-router-dom";
import { useAuth }     from "../hooks/useAuth";
import { theme as t }  from "../styles/theme";
import { Truck, TrendingUp, Calculator, Trophy, MapPin, Handshake, AlertCircle, Wrench} from "lucide-react";
import { SkeletonCard, SkeletonKpi } from "../components/Skeleton";
import   EstadoVacio       from "../components/EstadoVacio";
import   AlertasDocumentos from "../components/AlertasDocumentos";

function Home({ vehiculos = [], viajes = [], configMant = [], mantenimientos = [], conductores = [], gastosFijos = [], cargando}) {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const nombreSaludo = usuario?.displayName
    ? usuario.displayName.split(" ").slice(0, 2).join(" ")
    : "Usuario";

  const iniciales = usuario?.displayName
    ? usuario.displayName.slice(0, 2).toUpperCase()
    : usuario?.email
    ? usuario.email.slice(0, 2).toUpperCase()
    : "US";

  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");

  const hoy = new Date();

  const fechaLocal = (iso) => {
    const [y, m, d] = (iso || "").split("-").map(Number);
    return new Date(y || 1970, (m || 1) - 1, d || 1);
  };
  const viajesMes = viajes.filter((v) => {
    const f = fechaLocal(v.fecha);
    return (
      f.getMonth()    === hoy.getMonth() &&
      f.getFullYear() === hoy.getFullYear()
    );
  });

  const gananciaMes  = viajesMes.reduce((s, v) => s + (v.neta   || 0), 0);
  const ingresosMes  = viajesMes.reduce((s, v) => s + (v.vViaje || 0), 0);
  const recientes    = viajes.slice(0, 4);

  // Punto de equilibrio
  const totalPE = gastosFijos.reduce((s, g) => {
    const monto = g.monto || 0;
    return s + (g.periodicidad === "anual" ? monto / 12 : monto);
  }, 0);
  const pctPE = totalPE > 0 ? Math.min(Math.round((gananciaMes / totalPE) * 100), 999) : 0;

  // Cartera - viajes pendientes y vencidos
  const pendientes = viajes.filter(v => v.estadoPago !== "pagado");
  const vencidos = pendientes.filter(v => {
    const plazo = v.diasPago || 30;
    const fecha = fechaLocal(v.fecha);
    const vence = new Date(fecha);
    vence.setDate(vence.getDate() + plazo);
    return new Date() > vence;
  });
  const totalVencido = vencidos.reduce((s, v) => s + (v.vViaje || 0), 0);

  // Documentos por vencer
  const DOCS_CON_VENC = [
    {id:"veh_soat",label:"SOAT"},{id:"veh_rtm",label:"RTM"},{id:"veh_poliza",label:"Póliza"},{id:"con_licencia",label:"Licencia"}
  ];
  const docsAlerta = [];
  vehiculos.forEach(v => {
    if (!v.hvData) return;
    DOCS_CON_VENC.forEach(doc => {
      const fv = v.hvData[doc.id+"_venc"];
      if (!fv) return;
      const dias = Math.ceil((new Date(fv)-new Date())/(1000*60*60*24));
      if (dias <= 30) {
        docsAlerta.push({ placa:v.placa, doc:doc.label, dias, vencido:dias<0, vehiculoId:v.firestoreId });
      }
    });
  });
  docsAlerta.sort((a,b) => a.dias - b.dias);

  // Alertas de mantenimiento por km
  const mantAlerta = [];
  vehiculos.forEach(v => {
    const configs = configMant.filter(c => c.placa === v.placa);
    configs.forEach(c => {
      const ultimoMant = mantenimientos
        .filter(m => m.placa === v.placa && m.tipo === c.tipo)
        .sort((a,b) => (b.km||0) - (a.km||0))[0];
      const kmUltimo = ultimoMant?.km || 0;
      const kmActual = v.kmOdometro || 0;
      const kmFaltantes = (kmUltimo + (c.intervalo||0)) - kmActual;
      if (kmFaltantes <= 500) {
        mantAlerta.push({
          placa: v.placa,
          tipo: c.tipo || c.nombre || "Servicio",
          kmFaltantes,
          vencido: kmFaltantes <= 0,
          vehiculoId: v.firestoreId,
        });
      }
    });
  });
  mantAlerta.sort((a,b) => a.kmFaltantes - b.kmFaltantes);

  // Alertas de licencias de conductores
  const licAlerta = [];
  conductores.forEach(c => {
    if (!c.licVence) return;
    const dias = Math.ceil((new Date(c.licVence) - new Date()) / (1000*60*60*24));
    if (dias <= 30) {
      licAlerta.push({ nombre: c.nombre, dias, vencido: dias < 0 });
    }
  });
  licAlerta.sort((a,b) => a.dias - b.dias);

  const accesos = [
  { label: "Vehículos",   Icono: Truck,       ruta: "/vehiculos",   iconColor: t.colors.green },
  { label: "Cuentas",     Icono: TrendingUp,  ruta: "/cuentas",     iconColor: t.colors.green },
  { label: "Calculadora", Icono: Calculator,  ruta: "/calculadora", iconColor: t.colors.green },
  { label: "Cartera",     Icono: AlertCircle, ruta: "/cartera",     iconColor: vencidos.length > 0 ? t.colors.red : t.colors.green },
  { label: "Viajes",      Icono: MapPin,      ruta: "/viajes",      iconColor: t.colors.green },
  { label: "Mant.",       Icono: Wrench,      ruta: "/vehiculos",   iconColor: t.colors.green },
];

  if (cargando) return (
  <div style={styles.pantalla}>
    <div style={{padding:"16px"}}>
      <SkeletonKpi />
      <SkeletonCard filas={3}/>
      <SkeletonCard filas={2}/>
    </div>
  </div>
);

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
            <Truck size={14} color={t.colors.green} strokeWidth={2.5} />
            <p style={styles.saludo}>Bienvenido</p>
          </div>
          <p style={styles.nombre}>{nombreSaludo}</p>
        </div>
        <button style={styles.avatar} onClick={() => navigate("/perfil")}>
          {iniciales}
        </button>
      </div>

      {/* CARD GANANCIA MES */}
      <div style={styles.gananciaCard}>
        <div style={styles.gananciaIzq}>
          <p style={styles.gananciaLabel}>Ganancia este mes</p>
          <p style={{
            ...styles.gananciaValor,
            color: gananciaMes >= 0 ? "#FFFFFF" : "#FFE0DC",
          }}>
            {fmt(gananciaMes)}
          </p>
          <p style={styles.gananciaSub}>
            {viajesMes.length} viaje{viajesMes.length !== 1 ? "s" : ""} · {fmt(ingresosMes)} brutos
          </p>
          {totalPE > 0 && (
            <div style={{marginTop:"10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px"}}>
                <span style={{fontSize:"10px",color:"rgba(255,255,255,0.85)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em"}}>Punto de equilibrio</span>
                <span style={{fontSize:"10px",color:"#fff",fontWeight:"700",...t.numeric}}>{pctPE}%</span>
              </div>
              <div style={{height:"5px",borderRadius:"3px",background:"rgba(0,0,0,0.22)",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:"3px",width:`${Math.min(pctPE,100)}%`,background:"rgba(255,255,255,0.92)",transition:"width 0.4s"}}/>
              </div>
            </div>
          )}
        </div>
        <div style={styles.gananciaDer}>
          <div style={styles.vehMetrica}>
            <p style={{...styles.vehMetricaValor, ...t.numeric}}>{vehiculos.length}</p>
            <p style={styles.vehMetricaLabel}>Vehículos</p>
          </div>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div style={{display:"flex", gap:"10px", margin:"0 16px 12px"}}>
        <button
          style={{flex:1, padding:"14px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"}}
          onClick={() => navigate("/calculadora")}
        >
          <Calculator size={16} color="#fff" strokeWidth={2.2} /> Calcular
        </button>
        <button
          style={{flex:1, padding:"14px", background:t.colors.bgCard, color:t.colors.blueText, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"}}
          onClick={() => navigate("/cotizador")}
        >
          <Handshake size={16} color={t.colors.blueText} strokeWidth={2.2} /> Cotizar
        </button>
      </div>

      {/* SEMÁFORO DE FLOTA */}
      {vehiculos.length > 1 && (
        <div style={{margin:"0 16px 10px",padding:"11px 14px",background:t.colors.bgCard,borderRadius:t.radius.md,border:`1px solid ${t.colors.borderLight}`,boxShadow:t.shadows.card}}>
          <div style={{display:"flex",gap:"14px",overflowX:"auto",paddingBottom:"2px"}}>
            {vehiculos.map(v => {
              const est = v.estado || "disponible";
              const colores = {
                disponible:      { c: t.colors.green,  label: "Disponible" },
                en_viaje:        { c: t.colors.blueText,label: "En viaje" },
                en_taller:       { c: t.colors.amber,  label: "En taller" },
                esperando_carga: { c: t.colors.textTertiary, label: "Esperando" },
              };
              const e = colores[est] || colores.disponible;
              return (
                <div key={v.firestoreId}
                  onClick={()=>navigate(`/vehiculo/${v.firestoreId}`)}
                  style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",flexShrink:0}}
                >
                  <span style={{width:"9px",height:"9px",borderRadius:"50%",background:e.c,boxShadow:`0 0 8px ${e.c}88`,flexShrink:0}} />
                  <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:t.colors.textSecondary,...t.numeric}}>{v.placa}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESUMEN DEL DÍA */}
      {viajes.length > 0 && (()=>{
        const ahora = new Date();
        const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,"0")}-${String(ahora.getDate()).padStart(2,"0")}`;
        const viajesHoy = viajes.filter(v => v.fecha === hoyStr);
        const gananciaHoy = viajesHoy.reduce((s,v) => s + (v.neta||0), 0);
        const ingresosHoy = viajesHoy.reduce((s,v) => s + (v.vViaje||0), 0);
        if (viajesHoy.length === 0) return null;
        return (
          <div style={{margin:"0 16px 10px",padding:"11px 16px",background:t.colors.bgCard,borderRadius:t.radius.md,border:`1px solid ${t.colors.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:t.shadows.card}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <Truck size={14} color={t.colors.blueText} strokeWidth={2}/>
              <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>
                Hoy: {viajesHoy.length} viaje{viajesHoy.length!==1?"s":""} · {fmt(ingresosHoy)} brutos
              </span>
            </div>
            <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:gananciaHoy>=0?t.colors.green:t.colors.red,...t.numeric}}>
              {fmt(gananciaHoy)}
            </span>
          </div>
        );
      })()}

      {/* ONBOARDING — flujo guiado */}
      {(vehiculos.length === 0 || gastosFijos.length === 0 || viajes.length === 0) && (
        <div style={{margin:"0 16px 10px"}}>
          <div style={{background:t.colors.bgCard,borderRadius:t.radius.lg,padding:"20px",border:`1px solid ${t.colors.borderLight}`,boxShadow:t.shadows.card}}>
            <p style={{fontSize:"16px",fontWeight:t.fonts.weightBold,color:t.colors.textPrimary,margin:"0 0 4px",textAlign:"center"}}>
              {vehiculos.length === 0 ? "¡Bienvenido a NAVIRA!" : viajes.length === 0 ? "¡Ya casi!" : "¡Todo listo!"}
            </p>
            <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"0 0 4px",textAlign:"center"}}>
              {vehiculos.length === 0 ? "Configura tu flota en 5 minutos" : "Completa los pasos restantes"}
            </p>

            {/* Barra de progreso */}
            <div style={{display:"flex",gap:"4px",margin:"10px 0 16px"}}>
              {[vehiculos.length > 0, gastosFijos.length > 0, viajes.length > 0].map((done,i)=>(
                <div key={i} style={{flex:1,height:"4px",borderRadius:"2px",background:done?t.colors.green:t.colors.bgSection}} />
              ))}
            </div>

            {/* PASO 1 */}
            {(()=>{
              const done = vehiculos.length > 0;
              return (
                <div style={{display:"flex",gap:"12px",padding:"12px 0",borderBottom:`1px solid ${t.colors.borderLight}`,opacity:done?0.6:1}}>
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",background:done?t.colors.green:t.colors.greenSoft,border:`1.5px solid ${t.colors.green}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {done
                      ? <span style={{color:"#fff",fontSize:"14px",fontWeight:"900"}}>✓</span>
                      : <span style={{fontSize:"14px",fontWeight:t.fonts.weightBlack,color:t.colors.green}}>1</span>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary,margin:0,textDecoration:done?"line-through":"none"}}>
                      Registra tu primer camión
                    </p>
                    <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>
                      {done ? `${vehiculos[0]?.placa} registrado` : "Solo necesitas la placa y el tipo — 30 segundos"}
                    </p>
                    {!done && (
                      <button
                        style={{marginTop:"8px",padding:"8px 16px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,cursor:"pointer"}}
                        onClick={()=>navigate("/agregar-vehiculo")}
                      >Agregar mi camión →</button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* PASO 2 */}
            {(()=>{
              const prev = vehiculos.length > 0;
              const done = gastosFijos.length > 0;
              return (
                <div style={{display:"flex",gap:"12px",padding:"12px 0",borderBottom:`1px solid ${t.colors.borderLight}`,opacity:done?0.6:!prev?0.4:1}}>
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",background:done?t.colors.blue:t.colors.blueSoft,border:`1.5px solid ${done?t.colors.blue:!prev?t.colors.border:t.colors.blue}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {done
                      ? <span style={{color:"#fff",fontSize:"14px",fontWeight:"900"}}>✓</span>
                      : <span style={{fontSize:"14px",fontWeight:t.fonts.weightBlack,color:!prev?t.colors.textTertiary:t.colors.blueText}}>2</span>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary,margin:0,textDecoration:done?"line-through":"none"}}>
                      ¿Cuánto le cuesta mantener el camión?
                    </p>
                    <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>
                      {done ? `${gastosFijos.length} gasto${gastosFijos.length!==1?"s":""} fijo${gastosFijos.length!==1?"s":""} configurado${gastosFijos.length!==1?"s":""}` : "Cuota, seguro, parqueadero, GPS — 1 minuto"}
                    </p>
                    {!done && prev && vehiculos[0] && (
                      <button
                        style={{marginTop:"8px",padding:"8px 16px",background:t.colors.blue,color:"#fff",border:"none",borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,cursor:"pointer"}}
                        onClick={()=>navigate(`/vehiculo/${vehiculos[0].firestoreId}`,{state:{tab:"cuentas"}})}
                      >Configurar gastos fijos →</button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* PASO 3 */}
            {(()=>{
              const prev = vehiculos.length > 0 && gastosFijos.length > 0;
              const done = viajes.length > 0;
              return (
                <div style={{display:"flex",gap:"12px",padding:"12px 0",opacity:done?0.6:!prev?0.4:1}}>
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",background:done?t.colors.amber:t.colors.amberSoft,border:`1.5px solid ${done?t.colors.amber:!prev?t.colors.border:t.colors.amber}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {done
                      ? <span style={{color:"#fff",fontSize:"14px",fontWeight:"900"}}>✓</span>
                      : <span style={{fontSize:"14px",fontWeight:t.fonts.weightBlack,color:!prev?t.colors.textTertiary:t.colors.amber}}>3</span>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary,margin:0,textDecoration:done?"line-through":"none"}}>
                      Calcule su primer viaje
                    </p>
                    <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>
                      {done ? `${viajes.length} viaje${viajes.length!==1?"s":""} registrado${viajes.length!==1?"s":""}` : "Vea cuánto le queda después de combustible, peajes y conductor"}
                    </p>
                    {!done && prev && vehiculos[0] && (
                      <button
                        style={{marginTop:"8px",padding:"8px 16px",background:t.colors.amber,color:"#fff",border:"none",borderRadius:t.radius.sm,fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,cursor:"pointer"}}
                        onClick={()=>navigate("/calculadora",{state:{placa:vehiculos[0].placa}})}
                      >Calcular mi primer viaje →</button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Resultado después de completar todo */}
            {vehiculos.length > 0 && gastosFijos.length > 0 && viajes.length > 0 && totalPE > 0 && (
              <div style={{marginTop:"12px",padding:"14px",background:t.colors.greenSoft,border:`1.5px solid ${t.colors.greenBorder}`,borderRadius:t.radius.md,textAlign:"center"}}>
                <p style={{fontSize:t.fonts.sizeXs,color:t.colors.green,fontWeight:t.fonts.weightBold,margin:"0 0 4px",textTransform:"uppercase"}}>Su punto de equilibrio mensual</p>
                <p style={{fontSize:"22px",fontWeight:t.fonts.weightBlack,color:t.colors.green,margin:"0 0 4px",...t.numeric}}>{fmt(totalPE)}</p>
                <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:0}}>
                  Con su primer viaje ya cubrió el {pctPE}%. ¡Siga así!
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ALERTA CARTERA VENCIDA */}
      {vencidos.length > 0 && (
        <div
          style={{
            margin: "0 16px 10px",
            padding: "12px 16px",
            background: t.colors.redSoft,
            border: `1.5px solid ${t.colors.redBorder}`,
            borderRadius: t.radius.lg,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/cartera")}
        >
          <AlertCircle size={20} color={t.colors.red} strokeWidth={2} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.redText, margin: 0 }}>
              {vencidos.length} pago{vencidos.length !== 1 ? "s" : ""} vencido{vencidos.length !== 1 ? "s" : ""}
            </p>
            <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textSecondary, margin: "2px 0 0" }}>
              {fmt(totalVencido)} pendiente · Toca para ver
            </p>
          </div>
        </div>
      )}

      {/* ALERTAS DE DOCUMENTOS */}
      <AlertasDocumentos vehiculos={vehiculos} />

      {/* ALERTA DOCUMENTOS POR VENCER */}
      {docsAlerta.length > 0 && (
        <div
          style={{
            margin: "0 16px 10px",
            padding: "12px 16px",
            background: docsAlerta.some(d=>d.vencido) ? t.colors.redSoft : t.colors.amberSoft,
            border: `1.5px solid ${docsAlerta.some(d=>d.vencido) ? t.colors.redBorder : t.colors.amberBorder}`,
            borderRadius: t.radius.lg,
          }}
        >
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
            <AlertCircle size={18} color={docsAlerta.some(d=>d.vencido)?t.colors.red:t.colors.amber} strokeWidth={2} />
            <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:docsAlerta.some(d=>d.vencido)?t.colors.redText:t.colors.amber,margin:0}}>
              Documentos por vencer
            </p>
          </div>
          {docsAlerta.map((d,i) => (
            <div
              key={`${d.placa}-${d.doc}-${i}`}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",cursor:"pointer"}}
              onClick={()=>navigate(`/vehiculo/${d.vehiculoId}`,{state:{tab:"historial"}})}
            >
              <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>
                {d.doc} · {d.placa}
              </span>
              <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:d.vencido?t.colors.redText:d.dias<=7?t.colors.amber:t.colors.textSecondary}}>
                {d.vencido?`Venció hace ${Math.abs(d.dias)}d`:d.dias===0?"Vence hoy":`Vence en ${d.dias}d`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ALERTA MANTENIMIENTOS POR KM */}
      {mantAlerta.length > 0 && (
        <div style={{margin:"0 16px 10px",padding:"12px 16px",background:mantAlerta.some(m=>m.vencido)?t.colors.redSoft:t.colors.amberSoft,border:`1.5px solid ${mantAlerta.some(m=>m.vencido)?t.colors.redBorder:t.colors.amberBorder}`,borderRadius:t.radius.lg}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
            <Wrench size={18} color={mantAlerta.some(m=>m.vencido)?t.colors.red:t.colors.amber} strokeWidth={2} />
            <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:mantAlerta.some(m=>m.vencido)?t.colors.redText:t.colors.amber,margin:0}}>Mantenimientos pendientes</p>
          </div>
          {mantAlerta.map((m,i) => (
            <div key={`${m.placa}-${m.tipo}-${i}`}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",cursor:"pointer"}}
              onClick={()=>navigate(`/vehiculo/${m.vehiculoId}`,{state:{tab:"mant"}})}>
              <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>{m.tipo} · {m.placa}</span>
              <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:m.vencido?t.colors.redText:t.colors.amber}}>
                {m.vencido?`Pasado ${Math.abs(m.kmFaltantes).toLocaleString("es-CO")} km`:`Faltan ${m.kmFaltantes.toLocaleString("es-CO")} km`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ALERTA LICENCIAS CONDUCTORES */}
      {licAlerta.length > 0 && (
        <div style={{margin:"0 16px 10px",padding:"12px 16px",background:licAlerta.some(l=>l.vencido)?t.colors.redSoft:t.colors.amberSoft,border:`1.5px solid ${licAlerta.some(l=>l.vencido)?t.colors.redBorder:t.colors.amberBorder}`,borderRadius:t.radius.lg}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
            <AlertCircle size={18} color={licAlerta.some(l=>l.vencido)?t.colors.red:t.colors.amber} strokeWidth={2} />
            <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:licAlerta.some(l=>l.vencido)?t.colors.redText:t.colors.amber,margin:0}}>Licencias de conducir</p>
          </div>
          {licAlerta.map((l,i) => (
            <div key={`lic-${i}`}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",cursor:"pointer"}}
              onClick={()=>navigate("/conductores")}>
              <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>{l.nombre}</span>
              <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:l.vencido?t.colors.redText:t.colors.amber}}>
                {l.vencido?`Vencida hace ${Math.abs(l.dias)}d`:`Vence en ${l.dias}d`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ACCESOS RÁPIDOS */}
      <p style={styles.seccionTitulo}>Accesos rápidos</p>
      <div style={styles.grid}>
  {accesos.map((a) => (
    <button
      key={a.ruta}
      style={styles.accesoCard}
      onClick={() => navigate(a.ruta)}
    >
      <div style={{
        width: "42px",
        height: "42px",
        borderRadius: t.radius.md,
        background: a.iconColor + "1F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "2px",
      }}>
        <a.Icono size={20} color={a.iconColor} strokeWidth={2} />
      </div>
      <span style={styles.accesoLabel}>{a.label}</span>
    </button>
     ))}
      </div>

      {/* VIAJES RECIENTES */}
      <div style={styles.seccionHeader}>
        <p style={styles.seccionTitulo}>Viajes recientes</p>
        {viajes.length > 0 && (
          <button
            style={styles.btnVerTodos}
            onClick={() => navigate("/viajes")}
          >
            Ver todos
          </button>
        )}
      </div>

      {recientes.length === 0 ? (
          <EstadoVacio
            titulo="Sin viajes registrados"
            sub="Calcule su primer viaje y empiece a ver cuánto le queda de verdad."
            btnLabel="Calcular flete"
            onBtnClick={() => navigate("/calculadora")}
          />
          ) : (
        <div style={styles.viajesList}>
          {recientes.map((v) => {
            const positivo = (v.neta || 0) >= 0;
            const pagado   = v.estadoPago === "pagado";
            return (
              <div
                key={v.firestoreId}
                style={styles.viajeCard}
                onClick={() => navigate(`/viaje/${v.firestoreId}`)}
              >
                <div style={{
                  ...styles.viajeIndicador,
                  background: positivo ? t.colors.green : t.colors.red,
                }} />
                <div style={styles.viajeInfo}>
                  <p style={styles.viajeRuta}>{v.ruta || "Sin ruta"}</p>
                  <p style={styles.viajeMeta}>
                    {v.fecha || ""}
                    {v.placa ? ` · ${v.placa}` : ""}
                    <span style={{
                      ...styles.tagPago,
                      background: pagado ? t.colors.greenSoft : t.colors.amberSoft,
                      color:      pagado ? t.colors.green     : t.colors.amber,
                    }}>{pagado ? "Pagado" : "Por cobrar"}</span>
                  </p>
                </div>
                <div style={styles.viajeDer}>
                  <p style={{
                    ...styles.viajeNeta,
                    ...t.numeric,
                    color: positivo ? t.colors.green : t.colors.red,
                  }}>
                    {positivo ? "+" : ""}{fmt(v.neta || 0)}
                  </p>
                  <p style={{...styles.viajeFlete, ...t.numeric}}>{fmt(v.vViaje || 0)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

const styles = {
  pantalla:          { maxWidth: "430px", margin: "0 auto", background: t.colors.bgPrimary, minHeight: "100vh", paddingBottom: "20px" },
  header:            { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  saludo:            { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "0 0 2px", fontWeight: t.fonts.weightMedium, textTransform: "uppercase", letterSpacing: "0.06em" },
  nombre:            { fontSize: "22px", fontWeight: t.fonts.weightBlack, color: t.colors.textPrimary, margin: 0, letterSpacing: "-0.3px" },
  avatar:            { width: "44px", height: "44px", borderRadius: t.radius.lg, background: t.colors.blue, color: "#fff", border: "none", fontSize: "15px", fontWeight: t.fonts.weightBold, cursor: "pointer", flexShrink: 0, letterSpacing: "0.5px" },
  gananciaCard:      { background: `linear-gradient(140deg, #0F7A44 0%, #159F51 55%, ${t.colors.green} 100%)`, margin: "16px", borderRadius: t.radius.xl, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 18px 40px -18px rgba(34,197,94,0.45)" },
  gananciaIzq:       { flex: 1 },
  gananciaLabel:     { fontSize: t.fonts.sizeXs, color: "rgba(255,255,255,0.82)", margin: "0 0 4px", fontWeight: t.fonts.weightMedium, textTransform: "uppercase", letterSpacing: "0.06em" },
  gananciaValor:     { fontSize: "38px", fontWeight: t.fonts.weightBlack, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.8px", fontVariantNumeric: "tabular-nums" },
  gananciaSub:       { fontSize: t.fonts.sizeXs, color: "rgba(255,255,255,0.72)", margin: 0 },
  gananciaDer:       { marginLeft: "16px" },
  vehMetrica:        { background: "rgba(255,255,255,0.15)", borderRadius: t.radius.md, padding: "12px 16px", textAlign: "center", backdropFilter: "blur(10px)" },
  vehMetricaValor:   { fontSize: "28px", fontWeight: t.fonts.weightBlack, color: "#fff", margin: 0 },
  vehMetricaLabel:   { fontSize: "10px", color: "rgba(255,255,255,0.78)", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" },
  seccionHeader:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 20px 8px" },
  seccionTitulo:     { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", padding: "12px 20px 8px", margin: 0 },
  btnVerTodos:       { background: "none", border: "none", fontSize: t.fonts.sizeXs, color: t.colors.blueText, fontWeight: t.fonts.weightBold, cursor: "pointer", padding: "12px 20px 8px" },
  grid:              { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", padding: "0 16px 4px" },
  accesoCard:        { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "16px", borderRadius: t.radius.lg, cursor: "pointer", transition: "transform 0.1s", background: t.colors.bgCard, border: `1px solid ${t.colors.borderLight}` },
  accesoLabel:       { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightSemibold, color: t.colors.textPrimary, textAlign: "center" },
  vacio:             { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "40px 20px", textAlign: "center", margin: "0 16px", boxShadow: t.shadows.card },
  vacioIcono:        { fontSize: "36px", marginBottom: "10px" },
  vacioTexto:        { fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: "0 0 6px" },
  vacioSub:          { fontSize: t.fonts.sizeSm, color: t.colors.textSecondary, margin: "0 0 20px" },
  btnCalcular:       { padding: "12px 28px", background: t.colors.green, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, cursor: "pointer" },
  viajesList:        { padding: "0 16px", display: "flex", flexDirection: "column", gap: "9px" },
  viajeCard:         { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "14px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", border: `1px solid ${t.colors.borderLight}`, boxShadow: t.shadows.card },
  viajeIndicador:    { width: "3px", height: "40px", borderRadius: "2px", flexShrink: 0 },
  viajeInfo:         { flex: 1, minWidth: 0 },
  viajeRuta:         { fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  viajeMeta:         { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "4px 0 0", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
  tagPago:           { fontSize: "9.5px", fontWeight: t.fonts.weightBold, letterSpacing: "0.3px", padding: "2px 7px", borderRadius: "6px" },
  viajeDer:          { textAlign: "right", flexShrink: 0 },
  viajeNeta:         { fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBold, margin: 0 },
  viajeFlete:        { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "2px 0 0" },
};

export default Home;