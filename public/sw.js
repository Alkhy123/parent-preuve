// public/sw.js
// Service worker de Parent Preuve — ÉTAPE 3 : coquille hors-ligne + mise à jour.
//
// RÈGLE DE SÉCURITÉ ABSOLUE :
// on ne met en cache QUE la coquille de l'app (HTML, CSS, JS statiques same-origin).
// JAMAIS de données : ni /api/, ni Supabase (données + Storage), ni Mistral.
// Tout ce qui n'est pas same-origin, ou qui est sous /api/, part DIRECT au réseau
// et n'est jamais stocké localement.

const VERSION = "v3";
const CACHE = `parent-preuve-${VERSION}`;

// Coquille minimale pré-chargée à l'installation.
const COQUILLE = ["/"];

// --- Cycle de vie -----------------------------------------------------------

self.addEventListener("install", (event) => {
  // On précharge la coquille, mais on NE force PAS l'activation :
  // une nouvelle version doit rester "en attente" pour afficher le bandeau.
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(COQUILLE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Suppression des anciens caches d'une version précédente.
      const noms = await caches.keys();
      await Promise.all(
        noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// --- Interception des requêtes ---------------------------------------------

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 1) On ne touche QU'aux lectures (GET). Le reste part au réseau.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 2) Tout ce qui n'est pas notre propre domaine part au réseau et n'est
  //    jamais mis en cache. Cela exclut Supabase (*.supabase.co, données ET
  //    Storage via URLs signées) et Mistral (api.mistral.ai).
  if (url.origin !== self.location.origin) return;

  // 3) Nos routes serveur sensibles ne sont jamais mises en cache.
  if (url.pathname.startsWith("/api/")) return;

  // 4) Navigation vers une page (l'utilisateur ouvre/recharge une page) :
  //    réseau d'abord, cache en secours si hors-ligne.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const reseau = await fetch(req);
          // On met à jour la coquille en cache (réponses saines uniquement).
          if (reseau && reseau.ok && reseau.type === "basic") {
            const copie = reseau.clone();
            const cache = await caches.open(CACHE);
            cache.put("/", copie);
          }
          return reseau;
        } catch {
          // Hors-ligne : on sert la coquille pré-chargée.
          const cache = await caches.open(CACHE);
          const secours = await cache.match("/");
          return secours || Response.error();
        }
      })()
    );
    return;
  }

  // 5) Fichiers statiques de l'app (JS/CSS buildés, icônes) : cache d'abord,
  //    réseau en secours. Ces fichiers sont versionnés (hash) → sûrs à cacher.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const enCache = await cache.match(req);
        if (enCache) return enCache;
        try {
          const reseau = await fetch(req);
          if (reseau && reseau.ok && reseau.type === "basic") {
            cache.put(req, reseau.clone());
          }
          return reseau;
        } catch {
          return Response.error();
        }
      })()
    );
    return;
  }

  // 6) Tout le reste : comportement par défaut du navigateur (réseau).
});