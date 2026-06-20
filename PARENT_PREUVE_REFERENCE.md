# Parent Preuve — RÉFÉRENCE technique (état réel, schéma, fichiers, dette, backlog)

> **Rôle de ce fichier.** Le **détail volatil** du projet : ce qui est réellement construit, le
> schéma Supabase complet, la carte des fichiers, la dette technique et le backlog. À charger
> **quand on code, qu'on touche la base, ou qu'on fait un audit**. Pour la mission, les règles
> juridiques et la méthode, voir le socle **`PARENT_PREUVE_CONTEXTE.md`**.
>
> **Dernière vérification sur le code : 20/06/2026.** Le code réel fait foi.
>
> **Provenance des informations.** Les **noms de tables, de colonnes et les exports** ci-dessous
> ont été vérifiés en lisant le code du dépôt (accès `.from(...)`, `select`, `insert`, `.eq(...)`).
> Le dépôt **contient désormais** `supabase/migrations/` (`001`→`006`) + `supabase/config.toml` +
> `supabase/snippets/` : le schéma (tables, FK, CHECK, index, policies RLS et Storage) y est versionné
> et fait foi avec le code. En cas de doute sur l'état **réellement appliqué en production**, vérifier
> dans le tableau de bord Supabase (une migration de colonne doit être appliquée en **deux endroits** :
> local `supabase db reset` ET prod via SQL Editor).

---

## 1. État réel — ce qui est construit

### 2026-06-20 — Assistant en lecture seule (copilote) + boutons flottants déplaçables

**Assistant « niveau 1 » (LECTURE SEULE — l'IA propose, l'utilisateur agit).** Accessible via un
bouton flottant présent sur toutes les pages du dossier. Deux capacités, aucune écriture en base
(hors la ligne de quota `ia_appels`), aucune nouvelle table, aucune nouvelle variable d'environnement
(réutilise `MISTRAL_API_KEY`). `npx tsc --noEmit` vert.

- **Réponse sur l'état du dossier** : `app/api/assistant/repondre/route.ts`. Ordre habituel
  **auth (401) → quota (429) → Mistral**. Quota dans `ia_appels` avec `fonctionnalite="assistant"`
  (15/60 s). Modèle `MODELE_ASSISTANT`. Le **résumé du dossier est construit côté client**
  (`lib/resumeDossier.ts`) et transmis dans le corps de la requête. Choix assumé : le résumé ne décrit
  que les données de l'utilisateur (déjà protégées par la RLS à la lecture), lui seul voit la réponse,
  rien n'est écrit → pas de reconstruction serveur à ce stade. Consigne stricte : répondre
  **uniquement** d'après le résumé, vouvoiement, vocabulaire neutre, **aucune qualification**
  (« manquement », « faute »…), aucun conseil juridique, ne rien inventer ; si l'info manque, le dire
  et renvoyer vers le bon menu.
- **Aiguillage** (« que voulez-vous faire ? ») : `app/api/assistant/aiguiller/route.ts`. Même
  auth/quota. L'IA ne renvoie qu'une **clé** d'une **liste fermée** (`lib/destinationsAssistant.ts`,
  ≈ 19 destinations = les pages de la NavBar) ; **le code résout l'URL réelle**. Température 0, sortie
  JSON `{cle, raison}`. Toute clé hors liste est **rejetée** → l'IA ne peut jamais fabriquer d'adresse.

**Fichiers du module :**
- `lib/resumeDossier.ts` : fonction **PURE** `formaterResumeTexte(ResumeDossier)` (réutilisable côté
  serveur plus tard) + chargement client `chargerResumeDossier()` (lecture seule, cloisonné procédure
  active ; réutilise `chargerEtatDossier`, `controlerDossier`/`resumeControle`, `totauxFrais`/
  `totauxPension`). Produit **les mêmes chiffres que `TableauDeBord`**.
- `lib/destinationsAssistant.ts` : type `Destination` + tableau fermé `DESTINATIONS` (cle/href/label/
  description), source unique de l'aiguillage.
- `components/AssistantFlottant.tsx` : bouton rond navy « ? » monté **une seule fois** dans
  `app/layout.tsx`. Masqué hors connexion et sur les pages auth/légales (mêmes `ROUTES_MASQUEES` que la
  capture rapide). Panneau (orienter + poser une question) qui s'ouvre selon la place disponible
  autour du bouton, se ferme au changement de page, recharge un résumé frais à chaque ouverture.
- `lib/modelesIA.ts` : ajout `MODELE_ASSISTANT = "mistral-small-2603"`.

**Boutons flottants déplaçables.** `lib/useDeplacable.ts` : outil partagé (souris + tactile via
`pointer events`), position **bornée à l'écran**, **mémorisée en `localStorage`** (propre à chaque
appareil), distinction **appui vs déplacement** par seuil (≈ 6 px) pour ne pas ouvrir le menu quand on
déplace. Réutilisé par `AssistantFlottant` (clé `pos-assistant`, défaut bas-gauche) **et**
`BoutonCaptureRapide` (clé `pos-capture`, défaut bas-droite). Les deux FAB sont passés en **48 px**
(h-12 w-12) ; le menu/panneau s'ancre haut/bas + gauche/droite selon la position.

> ⚠️ **Provisoire à retirer (depuis le PC).** `app/test-resume/page.tsx` (page de vérification des
> étapes 1–3) + le lien « 🧪 Test résumé (temporaire) » dans la famille **Réglages** de `NavBar.tsx`.
> Tout le reste du module assistant est **définitif** (les deux routes, `resumeDossier`,
> `destinationsAssistant`, `useDeplacable`, `AssistantFlottant`, `MODELE_ASSISTANT`).

### 2026-06-20 — Assistant « niveau 3 » : pré-remplissage assisté (l'IA propose, l'utilisateur valide)

**But.** À partir d'une phrase libre (« payé 45 € de cantine pour Léa le 12 mars »), l'assistant
**propose** des champs pré-remplis pour `/frais` (priorité) ou `/journal`. **Aucune écriture IA en
base** : le clic sur « Ajouter » de l'écran existant **est** la validation humaine. Aucune nouvelle
table, aucune nouvelle variable d'environnement (réutilise `MISTRAL_API_KEY`). `npx tsc --noEmit` vert.

