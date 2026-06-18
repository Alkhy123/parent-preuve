# Parent Preuve — ROADMAP UX & produit enrichie

**Version :** roadmap enrichie avec chapitre ergonomie, widgets et prévention de l'effet « fourre-tout »  
**Date :** 18 juin 2026  
**Objectif du fichier :** servir de vision produit / UX cible pour guider Claude, Cursor ou tout futur développement de Parent Preuve.

> Ce fichier reprend la logique de la roadmap existante et l'enrichit fortement sur la partie ergonomie, navigation, widgets et hiérarchie utilisateur.  
> Il reste prospectif : il décrit ce qu'il faut viser, pas forcément ce qui est déjà livré.  
> Tout ce qui suit passe par le filtre du socle : **outil solo + factuel + jamais de conseil juridique + l'IA propose, l'utilisateur valide**.

---

# 1. Positionnement structurant

## 1.1. Parent Preuve n'est pas une app de coparentalité classique

Les applications comme OurFamilyWizard, 2houses, Coparently ou AppClose sont généralement pensées comme des outils partagés : les deux parents sont invités à utiliser la même plateforme.

**Parent Preuve doit rester un outil solo.**

L'autre parent n'a pas besoin d'être dans l'application. C'est un choix stratégique fort.

Conséquence directe :

- pas de messagerie directe entre parents dans le MVP ;
- pas de modération d'échanges entre deux utilisateurs ;
- pas de discussion collaborative ;
- pas de promesse de médiation ;
- pas d'assistant juridique ;
- pas d'affirmation du type « votre preuve sera recevable ».

Parent Preuve sert au parent utilisateur à **constituer son dossier**, à **classer les faits**, à **centraliser les pièces**, à **suivre les paiements/frais**, et à **exporter un dossier clair**.

## 1.2. Positionnement recommandé

Formule courte :

> **Parent Preuve : l'application française qui aide les parents séparés à transformer les faits du quotidien en dossier clair, daté et exportable.**

Formule produit :

> Parent Preuve permet à un parent séparé de centraliser les faits, frais, pensions, preuves photo, documents, courriers et échéances dans un dossier structuré, factuel et exportable pour un avocat, un médiateur, un commissaire de justice ou un juge aux affaires familiales.

## 1.3. Ce que Parent Preuve doit éviter

À éviter absolument :

- devenir une app fourre-tout ;
- multiplier les menus au même niveau ;
- afficher toutes les fonctionnalités dès l'accueil ;
- présenter la LRE, la ligne dédiée, l'IA, les preuves photo, l'export, les courriers, la pension et les frais comme des modules équivalents ;
- utiliser un vocabulaire anxiogène ou agressif ;
- promettre une preuve irréfutable ;
- promettre une recevabilité automatique ;
- laisser croire que l'application remplace un avocat ou un commissaire de justice.

## 1.4. Ton recommandé

Ton sérieux doit être :

- sobre ;
- factuel ;
- protecteur ;
- professionnel ;
- rassurant ;
- orienté dossier.

Le ton à viser :

> « Classez les faits. Conservez vos éléments. Présentez un dossier clair. »

Et non :

> « Piégez votre ex » ou « gagnez devant le juge ».

---

# 2. Problème UX principal identifié

## 2.1. Risque actuel

L'application contient ou prévoit de nombreuses briques :

- journal de faits ;
- frais ;
- pension ;
- preuves photo ;
- documents ;
- coffre-fort ;
- courriers ;
- note pour l'avocat ;
- reformulation IA ;
- chronologie ;
- calendrier ;
- résumé du mois ;
- implication parentale ;
- export PDF ;
- import jugement ;
- analyse du jugement ;
- contrôle du dossier ;
- LRE ;
- ligne dédiée future ;
- email suivi futur ;
- QR de vérification futur ;
- export ZIP avocat futur.

Toutes ces fonctionnalités sont cohérentes individuellement, mais elles peuvent produire une sensation de complexité si elles sont présentées comme une liste de modules.

Le danger est que l'utilisateur se demande :

> « Je vais où ? Journal ? Frais ? Pension ? Preuves ? Documents ? Export ? Courriers ? Note avocat ? Reformulation ? »

Or un parent séparé en situation de conflit est souvent :

- stressé ;
- pressé ;
- émotionnellement chargé ;
- peu disponible mentalement ;
- concentré sur un problème concret ;
- à la recherche d'une action immédiate.

L'application doit donc répondre à une question prioritaire :

> **Qu'est-ce que je dois faire maintenant ?**

## 2.2. Diagnostic de l'existant

L'existant va déjà dans le bon sens :

- la navigation est déjà regroupée par familles : Mon dossier, Saisir, Production, Réglages ;
- le tableau de bord affiche déjà un reste dû global, les frais, la pension et les preuves ;
- le bouton de capture rapide existe et est monté globalement ;
- la chronologie fusionne déjà plusieurs sources : faits, frais, pension, preuves ;
- le contrôle du dossier vérifie déjà certains éléments avant export ;
- le résumé du mois synthétise frais, pension et faits ;
- le sélecteur de procédure active cloisonne les données.

