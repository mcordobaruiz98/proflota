/**
 * NAVIRA — Bot de Telegram v2: registro completo de viajes
 * Flujo guiado con preguntas agrupadas, campos saltables ("no"),
 * memoria de flota/rutas, retorno, gastos, descuentos y anticipo.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const TOKEN = process.env.TELEGRAM_TOKEN;
const API = () => `https://api.telegram.org/bot${TOKEN}`;

// ── Utilidades ──────────────────────────────────────────────

async function enviar(chatId, texto) {
  await fetch(`${API()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: "HTML" }),
  });
}

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");
const esNo = (t) => ["no", "-", "n", "ninguno", "nada"].includes(t.toLowerCase());

function hoyLocal(offsetDias = 0) {
  const d = new Date(Date.now() - 5 * 3600e3 + offsetDias * 86400e3);
  return d.toISOString().slice(0, 10);
}

function parsearFecha(texto) {
  const t = texto.trim().toLowerCase();
  if (t === "hoy") return hoyLocal(0);
  if (t === "ayer") return hoyLocal(-1);
  if (t === "mañana" || t === "manana") return hoyLocal(1);
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (m) return `${new Date().getFullYear()}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

function parsearNumero(texto) {
  let t = String(texto).trim().toLowerCase().replace(/\$/g, "").replace(/\s/g, "");
  if (t.endsWith("mil")) {
    const base = parsearNumero(t.slice(0, -3));
    return base === null ? null : base * 1000;
  }
  // Coma = decimal (formato colombiano): "33,2" → 33.2 ; "1.141,5" → 1141.5
  if (t.includes(",")) {
    const n = parseFloat(t.replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? null : n;
  }
  // Solo puntos: distinguir decimal de miles
  const partes = t.split(".");
  if (partes.length === 2 && partes[1].length <= 2) {
    // "33.2" o "33.25" → decimal
    const n = parseFloat(t);
    return isNaN(n) ? null : n;
  }
  // "141.000", "1.500.000" → separador de miles
  const n = parseFloat(t.replace(/\./g, ""));
  return isNaN(n) ? null : n;
}

// "380 y 60" / "200000 y 50000" / "380,60" / "380 60"
function parsearDosNumeros(texto) {
  const m = texto.match(/([\d.,]+\s*(?:mil)?)\s*(?:y|,|;|\s)\s*([\d.,]+\s*(?:mil)?)/i);
  if (!m) return null;
  const a = parsearNumero(m[1]);
  const b = parsearNumero(m[2]);
  if (a === null || b === null) return null;
  return [a, b];
}

// "34 a 141000" / "34 a 141 mil" / "34 x 141000"
function parsearTonFlete(texto) {
  const m = texto.match(/([\d.,]+)\s*(?:a|x|por)\s*([\d.,]+\s*(?:mil)?)/i);
  if (!m) return null;
  const ton = parsearNumero(m[1]);
  const flete = parsearNumero(m[2]);
  if (!ton || !flete) return null;
  return { ton, flete };
}

// Peajes con nombre y tarifa: "La Línea 45000 iv, Cocorná 38000, Puerto Triunfo 42 mil"
// Cada peaje: nombre + tarifa + opcional "iv" (ida y vuelta = tarifa x2)
function parsearPeajesDetalle(texto) {
  const segmentos = texto.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  const detalle = [];
  for (const seg of segmentos) {
    const esIV = /\biv\b|\bida\s*y\s*vuelta\b|\bx2\b/i.test(seg);
    const limpio = seg.replace(/\biv\b|\bida\s*y\s*vuelta\b|\bx2\b/gi, "").trim();
    const m = limpio.match(/^(.+?)\s+([\d.,]+\s*(?:mil)?)$/i);
    if (!m) return null; // un segmento no parseable invalida el formato de lista
    const nombre = m[1].trim();
    const tarifa = parsearNumero(m[2]);
    if (!nombre || tarifa === null) return null;
    detalle.push({ n: nombre, d: "", tarifa, iv: esIV, total: tarifa * (esIV ? 2 : 1) });
  }
  return detalle.length > 0 ? detalle : null;
}

// ── Sesiones ────────────────────────────────────────────────

async function getSesion(chatId) {
  const snap = await db.doc(`telegram_sesiones/${chatId}`).get();
  return snap.exists ? snap.data() : null;
}
async function setSesion(chatId, datos) {
  await db.doc(`telegram_sesiones/${chatId}`).set(datos, { merge: true });
}
async function resetViaje(chatId) {
  await db.doc(`telegram_sesiones/${chatId}`).set({ paso: null, viaje: {} }, { merge: true });
}

// ── Memoria ─────────────────────────────────────────────────

async function buscarVehiculo(uid, placaTexto) {
  const placa = placaTexto.trim().toUpperCase().replace(/[\s\-]/g, "");
  const snap = await db.collection(`usuarios/${uid}/vehiculos`).get();
  for (const d of snap.docs) {
    const v = d.data();
    if ((v.placa || "").toUpperCase().replace(/[\s\-]/g, "") === placa) {
      return { firestoreId: d.id, ...v };
    }
  }
  return null;
}

async function buscarMemoriaRuta(uid, rutaTexto) {
  const norm = rutaTexto.trim().toLowerCase();
  const rutasSnap = await db.collection(`usuarios/${uid}/rutas`).get();
  for (const d of rutasSnap.docs) {
    const r = d.data();
    if ((r.nombre || r.ruta || "").trim().toLowerCase() === norm) return { tipo: "frecuente", ...r };
  }
  const viajesSnap = await db.collection(`usuarios/${uid}/viajes`).orderBy("fecha", "desc").limit(200).get();
  for (const d of viajesSnap.docs) {
    const v = d.data();
    if ((v.ruta || "").trim().toLowerCase() === norm) return { tipo: "historial", ...v };
  }
  return null;
}

// Busca el NIT de una empresa en el directorio. Devuelve {nit, existe}.
async function buscarEmpresa(uid, nombreEmp) {
  const norm = (nombreEmp || "").trim().toLowerCase();
  if (!norm) return { nit: "", existe: false };
  const snap = await db.collection(`usuarios/${uid}/empresas`).get();
  for (const d of snap.docs) {
    const e = d.data();
    if ((e.razonSocial || e.nombre || "").trim().toLowerCase() === norm) {
      return { nit: e.nit || "", existe: true };
    }
  }
  return { nit: "", existe: false };
}

// Registra una empresa nueva en el directorio invisible (con NIT)
async function registrarEmpresa(uid, nombre, nit) {
  if (!nombre.trim() || !nit.trim()) return;
  await db.collection(`usuarios/${uid}/empresas`).add({
    razonSocial: nombre.trim(),
    nit: nit.trim(),
    tipo: "cliente",
    ciudad: "", contacto: "", telefono: "", correo: "",
    origenRegistro: "telegram",
    creadoEn: new Date().toISOString(),
  });
}

// ── Cálculo ─────────────────────────────────────────────────

function calcular(v) {
  const kmCargado = (v.kmCargado || 0) + (v.kmCargadoRet || 0);
  const kmVacio = (v.kmVacio || 0) + (v.kmVacioRet || 0);
  const kmT = kmCargado + kmVacio;

  const vIda = (v.ton || 0) * (v.fleteTon || 0);
  const vRet = v.tieneRetorno
    ? (v.fleteRetFijo || ((v.tonRet || 0) * (v.fleteRetTon || 0)))
    : 0;
  const vViaje = vIda + vRet;

  // Combustible: por rendimiento o galones directos
  let gTot = 0, galCargado = 0, galVacio = 0;
  if (v.modoComb === "galones") {
    gTot = v.galonesDirectos || 0;
  } else {
    const rendC = v.rendCargado || 0;
    const rendV = v.rendVacio || rendC;
    galCargado = rendC > 0 ? kmCargado / rendC : 0;
    galVacio = rendV > 0 ? kmVacio / rendV : 0;
    gTot = galCargado + galVacio;
  }
  const cAcpm = gTot * (v.precioGalon || 0);
  const adblueRatio = v.usaAdblue ? (v.adblueRatio || 0.05) : 0;
  const adlt = gTot * adblueRatio * 3.785;
  const cAdbl = adlt * (v.precioAdblue || 6000);
  const cComb = cAcpm + cAdbl;

  const peajes = v.peajes || 0;
  const conductor = v.condFijo
    ? v.condFijo
    : ((v.pcond || 0) / 100) * vViaje;

  const gv2 = v.gastosViaje || 0;
  const extras = v.gastosAdic || 0;
  const carp = v.carpado || 0;

  // Descuentos de ley (% sobre el flete total)
  const dRete = ((v.pctRete || 0) / 100) * vViaje;
  const dIca = ((v.pctIca || 0) / 100) * vViaje;
  const dFopat = ((v.pctFopat || 0) / 100) * vViaje;
  const descTotal = dRete + dIca + dFopat + (v.descOtro || 0);

  const total = cComb + peajes + conductor + gv2 + extras + carp;
  const neta = vViaje - total - descTotal;
  const margen = vViaje > 0 ? (neta / vViaje) * 100 : 0;
  const cxk = kmT > 0 ? total / kmT : 0;

  return {
    kmT, vViaje, vIda, vRet, gTot, galCargado, galVacio,
    cAcpm, adlt, cAdbl, cComb, peajes, conductor, gv2, extras, carp,
    dRete, dIca, dFopat, descTotal, total, neta, margen, cxk,
  };
}

// ── Pasos ───────────────────────────────────────────────────

const P = {
  INICIO: "inicio",
  PLACA: "placa", RUTA: "ruta", FECHA: "fecha", FECHA_DESC: "fechaDesc",
  EMPRESA: "empresa", NIT_EMPRESA: "nitEmpresa", PRODUCTO: "producto", LUGARES: "lugares",
  KM: "km", PEAJES: "peajes", COMBUSTIBLE: "combustible", PRECIO_GALON: "precioGalon",
  TON_FLETE: "tonFlete", PCOND: "pcond", GASTOS: "gastos",
  DESCUENTOS: "descuentos", ANTICIPO: "anticipo", MANI_REMESA: "maniRemesa",
  RETORNO: "retorno", RET_RUTA: "retRuta", RET_TON_FLETE: "retTonFlete", RET_KM: "retKm",
  XFECHAS: "xFechas", PESO_BASCULA: "pesoBascula", XPRECIO: "xPrecio",
  CONFIRMAR: "confirmar",
};

const MSG_PEAJES =
  '🛣 ¿Peajes del viaje? Puede escribirlos con nombre:\n' +
  '<i>La Línea 45000 iv, Cocorná 38000, Puerto Triunfo 42000</i>\n' +
  '(agregue <b>iv</b> si lo paga ida y vuelta)\n\n' +
  'O solo el total: <i>890000</i> — o "no"';

// ── Procesamiento ───────────────────────────────────────────

async function procesarMensaje(chatId, texto) {
  const t = texto.trim();
  const tLower = t.toLowerCase();

  if (tLower === "/start") {
    return enviar(chatId,
      "🚛 <b>NAVIRA Bot</b>\n\nRegistre sus viajes por chat.\n\n" +
      "/vincular CÓDIGO — conectar su cuenta\n/nuevo — registrar un viaje\n/cancelar — cancelar\n\n" +
      "💡 En cualquier pregunta puede responder <b>no</b> para saltarla."
    );
  }

  if (tLower.startsWith("/vincular")) {
    const codigo = t.split(/\s+/)[1];
    if (!codigo) return enviar(chatId, "Envíe: /vincular SU_CÓDIGO");
    const vincSnap = await db.doc(`telegram_vinculos/${codigo.toUpperCase()}`).get();
    if (!vincSnap.exists) return enviar(chatId, "❌ Código inválido. Genere uno nuevo en la app.");
    const { uid } = vincSnap.data();
    await setSesion(chatId, { uid, paso: null, viaje: {} });
    await db.doc(`usuarios/${uid}`).set({ telegramChatId: String(chatId) }, { merge: true });
    await vincSnap.ref.delete();
    return enviar(chatId, "✅ <b>Cuenta vinculada.</b> Escriba /nuevo para su primer viaje.");
  }

  const sesion = await getSesion(chatId);
  if (!sesion || !sesion.uid) {
    return enviar(chatId, "Primero vincule su cuenta:\nNAVIRA → Configuración → Vincular Telegram\nLuego: /vincular SU_CÓDIGO");
  }
  const uid = sesion.uid;

  if (tLower === "/cancelar") {
    await resetViaje(chatId);
    return enviar(chatId, "Viaje cancelado. /nuevo para empezar otro.");
  }

  if (tLower === "/nuevo") {
    // Ofrecer rutas frecuentes para el modo exprés
    const rutasSnap = await db.collection(`usuarios/${uid}/rutas`).limit(8).get();
    const rutasMenu = rutasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (rutasMenu.length > 0) {
      await setSesion(chatId, { paso: P.INICIO, viaje: {}, rutasMenu });
      const lista = rutasMenu.map((r, i) => {
        const nom = r.nombre || r.ruta || "Sin nombre";
        const extra = [r.empresa || r.emp, r.producto || r.prod].filter(Boolean).join(", ");
        return `<b>${i + 1}.</b> ${nom}${extra ? ` (${extra})` : ""}`;
      }).join("\n");
      return enviar(chatId,
        `🚛 <b>Nuevo viaje</b>\n\nSus rutas frecuentes:\n${lista}\n\n` +
        `Responda el <b>número</b> de la ruta (modo exprés ⚡),\no escriba la <b>placa</b> para el flujo completo.`
      );
    }
    await setSesion(chatId, { paso: P.PLACA, viaje: {} });
    return enviar(chatId, "🚛 <b>Nuevo viaje</b>\n\n¿Placa del vehículo?");
  }

  const paso = sesion.paso;
  const v = sesion.viaje || {};
  if (!paso) return enviar(chatId, "Escriba /nuevo para registrar un viaje.");

  switch (paso) {

    case P.INICIO: {
      const num = parseInt(t);
      const menu = sesion.rutasMenu || [];
      if (!isNaN(num) && num >= 1 && num <= menu.length) {
        // MODO EXPRÉS: cargar todo de la ruta frecuente (nombres reales de la app)
        const r = menu[num - 1];
        v.modoExpres = true;
        v.ruta = r.nombre || r.ruta || "";
        v.emp = r.empresa || "";
        if (v.emp) {
          const infoEmp = await buscarEmpresa(uid, v.emp);
          v.nitEmpresa = infoEmp.nit || "";
        }
        v.prod = r.producto || "";
        v.tipoCarga = r.tipoCarga || "";
        v.condNom = r.conductor || "";
        v.kmCargado = r.kmCargado || 0;
        v.kmVacio = r.kmVacio || 0;
        v.lugarCargue = r.lugarCargue || "";
        v.lugarDescargue = r.lugarDescargue || "";
        // Peajes: la ruta guarda peajesRuta [{c,n,d,iv,tarifa}]
        const listaPeajes = r.peajesRuta || [];
        v.peajesDetalle = listaPeajes.map(p => ({
          n: p.n, d: p.d || "", tarifa: p.tarifa || 0, iv: p.iv || false,
          total: (p.tarifa || 0) * (p.iv ? 2 : 1),
        }));
        v.peajes = v.peajesDetalle.reduce((s, p) => s + p.total, 0);
        // Conductor: porcCond + modoConductor
        if (r.modoConductor === "fijo") v.condFijo = r.porcCond || 0;
        else v.pcond = r.porcCond || 0;
        // Combustible
        v.precioGalon = r.precioAcpm || 0;
        v.precioAdblue = r.precioAdblue || 0;
        v.rendCargado = r.rendCargado || 0;
        v.rendVacio = r.rendVacio || 0;
        // Gastos precargados de la ruta
        v.carpado = r.carpado || 0;
        v.gastosViaje = r.gastosViaje || 0;
        v.gastosAdic = (r.extrasList || []).reduce((s, e) => s + (e.valor || 0), 0);
        // Descuentos de ley (con sus flags)
        v.pctRete = r.descRetefuente ? (r.pctRetefuente || 0) : 0;
        v.pctIca = r.descReteica ? (r.pctReteica || 0) : 0;
        v.pctFopat = r.descFopat ? (r.pctFopat || 0) : 0;
        // Referencias
        v.fleteRef = r.fleteTon || 0;
        v.anticipoSugerido = r.pctAnticipoFlete || 0;
        await setSesion(chatId, { paso: P.PLACA, viaje: v });
        const gastosPre = v.carpado + v.gastosViaje + v.gastosAdic;
        return enviar(chatId,
          `⚡ <b>${v.ruta}</b> — cargué todo de su ruta:\n` +
          (v.emp ? `🏢 ${v.emp}${v.prod ? ` · 📦 ${v.prod}` : ""}\n` : "") +
          `🛣 ${v.kmCargado} km cargado, ${v.kmVacio} vacío\n` +
          (v.peajes > 0 ? `💸 ${v.peajesDetalle.length} peajes: ${fmt(v.peajes)}\n` : "") +
          (v.pcond ? `👤 Conductor ${v.pcond}%\n` : (v.condFijo ? `👤 Conductor ${fmt(v.condFijo)}\n` : "")) +
          (gastosPre > 0 ? `🧾 Gastos precargados: ${fmt(gastosPre)}\n` : "") +
          ((v.pctRete || v.pctIca || v.pctFopat) ? `📋 Descuentos de ley incluidos\n` : "") +
          `\nSolo los datos de este viaje:\n\n¿Placa?`
        );
      }
      // No es número → tratar como placa (flujo completo)
      const veh = await buscarVehiculo(uid, t);
      if (!veh) return enviar(chatId, `Responda el número de una ruta (1-${menu.length}), o una placa válida de su flota.`);
      v.placa = veh.placa;
      v.condNom = veh.conductor || "";
      v.rendCargado = veh.rendCargadoDef || 0;
      v.rendVacio = veh.rendVacioDef || 0;
      v.usaAdblue = veh.usaAdblue !== false;
      v.adblueRatio = veh.adblueRatio || 0.05;
      v.vehiculoId = veh.firestoreId;
      v.kmOdometroActual = veh.kmOdometro || 0;
      await setSesion(chatId, { paso: P.RUTA, viaje: v });
      return enviar(chatId, `✓ ${veh.placa}${v.condNom ? ` (conductor: ${v.condNom})` : ""}\n\n¿Ruta? (ej: Pto Libertador - Mingueo)`);
    }

    case P.PLACA: {
      const veh = await buscarVehiculo(uid, t);
      if (!veh) return enviar(chatId, `❌ No encontré "${t.toUpperCase()}" en su flota. Intente de nuevo o /cancelar.`);
      v.placa = veh.placa;
      v.condNom = v.condNom || veh.conductor || "";
      // En exprés, los rendimientos de la ruta mandan; el vehículo solo llena los vacíos
      if (!(v.modoExpres && v.rendCargado > 0)) v.rendCargado = veh.rendCargadoDef || v.rendCargado || 0;
      if (!(v.modoExpres && v.rendVacio > 0))   v.rendVacio = veh.rendVacioDef || v.rendVacio || 0;
      v.usaAdblue = veh.usaAdblue !== false;
      v.adblueRatio = veh.adblueRatio || 0.05;
      v.vehiculoId = veh.firestoreId;
      v.kmOdometroActual = veh.kmOdometro || 0;
      if (v.modoExpres) {
        await setSesion(chatId, { paso: P.XFECHAS, viaje: v });
        return enviar(chatId, `✓ ${veh.placa}${v.condNom ? ` (${v.condNom})` : ""}\n\n¿Fechas de cargue y descargue?\n(ej: <i>hoy y 16-07</i> — o solo cargue: <i>hoy</i>)`);
      }
      await setSesion(chatId, { paso: P.RUTA, viaje: v });
      return enviar(chatId, `✓ ${veh.placa}${v.condNom ? ` (conductor: ${v.condNom})` : ""}\n\n¿Ruta? (ej: Pto Libertador - Mingueo)`);
    }

    case P.XFECHAS: {
      // "hoy y 16-07" / "14-07 y 16-07" / "hoy"
      const partes = t.split(/\s+y\s+/i).map(s => s.trim());
      const f1 = parsearFecha(partes[0]);
      if (!f1) return enviar(chatId, "No entendí. Ej: hoy y 16-07 — o solo: hoy");
      v.fecha = f1;
      if (partes[1]) {
        const f2 = parsearFecha(partes[1]);
        if (!f2) return enviar(chatId, "La segunda fecha no es válida. Ej: hoy y 16-07");
        v.fechaDescarga = f2;
      } else {
        v.fechaDescarga = "";
      }
      await setSesion(chatId, { paso: P.TON_FLETE, viaje: v });
      const ref = v.fleteRef > 0 ? ` (último: ${fmt(v.fleteRef)}/ton)` : "";
      return enviar(chatId, `✓ ${f1}${v.fechaDescarga ? " → " + v.fechaDescarga : ""}\n\n¿Toneladas y flete por tonelada?${ref}\n(ej: 34 a 141000)`);
    }

    case P.RUTA: {
      v.ruta = t;
      const mem = await buscarMemoriaRuta(uid, t);
      if (mem) {
        v.kmCargado = mem.kmCargado || mem.kmC || 0;
        v.kmVacio = mem.kmVacio || mem.kmV || 0;
        v.peajes = mem.peajes || 0;
        v.peajesDetalle = mem.peajesDetalle || null;
        v.pcond = mem.pcond || 0;
        v.precioGalon = mem.precioGalon || (mem.cAcpm && mem.gTot ? Math.round(mem.cAcpm / mem.gTot) : 0);
        v.memoriaKm = v.kmCargado > 0;
        v.memoriaPeajes = v.peajes > 0;
        v.memoriaPcond = v.pcond > 0;
      }
      await setSesion(chatId, { paso: P.FECHA, viaje: v });
      let memMsg = `✓ ${t}\n\n`;
      if (mem) {
        const nombresPeajes = (v.peajesDetalle || []).map(p => p.n).join(", ");
        memMsg = `✓ <b>Ruta conocida:</b> ${v.kmCargado} km cargado, ${v.kmVacio} vacío\n` +
          (v.peajes > 0 ? `🛣 Peajes ${fmt(v.peajes)}${nombresPeajes ? `: ${nombresPeajes}` : ""}\n` : "") +
          (v.pcond ? `👤 Conductor ${v.pcond}%\n` : "") + `\n`;
      }
      return enviar(chatId, memMsg + "¿Fecha de cargue? (hoy / ayer / 14-07)");
    }

    case P.FECHA: {
      const f = parsearFecha(t);
      if (!f) return enviar(chatId, "No entendí. Ejemplos: hoy, ayer, 14-07");
      v.fecha = f;
      await setSesion(chatId, { paso: P.FECHA_DESC, viaje: v });
      return enviar(chatId, `✓ Cargue ${f}\n\n¿Fecha de descargue? (fecha o "no")`);
    }

    case P.FECHA_DESC: {
      if (esNo(t)) v.fechaDescarga = "";
      else {
        const f = parsearFecha(t);
        if (!f) return enviar(chatId, 'Escriba la fecha (15-07) o "no".');
        v.fechaDescarga = f;
      }
      await setSesion(chatId, { paso: P.EMPRESA, viaje: v });
      return enviar(chatId, "¿Empresa que contrata? (ej: Transad)");
    }

    case P.EMPRESA: {
      if (esNo(t)) {
        v.emp = "";
        await setSesion(chatId, { paso: P.PRODUCTO, viaje: v });
        return enviar(chatId, '¿Producto y tipo de carga? (ej: carbón, granel — o "no")');
      }
      v.emp = t;
      // ¿Ya está en el directorio? Si sí, trae el NIT y sigue. Si no, lo pregunta.
      const infoEmp = await buscarEmpresa(uid, t);
      if (infoEmp.existe) {
        v.nitEmpresa = infoEmp.nit;
        await setSesion(chatId, { paso: P.PRODUCTO, viaje: v });
        return enviar(chatId, `✓ ${t}${infoEmp.nit ? ` (NIT ${infoEmp.nit})` : ""}\n\n¿Producto y tipo de carga? (ej: carbón, granel — o "no")`);
      }
      await setSesion(chatId, { paso: P.NIT_EMPRESA, viaje: v });
      return enviar(chatId, `✓ ${t} (empresa nueva)\n\n¿NIT de la empresa? Se guarda para sus cuentas de cobro. (ej: 900123456-7 — o "no")`);
    }

    case P.NIT_EMPRESA: {
      if (!esNo(t)) {
        v.nitEmpresa = t.trim();
        // Registrar en el directorio invisible
        await registrarEmpresa(uid, v.emp, v.nitEmpresa).catch(() => {});
      }
      await setSesion(chatId, { paso: P.PRODUCTO, viaje: v });
      return enviar(chatId, '¿Producto y tipo de carga? (ej: carbón, granel — o "no")');
    }

    case P.PRODUCTO: {
      if (!esNo(t)) {
        const partes = t.split(/[,;\/]/).map(s => s.trim());
        v.prod = partes[0] || "";
        v.tipoCarga = partes[1] || "";
      }
      await setSesion(chatId, { paso: P.LUGARES, viaje: v });
      return enviar(chatId, '¿Lugar de cargue y descargue? (ej: Mina La Francia / Puerto Brisa — o "no")');
    }

    case P.LUGARES: {
      if (!esNo(t)) {
        const partes = t.split(/[\/;]/).map(s => s.trim());
        v.lugarCargue = partes[0] || "";
        v.lugarDescargue = partes[1] || "";
      }
      if (v.memoriaKm) {
        if (v.memoriaPeajes) {
          await setSesion(chatId, { paso: P.COMBUSTIBLE, viaje: v });
          return preguntarCombustible(chatId, v);
        }
        await setSesion(chatId, { paso: P.PEAJES, viaje: v });
        return enviar(chatId, MSG_PEAJES);
      }
      await setSesion(chatId, { paso: P.KM, viaje: v });
      return enviar(chatId, "¿Kilómetros cargado y vacío? (ej: 380 y 60)");
    }

    case P.KM: {
      const nums = parsearDosNumeros(t);
      if (!nums) return enviar(chatId, "Escriba los dos km. Ej: 380 y 60");
      v.kmCargado = nums[0];
      v.kmVacio = nums[1];
      await setSesion(chatId, { paso: P.PEAJES, viaje: v });
      return enviar(chatId, `✓ ${nums[0]} km cargado, ${nums[1]} vacío\n\n` + MSG_PEAJES);
    }

    case P.PEAJES: {
      if (!esNo(t)) {
        // Intentar lista con nombres: "La Línea 45000 iv, Cocorná 38000"
        const detalle = parsearPeajesDetalle(t);
        if (detalle) {
          v.peajesDetalle = detalle;
          v.peajes = detalle.reduce((s, p) => s + p.total, 0);
        } else {
          // Total simple
          const p = parsearNumero(t);
          if (p === null) return enviar(chatId, 'No entendí. Ejemplos:\n• La Línea 45000 iv, Cocorná 38000\n• 890000 (solo el total)\n• no');
          v.peajes = p;
        }
      }
      await setSesion(chatId, { paso: P.COMBUSTIBLE, viaje: v });
      if (v.peajesDetalle) {
        const resumen = v.peajesDetalle.map(p => `• ${p.n}: ${fmt(p.tarifa)}${p.iv ? " ×2 (iv)" : ""}`).join("\n");
        await enviar(chatId, `✓ ${v.peajesDetalle.length} peajes — ${fmt(v.peajes)}:\n${resumen}`);
      }
      return preguntarCombustible(chatId, v);
    }

    case P.COMBUSTIBLE: {
      // Respuesta a "¿rendimiento o galones?": "1" = rendimiento del vehículo, "2 90" = galones directos
      if (t.startsWith("2")) {
        const gal = parsearNumero(t.slice(1));
        if (!gal) return enviar(chatId, "Escriba: 2 y los galones. Ej: 2 90");
        v.modoComb = "galones";
        v.galonesDirectos = gal;
      } else {
        v.modoComb = "rendimiento";
      }
      await setSesion(chatId, { paso: P.PRECIO_GALON, viaje: v });
      if (v.precioGalon > 0) {
        return enviar(chatId, `¿Precio del galón? (último: ${fmt(v.precioGalon)} — responda "igual" o el nuevo precio)`);
      }
      return enviar(chatId, "¿Precio del galón de ACPM? (ej: 10800)");
    }

    case P.PRECIO_GALON: {
      if (tLower !== "igual") {
        const p = parsearNumero(t);
        if (!p || p < 5000 || p > 30000) return enviar(chatId, "Precio fuera de rango. Ej: 10800");
        v.precioGalon = p;
      }
      await setSesion(chatId, { paso: P.TON_FLETE, viaje: v });
      return enviar(chatId, "¿Toneladas y flete por tonelada? (ej: 34 a 141000)");
    }

    case P.TON_FLETE: {
      const tf = parsearTonFlete(t);
      if (!tf) return enviar(chatId, "Ej: 34 a 141000 (o 34 a 141 mil)");
      v.ton = tf.ton;
      v.fleteTon = tf.flete;
      if (v.modoExpres) {
        await setSesion(chatId, { paso: P.PESO_BASCULA, viaje: v });
        return enviar(chatId, `✓ Flete: ${fmt(tf.ton * tf.flete)}\n\n¿Peso báscula? (ej: 33.2 — o "no")`);
      }
      if (v.memoriaPcond) {
        await setSesion(chatId, { paso: P.GASTOS, viaje: v });
        return enviar(chatId, `✓ Flete: ${fmt(tf.ton * tf.flete)}\n\n¿Gastos de viaje y adicionales? (ej: 200000 y 50000 — o "no")`);
      }
      await setSesion(chatId, { paso: P.PCOND, viaje: v });
      return enviar(chatId, `✓ Flete: ${fmt(tf.ton * tf.flete)}\n\n¿Pago del conductor? (% ej: 10 — o valor fijo ej: 500000 — o "no")`);
    }

    case P.PESO_BASCULA: {
      if (!esNo(t)) {
        const p = parsearNumero(t);
        if (p === null || p > 999) return enviar(chatId, 'Ej: 33.2 — o "no"');
        v.pesoBascula = p;
      }
      await setSesion(chatId, { paso: P.ANTICIPO, viaje: v });
      const sug = v.anticipoSugerido > 0 ? ` (su ruta usa ${v.anticipoSugerido}% — responda "igual", otro valor, o "no")` : ' (% ej: 60 — o valor ej: 2400000 — o "no")';
      return enviar(chatId, `¿Anticipo de la empresa?${sug}`);
    }

    case P.PCOND: {
      if (!esNo(t)) {
        const n = parsearNumero(t);
        if (n === null) return enviar(chatId, 'Escriba el % (10), un valor fijo (500000) o "no".');
        if (n <= 100) v.pcond = n;
        else v.condFijo = n;
      }
      await setSesion(chatId, { paso: P.GASTOS, viaje: v });
      return enviar(chatId, '¿Gastos de viaje y adicionales? (ej: 200000 y 50000 — un solo valor también sirve — o "no")');
    }

    case P.GASTOS: {
      if (!esNo(t)) {
        const dos = parsearDosNumeros(t);
        if (dos) { v.gastosViaje = dos[0]; v.gastosAdic = dos[1]; }
        else {
          const uno = parsearNumero(t);
          if (uno === null) return enviar(chatId, 'Ej: 200000 y 50000 — o un solo valor — o "no"');
          v.gastosViaje = uno;
        }
      }
      await setSesion(chatId, { paso: P.DESCUENTOS, viaje: v });
      return enviar(chatId, '¿Descuentos de ley? (ej: rete 1 ica 0.5 fopat 1 — o "no")');
    }

    case P.DESCUENTOS: {
      if (!esNo(t)) {
        const rete = t.match(/rete\w*\s+([\d.,]+)/i);
        const ica = t.match(/ica\s+([\d.,]+)/i);
        const fopat = t.match(/fopat\s+([\d.,]+)/i);
        if (rete) v.pctRete = parseFloat(rete[1].replace(",", "."));
        if (ica) v.pctIca = parseFloat(ica[1].replace(",", "."));
        if (fopat) v.pctFopat = parseFloat(fopat[1].replace(",", "."));
        if (!rete && !ica && !fopat) {
          const monto = parsearNumero(t);
          if (monto === null) return enviar(chatId, 'Ej: rete 1 ica 0.5 — o un monto total — o "no"');
          v.descOtro = monto;
        }
      }
      await setSesion(chatId, { paso: P.ANTICIPO, viaje: v });
      return enviar(chatId, '¿Anticipo de la empresa? (% ej: 60 — o valor ej: 2400000 — o "no")');
    }

    case P.ANTICIPO: {
      if (tLower === "igual" && v.anticipoSugerido > 0) {
        v.anticipoPct = v.anticipoSugerido;
      } else if (!esNo(t)) {
        const n = parsearNumero(t.replace("%", ""));
        if (n === null) return enviar(chatId, 'Ej: 60 (porcentaje), 2400000 (valor), "igual" o "no"');
        if (n <= 100) v.anticipoPct = n;
        else v.anticipoMontoDirecto = n;
      }
      await setSesion(chatId, { paso: P.MANI_REMESA, viaje: v });
      return enviar(chatId, '¿Manifiesto y remesa? (ej: 4521 y 789 — solo manifiesto también sirve — o "no")');
    }

    case P.MANI_REMESA: {
      if (!esNo(t)) {
        const partes = t.split(/\s*(?:y|,|;)\s*/);
        v.mani = partes[0] || "";
        v.remesa = partes[1] || "";
      }
      if (v.modoExpres) {
        await setSesion(chatId, { paso: P.XPRECIO, viaje: v });
        if (v.precioGalon > 0) {
          return enviar(chatId, `⛽ ¿Precio del galón? (último: ${fmt(v.precioGalon)} — responda "igual" o el nuevo)`);
        }
        return enviar(chatId, "⛽ ¿Precio del galón de ACPM? (ej: 10800)");
      }
      await setSesion(chatId, { paso: P.RETORNO, viaje: v });
      return enviar(chatId, '¿El viaje tiene retorno? (si / no)');
    }

    case P.XPRECIO: {
      if (tLower !== "igual") {
        const p = parsearNumero(t);
        if (!p || p < 5000 || p > 30000) return enviar(chatId, 'Precio fuera de rango. Ej: 10800 — o "igual"');
        v.precioGalon = p;
      }
      v.modoComb = "rendimiento";
      return confirmarViaje(chatId, v);
    }

    case P.RETORNO: {
      if (tLower === "si" || tLower === "sí") {
        v.tieneRetorno = true;
        await setSesion(chatId, { paso: P.RET_RUTA, viaje: v });
        return enviar(chatId, "🔄 <b>Retorno</b>\n\n¿Ruta del retorno? (ej: Santa Marta - Yarumal)");
      }
      v.tieneRetorno = false;
      return confirmarViaje(chatId, v);
    }

    case P.RET_RUTA: {
      v.rutaRet = t;
      await setSesion(chatId, { paso: P.RET_TON_FLETE, viaje: v });
      return enviar(chatId, '¿Toneladas y flete del retorno? (ej: 34 a 60000 — o valor fijo ej: 2000000)');
    }

    case P.RET_TON_FLETE: {
      const tf = parsearTonFlete(t);
      if (tf) { v.tonRet = tf.ton; v.fleteRetTon = tf.flete; }
      else {
        const fijo = parsearNumero(t);
        if (!fijo) return enviar(chatId, "Ej: 34 a 60000 — o un valor fijo: 2000000");
        v.fleteRetFijo = fijo;
      }
      await setSesion(chatId, { paso: P.RET_KM, viaje: v });
      return enviar(chatId, "¿Km cargado y vacío del retorno? (ej: 300 y 40)");
    }

    case P.RET_KM: {
      const nums = parsearDosNumeros(t);
      if (!nums) return enviar(chatId, "Ej: 300 y 40");
      v.kmCargadoRet = nums[0];
      v.kmVacioRet = nums[1];
      return confirmarViaje(chatId, v);
    }

    case P.CONFIRMAR: {
      if (tLower !== "si" && tLower !== "sí") {
        return enviar(chatId, 'Responda <b>SI</b> para guardar, o /cancelar.');
      }
      return guardarViaje(chatId, uid, v);
    }

    default:
      await resetViaje(chatId);
      return enviar(chatId, "Sesión reiniciada. /nuevo para empezar.");
  }

  // ── helpers internos ──
  async function preguntarCombustible(cid, vj) {
    if (vj.rendCargado > 0) {
      return enviar(cid,
        `⛽ Combustible:\n<b>1</b> — Por rendimiento (${vj.rendCargado} km/gal cargado${vj.rendVacio ? `, ${vj.rendVacio} vacío` : ""})\n<b>2 [galones]</b> — Galones directos (ej: 2 90)\n\nResponda 1, o 2 con los galones.`
      );
    }
    return enviar(cid, "⛽ ¿Cuántos galones gastó el viaje? Responda: 2 y los galones (ej: 2 90)");
  }

  async function confirmarViaje(cid, vj) {
    const c = calcular(vj);
    vj.calculo = c;
    await setSesion(cid, { paso: P.CONFIRMAR, viaje: vj });
    const anticipoVal = vj.anticipoMontoDirecto || (vj.anticipoPct ? (vj.anticipoPct / 100) * c.vViaje : 0);
    return enviar(cid,
      `═══════════════════\n` +
      `🚛 <b>${vj.placa}</b> · ${vj.ruta}\n` +
      (vj.tieneRetorno ? `🔄 ${vj.rutaRet}\n` : "") +
      `📅 ${vj.fecha}${vj.fechaDescarga ? " → " + vj.fechaDescarga : ""}\n` +
      (vj.emp ? `🏢 ${vj.emp}\n` : "") +
      (vj.mani ? `📄 Man. ${vj.mani}${vj.remesa ? ` · Rem. ${vj.remesa}` : ""}\n` : "") +
      `───────────────────\n` +
      `Flete: <b>${fmt(c.vViaje)}</b>${vj.tieneRetorno ? ` (ida ${fmt(c.vIda)} + ret ${fmt(c.vRet)})` : ""}\n` +
      `Combustible: ${fmt(c.cComb)} (${c.gTot.toFixed(1)} gal)\n` +
      `Peajes: ${fmt(c.peajes)}\n` +
      (c.conductor > 0 ? `Conductor: ${fmt(c.conductor)}\n` : "") +
      (c.gv2 + c.extras + c.carp > 0 ? `Gastos: ${fmt(c.gv2 + c.extras + c.carp)}\n` : "") +
      (c.descTotal > 0 ? `Descuentos ley: ${fmt(c.descTotal)}\n` : "") +
      `───────────────────\n` +
      `💰 <b>NETA: ${fmt(c.neta)}</b> (${c.margen.toFixed(1)}%)\n` +
      (anticipoVal > 0 ? `💵 Anticipo: ${fmt(anticipoVal)} · Saldo: ${fmt(c.vViaje - anticipoVal)}\n` : "") +
      `═══════════════════\n\n` +
      `¿Guardar? Responda <b>SI</b>, o /cancelar.`
    );
  }

  async function guardarViaje(cid, userId, vj) {
    const c = vj.calculo || calcular(vj);
    const anticipoVal = vj.anticipoMontoDirecto || (vj.anticipoPct ? (vj.anticipoPct / 100) * c.vViaje : 0);
    const docViaje = {
      fecha: vj.fecha,
      fechaDescarga: vj.fechaDescarga || "",
      mani: vj.mani || "",
      remesa: vj.remesa || "",
      pesoBascula: vj.pesoBascula || 0,
      placa: vj.placa,
      ruta: vj.ruta,
      emp: vj.emp || "",
      nitEmpresa: vj.nitEmpresa || "",
      condNom: vj.condNom || "",
      prod: vj.prod || "",
      tipoCarga: vj.tipoCarga || "",
      lugarCargue: vj.lugarCargue || "",
      lugarDescargue: vj.lugarDescargue || "",
      kmCargado: vj.kmCargado || 0,
      kmVacio: vj.kmVacio || 0,
      kmCargadoRet: vj.kmCargadoRet || 0,
      kmVacioRet: vj.kmVacioRet || 0,
      kmT: c.kmT,
      ton: vj.ton || 0,
      modoFlete: "porTon",
      fleteTon: vj.fleteTon || 0,
      vViaje: c.vViaje,
      tieneRetorno: !!vj.tieneRetorno,
      valorViajeIda: c.vIda,
      valorViajeRetorno: c.vRet,
      rutaRet: vj.rutaRet || "",
      tonelajeRetorno: vj.tonRet || 0,
      fleteRetorno: vj.fleteRetTon || 0,
      modoComb: vj.modoComb === "galones" ? "galones" : "rendimiento",
      gTot: c.gTot,
      galCargado: c.galCargado,
      galVacio: c.galVacio,
      adlt: c.adlt,
      cAcpm: c.cAcpm,
      cAdbl: c.cAdbl,
      cComb: c.cComb,
      peajes: c.peajes,
      peajesDetalle: vj.peajesDetalle || [],
      pcond: vj.pcond || 0,
      conductor: c.conductor,
      carp: c.carp,
      gv2: c.gv2,
      extras: c.extras,
      extrasList: c.extras > 0 ? [{ n: "Adicionales (Telegram)", valor: c.extras }] : [],
      total: c.total,
      neta: c.neta,
      margen: c.margen,
      mrg: c.margen,
      cxk: c.cxk,
      descuentos: {
        retefuente: c.dRete,
        reteica: c.dIca,
        fopat: c.dFopat,
        otro: vj.descOtro || 0,
        nombreOtro: vj.descOtro ? "Otro (Telegram)" : "",
        total: c.descTotal,
      },
      anticipoFletePct: vj.anticipoPct || 0,
      anticipoFleteMonto: anticipoVal,
      saldoFlete: c.vViaje - anticipoVal,
      origenRegistro: "telegram",
      creadoEn: new Date().toISOString(),
    };
    await db.collection(`usuarios/${userId}/viajes`).add(docViaje);

    if (vj.vehiculoId) {
      const cambios = {};
      if (c.kmT > 0) cambios.kmOdometro = (vj.kmOdometroActual || 0) + c.kmT;
      // Estado automático: viaje en curso → "En viaje" (igual que la app)
      const hoy = hoyLocal(0);
      const finViaje = vj.fechaDescarga || "";
      if (vj.fecha <= hoy && (!finViaje || finViaje >= hoy)) cambios.estado = "en_viaje";
      if (Object.keys(cambios).length > 0) {
        await db.doc(`usuarios/${userId}/vehiculos/${vj.vehiculoId}`).update(cambios).catch(() => {});
      }
    }

    await resetViaje(cid);
    return enviar(cid,
      `✅ <b>Viaje guardado.</b>\n\nNeta: ${fmt(c.neta)}\n\nYa está en su app NAVIRA.\n/nuevo para registrar otro.`
    );
  }
}

// ── Webhook ─────────────────────────────────────────────────

exports.botNavira = onRequest({ region: "us-central1", cors: true }, async (req, res) => {
  try {
    // Seguridad: solo aceptar peticiones reales de Telegram (secret token)
    const secretRecibido = req.get("X-Telegram-Bot-Api-Secret-Token");
    if (process.env.TELEGRAM_SECRET && secretRecibido !== process.env.TELEGRAM_SECRET) {
      console.warn("Petición rechazada: secret token inválido");
      return res.status(403).send("Forbidden");
    }
    const update = req.body;
    if (update && update.message && update.message.text) {
      await procesarMensaje(update.message.chat.id, update.message.text);
    }
  } catch (err) {
    console.error("Error en botNavira:", err);
  }
  res.status(200).send("OK");
});