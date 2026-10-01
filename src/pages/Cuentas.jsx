// Hecho por JESUS COSSIO DEV
/**
 * Cuentas — Resumen Financiero Desacoplado y de Baja Densidad
 * Adaptado para conductores y propietarios de flota (30-70 años)
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, 
  FileDown, Scale, Calendar, BarChart3, PieChart, Truck
} from "lucide-react";
import { theme as t } from "../styles/theme";
import { SkeletonCard, SkeletonKpi } from "../components/Skeleton";

const MESES       = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MESES_CORTO = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const TXT_APAGADO = "#6B7280";

const esc = (t) => (t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function Cuentas({ vehiculos = [], viajes = [], gastosFijos = [], gastosVehiculo = [], cargando }) {
  const navigate = useNavigate();
  const hoy = new Date();

  // Tab activo para reducir densidad: 'resumen' | 'gastos' | 'flota' | 'fechas'
  const [tabActivo, setTabActivo] = useState("resumen");

  // Parseo de fechas YYYY-MM-DD como fecha LOCAL (evita el corrimiento UTC de -1 día)
  const fechaLocal = (iso) => {
    const [y, m, d] = (iso || "").split("-").map(Number);
    return new Date(y || 1970, (m || 1) - 1, d || 1);
  };

  const [mes, setMes]   = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [rangoDesde, setRangoDesde] = useState("");
  const [rangoHasta, setRangoHasta] = useState("");

  const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");
  const fmtCorto = (n) => {
    const abs = Math.abs(n || 0);
    if (abs >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (abs >= 1000) return (n / 1000).toFixed(0) + "K";
    return Math.round(n || 0).toLocaleString("es-CO");
  };

  const cambiarMes = (dir) => {
    let m = mes + dir, a = anio;
    if (m > 11) { m = 0; a++; }
    if (m < 0)  { m = 11; a--; }
    setMes(m); setAnio(a);
  };

  const viajesMes    = viajes.filter(v => { const f = fechaLocal(v.fecha); return f.getMonth() === mes && f.getFullYear() === anio; });
  const ingresosMes  = viajesMes.reduce((s, v) => s + (v.vViaje || 0), 0);
  const anticiposMes = viajesMes.reduce((s, v) => s + (v.anticipoFleteMonto || 0) + (v.anticipoFleteMontoRet || 0), 0);
  const saldosMes    = ingresosMes - anticiposMes;
  const gastosMes    = viajesMes.reduce((s, v) => s + (v.total || 0), 0);
  const netaMes      = viajesMes.reduce((s, v) => s + (v.neta || 0), 0);
  const rentabilidad = ingresosMes > 0 ? ((netaMes / ingresosMes) * 100).toFixed(1) : "0.0";
  const kmMes        = viajesMes.reduce((s, v) => s + (v.kmT || 0), 0);

  const acpmMes       = viajesMes.reduce((s, v) => s + (v.cAcpm || 0), 0);
  const adblMes       = viajesMes.reduce((s, v) => s + (v.cAdbl || 0), 0);
  const peajesMes     = viajesMes.reduce((s, v) => s + (v.peajes || 0), 0);
  const conductorMes  = viajesMes.reduce((s, v) => s + (v.conductor || 0), 0);
  const otrosMes      = viajesMes.reduce((s, v) => s + (v.carp || 0) + (v.gv2 || 0) + (v.extras || 0), 0);
  const descuentosMes = viajesMes.reduce((s, v) => s + (v.descuentos?.total || 0), 0);

  // Punto de equilibrio total de la flota
  const totalPE = gastosFijos.reduce((s, g) => {
    const monto = g.monto || 0;
    return s + (g.periodicidad === "anual" ? monto / 12 : monto);
  }, 0);

  // Gastos adicionales del mes
  const gastosAdicMes = gastosVehiculo.filter(g => {
    const f = fechaLocal(g.fecha);
    return f.getMonth() === mes && f.getFullYear() === anio;
  });
  const totalGastosAdic = gastosAdicMes.reduce((s, g) => s + (g.monto || 0), 0);
  const utilidadReal    = netaMes - totalPE - totalGastosAdic;

  const costoKm  = kmMes > 0 ? gastosMes / kmMes : 0;

  const rendProm = kmMes / (acpmMes / 3.15 || 1);

  const gananciaPorVeh = vehiculos.map(veh => {
    const vt = viajesMes.filter(v => v.placa === veh.placa);
    return {
      placa: veh.placa, tipo: veh.tipoVehiculo,
      ingresos: vt.reduce((s, v) => s + (v.vViaje || 0), 0),
      gastos: vt.reduce((s, v) => s + (v.total || 0), 0),
      neta: vt.reduce((s, v) => s + (v.neta || 0), 0),
      viajes: vt.length,
      km: vt.reduce((s, v) => s + (v.kmT || 0), 0),
    };
  }).sort((a, b) => b.neta - a.neta);
  const maxNeta = Math.max(...gananciaPorVeh.map(v => Math.abs(v.neta)), 1);

  const ultimos6 = Array.from({ length: 6 }, (_, i) => {
    let m = mes - (5 - i), a = anio;
    if (m < 0) { m += 12; a--; }
    const vm = viajes.filter(v => { const f = fechaLocal(v.fecha); return f.getMonth() === m && f.getFullYear() === a; });
    return { mes: MESES_CORTO[m], neta: vm.reduce((s, v) => s + (v.neta || 0), 0), activo: m === mes && a === anio };
  });
  const maxGrafica = Math.max(...ultimos6.map(m => Math.abs(m.neta)), 1);

  if (cargando) return (
    <div style={styles.pantalla}>
      <div style={{ padding: "16px" }}>
        <SkeletonKpi />
        <SkeletonCard filas={3} />
        <SkeletonCard filas={5} />
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
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            style={styles.btnAccion} 
            onClick={() => {
              const pendientesCobro = viajes.filter(v => v.estadoPago !== "pagado");
              const totalPendCobro = pendientesCobro.reduce((s, v) => s + (v.vViaje || 0), 0);
              const vencidosCobro = pendientesCobro.filter(v => {
                const plazo = v.diasPago || 30;
                const f = fechaLocal(v.fecha);
                f.setDate(f.getDate() + plazo);
                return new Date() > f;
              });
              const totalVencCobro = vencidosCobro.reduce((s, v) => s + (v.vViaje || 0), 0);
              const obtenerSaldoPendiente = (v) => (v.vViaje || 0) - (v.anticipoFleteMonto || 0) - (v.anticipoFleteMontoRet || 0);
              const viajesPorVeh = {};
              viajesMes.forEach(v => {
                const p = v.placa || "Sin placa";
                if (!viajesPorVeh[p]) viajesPorVeh[p] = [];
                viajesPorVeh[p].push(v);
              });
              const carteraPorEmp = {};
              pendientesCobro.forEach(v => {
                const emp = v.emp || "Sin empresa";
                if (!carteraPorEmp[emp]) carteraPorEmp[emp] = { viajes: 0, monto: 0, vencido: 0 };
                carteraPorEmp[emp].viajes++;
                const saldoV = obtenerSaldoPendiente(v);
                carteraPorEmp[emp].monto += saldoV;
                const plazo = v.diasPago || 30;
                const f = fechaLocal(v.fecha);
                f.setDate(f.getDate() + plazo);
                if (new Date() > f) carteraPorEmp[emp].vencido += saldoV;
              });

              const anticiposIdaMes = viajesMes.reduce((s, v) => s + (v.anticipoFleteMonto || 0), 0);
              const anticiposRetMes = viajesMes.reduce((s, v) => s + (v.anticipoFleteMontoRet || 0), 0);
              const totalAnticiposMes = anticiposIdaMes + anticiposRetMes;

              const w = window.open("", "_blank", "width=800,height=600");
              if (!w) { alert("El navegador bloqueó la ventana del informe. Permite las ventanas emergentes para este sitio e inténtalo de nuevo."); return; }
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
                .page-break{page-break-before:always}
                .resumen-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
                .resumen-card{border:1px solid #e5e7eb;border-radius:8px;padding:14px;text-align:center}
                .resumen-card .label{font-size:10px;text-transform:uppercase;color:#888;letter-spacing:0.5px;margin-bottom:4px}
                .resumen-card .valor{font-size:20px;font-weight:800}
                .verde{color:#16a34a} .rojo{color:#dc2626} .azul{color:#1565FF} .ambar{color:#d97706}
                .footer{text-align:center;color:#999;font-size:10px;margin-top:40px;border-top:1px solid #e5e7eb;padding-top:12px}
              </style></head><body>
              <div class="header">
                <div><div class="logo">NAVIRA</div><div class="logo-sub">Inteligencia y precisión en movimiento</div></div>
                <div class="fecha-gen"><strong>Informe Financiero</strong><br>${MESES[mes]} ${anio}<br>Generado: ${new Date().toLocaleDateString("es-CO")}</div>
              </div>
              <h2>Resumen ejecutivo</h2>
              <div class="resumen-grid">
                <div class="resumen-card"><div class="label">Ingresos brutos</div><div class="valor azul">${fmt(ingresosMes)}</div></div>
                <div class="resumen-card"><div class="label">Anticipos Recibidos</div><div class="valor azul">${fmt(totalAnticiposMes)}</div></div>
                <div class="resumen-card"><div class="label">Utilidad real</div><div class="valor ${utilidadReal >= 0 ? "verde" : "rojo"}">${fmt(utilidadReal)}</div></div>
              </div>
              <div class="resumen-grid" style="margin-top:12px">
                <div class="resumen-card" style="padding:10px">
                  <div class="label">Margen neto</div>
                  <div style="font-size:15px;font-weight:800;color:${Number(rentabilidad) >= 40 ? "#16a34a" : Number(rentabilidad) >= 20 ? "#d97706" : "#dc2626"}">${rentabilidad}%</div>
                </div>
                <div class="resumen-card" style="padding:10px">
                  <div class="label">Rendimiento prom.</div>
                  <div style="font-size:15px;font-weight:800">${rendProm > 0 ? rendProm.toFixed(1) + " km/gal" : "—"}</div>
                </div>
              </div>

              <table>
                <tr style="background:#f0f9ff"><td style="font-weight:700">Ingresos por viajes</td><td style="font-weight:700;color:#1565FF">${fmt(ingresosMes)}</td></tr>
                <tr><td colspan="2" style="font-size:11px;color:#888;padding:8px 8px 4px;border:none">Menos gastos operativos:</td></tr>
                <tr><td style="padding-left:20px">Combustible (ACPM + Adblue)</td><td style="color:#dc2626">-${fmt(acpmMes + adblMes)}</td></tr>
                <tr><td style="padding-left:20px">Peajes</td><td style="color:#dc2626">-${fmt(peajesMes)}</td></tr>
                <tr><td style="padding-left:20px">Conductor</td><td style="color:#dc2626">-${fmt(conductorMes)}</td></tr>
                ${otrosMes > 0 ? `<tr><td style="padding-left:20px">Otros gastos de viaje</td><td style="color:#dc2626">-${fmt(otrosMes)}</td></tr>` : ""}
                ${descuentosMes > 0 ? `<tr><td style="padding-left:20px">Descuentos de ley</td><td style="color:#dc2626">-${fmt(descuentosMes)}</td></tr>` : ""}
                <tr style="background:#f0fdf4"><td style="font-weight:600">= Ganancia neta de viajes</td><td style="font-weight:700;color:${netaMes >= 0 ? "#16a34a" : "#dc2626"}">${fmt(netaMes)}</td></tr>
                ${totalPE > 0 ? `
                <tr><td colspan="2" style="font-size:11px;color:#888;padding:8px 8px 4px;border:none">Menos gastos fijos mensuales:</td></tr>
                <tr><td style="padding-left:20px">Gastos fijos (cuota, seguro, GPS...)</td><td style="color:#dc2626">-${fmt(totalPE)}</td></tr>` : ""}
                ${totalGastosAdic > 0 ? `<tr><td style="padding-left:20px">Gastos adicionales (taller, repuestos...)</td><td style="color:#dc2626">-${fmt(totalGastosAdic)}</td></tr>` : ""}
                ${totalPE > 0 || totalGastosAdic > 0 ? `<tr class="total" style="background:#f0fdf4"><td>= Utilidad real del período</td><td class="${utilidadReal >= 0 ? "verde" : "rojo"}">${fmt(utilidadReal)}</td></tr>` : ""}
              </table>
              <table>
                <tr><td>Kilómetros recorridos</td><td>${kmMes.toLocaleString("es-CO")} km</td></tr>
                <tr><td>Vehículos activos</td><td>${vehiculos.length}</td></tr>
              </table>

              <h2>Evolución — Últimos 6 meses</h2>
              <div style="display:flex;align-items:flex-end;gap:10px;height:110px;padding:10px 4px 0">
                ${ultimos6.map(m => {
                  const alt = Math.round((Math.abs(m.neta) / maxGrafica) * 80);
                  const col = m.neta < 0 ? "#dc2626" : m.activo ? "#1565FF" : "#22c55e";
                  return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
                    <div style="font-size:9px;color:#666;font-weight:700;margin-bottom:3px">${m.neta !== 0 ? "$" + (Math.abs(m.neta) / 1000000).toFixed(1) + "M" : ""}</div>
                    <div style="width:100%;max-width:44px;height:${Math.max(alt, 2)}px;background:${col};border-radius:3px 3px 0 0"></div>
                    <div style="font-size:10px;color:#888;margin-top:4px;font-weight:${m.activo ? "800" : "400"}">${m.mes}</div>
                  </div>`;
                }).join("")}
              </div>
              <p style="font-size:10px;color:#999;margin:4px 0 0;text-align:center">Ganancia neta de viajes por mes · Mes actual en azul</p>

              <h2>Distribución de gastos operativos</h2>
              <table>
                <tr><th>Concepto</th><th>Monto</th><th>% del total</th></tr>
                ${[
                  { l: "ACPM", v: acpmMes }, { l: "Adblue", v: adblMes }, { l: "Peajes", v: peajesMes },
                  { l: "Conductor", v: conductorMes }, { l: "Otros gastos", v: otrosMes },
                  ...(descuentosMes > 0 ? [{ l: "Descuentos de ley", v: descuentosMes }] : []),
                ].filter(r => r.v > 0).map(r => `<tr><td>${r.l}</td><td>${fmt(r.v)}</td><td>${gastosMes > 0 ? (r.v / gastosMes * 100).toFixed(1) : 0}%</td></tr>`).join("")}
                <tr class="total"><td>Total gastos operativos</td><td>${fmt(gastosMes)}</td><td>100%</td></tr>
              </table>

              <h2 class="page-break">Detalle por vehículo</h2>
              ${Object.entries(viajesPorVeh).map(([placa, vjs]) => {
                const subIngresos = vjs.reduce((s, v) => s + (v.vViaje || 0), 0);
                const subGastos = vjs.reduce((s, v) => s + (v.total || 0), 0);
                const subNeta = vjs.reduce((s, v) => s + (v.neta || 0), 0);
                const subKm = vjs.reduce((s, v) => s + (v.kmT || 0), 0);
                return `
                  <p style="font-size:14px;font-weight:700;margin:15px 0 8px;color:#1a1a1a">${esc(placa)}</p>
                  <table>
                    <tr><th>Fecha</th><th>Manifiesto</th><th>Ruta</th><th>Empresa</th><th>Flete</th><th>Gastos</th><th>Neta</th></tr>
                    ${vjs.map(v => `<tr>
                      <td>${esc(v.fecha) || "—"}</td>
                      <td>${esc(v.mani) || "—"}</td>
                      <td>${esc(v.ruta) || "—"}</td>
                      <td>${esc(v.emp) || "—"}</td>
                      <td>${fmt(v.vViaje || 0)}</td>
                      <td style="color:#dc2626">${fmt(v.total || 0)}</td>
                      <td class="${(v.neta || 0) >= 0 ? "verde" : "rojo"}">${fmt(v.neta || 0)}</td>
                    </tr>`).join("")}
                    <tr class="subtotal">
                      <td colspan="4"><strong>${vjs.length} viaje${vjs.length !== 1 ? "s" : ""} · ${subKm.toLocaleString("es-CO")} km</strong></td>
                      <td>${fmt(subIngresos)}</td>
                      <td style="color:#dc2626">${fmt(subGastos)}</td>
                      <td class="${subNeta >= 0 ? "verde" : "rojo"}">${fmt(subNeta)}</td>
                    </tr>
                  </table>`;
              }).join("")}

              <h2>Ranking de vehículos</h2>
              <table>
                <tr><th>Placa</th><th>Viajes</th><th>Km</th><th>Ingresos</th><th>Gastos</th><th>Utilidad</th></tr>
                ${gananciaPorVeh.map(v => `<tr>
                  <td><strong>${esc(v.placa)}</strong></td>
                  <td>${v.viajes}</td>
                  <td>${v.km.toLocaleString("es-CO")}</td>
                  <td>${fmt(v.ingresos || 0)}</td>
                  <td style="color:#dc2626">${fmt(v.gastos || 0)}</td>
                  <td class="${v.neta >= 0 ? "verde" : "rojo"}"><strong>${fmt(v.neta)}</strong></td>
                </tr>`).join("")}
              </table>

              ${gastosAdicMes.length > 0 ? `
              <h2>Gastos adicionales del mes</h2>
              <table>
                <tr><th>Fecha</th><th>Vehículo</th><th>Descripción</th><th>Taller</th><th>Monto</th></tr>
                ${gastosAdicMes.map(g => `<tr>
                  <td>${esc(g.fecha) || "—"}</td>
                  <td>${esc(g.placa) || "—"}</td>
                  <td>${esc(g.descripcion) || "—"}</td>
                  <td>${esc(g.taller) || "—"}${g.nit ? " · NIT: " + esc(g.nit) : ""}</td>
                  <td style="color:#dc2626">${fmt(g.monto)}</td>
                </tr>`).join("")}
                <tr class="total"><td colspan="4">Total gastos adicionales</td><td style="color:#dc2626">${fmt(totalGastosAdic)}</td></tr>
              </table>` : ""}

              <h2>Estado de cartera</h2>
              <div class="resumen-grid" style="grid-template-columns:1fr 1fr">
                <div class="resumen-card">
                  <div class="label">Pendiente por cobrar</div>
                  <div class="valor ambar">${fmt(totalPendCobro)}</div>
                  <div style="font-size:11px;color:#888;margin-top:4px">${pendientesCobro.length} viaje${pendientesCobro.length !== 1 ? "s" : ""}</div>
                </div>
                <div class="resumen-card" style="border-color:#fca5a5">
                  <div class="label">Vencido</div>
                  <div class="valor rojo">${fmt(totalVencCobro)}</div>
                  <div style="font-size:11px;color:#888;margin-top:4px">${vencidosCobro.length} viaje${vencidosCobro.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              ${Object.keys(carteraPorEmp).length > 0 ? `
              <table>
                <tr><th>Empresa</th><th>Viajes</th><th>Pendiente</th><th>Vencido</th></tr>
                ${Object.entries(carteraPorEmp).map(([emp, d]) => `<tr>
                  <td>${esc(emp)}</td>
                  <td>${d.viajes}</td>
                  <td class="ambar">${fmt(d.monto)}</td>
                  <td class="${d.vencido > 0 ? "rojo" : ""}">${d.vencido > 0 ? fmt(d.vencido) : "—"}</td>
                </tr>`).join("")}
              </table>` : "<p style='color:#888;font-size:12px'>No hay viajes pendientes de cobro.</p>"}

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:50px;page-break-inside:avoid">
                <div style="text-align:center">
                  <div style="border-top:1px solid #333;padding-top:6px;font-size:11px;color:#666">Elaborado por</div>
                </div>
                <div style="text-align:center">
                  <div style="border-top:1px solid #333;padding-top:6px;font-size:11px;color:#666">Revisado por</div>
                </div>
              </div>

              <div class="footer">
                <strong>NAVIRA</strong> · Inteligencia y precisión en movimiento · naviraflota.app<br>
                Informe generado el ${new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })} a las ${new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · Período: ${MESES[mes]} ${anio} · Todos los valores en COP<br>
                Documento de uso interno · La información contenida es confidencial
              </div>

              </body></html>`);
              w.document.close();
              setTimeout(() => w.print(), 500);
            }}
          >
            <FileDown size={16} color={t.colors.blueText} strokeWidth={2.2} />
            <span>PDF</span>
          </button>
          <button style={styles.btnAccion} onClick={() => navigate("/comparativo")}>
            <Scale size={16} color={t.colors.blueText} strokeWidth={2.2} />
            <span>Comparar</span>
          </button>
        </div>
      </div>

      {/* NAV MES */}
      <div style={styles.navMes}>
        <button type="button" aria-label="Mes anterior" style={styles.btnMes} onClick={() => cambiarMes(-1)}>‹</button>
        <p style={styles.labelMes}>{MESES[mes]} {anio}</p>
        <button type="button" aria-label="Mes siguiente" style={styles.btnMes} onClick={() => cambiarMes(1)}>›</button>
      </div>

      {/* SELECTOR DE PESTAÑAS PARA DESATURAR LA VISTA */}
      <div style={styles.tabsContenedor}>
        {[
          { id: "resumen", label: "Resumen", icon: <BarChart3 size={15} /> },
          { id: "gastos",  label: "Gastos",  icon: <PieChart size={15} /> },
          { id: "flota",   label: "Vehículos", icon: <Truck size={15} /> },
          { id: "fechas",  label: "Rango",   icon: <Calendar size={15} /> },
        ].map(tab => {
          const activo = tabActivo === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTabActivo(tab.id)}
              style={{
                ...styles.tabBoton,
                background: activo ? t.colors.blue : t.colors.bgCard,
                color: activo ? "#FFFFFF" : t.colors.textSecondary,
                borderColor: activo ? t.colors.blue : t.colors.border,
                boxShadow: activo ? "0 2px 8px rgba(21,101,255,0.35)" : "none",
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.contenido}>

        {/* ═════════════════ PESTAÑA 1: RESUMEN ═════════════════ */}
        {tabActivo === "resumen" && (
          <div>
            {/* GANANCIA HERO */}
            <div style={{
              ...styles.gananciaHero,
              background: netaMes >= 0
                ? "linear-gradient(135deg, #059669 0%, #10B981 100%)"
                : "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
            }}>
              <div>
                <p style={styles.gananciaHeroLabel}>Ganancia Neta del Mes</p>
                <p style={styles.gananciaHeroVal}>{fmt(netaMes)}</p>
                <p style={styles.gananciaHeroSub}>
                  {viajesMes.length} viaje{viajesMes.length !== 1 ? "s" : ""} · Rentabilidad:{" "}
                  <strong>{rentabilidad}%</strong>
                </p>
              </div>
              <div style={styles.gananciaHeroBadge}>
                {netaMes >= 0
                  ? <TrendingUp size={32} color="#FFFFFF" strokeWidth={2.5} />
                  : <TrendingDown size={32} color="#FFFFFF" strokeWidth={2.5} />
                }
              </div>
            </div>

            {/* INGRESOS Y GASTOS EN 2 TARJETAS GRANDES */}
            <div style={styles.dosColumnas}>
              <div style={styles.metricaCard}>
                <p style={styles.metricaLabel}>Ingresos Brutos</p>
                <p style={{ ...styles.metricaVal, color: "#2563EB" }}>{fmt(ingresosMes)}</p>
              </div>
              <div style={styles.metricaCard}>
                <p style={styles.metricaLabel}>Total Gastos</p>
                <p style={{ ...styles.metricaVal, color: "#DC2626" }}>{fmt(gastosMes)}</p>
              </div>
            </div>

            {/* FLUJO DE CAJA */}
            {anticiposMes > 0 && (
              <div style={styles.card}>
                <p style={styles.cardTitulo}>Flujo de Caja en Ruta</p>
                <div style={styles.filaDato}>
                  <span style={styles.filaLabel}>Anticipos Recibidos:</span>
                  <span style={{ ...styles.filaVal, color: "#2563EB" }}>{fmt(anticiposMes)}</span>
                </div>
                <div style={{ ...styles.filaDato, borderBottom: "none" }}>
                  <span style={styles.filaLabel}>Saldos por Cobrar:</span>
                  <span style={{ ...styles.filaVal, color: "#D97706" }}>{fmt(saldosMes)}</span>
                </div>
              </div>
            )}

            {/* MÉTRICAS OPERATIVAS */}
            <div style={styles.dosColumnas}>
              <div style={styles.metricaCard}>
                <p style={styles.metricaLabel}>Km Recorridos</p>
                <p style={{ ...styles.metricaVal, color: TXT_APAGADO }}>
                  {kmMes > 0 ? kmMes.toLocaleString("es-CO") + " km" : "0 km"}
                </p>
              </div>
              <div style={styles.metricaCard}>
                <p style={styles.metricaLabel}>Costo por Km</p>
                <p style={{ ...styles.metricaVal, color: TXT_APAGADO }}>
                  {fmt(costoKm)}
                </p>
              </div>
            </div>

            {/* EVOLUCIÓN 6 MESES */}
            <div style={styles.card}>
              <p style={styles.cardTitulo}>Evolución Últimos 6 Meses</p>
              <div style={styles.grafica}>
                {ultimos6.map((m, i) => {
                  const pct = Math.abs(m.neta) / maxGrafica;
                  const altura = Math.max(pct * 100, m.neta !== 0 ? 8 : 2);
                  const color = m.activo ? "#2563EB" : m.neta >= 0 ? "#10B981" : "#EF4444";
                  return (
                    <div key={i} style={styles.graficaCol}>
                      <span style={styles.graficaVal}>{m.neta !== 0 ? fmtCorto(m.neta) : ""}</span>
                      <div style={styles.graficaBarraWrap}>
                        <div style={{ ...styles.graficaBarra, height: `${altura}%`, background: color }} />
                      </div>
                      <span style={{ ...styles.graficaMes, fontWeight: m.activo ? "800" : "500", color: m.activo ? "#2563EB" : "#6B7280" }}>
                        {m.mes}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════ PESTAÑA 2: GASTOS ═════════════════ */}
        {tabActivo === "gastos" && (
          <div>
            <div style={styles.card}>
              <p style={styles.cardTitulo}>Distribución de Gastos Operativos</p>
              {[
                { label: "Combustible ACPM", valor: acpmMes, color: "#2563EB" },
                { label: "Adblue",           valor: adblMes, color: "#8B5CF6" },
                { label: "Peajes",           valor: peajesMes, color: "#F59E0B" },
                { label: "Pago Conductor",   valor: conductorMes, color: "#10B981" },
                { label: "Descuentos de ley", valor: descuentosMes, color: "#EF4444" },
                { label: "Otros y viáticos", valor: otrosMes, color: "#6B7280" },
              ].filter(item => item.valor > 0).map(item => {
                const pct = Math.round((item.valor / (gastosMes || 1)) * 100);
                return (
                  <div key={item.label} style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: TXT_APAGADO }}>{item.label}</span>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: TXT_APAGADO }}>
                        {fmt(item.valor)} <span style={{ color: TXT_APAGADO, fontWeight: "normal" }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: "8px", borderRadius: "4px", background: "#F3F4F6", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "4px", background: item.color, width: `${pct}%`, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                );
              })}

              {gastosMes === 0 && (
                <p style={{ textAlign: "center", color: "#9CA3AF", padding: "20px 0" }}>No hay gastos registrados en este período.</p>
              )}
            </div>

            {/* UTILIDAD REAL */}
            {(totalPE > 0 || totalGastosAdic > 0) && (
              <div style={styles.card}>
                <p style={styles.cardTitulo}>Balance de Utilidad Real</p>
                <div style={styles.filaDato}>
                  <span style={styles.filaLabel}>Ganancia Neta de Viajes:</span>
                  <span style={{ ...styles.filaVal, color: netaMes >= 0 ? "#10B981" : "#EF4444" }}>{fmt(netaMes)}</span>
                </div>
                {totalPE > 0 && (
                  <div style={styles.filaDato}>
                    <span style={styles.filaLabel}>Gastos Fijos Flota (PE):</span>
                    <span style={{ ...styles.filaVal, color: "#EF4444" }}>-{fmt(totalPE)}</span>
                  </div>
                )}
                {totalGastosAdic > 0 && (
                  <div style={styles.filaDato}>
                    <span style={styles.filaLabel}>Mantenimientos y Taller:</span>
                    <span style={{ ...styles.filaVal, color: "#EF4444" }}>-{fmt(totalGastosAdic)}</span>
                  </div>
                )}
                <div style={{ ...styles.filaDato, borderBottom: "none", paddingTop: "12px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "800", color: "#111827" }}>Utilidad Total:</span>
                  <span style={{ fontSize: "20px", fontWeight: "900", color: utilidadReal >= 0 ? "#10B981" : "#EF4444" }}>{fmt(utilidadReal)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════ PESTAÑA 3: VEHÍCULOS ═════════════════ */}
        {tabActivo === "flota" && (
          <div>
            <div style={styles.card}>
              <p style={styles.cardTitulo}>Rendimiento por Vehículo — {MESES[mes]}</p>
              {vehiculos.length === 0 ? (
                <p style={{ textAlign: "center", color: "#9CA3AF", padding: "20px 0" }}>Sin vehículos registrados en la flota.</p>
              ) : (
                gananciaPorVeh.map((v, i) => {
                  const pct = Math.abs(v.neta) / maxNeta;
                  const col = v.neta >= 0 ? "#10B981" : "#EF4444";
                  return (
                    <div key={v.placa} style={{ padding: "14px 0", borderBottom: i === gananciaPorVeh.length - 1 ? "none" : "1px solid #E5E7EB" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div>
                          <span style={{ fontSize: "16px", fontWeight: "800", color: TXT_APAGADO }}>{v.placa}</span>
                          <span style={{ fontSize: "12px", color: TXT_APAGADO, marginLeft: "8px" }}>{v.viajes} viaje{v.viajes !== 1 ? "s" : ""} · {v.km.toLocaleString("es-CO")} km</span>
                        </div>
                        <span style={{ fontSize: "16px", fontWeight: "800", color: col }}>
                          {v.neta >= 0 ? "+" : ""}{fmt(v.neta)}
                        </span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "3px", background: "#F3F4F6", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: "3px", background: col, width: `${pct * 100}%`, transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ═════════════════ PESTAÑA 4: RANGO DE FECHAS ═════════════════ */}
        {tabActivo === "fechas" && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>Consulta Personalizada por Fechas</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              <div>
                <label htmlFor="cuentas-rango-desde" style={styles.inputLabel}>Desde</label>
                <input 
                  id="cuentas-rango-desde"
                  type="date" 
                  value={rangoDesde} 
                  onChange={e => setRangoDesde(e.target.value)}
                  style={styles.inputFecha}
                />
              </div>
              <div>
                <label htmlFor="cuentas-rango-hasta" style={styles.inputLabel}>Hasta</label>
                <input 
                  id="cuentas-rango-hasta"
                  type="date" 
                  value={rangoHasta} 
                  onChange={e => setRangoHasta(e.target.value)}
                  style={styles.inputFecha}
                />
              </div>
            </div>

            {rangoDesde && rangoHasta && rangoDesde > rangoHasta && (
              <p style={{ color: "#EF4444", fontSize: "13px", fontWeight: "600", marginBottom: "10px" }}>
                {"⚠️ La fecha 'Desde' debe ser anterior a 'Hasta'."}
              </p>
            )}

            {(() => {
              const viajesRango = (rangoDesde && rangoHasta && rangoDesde <= rangoHasta)
                ? viajes.filter(v => v.fecha >= rangoDesde && v.fecha <= rangoHasta) : [];
              const rIngresos = viajesRango.reduce((s, v) => s + (v.vViaje || 0), 0);
              const rGastos   = viajesRango.reduce((s, v) => s + (v.total || 0), 0);
              const rNeta     = viajesRango.reduce((s, v) => s + (v.neta || 0), 0);
              const rKm       = viajesRango.reduce((s, v) => s + (v.kmT || 0), 0);

              if (!rangoDesde || !rangoHasta) {
                return <p style={{ textAlign: "center", color: "#9CA3AF", padding: "20px 0" }}>Selecciona un rango de fechas para consultar.</p>;
              }

              if (viajesRango.length === 0) {
                return <p style={{ textAlign: "center", color: "#9CA3AF", padding: "20px 0" }}>No se encontraron viajes en este período.</p>;
              }

              return (
                <div>
                  <div style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: rNeta >= 0 ? "#ECFDF5" : "#FEF2F2",
                    border: `1.5px solid ${rNeta >= 0 ? "#A7F3D0" : "#FECACA"}`,
                    marginBottom: "14px"
                  }}>
                    <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 4px" }}>
                      {viajesRango.length} viajes · {rKm.toLocaleString("es-CO")} km
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: "900", color: rNeta >= 0 ? "#059669" : "#DC2626", margin: 0 }}>
                      {fmt(rNeta)}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0" }}>
                      Ingresos: {fmt(rIngresos)} | Gastos: {fmt(rGastos)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  pantalla: { 
    maxWidth: "480px", 
    margin: "0 auto", 
    minHeight: "100vh", 
    background: t.colors.bgPrimary, 
    paddingBottom: "40px" 
  },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "20px 18px 16px", 
    background: t.colors.bgCard, 
    borderBottom: `1px solid ${t.colors.borderLight}` 
  },
  headerSub: { 
    fontSize: "12px", 
    color: t.colors.textSecondary, 
    margin: "0 0 2px", 
    fontWeight: "700", 
    textTransform: "uppercase", 
    letterSpacing: "0.06em" 
  },
  titulo: { 
    fontSize: "24px", 
    fontWeight: "900", 
    color: t.colors.textPrimary, 
    margin: 0, 
    letterSpacing: "-0.5px" 
  },
  btnAccion: { 
    display: "flex", 
    alignItems: "center", 
    gap: "6px", 
    padding: "8px 12px", 
    background: t.colors.blueSoft, 
    border: `1.5px solid ${t.colors.blueBorder}`, 
    borderRadius: t.radius.sm, 
    fontSize: "13px", 
    fontWeight: "700", 
    color: t.colors.blueText, 
    cursor: "pointer" 
  },
  navMes: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    background: t.colors.bgCard, 
    borderBottom: `1px solid ${t.colors.borderLight}`, 
    padding: "10px 20px" 
  },
  btnMes: { 
    background: "none", 
    border: "none", 
    fontSize: "24px", 
    color: t.colors.blueText, 
    cursor: "pointer", 
    padding: "4px 12px", 
    fontWeight: "bold" 
  },
  labelMes: { 
    fontSize: "16px", 
    fontWeight: "800", 
    color: t.colors.textPrimary, 
    margin: 0 
  },
  tabsContenedor: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "6px",
    padding: "12px 16px 4px",
  },
  tabBoton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px 4px",
    border: "1.5px solid",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  contenido: { 
    padding: "12px 16px" 
  },
  gananciaHero: { 
    borderRadius: t.radius.lg, 
    padding: "22px 20px", 
    marginBottom: "14px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    boxShadow: t.shadows.card 
  },
  gananciaHeroLabel: { 
    fontSize: "13px", 
    color: "rgba(255,255,255,0.9)", 
    margin: "0 0 6px", 
    fontWeight: "700", 
    textTransform: "uppercase", 
    letterSpacing: "0.06em" 
  },
  gananciaHeroVal: { 
    fontSize: "36px", 
    fontWeight: "900", 
    color: "#FFFFFF", 
    margin: "0 0 4px", 
    letterSpacing: "-0.8px", 
    fontVariantNumeric: "tabular-nums" 
  },
  gananciaHeroSub: { 
    fontSize: "13px", 
    color: "rgba(255,255,255,0.85)", 
    margin: 0 
  },
  gananciaHeroBadge: { 
    background: "rgba(255,255,255,0.2)", 
    borderRadius: "14px", 
    padding: "12px", 
    backdropFilter: "blur(8px)" 
  },
  dosColumnas: { 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr", 
    gap: "10px", 
    marginBottom: "14px" 
  },
  metricaCard: { 
    background: t.colors.bgCard, 
    borderRadius: t.radius.md, 
    padding: "16px", 
    border: `1px solid ${t.colors.borderLight}`, 
    boxShadow: t.shadows.card 
  },
  metricaLabel: { 
    fontSize: "12px", 
    color: t.colors.textSecondary, 
    margin: "0 0 6px", 
    textTransform: "uppercase", 
    fontWeight: "700", 
    letterSpacing: "0.04em" 
  },
  metricaVal: { 
    fontSize: "20px", 
    fontWeight: "900", 
    margin: 0, 
    fontVariantNumeric: "tabular-nums" 
  },
  card: { 
    background: t.colors.bgCard, 
    borderRadius: t.radius.lg, 
    padding: "18px", 
    marginBottom: "14px", 
    border: `1px solid ${t.colors.borderLight}`, 
    boxShadow: t.shadows.card 
  },
  cardTitulo: { 
    fontSize: "13px", 
    fontWeight: "800", 
    color: t.colors.textSecondary, 
    textTransform: "uppercase", 
    letterSpacing: "0.06em", 
    margin: "0 0 16px" 
  },
  filaDato: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: `1px solid ${t.colors.borderLight}`,
  },
  filaLabel: {
    fontSize: "14px",
    color: t.colors.textSecondary,
    fontWeight: "600",
  },
  filaVal: {
    fontSize: "15px",
    fontWeight: "800",
    fontVariantNumeric: "tabular-nums",
  },
  grafica: { 
    display: "flex", 
    alignItems: "flex-end", 
    gap: "8px", 
    height: "140px", 
    paddingTop: "20px" 
  },
  graficaCol: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    height: "100%" 
  },
  graficaVal: {
    fontSize: "10px",
    fontWeight: "700",
    color: t.colors.textSecondary,
    marginBottom: "4px",
  },
  graficaBarraWrap: { 
    flex: 1, 
    width: "100%", 
    display: "flex", 
    alignItems: "flex-end", 
    justifyContent: "center" 
  },
  graficaBarra: { 
    width: "100%", 
    maxWidth: "34px", 
    borderRadius: "6px 6px 0 0", 
    transition: "height 0.4s ease", 
    minHeight: "4px" 
  },
  graficaMes: { 
    fontSize: "12px", 
    marginTop: "6px", 
    textAlign: "center" 
  },
  inputLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: t.colors.textSecondary,
    display: "block",
    marginBottom: "4px",
  },
  inputFecha: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    borderRadius: t.radius.sm,
    border: `1.5px solid ${t.colors.border}`,
    background: t.colors.bgSection,
    color: t.colors.textPrimary,
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default Cuentas;