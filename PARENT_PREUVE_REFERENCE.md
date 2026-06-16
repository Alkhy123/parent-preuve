# Parent Preuve — RÉFÉRENCE technique (état réel, schéma, fichiers, dette, backlog)

> **Rôle de ce fichier.** Le **détail volatil** du projet : ce qui est réellement construit, le
> schéma Supabase complet, la carte des fichiers, la dette technique et le backlog. À charger
> **quand on code, qu'on touche la base, ou qu'on fait un audit**. Pour la mission, les règles
> juridiques et la méthode, voir le socle **`PARENT_PREUVE_CONTEXTE.md`**.
>
> **Dernière vérification sur le code : 15/06/2026.** Le code réel fait foi.
>
> **Provenance des informations.** Les **noms de tables, de colonnes et les exports** ci-dessous
> ont été vérifiés en lisant le code du dépôt (accès `.from(...)`, `select`, `insert`, `.eq(...)`).
> En revanche, le **dépôt ne contient aucun fichier SQL ni dossier `supabase/`** : le décompte des
> policies RLS (« 4 policies / table »), les contraintes `CHECK` et la définition exacte des `enum`
> vivent **côté Supabase** et ne sont donc pas vérifiables depuis ce snapshot — ils proviennent de
> l'historique de travail. Vérifier dans le tableau de bord Supabase en cas de doute.

---

## 1. État réel — ce qui est construit

**MVP fonctionnel** : auth Supabase, enfants (CRUD), journal factuel (avec garde-fou de
neutralité), frais, pension (statuts calculés), documents, export PDF, calendrier de garde +
rappels, module preuve photo scellée, assistant de courriers, pipeline IA complet.

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
- **Quota durable** : `lib/quotaIa.ts` (table **`ia_appels`**). Reformulation 15/60 s, extraction
  10/60 s, extraction-pdf 5/120 s → 429. Fail-closed.
- **Auth des routes IA** : `lib/authServeur.ts` + `lib/enteteAuth.ts`. **Ordre : auth (401) →
  quota (429) → Mistral.**

**Assistant de courriers (complet, cloisonné)** : `CourrierModele.tsx` charge le **déclarant**
depuis `dossier` et **fusionne l'autre parent + le jugement de la procédure active**. 4 modèles
actifs (`relance-pension`, `remboursement-frais`, `non-representation`, `info-scolarite-sante`),
architecture extensible (`MODELES`), helpers `lib/courrierHelpers.ts`, PDF `lib/courrierPdf.ts`.

**Briques déterministes** : `lib/controleDossier.ts` (logique pure) + `ControleDossier.tsx`
(contrôle avant export, cloisonné) ; calculs `lib/dossierCalculs.ts` (`totauxFrais`,
`totauxPension`, `euros`, `resteDuGlobal`) utilisés par `TableauDeBord` **et** `/export` (tous deux
cloisonnés).

**Calendrier de garde** : `garde_regles`, moteur `lib/gardeCalendrier.ts`, page `/calendrier`,
grille `CalendrierMensuel.tsx`, notifications navigateur `lib/gardeNotifications.ts` (localStorage,
seuil 2 jours), `ProchainesEcheances.tsx`. Règle de garde dans un `EncartPliable` inline.

**Module preuve photo** : capture in-app, empreinte SHA-256 (Web Crypto), GPS, comparaison heure
appareil/serveur, colonnes d'horodatage, rapport PDF (`lib/preuvePdf.ts`) avec aperçu JPEG intégré,
badges de statut colorés. Horodatage **HMAC-SHA256 non qualifié** via `/api/horodatage`.
✅ **Route `/api/horodatage` sécurisée (15/06/2026)** : auth Bearer (401) → quota anti-abus 30/60 s
(429, compté dans `ia_appels` avec `fonctionnalite="horodatage"`) → signature. eIDAS qualifié
(QTSP, RFC 3161) **différé** ; plomberie prête (swap ≈ `app/api/horodatage/route.ts`).

