/* 筋道 — service worker.

   The app is one static HTML file, so offline support is mostly "keep a copy".
   The page is served stale-while-revalidate: you get the cached copy instantly
   (it is ~700KB, and waiting for that on mobile data before the first card
   appears would be miserable), while a fresh copy is fetched in the background
   for next launch. Everything else is cache-first.

   Bump CACHE whenever you republish, or phones keep serving the old copy. */
const CACHE = 'sujimichi-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './apple-touch-icon.png',
  './icons/paper.png',
  './icons/icon.svg',
  './icons/icon-16.png',
  './icons/icon-32.png',
  './icons/icon-48.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  // addAll would fail the whole install over one missing icon, so add each
  // asset on its own and let a 404 be survivable.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;

  const isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);

  e.respondWith(
    caches.open(CACHE).then(cache => cache.match(req, { ignoreSearch: isPage }).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok) cache.put(isPage ? './index.html' : req, res.clone());
        return res;
      }).catch(() => null);

      if (hit) {
        if (isPage) e.waitUntil(net);       // refresh in the background for next time
        return hit;
      }
      return net.then(res => res || (isPage ? cache.match('./index.html') : Response.error()));
    }))
  );
});
