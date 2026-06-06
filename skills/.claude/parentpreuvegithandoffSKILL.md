---
name: parent-preuve-git-handoff
description: À utiliser à la fin d’une étape de développement Parent Preuve pour générer les commandes Git à copier dans Cursor afin d’envoyer les modifications sur GitHub.
---

# Parent Preuve Git Handoff

## Objectif

Cette skill sert à demander à Claude de terminer chaque étape de développement avec les commandes Git adaptées à copier dans le terminal de Cursor.

Elle doit être utilisée quand :

- une étape de développement est terminée
- un ou plusieurs fichiers ont été modifiés
- l’utilisateur veut envoyer les modifications sur GitHub
- l’utilisateur veut éviter d’oublier `git status`, `git add`, `git commit`, `git push`
- l’utilisateur veut vérifier que `.env.local` ou des secrets ne partent pas sur GitHub

## Contexte projet

Projet local :

```powershell
c:\projets\parent-preuve
```

Le projet utilise Git et GitHub.

L’utilisateur travaille principalement dans Cursor et veut des commandes PowerShell simples.

## Règle absolue sécurité

Avant de proposer `git add .`, toujours rappeler de vérifier que les fichiers sensibles ne sont pas suivis.

Fichiers à ne jamais envoyer :

```text
.env
.env.local
.env.*.local
node_modules/
.next/
```

Si `.env.local` apparaît dans `git status`, ne pas proposer de push avant correction.

## Format de réponse obligatoire

Quand cette skill est utilisée, répondre avec :

1. Commandes Git recommandées
2. Variante si l’utilisateur veut envoyer seulement certains fichiers
3. Vérification anti-secret
4. Message de commit conseillé

## Commandes standard

Pour envoyer toutes les modifications validées :

```powershell
cd "c:\projets\parent-preuve"

git status
git add .
git commit -m "MESSAGE_DE_COMMIT"
git push
```

## Pour envoyer un seul fichier

Si l’utilisateur veut envoyer seulement un fichier précis :

```powershell
cd "c:\projets\parent-preuve"

git status
git add "CHEMIN_DU_FICHIER"
git commit -m "MESSAGE_DE_COMMIT"
git push
```

Exemple :

```powershell
cd "c:\projets\parent-preuve"

git status
git add "src/app/dossier/import-pdf/page.tsx"
git commit -m "Ajout de la page import PDF du jugement"
git push
```

## Pour envoyer plusieurs fichiers précis

```powershell
cd "c:\projets\parent-preuve"

git status
git add "src/app/dossier/import-pdf/page.tsx"
git add "src/app/api/ia/extraire-pdf/route.ts"
git commit -m "Ajout de l'import PDF du jugement"
git push
```

## Si `.env.local` apparaît dans Git

Ne pas pousser.

Donner cette correction :

```powershell
cd "c:\projets\parent-preuve"

git rm --cached .env.local
git add .gitignore
git commit -m "Retire le fichier env local du suivi Git"
git push
```

Puis rappeler que toute clé déjà poussée doit être révoquée/régénérée.

## Messages de commit recommandés

Claude doit proposer un message clair, court, en français.

Exemples :

```text
Ajout de l'import PDF du jugement
Amélioration des messages d'erreur IA
Correction de l'extraction des règles de frais
Ajout des tests anti-régression IA
Mise à jour du design de la page dossier
Correction des règles Supabase RLS
```

Éviter :

```text
update
fix
test
modif
truc
```

## Si rien n’est à commit

Si `git status` indique :

```text
nothing to commit, working tree clean
```

Répondre :

```text
Aucune modification locale à envoyer. Ton dépôt est déjà à jour côté local.
```

## Si Git demande un pull avant push

Si le push échoue avec une erreur indiquant que le dépôt distant contient des changements :

```powershell
git pull --rebase
git push
```

Mais avertir :

- si conflit, ne pas forcer
- résoudre les conflits dans Cursor
- relancer les tests avant push

## Si push refusé à cause d’un secret

Ne pas forcer.

Faire :

1. révoquer la clé
2. retirer le fichier du suivi Git
3. nettoyer l’historique si nécessaire
4. repousser seulement après nettoyage

## Réponse type à donner à l’utilisateur

Quand une étape est terminée, terminer par :

```text
Pour envoyer cette étape sur GitHub depuis Cursor, colle ces commandes dans le terminal :
```

Puis donner :

```powershell
cd "c:\projets\parent-preuve"

git status
git add .
git commit -m "MESSAGE"
git push
```

Puis ajouter :

```text
Avant de valider, vérifie dans `git status` que `.env.local` n’apparaît pas.
```

## Checklist avant de donner les commandes

- Message de commit adapté à l’étape ?
- Chemin projet correct ?
- Commandes PowerShell simples ?
- Rappel anti-secret présent ?
- Variante fichier unique proposée si utile ?
- Pas de `git push --force` sauf cas explicitement nécessaire ?
