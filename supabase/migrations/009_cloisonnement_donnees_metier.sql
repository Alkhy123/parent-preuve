-- 009_cloisonnement_donnees_metier.sql
--
-- Première étape du cloisonnement direct par procédure.
--
-- Cette migration est volontairement additive :
--   - elle ajoute procedure_id en nullable sur les quatre tables métier ;
--   - elle backfille uniquement les rattachements déterministes ;
--   - elle ne supprime, ne duplique et ne déplace aucune ligne ;
--   - elle ne pose pas encore NOT NULL ;
--   - les cas ambigus restent à NULL pour rattachement humain ultérieur.
--
-- Les écritures et lectures applicatives seront adaptées dans les blocs suivants.

begin;

-- ---------------------------------------------------------------------------
-- 1. Colonnes additives
-- ---------------------------------------------------------------------------

alter table public.events
  add column if not exists procedure_id uuid;

alter table public.expenses
  add column if not exists procedure_id uuid;

alter table public.documents
  add column if not exists procedure_id uuid;

alter table public.preuves_photo
  add column if not exists procedure_id uuid;

-- Les requêtes finales filtreront simultanément par propriétaire (RLS) et procédure.
create index if not exists events_user_procedure_idx
  on public.events (user_id, procedure_id);

create index if not exists expenses_user_procedure_idx
  on public.expenses (user_id, procedure_id);

create index if not exists documents_user_procedure_idx
  on public.documents (user_id, procedure_id);

create index if not exists preuves_photo_user_procedure_idx
  on public.preuves_photo (user_id, procedure_id);

-- ---------------------------------------------------------------------------
-- 2. Backfill depuis l'enfant
--
-- La jointure impose le même user_id et vérifie que la procédure appartient
-- réellement à ce même utilisateur. Une relation incohérente reste à NULL.
-- ---------------------------------------------------------------------------

update public.events as e
set procedure_id = c.procedure_id
from public.children as c
join public.procedures as p
  on p.id = c.procedure_id
 and p.user_id = c.user_id
where e.procedure_id is null
  and e.child_id = c.id
  and e.user_id = c.user_id;

update public.expenses as e
set procedure_id = c.procedure_id
from public.children as c
join public.procedures as p
  on p.id = c.procedure_id
 and p.user_id = c.user_id
where e.procedure_id is null
  and e.child_id = c.id
  and e.user_id = c.user_id;

update public.documents as d
set procedure_id = c.procedure_id
from public.children as c
join public.procedures as p
  on p.id = c.procedure_id
 and p.user_id = c.user_id
where d.procedure_id is null
  and d.child_id = c.id
  and d.user_id = c.user_id;

update public.preuves_photo as ph
set procedure_id = c.procedure_id
from public.children as c
join public.procedures as p
  on p.id = c.procedure_id
 and p.user_id = c.user_id
where ph.procedure_id is null
  and ph.enfant_id = c.id
  and ph.user_id = c.user_id;

-- ---------------------------------------------------------------------------
-- 3. Backfill depuis une pièce liée certaine
--
-- Un fait ou un frais sans enfant peut reprendre la procédure de son document
-- déjà rattaché. Une ligne qui possède un enfant non résolu reste volontairement
-- à NULL : le document ne doit pas contredire silencieusement l'enfant.
-- ---------------------------------------------------------------------------

update public.events as e
set procedure_id = d.procedure_id
from public.documents as d
where e.procedure_id is null
  and e.child_id is null
  and e.document_id = d.id
  and e.user_id = d.user_id
  and d.procedure_id is not null;

update public.expenses as e
set procedure_id = d.procedure_id
from public.documents as d
where e.procedure_id is null
  and e.child_id is null
  and e.document_id = d.id
  and e.user_id = d.user_id
  and d.procedure_id is not null;

-- ---------------------------------------------------------------------------
-- 4. Backfill des documents depuis leurs usages convergents
--
-- Un document sans enfant n'est rattaché que si TOUS les faits/frais déjà
-- déterminés qui le référencent convergent vers une seule procédure.
-- ---------------------------------------------------------------------------

with references_certaines as (
  select document_id, user_id, procedure_id
  from public.events
  where document_id is not null
    and procedure_id is not null

  union all

  select document_id, user_id, procedure_id
  from public.expenses
  where document_id is not null
    and procedure_id is not null
),
candidats as (
  select
    document_id,
    user_id,
    (array_agg(distinct procedure_id))[1] as procedure_id
  from references_certaines
  group by document_id, user_id
  having count(distinct procedure_id) = 1
)
update public.documents as d
set procedure_id = c.procedure_id
from candidats as c
where d.procedure_id is null
  and d.child_id is null
  and d.id = c.document_id
  and d.user_id = c.user_id;

-- Deuxième passe : un document devenu certain peut maintenant rattacher un fait
-- ou un frais sans enfant.
update public.events as e
set procedure_id = d.procedure_id
from public.documents as d
where e.procedure_id is null
  and e.child_id is null
  and e.document_id = d.id
  and e.user_id = d.user_id
  and d.procedure_id is not null;

update public.expenses as e
set procedure_id = d.procedure_id
from public.documents as d
where e.procedure_id is null
  and e.child_id is null
  and e.document_id = d.id
  and e.user_id = d.user_id
  and d.procedure_id is not null;

-- ---------------------------------------------------------------------------
-- 5. Utilisateurs ne possédant qu'une seule procédure
--
-- Cette règle ne s'applique qu'aux lignes sans enfant. Une ligne portant un
-- enfant incohérent ou non rattaché reste à NULL pour contrôle humain.
-- ---------------------------------------------------------------------------