Mais l'ergonomie peut encore progresser fortement.

Le produit doit passer d'une logique :

> « Voici tous les modules disponibles »

à une logique :

> **« Voici ce qui compte dans votre dossier aujourd'hui »**

---

# 3. Règle UX centrale : trois gestes seulement

Pour éviter l'effet fourre-tout, toute l'application doit être ramenée à trois gestes principaux.

## 3.1. Geste 1 — Comprendre

L'utilisateur veut savoir où il en est.

Écrans liés :

- Accueil / Mon dossier ;
- Résumé du mois ;
- Prochaines échéances ;
- Tableau de bord ;
- État du dossier ;
- Situation pension/frais/preuves.

Question utilisateur :

> « Quelle est ma situation aujourd'hui ? »

## 3.2. Geste 2 — Ajouter

L'utilisateur veut alimenter son dossier.

Écrans liés :

- Noter un fait ;
- Ajouter une dépense ;
- Ajouter un paiement de pension ;
- Ajouter un document ;
- Capturer une preuve photo ;
- Créer un courrier.

Question utilisateur :

> « Qu'est-ce que je veux ajouter comme élément ? »

## 3.3. Geste 3 — Produire

L'utilisateur veut transformer ses données en document utile.

Écrans liés :

- Export PDF ;
- Chronologie ;
- Note pour l'avocat ;
- Courriers ;
- Dossier d'audience ;
- Bordereau ;
- Export ZIP futur ;
- LRE future.

Question utilisateur :

> « Que dois-je produire à partir de mon dossier ? »

## 3.4. Conséquence sur la navigation

La navigation ne doit pas être organisée autour des tables techniques.

Elle doit être organisée autour de ces gestes :

```text
Accueil / Mon dossier     → comprendre
+ Ajouter                 → alimenter
Chronologie               → relire
Produire un dossier       → exporter
Réglages                  → configurer
```

---

# 4. Grand chapitre UX — éviter l'effet fourre-tout avec des widgets intelligents

## 4.1. Principe général

L'accueil ne doit pas être une vitrine de tous les modules.

L'accueil doit être un **poste de pilotage**.

Un bon accueil doit répondre immédiatement à cinq questions :

1. Ai-je une action urgente ?
2. Combien reste-t-il dû ?
3. Quelles preuves ou pièces posent problème ?
4. Quelle est ma prochaine échéance ?
5. Mon dossier est-il prêt à être exporté ?

L'utilisateur ne doit pas avoir à chercher l'information dans les menus.

## 4.2. Le widget prioritaire : « À faire maintenant »

C'est le widget le plus important.

Il doit apparaître en haut de l'accueil, avant les statistiques.

Objectif :

> Transformer les données en prochaines actions concrètes.

Exemples :

```text
À faire maintenant
- 1 frais médical est sans réponse depuis 12 jours.
- La pension de juin semble payée partiellement.
- 2 preuves photo doivent être horodatées de nouveau.
- Votre dossier contient 3 événements en brouillon.
```

Ce widget doit être limité à 3 ou 4 éléments maximum.

Chaque élément doit avoir :

- un libellé clair ;
- une raison ;
- une action ;
- un lien direct vers la page concernée.

Exemple :

```text
Frais sans justificatif
3 frais n'ont pas de pièce associée.
[Voir les frais]
```

## 4.3. Types de widgets recommandés

Les widgets doivent être classés par utilité, pas par décoration.

### A. Widgets d'alerte

Ils signalent un problème.

Exemples :

- pension partielle ;
- pension absente ;
- frais sans réponse ;
- preuve à refaire ;
- événement en brouillon ;
- dossier incomplet.

### B. Widgets d'état

Ils donnent une vue synthétique.

Exemples :

- reste dû global ;
- pension du mois ;
- frais du mois ;
- preuves scellées ;
- nombre de faits du mois.

### C. Widgets d'action rapide

Ils permettent de faire une saisie immédiate.

Exemples :

- ajouter un fait ;
- ajouter une dépense ;
- ajouter un paiement ;
- capturer une preuve ;
- ajouter un document.

### D. Widgets de progression

Ils montrent la qualité du dossier.

Exemples :

- dossier prêt à exporter ;
- pièces manquantes ;
- jugement importé ou non ;
- socle renseigné ou non ;
- enfants renseignés ou non.

### E. Widgets de contexte

Ils affichent ce qui approche.

Exemples :

- prochaine garde ;
- prochaine échéance pension ;
- relance à prévoir ;
- courrier généré récemment.

### F. Widgets d'aide factuelle

Ils aident à écrire correctement.

Exemples :

- reformuler une phrase ;
- transformer un ressenti en fait ;
- détecter les mots émotionnels ;
- rappeler que l'application ne donne pas de conseil juridique.

