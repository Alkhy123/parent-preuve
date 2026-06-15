# Parent Preuve — Contexte : audit UX, fonctionnalités et arborescence cible

> Document de travail issu d'une session d'analyse. À conserver à côté de
> `PARENT_PREUVE_CONTEXTE.md`. Source de vérité = le code réel du dépôt
> (`Alkhy123/parent-preuve`, branche `main`, structure racine `app/` `components/` `lib/`,
> **pas** de dossier `src/`).

---

## 1. Cadre de la session

- Objet : audit UI/UX du dépôt, pistes de fonctionnalités utiles, organisation du dossier.
- Méthode : lecture du code en live (tarball GitHub) + recherche des pratiques concurrentes
  et de l'attendu côté JAF.
- Positionnement rappelé et tenu : outil d'organisation personnelle, jamais de conseil
  juridique, jamais de promesse de recevabilité, « l'IA propose, l'utilisateur valide »,
  élément matériel (faits) oui / élément moral (intention) jamais.

---

## 2. Écarts entre la documentation et le code réel

- Les anciennes docs / skills mentionnent un dossier `src/` : **faux**. Le code est en
  structure racine (`app/`, `components/`, `lib/`). Le code fait foi.
- Le crème de référence diffère selon les sources : la skill UI indique `#F8F6F1`, mais le
  code utilise souvent `#ECE7DC` (accueil, journal). À trancher (voir §3).

---

## 3. Audit UI/UX — constats

### Points solides
- Navigation claire en 5 familles (`NavBar.tsx` via `GROUPES`), menus déroulants bureau +
  panneau hamburger mobile, gestion clic-dehors et touche Échap.
- `PageHeader.tsx` cohérent et réutilisé.
- `TableauDeBord.tsx` soigné : bannière « reste dû global » + 3 cartes, couleurs sémantiques
  correctes (rouge `#9B2C2C`, vert `#2E6A4D`, amber `#8A5A12`).
