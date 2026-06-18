-- ============================================================================
-- Parent Preuve — Migration 001 : schéma initial
-- ----------------------------------------------------------------------------
-- Reproduit FIDÈLEMENT le schéma réel capturé via l'audit du 2026-06-17.
-- Aucun nettoyage : les redondances héritées (ex. documents.archive +
-- documents.etat) sont conservées telles quelles.
--
-- Contenu :
--   - 1 extension (gen_random_uuid)
--   - 17 CREATE TABLE dans l'ordre de dépendance
--   - clés primaires (PK), 2 CHECK réels, 2 UNIQUE, toutes les clés étrangères
--
-- NON inclus ici (fichiers suivants) :
--   - 002_rls_policies.sql   → ENABLE RLS + policies
--   - 003_storage_policies.sql → buckets + policies storage
--   - 004_indexes.sql        → les 7 index explicites
--
-- Remarque sur les noms de contraintes :
--   Les contraintes sont déclarées « en ligne » sans nom explicite.
--   PostgreSQL régénère alors automatiquement EXACTEMENT les mêmes noms
--   que le réel : <table>_pkey, <table>_<col>_fkey, <table>_<col>_key,
--   <table>_<col>_check. C'est donc fidèle ET lisible.
-- ============================================================================

begin;

-- Fournit gen_random_uuid(). Déjà présent sur un projet Supabase :
-- "if not exists" rend l'instruction sans effet si l'extension existe déjà.
create extension if not exists pgcrypto with schema extensions;

-- ============================================================================
-- 1. procedures  (conteneur central — ne dépend que de auth.users)
-- ============================================================================
create table procedures (
  id                       uuid        not null default gen_random_uuid(),
  user_id                  uuid        not null default auth.uid()
                                       references auth.users (id) on delete cascade,
  created_at               timestamptz not null default now(),
  autre_parent_civilite    text,
  autre_parent_nom         text,
  autre_parent_prenom      text,
  autre_parent_adresse     text,
  autre_parent_code_postal text,
  autre_parent_ville       text,
  jugement_juridiction     text,
  jugement_date            date,
  jugement_numero_rg       text,
  jugement_intitule        text,
  etiquette                text,
  primary key (id)
);

-- ============================================================================
-- 2. children  (dépend de procedures)
-- ============================================================================
create table children (
  id              uuid        not null default gen_random_uuid(),
  user_id         uuid        not null default auth.uid()
                              references auth.users (id) on delete cascade,
  prenom_ou_alias text        not null,
  date_naissance  date,
  notes           text,
  created_at      timestamptz not null default now(),
  procedure_id    uuid        references procedures (id) on delete set null,
  primary key (id)
);

-- ============================================================================
-- 3. documents  (dépend de children)
-- ============================================================================
create table documents (
  id            uuid        not null default gen_random_uuid(),
  user_id       uuid        not null default auth.uid()
                            references auth.users (id) on delete cascade,
  child_id      uuid        references children (id) on delete set null,
  libelle       text        not null,
  categorie     text        not null default 'Autre',
  chemin_fichier text       not null,
  date_document date,
  created_at    timestamptz not null default now(),
  archive       boolean     not null default false,
  etat          text        not null default 'actif'
                            check (etat = any (array['actif', 'archive', 'a_traiter'])),
  primary key (id)
);

-- ============================================================================
-- 4. dossier  (socle déclarant — 1 ligne par utilisateur → UNIQUE user_id)
-- ============================================================================
create table dossier (
  id                  uuid        not null default gen_random_uuid(),
  user_id             uuid        not null default auth.uid()
                                  references auth.users (id) on delete cascade
                                  unique,
  declarant_civilite  text,
  declarant_nom       text,
  declarant_prenom    text,
  declarant_adresse   text,
  declarant_code_postal text,
  declarant_ville     text,
  declarant_email     text,
  declarant_telephone text,
  created_at          timestamptz not null default now(),
  primary key (id)
);

-- ============================================================================
-- 5. events  (journal — dépend de children)
-- ============================================================================
create table events (
  id                   uuid        not null default gen_random_uuid(),
  user_id              uuid        not null default auth.uid()
                                   references auth.users (id) on delete cascade,
  child_id             uuid        references children (id) on delete set null,
  titre                text        not null,
  categorie            text        not null default 'autre',
  date_evenement       date        not null,
  heure_evenement      time,
  description_factuelle text,
  statut               text        not null default 'brouillon'
                                   check (statut = any (array['brouillon', 'valide', 'exporte'])),
  created_at           timestamptz not null default now(),
  primary key (id)
);

