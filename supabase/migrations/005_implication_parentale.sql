-- 005_implication_parentale.sql
-- Marqueur « implication parentale » : tag de catégorie sur events et documents.
-- Documente un FAIT observable (rendez-vous honoré, démarche faite), jamais une qualification.
--
-- NULL  = ligne non marquée.
-- valeur = catégorie d'implication. Catégories prévues (encadrées par le code,
--          PAS de CHECK, conformément à la convention du projet) :
--          'sante' | 'scolarite' | 'activites' | 'quotidien'
--
-- Idempotente (ADD COLUMN IF NOT EXISTS) : rejouable sans danger, sur base
-- vierge (supabase db reset) comme plus tard sur la prod.
-- Aucune policy RLS à ajouter : les policies existantes de events/documents
-- couvrent déjà cette colonne.

alter table public.events
  add column if not exists implication_categorie text;

alter table public.documents
  add column if not exists implication_categorie text;
