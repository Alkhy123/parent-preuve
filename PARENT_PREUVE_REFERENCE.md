⁷# Parent Preuve — RÉFÉRENCE technique (état réel, schéma, fichiers, dette, backlog)

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

### 2026-06-18 — Export CSV de la chronologie

### 2026-06-18 — Export CSV étendu (frais, pension, documents)

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
- `BoutonCaptureRapide.tsx` : DÉSORMAIS monté dans app/layout.tsx.
- Plus aucun placeholder [À COMPLÉTER] dans app/ components/ lib/.

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
>    **Pas** d'index dédié `user_id`/`created_at` ailleurs (optimisation future possible, hors périmètre).c

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
`horodatage_algorithme`. `created_at` = horodatage serveur.
> **Évolutions proposées par l'audit (non créées) :** `empreinte_sha256_client` /
> `empreinte_sha256_serveur` / `hash_verifie` (bool) / `hash_verifie_at` (recalcul serveur du hash) ;
> `token_verification` (non devinable, pour la page publique de vérification) ; statut horodatage
> élargi vers un modèle eIDAS-ready (`interne_non_qualifie`|`qualifie_en_attente`|`qualifie_valide`|
> `qualifie_echec`). Voir backlog §5 et `PARENT_PREUVE_ROADMAP_UX.md`.

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
  page.tsx                ACCUEIL : AccueilPublic si déconnecté, sinon TableauDeBord + ProchainesEcheances + ConfigurationDossier (cloisonnés)
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
  TableauDeBord · ProchainesEcheances · ConfigurationDossier · CalendrierMensuel · ControleDossier
  ConsentementIA · StatutConsentementIA · ApercuExtraction · ReformulationIA
  EncartPliable · PageHeader · CourrierModele
  ReglePension · RegleFrais · RegleDVH · RegleDecision
  SelecteurPieces · FormulaireNote · BrouillonNote · QuestionnaireAiguillage · EffacerDonnees
  

lib/
  supabase · supabaseAdmin (service_role)
  procedureActive (⭐ getProcedureActiveId / getEnfantsDeProcedureActive / get|setProcedureActiveIdLocal)
  etatConfiguration (getEtatConfigurationDossier → état des 3 cartes accueil, cloisonné, lecture seule)
  authServeur · enteteAuth · quotaIa
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

