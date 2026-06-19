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

  const datos = vehiculos.map(v => {
    const vjs = filtrarViajes(v.placa);
    const ingresos = vjs.reduce((s, vj) => s + (vj.vViaje || 0), 0);
    const gastos = vjs.reduce((s, vj) => s + (vj.total || 0), 0);
    const utilidad = vjs.reduce((s, vj) => s + (vj.neta || 0), 0);
    const km = vjs.reduce((s, vj) => s + (vj.kmT || 0), 0);
    const galones = vjs.reduce((s, vj) => s + (vj.gTot || 0), 0);
    const rendimiento = galones > 0 ? km / galones : 0;
    const costoKm = km > 0 ? gastos / km : 0;
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
      rendimiento,
      costoKm,
      numViajes,
    };
  });

  const METRICAS = [
    { id: "utilidad",    label: "Rentabilidad",  Icono: DollarSign, color: t.colors.green,  unidad: "", format: (v) => fmt(v), campo: "utilidad",    orden: "desc" },
    { id: "viajes",      label: "Productividad", Icono: Route,      color: t.colors.blue,   unidad: " viajes", format: (v) => v, campo: "numViajes",  orden: "desc" },
    { id: "rendimiento", label: "Rendimiento",   Icono: Fuel,       color: t.colors.amber,  unidad: " km/gl", format: (v) => v.toFixed(1), campo: "rendimiento", orden: "desc" },
    { id: "costoKm",     label: "Costo/km",      Icono: TrendingUp, color: t.colors.red,    unidad: "/km", format: (v) => "$" + Math.round(v).toLocaleString("es-CO"), campo: "costoKm", orden: "asc" },
  ];

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