- Avertissements de positionnement présents (« soumis à l'appréciation du juge »).

### Problèmes à corriger
1. **Trois fonds différents** se baladent : `#ECE7DC`, `#F8F6F1`, et `#ffffff`
   (variable `--background` dans `globals.css`). Incohérence visible.
2. **`globals.css` ne centralise pas la palette** et impose `font-family: Arial` sur le
   `body`, alors que Geist + Playfair sont chargées dans `layout.tsx`. Les couleurs de marque
   sont écrites en dur (`bg-[#15233F]`) partout.
3. **Violation de la règle `.carte` + bordure dure** : ex. `journal/page.tsx` cumule
   `carte ... border border-slate-200`. L'ombre profonde + la bordure alourdissent.
4. **Couleurs Tailwind par défaut** sur les pages de saisie (`slate`, `emerald`, `amber`,
   `red`) alors que la règle impose les équivalents palette (`#5A6473`, etc.). Incohérence
   entre dashboard (soigné) et pages de saisie (génériques).
5. **États vides et chargement pauvres** : simple texte gris, pas d'appel à l'action.
6. **Accessibilité des champs** : `<label>` non liés aux `<input>` (`htmlFor`/`id` absents).
7. **Pas de confirmation avant suppression** (ex. `journal`, suppression immédiate).
8. **Action primaire non unique** par écran (accueil connecté).

> Cause racine n°1 des incohérences : absence de tokens de design centralisés.

---

## 4. Positionnement : outil SOLO vs apps partagées

Distinction structurante : OurFamilyWizard, 2houses, Coparently, AppClose sont des outils
**partagés** (les deux parents sont dans l'app). **Parent Preuve est un outil solo** : l'autre
parent n'y est pas. Conséquence : on n'adapte que les fonctions qui ont du sens pour un parent
seul constituant son dossier. On écarte toute la couche messagerie/appels entre parents.

---

## 5. Fonctionnalités candidates — usage quotidien (inspirées des concurrents)

À lire à travers le filtre « solo + factuel + pas de conseil juridique ».

- **Carnet d'informations (Info Bank solo)** : médecins, allergies, école, contacts
  d'urgence, tailles. Utile au quotidien, pas seulement en conflit.
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

## 6. Fonctionnalités candidates — gestion de conflit / JAF

Fondé sur l'attendu d'un dossier d'audience : charge de la preuve sur le demandeur, juge qui
lit vite (15–30 min) un dossier classé par thème, preuve libre mais licite.

### Faible risque (directement exploitable)
- **Chronologie unifiée exportable** : fusion `journal` + `frais` + `pension` + `preuves` en
  une frise datée, filtrable par thème.
- **Dossier d'audience thématique** : export classé par thème, chaque section avec son
  bordereau numéroté (réutilise le bordereau de la note de synthèse).
- **Marqueur « implication parentale »** : tag sur `documents` et `events`, exportable en
  section.
- **Lien fait ↔ clause du jugement** : rattacher un fait aux règles déjà extraites du
  dispositif (`dvh_regle`, `pension_regle`, …). Wording « écart constaté par rapport au
  dispositif », jamais « manquement » ni « faute ».

### À manier avec prudence (zone juridique sensible)
- **Modèle d'attestation de témoin (Cerfa 11527)** : l'app fournit le formulaire + un résumé
  factuel à transmettre au témoin. Le témoin rédige lui-même ; l'app ne génère jamais le
  témoignage.
- **Garde-fou « licéité de la preuve »** : rappel informatif neutre + renvoi vers un
  professionnel. Pas un conseil juridique.
- **Suivi des démarches engagées** (ARIPA, plainte, JEX) : journaliser ce que l'utilisateur
  décide de faire, sans jamais recommander quel levier activer.
- **Rappel du délai d'appel** (1 mois après notification) : information générale + renvoi
  avocat, sans suggérer s'il faut faire appel.

### Déconseillé
- Rédiger des conclusions ou un argumentaire juridique → bascule vers « assistant juridique »,
  terme interdit. La note de synthèse couvre déjà le bon périmètre.

---

## 7. Organisation & ergonomie — recommandations

1. Faire de la **procédure** le pivot, avec une vraie page « Mon dossier » répondant à
   « où j'en suis » (jugement → état réel → derniers faits).
2. Ajouter une **couche « thème » transversale** (Pension / Résidence-DVH / Autorité /
   Implication / Logement / Communication) commune à tous les modules → permet l'assemblage
   par onglet thématique. **Plus fort levier.**
3. Séparer la **configuration** (faite une fois) de l'**usage quotidien**.
4. Simplifier la navigation pour le 80/20 : bouton « + Ajouter » omniprésent (monter enfin
   `BoutonCaptureRapide.tsx`, actuellement non monté).
5. **Centraliser le design en tokens** (navy, or, crème, texte, sémantiques) → débloque
   l'homogénéité et facilite le futur passage React Native. **Socle technique.**
6. Soigner les moments de friction : états vides qui guident, confirmation de suppression,
   une seule action primaire par écran.
7. Penser mobile d'abord (cible finale native).

---

## 8. Arborescence cible

Pivot global : **sélecteur de procédure active** (existant, à garder ; cloisonne tout).

```
Parent Preuve
│
├─ [global] Sélecteur de procédure active ......... existant, à garder
│
├─ MON DOSSIER  (consulter — nouvelle page d'accueil)
│   ├─ Vue d'ensemble ........ NOUVEAU — remplace l'accueil actuel
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
    ├─ Socle (état civil) ......... /dossier
    ├─ Enfants .................... /enfants
    ├─ Mon compte ................. /compte
    └─ Légal ...................... /mentions-legales · /confidentialite
```

Trois changements par rapport à la `NavBar` actuelle :
- « Mon dossier » devient un espace de **consultation** ; la config part dans « Réglages ».
- « Suivi » + « Pièces & preuves » fusionnent dans « Saisir » (même geste : nourrir le dossier).
- Seules « Vue d'ensemble / Chronologie / Par thème » sont vraiment nouvelles.

Risque faible : ~90 % du chantier = réécriture de `GROUPES` dans `NavBar.tsx` + nouvelle page
d'accueil. Routes et logique métier quasi inchangées.

---

## 9. Famille Production — détail

État réel constaté dans le code :

- **Dossier d'audience — `/export`** : déjà cloisonné par procédure active, filtrable par
  période (`du`/`au`), totaux frais/pension (mêmes fonctions que l'accueil), bordereau de
  pièces, `ControleDossier`. Limite : PDF organisé **par table**, pas par thème.
  → Amélioration : mode d'assemblage **par thème** + chronologie unifiée en tête.
- **Courriers — `/courriers`** : 4 modèles actifs (relance pension, remboursement frais,
  non-représentation, info scolarité/santé), architecture extensible (`MODELES`).
  → Pistes : modèles « mise en demeure avant ARIPA » et « demande de modification
  d'organisation ». Vigilance vocabulaire : « manquement » acceptable dans un courrier signé
  par l'utilisateur, mais jamais dans ce que l'app conclut elle-même.
- **Note pour l'avocat — `/note-synthese`** : meilleur garde-fou de positionnement (matière
  factuelle, bordereau, brouillon, PDF ; pas d'argumentaire). Périmètre à préserver.
  → Amélioration : y attacher la chronologie et le lien fait ↔ clause.
- **Reformulation — `/reformuler`** : aide à l'écriture neutre via `/api/ia/reformuler`
  (Mistral, T 0.2). → Rapprocher du point de saisie (proposer la reformulation depuis le
  journal quand le garde-fou de neutralité détecte des termes peu factuels).

Chaîne logique : **alimenter** (Saisir) → **vérifier la neutralité** (Reformulation) →
**assembler** (Dossier d'audience) → **produire** un courrier (autre parent) ou une note (avocat).

---

## 10. Décisions, arbitrages ouverts, prochaines étapes

### Recommandations de priorité
- Plus fort impact / plus faible risque côté JAF : **chronologie unifiée** + **lien fait ↔
  clause**.
- Socle technique transverse : **tokens de design centralisés**.
- Chantier Production prioritaire : **assemblage par thème du dossier d'audience**.
- Réorganisation nav : faible risque, bon point de départ visible (réécriture de `GROUPES`).

### Arbitrages encore ouverts
- Valeur de crème unique à figer (`#F8F6F1` vs `#ECE7DC`).
- Ordre d'attaque entre : base UI (tokens), nouvelle fonctionnalité, ou réorganisation nav.

### Méthode de travail (rappel)
Une petite étape testable à la fois ; valider le plan avant d'écrire le code ; SQL → logique
pure → composant → page ; remplacement complet de fichier préféré aux patchs dispersés ;
go-ahead explicite entre chaque phase.