- **Route** `app/api/assistant/pre-remplir/route.ts` : même chaîne que l'aiguillage
  **auth (401) → quota (429) → Mistral**. Quota dans `ia_appels` avec `fonctionnalite="pre-remplir"`
  (15/60 s, compteur distinct, texte libre → pas de modif de schéma). `MODELE_ASSISTANT`, température 0,
  sortie JSON strict `{type:"frais"|"journal"|"aucun", champs, avertissements}`. La **date du jour est
  fournie par le serveur** pour résoudre les dates relatives. La **phrase n'est jamais journalisée**
  (les `console.error` ne loggent que le statut/détail Mistral).
- **Verrou serveur** : la sortie IA est toujours assainie par `nettoyerProposition()` avant de sortir,
  même si le JSON est cassé (→ `{type:"aucun"}`). Catégorie forcée dans la liste fermée sinon « Autre » ;
  montant = nombre fini ≥ 0 sinon `null` ; date `AAAA-MM-JJ` **calendairement valide** sinon `null` ;
  enfant en **texte** (prénom/alias), jamais d'UUID. L'IA n'invente rien (valeur absente → `null`).
- **Lib PURE** `lib/preRemplissage.ts` (aucun accès navigateur, réutilisable mobile/serveur) : listes
  fermées `CATEGORIES_FRAIS` / `CATEGORIES_JOURNAL` (identiques aux `<select>` des écrans), types du
  contrat (`Proposition`, `ChampsFrais`, `ChampsJournal`…), `nettoyerProposition()`, et la clé de
  transport `CLE_SESSION_PREREMPLISSAGE = "pp_preremplissage"`.
- **Transport** par `sessionStorage` (clé lue **une seule fois** au montage puis effacée), **jamais par
  l'URL** : un prénom/montant ne doit pas finir dans l'URL/l'historique/les journaux.
- **Écrans `/frais` et `/journal`** : lecture unique du `sessionStorage`, **re-passage** par
  `nettoyerProposition()` (défense en profondeur), action **uniquement** sur le `type` de l'écran.
  L'encart « Ajouter » s'**ouvre automatiquement** via un `key` qui force le remontage (sans modifier
  `EncartPliable` ; champs contrôlés par le parent → aucune perte de saisie). Bandeau or neutre
  « **proposition à vérifier avant d'ajouter** » + liste des `avertissements`. **Rapprochement enfant**
  par texte contre `getEnfantsDeProcedureActive()` (cloisonné par procédure active) ; sans
  correspondance, champ laissé vide.
- **`components/AssistantFlottant.tsx`** : 3ᵉ section « **Pré-remplir une saisie** ». Appel de la route,
  écriture de la proposition dans `sessionStorage`, puis `router.push()` vers la destination **issue de
  la liste fermée** `DESTINATIONS` (jamais fabriquée). Mention de confidentialité sous le champ (saisie
  envoyée au prestataire d'IA UE, **rien enregistré tant que l'utilisateur ne valide pas**). Cas
  `type:"aucun"` → message neutre, pas de redirection.

**Fichiers du module :** créés `lib/preRemplissage.ts`, `app/api/assistant/pre-remplir/route.ts` ;
modifiés `app/frais/page.tsx`, `app/journal/page.tsx`, `components/AssistantFlottant.tsx`.

### 2026-06-18 — « Résumé du mois » (page lecture seule)

- Nouveau `app/resume-mois/page.tsx` : vue d'ensemble d'un mois choisi
  (`<input type="month">`, mois courant par défaut). 3 sections : Frais du mois,
  Pension du mois, Faits notés du mois (comptage + répartition par catégorie).
- Lecture seule, AUCUNE écriture en base. Réutilise `totauxFrais` / `totauxPension`
  / `euros` (`lib/dossierCalculs.ts`). Cloisonné par procédure active, même patron
  que `TableauDeBord` (enfants via `getProcedureActiveId` ; frais & faits par
  `child_id` ou sans enfant ; pension par `procedure_id`).
- Filtrage par mois robuste : `chaine.startsWith("AAAA-MM")` sur `date_frais`,
  `mois_du`, `date_evenement` (pas de parsing Date, pas de souci de fuseau).
- Lien ajouté dans `components/NavBar.tsx`, famille « Mon dossier », en tête.
- Statuts factuels uniquement (reste dû / trop-perçu / à jour) ; aucune qualification.
  `npx tsc --noEmit` vert.

### 2026-06-18 — Export CSV de la chronologie

### 2026-06-18 — Export CSV étendu (frais, pension, documents)

### Export CSV — Journal (livré 2026-06-18)
- Fichier : app/journal/page.tsx (354 lignes)
- Bouton « Exporter en CSV » dans la barre de filtre (ml-auto, désactivé si liste vide)
- Périmètre exporté = evenementsFiltres (cloisonnement procédure active + filtre catégorie respectés)
- Colonnes : Date · Heure · Catégorie · Titre · Description factuelle · Enfant · Statut
- Statut exporté en clair via badgeStatut().texte (Brouillon / Validé / Exporté)
- Réutilise construireCsv() (lib/csvExport.ts) + telechargerCsv() (lib/telechargerCsv.ts)
- Avertissement non qualifié inséré automatiquement par construireCsv()
- Aucune écriture, aucune IA, aucune modif Supabase — lecture seule

Modules AVEC export CSV : pension, frais, chronologie, documents, journal, preuves
Modules SANS export CSV restants : courriers (sans objet — pas de table, voir §4)

- Nouveau `lib/csvExport.ts` : fonction pure générique `construireCsv({ enTete, lignes, contexte })`
  (BOM UTF-8, séparateur `;`, CRLF, échappement, pied avec avertissement non-qualifié).
  Réutilisable mobile (aucun accès navigateur). `lib/chronologieCsv.ts` reste inchangé.
- Nouveau `lib/telechargerCsv.ts` : helper WEB UNIQUEMENT (Blob + lien), source unique
  du téléchargement, à n'appeler que côté client.
- Bouton « Exporter en CSV » ajouté sur 3 pages, cloisonné par procédure active,
  exportant exactement ce qui est affiché :
  - `app/frais/page.tsx` : 8 colonnes (Date, Catégorie, Libellé, Enfant, Montant total,
    Part due, Statut, Justificatif).
  - `app/pension/page.tsx` : 7 colonnes (Mois, Montant dû, Montant payé, Reste dû,
    Statut, Date de paiement, Notes).
  - `app/documents/page.tsx` : 4 colonnes (Date, Catégorie, Libellé, Enfant) — pièces
    actives uniquement (coffre-fort non couvert).
- Statuts factuels uniquement (Remboursé/Non remboursé, Payé/Partiel/En retard/À venir) :
  aucune qualification. `npx tsc --noEmit` vert.
