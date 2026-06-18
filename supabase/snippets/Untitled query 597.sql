select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'preuves_photo'
  and column_name in ('empreinte_sha256_serveur', 'hash_verifie', 'hash_verifie_at')
order by column_name;