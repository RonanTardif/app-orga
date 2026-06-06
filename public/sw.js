// D-02 : le cache inclut la date du jour pour s'auto-invalider à chaque nouveau déploiement.
// Un nouveau SW est activé dès que la date change (minuit) ou qu'on bumpe la date manuellement.
const CACHE_DATE = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
const CACHE_NAME = `mariage-v1-${CACHE_DATE}`

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Stratégie cache-first pour les assets statiques
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response
        }

        const cloned = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned))
        return response
      })
    })
  )
})
