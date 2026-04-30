const CACHE_NAME = 'giluy-onnx-v3';
const MODEL_URLS = [
  '/models/gemma-tokenizer-v1.onnx',
  '/models/gemma-embeddings-v1-int8.onnx',
  '/models/gemma-classifier-fused-v1-int8.onnx'
];

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
        return Promise.all(
          MODEL_URLS.map(url => {
            return cache.match(url).then((response) => {
              if (!response) {
                console.log(`[ServiceWorker] Precaching ONNX part in background: ${url}`);
                return cache.add(url);
              }
            });
          })
        );
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  if (MODEL_URLS.some(url => event.request.url.includes(url))) {
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