with procedure_unique as (
  select user_id, (array_agg(id))[1] as procedure_id
  from public.procedures
  group by user_id
  having count(*) = 1
)
update public.events as e
set procedure_id = p.procedure_id
from procedure_unique as p
where e.procedure_id is null
  and e.child_id is null
  and e.user_id = p.user_id;

with procedure_unique as (
  select user_id, (array_agg(id))[1] as procedure_id
  from public.procedures
  group by user_id
  having count(*) = 1
)
update public.expenses as e
set procedure_id = p.procedure_id
from procedure_unique as p
where e.procedure_id is null
  and e.child_id is null
  and e.user_id = p.user_id;

with procedure_unique as (
  select user_id, (array_agg(id))[1] as procedure_id
  from public.procedures
  group by user_id
  having count(*) = 1
)
update public.documents as d
set procedure_id = p.procedure_id
from procedure_unique as p
where d.procedure_id is null
  and d.child_id is null
  and d.user_id = p.user_id;

with procedure_unique as (
  select user_id, (array_agg(id))[1] as procedure_id
  from public.procedures
  group by user_id
  having count(*) = 1
)
update public.preuves_photo as ph
set procedure_id = p.procedure_id
from procedure_unique as p
where ph.procedure_id is null
  and ph.enfant_id is null
  and ph.user_id = p.user_id;

-- ---------------------------------------------------------------------------
-- 6. Clés composites de référence
--
-- Elles permettent aux clés étrangères suivantes de contrôler à la fois l'id,
-- la procédure et le propriétaire, sans faire confiance au client.
-- ---------------------------------------------------------------------------

create unique index if not exists procedures_id_user_unique
  on public.procedures (id, user_id);

create unique index if not exists children_id_procedure_user_unique
  on public.children (id, procedure_id, user_id);

create unique index if not exists documents_id_procedure_user_unique
  on public.documents (id, procedure_id, user_id);

-- ---------------------------------------------------------------------------
-- 7. La procédure doit appartenir au propriétaire de la ligne
--
-- ON DELETE RESTRICT empêche qu'une suppression transforme silencieusement une
-- donnée rattachée en donnée générale.
-- ---------------------------------------------------------------------------

alter table public.events
  add constraint events_procedure_owner_fk
  foreign key (procedure_id, user_id)
  references public.procedures (id, user_id)
  on delete restrict
  not valid;

alter table public.expenses
  add constraint expenses_procedure_owner_fk
  foreign key (procedure_id, user_id)
  references public.procedures (id, user_id)
  on delete restrict
  not valid;

alter table public.documents
  add constraint documents_procedure_owner_fk
  foreign key (procedure_id, user_id)
  references public.procedures (id, user_id)
  on delete restrict
  not valid;

alter table public.preuves_photo
  add constraint preuves_photo_procedure_owner_fk
  foreign key (procedure_id, user_id)
  references public.procedures (id, user_id)
  on delete restrict
  not valid;

-- Le backfill de ces quatre contraintes est déterministe et contrôlé : elles
-- peuvent être validées immédiatement. Les NULL restent autorisés.
alter table public.events
  validate constraint events_procedure_owner_fk;
alter table public.expenses
  validate constraint expenses_procedure_owner_fk;
alter table public.documents
  validate constraint documents_procedure_owner_fk;
alter table public.preuves_photo
  validate constraint preuves_photo_procedure_owner_fk;

-- ---------------------------------------------------------------------------
-- 8. L'enfant doit appartenir à la même procédure et au même utilisateur
--
-- MATCH SIMPLE (comportement par défaut) laisse les anciennes lignes ambiguës
-- passer lorsque procedure_id est NULL, mais protège toute nouvelle relation
-- complètement renseignée.
-- ---------------------------------------------------------------------------

alter table public.events
  add constraint events_child_procedure_owner_fk
  foreign key (child_id, procedure_id, user_id)
  references public.children (id, procedure_id, user_id)
  not valid;

alter table public.expenses
  add constraint expenses_child_procedure_owner_fk
  foreign key (child_id, procedure_id, user_id)
  references public.children (id, procedure_id, user_id)
  not valid;

alter table public.documents
  add constraint documents_child_procedure_owner_fk
  foreign key (child_id, procedure_id, user_id)
  references public.children (id, procedure_id, user_id)
  not valid;

alter table public.preuves_photo
  add constraint preuves_photo_child_procedure_owner_fk
  foreign key (enfant_id, procedure_id, user_id)
  references public.children (id, procedure_id, user_id)
  not valid;

alter table public.events
  validate constraint events_child_procedure_owner_fk;
alter table public.expenses
  validate constraint expenses_child_procedure_owner_fk;
alter table public.documents
  validate constraint documents_child_procedure_owner_fk;
alter table public.preuves_photo
  validate constraint preuves_photo_child_procedure_owner_fk;

-- ---------------------------------------------------------------------------
-- 9. Une pièce liée doit appartenir à la même procédure
--
-- Ces deux contraintes restent NOT VALID pendant la transition : une ancienne
-- liaison fait/pièce ou frais/pièce peut être incohérente. Elles protègent les
-- nouvelles écritures sans bloquer la migration ; les anciennes incohérences
-- seront résolues avant validation dans un bloc ultérieur.
-- ---------------------------------------------------------------------------

alter table public.events
  add constraint events_document_procedure_owner_fk
  foreign key (document_id, procedure_id, user_id)
  references public.documents (id, procedure_id, user_id)
  not valid;

alter table public.expenses
  add constraint expenses_document_procedure_owner_fk
  foreign key (document_id, procedure_id, user_id)
  references public.documents (id, procedure_id, user_id)
  not valid;

commit;