### ⚠️ Corrections issues de l'audit (à traiter — Sprint « fiabilisation »)
Identifiées dans `audit_suggestions_parent_preuve.md` (17/06/2026). À vérifier dans le code réel avant
de coder (l'audit a été fait sur snapshot, le code fait foi).
1. ✅ **RÉSOLU (17/06/2026) — Secret d'horodatage unifié.** Le code lisait déjà `HORODATAGE_SECRET`
   (`app/api/horodatage/route.ts`) et échoue déjà proprement si la variable manque (500 explicite).
   Reliquat `HMAC_SECRET` corrigé dans `README.md` ; table des variables complétée (ajout de
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Nouveau `.env.example` (placeholders vides) + exception
   `!.env.example` dans `.gitignore`.
2. **Pas de dossier `supabase/migrations/`.** Le schéma (tables, colonnes, enums, CHECK, FK, index,
   policies RLS, policies Storage) vit uniquement côté Supabase, non versionné. → Créer
   `supabase/migrations/` (`001_init_schema.sql`, `002_rls_policies.sql`, `003_storage_policies.sql`,
   `004_indexes.sql`) reconstituant tout le schéma + RLS (`auth.uid() = user_id`) + index sur `user_id`,
   `procedure_id`, `created_at`. Prérequis pour audit sécurité, réinstall propre et monétisation.
3. ✅ **RÉSOLU (17/06/2026) — Quota IA fail-closed.** `lib/quotaIa.ts` : l'erreur d'insert dans
   `ia_appels` est désormais vérifiée (`erreurInsert`) ; si l'enregistrement échoue, l'appel est
   **refusé** (`autorise: false`) avec un log serveur non sensible. Le quota ne peut plus être
   contourné par un insert silencieusement échoué. Validé `npx tsc --noEmit`.
4. ✅ **RÉSOLU (17/06/2026) — Suppression de compte complète (17/17 tables).** `app/api/compte/supprimer/route.ts` :
   `note_brouillon` et `procedures` ajoutées à `TABLES_UTILISATEUR`, `procedures` EN DERNIER (après `children`)
   car children / regles / pension_payments la référencent via `procedure_id` (ON DELETE SET NULL).
   Inchangé : auth par session, client admin filtré par user_id, effacement Storage (2 buckets), compte Auth
   supprimé en dernier, AUCUNE protection quota (le RGPD interdit de bloquer l'effacement). Validé `npx tsc --noEmit`.
5. **Hash preuve calculé côté client uniquement.** → Recalcul serveur du SHA-256 du fichier réellement
   stocké, comparaison client/serveur, colonnes `empreinte_sha256_client` / `empreinte_sha256_serveur` /
   `hash_verifie` (bool) / `hash_verifie_at`, et résultat affiché dans le rapport PDF (cf. §2.5).

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
  Mon dossier (Chronologie, Calendrier de garde, Coffre-fort) / Saisir (Noter un fait,
  Ajouter une dépense, Ajouter un paiement de pension, Ajouter un document, Capturer une
  preuve photo) / Production (Export PDF, Courriers, Note pour l'avocat, Reformulation) /
  Réglages (Procédure, Importer un jugement, Analyser le jugement, Socle, Enfants).
  Ancienne famille « Organisation » dissoute. Tous les liens pointent vers des pages existantes.
- **BoutonCaptureRapide** (`components/BoutonCaptureRapide.tsx`) : N'EST PLUS DU CODE MORT.
  Monté une seule fois dans `app/layout.tsx`. Conscient de l'auth (`supabase.auth.getUser`
  + `onAuthStateChange`) : visible uniquement connecté, masqué sur auth/légal
  (ROUTES_MASQUEES) ET pour visiteur déconnecté. Visible sur le tableau de bord `/`.
  Menu de 3 raccourcis : Noter un fait (/journal), Ajouter une dépense (/frais),
  Capturer une preuve photo (/preuves). « + » bascule en « × », appui dehors = fermeture.
  Décision : menu gardé à 3 (Courrier/Export/Pension/Document NON ajoutés).
- **Vocabulaire harmonisé** : un seul nom par geste de saisie dans nav + accueil + menu capture.
- **Accueil** (`app/page.tsx`) : section « Actions rapides » + tableau `actions` SUPPRIMÉS.
  Ajout section « Configuration du dossier » (3 cartes : Procédure /procedure,
  Enfants /enfants, Le jugement /dossier/importer-pdf). Double bordure des cartes retirée
  (`.carte` sans `border` dur). Ordre accueil connecté : TableauDeBord → ProchainesEcheances
  → Configuration du dossier.

- ✅ **Cartes « Configuration du dossier » intelligentes (17/06/2026, livré).** Les 3 cartes
  affichent leur état réel, cloisonné par procédure active : pastille + libellé (vert #2E6A4D
  « Configuré/Analysé », ambre #8A5A12 « À configurer/À analyser/À valider »), `…` gris pendant
  le chargement. Logique pure `lib/etatConfiguration.ts` (`getEtatConfigurationDossier` :
  procédure via `getProcedureActiveId`, comptage enfants `head:true`, jugement = état réuni des
  4 tables règles `procedure_id` + `valide` ; repli prudent en cas d'erreur, lecture seule).
  Composant `components/ConfigurationDossier.tsx` (Option A pastille + libellé) branché dans
  `app/page.tsx` (tableau `reglages` + import `Link` retirés). Validé `npx tsc --noEmit`.

- ✅ **Mode hors-ligne PWA + module de mise à jour (16/06/2026).** SW manuel `public/sw.js` (pas de
  `next-pwa`) : cache la **coquille seule** (HTML `/`, `/_next/static/`, `/icons/`) ; navigations en
  « réseau d'abord », statiques en « cache d'abord ». **Triple bypass** : ignore non-GET, tout le non
  same-origin (Supabase données + Storage `*.supabase.co`, Mistral) et tout `/api/` → preuves/jugements/
  justificatifs (URLs signées 60 s) jamais cachés. `components/MajServiceWorker.tsx` (monté dans
  `layout.tsx`, prod uniquement) : bandeau « nouvelle version » + bouton Recharger → `SKIP_WAITING` +
  un seul reload. Versionnage par `const VERSION` dans `sw.js`.

### Pages légales — renseignées (16/06/2026)
- `/mentions-legales` et `/confidentialite` : tous les placeholders `[À COMPLÉTER]` remplacés
  par les vraies valeurs (éditeur : Anthony Magny, particulier, Tarbes ; contact :
  alkhyomgame@gmail.com ; hébergement Vercel Paris cdg1 ; données Supabase Irlande eu-west-1 ;
  date 16/06/2026). Bandeaux d'avertissement reformulés « À faire relire » (crochets retirés,
  recommandation de relecture juridique conservée).
- **Mistral IA** : formulation prudente — pas de DPA signé, ZDR non encore demandé (le texte
  n'affirme donc PAS la non-conservation des contenus). Avant ouverture publique : (1) demander
  l'activation du **ZDR** à Mistral, (2) accepter/signer le **DPA** (art. 28), puis renforcer le
  paragraphe IA de `/confidentialite`.
- **Reste avant ouverture large** : relecture par un professionnel du droit.
- ✅ 2026-06-18 — Migrations Supabase VALIDÉES par rejeu sur base de test vierge.
  Les 4 fichiers (001→004) s'enchaînent sans erreur et reconstruisent
  fidèlement le schéma : 17 tables, RLS active partout (63 policies),
  2 buckets privés (justificatifs, preuves) + 6 policies storage, 7 index.
  Dépendances Supabase confirmées requises : schémas `extensions`, `auth`
  (table auth.users), `storage` — fournis nativement par Supabase.
  → supabase/migrations/ est désormais une source de vérité fiable.

**✅ Fermées récemment (ne plus traiter comme dette) :**
- `/api/horodatage` sécurisée (auth + quota) le 15/06/2026.
- `pdf-lib` installé et branché (`lib/exportNotePdf.ts`) — d'anciennes notes le disaient « non
  installé ».
- **Export PDF de la chronologie (16/06/2026, livré et testé)** : frise datée unique pour la procédure
  active, filtrable par période (du/au) et par type. `lib/chronologieExport.ts` (pur,
  `filtrerEtFormaterPourPdf` → colonnes Date/Heure/Type/Enfant/Titre/Détails/Montant/Statut, filtre en
  mémoire, rappel « horodatage non qualifié, pas un constat » forcé sur chaque ligne preuve) +
  `lib/chronologiePdf.ts` (`genererPdfChronologie`, A4 paysage, en-tête navy, avertissement global) +
  encart filtres dans `app/chronologie/page.tsx`. Réutilise `fusionnerChronologie`, `euros()`, jsPDF +
  jspdf-autotable. Export 100 % en mémoire (aucune requête, aucune table).
- **Migration alias Mistral `-latest` → versionnés (16/06/2026)** : source unique `lib/modelesIA.ts`
  (reformulation `mistral-medium-2604`, extraction `mistral-small-2603`, OCR `mistral-ocr-2512`), branchée
  dans `api/ia/reformuler`, `lib/extractionRegles.ts`, `api/ia/extraire-pdf`. Changer un modèle = 1 ligne.
- **Diagnostic qualité reformulation (16/06/2026)** : la dérive de vocabulaire venait du **prompt**, pas
  du modèle (consigne « réécrire/clarifier » → paraphrase). Nouvelle consigne dans
  `api/ia/reformuler/route.ts` = « intervention minimale + fidélité au vocabulaire » ; modèle medium-2604
  conservé, température 0.2 inchangée. Validé sur 3 cas.
- **Nettoyage dette (16/06/2026)** : `cross-env` ajouté à `devDependencies` (`^7.0.3`, `npm ci` OK) ;
  `lib/limiteurAppel.ts` (ancien limiteur mémoire) supprimé au profit du quota en base `ia_appels` ;
  `BoutonCaptureRapide` requalifié « conservé volontairement ».

---

## 5. Backlog / chantiers

### Chantier Migrations Supabase — TERMINÉ (session 2026-06-18)
4 fichiers SQL créés sous `supabase/migrations/`, fidèles au schéma réel
(audit 2026-06-17, aucun nettoyage) :
- `001_init_schema.sql` : extension pgcrypto + 17 CREATE TABLE (ordre de
  dépendance) + PK + 2 CHECK (documents.etat 3 valeurs, events.statut 3 valeurs)
  + 2 UNIQUE (dossier.user_id, note_brouillon.user_id) + toutes les FK.
  Contraintes en ligne sans nom → Postgres régénère les noms réels.
  Points fins reproduits : acceptation_politique & note_brouillon SANS FK user_id ;
  consentements_ia FK user_id SANS cascade ; garde_regles.enfant_id en CASCADE
  (seule exception, les autres enfant_id/child_id en SET NULL).
  Redondance documents.archive + documents.etat conservée.
- `002_rls_policies.sql` : ENABLE RLS sur 17 tables + 63 policies à l'identique.
  UPDATE avec with check : procedures, decision_regle, dvh_regle, frais_regle,
  garde_regles, note_brouillon. Trous volontaires conservés :
  acceptation_politique (INSERT+SELECT), consentements_ia (pas d'UPDATE),
  ia_appels (INSERT+SELECT).
- `003_storage_policies.sql` : 2 buckets privés + 6 policies storage.objects
  (3 par bucket, PAS d'UPDATE → originaux scellés). RLS storage.objects déjà
  actif par défaut (non réactivé).
- `004_indexes.sql` : 7 index explicites (6 procedure_id + composite
  ia_appels(user_id, created_at DESC)). PK/UNIQUE non répétés.
Statut : à rejouer dans l'ordre sur base de test pour validation de bout en bout.

**Avant ouverture large**
- Compléter les `[À COMPLÉTER]` des pages légales + relecture juridique.
- Réactiver la confirmation e-mail + vrai service SMTP.
  - Harmoniser le design de `/reformuler`. (Qualité de reformulation : diagnostic + correctif
  prompt faits le 16/06/2026, voir section modèles IA.)

**Brique A (suite IA)** : moteur d'indexation INSEE (fonction pure mettant à jour
`montant_courant`) ; comparaison « dû selon la règle » vs « payé » ; surfacer
`confiance`/`citation` côté import PDF. *(L'indexation pension de l'audit recoupe ce chantier :
saisie montant initial + date jugement + indice + date de revalorisation → montant revalorisé,
tableau dû/payé/reste dû, export PDF + CSV.)*

**Renforcement preuve, sécurité & exports (issus de l'audit — détail produit dans la ROADMAP)**
- **Recalcul serveur du hash** (cf. §4-5) + colonnes `empreinte_sha256_client/_serveur`,
  `hash_verifie`, `hash_verifie_at` ; résultat dans le rapport PDF.
- **Vérification par QR code** : `token_verification` non devinable sur `preuves_photo`, page
  `/preuves/verifier/[token]` (métadonnées minimales, **jamais** photo/données sensibles), QR dans le
  rapport PDF.
- **Journal d'audit `audit_log`** (append-only, cf. §2) câblé sur création/modification/archivage/
  suppression/export/horodatage/vérification de hash.
- **Export avocat ZIP** : assemblage `note_synthese.pdf` + `chronologie.pdf` + `bordereau_pieces.pdf` +
  `pension.pdf`/`frais.pdf` + dossiers `preuves/` et `documents/` + `manifest.json` +
  `hashes_sha256.txt` ; avertissement « données personnelles sensibles » avant téléchargement.
- **Mode dossier audience** : export PDF structuré (résumé procédure, chronologie filtrée, pension
  dû/payé/retard, frais, demandes de modification, preuves, documents, bordereau) — factuel, sans
  conclusions juridiques. Réutilise `/export` et la note de synthèse.
- **Horodatage eIDAS-ready** : statut élargi (`interne_non_qualifie`|`qualifie_en_attente`|
  `qualifie_valide`|`qualifie_echec`), rapport PDF distinguant interne non qualifié vs qualifié.
- **Export CSV** (événements, frais, pension, demandes, preuves, documents) en plus du PDF.

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
