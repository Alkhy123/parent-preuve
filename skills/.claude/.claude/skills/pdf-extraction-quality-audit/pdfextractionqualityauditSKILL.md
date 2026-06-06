---
name: pdf-extraction-quality-audit
description: À utiliser pour auditer ou améliorer l’import PDF du jugement, l’extraction du texte, le ciblage du dispositif et la qualité du texte envoyé à l’IA.
---

# PDF Extraction Quality Audit — Parent Preuve

## Objectif

Cette skill sert à vérifier la qualité, la sécurité et la fiabilité de l’import PDF du jugement dans Parent Preuve.

Elle doit être utilisée pour :

- créer la route `/api/ia/extraire-pdf`
- améliorer l’extraction de texte depuis un PDF
- vérifier si un PDF est scanné ou illisible
- cibler le dispositif
- limiter les données envoyées à Mistral
- auditer les erreurs utilisateur
- éviter les fuites de données sensibles

## Contexte projet

Parent Preuve traite des décisions JAF et des données sensibles concernant des enfants et des parents séparés.

Le prochain chantier important du projet est la “porte 2” : importer un jugement PDF pour alimenter les 4 tables règles :

- `pension_regle`
- `frais_regle`
- `dvh_regle`
- `decision_regle`

La sortie doit réutiliser le même format que `/api/ia/extraire` :

```json
{
  "sections": {
    "pension": {},
    "frais": {},
    "dvh": {},
    "decision": {}
  }
}
```

## Règles absolues

- Ne jamais conserver le PDF sans nécessité.
- Ne jamais stocker le PDF dans un bucket public.
- Ne jamais logger le contenu du jugement.
- Ne jamais envoyer à l’IA plus de texte que nécessaire.
- Ne jamais envoyer de données de santé à l’IA.
- Ne jamais valider automatiquement une règle extraite.
- Toute proposition IA doit rester `source='ia'` et `valide=false`.

## Ciblage du dispositif

L’extraction doit chercher prioritairement :

- “PAR CES MOTIFS”
- “DIT”
- “FIXE”
- “CONDAMNE”
- “ORDONNE”
- “CONSTATE”
- “RAPPELLE”
- “DÉBOUTE”
- “AUTORISE”

Le dispositif fait foi.

Ne jamais préférer une demande des parties à ce qui est décidé dans le dispositif.

Exemple :

- Motif : “Madame demande une pension de 300 euros.”
- Dispositif : “Fixe la contribution à 180 euros.”

Valeur à extraire : `180`.

## Audit technique

Vérifier :

- Le fichier est bien un PDF.
- La taille maximale est contrôlée.
- Le texte extrait n’est pas vide.
- Les PDF scannés sont détectés ou signalés.
- Le texte transmis à l’IA est limité.
- Le dispositif est priorisé.
- Les erreurs sont compréhensibles.
- Les fichiers temporaires sont supprimés.
- Les logs ne contiennent aucune donnée sensible.

## Cas d’erreur à prévoir

- Aucun fichier transmis.
- Fichier non PDF.
- PDF trop lourd.
- PDF illisible.
- PDF scanné sans texte exploitable.
- Texte extrait vide.
- Dispositif introuvable.
- Mistral indisponible.
- JSON Mistral invalide.
- Structure de réponse invalide.

## Messages utilisateur recommandés

PDF scanné :

> Le PDF semble être un scan ou une image. L’application n’a pas pu lire automatiquement le texte. Vous pouvez copier-coller le dispositif du jugement dans l’analyse manuelle.

Dispositif introuvable :

> L’application n’a pas trouvé clairement la partie “PAR CES MOTIFS”. L’analyse peut être moins fiable. Vérifiez attentivement les propositions.

Fichier trop lourd :

> Le fichier PDF est trop volumineux. Essayez d’importer une version plus légère ou uniquement les pages utiles du jugement.

## Checklist finale

Avant de valider une fonctionnalité d’import PDF :

- [ ] PDF uniquement ?
- [ ] Taille contrôlée ?
- [ ] Extraction texte testée ?
- [ ] PDF scanné géré ?
- [ ] Dispositif priorisé ?
- [ ] Données minimisées ?
- [ ] Aucun contenu sensible dans les logs ?
- [ ] Consentement IA prévu ?
- [ ] Sortie JSON identique à `/api/ia/extraire` ?
- [ ] Les 4 encarts restent à valider par l’utilisateur ?
