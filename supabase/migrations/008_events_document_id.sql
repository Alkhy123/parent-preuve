-- 008_events_document_id.sql
-- Pièce jointe (justificatif) liée à un fait du journal.
-- Permet de rattacher une pièce de `documents` à un événement, en miroir de
-- expenses.document_id. La pièce reste valable indépendamment du fait.
--
-- on delete set null : si la pièce est supprimée, le fait reste, simplement
-- détaché (cohérent avec expenses.document_id).
--
-- Idempotente (ADD COLUMN IF NOT EXISTS) : rejouable sans danger, sur base
-- vierge (supabase db reset) comme plus tard sur la prod.
-- Aucune policy RLS à ajouter : les policies existantes de events couvrent
-- déjà cette colonne.

alter table public.events
  add column if not exists document_id uuid
    references public.documents (id) on delete set null;
