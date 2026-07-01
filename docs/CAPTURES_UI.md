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

## Captures variantes UI

Outil dédié aux deux variantes d'interface (`board10` / `vue-ensemble`) et
aux deux modes d'accompagnement (`guided` / `comfort`).

Produit **32 captures** : 4 pages × 4 combinaisons × 2 viewports.

### Commande

```bash
npm run captures:ui-variants
```

### Pré-requis

- Serveur local lancé (`npm run dev`).
- Chromium Playwright installé (`npm run e2e:install`).
- Compte de test configuré dans `.env.local` (cf. section Variables d'environnement ci-dessus).
- Dossier `design-ui-bank/` disponible pour comparaison visuelle manuelle.

### Pages capturées

| Route | Nom |
|---|---|
| `/` | home |
| `/collecter` | collecter |
| `/organiser` | organiser |
| `/exporter` | exporter |

### Combinaisons

| interfaceStyle | comfortMode |
|---|---|
| board10 | guided |
| board10 | comfort |
| vue-ensemble | guided |
| vue-ensemble | comfort |

### Fichiers de sortie

```
captures-ui/<AAAA-MM-JJ>_ui-variants/
  desktop_home_board10_guided.png
  mobile_home_board10_guided.png
  desktop_home_board10_comfort.png
  mobile_home_board10_comfort.png
  desktop_home_vue-ensemble_guided.png
  mobile_home_vue-ensemble_guided.png
  desktop_home_vue-ensemble_comfort.png
  mobile_home_vue-ensemble_comfort.png
  desktop_collecter_board10_guided.png
  mobile_collecter_board10_guided.png
  ... (32 fichiers au total)
  rapport.json
```

### Rapport JSON

`rapport.json` contient :
- date, URL de base, état de connexion, procédure active ;
- liste des captures OK (fichier, page, viewport, comfortMode, interfaceStyle, durée) ;
- redirections éventuelles (page non connectée) ;
- erreurs éventuelles.

### Critères de contrôle visuel par page

**Accueil (`/`)**
- Board10 : prochaine action visible en premier plan ; CTA hero bien ancré en haut.
- Vue d'ensemble : dossier actif + indicateurs chiffrés ; modules accessibles.
- Guided : aide contextuelle HomeGuidedHint visible en bas.
- Comfort : aide contextuelle absente.

**Collecter (`/collecter`)**
- Board10 : CTA hero full-width (Ajouter un élément) ; grille 3+2 tuiles lisibles.
- Vue d'ensemble : étapes 3-col, cartes détaillées avec badges.
- Mobile : grille compacte, pas de scroll horizontal.

**Organiser (`/organiser`)**
- Board10 : liste de liens avec icônes colorées ; CTA chronologie visible.
- Vue d'ensemble : piliers + structure dossier + classement.
- Sidebar : groupe Organiser ouvert/actif.

**Exporter (`/exporter`)**
- Board10 : hero "Préparer un document" + grille 2×2 modèles + état dossier + grand CTA.
- Vue d'ensemble : piliers + 4 exports prioritaires + formats complémentaires.
- CTA final (board10) : "Préparer l'export" visible en bas.

**Navigation (toutes pages, desktop)**
- Aucune navbar horizontale legacy sur `/collecter`, `/organiser`, `/exporter`.
- Sidebar AppShell visible avec groupes Collecter/Organiser/Exporter.
- Groupe actif de la page ouvert automatiquement.

### Comparaison avec design-ui-bank/

Références de comparaison :
- `design-ui-bank/02_INTERFACE_BOARD10_GUIDAGE/` — référence visuelle Board10
- `design-ui-bank/03_INTERFACE_VUE_ENSEMBLE_DASHBOARD/` — référence Vue d'ensemble
- `design-ui-bank/04_PAGES_MOBILE_PARCOURS/` — référence mobile Collecter / Exporter
- `design-ui-bank/06_APP_ACTUELLE_REFERENCES/` — état de référence avant refonte
