const CACHE_PREFIX = 'derej-master-';
const CACHE = 'derej-master-v2.0-rc1-20261002-01';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './config.js',
  './manifest.webmanifest',
  './radio.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './content/camino-weeks.json',
  './content/shabbat.json',
  './content/shabbat-raiz-bendicion.json',
  './content/sukkot.json',
  './content/sukkot-beit-midrash.json',
  './content/adam-adama.json',
  './content/adam-adama-practicas-b1.json',
  './biblioteca-camino-parasha.html',
  './biblioteca-shabat.html',
  './biblioteca-moed.html',
  './biblioteca-adam-adama.html',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Audio/streaming and range requests stay under native browser/network control.
  if (request.headers.has('range') || /\.(mp3|m4a|wav|ogg)$/i.test(url.pathname)) return;

  // Never intercept Supabase, Drive, external readers, fonts, etc.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const scopePath = new URL(self.registration.scope).pathname;
    const isAppShell = url.pathname === scopePath || url.pathname === `${scopePath}index.html`;

    if (!isAppShell) {
      const isStudyModule = /\/biblioteca-(camino-parasha|shabat|moed|adam-adama)\.html$/.test(url.pathname);
      // Standalone study modules may fall back to their own cached page; admin pages never fall back to the app shell.
      event.respondWith(fetch(request).catch(() => isStudyModule ? caches.match(request) : Promise.reject(new Error('offline'))));
      return;
    }

    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put('./index.html', copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
