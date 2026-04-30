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

async function verifyHash(response, expectedHash) {
  // Em produção, valida o hash real do arquivo carregado antes de guardar no cache.
  if(!expectedHash) return true;
  try {
    const clone = response.clone();
    const buffer = await clone.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === expectedHash;
  } catch (e) {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  if (MODEL_URLS.some(url => event.request.url.includes(url))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(async (networkResponse) => {
          // Hardcoded expected hashes mapping would go here for each URL
          const isValid = await verifyHash(networkResponse, /* expected hash */ null);
          if (isValid) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
    );
  }
});
