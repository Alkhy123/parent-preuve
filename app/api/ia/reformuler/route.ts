// Brique B — Reformulation neutre d'un message.
// La clé Mistral reste côté serveur. L'IA propose ; l'utilisateur relit et valide.

import { verifierLimite, cleAppelant } from "@/lib/limiteurAppel";

// Le "rôle" qu'on donne à l'IA. C'est le cœur du garde-fou : neutre, factuel, sans invention.
const CONSIGNE = `Tu es un assistant qui reformule des messages entre parents séparés, dans un contexte de coparentalité.

Ta mission : réécrire le texte fourni de façon neutre, factuelle et non agressive.

Règles strictes :
- Supprime les insultes, accusations, jugements de valeur et sous-entendus.
- Conserve TOUS les faits : dates, heures, lieux, montants, demandes, réponses, prénoms.
- N'invente aucun fait. Si une information n'est pas dans le texte, ne l'ajoute pas.
- Ne donne aucun conseil juridique et ne prends pas parti.
- Produis une version courte, claire et directement utilisable.
- Réponds UNIQUEMENT avec le texte reformulé, sans introduction ni commentaire.`;

export async function POST(request: Request) {
  // 0. Garde-fou de fréquence : 15 appels max par minute et par appelant.
  const limite = verifierLimite(cleAppelant(request), 15, 60);
  if (!limite.autorise) {
    return Response.json(
      { erreur: `Trop de demandes de reformulation. Réessayez dans ${limite.resteSecondes} secondes.` },
      { status: 429 }
    );
  }

  // 1. La clé reste côté serveur
  const cle = process.env.MISTRAL_API_KEY;
  if (!cle) {
    return Response.json(
      { erreur: "Clé MISTRAL_API_KEY absente du .env.local" },
      { status: 500 }
    );
  }

  // 2. On lit et on contrôle le texte reçu (garde-fous)
  const corps = await request.json().catch(() => ({}));
  const texte = corps.texte;

  if (typeof texte !== "string" || texte.trim() === "") {
    return Response.json({ erreur: "Aucun texte à reformuler." }, { status: 400 });
  }
  if (texte.length > 5000) {
    return Response.json(
      { erreur: "Texte trop long (5000 caractères maximum)." },
      { status: 400 }
    );
  }

  // 3. On appelle Mistral
  try {
    const reponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        temperature: 0.2, // bas = on reste sage et factuel, peu de fantaisie
        max_tokens: 1000,
        messages: [
          { role: "system", content: CONSIGNE },
          { role: "user", content: texte },
        ],
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();
      console.error("=== ERREUR MISTRAL ===", reponse.status, detail);
      return Response.json(
        { erreur: `Mistral a répondu ${reponse.status}` },
        { status: 502 }
      );
    }

    const data = await reponse.json();
    const reformule = data.choices?.[0]?.message?.content?.trim();

    if (!reformule) {
      return Response.json({ erreur: "Réponse vide de l'IA." }, { status: 502 });
    }

    return Response.json({ ok: true, reformule });
  } catch (e) {
    console.error("=== APPEL IMPOSSIBLE ===", e);
    return Response.json({ erreur: "Appel à Mistral impossible." }, { status: 502 });
  }
}