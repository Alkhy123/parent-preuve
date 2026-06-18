# Parent Preuve — ROADMAP UX & produit (vision cible)

**Version :** roadmap unifiée (fusion de l'ancienne roadmap + de la roadmap enrichie + des pistes produit de l'audit)
**Date :** 18 juin 2026

> **Rôle de ce fichier.** La **vision produit / UX cible** : positionnement, idées de fonctionnalités,
> ergonomie, widgets, navigation, sprints. C'est du **prospectif** — ce qu'on pourrait construire et
> pourquoi.
>
> - L'**état réel daté** (ce qui existe déjà, schéma, dette, backlog) vit dans `PARENT_PREUVE_REFERENCE.md`.
> - Les **règles invariantes** (mission, droit, IA, modèle procédure, stack, méthode) vivent dans `PARENT_PREUVE_CONTEXTE.md`.
> - Les docs du site vitrine restent à part (`VITRINE_PARENT_PREUVE_BRIEF.md`, `prompt_claude_refonte_design_parent_preuve.md`).
>
> Tout ce qui suit passe par le filtre du socle : **outil solo + factuel + jamais de conseil juridique + « l'IA propose, l'utilisateur valide »**.

---

## 0. Comment lire ce fichier

1. **Ce fichier ne décrit que le futur.** Quand une brique existe déjà, je ne la re-décris pas comme
   une tâche : je renvoie vers `PARENT_PREUVE_REFERENCE.md` (§1 « état réel » et §4 « dette / sessions »).
2. **Le code réel fait foi.** En cas de doute entre cette vision et le dépôt, vérifier le code en live
   (`Alkhy123/parent-preuve`, branche `main`).
3. **Anti-fourre-tout.** La règle directrice est : *montrer la prochaine action utile dans le dossier*,
   pas *donner accès à tous les modules*. Voir §12.

---

# 1. Positionnement produit

## 1.1. Outil SOLO, pas app de coparentalité partagée

OurFamilyWizard, 2houses, Coparently, AppClose sont des outils **partagés** : les deux parents sont
dans l'app. **Parent Preuve est un outil solo** : l'autre parent n'y est pas. C'est un choix
stratégique fort.

Conséquences directes :

- pas de messagerie directe entre parents ;
- pas de modération d'échanges ;
- pas de discussion collaborative ;
- pas de promesse de médiation ;
- pas d'assistant juridique ;
- pas d'affirmation « votre preuve sera recevable ».

Parent Preuve sert au parent utilisateur à **constituer son dossier**, **classer les faits**,
**centraliser les pièces**, **suivre paiements/frais**, et **exporter un dossier clair**.

On reprend des concurrents leur **clarté** (accueil en cartes, navigation par familles, simplicité
mobile, peu de décisions par écran). On évite leur **ton léger** et leur **vocabulaire collaboratif** —
l'identité navy/or sérieuse est un atout pour un dossier qui peut finir chez un avocat ou un juge.

## 1.2. Formules de positionnement

Courte :

> **Parent Preuve : l'application française qui aide les parents séparés à transformer les faits du quotidien en dossier clair, daté et exportable.**

Produit :

> Parent Preuve permet à un parent séparé de centraliser faits, frais, pensions, preuves photo,
> documents, courriers et échéances dans un dossier structuré, factuel et exportable pour un avocat,
> un médiateur, un commissaire de justice ou un juge aux affaires familiales.

## 1.3. Ce qu'il faut éviter

- devenir une app fourre-tout ;
- multiplier les menus au même niveau ;
- afficher toutes les fonctionnalités dès l'accueil ;
- présenter LRE, ligne dédiée, IA, preuves photo, export, courriers, pension et frais comme des modules équivalents ;
- vocabulaire anxiogène ou agressif ;
- promettre une preuve irréfutable ou une recevabilité automatique ;
- laisser croire que l'app remplace un avocat ou un commissaire de justice.

## 1.4. Ton

Sobre, factuel, protecteur, professionnel, rassurant, orienté dossier.

À viser : « Classez les faits. Conservez vos éléments. Présentez un dossier clair. »
À bannir : « Piégez votre ex » ou « gagnez devant le juge ».

