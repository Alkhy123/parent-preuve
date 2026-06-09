# Parent Preuve — Contexte du projet pour Claude

> **Version consolidée et vérifiée sur le code — 09/06/2026.**
> Ce fichier est la **source unique de vérité** à charger en début de chaque conversation.
> Il fusionne l'ancien contexte et la version « propre », corrige les chemins et signale
> les écarts doc/code constatés lors de cette mise à jour.

---

## 0. À lire en premier

### Règle de priorité
1. **Le code réel fait foi** en cas de contradiction. Signaler l'écart avant de modifier.
2. Le dépôt n'a **pas de dossier `src/`** : tout est à la racine — `app/`, `components/`, `lib/`.
   Tout chemin en `src/...` dans d'anciennes notes est **obsolète**.
3. Les mises à jour les plus récentes priment sur les anciennes sections.

### État actuel ultra-court (vérifié sur le dépôt le 09/06/2026)
- **En ligne** sur Vercel : `https://parent-preuve.vercel.app` (compte Hobby, déploiement auto sur push `main`).
- **GitHub** : `Alkhy123/parent-preuve`, branche `main`.
- **Stack réelle** : Next.js **16.2.6** (App Router), React **19.2.4**, TypeScript 5, Tailwind CSS 4,
  `@supabase/supabase-js` ^2.106, `jspdf` ^4.2 + `jspdf-autotable` ^5, `unpdf` ^1.6.
- **Backend** Supabase en UE, RLS active sur les 14 tables, buckets privés.
- **Routes IA authentifiées** côté serveur (token Bearer Supabase) + **quota durable en base** (`ia_appels`).
- **Suppression de compte RGPD** implémentée (route serveur + client `service_role`).
- **Pages légales centralisées** mais des champs `[À COMPLÉTER]` restent à remplir avant ouverture large.
- **Prochain grand chantier** : coffre-fort de documents (`/documents/coffre-fort`), non encore commencé.

