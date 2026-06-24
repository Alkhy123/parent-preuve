-- ============================================================================
-- Parent Preuve — Migration 014 : journal d'audit minimal (bloc P1-B)
-- ----------------------------------------------------------------------------
-- A executer APRES 001_init_schema.sql (depend de auth.users et procedures).
--
-- Objectif : tracer les actions sensibles (creation de preuve, horodatage,
-- verification d'integrite, generation d'export...) de maniere MINIMALE.
--
-- RGPD / AGENTS.md §12 : ce journal ne contient QUE des informations techniques
--   (type d'action, identifiant de cible, compteurs). Il ne doit JAMAIS recevoir
--   de contenu familial : pas de titre, pas de description, pas de nom d'enfant,
--   pas de GPS, pas d'empreinte. La colonne metadonnees est reservee a des
--   valeurs techniques (compteurs, booleens de resultat).
--
-- Portee : trace applicative minimale, NON infalsifiable (ecrite cote client
--   sous RLS). Ce n'est pas un journal forensique. A ne pas survendre.
--
-- Cloisonnement : la suppression de compte purge cette table (user_id), et le
--   user_id reference auth.users on delete cascade en filet de securite.
-- ============================================================================

begin;

create table if not exists public.audit_log (
  id            uuid        not null default gen_random_uuid(),
  user_id       uuid        not null references auth.users (id) on delete cascade,
  action        text        not null,
  cible_type    text,
  cible_id      uuid,
  procedure_id  uuid        references public.procedures (id) on delete set null,
  metadonnees   jsonb,
  created_at    timestamptz not null default now(),
  primary key (id)
);

create index if not exists audit_log_user_created_idx
  on public.audit_log (user_id, created_at desc);

alter table public.audit_log enable row level security;

-- Append-only du point de vue de l'utilisateur : il peut lire et inserer ses
-- propres lignes, mais aucune policy UPDATE/DELETE n'est creee (modification ou
-- suppression impossibles cote client). La purge RGPD passe par le service_role.
drop policy if exists "Lire son journal d'audit" on public.audit_log;
create policy "Lire son journal d'audit" on public.audit_log
  for select using (auth.uid() = user_id);

drop policy if exists "Inserer dans son journal d'audit" on public.audit_log;
create policy "Inserer dans son journal d'audit" on public.audit_log
  for insert with check (auth.uid() = user_id);

commit;
