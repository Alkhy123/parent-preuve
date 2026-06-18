select id, hash_verifie, empreinte_sha256 = empreinte_sha256_serveur as identiques, hash_verifie_at
from preuves_photo
order by created_at desc
limit 1;