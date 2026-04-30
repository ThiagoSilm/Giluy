const CACHE_NAME = 'giluy-onnx-v1';
const MODEL_URL = '/models/gemma-surgical-classifier-v1-int8.onnx';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRECACHE_MODEL') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(MODEL_URL).then((response) => {
          if (!response) {
            console.log('[ServiceWorker] Precaching ONNX model in background...');
            return cache.add(MODEL_URL);
          }
          console.log('[ServiceWorker] ONNX model already cached.');
        });
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes(MODEL_URL)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
