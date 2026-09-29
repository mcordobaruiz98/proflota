/**
 * FE-17 — Namespacing de localStorage por UID.
 *
 * Antes, las preferencias y las metas se guardaban en claves globales
 * (cfg_notif, meta_diaria, ...). Con dos cuentas en el mismo navegador, la
 * segunda leía y pisaba los datos de la primera. Aquí cada clave vive bajo
 * `navira_<uid>_<clave>`, y la lectura de una clave antigua se migra sola al
 * espacio del usuario la primera vez que entra.
 *
 * El borrado de cuenta (BE-09) llama a borrarEspacioUsuario para no dejar
 * nada de ese uid en el navegador. El cierre de sesión normal NO lo hace: solo
 * purga la caché de Firestore, y estas preferencias siguen siendo del usuario.
 */

const PREFIJO = "navira_";
const SEPARADOR = "_";

/** Claves que el código usa hoy. Se listan para poder migrarlas y purgar de forma explícita. */
export const CLAVES_CONOCIDAS = [
  "cfg_notif",
  "cfg_sonido",
  "meta_diaria",
  "meta_semanal",
  "meta_mensual_global",
];

function claveDe(uid, clave) {
  return `${PREFIJO}${uid}${SEPARADOR}${clave}`;
}

function esClaveDeUid(clave, uid) {
  return clave.startsWith(`${PREFIJO}${uid}${SEPARADOR}`);
}

/**
 * Lee una clave del usuario. Si no existe en su namespace pero sí la versión
 * antigua, la copia al namespace y borra la antigua para que no se repita.
 */
export function leer(uid, clave, porDefecto = null) {
  if (!uid) return porDefecto;

  const nueva = claveDe(uid, clave);
  const guardada = window.localStorage.getItem(nueva);
  if (guardada !== null) return seguroParse(guardada);

  if (window.localStorage.getItem(clave) !== null) {
    const valorLegacy = window.localStorage.getItem(clave);
    window.localStorage.setItem(nueva, valorLegacy);
    window.localStorage.removeItem(clave);
    return seguroParse(valorLegacy);
  }

  return porDefecto;
}

export function escribir(uid, clave, valor) {
  if (!uid) return;
  window.localStorage.setItem(claveDe(uid, clave), JSON.stringify(valor));
}

function seguroParse(valor) {
  try {
    return JSON.parse(valor);
  } catch {
    return valor;
  }
}

/**
 * Purga todo lo que pertenece a un uid.
 *
 * Solo debe llamarse cuando esos datos ya no le sirven a nadie: en la baja de
 * cuenta (BE-09) o cuando el usuario lo pide explícitamente desde
 * Configuración. NO en el cierre de sesión normal, porque ahí las metas y
 * preferencias siguen siendo suyas y deben sobrevivir a la siguiente entrada.
 */
export function borrarEspacioUsuario(uid) {
  if (!uid) return 0;
  const aBorrar = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const clave = window.localStorage.key(i);
    if (clave && esClaveDeUid(clave, uid)) aBorrar.push(clave);
  }
  for (const clave of aBorrar) window.localStorage.removeItem(clave);
  return aBorrar.length;
}

/**
 * En una estación compartida puede haber claves antiguas sin namespace de
 * cuentas ya borradas. No se pueden adjudicar a nadie, así que se ofrecen
 * para limpieza explícita desde Configuración en vez de borrarlas a ciegas.
 */
export function clavesLegacyHuerfanas() {
  return CLAVES_CONOCIDAS.filter((clave) => window.localStorage.getItem(clave) !== null);
}

export function limpiarLegacyHuerfanas() {
  const huerfanas = clavesLegacyHuerfanas();
  for (const clave of huerfanas) window.localStorage.removeItem(clave);
  return huerfanas.length;
}
