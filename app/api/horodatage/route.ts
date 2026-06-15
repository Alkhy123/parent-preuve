// app/api/horodatage/route.ts
// Signature HMAC-SHA256 d'une empreinte de preuve photo (horodatage interne, NON qualifié).
//
// Sécurité (même ordre que les routes IA) : auth (401) -> quota (429) -> traitement.
// - Seul un utilisateur connecté peut appeler la route (jeton Bearer Supabase).
// - Quota anti-abus compté en base (table ia_appels), via la fonction générique
//   verifierQuotaIa : ici la "fonctionnalite" vaut "horodatage". Aucune nouvelle table,
//   aucun nouveau code de quota. Le quota est fail-closed (erreur de comptage -> refus).
//
// Le secret HORODATAGE_SECRET reste strictement côté serveur (jamais NEXT_PUBLIC_).

import { createHmac } from "node:crypto";
import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { verifierQuotaIa } from "@/lib/quotaIa";

// Secret connu du serveur seul. JAMAIS de préfixe NEXT_PUBLIC_,
// sinon il partirait dans le navigateur.
const SECRET = process.env.HORODATAGE_SECRET;

export async function POST(request: Request) {
  // 1. Authentification : seul un utilisateur connecté peut sceller un horodatage.
  const utilisateur = await utilisateurDeLaRequete(request);
  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  // 2. Quota anti-abus (compté en base, par utilisateur) : 30 appels / 60 s.
  //    Opération gratuite côté serveur ; la limite ne sert qu'à empêcher les abus,
  //    tout en laissant sceller plusieurs photos d'affilée.
  const quota = await verifierQuotaIa(request, "horodatage", 30, 60);
  if (!quota.autorise) {
    return Response.json(
      { erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.` },
      { status: 429 }
    );
  }

  // 3. Le secret doit être configuré côté serveur
  if (!SECRET) {
    return Response.json(
      { erreur: "Service d'horodatage non configuré (HORODATAGE_SECRET manquant)." },
      { status: 500 }
    );
  }

  // 4. Lire l'empreinte envoyée par le client
  let empreinte: unknown;
  try {
    const body = await request.json();
    empreinte = body?.empreinte;
  } catch {
    return Response.json({ erreur: "Corps de requête invalide." }, { status: 400 });
  }

  // 5. Valider : une empreinte SHA-256 = 64 caractères hexadécimaux
  if (typeof empreinte !== "string" || !/^[a-f0-9]{64}$/i.test(empreinte)) {
    return Response.json(
      { erreur: "Empreinte SHA-256 attendue (64 caractères hexadécimaux)." },
      { status: 400 }
    );
  }

  // 6. L'heure du serveur fait foi pour la datation
  const date = new Date().toISOString();

  // 7. Signer "empreinte|date" avec le secret → c'est le jeton
  const jeton = createHmac("sha256", SECRET)
    .update(`${empreinte.toLowerCase()}|${date}`)
    .digest("hex");

  // 8. Répondre, en étiquetant honnêtement « non qualifié »
  return Response.json({
    jeton,
    date,
    statut: "non_qualifie",
    prestataire: "interne",
    algorithme: "HMAC-SHA256",
  });
}
