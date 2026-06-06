# Format JSON sectionné Parent Preuve

Chaque extraction doit renvoyer :

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
