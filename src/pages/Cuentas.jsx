import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { theme as t } from "../styles/theme";
import { SkeletonCard, SkeletonKpi } from "../components/Skeleton";

const esc = (t) => (t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

const MESES       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MESES_CORTO = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function Cuentas({ vehiculos = [], viajes = [], gastosFijos = [], gastosVehiculo = [], cargando }) {
  const navigate = useNavigate();
  const hoy = new Date();
  const [mes,  setMes]  = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [verViajesMes, setVerViajesMes] = useState(false);

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

  // ── Comparación con el mes anterior (para export) ──
  let mesAnt = mes - 1, anioAnt = anio;
  if (mesAnt < 0) { mesAnt = 11; anioAnt--; }
  const viajesMesAnt  = viajes.filter(v => { const f=new Date(v.fecha); return f.getMonth()===mesAnt && f.getFullYear()===anioAnt; });
  const ingresosAnt   = viajesMesAnt.reduce((s,v) => s+(v.vViaje||0), 0);
  const netaAnt       = viajesMesAnt.reduce((s,v) => s+(v.neta||0),   0);
  const gastosAdicAnt = gastosVehiculo.filter(g => { const f=new Date(g.fecha); return f.getMonth()===mesAnt && f.getFullYear()===anioAnt; }).reduce((s,g)=>s+(g.monto||0),0);
  const utilidadAnt   = netaAnt - totalPE - gastosAdicAnt;

  // Genera "↑ 12% vs May" en HTML para el export
  const varPct = (actual, anterior) => {
    if (!anterior || anterior === 0) return "";
    const pct = ((actual - anterior) / Math.abs(anterior)) * 100;
    const sube = pct >= 0;
    return `<span style="font-size:10px;font-weight:700;color:${sube?"#16a34a":"#dc2626"}">${sube?"↑":"↓"} ${Math.abs(pct).toFixed(0)}% vs ${MESES_CORTO[mesAnt]}</span>`;
  };

  // ── KPIs operativos (para export) ──
  const galMes   = viajesMes.reduce((s,v) => s+(v.gTot||0), 0);
  const costoKm  = kmMes > 0 ? gastosMes / kmMes : 0;
  const rendProm = galMes > 0 ? kmMes / galMes : 0;

  const gananciaPorVeh = vehiculos.map(veh => {
    const vt = viajesMes.filter(v => v.placa===veh.placa);
    return {
      placa: veh.placa, tipo: veh.tipoVehiculo,
      ingresos: vt.reduce((s,v)=>s+(v.vViaje||0),0),
      gastos: vt.reduce((s,v)=>s+(v.total||0),0),
      neta: vt.reduce((s,v)=>s+(v.neta||0),0),
      viajes: vt.length,
      km: vt.reduce((s,v)=>s+(v.kmT||0),0),
    };
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
        <button style={styles.btnHistorial} onClick={()=>{
          // Datos para el informe
          const pendientesCobro = viajes.filter(v => v.estadoPago !== "pagado");
          const totalPendCobro = pendientesCobro.reduce((s,v) => s+(v.vViaje||0), 0);
          const vencidosCobro = pendientesCobro.filter(v => {
            const plazo = v.diasPago || 30;
            const f = new Date(v.fecha);
            f.setDate(f.getDate()+plazo);
            return new Date() > f;
          });
          const totalVencCobro = vencidosCobro.reduce((s,v)=>s+(v.vViaje||0),0);

          // Viajes por vehículo con detalle
          const viajesPorVeh = {};
          viajesMes.forEach(v => {
            const p = v.placa || "Sin placa";
            if (!viajesPorVeh[p]) viajesPorVeh[p] = [];
            viajesPorVeh[p].push(v);
          });

          // Cartera por empresa
          const carteraPorEmp = {};
          pendientesCobro.forEach(v => {
            const emp = v.emp || "Sin empresa";
            if (!carteraPorEmp[emp]) carteraPorEmp[emp] = {viajes:0, monto:0, vencido:0};
            carteraPorEmp[emp].viajes++;
            carteraPorEmp[emp].monto += v.vViaje||0;
            const plazo = v.diasPago||30;
            const f = new Date(v.fecha);
            f.setDate(f.getDate()+plazo);
            if (new Date()>f) carteraPorEmp[emp].vencido += v.vViaje||0;
          });

          const w = window.open("","_blank","width=800,height=600");
          w.document.write(`<!DOCTYPE html><html><head><title>Informe ${MESES[mes]} ${anio} — NAVIRA</title>
          <style>
            *{box-sizing:border-box;margin:0;padding:0}
            body{font-family:-apple-system,sans-serif;padding:40px;color:#1a1a1a;max-width:750px;margin:0 auto;font-size:13px}
            .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;border-bottom:3px solid #1565FF;padding-bottom:15px}
            .logo{font-size:24px;font-weight:900;color:#1565FF;letter-spacing:1px}
            .logo-sub{font-size:11px;color:#666;margin-top:2px}
            .fecha-gen{text-align:right;font-size:11px;color:#888}
            h1{font-size:18px;margin:0 0 4px;color:#1a1a1a}
            h2{font-size:13px;margin:25px 0 10px;color:#1565FF;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}
            table{width:100%;border-collapse:collapse;margin-bottom:15px}
            th{text-align:left;font-size:11px;text-transform:uppercase;color:#666;padding:6px 8px;border-bottom:2px solid #e5e7eb;letter-spacing:0.5px}
            td{padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px}
            td:last-child,th:last-child{text-align:right}
            .total td{border-top:2px solid #1a1a1a;font-weight:700;font-size:13px;padding-top:8px}
            .subtotal td{border-top:1px solid #ccc;font-weight:600;background:#f9fafb}
            .resumen-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
            .resumen-card{border:1px solid #e5e7eb;border-radius:8px;padding:14px;text-align:center}
            .resumen-card .label{font-size:10px;text-transform:uppercase;color:#888;letter-spacing:0.5px;margin-bottom:4px}
            .resumen-card .valor{font-size:20px;font-weight:800}
            .verde{color:#16a34a} .rojo{color:#dc2626} .azul{color:#1565FF} .ambar{color:#d97706}
            .footer{text-align:center;color:#999;font-size:10px;margin-top:40px;border-top:1px solid #e5e7eb;padding-top:12px}
            .vencido{color:#dc2626;font-weight:600}
            .page-break{page-break-before:always}
            @media print{body{padding:20px;font-size:12px} .resumen-card .valor{font-size:16px}}
          </style></head><body>

          <!-- HEADER -->
          <div class="header">
            <div>
              <div class="logo">NAVIRA</div>
              <div class="logo-sub">Inteligencia y precisión en movimiento</div>
            </div>
            <div class="fecha-gen">
              <strong>Informe Financiero</strong><br>
              ${MESES[mes]} ${anio}<br>
              Generado: ${new Date().toLocaleDateString("es-CO")}
            </div>
          </div>

          <!-- RESUMEN EJECUTIVO -->
          <h2>Resumen ejecutivo</h2>
          <div class="resumen-grid" style="grid-template-columns:1fr 1fr">
            <div class="resumen-card">
              <div class="label">Ingresos brutos</div>
              <div class="valor azul">${fmt(ingresosMes)}</div>
              <div style="font-size:11px;color:#888;margin-top:4px">${viajesMes.length} viaje${viajesMes.length!==1?"s":""} ${varPct(ingresosMes, ingresosAnt)}</div>
            </div>
            <div class="resumen-card" style="border-color:${utilidadReal>=0?"#22c55e":"#ef4444"}">
              <div class="label">${totalPE>0||totalGastosAdic>0?"Utilidad real":"Ganancia neta"}</div>
              <div class="valor ${utilidadReal>=0?"verde":"rojo"}">${fmt(utilidadReal)}</div>
              <div style="font-size:11px;color:#888;margin-top:4px">Rentabilidad: ${rentabilidad}% ${varPct(utilidadReal, utilidadAnt)}</div>
            </div>
          </div>

          <!-- KPIs OPERATIVOS -->
          <div class="resumen-grid" style="grid-template-columns:1fr 1fr 1fr;margin-top:-8px">
            <div class="resumen-card" style="padding:10px">
              <div class="label">Costo por km</div>
              <div style="font-size:15px;font-weight:800">${fmt(costoKm)}</div>
            </div>
            <div class="resumen-card" style="padding:10px">
              <div class="label">Margen neto</div>
              <div style="font-size:15px;font-weight:800;color:${Number(rentabilidad)>=40?"#16a34a":Number(rentabilidad)>=20?"#d97706":"#dc2626"}">${rentabilidad}%</div>
            </div>
            <div class="resumen-card" style="padding:10px">
              <div class="label">Rendimiento prom.</div>
              <div style="font-size:15px;font-weight:800">${rendProm>0?rendProm.toFixed(1)+" km/gal":"—"}</div>
            </div>
          </div>

          <table>
            <tr style="background:#f0f9ff"><td style="font-weight:700">💰 Ingresos por viajes</td><td style="font-weight:700;color:#1565FF">${fmt(ingresosMes)}</td></tr>
            <tr><td colspan="2" style="font-size:11px;color:#888;padding:8px 8px 4px;border:none">Menos gastos operativos:</td></tr>
            <tr><td style="padding-left:20px">⛽ Combustible (ACPM + Adblue)</td><td style="color:#dc2626">-${fmt(acpmMes + adblMes)}</td></tr>
            <tr><td style="padding-left:20px">🛣️ Peajes</td><td style="color:#dc2626">-${fmt(peajesMes)}</td></tr>
            <tr><td style="padding-left:20px">👤 Conductor</td><td style="color:#dc2626">-${fmt(conductorMes)}</td></tr>
            ${otrosMes>0?`<tr><td style="padding-left:20px">📋 Otros gastos de viaje</td><td style="color:#dc2626">-${fmt(otrosMes)}</td></tr>`:""}
            ${descuentosMes>0?`<tr><td style="padding-left:20px">📑 Descuentos de ley</td><td style="color:#dc2626">-${fmt(descuentosMes)}</td></tr>`:""}
            <tr style="background:#f0fdf4"><td style="font-weight:600">= Ganancia neta de viajes</td><td style="font-weight:700;color:${netaMes>=0?"#16a34a":"#dc2626"}">${fmt(netaMes)}</td></tr>
            ${totalPE>0?`
            <tr><td colspan="2" style="font-size:11px;color:#888;padding:8px 8px 4px;border:none">Menos gastos fijos mensuales:</td></tr>
            <tr><td style="padding-left:20px">🏦 Gastos fijos (cuota, seguro, GPS...)</td><td style="color:#dc2626">-${fmt(totalPE)}</td></tr>`:""}
            ${totalGastosAdic>0?`<tr><td style="padding-left:20px">🔧 Gastos adicionales (taller, repuestos...)</td><td style="color:#dc2626">-${fmt(totalGastosAdic)}</td></tr>`:""}
            ${totalPE>0||totalGastosAdic>0?`<tr class="total" style="background:#f0fdf4"><td>= Utilidad real del período</td><td class="${utilidadReal>=0?"verde":"rojo"}">${fmt(utilidadReal)}</td></tr>`:""}
          </table>
          <table>
            <tr><td>Kilómetros recorridos</td><td>${kmMes.toLocaleString("es-CO")} km</td></tr>
            <tr><td>Vehículos activos</td><td>${vehiculos.length}</td></tr>
          </table>

          <!-- EVOLUCIÓN 6 MESES -->
          <h2>Evolución — Últimos 6 meses</h2>
          <div style="display:flex;align-items:flex-end;gap:10px;height:110px;padding:10px 4px 0">
            ${ultimos6.map(m=>{
              const alt = Math.round((Math.abs(m.neta)/maxGrafica)*80);
              const col = m.neta < 0 ? "#dc2626" : m.activo ? "#1565FF" : "#22c55e";
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
                <div style="font-size:9px;color:#666;font-weight:700;margin-bottom:3px">${m.neta!==0?"$"+(Math.abs(m.neta)/1000000).toFixed(1)+"M":""}</div>
                <div style="width:100%;max-width:44px;height:${Math.max(alt,2)}px;background:${col};border-radius:3px 3px 0 0"></div>
                <div style="font-size:10px;color:#888;margin-top:4px;font-weight:${m.activo?"800":"400"}">${m.mes}</div>
              </div>`;
            }).join("")}
          </div>
          <p style="font-size:10px;color:#999;margin:4px 0 0;text-align:center">Ganancia neta de viajes por mes · Mes actual en azul</p>

          <!-- DISTRIBUCIÓN DE GASTOS -->
          <h2>Distribución de gastos operativos</h2>
          <table>
            <tr><th>Concepto</th><th>Monto</th><th>% del total</th></tr>
            ${[
              {l:"ACPM",v:acpmMes},{l:"Adblue",v:adblMes},{l:"Peajes",v:peajesMes},
              {l:"Conductor",v:conductorMes},{l:"Otros gastos",v:otrosMes},
              ...(descuentosMes>0?[{l:"Descuentos de ley",v:descuentosMes}]:[]),
            ].filter(r=>r.v>0).map(r=>`<tr><td>${r.l}</td><td>${fmt(r.v)}</td><td>${gastosMes>0?(r.v/gastosMes*100).toFixed(1):0}%</td></tr>`).join("")}
            <tr class="total"><td>Total gastos operativos</td><td>${fmt(gastosMes)}</td><td>100%</td></tr>
          </table>

          <!-- DETALLE POR VEHÍCULO -->
          <h2 class="page-break">Detalle por vehículo</h2>
          ${Object.entries(viajesPorVeh).map(([placa, vjs]) => {
            const subIngresos = vjs.reduce((s,v)=>s+(v.vViaje||0),0);
            const subGastos = vjs.reduce((s,v)=>s+(v.total||0),0);
            const subNeta = vjs.reduce((s,v)=>s+(v.neta||0),0);
            const subKm = vjs.reduce((s,v)=>s+(v.kmT||0),0);
            return `
              <p style="font-size:14px;font-weight:700;margin:15px 0 8px;color:#1a1a1a">${esc(placa)}</p>
              <table>
                <tr><th>Fecha</th><th>Manifiesto</th><th>Ruta</th><th>Empresa</th><th>Producto</th><th>Flete</th><th>Gastos</th><th>Neta</th></tr>
                ${vjs.map(v=>{
                  const filaIda = `<tr>
                  <td>${esc(v.fecha)||"—"}</td>
                  <td>${esc(v.mani)||"—"}</td>
                  <td>${esc(v.ruta)||"—"}</td>
                  <td>${esc(v.emp)||"—"}</td>
                  <td>${esc(v.prod)||"—"}</td>
                  <td>${fmt(v.tieneRetorno ? (v.valorViajeIda||(v.vViaje||0)-(v.valorViajeRetorno||0)) : (v.vViaje||0))}</td>
                  <td style="color:#dc2626">${fmt(v.total||0)}</td>
                  <td class="${(v.neta||0)>=0?"verde":"rojo"}">${fmt(v.neta||0)}</td>
                </tr>`;
                  if (!v.tieneRetorno || !(v.valorViajeRetorno > 0)) return filaIda;
                  const filaRet = `<tr style="background:#f0f9ff">
                  <td>${esc(v.fechaCargueRet)||esc(v.fecha)||"—"}</td>
                  <td>${esc(v.maniRet)||"—"}</td>
                  <td>↩ ${esc(v.rutaRet)||"retorno"}</td>
                  <td>${esc(v.empresaRet)||esc(v.emp)||"—"}</td>
                  <td>${esc(v.productoRet)||"—"}</td>
                  <td>${fmt(v.valorViajeRetorno||0)}</td>
                  <td colspan="2" style="font-size:10px;color:#888">incluido arriba</td>
                </tr>`;
                  return filaIda + filaRet;
                }).join("")}
                <tr class="subtotal">
                  <td colspan="5"><strong>${vjs.length} viaje${vjs.length!==1?"s":""} · ${subKm.toLocaleString("es-CO")} km</strong></td>
                  <td>${fmt(subIngresos)}</td>
                  <td style="color:#dc2626">${fmt(subGastos)}</td>
                  <td class="${subNeta>=0?"verde":"rojo"}">${fmt(subNeta)}</td>
                </tr>
              </table>`;
          }).join("")}

          <!-- RESUMEN POR VEHÍCULO -->
          <h2>Ranking de vehículos</h2>
          <table>
            <tr><th>Placa</th><th>Viajes</th><th>Km</th><th>Ingresos</th><th>Gastos</th><th>Utilidad</th></tr>
            ${gananciaPorVeh.map(v=>`<tr>
              <td><strong>${esc(v.placa)}</strong></td>
              <td>${v.viajes}</td>
              <td>${v.km.toLocaleString("es-CO")}</td>
              <td>${fmt(v.ingresos||0)}</td>
              <td style="color:#dc2626">${fmt(v.gastos||0)}</td>
              <td class="${v.neta>=0?"verde":"rojo"}"><strong>${fmt(v.neta)}</strong></td>
            </tr>`).join("")}
          </table>

          ${gastosAdicMes.length>0?`
          <!-- GASTOS ADICIONALES -->
          <h2>Gastos adicionales del mes</h2>
          <table>
            <tr><th>Fecha</th><th>Vehículo</th><th>Descripción</th><th>Taller</th><th>Monto</th></tr>
            ${gastosAdicMes.map(g=>`<tr>
              <td>${esc(g.fecha)||"—"}</td>
              <td>${esc(g.placa)||"—"}</td>
              <td>${esc(g.descripcion)||"—"}</td>
              <td>${esc(g.taller)||"—"}${g.nit?" · NIT: "+esc(g.nit):""}</td>
              <td style="color:#dc2626">${fmt(g.monto)}</td>
            </tr>`).join("")}
            <tr class="total"><td colspan="4">Total gastos adicionales</td><td style="color:#dc2626">${fmt(totalGastosAdic)}</td></tr>
          </table>`:""}

          <!-- ESTADO DE CARTERA -->
          <h2>Estado de cartera</h2>
          <div class="resumen-grid" style="grid-template-columns:1fr 1fr">
            <div class="resumen-card">
              <div class="label">Pendiente por cobrar</div>
              <div class="valor ambar">${fmt(totalPendCobro)}</div>
              <div style="font-size:11px;color:#888;margin-top:4px">${pendientesCobro.length} viaje${pendientesCobro.length!==1?"s":""}</div>
            </div>
            <div class="resumen-card" style="border-color:#fca5a5">
              <div class="label">Vencido</div>
              <div class="valor rojo">${fmt(totalVencCobro)}</div>
              <div style="font-size:11px;color:#888;margin-top:4px">${vencidosCobro.length} viaje${vencidosCobro.length!==1?"s":""}</div>
            </div>
          </div>
          ${Object.keys(carteraPorEmp).length>0?`
          <table>
            <tr><th>Empresa</th><th>Viajes</th><th>Pendiente</th><th>Vencido</th></tr>
            ${Object.entries(carteraPorEmp).map(([emp,d])=>`<tr>
              <td>${esc(emp)}</td>
              <td>${d.viajes}</td>
              <td class="ambar">${fmt(d.monto)}</td>
              <td class="${d.vencido>0?"rojo":""}">${d.vencido>0?fmt(d.vencido):"—"}</td>
            </tr>`).join("")}
          </table>`:"<p style='color:#888;font-size:12px'>No hay viajes pendientes de cobro.</p>"}

          <!-- FIRMAS -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:50px;page-break-inside:avoid">
            <div style="text-align:center">
              <div style="border-top:1px solid #333;padding-top:6px;font-size:11px;color:#666">Elaborado por</div>
            </div>
            <div style="text-align:center">
              <div style="border-top:1px solid #333;padding-top:6px;font-size:11px;color:#666">Revisado por</div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <strong>NAVIRA</strong> — Inteligencia y precisión en movimiento · naviraflota.app<br>
            Informe generado el ${new Date().toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"})} a las ${new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})} · Período: ${MESES[mes]} ${anio} · Todos los valores en COP<br>
            Documento de uso interno — La información contenida es confidencial
          </div>

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
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <p style={styles.cardTitulo}>Evolución últimos 6 meses</p>
            {(() => {
              const actual = ultimos6[5]?.neta || 0;
              const anterior = ultimos6[4]?.neta || 0;
              const diff = actual - anterior;
              if (anterior === 0 && actual === 0) return null;
              return (
                <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:diff>=0?t.colors.green:t.colors.red}}>
                  {diff>=0?"↑":"↓"} {diff!==0?fmtCorto(Math.abs(diff)):"="} vs mes anterior
                </span>
              );
            })()}
          </div>
          <div style={{...styles.grafica, height:"140px"}}>
            {ultimos6.map((m,i) => {
              const pct    = Math.abs(m.neta)/maxGrafica;
              const altura = Math.max(pct*100, m.neta!==0?6:0);
              const color  = m.activo ? t.colors.blue : m.neta>=0 ? t.colors.green : t.colors.red;
              return (
                <div key={i} style={styles.graficaCol}>
                  <p style={{fontSize:"10px", color:m.activo?t.colors.blue:t.colors.textTertiary, margin:"0 0 4px", textAlign:"center", fontWeight:m.activo?t.fonts.weightBold:t.fonts.weightNormal}}>
                    {m.neta!==0?fmtCorto(m.neta):""}
                  </p>
                  <div style={styles.graficaBarraWrap}>
                    <div style={{...styles.graficaBarra, height:`${altura}%`, background:color, opacity:m.activo?1:0.7}} />
                  </div>
                  <p style={{fontSize:"11px", color:m.activo?t.colors.blue:t.colors.textTertiary, fontWeight:m.activo?t.fonts.weightBold:t.fonts.weightNormal, margin:"6px 0 0", textAlign:"center"}}>
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
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setVerViajesMes(!verViajesMes)}>
              <p style={styles.cardTitulo}>{viajesMes.length} viaje{viajesMes.length!==1?"s":""} este mes</p>
              {verViajesMes ? <ChevronUp size={16} color={t.colors.textTertiary}/> : <ChevronDown size={16} color={t.colors.textTertiary}/>}
            </div>
            {verViajesMes && [...viajesMes].reverse().map((viaje,i,arr) => (
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