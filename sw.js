const CACHE_NAME = "app-igreja-v1";
const arquivos = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/dados.js",
  "/manifest.json",
  "/icone.png"
];

// Instala o cache
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(arquivos);
    })
  );
});

// Responde offline
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((resposta) => {
      return resposta || fetch(evento.request);
    })
  );
});