**Mobile web (PWA) — partiel** : PWA installable (`app/manifest.ts`, icônes `public/icons/`,
`viewport`/`theme-color`/`appleWebApp` dans `layout.tsx`). ⚠️ **Pas encore de service worker** →
mode hors-ligne à faire (ne **jamais** mettre en cache preuves/jugements ; URLs signées 60 s).
Responsive : grilles passées en `grid-cols-1 sm:grid-cols-2/3` sur les écrans de saisie.

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
  `brouillon`). Cloisonné par procédure via `child_id`.
- **`expenses`** — frais : `libelle`, `categorie`, `montant`, `part_autre`, `date_frais`,
  `rembourse`, **`document_id`** (FK `documents`, `on delete set null`), `child_id`.
- **`pension_payments`** — paiements réels mois par mois : `mois_du`, `montant_du`,
  `montant_paye`, `date_paiement`, `notes`, **`procedure_id`** (pas de `child_id` : la pension est
  par procédure). Lu/écrit `.eq('procedure_id', procId)`.
- **`documents`** — pièces : `libelle`, `categorie`, `chemin_fichier`, `date_document`,
  `child_id`, **`etat`** (`actif`|`archive`, CHECK constraint, pour le coffre-fort).
- **`dossier`** — socle **DÉCLARANT UNIQUEMENT** (1 ligne/user, `upsert`) : `declarant_*` +
  `consentement_ia` / `consentement_ia_date`. ⚠️ Les colonnes `autre_parent_*` et `jugement_*`
  ont été **SUPPRIMÉES (Phase 5-C)** — elles vivent dans `procedures`. Ne plus jamais les
  écrire/lire depuis `dossier`.
- **`preuves_photo`** — voir §2.5.
- **`garde_regles`** — règle de garde (une par `enfant_id`). Voir §2.6.
- **`note_brouillon`** — brouillon de la note de synthèse (1 par user).
- **`consentements_ia`** — consentement IA par fonctionnalité (SOURCE DE VÉRITÉ). Insert/Select +
  DELETE, pas d'UPDATE (fait historique daté).
- **`ia_appels`** — quota anti-abus durable (pas de policy DELETE → non réinitialisable ;
  supprimé via client admin à la suppression de compte). Sert aussi à l'horodatage.
- **`acceptation_politique`** — `version`, `accepted_at` (SELECT + INSERT). Pilote la boîte RGPD.

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
`horodatage_algorithme`. `created_at` = horodatage serveur.

#### 2.6 `garde_regles`
`enfant_id`, `type_garde` (`weekend_sur_deux`…), `parent_principal`, `date_reference`,
`jour_debut`, `heure_debut`, `jour_fin`, `heure_fin` + patron.

### Storage
Buckets **privés** `preuves` et `justificatifs`, cloisonnés par utilisateur.
`justificatifs` = `userId/fichier` ; `preuves` = `userId/preuveId/fichier`. **Pas de policy UPDATE
sur `preuves`** (originaux scellés). URL signée 60 s pour la lecture.

### Sécurité — synthèse
- Auth **entièrement côté navigateur** ; routes serveur via **token Bearer** (`lib/authServeur.ts`).
- Routes IA + horodatage : **auth (401) → quota (429) → traitement**. Secrets serveur uniquement,
  jamais `NEXT_PUBLIC_`.
- RLS sur 100 % des tables ; buckets privés cloisonnés. Le cloisonnement par procédure repose
  **en plus** sur des filtres applicatifs (la RLS protège déjà par utilisateur).

---

## 3. Carte des fichiers (réelle — racine, pas de `src/`)

