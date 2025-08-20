const CACHE_NAME = "poolspel-cache-v1";
const urlsToCache = [
  "/Poolspelsverktyget/",
  "/Poolspelsverktyget/index.html",
  "/Poolspelsverktyget/styles.css",
  "/Poolspelsverktyget/app.js",
  "/Poolspelsverktyget/icons/icon-192.png",
  "/Poolspelsverktyget/icons/icon-512.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