---

# 2. Boussole UX — trois gestes seulement

Toute l'application doit se ramener à trois gestes. C'est la grille de lecture de toute la navigation.

| Geste | Question utilisateur | Écrans liés |
|---|---|---|
| **Comprendre** | « Quelle est ma situation aujourd'hui ? » | Accueil, résumé du mois, échéances, état du dossier |
| **Ajouter** | « Qu'est-ce que je veux ajouter ? » | Fait, dépense, paiement, document, preuve photo, courrier |
| **Produire** | « Que dois-je produire à partir de mon dossier ? » | Export PDF, chronologie, note avocat, dossier d'audience, bordereau |

Navigation organisée autour des gestes, **pas** autour des tables techniques :

```text
Accueil / Mon dossier  → comprendre
+ Ajouter              → alimenter
Chronologie            → relire
Produire / Dossier     → exporter
Réglages               → configurer
```

---

# 3. Accueil = poste de pilotage (anti-fourre-tout)

> État réel : l'accueil monte déjà `TableauDeBord` (avec reste dû global) + `ProchainesEcheances` +
> cartes « Configuration du dossier » intelligentes. Détail dans REFERENCE §4. Le widget « À faire
> maintenant » ci-dessous, lui, **n'existe pas encore** : c'est la priorité n°1.

## 3.1. Cinq questions auxquelles l'accueil doit répondre

1. Ai-je une action urgente ?
2. Combien reste-t-il dû ?
3. Quelles preuves/pièces posent problème ?
4. Quelle est ma prochaine échéance ?
5. Mon dossier est-il prêt à exporter ?

## 3.2. Widget prioritaire — « À faire maintenant »

Le plus important. En haut de l'accueil, **avant** les statistiques. Il transforme les données en
actions concrètes. **3 à 4 éléments maximum.** Chaque élément : libellé clair + raison + action + lien direct.

```text
À faire maintenant
- 1 frais médical sans réponse depuis 12 jours.        [Voir les frais]
- La pension de juin semble payée partiellement.       [Voir la pension]
- 2 preuves photo doivent être horodatées de nouveau.  [Voir les preuves]
- 3 événements sont en brouillon.                       [Voir le journal]
```

Sources possibles : `preuves_photo.horodatage_statut = a_refaire` ; `events.statut = brouillon` ;
`expenses` sans pièce / non remboursées ; `pension_payments` avec solde positif ; logique de `ControleDossier`.

## 3.3. Types de widgets (classés par utilité, pas par décoration)

- **Alerte** : pension partielle/absente, frais sans réponse, preuve à refaire, brouillon, dossier incomplet.
- **État** : reste dû global, pension du mois, frais du mois, preuves scellées, nombre de faits.
- **Action rapide** : ajouter fait / dépense / paiement / photo / document.
- **Progression** : dossier prêt à exporter, pièces manquantes, jugement importé, socle/enfants renseignés.
- **Contexte** : prochaine garde, prochaine échéance pension, relance à prévoir, courrier récent.
- **Aide factuelle** : reformuler, transformer un ressenti en fait, détecter les mots émotionnels, rappel « pas de conseil juridique ».

## 3.4. Widgets prioritaires à développer

| Widget | Objectif | Réutilise |
|---|---|---|
| `WidgetActionsPrioritaires` | 3-4 actions les plus importantes | `ControleDossier`, lectures events/expenses/pension/preuves |
| `WidgetSituationMois` | situation pension du mois, compréhensible en < 5 s | logique de `resume-mois` (déjà en page) |
| `WidgetFraisEnAttente` | frais non remboursés / sans réponse | requête expenses |
| `WidgetPreuvesAReprendre` | preuves techniquement fragiles | `preuves_photo` |
| `WidgetDossierPret` | complétude du dossier | **`ControleDossier` (déjà existant)** |
| `WidgetDerniersFaits` | mini-chronologie | logique `Chronologie` (déjà multi-sources) |
| `WidgetAjouterRapide` | rendre l'ajout évident | complète `BoutonCaptureRapide` (déjà monté) |
| `WidgetConseilNeutralite` | aider à rester factuel, discret, jamais de conseil juridique | `/api/ia/reformuler` |

