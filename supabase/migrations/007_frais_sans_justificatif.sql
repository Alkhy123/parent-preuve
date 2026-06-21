-- 007_frais_sans_justificatif.sql
-- Marqueur « frais volontairement sans justificatif » sur expenses.
-- Documente un CHOIX explicite de l'utilisateur (bouton « Non, pas de justificatif »),
-- pour distinguer un frais qui n'a pas encore de justificatif d'un frais qui n'en
-- aura pas. Le widget d'accueil exclut les frais marqués sans_justificatif = true.
--
-- false = état par défaut (frais à rattacher tant qu'aucune pièce n'est liée).
-- true  = l'utilisateur a explicitement indiqué qu'il n'y a pas de justificatif.
--
-- Idempotente (ADD COLUMN IF NOT EXISTS) : rejouable sans danger, sur base
-- vierge (supabase db reset) comme plus tard sur la prod.
-- Aucune policy RLS à ajouter : les policies existantes de expenses couvrent
-- déjà cette colonne.

alter table public.expenses
  add column if not exists sans_justificatif boolean not null default false;
