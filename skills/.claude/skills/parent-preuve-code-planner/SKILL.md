---
name: parent-preuve-code-planner
description: À utiliser avant de coder une fonctionnalité Parent Preuve pour transformer une idée en plan de développement court, sûr et étape par étape.
---

# Parent Preuve Code Planner

## Objectif

Transformer une demande produit en plan de développement clair, minimal et efficace.

À utiliser avant de demander à Claude de générer beaucoup de code.

## Format de plan obligatoire

Répondre avec :

```text
Objectif :
Brique concernée :
Fichiers probablement concernés :
Étape 1 :
Étape 2 :
Étape 3 :
Tests :
Risques :
```

## Règles

- Ne pas coder immédiatement si l’architecture n’est pas claire.
- Ne pas proposer un refactor massif.
- Ne pas créer de nouvelle table sans vérifier l’existant.
- Ne pas créer une nouvelle route si une route existante peut être étendue proprement.
- Ne pas modifier plusieurs briques à la fois si une seule suffit.

## Questions à se poser

Avant de planifier :

1. La fonctionnalité existe-t-elle déjà partiellement ?
2. Peut-on réutiliser un composant existant ?
3. Y a-t-il une table Supabase existante ?
4. L’IA est-elle nécessaire ou un calcul déterministe suffit-il ?
5. Y a-t-il une donnée sensible ?
6. Faut-il un consentement ?
7. L’utilisateur doit-il valider ?
8. Quels tests simples prouvent que ça marche ?

## Briques Parent Preuve

Identifier la brique :

- dossier
- enfants
- journal
- frais
- pension
- documents
- preuves photo
- export PDF
- courriers
- calendrier
- extraction IA
- reformulation IA
- import PDF
- Supabase/RLS
- design/UI
- mobile/PWA

## Plan minimal

Toujours chercher la modification minimale utile.

Exemple :

Mauvais plan :

```text
Refactoriser toute l’application.
```

Bon plan :

```text
Créer une route isolée, la tester, puis brancher la page.
```

## Tests

Toujours prévoir :

- test navigateur si page UI
- test PowerShell si route API
- test Supabase si migration
- test de non-régression si composant existant
- test RGPD/IA si données sensibles

## Sortie attendue

Ne pas produire une longue dissertation.

Donner un plan court, prêt à exécuter.
