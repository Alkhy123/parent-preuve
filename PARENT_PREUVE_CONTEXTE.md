# Parent Preuve — Contexte SOCLE (à charger en début de chaque conversation)

> **Rôle de ce fichier.** C'est le **socle invariant** du projet : la mission, les règles
> juridiques, le cadre IA, le modèle central, la stack et la méthode de travail. Il bouge
> rarement. **Charge-le en premier dans chaque nouvelle conversation.**
>
> **Deux fichiers compagnons** (à charger seulement quand la tâche le demande) :
> - **`PARENT_PREUVE_REFERENCE.md`** → état réel daté, schéma Supabase complet, carte des
>   fichiers, dette technique, backlog. À ouvrir pour coder, toucher la base, ou faire un audit.
> - **`PARENT_PREUVE_ROADMAP_UX.md`** → vision produit cible, idées de fonctionnalités,
>   arborescence de navigation par thème. À ouvrir pour le travail produit / UX / nav.
>
> *(Les docs du site vitrine restent à part : `VITRINE_PARENT_PREUVE_BRIEF.md` et
> `prompt_claude_refonte_design_parent_preuve.md`.)*

---

## 0. À lire en premier — règles de priorité

1. **Le code réel fait foi.** En cas de contradiction entre un fichier de contexte et le code
   du dépôt, c'est le code qui gagne. Signaler l'écart clairement **avant** de modifier.
2. **Pas de dossier `src/`.** Tout est à la racine : `app/`, `components/`, `lib/`. Tout chemin
   en `src/...` dans d'anciennes notes (ou d'anciens skills) est **obsolète**.
3. **Vérifier en live** plutôt que se fier aux docs : le dépôt est
   `Alkhy123/parent-preuve`, branche `main`. Tarball d'inspection :
   `curl -sL "https://codeload.github.com/Alkhy123/parent-preuve/tar.gz/refs/heads/main"`.
4. **Optimiser les tokens.** Ce socle suffit pour raisonner ; ne charger les fichiers compagnons
   que si la tâche l'exige. Ne pas recoller tout le projet sans nécessité.

---

## 1. Vision produit — la boussole