Exemples d'affichage :

```text
WidgetSituationMois          WidgetDossierPret
Juin 2026                    Dossier exportable
Pension due : 180 €          ✓ Déclarant renseigné
Payé : 96 €                  ✓ Enfant renseigné
Reste : 84 €                 ⚠ 2 frais sans justificatif
Statut : paiement partiel    ⚠ 1 preuve à reprendre
```

## 3.5. Hiérarchie de l'accueil cible

Bureau :

```text
1. Header : Mon dossier
2. Sélecteur procédure active
3. Widget À faire maintenant
4. Reste dû global
5. Situation du mois
6. Grille : Pension / Frais / Preuves / Dossier prêt
7. Mini chronologie
8. Raccourcis d'ajout
```

Mobile (vertical, simple, éviter les grilles complexes) :

```text
Mon dossier
[À faire maintenant]
[Reste dû global]
[Pension du mois]
[Frais en attente]
[Preuves à vérifier]
[Prochaine échéance]
[Ajouter rapidement]
```

**Règle de densité** — maximum sur l'accueil : 1 widget d'actions, 3 cartes financières/preuves,
1 widget échéance, 1 mini-chronologie, 1 bloc raccourcis. Au-delà : rendre repliable.

---

# 4. Navigation cible

## 4.1. ⭐ Règle : 5 menus visibles maximum

La barre de navigation visible ne dépasse jamais **5 familles** :

```text
Accueil | Ajouter | Chronologie | Dossier | Réglages
```

> État réel : la NavBar actuelle a déjà 4 familles par intention (Mon dossier / Saisir / Production /
> Réglages — REFERENCE §4). Le passage cible : « Saisir » → « Ajouter », « Production » → « Produire/Dossier ».

## 4.2. Navigation desktop cible

```text
Mon dossier   : Vue d'ensemble · Résumé du mois · Chronologie · Par thème
Ajouter       : Fait · Dépense · Paiement de pension · Document · Preuve photo · Courrier
Produire      : Dossier d'audience · Courriers · Note pour l'avocat · Export chronologie · Export ZIP (futur)
Réglages      : Procédure · Jugement · Enfants · Socle déclarant · Compte · Confidentialité
```

## 4.3. Navigation mobile cible

Barre basse, bouton `Ajouter` central et très visible :

```text
Accueil | Ajouter | Chronologie | Dossier | Réglages
```

## 4.4. Exposition progressive

Les options avancées apparaissent **au moment où elles sont utiles**, pas toutes à l'accueil :

- LRE : visible dans un courrier / une relance / une demande de remboursement.
- Ligne dédiée : dans Réglages → Options de preuve renforcée.
- Import jugement : dans le parcours de configuration.
- Export ZIP : dans l'écran Produire.
- Reformulation : depuis les zones de saisie, pas seulement comme module séparé.

## 4.5. ⚠️ Inventaire exhaustif des briques (ce n'est PAS la navigation visible)

L'arborescence ci-dessous liste **tout ce qui pourrait exister un jour**. Elle sert d'inventaire, pas
de barre de menus. La nav visible reste à 5 familles (§4.1). Ne jamais exposer ces 8 groupes au même niveau.

```text
Parent Preuve
├─ [Global] Sélecteur de procédure active
├─ ACCUEIL / MON DOSSIER   (vue d'ensemble, actions prioritaires, situation du mois, reste dû, échéances, dossier prêt, derniers éléments)
├─ AJOUTER                 (fait, dépense, paiement, document, preuve photo, courrier)
├─ CHRONOLOGIE             (tous éléments, filtres période/thème/type, export PDF, export CSV)
├─ DOSSIER                 (dossier d'audience, note avocat, bordereau, export PDF, export ZIP futur, contrôle dossier)
├─ ORGANISATION            (calendrier de garde, échéances, demandes de modification, check-in futur)
├─ PREUVES & DOCUMENTS     (documents, coffre-fort, preuves photo, vérification QR future, import preuves futur)
├─ COMMUNICATION           (courriers, reformulation, email suivi futur, LRE future, ligne dédiée future)
└─ RÉGLAGES                (procédure, jugement, enfants, socle déclarant, compte, confidentialité, options avancées)
```