-- ============================================================================
-- 6. expenses  (frais — dépend de documents et children)
-- ============================================================================
create table expenses (
  id          uuid          not null default gen_random_uuid(),
  user_id     uuid          not null default auth.uid()
                            references auth.users (id) on delete cascade,
  child_id    uuid          references children (id) on delete set null,
  libelle     text          not null,
  categorie   text          not null default 'Autre',
  montant     numeric(10,2) not null,
  part_autre  numeric(10,2) not null default 0,
  date_frais  date          not null,
  rembourse   boolean       not null default false,
  created_at  timestamptz   not null default now(),
  document_id uuid          references documents (id) on delete set null,
  primary key (id)
);

-- ============================================================================
-- 7. decision_regle  (dépend de children et procedures)
-- ============================================================================
create table decision_regle (
  id                     uuid        not null default gen_random_uuid(),
  user_id                uuid        not null default auth.uid()
                                     references auth.users (id) on delete cascade,
  enfant_id              uuid        references children (id) on delete set null,
  type_decision          text,
  provisoire             boolean     not null default false,
  execution_provisoire   boolean     not null default false,
  susceptible_appel      boolean     not null default false,
  frappee_appel          boolean     not null default false,
  appel_date             date,
  appel_juridiction      text,
  date_decision          date,
  date_signification     date,
  date_audience_prochaine date,
  mise_en_etat           boolean     not null default false,
  mise_en_etat_details   text,
  notes                  text,
  source                 text        not null default 'manuel',
  valide                 boolean     not null default true,
  actif                  boolean     not null default true,
  created_at             timestamptz not null default now(),
  procedure_id           uuid        references procedures (id) on delete set null,
  primary key (id)
);

-- ============================================================================
-- 8. dvh_regle  (dépend de children et procedures)
-- ============================================================================
create table dvh_regle (
  id                          uuid        not null default gen_random_uuid(),
  user_id                     uuid        not null default auth.uid()
                                          references auth.users (id) on delete cascade,
  enfant_id                   uuid        references children (id) on delete set null,
  type_dvh                    text,
  titulaire                   text,
  lieu_visite                 text,
  presence_tiers              boolean     not null default false,
  tiers_details               text,
  frequence                   text,
  duree                       text,
  duree_limitee               boolean     not null default false,
  clause_renonciation         boolean     not null default false,
  clause_renonciation_details text,
  remise_lieu                 text,
  vacances_partage            text,
  notes                       text,
  source                      text        not null default 'manuel',
  valide                      boolean     not null default true,
  actif                       boolean     not null default true,
  created_at                  timestamptz not null default now(),
  procedure_id                uuid        references procedures (id) on delete set null,
  primary key (id)
);

-- ============================================================================
-- 9. frais_regle  (dépend de children et procedures)
-- ============================================================================
create table frais_regle (
  id                       uuid        not null default gen_random_uuid(),
  user_id                  uuid        not null default auth.uid()
                                       references auth.users (id) on delete cascade,
  enfant_id                uuid        references children (id) on delete set null,
  categories_couvertes     text,
  part_moi_pourcentage     numeric,
  part_autre_pourcentage   numeric,
  accord_prealable_requis  boolean     not null default false,
  accord_prealable_seuil   numeric,
  delai_remboursement_jours integer,
  justificatif_obligatoire boolean     not null default true,
  s_ajoute_a_pension       boolean     not null default false,
  notes                    text,
  source                   text        not null default 'manuel',
  valide                   boolean     not null default true,
  actif                    boolean     not null default true,
  created_at               timestamptz not null default now(),
  procedure_id             uuid        references procedures (id) on delete set null,
  primary key (id)
);

-- ============================================================================
-- 10. pension_regle  (dépend de children et procedures)
-- ============================================================================
create table pension_regle (
  id                       uuid        not null default gen_random_uuid(),
  user_id                  uuid        not null default auth.uid()
                                       references auth.users (id) on delete cascade,
  enfant_id                uuid        references children (id) on delete set null,
  montant_base             numeric     not null,
  montant_courant          numeric,
  debiteur                 text        not null default 'autre',
  jour_echeance            integer,
  paiement_avance          boolean     not null default false,
  inclut_vacances          boolean     not null default false,
  intermediation           boolean     not null default false,
  indexation_active        boolean     not null default false,
  indexation_jour          integer,
  indexation_mois          integer,
  indexation_premiere_date date,
  indexation_indice        text,
  source                   text        not null default 'manuel',
  valide                   boolean     not null default true,
  actif                    boolean     not null default true,
  notes                    text,
  created_at               timestamptz not null default now(),
  procedure_id             uuid        references procedures (id) on delete set null,
  primary key (id)
);