## 4.4. Widgets à développer en priorité

### Widget 1 — `WidgetActionsPrioritaires`

Objectif :

> Afficher les 3 actions les plus importantes.

Sources possibles :

- `preuves_photo` avec `horodatage_statut = a_refaire` ;
- `events` avec `statut = brouillon` ;
- `expenses` sans document lié ;
- `expenses` non remboursées ;
- `pension_payments` avec solde positif ;
- `ControleDossier`.

Exemples d'actions :

```text
- Compléter 2 événements en brouillon
- Ajouter un justificatif à 1 frais
- Vérifier 1 preuve photo à horodater
```

### Widget 2 — `WidgetSituationMois`

Objectif :

> Remplacer une partie du résumé du mois directement sur l'accueil.

Affichage recommandé :

```text
Juin 2026
Pension due : 180 €
Payé : 96 €
Reste : 84 €
Paiements reçus : 3
Statut : paiement partiel
```

Ce widget doit être compréhensible en moins de 5 secondes.

### Widget 3 — `WidgetFraisEnAttente`

Objectif :

> Afficher les frais non remboursés ou sans réponse.

Affichage recommandé :

```text
Frais en attente
- Ostéopathie : 45 €
- Pharmacie : 12,40 €
- Cantine : 36 €
```

Actions :

- voir les frais ;
- relancer ;
- générer un courrier ;
- envoyer en LRE plus tard.

### Widget 4 — `WidgetPreuvesAReprendre`

Objectif :

> Mettre en avant les preuves techniquement fragiles.

Affichage recommandé :

```text
Preuves à vérifier
2 preuves photo doivent être horodatées de nouveau.
```

Actions :

- voir les preuves ;
- refaire l'horodatage ;
- générer le rapport.

### Widget 5 — `WidgetDossierPret`

Objectif :

> Donner une vision de complétude.

Affichage recommandé :

```text
Dossier exportable
✓ Déclarant renseigné
✓ Enfant renseigné
⚠ 2 frais sans justificatif
⚠ 1 preuve à reprendre
```

Ce widget peut réutiliser la logique de `ControleDossier`.

### Widget 6 — `WidgetDerniersFaits`

Objectif :

> Afficher une mini-chronologie.

Affichage recommandé :

```text
Derniers éléments
- 16 juin : paiement pension 40 €
- 14 juin : frais médical 45 €
- 12 juin : fait noté — retard échange
```

Action :

- ouvrir la chronologie.

### Widget 7 — `WidgetAjouterRapide`

Objectif :

> Rendre l'ajout évident.

Affichage recommandé :

```text
Ajouter rapidement
+ Fait
+ Dépense
+ Paiement
+ Photo
+ Document
```

Ce widget complète le bouton flottant `+`.

### Widget 8 — `WidgetConseilNeutralite`

Objectif :

> Aider l'utilisateur à rester factuel.

Affichage recommandé :

```text
Conseil de rédaction
Préférez : « La pension due le 5 juin a été versée en 4 paiements. »
Évitez : « Il fait exprès de ne jamais payer. »
```

Ce widget doit rester discret et ne jamais donner de conseil juridique.

---

# 5. Hiérarchie de l'accueil cible

## 5.1. Structure recommandée

Accueil connecté cible :

```text
1. Header : Mon dossier
2. Sélecteur procédure active
3. Widget À faire maintenant
4. Reste dû global
5. Situation du mois
6. Grille de widgets :
   - Pension
   - Frais
   - Preuves
   - Dossier prêt
7. Mini chronologie
8. Raccourcis d'ajout
```

## 5.2. Version mobile

Sur mobile, l'ordre doit être vertical et très simple :

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

La page doit éviter les grilles complexes en mobile.

## 5.3. Règle de densité

Maximum recommandé sur l'accueil :

- 1 widget principal d'actions ;
- 3 cartes financières/preuves ;
- 1 widget échéance ;
- 1 mini-chronologie ;
- 1 bloc raccourcis.

Si plus de widgets sont nécessaires, les rendre repliables.

---

# 6. Navigation cible enrichie

## 6.1. Navigation actuelle à conserver en partie

La navigation actuelle est déjà organisée par groupes :

- Mon dossier ;
- Saisir ;
- Production ;
- Réglages.

C'est une bonne base.

Mais certains éléments doivent être hiérarchisés.

## 6.2. Navigation cible bureau

```text
Parent Preuve

Mon dossier
- Vue d'ensemble
- Résumé du mois
- Chronologie
- Par thème

Ajouter
- Fait
- Dépense
- Paiement de pension
- Document
- Preuve photo
- Courrier

Produire
- Dossier d'audience
- Courriers
- Note pour l'avocat
- Export chronologie
- Export ZIP avocat futur

Réglages
- Procédure
- Jugement
- Enfants
- Socle déclarant
- Compte
- Confidentialité
```

## 6.3. Navigation mobile cible

