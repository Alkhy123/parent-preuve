# Parent Preuve — ROADMAP UX & produit (vision cible)

> **Rôle de ce fichier.** La **vision produit / UX cible** : positionnement, idées de
> fonctionnalités, réorganisation de la navigation par thème. C'est du **prospectif** (ce qu'on
> pourrait construire et pourquoi), à ne pas confondre avec l'état réel
> (`PARENT_PREUVE_REFERENCE.md`) ni avec les règles invariantes (`PARENT_PREUVE_CONTEXTE.md`).
>
> Tout ce qui suit passe par le filtre du socle : **solo + factuel + jamais de conseil
> juridique + « l'IA propose, l'utilisateur valide »**.

---

## 1. Positionnement : outil SOLO vs apps partagées

Distinction structurante : OurFamilyWizard, 2houses, Coparently, AppClose sont des outils
**partagés** (les deux parents sont dans l'app). **Parent Preuve est un outil solo** : l'autre
parent n'y est pas. Conséquence : on n'adapte que les fonctions qui ont du sens pour un parent
seul constituant son dossier, et on écarte toute la couche messagerie/appels entre parents.

On reprend des concurrents leur **clarté** (accueil en cartes, navigation par familles,
simplicité mobile, peu de décisions par écran). On évite leur **ton léger** et leur
**vocabulaire collaboratif** — l'identité navy/or sérieuse est un atout, surtout pour un dossier
qui pourra finir entre les mains d'un avocat ou d'un juge.

---

## 2. Fonctionnalités candidates — usage quotidien

- **Carnet d'informations enfant (Info Bank solo)** : école/classe/enseignant, médecin, allergies,
  traitements, contacts d'urgence, activités, taille/pointure, infos administratives. Utile au quotidien,
  pas seulement en conflit. ⚠️ Contient des **données de santé** : à marquer comme sensibles, minimiser,
  permettre la suppression, **jamais envoyées à l'IA** sans action explicite, pas de partage public.
- **Registre des demandes de modification de garde** : registre daté solo (pas de messagerie). Champs :
  date, type (week-end/horaire/vacances/lieu/autre), canal (SMS/mail/oral/recommandé/autre), demande
  formulée, réponse, statut (acceptée/refusée/sans réponse/en attente), date de réponse, pièce liée,
  conséquence pratique, commentaire factuel. Filtre par période + export PDF, lien chronologie + pièces.
- **Check-in d'échange géolocalisé** : réutilise GPS + horodatage + SHA-256 du module preuve. Enregistre
  date serveur/appareil + écart, lat/long + précision, adresse approx., photo et commentaire optionnels.
  Rapport « **Relevé de présence horodaté** » — jamais « constat / certificat / preuve irréfutable ».
- **Indexation automatique de la pension** : saisie montant initial + date jugement + indice + date de
  revalorisation annuelle → montant revalorisé, tableau dû/payé/reste dû, retard. *(Recoupe la Brique A
  côté technique, voir REFERENCE §5.)*
- **Calendrier enrichi** : zone scolaire A/B/C, import vacances scolaires + jours fériés FR (API publique),
  **détection de conflits d'horaires**, rappels locaux, **export iCal en lecture seule** (`.ics`).
- **Export CSV** des événements, frais, pension, demandes, preuves, documents (en plus du PDF).
- **Rapprochement paiement ↔ dépense** + gestion d'une part variable (comble une plainte fréquente).
- **Tableau de bord mensuel (« Résumé du mois »)** : nombre d'événements, frais demandés/payés, pension
  due/reçue, retards, preuves et documents ajoutés.
- **Tags personnalisés**, **pièces favorites** et **filtres avancés** (enfant, procédure, période,
  catégorie, statut, pièce liée, paiement complet/partiel/absent, preuve horodatée/non).
- **Aide à la rédaction factuelle** au point de saisie (transformer un ressenti en fait daté/neutre) —
  contrôle utilisateur conservé, aucune affirmation juridique. *(Rapproche `/reformuler` du journal.)*

---

## 3. Fonctionnalités candidates — gestion de conflit / JAF

Fondé sur l'attendu d'un dossier d'audience : charge de la preuve sur le demandeur, juge qui lit
vite (15–30 min) un dossier classé par thème, preuve libre mais licite.

### Faible risque (directement exploitable)
- **Chronologie unifiée exportable** ✅ **livré (16/06/2026)** : fusion `journal` + `frais` + `pension`
  + `preuves` en une frise datée, filtrable par période/type, export PDF (`lib/chronologieExport.ts` +
  `lib/chronologiePdf.ts`). Piste restante : filtrage **par thème** transverse.
- **Dossier d'audience thématique** : export classé par thème, chaque section avec son bordereau
  numéroté (réutilise le bordereau de la note de synthèse).
- - **Marqueur « implication parentale »** ✅ livré (2026-06-18) : tag catégorisé sur
  `events` + `documents`, page `/implication-parentale` classée par thème + export CSV.
- **Lien fait ↔ clause du jugement** : rattacher un fait aux règles déjà extraites du dispositif
  (`dvh_regle`, `pension_regle`, …). Wording « écart constaté par rapport au dispositif », jamais
  « manquement » ni « faute ».

### Renforcement probatoire (issu de l'audit — fort impact, risque maîtrisé)
- **Vérification des preuves par QR code** : chaque preuve a un **token public non devinable** ; page
  `/preuves/verifier/[token]` affichant **seulement** des métadonnées de vérification (statut
  authentique/modifié/introuvable, identifiant, empreinte SHA-256, dates serveur/horodatage, statut
  d'horodatage, nom/taille/type du fichier, hash vérifié oui/non). QR code dans le rapport PDF. ⚠️ Ne
  **jamais** exposer la photo originale ni de données sensibles (enfant, autre parent, adresse, document).
- **Recalcul serveur du hash SHA-256** : comparer l'empreinte calculée à l'upload (client) et celle
  recalculée côté serveur sur le fichier stocké ; afficher « conforme / non conforme » dans le rapport.
- **Journal d'audit immuable** (`audit_log`, append-only) : tracer création/modification/archivage/
  suppression/export/horodatage/vérification ; l'utilisateur le lit mais ne peut pas le modifier.
- **Export avocat ZIP** : dossier complet et transmissible — note de synthèse, chronologie, bordereau,
  pension, frais, dossiers preuves/documents, `manifest.json` + `hashes_sha256.txt`, avertissement
  données sensibles. Renforce l'intégrité du dossier.
- **Mode dossier audience** : écran dédié qui sélectionne procédure/période/catégories/pièces et génère
  un PDF structuré (résumé, points de conflit, chronologie filtrée, pension dû/payé/retard, frais,
  demandes de modification, preuves, documents, bordereau, points à faire relire). Factuel, **sans
  conclusions juridiques** — la note de synthèse reste la référence de cadrage.
- **Horodatage eIDAS qualifié (préparation)** : modèle de statut `interne_non_qualifie` /
  `qualifie_en_attente` / `qualifie_valide` / `qualifie_echec` ; le PDF distingue clairement l'horodatage
  interne non qualifié de l'horodatage qualifié, sans jamais les assimiler à un constat.

### À manier avec prudence (zone juridique sensible)
- **Modèle d'attestation de témoin (Cerfa 11527 / art. 202 CPC)** : l'app fournit le formulaire +
  un résumé factuel à transmettre au témoin. Le témoin rédige lui-même ; l'app ne génère **jamais**
  le témoignage.
- **Garde-fou « licéité de la preuve »** : rappel informatif neutre + renvoi vers un professionnel.
  Pas un conseil juridique.
- **Suivi des démarches engagées** (ARIPA, plainte, JEX) : journaliser ce que l'utilisateur décide
  de faire, sans jamais recommander quel levier activer.
- **Rappel du délai d'appel** (1 mois après notification) : information générale + renvoi avocat,
  sans suggérer s'il faut faire appel.

### Déconseillé
- Rédiger des conclusions ou un argumentaire juridique → bascule vers « assistant juridique »
  (terme interdit). La note de synthèse couvre déjà le bon périmètre.

### Idées explicitement écartées
- **Messagerie directe entre parents** : implique invitations, modération, conservation probatoire,
  RGPD complexe et risque d'escalade. Parent Preuve reste **solo** — c'est un atout, pas un manque.
- **Assistant juridique automatisé** : dire « vous devez saisir le JAF » ou « votre preuve sera
  recevable » crée un risque majeur. Préférer « cette information peut être utile à organiser dans votre
  dossier ; faites vérifier votre situation par un professionnel ».
- Simulateur de montant de pension (trop proche du conseil juridique, pertinent surtout
  avant jugement).
- Tout module de soutien émotionnel (hors positionnement).

---

## 4. Organisation & ergonomie — recommandations

1. Faire de la **procédure** le pivot, avec une vraie page « Mon dossier » répondant à « où j'en
   suis » (jugement → état réel → derniers faits).
2. Ajouter une **couche « thème » transversale** (Pension / Résidence-DVH / Autorité / Implication
   / Logement / Communication) commune à tous les modules → permet l'assemblage par onglet
   thématique. **Plus fort levier produit.**
3. Séparer la **configuration** (faite une fois) de l'**usage quotidien**.
4. Simplifier la navigation pour le 80/20 : bouton « + Ajouter » omniprésent (monter enfin
   `BoutonCaptureRapide.tsx`, actuellement non monté).
5. **Centraliser le design en tokens** (déjà amorcé dans `globals.css`) → homogénéité + facilite
   le futur passage React Native. **Socle technique.**
6. Soigner les moments de friction : états vides qui guident, confirmation de suppression, une
   seule action primaire par écran.
7. Penser **mobile d'abord** (cible finale native).

---

## 5. Arborescence de navigation cible

Pivot global : **sélecteur de procédure active** (existant, à garder ; cloisonne tout).

```
Parent Preuve
│
├─ [global] Sélecteur de procédure active ......... existant, à garder
│
├─ MON DOSSIER  (consulter — nouvelle page d'accueil)
│   ├─ Vue d'ensemble ........ remplace l'accueil actuel
│   ├─ Chronologie ........... NOUVEAU — fusion journal + frais + pension + preuves
│   └─ Par thème ............. NOUVEAU — Pension / DVH / Autorité / Implication / Logement
│
├─ SAISIR  (alimenter — geste quotidien)
│   ├─ Fait .................. /journal
│   ├─ Frais ................. /frais
│   ├─ Paiement de pension ... /pension
│   ├─ Document .............. /documents
│   └─ Preuve photo .......... /preuves/nouvelle
│
├─ ORGANISATION  (planifier)
│   ├─ Calendrier de garde ... /calendrier
│   └─ Échéances ............. composant ProchainesEcheances (sorti de l'accueil)
│
├─ PRODUCTION  (produire)
│   ├─ Dossier d'audience .... /export       à enrichir : assemblage par thème
│   ├─ Courriers ............. /courriers
│   ├─ Note pour l'avocat .... /note-synthese
│   └─ Reformulation ......... /reformuler
│
└─ RÉGLAGES  (configurer — hors parcours quotidien)
    ├─ Procédure (autre parent) ... /procedure
    ├─ Jugement (import+analyse) .. /dossier/importer-pdf · /dossier/extraire
    ├─ Socle (déclarant) .......... /dossier
    ├─ Enfants .................... /enfants
    ├─ Mon compte ................. /compte
    └─ Légal ...................... /mentions-legales · /confidentialite
```

Trois changements par rapport à la `NavBar` actuelle :
- « Mon dossier » devient un espace de **consultation** ; la config part dans « Réglages ».
- « Suivi » + « Pièces & preuves » fusionnent dans « Saisir » (même geste : nourrir le dossier).
- Seules « Vue d'ensemble / Chronologie / Par thème » sont vraiment nouvelles.

**Risque faible** : ~90 % du chantier = réécriture de `GROUPES` dans `NavBar.tsx` + nouvelle page
d'accueil. Routes et logique métier quasi inchangées.

---

## 6. Famille Production — détail de l'existant et pistes

- **Dossier d'audience — `/export`** : déjà cloisonné par procédure, filtrable par période
  (`du`/`au`), totaux frais/pension, bordereau de pièces, `ControleDossier`. **Limite** : PDF
  organisé **par table**, pas par thème. → Piste : mode d'assemblage **par thème** + chronologie
  unifiée en tête. *(Chantier Production prioritaire.)* → Voir aussi **mode dossier audience** et
  **export avocat ZIP** (§3, renforcement probatoire).
- **Courriers — `/courriers`** : 4 modèles actifs, architecture extensible (`MODELES`). → Pistes :
  modèles « mise en demeure avant ARIPA » et « demande de modification d'organisation ». Vigilance
  vocabulaire : « manquement » acceptable dans un courrier signé par l'utilisateur, jamais dans ce
  que l'app conclut elle-même.
- **Note pour l'avocat — `/note-synthese`** : meilleur garde-fou de positionnement (matière
  factuelle, bordereau, brouillon, PDF ; pas d'argumentaire). Périmètre à préserver. → Piste : y
  attacher la chronologie et le lien fait ↔ clause.
- **Reformulation — `/reformuler`** : aide à l'écriture neutre via `/api/ia/reformuler`. → Piste :
  rapprocher du point de saisie (proposer la reformulation depuis le journal quand le garde-fou de
  neutralité détecte des termes peu factuels).

**Chaîne logique** : alimenter (Saisir) → vérifier la neutralité (Reformulation) → assembler
(Dossier d'audience) → produire un courrier (autre parent) ou une note (avocat).

---

## 7. Priorités & arbitrages ouverts

### Recommandations de priorité
- Plus fort impact / plus faible risque côté JAF : **chronologie unifiée** + **lien fait ↔ clause**.
- Socle technique transverse : **finir la migration vers les tokens de design**.
- Chantier Production prioritaire : **assemblage par thème du dossier d'audience**.
- Réorganisation nav : faible risque, bon point de départ visible (réécriture de `GROUPES`).
- Levier produit le plus fort : **la couche « thème » transversale**.

### Plan d'attaque issu de l'audit (5 sprints)
1. **Fiabilisation technique** : unifier `HORODATAGE_SECRET` + `.env.example`, migrations Supabase,
   correction quota IA (insert vérifié), suppression de compte complète, audit des policies RLS, tests
   des fonctions critiques. *(Détail technique : REFERENCE §4 « Corrections issues de l'audit ».)*
2. **Renforcement des preuves** : recalcul serveur du hash, page de vérification + QR dans les PDF,
   journal d'audit, manifest d'empreintes, statut d'horodatage, préparation eIDAS.
3. **Utilité quotidienne** : indexation pension, calendrier enrichi (vacances/jours fériés/conflits),
   registre des demandes de modification, check-in géolocalisé, carnet enfant.
4. **Export & usage avocat** : mode dossier audience, export avocat ZIP, bordereau amélioré, filtres
   avancés, export CSV, chronologie personnalisée.
5. **Préparation monétisation** : registre des traitements RGPD, CGU, DPA Mistral + ZDR, politique de
   conservation/sauvegarde, audit sécurité externe, tests utilisateurs, page pricing.

> Niveau 1 (avant ouverture large) = sprints 1 + correctifs RGPD/légal ; niveau 2 (forte valeur) =
> QR vérif, page publique limitée, journal d'audit, export ZIP, manifest SHA-256, mode dossier audience,
> indexation pension, registre demandes, check-in, vacances/jours fériés.

### Arbitrages encore ouverts
- Ordre d'attaque entre : base UI (finir les tokens), nouvelle fonctionnalité, ou réorganisation
  de la navigation.

### Rappel de méthode
Une petite étape testable à la fois ; valider le plan avant d'écrire le code ; SQL → logique pure
→ composant → page ; remplacement complet de fichier préféré aux patchs dispersés ; go-ahead
explicite entre chaque phase.
