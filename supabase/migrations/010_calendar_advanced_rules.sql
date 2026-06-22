-- 010_calendar_advanced_rules.sql
-- Règles de garde AVANCÉES (en plus de la règle de base garde_regles).
-- Permet de persister, par enfant, des règles supplémentaires du moteur avancé
-- (ex. le mercredi, une semaine alternée), sans toucher à garde_regles.
--
-- Idempotente : create table if not exists + drop policy if exists.
-- RLS : chaque utilisateur ne voit/écrit que ses lignes (auth.uid() = user_id).
-- UPDATE avec with check, comme garde_regles.

begin;

create table if not exists public.calendar_advanced_rules (
  id             uuid        not null default gen_random_uuid(),
  user_id        uuid        not null default auth.uid()
                             references auth.users (id) on delete cascade,
  enfant_id      uuid        not null
                             references public.children (id) on delete cascade,
  type           text        not null
                             check (type = any (array['hebdomadaire','weekend_alterne','semaines_alternees'])),
  jour_debut     smallint,
  heure_debut    time,
  jour_fin       smallint,
  heure_fin      time,
  date_reference date,
  heure_bascule  time,
  chez_qui       text        not null
                             check (chez_qui = any (array['moi','autre'])),
  actif          boolean     not null default true,
  notes          text,
  created_at     timestamptz not null default now(),
  primary key (id)
);

alter table public.calendar_advanced_rules enable row level security;

drop policy if exists "car_select" on public.calendar_advanced_rules;
drop policy if exists "car_insert" on public.calendar_advanced_rules;
drop policy if exists "car_update" on public.calendar_advanced_rules;
drop policy if exists "car_delete" on public.calendar_advanced_rules;

create policy "car_select" on public.calendar_advanced_rules
  for select using (auth.uid() = user_id);
create policy "car_insert" on public.calendar_advanced_rules
  for insert with check (auth.uid() = user_id);
create policy "car_update" on public.calendar_advanced_rules
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "car_delete" on public.calendar_advanced_rules
  for delete using (auth.uid() = user_id);

commit;