Sur mobile, privilégier une barre basse :

```text
Accueil | Ajouter | Chronologie | Dossier | Réglages
```

Le bouton `Ajouter` doit être central et très visible.

## 6.4. Règle d'exposition progressive

Ne pas afficher toutes les options avancées au même niveau.

Exemples :

- LRE visible uniquement dans un courrier, une relance ou une demande de remboursement.
- Ligne dédiée visible uniquement dans Réglages avancés / Preuve renforcée.
- Import jugement visible dans le parcours de configuration.
- Export ZIP visible dans l'écran Produire, pas dans l'accueil.
- Reformulation accessible depuis les zones de saisie, pas seulement comme module séparé.

---

# 7. Parcours utilisateur cible

## 7.1. Première connexion

Objectif :

> Ne pas jeter l'utilisateur dans un tableau de bord vide.

Parcours recommandé :

1. Qui êtes-vous ?
2. Quel enfant est concerné ?
3. Avez-vous une décision de justice ?
4. Que voulez-vous suivre en priorité ?
   - pension ;
   - frais ;
   - garde ;
   - preuves ;
   - documents ;
   - tout.
5. Voulez-vous importer un jugement maintenant ou plus tard ?

Résultat :

- l'accueil s'adapte aux priorités ;
- les widgets inutiles ne sont pas affichés tout de suite ;
- les états vides sont personnalisés.

## 7.2. Utilisateur qui veut noter un fait

Parcours :

```text
+ Ajouter
   ↓
Fait
   ↓
Date / enfant / catégorie / description factuelle
   ↓
Pièces optionnelles
   ↓
Reformulation neutre proposée si nécessaire
   ↓
Enregistrer
```

Règle :

- une seule action principale : Enregistrer le fait ;
- la reformulation est une aide, pas une étape obligatoire.

## 7.3. Utilisateur qui veut suivre une pension payée en plusieurs fois

Parcours :

```text
+ Ajouter
   ↓
Paiement de pension
   ↓
Mois concerné
   ↓
Montant dû
   ↓
Montant payé
   ↓
Date du paiement
   ↓
Pièce facultative
   ↓
Enregistrer
```

Puis l'accueil affiche :

```text
Pension de juin
Dû : 180 €
Payé : 96 €
Reste : 84 €
Paiements : 3
```

## 7.4. Utilisateur qui veut demander un remboursement

Parcours :

```text
+ Ajouter
   ↓
Dépense
   ↓
Montant total
   ↓
Part de l'autre parent
   ↓
Facture
   ↓
Statut : à demander
   ↓
Action proposée : générer une demande
```

Puis :

- courrier simple ;
- email suivi ;
- LRE future ;
- export dans dossier.

## 7.5. Utilisateur qui prépare une audience

Parcours :

```text
Produire
   ↓
Dossier d'audience
   ↓
Choisir période
   ↓
Choisir thèmes
   ↓
Vérifier les alertes
   ↓
Générer PDF
```

Le dossier doit inclure :

- résumé ;
- chronologie ;
- pension ;
- frais ;
- faits ;
- preuves ;
- pièces ;
- bordereau.

---

# 8. Couche « thème » transversale

## 8.1. Pourquoi c'est essentiel

La couche « thème » est probablement le plus fort levier produit.

Aujourd'hui, les données sont souvent organisées par type technique :

- events ;
- expenses ;
- pension_payments ;
- preuves_photo ;
- documents.

Mais un avocat ou un juge lit plutôt par thème :

- pension ;
- frais ;
- garde ;
- résidence ;
- communication ;
- santé ;
- école ;
- implication ;
- autorité parentale ;
- sécurité.

Il faut donc permettre à une même information d'être rattachée à un thème.

## 8.2. Thèmes proposés

```text
Pension
Frais
Résidence / DVH
Autorité parentale
Santé
École
Communication
Implication parentale
Logement
Sécurité
Autre
```

## 8.3. Utilisation des thèmes

Les thèmes doivent être utilisés dans :

- le journal ;
- les frais ;
- les documents ;
- les preuves ;
- les courriers ;
- la chronologie ;
- l'export ;
- la note avocat ;
- le dossier audience.

## 8.4. Exemple

Un frais médical peut être :

- type technique : dépense ;
- thème : santé ;
- obligation liée : frais médicaux partagés ;
- pièce : facture ;
- statut : sans réponse.

Un retard de remise d'enfant peut être :

- type technique : fait ;
- thème : résidence / DVH ;
- obligation liée : horaire de remise ;
- pièce : photo / message ;
- statut : factuel.

---

# 9. Fonctionnalités candidates — usage quotidien

## 9.1. Carnet d'informations enfant

Fonction solo utile au quotidien.

Champs possibles :

- école ;
- classe ;
- enseignant ;
- médecin ;
- allergies ;
- traitements ;
- contacts d'urgence ;
- activités ;
- taille ;
- pointure ;
- informations administratives.

