---
name: judicial-pdf-export
description: À utiliser pour les exports PDF, bordereaux de pièces, rapports de preuve, synthèses factuelles et documents destinés à avocat ou JAF.
---

# Export PDF judiciaire

## Objectif

Produire des PDF sobres, factuels, lisibles et utiles pour organiser un dossier, sans se substituer à un avocat.

## Ton obligatoire

Le style doit être :

- neutre
- factuel
- chronologique
- respectueux
- centré sur l’intérêt de l’enfant
- sans insulte
- sans accusation non prouvée
- sans diagnostic psychologique inventé
- sans qualification juridique hasardeuse

## Formulations recommandées

Utiliser :

- “À la date du…”
- “L’utilisateur indique que…”
- “Il ressort de la pièce n°…”
- “Le document mentionne…”
- “Le montant renseigné est de…”
- “Cet élément est présenté à titre factuel.”

Éviter :

- “il ment”
- “il manipule”
- “il est dangereux”
- “abandon de famille”
- “non-représentation d’enfant”
- “pervers narcissique”
- “volontairement”
- “de mauvaise foi”

Sauf citation directe d’un jugement ou document officiel, et en indiquant clairement la source.

## Structure recommandée

Un export complet peut contenir :

1. Page de garde
2. Identité du dossier
3. Enfant(s) concerné(s)
4. Décision de référence
5. Règles validées
6. Chronologie
7. Pension
8. Frais
9. DVH / calendrier
10. Documents
11. Preuves photo
12. Bordereau de pièces
13. Avertissement final

## Tables à exploiter

Progressivement intégrer :

- `dossier`
- `children`
- `events`
- `expenses`
- `pension_payments`
- `pension_regle`
- `frais_regle`
- `dvh_regle`
- `decision_regle`
- `documents`
- `preuves_photo`

## Règles extraites par IA

Si une règle est `source='ia'` et `valide=false`, ne pas la présenter comme une règle validée.

Afficher plutôt :

- “proposition IA non validée”
- “à vérifier avant export”
- ou bloquer l’export si c’est considéré bloquant

## Preuves photo

Pour les preuves photo, afficher :

- titre
- description factuelle
- date serveur
- hash SHA-256
- GPS si présent
- précision GPS
- statut horodatage
- anomalies
- avertissement : ne remplace pas un constat

## Avertissement obligatoire

Inclure une mention de ce type :

> Ce document est une aide à l’organisation factuelle du dossier. Il ne constitue pas un conseil juridique, ne remplace pas l’analyse d’un avocat et ne garantit pas la recevabilité ou l’appréciation des pièces par le juge.

## Calculs

Les calculs doivent venir de fonctions centralisées :

- `src/lib/dossierCalculs.ts`
- pas de duplication dans les composants
- pas de calcul manuel dispersé dans les pages

## Checklist export

Avant de modifier l’export :

- Le ton est-il neutre ?
- Les pièces sont-elles numérotées ?
- Les données IA non validées sont-elles exclues ou signalées ?
- Les calculs sont-ils centralisés ?
- Les preuves photo ont-elles leurs métadonnées ?
- L’avertissement juridique est-il présent ?
