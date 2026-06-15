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

- **Carnet d'informations (Info Bank solo)** : médecins, allergies, école, contacts d'urgence,
  tailles. Utile au quotidien, pas seulement en conflit.
- **Journal des demandes de modification de garde** : registre daté des sollicitations et des
  réponses (oui / non / sans réponse).
- **Check-in d'échange géolocalisé** : réutilise la plomberie GPS + horodatage + SHA-256 du
  module preuve photo. Wording « relevé horodaté », jamais « constat ».
- **Export CSV des frais/pension** (en plus du PDF).
- **Rapprochement paiement ↔ dépense** + gestion d'une part variable (comble une plainte
  fréquente chez un concurrent).
- **Import vacances scolaires + jours fériés FR** (API publique par zone) dans le calendrier.
- **Synchronisation iCal en lecture seule** du calendrier de garde (flux `.ics`).

---

## 3. Fonctionnalités candidates — gestion de conflit / JAF

Fondé sur l'attendu d'un dossier d'audience : charge de la preuve sur le demandeur, juge qui lit
vite (15–30 min) un dossier classé par thème, preuve libre mais licite.

### Faible risque (directement exploitable)
- **Chronologie unifiée exportable** : fusion `journal` + `frais` + `pension` + `preuves` en une
  frise datée, filtrable par thème. *(Plus fort impact / plus faible risque.)*
- **Dossier d'audience thématique** : export classé par thème, chaque section avec son bordereau
  numéroté (réutilise le bordereau de la note de synthèse).
- **Marqueur « implication parentale »** : tag sur `documents` et `events`, exportable en section.
- **Lien fait ↔ clause du jugement** : rattacher un fait aux règles déjà extraites du dispositif
  (`dvh_regle`, `pension_regle`, …). Wording « écart constaté par rapport au dispositif », jamais
  « manquement » ni « faute ».

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
  unifiée en tête. *(Chantier Production prioritaire.)*
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

### Arbitrages encore ouverts
- Ordre d'attaque entre : base UI (finir les tokens), nouvelle fonctionnalité, ou réorganisation
  de la navigation.

### Rappel de méthode
Une petite étape testable à la fois ; valider le plan avant d'écrire le code ; SQL → logique pure
→ composant → page ; remplacement complet de fichier préféré aux patchs dispersés ; go-ahead
explicite entre chaque phase.