Attention :

- données de santé ;
- minimisation ;
- suppression possible ;
- pas d'envoi à l'IA sans action explicite.

## 9.2. Registre des demandes de modification de garde

Champs :

- date ;
- type : week-end, horaire, vacances, lieu, autre ;
- canal : SMS, mail, oral, recommandé, autre ;
- demande formulée ;
- réponse ;
- statut ;
- date de réponse ;
- pièce liée ;
- conséquence pratique ;
- commentaire factuel.

Statuts :

- acceptée ;
- refusée ;
- sans réponse ;
- en attente ;
- annulée.

## 9.3. Check-in d'échange géolocalisé

Fonction à manier avec prudence mais utile.

Champs :

- date serveur ;
- date appareil ;
- écart ;
- latitude ;
- longitude ;
- précision ;
- adresse approximative ;
- photo optionnelle ;
- commentaire factuel.

Formulation :

> Relevé de présence horodaté

À éviter :

> Constat certifié

## 9.4. Indexation automatique de la pension

Champs :

- montant initial ;
- date du jugement ;
- indice ;
- date de revalorisation ;
- montant revalorisé ;
- tableau dû/payé/reste dû.

## 9.5. Calendrier enrichi

Fonctions :

- zone scolaire A/B/C ;
- vacances scolaires ;
- jours fériés ;
- détection de conflits horaires ;
- rappels locaux ;
- export iCal en lecture seule.

## 9.6. Export CSV

À ajouter en complément du PDF pour :

- événements ;
- frais ;
- pension ;
- demandes ;
- preuves ;
- documents.

## 9.7. Rapprochement paiement/dépense

Permettre de lier :

- un remboursement ;
- une dépense ;
- un paiement partiel ;
- un solde restant dû.

## 9.8. Tags personnalisés et filtres avancés

Filtres :

- enfant ;
- procédure ;
- période ;
- catégorie ;
- thème ;
- statut ;
- pièce liée ;
- paiement complet ;
- paiement partiel ;
- absence de paiement ;
- preuve horodatée ;
- preuve à reprendre.

---

# 10. Fonctionnalités candidates — conflit / JAF

## 10.1. Faible risque et fort impact

### Chronologie unifiée

Déjà très importante.

Sources :

- journal ;
- frais ;
- pension ;
- preuves.

Amélioration restante :

- filtres par thème ;
- affichage plus lisible ;
- lien vers les pièces ;
- export identique à l'affichage.

### Dossier d'audience thématique

Le dossier ne doit pas seulement être organisé par tables.

Il doit pouvoir être organisé par thème :

```text
1. Pension
2. Frais
3. Garde / DVH
4. Communication
5. Santé
6. École
7. Preuves photo
8. Pièces
```

### Lien fait ↔ clause du jugement

Formulation correcte :

> Écart constaté par rapport au dispositif.

À éviter :

> Manquement fautif.

### Marqueur implication parentale

Déjà utile.

À intégrer dans :

- journal ;
- documents ;
- export ;
- synthèse ;
- chronologie.

## 10.2. Renforcement probatoire

### QR code de vérification

Chaque preuve pourrait avoir un token public non devinable.

Page de vérification affichant seulement :

- identifiant ;
- empreinte SHA-256 ;
- date serveur ;
- statut d'horodatage ;
- type de fichier ;
- taille ;
- hash conforme ou non.

Ne jamais exposer :

- photo originale ;
- enfant ;
- autre parent ;
- adresse ;
- document sensible.

### Recalcul serveur du hash

Comparer :

- hash calculé à l'upload ;
- hash recalculé côté serveur ;
- hash du fichier stocké.

Statuts :

- conforme ;
- non conforme ;
- vérification impossible.

### Journal d'audit append-only

Tracer :

- création ;
- modification ;
- suppression ;
- archivage ;
- export ;
- horodatage ;
- vérification ;
- téléchargement.

L'utilisateur peut lire le journal mais ne peut pas le modifier.

### Export avocat ZIP

Contenu :

- note de synthèse ;
- chronologie ;
- bordereau ;
- pension ;
- frais ;
- preuves ;
- documents ;
- manifest.json ;
- hashes_sha256.txt ;
- avertissement données sensibles.

### Horodatage eIDAS qualifié

Préparer le modèle :

```text
interne_non_qualifie
qualifie_en_attente
qualifie_valide
qualifie_echec
```

Toujours distinguer clairement :

- horodatage interne ;
- horodatage qualifié ;
- constat de commissaire de justice.

## 10.3. À manier avec prudence

### Attestation de témoin

L'application peut fournir :

- formulaire Cerfa ;
- rappel neutre ;
- résumé factuel à transmettre.

Mais elle ne doit jamais rédiger le témoignage à la place du témoin.

### Licéité de la preuve

L'application peut afficher un rappel informatif.

Elle ne doit pas dire :

> Cette preuve est licite.

Elle doit dire :