---

# 5. Parcours utilisateur cible

## 5.1. Première connexion

Ne pas jeter l'utilisateur dans un tableau de bord vide. Aiguillage court :

1. Qui êtes-vous ? 2. Quel enfant ? 3. Décision de justice ? 4. Quoi suivre en priorité (pension /
frais / garde / preuves / documents / tout) ? 5. Importer un jugement maintenant ou plus tard ?

Résultat : l'accueil s'adapte aux priorités, les widgets inutiles restent masqués, les états vides
sont personnalisés.

## 5.2. Noter un fait

```text
+ Ajouter → Fait → Date / enfant / catégorie / description factuelle
→ Pièces optionnelles → Reformulation neutre proposée si besoin → Enregistrer
```

Règle : une seule action principale (Enregistrer). La reformulation est une aide, pas une étape obligatoire.

## 5.3. Pension payée en plusieurs fois

```text
+ Ajouter → Paiement de pension → Mois / Montant dû / Montant payé / Date / Pièce facultative → Enregistrer
```

Puis l'accueil affiche : Dû 180 € · Payé 96 € · Reste 84 € · Paiements 3.

## 5.4. Demander un remboursement

```text
+ Ajouter → Dépense → Montant total / Part de l'autre parent / Facture / Statut « à demander »
→ Action proposée : générer une demande (courrier simple → email suivi → LRE future → export dossier)
```

## 5.5. Préparer une audience

```text
Produire → Dossier d'audience → Période → Thèmes → Vérifier alertes → Générer PDF
```

Contenu : résumé, chronologie, pension, frais, faits, preuves, pièces, bordereau.

---

# 6. Couche « thème » transversale (gros levier — gros risque DB)

## 6.1. Pourquoi

Les données sont organisées par type technique (events, expenses, pension_payments, preuves_photo,
documents). Mais un avocat ou un juge lit **par thème**. Il faut donc qu'une même information puisse
être rattachée à un thème.

## 6.2. Thèmes proposés

```text
Pension · Frais · Résidence/DVH · Autorité parentale · Santé · École
Communication · Implication parentale · Logement · Sécurité · Autre
```

## 6.3. Usage

Dans : journal, frais, documents, preuves, courriers, chronologie, export, note avocat, dossier audience.

Exemple : un frais médical = type technique « dépense » + thème « santé » + obligation « frais médicaux
partagés » + pièce « facture » + statut « sans réponse ».

## 6.4. ⚠️ Risque technique — à cadrer avant de coder

Ajouter un champ `theme` touche **plusieurs tables protégées par RLS** + migrations + export. C'est le
chantier le plus risqué de cette roadmap (régression possible sur des données existantes). À faire
**après** l'accueil et la navigation, avec une migration dédiée et un test de non-régression. Ne jamais
commencer par là.

---

# 7. Fonctionnalités candidates

## 7.1. Usage quotidien

- **Carnet d'informations enfant** : école/classe/enseignant, médecin, allergies, traitements,
  contacts d'urgence, activités, taille/pointure, infos administratives. ⚠️ Contient des **données de
  santé** : marquer sensible, minimiser, suppression possible, **jamais envoyé à l'IA** sans action explicite.
- **Registre des demandes de modification de garde** (registre daté solo, pas de messagerie) : date,
  type (week-end/horaire/vacances/lieu/autre), canal (SMS/mail/oral/recommandé/autre), demande, réponse,
  statut (acceptée/refusée/sans réponse/en attente/annulée), date de réponse, pièce, conséquence pratique, commentaire factuel.
- **Check-in d'échange géolocalisé** : réutilise GPS + horodatage + SHA-256 du module preuve. Date
  serveur/appareil + écart, lat/long + précision, adresse approx., photo et commentaire optionnels.
  Rapport « **Relevé de présence horodaté** » — jamais « constat / certificat ».