- Reste possible plus tard : export du coffre-fort, et adoption éventuelle de `csvExport.ts`
  par `chronologieCsv.ts` (non prioritaire, pas de régression à risquer).

- Nouveau `lib/chronologieCsv.ts` : fonction pure `construireCsvChronologie(lignes, contexte)`.
  Réutilise les lignes déjà filtrées par `filtrerEtFormaterPourPdf`. Séparateur `;` (Excel FR),
  BOM UTF-8, échappement guillemets, avertissement non-qualifié en pied. Aucun accès navigateur
  (réutilisable React Native).
- `app/chronologie/page.tsx` : bouton « Exporter en CSV » + helper navigateur `telechargerCsv`
  (Blob). Filtrage factorisé dans `lignesFiltrees()`, partagé par export PDF et CSV.

### Corrections d'état (le code faisait foi au 2026-06-18)
- `cross-env` : DÉJÀ présent dans devDependencies (dette close).
- `lib/limiteurAppel.ts` : DÉJÀ supprimé (dette close).
- Service worker PWA : DÉJÀ en place et monté (public/sw.js + MajServiceWorker dans layout).
- `BoutonCaptureRapide.tsx` : DÉSORMAIS monté dans app/layout.tsx (et déplaçable depuis le 20/06/2026).
- Plus aucun placeholder [À COMPLÉTER] dans app/ components/ lib/.

**MVP fonctionnel** : auth Supabase, enfants (CRUD), journal factuel (avec garde-fou de
neutralité), frais, pension (statuts calculés), documents, export PDF, calendrier de garde +
rappels, module preuve photo scellée, assistant de courriers, pipeline IA complet, **assistant
copilote lecture seule**.

**⭐ Cloisonnement par procédure (Phases 1→5, terminé)** — voir socle §4. Table `procedures`,
colonne `procedure_id` partout où il faut, helper `lib/procedureActive.ts`, sélecteur + bandeau,
tous les écrans liés à l'enfant filtrés, page `/procedure`, `/dossier` allégé au déclarant,
colonnes en doublon supprimées de `dossier`.

**Coffre-fort de documents (`/documents/coffre-fort`)** — liste centralisée (documents +
preuves), classée par enfant / type / date, filtrable (nature, catégorie, enfant, recherche),
cloisonnée par procédure. `SelecteurPieces.tsx` pour la sélection. `/documents` = pièces
**actives** (`etat='actif'`), avec « conserver au coffre-fort » (archive) / « supprimer
définitivement ». ⚠️ Les `preuves_photo` ne participent **jamais** au workflow `etat`.

**Note de synthèse factuelle pour avocat (`/note-synthese`)** — préchargement cloisonné par
procédure (`lib/prechargerNote.ts`), sélection de pièces (`lib/piecesnote.ts`), structure
(`lib/structureNote.ts`), assemblage (`lib/assemblerNote.ts`), brouillon persistant
(`lib/brouillonStockage.ts` ↔ table `note_brouillon`), export PDF (`lib/exportNotePdf.ts`,
jsPDF + **pdf-lib**), UI `FormulaireNote.tsx` + `BrouillonNote.tsx` + `QuestionnaireAiguillage.tsx`.
⚠️ Cadrage : **pas de « conclusions JAF »** — note **factuelle** organisée, avec bordereau numéroté.

**Pipeline IA (complet)**
- Consentement par fonctionnalité (`consentements_ia`) ; `ConsentementIA.tsx` = porte réutilisable.
- **Brique B — reformulation neutre** : `/api/ia/reformuler`, page `/reformuler` (Mistral, T 0.2).
- **Brique A — extraction du jugement** sur les 4 tables règles, **un seul appel Mistral**, JSON
  sectionné, chaque champ `{ valeur, confiance, citation }`. Le **dispositif fait foi**
  (« PAR CES MOTIFS »). Pré-remplissage des 4 encarts `RegleX` ; écriture avec `procedure_id`
  (procédure active) + `source='ia'`, `valide=false`.
  - Porte 1 (description libre) : `/api/ia/extraire`, hub `/dossier/extraire`.
  - Porte 2 (PDF) : `/dossier/importer-pdf` + `/api/ia/extraire-pdf` (`unpdf` ; OCR Mistral en
    secours, consentement explicite).
  - Cœur partagé : `lib/extractionRegles.ts`, `lib/regleConvertisseurs.ts`, ciblage
    `lib/dispositif.ts`. Aperçu : `ApercuExtraction.tsx` (`lib/libellesRegles.ts`).
- **Assistant copilote (lecture seule)** : `/api/assistant/repondre` + `/api/assistant/aiguiller`
  (voir entrée 2026-06-20). Réutilise le quota `ia_appels` (`fonctionnalite="assistant"`).
- **Quota durable** : `lib/quotaIa.ts` (table **`ia_appels`**). Reformulation 15/60 s, extraction
  10/60 s, extraction-pdf 5/120 s, assistant 15/60 s, horodatage 30/60 s → 429. Fail-closed.
- **Auth des routes IA** : `lib/authServeur.ts` + `lib/enteteAuth.ts`. **Ordre : auth (401) →
  quota (429) → Mistral.**

**Assistant de courriers (complet, cloisonné)** : `CourrierModele.tsx` charge le **déclarant**
depuis `dossier` et **fusionne l'autre parent + le jugement de la procédure active**. 4 modèles
actifs (`relance-pension`, `remboursement-frais`, `non-representation`, `info-scolarite-sante`),
architecture extensible (`MODELES`), helpers `lib/courrierHelpers.ts`, PDF `lib/courrierPdf.ts`.

**Briques déterministes** : `lib/controleDossier.ts` (logique pure) + `ControleDossier.tsx`
(contrôle avant export, cloisonné) ; calculs `lib/dossierCalculs.ts` (`totauxFrais`,
`totauxPension`, `euros`, `resteDuGlobal`) utilisés par `TableauDeBord`, `/export`, `/resume-mois`,
le **résumé assistant** (`lib/resumeDossier.ts`) et `WidgetActionsPrioritaires` (tous cloisonnés).
Chargement d'état lecture seule mutualisé : `lib/etatDossier.ts` (`chargerEtatDossier` →
`DonneesControle`).

**Accueil « cockpit »** : `app/page.tsx` (connecté) empile `WidgetActionsPrioritaires` →
`WidgetSituationMois` → `TableauDeBord` → `WidgetDossierPret` → `ProchainesEcheances` →
`ConfigurationDossier`. Tous lecture seule, cloisonnés procédure active.

