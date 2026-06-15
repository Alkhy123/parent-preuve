# Parent Preuve — Contexte du projet pour Claude

> **Version consolidée et vérifiée sur le code — 11/06/2026.**
> Ce fichier est la **source unique de vérité** à charger en début de chaque conversation.
> **Mise à jour majeure du 11/06/2026** : restructuration complète du dossier **PAR PROCÉDURE**
> (Phases 1→5), **coffre-fort** et **note de synthèse** désormais construits — le tout vérifié
> sur le dépôt. Cette version remplace les anciens fichiers de contexte (voir note §0).

---

## 0. À lire en premier

### Règle de priorité
1. **Le code réel fait foi** en cas de contradiction. Signaler l'écart avant de modifier.
2. Le dépôt n'a **pas de dossier `src/`** : tout est à la racine — `app/`, `components/`, `lib/`.
   Tout chemin en `src/...` dans d'anciennes notes est **obsolète**.
3. Les mises à jour les plus récentes priment sur les anciennes sections.

> ⚠️ **Fichiers de contexte multiples dans le dépôt.** Il existe aussi `PARENT_PREUVE_CONTEXTE (4).md`
> et `PARENT_PREUVE_CONTEXTE_PROPRE.md`, désormais **périmés**. Garder **ce seul fichier**
> (`PARENT_PREUVE_CONTEXTE.md`) comme référence et supprimer les autres pour éviter toute divergence.

### État actuel ultra-court (vérifié sur le dépôt le 11/06/2026)
- **En ligne** sur Vercel : `https://parent-preuve.vercel.app` (compte Hobby, déploiement auto sur push `main`).
- **GitHub** : `Alkhy123/parent-preuve`, branche `main`.
- **Stack réelle** : Next.js **16.2.6** (App Router), React **19.2.4**, TypeScript 5, Tailwind CSS 4,
  `@supabase/supabase-js` ^2.106, `jspdf` ^4.2 + `jspdf-autotable` ^5, `unpdf` ^1.6.
- **Backend** Supabase en UE, RLS active sur toutes les tables, buckets privés.
- **Changement structurant (Phases 1→5)** : tout le dossier est désormais **cloisonné par PROCÉDURE**
  (= un autre parent + son jugement). Voir **§3.5** — c'est le concept le plus important à connaître.
- **Coffre-fort de documents** (`/documents/coffre-fort`) : **construit**.
- **Note de synthèse factuelle pour avocat** (`/note-synthese`) : **construite** (cloisonnée par procédure).
- Routes IA authentifiées côté serveur (token Bearer Supabase) + quota durable en base (`ia_appels`).
- Suppression de compte RGPD implémentée. Pages légales centralisées mais champs `[À COMPLÉTER]` restants.
**Version mobile web (PWA) & ergonomie — session de juin :**
- PWA installable : `app/manifest.ts` (nom, couleurs marque, icônes), icônes dans
  `public/icons/` (192, 512, maskable-512, apple-touch-icon), `viewport` + `theme-color`
  + `appleWebApp` dans `app/layout.tsx`. ⚠️ Pas encore de service worker → mode hors-ligne
  à faire (ne JAMAIS mettre en cache preuves/jugements ; URLs signées 60 s).
- Tokens de design centralisés dans `app/globals.css` : palette en variables CSS + tokens
  Tailwind (`bg-navy`, `text-or`, `bg-surface`, `text-texte-doux`, `text-vert/rouge/amber`).
  Bugs corrigés : `--background` blanc → crème `#ECE7DC`, `font-family: Arial` → Geist.
  Deux crèmes assumés : `#ECE7DC` = fond de page, `#F8F6F1` (`--surface`) = cartes.
  Migration des hex en dur vers les tokens = progressive, à faire page par page.
- Responsive mobile : grilles `grid-cols-2/3` → `grid-cols-1 sm:grid-cols-2/3` sur
  journal, frais, pension, documents, export, calendrier et les composants RegleX.
  `grid-cols-7` du calendrier (jours) laissé intact.