- **Indexation automatique de la pension** : montant initial + date jugement + indice + date de
  revalorisation → montant revalorisé, tableau dû/payé/reste dû.
- **Calendrier enrichi** : zone scolaire A/B/C, vacances + jours fériés FR, **détection de conflits
  d'horaires**, rappels locaux, **export iCal lecture seule** (`.ics`).
- **Export CSV** (en plus du PDF) : événements, frais, pension, demandes, preuves, documents.
- **Rapprochement paiement ↔ dépense** + gestion d'une part variable.
- **Tags personnalisés, pièces favorites, filtres avancés** : enfant, procédure, période, catégorie,
  thème, statut, pièce liée, paiement complet/partiel/absent, preuve horodatée/à reprendre.

## 7.2. Conflit / JAF — faible risque, fort impact

- **Chronologie unifiée** (déjà multi-sources : journal, frais, pension, preuves). Améliorations
  restantes : filtres par thème, affichage plus lisible, lien vers les pièces, export identique à l'affichage.
- **Dossier d'audience thématique** : organisé par thème (Pension, Frais, Garde/DVH, Communication,
  Santé, École, Preuves photo, Pièces), pas seulement par tables.
- **Lien fait ↔ clause du jugement** : formulation « **écart constaté par rapport au dispositif** » —
  jamais « manquement fautif ».
- **Marqueur implication parentale** (déjà livré, cf. REFERENCE) : à intégrer dans journal, documents,
  export, synthèse, chronologie.

## 7.3. Renforcement probatoire

- **QR code de vérification** : token public non devinable par preuve. Page de vérification affichant
  seulement identifiant, empreinte SHA-256, date serveur, statut d'horodatage, type/taille de fichier,
  hash conforme ou non. **Ne jamais exposer** : photo originale, enfant, autre parent, adresse, document sensible.
- **Recalcul serveur du hash** : comparer hash à l'upload / recalculé serveur / fichier stocké.
  Statuts : conforme / non conforme / vérification impossible. Colonnes `empreinte_sha256_client`,
  `empreinte_sha256_serveur`, `hash_verifie`, `hash_verifie_at`. *(Cf. dette REFERENCE §4-5.)*
- **Journal d'audit append-only** : tracer création, modification, suppression, archivage, export,
  horodatage, vérification, téléchargement. L'utilisateur peut lire le journal mais pas le modifier.

  ```sql
  create table audit_log (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    procedure_id uuid references procedures(id) on delete cascade,
    objet_type text not null,
    objet_id uuid,
    action text not null,
    hash_avant text,
    hash_apres text,
    metadata jsonb,
    created_at timestamptz not null default now()
  );
  -- actions : creation, modification, archivage, suppression, export_pdf, export_zip, horodatage, verification_hash
  -- RLS : SELECT par l'utilisateur sur ses lignes ; aucun UPDATE/DELETE utilisateur (append-only).
  ```

- **Export avocat ZIP** : note de synthèse, chronologie, bordereau, pension, frais, preuves, documents,
  `manifest.json`, `hashes_sha256.txt`, avertissement données sensibles.

  ```json
  {
    "export_id": "uuid",
    "generated_at": "2026-06-17T10:00:00Z",
    "procedure_id": "uuid",
    "files": [
      { "path": "chronologie.pdf", "sha256": "...", "type": "application/pdf" }
    ]
  }
  ```

- **Horodatage eIDAS qualifié** : préparer le modèle de statuts
  `interne_non_qualifie / qualifie_en_attente / qualifie_valide / qualifie_echec`. Toujours distinguer
  horodatage interne / horodatage qualifié / constat de commissaire de justice.

## 7.4. À manier avec prudence

- **Attestation de témoin** : l'app peut fournir un formulaire Cerfa, un rappel neutre, un résumé
  factuel à transmettre. Elle ne rédige **jamais** le témoignage à la place du témoin.
- **Licéité de la preuve** : rappel informatif seulement. Ne pas dire « cette preuve est licite ».
  Dire : « la recevabilité et la licéité dépendent du contexte ; faites vérifier par un professionnel ».
