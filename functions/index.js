/**
 * NAVIRA — Bot de Telegram para registro de viajes
 * Flujo guiado campo por campo con memoria de flota y rutas.
 *
 * Colecciones que usa:
 *  - telegram_vinculos/{codigo}   → código temporal generado en la app para vincular
 *  - telegram_sesiones/{chatId}   → estado de la conversación + uid del usuario
 *  - usuarios/{uid}/...           → datos de la app (vehículos, viajes, rutas)
 */

const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const TOKEN = process.env.TELEGRAM_TOKEN;
const API = () => `https://api.telegram.org/bot${TOKEN}`;

// ── Utilidades ──────────────────────────────────────────────

async function enviar(chatId, texto, teclado = null) {
  const body = { chat_id: chatId, text: texto, parse_mode: "HTML" };
  if (teclado) body.reply_markup = teclado;
  await fetch(`${API()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");

function hoyLocal() {
  // Colombia UTC-5
  const ahora = new Date(Date.now() - 5 * 60 * 60 * 1000);
  return ahora.toISOString().slice(0, 10);
}

function ayerLocal() {
  const ayer = new Date(Date.now() - 5 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  return ayer.toISOString().slice(0, 10);
}

function parsearFecha(texto) {
  const t = texto.trim().toLowerCase();
  if (t === "hoy") return hoyLocal();
  if (t === "ayer") return ayerLocal();
  // Formatos: 2026-07-14, 14/07/2026, 14/07, 14-07
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const anio = new Date().getFullYear();
    return `${anio}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

function parsearNumero(texto) {
  // "141000", "141.000", "141 mil", "141mil", "3.010.000"
  let t = texto.trim().toLowerCase().replace(/\$/g, "").replace(/\s/g, "");
  if (t.endsWith("mil")) {
    const base = parseFloat(t.replace("mil", "").replace(/\./g, "").replace(",", "."));
    return isNaN(base) ? null : base * 1000;
  }
  const limpio = t.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(limpio);
  return isNaN(n) ? null : n;
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
  await db.doc(`telegram_sesiones/${chatId}`).set(
    { paso: null, viaje: {} },
    { merge: true }
  );
}

// ── Memoria de flota ────────────────────────────────────────

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

async function buscarRutaFrecuente(uid, rutaTexto) {
  const norm = rutaTexto.trim().toLowerCase();
  const snap = await db.collection(`usuarios/${uid}/rutas`).get();
  for (const d of snap.docs) {
    const r = d.data();
    if ((r.nombre || r.ruta || "").trim().toLowerCase() === norm) {
      return { firestoreId: d.id, ...r };
    }
  }
  return null;
}

async function buscarUltimoViajeRuta(uid, rutaTexto) {
  const norm = rutaTexto.trim().toLowerCase();
  const snap = await db
    .collection(`usuarios/${uid}/viajes`)
    .orderBy("fecha", "desc")
    .limit(200)
    .get();
  for (const d of snap.docs) {
    const v = d.data();
    if ((v.ruta || "").trim().toLowerCase() === norm) {
      return { firestoreId: d.id, ...v };
    }
  }
  return null;
}

// ── Cálculo del viaje ───────────────────────────────────────

function calcularViaje(v) {
  const kmCargado = v.kmCargado || 0;
  const kmVacio = v.kmVacio || 0;
  const kmT = kmCargado + kmVacio;
  const vViaje = (v.ton || 0) * (v.fleteTon || 0);

  const rendC = v.rendCargado || 0;
  const rendV = v.rendVacio || rendC;
  const precioGal = v.precioGalon || 0;
  const galCargado = rendC > 0 ? kmCargado / rendC : 0;
  const galVacio = rendV > 0 ? kmVacio / rendV : 0;
  const gTot = galCargado + galVacio;
  const costoAcpm = gTot * precioGal;

  // Adblue si el vehículo lo usa
  const adblueRatio = v.usaAdblue ? (v.adblueRatio || 0.05) : 0;
  const adlt = gTot * adblueRatio * 3.785; // litros
  const costoAdbl = adlt * (v.precioAdblue || 6000);
  const costoComb = costoAcpm + costoAdbl;

  const peajes = v.peajes || 0;
  const pcond = v.pcond || 0;
  const costoConduct = (pcond / 100) * vViaje;

  const total = costoComb + peajes + costoConduct;
  const neta = vViaje - total;
  const margen = vViaje > 0 ? (neta / vViaje) * 100 : 0;
  const cxk = kmT > 0 ? total / kmT : 0;

  return {
    kmT, vViaje, gTot, galCargado, galVacio,
    cAcpm: costoAcpm, adlt, cAdbl: costoAdbl, cComb: costoComb,
    conductor: costoConduct, total, neta, margen, cxk,
  };
}

// ── Flujo de conversación ───────────────────────────────────

const PASOS = {
  PLACA: "placa",
  RUTA: "ruta",
  FECHA: "fecha",
  FECHA_DESC: "fechaDesc",
  KM: "km",
  PRECIO_GALON: "precioGalon",
  TON_FLETE: "tonFlete",
  MANIFIESTO: "manifiesto",
  CONFIRMAR: "confirmar",
};

async function procesarMensaje(chatId, texto) {
  const t = texto.trim();
  const tLower = t.toLowerCase();

  // ── Comandos globales ──
  if (tLower === "/start") {
    return enviar(chatId,
      "🚛 <b>NAVIRA Bot</b>\n\n" +
      "Registre sus viajes por chat, sin abrir la app.\n\n" +
      "<b>Comandos:</b>\n" +
      "/vincular CÓDIGO — conectar con su cuenta NAVIRA\n" +
      "/nuevo — registrar un viaje\n" +
      "/cancelar — cancelar el viaje en curso\n\n" +
      "Para empezar, abra NAVIRA → Configuración → Vincular Telegram, y envíeme el código."
    );
  }

  if (tLower.startsWith("/vincular")) {
    const codigo = t.split(/\s+/)[1];
    if (!codigo) {
      return enviar(chatId, "Envíe: /vincular SU_CÓDIGO\n(El código lo genera en la app: Configuración → Vincular Telegram)");
    }
    const vincSnap = await db.doc(`telegram_vinculos/${codigo.toUpperCase()}`).get();
    if (!vincSnap.exists) {
      return enviar(chatId, "❌ Código inválido o vencido. Genere uno nuevo en la app.");
    }
    const { uid } = vincSnap.data();
    await setSesion(chatId, { uid, paso: null, viaje: {} });
    await db.doc(`usuarios/${uid}`).set({ telegramChatId: String(chatId) }, { merge: true });
    await vincSnap.ref.delete();
    return enviar(chatId, "✅ <b>Cuenta vinculada.</b>\n\nEscriba /nuevo para registrar su primer viaje por chat.");
  }

  // ── Verificar vinculación ──
  const sesion = await getSesion(chatId);
  if (!sesion || !sesion.uid) {
    return enviar(chatId, "Primero vincule su cuenta:\n\nAbra NAVIRA → Configuración → Vincular Telegram, y envíeme:\n/vincular SU_CÓDIGO");
  }
  const uid = sesion.uid;

  if (tLower === "/cancelar") {
    await resetViaje(chatId);
    return enviar(chatId, "Viaje cancelado. Escriba /nuevo cuando quiera empezar otro.");
  }

  if (tLower === "/nuevo") {
    await setSesion(chatId, { paso: PASOS.PLACA, viaje: {} });
    return enviar(chatId, "🚛 <b>Nuevo viaje</b>\n\n¿Placa del vehículo?");
  }

  // ── Máquina de estados ──
  const paso = sesion.paso;
  const viaje = sesion.viaje || {};

  if (!paso) {
    return enviar(chatId, "Escriba /nuevo para registrar un viaje.");
  }

  switch (paso) {
    case PASOS.PLACA: {
      const veh = await buscarVehiculo(uid, t);
      if (!veh) {
        return enviar(chatId, `❌ No encontré la placa "${t.toUpperCase()}" en su flota.\n\nVerifique e intente de nuevo, o escriba /cancelar.`);
      }
      viaje.placa = veh.placa;
      viaje.condNom = veh.conductor || "";
      viaje.rendCargado = veh.rendCargadoDef || 0;
      viaje.rendVacio = veh.rendVacioDef || 0;
      viaje.usaAdblue = veh.usaAdblue !== false;
      viaje.adblueRatio = veh.adblueRatio || 0.05;
      viaje.vehiculoId = veh.firestoreId;
      viaje.kmOdometroActual = veh.kmOdometro || 0;
      await setSesion(chatId, { paso: PASOS.RUTA, viaje });
      const condInfo = viaje.condNom ? ` (conductor: ${viaje.condNom})` : "";
      return enviar(chatId, `✓ ${veh.placa}${condInfo}\n\n¿Ruta del viaje? (ej: Pto Libertador - Mingueo)`);
    }

    case PASOS.RUTA: {
      viaje.ruta = t;
      // Buscar memoria: ruta frecuente o último viaje
      const rutaFrec = await buscarRutaFrecuente(uid, t);
      const ultimo = rutaFrec ? null : await buscarUltimoViajeRuta(uid, t);
      const memoria = rutaFrec || ultimo;
      if (memoria) {
        viaje.kmCargado = memoria.kmCargado || memoria.kmC || 0;
        viaje.kmVacio = memoria.kmVacio || memoria.kmV || 0;
        viaje.peajes = memoria.peajes || 0;
        viaje.pcond = memoria.pcond || 0;
        viaje.precioGalon = memoria.precioGalon || (memoria.cAcpm && memoria.gTot ? memoria.cAcpm / memoria.gTot : 0);
        viaje.memoriaUsada = true;
        await setSesion(chatId, { paso: PASOS.FECHA, viaje });
        return enviar(chatId,
          `✓ <b>Ruta conocida.</b> Cargué de su historial:\n` +
          `• ${viaje.kmCargado} km cargado, ${viaje.kmVacio} km vacío\n` +
          `• Peajes: ${fmt(viaje.peajes)}\n` +
          (viaje.pcond ? `• Conductor: ${viaje.pcond}%\n` : "") +
          `\n¿Fecha de cargue? (hoy / ayer / 14-07)`
        );
      }
      await setSesion(chatId, { paso: PASOS.FECHA, viaje });
      return enviar(chatId, `✓ ${t}\n\n¿Fecha de cargue? (hoy / ayer / 14-07)`);
    }

    case PASOS.FECHA: {
      const fecha = parsearFecha(t);
      if (!fecha) return enviar(chatId, "No entendí la fecha. Ejemplos: hoy, ayer, 14-07, 2026-07-14");
      viaje.fecha = fecha;
      await setSesion(chatId, { paso: PASOS.FECHA_DESC, viaje });
      return enviar(chatId, `✓ Cargue: ${fecha}\n\n¿Fecha de descargue? (hoy / mañana escriba la fecha / "no" si no sabe)`);
    }

    case PASOS.FECHA_DESC: {
      if (tLower === "no" || tLower === "-") {
        viaje.fechaDescarga = "";
      } else {
        const fecha = parsearFecha(t);
        if (!fecha) return enviar(chatId, 'No entendí. Escriba la fecha (14-07) o "no".');
        viaje.fechaDescarga = fecha;
      }
      // Si la memoria ya trajo km, saltar
      if (viaje.memoriaUsada && (viaje.kmCargado > 0 || viaje.kmVacio > 0)) {
        if (viaje.precioGalon > 0) {
          await setSesion(chatId, { paso: PASOS.TON_FLETE, viaje });
          return enviar(chatId, "¿Toneladas y flete por tonelada?\n(ej: 34 a 141000)");
        }
        await setSesion(chatId, { paso: PASOS.PRECIO_GALON, viaje });
        return enviar(chatId, "¿Precio del galón de ACPM? (ej: 10800)");
      }
      await setSesion(chatId, { paso: PASOS.KM, viaje });
      return enviar(chatId, "¿Kilómetros cargado y vacío?\n(ej: 380 y 60)");
    }

    case PASOS.KM: {
      const m = t.match(/(\d+)\s*(?:y|,|\s)\s*(\d+)/);
      if (!m) return enviar(chatId, "Escriba los dos: km cargado y km vacío. Ej: 380 y 60");
      viaje.kmCargado = parseInt(m[1]);
      viaje.kmVacio = parseInt(m[2]);
      await setSesion(chatId, { paso: PASOS.PRECIO_GALON, viaje });
      return enviar(chatId, `✓ ${viaje.kmCargado} km cargado, ${viaje.kmVacio} km vacío\n\n¿Precio del galón de ACPM? (ej: 10800)`);
    }

    case PASOS.PRECIO_GALON: {
      const precio = parsearNumero(t);
      if (!precio || precio < 5000 || precio > 30000) {
        return enviar(chatId, "Precio fuera de rango. Escriba el valor del galón, ej: 10800");
      }
      viaje.precioGalon = precio;
      await setSesion(chatId, { paso: PASOS.TON_FLETE, viaje });
      return enviar(chatId, "¿Toneladas y flete por tonelada?\n(ej: 34 a 141000)");
    }

    case PASOS.TON_FLETE: {
      const m = t.match(/([\d.,]+)\s*(?:a|x|por|\s)\s*([\d.,]+\s*(?:mil)?)/i);
      if (!m) return enviar(chatId, "Escriba toneladas y flete. Ej: 34 a 141000  (o 34 a 141 mil)");
      const ton = parsearNumero(m[1]);
      const flete = parsearNumero(m[2]);
      if (!ton || !flete) return enviar(chatId, "No entendí los números. Ej: 34 a 141000");
      viaje.ton = ton;
      viaje.fleteTon = flete;
      await setSesion(chatId, { paso: PASOS.MANIFIESTO, viaje });
      return enviar(chatId, `✓ ${ton} ton × ${fmt(flete)}/ton = ${fmt(ton * flete)}\n\n¿Número de manifiesto? (o "no" si aún no lo tiene)`);
    }

    case PASOS.MANIFIESTO: {
      viaje.mani = (tLower === "no" || tLower === "-") ? "" : t;
      // Si no hay % conductor de memoria, usar 0 y avisar
      const calc = calcularViaje(viaje);
      viaje.calculo = calc;
      await setSesion(chatId, { paso: PASOS.CONFIRMAR, viaje });
      return enviar(chatId,
        `═══════════════════\n` +
        `🚛 <b>${viaje.placa}</b> · ${viaje.ruta}\n` +
        `📅 ${viaje.fecha}${viaje.fechaDescarga ? " → " + viaje.fechaDescarga : ""}\n` +
        (viaje.mani ? `📄 Manifiesto ${viaje.mani}\n` : "") +
        `───────────────────\n` +
        `Flete: <b>${fmt(calc.vViaje)}</b> (${viaje.ton} ton × ${fmt(viaje.fleteTon)})\n` +
        `Combustible: ${fmt(calc.cComb)} (${calc.gTot.toFixed(1)} gal)\n` +
        `Peajes: ${fmt(viaje.peajes || 0)}\n` +
        (calc.conductor > 0 ? `Conductor (${viaje.pcond}%): ${fmt(calc.conductor)}\n` : "") +
        `───────────────────\n` +
        `💰 <b>GANANCIA NETA: ${fmt(calc.neta)}</b> (${calc.margen.toFixed(1)}%)\n` +
        `═══════════════════\n\n` +
        `¿Guardar este viaje? Responda <b>SI</b> para confirmar, o /cancelar.`
      );
    }

    case PASOS.CONFIRMAR: {
      if (tLower !== "si" && tLower !== "sí") {
        return enviar(chatId, 'Responda <b>SI</b> para guardar, o /cancelar para descartar.');
      }
      const calc = viaje.calculo || calcularViaje(viaje);
      const doc = {
        fecha: viaje.fecha,
        fechaDescarga: viaje.fechaDescarga || "",
        mani: viaje.mani || "",
        placa: viaje.placa,
        ruta: viaje.ruta,
        condNom: viaje.condNom || "",
        kmCargado: viaje.kmCargado || 0,
        kmVacio: viaje.kmVacio || 0,
        kmT: calc.kmT,
        ton: viaje.ton || 0,
        modoFlete: "porTon",
        fleteTon: viaje.fleteTon || 0,
        vViaje: calc.vViaje,
        gTot: calc.gTot,
        galCargado: calc.galCargado,
        galVacio: calc.galVacio,
        adlt: calc.adlt,
        cAcpm: calc.cAcpm,
        cAdbl: calc.cAdbl,
        cComb: calc.cComb,
        peajes: viaje.peajes || 0,
        pcond: viaje.pcond || 0,
        conductor: calc.conductor,
        total: calc.total,
        neta: calc.neta,
        margen: calc.margen,
        mrg: calc.margen,
        cxk: calc.cxk,
        origenRegistro: "telegram",
        creadoEn: new Date().toISOString(),
      };
      await db.collection(`usuarios/${uid}/viajes`).add(doc);

      // Actualizar odómetro
      if (viaje.vehiculoId && calc.kmT > 0) {
        await db.doc(`usuarios/${uid}/vehiculos/${viaje.vehiculoId}`).update({
          kmOdometro: (viaje.kmOdometroActual || 0) + calc.kmT,
        }).catch(() => {});
      }

      await resetViaje(chatId);
      return enviar(chatId,
        `✅ <b>Viaje guardado.</b>\n\n` +
        `Neta: ${fmt(calc.neta)}\n\n` +
        `Ya puede verlo en la app NAVIRA.\n` +
        `Escriba /nuevo para registrar otro.`
      );
    }

    default:
      await resetViaje(chatId);
      return enviar(chatId, "Algo se reinició. Escriba /nuevo para empezar un viaje.");
  }
}

// ── Webhook principal ───────────────────────────────────────

exports.botNavira = onRequest({ region: "us-central1", cors: true }, async (req, res) => {
  try {
    const update = req.body;
    if (update && update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const texto = update.message.text;
      await procesarMensaje(chatId, texto);
    }
  } catch (err) {
    console.error("Error en botNavira:", err);
  }
  res.status(200).send("OK");
});