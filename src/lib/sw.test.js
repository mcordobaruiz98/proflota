/**
 * Pruebas del Service Worker (`public/sw.js`).
 *
 * El SW no se importa de forma normal: se registra sobre `self` y usa `caches`,
 * que no existen en Node. Aqui se monta un entorno minimo (self, caches y fetch)
 * y se importa el archivo real para ejercitarlo. Cada test lo reimporta con una
 * query distinta porque el modulo se ejecuta al importarse.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'

const ORIGEN = 'https://navira-prueba.web.app'

function clave(peticion) {
  if (typeof peticion === 'string') return peticion
  return peticion.url
}

function crearCache() {
  return {
    entradas: new Map(),
    async put(peticion, res) {
      this.entradas.set(clave(peticion), res)
    },
    async match(peticion) {
      return this.entradas.get(clave(peticion))
    },
    async keys() {
      return [...this.entradas.keys()].map((url) => ({ url: new URL(url, ORIGEN).href }))
    },
    async delete(peticion) {
      return this.entradas.delete(clave(peticion))
    },
  }
}

/**
 * Monta el entorno del SW. Devuelve los manejadores y el estado para inspeccionar.
 * `responde` permite decidir qué devuelve fetch y con qué status/tipo.
 */
function montar({ respond = async () => new Response('', { status: 200 }), fallar = false } = {}) {
  const manejadores = new Map()
  const cachés = new Map()
  const espera = []
  const respondidos = []

  const obtenerCache = (nombre) => {
    if (!cachés.has(nombre)) cachés.set(nombre, crearCache())
    return cachés.get(nombre)
  }

  const globales = {
    self: {
      location: { href: `${ORIGEN}/sw.js`, origin: ORIGEN },
      addEventListener: (tipo, fn) => manejadores.set(tipo, fn),
      skipWaiting: () => {},
      clients: { claim: async () => {} },
    },
    caches: {
      open: async (nombre) => obtenerCache(nombre),
      keys: async () => [...cachés.keys()],
      delete: async (nombre) => cachés.delete(nombre),
      match: async (peticion) => {
        for (const cache of cachés.values()) {
          const encontrada = await cache.match(peticion)
          if (encontrada) return encontrada
        }
        return undefined
      },
    },
    fetch: async (peticion) => {
      if (fallar) throw new TypeError('Failed to fetch')
      return respond(peticion)
    },
  }

  const anteriores = {}
  for (const [nombre, valor] of Object.entries(globales)) {
    anteriores[nombre] = globalThis[nombre]
    globalThis[nombre] = valor
  }

  return {
    manejadores,
    espera,
    respondidos,
    cachés,
    abrirCache: obtenerCache,
    restaurar: () => {
      for (const [nombre, valor] of Object.entries(anteriores)) globalThis[nombre] = valor
    },
  }
}

let contador = 0
async function cargarSw(entorno) {
  contador += 1
  await import(`../../public/sw.js?v=${contador}`)
  return entorno.manejadores
}

function eventoFetch(url, opciones = {}) {
  return {
    request: {
      url: new URL(url, ORIGEN).href,
      method: opciones.method || 'GET',
      mode: opciones.mode || 'no-cors',
    },
    respondWith: (p) => {
      // Marcar la promesa como atendida evita que un rechazo del SW se convierta en
      // unhandledRejection y se atribuya al test siguiente. El test que si la espera
      // sigue viendo el rechazo original, con su error de verdad.
      p.catch(() => {})
      entornoActual.respondidos.push(p)
    },
  }
}

function eventoSimple() {
  return { waitUntil: (p) => entornoActual.espera.push(p) }
}

function resOk(cuerpo = 'ok', tipo = 'text/javascript') {
  return new Response(cuerpo, { status: 200, headers: { 'content-type': tipo } })
}

let entornoActual

async function conSw(opciones, cuerpo) {
  const entorno = montar(opciones)
  entornoActual = entorno
  try {
    const manejadores = await cargarSw(entorno)
    await cuerpo({ ...entorno, manejadores })
  } finally {
    entorno.restaurar()
  }
}

test('install: no aborta si falta un recurso inicial', async () => {
  await conSw({ respond: async (p) => {
    if (String(p.url ?? p).includes('favicon.svg')) throw new Error('404')
    return resOk('ok', 'text/plain')
  } }, async ({ manejadores, espera }) => {
    await manejadores.get('install')(eventoSimple())
    await Promise.all(espera)
    assert.ok(espera.length > 0, 'la instalación debe registrar un waitUntil real')
  })
})

test('install: no cachea respuestas de error', async () => {
  await conSw({ respond: async () => new Response('no', { status: 404 }) }, async ({ manejadores, espera, cachés }) => {
    await manejadores.get('install')(eventoSimple())
    await Promise.all(espera)
    const total = [...cachés.values()].reduce((n, c) => n + c.entradas.size, 0)
    assert.equal(total, 0, 'un 404 no debe quedar cacheado')
  })
})

test('activate: borra las cachés de versiones anteriores', async () => {
  await conSw({}, async ({ manejadores, espera, cachés }) => {
    const viejo = crearCache()
    viejo.entradas.set('https://navira-prueba.web.app/index.html', resOk('viejo', 'text/html'))
    cachés.set('navira-cache-v2', viejo)
    cachés.set('navira-dynamic-v2', viejo)

    await manejadores.get('activate')(eventoSimple())
    await Promise.all(espera)

    assert.equal(cachés.has('navira-cache-v2'), false, 'la v2 contaminada debe desaparecer')
    assert.equal(cachés.has('navira-dynamic-v2'), false)
  })
})