- **Suivi ARIPA / plainte / JEX** : journaliser les démarches engagées par l'utilisateur, sans jamais recommander une procédure.

## 7.5. Déconseillé / explicitement écarté

Rédiger des conclusions juridiques · conseiller de saisir le JAF / porter plainte · affirmer une
recevabilité · calculer une stratégie judiciaire · enregistrer des appels à l'insu de l'autre parent ·
messagerie entre parents · assistant juridique automatisé.

---

# 8. Communication officielle (email suivi / LRE / ligne dédiée)

- **Email suivi** : option simple dans les courriers/demandes, pas un menu principal. Statuts : envoyé,
  accepté serveur, ouverture probable, clic détecté, erreur, rebond. Avertissement : « les statuts
  techniques ne prouvent pas une lecture effective ».
- **LRE** : parcours contextuel (frais sans réponse, pension impayée, relance, courrier important).
  Bouton « Envoyer en recommandé électronique ». Pas un gros module d'accueil.
- **Ligne dédiée** : phase avancée. Réglages → Options de preuve renforcée. Précautions : analyse
  juridique avant tout enregistrement audio, information claire, consentement/notification, RGPD renforcé.

---

# 9. Design system & composants

- **Tokens centralisés** (homogénéité, maintenance, préparation React Native/Expo).
- **Composants prioritaires** : `Card`, `Widget`, `AlertBox`, `EmptyState`, `PrimaryAction`,
  `SecondaryAction`, `StatusBadge`, `AmountCard`, `TimelineItem`, `ThemeBadge`, `DocumentLink`,
  `ActionList`, `ProgressChecklist`.
- **États vides utiles** sur chaque page. Mauvais : « Aucun élément ». Bon : « Aucun frais enregistré.
  Ajoutez une dépense lorsque vous avez payé un frais médical, scolaire ou exceptionnel à suivre. » + bouton.
- **Une action primaire par écran** : Frais → Ajouter une dépense ; Pension → Ajouter un paiement ;
  Preuves → Capturer une preuve ; Export → Générer le dossier ; Journal → Noter un fait ; Courriers → Créer un courrier.

---

# 10. Sprints recommandés (futur)

| Sprint | Objectif | Critère de succès |
|---|---|---|
| **1. Accueil cockpit** | Remplacer l'accueil par un poste de pilotage (créer `WidgetActionsPrioritaires`, brancher `ResumeMois`/`ProchainesEcheances` en widgets, `WidgetDossierPret` via `ControleDossier`, harmoniser les cartes) | En < 10 s, l'utilisateur comprend ce qui demande attention |
| **2. Navigation** | Simplifier autour de Accueil/Ajouter/Chronologie/Dossier/Réglages ; renommer « Production » → « Produire » ; sortir la config du parcours quotidien ; garder le `+` | Un nouvel utilisateur trouve où ajouter, voir, produire |
| **3. Couche thème** ⚠️ | Champ `theme` sur les objets principaux + migration + filtres + affichage chronologie + export par thème | Filtrer le dossier par Pension/Frais/Garde/Communication/Santé |
| **4. Dossier d'audience par thème** | `/export` propose un assemblage par thème (chronologie en tête, tableaux pension/frais, bordereau, contrôle dossier) | Le PDF se lit comme un dossier organisé, pas un tas de tables |
| **5. Saisie + reformulation contextuelle** | Rapprocher la reformulation du journal, détecter les formulations émotionnelles, proposer une version factuelle, validation utilisateur obligatoire | L'utilisateur est aidé à écrire factuellement sans qu'on parle à sa place |
| **6. Communication officielle** | Structurer les courriers, statuts d'envoi, table `courrier_envois`, préparer email/LRE, avertissements | Un courrier peut être généré, conservé, lié au dossier, envoyé par un canal choisi |
| **7. Ligne dédiée (après validation)** | Étude juridique → prototype isolé (journal d'appels sans audio d'abord), RGPD | La fonctionnalité ne met pas en risque juridique le produit principal |

> Le sprint « fiabilisation technique » (variable d'env, migrations, quota IA, suppression compte,
> recalcul hash) est suivi séparément dans REFERENCE §4 — plusieurs items y sont déjà résolus.