**Calendrier de garde** : `garde_regles`, moteur `lib/gardeCalendrier.ts`, page `/calendrier`,
grille `CalendrierMensuel.tsx`, notifications navigateur `lib/gardeNotifications.ts` (localStorage,
seuil 2 jours), `ProchainesEcheances.tsx`. Règle de garde dans un `EncartPliable` inline.

**Module preuve photo** : capture in-app, empreinte SHA-256 (Web Crypto), GPS, comparaison heure
appareil/serveur, colonnes d'horodatage, rapport PDF (`lib/preuvePdf.ts`) avec aperçu JPEG intégré,
badges de statut colorés. Horodatage **HMAC-SHA256 non qualifié** via `/api/horodatage`.
✅ **Route `/api/horodatage` sécurisée (15/06/2026)** : auth Bearer (401) → quota anti-abus 30/60 s
(429, compté dans `ia_appels` avec `fonctionnalite="horodatage"`) → signature. eIDAS qualifié
(QTSP, RFC 3161) **différé** ; plomberie prête (swap ≈ `app/api/horodatage/route.ts`).
✅ **Vérification serveur du hash (livrée — migration 006)** : recalcul serveur du SHA-256 du fichier
réellement stocké via `/api/preuves/verifier-hash` (`lib/hashServeur.ts`), colonnes
`empreinte_sha256_serveur` / `hash_verifie` / `hash_verifie_at` sur `preuves_photo`, statut
d'intégrité affiché dans l'UI et le rapport PDF.

**Mobile web (PWA) — installable + hors-ligne ✅** : PWA installable (`app/manifest.ts`,
icônes `public/icons/`, `viewport`/`theme-color`/`appleWebApp` dans `layout.tsx`).
Service worker `public/sw.js` actif : coquille en cache hors-ligne + module de mise
à jour (`components/MajServiceWorker.tsx`). Ne met JAMAIS en cache les données
Supabase, le Storage ni `/api/` (URLs signées 60 s préservées).

**RGPD / mise en ligne** : suppression de compte (`/api/compte/supprimer`, client `service_role`,
efface Storage → tables → Auth) ; « Effacer toutes mes données » (`EffacerDonnees.tsx` bas de
`/dossier`) ; pages légales (`/confidentialite` source unique, `/mentions-legales`) ; `Footer.tsx` ;
`AccueilPublic.tsx` + `GardeAcces.tsx` ; boîte d'accueil RGPD `BienvenueRGPD.tsx` (table
`acceptation_politique`).

**App mobile Expo (repo séparé `parent-preuve-mobile`, SDK 54)** : auth, liste enfants
(read-only), journal events avec formulaire de création, garde-fou neutralité, persistance
AsyncStorage. Le backend Supabase est réutilisé tel quel.

---

## 2. Schéma Supabase (référence)

