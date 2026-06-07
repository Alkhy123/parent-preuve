// app/api/ia/extraire/route.ts
// Route serveur : description libre d'un jugement -> JSON "règles".
// Le cœur (prompt + validation) est dans lib/extractionRegles.ts,
// partagé avec /api/ia/extraire-pdf. L'IA propose ; rien n'est écrit en base ici.

import { analyserDispositif } from "@/lib/extractionRegles";
import { verifierLimite, cleAppelant } from "@/lib/limiteurAppel";

export async function POST(request: Request) {
  // 0. Garde-fou de fréquence : 10 appels max par minute et par appelant.
  const limite = verifierLimite(cleAppelant(request), 10, 60);
  if (!limite.autorise) {
    return Response.json(
      {
        erreur: `Trop de demandes d'analyse. Réessayez dans ${limite.resteSecondes} secondes.`,
      },
      { status: 429 }
    );
  }

  const cle = process.env.MISTRAL_API_KEY;
  if (!cle) {
    return Response.json({ erreur: "Clé Mistral absente côté serveur." }, { status: 500 });
  }

  let texte: unknown;
  try {
    const body = await request.json();
    texte = body?.texte;
  } catch {
    return Response.json({ erreur: "Corps de requête invalide." }, { status: 400 });
  }

  if (typeof texte !== "string" || texte.trim().length === 0) {
    return Response.json({ erreur: "Le champ 'texte' est vide." }, { status: 400 });
  }
  if (texte.length > 5000) {
    return Response.json({ erreur: "Texte trop long (5000 caractères maximum)." }, { status: 400 });
  }

  const res = await analyserDispositif(texte, cle);
  if (!res.ok) {
    return Response.json({ erreur: res.erreur }, { status: res.status });
  }
  return Response.json({ sections: res.sections });
}