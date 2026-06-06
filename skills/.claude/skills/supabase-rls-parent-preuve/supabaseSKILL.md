---
name: supabase-rls-parent-preuve
description: À utiliser pour toute modification Supabase, table, migration, RLS, Storage, Auth ou requête base de données du projet Parent Preuve.
---

# Supabase RLS — Parent Preuve

## Objectif

Garantir que les données sensibles du projet Parent Preuve restent isolées par utilisateur.

## Convention de table

Par défaut, les tables doivent suivre ce patron :

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid not null default auth.uid(),
created_at timestamptz not null default now()
```

Convention du projet :

- colonnes en français
- `id uuid`
- `user_id uuid default auth.uid()`
- RLS activée partout
- policies basées sur `auth.uid() = user_id`

## Règle absolue

Ne jamais désactiver RLS pour “faire marcher vite”.

Si une requête échoue à cause de RLS :

1. comprendre la policy
2. corriger la policy
3. ne pas contourner côté client
4. ne jamais exposer la service role key

## Policies minimales

Prévoir, selon les besoins :

- SELECT : l’utilisateur lit ses lignes
- INSERT : l’utilisateur crée ses lignes
- UPDATE : l’utilisateur modifie ses lignes
- DELETE : l’utilisateur supprime ses lignes

Pattern :

```sql
using (auth.uid() = user_id)
with check (auth.uid() = user_id)
```

## Storage

Buckets sensibles :

- `preuves`
- `justificatifs`

Règles :

- buckets privés
- originaux protégés
- URL signée courte
- chemin recommandé : `<user_id>/<entity_id>/<nom_fichier>`
- jamais de bucket public pour les preuves ou justificatifs
- ne pas stocker de fichiers sensibles dans `/public`

## Tables règles

Les 4 tables règles suivent le patron :

- `pension_regle`
- `frais_regle`
- `dvh_regle`
- `decision_regle`

Champs système :

- `source`: `'manuel' | 'ia'`
- `valide`: bool
- `actif`: bool
- `enfant_id`: nullable pour l’instant

Règles :

- saisie manuelle : `source='manuel'`, `valide=true`
- proposition IA : `source='ia'`, `valide=false`
- ne pas forcer `enfant_id` tant que le sélecteur humain n’est pas construit
- l’IA n’extrait jamais un UUID enfant

## Sécurité côté client

Ne jamais faire confiance à :

- `user_id` envoyé par le client
- chemin fichier envoyé sans vérification
- type MIME seul
- taille déclarée seule

## Logs interdits

Ne jamais logger :

- jugement complet
- description sensible
- contenu PDF
- données enfant
- adresse
- informations médicales
- tokens
- clés API
- URLs signées longues

## Checklist avant modification Supabase

- RLS activée ?
- Policies créées ?
- `user_id` protégé ?
- Storage privé ?
- Pas de secret côté client ?
- Requêtes filtrées par utilisateur ?
- Aucun log sensible ?