-- ============================================================================
-- 11. pension_payments  (dépend de procedures — pas de child_id)
-- ============================================================================
create table pension_payments (
  id           uuid          not null default gen_random_uuid(),
  user_id      uuid          not null default auth.uid()
                             references auth.users (id) on delete cascade,
  mois_du      date          not null,
  montant_du   numeric(10,2) not null,
  montant_paye numeric(10,2) not null default 0,
  date_paiement date,
  notes        text,
  created_at   timestamptz   not null default now(),
  procedure_id uuid          references procedures (id) on delete set null,
  primary key (id)
);

-- ============================================================================
-- 12. garde_regles  (dépend de children — enfant_id en CASCADE ici)
-- ============================================================================
create table garde_regles (
  id               uuid        not null default gen_random_uuid(),
  user_id          uuid        not null default auth.uid()
                               references auth.users (id) on delete cascade,
  enfant_id        uuid        not null
                               references children (id) on delete cascade,
  type_garde       text        not null default 'weekend_sur_deux',
  parent_principal text        not null default 'autre',
  date_reference   date        not null,
  jour_debut       smallint    not null default 5,
  heure_debut      time        not null default '18:00:00'::time,
  jour_fin         smallint    not null default 7,
  heure_fin        time        not null default '18:00:00'::time,
  source           text        not null default 'manuel',
  valide           boolean     not null default true,
  actif            boolean     not null default true,
  notes            text,
  created_at       timestamptz not null default now(),
  primary key (id)
);

-- ============================================================================
-- 13. preuves_photo  (dépend de children)
-- ============================================================================
create table preuves_photo (
  id                    uuid             not null default gen_random_uuid(),
  user_id               uuid             not null default auth.uid()
                                         references auth.users (id) on delete cascade,
  created_at            timestamptz      not null default now(),
  titre                 text,
  description           text,
  enfant_id             uuid             references children (id) on delete set null,
  storage_path          text,
  nom_fichier           text,
  type_fichier          text,
  taille_octets         bigint,
  empreinte_sha256      text,
  metadonnees           jsonb,
  gps_latitude          double precision,
  gps_longitude         double precision,
  gps_precision_metres  double precision,
  heure_appareil        timestamptz,
  ecart_heure_secondes  integer,
  anomalies             jsonb,
  horodatage_jeton      text,
  horodatage_date       timestamptz,
  horodatage_statut     text,
  horodatage_prestataire text,
  horodatage_algorithme text,
  primary key (id)
);

-- ============================================================================
-- 14. acceptation_politique  (⚠️ pas de FK sur user_id dans le réel)
-- ============================================================================
create table acceptation_politique (
  id          uuid        not null default gen_random_uuid(),
  user_id     uuid        not null default auth.uid(),
  version     text        not null,
  accepted_at timestamptz not null default now(),
  primary key (id)
);

-- ============================================================================
-- 15. consentements_ia  (⚠️ FK user_id SANS on delete cascade dans le réel)
-- ============================================================================
create table consentements_ia (
  id             uuid        not null default gen_random_uuid(),
  user_id        uuid        not null default auth.uid()
                             references auth.users (id),
  fonctionnalite text        not null,
  accepte_le     timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  primary key (id)
);

-- ============================================================================
-- 16. ia_appels  (quota anti-abus durable)
-- ============================================================================
create table ia_appels (
  id             uuid        not null default gen_random_uuid(),
  user_id        uuid        not null default auth.uid()
                             references auth.users (id) on delete cascade,
  fonctionnalite text        not null,
  created_at     timestamptz not null default now(),
  primary key (id)
);

-- ============================================================================
-- 17. note_brouillon  (⚠️ pas de FK sur user_id, mais UNIQUE user_id)
-- ============================================================================
create table note_brouillon (
  id         uuid        not null default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() unique,
  contenu    text        not null default '',
  volets     jsonb,
  valeurs    jsonb,
  pieces_ids jsonb,
  updated_at timestamptz not null default now(),
  primary key (id)
);

commit;
