/* ============================================================
   SERVICE WORKER - HINÁRIO DIGITAL
   Cache agressivo "cache-first" para funcionar 100% offline.
   Sempre que você alterar dados.js, style.css ou app.js,
   AUMENTE a versão do cache abaixo (ex: v1 -> v2) para forçar
   o celular dos usuários a baixar a versão nova.
   ============================================================ */

const CACHE_VERSION = "hinario-v1";

// Arquivos essenciais para o app abrir sem internet.
// Se você adicionar imagens locais (ex: icons/icon-192.png),
// inclua o caminho delas aqui também.
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./dados.js",
  "./manifest.json"
  /* ADICIONE_AQUI_OS_CAMINHOS_DE_IMAGENS_LOCAIS_SE_TIVER (ex: "./icons/icon-192.png") */
];

// ---------- INSTALAÇÃO: baixa e guarda o "esqueleto" do app ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ---------- ATIVAÇÃO: limpa caches de versões antigas ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ---------- FETCH: estratégia cache-first, com atualização em segundo plano ----------
self.addEventListener("fetch", (event) => {
  // Apenas requisições GET entram no cache
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Busca uma versão nova em paralelo (stale-while-revalidate)
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type !== "opaque"
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // sem internet: usa o cache

      // Responde na hora com o cache (se existir); senão espera a rede
      return cachedResponse || networkFetch;
    })
  );
});