---

# 11. Mesures de réussite UX

**Qualitatif** (tests utilisateurs) : l'utilisateur comprend-il le but ? sait-il quoi faire en premier ?
trouve-t-il « Ajouter » ? distingue-t-il fait / document / preuve / frais / pension ? comprend-il que
l'app est factuelle et non juridique ? exporte-t-il sans aide ? l'accueil est-il rassurant ou anxiogène ?

**Quantitatif** :

```text
Ajouter un fait          : < 60 s
Ajouter une dépense      : < 90 s
Comprendre le reste dû   : < 10 s
Trouver l'export         : < 15 s
Menus principaux visibles: 5 max
Actions prioritaires accueil : 4 max
```

**Test simple** : donner l'app à quelqu'un qui ne connaît pas le projet — (1) ajoute un frais médical
de 45 €, (2) note un retard de remise, (3) ajoute un paiement partiel de pension, (4) trouve le reste
dû, (5) exporte un PDF. Si la personne bloque, c'est un problème UX, pas utilisateur.

---

# 12. Règles anti-fourre-tout

1. **Tout module répond à une question utilisateur** (Pension : combien dû ? Frais : quoi non remboursé ? etc.).
2. **Les options avancées apparaissent au bon moment** (pas de LRE / ligne dédiée / ZIP partout).
3. **L'accueil guide, il ne liste pas** (pas un menu bis).
4. **Une action principale par écran.** Toujours.
5. **L'IA reste contextuelle** (aide dans le journal, les courriers, la note, le classement — pas un gros module isolé).
6. **Vocabulaire factuel.** Préférer : élément, fait, statut, reste dû, sans réponse, pièce, chronologie,
   écart constaté, dossier. Éviter : faute, manquement automatique, preuve irréfutable, recevable,
   condamner, gagner, saisir le juge.

---

# 13. Prompt prêt à donner à Claude/Cursor

```text
Tu es développeur senior, product designer et expert UX. Je travaille sur Parent Preuve, une
application française solo pour parents séparés.

Objectif produit :
Aider un parent séparé à transformer faits, frais, pensions, preuves photo, documents, courriers et
échéances en dossier clair, daté, structuré et exportable.

Contraintes absolues :
- outil solo ; factuel ; jamais de conseil juridique ;
- l'IA propose, l'utilisateur valide ;
- pas de promesse de preuve irréfutable ni de recevabilité garantie ;
- RGPD et données sensibles respectés.

Problème actuel :
L'application devient riche mais risque de ressembler à un fourre-tout. Restructurer l'UX autour de
trois gestes : 1. Comprendre ; 2. Ajouter ; 3. Produire.

Priorité de développement :
1. Accueil cockpit avec widgets actionnables.
2. WidgetActionsPrioritaires.
3. Améliorer TableauDeBord.
4. ProchainesEcheances en widget compact.
5. Réutiliser ControleDossier pour un widget Dossier prêt.
6. Simplifier la navigation (Accueil / Ajouter / Chronologie / Dossier / Réglages).
7. Ajouter progressivement une couche theme transversale.
8. Export dossier par thème.

Ne commence pas par coder. Propose d'abord : les fichiers à modifier ; les composants à créer ;
l'ordre des tâches ; les risques ; les critères de validation.
```

---

# 14. Conclusion

La richesse de Parent Preuve est un avantage **seulement si elle est masquée derrière une expérience simple.**

Le bon objectif UX n'est pas « donner accès à toutes les fonctionnalités » mais
**« montrer à l'utilisateur la prochaine action utile dans son dossier »**.

Trajectoire : (1) simplifier l'accueil ; (2) rendre les actions prioritaires visibles ; (3) garder le
`+ Ajouter` comme geste central ; (4) cacher les options avancées tant qu'elles ne sont pas utiles ;
(5) organiser les exports par thème ; (6) rester factuel et juridiquement prudent.

Parent Preuve doit devenir un outil calme, guidant et structuré : un tableau de bord de dossier parental,
pas une accumulation de modules.