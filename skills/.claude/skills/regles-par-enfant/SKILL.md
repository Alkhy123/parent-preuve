---
name: regles-par-enfant
description: À utiliser pour rattacher pension_regle, frais_regle, dvh_regle et decision_regle à un enfant choisi par l’utilisateur.
---

# Règles par enfant

## Objectif

Permettre à Parent Preuve de gérer plusieurs enfants et plusieurs décisions/règles sans confusion.

Aujourd’hui, les tables règles ont `enfant_id` nullable et l’IA ne l’extrait pas.

## Règle absolue

L’IA ne choisit jamais `enfant_id`.

Seul l’utilisateur peut rattacher une règle à un enfant.

## Tables concernées

- `pension_regle`
- `frais_regle`
- `dvh_regle`
- `decision_regle`
- éventuellement `garde_regles`

## UX recommandée

Ajouter un sélecteur enfant dans chaque `RegleX`.

Options possibles :

- enfant précis
- règle commune / non rattachée
- à déterminer

Ne pas bloquer l’utilisateur si aucun enfant n’est encore créé.

## Migration prudente

Ne pas casser l’existant.

Règles :

- garder `enfant_id` nullable
- ne pas rendre obligatoire immédiatement
- ne pas supprimer les règles existantes
- prévoir un état “non rattaché”
- adapter les requêtes progressivement

## Lecture des règles

Actuellement, la lecture se fait par :

```ts
.eq("actif", true)
.maybeSingle()
```

Évolution possible :

- si un enfant est sélectionné : chercher `actif=true` + `enfant_id`
- sinon : chercher règle active non rattachée
- prévoir le cas d’une règle commune

## Écriture

À l’enregistrement :

- si l’utilisateur choisit un enfant, enregistrer son UUID
- si l’utilisateur ne choisit pas, laisser `null`
- si origine IA, garder `source='ia'`, `valide=false`

## Extraction IA

Ne pas demander à l’IA un UUID.

Elle peut seulement signaler une mention textuelle :

- “concerne l’enfant X”
- “concerne les enfants”
- “enfant non identifié”

Mais le rattachement final est humain.

## Checklist

- Sélecteur enfant présent ?
- `enfant_id` nullable conservé ?
- IA empêchée de choisir l’UUID ?
- Ancien comportement encore fonctionnel ?
- Règles communes prévues ?