```
app/
  layout.tsx              NavBar + BandeauProcedure + GardeAcces(children) + Footer + BienvenueRGPD
  page.tsx                ACCUEIL : AccueilPublic si déconnecté, sinon TableauDeBord + ProchainesEcheances (cloisonnés)
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
  documents · documents/coffre-fort
  preuves · preuves/nouvelle
  courriers               index + 4 modèles
  export/page.tsx         ControleDossier + bordereau + calculs (cloisonné)
  note-synthese/page.tsx  note de synthèse pour avocat (cloisonnée)
  reformuler/page.tsx
  api/  horodatage · compte/supprimer · ia/reformuler · ia/extraire · ia/extraire-pdf

components/
  NavBar · BandeauProcedure · SelecteurProcedure · Footer · GardeAcces · BienvenueRGPD · AccueilPublic
  TableauDeBord · ProchainesEcheances · CalendrierMensuel · ControleDossier
  ConsentementIA · StatutConsentementIA · ApercuExtraction · ReformulationIA
  EncartPliable · PageHeader · CourrierModele
  ReglePension · RegleFrais · RegleDVH · RegleDecision
  SelecteurPieces · FormulaireNote · BrouillonNote · QuestionnaireAiguillage · EffacerDonnees
  BoutonCaptureRapide  (⚠️ existe mais N'EST MONTÉ NULLE PART)

lib/
  supabase · supabaseAdmin (service_role)
  procedureActive (⭐ getProcedureActiveId / getEnfantsDeProcedureActive / get|setProcedureActiveIdLocal)
  authServeur · enteteAuth · quotaIa · limiteurAppel (⚠️ CODE MORT)
  dossierCalculs · controleDossier · gardeCalendrier · gardeNotifications
  courrierHelpers · courrierPdf · preuvePdf
  dispositif · extractionRegles · regleConvertisseurs · libellesRegles
  prechargerNote · piecesnote · structureNote · assemblerNote · exportNotePdf (jsPDF + pdf-lib) · brouillonStockage

racine : AGENTS.md · CLAUDE.md · README.md (⚠️ par défaut) · package.json
         PARENT_PREUVE_CONTEXTE.md (socle) · PARENT_PREUVE_REFERENCE.md (ce fichier) · PARENT_PREUVE_ROADMAP_UX.md
         VITRINE_PARENT_PREUVE_BRIEF.md · prompt_claude_refonte_design_parent_preuve.md
```

`package.json` — dependencies : `@supabase/supabase-js` ^2.106, `jspdf` ^4.2, `jspdf-autotable`
^5, `next` 16.2.6, `pdf-lib` ^1.17, `react`/`react-dom` 19.2.4, `unpdf` ^1.6. Script dev :
`cross-env NODE_OPTIONS=--use-system-ca next dev`.

---

## 4. Dette technique (vérifiée 15/06/2026)

**Encore ouvertes :**
- `components/BoutonCaptureRapide.tsx` **n'est monté nulle part** → bouton flottant invisible.
  À remonter (idéalement dans `layout.tsx`).
- **`cross-env` utilisé dans le script `dev` mais absent de `package.json`** → `npm ci` sur
  machine propre échoue (`npm install` passe). À ajouter : `npm i -D cross-env`.
- `lib/limiteurAppel.ts` = **code mort** (plus importé) → supprimable.
- **README et `app/favicon.ico` par défaut** (create-next-app) → à dégénériciser.
- **Pages légales** : champs `[À COMPLÉTER]` à remplir + **relecture par un professionnel du
  droit** avant ouverture large.
- **Service worker PWA (offline)** non fait.
- **Migration progressive** des couleurs en dur (`slate`/`gray`) vers les tokens.
- **Cosmétique** : `lib/structureNote.ts` contient encore des libellés `source: 'dossier.*'`
  (autre parent / jugement) alors que la source réelle est `procedures` → renommer en
  `procedure.*` quand l'occasion se présente (pures chaînes descriptives, aucune requête).
- Alias Mistral `-latest` en dépréciation → migrer vers identifiants versionnés.

**✅ Fermées récemment (ne plus traiter comme dette) :**
- `/api/horodatage` sécurisée (auth + quota) le 15/06/2026.
- `pdf-lib` installé et branché (`lib/exportNotePdf.ts`) — d'anciennes notes le disaient « non
  installé ».
