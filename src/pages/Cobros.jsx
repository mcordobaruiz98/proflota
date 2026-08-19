import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Check, Eye, Share2, Trash2 } from "lucide-react";
import { theme as t } from "../styles/theme";
import EstadoVacio from "../components/EstadoVacio";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");

// Convertir número a letras (español colombiano)
function numeroALetras(n) {
  const unidades = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
  const decenas = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const especiales = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
  const centenas = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  if (n === 0) return "cero pesos";
  if (n < 0) return "menos " + numeroALetras(-n);

  const entero = Math.floor(n);
  let resultado = "";

  if (entero >= 1000000) {
    const millones = Math.floor(entero / 1000000);
    resultado += (millones === 1 ? "un millón " : convertirGrupo(millones, unidades, decenas, especiales, centenas) + " millones ");
  }

  const resto = entero % 1000000;
  if (resto >= 1000) {
    const miles = Math.floor(resto / 1000);
    resultado += (miles === 1 ? "mil " : convertirGrupo(miles, unidades, decenas, especiales, centenas) + " mil ");
  }

  const ultimoTres = resto % 1000;
  if (ultimoTres > 0) {
    resultado += convertirGrupo(ultimoTres, unidades, decenas, especiales, centenas) + " ";
  }

  return resultado.trim() + " pesos m/cte";

  function convertirGrupo(num, u, d, e, c) {
    if (num === 100) return "cien";
    let r = "";
    if (num >= 100) { r += c[Math.floor(num / 100)] + " "; num %= 100; }
    if (num >= 20) { r += d[Math.floor(num / 10)]; if (num % 10) r += " y " + u[num % 10]; }
    else if (num >= 10) { r += e[num - 10]; }
    else if (num > 0) { r += u[num]; }
    return r.trim();
  }
}

