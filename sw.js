const CACHE_NAME = "metaup-cache-v12";
const FILES_TO_IGNORE = [
    "manifest.json"
];

/* Instalação */
self.addEventListener("install", (event) => {
    console.log("[SW] Instalando nova versão...");
    self.skipWaiting();
});

/* Ativação */
self.addEventListener("activate", (event) => {
    console.log("[SW] Ativando nova versão...");

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("[SW] Removendo cache antigo:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

/* Interceptação de requests */
self.addEventListener("fetch", (event) => {
    const requestURL = new URL(event.request.url);

    // 🔥 NÃO CACHEAR JSON (sempre atualizado)
    if (requestURL.pathname.endsWith(".json")) {
        event.respondWith(
            fetch(event.request, { cache: "no-store" })
        );
        return;
    }

    // Estratégia: Network First
    event.respondWith(
        fetch(event.request)
            .then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => caches.match(event.request))
    );
});

/* Comunicação com a página */
self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") {
        console.log("[SW] Pulando espera...");
        self.skipWaiting();
    }
});
