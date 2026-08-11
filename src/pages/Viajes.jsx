import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ChevronDown, ChevronUp, ChevronRight, MapPin, Plus, Truck } from "lucide-react";
import { theme as t } from "../styles/theme";
import { SkeletonCard } from "../components/Skeleton";

// VIAJES — Memoria de costos por ruta
// Catálogo de consulta rápida: agrupa los viajes por ruta y muestra la
// estructura de costos del más reciente, para cotizar y negociar fletes.
// El historial contable con fechas vive en Vehículos → Viajes.

function Viajes({ viajes = [], cargando }) {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [rutasAbiertas, setRutasAbiertas] = useState({});

  const fmt = (v) => "$" + Math.round(v).toLocaleString("es-CO");
  const fFecha = (iso) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const toggleRuta = (r) => setRutasAbiertas(prev => ({ ...prev, [r]: !prev[r] }));

  // Agrupar viajes por ruta
  const q = busqueda.toLowerCase();
  const grupos = Object.entries(
    viajes
      .filter(v => !q
        || (v.ruta || "").toLowerCase().includes(q)
        || (v.emp || "").toLowerCase().includes(q)
        || (v.prod || "").toLowerCase().includes(q))
      .reduce((acc, v) => {
        const r = v.ruta || "Sin ruta";
        if (!acc[r]) acc[r] = [];
        acc[r].push(v);
        return acc;
      }, {})
  )
    // Ordenar rutas por fecha del viaje más reciente
    .map(([ruta, vjs]) => {
      const ordenados = [...vjs].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
      return { ruta, viajes: ordenados, ultimo: ordenados[0] };
    })
    .sort((a, b) => (b.ultimo.fecha || "").localeCompare(a.ultimo.fecha || ""));

  if (cargando) {
    return (
      <div style={styles.pantalla}>
        <div style={styles.header}>
          <button style={styles.btnVolver} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} color={t.colors.blueText} strokeWidth={2.5} />
            <span>Volver</span>
          </button>
          <div>
            <h1 style={styles.titulo}>Viajes</h1>
            <p style={styles.headerSub}>Costos por ruta</p>
          </div>
        </div>
        <div style={{ padding: "16px" }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blueText} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={styles.titulo}>Viajes</h1>
          <p style={styles.headerSub}>Memoria de costos por ruta</p>
        </div>
        <button style={styles.btnNuevo} onClick={() => navigate("/calculadora")}>
          <Plus size={16} color="#fff" strokeWidth={2.5} />
        </button>
      </div>

      <div style={styles.contenido}>

        {/* BUSCADOR */}
        {viajes.length > 0 && (
          <div style={styles.buscadorBox}>
            <Search size={16} color={t.colors.textTertiary} />
            <input
              type="text"
              placeholder="Buscar ruta, empresa o producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={styles.buscadorInput}
            />
          </div>
        )}

        {/* VACÍO */}
        {viajes.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <Truck size={40} color={t.colors.textTertiary} strokeWidth={1.5} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: "0 0 4px" }}>Aún no hay viajes</p>
            <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "0 0 16px" }}>Cuando calcule viajes, aquí quedará la memoria de costos de cada ruta</p>
            <button style={styles.btnCalcular} onClick={() => navigate("/calculadora")}>
              Calcular mi primer viaje
            </button>
          </div>
        )}

        {/* RUTAS */}
        {grupos.map(g => {
          const abierta = rutasAbiertas[g.ruta] || false;
          const u = g.ultimo; // viaje más reciente de la ruta = referencia de costos
          const otrosGastos = (u.carp || 0) + (u.gv2 || 0) + (u.extras || 0);
          const kmRuta = u.kmT || 0;
          return (
            <div key={g.ruta} style={styles.card}>

              {/* Cabecera de ruta */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleRuta(g.ruta)}>
                <div style={{ display: "flex", gap: "11px", alignItems: "center", flex: 1, minWidth: 0 }}>
                  <div style={styles.routeIc}>
                    <MapPin size={16} color={t.colors.blueText} strokeWidth={2} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.ruta}</p>
                    <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "2px 0 0" }}>
                      {g.viajes.length} viaje{g.viajes.length !== 1 ? "s" : ""} · último {fFecha(u.fecha)}{kmRuta > 0 ? ` · ${kmRuta.toLocaleString("es-CO")} km` : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBlack, color: (u.neta || 0) >= 0 ? t.colors.green : t.colors.red, ...t.numeric }}>{fmt(u.neta || 0)}</span>
                  {abierta ? <ChevronUp size={16} color={t.colors.textTertiary} /> : <ChevronDown size={16} color={t.colors.textTertiary} />}
                </div>
              </div>

              {/* Estructura de costos del último viaje */}
              {abierta && (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${t.colors.borderLight}` }}>

                  <p style={styles.refTitulo}>Referencia de costos (último viaje)</p>

                  <div style={styles.refFila}>
                    <span style={styles.refL}>Flete cobrado</span>
                    <span style={{ ...styles.refV, color: t.colors.blueText }}>
                      {fmt(u.vViaje || 0)}{u.ton > 0 && u.fleteTon > 0 ? ` (${u.ton} ton × ${fmt(u.fleteTon)})` : ""}
                    </span>
                  </div>

                  {(u.cComb || 0) > 0 && (
                    <div style={styles.refFila}>
                      <span style={styles.refL}>Combustible{u.gTot > 0 ? ` (${Math.round(u.gTot)} gal)` : ""}</span>
                      <span style={styles.refV}>{fmt(u.cComb)}</span>
                    </div>
                  )}

                  {(u.peajes || 0) > 0 && (
                    <div style={styles.refFila}>
                      <span style={styles.refL}>Peajes{(u.peajesDetalle || []).length > 0 ? ` (${u.peajesDetalle.length})` : ""}</span>
                      <span style={styles.refV}>{fmt(u.peajes)}</span>
                    </div>
                  )}

                  {/* Detalle de peajes — lo que se consulta al negociar */}
                  {(u.peajesDetalle || []).length > 0 && (
                    <div style={{ margin: "2px 0 6px", padding: "8px 10px", background: t.colors.bgSection, borderRadius: t.radius.sm }}>
                      {u.peajesDetalle.map((p, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: t.fonts.sizeXs, padding: "2px 0" }}>
                          <span style={{ color: t.colors.textTertiary }}>{p.n}{p.iv ? " (ida y vuelta)" : ""}</span>
                          <span style={{ color: t.colors.textSecondary, fontWeight: t.fonts.weightSemibold, ...t.numeric }}>{fmt(p.total || p.tarifa || 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(u.conductor || 0) > 0 && (
                    <div style={styles.refFila}>
                      <span style={styles.refL}>Conductor{u.pcond > 0 && u.pcond <= 100 ? ` (${u.pcond}%)` : ""}</span>
                      <span style={styles.refV}>{fmt(u.conductor)}</span>
                    </div>
                  )}

                  {otrosGastos > 0 && (
                    <div style={styles.refFila}>
                      <span style={styles.refL}>Carpado + gastos + otros</span>
                      <span style={styles.refV}>{fmt(otrosGastos)}</span>
                    </div>
                  )}

                  {(u.descuentos?.total || 0) > 0 && (
                    <div style={styles.refFila}>
                      <span style={styles.refL}>Descuentos de ley</span>
                      <span style={styles.refV}>{fmt(u.descuentos.total)}</span>
                    </div>
                  )}

                  <div style={{ ...styles.refFila, borderBottom: "none", paddingTop: "8px" }}>
                    <span style={{ ...styles.refL, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary }}>Costo total del viaje</span>
                    <span style={{ ...styles.refV, color: t.colors.red, fontWeight: t.fonts.weightBold }}>{fmt(u.total || 0)}</span>
                  </div>
                  {kmRuta > 0 && (u.total || 0) > 0 && (
                    <div style={{ ...styles.refFila, borderBottom: "none", paddingTop: 0 }}>
                      <span style={styles.refL}>Costo por km</span>
                      <span style={styles.refV}>{fmt((u.total || 0) / kmRuta)}/km</span>
                    </div>
                  )}

                  {/* Historial de la ruta */}
                  <p style={{ ...styles.refTitulo, marginTop: "12px" }}>Veces realizada</p>
                  {g.viajes.slice(0, 5).map(v => (
                    <div
                      key={v.firestoreId}
                      style={{ display: "flex", justifyContent: "space-between", padding: "7px 4px", borderBottom: `1px solid ${t.colors.borderLight}`, cursor: "pointer", fontSize: t.fonts.sizeXs }}
                      onClick={() => navigate(`/viaje/${v.firestoreId}`)}
                    >
                      <span style={{ color: t.colors.textSecondary }}>{fFecha(v.fecha)} · {v.placa || "—"}{v.emp ? ` · ${v.emp}` : ""}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontWeight: t.fonts.weightBold, color: (v.neta || 0) >= 0 ? t.colors.green : t.colors.red, ...t.numeric }}>{fmt(v.neta || 0)}</span>
                        <ChevronRight size={14} color={t.colors.textTertiary} />
                      </span>
                    </div>
                  ))}
                  {g.viajes.length > 5 && (
                    <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, textAlign: "center", margin: "6px 0 0" }}>
                      +{g.viajes.length - 5} más en Vehículos → Viajes
                    </p>
                  )}

                </div>
              )}
            </div>
          );
        })}

        {grupos.length === 0 && viajes.length > 0 && (
          <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, textAlign: "center", margin: "20px 0" }}>Sin resultados para "{busqueda}"</p>
        )}

      </div>
    </div>
  );
}

const styles = {
  pantalla:      { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:        { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:     { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blueText, cursor: "pointer", padding: 0, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold },
  titulo:        { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  headerSub:     { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "2px 0 0" },
  btnNuevo:      { width: "36px", height: "36px", borderRadius: "10px", background: t.colors.green, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  contenido:     { padding: "14px 16px" },
  buscadorBox:   { display: "flex", alignItems: "center", gap: "8px", background: t.colors.bgCard, borderRadius: t.radius.md, padding: "10px 14px", marginBottom: "12px", border: `1px solid ${t.colors.borderLight}`, boxShadow: t.shadows.card },
  buscadorInput: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: t.fonts.sizeSm, color: t.colors.textPrimary },
  btnCalcular:   { padding: "12px 24px", background: t.colors.green, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, cursor: "pointer" },
  card:          { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "14px 16px", marginBottom: "10px", border: `1px solid ${t.colors.borderLight}`, boxShadow: t.shadows.card },
  routeIc:       { width: "34px", height: "34px", borderRadius: t.radius.sm, background: t.colors.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  refTitulo:     { fontSize: "10px", fontWeight: t.fonts.weightBold, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" },
  refFila:       { display: "flex", justifyContent: "space-between", fontSize: t.fonts.sizeSm, padding: "5px 0", borderBottom: `1px solid ${t.colors.borderLight}` },
  refL:          { color: t.colors.textSecondary, fontSize: t.fonts.sizeXs },
  refV:          { fontWeight: t.fonts.weightSemibold, color: t.colors.textPrimary, fontSize: t.fonts.sizeXs, fontVariantNumeric: "tabular-nums" },
};

export default Viajes;