function Cobros({ viajes = [], empresas = [], perfilFacturacion = {}, onGuardarCuenta, cuentasCobro = [], onEditarCuenta, onEliminarCuenta, mostrarToast }) {
  const navigate = useNavigate();

  // Estados del flujo de creación
  const [modo, setModo] = useState("lista"); // lista | seleccionar | concepto | preview
  const [empresaSel, setEmpresaSel] = useState(null);
  const [viajesSel, setViajesSel] = useState([]);
  const [concepto, setConcepto] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Viajes pendientes agrupados por empresa
  const pendientesPorEmpresa = useMemo(() => {
    const mapa = {};
    viajes.filter(v => v.estadoPago !== "pagado" && v.emp).forEach(v => {
      const emp = v.emp;
      if (!mapa[emp]) mapa[emp] = { nombre: emp, viajes: [], total: 0 };
      mapa[emp].viajes.push(v);
      mapa[emp].total += (v.saldoFlete ?? v.vViaje ?? 0);
    });
    return Object.values(mapa).sort((a, b) => b.total - a.total);
  }, [viajes]);

  const perfilOk = perfilFacturacion?.nombreCompleto && perfilFacturacion?.numeroDoc && perfilFacturacion?.ciudad && perfilFacturacion?.telefono;

  // Cruzar nombre de empresa con el directorio para traer su NIT
  const buscarNitEmpresa = (nombreEmp) => {
    if (!nombreEmp) return "";
    const norm = nombreEmp.trim().toLowerCase();
    const emp = empresas.find(e =>
      (e.razonSocial || e.nombre || "").trim().toLowerCase() === norm
    );
    return emp?.nit || "";
  };

  // Total seleccionado
  const totalSel = viajesSel.reduce((s, v) => s + (v.saldoFlete ?? v.vViaje ?? 0), 0);
  const totalAnticipos = viajesSel.reduce((s, v) => s + (v.anticipoFleteMonto || 0), 0);
  const totalBruto = viajesSel.reduce((s, v) => s + (v.vViaje || 0), 0);

  // Plantillas de concepto
  const hoy = new Date();
  const mesActual = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][hoy.getMonth()];
  const anio = hoy.getFullYear();
  const manifiestos = viajesSel.map(v => v.mani).filter(Boolean).join(", ");

  const plantillas = [
    `Servicio de transporte de carga durante el mes de ${mesActual} de ${anio}`,
    manifiestos ? `Fletes de ${mesActual} ${anio}, según manifiestos ${manifiestos}` : `Fletes de ${mesActual} ${anio}`,
    `Transporte de carga, según relación adjunta`,
  ];

  // Fecha formateada
  const fechaHoy = `${perfilFacturacion?.ciudad || "Colombia"}, ${hoy.getDate()} de ${mesActual} de ${anio}`;

  // Consecutivo
  const ultimoNum = cuentasCobro.reduce((max, c) => Math.max(max, c.numero || 0), 0);

  // ── GUARDAR ──
  const guardarCuenta = async () => {
    if (!concepto.trim()) { mostrarToast("Escriba el concepto de la cuenta", "error"); return; }
    setGuardando(true);
    try {
      const numero = ultimoNum + 1;
      const cuenta = {
        numero,
        fecha: `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`,
        estado: "emitida",
        emisor: { ...perfilFacturacion },
        cliente: {
          nombre: empresaSel,
          nit: buscarNitEmpresa(empresaSel),
        },
        concepto: concepto.trim(),
        viajes: viajesSel.map(v => ({
          firestoreId: v.firestoreId,
          fecha: v.fecha,
          manifiesto: v.mani || "",
          ruta: v.ruta || "",
          placa: v.placa || "",
          tonelaje: v.ton || 0,
          valorBruto: v.vViaje || 0,
          anticipoRecibido: v.anticipoFleteMonto || 0,
        })),
        totalBruto,
        totalAnticipos,
        totalPagar: totalSel,
        valorEnLetras: numeroALetras(totalSel),
        creadoEn: new Date().toISOString(),
      };
      await onGuardarCuenta(cuenta);
      mostrarToast(`✓ Cuenta de cobro N° ${String(numero).padStart(3, "0")} generada`, "exito");
      setModo("lista");
      setEmpresaSel(null);
      setViajesSel([]);
      setConcepto("");
    } catch (err) {
      console.error("Error guardando cuenta:", err);
      mostrarToast("Error al guardar la cuenta", "error");
    } finally {
      setGuardando(false);
    }
  };

  // ── GENERAR HTML PARA IMPRIMIR/COMPARTIR ──
  const generarHTML = (cuenta) => {
    const p = cuenta.emisor || perfilFacturacion;
    const tipoDocLabel = { CC: "C.C.", CE: "C.E.", NIT: "NIT", CX: "C.E.", DE: "Doc. Ext.", PA: "Pasaporte", RC: "R.C.", TI: "T.I." };
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cuenta de Cobro N° ${String(cuenta.numero).padStart(3,"0")}</title>
<style>
  @page { margin: 2cm; }
  body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #333; font-size: 14px; line-height: 1.6; position: relative; }
  /* Franjas de identidad NAVIRA — gradiente azul→verde, respetando 2cm de margen */
  .franja-navira { height: 4px; background: linear-gradient(90deg, #1565FF 0%, #22C55E 100%); border-radius: 2px; }
  .franja-top { margin: 0 0 24px; }
  .franja-bottom { margin: 28px 0 0; opacity: 0.85; }
  h2 { text-align: center; margin: 30px 0 5px; font-size: 16px; }
  .fecha { margin-bottom: 30px; text-align: right; }
  .centro { text-align: center; margin: 20px 0; }
  .concepto { margin: 25px 0; }
  .banco { margin: 25px 0; padding: 14px 16px; background: #F0F5FF; border-left: 4px solid #1565FF; border-radius: 4px; font-size: 14px; color: #0A1A2F; }
  .banco strong { color: #0A1A2F; }
  .firma { margin-top: 60px; }
  .firma-img { display: block; max-height: 90px; max-width: 250px; margin-bottom: -20px; margin-top: 10px; }
  .linea { border-top: 1px solid #333; width: 250px; margin-top: 40px; padding-top: 5px; }
  .linea p { margin: 0; line-height: 1.3; }
  .detalle { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
  .detalle th, .detalle td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  .detalle th { background: #F0F5FF; text-align: center; color: #0A1A2F; }
  .right { text-align: right; }
  @media print { body { margin: 20px; } }
</style></head><body>

<div class="franja-navira franja-top"></div>

<p class="fecha">${cuenta.ciudad || p.ciudad || "Colombia"}, ${new Date(cuenta.fecha).getDate()} de ${["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][new Date(cuenta.fecha).getMonth()]} de ${new Date(cuenta.fecha).getFullYear()}</p>

<h2>CUENTA DE COBRO N° ${String(cuenta.numero).padStart(3, "0")}</h2>

<div class="centro">
  <p><strong>A QUIEN VA DIRIGIDA LA CUENTA DE COBRO:</strong></p>
  <p><strong>${cuenta.cliente?.nombre || ""}</strong></p>
  <p>${cuenta.cliente?.nit ? (tipoDocLabel["NIT"] || "NIT") + " " + cuenta.cliente.nit : ""}</p>
</div>

<div class="centro">
  <p>DEBE A:</p>
  <p><strong>${p.nombreCompleto || ""}</strong></p>
  <p>${tipoDocLabel[p.tipoDoc] || "C.C."} ${p.numeroDoc || ""}</p>
</div>

<div class="concepto">
  <p>La suma de <strong>${cuenta.totalPagar?.toLocaleString("es-CO")} PESOS (${cuenta.valorEnLetras || ""})</strong>,
  por concepto de <strong>${cuenta.concepto || ""}</strong>.</p>
</div>

${cuenta.viajes && cuenta.viajes.length > 0 ? `
<table class="detalle">
  <tr><th>Fecha</th><th>Manifiesto</th><th>Ruta</th><th>Placa</th><th>Ton</th><th class="right">Valor/Ton</th><th class="right">Valor</th></tr>
  ${cuenta.viajes.map(v => `<tr>
    <td>${v.fecha || ""}</td>
    <td>${v.manifiesto || ""}</td>
    <td>${v.ruta || ""}</td>
    <td>${v.placa || ""}</td>
    <td>${v.tonelaje || ""}</td>
    <td class="right">${v.tonelaje && v.valorBruto ? Math.round((v.valorBruto || 0) / v.tonelaje).toLocaleString("es-CO") : "—"}</td>
    <td class="right">${(v.valorBruto||0).toLocaleString("es-CO")}</td>
  </tr>`).join("")}
  <tr><td colspan="6"><strong>Subtotal</strong></td><td class="right"><strong>${(cuenta.totalBruto||0).toLocaleString("es-CO")}</strong></td></tr>
  ${cuenta.totalAnticipos > 0 ? `<tr><td colspan="6">(-) Anticipos recibidos</td><td class="right">${(cuenta.totalAnticipos||0).toLocaleString("es-CO")}</td></tr>` : ""}
  <tr><td colspan="6"><strong>TOTAL A PAGAR</strong></td><td class="right"><strong>${(cuenta.totalPagar||0).toLocaleString("es-CO")}</strong></td></tr>
</table>` : ""}

${p.banco ? `<p class="banco">Favor consignar a la cuenta <strong>${p.banco} - ${p.tipoCuenta || "Ahorros"} - ${p.numeroCuenta || ""}</strong>. A nombre de <strong>${p.titularCuenta || p.nombreCompleto || ""}</strong>.</p>` : ""}

<div class="firma">
  <p>Atentamente,</p>
  ${p.firmaUrl ? `<img src="${p.firmaUrl}" alt="Firma" class="firma-img" />` : ""}
  <div class="linea">
    <p><strong>${p.nombreCompleto || ""}</strong></p>
    <p><strong>${tipoDocLabel[p.tipoDoc] || "C.C."}</strong> ${p.numeroDoc || ""}</p>
    ${p.telefono ? `<p><strong>Tel:</strong> ${p.telefono}</p>` : ""}
  </div>
</div>

<div class="franja-navira franja-bottom"></div>

</body></html>`;
    return html;
  };

  const abrirCuenta = (cuenta) => {
    const html = generarHTML(cuenta);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // ── RENDER ──

  // MODO: SELECCIONAR EMPRESA
  if (modo === "seleccionar") {
    return (
      <div style={styles.pantalla}>
        <div style={styles.header}>
          <button style={styles.btnVolver} onClick={() => setModo("lista")}>
            <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          </button>
          <h1 style={styles.titulo}>Nueva cuenta de cobro</h1>
        </div>

        <div style={styles.contenido}>
          {!empresaSel ? (
            <>
              <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 14px"}}>
                Seleccione la empresa a la que le va a cobrar:
              </p>
              {pendientesPorEmpresa.length === 0 ? (
                <EstadoVacio
                  icono="cuentas"
                  titulo="No hay viajes pendientes de cobro"
                  sub="Todos los viajes están pagados o no tienen empresa asignada."
                />
              ) : (
                pendientesPorEmpresa.map(emp => (
                  <button key={emp.nombre} style={styles.empresaCard} onClick={() => {
                    setEmpresaSel(emp.nombre);
                    setViajesSel([...emp.viajes]);
                  }}>
                    <div>
                      <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0}}>{emp.nombre}</p>
                      <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0"}}>
                        {emp.viajes.length} viaje{emp.viajes.length !== 1 ? "s" : ""} pendiente{emp.viajes.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBlack, color:t.colors.blue}}>{fmt(emp.total)}</span>
                  </button>
                ))
              )}
            </>
          ) : (
            <>
              <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 6px"}}>
                Viajes pendientes con <strong style={{color:t.colors.textPrimary}}>{empresaSel}</strong>:
              </p>
              <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 14px"}}>
                Desmarque los que no quiera incluir en esta cuenta.
              </p>

              {pendientesPorEmpresa.find(e => e.nombre === empresaSel)?.viajes.map(v => {
                const incluido = viajesSel.some(s => s.firestoreId === v.firestoreId);
                return (
                  <button key={v.firestoreId} style={{...styles.viajeCheck, opacity: incluido ? 1 : 0.5}} onClick={() => {
                    if (incluido) setViajesSel(viajesSel.filter(s => s.firestoreId !== v.firestoreId));
                    else setViajesSel([...viajesSel, v]);
                  }}>
                    <div style={{width:"22px",height:"22px",borderRadius:"6px",border:`2px solid ${incluido ? t.colors.green : t.colors.border}`,background:incluido?t.colors.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {incluido && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                    <div style={{flex:1}}>
                      <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textPrimary, margin:0, fontWeight:t.fonts.weightSemibold}}>
                        {v.fecha} · {v.ruta}
                      </p>
                      <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0"}}>
                        {v.mani ? `Man. ${v.mani} · ` : ""}{v.placa}
                      </p>
                    </div>
                    <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary}}>{fmt(v.saldoFlete ?? v.vViaje ?? 0)}</span>
                  </button>
                );
              })}

              {/* Resumen */}
              <div style={{background:t.colors.bgSection, borderRadius:t.radius.md, padding:"12px", margin:"14px 0"}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
                  <span style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary}}>{viajesSel.length} viaje{viajesSel.length !== 1 ? "s" : ""} seleccionado{viajesSel.length !== 1 ? "s" : ""}</span>
                  <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBlack, color:t.colors.blue}}>{fmt(totalSel)}</span>
                </div>
                {totalAnticipos > 0 && (
                  <div style={{display:"flex", justifyContent:"space-between"}}>
                    <span style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary}}>Bruto {fmt(totalBruto)} · Anticipos {fmt(totalAnticipos)}</span>
                  </div>
                )}
              </div>

              {empresaSel && !buscarNitEmpresa(empresaSel) && (
                <div style={{padding:"10px 12px", background:"#FEF3C7", border:"1.5px solid #F59E0B33", borderRadius:t.radius.sm, marginBottom:"12px", display:"flex", alignItems:"flex-start", gap:"8px"}}>
                  <span style={{fontSize:"14px"}}>⚠️</span>
                  <p style={{fontSize:t.fonts.sizeXs, color:"#92400E", margin:0, lineHeight:1.4}}>
                    <strong>{empresaSel}</strong> no tiene NIT registrado. La cuenta saldrá sin NIT. Agréguelo en <strong>Empresas</strong> para que aparezca.
                  </p>
                </div>
              )}

              <button
                style={{...styles.btnPrimario, opacity: viajesSel.length === 0 ? 0.5 : 1}}
                disabled={viajesSel.length === 0}
                onClick={() => { setConcepto(plantillas[0]); setModo("concepto"); }}
              >
                Continuar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // MODO: CONCEPTO
  if (modo === "concepto") {
    return (
      <div style={styles.pantalla}>
        <div style={styles.header}>
          <button style={styles.btnVolver} onClick={() => setModo("seleccionar")}>
            <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          </button>
          <h1 style={styles.titulo}>Concepto</h1>
        </div>

        <div style={styles.contenido}>
          <p style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 14px"}}>
            Describa el concepto de la cuenta de cobro a <strong style={{color:t.colors.textPrimary}}>{empresaSel}</strong>:
          </p>

          {/* Plantillas */}
          <div style={{marginBottom:"14px"}}>
            {plantillas.map((p, i) => (
              <button key={i} style={{...styles.plantilla, border: concepto === p ? `1.5px solid ${t.colors.blueBorder}` : `1.5px solid ${t.colors.border}`, background: concepto === p ? `${t.colors.blue}11` : t.colors.bgSection}}
                onClick={() => setConcepto(p)}
              >
                <span style={{fontSize:t.fonts.sizeXs, color: concepto === p ? t.colors.blue : t.colors.textSecondary}}>{p}</span>
              </button>
            ))}
          </div>

          <textarea
            value={concepto}
            onChange={e => setConcepto(e.target.value)}
            placeholder="O escriba su propio concepto..."
            rows={3}
            style={{...styles.inputPerfil, resize:"vertical", fontFamily:"inherit"}}
          />

          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", margin:"16px 0 10px", padding:"12px", background:t.colors.bgSection, borderRadius:t.radius.md}}>
            <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>Total a cobrar:</span>
            <span style={{fontSize:"22px", fontWeight:t.fonts.weightBlack, color:t.colors.green}}>{fmt(totalSel)}</span>
          </div>

          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 16px", textAlign:"center"}}>
            {numeroALetras(totalSel)}
          </p>

          <button
            style={{...styles.btnPrimario, opacity: !concepto.trim() ? 0.5 : 1}}
            disabled={!concepto.trim() || guardando}
            onClick={guardarCuenta}
          >
            {guardando ? <><span className="navira-spinner" /> Generando...</> : "Generar cuenta de cobro"}
          </button>
        </div>
      </div>
    );
  }

  // MODO: LISTA (pantalla principal)
  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
        </button>
        <h1 style={styles.titulo}>Cuentas de cobro</h1>
      </div>

      <div style={styles.contenido}>

        {/* Perfil incompleto */}
        {!perfilOk && (
          <div style={{padding:"10px 14px", background:"#FEF3C7", border:"1.5px solid #F59E0B33", borderRadius:t.radius.sm, marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px", cursor:"pointer"}}
            onClick={() => navigate("/configuracion")}
          >
            <span style={{fontSize:"16px"}}>⚠️</span>
            <p style={{fontSize:t.fonts.sizeXs, color:"#92400E", margin:0}}>
              Complete sus datos de facturación en <strong>Configuración</strong> antes de generar cuentas.
            </p>
          </div>
        )}

        {/* Botón nueva cuenta */}
        <button
          style={{...styles.btnPrimario, opacity: !perfilOk ? 0.5 : 1, marginBottom:"16px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px"}}
          disabled={!perfilOk}
          onClick={() => setModo("seleccionar")}
        >
          <Plus size={18} strokeWidth={2.5} />
          Nueva cuenta de cobro
        </button>

        {/* Lista de cuentas emitidas */}
        {cuentasCobro.length === 0 ? (
          <EstadoVacio
            icono="cuentas"
            titulo="Sin cuentas de cobro"
            sub="Genere su primera cuenta de cobro seleccionando una empresa con viajes pendientes."
          />
        ) : (
          cuentasCobro.map(c => (
            <div key={c.firestoreId} style={styles.cuentaCard}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px"}}>
                <div>
                  <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0}}>
                    N° {String(c.numero).padStart(3, "0")} · {c.cliente?.nombre || "—"}
                  </p>
                  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0"}}>
                    {c.fecha} · {c.viajes?.length || 0} viaje{(c.viajes?.length || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBlack, color:t.colors.blue, margin:0}}>
                    {fmt(c.totalPagar)}
                  </p>
                  <span style={{
                    fontSize:"10px", fontWeight:t.fonts.weightBold, textTransform:"uppercase",
                    color: c.estado === "pagada" ? t.colors.green : c.estado === "anulada" ? t.colors.red : t.colors.amber || "#F59E0B",
                  }}>
                    {c.estado}
                  </span>
                </div>
              </div>
              <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"0 0 10px", lineHeight:1.4}}>
                {c.concepto?.substring(0, 80)}{c.concepto?.length > 80 ? "..." : ""}
              </p>
              <div style={{display:"flex", gap:"8px"}}>
                <button style={styles.btnAccion} onClick={() => abrirCuenta(c)}>
                  <Eye size={14} strokeWidth={2} /> Ver / Imprimir
                </button>
                {c.estado === "emitida" && (
                  <button style={{...styles.btnAccion, background:t.colors.greenSoft, borderColor:t.colors.greenBorder, color:t.colors.green}}
                    onClick={async () => {
                      try {
                        await onEditarCuenta(c.firestoreId, { estado: "pagada", fechaPago: new Date().toISOString().slice(0,10) });
                        mostrarToast("Cuenta marcada como pagada", "exito");
                      } catch(err) { mostrarToast("Error", "error"); }
                    }}
                  >
                    <Check size={14} strokeWidth={2} /> Pagada
                  </button>
                )}
                <button style={{...styles.btnAccion, background:t.colors.redSoft, borderColor:t.colors.redBorder, color:t.colors.red}}
                  onClick={async () => {
                    if (!window.confirm(`¿Eliminar la cuenta N° ${String(c.numero).padStart(3,"0")}?`)) return;
                    try {
                      await onEliminarCuenta(c.firestoreId);
                      mostrarToast("Cuenta eliminada", "info");
                    } catch(err) { mostrarToast("Error al eliminar", "error"); }
                  }}
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  pantalla:    { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:      { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:   { display:"flex", alignItems:"center", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0 },
  titulo:      { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:   { padding:"16px" },
  btnPrimario: { width:"100%", padding:"14px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer" },
  empresaCard: { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px", background:t.colors.bgCard, borderRadius:t.radius.md, border:`1.5px solid ${t.colors.border}`, cursor:"pointer", marginBottom:"8px", textAlign:"left" },
  viajeCheck:  { width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:t.colors.bgCard, borderRadius:t.radius.sm, border:`1px solid ${t.colors.borderLight}`, cursor:"pointer", marginBottom:"6px", textAlign:"left" },
  plantilla:   { width:"100%", padding:"10px 12px", borderRadius:t.radius.sm, cursor:"pointer", marginBottom:"6px", textAlign:"left" },
  inputPerfil: { width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, background:t.colors.bgPrimary, color:t.colors.textPrimary, fontSize:t.fonts.sizeSm, outline:"none" },
  cuentaCard:  { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"14px", marginBottom:"10px", boxShadow:t.shadows.card },
  btnAccion:   { display:"flex", alignItems:"center", gap:"4px", padding:"8px 12px", background:t.colors.bgSection, border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, cursor:"pointer" },
};

export default Cobros;