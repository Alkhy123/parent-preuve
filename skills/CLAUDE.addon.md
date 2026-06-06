# Parent Preuve — règles Claude recommandées

À ajouter dans `CLAUDE.md` à la racine du projet.

## Contexte obligatoire

Toujours lire avant une tâche importante :

- `@PARENT_PREUVE_CONTEXTE.md`
- `@AGENTS.md` si présent

## Skills recommandées

Utiliser les skills suivantes selon la tâche :

- `/parent-preuve-context` au début d’une tâche importante
- `/jugement-pdf-import` pour l’import PDF du jugement
- `/mistral-json-extraction` pour toute extraction IA
- `/supabase-rls-parent-preuve` pour Supabase, RLS, Storage ou Auth
- `/rgpd-donnees-familiales` pour données sensibles, IA, enfants, jugements, logs
- `/preuve-photo-mobile` pour preuve photo, GPS, horodatage, QR, mobile
- `/judicial-pdf-export` pour exports PDF, bordereaux, synthèses
- `/regles-par-enfant` pour rattachement des règles à un enfant
- `/calculs-deterministes-dossier` pour pension, frais, reste dû, indexation
- `/mobile-pwa-transition` pour préparer le passage mobile/PWA
- `/legal-security-code-review` avant de finaliser une grosse modification
- `/parent-preuve-ui` pour pages, composants et design

## Règles absolues

- Ne jamais présenter Parent Preuve comme un avocat.
- Ne jamais présenter une preuve photo comme équivalente à un constat de commissaire de justice.
- IA : l’IA propose, l’utilisateur valide.
- Toute écriture IA doit être `source='ia'` et `valide=false`.
- Ne jamais exposer de clé API côté client.
- Ne jamais désactiver RLS.
- Ne jamais logger de jugement complet, données enfant, données de santé ou contenu sensible.
- Expliquer simplement, étape par étape, avec fichiers exacts et tests.
