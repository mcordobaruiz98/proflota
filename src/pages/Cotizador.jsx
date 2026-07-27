import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { theme as t } from "../styles/theme";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");
const num = (v) => parseFloat(String(v).replace(/[.\s]/g, "").replace(",", ".")) || 0;

const DEFAULT_ADBLUE = 0.05;

function Cotizador({ vehiculos = [], rutas = [], mostrarToast }) {
  const navigate = useNavigate();

  const [placa, setPlaca] = useState("");
  const [rutaSel, setRutaSel] = useState("");
  const [toneladas, setToneladas] = useState("");
  const [fleteOfrecido, setFleteOfrecido] = useState("");
  const [modoFlete, setModoFlete] = useState("porTon"); // porTon | total

  // Datos de la ruta seleccionada
  const ruta = useMemo(() => rutas.find(r => (r.nombre || r.ruta) === rutaSel), [rutas, rutaSel]);
  const vehiculo = useMemo(() => vehiculos.find(v => v.placa === placa), [vehiculos, placa]);

  // Cálculo en tiempo real
  const calculo = useMemo(() => {
    if (!ruta || !vehiculo || !toneladas || !fleteOfrecido) return null;

    const ton = num(toneladas);
    const flete = num(fleteOfrecido);
    const valorViaje = modoFlete === "porTon" ? ton * flete : flete;

    // Combustible
    const kmCargado = ruta.kmCargado || 0;
    const kmVacio = ruta.kmVacio || 0;
    const rendC = ruta.rendCargado || vehiculo.rendCargadoDef || 0;
    const rendV = ruta.rendVacio || vehiculo.rendVacioDef || rendC;
    const galCarg = rendC > 0 ? kmCargado / rendC : 0;
    const galVac = rendV > 0 ? kmVacio / rendV : 0;
    const galTotal = galCarg + galVac;

    const precioAcpm = ruta.precioAcpm || 0;
    const costoAcpm = galTotal * precioAcpm;
    const usaAdblue = vehiculo.usaAdblue !== false;
    const adblueRatio = usaAdblue ? (vehiculo.adblueRatio || DEFAULT_ADBLUE) : 0;
    const costoAdbl = galTotal * adblueRatio * (ruta.precioAdblue || 0);
    const costoComb = costoAcpm + costoAdbl;

    // Peajes
    const totPeajes = (ruta.peajesRuta || []).reduce((s, p) => s + (p.tarifa || 0) * (p.iv ? 2 : 1), 0) || ruta.peajes || 0;

    // Conductor
    const costoConduct = ruta.modoConductor === "fijo"
      ? (ruta.porcCond || 0)
      : (ruta.porcCond || 0) / 100 * valorViaje;

    // Gastos fijos de la ruta
    const carpado = ruta.carpado || 0;
    const gastosViaje = ruta.gastosViaje || 0;
    const extras = (ruta.extrasList || []).reduce((s, e) => s + (e.valor || 0), 0);

    // Descuentos de ley
    const dRete = ruta.descRetefuente ? (ruta.pctRetefuente || 0) / 100 * valorViaje : 0;
    const dIca = ruta.descReteica ? (ruta.pctReteica || 0) / 100 * valorViaje : 0;
    const dFopat = ruta.descFopat ? (ruta.pctFopat || 0) / 100 * valorViaje : 0;
    const totalDesc = dRete + dIca + dFopat;

    const totalGastos = costoComb + totPeajes + costoConduct + carpado + gastosViaje + extras + totalDesc;
    const gananciaNeta = valorViaje - totalGastos;
    const margen = valorViaje > 0 ? (gananciaNeta / valorViaje) * 100 : 0;
    const kmTotal = kmCargado + kmVacio;
    const gananciaPorKm = kmTotal > 0 ? gananciaNeta / kmTotal : 0;

    // Flete mínimo rentable (para margen 0)
    const fleteMinimoTotal = totalGastos;
    const fleteMinimoPorTon = ton > 0 ? fleteMinimoTotal / ton : 0;

    return {
      valorViaje, costoComb, totPeajes, costoConduct,
      gastosFijos: carpado + gastosViaje + extras, totalDesc,
      totalGastos, gananciaNeta, margen, kmTotal, gananciaPorKm, galTotal,
      fleteMinimoTotal, fleteMinimoPorTon,
    };
  }, [ruta, vehiculo, toneladas, fleteOfrecido, modoFlete]);

  // Veredicto
  const veredicto = useMemo(() => {
    if (!calculo) return null;
    const m = calculo.margen;
    if (calculo.gananciaNeta < 0) return { tipo: "malo", label: "No cubre costos", color: t.colors.red, icono: AlertTriangle };
    if (m < 15) return { tipo: "bajo", label: "Margen muy bajo", color: t.colors.amber || "#F59E0B", icono: TrendingDown };
    if (m < 25) return { tipo: "medio", label: "Margen aceptable", color: t.colors.amber || "#F59E0B", icono: TrendingUp };
    return { tipo: "bueno", label: "Buen flete", color: t.colors.green, icono: TrendingUp };
  }, [calculo]);

  const rutasDisponibles = rutas.filter(r => r.nombre || r.ruta);

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Cotizador rápido</h1>
      </div>

      <div style={styles.contenido}>
        <div style={styles.introBox}>
          <Zap size={18} color={t.colors.blue} />
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:0, lineHeight:1.5}}>
            ¿Le ofrecen un flete? Sepa al instante si le conviene, antes de aceptar.
          </p>
        </div>

        {rutasDisponibles.length === 0 ? (
          <div style={{textAlign:"center", padding:"30px 20px"}}>
            <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 12px"}}>
              Necesita rutas frecuentes guardadas para cotizar rápido.
            </p>
            <button style={styles.btnPrimario} onClick={() => navigate("/calculadora")}>
              Ir a la calculadora
            </button>
          </div>
        ) : (
          <>
            {/* Vehículo */}
            <label style={styles.label}>Vehículo</label>
            <select value={placa} onChange={e => setPlaca(e.target.value)} style={styles.input}>
              <option value="">Seleccione...</option>
              {vehiculos.map(v => <option key={v.placa} value={v.placa}>{v.placa}</option>)}
            </select>

            {/* Ruta */}
            <label style={styles.label}>Ruta</label>
            <select value={rutaSel} onChange={e => setRutaSel(e.target.value)} style={styles.input}>
              <option value="">Seleccione...</option>
              {rutasDisponibles.map((r, i) => {
                const nom = r.nombre || r.ruta;
                return <option key={i} value={nom}>{nom}</option>;
              })}
            </select>

            {ruta && (
              <div style={styles.rutaInfo}>
                <span>🛣 {(ruta.kmCargado||0)+(ruta.kmVacio||0)} km</span>
                <span>💸 {fmt((ruta.peajesRuta||[]).reduce((s,p)=>s+(p.tarifa||0)*(p.iv?2:1),0) || ruta.peajes || 0)} peajes</span>
                {ruta.porcCond > 0 && <span>👤 {ruta.modoConductor==="fijo"?fmt(ruta.porcCond):ruta.porcCond+"%"}</span>}
              </div>
            )}

            {/* Toneladas */}
            <label style={styles.label}>Toneladas</label>
            <input type="text" inputMode="decimal" placeholder="34" value={toneladas}
              onChange={e => setToneladas(e.target.value)} style={styles.input} />

            {/* Flete ofrecido */}
            <label style={styles.label}>Flete que le ofrecen</label>
            <div style={{display:"flex", gap:"8px", marginBottom:"6px"}}>
              <button onClick={()=>setModoFlete("porTon")} style={{...styles.toggleBtn, ...(modoFlete==="porTon"?styles.toggleActivo:{})}}>Por tonelada</button>
              <button onClick={()=>setModoFlete("total")} style={{...styles.toggleBtn, ...(modoFlete==="total"?styles.toggleActivo:{})}}>Total</button>
            </div>
            <input type="text" inputMode="decimal" placeholder={modoFlete==="porTon"?"141000":"4794000"} value={fleteOfrecido}
              onChange={e => setFleteOfrecido(e.target.value)} style={styles.input} />

            {/* RESULTADO */}
            {calculo && veredicto && (
              <div style={{...styles.resultado, background: veredicto.color+"11", border:`2px solid ${veredicto.color}`}}>
                <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px"}}>
                  <veredicto.icono size={22} color={veredicto.color} />
                  <span style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBlack, color:veredicto.color}}>{veredicto.label}</span>
                </div>

                <div style={{textAlign:"center", marginBottom:"14px"}}>
                  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 2px", textTransform:"uppercase"}}>Ganancia neta</p>
                  <p style={{fontSize:"38px", fontWeight:t.fonts.weightBlack, color:veredicto.color, margin:0, letterSpacing:"-1px"}}>{fmt(calculo.gananciaNeta)}</p>
                  <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:veredicto.color, margin:"2px 0 0"}}>{calculo.margen.toFixed(1)}% margen · {fmt(calculo.gananciaPorKm)}/km</p>
                </div>

                <div style={styles.desglose}>
                  <div style={styles.desgloseRow}><span>Flete</span><span style={{fontWeight:t.fonts.weightBold}}>{fmt(calculo.valorViaje)}</span></div>
                  <div style={styles.desgloseRow}><span>Combustible ({calculo.galTotal.toFixed(0)} gal)</span><span>−{fmt(calculo.costoComb)}</span></div>
                  <div style={styles.desgloseRow}><span>Peajes</span><span>−{fmt(calculo.totPeajes)}</span></div>
                  {calculo.costoConduct > 0 && <div style={styles.desgloseRow}><span>Conductor</span><span>−{fmt(calculo.costoConduct)}</span></div>}
                  {calculo.gastosFijos > 0 && <div style={styles.desgloseRow}><span>Gastos</span><span>−{fmt(calculo.gastosFijos)}</span></div>}
                  {calculo.totalDesc > 0 && <div style={styles.desgloseRow}><span>Descuentos ley</span><span>−{fmt(calculo.totalDesc)}</span></div>}
                </div>

                {/* Flete mínimo */}
                <div style={{marginTop:"12px", padding:"10px", background:t.colors.bgSection, borderRadius:t.radius.sm, textAlign:"center"}}>
                  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 2px"}}>Flete mínimo para no perder</p>
                  <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0}}>
                    {fmt(calculo.fleteMinimoPorTon)}/ton · {fmt(calculo.fleteMinimoTotal)} total
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  pantalla:   { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:     { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:  { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:     { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:  { padding:"16px" },
  introBox:   { display:"flex", alignItems:"center", gap:"10px", padding:"12px", background:t.colors.bgSection, borderRadius:t.radius.md, marginBottom:"18px" },
  label:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, display:"block", margin:"12px 0 5px" },
  input:      { width:"100%", boxSizing:"border-box", padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, background:t.colors.bgPrimary, color:t.colors.textPrimary, fontSize:t.fonts.sizeSm, outline:"none" },
  rutaInfo:   { display:"flex", flexWrap:"wrap", gap:"12px", padding:"10px 12px", background:t.colors.bgSection, borderRadius:t.radius.sm, marginTop:"8px", fontSize:t.fonts.sizeXs, color:t.colors.textSecondary },
  toggleBtn:  { flex:1, padding:"8px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, background:"transparent", color:t.colors.textSecondary, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, cursor:"pointer" },
  toggleActivo:{ background:t.colors.blue, color:"#fff", borderColor:t.colors.blue },
  resultado:  { borderRadius:t.radius.lg, padding:"18px", marginTop:"20px" },
  desglose:   { display:"flex", flexDirection:"column", gap:"6px" },
  desgloseRow:{ display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeXs, color:t.colors.textSecondary },
  btnPrimario:{ padding:"12px 24px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer" },
};

export default Cotizador;