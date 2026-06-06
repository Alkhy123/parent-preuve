---
name: supabase-safe-migrations
description: À utiliser pour créer ou modifier les migrations Supabase/PostgreSQL du projet Parent Preuve, avec RLS, sécurité et conservation des données.
---

# Supabase Safe Migrations — Parent Preuve

## Objectif

Créer des migrations Supabase propres, sûres, compatibles avec RLS et adaptées à des données sensibles.

Cette skill doit être utilisée pour :

- ajouter une table
- ajouter une colonne
- modifier un schéma
- ajouter un lien entre tables
- ajouter une policy RLS
- modifier Storage
- préparer une migration de production

## Règles absolues

- Ne jamais désactiver RLS définitivement.
- Ne jamais exposer la service role key côté client.
- Ne jamais supprimer une table ou colonne sans confirmation explicite.
- Ne jamais casser les données existantes.
- Toujours penser rollback ou correction.
- Toujours créer les policies RLS avec la table.
- Toujours protéger les données par `user_id`.

## Convention projet

Tables :

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid not null default auth.uid(),
created_at timestamptz not null default now()
```

RLS :

```sql
alter table nom_table enable row level security;
```

Policies :

```sql
create policy "Users can read own rows"
on nom_table
for select
using (auth.uid() = user_id);

create policy "Users can insert own rows"
on nom_table
for insert
with check (auth.uid() = user_id);

create policy "Users can update own rows"
on nom_table
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own rows"
on nom_table
for delete
using (auth.uid() = user_id);
```

## Modifications fréquentes à venir

Le backlog Parent Preuve prévoit notamment :

- gérer `enfant_id` dans les tables règles
- ajouter `statut` sur `events`
- lier `expenses` à un justificatif/document
- archiver les courriers
- journal d’horodatage
- QR de vérification
- règles par enfant
- indexation pension
- reste dû global

## Migration prudente

Pour une colonne nouvelle :

1. ajouter la colonne nullable
2. adapter le code
3. migrer les données si nécessaire
4. rendre obligatoire seulement plus tard si besoin

Exemple :

```sql
alter table events
add column statut text not null default 'valide'
check (statut in ('brouillon', 'valide', 'exporte'));
```

## Foreign keys

Toujours réfléchir à `on delete`.

Exemples :

- enfant supprimé : `on delete set null` si on veut garder l’historique
- utilisateur supprimé : `on delete cascade`
- document supprimé : ne pas supprimer forcément le frais

## Données sensibles

Ne pas créer :

- table publique
- vue publique
- policy trop large
- champ contenant des secrets
- colonne inutilement sensible

## Tests à demander

Après migration :

- insérer une ligne connecté
- lire ses lignes
- vérifier qu’un autre utilisateur ne lit pas
- update
- delete si applicable
- vérifier Storage si concerné

## Réponse attendue de Claude

Quand cette skill est utilisée, répondre avec :

1. Migration SQL proposée
2. Explication simple
3. Risques éventuels
4. Requêtes de test
5. Fichiers front/back à modifier ensuite