-  Export PDF de la chronologie (16/06/2026, livré et testé)

  Frise datée unique exportable en PDF pour la procédure active, filtrable par période (du/au) et par type. Réutilise fusionnerChronologie (données déjà triées/cloisonnées), euros() et le moteur jsPDF + jspdf-autotable.

  lib/chronologieExport.ts (pur) : filtrerEtFormaterPourPdf(entrees, { du?, au?, types? }, nomEnfant) → string[][] (colonnes : Date, Heure, Type, Enfant, Titre, Détails, Montant, Statut). Filtre en mémoire ; rappel « horodatage non qualifié, pas un constat » forcé sur chaque ligne preuve.
  lib/chronologiePdf.ts : genererPdfChronologie(lignes, { du?, au?, etiquetteProcedure? }) → PDF A4 paysage, en-tête navy, avertissement global (non-constat + non-conseil + horodatage non qualifié).
  app/chronologie/page.tsx : encart filtres (du/au + 4 cases types) + bouton « Exporter la frise en PDF ». Export 100 % en mémoire, aucune requête au clic, aucune table.
- ### Migration alias Mistral "-latest" → identifiants versionnés (16/06/2026) ✅ FERMÉ

  Les alias "-latest" (dépréciés, instables en prod) ont été supprimés des appels IA.
  Identifiants vérifiés via l'API Mistral GET /v1/models le 16/06/2026.

  Source unique : `lib/modelesIA.ts`
  - MODELE_REFORMULATION = "mistral-medium-2604"  (Medium 3.5 — montée en qualité voulue
    pour la fidélité du français en reformulation ; bon rapport qualité/prix en vue monétisation)
  - MODELE_EXTRACTION    = "mistral-small-2603"   (Small 4 — identique au comportement précédent,
    "mistral-small-latest" pointait déjà vers cette version)
  - MODELE_OCR           = "mistral-ocr-2512"     (OCR 3 — identique au comportement précédent)

  Fichiers branchés sur la constante :
  - app/api/ia/reformuler/route.ts   → MODELE_REFORMULATION
  - lib/extractionRegles.ts          → MODELE_EXTRACTION
  - app/api/ia/extraire-pdf/route.ts → MODELE_OCR

  Pour changer un modèle à l'avenir : modifier UNE ligne dans lib/modelesIA.ts.

Diagnostic qualité reformulation FAIT (16/06/2026) : la dérive de vocabulaire venait
  du PROMPT, pas du modèle. La CONSIGNE de app/api/ia/reformuler/route.ts demandait de
  "réécrire / clarifier / raccourcir" → le modèle paraphrasait et remplaçait les mots
  de l'utilisateur. Modèle medium-2604 CONSERVÉ (capable, conforme contrainte).
  Nouvelle CONSIGNE = "intervention minimale + fidélité au vocabulaire" : retirer seulement
  la couche agressive, garder les mots neutres de l'auteur à l'identique. Température 0.2
  inchangée. Validé sur 3 cas (insulte / accusation / texte déjà neutre).
---

## 5. Backlog / chantiers

**Avant ouverture large**
- Compléter les `[À COMPLÉTER]` des pages légales + relecture juridique.
- Réactiver la confirmation e-mail + vrai service SMTP.
  - Harmoniser le design de `/reformuler`. (Qualité de reformulation : diagnostic + correctif
  prompt faits le 16/06/2026, voir section modèles IA.)

**Brique A (suite IA)** : moteur d'indexation INSEE (fonction pure mettant à jour
`montant_courant`) ; comparaison « dû selon la règle » vs « payé » ; surfacer
`confiance`/`citation` côté import PDF.

**Sur l'horizon**
- eIDAS qualifié (QTSP, swap de prestataire — plomberie prête).
- App mobile native (RN/Expo ou PWA — backend Supabase réutilisable ; le helper
  `procedureActive` devra lire la sélection persistée côté mobile). Extension de l'app Expo
  (procédures, courriers, note de synthèse).
- Détection mock location / root / jailbreak (réservé app mobile native).
- Chatbot d'orientation procédurale (RAG sur textes de référence, information générale, appels
  serveur).
- Présence App Store / Google Play.
- Favicon SVG isolé à partir du logo PP.

> Idées de **fonctionnalités produit** (chronologie unifiée, thèmes transverses, carnet
> d'informations, etc.) et **arborescence de navigation cible** : voir
> **`PARENT_PREUVE_ROADMAP_UX.md`**.
