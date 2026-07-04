import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, TrendingUp, Fuel, Route, DollarSign } from "lucide-react";
import { theme as t } from "../styles/theme";

function Comparativo({ vehiculos = [], viajes = [], gastosFijos = [], gastosVehiculo = [] }) {
  const navigate = useNavigate();
  const [metrica, setMetrica] = useState("utilidad");
  const [periodo, setPeriodo] = useState("mes");

  const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");
  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  const filtrarViajes = (placa) => {
    return viajes.filter(v => {
      if (v.placa !== placa) return false;
      if (periodo === "mes") {
        const f = new Date(v.fecha);
        return f.getMonth() === mes && f.getFullYear() === anio;
      }
      if (periodo === "trimestre") {
        const f = new Date(v.fecha);
        const trimActual = Math.floor(mes / 3);
        const trimViaje = Math.floor(f.getMonth() / 3);
        return trimViaje === trimActual && f.getFullYear() === anio;
      }
      return true; // todo
    });
  };

  const diasPeriodo = (() => {
    if (periodo === "mes") return hoy.getDate();
    if (periodo === "trimestre") {
      const inicioTrim = new Date(anio, Math.floor(mes/3)*3, 1);
      return Math.max(1, Math.ceil((hoy - inicioTrim) / 86400000));
    }
    // todo: desde el primer viaje registrado
    const fechas = viajes.map(v => new Date(v.fecha)).filter(f => !isNaN(f));
    if (fechas.length === 0) return 1;
    const primera = new Date(Math.min(...fechas));
    return Math.max(1, Math.ceil((hoy - primera) / 86400000));
  })();

  const datos = vehiculos.map(v => {
    const vjs = filtrarViajes(v.placa);
    const ingresos = vjs.reduce((s, vj) => s + (vj.vViaje || 0), 0);
    const gastos = vjs.reduce((s, vj) => s + (vj.total || 0), 0);
    const utilidad = vjs.reduce((s, vj) => s + (vj.neta || 0), 0);
    const km = vjs.reduce((s, vj) => s + (vj.kmT || 0), 0);
    const galones = vjs.reduce((s, vj) => s + (vj.gTot || 0), 0);
    const costoAcpm = vjs.reduce((s, vj) => s + (vj.cAcpm || 0), 0);
    const rendimiento = galones > 0 ? km / galones : 0;
    const costoKm = km > 0 ? gastos / km : 0;
    const utilKm = km > 0 ? utilidad / km : 0;
    const diasProductivos = new Set(vjs.map(vj => vj.fecha)).size;
    const utilizacion = diasPeriodo > 0 ? (diasProductivos / diasPeriodo) * 100 : 0;
    const numViajes = vjs.length;

    return {
      placa: v.placa,
      tipo: v.tipoVehiculo || "",
      remolque: v.tipoRemolque || "",
      estado: v.estado || "disponible",
      ingresos,
      gastos,
      utilidad,
      km,
      galones,
      costoAcpm,
      rendimiento,
      costoKm,
      utilKm,
      diasProductivos,
      utilizacion,
      numViajes,
    };
  });

  const METRICAS = [
    { id: "utilidad",    label: "Rentabilidad",  Icono: DollarSign, color: t.colors.green,  unidad: "", format: (v) => fmt(v), campo: "utilidad",    orden: "desc" },
    { id: "utilKm",      label: "Utilidad/km",   Icono: TrendingUp, color: "#8B5CF6",       unidad: "/km", format: (v) => "$" + Math.round(v).toLocaleString("es-CO"), campo: "utilKm", orden: "desc" },
    { id: "viajes",      label: "Productividad", Icono: Route,      color: t.colors.blue,   unidad: " viajes", format: (v) => v, campo: "numViajes",  orden: "desc" },
    { id: "utilizacion", label: "Utilización",   Icono: Truck,      color: "#06B6D4",       unidad: "%", format: (v) => v.toFixed(0), campo: "utilizacion", orden: "desc" },
    { id: "rendimiento", label: "Rendimiento",   Icono: Fuel,       color: t.colors.amber,  unidad: " km/gl", format: (v) => v.toFixed(1), campo: "rendimiento", orden: "desc" },
    { id: "costoKm",     label: "Costo/km",      Icono: TrendingUp, color: t.colors.red,    unidad: "/km", format: (v) => "$" + Math.round(v).toLocaleString("es-CO"), campo: "costoKm", orden: "asc" },
  ];

  // ── INSIGHTS AUTOMÁTICOS — convierte la comparación en pesos ──
  const insights = (() => {
    const activos = datos.filter(d => d.numViajes > 0 && d.km > 0);
    if (activos.length < 2) return [];
    const lista = [];

    // 1. Ahorro potencial de combustible: si el peor rindiera como el mejor
    const conRend = activos.filter(d => d.rendimiento > 0 && d.galones > 0);
    if (conRend.length >= 2) {
      const mejorR = conRend.reduce((a,b) => a.rendimiento > b.rendimiento ? a : b);
      const peorR  = conRend.reduce((a,b) => a.rendimiento < b.rendimiento ? a : b);
      if (mejorR.placa !== peorR.placa && peorR.rendimiento < mejorR.rendimiento * 0.9) {
        const precioProm = peorR.costoAcpm / peorR.galones;
        const galonesIdeales = peorR.km / mejorR.rendimiento;
        const ahorro = (peorR.galones - galonesIdeales) * precioProm;
        if (ahorro > 50000) {
          lista.push({
            icono: "⛽",
            texto: `Si ${peorR.placa} rindiera como ${mejorR.placa} (${mejorR.rendimiento.toFixed(1)} km/gal), ahorraría ~${fmt(ahorro)} en combustible este período. Revise presión de llantas, estilo de conducción o posible fuga.`,
          });
        }
      }
    }

    // 2. Utilidad/km vs promedio de flota
    const promUtilKm = activos.reduce((s,d) => s + d.utilKm, 0) / activos.length;
    const rezagado = activos.reduce((a,b) => a.utilKm < b.utilKm ? a : b);
    if (promUtilKm > 0 && rezagado.utilKm < promUtilKm * 0.75) {
      const pctMenos = ((1 - rezagado.utilKm / promUtilKm) * 100).toFixed(0);
      lista.push({
        icono: "📉",
        texto: `${rezagado.placa} genera ${pctMenos}% menos utilidad por km que el promedio de su flota (${"$" + Math.round(rezagado.utilKm).toLocaleString("es-CO")}/km vs ${"$" + Math.round(promUtilKm).toLocaleString("es-CO")}/km). Revise sus fletes o sus rutas.`,
      });
    }

    // 3. Camión subutilizado
    const quieto = datos.filter(d => d.numViajes >= 0).reduce((a,b) => a.utilizacion < b.utilizacion ? a : b);
    if (quieto.utilizacion < 30 && diasPeriodo >= 7) {
      lista.push({
        icono: "🅿️",
        texto: `${quieto.placa} solo tuvo ${quieto.diasProductivos} día${quieto.diasProductivos!==1?"s":""} productivo${quieto.diasProductivos!==1?"s":""} de ${diasPeriodo} (${quieto.utilizacion.toFixed(0)}%). Un camión quieto sigue pagando cuota, seguro y parqueadero.`,
      });
    }

    // 4. El campeón de la flota
    const campeon = activos.reduce((a,b) => a.utilKm > b.utilKm ? a : b);
    if (campeon.utilKm > 0) {
      lista.push({
        icono: "🏆",
        texto: `${campeon.placa} es su campeón: ${"$" + Math.round(campeon.utilKm).toLocaleString("es-CO")} de utilidad por km rodado. Sus rutas y fletes son el modelo a replicar.`,
      });
    }

    return lista.slice(0, 3);
  })();

  const metActual = METRICAS.find(m => m.id === metrica);

  const ordenados = [...datos].sort((a, b) => {
    const va = a[metActual.campo] || 0;
    const vb = b[metActual.campo] || 0;
    return metActual.orden === "desc" ? vb - va : va - vb;
  });

  const mejorValor = ordenados.length > 0 ? Math.abs(ordenados[0][metActual.campo]) : 1;

  const PERIODOS = [
    { id: "mes", label: "Este mes" },
    { id: "trimestre", label: "Trimestre" },
    { id: "todo", label: "Todo" },
  ];

  const ESTADOS_COLOR = {
    disponible: t.colors.green,
    en_viaje: t.colors.blue,
    en_taller: t.colors.amber,
    esperando_carga: t.colors.textTertiary,
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Comparativo</h1>
      </div>

      <div style={styles.contenido}>

        {/* PERÍODO */}
        <div style={styles.chips}>
          {PERIODOS.map(p => (
            <button key={p.id}
              style={{ ...styles.chip, ...(periodo === p.id ? styles.chipActivo : {}) }}
              onClick={() => setPeriodo(p.id)}
            >{p.label}</button>
          ))}
        </div>

        {/* MÉTRICAS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
          {METRICAS.map(m => (
            <button key={m.id}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 12px", borderRadius: t.radius.md, cursor: "pointer",
                background: metrica === m.id ? m.color + "22" : t.colors.bgCard,
                border: `1.5px solid ${metrica === m.id ? m.color : t.colors.border}`,
              }}
              onClick={() => setMetrica(m.id)}
            >
              <m.Icono size={16} color={metrica === m.id ? m.color : t.colors.textTertiary} strokeWidth={2} />
              <span style={{
                fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold,
                color: metrica === m.id ? m.color : t.colors.textSecondary,
              }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* ANÁLISIS DE FLOTA — insights automáticos */}
        {insights.length > 0 && (
          <div style={{background:t.colors.bgCard,borderRadius:t.radius.lg,padding:"14px 16px",marginBottom:"14px",boxShadow:t.shadows.card,border:`1.5px solid ${t.colors.blueBorder}`}}>
            <p style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:t.colors.blue,textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 10px"}}>
              💡 Análisis de su flota
            </p>
            {insights.map((ins, i) => (
              <div key={i} style={{display:"flex",gap:"10px",padding:"8px 0",borderBottom:i===insights.length-1?"none":`1px solid ${t.colors.borderLight}`}}>
                <span style={{fontSize:"16px",flexShrink:0}}>{ins.icono}</span>
                <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:0,lineHeight:1.55}}>{ins.texto}</p>
              </div>
            ))}
          </div>
        )}

        {/* RANKING */}
        {ordenados.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: t.fonts.sizeSm, color: t.colors.textTertiary }}>No hay vehículos registrados</p>
          </div>
        )}

        {ordenados.map((v, i) => {
          const valor = v[metActual.campo] || 0;
          const pct = mejorValor > 0 ? (Math.abs(valor) / mejorValor) * 100 : 0;
          const estadoColor = ESTADOS_COLOR[v.estado] || t.colors.textTertiary;

          return (
            <div key={v.placa} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Posición */}
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: i === 0 ? metActual.color + "22" : t.colors.bgSection,
                    border: `1.5px solid ${i === 0 ? metActual.color : t.colors.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{
                      fontSize: "12px", fontWeight: t.fonts.weightBlack,
                      color: i === 0 ? metActual.color : t.colors.textTertiary,
                    }}>{i + 1}</span>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <p style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 }}>{v.placa}</p>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: estadoColor }} />
                    </div>
                    <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "2px 0 0" }}>
                      {v.tipo}{v.remolque ? ` · ${v.remolque}` : ""}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBlack,
                  color: i === 0 ? metActual.color : t.colors.textPrimary,
                }}>
                  {metActual.format(valor)}{metActual.unidad}
                </span>
              </div>

              {/* Barra de progreso */}
              <div style={{ height: "6px", borderRadius: "3px", background: t.colors.bgSection, overflow: "hidden", marginBottom: "8px" }}>
                <div style={{
                  height: "100%", borderRadius: "3px",
                  background: metActual.color,
                  width: `${Math.min(pct, 100)}%`,
                  opacity: i === 0 ? 1 : 0.6,
                  transition: "width 0.4s ease",
                }} />
              </div>

              {/* Métricas secundarias */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {metrica !== "utilidad" && (
                  <span style={styles.subMetrica}>Utilidad: {fmt(v.utilidad)}</span>
                )}
                {metrica !== "viajes" && (
                  <span style={styles.subMetrica}>{v.numViajes} viaje{v.numViajes !== 1 ? "s" : ""}</span>
                )}
                {metrica !== "rendimiento" && v.rendimiento > 0 && (
                  <span style={styles.subMetrica}>{v.rendimiento.toFixed(1)} km/gl</span>
                )}
                {metrica !== "costoKm" && v.costoKm > 0 && (
                  <span style={styles.subMetrica}>${Math.round(v.costoKm)}/km</span>
                )}
                <span style={styles.subMetrica}>{v.km.toLocaleString("es-CO")} km</span>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}

const styles = {
  pantalla:   { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:     { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:  { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blue, cursor: "pointer", padding: 0, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold },
  titulo:     { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  contenido:  { padding: "12px 16px 16px" },
  chips:      { display: "flex", gap: "6px", marginBottom: "12px" },
  chip:       { padding: "7px 14px", borderRadius: t.radius.full, border: `1.5px solid ${t.colors.border}`, background: "none", color: t.colors.textSecondary, fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightSemibold, cursor: "pointer" },
  chipActivo: { background: "#1E3A5F", borderColor: t.colors.blue, color: t.colors.blue },
  card:       { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "14px 16px", marginBottom: "8px", boxShadow: t.shadows.card },
  subMetrica: { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary },
};

export default Comparativo;