> **Phrase de mission (boussole de décision, PAS un texte d'interface) :**
> *« Quand tout est confus, Parent Preuve remet de l'ordre dans les faits pour que le
> parent reprenne pied. »*

À chaque arbitrage : **est-ce que ça aide le parent à remettre de l'ordre et à reprendre
pied ?** Si oui → dans la trajectoire. Si ça ajoute de la confusion ou franchit la ligne du
conseil juridique → dehors.

**Le vrai problème résolu.** Le parent séparé en conflit (après JAF) est submergé sur **trois
fronts** : le juridique qu'il ne maîtrise pas, les éléments concrets à produire qu'il ne sait
pas identifier, et l'émotion qui brouille son jugement. La fonction première : **réduire la
charge mentale** et **montrer le chemin** (« voilà où tu en es, voilà ce qui manque, voilà
l'étape suivante »).

**Outil SOLO.** Parent Preuve s'adresse à **un seul parent**, seul face au conflit, qui
constitue un dossier factuel. On **n'invite pas** l'autre parent. C'est l'inverse des apps de
coparentalité collaboratives (2houses, OurFamilyWizard…) : on leur emprunte la **clarté**, jamais
le **ton léger** ni le **vocabulaire collaboratif**. L'identité navy/or sérieuse est un atout.

**⚠️ Garde-fou de vocabulaire.** Ne JAMAIS écrire « assistant juridique ». Décrire la
**fonction** (mettre de l'ordre), jamais la **promesse** (dire quoi faire en droit). Type :
**« votre aide pour organiser un dossier clair et factuel »**.

**Cible à terme** : application mobile (React Native/Expo ou PWA). Le backend Supabase est
entièrement réutilisable ; seule l'interface évoluera. Tout choix technique doit en tenir compte.
Une app Expo séparée existe déjà (`Alkhy123/parent-preuve-mobile`, SDK 54 pinné).

### Deux modes d'usage (à garder en tête pour tout travail UI)
1. **Capture rapide** — un événement survient (retard, non-représentation, dépense, photo) ; le
   parent est sur le moment, stressé, souvent sur mobile. La **vitesse prime**.
2. **Gestion de dossier** — plus tard, au calme : soldes, état, courrier. La **vue d'ensemble
   prime**.

Direction retenue : l'**accueil sert la gestion de dossier** (tableau de bord) ; la **capture
rapide vit par-dessus** via un bouton flottant universel. Invariant non négociable :
**« l'IA propose, l'utilisateur valide »**.

---

## 2. Positionnement juridique — règles absolues

Ne jamais écrire ou laisser entendre que l'application : remplace un avocat · donne un conseil
juridique personnalisé · remplace un commissaire de justice · certifie une preuve comme un
constat · garantit la recevabilité d'une preuve · garantit une issue judiciaire.

Formulations **autorisées** : « aide à l'organisation du dossier » · « aide à la rédaction
factuelle » · « preuve numérique renforcée » · « preuve scellée et horodatée » · « traçabilité
renforcée » · « soumis à l'appréciation du juge » · « à faire relire par un professionnel du
droit si nécessaire ».

**Preuves photo** = « preuve numérique renforcée, scellée et horodatée ». Horodatage actuel
**non qualifié au sens eIDAS** (à dire honnêtement partout, avertissement sur chaque export PDF).
Jamais présenté comme équivalent à un constat de commissaire de justice.

**Élément matériel oui, élément moral jamais.** L'app documente des faits constatables (montant
dû, montant payé, date, absence de remboursement, existence d'une clause, modalité de visite,
échéance). Elle ne qualifie **jamais** l'intention ni le caractère volontaire : pas d'« abandon
de famille », « mauvaise foi », « mensonge », « manipulation », « pervers narcissique ».
Préférer : « il ressort de la pièce… », « le texte mentionne… », « l'utilisateur indique… »,
« cet élément pourrait être soumis à l'appréciation du juge ».

> **Articles de loi : saisis et vérifiés par l'utilisateur, jamais inventés ni générés par l'IA.**

Vocabulaire des pièces : éviter « inviolable » ou « certifié » → préférer « espace de pièces »
ou « stockage renforcé ». « Manquement » est acceptable **dans un courrier signé par
l'utilisateur**, mais jamais dans ce que l'app **conclut elle-même**.

---

## 3. Cadre IA — « l'IA propose, l'utilisateur valide »

- **Aucune écriture IA en base sans validation humaine.** Relecture obligatoire des sorties.
- Toute proposition IA est tracée `source='ia'` et reste `valide=false` jusqu'à validation.
- L'IA **n'invente pas**, **ne qualifie pas** juridiquement, **n'infère pas** l'intention d'un
  parent, **n'infère pas** un statut procédural depuis le seul type de décision. Elle **signale
  ses incertitudes** et **cite le passage source** quand elle extrait une règle.
- **Mistral** (fournisseur UE/RGPD), appels **côté serveur uniquement**, clé jamais en
  `NEXT_PUBLIC_`. Sous-traitant RGPD nommé (DPA art. 28).
- **Non HDS** → minimisation stricte (jamais de données de santé envoyées à l'IA).
- **Anti-hallucination** : sorties **JSON structurées** validées ; **invariant `valeur: null`
  ⇒ `confiance: "absente"`**. Format par champ : `{ valeur, confiance, citation }`.
- **Consentement IA granulaire** par fonctionnalité (table `consentements_ia`).
- **Quota durable fail-closed** : erreur de comptage → refus, jamais permission implicite.
- **Déterministe d'abord** : l'IA seulement là où c'est nécessaire.
- **`ConsentementIA.tsx`** est la « porte » réutilisable qui enveloppe toute fonctionnalité IA.

---

## 4. ⭐ Modèle central — le cloisonnement par PROCÉDURE

**Le bon conteneur du dossier n'est pas l'enfant, mais la PROCÉDURE.**

- Une **procédure** = **un autre parent + son jugement**. Un parent peut avoir des enfants de
  plusieurs ex → **plusieurs procédures**.
- **Règle de regroupement** : les enfants ayant le **même autre parent** partagent la **même
  procédure** (même jugement, mêmes règles pension/DVH/frais/décision). Autre parent différent =
  procédure séparée.
- **Granularité fine conservée** : documents, preuves, événements et frais restent rattachés à
  l'**enfant**. Comme un enfant appartient à une procédure, le filtrage par procédure en découle.
  Les lignes **sans enfant** sont traitées comme **« générales »** (visibles dans toutes les
  procédures).
- **Procédure active** : `lib/procedureActive.ts` est le point unique (lecture/écriture en
  `localStorage`, clé `procedure_active_id`). `getEnfantsDeProcedureActive()` est ce que chaque
  écran « par enfant » utilise pour se filtrer. Sélection visible via `SelecteurProcedure.tsx`
  (NavBar) + `BandeauProcedure.tsx` (layout, toutes pages). Changer de procédure recharge la page.
- **Tous les écrans liés à l'enfant sont cloisonnés.** Seule exception **voulue** : `/enfants`
  charge **tous** les enfants (toutes procédures) — c'est le hub où on répartit les enfants.

> Détail des colonnes `procedure_id`, du patron des tables règles et des écrans concernés :
> voir **`PARENT_PREUVE_REFERENCE.md` §Schéma Supabase**.

---

## 5. Stack technique (versions réelles)

- **Framework** : Next.js **16.2.6** (App Router), TypeScript 5. Route serveur = `route.ts`,
  **une fonction par méthode HTTP**, `await request.json()`, `Response.json({...})`. En Next.js
  16, `headers()`/`cookies()` sont **async**. **Jamais de `page.tsx` sous `app/api/`.**
- **UI** : React **19.2.4**, Tailwind CSS 4 (`@tailwindcss/postcss`).
- **Backend** : Supabase (PostgreSQL + Auth + Storage), **RLS partout**, buckets privés. Client
  navigateur `@/lib/supabase` (clé anon, protégée par RLS). Auth **entièrement côté navigateur**
  (pas de `@supabase/ssr`, pas de middleware) ; les routes serveur lisent la session via **token
  Bearer**. `SUPABASE_SERVICE_ROLE_KEY` réservée à `lib/supabaseAdmin.ts`.
- **IA** : Mistral, `https://api.mistral.ai/v1/chat/completions`, Bearer. Reformulation
  `temperature: 0.2` ; extraction `temperature: 0` + `response_format json_object`. OCR scanné :
  `/v1/ocr`. ⚠️ Les alias `-latest` sont en cours de dépréciation → migrer vers des identifiants
  versionnés quand l'occasion se présente.
- **PDF** : `jspdf` ^4.2 + `jspdf-autotable` ^5 (images gérées nativement) **et `pdf-lib` ^1.17**
  (fusion de PDF existants, utilisé par `lib/exportNotePdf.ts`).
- **Lecture PDF numérique** : `unpdf` ^1.6 (ESM-only ; `extractText(pdf, { mergePages: true })`).

### Environnement & déploiement
- **En ligne** : `https://parent-preuve.vercel.app` (Vercel Hobby, déploiement auto sur push `main`).
- **`.env.local`** (racine, jamais commité) : `HORODATAGE_SECRET` · `MISTRAL_API_KEY` (jamais
  `NEXT_PUBLIC_`) · `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou
  `ANON_KEY`) · `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement) · `NODE_OPTIONS=--use-system-ca`
  (correctif TLS Windows — **jamais sur Vercel**).
- **Vercel (Production)** : mêmes variables **sauf** `NODE_OPTIONS`. ⚠️ `HORODATAGE_SECRET`
  **immuable après déploiement** (il signe les preuves existantes). Auth Supabase : Site URL +
  Redirect URLs sur le domaine Vercel.
- Après modif de `.env.local` ou création d'un dossier de route/page : **Ctrl+C puis
  `npm run dev`** (sinon 404 trompeur).

---

## 6. Identité visuelle

- **Palette** : Navy `#15233F` · Or `#C2A24C` · Texte `#1F2733`. **Fond de page** : crème
  profond `#ECE7DC` ; **crème clair `#F8F6F1`** (token `--surface`) réservé aux cartes. Gris
  accordé navy pour les libellés : `#5A6473`.
- **Couleurs de statut** (distinctes de l'or) : vert `#2E6A4D`, rouge `#9B2C2C`, ambre `#8A5A12`.
- **Titres** : Playfair Display (`.font-display`). Police de corps : Geist.
- **Composants socles à réutiliser** : `PageHeader.tsx` (bandeau navy), `EncartPliable.tsx`
  (encart crème pliable, props `idPersistance`/`signalFermeture`), `.carte` (ombre teintée navy).
- **Tokens de design** centralisés dans `app/globals.css` (variables CSS + tokens Tailwind
  `bg-navy`, `text-or`, `bg-surface`, `text-texte-doux`, `text-vert/rouge/amber`). Migration des
  hex en dur vers les tokens = **progressive**, page par page.

### Apprentissages design (à réappliquer)
- **Jamais de double séparation** : soit l'ombre `.carte`, soit une bordure dure — pas les deux.
- **Bannir les gris Tailwind par défaut** (`slate`/`gray`) → gris accordés à la palette.
- **L'or reste rare** : un seul accent fort par écran.
- **Une seule action principale par écran** (bouton plein navy, texte crème).
- **Rester sur l'échelle d'espacement Tailwind.**

---

## 7. Conventions de travail & environnement

### Méthode (développeur débutant, méthodique) — non négociable
- Expliquer simplement, **chemins/fichiers exacts**, **un petit pas testable à la fois**, un
  **test concret** (URL ou commande) + résultat attendu après chaque étape.
- **Valider le plan avant d'écrire le moindre code.** N'avancer qu'après un **go-ahead explicite**
  (« Oui on peut y aller », « C'est bon ») entre chaque phase.
- **Ordre** : table/SQL d'abord → logique pure → composant → branchement de page.
- **Remplacement complet du fichier** quand un fichier change à plusieurs endroits (plus sûr pour
  copier-coller, surtout sur mobile) ; **patch ciblé** pour un changement vraiment localisé.
- **Réutiliser l'existant (DRY)** : `PageHeader`, `EncartPliable`, `ConsentementIA`, les 4
  `RegleX`, `dossierCalculs.ts`, `procedureActive.ts`, `/api/ia/reformuler`, `/api/ia/extraire`,
  patterns Supabase/RLS.
- **Anti-dispersion** : ne pas proposer 10 solutions si une suffit. Recommander une option
  principale, mentionner brièvement l'alternative, expliquer pourquoi.
- **Anti-surarchitecture** : pas de nouvelle table/couche/service si l'existant suffit.

### Workflow réel (mobile **et** PC)
- Souvent **sur téléphone**, en collant les fichiers directement sur **github.com** (crayon →
  tout sélectionner → coller → *Commit changes* ; nouveau fichier via *Add file → Create new
  file*, on peut taper `docs/NOM.md` pour créer un sous-dossier). Vercel redéploie sur push.
- Sur **PC (Cursor)** : `git pull`, `npm install`, recréer `.env.local`, `npm run dev` pour
  vérifier avant `git add/commit/push`.
- ⚠️ **Pièges vécus** : (1) mauvaise extension (`.ts` au lieu de `.tsx` pour du JSX) casse le
  build ; (2) un collage « confirmé » mais **non commité** ne part pas ; (3) **deux clones locaux**
  → pousser depuis le mauvais dossier donne « nothing to commit » ; (4) « rien ne s'affiche »
  alors qu'un autre changement marche → ouvrir Vercel **Deployments** ; un build en **Error**
  (rouge) = Vercel sert l'ancienne version.

### PowerShell / Windows
- Tester une route serveur (textes **sans accents** dans `-Body`) :
  `Invoke-RestMethod -Uri … -Method Post -ContentType "application/json" -Body '…'`.
  ⚠️ `curl` = alias d'`Invoke-WebRequest` → préférer `Invoke-RestMethod`.
- **TLS Windows** : `NODE_OPTIONS=--use-system-ca` (script `dev`, via `cross-env`) règle
  `UNABLE_TO_VERIFY_LEAF_SIGNATURE` (inspection HTTPS antivirus). **Jamais sur Vercel.**
- Secret aléatoire (pas d'`openssl` par défaut) :
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

### Pièges Next.js 16
- `next build` ne lance plus ESLint → le lint ne bloque pas Vercel. **Le type-check TS bloque** →
  vérifier `npx tsc --noEmit` en cas de doute sur un build Vercel.
- Nouveau dossier de route/page → redémarrer `npm run dev`.
- Nommage des fichiers en **lowercase** (Linux/Vercel sont sensibles à la casse).

---

## 8. Checklist avant toute réponse de code
- Positionnement juridique respecté (pas de conseil, pas de promesse de résultat) ?
- **Cloisonnement par procédure respecté** (lecture/écriture via la procédure active, lignes sans
  enfant traitées comme générales) ?
- Secrets côté serveur, jamais `NEXT_PUBLIC_` ?
- RLS / cloisonnement Supabase respectés ?
- Validation humaine prévue pour toute sortie IA (`source='ia'`, `valide=false`) ?
- Un test concret donné, expliqué simplement, étape par étape ?
- Compatibilité future mobile (PWA/RN) prise en compte si pertinent ?
- Réponse optimisée pour le coût des tokens (pas de recollage inutile) ?