> La recevabilité et la licéité d'une preuve dépendent du contexte. Faites vérifier votre situation par un professionnel.

### Suivi ARIPA, plainte, JEX

L'application peut journaliser les démarches engagées par l'utilisateur.

Elle ne doit pas recommander une procédure.

## 10.4. Déconseillé

À éviter :

- rédiger des conclusions juridiques ;
- conseiller de saisir le JAF ;
- conseiller de porter plainte ;
- dire qu'une preuve sera recevable ;
- calculer automatiquement une stratégie judiciaire ;
- enregistrer des appels à l'insu de l'autre parent.

---

# 11. LRE, email suivi et ligne dédiée — place dans l'UX

## 11.1. Email suivi

À intégrer comme option simple dans les courriers ou demandes.

Ne pas en faire un menu principal.

Formulation :

> Envoyer par email suivi

Statuts affichés :

- envoyé ;
- accepté par le serveur ;
- ouverture probable ;
- clic détecté ;
- erreur ;
- rebond.

Avertissement :

> Les statuts techniques ne prouvent pas nécessairement une lecture effective.

## 11.2. LRE

À intégrer dans un parcours contextuel.

Exemples :

- frais sans réponse ;
- pension impayée ;
- relance ;
- courrier important.

Bouton :

> Envoyer en recommandé électronique

Ne pas afficher LRE comme gros module dès l'accueil.

Elle doit apparaître au moment où elle est utile.

## 11.3. Ligne dédiée

À classer en phase avancée.

Ne pas l'intégrer dans la navigation principale du MVP.

Emplacement recommandé :

```text
Réglages
   → Options de preuve renforcée
      → Ligne parentale dédiée
```

Ou :

```text
Premium
   → Canal parental sécurisé
```

Précaution :

- analyse juridique avant enregistrement audio ;
- information claire ;
- consentement ou notification ;
- RGPD renforcé.

---

# 12. Design system et composants

## 12.1. Principe

Centraliser le design en tokens.

Objectifs :

- homogénéité ;
- simplicité ;
- meilleure maintenance ;
- préparation React Native / Expo ;
- réduction des styles dispersés.

## 12.2. Composants UI prioritaires

Créer ou stabiliser :

```text
Card
Widget
AlertBox
EmptyState
PrimaryAction
SecondaryAction
StatusBadge
AmountCard
TimelineItem
ThemeBadge
DocumentLink
ActionList
ProgressChecklist
```

## 12.3. États vides

Chaque page doit avoir un état vide utile.

Mauvais état vide :

> Aucun élément.

Bon état vide :

> Aucun frais enregistré. Ajoutez une dépense lorsque vous avez payé un frais médical, scolaire ou exceptionnel que vous souhaitez suivre.

Avec bouton :

> Ajouter une dépense

## 12.4. Une action primaire par écran

Exemples :

- Page frais : Ajouter une dépense ;
- Page pension : Ajouter un paiement ;
- Page preuves : Capturer une preuve ;
- Page export : Générer le dossier ;
- Page journal : Noter un fait ;
- Page courriers : Créer un courrier.

---

# 13. Arborescence cible enrichie

```text
Parent Preuve
│
├─ [Global] Sélecteur de procédure active
│
├─ ACCUEIL / MON DOSSIER
│  ├─ Vue d'ensemble
│  ├─ Actions prioritaires
│  ├─ Situation du mois
│  ├─ Reste dû global
│  ├─ Prochaines échéances
│  ├─ Dossier prêt ?
│  └─ Derniers éléments
│
├─ AJOUTER
│  ├─ Noter un fait
│  ├─ Ajouter une dépense
│  ├─ Ajouter un paiement de pension
│  ├─ Ajouter un document
│  ├─ Capturer une preuve photo
│  └─ Créer un courrier
│
├─ CHRONOLOGIE
│  ├─ Tous les éléments
│  ├─ Filtres par période
│  ├─ Filtres par thème
│  ├─ Filtres par type
│  ├─ Export PDF
│  └─ Export CSV
│
├─ DOSSIER
│  ├─ Dossier d'audience
│  ├─ Note pour l'avocat
│  ├─ Bordereau de pièces
│  ├─ Export PDF
│  ├─ Export ZIP avocat futur
│  └─ Contrôle du dossier
│
├─ ORGANISATION
│  ├─ Calendrier de garde
│  ├─ Échéances
│  ├─ Demandes de modification
│  └─ Check-in d'échange futur
│
├─ PREUVES & DOCUMENTS
│  ├─ Documents
│  ├─ Coffre-fort
│  ├─ Preuves photo
│  ├─ Vérification QR future
│  └─ Import de preuves existantes futur
│
├─ COMMUNICATION
│  ├─ Courriers
│  ├─ Reformulation
│  ├─ Email suivi futur
│  ├─ LRE future
│  └─ Ligne dédiée future
│
└─ RÉGLAGES
   ├─ Procédure
   ├─ Jugement
   ├─ Enfants
   ├─ Socle déclarant
   ├─ Compte
   ├─ Confidentialité
   └─ Options avancées
```

