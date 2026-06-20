import { useNavigate } from "react-router-dom";
import { useAuth }     from "../hooks/useAuth";
import { theme as t }  from "../styles/theme";
import {Truck, TrendingUp, Calculator, Trophy, MapPin, Handshake, AlertCircle, Wrench} from "lucide-react";
import { SkeletonCard, SkeletonKpi } from "../components/Skeleton";

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
  const viajesMes = viajes.filter((v) => {
    const f = new Date(v.fecha);
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
    const fecha = new Date(v.fecha);
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
  { label: "Vehículos",   Icono: Truck,       ruta: "/vehiculos",   color: "#0F2340", border: "#1E3A5F", iconColor: "#22C55E" },
  { label: "Cuentas",     Icono: TrendingUp,  ruta: "/cuentas",     color: "#0F2340", border: "#1E3A5F", iconColor: "#22C55E" },
  { label: "Calculadora", Icono: Calculator,  ruta: "/calculadora", color: "#0F2340", border: "#1E3A5F", iconColor: "#22C55E" },
  { label: "Cartera",     Icono: AlertCircle, ruta: "/cartera",     color: "#0F2340", border: "#1E3A5F", iconColor: vencidos.length > 0 ? "#EF4444" : "#22C55E" },
  { label: "Viajes",      Icono: MapPin,      ruta: "/viajes",      color: "#0F2340", border: "#1E3A5F", iconColor: "#22C55E" },
  { label: "Mant.",       Icono: Wrench,      ruta: "/vehiculos",   color: "#0F2340", border: "#1E3A5F", iconColor: "#22C55E" },
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
            color: gananciaMes >= 0 ? "#064E3B" : "#7F1D1D",
          }}>
            {fmt(gananciaMes)}
          </p>
          <p style={styles.gananciaSub}>
            {viajesMes.length} viaje{viajesMes.length !== 1 ? "s" : ""}
          </p>
          {totalPE > 0 && (
            <div style={{marginTop:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                <span style={{fontSize:"10px",color:"#065F46",fontWeight:"600"}}>Punto de equilibrio</span>
                <span style={{fontSize:"10px",color:pctPE>=100?"#065F46":"#7F1D1D",fontWeight:"700"}}>{pctPE}%</span>
              </div>
              <div style={{height:"4px",borderRadius:"2px",background:"rgba(0,0,0,0.15)",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:"2px",width:`${Math.min(pctPE,100)}%`,background:pctPE>=100?"#065F46":pctPE>=60?"#D97706":"#DC2626",transition:"width 0.4s"}}/>
              </div>
            </div>
          )}
        </div>
        <div style={styles.gananciaDer}>
          <div style={styles.vehMetrica}>
            <p style={styles.vehMetricaValor}>{vehiculos.length}</p>
            <p style={styles.vehMetricaLabel}>Vehículos</p>
          </div>
        </div>
      </div>

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
            <p style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.red, margin: 0 }}>
              {vencidos.length} pago{vencidos.length !== 1 ? "s" : ""} vencido{vencidos.length !== 1 ? "s" : ""}
            </p>
            <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textSecondary, margin: "2px 0 0" }}>
              {fmt(totalVencido)} pendiente · Toca para ver
            </p>
          </div>
        </div>
      )}

      {/* ALERTA DOCUMENTOS POR VENCER */}
      {docsAlerta.length > 0 && (
        <div
          style={{
            margin: "0 16px 10px",
            padding: "12px 16px",
            background: docsAlerta.some(d=>d.vencido) ? t.colors.redSoft : "#FEF3C7",
            border: `1.5px solid ${docsAlerta.some(d=>d.vencido) ? t.colors.redBorder : "#F59E0B33"}`,
            borderRadius: t.radius.lg,
          }}
        >
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
            <AlertCircle size={18} color={docsAlerta.some(d=>d.vencido)?t.colors.red:t.colors.amber} strokeWidth={2} />
            <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:docsAlerta.some(d=>d.vencido)?t.colors.red:t.colors.amber,margin:0}}>
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
              <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:d.vencido?t.colors.red:d.dias<=7?t.colors.amber:t.colors.textSecondary}}>
                {d.vencido?`Venció hace ${Math.abs(d.dias)}d`:d.dias===0?"Vence hoy":`Vence en ${d.dias}d`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ALERTA MANTENIMIENTOS POR KM */}
      {mantAlerta.length > 0 && (
        <div style={{margin:"0 16px 10px",padding:"12px 16px",background:mantAlerta.some(m=>m.vencido)?"#FEF2F2":"#FEF3C7",border:`1.5px solid ${mantAlerta.some(m=>m.vencido)?"#EF444433":"#F59E0B33"}`,borderRadius:t.radius.lg}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
            <Wrench size={18} color={mantAlerta.some(m=>m.vencido)?t.colors.red:t.colors.amber} strokeWidth={2} />
            <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:mantAlerta.some(m=>m.vencido)?t.colors.red:t.colors.amber,margin:0}}>Mantenimientos pendientes</p>
          </div>
          {mantAlerta.map((m,i) => (
            <div key={`${m.placa}-${m.tipo}-${i}`}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",cursor:"pointer"}}
              onClick={()=>navigate(`/vehiculo/${m.vehiculoId}`,{state:{tab:"mant"}})}>
              <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>{m.tipo} · {m.placa}</span>
              <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:m.vencido?t.colors.red:t.colors.amber}}>
                {m.vencido?`Pasado ${Math.abs(m.kmFaltantes).toLocaleString("es-CO")} km`:`Faltan ${m.kmFaltantes.toLocaleString("es-CO")} km`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ALERTA LICENCIAS CONDUCTORES */}
      {licAlerta.length > 0 && (
        <div style={{margin:"0 16px 10px",padding:"12px 16px",background:licAlerta.some(l=>l.vencido)?"#FEF2F2":"#FEF3C7",border:`1.5px solid ${licAlerta.some(l=>l.vencido)?"#EF444433":"#F59E0B33"}`,borderRadius:t.radius.lg}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
            <AlertCircle size={18} color={licAlerta.some(l=>l.vencido)?t.colors.red:t.colors.amber} strokeWidth={2} />
            <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,color:licAlerta.some(l=>l.vencido)?t.colors.red:t.colors.amber,margin:0}}>Licencias de conducir</p>
          </div>
          {licAlerta.map((l,i) => (
            <div key={`lic-${i}`}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",cursor:"pointer"}}
              onClick={()=>navigate("/conductores")}>
              <span style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>{l.nombre}</span>
              <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:l.vencido?t.colors.red:t.colors.amber}}>
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
      style={{
        ...styles.accesoCard,
        background: a.color,
        border: `1.5px solid ${a.border}`,
      }}
      onClick={() => navigate(a.ruta)}
    >
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: t.radius.sm,
        background: a.border,
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
        <div style={styles.vacio}>
          <p style={styles.vacioIcono}>📋</p>
          <p style={styles.vacioTexto}>Sin viajes registrados</p>
          <p style={styles.vacioSub}>
            Usa la calculadora para registrar tu primer viaje.
          </p>
          <button
            style={styles.btnCalcular}
            onClick={() => navigate("/calculadora")}
          >
            Calcular flete
          </button>
        </div>
      ) : (
        <div style={styles.viajesList}>
          {recientes.map((v) => {
            const positivo = (v.neta || 0) >= 0;
            return (
              <div
                key={v.firestoreId}
                style={styles.viajeCard}
                onClick={() => navigate(`/viaje/${v.firestoreId}`)}
              >
                <div style={{
                  ...styles.viajeIndicador,
                  background: positivo ? t.colors.greenSoft : t.colors.redSoft,
                  borderColor: positivo ? t.colors.greenBorder : t.colors.redBorder,
                }} />
                <div style={styles.viajeInfo}>
                  <p style={styles.viajeRuta}>{v.ruta || "Sin ruta"}</p>
                  <p style={styles.viajeMeta}>
                    {v.fecha || ""}
                    {v.placa ? ` · ${v.placa}` : ""}
                  </p>
                </div>
                <div style={styles.viajeDer}>
                  <p style={{
                    ...styles.viajeNeta,
                    color: positivo ? t.colors.green : t.colors.red,
                  }}>
                    {positivo ? "+" : ""}{fmt(v.neta || 0)}
                  </p>
                  <p style={styles.viajeFlete}>{fmt(v.vViaje || 0)}</p>
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
  avatar:            { width: "44px", height: "44px", borderRadius: t.radius.full, background: t.colors.blue, color: "#fff", border: "none", fontSize: "15px", fontWeight: t.fonts.weightBold, cursor: "pointer", flexShrink: 0 },
  gananciaCard:      { background: `linear-gradient(135deg, #15803D 0%, ${t.colors.green} 100%)`, margin: "16px", borderRadius: t.radius.lg, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" },
  gananciaIzq:       { flex: 1 },
  gananciaLabel:     { fontSize: t.fonts.sizeXs, color: "rgba(255,255,255,0.75)", margin: "0 0 4px", fontWeight: t.fonts.weightMedium, textTransform: "uppercase", letterSpacing: "0.06em" },
  gananciaValor:     { fontSize: "38px", fontWeight: t.fonts.weightBlack, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.5px" },
  gananciaSub:       { fontSize: t.fonts.sizeXs, color: "rgba(255,255,255,0.65)", margin: 0 },
  gananciaDer:       { marginLeft: "16px" },
  vehMetrica:        { background: "rgba(255,255,255,0.15)", borderRadius: t.radius.md, padding: "12px 16px", textAlign: "center", backdropFilter: "blur(10px)" },
  vehMetricaValor:   { fontSize: "24px", fontWeight: t.fonts.weightBlack, color: "#fff", margin: 0 },
  vehMetricaLabel:   { fontSize: "10px", color: "rgba(255,255,255,0.75)", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" },
  seccionHeader:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 20px 8px" },
  seccionTitulo:     { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", padding: "12px 20px 8px", margin: 0 },
  btnVerTodos:       { background: "none", border: "none", fontSize: t.fonts.sizeXs, color: t.colors.blue, fontWeight: t.fonts.weightBold, cursor: "pointer", padding: "12px 20px 8px" },
  grid:              { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", padding: "0 16px 4px" },
  accesoCard:        { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "16px", borderRadius: t.radius.lg, cursor: "pointer", transition: "transform 0.1s", background:"#0F2340" },
  accesoIcono:       { width:"44px", height:"44px", borderRadius: t.radius.md, background: "#1565ff22", display: "flex", alignItems:"center", justifyContent:"center", },
  accesoLabel:       { fontSize: t.fonts.sixeXs, fontWeight: t.fonts.weightSemibold, color: "#ffffff", textAlign:"center", },
  vacio:             { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "40px 20px", textAlign: "center", margin: "0 16px", boxShadow: t.shadows.card },
  vacioIcono:        { fontSize: "36px", marginBottom: "10px" },
  vacioTexto:        { fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: "0 0 6px" },
  vacioSub:          { fontSize: t.fonts.sizeSm, color: t.colors.textSecondary, margin: "0 0 20px" },
  btnCalcular:       { padding: "12px 28px", background: t.colors.green, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, cursor: "pointer" },
  viajesList:        { padding: "0 16px", display: "flex", flexDirection: "column", gap: "8px" },
  viajeCard:         { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "14px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", boxShadow: t.shadows.card },
  viajeIndicador:    { width: "4px", height: "40px", borderRadius: "2px", border: "1.5px solid", flexShrink: 0 },
  viajeInfo:         { flex: 1, minWidth: 0 },
  viajeRuta:         { fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold, color: t.colors.textPrimary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  viajeMeta:         { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "3px 0 0" },
  viajeDer:          { textAlign: "right", flexShrink: 0 },
  viajeNeta:         { fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBold, margin: 0 },
  viajeFlete:        { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "2px 0 0" },
};

export default Home;