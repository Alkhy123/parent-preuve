// Brique B — Reformulation neutre d'un message.
// La clé Mistral reste côté serveur. L'IA propose ; l'utilisateur relit et valide.

import { verifierQuotaIa } from "@/lib/quotaIa";
import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { enteteAuth } from "@/lib/enteteAuth";
import { MODELE_REFORMULATION } from "@/lib/modelesIA";

// Le "rôle" donné à l'IA. Garde-fou : intervention minimale, fidélité au vocabulaire,
// aucune invention, aucun conseil.
const CONSIGNE = `Tu reformules un message écrit par un parent séparé, dans un contexte de coparentalité.

Principe : INTERVENTION MINIMALE. Tu n'es pas là pour réécrire ou améliorer le style. Tu retires seulement ce qui est agressif et tu gardes le reste tel quel.

Ce que tu DOIS faire :
- Retirer les insultes, accusations, jugements de valeur, sous-entendus et qualifications de la personne (par exemple « menteur », « irresponsable », « mauvaise foi »).
- Garder TOUS les faits : dates, heures, lieux, montants, demandes, réponses, prénoms.
- Garder les MOTS de l'auteur partout où ils sont déjà neutres. Ne remplace pas un mot neutre par un synonyme. Reprends ses tournures, son niveau de langue et son vocabulaire.

Ce que tu NE DOIS PAS faire :
- N'invente aucun fait ni aucune information absente du texte.
- Ne donne aucun conseil et ne prends pas parti.
- Ne « clarifie » pas, ne raccourcis pas, n'enrichis pas le style. Si une phrase est déjà neutre, recopie-la à l'identique.
- N'ajoute aucune formule de politesse qui n'était pas présente.

Réponds UNIQUEMENT avec le texte reformulé, sans introduction ni commentaire.`;

export async function POST(request: Request) {
// 1. Authentification : seul un utilisateur connecté peut appeler cette route.
const utilisateur = await utilisateurDeLaRequete(request);
if (!utilisateur) {
  return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
}

// 2. Quota anti-abus (compté en base, par utilisateur) : 15 appels / 60 s.
const quota = await verifierQuotaIa(request, "reformulation", 15, 60);
if (!quota.autorise) {
  return Response.json(
    { erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.` },
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
        model: MODELE_REFORMULATION,
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
