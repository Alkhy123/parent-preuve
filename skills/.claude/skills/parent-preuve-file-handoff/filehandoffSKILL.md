---
name: parent-preuve-file-handoff
description: À utiliser dans Claude.ai pour préparer des fichiers complets à copier-coller dans Cursor ou Claude Code, sans confusion ni patchs incomplets.
---

# Parent Preuve File Handoff

## Objectif

Aider Claude.ai à fournir du code exploitable alors qu’il ne peut pas modifier directement le disque local.

Cette skill sert à produire :

- fichier complet à remplacer
- patch ciblé clair
- instructions de copie
- tests à faire après collage

## Règle principale

Si un fichier doit être beaucoup modifié, fournir le fichier complet.

Si la modification est petite, fournir un patch ciblé avec repères.

## Format pour fichier complet

Utiliser :

```text
Fichier à remplacer :
src/...

Remplace tout le contenu par :
```

Puis donner le code complet.

Ensuite :

```text
Test :
1. ...
2. ...
```

## Format pour modification ciblée

Utiliser :

```text
Dans le fichier :
src/...

Cherche ce bloc :
...

Remplace par :
...
```

Ou :

```text
Ajoute ce bloc juste après :
...
```

## Éviter

- “modifie à peu près cette partie”
- “ajoute ça quelque part”
- “adapte selon ton code”
- patchs sans contexte
- morceaux de code incomplets
- imports oubliés
- fonctions dupliquées

## Vérifications avant de donner le code

- imports présents ?
- types cohérents ?
- noms de fichiers exacts ?
- pas de duplication de fonction ?
- compatibilité Next.js 16 ?
- secrets côté serveur ?
- messages utilisateur propres ?
- test donné ?

## Quand demander le fichier actuel

Dans Claude.ai, demander le fichier actuel si :

- il faut modifier une fonction existante
- les imports sont inconnus
- il y a un risque de duplication
- le composant est déjà complexe
- une erreur TypeScript dépend du code réel

Demander précisément :

```text
Colle-moi le contenu actuel de `src/...` et le message d’erreur complet.
```

## Réponse attendue

Toujours terminer par :

```text
Après collage, teste :
...
Si erreur, colle-moi uniquement :
- le message d’erreur complet
- le fichier modifié
```
