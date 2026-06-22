-- Fixtures locales représentant l'état AVANT la migration 009.
-- À charger après `supabase db reset --version 008`.
-- Identifiants fictifs, aucune donnée réelle.

insert into auth.users (instance_id, id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'migration-u1@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'migration-u2@example.test', now(), now());

insert into public.procedures (id, user_id, etiquette)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Procédure A'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Procédure B'),
  ('cccccccc-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Procédure C');

insert into public.children (id, user_id, prenom_ou_alias, procedure_id)
values
  ('aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Enfant A', 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('bbbbbbbb-1111-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Enfant B', 'bbbbbbbb-0000-0000-0000-000000000002'),
  ('cccccccc-2222-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Enfant C', 'cccccccc-0000-0000-0000-000000000003');

insert into public.documents (id, user_id, child_id, libelle, chemin_fichier)
values
  ('d0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-0000-0000-000000000001', 'Document enfant A', 'fixtures/doc-a.pdf'),
  ('d0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', null, 'Document lié uniquement à A', 'fixtures/doc-lie-a.pdf'),
  ('d0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', null, 'Document aux usages contradictoires', 'fixtures/doc-conflit.pdf');

insert into public.events (
  id, user_id, child_id, document_id, titre, date_evenement
)
values
  ('e0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Événement A', '2026-01-01'),
  ('e0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', null, null, 'Événement ambigu U1', '2026-01-02'),
  ('e0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', null, null, 'Événement mono-procédure U2', '2026-01-03'),
  ('e0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Événement A avec document conflictuel', '2026-01-04');

insert into public.expenses (
  id, user_id, child_id, document_id, libelle, montant, date_frais
)
values
  ('f0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-1111-0000-0000-000000000002', null, 'Frais B', 10, '2026-01-01'),
  ('f0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-1111-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 'Frais B avec document conflictuel', 20, '2026-01-02');

insert into public.preuves_photo (id, user_id, enfant_id, titre)
values
  ('90000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-1111-0000-0000-000000000002', 'Preuve B'),
  ('90000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', null, 'Preuve ambiguë U1'),
  ('90000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', null, 'Preuve mono-procédure U2');
