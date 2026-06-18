-- ============================================================================
-- Parent Preuve — Migration 002 : Row Level Security (RLS) + policies
-- ----------------------------------------------------------------------------
-- À exécuter APRÈS 001_init_schema.sql.
-- Reproduit FIDÈLEMENT les policies réelles (audit du 2026-06-17).
--
-- Principe : chaque utilisateur ne voit/écrit QUE ses propres lignes
--            (auth.uid() = user_id).
--
-- Détails fidèles au réel conservés tels quels :
--   - Les policies n'ont pas de rôle explicite → elles s'appliquent à "public"
--     (c'est le comportement par défaut, identique au catalogue {public}).
--   - SELECT/DELETE utilisent "using" ; INSERT utilise "with check".
--   - UPDATE : certaines tables ont EN PLUS un "with check", d'autres non.
--     Avec "with check" : decision_regle, dvh_regle, frais_regle, garde_regles,
--                         note_brouillon, procedures.
--     Sans "with check"  : children, documents, dossier, events, expenses,
--                         pension_payments, pension_regle, preuves_photo.
--   - Trous VOLONTAIRES (à conserver) :
--       acceptation_politique → INSERT + SELECT seulement (pas d'UPDATE/DELETE)
--       consentements_ia      → INSERT + SELECT + DELETE (pas d'UPDATE : fait daté)
--       ia_appels             → INSERT + SELECT seulement (quota non réinitialisable)
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Activation de RLS sur les 17 tables
-- ----------------------------------------------------------------------------
alter table procedures            enable row level security;
alter table children              enable row level security;
alter table documents             enable row level security;
alter table dossier               enable row level security;
alter table events                enable row level security;
alter table expenses              enable row level security;
alter table decision_regle        enable row level security;
alter table dvh_regle             enable row level security;
alter table frais_regle           enable row level security;
alter table pension_regle         enable row level security;
alter table pension_payments      enable row level security;
alter table garde_regles          enable row level security;
alter table preuves_photo         enable row level security;
alter table acceptation_politique enable row level security;
alter table consentements_ia      enable row level security;
alter table ia_appels             enable row level security;
alter table note_brouillon        enable row level security;

-- ----------------------------------------------------------------------------
-- 2. Policies par table
-- ----------------------------------------------------------------------------

-- ===== procedures (UPDATE avec with check) =====
create policy "procedures_select" on procedures
  for select using (auth.uid() = user_id);
create policy "procedures_insert" on procedures
  for insert with check (auth.uid() = user_id);
create policy "procedures_update" on procedures
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "procedures_delete" on procedures
  for delete using (auth.uid() = user_id);

-- ===== children (UPDATE sans with check) =====
create policy "Lire ses enfants" on children
  for select using (auth.uid() = user_id);
create policy "Ajouter ses enfants" on children
  for insert with check (auth.uid() = user_id);
create policy "Modifier ses enfants" on children
  for update using (auth.uid() = user_id);
create policy "Supprimer ses enfants" on children
  for delete using (auth.uid() = user_id);

-- ===== documents (UPDATE sans with check) =====
create policy "Lire ses documents" on documents
  for select using (auth.uid() = user_id);
create policy "Ajouter ses documents" on documents
  for insert with check (auth.uid() = user_id);
create policy "Modifier ses documents" on documents
  for update using (auth.uid() = user_id);
create policy "Supprimer ses documents" on documents
  for delete using (auth.uid() = user_id);

-- ===== dossier (UPDATE sans with check) =====
create policy "Lire son dossier" on dossier
  for select using (auth.uid() = user_id);
create policy "Créer son dossier" on dossier
  for insert with check (auth.uid() = user_id);
create policy "Modifier son dossier" on dossier
  for update using (auth.uid() = user_id);
create policy "Supprimer son dossier" on dossier
  for delete using (auth.uid() = user_id);

-- ===== events (UPDATE sans with check) =====
create policy "Lire ses événements" on events
  for select using (auth.uid() = user_id);
create policy "Ajouter ses événements" on events
  for insert with check (auth.uid() = user_id);
create policy "Modifier ses événements" on events
  for update using (auth.uid() = user_id);
create policy "Supprimer ses événements" on events
  for delete using (auth.uid() = user_id);

-- ===== expenses (UPDATE sans with check) =====
create policy "Lire ses frais" on expenses
  for select using (auth.uid() = user_id);
create policy "Ajouter ses frais" on expenses
  for insert with check (auth.uid() = user_id);
create policy "Modifier ses frais" on expenses
  for update using (auth.uid() = user_id);
create policy "Supprimer ses frais" on expenses
  for delete using (auth.uid() = user_id);

-- ===== decision_regle (UPDATE avec with check) =====
create policy "decision_regle lire" on decision_regle
  for select using (auth.uid() = user_id);
create policy "decision_regle creer" on decision_regle
  for insert with check (auth.uid() = user_id);
create policy "decision_regle modifier" on decision_regle
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "decision_regle supprimer" on decision_regle
  for delete using (auth.uid() = user_id);

-- ===== dvh_regle (UPDATE avec with check) =====
create policy "dvh_regle lire" on dvh_regle
  for select using (auth.uid() = user_id);
create policy "dvh_regle creer" on dvh_regle
  for insert with check (auth.uid() = user_id);
create policy "dvh_regle modifier" on dvh_regle
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dvh_regle supprimer" on dvh_regle
  for delete using (auth.uid() = user_id);

-- ===== frais_regle (UPDATE avec with check) =====
create policy "frais_regle lire" on frais_regle
  for select using (auth.uid() = user_id);
create policy "frais_regle creer" on frais_regle
  for insert with check (auth.uid() = user_id);
create policy "frais_regle modifier" on frais_regle
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "frais_regle supprimer" on frais_regle
  for delete using (auth.uid() = user_id);

-- ===== pension_regle (UPDATE sans with check) =====
create policy "lire ses regles de pension" on pension_regle
  for select using (auth.uid() = user_id);
create policy "creer ses regles de pension" on pension_regle
  for insert with check (auth.uid() = user_id);
create policy "modifier ses regles de pension" on pension_regle
  for update using (auth.uid() = user_id);
create policy "supprimer ses regles de pension" on pension_regle
  for delete using (auth.uid() = user_id);

-- ===== pension_payments (UPDATE sans with check) =====
create policy "Lire ses paiements" on pension_payments
  for select using (auth.uid() = user_id);
create policy "Ajouter ses paiements" on pension_payments
  for insert with check (auth.uid() = user_id);
create policy "Modifier ses paiements" on pension_payments
  for update using (auth.uid() = user_id);
create policy "Supprimer ses paiements" on pension_payments
  for delete using (auth.uid() = user_id);

-- ===== garde_regles (UPDATE avec with check) =====
create policy "garde_regles_select" on garde_regles
  for select using (auth.uid() = user_id);
create policy "garde_regles_insert" on garde_regles
  for insert with check (auth.uid() = user_id);
create policy "garde_regles_update" on garde_regles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "garde_regles_delete" on garde_regles
  for delete using (auth.uid() = user_id);

-- ===== preuves_photo (UPDATE sans with check) =====
create policy "preuves_select_own" on preuves_photo
  for select using (auth.uid() = user_id);
create policy "preuves_insert_own" on preuves_photo
  for insert with check (auth.uid() = user_id);
create policy "preuves_update_own" on preuves_photo
  for update using (auth.uid() = user_id);
create policy "preuves_delete_own" on preuves_photo
  for delete using (auth.uid() = user_id);

-- ===== note_brouillon (UPDATE avec with check) =====
create policy "note_brouillon_select" on note_brouillon
  for select using (auth.uid() = user_id);
create policy "note_brouillon_insert" on note_brouillon
  for insert with check (auth.uid() = user_id);
create policy "note_brouillon_update" on note_brouillon
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "note_brouillon_delete" on note_brouillon
  for delete using (auth.uid() = user_id);

-- ===== acceptation_politique (trou volontaire : INSERT + SELECT seulement) =====
create policy "lire ses acceptations" on acceptation_politique
  for select using (auth.uid() = user_id);
create policy "enregistrer son acceptation" on acceptation_politique
  for insert with check (auth.uid() = user_id);

-- ===== consentements_ia (trou volontaire : pas d'UPDATE — fait historique daté) =====
create policy "lire ses consentements" on consentements_ia
  for select using (auth.uid() = user_id);
create policy "créer ses consentements" on consentements_ia
  for insert with check (auth.uid() = user_id);
create policy "retirer ses consentements" on consentements_ia
  for delete using (auth.uid() = user_id);

-- ===== ia_appels (trou volontaire : INSERT + SELECT seulement — quota non réinitialisable) =====
create policy "ia_appels_select_own" on ia_appels
  for select using (auth.uid() = user_id);
create policy "ia_appels_insert_own" on ia_appels
  for insert with check (auth.uid() = user_id);

commit;
