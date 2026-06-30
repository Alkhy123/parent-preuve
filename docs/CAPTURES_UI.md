# Captures UI (avant/après lots AppShell)

Outil local de revue visuelle. Capture des écrans desktop (1440x1000) et
mobile (390x844) de l'accueil et des pages principales, pour comparer
visuellement l'état de l'application avant/après une série de lots. N'écrit
rien en base et ne modifie aucune donnée. Les images ne sont jamais commitées
(`captures-ui/` est ignoré par git).

## Prérequis

```bash
npm install
npm run e2e:install        # télécharge Chromium pour Playwright
```

## Utilisation

```bash
npm run capture:ui -- --label baseline-main
```

Les captures sont écrites dans `captures-ui/<date>_<label>/`.

## Variables d'environnement

- `PARENT_PREUVE_CAPTURE_URL` — URL de base à capturer (défaut : `http://localhost:3000`).
- `TEST_EMAIL` / `TEST_PASSWORD` — optionnel. Si présents (`.env.local` ou
  environnement), le script se connecte avant de capturer les pages protégées,
  avec le même compte de test que les tests e2e. Sans identifiants, les pages
  accessibles sont capturées quand même et les redirections (ex. vers
  `/connexion`) sont journalisées dans le résumé final.
