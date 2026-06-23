-- ============================================================================
-- Parent Preuve — Migration 013 : limites de taille et types MIME des buckets
-- ----------------------------------------------------------------------------
-- A executer APRES 003_storage_policies.sql.
--
-- Probleme corrige (audit §9.1) :
--   Les buckets "justificatifs" et "preuves" n'ont ni taille maximale ni liste
--   de types MIME autorises. Le controle n'existait qu'en UI (attribut accept),
--   contournable. La base accepte donc tout fichier dont le chemin commence par
--   l'id utilisateur.
--
-- Correction : poser les limites AU NIVEAU BASE (vraie securite, independante
--   du client). Les buckets restent PRIVES (public inchange).
--
--   justificatifs : pieces (factures, certificats, captures, courriers) ->
--     images + PDF, 15 MiB max.
--   preuves       : photos scellees -> images uniquement, 25 MiB max.
--
-- Note : allowed_mime_types est verifie par Storage a l'upload (en-tete et,
--   selon le client, type declare). Ce n'est pas une analyse de contenu, mais
--   cela aligne la securite reelle sur les regles affichees.
--
-- Reversible : remettre file_size_limit / allowed_mime_types a NULL.
-- N'efface aucun fichier existant.
-- ============================================================================

begin;

update storage.buckets
set
  file_size_limit = 15728640, -- 15 MiB
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/gif',
    'application/pdf'
  ]
where id = 'justificatifs';

update storage.buckets
set
  file_size_limit = 26214400, -- 25 MiB
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
where id = 'preuves';

commit;
