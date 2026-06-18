-- ============================================================================
-- Parent Preuve — Migration 004 : index explicites
-- ----------------------------------------------------------------------------
-- À exécuter APRÈS 003_storage_policies.sql.
-- Reproduit FIDÈLEMENT les 7 index explicites du réel (audit du 2026-06-17).
--
-- Ne sont PAS répétés ici les index automatiques :
--   - index de clé primaire (<table>_pkey) → créés par 001
--   - index UNIQUE (dossier_user_id_key, note_brouillon_user_id_key) → créés par 001
-- PostgreSQL les a déjà générés tout seul avec les contraintes.
--
-- Les 7 index ci-dessous accélèrent les lectures :
--   - 6 index sur procedure_id : le cloisonnement par procédure filtre
--     en permanence ces tables sur cette colonne.
--   - 1 index composite sur ia_appels (user_id, created_at DESC) : sert au
--     calcul du quota anti-abus (compter les appels récents d'un utilisateur).
--
-- "if not exists" : sans effet si l'index existe déjà (rejouable sans erreur).
-- ============================================================================

begin;

-- 1. children.procedure_id
create index if not exists children_procedure_id_idx
  on children using btree (procedure_id);

-- 2. decision_regle.procedure_id
create index if not exists decision_regle_procedure_id_idx
  on decision_regle using btree (procedure_id);

-- 3. dvh_regle.procedure_id
create index if not exists dvh_regle_procedure_id_idx
  on dvh_regle using btree (procedure_id);

-- 4. frais_regle.procedure_id
create index if not exists frais_regle_procedure_id_idx
  on frais_regle using btree (procedure_id);

-- 5. pension_payments.procedure_id
create index if not exists pension_payments_procedure_id_idx
  on pension_payments using btree (procedure_id);

-- 6. pension_regle.procedure_id
create index if not exists pension_regle_procedure_id_idx
  on pension_regle using btree (procedure_id);

-- 7. ia_appels (user_id, created_at DESC) — index composite pour le quota
create index if not exists ia_appels_user_created_idx
  on ia_appels using btree (user_id, created_at desc);

commit;