Remarque :

- Cette arborescence est une vision cible.
- Pour le MVP, ne pas tout afficher.
- La navigation visible doit rester simple.

---

# 14. Priorités et sprints recommandés

## Sprint 1 — Refonte accueil sans toucher aux modules

Objectif :

> Remplacer l'accueil actuel par un vrai poste de pilotage.

Tâches :

- créer `WidgetActionsPrioritaires` ;
- améliorer `TableauDeBord` ;
- intégrer `ResumeMois` sur l'accueil ou en widget ;
- intégrer `ProchainesEcheances` en widget compact ;
- ajouter `WidgetDossierPret` basé sur `ControleDossier` ;
- harmoniser les cartes.

Critère de succès :

> En arrivant sur l'accueil, l'utilisateur comprend en moins de 10 secondes ce qui demande attention.

## Sprint 2 — Simplification navigation

Objectif :

> Réduire la sensation de complexité.

Tâches :

- renommer « Production » en « Produire » ou « Dossier » ;
- regrouper les actions quotidiennes sous `Ajouter` ;
- déplacer la configuration hors du parcours quotidien ;
- vérifier mobile ;
- garder le bouton `+` visible et utile.

Critère de succès :

> Un nouvel utilisateur comprend où ajouter un fait, où voir sa situation, et où produire un dossier.

## Sprint 3 — Couche thème transversale

Objectif :

> Passer d'une logique table à une logique dossier.

Tâches :

- ajouter un champ `theme` aux principaux objets ;
- migrer les catégories existantes ;
- ajouter filtres par thème ;
- afficher les thèmes dans la chronologie ;
- préparer export par thème.

Critère de succès :

> L'utilisateur peut filtrer son dossier par Pension, Frais, Garde, Communication, Santé, etc.

## Sprint 4 — Dossier d'audience par thème

Objectif :

> Produire un export plus lisible pour avocat/JAF.

Tâches :

- modifier `/export` pour proposer un assemblage par thème ;
- intégrer chronologie en tête ;
- intégrer tableaux pension/frais ;
- intégrer bordereau ;
- intégrer contrôle dossier ;
- garder un vocabulaire factuel.

Critère de succès :

> Le PDF exporté se lit comme un dossier organisé, pas comme un assemblage de tables.

## Sprint 5 — Amélioration saisie et reformulation contextuelle

Objectif :

> Aider l'utilisateur au moment où il saisit.

Tâches :

- rapprocher la reformulation du journal ;
- détecter les formulations émotionnelles ;
- proposer une version factuelle ;
- garder validation utilisateur obligatoire ;
- ajouter des exemples.

Critère de succès :

> L'utilisateur est aidé à écrire factuellement sans que l'application parle à sa place.

## Sprint 6 — Communication officielle

Objectif :

> Préparer email suivi et LRE.

Tâches :

- structurer les courriers ;
- ajouter statuts d'envoi ;
- prévoir table `courrier_envois` ;
- préparer intégration email ;
- préparer intégration LRE ;
- ajouter avertissements juridiques.

Critère de succès :

> Un courrier peut être généré, conservé, lié au dossier, puis envoyé par un canal choisi.

## Sprint 7 — Ligne dédiée uniquement après validation

Objectif :

> Étudier puis prototyper une option avancée.

Tâches :

- étude juridique ;
- choix prestataire télécom ;
- stockage SMS ;
- journal d'appels sans audio dans un premier temps ;
- information utilisateur ;
- analyse RGPD ;
- prototype isolé.

Critère de succès :

> La fonctionnalité ne met pas en risque juridique le produit principal.

---

# 15. Mesures de réussite UX

## 15.1. Indicateurs qualitatifs

Pendant les tests utilisateurs, vérifier :

- l'utilisateur comprend-il le but de l'application ?
- sait-il quoi faire en premier ?
- trouve-t-il le bouton ajouter ?
- comprend-il la différence entre fait, document, preuve, frais et pension ?
- comprend-il que l'application est factuelle et non juridique ?
- arrive-t-il à exporter un dossier sans aide ?
- trouve-t-il l'accueil rassurant ou anxiogène ?

## 15.2. Indicateurs quantitatifs

Objectifs mesurables :

```text
Temps pour ajouter un fait : moins de 60 secondes
Temps pour ajouter une dépense : moins de 90 secondes
Temps pour comprendre le reste dû : moins de 10 secondes
Temps pour trouver l'export : moins de 15 secondes
Nombre de menus principaux visibles : 5 maximum
Nombre d'actions prioritaires sur l'accueil : 4 maximum
```

## 15.3. Test simple à faire

Donner l'application à une personne qui ne connaît pas le projet et lui demander :

