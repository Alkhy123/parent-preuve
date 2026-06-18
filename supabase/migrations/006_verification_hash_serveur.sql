-- 006_verification_hash_serveur.sql
-- Recalcul du hash côté serveur pour les preuves photo.
--
-- Le flux actuel calcule l'empreinte SHA-256 côté CLIENT (navigateur) avant
-- l'upload, et la stocke dans empreinte_sha256. Le serveur ne la recalcule pas :
-- il fait confiance au client. Cette migration prépare une vérification serveur,
-- où le serveur retélécharge le fichier réellement stocké, recalcule son
-- empreinte, et la compare à celle d'origine.
--
-- Colonnes ajoutées sur preuves_photo :
--   empreinte_sha256_serveur : empreinte recalculée par le serveur (64 hex), NULL tant que non recalculée.
--   hash_verifie             : résultat de la comparaison.
--                              NULL  = pas encore vérifié,
--                              true  = les deux empreintes coïncident,
--                              false = écart constaté entre client et serveur.
--   hash_verifie_at          : date/heure du recalcul serveur, NULL tant que non fait.
--
-- Pas de DEFAULT et pas de NOT NULL sur hash_verifie : NULL doit rester distinct
-- de false (false = vérifié ET discordant, à ne pas confondre avec « pas encore vérifié »).
-- Pas de CHECK : encadré par le code, conformément à la convention du projet.
--
-- Idempotente (ADD COLUMN IF NOT EXISTS) : rejouable sans danger, sur base
-- vierge (supabase db reset) comme plus tard sur la prod.
-- Aucune policy RLS à ajouter : les policies existantes de preuves_photo
-- couvrent déjà ces colonnes.

alter table public.preuves_photo
  add column if not exists empreinte_sha256_serveur text;

alter table public.preuves_photo
  add column if not exists hash_verifie boolean;

alter table public.preuves_photo
  add column if not exists hash_verifie_at timestamptz;