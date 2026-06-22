-- Assertions à exécuter après l'application de la migration 009 sur les
-- fixtures 009_legacy_fixtures.sql.

do $$
declare
  proc_a constant uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  proc_b constant uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  proc_c constant uuid := 'cccccccc-0000-0000-0000-000000000003';
begin
  if (select procedure_id from public.events where id = 'e0000000-0000-0000-0000-000000000001') is distinct from proc_a then
    raise exception 'Backfill event depuis enfant incorrect';
  end if;

  if (select procedure_id from public.expenses where id = 'f0000000-0000-0000-0000-000000000001') is distinct from proc_b then
    raise exception 'Backfill expense depuis enfant incorrect';
  end if;

  if (select procedure_id from public.documents where id = 'd0000000-0000-0000-0000-000000000001') is distinct from proc_a then
    raise exception 'Backfill document depuis enfant incorrect';
  end if;

  if (select procedure_id from public.documents where id = 'd0000000-0000-0000-0000-000000000002') is distinct from proc_a then
    raise exception 'Backfill document depuis usages convergents incorrect';
  end if;

  if (select procedure_id from public.preuves_photo where id = '90000000-0000-0000-0000-000000000001') is distinct from proc_b then
    raise exception 'Backfill preuve depuis enfant incorrect';
  end if;

  if (select procedure_id from public.events where id = 'e0000000-0000-0000-0000-000000000003') is distinct from proc_c then
    raise exception 'Backfill mono-procédure event incorrect';
  end if;

  if (select procedure_id from public.preuves_photo where id = '90000000-0000-0000-0000-000000000003') is distinct from proc_c then
    raise exception 'Backfill mono-procédure preuve incorrect';
  end if;

  if (select procedure_id from public.events where id = 'e0000000-0000-0000-0000-000000000002') is not null then
    raise exception 'Un event multi-procédures ambigu ne doit pas être rattaché';
  end if;

  if (select procedure_id from public.preuves_photo where id = '90000000-0000-0000-0000-000000000002') is not null then
    raise exception 'Une preuve multi-procédures ambiguë ne doit pas être rattachée';
  end if;

  if (select procedure_id from public.documents where id = 'd0000000-0000-0000-0000-000000000003') is not null then
    raise exception 'Un document aux usages contradictoires doit rester ambigu';
  end if;

  if (select count(*) from public.events) <> 4
    or (select count(*) from public.expenses) <> 2
    or (select count(*) from public.documents) <> 3
    or (select count(*) from public.preuves_photo) <> 3 then
    raise exception 'Le backfill ne doit ni dupliquer ni supprimer de lignes';
  end if;

  -- Procédure appartenant à un autre utilisateur : refus obligatoire.
  begin
    insert into public.events (
      id, user_id, procedure_id, titre, date_evenement
    ) values (
      'e1000000-0000-0000-0000-000000000001',
      '11111111-1111-1111-1111-111111111111',
      proc_c,
      'Doit être refusé',
      '2026-02-01'
    );
    raise exception 'Une procédure étrangère a été acceptée';
  exception
    when foreign_key_violation then null;
  end;

  -- Enfant d'une autre procédure : refus obligatoire.
  begin
    insert into public.events (
      id, user_id, procedure_id, child_id, titre, date_evenement
    ) values (
      'e1000000-0000-0000-0000-000000000002',
      '11111111-1111-1111-1111-111111111111',
      proc_a,
      'bbbbbbbb-1111-0000-0000-000000000002',
      'Doit être refusé',
      '2026-02-02'
    );
    raise exception 'Un enfant d''une autre procédure a été accepté';
  exception
    when foreign_key_violation then null;
  end;

  -- Document d'une autre procédure : la contrainte NOT VALID protège tout de
  -- même les nouvelles écritures.
  begin
    insert into public.events (
      id, user_id, procedure_id, document_id, titre, date_evenement
    ) values (
      'e1000000-0000-0000-0000-000000000003',
      '11111111-1111-1111-1111-111111111111',
      proc_b,
      'd0000000-0000-0000-0000-000000000001',
      'Doit être refusé',
      '2026-02-03'
    );
    raise exception 'Un document d''une autre procédure a été accepté';
  exception
    when foreign_key_violation then null;
  end;

  -- Une procédure contenant des données ne doit pas pouvoir disparaître.
  begin
    delete from public.procedures where id = proc_a;
    raise exception 'Une procédure contenant des données a été supprimée';
  exception
    when foreign_key_violation then null;
  end;

  -- Le détachement provoqué par la suppression historique d'un enfant ne doit
  -- jamais rendre la donnée générale : son procedure_id direct est conservé.
  delete from public.children
  where id = 'bbbbbbbb-1111-0000-0000-000000000002';

  if (select child_id from public.expenses where id = 'f0000000-0000-0000-0000-000000000001') is not null
    or (select procedure_id from public.expenses where id = 'f0000000-0000-0000-0000-000000000001') is distinct from proc_b
    or (select enfant_id from public.preuves_photo where id = '90000000-0000-0000-0000-000000000001') is not null
    or (select procedure_id from public.preuves_photo where id = '90000000-0000-0000-0000-000000000001') is distinct from proc_b then
    raise exception 'La suppression enfant ne doit pas modifier procedure_id';
  end if;

  raise notice 'Assertions migration 009 réussies';
end
$$;
