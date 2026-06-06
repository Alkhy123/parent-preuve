---
name: parent-preuve-token-economy
description: À utiliser dans Claude.ai pour réduire les coûts de tokens et éviter de recoller inutilement tout le projet ou tout le contexte Parent Preuve.
---

# Parent Preuve Token Economy

## Objectif

Réduire la consommation de tokens dans Claude.ai tout en gardant Claude efficace sur le projet Parent Preuve.

Cette skill aide Claude à demander uniquement les informations nécessaires, à résumer le contexte utile et à éviter les réponses longues inutiles.

## Principe

Dans Claude.ai web, Claude ne voit pas automatiquement le disque local.

Il faut donc travailler avec un contexte minimal utile :

- contexte global si nécessaire
- fichier précis à modifier
- erreur exacte si debugging
- objectif de la tâche
- contraintes Parent Preuve

## Règle d’or

Ne jamais demander tout le projet si 1 ou 2 fichiers suffisent.

## Quand demander le contexte complet

Demander ou utiliser `PARENT_PREUVE_CONTEXTE.md` seulement si :

- la tâche touche à l’architecture générale
- la tâche touche à l’IA
- la tâche touche à Supabase/RLS
- la tâche touche au juridique/RGPD
- la tâche est une nouvelle brique importante

## Quand demander seulement un fichier

Demander seulement le ou les fichiers concernés si :

- correction d’erreur TypeScript
- modification UI locale
- ajustement d’un composant
- ajout d’un bouton
- correction d’un message
- petite modification d’une route

## Format de demande de fichiers

Si les fichiers sont nécessaires, demander précisément :

```text
Colle-moi uniquement :
1. le fichier ...
2. le message d’erreur complet
3. éventuellement le fichier ...
```

Ne pas demander :

```text
Envoie-moi tout le projet.
```

## Réponse courte par défaut

Pour économiser les tokens, utiliser ce format :

```text
Objectif :
Fichiers :
Modification :
Test :
Vigilance :
```

Développer uniquement si l’utilisateur demande une explication détaillée ou si le risque est important.

## Résumé compressé Parent Preuve

Si le contexte n’est pas fourni, garder ce résumé mental :

```text
Parent Preuve = app Next.js 16/Supabase/Mistral pour organiser un dossier JAF.
Règles clés : IA propose, humain valide ; source='ia', valide=false ; pas de conseil juridique ; pas de preuve équivalente à un constat ; RLS partout ; données enfants sensibles ; preuves photo numériques renforcées ; design navy/or/crème ; développeur débutant.
```

## Éviter les redites

Ne pas répéter à chaque réponse toute la philosophie du projet.

Rappeler seulement les contraintes pertinentes pour la tâche.

## Découper les grosses tâches

Pour une grosse fonctionnalité, proposer un découpage :

1. route serveur
2. test route
3. composant
4. branchement page
5. contrôle non-régression

Mais ne pas coder tout d’un coup si cela rend la réponse énorme.

## Checklist économie de tokens

Avant de répondre :

- Ai-je besoin de tout le contexte ?
- Puis-je répondre avec seulement les fichiers concernés ?
- Puis-je donner un patch plus court ?
- Ai-je évité les explications inutiles ?
- Ai-je gardé les avertissements seulement pertinents ?
- Ai-je donné une prochaine action claire ?
