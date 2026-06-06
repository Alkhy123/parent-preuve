---
name: mistral-json-extraction
description: À utiliser pour toute route IA Mistral qui extrait des informations structurées vers les tables Parent Preuve.
---

# Mistral JSON Extraction

## Objectif

Garantir des extractions IA fiables, vérifiables, non hallucinées et compatibles avec les règles du projet Parent Preuve.

## Règles serveur

- Appel Mistral uniquement côté serveur.
- La clé `MISTRAL_API_KEY` ne doit jamais être exposée côté client.
- Jamais de clé en `NEXT_PUBLIC_`.
- Utiliser `temperature: 0` pour l’extraction.
- Utiliser `response_format: { type: "json_object" }` quand disponible.
- Ne jamais logger le texte complet envoyé à l’IA.
- Ne jamais logger un jugement complet.

## Modèle

Modèle actuel :

```ts
model: "mistral-small-latest"
```

Ne le modifier que si l’utilisateur le demande explicitement ou si une raison technique claire est expliquée.

## Format de champ

Chaque champ extrait doit suivre ce modèle :

```json
{
  "valeur": null,
  "confiance": "absente",
  "citation": ""
}
```

Valeurs autorisées pour `confiance` :

- `haute`
- `moyenne`
- `absente`

Invariant obligatoire :

```ts
if (champ.valeur === null) {
  champ.confiance === "absente"
}
```

## JSON sectionné

La sortie doit contenir les 4 sections :

- `pension`
- `frais`
- `dvh`
- `decision`

Même si une section est vide, elle doit être présente.

## Validation

Toujours valider :

- que la réponse est un JSON valide
- que les 4 sections existent
- que chaque section contient `table`, `champs`, `avertissements`
- que `avertissements` est un tableau
- que les champs respectent le format
- que les tables sont bien ré-étiquetées côté serveur

## Anti-inférence

Ne jamais déduire :

- l’intention d’un parent
- le caractère volontaire d’un non-paiement
- le motif d’une visite médiatisée
- une dangerosité
- un diagnostic psychologique
- une infraction pénale
- l’existence d’un appel
- l’exécution provisoire
- la susceptibilité d’appel
- l’enfant concerné si l’UUID n’est pas fourni par l’utilisateur

## Règles d’extraction

- Le dispositif fait foi.
- Si une information manque : `valeur: null`.
- Si une information est ambiguë : confiance `moyenne` + avertissement.
- Si une personne est désignée par “le père” ou “la mère”, ne pas transformer automatiquement en `moi` ou `autre` sans contexte fiable.
- Les dates doivent être au format `AAAA-MM-JJ` si extraites.
- Les montants doivent être numériques.
- Les booléens doivent être `true`, `false` ou `null`.

## Gestion des erreurs

Erreurs recommandées :

- 400 si texte vide
- 400 si limite dépassée
- 500 si clé absente
- 502 si Mistral échoue
- 502 si JSON invalide
- 502 si structure invalide

## Traçabilité en base

Toute proposition IA enregistrée doit être :

```ts
source: "ia"
valide: false
```

La validation humaine seule peut passer :

```ts
valide: true
```

## UX

Toujours afficher :

- un bandeau “Proposé par l’IA — à vérifier”
- les avertissements
- les citations utiles
- un bouton de validation humaine
