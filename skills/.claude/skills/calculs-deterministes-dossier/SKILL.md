---
name: calculs-deterministes-dossier
description: À utiliser pour les calculs déterministes du dossier : pension, frais, reste dû, indexation, échéances, tableaux de bord et export.
---

# Calculs déterministes du dossier

## Objectif

Centraliser tous les calculs métier dans des fonctions pures, testables et réutilisables.

## Principe

Déterministe d’abord.

L’IA ne calcule pas le dû. L’IA peut aider à extraire une règle, mais les calculs doivent être faits par le code.

## Source de vérité

Utiliser et enrichir :

- `src/lib/dossierCalculs.ts`

Éviter :

- calculs directement dans les pages
- calculs dupliqués dans plusieurs composants
- formatage euro dispersé

## Séparation des notions

Toujours distinguer :

- règle du jugement
- instance réelle
- calcul du dû
- paiement réalisé
- reste dû
- affichage

Exemples :

- `pension_regle` = règle
- `pension_payments` = paiements réels
- `frais_regle` = règle de partage
- `expenses` = frais réels

## Fonctions futures utiles

Prévoir progressivement :

- calculer pension due sur une période
- comparer pension due / pension payée
- calculer frais partagés
- calculer part autre parent
- calculer reste dû frais
- calculer reste dû global
- calculer échéances à venir
- appliquer indexation INSEE
- formater montants avec `euros()`

## Règles juridiques de prudence

Ne pas conclure :

- abandon de famille
- mauvaise foi
- inexécution volontaire

Dire :

- “reste dû estimé”
- “selon les informations saisies”
- “à vérifier avec la décision applicable”
- “calcul indicatif”

## Tests

Chaque fonction importante doit avoir des cas simples :

- montant nul
- paiement partiel
- paiement supérieur
- frais remboursé
- frais non remboursé
- part 50/50
- part différente
- absence de règle

## Checklist

- Calcul dans `src/lib` ?
- Fonction pure ?
- Pas d’appel Supabase dans la fonction de calcul ?
- Tests prévus ?
- Même fonction utilisée par accueil et export ?
- Formulation prudente ?