test('fetch: ignora peticiones que no son GET', async () => {
  await conSw({}, async ({ manejadores, respondidos }) => {
    manejadores.get('fetch')(eventoFetch('/api/pedido', { method: 'POST' }))
    assert.equal(respondidos.length, 0, 'un POST no debe pasar por respondWith')
  })
})

test('fetch: ignora otros orígenes (Firebase, fuentes, functions)', async () => {
  await conSw({}, async ({ manejadores, respondidos }) => {
    for (const url of [
      'https://firestore.googleapis.com/v1/x',
      'https://fonts.googleapis.com/css2?family=X',
      'https://us-central1-navira.cloudfunctions.net/api',
    ]) {
      manejadores.get('fetch')(eventoFetch(url))
    }
    assert.equal(respondidos.length, 0, 'cruzados de origen deben pasar intactos')
  })
})

test('navegación: red-primero, reemplaza el index.html cacheado', async () => {
  await conSw({ respond: async () => new Response('<html>nuevo</html>', {
    status: 200, headers: { 'content-type': 'text/html' },
  }) }, async ({ manejadores, respondidos, abrirCache }) => {
    const estatica = abrirCache('navira-estatica-v3')
    estatica.entradas.set('/index.html', new Response('<html>viejo</html>'))

    manejadores.get('fetch')(eventoFetch('/', { mode: 'navigate' }))
    const res = await respondidos[0]
    assert.equal(await res.text(), '<html>nuevo</html>')

    await new Promise((r) => setImmediate(r))
    assert.equal(await (await estatica.match('/index.html')).text(), '<html>nuevo</html>',
      'el HTML viejo debe quedar sustituido por el de red')
  })
})

test('navegación: sin red cae al HTML cacheado en vez de romperse', async () => {
  await conSw({ fallar: true }, async ({ manejadores, respondidos, abrirCache }) => {
    const estatica = abrirCache('navira-estatica-v3')
    estatica.entradas.set('/index.html', new Response('<html>offline</html>', {
      headers: { 'content-type': 'text/html' },
    }))

    manejadores.get('fetch')(eventoFetch('/', { mode: 'navigate' }))
    const res = await respondidos[0]
    assert.equal(await res.text(), '<html>offline</html>')
  })
})

test('navegación: sin red y sin caché responde error, no undefined', async () => {
  await conSw({ fallar: true }, async ({ manejadores, respondidos }) => {
    manejadores.get('fetch')(eventoFetch('/ruta-desconocida', { mode: 'navigate' }))
    const res = await respondidos[0]
    assert.ok(res instanceof Response, 'respondWith debe recibir siempre una Response')
    assert.equal(res.type, 'error')
  })
})

test('asset con hash: se sirve de caché sin tocar la red', async () => {
  let llamadas = 0
  await conSw({ respond: async () => { llamadas += 1; return resOk('de red') } },
    async ({ manejadores, respondidos, abrirCache }) => {
      const dinamica = abrirCache('navira-dinamica-v3')
      dinamica.entradas.set('https://navira-prueba.web.app/assets/chunk-abc123.js', resOk('de cache'))

      manejadores.get('fetch')(eventoFetch('/assets/chunk-abc123.js'))
      const res = await respondidos[0]

      assert.equal(await res.text(), 'de cache')
      assert.equal(llamadas, 0, 'un asset inmutable no debe volver a pedirlo a la red')
    })
})

test('soft-404: un HTML donde se esperaba un chunk NO se cachea', async () => {
  await conSw({ respond: async () => new Response('<html>app</html>', {
    status: 200, headers: { 'content-type': 'text/html' },
  }) }, async ({ manejadores, respondidos, cachés }) => {
    manejadores.get('fetch')(eventoFetch('/assets/chunk-cachado.js'))
    await respondidos[0]
    await new Promise((r) => setImmediate(r))

    const dinamica = cachés.get('navira-dinamica-v3')
    assert.equal(dinamica, undefined, 'no debe crearse caché con el HTML de error')
  })
})

test('un 404 de asset no se cachea', async () => {
  await conSw({ respond: async () => new Response('no', { status: 404 }) },
    async ({ manejadores, respondidos, cachés }) => {
      manejadores.get('fetch')(eventoFetch('/assets/ausente-123.js'))
      await respondidos[0]
      await new Promise((r) => setImmediate(r))

      const dinamica = cachés.get('navira-dinamica-v3')
      assert.equal(dinamica, undefined)
    })
})

test('la caché dinámica respeta el tope de entradas', async () => {
  await conSw({ respond: async () => resOk('x', 'text/css') },
    async ({ manejadores, respondidos, abrirCache }) => {
      const total = 70
      for (let i = 0; i < total; i += 1) {
        manejadores.get('fetch')(eventoFetch(`/assets/estilo-${i}.css`))
        await respondidos[respondidos.length - 1]
      }
      await new Promise((r) => setImmediate(r))

      const dinamica = abrirCache('navira-dinamica-v3')
      assert.ok(dinamica.entradas.size <= 60,
        `la caché debe recortarse a 60, se quedó en ${dinamica.entradas.size}`)
    })
})
