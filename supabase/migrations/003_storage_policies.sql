-- ============================================================================
-- Parent Preuve — Migration 003 : Storage (buckets + policies)
-- ----------------------------------------------------------------------------
-- À exécuter APRÈS 002_rls_policies.sql.
-- Reproduit FIDÈLEMENT le Storage réel (audit du 2026-06-17).
--
-- 2 buckets PRIVÉS (public = false) : justificatifs, preuves
-- 6 policies sur storage.objects (3 par bucket) :
--     SELECT (lire) + INSERT (envoyer) + DELETE (supprimer)
--   PAS de policy UPDATE → les fichiers déjà envoyés ne sont jamais modifiés
--   (originaux scellés, notamment pour les preuves photo).
--
-- Cloisonnement : le 1er dossier du chemin doit être l'identifiant de
--   l'utilisateur → (storage.foldername(name))[1] = (auth.uid())::text
--   Exemple de chemin attendu : <user_id>/<...>/<fichier>
--
-- Note : la table storage.objects a déjà RLS activé par défaut sur Supabase ;
--   il n'y a donc rien à activer ici, seulement les policies à créer.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Les 2 buckets privés
--    file_size_limit et allowed_mime_types laissés à null (= valeurs réelles).
--    "on conflict do nothing" : sans effet si les buckets existent déjà
--    (par ex. créés auparavant via l'interface Supabase).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('justificatifs', 'justificatifs', false),
  ('preuves',       'preuves',       false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. Policies sur storage.objects
-- ----------------------------------------------------------------------------

-- ===== Bucket "justificatifs" (lire / envoyer / supprimer) =====
create policy "Lire ses fichiers justificatifs" on storage.objects
  for select
  using (
    bucket_id = 'justificatifs'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

create policy "Envoyer ses fichiers justificatifs" on storage.objects
  for insert
  with check (
    bucket_id = 'justificatifs'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

create policy "Supprimer ses fichiers justificatifs" on storage.objects
  for delete
  using (
    bucket_id = 'justificatifs'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

-- ===== Bucket "preuves" (lire / envoyer / supprimer — PAS d'UPDATE) =====
create policy "preuves_storage_select" on storage.objects
  for select
  using (
    bucket_id = 'preuves'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

create policy "preuves_storage_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'preuves'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

create policy "preuves_storage_delete" on storage.objects
  for delete
  using (
    bucket_id = 'preuves'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

commit;
