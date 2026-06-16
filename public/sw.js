// public/sw.js
// Service worker de Parent Preuve — ÉTAPE 1 : cycle de vie seul.
// Pour l'instant il NE met RIEN en cache et n'intercepte AUCUNE requête.
// Le cache de la coquille viendra à l'étape 3.

// Numéro de version. Le SEUL fait de changer ce fichier (même ce numéro)
// suffit à ce que le navigateur détecte une "nouvelle version".
const VERSION = "v2";

// Phase 1 : installation du nouveau service worker.
// On NE force PAS l'activation ici : on veut qu'une nouvelle version
// reste "en attente" pour pouvoir afficher le bandeau à l'utilisateur.
self.addEventListener("install", () => {
  // Rien à faire pour l'instant.
});

// Phase 2 : activation. Une fois actif, ce service worker prend
// immédiatement le contrôle des pages déjà ouvertes.
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Canal de communication : la page peut demander au service worker
// "en attente" de s'activer tout de suite (déclenché par le bouton
// "Recharger" du bandeau, à l'étape 2). Sans ce message, le nouveau
// service worker ne s'active jamais de force.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});