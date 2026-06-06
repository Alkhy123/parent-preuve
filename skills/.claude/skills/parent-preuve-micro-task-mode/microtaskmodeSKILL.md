---
name: parent-preuve-micro-task-mode
description: À utiliser dans Claude.ai pour découper une grosse fonctionnalité Parent Preuve en petites tâches réalisables, afin d’éviter les réponses trop longues et les erreurs de collage.
---

# Parent Preuve Micro Task Mode

## Objectif

Découper les grosses fonctionnalités en petites étapes sûres.

Cette skill est utile parce que Claude.ai ne modifie pas directement le projet et que le développeur doit souvent copier-coller.

## Principe

Une réponse = une étape utile.

Éviter :

- coder 8 fichiers d’un coup
- modifier base + route + UI + export dans une seule réponse
- donner 500 lignes sans test intermédiaire

## Découpage recommandé

Pour une nouvelle fonctionnalité :

1. schéma ou types si nécessaire
2. route serveur
3. test route
4. composant UI isolé
5. branchement page
6. test navigateur
7. nettoyage UX
8. revue sécurité

## Exemple import PDF

Ne pas tout faire d’un coup.

Découper :

1. page upload PDF sans IA
2. route qui vérifie PDF
3. extraction texte
4. ciblage dispositif
5. appel Mistral
6. affichage 4 encarts
7. messages d’erreur
8. revue RGPD

## Format de réponse

```text
Étape actuelle :
Pourquoi cette étape :
Fichiers :
Code :
Test :
Étape suivante :
```

## Règle de pause

Après chaque étape, demander à l’utilisateur de tester seulement si la tâche nécessite le résultat réel.

Mais si l’utilisateur demande un pack complet, fournir le pack.

## Économie de tokens

Ne pas redonner tout le contexte à chaque étape.

Rappeler seulement :

- objectif
- fichiers
- contrainte critique

## Checklist

- Étape assez petite ?
- Test possible ?
- Risque limité ?
- Fichier complet ou patch clair ?
- Suite logique indiquée ?
