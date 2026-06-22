-- 011_calendar_exceptions.sql
-- Exceptions manuelles de garde, par enfant (ex. un week-end inversé).
-- Prioritaires sur les règles dans le moteur avancé. Sans toucher garde_regles.
--
-- Idempotente : create table if not exists + drop policy if exists.
-- RLS : chaque utilisateur ne voit/écrit que ses lignes (auth.uid() = user_id).
-- UPDATE avec with check, comme garde_regles.

begin;

create table if not exists public.calendar_exceptions (
  id          uuid        not null default gen_random_uuid(),
  user_id     uuid        not null default auth.uid()
                          references auth.users (id) on delete cascade,
  enfant_id   uuid        not null
                          references public.children (id) on delete cascade,
  date_debut  date        not null,
  date_fin    date        not null,
  chez_qui    text        not null
                          check (chez_qui = any (array['moi','autre'])),
  motif       text,
  created_at  timestamptz not null default now(),
  primary key (id)
);

alter table public.calendar_exceptions enable row level security;

drop policy if exists "cex_select" on public.calendar_exceptions;
drop policy if exists "cex_insert" on public.calendar_exceptions;
drop policy if exists "cex_update" on public.calendar_exceptions;
drop policy if exists "cex_delete" on public.calendar_exceptions;

create policy "cex_select" on public.calendar_exceptions
  for select using (auth.uid() = user_id);
create policy "cex_insert" on public.calendar_exceptions
  for insert with check (auth.uid() = user_id);
create policy "cex_update" on public.calendar_exceptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cex_delete" on public.calendar_exceptions
  for delete using (auth.uid() = user_id);

commit;
