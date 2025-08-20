// Namn på cache
const CACHE_NAME = "poolspel-cache-v1";

// Filer som ska cachas vid installation
const urlsToCache = [
  "/Poolspelsverktyget/",
  "/Poolspelsverktyget/index.html",
  "/Poolspelsverktyget/styles.css",
  "/Poolspelsverktyget/app.js",
  "/Poolspelsverktyget/icons/icon-192.png",
  "/Poolspelsverktyget/icons/icon-512.png"
];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event (rensar gamla cacher)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event (cache first, fallback to network)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