> **Migrations versionnées** (`supabase/migrations/`) : `001_init_schema` · `002_rls_policies` ·
> `003_storage_policies` · `004_indexes` · `005_implication_parentale` · `006_verification_hash_serveur`.
> Rappel : `001`→`003` NON idempotentes (base vierge, dans l'ordre) ; `004`→`006` idempotentes
> (`if not exists` / `add column if not exists`). Toute migration de colonne = **2 endroits**
> (local `supabase db reset` + prod SQL Editor).

> **⚠️ Corrections issues de l'audit migrations (2026-06-17) — le réel fait foi :**
> 1. **`dossier`** : les colonnes `consentement_ia` / `consentement_ia_date` **n'existent PAS**
>    (le consentement vit dans `consentements_ia`). En revanche `declarant_email` et
>    `declarant_telephone` existent bien. ⇒ corriger la description de `dossier`.
> 2. **`documents.etat`** : CHECK à **3 valeurs** `actif | archive | a_traiter` (pas 2).
>    Une colonne héritée **`archive` (boolean)** coexiste avec `etat` (redondance, dette légère).
> 3. **CHECK en base = seulement 2** : `events.statut` et `documents.etat`. Toutes les autres
>    colonnes « à choix » (`type_dvh`, `type_decision`, `debiteur`, `source`, `horodatage_statut`,
>    `parent_principal`, `type_garde`…) sont du **texte libre sans CHECK** (encadrées par le code).
> 4. **`consentements_ia.user_id`** : seule FK `user_id` **sans `ON DELETE CASCADE`** (incohérence
>    mineure ; la suppression RGPD passe par le client admin).
> 5. **Index réels = 7** : `procedure_id` sur `children`, `decision_regle`, `dvh_regle`,
>    `frais_regle`, `pension_payments`, `pension_regle` + composite `ia_appels(user_id, created_at DESC)`.
>    **Pas** d'index dédié `user_id`/`created_at` ailleurs (optimisation future possible, hors périmètre).

**Convention** : `id uuid` (PK), `user_id uuid default auth.uid()`, colonnes en français,
`created_at timestamptz`. **RLS + 4 policies par table** sur `auth.uid() = user_id`. RLS active
sur **100 %** des tables.

### ⭐ `procedures` (conteneur central — Phase 1)
`id`, `user_id` (FK `auth.users`, `on delete cascade`), `created_at`,
`autre_parent_civilite/_nom/_prenom/_adresse/_code_postal/_ville`,
`jugement_juridiction/_date/_numero_rg/_intitule`, **`etiquette`** (text, nullable ; saisie libre,
affichée dans le bandeau + le sélecteur). RLS + 4 policies.
> **`procedure_id` (uuid, nullable, FK `procedures`, `on delete set null`, indexé)** a été ajouté
> à : `children`, `pension_regle`, `frais_regle`, `dvh_regle`, `decision_regle`, `pension_payments`.

### Tables principales
- **`children`** — enfants. ⚠️ Prénom = **`prenom_ou_alias`**. Porte `procedure_id`.
- **`events`** — journal : `titre`, `categorie`, `date_evenement`, `heure_evenement`,
  `description_factuelle`, `child_id`, **`statut`** (`brouillon`|`valide`|`exporte`, défaut
  `brouillon`), **`implication_categorie`** (text, nullable). Cloisonné par procédure via `child_id`.
- **`expenses`** — frais : `libelle`, `categorie`, `montant`, `part_autre`, `date_frais`,
  `rembourse`, **`document_id`** (FK `documents`, `on delete set null`), `child_id`.
- **`pension_payments`** — paiements réels mois par mois : `mois_du`, `montant_du`,
  `montant_paye`, `date_paiement`, `notes`, **`procedure_id`** (pas de `child_id` : la pension est
  par procédure). Lu/écrit `.eq('procedure_id', procId)`.
- **`documents`** — pièces : `libelle`, `categorie`, `chemin_fichier`, `date_document`,
  `child_id`, **`etat`** (`actif`|`archive`|`a_traiter`, CHECK, pour le coffre-fort),
  `archive` (boolean hérité, redondant), **`implication_categorie`** (text, nullable).
- **`dossier`** — socle **DÉCLARANT UNIQUEMENT** (1 ligne/user, `upsert`) : `declarant_*`
  (dont `declarant_email`, `declarant_telephone`). ⚠️ Les colonnes `autre_parent_*` et `jugement_*`
  ont été **SUPPRIMÉES (Phase 5-C)** — elles vivent dans `procedures`. Ne plus jamais les
  écrire/lire depuis `dossier`. Les colonnes `consentement_ia*` **n'existent pas** ici.
- **`preuves_photo`** — voir §2.5.
- **`garde_regles`** — règle de garde (une par `enfant_id`). Voir §2.6.
- **`note_brouillon`** — brouillon de la note de synthèse (1 par user).
- **`consentements_ia`** — consentement IA par fonctionnalité (SOURCE DE VÉRITÉ). Insert/Select +
  DELETE, pas d'UPDATE (fait historique daté).
- **`ia_appels`** — quota anti-abus durable (pas de policy DELETE → non réinitialisable ;
  supprimé via client admin à la suppression de compte). Sert aussi à l'horodatage et à l'assistant.
- **`acceptation_politique`** — `version`, `accepted_at` (SELECT + INSERT). Pilote la boîte RGPD.

> **Table proposée par l'audit (non créée) — `audit_log`** (journal append-only) : `id`, `user_id`
> (FK `auth.users`, cascade), `procedure_id` (FK `procedures`, cascade), `objet_type`, `objet_id`,
> `action` (`creation`|`modification`|`archivage`|`suppression`|`export_pdf`|`export_zip`|`horodatage`|
> `verification_hash`), `hash_avant`, `hash_apres`, `metadata` (jsonb), `created_at`. RLS : SELECT par
> l'utilisateur, **aucune** policy UPDATE/DELETE (immuable). Voir backlog §5.

### Patron des 4 tables RÈGLES (`pension_regle`, `frais_regle`, `dvh_regle`, `decision_regle`)
`id`, `user_id` (FK `auth.users`, cascade), `enfant_id` (FK `children`, nullable — **présent mais
inutilisé**), **`procedure_id`** (FK `procedures`, nullable), colonnes métier fidèles au
**dispositif**, **`source`** (`'manuel'`|`'ia'`), **`valide`**, **`actif`**, `notes`, `created_at`.
- Manuel : ne pas envoyer `source/valide/actif` → défauts (`'manuel'`, `true`, `true`).
- IA : envoyer `source='ia'` + `valide=false`.
- **Lecture de la règle active** : `.eq('procedure_id', procId).eq('actif', true)` +
  `maybeSingle()` ; `update` si elle existe, sinon `insert` (avec `procedure_id`).
- L'IA n'extrait **jamais** ni `enfant_id` ni `procedure_id` (l'écriture passe par les composants
  `RegleX` qui ajoutent la procédure active).

#### 2.1 `pension_regle`
`montant_base`, `montant_courant`, `debiteur` (`'moi'`|`'autre'`), `jour_echeance`,
`paiement_avance`, `inclut_vacances`, `intermediation`, `indexation_active`, `indexation_jour`,
`indexation_mois`, `indexation_premiere_date`, `indexation_indice` + patron.

#### 2.2 `frais_regle`
`categories_couvertes`, `part_moi_pourcentage`, `part_autre_pourcentage` (somme **non forcée** à
100), `accord_prealable_requis`, `accord_prealable_seuil`, `delai_remboursement_jours`,
`justificatif_obligatoire` (défaut `true`), `s_ajoute_a_pension` + patron.

#### 2.3 `dvh_regle`
`type_dvh` (`classique`|`mediatise`|`reduit`|`progressif`|`libre`|`suspendu`|`sans_dvh`),
`titulaire`, `lieu_visite` (`domicile`|`espace_rencontre`|`tiers`|`autre`), `presence_tiers`,
`tiers_details`, `frequence`, `duree`, `duree_limitee`, `clause_renonciation`,
`clause_renonciation_details`, `remise_lieu`, `vacances_partage` + patron.
> Distinction : `garde_regles` colore l'agenda (rythme) ; `dvh_regle` consigne les modalités
> juridiques.

#### 2.4 `decision_regle`
`type_decision` (`jugement`|`ordonnance`|`convention_homologuee`|`arret`|`autre`), `provisoire`,
`execution_provisoire`, `susceptible_appel`, `frappee_appel`, `appel_date`, `appel_juridiction`,
`date_decision`, `date_signification`, `date_audience_prochaine`, `mise_en_etat`,
`mise_en_etat_details` + patron. *(Encart édité dans `/procedure`.)*

#### 2.5 `preuves_photo`
`titre`, `description`, `enfant_id`, `storage_path`, `nom_fichier`, `type_fichier`,
`taille_octets`, `empreinte_sha256`, `metadonnees` (jsonb), `gps_*`, `heure_appareil`,
`ecart_heure_secondes`, `anomalies` (jsonb), `horodatage_jeton`, `horodatage_date`,
`horodatage_statut` (`non_qualifie`|`a_refaire`|`qualifie`), `horodatage_prestataire`,
`horodatage_algorithme`. **+ (migration 006) `empreinte_sha256_serveur`, `hash_verifie` (bool,
`NULL` = non vérifié, distinct de `false`), `hash_verifie_at`.** `created_at` = horodatage serveur.
> **Évolutions encore proposées (non créées) :** `token_verification` (non devinable, pour une page
> publique de vérification) ; statut horodatage élargi vers un modèle eIDAS-ready
> (`interne_non_qualifie`|`qualifie_en_attente`|`qualifie_valide`|`qualifie_echec`).
> Voir backlog §5 et `PARENT_PREUVE_ROADMAP_UX.md`.

#### 2.6 `garde_regles`
`enfant_id`, `type_garde` (`weekend_sur_deux`…), `parent_principal`, `date_reference`,
`jour_debut`, `heure_debut`, `jour_fin`, `heure_fin` + patron.

### Storage
Buckets **privés** `preuves` et `justificatifs`, cloisonnés par utilisateur.
`justificatifs` = `userId/fichier` ; `preuves` = `userId/preuveId/fichier`. **Pas de policy UPDATE
sur `preuves`** (originaux scellés). URL signée 60 s pour la lecture.

### Sécurité — synthèse
- Auth **entièrement côté navigateur** ; routes serveur via **token Bearer** (`lib/authServeur.ts`).
- Routes IA + horodatage + assistant : **auth (401) → quota (429) → traitement**. Secrets serveur
  uniquement, jamais `NEXT_PUBLIC_`.
- RLS sur 100 % des tables ; buckets privés cloisonnés. Le cloisonnement par procédure repose
  **en plus** sur des filtres applicatifs (la RLS protège déjà par utilisateur).

---

## 3. Carte des fichiers (réelle — racine, pas de `src/`)

```
app/
  layout.tsx              NavBar + BandeauProcedure + GardeAcces(children) + Footer + BienvenueRGPD
                          + MajServiceWorker + BoutonCaptureRapide + AssistantFlottant
  page.tsx                ACCUEIL : AccueilPublic si déconnecté, sinon WidgetActionsPrioritaires +
                          WidgetSituationMois + TableauDeBord + WidgetDossierPret + ProchainesEcheances
                          + ConfigurationDossier (tous cloisonnés)
  globals.css             tokens design + .font-display + .carte (--background #ECE7DC)
  manifest.ts             PWA (nom, couleurs, icônes)
  connexion · compte · mot-de-passe-oublie · reinitialiser-mot-de-passe   (auth)
  confidentialite · mentions-legales                                       (légal)
  dossier/page.tsx        DÉCLARANT seul + StatutConsentementIA + EffacerDonnees + renvoi vers /procedure
  dossier/extraire        HUB extraction IA (porte 1)
  dossier/importer-pdf    PORTE 2 PDF/OCR
  procedure/page.tsx      ⭐ édition procédure active : étiquette + autre parent + jugement + RegleDecision
  enfants/page.tsx        TOUS les enfants ; ajout « même autre parent ? » ; crée/nettoie les procédures
  journal · frais (+RegleFrais) · pension (+ReglePension)
  calendrier/page.tsx     garde par enfant + RegleDVH
  resume-mois/page.tsx    vue d'ensemble d'un mois (lecture seule, cloisonnée)
  implication-parentale   regroupement faits+pièces marqués (lecture seule) + CSV
  documents · documents/coffre-fort
  preuves · preuves/nouvelle
  courriers               index + 4 modèles
  export/page.tsx         ControleDossier + bordereau + calculs (cloisonné)
  note-synthese/page.tsx  note de synthèse pour avocat (cloisonnée)
  reformuler/page.tsx
  test-resume/page.tsx    ⚠️ PROVISOIRE (vérif assistant) — à retirer
  api/  horodatage · compte/supprimer · preuves/verifier-hash
        ia/reformuler · ia/extraire · ia/extraire-pdf
        assistant/repondre · assistant/aiguiller

components/
  NavBar · BandeauProcedure · SelecteurProcedure · Footer · GardeAcces · BienvenueRGPD · AccueilPublic
  MajServiceWorker · BoutonCaptureRapide (déplaçable) · AssistantFlottant (déplaçable)
  TableauDeBord · WidgetActionsPrioritaires · WidgetSituationMois · WidgetDossierPret
  ProchainesEcheances · ConfigurationDossier · CalendrierMensuel · Chronologie · ControleDossier
  ConsentementIA · StatutConsentementIA · ApercuExtraction · ReformulationIA
  EncartPliable · PageHeader · CourrierModele
  ReglePension · RegleFrais · RegleDVH · RegleDecision
  SelecteurPieces · FormulaireNote · BrouillonNote · QuestionnaireAiguillage · EffacerDonnees

lib/
  supabase · supabaseAdmin (service_role)
  procedureActive (⭐ getProcedureActiveId / getEnfantsDeProcedureActive / get|setProcedureActiveIdLocal)
  etatConfiguration (état des cartes accueil) · etatDossier (chargerEtatDossier → DonneesControle)
  authServeur · enteteAuth · quotaIa · hashServeur
  dossierCalculs · controleDossier · resumeDossier (assistant, pur + chargement)
  destinationsAssistant (liste fermée d'aiguillage) · useDeplacable (FAB déplaçables, localStorage)
  modelesIA (identifiants Mistral, dont MODELE_ASSISTANT)
  gardeCalendrier · gardeNotifications · implicationParentale
  chronologie · chronologieExport · chronologiePdf · chronologieCsv · csvExport · telechargerCsv
  courrierHelpers · courrierPdf · preuvePdf
  dispositif · extractionRegles · regleConvertisseurs · libellesRegles
  prechargerNote · piecesnote · structureNote · assemblerNote · exportNotePdf (jsPDF + pdf-lib) · brouillonStockage

supabase/
  config.toml · snippets/ · migrations/ (001→006)

racine : AGENTS.md · CLAUDE.md · README.md · package.json · .env.example
         PARENT_PREUVE_CONTEXTE.md (socle) · PARENT_PREUVE_REFERENCE.md (ce fichier) · PARENT_PREUVE_ROADMAP_UX.md
         VITRINE_PARENT_PREUVE_BRIEF.md · prompt_claude_refonte_design_parent_preuve.md
```

`package.json` — dependencies : `@supabase/supabase-js` ^2.106.2, `jspdf` ^4.2.1, `jspdf-autotable`
^5.0.8, `next` 16.2.6, `pdf-lib` ^1.17.1, `react`/`react-dom` 19.2.4, `unpdf` ^1.6.2.
devDependencies : `cross-env` ^7.0.3, `tailwindcss` ^4 (+ `@tailwindcss/postcss`), `eslint` ^9
(+ `eslint-config-next` 16.2.6), `typescript` ^5, types node/react. **Script dev :**
`cross-env NODE_OPTIONS=--use-system-ca next dev`.

**Variables d'environnement (`.env.example`)** : `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou ancien `NEXT_PUBLIC_SUPABASE_ANON_KEY` — le code lit
PUBLISHABLE en priorité), `SUPABASE_SERVICE_ROLE_KEY` (serveur), `MISTRAL_API_KEY` (serveur),
`HORODATAGE_SECRET` (serveur).

