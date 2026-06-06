# Parent Preuve — Skills Claude Web Raisonnement

Ce pack contient des skills pensées spécialement pour **Claude.ai web**.

Objectif : aider Claude à mieux raisonner, réduire les tokens, rester centré sur Parent Preuve et produire du code plus exploitable à copier dans Cursor ou Claude Code.

## Skills incluses

1. `parent-preuve-reasoning-mode`
2. `parent-preuve-token-economy`
3. `parent-preuve-code-planner`
4. `parent-preuve-file-handoff`
5. `parent-preuve-debug-reasoning`
6. `parent-preuve-architecture-guardrails`
7. `parent-preuve-micro-task-mode`

## Utilisation recommandée sur Claude.ai

Upload les ZIP individuels situés dans :

```text
skills-zip-individuels-claude-ai/
```

Chaque fichier ZIP contient une skill prête à importer dans Claude.ai.

## Combinaisons utiles

### Pour réfléchir avant de coder

```text
/parent-preuve-reasoning-mode
/parent-preuve-code-planner
/parent-preuve-architecture-guardrails
```

### Pour réduire les tokens

```text
/parent-preuve-token-economy
/parent-preuve-micro-task-mode
```

### Pour obtenir un fichier complet à copier

```text
/parent-preuve-file-handoff
```

### Pour déboguer une erreur

```text
/parent-preuve-debug-reasoning
/parent-preuve-token-economy
```

### Pour une grosse fonctionnalité comme import PDF

```text
/parent-preuve-reasoning-mode
/parent-preuve-code-planner
/parent-preuve-micro-task-mode
/parent-preuve-architecture-guardrails
```

## Prompt recommandé

```text
Utilise les skills Parent Preuve suivantes :
/parent-preuve-reasoning-mode
/parent-preuve-token-economy
/parent-preuve-code-planner

Je veux travailler efficacement sur cette fonctionnalité.
Réponds court, en mode :
Objectif / Fichiers / Modification / Test / Vigilance.
Ne demande pas tout le projet si un seul fichier suffit.
Pense Parent Preuve : IA propose, humain valide ; RLS ; RGPD ; pas de conseil juridique ; développeur débutant.
```
