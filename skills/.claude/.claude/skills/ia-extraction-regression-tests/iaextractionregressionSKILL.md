---
name: ia-extraction-regression-tests
description: À utiliser avant ou après toute modification de la route IA d’extraction pour créer ou vérifier des cas de tests anti-régression.
---

# IA Extraction Regression Tests — Parent Preuve

## Objectif

Cette skill sert à empêcher les régressions dans l’extraction IA des règles du jugement.

Elle doit être utilisée pour toute modification de :

- `/api/ia/extraire`
- `/api/ia/extraire-pdf`
- prompt Mistral
- validation JSON
- format sectionné
- convertisseurs vers `ReglePension`, `RegleFrais`, `RegleDVH`, `RegleDecision`

## Règles fondamentales

- Le dispositif fait foi.
- L’IA ne doit pas inventer.
- L’IA ne doit pas qualifier juridiquement.
- L’IA ne doit pas inférer l’intention.
- L’IA ne doit pas inférer un statut procédural.
- L’IA ne doit pas choisir `enfant_id`.
- Si l’information est absente : `valeur=null` et `confiance="absente"`.
- Si l’information est ambiguë : confiance `moyenne` + avertissement.
- Toute écriture IA doit rester `source='ia'` et `valide=false`.

## Format attendu

La sortie doit toujours contenir les 4 sections :

```json
{
  "sections": {
    "pension": {
      "table": "pension_regle",
      "champs": {},
      "avertissements": []
    },
    "frais": {
      "table": "frais_regle",
      "champs": {},
      "avertissements": []
    },
    "dvh": {
      "table": "dvh_regle",
      "champs": {},
      "avertissements": []
    },
    "decision": {
      "table": "decision_regle",
      "champs": {},
      "avertissements": []
    }
  }
}
```

Chaque champ :

```json
{
  "valeur": null,
  "confiance": "absente",
  "citation": ""
}
```

## Tests obligatoires à conserver

### Test 1 — Pension simple

Texte :

```text
PAR CES MOTIFS, fixe la contribution à l'entretien et à l'éducation de l'enfant à la somme de 180 euros par mois, payable avant le 5 de chaque mois.
```

Attendu :

- pension `montant_base = 180`
- `jour_echeance = 5`
- pas d’information inventée sur frais, DVH ou décision

### Test 2 — Demande différente du dispositif

Texte :

```text
Madame demande une pension de 300 euros. PAR CES MOTIFS, fixe la contribution à la somme de 180 euros par mois.
```

Attendu :

- pension `montant_base = 180`
- ne jamais extraire 300

### Test 3 — Frais exceptionnels

Texte :

```text
Les frais exceptionnels seront partagés par moitié entre les parents, sur justificatif, après accord préalable pour toute dépense supérieure à 200 euros, et remboursés sous un mois.
```

Attendu :

- frais 50 / 50
- accord préalable requis
- seuil 200
- justificatif obligatoire true
- délai remboursement 30 jours

### Test 4 — Contamination vacances

Texte :

```text
Les vacances scolaires seront partagées par moitié. Les frais exceptionnels s'ajoutent à la contribution alimentaire.
```

Attendu :

- `inclut_vacances` ne doit pas passer à true pour la pension
- `s_ajoute_a_pension` peut passer à true côté frais si la clause est claire

### Test 5 — Justificatif absent

Texte :

```text
Les frais exceptionnels seront partagés par moitié.
```

Attendu :

- `justificatif_obligatoire` doit être null côté IA si le texte ne le dit pas
- le composant peut garder son défaut métier ensuite

### Test 6 — DVH médiatisé

Texte :

```text
Dit que le père exercera son droit de visite dans un espace rencontre, un samedi sur deux, en présence d'un tiers.
```

Attendu :

- `type_dvh = mediatise`
- `lieu_visite = espace_rencontre`
- `presence_tiers = true`
- ne pas inférer la raison de la médiatisation

### Test 7 — Exécution provisoire

Texte :

```text
La présente décision est assortie de l'exécution provisoire.
```

Attendu :

- `execution_provisoire = true`

### Test 8 — Exécution provisoire absente

Texte :

```text
Jugement rendu publiquement par mise à disposition au greffe.
```

Attendu :

- ne pas déduire `execution_provisoire`
- valeur null

### Test 9 — Père / mère ambigu

Texte :

```text
Le père versera à la mère une pension de 180 euros par mois.
```

Attendu :

- avertissement si l’application ne sait pas qui est “moi” ou “autre”
- confiance moyenne pour `debiteur`

### Test 10 — Date en français

Texte :

```text
L'affaire est renvoyée à l'audience du 10 septembre 2026.
```

Attendu :

- date `2026-09-10`
- confiance moyenne si conversion textuelle

## Commande PowerShell type

```powershell
$r = Invoke-RestMethod -Uri http://localhost:3000/api/ia/extraire -Method Post `
  -ContentType "application/json" `
  -Body '{"texte":"PAR CES MOTIFS, fixe une pension de 180 euros par mois payable avant le 5."}'
$r | ConvertTo-Json -Depth 10
```

## Checklist avant modification du prompt

Avant de modifier le prompt :

- [ ] Lister les cas que la modification cherche à corriger.
- [ ] Vérifier que les anciens cas restent couverts.
- [ ] Tester au moins 3 cas simples.
- [ ] Tester au moins 1 cas ambigu.
- [ ] Vérifier que le JSON reste strict.
- [ ] Vérifier que `null => confiance absente`.
- [ ] Vérifier qu’aucune section ne disparaît.
