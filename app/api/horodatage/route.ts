import { createHmac } from "node:crypto";

// Secret connu du serveur seul. JAMAIS de préfixe NEXT_PUBLIC_,
// sinon il partirait dans le navigateur.
const SECRET = process.env.HORODATAGE_SECRET;

export async function POST(request: Request) {
  // 1. Le secret doit être configuré côté serveur
  if (!SECRET) {
    return Response.json(
      { erreur: "Service d'horodatage non configuré (HORODATAGE_SECRET manquant)." },
      { status: 500 }
    );
  }

  // 2. Lire l'empreinte envoyée par le client
  let empreinte: unknown;
  try {
    const body = await request.json();
    empreinte = body?.empreinte;
  } catch {
    return Response.json({ erreur: "Corps de requête invalide." }, { status: 400 });
  }

  // 3. Valider : une empreinte SHA-256 = 64 caractères hexadécimaux
  if (typeof empreinte !== "string" || !/^[a-f0-9]{64}$/i.test(empreinte)) {
    return Response.json(
      { erreur: "Empreinte SHA-256 attendue (64 caractères hexadécimaux)." },
      { status: 400 }
    );
  }

  // 4. L'heure du serveur fait foi pour la datation
  const date = new Date().toISOString();

  // 5. Signer "empreinte|date" avec le secret → c'est le jeton
  const jeton = createHmac("sha256", SECRET)
    .update(`${empreinte.toLowerCase()}|${date}`)
    .digest("hex");

  // 6. Répondre, en étiquetant honnêtement « non qualifié »
  return Response.json({
    jeton,
    date,
    statut: "non_qualifie",
    prestataire: "interne",
    algorithme: "HMAC-SHA256",
  });
}