import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { theme as t } from "../styles/theme";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");

// Parser numérico colombiano: distingue decimal de miles
// "4.5" → 4.5 (decimal) · "10.800" → 10800 (miles) · "33,2" → 33.2 · "1.500.000" → 1500000
const num = (v) => {
  let t = String(v).trim().replace(/\s/g, "");
  if (!t) return 0;
  // Coma = decimal siempre
  if (t.includes(",")) {
    const n = parseFloat(t.replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? 0 : n;
  }
  // Solo puntos: 1-2 dígitos tras el punto = decimal; 3 dígitos = miles
  const partes = t.split(".");
  if (partes.length === 2 && partes[1].length <= 2) {
    const n = parseFloat(t);
    return isNaN(n) ? 0 : n;
  }
  const n = parseFloat(t.replace(/\./g, ""));
  return isNaN(n) ? 0 : n;
};

const DEFAULT_ADBLUE = 0.05;

function Cotizador({ vehiculos = [], rutas = [], mostrarToast }) {
  const navigate = useNavigate();

  // Datos principales
  const [placa, setPlaca] = useState("");
  const [toneladas, setToneladas] = useState("");
  const [fleteOfrecido, setFleteOfrecido] = useState("");
  const [modoFlete, setModoFlete] = useState("porTon");

  // Ruta / distancia
  const [kmCargado, setKmCargado] = useState("");
  const [kmVacio, setKmVacio] = useState("");

  // Combustible
  const [rendCargado, setRendCargado] = useState("");
  const [rendVacio, setRendVacio] = useState("");
  const [precioAcpm, setPrecioAcpm] = useState("");

  // Costos
  const [peajes, setPeajes] = useState("");
  const [modoConductor, setModoConductor] = useState("porcentaje");
  const [valorConductor, setValorConductor] = useState("");
  const [otrosGastos, setOtrosGastos] = useState("");

  // Utilidad deseada (para calcular tarifa mínima sugerida)
  const [modoUtilidad, setModoUtilidad] = useState("porcentaje"); // porcentaje | porViaje | porTon
  const [utilidadDeseada, setUtilidadDeseada] = useState("");

  // Prellenar desde ruta frecuente (opcional, atajo)
  const [mostrarRutas, setMostrarRutas] = useState(false);
  const rutasDisponibles = rutas.filter(r => r.nombre || r.ruta);

  const cargarRuta = (r) => {
    setKmCargado(String(r.kmCargado || ""));
    setKmVacio(String(r.kmVacio || ""));
    setRendCargado(String(r.rendCargado || ""));
    setRendVacio(String(r.rendVacio || ""));
    setPrecioAcpm(String(r.precioAcpm || ""));
    const totP = (r.peajesRuta || []).reduce((s, p) => s + (p.tarifa || 0) * (p.iv ? 2 : 1), 0) || r.peajes || 0;
    setPeajes(String(totP || ""));
    setModoConductor(r.modoConductor === "fijo" ? "fijo" : "porcentaje");
    setValorConductor(String(r.porcCond || ""));
    const gastos = (r.carpado || 0) + (r.gastosViaje || 0) + (r.extrasList || []).reduce((s, e) => s + (e.valor || 0), 0);
    setOtrosGastos(gastos ? String(gastos) : "");
    setMostrarRutas(false);
    mostrarToast(`Datos de "${r.nombre || r.ruta}" cargados`, "info");
  };

  const cargarVehiculo = (p) => {
    setPlaca(p);
    const v = vehiculos.find(veh => veh.placa === p);
    // Si el vehículo tiene rendimientos por defecto, precargarlos
    if (v?.rendCargadoDef) setRendCargado(String(v.rendCargadoDef));
    if (v?.rendVacioDef) setRendVacio(String(v.rendVacioDef));
  };

  // Cálculo
  const calculo = useMemo(() => {
    const ton = num(toneladas);
    const flete = num(fleteOfrecido);
    if (!flete) return null;

    const valorViaje = modoFlete === "porTon" ? ton * flete : flete;
    if (valorViaje <= 0) return null;

    const kmC = num(kmCargado);
    const kmV = num(kmVacio);
    const rC = num(rendCargado);
    const rV = num(rendVacio) || rC;
    const galCarg = rC > 0 ? kmC / rC : 0;
    const galVac = rV > 0 ? kmV / rV : 0;
    const galTotal = galCarg + galVac;

    const vehiculo = vehiculos.find(v => v.placa === placa);
    const usaAdblue = vehiculo?.usaAdblue !== false;
    const adblueRatio = usaAdblue ? (vehiculo?.adblueRatio || DEFAULT_ADBLUE) : 0;
    const pAcpm = num(precioAcpm);
    const costoAcpm = galTotal * pAcpm;
    const costoAdbl = galTotal * adblueRatio * (num(precioAcpm) ? 6000 : 0); // estimado adblue
    const costoComb = costoAcpm + costoAdbl;

    const totPeajes = num(peajes);
    const costoConduct = modoConductor === "fijo" ? num(valorConductor) : (num(valorConductor) / 100) * valorViaje;
    const gastos = num(otrosGastos);

    const totalGastos = costoComb + totPeajes + costoConduct + gastos;
    const gananciaNeta = valorViaje - totalGastos;
    const margen = valorViaje > 0 ? (gananciaNeta / valorViaje) * 100 : 0;
    const kmTotal = kmC + kmV;
    const gananciaPorKm = kmTotal > 0 ? gananciaNeta / kmTotal : 0;

    const fleteMinimoTotal = totalGastos;
    const fleteMinimoPorTon = ton > 0 ? fleteMinimoTotal / ton : 0;

    // ── Tarifa sugerida según utilidad deseada (piso / objetivo / ideal) ──
    // Los gastos que dependen del valor del flete (conductor %, descuentos) hacen
    // que el cálculo sea circular. Resolvemos: si el conductor es %, el flete que
    // deja utilidad U debe cumplir: flete - (costosFijos + flete*pctVar) = U
    // → flete = (costosFijos + U) / (1 - pctVar)
    const pctVariable = modoConductor === "porcentaje" ? (num(valorConductor) / 100) : 0;
    const costosFijos = costoComb + totPeajes + gastos + (modoConductor === "fijo" ? num(valorConductor) : 0);

    const fleteParaUtilidad = (utilidadObjetivo) => {
      const f = (costosFijos + utilidadObjetivo) / (1 - pctVariable);
      return f > 0 ? f : 0;
    };

    let tarifaPiso = 0, tarifaObjetivo = 0, tarifaIdeal = 0;
    const uDeseada = num(utilidadDeseada);
    if (uDeseada > 0) {
      let utilObjetivoPesos;
      if (modoUtilidad === "porViaje") {
        utilObjetivoPesos = uDeseada;
      } else if (modoUtilidad === "porTon") {
        utilObjetivoPesos = uDeseada * ton;
      } else {
        // porcentaje sobre costos
        utilObjetivoPesos = costosFijos * (uDeseada / 100);
      }
      tarifaObjetivo = fleteParaUtilidad(utilObjetivoPesos);
      tarifaPiso = fleteParaUtilidad(utilObjetivoPesos * 0.6);   // 60% de la meta = piso
      tarifaIdeal = fleteParaUtilidad(utilObjetivoPesos * 1.4);  // 140% = ideal
    }

    return {
      valorViaje, costoComb, totPeajes, costoConduct, gastos,
      totalGastos, gananciaNeta, margen, kmTotal, gananciaPorKm, galTotal,
      fleteMinimoTotal, fleteMinimoPorTon,
      tarifaPiso, tarifaObjetivo, tarifaIdeal, ton,
    };
  }, [placa, toneladas, fleteOfrecido, modoFlete, kmCargado, kmVacio, rendCargado, rendVacio, precioAcpm, peajes, modoConductor, valorConductor, otrosGastos, modoUtilidad, utilidadDeseada, vehiculos]);

  const veredicto = useMemo(() => {
    if (!calculo) return null;
    const m = calculo.margen;
    if (calculo.gananciaNeta < 0) return { label: "No cubre costos", color: t.colors.red, icono: AlertTriangle };
    if (m < 15) return { label: "Margen muy bajo", color: t.colors.amber || "#F59E0B", icono: TrendingDown };
    if (m < 25) return { label: "Margen aceptable", color: t.colors.amber || "#F59E0B", icono: TrendingUp };
    return { label: "Buen flete", color: t.colors.green, icono: TrendingUp };
  }, [calculo]);

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

        {/* Atajo: cargar de ruta frecuente */}
        {rutasDisponibles.length > 0 && (
          <div style={{marginBottom:"14px"}}>
            <button style={styles.btnRutaFrec} onClick={() => setMostrarRutas(!mostrarRutas)}>
              <span>📋 Cargar datos de una ruta frecuente</span>
              {mostrarRutas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {mostrarRutas && (
              <div style={{marginTop:"6px"}}>
                {rutasDisponibles.map((r, i) => (
                  <button key={i} style={styles.rutaFrecItem} onClick={() => cargarRuta(r)}>
                    {r.nombre || r.ruta}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vehículo */}
        <label style={styles.label}>Vehículo (opcional)</label>
        <select value={placa} onChange={e => cargarVehiculo(e.target.value)} style={styles.input}>
          <option value="">Sin vehículo específico</option>
          {vehiculos.map(v => <option key={v.placa} value={v.placa}>{v.placa}</option>)}
        </select>

        {/* Flete */}
        <label style={styles.label}>Flete que le ofrecen *</label>
        <div style={{display:"flex", gap:"8px", marginBottom:"6px"}}>
          <button onClick={()=>setModoFlete("porTon")} style={{...styles.toggleBtn, ...(modoFlete==="porTon"?styles.toggleActivo:{})}}>Por tonelada</button>
          <button onClick={()=>setModoFlete("total")} style={{...styles.toggleBtn, ...(modoFlete==="total"?styles.toggleActivo:{})}}>Total</button>
        </div>
        <input type="text" inputMode="decimal" placeholder={modoFlete==="porTon"?"141000":"4794000"} value={fleteOfrecido}
          onChange={e => setFleteOfrecido(e.target.value)} style={styles.input} />

        {modoFlete === "porTon" && (
          <>
            <label style={styles.label}>Toneladas *</label>
            <input type="text" inputMode="decimal" placeholder="34" value={toneladas}
              onChange={e => setToneladas(e.target.value)} style={styles.input} />
          </>
        )}

        {/* DISTANCIA */}
        <p style={styles.subSeccion}>🛣 Distancia</p>
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Km cargado</label>
            <input type="text" inputMode="numeric" placeholder="380" value={kmCargado}
              onChange={e => setKmCargado(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Km vacío</label>
            <input type="text" inputMode="numeric" placeholder="60" value={kmVacio}
              onChange={e => setKmVacio(e.target.value)} style={styles.input} />
          </div>
        </div>

        {/* COMBUSTIBLE */}
        <p style={styles.subSeccion}>⛽ Combustible</p>
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Rend. cargado (km/gal)</label>
            <input type="text" inputMode="decimal" placeholder="5.5" value={rendCargado}
              onChange={e => setRendCargado(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Rend. vacío (km/gal)</label>
            <input type="text" inputMode="decimal" placeholder="7.0" value={rendVacio}
              onChange={e => setRendVacio(e.target.value)} style={styles.input} />
          </div>
        </div>
        <label style={styles.label}>Precio galón ACPM</label>
        <input type="text" inputMode="numeric" placeholder="10800" value={precioAcpm}
          onChange={e => setPrecioAcpm(e.target.value)} style={styles.input} />

        {/* COSTOS */}
        <p style={styles.subSeccion}>💸 Costos</p>
        <label style={styles.label}>Total peajes</label>
        <input type="text" inputMode="numeric" placeholder="890000" value={peajes}
          onChange={e => setPeajes(e.target.value)} style={styles.input} />

        <label style={styles.label}>Pago del conductor</label>
        <div style={{display:"flex", gap:"8px", marginBottom:"6px"}}>
          <button onClick={()=>setModoConductor("porcentaje")} style={{...styles.toggleBtn, ...(modoConductor==="porcentaje"?styles.toggleActivo:{})}}>Porcentaje</button>
          <button onClick={()=>setModoConductor("fijo")} style={{...styles.toggleBtn, ...(modoConductor==="fijo"?styles.toggleActivo:{})}}>Valor fijo</button>
        </div>
        <input type="text" inputMode="decimal" placeholder={modoConductor==="porcentaje"?"10 (%)":"500000"} value={valorConductor}
          onChange={e => setValorConductor(e.target.value)} style={styles.input} />

        <label style={styles.label}>Otros gastos (carpado, viáticos...)</label>
        <input type="text" inputMode="numeric" placeholder="200000" value={otrosGastos}
          onChange={e => setOtrosGastos(e.target.value)} style={styles.input} />

        {/* UTILIDAD DESEADA */}
        <p style={styles.subSeccion}>🎯 ¿Cuánto quiere ganar? (opcional)</p>
        <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 8px", lineHeight:1.4}}>
          Le sugerimos qué tarifa pedir para lograr esa utilidad.
        </p>
        <div style={{display:"flex", gap:"6px", marginBottom:"6px"}}>
          <button onClick={()=>setModoUtilidad("porcentaje")} style={{...styles.toggleBtn, fontSize:"11px", ...(modoUtilidad==="porcentaje"?styles.toggleActivo:{})}}>% sobre costos</button>
          <button onClick={()=>setModoUtilidad("porViaje")} style={{...styles.toggleBtn, fontSize:"11px", ...(modoUtilidad==="porViaje"?styles.toggleActivo:{})}}>$ por viaje</button>
          <button onClick={()=>setModoUtilidad("porTon")} style={{...styles.toggleBtn, fontSize:"11px", ...(modoUtilidad==="porTon"?styles.toggleActivo:{})}}>$ por ton</button>
        </div>
        <input type="text" inputMode="decimal"
          placeholder={modoUtilidad==="porcentaje"?"30 (%)":modoUtilidad==="porViaje"?"900000":"25000"}
          value={utilidadDeseada}
          onChange={e => setUtilidadDeseada(e.target.value)} style={styles.input} />

        {/* TARIFA SUGERIDA (rango) */}
        {calculo && calculo.tarifaObjetivo > 0 && (
          <div style={styles.rangoBox}>
            <p style={{fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 12px", textAlign:"center"}}>
              Tarifa sugerida {modoFlete==="porTon" && calculo.ton>0 ? "(por tonelada)" : "(total viaje)"}
            </p>
            <div style={{display:"flex", justifyContent:"space-between", gap:"8px"}}>
              {[
                { label:"PISO", desc:"mínimo aceptable", val:calculo.tarifaPiso, color:t.colors.amber||"#F59E0B" },
                { label:"OBJETIVO", desc:"su meta", val:calculo.tarifaObjetivo, color:t.colors.blue, destacado:true },
                { label:"IDEAL", desc:"si negocia bien", val:calculo.tarifaIdeal, color:t.colors.green },
              ].map((tier, i) => {
                const mostrarPorTon = modoFlete==="porTon" && calculo.ton>0;
                const valor = mostrarPorTon ? tier.val / calculo.ton : tier.val;
                return (
                  <div key={i} style={{flex:1, textAlign:"center", padding:"12px 6px", background:tier.destacado?tier.color+"18":t.colors.bgSection, borderRadius:t.radius.md, border:tier.destacado?`2px solid ${tier.color}`:`1px solid ${t.colors.borderLight}`}}>
                    <p style={{fontSize:"10px", fontWeight:t.fonts.weightBold, color:tier.color, margin:"0 0 4px", letterSpacing:"0.05em"}}>{tier.label}</p>
                    <p style={{fontSize:tier.destacado?"16px":"14px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:0, lineHeight:1.1}}>{fmt(valor)}</p>
                    <p style={{fontSize:"9px", color:t.colors.textTertiary, margin:"3px 0 0"}}>{tier.desc}</p>
                  </div>
                );
              })}
            </div>
            <p style={{fontSize:"11px", color:t.colors.textTertiary, textAlign:"center", margin:"10px 0 0", fontStyle:"italic"}}>
              No acepte por debajo del piso. Empiece pidiendo el ideal.
            </p>
          </div>
        )}

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
              <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:veredicto.color, margin:"2px 0 0"}}>
                {calculo.margen.toFixed(1)}% margen{calculo.kmTotal > 0 ? ` · ${fmt(calculo.gananciaPorKm)}/km` : ""}
              </p>
            </div>

            <div style={styles.desglose}>
              <div style={styles.desgloseRow}><span>Flete</span><span style={{fontWeight:t.fonts.weightBold}}>{fmt(calculo.valorViaje)}</span></div>
              {calculo.costoComb > 0 && <div style={styles.desgloseRow}><span>Combustible ({calculo.galTotal.toFixed(0)} gal)</span><span>−{fmt(calculo.costoComb)}</span></div>}
              {calculo.totPeajes > 0 && <div style={styles.desgloseRow}><span>Peajes</span><span>−{fmt(calculo.totPeajes)}</span></div>}
              {calculo.costoConduct > 0 && <div style={styles.desgloseRow}><span>Conductor</span><span>−{fmt(calculo.costoConduct)}</span></div>}
              {calculo.gastos > 0 && <div style={styles.desgloseRow}><span>Otros gastos</span><span>−{fmt(calculo.gastos)}</span></div>}
            </div>

            {num(toneladas) > 0 && (
              <div style={{marginTop:"12px", padding:"10px", background:t.colors.bgSection, borderRadius:t.radius.sm, textAlign:"center"}}>
                <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 2px"}}>Flete mínimo para no perder</p>
                <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0}}>
                  {fmt(calculo.fleteMinimoPorTon)}/ton · {fmt(calculo.fleteMinimoTotal)} total
                </p>
              </div>
            )}
          </div>
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
  subSeccion: { fontSize:"11px", fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"20px 0 4px", paddingBottom:"6px", borderBottom:`1px solid ${t.colors.borderLight}` },
  label:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, display:"block", margin:"12px 0 5px" },
  input:      { width:"100%", boxSizing:"border-box", padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, background:t.colors.bgPrimary, color:t.colors.textPrimary, fontSize:t.fonts.sizeSm, outline:"none" },
  grid2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  toggleBtn:  { flex:1, padding:"8px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, background:"transparent", color:t.colors.textSecondary, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, cursor:"pointer" },
  toggleActivo:{ background:t.colors.blue, color:"#fff", borderColor:t.colors.blue },
  btnRutaFrec:{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 12px", background:t.colors.bgSection, border:`1.5px dashed ${t.colors.border}`, borderRadius:t.radius.sm, color:t.colors.textSecondary, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, cursor:"pointer" },
  rutaFrecItem:{ width:"100%", textAlign:"left", padding:"10px 12px", background:t.colors.bgCard, border:`1px solid ${t.colors.borderLight}`, borderRadius:t.radius.sm, color:t.colors.textPrimary, fontSize:t.fonts.sizeXs, cursor:"pointer", marginBottom:"4px" },
  resultado:  { borderRadius:t.radius.lg, padding:"18px", marginTop:"22px" },
  rangoBox:   { borderRadius:t.radius.lg, padding:"16px", marginTop:"16px", background:t.colors.bgCard, border:`1.5px solid ${t.colors.border}` },
  desglose:   { display:"flex", flexDirection:"column", gap:"6px" },
  desgloseRow:{ display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeXs, color:t.colors.textSecondary },
};

export default Cotizador;