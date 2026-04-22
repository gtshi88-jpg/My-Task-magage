const CACHE_NAME = "task-magage-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.webmanifest",
  "/task-management.ico",
  "/bg-app.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        const clonedResponse = networkResponse.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, clonedResponse))
          .catch(() => {
            // Ignore cache write failures (e.g. opaque responses).
          });
        return networkResponse;
      });
    }),
  );
});
