// sw.js - Service Worker para NAVIRA (Soporte Offline PWA)
//
// Lo que este archivo sostiene, y por qué:
//
// - Solo se cachea lo que es del propio origen y un GET. Firebase, Google Fonts y
//   Cloud Functions viven en otros orígenes y su cacheo no aporta nada.
// - Las navegaciones van red-primero. Servir un index.html viejo es lo que rompe la
//   app tras un deploy: ese HTML apunta a chunks que ya no existen en el servidor.
// - Antes de cachear se valida la respuesta, y la caché tiene tope de entradas.
//   Sin tope, "caching todo" termina comiéndose la cuota de origen del navegador.

const CACHE_VERSION = 'v3'
const CACHE_ESTATICA = `navira-estatica-${CACHE_VERSION}`
const CACHE_DINAMICA = `navira-dinamica-${CACHE_VERSION}`

const MAX_ENTRADAS = 60

const RECURSOS_INICIALES = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/logo-navira.png',
  '/logo-naviraT.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icons.svg'
]

// Instalar el Service Worker y cachear los recursos iniciales.
// addAll es todo-o-nada: que falte un solo archivo aborta la instalación completa y
// el SW deja de activarse en silencio. Por eso se cachea de uno en uno.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_ESTATICA).then((cache) =>
      Promise.all(
        RECURSOS_INICIALES.map((recurso) =>
          fetch(recurso)
            .then((res) => (esCacheable(res) ? cache.put(recurso, res) : null))
            .catch(() => null)
        )
      )
    )
  )
  self.skipWaiting()
})

// Activar y eliminar las cachés de versiones anteriores.
// La v2 queda invalidada a propósito: contiene el index.html envenenado que causa
// el error de sintaxis tras un deploy.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => clave !== CACHE_ESTATICA && clave !== CACHE_DINAMICA)
            .map((clave) => caches.delete(clave))
        )
      )
      .then(() => self.clients.claim())
  )
  console.log('[Service Worker] Activado y listo')
})

// Solo se guarda lo que tiene sentido volver a servir: mismo origen, petición GET,
// respuesta correcta y sin contenido de error disfrazado de asset.
function esCacheable(res) {
  if (!res || !res.ok) return false
  if (res.type === 'opaque') return false
  return res.headers.get('content-type') !== 'text/html'
}

function esDeOtroOrigen(url) {
  return new URL(url, self.location.href).origin !== self.location.origin
}

// Recorta la caché dinámica: sin este tope crece sin límite hasta que el navegador
// empieza a evictar entradas por su cuenta, en el orden menos conveniente.
function recortarCache(nombre) {
  return caches.open(nombre).then((cache) =>
    cache.keys().then((peticiones) => {
      const sobra = peticiones.length - MAX_ENTRADAS
      if (sobra <= 0) return undefined
      return Promise.all(
        peticiones.slice(0, sobra).map((peticion) => cache.delete(peticion))
      )
    })
  )
}

function guardar(request, res) {
  return caches
    .open(CACHE_DINAMICA)
    .then((cache) => cache.put(request, res))
    .then(() => recortarCache(CACHE_DINAMICA))
    .catch(() => undefined)
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // La Cache API solo admite GET. Un POST cacheado revienta y, peor, deja la
  // escritura a medias sin avisar.
  if (request.method !== 'GET') return

  // Fuera de Firebase y Google: el navegador los atiende como siempre.
  if (esDeOtroOrigen(request.url)) return

  // Navegación: red-primero. Si la red responde, el HTML en caché se reemplaza.
  // El fallback a caché es solo para cuando no hay red, que es cuando el HTML viejo
  // es lo único que hay y peor es nada.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copia = res.clone()
            caches.open(CACHE_ESTATICA).then((cache) => cache.put('/index.html', copia))
          }
          return res
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((cacheada) => cacheada || caches.match('/'))
            .then((cacheada) => cacheada || Response.error())
        )
    )
    return
  }

  // Assets con hash en el nombre: el nombre ES el contenido, se puede servir de caché.
  const esAssetInmutable = new URL(request.url).pathname.startsWith('/assets/')

  event.respondWith(
    (esAssetInmutable ? caches.match(request) : null)
      .then((cacheada) => {
        if (cacheada) return cacheada
        return fetch(request).then((res) => {
          // Un HTML donde se esperaba un chunk significa que el servidor no tiene ese
          // archivo. Cachearlo convertiría un 404 en un error de sintaxis permanente.
          if (esCacheable(res)) {
            const copia = res.clone()
            guardar(request, copia)
          }
          return res
        })
      })
      .catch(() => Response.error())
  )
})
