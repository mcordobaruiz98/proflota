import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Search, ChevronUp, ChevronDown, FileText, Calendar } from "lucide-react";
import { theme as t } from "../styles/theme";

function Cartera({ viajes = [], vehiculos = [], onEditar, mostrarToast }) {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("pendientes");
  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState("todo");
  const [verRango, setVerRango] = useState(false);
  const [rangoDesde, setRangoDesde] = useState("");
  const [rangoHasta, setRangoHasta] = useState("");
  const [empAbiertas, setEmpAbiertas] = useState({});

  const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");
  const hoy = new Date();

  const obtenerSaldoPendiente = (v) => (v.vViaje || 0) - (v.anticipoFleteMonto || 0) - (v.anticipoFleteMontoRet || 0);

  const calcVencimiento = (viaje) => {
    const plazo = viaje.diasPago || 30;
    const fecha = new Date(viaje.fecha);
    const vence = new Date(fecha);
    vence.setDate(vence.getDate() + plazo);
    const dias = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
    return { vence, dias, vencido: dias <= 0 };
  };

  // Filtrar viajes
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  const toggleEmp = (emp) => setEmpAbiertas(prev => ({...prev, [emp]: !prev[emp]}));

  const viajesFiltrados = viajes.filter(v => {
    // Filtro de búsqueda
    const q = busqueda.toLowerCase();
    const coincide = !q || (v.emp || "").toLowerCase().includes(q) || (v.ruta || "").toLowerCase().includes(q) || (v.placa || "").toLowerCase().includes(q) || (v.mani || "").toLowerCase().includes(q);
    if (!coincide) return false;

    // Filtro de período
    if (periodo !== "todo") {
      const f = new Date(v.fecha);
      if (periodo === "mes" && (f.getMonth() !== mes || f.getFullYear() !== anio)) return false;
      if (periodo === "trimestre") {
        const trimActual = Math.floor(mes / 3);
        const trimViaje = Math.floor(f.getMonth() / 3);
        if (trimViaje !== trimActual || f.getFullYear() !== anio) return false;
      }
      if (periodo === "rango" && rangoDesde && rangoHasta) {
        if (v.fecha < rangoDesde || v.fecha > rangoHasta) return false;
      }
    }

    // Filtro de estado
    if (filtro === "pendientes") return v.estadoPago !== "pagado";
    if (filtro === "vencidos") {
      if (v.estadoPago === "pagado") return false;
      return calcVencimiento(v).vencido;
    }
    if (filtro === "pagados") return v.estadoPago === "pagado";
    return true;
  });

  // Agrupar por empresa
  const porEmpresa = {};
  viajesFiltrados.forEach(v => {
    const emp = v.emp || "Sin empresa";
    if (!porEmpresa[emp]) porEmpresa[emp] = { viajes: [], total: 0 };
    porEmpresa[emp].viajes.push(v);
    porEmpresa[emp].total += obtenerSaldoPendiente(v);
  });
  const empresasOrdenadas = Object.entries(porEmpresa).sort((a, b) => b[1].total - a[1].total);

  // Totales
  const pendientes = viajes.filter(v => v.estadoPago !== "pagado");
  const totalPendiente = pendientes.reduce((s, v) => s + obtenerSaldoPendiente(v), 0);
  const vencidos = pendientes.filter(v => calcVencimiento(v).vencido);
  const totalVencido = vencidos.reduce((s, v) => s + obtenerSaldoPendiente(v), 0);

  const marcarPagado = async (viaje) => {
    try {
      await onEditar(viaje.firestoreId, {
        estadoPago: "pagado",
        fechaPago: new Date().toISOString().slice(0, 10),
      });
      mostrarToast("Viaje marcado como pagado", "exito");
    } catch (err) {
      mostrarToast("Error al actualizar", "error");
    }
  };

  const marcarPendiente = async (viaje) => {
    try {
      await onEditar(viaje.firestoreId, {
        estadoPago: "pendiente",
        fechaPago: null,
      });
      mostrarToast("Viaje marcado como pendiente", "info");
    } catch (err) {
      mostrarToast("Error al actualizar", "error");
    }
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blueText} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Cartera</h1>
      </div>

      <div style={styles.contenido}>

        {/* RESUMEN */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <div style={{ ...styles.card, border: `1.5px solid ${t.colors.amberBorder || t.colors.amber}` }}>
            <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pendiente</p>
            <p style={{ fontSize: "20px", fontWeight: t.fonts.weightBlack, color: t.colors.amber, margin: 0, ...t.numeric }}>{fmt(totalPendiente)}</p>
            <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "4px 0 0" }}>{pendientes.length} viaje{pendientes.length !== 1 ? "s" : ""}</p>
          </div>
          <div style={{ ...styles.card, border: `1.5px solid ${t.colors.redBorder}` }}>
            <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vencido</p>
            <p style={{ fontSize: "20px", fontWeight: t.fonts.weightBlack, color: t.colors.red, margin: 0, ...t.numeric }}>{fmt(totalVencido)}</p>
            <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "4px 0 0" }}>{vencidos.length} viaje{vencidos.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

            {/* CUENTA DE COBRO */}
        <button
          style={{width:"100%", padding:"11px", background:t.colors.blueSoft, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.blueText, cursor:"pointer", marginBottom:"10px", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"}}
          onClick={() => navigate("/cobros")}
        >
          <FileText size={15} strokeWidth={2} />
          Generar cuenta de cobro
        </button>

        {/* BÚSQUEDA */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <Search size={16} color={t.colors.textTertiary} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Buscar por empresa, ruta o placa..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ ...styles.input, paddingLeft: "36px" }}
          />
        </div>

        {/* PERÍODO */}
        <div style={styles.chips}>
          {[
            { id: "todo", label: "Todo" },
            { id: "mes", label: "Este mes" },
            { id: "trimestre", label: "Trimestre" },
            { id: "rango", label: "Fechas", icono: true },
          ].map(p => {
            const activo = periodo === p.id || (p.id === "rango" && verRango);
            return (
              <button key={p.id}
                style={{ ...styles.chip, ...(activo ? styles.chipActivo : {}) }}
                onClick={() => { if (p.id === "rango") { setVerRango(!verRango); } else { setPeriodo(p.id); setVerRango(false); }}}
              >
                {p.icono && <Calendar size={13} color={activo ? t.colors.blueText : t.colors.textSecondary} strokeWidth={2} style={{ marginRight: "5px" }} />}
                {p.label}
              </button>
            );
          })}
        </div>

        {verRango && (
          <div style={{background:t.colors.bgCard,borderRadius:t.radius.md,padding:"12px",marginBottom:"12px",border:`1px solid ${t.colors.border}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <div>
                <label style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,display:"block",marginBottom:"4px"}}>Desde</label>
                <input type="date" value={rangoDesde} onChange={e=>{setRangoDesde(e.target.value);setPeriodo("rango");}}
                  style={{width:"100%",boxSizing:"border-box",padding:"10px",borderRadius:t.radius.sm,border:`1.5px solid ${t.colors.border}`,background:t.colors.bgPrimary,color:t.colors.textPrimary,fontSize:t.fonts.sizeSm,outline:"none"}}/>
              </div>
              <div>
                <label style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,display:"block",marginBottom:"4px"}}>Hasta</label>
                <input type="date" value={rangoHasta} onChange={e=>{setRangoHasta(e.target.value);setPeriodo("rango");}}
                  style={{width:"100%",boxSizing:"border-box",padding:"10px",borderRadius:t.radius.sm,border:`1.5px solid ${t.colors.border}`,background:t.colors.bgPrimary,color:t.colors.textPrimary,fontSize:t.fonts.sizeSm,outline:"none"}}/>
              </div>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div style={styles.chips}>
          {[
            { id: "pendientes", label: "Pendientes" },
            { id: "vencidos", label: "Vencidos" },
            { id: "pagados", label: "Pagados" },
            { id: "todos", label: "Todos" },
          ].map(f => (
            <button
              key={f.id}
              style={{ ...styles.chip, ...(filtro === f.id ? styles.chipActivo : {}) }}
              onClick={() => setFiltro(f.id)}
            >
              {f.id === "vencidos" && vencidos.length > 0 && (
                <span style={{ background: t.colors.red, color: "#fff", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: "4px", ...t.numeric }}>
                  {vencidos.length}
                </span>
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* SIN RESULTADOS */}
        {empresasOrdenadas.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <CheckCircle size={40} color={t.colors.textTertiary} strokeWidth={1.5} />
            <p style={{ fontSize: t.fonts.sizeSm, color: t.colors.textTertiary, margin: "12px 0 0" }}>
              {filtro === "pendientes" ? "No hay viajes pendientes de pago" :
                filtro === "vencidos" ? "No hay pagos vencidos" :
                  filtro === "pagados" ? "No hay viajes pagados" : "Sin viajes"}
            </p>
          </div>
        )}

        {/* VIAJES POR EMPRESA */}
        {empresasOrdenadas.map(([empresa, data]) => {
          const abierta = empAbiertas[empresa] !== false; // abierta por defecto
          return (
          <div key={empresa} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              onClick={() => toggleEmp(empresa)}>
              <div>
                <p style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 }}>{empresa}</p>
                <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "2px 0 0" }}>{data.viajes.length} viaje{data.viajes.length !== 1 ? "s" : ""}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <p style={{ fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBlack, color: t.colors.textPrimary, margin: 0, ...t.numeric }}>{fmt(data.total)}</p>
                {abierta ? <ChevronUp size={16} color={t.colors.textTertiary}/> : <ChevronDown size={16} color={t.colors.textTertiary}/>}
              </div>
            </div>

            {abierta && data.viajes.map((v, i, arr) => {
              const { dias, vencido } = calcVencimiento(v);
              const pagado = v.estadoPago === "pagado";
              const placa = v.placa || "";

              return (
                <div
                  key={v.firestoreId}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.colors.borderLight}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => navigate(`/viaje/${v.firestoreId}`)}>
                    <p style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold, color: t.colors.textPrimary, margin: 0 }}>
                      {v.ruta || "Sin ruta"}
                    </p>
                    <p style={{ fontSize: t.fonts.sizeXs, color: vencido && !pagado ? t.colors.redText : t.colors.textTertiary, margin: "2px 0 0" }}>
                      {v.fecha} · {placa}
                      {pagado ? ` · Pagado ${v.fechaPago || ""}` :
                        vencido ? ` · Vencido hace ${Math.abs(dias)} días` :
                          dias <= 7 ? ` · Vence en ${dias} días` :
                            ` · Vence en ${dias} días`
                      }
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                      <span style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: pagado ? t.colors.green : t.colors.textPrimary, ...t.numeric }}>
                        {fmt(pagado ? (v.vViaje || 0) : obtenerSaldoPendiente(v))}
                      </span>
                      {!pagado && ((v.anticipoFleteMonto || 0) > 0 || (v.anticipoFleteMontoRet || 0) > 0) && (
                        <span style={{ fontSize: "10px", color: t.colors.textTertiary, ...t.numeric }}>
                          Saldo de {fmt(v.vViaje || 0)}
                        </span>
                      )}
                    </div>

                    {!pagado ? (
                      <button
                        style={{
                          width: "28px", height: "28px", borderRadius: "50%",
                          border: `1.5px solid ${vencido ? t.colors.red : t.colors.border}`,
                          background: vencido ? t.colors.redSoft : "transparent",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                        onClick={() => marcarPagado(v)}
                        title="Marcar como pagado"
                      >
                        {vencido
                          ? <AlertCircle size={14} color={t.colors.red} strokeWidth={2} />
                          : <Clock size={14} color={t.colors.textTertiary} strokeWidth={2} />
                        }
                      </button>
                    ) : (
                      <button
                        style={{ width: "28px", height: "28px", borderRadius: "50%", background: t.colors.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
                        onClick={() => marcarPendiente(v)}
                        title="Marcar como pendiente"
                      >
                        <CheckCircle size={14} color={t.colors.green} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          );
        })}

      </div>
    </div>
  );
}

const styles = {
  pantalla:  { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:    { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver: { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blueText, cursor: "pointer", padding: 0, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold },
  titulo:    { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  contenido: { padding: "12px 16px 16px" },
  card:      { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "16px", marginBottom: "10px", border: `1px solid ${t.colors.borderLight}`, boxShadow: t.shadows.card },
  input:     { width: "100%", padding: "11px 12px", borderRadius: t.radius.sm, border: `1.5px solid ${t.colors.border}`, fontSize: t.fonts.sizeSm, background: t.colors.bgPrimary, color: t.colors.textPrimary, outline: "none", boxSizing: "border-box" },
  chips:     { display: "flex", gap: "6px", marginBottom: "12px", overflowX: "auto" },
  chip:      { padding: "7px 14px", borderRadius: t.radius.full, border: `1.5px solid ${t.colors.border}`, background: "none", color: t.colors.textSecondary, fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightSemibold, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center" },
  chipActivo: { background: t.colors.blueSoft, borderColor: t.colors.blue, color: t.colors.blueText },
};

export default Cartera;