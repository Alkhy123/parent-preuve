# Parent Preuve — Contexte du projet

> Document à lire en début de conversation pour reprendre le développement avec tout le contexte.
>
> **Dernière mise à jour : brique A — porte 2 IMPORT PDF du jugement TERMINÉE.** L'écran
> `/dossier/importer-pdf` importe un PDF (numérique **ou** scanné), en extrait le texte côté
> serveur (`unpdf`), bascule sur l'**OCR Mistral** si le PDF est un scan (après clic explicite),
> **cible le dispositif** (« PAR CES MOTIFS »), puis appelle le **moteur d'extraction partagé**
> (`lib/extractionRegles.ts`) → mêmes 4 encarts pré-remplis et validables que le hub. Le PDF n'est
> ni conservé ni journalisé ; `source='ia'`, `valide=false` jusqu'à validation. Voir §5, §6, §8.
>
> Pour mémoire, la **porte « description libre »** reste opérationnelle : `/api/ia/extraire` prend
> un texte collé et renvoie le même JSON sectionné (`{ sections: { pension, frais, dvh, decision } }`)
> en un seul appel Mistral ; `/dossier/extraire` est le **hub**.
>
> **Prochain grand chantier : DESIGN / UI** (harmonisation visuelle de l'ensemble). À ouvrir dans
> une **nouvelle conversation**. Petits restes techniques : lien NavBar vers `/dossier/importer-pdf`.
>
> ⚠️ Ce document décrit l'intention ; en cas de doute, **le code fait foi**. ⚠️ Le dépôt réel n'a
> **pas** de dossier `src/` : les chemins sont `app/...`, `components/...`, `lib/...` (les `src/`
> de ce document sont historiques).
>
> **En attente (bloqué) : étape 5 eIDAS** — prestataire qualifié (QTSP, RFC 3161), quand le compte
> sera ouvert (§7).
>
> Historique : briques C et D (déterministes) ✅ ; horodatage eIDAS plomberie (non qualifié) ✅ ;
> calendrier de garde + rappels (web) ✅ ; 1ʳᵉ route IA + consentement ✅ ; brique B (reformulation)
> ✅ ; audit de cohérence appliqué ✅ ; brique A — 4 tables règles + encarts pliables ✅ ;
> brique A — extraction IA (porte « description libre ») ✅ ;
> **brique A — porte 2 import PDF (numérique + OCR scanné)** ✅.

---

## 0. Corrections appliquées — audit de cohérence (06/06/2026)

> Vérifiées sur le code réel par Claude Code, puis appliquées et testées. Conservé ici comme
> journal, pour ne pas refaire les mêmes diagnostics.

- ✅ **Fichiers de test supprimés** : `app/ia-test/page.tsx` et `app/api/ia/test/route.ts`.
- ✅ **`euros()` centralisé** : une seule définition, `export function euros()` dans
  `lib/dossierCalculs.ts`. Les définitions locales de `app/pension/page.tsx` et `app/frais/page.tsx`
  ont été supprimées et remplacées par un import depuis `@/lib/dossierCalculs`.
- ✅ **`/pension` harmonisée** : fond crème, palette navy/or, `PageHeader`, `.font-display` (style
  aligné sur `/reformuler`). Aucune logique modifiée.
- ✅ **`PageHeader` sur l'accueil** : ajouté (`eyebrow="Accueil"`, `title="Parent Preuve"`).
- ✅ **`/export`** : titre du `PageHeader` corrigé en « Export du dossier ».
- ✅ **Consentement IA unifié** sur la table **`consentements_ia`** (par fonctionnalité), qui est
  désormais **la seule source de vérité**. `ConsentementIA.tsx` et `StatutConsentementIA.tsx`
  prennent une prop `fonctionnalite` et lisent/écrivent/retirent dans `consentements_ia`. Les
  colonnes `consentement_ia` / `consentement_ia_date` ont été **supprimées de la table `dossier`**
  (aucun utilisateur réel → pas de migration) et retirées du type `Dossier` de `courrierHelpers.ts`.
- ✅ **Fond de `ReglePension` harmonisé** : ses cartes (chargement, édition, « aucune règle »)
  passées de `bg-white` à **`bg-[#F8F6F1]`** (crème), pour s'aligner sur `RegleFrais` / `RegleDVH`
  / `RegleDecision` dans le hub. Les champs de saisie restent blancs (`bg-white`).

> **Deux affirmations de l'ancien contexte étaient FAUSSES** (corrigées ici) : l'accueil
> **délègue bien** à `TableauDeBord` (qui importe `dossierCalculs.ts`) — il ne recalcule pas à la
> main — et son titre est correctement « Parent Preuve ». La centralisation des calculs fonctionne.

---

## 1. Le projet en bref

**Parent Preuve** aide les parents en coparentalité (après décision du JAF) à **constituer et
organiser un dossier factuel** : journal, frais, pension, documents, courriers, **preuves photo
scellées**.

**Positionnement juridique (à respecter partout) :**
- **Aide à l'organisation et à la rédaction**, **jamais un conseil juridique**.
- Rien n'est un **constat de commissaire de justice**.
- Preuves photo = **« preuve numérique renforcée, scellée et horodatée »** ; horodatage actuel
  **non qualifié** (dit honnêtement partout). Avertissement sur chaque export PDF.
- **IA : « l'IA propose, l'utilisateur valide ».** Aucune écriture en base sans validation humaine ;
  relecture obligatoire des sorties IA.
- **Élément matériel oui, élément moral jamais** (clé pour la brique A) : l'app documente des
  **faits constatables** (ex. « les frais exceptionnels n'ont pas été remboursés : montant, date »).
  Elle ne **qualifie jamais** juridiquement (l'intention, le caractère volontaire, l'impossibilité
  de payer relèvent du juge/avocat). Donc on peut afficher « reste dû = pension + frais non
  remboursés » ; jamais « c'est un abandon de famille ». **Corollaire pour l'extraction IA :**
  ne jamais INFÉRER de motif (ni pourquoi un DVH est médiatisé, ni un statut procédural depuis le
  seul type de décision).

**Profil développeur :** débutant. Explications simples, **étape par étape** (§10). **Windows /
PowerShell** (§11).

---

## 2. Stack technique

- **Framework :** Next.js **16.2.x** (App Router), TypeScript, dossier `src/`. ⚠️ Voir `AGENTS.md`.
  Route serveur = `route.ts`, **une fonction par méthode HTTP** (`export async function POST(request: Request)`),
  `Request`/`Response` standards, `await request.json()`, `Response.json({...})`. En Next.js 16,
  `headers()`/`cookies()` sont **async**.
- **Style :** Tailwind CSS.
- **Backend :** Supabase (PostgreSQL + Auth + Storage), **RLS** partout. Client `@/lib/supabase`.
- **PDF :** `jspdf` (+ `jspdf-autotable`).
- **IA :** **Mistral** (FR, API UE). Compte créé, mode gratuit. Endpoint
  `https://api.mistral.ai/v1/chat/completions`, Bearer, modèle **`mistral-small-latest`**.
  Pour l'extraction, appel avec **`temperature: 0`** + **`response_format: { type: "json_object" }`**
  (sortie JSON stable).
- **Routes serveur (3) :** `/api/horodatage` (HMAC interne, non qualifié) ·
  `/api/ia/reformuler` (brique B) · **`/api/ia/extraire`** (brique A, extraction des **4 tables
  règles** d'un coup, JSON sectionné). Clés **côté serveur** uniquement.
- **Cible à terme :** mobile (React Native/Expo ou PWA) ; backend Supabase réutilisable.

### `.env.local` (racine)
`HORODATAGE_SECRET` · `MISTRAL_API_KEY` (jamais `NEXT_PUBLIC_`) · `NODE_OPTIONS=--use-system-ca`
(règle un blocage TLS Windows quand l'antivirus inspecte le HTTPS). Après modif : **Ctrl+C puis `npm run dev`**.
> Note : créer une **nouvelle route** ne nécessite pas de redémarrer ; seul un changement de
> `.env.local` l'exige.

---

## 3. Identité visuelle

- Navy `#15233F` · Or `#C2A24C` · Crème `#F8F6F1` · Texte `#1F2733`.
- Titres **Playfair Display** (`.font-display`, dans `globals.css`, chargée dans `layout.tsx`).
- **`PageHeader.tsx`** : bandeau navy (`eyebrow` doré, `title` serif, filet doré, `subtitle`).
  Appliqué à toutes les pages (y compris `/pension` et l'accueil depuis l'audit).
- **`EncartPliable.tsx`** : encart crème réutilisable. Props
  `{ titre, resume?, pliable?, replieParDefaut?, children }`. Quand `pliable={false}` → toujours
  ouvert, sans bouton (cas « pas encore de règle »). Quand `pliable` + `replieParDefaut` → s'ouvre
  replié, affiche `titre` + `resume` + bouton « Afficher ▾ / Réduire ▴ ». Utilisé par les 4 encarts
  de règles pour laisser l'action principale de la page au premier plan une fois la règle saisie.
- **`NavBar.tsx`** : tableau **`GROUPES`** (familles → sous-liens), menus déroulants. 5 familles :
  **Mon dossier** (`/dossier` + **`/dossier/extraire`** + enfants), **Suivi** (frais + pension),
  **Organisation** (calendrier + journal), **Pièces & preuves** (documents + preuves),
  **Production** (courriers + export PDF + reformulation). Ajouter un lien = l'insérer dans la
  bonne famille de `GROUPES`. Limite : barre qui passe à la ligne sur petit écran (menu hamburger
  à prévoir).

> **Astuce (texte invisible) :** champs en `bg-white text-[#1F2733]`. À terme, couleur par défaut
> dans `globals.css`.

---

## 4. Base de données Supabase

Convention : `id uuid` (PK), `user_id uuid default auth.uid()`, colonnes en français,
`created_at timestamptz`. RLS + 4 policies par table (lire/créer/modifier/supprimer) sur
`auth.uid() = user_id`.

Tables principales :
- **`children`** — enfants. ⚠️ Prénom : **`prenom_ou_alias`**.
- **`events`** — journal : `titre`, `categorie`, `date_evenement`, `heure_evenement`,
  `description_factuelle`, `child_id`. ⚠️ **Pas de statut** (backlog §9).
- **`expenses`** — frais : `libelle`, `categorie`, `montant`, `part_autre`, `date_frais`,
  `rembourse` (bool). ⚠️ **Aucun lien vers un justificatif** (backlog §9).
- **`pension_payments`** — **paiements réels** (instances mois par mois) : `mois_du`, `montant_du`,
  `montant_paye`, `date_paiement`, `notes`.
- **`pension_regle`** — **la RÈGLE de pension du jugement** (≠ paiements). Colonnes en §4.1.
- **`frais_regle`** — **la RÈGLE de partage des frais** (≠ `expenses`). Colonnes en §4.2.
- **`dvh_regle`** — **les modalités de DVH** (complète `garde_regles`). Colonnes en §4.3.
- **`decision_regle`** — **nature/échéances de la décision** (complète le socle `dossier`).
  Colonnes en §4.4.
- **`documents`** — pièces : `libelle`, `categorie`, `chemin_fichier`, `date_document`, `child_id`.
  ⚠️ **Ne pointe que vers un enfant** (backlog §9).
- **`dossier`** — socle (1 ligne/user, `upsert`) : `declarant_*`, `autre_parent_*`,
  `jugement_juridiction`, `jugement_date`, `jugement_numero_rg`, `jugement_intitule`.
  *(Les colonnes `consentement_ia*` ont été supprimées — voir `consentements_ia`.)*
- **`preuves_photo`** — preuves scellées (§4.5).
- **`garde_regles`** — règles de garde (une par enfant). « Un week-end sur deux » (§4.6).
- **`consentements_ia`** — **consentement IA par fonctionnalité (SOURCE DE VÉRITÉ unique).**
  Colonnes : `user_id` (default `auth.uid()`), `fonctionnalite` (ex. `"reformulation"`,
  **`"extraction"`**), date. Utilisée par `/reformuler`, **`/dossier/extraire`** et par
  `ConsentementIA.tsx`/`StatutConsentementIA.tsx` (via prop `fonctionnalite`).

> **Patron commun aux 4 tables règles** (`pension_regle`, `frais_regle`, `dvh_regle`,
> `decision_regle`) : `id`, `user_id` (default `auth.uid()`, FK `auth.users`, `on delete cascade`),
> `enfant_id` (FK `children`, nullable, `on delete set null`), des colonnes métier fidèles au
> **dispositif**, puis **`source`** (`'manuel'`|`'ia'`), **`valide`** (bool, `false` si pré-rempli
> IA, `true` après validation), **`actif`** (bool), `notes` (text), `created_at`. À l'enregistrement
> manuel, les écrans **n'envoient pas** `source`/`valide`/`actif` → les **valeurs par défaut**
> s'appliquent (`'manuel'`, `true`, `true`). **Pour une règle issue de l'IA**, l'écran envoie
> explicitement `source='ia'` + `valide=false`. Lecture d'une seule règle active via
> `.eq('actif', true)` + `maybeSingle()` ; `update` si elle existe, sinon `insert`.
> ⚠️ **`enfant_id` n'est PAS encore géré** : une seule règle active par table et par utilisateur,
> `enfant_id` laissé `null`. Le rattachement par enfant (sélecteur humain) est repoussé à une
> étape dédiée (backlog §9). L'IA n'extrait **jamais** `enfant_id` (UUID inconnu d'elle).

### 4.1 Colonnes de `pension_regle`
`id`, `user_id`, `enfant_id`, `montant_base` (numeric, chiffre du dispositif, figé),
`montant_courant` (numeric, après indexation ; au départ = `montant_base`),
`debiteur` (`'moi'`|`'autre'`), `jour_echeance` (int), `paiement_avance` (bool),
`inclut_vacances` (bool), `intermediation` (bool), `indexation_active` (bool),
`indexation_jour` (int), `indexation_mois` (int), `indexation_premiere_date` (date),
`indexation_indice` (text), `source`, `valide`, `actif`, `notes`, `created_at`.
**Principe :** la table décrit la « loi du dossier » ; le **calcul** (indexation INSEE, reste dû)
sera une fonction pure séparée (comme `dossierCalculs.ts`).

### 4.2 Colonnes de `frais_regle`
`id`, `user_id`, `enfant_id`, `categories_couvertes` (text : ce que le dispositif range dans les
frais partagés), `part_moi_pourcentage` (numeric), `part_autre_pourcentage` (numeric ; somme **non
forcée** à 100, le dispositif fait foi), `accord_prealable_requis` (bool),
`accord_prealable_seuil` (numeric ; ex. 200 €), `delai_remboursement_jours` (int ; ex. 30 pour
« sous un mois »), `justificatif_obligatoire` (bool, défaut `true`), `s_ajoute_a_pension` (bool ;
clause « les frais s'ajoutent à la contribution »), `source`, `valide`, `actif`, `notes`,
`created_at`.

### 4.3 Colonnes de `dvh_regle`
`id`, `user_id`, `enfant_id`, `type_dvh` (text : `classique`|`mediatise`|`reduit`|`progressif`|
`libre`|`suspendu`|`sans_dvh`), `titulaire` (`'moi'`|`'autre'`), `lieu_visite` (`domicile`|
`espace_rencontre`|`tiers`|`autre`), `presence_tiers` (bool), `tiers_details` (text),
`frequence` (text), `duree` (text), `duree_limitee` (bool), `clause_renonciation` (bool),
`clause_renonciation_details` (text), `remise_lieu` (text), `vacances_partage` (text),
`source`, `valide`, `actif`, `notes`, `created_at`.
**Distinction importante :** `garde_regles` colore l'agenda (rythme) ; `dvh_regle` consigne les
modalités juridiques (visite médiatisée, tiers, clause de renonciation, etc.). Complémentaires.

### 4.4 Colonnes de `decision_regle`
`id`, `user_id`, `enfant_id`, `type_decision` (text : `jugement`|`ordonnance`|
`convention_homologuee`|`arret`|`autre`), `provisoire` (bool), `execution_provisoire` (bool ;
« exécutoire par provision », s'applique même en cas d'appel), `susceptible_appel` (bool),
`frappee_appel` (bool), `appel_date` (date), `appel_juridiction` (text), `date_decision` (date,
prononcé), `date_signification` (date ; fait courir les délais), `date_audience_prochaine` (date),
`mise_en_etat` (bool), `mise_en_etat_details` (text), `source`, `valide`, `actif`, `notes`,
`created_at`.
**Distinction importante :** le socle `dossier` retient l'**identité** du jugement ;
`decision_regle` retient son **statut procédural**. Complémentaires.

### 4.5 Colonnes de `preuves_photo`
`id`, `user_id`, `created_at` (= horodatage serveur), `titre`, `description`, `enfant_id`,
`storage_path`, `nom_fichier`, `type_fichier`, `taille_octets`, `empreinte_sha256`,
`metadonnees` (jsonb), `gps_latitude`, `gps_longitude`, `gps_precision_metres`, `heure_appareil`,
`ecart_heure_secondes`, `anomalies` (jsonb). Horodatage : `horodatage_jeton`, `horodatage_date`,
`horodatage_statut` (`non_qualifie`|`a_refaire`|`qualifie`), `horodatage_prestataire`,
`horodatage_algorithme`.

### 4.6 Colonnes de `garde_regles`
`id`, `user_id`, `enfant_id`, `type_garde` (`weekend_sur_deux` ; `alternee_hebdo` plus tard),
`parent_principal` (`moi`|`autre`), `date_reference`, `jour_debut`, `heure_debut`, `jour_fin`,
`heure_fin`, `source` (`manuel`|`ia`), `valide`, `actif`, `notes`, `created_at`.

Buckets Storage : **`justificatifs`** · **`preuves`** (privé ; originaux scellés
`<user_id>/<preuve_id>/<nom_fichier>`, URL signée 60 s).

---

## 5. Ce qui est déjà construit

### MVP (fonctionnel)
Auth, enfants, journal, frais, pension, documents, **export PDF** (`/export`). Accueil avec
`PageHeader`, déléguant les indicateurs à `TableauDeBord` + `ProchainesEcheances`.

### Assistant de courriers (terminé)
`/dossier` (socle), `/courriers` (tableau `MODELES`), `CourrierModele.tsx` (moteur),
`courrierHelpers.ts` (`v`, `dateFr`, type `Dossier`), `courrierPdf.ts`. 4 modèles. Garde-fou :
**articles de loi saisis/vérifiés par l'utilisateur, jamais inventés**.

### Module preuve photo (terminé — web)
`/preuves/nouvelle`, `/preuves`, `src/lib/preuvePdf.ts`.

### Horodatage eIDAS — plomberie (non qualifié)
`src/app/api/horodatage/route.ts` (POST, HMAC-SHA256, `HORODATAGE_SECRET`). Auto au scellé ;
échec → `statut = "a_refaire"`. QTSP réel = étape 5 (§7).

### Calendrier de garde + rappels (terminé — web)
`src/lib/gardeCalendrier.ts`, `/calendrier`, `CalendrierMensuel.tsx`, `gardeNotifications.ts`,
`ProchainesEcheances.tsx` (sur l'accueil).

### Briques C et D — déterministes (terminé)
- **C — Contrôle avant export** : `lib/controleDossier.ts` + `components/ControleDossier.tsx`,
  branché sur `/export` (bouton désactivé si bloquant). 4 contrôles actifs ; 3 en attente de schéma.
- **D — Cohérence** : re-tri (acquis), **bordereau de pièces** dans le PDF, **calculs centralisés**
  `lib/dossierCalculs.ts` (`totauxFrais`, `totauxPension`, `euros`) — utilisés par `TableauDeBord`
  (accueil) **et** `/export`. Source unique de vérité confirmée par l'audit.

### 1ʳᵉ route serveur IA + consentement (terminé, unifié)
Compte Mistral, clé `MISTRAL_API_KEY`. **Consentement IA = table `consentements_ia` (par
fonctionnalité), source unique.** Composants `ConsentementIA.tsx` (porte) et
`StatutConsentementIA.tsx` (statut + retrait) prennent une prop `fonctionnalite`.

### Brique B — Reformulation neutre (terminé)
- Route `src/app/api/ia/reformuler/route.ts` (POST). `{ texte }` → `{ reformule }`. Garde-fous :
  clé absente → 500 ; texte vide → 400 ; **max 5000 car.** → 400 ; Mistral → 502. Prompt `CONSIGNE` :
  neutre/factuel, **conserve les faits, n'invente rien, pas de conseil juridique**.
- Page `src/app/reformuler/page.tsx` : 3 états selon le consentement (`consentements_ia`,
  `fonctionnalite="reformulation"`). Lien **« Reformulation » → `/reformuler`** (famille **Production**).
- Mentions légales : Mistral cité comme sous-traitant (DPA art. 28, option « zéro rétention »). ✅

### Brique A — les 4 tables règles + encarts pliables (TERMINÉ pour la saisie manuelle)

> **Principe d'extraction (toute la brique A) : le DISPOSITIF fait foi.** L'IA s'ancre sur
> « PAR CES MOTIFS » (verbes « Dit / Fixe / Condamne / Déboute / Constate / Ordonne »), **jamais
> sur les demandes des parties** (un motif peut mentionner 300 € demandés alors que le dispositif
> condamne à 250 €). L'IA restitue fidèlement, **clauses subtiles comprises** (« les frais
> exceptionnels s'ajoutent à la contribution », « accord préalable au-delà de 200 € »,
> « remboursement sous un mois sur justificatif », indexation). Elle **ne qualifie jamais** et
> **n'infère jamais** de motif.

**Architecture « tables règles » :** le MVP stocke des *instances* (un paiement, un frais) mais pas
les *règles* du jugement. La brique A crée des **tables de règles** distinctes. Les **4 sont
posées**, chacune avec son composant et le même patron (3 états ou formulaire permanent,
`maybeSingle()` sur `actif=true`, `update`/`insert`, `source`/`valide`/`actif` par défaut), et
chacune **enveloppée dans `EncartPliable`** :

- ✅ **`pension_regle`** + **`ReglePension.tsx`** → branché sur **`/pension`** + hub. Résumé :
  « 180,00 € par mois · payée par l'autre parent, le 5 ».
- ✅ **`frais_regle`** + **`RegleFrais.tsx`** → branché sur **`/frais`** + hub. Résumé : « 50 % / 50 % ·
  accord préalable au-delà de 200 € · remboursement sous 30 j ».
- ✅ **`dvh_regle`** + **`RegleDVH.tsx`** → branché sur **`/calendrier`** + hub. Résumé : « Médiatisé ·
  tiers présent · un samedi sur deux ».
- ✅ **`decision_regle`** + **`RegleDecision.tsx`** → branché sur **`/dossier`** + hub. Résumé :
  « Jugement · provisoire · exécution provisoire ».

### Brique A — EXTRACTION IA des 4 tables règles, porte « description libre » (TERMINÉ)

> Le cœur de la brique A, désormais complet pour les 4 tables. Boucle complète :
> **description libre → JSON sectionné strict → 4 formulaires pré-remplis → relecture/validation
> par règle → écriture tracée.**

**Décision d'architecture retenue : une route élargie, un seul appel Mistral.** L'utilisateur colle
**une seule** description ; on l'envoie **une fois** (minimisation des données + budget) et on
récupère les 4 sections d'un coup. Le **plan B** (un appel par table) reste en réserve si une
contamination entre sections devenait récurrente — pour l'instant un seul cas a été repéré et réglé
par le prompt (voir « Apprentissages » plus bas).

- **Route `src/app/api/ia/extraire/route.ts`** (POST). `{ texte }` → JSON :
  - Mistral en **`temperature: 0`** + **`response_format: json_object`**, `mistral-small-latest`.
  - **Format de sortie** :
    ```
    { "sections": {
        "pension":  { "table":"pension_regle",  "champs":{…}, "avertissements":[] },
        "frais":    { "table":"frais_regle",    "champs":{…}, "avertissements":[] },
        "dvh":      { "table":"dvh_regle",       "champs":{…}, "avertissements":[] },
        "decision": { "table":"decision_regle", "champs":{…}, "avertissements":[] } } }
    ```
    Chaque champ = `{ valeur, confiance ("haute"|"moyenne"|"absente"), citation }`.
    **Invariant : `valeur null` ⇒ `confiance "absente"`.**
  - Champs métier extraits par section : **pension** (11), **frais** (8 :
    `categories_couvertes`, `part_moi_pourcentage`, `part_autre_pourcentage`,
    `accord_prealable_requis`, `accord_prealable_seuil`, `delai_remboursement_jours`,
    `justificatif_obligatoire`, `s_ajoute_a_pension`), **dvh** (12 : `type_dvh`, `titulaire`,
    `lieu_visite`, `presence_tiers`, `tiers_details`, `frequence`, `duree`, `duree_limitee`,
    `clause_renonciation`, `clause_renonciation_details`, `remise_lieu`, `vacances_partage`),
    **decision** (12 : `type_decision`, `provisoire`, `execution_provisoire`, `susceptible_appel`,
    `frappee_appel`, `appel_date`, `appel_juridiction`, `date_decision`, `date_signification`,
    `date_audience_prochaine`, `mise_en_etat`, `mise_en_etat_details`). **Non extraits** :
    `enfant_id`, champs système, `montant_courant`, `notes`.
  - **Garde-fous** : clé absente → 500 ; texte vide → 400 ; **max 5000 car.** → 400 ;
    Mistral/réseau KO → 502 ; **parsing JSON sécurisé** (enlève d'éventuels ```` ```json ````) → 502
    si invalide ; **validation de structure des 4 sections + invariant** (`champsValides` par section,
    `structureValide` global) → 502 sinon. La fin de `POST` ré-étiquette les 4 `table` et garantit
    4 tableaux `avertissements`.
- **Page `src/app/dossier/extraire/page.tsx`** = **HUB** (porte « Mon dossier »). Enchaînement :
  porte de consentement `<ConsentementIA fonctionnalite="extraction">` → zone de texte (5000 car.
  max, compteur) → bouton « Analyser » → fetch `/api/ia/extraire` → bandeau « propositions à
  vérifier » + liste fusionnée des `avertissements` (préfixés `Pension :`/`Frais :`/`DVH :`/
  `Décision :`) → **4 formulaires pré-remplis empilés** (`<ReglePension>`, `<RegleFrais>`,
  `<RegleDVH>`, `<RegleDecision>` avec `valeursInitiales={…} origineIA`) → bouton « Recommencer une
  analyse ». **Le hub n'écrit jamais lui-même** : chaque encart écrit dans sa table, indépendamment.
  Convertisseurs `versReglePension` / `versRegleFrais` / `versRegleDVH` / `versRegleDecision`
  (lecteurs sûrs `lireNombre`/`lireBool`/`lireTexte`).
- **Les 4 composants `RegleX` étendus** (sans casser leur usage sur leur page d'origine) :
  - Props optionnelles `valeursInitiales?` (format « règle » : nombres/booléens/null/`AAAA-MM-JJ`)
    et `origineIA?: boolean`.
  - Si `valeursInitiales` fourni → l'encart s'ouvre **pré-rempli** et **n'écrase pas** le formulaire
    avec la base au chargement.
  - À l'enregistrement : `valide: true` par défaut (saisie manuelle, inchangée) ; **si `origineIA` →
    `source: 'ia'`, `valide: false`**.
  - Fonction `valider()` : bascule `valide=true` après relecture.
  - Vue : si `valide===false`, encart ouvert (`replieParDefaut={… && valide !== false && !valeursInitiales}`),
    « ⚠ à valider » dans le résumé + **bandeau doré « Proposée par l'IA — à vérifier »** + bouton
    **« Valider cette règle »**.
  - **Coercition des énumérations côté composant** (helper `dansListe`) : `type_dvh`, `lieu_visite`,
    `titulaire` (DVH) et `type_decision` (décision) ne gardent une valeur que si elle est dans la
    liste autorisée du `<select>`, sinon `''`. (`debiteur` est coercé côté hub dans `versReglePension`.)

**Apprentissages (extraction IA) à conserver :**
- **Contamination entre sections** repérée et corrigée une fois : `inclut_vacances` (pension) se
  déclenchait à tort sur une clause de **frais** ou un **partage des vacances** (DVH). Correctif =
  consigne explicite : « n'active `inclut_vacances` que si le dispositif dit que la PENSION reste
  due pendant les vacances ; jamais depuis une clause de frais ni un partage de vacances scolaires ».
  → Si d'autres contaminations apparaissent, privilégier d'abord un correctif de prompt ciblé.
- **`justificatif_obligatoire`** : l'IA renvoie `null` si le texte se tait (et NON `false`). Côté
  hub, on ne transmet `false` que si l'IA l'a **explicitement** mis à `false` ; sinon on retombe sur
  le défaut métier du composant (`true`).
- **3ᵉ personne** (« le père verse », « la mère exerce ») : `debiteur`/`titulaire` en confiance
  **moyenne** + avertissement, jamais une certitude.
- **Dates** : conversion « 15 mars 2026 » → `2026-03-15` en confiance **moyenne** ; format
  `AAAA-MM-JJ` qui alimente directement les champs `type="date"`.
- **Anti-inférence procédurale** : `susceptible_appel` / `execution_provisoire` ne sont jamais
  déduits du seul type de décision ; uniquement si le texte le dit.
- **Accents en PowerShell** : les `Ã©`/`Ã¨` vus en console sont un artefact d'affichage, pas la
  donnée (propre en base et dans le navigateur). Tester les routes avec des textes **sans accents**.

---

### Brique A — porte 2 : IMPORT PDF du jugement (TERMINÉ)

> Pipeline complet : **PDF (numérique ou scanné) → texte → ciblage du dispositif → moteur
> d'extraction partagé → 4 encarts pré-remplis, validés par l'utilisateur.** Aucune écriture
> automatique ; `source='ia'`, `valide=false` jusqu'à validation. Le PDF n'est ni conservé ni
> journalisé.

**Décisions d'architecture retenues** (les « pistes » du §8 ont été tranchées ainsi) :
- **Texte extrait côté serveur** avec `unpdf` (pur JS, `export const runtime = "nodejs"`). Le PDF
  ne quitte le serveur que dans le cas scanné. Dépendance ajoutée : `unpdf`.
- **Deux types de PDF.** *Numérique* : `unpdf` lit la couche texte, gratuit, rien n'est envoyé à
  l'IA pour la lecture. *Scanné* (< 100 caractères extraits) : **OCR Mistral**
  (`mistral-ocr-latest`, endpoint `/v1/ocr`, document en base64), déclenché **uniquement après un
  clic explicite** (le document complet part alors chez Mistral → encart d'avertissement dédié).
- **Ciblage du dispositif** (`lib/dispositif.ts`, `ciblerDispositif`) : dernière occurrence de
  « PAR CES MOTIFS » (regex insensible casse/espaces, tolérante au markdown OCR) → on n'envoie que
  le dispositif (cappé à 5000 car.). Formule absente → on envoie la fin du document + avertissement.
- **Moteur d'extraction partagé** : le cœur de `/api/ia/extraire` (prompt `CONSIGNE` + validateurs)
  est sorti dans **`lib/extractionRegles.ts`** (`analyserDispositif(texte, cle)`), appelé par les
  **deux** routes → un seul prompt, une seule vérité.
- **Convertisseurs partagés** : `versRegleX` + types dans **`lib/regleConvertisseurs.ts`**, utilisés
  par le hub et par la page d'import.
- **Consentement** : page d'import derrière `<ConsentementIA fonctionnalite="extraction">`.

**Fichiers de la porte 2 :**
- `app/dossier/importer-pdf/page.tsx` (upload 10 Mo max, contrôle navigateur + serveur, cas scanné,
  4 encarts `RegleX` éditables/validables).
- `app/api/ia/extraire-pdf/route.ts` (POST `FormData` `fichier`/`ocr` → `{ ok, source,
  dispositifTrouve, tronque, avertissement, sections }`).
- `lib/dispositif.ts`, `lib/extractionRegles.ts`, `lib/regleConvertisseurs.ts`.

**Apprentissages :**
- **Ne jamais déposer de `page.tsx` sous `app/api/...`** → Next.js lève « Conflicting route and
  page ». Les fichiers d'API sont des `route.ts`.
- `unpdf` est ESM-only ; `extractText(pdf, { mergePages: true })` renvoie `{ totalPages, text }`.
- OCR Mistral facturé à l'usage (~1 $ / 1000 pages) ; on ne demande pas les images en retour.

---

## 6. Carte des fichiers (repères)

```
src/
  app/
    page.tsx                (ACCUEIL — PageHeader + TableauDeBord + ProchainesEcheances)
    calendrier/page.tsx     (règle de garde + <RegleDVH/>)
    layout.tsx              (NavBar + polices)
    globals.css             (.font-display)
    dossier/page.tsx        (socle + StatutConsentementIA + <RegleDecision/>)
    dossier/extraire/page.tsx (HUB extraction IA : consentement + texte + 4 encarts pré-remplis)
    dossier/importer-pdf/page.tsx (PORTE 2 : import PDF/OCR → 4 encarts pré-remplis ; consentement)
    courriers/              (page.tsx + 4 modèles)
    export/page.tsx         (export PDF : ControleDossier + bordereau + calculs ; titre corrigé)
    reformuler/page.tsx     (brique B — reformulation)
    pension/page.tsx        (paiements + <ReglePension/> ; style harmonisé)
    frais/page.tsx          (frais + <RegleFrais/>)
    mentions-legales/page.tsx (Mistral sous-traitant)
    api/
      horodatage/route.ts
      ia/reformuler/route.ts (brique B)
      ia/extraire/route.ts   (extraction IA des 4 tables règles — JSON sectionné, 1 appel Mistral)
      ia/extraire-pdf/route.ts (PORTE 2 : PDF→texte/OCR→dispositif→moteur partagé→JSON sectionné)
    preuves/ enfants/ journal/ documents/
  components/
    NavBar.tsx              (+ lien « Analyse du jugement » → /dossier/extraire, famille Mon dossier)
    CalendrierMensuel.tsx
    ProchainesEcheances.tsx (utilisé par l'accueil)
    TableauDeBord.tsx       (utilisé par l'accueil ; importe dossierCalculs)
    ControleDossier.tsx     (brique C)
    ConsentementIA.tsx      (porte de consentement, prop `fonctionnalite` → consentements_ia)
    StatutConsentementIA.tsx(statut + retrait, prop `fonctionnalite`)
    EncartPliable.tsx       (encart crème pliable réutilisable)
    ReglePension.tsx        (règle pension ; ÉTENDU IA : valeursInitiales + origineIA + valider ; fond crème)
    RegleFrais.tsx          (règle frais ; ÉTENDU IA : valeursInitiales + origineIA + valider)
    RegleDVH.tsx            (modalités DVH ; ÉTENDU IA : valeursInitiales + origineIA + valider + coercition enum)
    RegleDecision.tsx       (nature/échéances décision ; ÉTENDU IA : valeursInitiales + origineIA + valider + coercition enum)
    PageHeader.tsx
    CourrierModele.tsx
  lib/
    gardeCalendrier.ts
    gardeNotifications.ts
    supabase.ts
    courrierHelpers.ts      (v, dateFr, type Dossier — sans consentement_ia*)
    courrierPdf.ts
    preuvePdf.ts
    controleDossier.ts      (brique C)
    dossierCalculs.ts       (totauxFrais, totauxPension, euros — source unique)
    dispositif.ts           (PORTE 2 : ciblerDispositif — isole « PAR CES MOTIFS », cap 5000)
    extractionRegles.ts     (cœur PARTAGÉ : prompt CONSIGNE + validateurs + analyserDispositif)
    regleConvertisseurs.ts  (cœur PARTAGÉ : types + versRegleX, hub + import PDF)
```
(`.env.local` : `HORODATAGE_SECRET`, `MISTRAL_API_KEY`, `NODE_OPTIONS=--use-system-ca`.)

---

## 7. Chantier en attente — étape 5 : QTSP qualifié (RFC 3161)

En pause tant que le compte prestataire n'est pas ouvert. La plomberie est en place : on ne
touchera quasiment qu'à `src/app/api/horodatage/route.ts` (remplacer la signature HMAC interne par
un appel RFC 3161, renvoyer `statut: "qualifie"`). À reprendre dans une nouvelle conversation.

---

## 8. Assistant IA — plan détaillé

### Cadre commun (toute brique IA)
- **L'IA propose, l'utilisateur valide.** Aucune écriture en base sans validation humaine.
- **Jamais de conseil juridique** ; renvoi vers un avocat ; avertissement habituel.
- **Route serveur** (`src/app/api/ia/...`) ; clé côté serveur, jamais `NEXT_PUBLIC_`.
- **Mistral** (UE, pas de réutilisation pour l'entraînement sur offres payantes). ⚠️ **Non HDS** →
  minimisation stricte (jamais de données de santé).
- **Anti-hallucination** : sorties **JSON structurées** validées avant affichage/écriture ;
  `null` si absent ; signaler incertitudes (`avertissements`) ; **citation** du texte source.
- **Traçabilité** : `source='ia'`, `valide=false` jusqu'à validation.
- **Consentement** : via `consentements_ia` (prop `fonctionnalite`).
- **Déterministe d'abord.**

### Brique A — Lecture/extraction (+ pré-remplissage) ← porte 1 TERMINÉE
**Porte « description libre » : FAITE pour les 4 tables.** **Le dispositif fait foi** ; **élément
matériel oui, moral jamais** ; **ne rien inférer** (§1/§5).

**Ordre interne :**
1. ✅ `pension_regle` + `ReglePension.tsx`.
2. ✅ `frais_regle` + `RegleFrais.tsx`.
3. ✅ `dvh_regle` + `RegleDVH.tsx`.
4. ✅ `decision_regle` + `RegleDecision.tsx` (+ `EncartPliable.tsx`).
5. ✅ EXTRACTION IA `pension_regle` (porte « description libre »).
6. ✅ **EXTENSION de l'extraction aux 3 autres tables** (frais → dvh → decision), JSON sectionné,
   hub à 4 encarts. **FAIT** (méthode : route d'abord, test PowerShell, composant pré-remplissable,
   puis branchement hub ; voir §5 « Apprentissages »).
7. ✅ **Porte 2 : IMPORT PDF du jugement** (numérique + OCR scanné) — **TERMINÉE** (voir §5).

> **Porte 2 (import PDF) — décisions retenues (TERMINÉE, détail en §5) :**
> - Texte extrait **côté serveur** (`unpdf`) ; OCR **Mistral** (`/v1/ocr`) en secours pour les
>   scans, après clic explicite. Le PDF n'est ni conservé ni journalisé.
> - **Ciblage du dispositif** (« PAR CES MOTIFS », `lib/dispositif.ts`) avant l'IA, cap 5000 car.
> - **Cœur partagé** : `lib/extractionRegles.ts` (prompt + validation) et `lib/regleConvertisseurs.ts`
>   (convertisseurs `versRegleX`), utilisés par `/api/ia/extraire` **et** `/api/ia/extraire-pdf`.
> - Aval réutilisé : mêmes 4 encarts `RegleX` validables ; page derrière la porte de consentement.

### Brique B ✅ FAIT · Brique C ✅ FAIT · Brique D ✅ FAIT

### Briques supplémentaires (à discuter)
Chatbot d'orientation (RAG) ; tags suggérés ; détection doublons ; aide au remplissage des
courriers ; synthèse factuelle pour avocat (cadrage strict, pas de conclusions).

### Ordre global
1. ~~C~~ ✅ · 2. ~~D~~ ✅ · 3. ~~1ʳᵉ route IA + consentement~~ ✅ · 4. ~~B~~ ✅ ·
5. **A** — 4 tables règles ✅ ; **extraction (porte « description libre ») ✅** ;
**porte 2 import PDF ✅** · 6. **DESIGN / UI = prochain** · 7. supplémentaires.

---

## 9. Backlog (à choisir selon l'envie)

**Brique A (suite) :** **porte 2 : import PDF** du jugement (prochain, §8) ; **gérer `enfant_id`
dans les `RegleX`** (sélecteur d'enfant choisi par l'humain + lecture par enfant au lieu d'une
seule règle active) ; moteur d'indexation INSEE (fonction pure mettant à jour `montant_courant`) ;
comparaison « dû selon la règle » vs « payé » (croiser `pension_regle` ↔ `pension_payments`,
`frais_regle` ↔ `expenses`) ; afficher un « reste dû global » (pension + frais non remboursés) en
exploitant `s_ajoute_a_pension`.

**Débloque des contrôles de la brique C :**
- Colonne `statut` sur `events` (`brouillon`|`valide`|`exporte`).
- Lien justificatif ↔ frais (sur `expenses` ou `documents`).

**Preuves / horodatage :** bouton « horodater » sur `a_refaire` ; finitions liste `/preuves` ;
journal d'horodatage ; QR de vérification ; auth renforcée (KYC).

**Courriers / dossier :** brancher le socle sur l'inscription ; archiver les courriers ; 5ᵉ modèle
(rappel JAF) ; brancher la reformulation (brique B) dans les courriers ; note de synthèse factuelle
pour avocat (cadrage strict) ; **exploiter les 4 tables règles dans les courriers et l'export**
(ex. rappeler la règle de frais dans la relance de remboursement).

**Mobile / divers :** menu hamburger ; capture native / blocage galerie / détection mock
location-root ; résidence alternée ; vacances scolaires ; vraie push (service worker + VAPID) ;
couleur de texte par défaut dans `globals.css`.

> Rappel non-juridique : au civil, la force probante d'une preuve numérique est librement appréciée
> par le juge. Les mesures techniques renforcent la **fiabilité**, aucune ne « certifie » seule.
> Faire valider le positionnement par un professionnel du droit.

---

## 10. Conventions de travail

- **Débutant** : expliquer simplement, nommer fichiers/chemins exacts.
- **Étape par étape** : table (ou moteur pur / route) d'abord, écran ensuite.
- **Modifications ciblées** : dire précisément quoi remplacer (pas de réécriture massive).
  ⚠️ **Risque connu des modifs ciblées** : en copiant-collant un bloc de remplacement, on peut
  laisser un **doublon** (ex. ancienne fin de fonction conservée ET nouvelle ajoutée) → erreurs en
  cascade. Vérifier qu'on n'a pas deux fois la même ligne.
  💡 **Exception assumée** : quand un fichier change à beaucoup d'endroits (ex. les `route.ts`
  d'extraction, les `RegleX` étendus), **remplacer tout le fichier d'un bloc** (Ctrl+A) est PLUS SÛR
  qu'une série de coupes — zéro risque de doublon. Les modifs ciblées restent la règle pour les
  petits ajouts (ex. brancher un encart de plus dans le hub).
- **Réutiliser l'existant** : couleurs, `PageHeader`, `EncartPliable`, RLS, patterns Supabase,
  moteurs purs (`controleDossier.ts`, `dossierCalculs.ts`, `gardeCalendrier.ts`), modèle de route
  serveur (`/api/ia/reformuler`, `/api/ia/extraire`), patrons « tables règles » étendus
  (`ReglePension` / `RegleFrais` / `RegleDVH` / `RegleDecision`), porte de consentement
  (`ConsentementIA` + `consentements_ia`).
- **Tester après chaque étape** : URL à visiter + résultat attendu. Routes serveur testables
  seules en PowerShell (§11). **Méthode rodée brique A** : route d'abord (test PowerShell isolé) →
  composant pré-remplissable (test « pas de régression » sur sa page d'origine) → branchement hub
  (test de bout en bout). Ajouter une section au JSON **ne casse pas** le hub (clés en trop ignorées).
- **claude.ai ne voit pas le projet** (coller les fichiers). **Claude Code voit le disque** mais
  **pas** le fil claude.ai ; le pont est ce document. Pour qu'il le lise d'office : ajouter
  `@PARENT_PREUVE_CONTEXTE.md` dans `CLAUDE.md` (à côté de `@AGENTS.md`).

---

## 11. Environnement (Windows / PowerShell)

- **Secret aléatoire** : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Tester une route serveur** (afficher le JSON complet avec `-Depth`, sinon les sous-objets
  sont tronqués à l'affichage ; textes **sans accents** dans `-Body`) :
  ```powershell
  $r = Invoke-RestMethod -Uri http://localhost:3000/api/ia/extraire -Method Post `
    -ContentType "application/json" `
    -Body '{"texte":"Le jugement fixe une pension de 180 euros par mois payable avant le 5. Les frais exceptionnels sont partages par moitie, accord prealable au-dela de 200 euros. Le pere exerce un droit de visite mediatise un samedi sur deux. Decision assortie de l execution provisoire, audience prevue le 10 septembre 2026."}'
  $r | ConvertTo-Json -Depth 10
  ```
- **TLS Windows** : `NODE_OPTIONS=--use-system-ca` dans `.env.local` (ou désactiver l'inspection
  HTTPS de l'antivirus). Dernier recours, jamais permanent : `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"`.
- Après modif de `.env.local` : **Ctrl+C puis `npm run dev`**. (Une **nouvelle route** ne nécessite
  pas de redémarrage.)