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
npm run dev
npm run capture:ui -- --label audit-final-appshell
```

Les captures sont écrites dans `captures-ui/<date>_<label>/`, avec un petit
rapport `rapport.json` (résumé OK / redirigées / erreurs / connecté). Ce
dossier est ignoré par git : ni les images ni le rapport ne sont commités.

## Variables d'environnement

- `PARENT_PREUVE_CAPTURE_URL` — URL de base à capturer (défaut :
  `http://localhost:3000`). Utile pour capturer une Vercel Preview sans
  lancer de serveur local, par exemple :

  ```bash
  PARENT_PREUVE_CAPTURE_URL=https://mon-preview.vercel.app npm run capture:ui -- --label preview-pr-123
  ```

- `TEST_EMAIL` / `TEST_PASSWORD` — optionnel. Si présents, le script se
  connecte avant de capturer les pages protégées, avec le même compte de
  test que les tests e2e.

  Pour les renseigner localement, ajouter dans `.env.local` (jamais commité) :

  ```bash
  TEST_EMAIL=compte-test@example.com
  TEST_PASSWORD=mot-de-passe-du-compte-test
  ```

  **Rappel** : `.env.local` ne doit jamais être commité (déjà ignoré par
  git, comme `captures-ui/`). N'utiliser que des identifiants d'un compte de
  test dédié, jamais un compte réel.

  Sans identifiants, les pages accessibles sont capturées quand même et les
  redirections (ex. vers `/connexion`) sont journalisées dans le résumé
  final. Dans ce cas, l'audit visuel des pages protégées reste à faire
  manuellement (connexion dans un navigateur, puis revue écran par écran).

### Détection de la connexion

La connexion est considérée réussie dès que l'un de ces signaux apparaît
(pas de dépendance à un seul texte fragile) :

- l'URL n'est plus `/connexion` ;
- le bouton « Se deconnecter » apparaît (session active) ;
- le formulaire de connexion disparaît du DOM ;
- à défaut, une page protégée (`/compte`) reste accessible sans redirection
  vers `/connexion`.

En cas d'échec, l'erreur est journalisée clairement (sans jamais afficher le
mot de passe) et le script continue les captures sans session, comme avant.

## Compte de test et audit authentifié

`TEST_EMAIL` / `TEST_PASSWORD` doivent correspondre à un compte Supabase
**confirmé et utilisable** (e-mail validé, mot de passe à jour). Si ce n'est
pas le cas, la connexion échoue silencieusement côté script : le résumé
affiche `Connecté : non` et toutes les pages protégées sont capturées en
redirection vers `/connexion` (comportement normal, pas un bug du script).

Avant de relancer une capture authentifiée :

1. Vérifier côté Supabase (dashboard Auth) que le compte de test existe
   toujours et que son e-mail est confirmé.
2. Réinitialiser le mot de passe si besoin et mettre à jour `.env.local`
   en conséquence.
3. Relancer :

   ```bash
   npm run capture:ui -- --label audit-final-auth
   ```

Ne jamais utiliser un compte réel pour ces captures, et ne jamais commiter
`.env.local`. Ce document ne décrit pas de procédure de création
automatique de compte de test : la vérification reste manuelle.

## Quoi contrôler visuellement après une capture

- **Desktop** : sidebar visible, contenu principal lisible, panneau d'aide
  contextuel présent sur les pages qui en ont un.
- **Mobile** : navigation (NavBar / menu) utilisable, pas de panneau d'aide
  superposé, pas de scroll horizontal forcé.
- **`/copilote`** : pas de panneau d'aide (volontairement absent sur cette
  page).
- **`/onboarding`** : wrapper assistant lisible, progression visible.
- **Thèmes** : si plusieurs thèmes sont configurés, refaire une capture par
  thème pour vérifier les contrastes (`--app-*`).
- **Pages protégées** (`/journal`, `/frais`, `/documents`, `/preuves`,
  `/calendrier`, `/compte`, `/exporter`, `/copilote`) : vérifier qu'elles
  sont bien capturées avec session (et non redirigées vers `/connexion`)
  quand `TEST_EMAIL` / `TEST_PASSWORD` sont renseignés.
