// app/api/assistant/repondre/route.ts
//
// Assistant — niveau 1 (LECTURE SEULE). Repond a une question de l'utilisateur
// en s'appuyant UNIQUEMENT sur le resume de son dossier (transmis dans le corps).
// Aucune ecriture en base. La cle Mistral reste cote serveur.

import { verifierQuotaIa } from "@/lib/quotaIa";
import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { MODELE_ASSISTANT } from "@/lib/modelesIA";

const CONSIGNE = `Tu es un assistant d'organisation dans une application qui aide un parent separe a preparer un dossier factuel pour le juge aux affaires familiales.

Tu disposes d'un RESUME de l'etat du dossier de l'utilisateur. Tu reponds a sa question en t'appuyant UNIQUEMENT sur ce resume.

Regles strictes :
- Reponds en francais, en vouvoyant, de facon breve et claire.
- Utilise UNIQUEMENT les informations du resume. N'invente aucun chiffre, aucune date, aucun fait.
- Si l'information n'est pas dans le resume, dis-le simplement et indique, si utile, dans quel menu la trouver (Mon dossier, Saisir, Production, Reglages).
- Reste strictement factuel et neutre. N'emploie aucun jugement de valeur ni qualification (par exemple "manquement", "faute", "mauvaise foi", "abandon").
- Ne donne AUCUN conseil juridique et ne promets aucune issue. Tu organises des faits ; tu ne dis pas ce que le juge decidera.
- Tu ne peux rien enregistrer ni modifier. Si on te le demande, explique que l'utilisateur doit le faire lui-meme dans l'ecran concerne.`;

export async function POST(request: Request) {
  // 1. Authentification : seul un utilisateur connecte peut appeler cette route.
  const utilisateur = await utilisateurDeLaRequete(request);
  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  // 2. Quota anti-abus (compte en base, par utilisateur) : 15 appels / 60 s.
  const quota = await verifierQuotaIa(request, "assistant", 15, 60);
  if (!quota.autorise) {
    return Response.json(
      { erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.` },
      { status: 429 }
    );
  }

  // 3. Cle Mistral : strictement cote serveur.
  const cle = process.env.MISTRAL_API_KEY;
  if (!cle) {
    return Response.json(
      { erreur: "Clé MISTRAL_API_KEY absente du .env.local" },
      { status: 500 }
    );
  }

  // 4. Lecture et controle des entrees.
  const corps = await request.json().catch(() => ({}));
  const question = corps.question;
  const resume = corps.resume;

  if (typeof question !== "string" || question.trim() === "") {
    return Response.json({ erreur: "Aucune question." }, { status: 400 });
  }
  if (typeof resume !== "string" || resume.trim() === "") {
    return Response.json({ erreur: "Résumé du dossier manquant." }, { status: 400 });
  }
  if (question.length > 500) {
    return Response.json(
      { erreur: "Question trop longue (500 caractères maximum)." },
      { status: 400 }
    );
  }
  if (resume.length > 4000) {
    return Response.json({ erreur: "Résumé trop long." }, { status: 400 });
  }

  // 5. Appel Mistral.
  try {
    const reponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
      },
      body: JSON.stringify({
        model: MODELE_ASSISTANT,
        temperature: 0.2,
        max_tokens: 600,
        messages: [
          { role: "system", content: CONSIGNE },
          {
            role: "user",
            content: `RESUME DE L'ETAT DU DOSSIER :\n${resume}\n\nQUESTION :\n${question}`,
          },
        ],
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();
      console.error("=== ERREUR MISTRAL (assistant) ===", reponse.status, detail);
      return Response.json(
        { erreur: `Mistral a répondu ${reponse.status}` },
        { status: 502 }
      );
    }

    const data = await reponse.json();
    const texte = data.choices?.[0]?.message?.content?.trim();
    if (!texte) {
      return Response.json({ erreur: "Réponse vide de l'IA." }, { status: 502 });
    }

    return Response.json({ ok: true, reponse: texte });
  } catch (e) {
    console.error("=== APPEL IMPOSSIBLE (assistant) ===", e);
    return Response.json({ erreur: "Appel à Mistral impossible." }, { status: 502 });
  }
}
