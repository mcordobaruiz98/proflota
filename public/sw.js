// sw.js - Service Worker para NAVIRA (Soporte Offline PWA)
const CACHE_NAME = 'navira-cache-v2';
const DYNAMIC_CACHE_NAME = 'navira-dynamic-v2';

// Recursos estáticos iniciales
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/logo-navira.png',
  '/logo-naviraT.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icons.svg'
];

// Instalar Service Worker y cachear recursos iniciales
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar cachés viejos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  console.log('[Service Worker] Activado y listo');
  self.clients.claim();
});

// Interceptar peticiones y servir desde red/caché
self.addEventListener('fetch', (e) => {
  // Ignorar llamadas de Firebase (Auth, Firestore, Storage) y Google Fonts
  // Firebase maneja su propia persistencia local; no debe ser cacheada por el SW
  if (
    e.request.url.includes('firestore.googleapis.com') ||
    e.request.url.includes('firebase') ||
    e.request.url.includes('googleapis') ||
    e.request.url.includes('google')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Si la petición es exitosa, guardar una copia en el caché dinámico
        const resClone = res.clone();
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // Si falla la red (offline), buscar en los cachés
        return caches.match(e.request).then((cachedRes) => {
          if (cachedRes) {
            return cachedRes;
          }
          // Si no está en caché y es un archivo HTML (rutas de React Router), servir index.html
          if (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
