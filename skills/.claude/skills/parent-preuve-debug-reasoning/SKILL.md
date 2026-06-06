---
name: parent-preuve-debug-reasoning
description: À utiliser dans Claude.ai pour déboguer efficacement une erreur Next.js, TypeScript, Supabase, Mistral ou UI du projet Parent Preuve.
---

# Parent Preuve Debug Reasoning

## Objectif

Déboguer vite, sans demander trop de contexte, et sans proposer des corrections au hasard.

## Méthode

Toujours suivre cet ordre :

1. Lire l’erreur exacte.
2. Identifier le type d’erreur.
3. Identifier le fichier concerné.
4. Chercher la cause la plus probable.
5. Proposer une correction minimale.
6. Donner un test.
7. Demander seulement les fichiers nécessaires si incertain.

## Types d’erreurs fréquentes

### Next.js 16

Vérifier :

- route `route.ts`
- `export async function POST(request: Request)`
- `await request.json()`
- `Response.json`
- `headers()` ou `cookies()` async
- composant client avec `"use client"` si hooks

### TypeScript

Vérifier :

- type nullable
- enum string
- import manquant
- props optionnelles
- `undefined` vs `null`
- types Supabase

### Supabase

Vérifier :

- RLS
- `user_id`
- policy manquante
- `.maybeSingle()`
- bucket privé
- URL signée
- erreur d’auth

### Mistral / IA

Vérifier :

- clé côté serveur
- JSON invalide
- markdown ```json à nettoyer
- structure des 4 sections
- limite de texte
- absence de `response_format`
- erreur réseau/TLS Windows

### UI

Vérifier :

- import composant
- props manquantes
- état contrôlé/non contrôlé
- formulaire écrasé par chargement base
- bouton désactivé
- responsive

## Règle anti-panique

Ne pas proposer 10 corrections.

Commencer par la cause la plus probable et la correction minimale.

## Format de réponse

```text
Erreur probable :
Pourquoi :
Correction :
Test :
Si ça échoue :
```

## Demande de contexte minimale

Si le code manque, demander uniquement :

```text
Colle-moi :
1. le message d’erreur complet
2. le fichier ...
3. si Supabase : la requête ou la policy concernée
```

## Checklist

- Ai-je identifié le type d’erreur ?
- Ai-je évité un refactor inutile ?
- Ai-je donné une correction minimale ?
- Ai-je donné un test ?
- Ai-je demandé seulement le strict nécessaire ?
