# Prompts Claude.ai web — Parent Preuve

## Mode efficace général

```text
Utilise :
/parent-preuve-reasoning-mode
/parent-preuve-token-economy
/parent-preuve-code-planner

Réponds efficacement, sans dissertation.
Format :
Objectif :
Fichiers :
Modification :
Test :
Vigilance :

Ne demande pas tout le projet si un ou deux fichiers suffisent.
Garde les règles Parent Preuve : IA propose, humain valide ; source='ia', valide=false ; RLS ; RGPD ; pas de conseil juridique ; pas de preuve équivalente à un constat.
```

## Demander un plan avant code

```text
Utilise :
/parent-preuve-code-planner
/parent-preuve-architecture-guardrails

Voici la fonctionnalité :
[COLLER]

Je veux uniquement un plan court pour la coder proprement.
Pas encore de code.
```

## Demander un fichier complet

```text
Utilise :
/parent-preuve-file-handoff

Je veux un fichier complet prêt à copier-coller.
Indique :
- le chemin exact
- si je dois remplacer tout le fichier
- les tests à faire après collage
```

## Déboguer une erreur

```text
Utilise :
/parent-preuve-debug-reasoning
/parent-preuve-token-economy

Voici l’erreur :
[COLLER]

Demande-moi uniquement les fichiers nécessaires.
Ne propose pas de refactor global.
```

## Travailler par petites étapes

```text
Utilise :
/parent-preuve-micro-task-mode

Découpe cette fonctionnalité en petites étapes.
Une étape = un test possible.
Je veux éviter les grosses réponses avec trop de fichiers.
```
