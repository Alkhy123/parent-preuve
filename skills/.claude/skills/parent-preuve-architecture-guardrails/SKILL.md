---
name: parent-preuve-architecture-guardrails
description: À utiliser pour empêcher Claude de casser l’architecture existante de Parent Preuve ou de proposer des refactors inutiles.
---

# Parent Preuve Architecture Guardrails

## Objectif

Garder une architecture cohérente, simple et stable.

Parent Preuve est déjà structuré autour de :

- Next.js 16 App Router
- Supabase
- routes serveur
- composants réutilisables
- fonctions pures dans `src/lib`
- tables règles séparées
- validation humaine des sorties IA

## Règles d’architecture

### Réutiliser avant créer

Avant de créer un nouveau composant, vérifier si on peut réutiliser :

- `PageHeader`
- `EncartPliable`
- `ConsentementIA`
- `StatutConsentementIA`
- `ReglePension`
- `RegleFrais`
- `RegleDVH`
- `RegleDecision`
- `ControleDossier`
- `TableauDeBord`

### Fonctions métier

Les calculs doivent aller dans `src/lib`.

Éviter :

- calculs dans les pages
- calculs dans les composants UI
- duplication d’une fonction existante

### Routes serveur

Créer une route serveur si :

- secret API
- IA
- horodatage
- parsing PDF
- logique sensible

Ne pas mettre côté client :

- clé Mistral
- secret horodatage
- service role Supabase
- parsing sensible inutile
- logique de sécurité

### Tables Supabase

Ne pas créer une table si :

- une table existante couvre déjà le besoin
- le besoin est seulement un champ manquant
- le besoin est temporaire

### IA

Ne pas utiliser l’IA pour :

- un calcul déterministe
- un formatage simple
- une règle déjà saisie
- une validation qui doit rester humaine

### Mobile futur

Éviter d’enfermer la logique dans le web.

Prévoir que certaines fonctions devront aller vers mobile/PWA :

- caméra
- GPS
- notifications
- preuves
- stockage local
- upload

## Règle de modification

Pour une tâche :

- une brique principale
- peu de fichiers
- test clair
- pas de refactor global

## Checklist architecture

Avant de proposer une solution :

- Ai-je réutilisé l’existant ?
- Ai-je évité une nouvelle dépendance inutile ?
- Ai-je gardé la logique métier dans `src/lib` ?
- Ai-je gardé les secrets côté serveur ?
- Ai-je évité un refactor massif ?
- Ai-je pensé au futur mobile ?
