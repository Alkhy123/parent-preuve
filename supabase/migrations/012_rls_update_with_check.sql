-- ============================================================================
-- Parent Preuve — Migration 012 : WITH CHECK sur les UPDATE manquants (bloc 7)
-- ----------------------------------------------------------------------------
-- A executer APRES 002_rls_policies.sql.
--
-- Probleme corrige (audit §8) :
--   Huit policies UPDATE n'ont qu'un "using" (ligne lisible = ligne modifiable)
--   mais PAS de "with check" sur les valeurs ECRITES. Sans "with check", une
--   mise a jour peut changer la ligne vers des valeurs que la policy n'autorise
--   pas a l'insertion : en particulier reaffecter user_id a un autre compte, ou
--   (combine a la FK composite 009 (procedure_id, user_id)) deplacer la ligne
--   vers une procedure etrangere connue.
--
-- Correction : ajouter "with check (auth.uid() = user_id)" sur ces huit UPDATE,
--   en conservant a l'identique le "using" existant. L'application met deja
--   toujours user_id = compte courant : aucun parcours legitime n'est impacte.
--
-- Tables concernees (UPDATE sans with check dans 002) :
--   children, documents, dossier, events, expenses, pension_regle,
--   pension_payments, preuves_photo.
--
-- Les autres UPDATE (procedures, decision_regle, dvh_regle, frais_regle,
-- garde_regles, note_brouillon) ont DEJA un with check : on n'y touche pas.
--
-- Idempotent : drop if exists + recreate, avec le meme nom et le meme "using".
-- ============================================================================

begin;

-- ===== children =====
drop policy if exists "Modifier ses enfants" on children;
create policy "Modifier ses enfants" on children
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== documents =====
drop policy if exists "Modifier ses documents" on documents;
create policy "Modifier ses documents" on documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== dossier =====
drop policy if exists "Modifier son dossier" on dossier;
create policy "Modifier son dossier" on dossier
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== events =====
drop policy if exists "Modifier ses événements" on events;
create policy "Modifier ses événements" on events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== expenses =====
drop policy if exists "Modifier ses frais" on expenses;
create policy "Modifier ses frais" on expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== pension_regle =====
drop policy if exists "modifier ses regles de pension" on pension_regle;
create policy "modifier ses regles de pension" on pension_regle
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== pension_payments =====
drop policy if exists "Modifier ses paiements" on pension_payments;
create policy "Modifier ses paiements" on pension_payments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== preuves_photo =====
drop policy if exists "preuves_update_own" on preuves_photo;
create policy "preuves_update_own" on preuves_photo
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