---

## 4. Dette technique (vérifiée 20/06/2026)

### ⚠️ Provisoire à retirer (assistant — depuis le PC)
- `app/test-resume/page.tsx` (page de vérification des étapes assistant) + lien
  « 🧪 Test résumé (temporaire) » dans la famille **Réglages** de `components/NavBar.tsx`.
  Inoffensif (lecture seule) mais à supprimer. Vérif : `Select-String "test-resume"` doit ne rien
  renvoyer une fois retiré.

### Corrections issues de l'audit (état)
Identifiées lors de l'audit du 17/06/2026 (fichier source `audit_suggestions_parent_preuve.md`
désormais absorbé/supprimé ; ses pistes produit sont passées dans `PARENT_PREUVE_ROADMAP_UX.md`).
À vérifier dans le code réel avant de coder (l'audit a été fait sur snapshot, **le code fait foi**).
1. ✅ **RÉSOLU (17/06/2026) — Secret d'horodatage unifié.** Le code lit `HORODATAGE_SECRET`
   (`app/api/horodatage/route.ts`) et échoue proprement si la variable manque (500 explicite).
   Reliquat `HMAC_SECRET` corrigé dans `README.md` ; `.env.example` (placeholders vides) + exception
   `!.env.example` dans `.gitignore`.
2. ✅ **RÉSOLU (2026-06-18) — `supabase/migrations/` créé et versionné** (`001`→`006`), validé par
   rejeu sur base de test vierge. Le schéma (tables, FK, CHECK, index, policies RLS + Storage) est
   désormais une source de vérité fiable. *(Reste : maintenir la synchro local ↔ prod via
   `supabase db push` lors d'une session dédiée.)*
3. ✅ **RÉSOLU (17/06/2026) — Quota IA fail-closed.** `lib/quotaIa.ts` : l'erreur d'insert dans
   `ia_appels` est vérifiée (`erreurInsert`) ; si l'enregistrement échoue, l'appel est **refusé**
   (`autorise: false`) avec un log serveur non sensible. Le quota ne peut plus être contourné par un
   insert silencieusement échoué. Validé `npx tsc --noEmit`.
4. ✅ **RÉSOLU (17/06/2026) — Suppression de compte complète (17/17 tables).**
   `app/api/compte/supprimer/route.ts` : `note_brouillon` et `procedures` ajoutées à
   `TABLES_UTILISATEUR`, `procedures` EN DERNIER (après `children`) car children / règles /
   pension_payments la référencent via `procedure_id` (ON DELETE SET NULL). Inchangé : auth par
   session, client admin filtré par user_id, effacement Storage (2 buckets), compte Auth supprimé en
   dernier, AUCUNE protection quota (le RGPD interdit de bloquer l'effacement).
5. ✅ **RÉSOLU (migration 006) — Hash preuve recalculé côté serveur.** Recalcul serveur du SHA-256 du
   fichier stocké, comparaison client/serveur, colonnes `empreinte_sha256_serveur` / `hash_verifie` /
   `hash_verifie_at`, résultat affiché dans l'UI et le rapport PDF (`/api/preuves/verifier-hash`,
   `lib/hashServeur.ts`).

> Priorités complètes et découpage en sprints : voir `PARENT_PREUVE_ROADMAP_UX.md`.

### Dette légère — RÉSOLUE (16/06/2026)
- ✅ `app/favicon.ico` : remplacé par le monogramme PP (16/32/48 px), dérivé de
  `public/apple-touch-icon.png`. Plus de favicon Vercel par défaut.
- ✅ `README.md` : dégénéricisé (mission, stack, démarrage local, variables d'env,
  positionnement juridique). Plus de texte create-next-app.
- ✅ `lib/structureNote.ts` : libellés `source` corrigés `dossier.*` → `procedure.*`
  pour les champs réellement portés par la table `procedures` (jugement_juridiction,
  jugement_numero_rg, jugement_intitule, autre_parent_*). **`declarant_*` laissé en
  `dossier.declarant_*`** car cette colonne vit toujours dans la table `dossier`
  (chaînes purement descriptives, affichées via `FormulaireNote.tsx`, aucune requête impactée).

### MAJ navigation + accueil (session du 2026-06-17)

- **NavBar** (`components/NavBar.tsx`) : `GROUPES` réorganisé PAR INTENTION en 4 familles —
  Mon dossier (Résumé du mois, Chronologie, Calendrier de garde, Coffre-fort) / Saisir (Noter un
  fait, Ajouter une dépense, Ajouter un paiement de pension, Ajouter un document, Capturer une
  preuve photo) / Production (Export PDF, Implication parentale, Courriers, Note pour l'avocat,
  Reformulation) / Réglages (Procédure, Importer un jugement, Analyser le jugement, Socle, Enfants).
  Ancienne famille « Organisation » dissoute. Tous les liens pointent vers des pages existantes.
  ⚠️ Lien « 🧪 Test résumé (temporaire) » présent dans Réglages — à retirer (voir haut de §4).
- **BoutonCaptureRapide** (`components/BoutonCaptureRapide.tsx`) : N'EST PLUS DU CODE MORT.
  Monté une seule fois dans `app/layout.tsx`, **déplaçable** (`useDeplacable`, clé `pos-capture`).
  Conscient de l'auth, masqué sur auth/légal et pour visiteur déconnecté. Menu de 3 raccourcis :
  Noter un fait (/journal), Ajouter une dépense (/frais), Capturer une preuve photo (/preuves).
  « + » bascule en « × », appui dehors = fermeture. Décision : menu gardé à 3.
- **Vocabulaire harmonisé** : un seul nom par geste de saisie dans nav + accueil + menu capture.

- **WidgetActionsPrioritaires** (`components/WidgetActionsPrioritaires.tsx`) — LIVRÉ.
  Lecture seule, cloisonné par procédure active. Affiche 3-4 actions max (socle incomplet, aucun
  enfant, frais sans justificatif, événements en brouillon, preuves à refaire, pension impayée),
  chacune avec libellé + niveau (bloquant/avertissement) + lien direct. État vide « Aucune action
  prioritaire ». Réutilise `chargerEtatDossier`, `totauxPension`, `euros`. Aucune écriture, aucun IA.

- ✅ **Cartes « Configuration du dossier » intelligentes (17/06/2026).** Logique pure
  `lib/etatConfiguration.ts` (`getEtatConfigurationDossier`), composant
  `components/ConfigurationDossier.tsx`, cloisonné, lecture seule.

- ✅ **Mode hors-ligne PWA + module de mise à jour (16/06/2026).** SW manuel `public/sw.js` :
  cache la **coquille seule** ; **triple bypass** (non-GET, non same-origin, `/api/`) →
  preuves/jugements/justificatifs jamais cachés. `components/MajServiceWorker.tsx` (prod uniquement) :
  bandeau « nouvelle version » + bouton Recharger. Versionnage par `const VERSION` dans `sw.js`.

### Pages légales — renseignées (16/06/2026)
- `/mentions-legales` et `/confidentialite` : placeholders remplacés par les vraies valeurs
  (éditeur : Anthony Magny, particulier, Tarbes ; contact : alkhyomgame@gmail.com ; hébergement
  Vercel Paris cdg1 ; données Supabase Irlande eu-west-1).
- **Mistral IA** : formulation prudente — pas de DPA signé, ZDR non encore demandé. Avant ouverture
  publique : (1) demander l'activation du **ZDR**, (2) accepter/signer le **DPA** (art. 28), puis
  renforcer le paragraphe IA de `/confidentialite`.
- **Reste avant ouverture large** : relecture par un professionnel du droit.

### 2026-06-18 — Marqueur « implication parentale » (complet, bout en bout)
- Colonne `implication_categorie` (text, nullable, NULL = non marqué) sur `events` et `documents`.
  Catégories encadrées par le code (PAS de CHECK) : `sante | scolarite | activites | quotidien`.
  Migration idempotente `005_implication_parentale.sql` (ADD COLUMN IF NOT EXISTS), appliquée en
  local ET en prod.
- Source unique des libellés : `lib/implicationParentale.ts`. Réutilisable mobile.
- Saisie : sélecteur neutre « Implication parentale (facultatif) » sur `journal` et `documents`.
- Production : page lecture seule `app/implication-parentale/page.tsx` (faits + pièces marqués,
  classés par catégorie, cloisonnés procédure), export CSV. Aucune qualification ; bandeau
  « soumis à l'appréciation du juge ». Lien ajouté dans `NavBar` (famille Production).

---

## 5. Backlog / chantiers

### Chantier Migrations Supabase — TERMINÉ
6 fichiers SQL sous `supabase/migrations/`, fidèles au schéma réel :
- `001_init_schema.sql` : pgcrypto + 17 CREATE TABLE (ordre de dépendance) + PK + 2 CHECK
  (documents.etat, events.statut) + 2 UNIQUE (dossier.user_id, note_brouillon.user_id) + FK.
  Points fins : acceptation_politique & note_brouillon SANS FK user_id ; consentements_ia FK user_id
  SANS cascade ; garde_regles.enfant_id en CASCADE (seule exception) ; redondance documents.archive +
  documents.etat conservée.
- `002_rls_policies.sql` : ENABLE RLS sur 17 tables + 63 policies. Trous volontaires conservés :
  acceptation_politique (INSERT+SELECT), consentements_ia (pas d'UPDATE), ia_appels (INSERT+SELECT).
- `003_storage_policies.sql` : 2 buckets privés + 6 policies storage.objects (3 par bucket, PAS
  d'UPDATE → originaux scellés).
- `004_indexes.sql` : 7 index explicites (6 procedure_id + composite ia_appels(user_id, created_at DESC)).
- `005_implication_parentale.sql` : ADD COLUMN IF NOT EXISTS `implication_categorie` (events, documents).
- `006_verification_hash_serveur.sql` : colonnes `empreinte_sha256_serveur`, `hash_verifie`,
  `hash_verifie_at` sur `preuves_photo`.
Reste : maintenir la synchro local ↔ prod (`supabase db push`) lors d'une session dédiée.

**Avant ouverture large**
- Relecture juridique des pages légales ; activer ZDR + DPA Mistral (cf. §4).
- Réactiver la confirmation e-mail + vrai service SMTP.
- Harmoniser le design de `/reformuler`.

**Assistant copilote — suite possible (au-delà du niveau 1 livré)**
- Niveau 3 : pré-remplissage de formulaires à partir d'une phrase (l'IA propose un brouillon,
  l'utilisateur valide via l'écran existant ; `source='ia'`, `valide=false`). Aucune écriture directe.
- Brancher l'assistant sur des données plus riches (rapprochement dû/payé, échéances).

**Brique A (suite IA)** : moteur d'indexation INSEE (fonction pure mettant à jour `montant_courant`) ;
comparaison « dû selon la règle » vs « payé » ; surfacer `confiance`/`citation` côté import PDF.

**Renforcement preuve, sécurité & exports (issus de l'audit — détail produit dans la ROADMAP)**
- **Vérification par QR code** : `token_verification` non devinable sur `preuves_photo`, page
  `/preuves/verifier/[token]` (métadonnées minimales, **jamais** photo/données sensibles), QR dans le
  rapport PDF.
- **Journal d'audit `audit_log`** (append-only, cf. §2) câblé sur création/modification/archivage/
  suppression/export/horodatage/vérification de hash.
- **Export avocat ZIP** : `note_synthese.pdf` + `chronologie.pdf` + `bordereau_pieces.pdf` +
  `pension.pdf`/`frais.pdf` + dossiers `preuves/` et `documents/` + `manifest.json` +
  `hashes_sha256.txt` ; avertissement « données personnelles sensibles » avant téléchargement.
- **Mode dossier audience** : export PDF structuré (résumé procédure, chronologie filtrée, pension
  dû/payé/retard, frais, demandes de modification, preuves, documents, bordereau) — factuel, sans
  conclusions juridiques. Réutilise `/export` et la note de synthèse.
- **Horodatage eIDAS-ready** : statut élargi (`interne_non_qualifie`|`qualifie_en_attente`|
  `qualifie_valide`|`qualifie_echec`), rapport PDF distinguant interne non qualifié vs qualifié.

**Sur l'horizon**
- eIDAS qualifié (QTSP, swap de prestataire — plomberie prête).
- App mobile native (RN/Expo ou PWA — backend Supabase réutilisable ; le helper
  `procedureActive` devra lire la sélection persistée côté mobile). Extension de l'app Expo
  (procédures, courriers, note de synthèse).
- Détection mock location / root / jailbreak (réservé app mobile native).
- Chatbot d'orientation procédurale (RAG sur textes de référence, information générale) — distinct
  de l'assistant copilote actuel qui, lui, ne lit que les données de l'utilisateur.
- Présence App Store / Google Play.
- Favicon SVG isolé à partir du logo PP.

> Idées de **fonctionnalités produit** (chronologie unifiée, thèmes transverses, carnet
> d'informations, etc.) et **arborescence de navigation cible** : voir
> **`PARENT_PREUVE_ROADMAP_UX.md`**.