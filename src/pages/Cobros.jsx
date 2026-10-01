/**
 * Hecho por JESUS COSSIO DEV
 * Cuentas de Cobro y Facturación Guiada
 * Flujo Wizard en fondo claro para transportadores de 30 a 70 años.
 */
import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Check, Eye, Trash2, CheckCircle2 } from "lucide-react";
import { theme as t } from "../styles/theme";
import EstadoVacio from "../components/EstadoVacio";
import ConfirmarModal from "../components/ConfirmarModal";
import {
  WizardPantalla,
  WizardHeader,
  WizardProgress,
  WizardBanner,
  WizardCampo,
  WizardNav
} from "../components/WizardForm";

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
  const guardandoRef = useRef(false);
  const navigate = useNavigate();

  // Estados del flujo de creación guiada
  const [modoCreacion, setModoCreacion] = useState(false);
  const [pasoWizard, setPasoWizard] = useState(1); // 1: Empresa, 2: Viajes, 3: Concepto
  const [empresaSel, setEmpresaSel] = useState(null);
  const [viajesSel, setViajesSel] = useState([]);
  const [concepto, setConcepto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cuentaAEliminar, setCuentaAEliminar] = useState(null);

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

  const buscarNitEmpresa = (nombreEmp) => {
    if (!nombreEmp) return "";
    const norm = nombreEmp.trim().toLowerCase();
    const emp = empresas.find(e =>
      (e.razonSocial || e.nombre || "").trim().toLowerCase() === norm
    );
    return emp?.nit || "";
  };

  const totalSel = viajesSel.reduce((s, v) => s + (v.saldoFlete ?? v.vViaje ?? 0), 0);
  const totalAnticipos = viajesSel.reduce((s, v) => s + (v.anticipoFleteMonto || 0), 0);
  const totalBruto = viajesSel.reduce((s, v) => s + (v.vViaje || 0), 0);

  const hoy = new Date();
  const mesActual = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][hoy.getMonth()];
  const anio = hoy.getFullYear();
  const manifiestos = viajesSel.map(v => v.mani).filter(Boolean).join(", ");

  const plantillas = [
    `Servicio de transporte de carga durante el mes de ${mesActual} de ${anio}`,
    manifiestos ? `Fletes de ${mesActual} ${anio}, según manifiestos ${manifiestos}` : `Fletes de ${mesActual} ${anio}`,
    `Transporte de carga según relación adjunta`,
  ];

  const ultimoNum = cuentasCobro.reduce((max, c) => Math.max(max, c.numero || 0), 0);

  const reiniciarCreacion = () => {
    setModoCreacion(false);
    setPasoWizard(1);
    setEmpresaSel(null);
    setViajesSel([]);
    setConcepto("");
  };

  const guardarCuenta = async () => {
    if (guardandoRef.current || guardando) return;
    if (!concepto.trim()) {
      if (mostrarToast) mostrarToast("Escribe el concepto de la cuenta", "error");
      return;
    }
    guardandoRef.current = true;
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
      if (mostrarToast) mostrarToast(`✓ Cuenta de cobro N° ${String(numero).padStart(3, "0")} generada`, "exito");
      reiniciarCreacion();
    } catch {
      if (mostrarToast) mostrarToast("Error al guardar la cuenta", "error");
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  const esc = (t) => String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const generarHTML = (cuenta) => {
    const p = cuenta.emisor || perfilFacturacion;
    const tipoDocLabel = { CC: "C.C.", CE: "C.E.", NIT: "NIT", CX: "C.E.", DE: "Doc. Ext.", PA: "Pasaporte", RC: "R.C.", TI: "T.I." };
    const sanitizeImgUrl = (url) => {
      if (!url) return "";
      if (url.startsWith("https://") || url.startsWith("data:image/")) return url;
      return "";
    };
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cuenta de Cobro N° ${esc(String(cuenta.numero).padStart(3,"0"))}</title>
<style>
  @page { margin: 2cm; }
  body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #333; font-size: 14px; line-height: 1.6; }
  .franja-navira { height: 4px; background: linear-gradient(90deg, #1565FF 0%, #22C55E 100%); border-radius: 2px; }
  .franja-top { margin: 0 0 24px; }
  .franja-bottom { margin: 28px 0 0; opacity: 0.85; }
  h2 { text-align: center; margin: 30px 0 5px; font-size: 16px; }
  .fecha { margin-bottom: 30px; text-align: right; }
  .centro { text-align: center; margin: 20px 0; }
  .concepto { margin: 25px 0; }
  .banco { margin: 25px 0; padding: 14px 16px; background: #F0F5FF; border-left: 4px solid #1565FF; border-radius: 4px; font-size: 14px; color: #0A1A2F; }
  .firma { margin-top: 60px; }
  .firma-img { display: block; max-height: 90px; max-width: 250px; margin-bottom: -20px; margin-top: 10px; }
  .linea { border-top: 1px solid #333; width: 250px; margin-top: 40px; padding-top: 5px; }
  .detalle { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
  .detalle th, .detalle td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  .detalle th { background: #F0F5FF; text-align: center; color: #0A1A2F; }
  .right { text-align: right; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="franja-navira franja-top"></div>
<p class="fecha">${esc(cuenta.ciudad || p.ciudad || "Colombia")}, ${new Date(cuenta.fecha).getDate()} de ${["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][new Date(cuenta.fecha).getMonth()]} de ${new Date(cuenta.fecha).getFullYear()}</p>
<h2>CUENTA DE COBRO N° ${esc(String(cuenta.numero).padStart(3, "0"))}</h2>
<div class="centro">
  <p><strong>A QUIEN VA DIRIGIDA LA CUENTA DE COBRO:</strong></p>
  <p><strong>${esc(cuenta.cliente?.nombre || "")}</strong></p>
  <p>${cuenta.cliente?.nit ? esc((tipoDocLabel["NIT"] || "NIT") + " " + cuenta.cliente.nit) : ""}</p>
</div>
<div class="centro">
  <p>DEBE A:</p>
  <p><strong>${esc(p.nombreCompleto || "")}</strong></p>
  <p>${esc(tipoDocLabel[p.tipoDoc] || "C.C.")} ${esc(p.numeroDoc || "")}</p>
</div>
<div class="concepto">
  <p>La suma de <strong>${cuenta.totalPagar?.toLocaleString("es-CO")} PESOS (${esc(cuenta.valorEnLetras || "")})</strong>,
  por concepto de <strong>${esc(cuenta.concepto || "")}</strong>.</p>
</div>
${cuenta.viajes && cuenta.viajes.length > 0 ? `
<table class="detalle">
  <tr><th>Fecha</th><th>Manifiesto</th><th>Ruta</th><th>Placa</th><th>Ton</th><th class="right">Valor</th></tr>
  ${cuenta.viajes.map(v => `<tr>
    <td>${esc(v.fecha || "")}</td>
    <td>${esc(v.manifiesto || "")}</td>
    <td>${esc(v.ruta || "")}</td>
    <td>${esc(v.placa || "")}</td>
    <td>${esc(v.tonelaje || "")}</td>
    <td class="right">${(v.valorBruto||0).toLocaleString("es-CO")}</td>
  </tr>`).join("")}
  <tr><td colspan="5"><strong>Subtotal</strong></td><td class="right"><strong>${(cuenta.totalBruto||0).toLocaleString("es-CO")}</strong></td></tr>
  ${cuenta.totalAnticipos > 0 ? `<tr><td colspan="5">(-) Anticipos recibidos</td><td class="right">${(cuenta.totalAnticipos||0).toLocaleString("es-CO")}</td></tr>` : ""}
  <tr><td colspan="5"><strong>TOTAL A PAGAR</strong></td><td class="right"><strong>${(cuenta.totalPagar||0).toLocaleString("es-CO")}</strong></td></tr>
</table>` : ""}
${p.banco ? `<p class="banco">Favor consignar a la cuenta <strong>${esc(p.banco)} - ${esc(p.tipoCuenta || "Ahorros")} - ${esc(p.numeroCuenta || "")}</strong>. A nombre de <strong>${esc(p.titularCuenta || p.nombreCompleto || "")}</strong>.</p>` : ""}
<div class="firma">
  <p>Atentamente,</p>
  ${p.firmaUrl && sanitizeImgUrl(p.firmaUrl) ? `<img src="${sanitizeImgUrl(p.firmaUrl)}" alt="Firma" class="firma-img" />` : ""}
  <div class="linea">
    <p><strong>${esc(p.nombreCompleto || "")}</strong></p>
    <p><strong>${esc(tipoDocLabel[p.tipoDoc] || "C.C.")}</strong> ${esc(p.numeroDoc || "")}</p>
    ${p.telefono ? `<p><strong>Tel:</strong> ${esc(p.telefono)}</p>` : ""}
  </div>
</div>
<div class="franja-navira franja-bottom"></div>
</body></html>`;
  };

  const abrirCuenta = (cuenta) => {
    const html = generarHTML(cuenta);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const ETIQUETAS_WIZARD = [
    "Empresa a cobrar",
    "Selección de viajes",
    "Concepto y generación"
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: ASISTENTE WIZARD GUIADO PARA GENERAR CUENTA DE COBRO
  // ══════════════════════════════════════════════════════════════════════════
  if (modoCreacion) {
    return (
      <WizardPantalla>
        <WizardHeader
          titulo="Nueva Cuenta de Cobro"
          onVolver={() => pasoWizard > 1 ? setPasoWizard(p => p - 1) : reiniciarCreacion()}
          labelVolver={pasoWizard > 1 ? "Atrás" : "Cancelar"}
        />

        <WizardProgress total={3} actual={pasoWizard} etiquetas={ETIQUETAS_WIZARD} />

        {/* ── PASO 1: SELECCIONAR EMPRESA ── */}
        {pasoWizard === 1 && (
          <>
            <WizardBanner
              icono="🏢"
              titulo="¿A qué empresa le vas a cobrar?"
              mensaje="Elige la empresa o cliente que tiene viajes pendientes de pago."
            />
            <div style={stylesWz.cardWrapper}>
              {pendientesPorEmpresa.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 16px", background: "#FFFFFF", borderRadius: "16px", border: "1.5px solid #D1DCF0" }}>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
                    No hay viajes pendientes de cobro
                  </p>
                  <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 16px" }}>
                    Todos tus viajes están pagados o aún no tienen empresa asignada.
                  </p>
                  <button
                    type="button"
                    onClick={reiniciarCreacion}
                    style={{ padding: "12px 20px", background: "#3B82F6", color: "#FFFFFF", borderRadius: "12px", border: "none", fontWeight: 700, cursor: "pointer" }}
                  >
                    Volver a Cuentas
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pendientesPorEmpresa.map(emp => {
                    const esSel = empresaSel === emp.nombre;
                    return (
                      <button
                        key={emp.nombre}
                        type="button"
                        onClick={() => {
                          setEmpresaSel(emp.nombre);
                          setViajesSel([...emp.viajes]);
                          setPasoWizard(2);
                        }}
                        style={{
                          width: "100%", textAlign: "left", padding: "16px",
                          borderRadius: "16px",
                          border: esSel ? "2px solid #3B82F6" : "1.5px solid #D1DCF0",
                          background: esSel ? "#EFF6FF" : "#FFFFFF",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                          cursor: "pointer",
                          display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}
                      >
                        <div>
                          <p style={{ fontSize: "17px", fontWeight: 800, color: "#111827", margin: "0 0 3px" }}>
                            {emp.nombre}
                          </p>
                          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                            {emp.viajes.length} viaje{emp.viajes.length !== 1 ? "s" : ""} pendiente{emp.viajes.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "17px", fontWeight: 900, color: "#2563EB", display: "block" }}>
                            {fmt(emp.total)}
                          </span>
                          <span style={{ fontSize: "12px", color: "#3B82F6", fontWeight: 700 }}>
                            Cobrar →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PASO 2: SELECCIONAR VIAJES ── */}
        {pasoWizard === 2 && (
          <>
            <WizardBanner
              icono="🚛"
              titulo={`Viajes con ${empresaSel}`}
              mensaje="Marca o desmarca los viajes que deseas incluir en esta cuenta de cobro."
            />
            <div style={stylesWz.cardWrapper}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {pendientesPorEmpresa.find(e => e.nombre === empresaSel)?.viajes.map(v => {
                  const incluido = viajesSel.some(s => s.firestoreId === v.firestoreId);
                  return (
                    <button
                      key={v.firestoreId}
                      type="button"
                      onClick={() => {
                        if (incluido) setViajesSel(viajesSel.filter(s => s.firestoreId !== v.firestoreId));
                        else setViajesSel([...viajesSel, v]);
                      }}
                      style={{
                        width: "100%", textAlign: "left", padding: "14px",
                        borderRadius: "14px",
                        border: incluido ? "2px solid #10B981" : "1.5px solid #D1DCF0",
                        background: incluido ? "#ECFDF5" : "#FFFFFF",
                        display: "flex", alignItems: "center", gap: "12px",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "8px",
                        border: `2px solid ${incluido ? "#10B981" : "#9CA3AF"}`,
                        background: incluido ? "#10B981" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {incluido && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>
                          {v.ruta || "Ruta sin especificar"}
                        </p>
                        <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0 0" }}>
                          {v.fecha} {v.mani ? `· Man. ${v.mani}` : ""} {v.placa ? `· ${v.placa}` : ""}
                        </p>
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                        {fmt(v.saldoFlete ?? v.vViaje ?? 0)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tarjeta de Resumen */}
              <div style={{
                background: "#F8FAFF", border: "1.5px solid #D1DCF0", borderRadius: "16px",
                padding: "16px", marginBottom: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#4B5563" }}>
                    {viajesSel.length} viaje{viajesSel.length !== 1 ? "s" : ""} seleccionado{viajesSel.length !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: "22px", fontWeight: 900, color: "#2563EB" }}>
                    {fmt(totalSel)}
                  </span>
                </div>
                {totalAnticipos > 0 && (
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0" }}>
                    Valor bruto: {fmt(totalBruto)} · Anticipos recibidos: {fmt(totalAnticipos)}
                  </p>
                )}
              </div>

              {empresaSel && !buscarNitEmpresa(empresaSel) && (
                <div style={{ padding: "12px 14px", background: "#FEF3C7", border: "1.5px solid #FDE68A", borderRadius: "12px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "13px", color: "#92400E", margin: 0, lineHeight: 1.4 }}>
                    ⚠️ <strong>{empresaSel}</strong> no tiene NIT registrado. La cuenta se generará sin NIT.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PASO 3: CONCEPTO Y EMISIÓN ── */}
        {pasoWizard === 3 && (
          <>
            <WizardBanner
              icono="📝"
              titulo="Concepto de la cuenta de cobro"
              mensaje="Elige una frase rápida o escribe la descripción del servicio prestado."
            />
            <div style={stylesWz.cardWrapper}>
              <WizardCampo label="Plantillas rápidas de concepto">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {plantillas.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setConcepto(p)}
                      style={{
                        textAlign: "left", padding: "12px 14px", borderRadius: "12px",
                        border: concepto === p ? "2px solid #3B82F6" : "1.5px solid #D1DCF0",
                        background: concepto === p ? "#EFF6FF" : "#FFFFFF",
                        color: concepto === p ? "#1D4ED8" : "#374151",
                        fontSize: "14px", fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </WizardCampo>

              <WizardCampo label="O edita el texto del concepto" obligatorio>
                <textarea
                  value={concepto}
                  onChange={e => setConcepto(e.target.value)}
                  placeholder="Escribe el concepto..."
                  rows={3}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "14px",
                    borderRadius: "12px", border: "1.5px solid #D1DCF0",
                    background: "#FFFFFF", color: "#111827", fontSize: "15px",
                    fontFamily: "inherit", resize: "vertical", outline: "none"
                  }}
                />
              </WizardCampo>

              {/* Total Final Destacado */}
              <div style={{
                background: "#ECFDF5", border: "2px solid #A7F3D0", borderRadius: "16px",
                padding: "18px", textAlign: "center", margin: "16px 0"
              }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#065F46", textTransform: "uppercase", margin: "0 0 2px" }}>
                  Total a Cobrar
                </p>
                <p style={{ fontSize: "32px", fontWeight: 900, color: "#059669", margin: "0 0 4px" }}>
                  {fmt(totalSel)}
                </p>
                <p style={{ fontSize: "12px", color: "#047857", margin: 0, fontStyle: "italic" }}>
                  {numeroALetras(totalSel)}
                </p>
              </div>

              <button
                type="button"
                onClick={guardarCuenta}
                disabled={!concepto.trim() || guardando}
                style={{
                  width: "100%", padding: "16px", borderRadius: "14px",
                  background: "#10B981", color: "#FFFFFF", border: "none",
                  fontSize: "17px", fontWeight: 800, cursor: "pointer",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
                }}
              >
                <CheckCircle2 size={20} />
                {guardando ? "Generando cuenta de cobro..." : "Emitir Cuenta de Cobro"}
              </button>
            </div>
          </>
        )}

        {/* Navegación inferior */}
        {pasoWizard < 3 && (
          <WizardNav
            pasoActual={pasoWizard}
            totalPasos={3}
            onAtras={() => setPasoWizard(p => p - 1)}
            onSiguiente={() => {
              if (pasoWizard === 2 && !concepto) setConcepto(plantillas[0]);
              setPasoWizard(p => p + 1);
            }}
            deshabilitarSiguiente={pasoWizard === 1 ? !empresaSel : viajesSel.length === 0}
            labelSiguiente="Siguiente →"
          />
        )}
      </WizardPantalla>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: LISTA DE CUENTAS DE COBRO EMITIDAS
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button type="button" aria-label="Volver" style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Cuentas de Cobro</h1>
      </div>

      <div style={styles.contenido}>
        {/* Aviso de perfil incompleto */}
        {!perfilOk && (
          <button
            type="button"
            style={{
              padding: "14px 16px", background: "#FEF3C7", border: "1.5px solid #FDE68A",
              borderRadius: "14px", marginBottom: "16px", display: "flex", alignItems: "center",
              gap: "10px", cursor: "pointer", width: "100%", textAlign: "left", font: "inherit"
            }}
            onClick={() => navigate("/configuracion")}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#92400E", margin: "0 0 2px" }}>
                Datos de facturación incompletos
              </p>
              <p style={{ fontSize: "12px", color: "#B45309", margin: 0 }}>
                Toca aquí para configurar tu nombre, documento y cuenta bancaria.
              </p>
            </div>
          </button>
        )}

        {/* Botón Principal Nueva Cuenta */}
        <button
          type="button"
          style={{
            ...styles.btnPrimario,
            opacity: !perfilOk ? 0.5 : 1,
            marginBottom: "16px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}
          disabled={!perfilOk}
          onClick={() => {
            setModoCreacion(true);
            setPasoWizard(1);
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          Generar nueva cuenta de cobro
        </button>

        {/* Lista de Cuentas */}
        {cuentasCobro.length === 0 ? (
          <EstadoVacio
            icono="cuentas"
            titulo="Sin cuentas de cobro generadas"
            sub="Genera tu primera cuenta de cobro seleccionando una empresa con viajes pendientes."
          />
        ) : (
          cuentasCobro.map(c => (
            <div key={c.firestoreId} style={styles.cuentaCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 800, color: t.colors.textPrimary, margin: 0 }}>
                    N° {String(c.numero).padStart(3, "0")} · {c.cliente?.nombre || "Empresa"}
                  </p>
                  <p style={{ fontSize: "13px", color: t.colors.textTertiary, margin: "2px 0 0" }}>
                    {c.fecha} · {c.viajes?.length || 0} viaje{(c.viajes?.length || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "17px", fontWeight: 900, color: t.colors.blue, margin: 0 }}>
                    {fmt(c.totalPagar)}
                  </p>
                  <span style={{
                    fontSize: "11px", fontWeight: 800, textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: "6px",
                    background: c.estado === "pagada" ? "#D1FAE5" : c.estado === "anulada" ? "#FEE2E2" : "#FEF3C7",
                    color: c.estado === "pagada" ? "#059669" : c.estado === "anulada" ? "#DC2626" : "#D97706",
                    display: "inline-block", marginTop: "4px"
                  }}>
                    {c.estado}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "13px", color: t.colors.textSecondary, margin: "0 0 12px", lineHeight: 1.4 }}>
                {c.concepto?.substring(0, 85)}{c.concepto?.length > 85 ? "..." : ""}
              </p>

              {/* Botones de Acción */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  style={styles.btnAccion}
                  onClick={() => abrirCuenta(c)}
                >
                  <Eye size={16} strokeWidth={2} />
                  <span>Ver / Imprimir</span>
                </button>

                {c.estado === "emitida" && (
                  <button
                    type="button"
                    style={{
                      ...styles.btnAccion,
                      background: t.colors.greenSoft,
                      borderColor: t.colors.greenBorder,
                      color: t.colors.green
                    }}
                    onClick={async () => {
                      try {
                        await onEditarCuenta(c.firestoreId, { estado: "pagada", fechaPago: new Date().toISOString().slice(0, 10) });
                        if (mostrarToast) mostrarToast("Cuenta marcada como pagada", "exito");
                      } catch {
                        if (mostrarToast) mostrarToast("Error al actualizar estado", "error");
                      }
                    }}
                  >
                    <Check size={16} strokeWidth={2} />
                    <span>Pagada</span>
                  </button>
                )}

                <button
                  type="button"
                  aria-label={`Eliminar cuenta N° ${String(c.numero).padStart(3, "0")}`}
                  style={{
                    ...styles.btnAccion,
                    background: t.colors.redSoft,
                    borderColor: t.colors.redBorder,
                    color: t.colors.red,
                    padding: "10px"
                  }}
                  onClick={() => setCuentaAEliminar(c)}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal accesible de confirmación para eliminar */}
      <ConfirmarModal
        visible={Boolean(cuentaAEliminar)}
        titulo="¿Eliminar cuenta de cobro?"
        mensaje={cuentaAEliminar ? `Estás a punto de eliminar la cuenta N° ${String(cuentaAEliminar.numero).padStart(3, "0")}. Esta acción no se puede deshacer.` : ""}
        textoBotonConfirmar="Eliminar cuenta"
        esPeligroso={true}
        onCancelar={() => setCuentaAEliminar(null)}
        onConfirmar={async () => {
          if (!cuentaAEliminar) return;
          const id = cuentaAEliminar.firestoreId;
          setCuentaAEliminar(null);
          try {
            await onEliminarCuenta(id);
            if (mostrarToast) mostrarToast("Cuenta eliminada", "info");
          } catch {
            if (mostrarToast) mostrarToast("Error al eliminar cuenta", "error");
          }
        }}
      />
    </div>
  );
}

const stylesWz = {
  cardWrapper: {
    padding: "0 20px 20px",
  }
};

const styles = {
  pantalla:    { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:      { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:   { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blue, cursor: "pointer", padding: 0, fontSize: "15px", fontWeight: 700 },
  titulo:      { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  contenido:   { padding: "16px" },
  btnPrimario: { width: "100%", padding: "16px", background: "#3B82F6", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" },
  cuentaCard:  { background: t.colors.bgCard, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: t.shadows.card, border: `1px solid ${t.colors.borderLight}` },
  btnAccion:   { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 14px", background: t.colors.bgSection, border: `1px solid ${t.colors.border}`, borderRadius: "10px", fontSize: "14px", fontWeight: 700, color: t.colors.textPrimary, cursor: "pointer", minHeight: "42px" },
};

export default Cobros;