1. Ajoute un frais médical de 45 €.
2. Note un retard de remise de l'enfant.
3. Ajoute un paiement partiel de pension.
4. Trouve combien il reste dû.
5. Exporte un dossier PDF.

Si la personne bloque, ce n'est pas un problème utilisateur : c'est un problème UX.

---

# 16. Règles anti-fourre-tout

## Règle 1 — Tout module doit répondre à une question utilisateur

Exemples :

- Pension : combien est dû ?
- Frais : qu'est-ce qui n'a pas été remboursé ?
- Preuves : qu'est-ce qui est conservé ?
- Chronologie : que s'est-il passé ?
- Export : que puis-je produire ?
- LRE : comment envoyer officiellement ?
- Ligne dédiée : comment centraliser les échanges ?

## Règle 2 — Les options avancées apparaissent au bon moment

Ne pas afficher la LRE, la ligne dédiée ou l'export ZIP partout.

## Règle 3 — L'accueil ne doit pas être un menu bis

L'accueil doit guider, pas lister.

## Règle 4 — Une action principale par écran

Toujours.

## Règle 5 — L'IA reste contextuelle

L'IA ne doit pas être un gros module séparé uniquement.

Elle doit aider :

- dans le journal ;
- dans les courriers ;
- dans la note ;
- dans le classement.

## Règle 6 — Le vocabulaire reste factuel

À préférer :

- élément ;
- fait ;
- statut ;
- reste dû ;
- sans réponse ;
- pièce ;
- chronologie ;
- écart constaté ;
- dossier.

À éviter :

- faute ;
- manquement automatique ;
- preuve irréfutable ;
- recevable ;
- condamner ;
- gagner ;
- saisir le juge.

---

# 17. Roadmap finale synthétique

## Priorité absolue

1. Accueil orienté widgets.
2. Bouton `+ Ajouter` omniprésent et utile.
3. Navigation simplifiée.
4. Couche thème transversale.
5. Export dossier par thème.

## Priorité forte

6. Contrôle du dossier plus visible.
7. Reformulation contextuelle.
8. États vides guidants.
9. Filtres avancés.
10. Export CSV/ZIP.

## Priorité premium

11. Email suivi.
12. LRE.
13. QR de vérification.
14. Horodatage qualifié.
15. Ligne dédiée.

## À repousser

16. Messagerie entre parents.
17. Enregistrement d'appels sans cadre clair.
18. Assistant juridique.
19. Conclusions automatiques.
20. Conseils procéduraux personnalisés.

---

# 18. Prompt à transmettre à Claude/Cursor

```text
Tu es développeur senior, product designer et expert UX. Je travaille sur Parent Preuve, une application française solo pour parents séparés.

Objectif produit :
Aider un parent séparé à transformer les faits, frais, pensions, preuves photo, documents, courriers et échéances en dossier clair, daté, structuré et exportable.

Contraintes absolues :
- outil solo ;
- factuel ;
- jamais de conseil juridique ;
- l'IA propose, l'utilisateur valide ;
- pas de promesse de preuve irréfutable ;
- pas de recevabilité garantie ;
- RGPD et données sensibles à respecter.

Problème actuel :
L'application devient riche mais risque de ressembler à un fourre-tout. Je veux restructurer l'UX autour de trois gestes :
1. Comprendre ;
2. Ajouter ;
3. Produire.

Mission :
M'aider à implémenter une refonte UX progressive sans casser la logique métier existante.

Priorité de développement :
1. Créer un accueil cockpit avec widgets actionnables.
2. Ajouter WidgetActionsPrioritaires.
3. Améliorer TableauDeBord.
4. Transformer ProchainesEcheances en widget compact.
5. Réutiliser ControleDossier pour un widget Dossier prêt.
6. Simplifier la navigation autour de Accueil / Ajouter / Chronologie / Dossier / Réglages.
7. Ajouter progressivement une couche theme transversale.
8. Préparer un export dossier par thème.

Ne commence pas par coder. Propose d'abord :
- les fichiers à modifier ;
- les composants à créer ;
- l'ordre des tâches ;
- les risques ;
- les critères de validation.
```

---

# 19. Conclusion

La richesse de Parent Preuve est un avantage, mais seulement si elle est masquée derrière une expérience simple.

Le bon objectif UX n'est pas :

> « Donner accès à toutes les fonctionnalités. »

Le bon objectif UX est :

> **« Montrer à l'utilisateur la prochaine action utile dans son dossier. »**

Si cette règle est respectée, Parent Preuve peut rester très complet sans devenir confus.

La meilleure trajectoire est donc :

1. simplifier l'accueil ;
2. rendre les actions prioritaires visibles ;
3. garder le bouton `+ Ajouter` comme geste central ;
4. cacher les options avancées tant qu'elles ne sont pas utiles ;
5. organiser les exports par thème ;
6. toujours rester factuel et juridiquement prudent.

Parent Preuve doit devenir un outil calme, guidant et structuré : un tableau de bord de dossier parental, pas une accumulation de modules.