### ⚠️ Écarts doc/code et dettes techniques relevés le 09/06/2026
- **`components/BoutonCaptureRapide.tsx` existe mais n'est monté nulle part.** Ni `app/page.tsx`
  ni `app/layout.tsx` ne l'importent → le bouton flottant ne s'affiche sur aucune page
  (régression probable lors de la séparation accueil public / tableau de bord). À remonter
  (idéalement dans `layout.tsx` pour l'avoir partout, cf. piste mobile).
- **`cross-env` est utilisé dans le script `dev` mais absent de `package.json`** (ni `dependencies`
  ni `devDependencies`). Sur une machine propre, `npm run dev` échouerait. → Ajouter
  `cross-env` en devDependency (`npm i -D cross-env`).
- **`lib/limiteurAppel.ts` est du code mort** (plus importé nulle part) → supprimable.
- **README et `app/favicon.ico` toujours par défaut** (create-next-app) → à dégénériciser.
- ✅ Le lien NavBar vers `/dossier/importer-pdf` (« Importer un jugement ») **est en place**.

---

## 1. Vision produit — la boussole

> **Phrase de mission (boussole de décision, PAS un texte d'interface) :**
> *« Quand tout est confus, Parent Preuve remet de l'ordre dans les faits pour que le
> parent reprenne pied. »*

À chaque arbitrage (fonctionnalité, mot, écran) : **est-ce que ça aide le parent à remettre
de l'ordre et à reprendre pied ?** Si oui → dans la trajectoire. Si ça ajoute de la confusion
ou franchit la ligne du conseil juridique → dehors.

**Le vrai problème résolu.** Le parent séparé en conflit (après JAF) est submergé sur **trois
fronts à la fois** : le juridique qu'il ne maîtrise pas, les éléments concrets à produire qu'il
ne sait pas identifier, et l'émotion qui brouille son jugement. La fonction première n'est ni
« capturer vite » ni « gérer un dossier » : c'est **réduire la charge mentale** et **montrer le
chemin** (« voilà où tu en es, voilà ce qui manque, voilà l'étape suivante »).

**Différence avec les apps de coparentalité (type 2houses).** Elles supposent deux parents qui
**coopèrent** (calendrier partagé, dépenses communes, messagerie). Parent Preuve s'adresse à
**un seul parent**, souvent seul face au conflit, qui constitue un dossier factuel. On
**n'invite pas** l'autre parent. À reprendre d'elles : leur **clarté/lisibilité**. À éviter :
leur **ton léger** et leur **vocabulaire collaboratif** — l'identité navy/or sérieuse est un atout.

**⚠️ Garde-fou de vocabulaire.** Ne JAMAIS écrire « assistant juridique ». Décrire la **fonction**
(mettre de l'ordre), jamais la **promesse** (dire quoi faire en droit). Formulation type :
**« votre aide pour organiser un dossier clair et factuel »**.

**Cible à terme** : application mobile native (React Native/Expo ou PWA). Le backend Supabase est
entièrement réutilisable ; seule l'interface évoluera. Tout choix technique doit en tenir compte.

### Deux modes d'usage (pour tout futur travail UI)
1. **Capture rapide** — un événement survient (retard, non-représentation, dépense, photo) ; le
   parent est sur le moment, stressé, souvent sur mobile. La **vitesse prime**.
2. **Gestion de dossier** — plus tard, au calme : soldes, état, courrier. La **vue d'ensemble prime**.

Direction retenue : l'**accueil sert la gestion de dossier** (tableau de bord) ; la **capture
rapide vit par-dessus** via un bouton flottant universel (transposable au mobile). Invariant non
négociable même en mode rapide : **« l'IA propose, l'utilisateur valide »** — le « rapide » porte
sur le geste de saisie, jamais sur un enregistrement automatique sans contrôle humain.

---

## 2. Positionnement juridique — règles absolues

Ne jamais écrire ou laisser entendre que l'application :
remplace un avocat · donne un conseil juridique personnalisé · remplace un commissaire de justice ·
certifie une preuve comme un constat · garantit la recevabilité d'une preuve · garantit une issue.

Formulations autorisées : « aide à l'organisation du dossier » · « aide à la rédaction factuelle » ·
« preuve numérique renforcée » · « preuve scellée et horodatée » · « traçabilité renforcée » ·
« soumis à l'appréciation du juge » · « à faire relire par un professionnel du droit si nécessaire ».

**Preuves photo** = « preuve numérique renforcée, scellée et horodatée ». Horodatage actuel
**non qualifié** (à dire honnêtement partout, avertissement sur chaque export PDF). Jamais
présenté comme équivalent à un constat de commissaire de justice.

**Élément matériel oui, élément moral jamais.** L'app documente des faits constatables (montant dû,
montant payé, date, absence de remboursement, existence d'une clause, modalité de visite, échéance).
Elle ne qualifie jamais l'intention ni le caractère volontaire (abandon de famille, mauvaise foi,
manipulation, dangerosité, mensonge…) — cela relève du juge et de l'avocat. Préférer : « il ressort
de la pièce… », « le texte mentionne… », « l'utilisateur indique… », « cet élément pourrait être
soumis à l'appréciation du juge ».

> Articles de loi : **saisis et vérifiés par l'utilisateur, jamais inventés ni générés par l'IA.**

---

## 3. Cadre IA — « l'IA propose, l'utilisateur valide »

- **Aucune écriture IA en base sans validation humaine.** Relecture obligatoire des sorties.
- Toute proposition IA est tracée `source='ia'` et reste `valide=false` jusqu'à validation.
- L'IA **n'invente pas**, **ne qualifie pas** juridiquement, **n'infère pas** l'intention d'un parent
  ni un statut procédural depuis le seul type de décision. Elle **signale ses incertitudes** et
  **cite le passage source** quand elle extrait une règle.
- **Mistral** (UE, `mistral-small-latest`), appels **côté serveur uniquement**, clé jamais en
  `NEXT_PUBLIC_`. Sous-traitant RGPD nommé (DPA art. 28, option « zéro rétention »).
- **Non HDS** → minimisation stricte des données sensibles (jamais de données de santé envoyées).
- **Anti-hallucination** : sorties **JSON structurées** validées avant affichage/écriture ;
  **invariant `valeur: null` ⇒ `confiance: "absente"`** (ne jamais inventer une confiance pour une
  donnée absente).
- **Consentement IA granulaire** par fonctionnalité au point d'usage (table `consentements_ia`).
- **Déterministe d'abord** : ne recourir à l'IA que là où c'est nécessaire.

---

## 4. Stack technique (versions réelles)

- **Framework** : Next.js **16.2.6** (App Router), TypeScript 5. Route serveur = `route.ts`,
  **une fonction par méthode HTTP** (`export async function POST(request: Request)`),
  `await request.json()`, `Response.json({...})`. En Next.js 16, `headers()`/`cookies()` sont **async**.
- **UI** : React **19.2.4**, Tailwind CSS 4 (`@tailwindcss/postcss`).
- **Backend** : Supabase (PostgreSQL + Auth + Storage), **RLS partout**. Client navigateur
  `@/lib/supabase` (anon). Auth **entièrement côté navigateur** — pas de `@supabase/ssr`, pas de
  middleware, pas de session côté serveur (les routes lisent la session via token Bearer, cf. §8).
- **PDF** : `jspdf` ^4.2 + `jspdf-autotable` ^5. (`pdf-lib` **non installé** — prévu pour la fusion
  PDF du coffre-fort, étape 4.)
- **IA** : Mistral, endpoint `https://api.mistral.ai/v1/chat/completions`, Bearer, modèle
  `mistral-small-latest`. Extraction : `temperature: 0` + `response_format: { type: "json_object" }`.
  OCR scanné : endpoint Mistral `/v1/ocr` (facturé à l'usage, ~1 $/1000 pages).
- **Lecture PDF numérique** : `unpdf` ^1.6 (ESM-only ; `extractText(pdf, { mergePages: true })`
  renvoie `{ totalPages, text }`).

### `.env.local` (racine, local)
`HORODATAGE_SECRET` · `MISTRAL_API_KEY` (jamais `NEXT_PUBLIC_`) ·
`NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `ANON_KEY`) ·
`SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement) ·
`NODE_OPTIONS=--use-system-ca` (correctif TLS Windows, voir §11).
Après modif de `.env.local` : **Ctrl+C puis `npm run dev`**. Une **nouvelle route** ne nécessite
pas de redémarrage ; un **nouveau dossier de route/page** en Next 16, si.

### Variables d'environnement Vercel (Production)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `ANON_KEY`),
`MISTRAL_API_KEY`, `HORODATAGE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.
⚠️ **`NODE_OPTIONS=--use-system-ca` NON reporté** (correctif Windows local uniquement).
⚠️ **`HORODATAGE_SECRET` immuable après déploiement** — il signe les preuves existantes ;
le changer invalide toutes les preuves déjà scellées.
Auth Supabase : **Site URL** + **Redirect URLs** réglées sur le domaine Vercel. Confirmation
e-mail désactivée en phase de test (à réactiver + vrai SMTP pour la prod).

---

## 5. Identité visuelle

- **Palette** : Navy `#15233F` · Or `#C2A24C` · Crème clair `#F8F6F1` · Texte `#1F2733`.
  Fond global des pages : crème profond **`#ECE7DC`** (`min-h-screen bg-[#ECE7DC]`, et
  `--background` dans `globals.css`) ; le crème clair `#F8F6F1` est réservé aux cartes/encarts.
  Gris accordé navy pour les libellés : **`#5A6473`**.
- **Couleurs de statut** (tenues distinctes de l'or de marque) : vert `#2E6A4D`, rouge `#9B2C2C`,
  ambre `#8A5A12`.
- **Titres** : Playfair Display (`.font-display`, chargée dans `layout.tsx`).
- **`PageHeader.tsx`** : bandeau navy (`eyebrow` doré, `title` serif, filet doré, `subtitle`).
- **`EncartPliable.tsx`** : encart crème pliable. Props `{ titre, resume?, pliable?, replieParDefaut?,
  children }`. Utilisé pour les 4 encarts de règles.
- **`.carte`** : classe utilitaire (`globals.css`) donnant une ombre teintée navy (relief léger).
  Source unique d'intensité = les deux opacités dans la règle `.carte`.

### Apprentissages design (à réappliquer partout)
- **Jamais de double séparation** : soit l'ombre `.carte`, soit une bordure — pas les deux.
- **Bannir les gris Tailwind par défaut** (`slate-200/400/500`) → gris accordés à la palette.
- **L'or `#C2A24C` reste rare** : accent seulement (fil de nav, bouton de capture), un seul endroit
  fort par écran.
- **Couleurs de statut ≠ couleur de marque.**
- **Une seule action principale par écran** (bouton plein navy `#15233F`, texte crème) ; le reste en
  secondaire (contour clair, sans `.carte`).
- **Rester strictement sur l'échelle d'espacement Tailwind** (jamais « au jugé »).

---

## 6. Base de données Supabase

Convention : `id uuid` (PK), `user_id uuid default auth.uid()`, colonnes en français,
`created_at timestamptz`. **RLS + 4 policies par table** (lire/créer/modifier/supprimer) sur
`auth.uid() = user_id`. **RLS active sur 100 % des 14 tables**, aucune policy permissive.

### Tables
- **`children`** — enfants. ⚠️ Prénom = **`prenom_ou_alias`**.
- **`events`** — journal : `titre`, `categorie`, `date_evenement`, `heure_evenement`,
  `description_factuelle`, `child_id`, **`statut`** (`brouillon`|`valide`|`exporte`, défaut
  `brouillon`, contrainte `events_statut_check`).
- **`expenses`** — frais : `libelle`, `categorie`, `montant`, `part_autre`, `date_frais`,
  `rembourse` (bool), **`document_id`** (FK `documents`, `on delete set null`).
- **`pension_payments`** — paiements réels mois par mois : `mois_du`, `montant_du`, `montant_paye`,
  `date_paiement`, `notes`.
- **`pension_regle`** — la RÈGLE de pension du jugement (≠ paiements). Voir §6.1.
- **`frais_regle`** — la RÈGLE de partage des frais (≠ `expenses`). Voir §6.2.
- **`dvh_regle`** — modalités du droit de visite/hébergement. Voir §6.3.
- **`decision_regle`** — nature/échéances/statut procédural de la décision. Voir §6.4.
- **`documents`** — pièces : `libelle`, `categorie`, `chemin_fichier`, `date_document`, `child_id`.
  ⚠️ Ne pointe que vers un enfant (le coffre-fort rendra `child_id` optionnel — backlog §10).
- **`dossier`** — socle (1 ligne/user, `upsert`) : `declarant_*`, `autre_parent_*`,
  `jugement_juridiction`, `jugement_date`, `jugement_numero_rg`, `jugement_intitule`.
  *(Les colonnes `consentement_ia*` ont été supprimées → voir `consentements_ia`.)*
- **`preuves_photo`** — preuves scellées/horodatées. Voir §6.5.
- **`garde_regles`** — règle de garde (une par enfant). Voir §6.6.
- **`consentements_ia`** — **consentement IA par fonctionnalité (SOURCE DE VÉRITÉ unique).**
  `user_id`, `fonctionnalite` (ex. `"reformulation"`, `"extraction"`), date. Insert/Select +
  **DELETE** (policy ajoutée — le retrait de consentement était bloqué). Pas d'UPDATE (le consentement
  est un fait historique daté). Utilisée par `ConsentementIA.tsx` / `StatutConsentementIA.tsx` (prop
  `fonctionnalite`).
- **`ia_appels`** — quota anti-abus durable (1 ligne/appel via client lié à la session ; RLS active ;
  **pas de policy DELETE** volontairement → quota non réinitialisable). Voir §8.
- **`acceptation_politique`** — `user_id`, `version`, `accepted_at` (RLS SELECT + INSERT). Pilote la
  boîte d'accueil RGPD. Incluse dans la route de suppression de compte.

> **Patron commun aux 4 tables règles** (`pension_regle`, `frais_regle`, `dvh_regle`,
> `decision_regle`) : `id`, `user_id` (default `auth.uid()`, FK `auth.users`, `on delete cascade`),
> `enfant_id` (FK `children`, nullable, `on delete set null`), colonnes métier fidèles au
> **dispositif**, puis **`source`** (`'manuel'`|`'ia'`), **`valide`** (bool), **`actif`** (bool),
> `notes`, `created_at`. Enregistrement manuel : on n'envoie pas `source`/`valide`/`actif` → défauts
> (`'manuel'`, `true`, `true`). Règle issue de l'IA : on envoie explicitement `source='ia'` +
> `valide=false`. Lecture d'une seule règle active : `.eq('actif', true)` + `maybeSingle()` ;
> `update` si elle existe, sinon `insert`.
> ⚠️ **`enfant_id` n'est PAS encore géré** : une seule règle active par table et par utilisateur,
> `enfant_id` laissé `null`. Le rattachement par enfant (sélecteur humain) est repoussé (backlog §10).
> L'IA n'extrait **jamais** `enfant_id` (UUID inconnu d'elle).

### 6.1 `pension_regle`
`montant_base` (numeric, chiffre du dispositif, figé), `montant_courant` (après indexation ;
au départ = `montant_base`), `debiteur` (`'moi'`|`'autre'`), `jour_echeance` (int),
`paiement_avance` (bool), `inclut_vacances` (bool), `intermediation` (bool),
`indexation_active` (bool), `indexation_jour` (int), `indexation_mois` (int),
`indexation_premiere_date` (date), `indexation_indice` (text) + patron commun.
La table décrit la « loi du dossier » ; le calcul (indexation INSEE, reste dû) sera une fonction pure.

### 6.2 `frais_regle`
`categories_couvertes` (text), `part_moi_pourcentage`, `part_autre_pourcentage` (somme **non forcée**
à 100, le dispositif fait foi), `accord_prealable_requis` (bool), `accord_prealable_seuil` (numeric),
`delai_remboursement_jours` (int), `justificatif_obligatoire` (bool, défaut `true`),
`s_ajoute_a_pension` (bool) + patron commun.

### 6.3 `dvh_regle`
`type_dvh` (`classique`|`mediatise`|`reduit`|`progressif`|`libre`|`suspendu`|`sans_dvh`),
`titulaire` (`'moi'`|`'autre'`), `lieu_visite` (`domicile`|`espace_rencontre`|`tiers`|`autre`),
`presence_tiers` (bool), `tiers_details`, `frequence`, `duree`, `duree_limitee` (bool),
`clause_renonciation` (bool), `clause_renonciation_details`, `remise_lieu`, `vacances_partage`
+ patron commun.
Distinction : `garde_regles` colore l'agenda (rythme) ; `dvh_regle` consigne les modalités juridiques.

### 6.4 `decision_regle`
`type_decision` (`jugement`|`ordonnance`|`convention_homologuee`|`arret`|`autre`), `provisoire` (bool),
`execution_provisoire` (bool), `susceptible_appel` (bool), `frappee_appel` (bool), `appel_date`,
`appel_juridiction`, `date_decision`, `date_signification`, `date_audience_prochaine`,
`mise_en_etat` (bool), `mise_en_etat_details` + patron commun.
Distinction : `dossier` = identité du jugement ; `decision_regle` = statut procédural.

### 6.5 `preuves_photo`
`titre`, `description`, `enfant_id`, `storage_path`, `nom_fichier`, `type_fichier`, `taille_octets`,
`empreinte_sha256`, `metadonnees` (jsonb), `gps_latitude`, `gps_longitude`, `gps_precision_metres`,
`heure_appareil`, `ecart_heure_secondes`, `anomalies` (jsonb), `horodatage_jeton`, `horodatage_date`,
`horodatage_statut` (`non_qualifie`|`a_refaire`|`qualifie`), `horodatage_prestataire`,
`horodatage_algorithme`. `created_at` = horodatage serveur.

### 6.6 `garde_regles`
`enfant_id`, `type_garde` (`weekend_sur_deux` ; `alternee_hebdo` plus tard), `parent_principal`
(`moi`|`autre`), `date_reference`, `jour_debut`, `heure_debut`, `jour_fin`, `heure_fin` + patron commun.

### Storage
Buckets **privés** `preuves` et `justificatifs`, cloisonnés par utilisateur
(`(storage.foldername(name))[1] = auth.uid()`). Profondeur : `justificatifs` = `userId/fichier`
(2 niveaux) ; `preuves` = `userId/preuveId/fichier` (3 niveaux). **Pas de policy UPDATE sur `preuves`**
(originaux scellés non modifiables = voulu). URL signée 60 s pour la lecture.

---

## 7. Ce qui est construit (état réel)

**MVP fonctionnel** : auth, enfants, journal, frais, pension, documents, export PDF, calendrier de
garde + rappels, module preuve photo scellée (SHA-256, GPS, écart d'heure serveur, horodatage
HMAC-SHA256), assistant de courriers, pipeline IA complet.

**Pipeline IA (complet)**
- Consentement par fonctionnalité (`consentements_ia`) ; `ConsentementIA.tsx` = porte réutilisable.
- **Brique B — reformulation neutre** : `/api/ia/reformuler`, page `/reformuler` (3 états selon
  consentement). Garde-fous : clé absente → 500 ; texte vide → 400 ; max 5000 car. → 400 ; Mistral → 502.
- **Brique A — extraction du jugement** sur les 4 tables règles, **un seul appel Mistral**, JSON
  sectionné `{ sections: { pension, frais, dvh, decision } }`, chaque champ
  `{ valeur, confiance ("haute"|"moyenne"|"absente"), citation }`. Le **dispositif fait foi**
  (« PAR CES MOTIFS »). Pré-remplissage des 4 encarts `RegleX` ; bannière or « Valider cette règle »
  tant que `valide=false`.
  - **Porte 1 — description libre** : `/api/ia/extraire` ; hub `/dossier/extraire`.
  - **Porte 2 — import PDF** : `/dossier/importer-pdf` + `/api/ia/extraire-pdf`. `unpdf` pour les PDF
    numériques, **OCR Mistral** en secours pour les scans (après clic explicite). Ciblage du
    dispositif via `lib/dispositif.ts` (regex « PAR CES MOTIFS », cap 5000 car.). Le PDF n'est ni
    conservé ni journalisé.
  - **Cœur partagé** : `lib/extractionRegles.ts` (prompt + validation) et `lib/regleConvertisseurs.ts`
    (`versRegleX`), utilisés par les deux portes.
  - **Aperçu IA** : `components/ApercuExtraction.tsx` (confiance, citations, puces nommées par champ
    via `lib/libellesRegles.ts`).
- **Rate limiting** : quota durable en base via `lib/quotaIa.ts` (table `ia_appels`). Limites :
  reformulation 15/60 s, extraction 10/60 s, extraction-pdf 5/120 s → 429 si dépassé.
- **Auth des routes IA** : `lib/authServeur.ts` (vérifie le Bearer via `supabase.auth.getUser(jeton)`),
  helper client `lib/enteteAuth.ts`. **Ordre dans chaque route IA : auth (401) → quota (429) → Mistral.**

**Assistant de courriers (complet)** : `dossier` (socle, upsert), `/dossier`, `/courriers` (index),
moteur `CourrierModele.tsx`, `lib/courrierHelpers.ts`, `lib/courrierPdf.ts`. **4 modèles** :
relance-pension, remboursement-frais, non-representation, info-scolarite-sante.
Articles de loi saisis/vérifiés par l'utilisateur.

**Briques déterministes** : C — `lib/controleDossier.ts` + `ControleDossier.tsx` (contrôle avant
export, bouton désactivé si bloquant). D — calculs centralisés `lib/dossierCalculs.ts`
(`totauxFrais`, `totauxPension`, `euros`, `resteDuGlobal`) utilisés par `TableauDeBord` **et**
`/export` ; bordereau de pièces dans le PDF.

**Horodatage** : couche HMAC-SHA256 non qualifiée (`/api/horodatage`, signe au scellé ; échec →
`statut = "a_refaire"`). eIDAS qualifié (QTSP, RFC 3161) **différé** jusqu'à ouverture d'un compte
prestataire payant — la plomberie est prête pour le swap (on ne touchera quasiment qu'à
`app/api/horodatage/route.ts`).

**Mise en ligne & RGPD**
- Routes IA authentifiées + quota durable (ci-dessus).
- **Suppression de compte RGPD** : `lib/supabaseAdmin.ts` (client `service_role`, strictement serveur,
  pour `auth.admin.deleteUser`) ; route `DELETE /api/compte/supprimer` (identité issue de la session
  vérifiée, jamais du corps) ; efface fichiers Storage → lignes des 14 tables → compte Auth en dernier.
  Page `/compte` (confirmation par saisie de **SUPPRIMER**).
- **Effacer toutes mes données** : `components/EffacerDonnees.tsx` en bas de `/dossier` (remise à zéro
  du dossier, sans suppression du compte Auth ; confirmation par saisie de **EFFACER**).
- **Pages légales** : `/confidentialite` = source unique (données, Mistral/Vercel/Supabase
  sous-traitants, droits) — contient des champs **`[À COMPLÉTER]`** (éditeur, e-mail de contact,
  régions, alignement DPA Mistral, date). `/mentions-legales` allégée renvoyant vers `/confidentialite`.
  `components/Footer.tsx` (navy/or) monté dans le layout.
- **Accueil & garde d'accès** : `components/AccueilPublic.tsx` (présentation visiteurs non connectés) ;
  `app/page.tsx` bifurque (présentation si déconnecté, tableau de bord si connecté) ;
  `components/GardeAcces.tsx` (monté dans le layout) redirige vers `/connexion` toute page non
  publique. Chemins publics : `/`, `/connexion`, `/confidentialite`, `/mentions-legales`.
- **Boîte d'accueil RGPD** : `components/BienvenueRGPD.tsx` (monté dans le layout) s'affiche après
  connexion tant que `VERSION_POLITIQUE` n'est pas acceptée (table `acceptation_politique`).

---

## 8. Sécurité — synthèse

- Auth **entièrement côté navigateur** (pas de `@supabase/ssr`). Les routes serveur lisent la session
  via **token Bearer** (`lib/authServeur.ts`).
- Routes IA : **auth (401) → quota (429) → Mistral**. Secrets côté serveur uniquement, jamais
  `NEXT_PUBLIC_`. `SUPABASE_SERVICE_ROLE_KEY` réservée à `lib/supabaseAdmin.ts`.
- RLS sur 100 % des tables ; buckets privés cloisonnés par utilisateur.
- `ia_appels` sans DELETE (quota non réinitialisable) → la suppression de compte passe par le client
  admin, pas par RLS (sinon l'effacement de `ia_appels` serait silencieusement ignoré).

---

## 9. Carte des fichiers (réelle — racine, pas de `src/`)

```
app/
  layout.tsx              (NavBar + GardeAcces(children) + Footer + BienvenueRGPD ; polices ; metadata "Parent Preuve")
  page.tsx                (ACCUEIL : AccueilPublic si déconnecté, sinon TableauDeBord + Actions rapides + ProchainesEcheances)
  globals.css             (.font-display + .carte + --background #ECE7DC)
  connexion/page.tsx
  compte/page.tsx         (RGPD : suppression de compte)
  confidentialite/page.tsx (source unique politique — champs [À COMPLÉTER])
  mentions-legales/page.tsx (renvoi vers /confidentialite)
  dossier/page.tsx        (socle + StatutConsentementIA + <RegleDecision/> + EffacerDonnees)
  dossier/extraire/page.tsx (HUB extraction IA : consentement + fil d'étapes + ApercuExtraction + 4 encarts)
  dossier/importer-pdf/page.tsx (PORTE 2 : import PDF/OCR → 4 encarts pré-remplis)
  enfants/page.tsx
  journal/page.tsx        (events + statut brouillon/valide/exporte)
  frais/page.tsx          (frais + lien justificatif + <RegleFrais/>)
  pension/page.tsx        (paiements + <ReglePension/>)
  calendrier/page.tsx     (règle de garde + <RegleDVH/>)
  documents/page.tsx
  preuves/page.tsx · preuves/nouvelle/page.tsx
  courriers/page.tsx + 4 modèles (relance-pension, remboursement-frais, non-representation, info-scolarite-sante)
  export/page.tsx         (ControleDossier + bordereau + calculs)
  reformuler/page.tsx     (brique B)
  favicon.ico             (⚠️ par défaut create-next-app)
  api/
    horodatage/route.ts            (HMAC interne, non qualifié)
    compte/supprimer/route.ts      (DELETE RGPD, client admin)
    ia/reformuler/route.ts         (brique B)
    ia/extraire/route.ts           (extraction 4 tables, JSON sectionné, 1 appel Mistral)
    ia/extraire-pdf/route.ts       (PORTE 2 : PDF→texte/OCR→dispositif→moteur partagé)

components/
  NavBar.tsx              (familles ; liens "Analyse du jugement" + "Importer un jugement")
  Footer.tsx · GardeAcces.tsx · BienvenueRGPD.tsx · AccueilPublic.tsx
  TableauDeBord.tsx (3 cartes : frais/pension/preuves) · ProchainesEcheances.tsx
  CalendrierMensuel.tsx · ControleDossier.tsx
  ConsentementIA.tsx · StatutConsentementIA.tsx · ApercuExtraction.tsx
  EncartPliable.tsx · PageHeader.tsx · CourrierModele.tsx
  ReglePension.tsx · RegleFrais.tsx · RegleDVH.tsx · RegleDecision.tsx
  EffacerDonnees.tsx
  BoutonCaptureRapide.tsx (⚠️ existe mais N'EST MONTÉ NULLE PART — à remonter, idéalement dans layout.tsx)

lib/
  supabase.ts · supabaseAdmin.ts (service_role, serveur)
  authServeur.ts (Bearer → user) · enteteAuth.ts (helper fetch Authorization)
  quotaIa.ts (quota durable, table ia_appels)
  limiteurAppel.ts (⚠️ CODE MORT — plus importé, supprimable)
  dossierCalculs.ts (totauxFrais, totauxPension, euros, resteDuGlobal)
  controleDossier.ts (brique C)
  gardeCalendrier.ts · gardeNotifications.ts
  courrierHelpers.ts (v, dateFr, type Dossier) · courrierPdf.ts · preuvePdf.ts
  dispositif.ts (ciblerDispositif "PAR CES MOTIFS", cap 5000)
  extractionRegles.ts (cœur partagé : prompt + validateurs)
  regleConvertisseurs.ts (cœur partagé : versRegleX)
  libellesRegles.ts (libellés FR des champs — puces ApercuExtraction)

racine : AGENTS.md · CLAUDE.md (@AGENTS.md + @PARENT_PREUVE_CONTEXTE.md) ·
         PARENT_PREUVE_CONTEXTE.md (ce fichier) · VITRINE_PARENT_PREUVE_BRIEF.md ·
         package.json · README.md (⚠️ par défaut)
```

`package.json` (réel) — dependencies : `@supabase/supabase-js`, `jspdf`, `jspdf-autotable`, `next`
16.2.6, `react`/`react-dom` 19.2.4, `unpdf`. Script dev : `cross-env NODE_OPTIONS=--use-system-ca
next dev`. ⚠️ **`cross-env` n'est pas dans package.json** → à ajouter en devDependency.

---

## 10. Backlog / chantiers

**Dette technique immédiate (vérifiée 09/06/2026)**
- Remonter `BoutonCaptureRapide` (idéalement dans `layout.tsx` pour toutes les pages).
- Ajouter `cross-env` en devDependency.
- Supprimer `lib/limiteurAppel.ts` (mort).
- Dégénériciser README + `favicon.ico`.

**Avant ouverture large**
- Compléter les `[À COMPLÉTER]` des pages légales + **faire relire par un professionnel du droit**.
- Réactiver la confirmation e-mail + vrai service SMTP.
- Harmoniser le design de `/reformuler` (diffère des autres pages) ; diagnostiquer la qualité de
  reformulation Mistral (prompt vs modèle).

**Brique A (suite)** : gérer `enfant_id` dans les `RegleX` (sélecteur d'enfant + lecture par enfant) ;
moteur d'indexation INSEE (fonction pure mettant à jour `montant_courant`) ; comparaison « dû selon la
règle » vs « payé » ; surfacer `confiance`/`citation` aussi côté import PDF.

**Coffre-fort de documents** (`/documents/coffre-fort`, prochain grand chantier, nouvelle conversation)
- Liste centralisée (`documents` + `preuves_photo`), catégorisée, filtrable.
- Étendre la table `documents` (principe DRY) plutôt que créer une table parallèle ; `child_id`
  probablement à rendre optionnel pour des documents généraux.
- Pré-sélection « Documents à joindre » dans la génération de courriers ; bordereau automatique.
- **Étape de fusion PDF nécessitera `pdf-lib`** (en plus de jsPDF).
- Distinction de nature : `documents` = pièces justificatives ordinaires ; `preuves_photo` = preuves
  scellées/horodatées.

**Sur l'horizon** : eIDAS qualifié (QTSP) ; app mobile native (RN/Expo ou PWA) ; chatbot d'orientation
procédurale (V4, RAG sur textes de référence, information générale, appels serveur) ; note de synthèse
factuelle pour avocat (cadrage strict, pas de « conclusions JAF ») ; présence App Store / Google Play
(actuellement « Bientôt disponible »).

**Site vitrine** (projet séparé, single HTML/CSS, Vercel) : brief dans `VITRINE_PARENT_PREUVE_BRIEF.md`.

---

## 11. Conventions de travail & environnement (Windows / PowerShell)

- **Développeur débutant** : expliquer simplement, nommer fichiers/chemins exacts, **étape par étape**,
  un test concret (URL ou commande) + résultat attendu après chaque étape.
- **Ordre** : table/SQL d'abord, puis route serveur (testée isolément en PowerShell), puis composant,
  puis branchement de page. N'avancer qu'après confirmation.
- **Modifications ciblées** pour les petits changements ; **remplacement complet du fichier** quand un
  fichier change à beaucoup d'endroits (évite les doublons de copier-coller).
- **Réutiliser l'existant** (DRY) : `PageHeader`, `EncartPliable`, `ConsentementIA`, les 4 `RegleX`,
  `dossierCalculs.ts`, `controleDossier.ts`, `gardeCalendrier.ts`, les routes `/api/ia/*`, les patterns
  Supabase/RLS.
- **GitHub** : push après chaque étape confirmée (le dépôt est synchronisé au projet Claude).
- **Nouvelle conversation par grande fonctionnalité** ; charger ce fichier en premier.

**PowerShell**
- Tester une route serveur (afficher le JSON complet, textes **sans accents** dans `-Body`) :
  ```powershell
  $r = Invoke-RestMethod -Uri http://localhost:3000/api/ia/extraire -Method Post `
    -ContentType "application/json" `
    -Body '{"texte":"Le jugement fixe une pension de 180 euros par mois payable avant le 5..."}'
  $r | ConvertTo-Json -Depth 10
  ```
  ⚠️ `curl` est un alias d'`Invoke-WebRequest` → préférer `Invoke-RestMethod`. Objets JSON imbriqués :
  `ConvertTo-Json -Depth 10` pour éviter la troncature.
- **TLS Windows** : `NODE_OPTIONS=--use-system-ca` (déjà dans le script `dev` via `cross-env`) règle les
  erreurs de certificat dues à l'inspection HTTPS d'un antivirus. ⚠️ Ne **jamais** mettre ce flag sur
  Vercel. Dernier recours local, jamais permanent : `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"`.
- **Secret aléatoire** : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

**Pièges Next.js 16 connus**
- `next lint` supprimé ; `next build` ne lance plus ESLint → les erreurs de lint ne bloquent pas Vercel
  (ne pas remettre `eslint.ignoreDuringBuilds`, qui provoque une erreur TS).
- **Jamais de `page.tsx` sous `app/api/`** (« Conflicting route and page ») — uniquement des `route.ts`.
- Nouveau dossier de route/page → redémarrer `npm run dev`.

---

## Checklist avant toute réponse de code
- Positionnement juridique respecté (pas de conseil, pas de promesse de résultat) ?
- Secrets côté serveur, jamais `NEXT_PUBLIC_` ?
- RLS / cloisonnement Supabase respectés ?
- Validation humaine prévue pour toute sortie IA (`source='ia'`, `valide=false`) ?
- Un test concret donné, expliqué simplement, étape par étape ?
- Compatibilité future mobile (PWA/RN) prise en compte si pertinent ?
