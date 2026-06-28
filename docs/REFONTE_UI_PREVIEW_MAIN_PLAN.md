# Parent Preuve — Plan d’intégration refonte UI preview vers main

Date : 28 juin 2026  
Statut : plan de préparation avant merge.

---

## 1. Contexte

Une refonte UI existe actuellement sur la branche :

`preview/refonte-ui-appshell`

Elle correspond à la PR GitHub :

`Preview: refonte AppShell, thèmes et migration progressive UI`

Cette refonte n’est pas encore intégrée à `main`.

---

## 2. Pourquoi ne pas merger directement

La branche preview est ancienne par rapport aux derniers travaux réalisés sur `main`.

Depuis la création de la preview, `main` a reçu plusieurs blocs importants :

- collecte rapide ;
- brouillons locaux ;
- préremplissage depuis brouillons ;
- chronologie intelligente ;
- filtres de lecture ;
- brouillons visibles depuis la chronologie ;
- aperçu avant export ;
- sécurisation export vide ;
- guides Exporter ;
- checklist globale avant export.

La PR preview contient aussi un volume important de changements :

- AppShell ;
- thèmes ;
- pages d’aperçu ;
- composants UI ;
- captures d’écran ;
- scripts d’audit visuel ;
- modifications sur plusieurs pages existantes.

Un merge direct risquerait donc d’écraser ou de casser des évolutions récentes de `main`.

---

## 3. Objectif du chantier

L’objectif n’est pas de refaire la refonte UI.

L’objectif est de l’intégrer proprement dans `main` en conservant les fonctionnalités livrées après la preview.

La priorité est :

1. conserver les routes récentes ;
2. conserver la navigation Collecter / Organiser / Exporter ;
3. conserver les guides Exporter ;
4. conserver la chronologie intelligente ;
5. intégrer progressivement AppShell et les thèmes ;
6. éviter les régressions fonctionnelles.

---

## 4. Méthode recommandée

Créer une branche d’intégration depuis `main` :

`integration/refonte-ui-appshell-main`

Ne pas travailler directement sur `main`.

Comparer ensuite :

- `main`
- `preview/refonte-ui-appshell`

Analyser les conflits et changements par lots.

---

## 5. Lots d’intégration recommandés

### Lot 1 — Audit sans modification

Objectif :

- lister les fichiers modifiés par la preview ;
- identifier les fichiers aussi modifiés récemment sur `main` ;
- repérer les conflits probables ;
- vérifier la CI de `main` avant intégration.

Sortie attendue :

- liste des fichiers sûrs ;
- liste des fichiers à risque ;
- plan de merge.

---

### Lot 2 — Socle AppShell et thèmes

Objectif :

- intégrer les composants AppShell ;
- intégrer le ThemeProvider ;
- intégrer le sélecteur de thème ;
- intégrer les tokens CSS nécessaires.

À vérifier :

- layout global ;
- navigation desktop ;
- navigation mobile ;
- absence de débordement mobile ;
- contraste des thèmes.

---

### Lot 3 — Pages compatibles

Objectif :

- intégrer les pages ou sections UI qui ne touchent pas les nouveaux parcours Exporter ;
- éviter d’écraser les pages ajoutées récemment.

À surveiller :

- `/collecter`
- `/organiser`
- `/exporter`
- `/chronologie`
- `/collecter/rapide`
- `/organiser/brouillons`
- `/exporter/checklist`
- `/exporter/...`

---

### Lot 4 — Harmonisation progressive

Objectif :

- appliquer le style AppShell aux pages métier ;
- conserver les formulaires et logiques existantes ;
- ne pas modifier la base de données.

À vérifier :

- journal ;
- frais ;
- pension ;
- documents ;
- preuves ;
- calendrier ;
- compte.

---

### Lot 5 — Audit visuel final

Objectif :

- vérifier desktop et mobile ;
- contrôler les thèmes ;
- vérifier les routes principales ;
- confirmer que la CI est verte.

Routes minimales à vérifier :

- `/`
- `/collecter`
- `/collecter/rapide`
- `/organiser`
- `/organiser/brouillons`
- `/chronologie`
- `/exporter`
- `/exporter/checklist`
- `/exporter/chronologie`
- `/exporter/note-synthese`
- `/exporter/dossier-avocat`
- `/exporter/courriers`
- `/exporter/resume-mois`
- `/exporter/pdf`
- `/journal`
- `/frais`
- `/pension`
- `/documents`
- `/preuves`
- `/calendrier`
- `/compte`

---

## 6. Garde-fous

Pendant ce chantier :

- ne pas modifier Supabase sans validation explicite ;
- ne pas supprimer les routes récentes ;
- ne pas écraser la NavBar actuelle sans réintégrer les nouveaux liens ;
- ne pas casser les exports ;
- ne pas modifier la logique métier en même temps que l’UI ;
- ne pas merger si la CI n’est pas verte ;
- ne pas merger sans vérification mobile.

---

## 7. Décision produit

C’est maintenant le bon moment pour préparer la refonte UI vers `main`.

Mais la bonne méthode est une intégration contrôlée, pas un merge direct de la PR preview existante.
