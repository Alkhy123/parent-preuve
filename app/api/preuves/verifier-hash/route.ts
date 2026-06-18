// app/api/preuves/verifier-hash/route.ts
// Vérifie CÔTÉ SERVEUR l'intégrité d'une preuve photo.
//
// Idée : l'empreinte stockée (empreinte_sha256) a été calculée par le NAVIGATEUR
// avant l'upload. Ici, le serveur retélécharge le fichier RÉELLEMENT stocké,
// recalcule son empreinte, et compare. Si les deux coïncident, on a la preuve
// que le fichier stocké correspond bien à l'empreinte d'origine.
//
// ⚠️ Portée exacte : cela démontre l'INTÉGRITÉ TECHNIQUE (le fichier n'a pas été
// altéré depuis le calcul initial). Ce n'est pas un constat, ni une garantie de
// recevabilité. Le résultat est un simple booléen factuel.
//
// Sécurité (même ordre que /api/horodatage) : auth (401) -> quota (429) -> traitement.
// supabaseAdmin CONTOURNE la RLS : on filtre donc TOUJOURS par user_id pour qu'un
// utilisateur ne puisse vérifier que SES propres preuves.

import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifierQuotaIa } from "@/lib/quotaIa";
import { calculerSha256Hex, empreintesConcordent } from "@/lib/hashServeur";

// crypto.createHash est une API Node : on force le runtime Node (pas Edge).
export const runtime = "nodejs";

// Format d'un UUID (les id de preuves_photo). Évite d'appeler la base avec n'importe quoi.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // 1. Auth : seul un utilisateur connecté peut appeler la route.
  const utilisateur = await utilisateurDeLaRequete(request);
  if (!utilisateur) {
    return Response.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  // 2. Quota : limite les appels (compteur distinct de l'horodatage).
  const quota = await verifierQuotaIa(request, "verification_hash", 30, 60);
  if (!quota.autorise) {
    return Response.json(
      { erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.` },
      { status: 429 }
    );
  }

  // 3. Lire et valider l'id de la preuve.
  let id: unknown;
  try {
    const body = await request.json();
    id = body?.id;
  } catch {
    return Response.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  if (typeof id !== "string" || !UUID.test(id)) {
    return Response.json({ erreur: "Identifiant de preuve invalide." }, { status: 400 });
  }

  // 4. Charger la preuve — filtrée par user_id (supabaseAdmin contourne la RLS).
  const { data: preuve, error: errLecture } = await supabaseAdmin
    .from("preuves_photo")
    .select("id, user_id, storage_path, empreinte_sha256")
    .eq("id", id)
    .eq("user_id", utilisateur.id)
    .maybeSingle();

  if (errLecture) {
    return Response.json({ erreur: "Erreur de lecture." }, { status: 500 });
  }
  if (!preuve) {
    // Soit elle n'existe pas, soit elle n'appartient pas à l'utilisateur : même réponse.
    return Response.json({ erreur: "Preuve introuvable." }, { status: 404 });
  }
  if (!preuve.storage_path || !preuve.empreinte_sha256) {
    return Response.json(
      { erreur: "Preuve incomplète : impossible de vérifier l'empreinte." },
      { status: 422 }
    );
  }

  // 5. Télécharger le fichier réellement stocké dans le bucket privé "preuves".
  const { data: blob, error: errFichier } = await supabaseAdmin.storage
    .from("preuves")
    .download(preuve.storage_path);

  if (errFichier || !blob) {
    return Response.json({ erreur: "Fichier introuvable dans le stockage." }, { status: 502 });
  }

  // 6. Recalculer l'empreinte côté serveur.
  const contenu = await blob.arrayBuffer();
  const empreinteServeur = calculerSha256Hex(contenu);

  // 7. Comparer à l'empreinte d'origine (calculée par le client).
  const concordant = empreintesConcordent(empreinteServeur, preuve.empreinte_sha256);

  // 8. Enregistrer le résultat — toujours filtré par user_id.
  const { error: errMaj } = await supabaseAdmin
    .from("preuves_photo")
    .update({
      empreinte_sha256_serveur: empreinteServeur,
      hash_verifie: concordant,
      hash_verifie_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", utilisateur.id);

  if (errMaj) {
    return Response.json({ erreur: "Erreur d'enregistrement du résultat." }, { status: 500 });
  }

  // 9. Renvoyer le résultat factuel.
  return Response.json({
    hash_verifie: concordant,
    empreinte_sha256_serveur: empreinteServeur,
  });
}