- `EncartPliable.tsx` étendu : props `idPersistance` (mémorise plié/déplié via localStorage,
  préfixe `encart-replie:`, lecture en useEffect pour éviter les écarts d'hydratation) et
  `signalFermeture` (incrément → referme l'encart).
- Formulaires d'ajout repliés par défaut + se referment après enregistrement : journal,
  frais, pension (état `signalAjout`).
- Règles du jugement : se referment après enregistrement MANUEL ou validation, restent
  OUVERTES pour une proposition IA non validée (`valide=false`), état fermé persistant
  par dossier. Concernés : RegleDVH, RegleFrais, RegleDecision, ReglePension
  (clés `regle-xxx:{procedureId}`) et la règle de garde, désormais dans un `EncartPliable`
  inline dans `app/calendrier/page.tsx` (clé constante `garde-calendrier`).

**Dette / à faire identifiés cette session :**
- Sécuriser `/api/horodatage` (ni auth ni quota) — PROCHAINE TÂCHE prioritaire.
- Service worker PWA (offline) non fait.
- Migration progressive des couleurs en dur vers les tokens.

### ⚠️ Écarts doc/code et dettes techniques (vérifiés le 11/06/2026, **toujours ouverts**)
- **`components/BoutonCaptureRapide.tsx` existe mais n'est monté nulle part** (ni `app/page.tsx` ni
  `app/layout.tsx`) → bouton flottant invisible. À remonter (idéalement dans `layout.tsx`).
- **`cross-env` utilisé dans le script `dev` mais absent de `package.json`** → `npm ci` sur machine
  propre échoue (`npm install` passe). À ajouter en devDependency (`npm i -D cross-env`).
- **`lib/limiteurAppel.ts` est du code mort** (plus importé) → supprimable.
- **README et `app/favicon.ico` toujours par défaut** (create-next-app) → à dégénériciser.
- **Pages légales** : champs `[À COMPLÉTER]` à remplir + **relecture par un professionnel du droit**
  avant ouverture large.
- **Cosmétique** : `lib/structureNote.ts` contient encore des libellés internes `source: 'dossier.*'`
  (autre parent / jugement) alors que la source réelle est désormais `procedures`. Pures chaînes
  descriptives (aucune requête, aucune erreur) → à renommer en `procedure.*` quand l'occasion se présente.

---

## 1. Vision produit — la boussole

> **Phrase de mission (boussole de décision, PAS un texte d'interface) :**
> *« Quand tout est confus, Parent Preuve remet de l'ordre dans les faits pour que le
> parent reprenne pied. »*

À chaque arbitrage : **est-ce que ça aide le parent à remettre de l'ordre et à reprendre pied ?**
Si oui → dans la trajectoire. Si ça ajoute de la confusion ou franchit la ligne du conseil
juridique → dehors.

**Le vrai problème résolu.** Le parent séparé en conflit (après JAF) est submergé sur **trois fronts** :
le juridique qu'il ne maîtrise pas, les éléments concrets à produire qu'il ne sait pas identifier, et
l'émotion qui brouille son jugement. La fonction première : **réduire la charge mentale** et **montrer
le chemin** (« voilà où tu en es, voilà ce qui manque, voilà l'étape suivante »).

**Différence avec les apps de coparentalité (type 2houses).** Elles supposent deux parents qui
**coopèrent**. Parent Preuve s'adresse à **un seul parent**, seul face au conflit, qui constitue un
dossier factuel. On **n'invite pas** l'autre parent. À reprendre d'elles : leur **clarté**. À éviter :
leur **ton léger** et leur **vocabulaire collaboratif** — l'identité navy/or sérieuse est un atout.

**⚠️ Garde-fou de vocabulaire.** Ne JAMAIS écrire « assistant juridique ». Décrire la **fonction**
(mettre de l'ordre), jamais la **promesse** (dire quoi faire en droit). Type :
**« votre aide pour organiser un dossier clair et factuel »**.

**Cible à terme** : application mobile native (React Native/Expo ou PWA). Le backend Supabase est
entièrement réutilisable ; seule l'interface évoluera. Tout choix technique doit en tenir compte.

### Deux modes d'usage (pour tout futur travail UI)
1. **Capture rapide** — un événement survient (retard, non-représentation, dépense, photo) ; le parent
   est sur le moment, stressé, souvent sur mobile. La **vitesse prime**.
2. **Gestion de dossier** — plus tard, au calme : soldes, état, courrier. La **vue d'ensemble prime**.

Direction retenue : l'**accueil sert la gestion de dossier** (tableau de bord) ; la **capture rapide
vit par-dessus** via un bouton flottant universel (transposable au mobile, mais ⚠️ non monté
actuellement). Invariant non négociable : **« l'IA propose, l'utilisateur valide »**.

---

## 2. Positionnement juridique — règles absolues

Ne jamais écrire ou laisser entendre que l'application : remplace un avocat · donne un conseil juridique
personnalisé · remplace un commissaire de justice · certifie une preuve comme un constat · garantit la
recevabilité d'une preuve · garantit une issue.

Formulations autorisées : « aide à l'organisation du dossier » · « aide à la rédaction factuelle » ·
« preuve numérique renforcée » · « preuve scellée et horodatée » · « traçabilité renforcée » ·
« soumis à l'appréciation du juge » · « à faire relire par un professionnel du droit si nécessaire ».

**Preuves photo** = « preuve numérique renforcée, scellée et horodatée ». Horodatage actuel
**non qualifié** (à dire honnêtement partout, avertissement sur chaque export PDF). Jamais présenté
comme équivalent à un constat de commissaire de justice.

**Élément matériel oui, élément moral jamais.** L'app documente des faits constatables. Elle ne
qualifie jamais l'intention ni le caractère volontaire (abandon de famille, mauvaise foi, mensonge…).
Préférer : « il ressort de la pièce… », « le texte mentionne… », « l'utilisateur indique… ».

> Articles de loi : **saisis et vérifiés par l'utilisateur, jamais inventés ni générés par l'IA.**

---

## 3. Cadre IA — « l'IA propose, l'utilisateur valide »

- **Aucune écriture IA en base sans validation humaine.** Relecture obligatoire des sorties.
- Toute proposition IA est tracée `source='ia'` et reste `valide=false` jusqu'à validation.
- L'IA **n'invente pas**, **ne qualifie pas** juridiquement, **n'infère pas** l'intention. Elle
  **signale ses incertitudes** et **cite le passage source** quand elle extrait une règle.
- **Mistral** (UE, `mistral-small-latest`), appels **côté serveur uniquement**, clé jamais en
  `NEXT_PUBLIC_`. Sous-traitant RGPD nommé (DPA art. 28).
- **Non HDS** → minimisation stricte (jamais de données de santé envoyées).
- **Anti-hallucination** : sorties **JSON structurées** validées ; **invariant `valeur: null` ⇒
  `confiance: "absente"`**.
- **Consentement IA granulaire** par fonctionnalité (table `consentements_ia`).
- **Déterministe d'abord** : l'IA seulement là où c'est nécessaire.

---

## 3.5 ⭐ MODÈLE CENTRAL — Le cloisonnement par PROCÉDURE (à connaître absolument)

C'est la restructuration majeure du 11/06/2026. **Le bon conteneur du dossier n'est pas l'enfant, mais
la PROCÉDURE.**

### Le concept
- Une **procédure** = **un autre parent + son jugement**. Un parent peut avoir des enfants de plusieurs
  ex → **plusieurs procédures**.
- **Règle de regroupement** : les enfants ayant le **même autre parent** partagent la **même procédure**
  (donc le même jugement et les mêmes règles pension/DVH/frais/décision). Autre parent différent =
  procédure séparée.
- **Granularité fine conservée** : documents, preuves, événements et frais restent rattachés à
  l'**enfant** (`child_id`/`enfant_id`). Comme un enfant appartient à une procédure, le filtrage par
  procédure en découle. Les lignes **sans enfant** sont traitées comme **« générales »** : visibles dans
  toutes les procédures.

### La procédure active (mécanique)
- **`lib/procedureActive.ts`** est le point unique. Exports :
  - `getProcedureActiveId()` : lit l'id mémorisé en `localStorage` ; s'il n'existe plus, retombe sur la
    **première procédure** (plus ancienne) et la mémorise. `null` si l'utilisateur n'a aucune procédure.
  - `getProcedureActiveIdLocal()` / `setProcedureActiveIdLocal(id)` : lecture/écriture `localStorage`.
  - `getEnfantsDeProcedureActive()` : renvoie `{ id, prenom_ou_alias }[]` des enfants de la procédure
    active (vide si aucune). **C'est ce que chaque écran « par enfant » utilise pour se filtrer.**
- **Persistance** : `localStorage` (clé `procedure_active_id`). En Phase 4, ce fichier est resté le
  **seul** point à faire évoluer pour brancher le sélecteur.
- **Sélection visible** : `components/SelecteurProcedure.tsx` (dans la NavBar, visible si ≥ 2 procédures)
  **et** `components/BandeauProcedure.tsx` (bandeau « Dossier en cours : … » monté dans le **layout**,
  présent sur **toutes** les pages, accueil compris). Changer de procédure mémorise le choix et
  **recharge la page** pour que tous les écrans relisent la procédure active.

### Écrans cloisonnés (tous filtrés sur la procédure active)
Journal, Documents, Coffre-fort, Preuves (liste + nouvelle), Frais (+ totaux), Pension (+ totaux),
Calendrier (sélecteur d'enfant + DVH), Export PDF, Tableau de bord (accueil), Prochaines échéances,
Courriers (autre parent + jugement), Note de synthèse. Le **contrôle avant export**
(`ControleDossier`) est lui aussi cloisonné.
> Exception **voulue** : la page `/enfants` charge **tous** les enfants (toutes procédures) — c'est le
> hub de gestion où on répartit les enfants entre procédures.

### Édition d'une procédure
- **`/procedure`** (`app/procedure/page.tsx`) édite la **procédure active** : `etiquette`,
  coordonnées de l'autre parent, infos du jugement, + encart « Nature de la décision » (`RegleDecision`).
  Pour éditer une autre procédure : la sélectionner dans le bandeau, puis revenir.
- **`/dossier`** ne contient plus que le **déclarant** (l'utilisateur) + consentement IA + remise à zéro,
  et renvoie vers `/procedure` pour l'autre parent / le jugement.
- **Création d'une procédure** : via `/enfants` → « ➕ Autre parent différent » (on saisit une
  **étiquette** ; les coordonnées de l'autre parent et le jugement se complètent ensuite dans
  `/procedure`). Une procédure devenue **vide** (plus aucun enfant ni règle) est **supprimée
  automatiquement** à la suppression du dernier enfant.

---

## 4. Stack technique (versions réelles)

- **Framework** : Next.js **16.2.6** (App Router), TypeScript 5. Route serveur = `route.ts`,
  **une fonction par méthode HTTP**, `await request.json()`, `Response.json({...})`. En Next.js 16,
  `headers()`/`cookies()` sont **async**.
- **UI** : React **19.2.4**, Tailwind CSS 4 (`@tailwindcss/postcss`).
- **Backend** : Supabase (PostgreSQL + Auth + Storage), **RLS partout**. Client navigateur
  `@/lib/supabase` (anon). Auth **entièrement côté navigateur** — pas de `@supabase/ssr`, pas de
  middleware ; les routes lisent la session via token Bearer (§8).
- **PDF** : `jspdf` ^4.2 + `jspdf-autotable` ^5. (`pdf-lib` **non installé** — nécessaire le jour où on
  fusionnera des PDF existants ; jsPDF gère nativement les images.)
- **IA** : Mistral, `https://api.mistral.ai/v1/chat/completions`, Bearer, `mistral-small-latest`.
  Reformulation `temperature: 0.2` ; extraction `temperature: 0` + `response_format json_object`.
  OCR scanné : `/v1/ocr` (`mistral-ocr-latest`).
- **Lecture PDF numérique** : `unpdf` ^1.6 (ESM-only ; `extractText(pdf, { mergePages: true })`).

### `.env.local` (racine, local)
`HORODATAGE_SECRET` · `MISTRAL_API_KEY` (jamais `NEXT_PUBLIC_`) · `NEXT_PUBLIC_SUPABASE_URL` ·
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `ANON_KEY`) · `SUPABASE_SERVICE_ROLE_KEY` (serveur
uniquement) · `NODE_OPTIONS=--use-system-ca` (correctif TLS Windows, §11).
Après modif de `.env.local` : **Ctrl+C puis `npm run dev`**. **Nouveau dossier de route/page** en
Next 16 → redémarrer `npm run dev` (sinon 404 trompeur).

### Variables d'environnement Vercel (Production)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `ANON_KEY`), `MISTRAL_API_KEY`,
`HORODATAGE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.
⚠️ **`NODE_OPTIONS=--use-system-ca` NON reporté** (correctif Windows local uniquement).
⚠️ **`HORODATAGE_SECRET` immuable après déploiement** (il signe les preuves existantes).
Auth Supabase : **Site URL** + **Redirect URLs** sur le domaine Vercel. Confirmation e-mail désactivée
en phase de test (à réactiver + vrai SMTP pour la prod).

---

## 5. Identité visuelle

- **Palette** : Navy `#15233F` · Or `#C2A24C` · Crème clair `#F8F6F1` · Texte `#1F2733`.
  Fond global des pages : crème profond **`#ECE7DC`** ; crème clair `#F8F6F1` réservé aux cartes.
  Gris accordé navy pour les libellés : **`#5A6473`**.
- **Couleurs de statut** (distinctes de l'or) : vert `#2E6A4D`, rouge `#9B2C2C`, ambre `#8A5A12`.
- **Titres** : Playfair Display (`.font-display`).
- **`PageHeader.tsx`** : bandeau navy (eyebrow doré, title serif, filet doré, subtitle).
- **`EncartPliable.tsx`** : encart crème pliable `{ titre, resume?, pliable?, replieParDefaut?, children }`.
- **`.carte`** : ombre teintée navy (relief léger).

### Apprentissages design (à réappliquer)
- **Jamais de double séparation** : soit l'ombre `.carte`, soit une bordure — pas les deux.
- **Bannir les gris Tailwind par défaut** (`slate-200/400/500`) → gris accordés à la palette.
  ⚠️ Plusieurs écrans cloisonnés récents utilisent encore des `slate`/`gray` : **dette esthétique**
  assumée (passes fonctionnelles d'abord), à nettoyer lors d'une passe design dédiée.
- **L'or `#C2A24C` reste rare** : accent seulement, un seul endroit fort par écran.
- **Une seule action principale par écran** (bouton plein navy, texte crème).
- **Rester sur l'échelle d'espacement Tailwind**.

---

## 6. Base de données Supabase

Convention : `id uuid` (PK), `user_id uuid default auth.uid()`, colonnes en français,
`created_at timestamptz`. **RLS + 4 policies par table** sur `auth.uid() = user_id`. RLS active sur
**100 %** des tables.

### ⭐ Table `procedures` (conteneur central — ajoutée en Phase 1)
Champs : `id`, `user_id` (FK `auth.users`, `on delete cascade`), `created_at`,
`autre_parent_civilite/_nom/_prenom/_adresse/_code_postal/_ville`,
`jugement_juridiction/_date/_numero_rg/_intitule`, **`etiquette`** (text, nullable ; saisie libre,
affichée dans le bandeau et le sélecteur). RLS + 4 policies standard.
> **`procedure_id` (uuid, nullable, FK `procedures`, `on delete set null`)** a été ajouté à :
> **`children`**, **`pension_regle`**, **`frais_regle`**, **`dvh_regle`**, **`decision_regle`**,
> **`pension_payments`**. (Index sur chaque `procedure_id`.)

### Tables
- **`children`** — enfants. ⚠️ Prénom = **`prenom_ou_alias`**. Porte `procedure_id`.
- **`events`** — journal : `titre`, `categorie`, `date_evenement`, `heure_evenement`,
  `description_factuelle`, `child_id`, **`statut`** (`brouillon`|`valide`|`exporte`, défaut `brouillon`).
  *(Cloisonné par procédure via `child_id`.)*
- **`expenses`** — frais : `libelle`, `categorie`, `montant`, `part_autre`, `date_frais`,
  `rembourse`, **`document_id`** (FK `documents`, `on delete set null`), `child_id`.
- **`pension_payments`** — paiements réels mois par mois : `mois_du`, `montant_du`, `montant_paye`,
  `date_paiement`, `notes`, **`procedure_id`** (ajouté Phase 4-C-6a ; pas de `child_id`, la pension est
  par procédure). Lu/écrit `.eq('procedure_id', procId)`.
- **`pension_regle` / `frais_regle` / `dvh_regle` / `decision_regle`** — les 4 RÈGLES du jugement.
  Voir patron + §6.1–6.4. Lues/écrites **par `procedure_id`**.
- **`documents`** — pièces : `libelle`, `categorie`, `chemin_fichier`, `date_document`, `child_id`,
  **`etat`** (`actif`|`archive`, pour le coffre-fort).
- **`dossier`** — socle **DÉCLARANT UNIQUEMENT** (1 ligne/user, `upsert`) : `declarant_*`.
  ⚠️ **Les colonnes `autre_parent_*` et `jugement_*` ont été SUPPRIMÉES (Phase 5-C)** — elles vivent
  désormais dans `procedures`. Ne plus jamais les écrire/lire depuis `dossier`.
- **`preuves_photo`** — preuves scellées/horodatées (par `enfant_id`). Voir §6.5.
- **`garde_regles`** — règle de garde (une par `enfant_id`). Voir §6.6.
- **`note_brouillon`** — brouillon de la note de synthèse (1 par user, sauvegarde locale serveur via
  `lib/brouillonStockage.ts`).
- **`consentements_ia`** — consentement IA par fonctionnalité (SOURCE DE VÉRITÉ). Insert/Select + DELETE,
  pas d'UPDATE (fait historique daté).
- **`ia_appels`** — quota anti-abus durable (pas de policy DELETE → non réinitialisable). §8.
- **`acceptation_politique`** — `version`, `accepted_at` (SELECT + INSERT). Pilote la boîte RGPD.

> **Patron des 4 tables règles** : `id`, `user_id` (FK `auth.users`, cascade), `enfant_id`
> (FK `children`, nullable — **toujours présent mais inutilisé**), **`procedure_id`** (FK `procedures`,
> nullable), colonnes métier fidèles au **dispositif**, **`source`** (`'manuel'`|`'ia'`), **`valide'`**,
> **`actif`**, `notes`, `created_at`. Manuel : ne pas envoyer `source/valide/actif` → défauts
> (`'manuel'`, `true`, `true`). IA : envoyer `source='ia'` + `valide=false`.
> **Lecture de la règle active : `.eq('procedure_id', procId).eq('actif', true)` + `maybeSingle()`** ;
> `update` si elle existe, sinon `insert` (avec `procedure_id`). L'IA n'extrait jamais ni `enfant_id`
> ni `procedure_id` (l'écriture passe par les composants `RegleX` qui ajoutent la procédure active).

### 6.1 `pension_regle`
`montant_base`, `montant_courant`, `debiteur` (`'moi'`|`'autre'`), `jour_echeance`, `paiement_avance`,
`inclut_vacances`, `intermediation`, `indexation_active`, `indexation_jour`, `indexation_mois`,
`indexation_premiere_date`, `indexation_indice` + patron.

### 6.2 `frais_regle`
`categories_couvertes`, `part_moi_pourcentage`, `part_autre_pourcentage` (somme **non forcée** à 100),
`accord_prealable_requis`, `accord_prealable_seuil`, `delai_remboursement_jours`,
`justificatif_obligatoire` (défaut `true`), `s_ajoute_a_pension` + patron.

### 6.3 `dvh_regle`
`type_dvh` (`classique`|`mediatise`|`reduit`|`progressif`|`libre`|`suspendu`|`sans_dvh`), `titulaire`,
`lieu_visite` (`domicile`|`espace_rencontre`|`tiers`|`autre`), `presence_tiers`, `tiers_details`,
`frequence`, `duree`, `duree_limitee`, `clause_renonciation`, `clause_renonciation_details`,
`remise_lieu`, `vacances_partage` + patron.
Distinction : `garde_regles` colore l'agenda (rythme) ; `dvh_regle` consigne les modalités juridiques.

### 6.4 `decision_regle`
`type_decision` (`jugement`|`ordonnance`|`convention_homologuee`|`arret`|`autre`), `provisoire`,
`execution_provisoire`, `susceptible_appel`, `frappee_appel`, `appel_date`, `appel_juridiction`,
`date_decision`, `date_signification`, `date_audience_prochaine`, `mise_en_etat`, `mise_en_etat_details`
+ patron. *(Encart édité dans `/procedure`.)*

### 6.5 `preuves_photo`
`titre`, `description`, `enfant_id`, `storage_path`, `nom_fichier`, `type_fichier`, `taille_octets`,
`empreinte_sha256`, `metadonnees` (jsonb), `gps_*`, `heure_appareil`, `ecart_heure_secondes`,
`anomalies` (jsonb), `horodatage_jeton`, `horodatage_date`,
`horodatage_statut` (`non_qualifie`|`a_refaire`|`qualifie`), `horodatage_prestataire`,
`horodatage_algorithme`. `created_at` = horodatage serveur.

### 6.6 `garde_regles`
`enfant_id`, `type_garde` (`weekend_sur_deux`…), `parent_principal`, `date_reference`, `jour_debut`,
`heure_debut`, `jour_fin`, `heure_fin` + patron.

### Storage
Buckets **privés** `preuves` et `justificatifs`, cloisonnés par utilisateur. `justificatifs` =
`userId/fichier` ; `preuves` = `userId/preuveId/fichier`. **Pas de policy UPDATE sur `preuves`**
(originaux scellés). URL signée 60 s pour la lecture.

---

## 7. Ce qui est construit (état réel)

**MVP fonctionnel** : auth, enfants, journal, frais, pension, documents, export PDF, calendrier de garde
+ rappels, module preuve photo scellée (SHA-256, GPS, écart d'heure serveur, horodatage HMAC-SHA256),
assistant de courriers, pipeline IA complet.

**⭐ Cloisonnement par procédure (Phases 1→5, terminé)** — voir §3.5. Table `procedures`, `procedure_id`
partout où il faut, helper `procedureActive.ts`, sélecteur + bandeau, tous les écrans liés enfant
filtrés, page `/procedure`, `/dossier` allégé au déclarant, colonnes en doublon supprimées de `dossier`.

**Coffre-fort de documents (`/documents/coffre-fort`)** — liste centralisée (documents + preuves),
classée par enfant/type/date, filtrable (nature, catégorie, enfant, recherche), cloisonnée par
procédure. `components/SelecteurPieces.tsx` pour la sélection. Page `/documents` = pièces **actives**
(`etat='actif'`), avec « conserver au coffre-fort » (archive) / « supprimer définitivement ».

**Note de synthèse factuelle pour avocat (`/note-synthese`)** — préchargement cloisonné par procédure
(`lib/prechargerNote.ts` : déclarant depuis `dossier`, autre parent/jugement/enfants/4 règles/garde
depuis la procédure active), pièces (`lib/piecesnote.ts`), structure (`lib/structureNote.ts`),
assemblage (`lib/assemblerNote.ts`), brouillon persistant (`lib/brouillonStockage.ts` ↔ `note_brouillon`),
export PDF (`lib/exportNotePdf.ts`), UI `components/FormulaireNote.tsx` + `BrouillonNote.tsx`.
⚠️ Cadrage : **pas de « conclusions JAF »**, note factuelle organisée.

**Pipeline IA (complet)**
- Consentement par fonctionnalité (`consentements_ia`) ; `ConsentementIA.tsx` = porte réutilisable.
- **Brique B — reformulation neutre** : `/api/ia/reformuler`, page `/reformuler`.
- **Brique A — extraction du jugement** sur les 4 tables règles, **un seul appel Mistral**, JSON
  sectionné, chaque champ `{ valeur, confiance, citation }`. Le **dispositif fait foi**
  (« PAR CES MOTIFS »). Pré-remplissage des 4 encarts `RegleX` ; les composants écrivent avec
  `procedure_id` (procédure active) + `source='ia'`, `valide=false`.
  - Porte 1 (description) : `/api/ia/extraire`, hub `/dossier/extraire`.
  - Porte 2 (PDF) : `/dossier/importer-pdf` + `/api/ia/extraire-pdf` (`unpdf` ; OCR Mistral en secours).
  - Cœur partagé : `lib/extractionRegles.ts`, `lib/regleConvertisseurs.ts`, ciblage `lib/dispositif.ts`.
  - Aperçu : `components/ApercuExtraction.tsx` (`lib/libellesRegles.ts`).
- **Quota durable** : `lib/quotaIa.ts` (table `ia_appels`). Reformulation 15/60 s, extraction 10/60 s,
  extraction-pdf 5/120 s → 429.
- **Auth des routes IA** : `lib/authServeur.ts` + `lib/enteteAuth.ts`. **Ordre : auth (401) → quota (429)
  → Mistral.**

**Assistant de courriers (complet, cloisonné)** : `CourrierModele.tsx` charge le **déclarant** depuis
`dossier` et **fusionne l'autre parent + le jugement de la procédure active** ; les 4 modèles
(relance-pension, remboursement-frais, non-representation, info-scolarite-sante) lisent l'objet fusionné.

**Briques déterministes** : C — `lib/controleDossier.ts` (logique pure) + `ControleDossier.tsx`
(cloisonné : enfants/compteurs de la procédure active, autre parent/jugement depuis `procedures`).
D — calculs `lib/dossierCalculs.ts` (`totauxFrais`, `totauxPension`, `euros`, `resteDuGlobal`) utilisés
par `TableauDeBord` **et** `/export` (tous deux cloisonnés).

**Horodatage** : HMAC-SHA256 non qualifié (`/api/horodatage` ; échec → `statut='a_refaire'`). eIDAS
qualifié (QTSP, RFC 3161) **différé** ; plomberie prête (swap ≈ `app/api/horodatage/route.ts`).

**Mise en ligne & RGPD** : routes IA authentifiées + quota ; suppression de compte
(`/api/compte/supprimer`, client `service_role`, efface Storage → tables → Auth) ; « Effacer toutes mes
données » (`EffacerDonnees.tsx` bas de `/dossier`) ; pages légales (`/confidentialite` source unique,
champs `[À COMPLÉTER]`) ; `Footer.tsx` ; `AccueilPublic.tsx` + `GardeAcces.tsx` ; boîte d'accueil RGPD
`BienvenueRGPD.tsx` (table `acceptation_politique`).

---

## 8. Sécurité — synthèse

- Auth **entièrement côté navigateur**. Routes serveur via **token Bearer** (`lib/authServeur.ts`).
- Routes IA : **auth (401) → quota (429) → Mistral**. Secrets serveur uniquement, jamais
  `NEXT_PUBLIC_`. `SUPABASE_SERVICE_ROLE_KEY` réservée à `lib/supabaseAdmin.ts`.
- RLS sur 100 % des tables ; buckets privés cloisonnés. Le cloisonnement par procédure repose **en plus**
  sur des filtres applicatifs (RLS protège déjà par utilisateur).
- `ia_appels` sans DELETE → suppression de compte via client admin.

---

## 9. Carte des fichiers (réelle — racine, pas de `src/`)

```
app/
  layout.tsx              (NavBar + BandeauProcedure + GardeAcces(children) + Footer + BienvenueRGPD)
  page.tsx                (ACCUEIL : AccueilPublic si déconnecté, sinon TableauDeBord + ProchainesEcheances ; cloisonnés)
  globals.css             (.font-display + .carte + --background #ECE7DC)
  connexion/page.tsx · compte/page.tsx (RGPD)
  confidentialite/page.tsx · mentions-legales/page.tsx
  dossier/page.tsx        (DÉCLARANT seul + StatutConsentementIA + EffacerDonnees + renvoi vers /procedure)
  procedure/page.tsx      (⭐ édition procédure active : étiquette + autre parent + jugement + RegleDecision)
  dossier/extraire/page.tsx (HUB extraction IA) · dossier/importer-pdf/page.tsx (PORTE 2 PDF/OCR)
  enfants/page.tsx        (TOUS les enfants ; ajout avec « même autre parent ? » ; crée/nettoie les procédures)
  journal/page.tsx · frais/page.tsx (+RegleFrais) · pension/page.tsx (+ReglePension)
  calendrier/page.tsx     (garde par enfant + RegleDVH)
  documents/page.tsx · documents/coffre-fort/page.tsx
  preuves/page.tsx · preuves/nouvelle/page.tsx
  courriers/page.tsx + 4 modèles
  export/page.tsx         (ControleDossier + bordereau + calculs ; cloisonné)
  note-synthese/page.tsx  (note de synthèse pour avocat ; cloisonnée)
  reformuler/page.tsx
  api/ horodatage · compte/supprimer · ia/reformuler · ia/extraire · ia/extraire-pdf

components/
  NavBar.tsx (familles + lien /procedure + SelecteurProcedure) · BandeauProcedure.tsx · SelecteurProcedure.tsx
  Footer.tsx · GardeAcces.tsx · BienvenueRGPD.tsx · AccueilPublic.tsx
  TableauDeBord.tsx · ProchainesEcheances.tsx · CalendrierMensuel.tsx · ControleDossier.tsx
  ConsentementIA.tsx · StatutConsentementIA.tsx · ApercuExtraction.tsx
  EncartPliable.tsx · PageHeader.tsx · CourrierModele.tsx
  ReglePension.tsx · RegleFrais.tsx · RegleDVH.tsx · RegleDecision.tsx
  SelecteurPieces.tsx · FormulaireNote.tsx · BrouillonNote.tsx · EffacerDonnees.tsx
  BoutonCaptureRapide.tsx (⚠️ existe mais N'EST MONTÉ NULLE PART)

lib/
  supabase.ts · supabaseAdmin.ts (service_role)
  procedureActive.ts (⭐ getProcedureActiveId / getEnfantsDeProcedureActive / get|setProcedureActiveIdLocal)
  authServeur.ts · enteteAuth.ts · quotaIa.ts · limiteurAppel.ts (⚠️ CODE MORT)
  dossierCalculs.ts · controleDossier.ts · gardeCalendrier.ts · gardeNotifications.ts
  courrierHelpers.ts (v, dateFr, type Dossier) · courrierPdf.ts · preuvePdf.ts
  dispositif.ts · extractionRegles.ts · regleConvertisseurs.ts · libellesRegles.ts
  prechargerNote.ts · piecesnote.ts · structureNote.ts · assemblerNote.ts · exportNotePdf.ts · brouillonStockage.ts

racine : AGENTS.md · CLAUDE.md · PARENT_PREUVE_CONTEXTE.md (ce fichier) · VITRINE_PARENT_PREUVE_BRIEF.md ·
         package.json · README.md (⚠️ par défaut) · AUDIT_CLOISONNEMENT_PROCEDURE.md (audit + checklist résolus)
```

`package.json` — dependencies : `@supabase/supabase-js`, `jspdf`, `jspdf-autotable`, `next` 16.2.6,
`react`/`react-dom` 19.2.4, `unpdf`. Script dev : `cross-env NODE_OPTIONS=--use-system-ca next dev`.
⚠️ **`cross-env` absent de package.json** → à ajouter en devDependency.

---

## 10. Backlog / chantiers

**Dette technique immédiate (vérifiée 11/06/2026, toujours ouverte)**
- Remonter `BoutonCaptureRapide` (idéalement dans `layout.tsx`).
- Ajouter `cross-env` en devDependency.
- Supprimer `lib/limiteurAppel.ts` (mort).
- Dégénériciser README + `favicon.ico`.
- Renommer les libellés `source: 'dossier.*'` → `'procedure.*'` dans `lib/structureNote.ts` (cosmétique).
- Passe esthétique : remplacer les `slate`/`gray` par défaut introduits dans les écrans cloisonnés.

**Avant ouverture large**
- Compléter les `[À COMPLÉTER]` des pages légales + **relecture par un professionnel du droit**.
- Réactiver la confirmation e-mail + vrai service SMTP.
- Harmoniser le design de `/reformuler` ; diagnostiquer la qualité de reformulation Mistral.

**Brique A (suite)** : moteur d'indexation INSEE (fonction pure mettant à jour `montant_courant`) ;
comparaison « dû selon la règle » vs « payé » ; surfacer `confiance`/`citation` côté import PDF.

**Sur l'horizon** : eIDAS qualifié (QTSP) ; app mobile native (RN/Expo ou PWA — backend Supabase
réutilisable, le helper `procedureActive` devra lire la sélection persistée côté mobile) ; chatbot
d'orientation procédurale (RAG sur textes de référence, information générale, appels serveur) ;
présence App Store / Google Play.

**Site vitrine** (projet séparé, single HTML/CSS, Vercel) : brief dans `VITRINE_PARENT_PREUVE_BRIEF.md`.

---

## 11. Conventions de travail & environnement

### Méthode (développeur débutant, méthodique)
- Expliquer simplement, **chemins/fichiers exacts**, **un petit pas testable à la fois**, **un test
  concret** (URL ou commande) + résultat attendu après chaque étape, **n'avancer qu'après confirmation**.
- **Ordre** : table/SQL d'abord, puis logique pure, puis composant, puis branchement de page.
- **Remplacement complet du fichier** quand un fichier change à plusieurs endroits (évite les doublons de
  copier-coller, surtout sur mobile) ; **patch ciblé** pour un changement vraiment localisé.
- **Réutiliser l'existant** (DRY) : `PageHeader`, `EncartPliable`, `ConsentementIA`, les 4 `RegleX`,
  `dossierCalculs.ts`, `procedureActive.ts`, patterns Supabase/RLS.
- **GitHub entre les sessions** ; charger ce fichier en premier dans chaque nouvelle conversation.

### Workflow réel (mobile **et** PC)
- L'utilisateur travaille souvent **sur téléphone**, en collant les fichiers directement sur
  **github.com** (icône crayon → tout sélectionner → coller → *Commit changes*) ; nouveau fichier via
  *Add file → Create new file*. Vercel redéploie sur push.
- Sur **PC (Cursor)** : `git clone` / `git pull` pour synchroniser, `npm install`, recréer `.env.local`
  (jamais commité), `npm run dev` pour vérifier avant `git add/commit/push`. Le **premier push** demande
  une connexion GitHub.
- ⚠️ **Pièges vécus** : (1) un fichier nouveau créé avec la **mauvaise extension** (`.ts` au lieu de
  `.tsx` pour du JSX) **casse le build** ; (2) un collage « confirmé » mais **non commité** ne part pas ;
  (3) **deux clones locaux** (`parent-preuve` vs `parent-preuve-mobile`) → pousser depuis le mauvais
  dossier donne « nothing to commit » ; (4) **réflexe en cas de « rien ne s'affiche »** alors qu'un autre
  changement marche : ouvrir Vercel → **Deployments** ; un build en **Error** (rouge) = Vercel sert
  l'ancienne version.

### PowerShell / Windows
- Tester une route serveur (JSON complet, textes **sans accents** dans `-Body`) :
  `Invoke-RestMethod -Uri … -Method Post -ContentType "application/json" -Body '…' | ConvertTo-Json -Depth 10`.
  ⚠️ `curl` = alias d'`Invoke-WebRequest` → préférer `Invoke-RestMethod`.
- **TLS Windows** : `NODE_OPTIONS=--use-system-ca` (script `dev`, via `cross-env`) règle
  `UNABLE_TO_VERIFY_LEAF_SIGNATURE` (inspection HTTPS antivirus). ⚠️ **Jamais** sur Vercel.
- Secret aléatoire : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

### Pièges Next.js 16
- `next build` ne lance plus ESLint → le lint ne bloque pas Vercel (ne pas remettre
  `eslint.ignoreDuringBuilds`). **Le type-check TS, lui, bloque** → vérifier `npx tsc --noEmit` en cas de
  doute sur un build Vercel.
- **Jamais de `page.tsx` sous `app/api/`** (uniquement `route.ts`).
- Nouveau dossier de route/page → redémarrer `npm run dev`.

---

## Checklist avant toute réponse de code
- Positionnement juridique respecté (pas de conseil, pas de promesse de résultat) ?
- **Cloisonnement par procédure respecté** (lecture/écriture via la procédure active, éléments sans
  enfant traités comme généraux) ?
- Secrets côté serveur, jamais `NEXT_PUBLIC_` ?
- RLS / cloisonnement Supabase respectés ?
- Validation humaine prévue pour toute sortie IA (`source='ia'`, `valide=false`) ?
- Un test concret donné, expliqué simplement, étape par étape ?
- Compatibilité future mobile (PWA/RN) prise en compte si pertinent ?
- Optimiser la réponse pour réduire le coût des tokens par réponse