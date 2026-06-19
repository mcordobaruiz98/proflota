import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, TrendingUp, TrendingDown } from "lucide-react";
import { theme as t } from "../styles/theme";
import { SkeletonCard, SkeletonKpi } from "../components/Skeleton";

const MESES       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MESES_CORTO = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function Cuentas({ vehiculos = [], viajes = [], gastosFijos = [], gastosVehiculo = [], cargando }) {
  const navigate = useNavigate();
  const hoy = new Date();
  const [mes,  setMes]  = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const fmtCorto = (n) => {
    const abs = Math.abs(n);
    if (abs >= 1000000) return (n/1000000).toFixed(1)+"M";
    if (abs >= 1000)    return (n/1000).toFixed(0)+"K";
    return Math.round(n).toLocaleString("es-CO");
  };

  const cambiarMes = (dir) => {
    let m = mes + dir, a = anio;
    if (m > 11) { m = 0;  a++; }
    if (m < 0)  { m = 11; a--; }
    setMes(m); setAnio(a);
  };

  const viajesMes    = viajes.filter(v => { const f=new Date(v.fecha); return f.getMonth()===mes && f.getFullYear()===anio; });
  const ingresosMes  = viajesMes.reduce((s,v) => s+(v.vViaje||0), 0);
  const gastosMes    = viajesMes.reduce((s,v) => s+(v.total||0),  0);
  const netaMes      = viajesMes.reduce((s,v) => s+(v.neta||0),   0);
  const rentabilidad = ingresosMes > 0 ? ((netaMes/ingresosMes)*100).toFixed(1) : "0.0";
  const margenColor  = Number(rentabilidad)>=40 ? t.colors.green : Number(rentabilidad)>=20 ? t.colors.amber : t.colors.red;
  const kmMes = viajesMes.reduce((s,v) => s+(v.kmT||0), 0);

  const acpmMes      = viajesMes.reduce((s,v) => s+(v.cAcpm||0),     0);
  const adblMes      = viajesMes.reduce((s,v) => s+(v.cAdbl||0),     0);
  const peajesMes    = viajesMes.reduce((s,v) => s+(v.peajes||0),    0);
  const conductorMes = viajesMes.reduce((s,v) => s+(v.conductor||0), 0);
  const otrosMes     = viajesMes.reduce((s,v) => s+(v.carp||0)+(v.gv2||0)+(v.extras||0), 0);
  const descuentosMes = viajesMes.reduce((s,v)=> s+(v.descuentos?.total||0),0);

  // Punto de equilibrio total de la flota
  const totalPE = gastosFijos.reduce((s, g) => {
    const monto = g.monto || 0;
    return s + (g.periodicidad === "anual" ? monto / 12 : monto);
  }, 0);

  // Gastos adicionales del mes
  const gastosAdicMes = gastosVehiculo.filter(g => {
    const f = new Date(g.fecha);
    return f.getMonth() === mes && f.getFullYear() === anio;
  });
  const totalGastosAdic = gastosAdicMes.reduce((s, g) => s + (g.monto || 0), 0);

  const utilidadReal = netaMes - totalPE - totalGastosAdic;

  const gananciaPorVeh = vehiculos.map(veh => {
    const vt = viajesMes.filter(v => v.placa===veh.placa);
    return { placa: veh.placa, tipo: veh.tipoVehiculo, neta: vt.reduce((s,v)=>s+(v.neta||0),0), viajes: vt.length, km: vt.reduce((s,v) => s+(v.kmT||0), 0),};
  }).sort((a,b) => b.neta - a.neta);
  const maxNeta = Math.max(...gananciaPorVeh.map(v=>Math.abs(v.neta)), 1);

  const ultimos6 = Array.from({length:6}, (_,i) => {
    let m = mes-(5-i), a = anio;
    if (m<0) { m+=12; a--; }
    const vm = viajes.filter(v => { const f=new Date(v.fecha); return f.getMonth()===m && f.getFullYear()===a; });
    return { mes: MESES_CORTO[m], neta: vm.reduce((s,v)=>s+(v.neta||0),0), activo: m===mes&&a===anio };
  });
  const maxGrafica = Math.max(...ultimos6.map(m=>Math.abs(m.neta)), 1);

  if (cargando) return (
  <div style={styles.pantalla}>
    <div style={{padding:"16px"}}>
      <SkeletonKpi />
      <SkeletonCard filas={3}/>
      <SkeletonCard filas={5}/>
    </div>
  </div>
);

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <p style={styles.headerSub}>Resumen financiero</p>
          <h1 style={styles.titulo}>Cuentas</h1>
        </div>
        <button style={styles.btnHistorial} onClick={() => navigate("/viajes")}>
          <History size={16} color={t.colors.blue} strokeWidth={2} />
          Historial
        </button>
        <button style={{...styles.btnHistorial, marginLeft:"6px"}} onClick={()=>{
          const w = window.open("","_blank","width=800,height=600");
          w.document.write(`<!DOCTYPE html><html><head><title>Resumen ${MESES[mes]} ${anio}</title>
          <style>
            body{font-family:-apple-system,sans-serif;padding:30px;color:#1a1a1a;max-width:700px;margin:0 auto}
            h1{font-size:20px;margin:0 0 4px}
            h2{font-size:14px;margin:20px 0 8px;color:#666;border-bottom:1px solid #ddd;padding-bottom:4px}
            .sub{color:#666;font-size:12px;margin:0 0 20px}
            table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:10px}
            td{padding:6px 8px;border-bottom:1px solid #eee}
            td:last-child{text-align:right;font-weight:600}
            .total td{border-top:2px solid #333;font-weight:700;font-size:14px}
            .veh{background:#f5f5f5}
            .footer{text-align:center;color:#999;font-size:11px;margin-top:30px;border-top:1px solid #ddd;padding-top:10px}
            @media print{body{padding:15px}}
          </style></head><body>
          <h1>Resumen Financiero — ${MESES[mes]} ${anio}</h1>
          <p class="sub">Generado por NAVIRA · ${new Date().toLocaleDateString("es-CO")}</p>

          <h2>Resumen de flota</h2>
          <table>
            <tr><td>Ingresos brutos</td><td>${fmt(ingresosMes)}</td></tr>
            <tr><td>Total gastos viajes</td><td>${fmt(gastosMes)}</td></tr>
            <tr><td>Ganancia neta viajes</td><td>${fmt(netaMes)}</td></tr>
            ${totalPE > 0 ? `<tr><td>Gastos fijos (P.E.)</td><td>-${fmt(totalPE)}</td></tr>` : ""}
            ${totalGastosAdic > 0 ? `<tr><td>Gastos adicionales</td><td>-${fmt(totalGastosAdic)}</td></tr>` : ""}
            <tr class="total"><td>${totalPE>0||totalGastosAdic>0?"Utilidad real":"Ganancia neta"}</td><td>${totalPE>0||totalGastosAdic>0?fmt(utilidadReal):fmt(netaMes)}</td></tr>
          </table>
          <table>
            <tr><td>Rentabilidad</td><td>${rentabilidad}%</td></tr>
            <tr><td>Viajes</td><td>${viajesMes.length}</td></tr>
            <tr><td>Km totales</td><td>${kmMes.toLocaleString("es-CO")} km</td></tr>
          </table>

          <h2>Desglose por vehículo</h2>
          <table>
            <tr class="veh"><td><b>Placa</b></td><td><b>Viajes</b></td><td><b>Km</b></td><td><b>Neta</b></td></tr>
            ${gananciaPorVeh.map(v=>`<tr><td>${v.placa}</td><td>${v.viajes}</td><td>${v.km.toLocaleString("es-CO")}</td><td>${fmt(v.neta)}</td></tr>`).join("")}
          </table>

          <h2>Distribución de gastos</h2>
          <table>
            <tr><td>ACPM</td><td>${fmt(acpmMes)}</td></tr>
            <tr><td>Adblue</td><td>${fmt(adblMes)}</td></tr>
            <tr><td>Peajes</td><td>${fmt(peajesMes)}</td></tr>
            <tr><td>Conductor</td><td>${fmt(conductorMes)}</td></tr>
            <tr><td>Otros</td><td>${fmt(otrosMes)}</td></tr>
            ${descuentosMes>0?`<tr><td>Descuentos</td><td>${fmt(descuentosMes)}</td></tr>`:""}
          </table>

          <p class="footer">NAVIRA — Inteligencia en Movimiento · ${anio}</p>
          </body></html>`);
          w.document.close();
          setTimeout(()=>w.print(), 500);
        }}>
          <TrendingUp size={16} color={t.colors.blue} strokeWidth={2} />
          Exportar
        </button>
        <button style={{...styles.btnHistorial, marginLeft:"6px"}} onClick={()=>navigate("/comparativo")}>
          <TrendingUp size={16} color={t.colors.blue} strokeWidth={2} />
          Comparar
        </button>
      </div>

      {/* NAV MES */}
      <div style={styles.navMes}>
        <button style={styles.btnMes} onClick={()=>cambiarMes(-1)}>‹</button>
        <p style={styles.labelMes}>{MESES[mes]} {anio}</p>
        <button style={styles.btnMes} onClick={()=>cambiarMes(1)}>›</button>
      </div>

      <div style={styles.contenido}>

        {/* GANANCIA HERO */}
        <div style={{
          ...styles.gananciaHero,
          background: netaMes>=0
            ? `linear-gradient(135deg, #15803D 0%, ${t.colors.green} 100%)`
            : `linear-gradient(135deg, #B91C1C 0%, ${t.colors.red} 100%)`,
        }}>
          <div>
            <p style={styles.gananciaHeroLabel}>Ganancia neta del mes</p>
            <p style={styles.gananciaHeroVal}>{fmt(netaMes)}</p>
            <p style={styles.gananciaHeroSub}>
              {viajesMes.length} viaje{viajesMes.length!==1?"s":""} · Rentabilidad{" "}
              <span style={{fontWeight: t.fonts.weightBold, color:"#fff"}}>{rentabilidad}%</span>
            </p>
          </div>
          <div style={styles.gananciaHeroBadge}>
            {netaMes >= 0
              ? <TrendingUp  size={28} color="rgba(255,255,255,0.9)" strokeWidth={2} />
              : <TrendingDown size={28} color="rgba(255,255,255,0.9)" strokeWidth={2} />
            }
          </div>
        </div>

        {/* INGRESOS Y GASTOS */}
        <div style={styles.dosColumnas}>
          <div style={styles.metricaCard}>
            <p style={styles.metricaLabel}>Ingresos brutos</p>
            <p style={{...styles.metricaVal, color: t.colors.blue}}>{fmt(ingresosMes)}</p>
          </div>
          <div style={styles.metricaCard}>
            <p style={styles.metricaLabel}>Total gastos</p>
            <p style={{...styles.metricaVal, color: t.colors.red}}>{fmt(gastosMes)}</p>
          </div>
        </div>

        <div style={styles.dosColumnas}>
  <div style={styles.metricaCard}>
    <p style={styles.metricaLabel}>Km totales flota</p>
    <p style={{...styles.metricaVal, color: t.colors.textPrimary}}>
      {kmMes > 0 ? kmMes.toLocaleString("es-CO") + " km" : "—"}
    </p>
  </div>
  <div style={styles.metricaCard}>
    <p style={styles.metricaLabel}>Viajes realizados</p>
    <p style={{...styles.metricaVal, color: t.colors.textPrimary}}>
      {viajesMes.length} viaje{viajesMes.length !== 1 ? "s" : ""}
    </p>
  </div>
</div>

        {/* UTILIDAD REAL DE LA FLOTA */}
        {(totalPE > 0 || totalGastosAdic > 0) && (
          <div style={{...styles.card, border:`1.5px solid ${utilidadReal >= 0 ? t.colors.greenBorder : t.colors.redBorder}`}}>
            <p style={styles.cardTitulo}>Utilidad real de la flota</p>
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.colors.borderLight}`}}>
              <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>Ganancia neta viajes</span>
              <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:netaMes>=0?t.colors.green:t.colors.red}}>{fmt(netaMes)}</span>
            </div>
            {totalPE > 0 && (
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.colors.borderLight}`}}>
                <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>Gastos fijos (P.E.)</span>
                <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.red}}>-{fmt(totalPE)}</span>
              </div>
            )}
            {totalGastosAdic > 0 && (
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.colors.borderLight}`}}>
                <span style={{fontSize:t.fonts.sizeSm,color:t.colors.textSecondary}}>Gastos adicionales</span>
                <span style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.red}}>-{fmt(totalGastosAdic)}</span>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0"}}>
              <span style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBold,color:t.colors.textPrimary}}>Utilidad</span>
              <span style={{fontSize:"22px",fontWeight:t.fonts.weightBlack,color:utilidadReal>=0?t.colors.green:t.colors.red}}>{fmt(utilidadReal)}</span>
            </div>
          </div>
        )}

        {/* GRÁFICA */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Evolución últimos 6 meses</p>
          <div style={styles.grafica}>
            {ultimos6.map((m,i) => {
              const pct    = Math.abs(m.neta)/maxGrafica;
              const altura = Math.max(pct*100, m.neta!==0?4:0);
              const color  = m.activo ? t.colors.blue : m.neta>=0 ? t.colors.greenBorder : t.colors.redBorder;
              return (
                <div key={i} style={styles.graficaCol}>
                  <p style={{fontSize:"9px", color:t.colors.textTertiary, margin:"0 0 4px", textAlign:"center"}}>
                    {m.neta!==0?fmtCorto(m.neta):""}
                  </p>
                  <div style={styles.graficaBarraWrap}>
                    <div style={{...styles.graficaBarra, height:`${altura}%`, background:color}} />
                  </div>
                  <p style={{fontSize:"10px", color:m.activo?t.colors.blue:t.colors.textTertiary, fontWeight:m.activo?t.fonts.weightBold:t.fonts.weightNormal, margin:"6px 0 0", textAlign:"center"}}>
                    {m.mes}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* DISTRIBUCIÓN DE GASTOS */}
        {gastosMes > 0 && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Distribución de gastos</p>
            {[
              {label:"ACPM",      valor:acpmMes,      color:"#3B82F6"},
              {label:"Adblue",    valor:adblMes,      color:"#8B5CF6"},
              {label:"Peajes",    valor:peajesMes,    color:t.colors.amber},
              {label:"Conductor", valor:conductorMes, color:t.colors.green},
              {label:"Descuentos de ley", valor:descuentosMes, color:t.colors.red},
              {label:"Otros",     valor:otrosMes,     color:t.colors.textTertiary},
            ].filter(item=>item.valor>0).map(item=>{
              const pct = Math.round((item.valor/gastosMes)*100);
              return (
                <div key={item.label} style={{marginBottom:"12px"}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:"5px"}}>
                    <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>{item.label}</span>
                    <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold}}>
                      {fmt(item.valor)} <span style={{color:t.colors.textTertiary, fontWeight:t.fonts.weightNormal}}>{pct}%</span>
                    </span>
                  </div>
                  <div style={{height:"5px", borderRadius:"3px", background:t.colors.bgSection, overflow:"hidden"}}>
                    <div style={{height:"100%", borderRadius:"3px", background:item.color, width:`${pct}%`, transition:"width 0.4s ease"}} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VEHÍCULOS */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Ganancia por vehículo — {MESES[mes]}</p>
          {vehiculos.length === 0 && (
            <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textTertiary, textAlign:"center", padding:"20px 0"}}>
              Sin vehículos registrados.
            </p>
          )}
          {gananciaPorVeh.map((v,i,arr) => {
            const pct = Math.abs(v.neta)/maxNeta;
            const col = v.neta>=0 ? t.colors.green : t.colors.red;
            return (
              <div key={v.placa} style={{...styles.vehFila, borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:"5px"}}>
                    <div>
                      <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary}}>{v.placa}</span>
                      <span style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, marginLeft:"8px"}}>{v.tipo} · {v.viajes} viaje{v.viajes!==1?"s":""}· {v.km.toLocaleString("es-CO")} km</span>
                    </div>
                    <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:col}}>
                      {v.neta>=0?"+":""}{fmt(v.neta)}
                    </span>
                  </div>
                  <div style={{height:"4px", borderRadius:"2px", background:t.colors.bgSection, overflow:"hidden"}}>
                    <div style={{height:"100%", borderRadius:"2px", background:col, width:`${pct*100}%`, transition:"width 0.4s ease"}} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ESTADO VACÍO */}
        {viajesMes.length === 0 && (
          <div style={styles.vacio}>
            <p style={{fontSize:"32px", marginBottom:"8px"}}>📊</p>
            <p style={styles.vacioTexto}>Sin datos este mes</p>
            <p style={styles.vacioSub}>Registra viajes en la calculadora para ver tus cuentas aquí.</p>
            <button style={styles.btnCalcular} onClick={()=>navigate("/calculadora")}>
              Calcular flete
            </button>
          </div>
        )}

        {/* VIAJES DEL MES */}
        {viajesMes.length > 0 && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>{viajesMes.length} viaje{viajesMes.length!==1?"s":""} este mes</p>
            {[...viajesMes].reverse().map((viaje,i,arr) => (
              <div
                key={viaje.firestoreId}
                style={{...styles.viajeFilaMes, borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`, cursor:"pointer"}}
                onClick={()=>navigate(`/viaje/${viaje.firestoreId}`)}
              >
                <div style={{flex:1}}>
                  <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>{viaje.ruta||"Sin ruta"}</p>
                  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0"}}>{viaje.fecha||""}{viaje.placa?` · ${viaje.placa}`:""}</p>
                </div>
                <p style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, margin:0, color:(viaje.neta||0)>=0?t.colors.green:t.colors.red}}>
                  {(viaje.neta||0)>=0?"+":""}{fmt(viaje.neta||0)}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  pantalla:         { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"20px" },
  header:           { display:"flex", justifyContent:"space-between", alignItems:"flex-end", padding:"20px 20px 16px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  headerSub:        { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 2px", fontWeight:t.fonts.weightMedium, textTransform:"uppercase", letterSpacing:"0.06em" },
  titulo:           { fontSize:"22px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:0, letterSpacing:"-0.3px" },
  btnHistorial:     { display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", background:t.colors.blueSoft, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.blue, cursor:"pointer" },
  navMes:           { display:"flex", justifyContent:"space-between", alignItems:"center", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}`, padding:"10px 20px" },
  btnMes:           { background:"none", border:"none", fontSize:"22px", color:t.colors.blue, cursor:"pointer", padding:"0 8px", fontWeight:t.fonts.weightNormal },
  labelMes:         { fontSize:"15px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:        { padding:"12px 16px 16px" },
  gananciaHero:     { borderRadius:t.radius.lg, padding:"20px", marginBottom:"12px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 4px 14px rgba(0,0,0,0.12)" },
  gananciaHeroLabel:{ fontSize:t.fonts.sizeXs, color:"rgba(255,255,255,0.75)", margin:"0 0 4px", fontWeight:t.fonts.weightMedium, textTransform:"uppercase", letterSpacing:"0.06em" },
  gananciaHeroVal:  { fontSize:"42px", fontWeight:t.fonts.weightBlack, color:"#fff", margin:"0 0 4px", letterSpacing:"-0.5px" },
  gananciaHeroSub:  { fontSize:t.fonts.sizeXs, color:"rgba(255,255,255,0.7)", margin:0 },
  gananciaHeroBadge:{ background:"rgba(255,255,255,0.15)", borderRadius:t.radius.md, padding:"12px", backdropFilter:"blur(10px)" },
  dosColumnas:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px" },
  metricaCard:      { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"14px", boxShadow:t.shadows.card },
  metricaLabel:     { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.05em" },
  metricaVal:       { fontSize:"18px", fontWeight:t.fonts.weightBold, margin:0 },
  card:             { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"12px", boxShadow:t.shadows.card },
  cardTitulo:       { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 14px" },
  grafica:          { display:"flex", alignItems:"flex-end", gap:"6px", height:"120px", paddingTop:"20px" },
  graficaCol:       { flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%" },
  graficaBarraWrap: { flex:1, width:"100%", display:"flex", alignItems:"flex-end", justifyContent:"center" },
  graficaBarra:     { width:"100%", borderRadius:"4px 4px 0 0", transition:"height 0.4s ease", minHeight:"2px" },
  vehFila:          { padding:"12px 0" },
  vacio:            { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"40px 20px", textAlign:"center", marginBottom:"12px", boxShadow:t.shadows.card },
  vacioTexto:       { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 6px" },
  vacioSub:         { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 20px" },
  btnCalcular:      { padding:"12px 28px", background:t.colors.green, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer" },
  viajeFilaMes:     { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0" },
};

export default Cuentas;