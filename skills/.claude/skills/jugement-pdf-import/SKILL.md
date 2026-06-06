---
name: jugement-pdf-import
description: À utiliser pour développer l’import PDF du jugement, l’extraction du texte, le ciblage du dispositif et le pré-remplissage des 4 règles Parent Preuve.
---

# Import PDF du jugement

## Objectif

Créer la “porte 2” de la brique A : importer un jugement PDF, extraire son texte, cibler le dispositif, puis réutiliser la logique existante de `/api/ia/extraire` pour pré-remplir :

- `pension_regle`
- `frais_regle`
- `dvh_regle`
- `decision_regle`

## Principe fondamental

Le dispositif fait foi.

Prioriser les passages après ou autour de :

- “PAR CES MOTIFS”
- “DIT”
- “FIXE”
- “CONDAMNE”
- “ORDONNE”
- “CONSTATE”
- “DÉBOUTE”
- “RAPPELLE”
- “AUTORISE”

Ne jamais extraire une règle depuis une simple demande des parties si le dispositif dit autre chose.

## Architecture recommandée

Créer une porte dédiée plutôt que casser la porte texte existante.

Fichiers probables :

- `src/app/dossier/import-pdf/page.tsx`
- `src/app/api/ia/extraire-pdf/route.ts`

La route PDF doit idéalement :

1. recevoir un fichier PDF
2. vérifier le type MIME
3. vérifier la taille
4. extraire le texte côté serveur
5. identifier ou prioriser le dispositif
6. éventuellement réduire le texte envoyé à Mistral
7. appeler une logique commune avec `/api/ia/extraire`
8. renvoyer le même format JSON sectionné
9. afficher les 4 encarts existants à valider

## Format de sortie à conserver

Toujours retomber sur le même format :

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

Chaque champ doit garder la forme :

```json
{
  "valeur": null,
  "confiance": "absente",
  "citation": ""
}
```

## Consentement

Recommandation : utiliser un consentement séparé :

```ts
fonctionnalite="extraction_pdf"
```

Afficher clairement :

- le PDF peut contenir des données sensibles
- le texte extrait peut être envoyé à Mistral
- l’utilisateur doit vérifier les propositions
- aucune règle n’est validée automatiquement

## RGPD et minimisation

Règles obligatoires :

- Ne pas conserver le PDF si ce n’est pas nécessaire.
- Ne pas stocker temporairement en public.
- Ne pas logger le contenu du jugement.
- Ne pas envoyer plus de texte que nécessaire à l’IA.
- Ne pas envoyer de données de santé.
- Prévoir un message clair si le PDF est scanné ou illisible.
- Ne pas utiliser de données issues d’OCR externe sans décision explicite.

## Limite des 5000 caractères

Un jugement est souvent long. Stratégies possibles :

1. Extraire seulement le dispositif.
2. Envoyer le dispositif + quelques lignes avant/après.
3. Si le dispositif est introuvable, demander à l’utilisateur de coller le passage pertinent.
4. Éviter d’augmenter brutalement la limite sans justification.

## Erreurs attendues

- 400 si aucun fichier
- 400 si fichier non PDF
- 400 si fichier trop lourd
- 400 si texte extrait vide
- 500 si clé Mistral absente
- 502 si extraction PDF échoue
- 502 si Mistral échoue
- 502 si JSON invalide ou structure invalide

## UI recommandée

La page doit afficher :

- un `PageHeader`
- un bloc de consentement IA
- une zone d’upload PDF
- un message d’avertissement RGPD
- un bouton “Analyser le jugement”
- une zone d’avertissements
- les 4 encarts `RegleX`
- un bouton “Recommencer une analyse”

## Ne pas faire

- Ne pas écrire directement en base depuis le hub.
- Ne pas valider automatiquement une règle.
- Ne pas déduire l’enfant concerné.
- Ne pas qualifier juridiquement.
- Ne pas affirmer que l’analyse IA est fiable à 100 %.
