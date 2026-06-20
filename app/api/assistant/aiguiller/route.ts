// app/api/assistant/aiguiller/route.ts
//
// Assistant — aiguillage (LECTURE SEULE, aucune base). A partir d'une phrase
// ("je veux noter un retard"), choisit la page la plus adaptee PARMI UNE LISTE
// FERMEE. L'IA ne renvoie qu'une CLE de la liste ; le code connait l'URL reelle.
// L'IA ne fabrique jamais d'adresse.

import { verifierQuotaIa } from "@/lib/quotaIa";
import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { MODELE_ASSISTANT } from "@/lib/modelesIA";
import { DESTINATIONS } from "@/lib/destinationsAssistant";

function consigne(): string {
  const liste = DESTINATIONS.map((d) => `- ${d.cle} : ${d.description}`).join("\n");
  return `Tu aides un parent separe a se reperer dans une application de dossier familial.

A partir de sa phrase, choisis LA page la plus adaptee parmi cette liste fermee (cle : a quoi sert la page) :
${liste}

Regles :
- Reponds UNIQUEMENT avec un objet JSON, sans aucun texte autour, sans balises Markdown.
- Format exact : {"cle": "<une cle de la liste, ou aucune>", "raison": "<phrase courte, neutre, en vouvoyant>"}
- "cle" doit etre EXACTEMENT l'une des cles ci-dessus, ou le mot "aucune" si rien ne correspond.
- La "raison" reste factuelle : tu expliques ce que la page permet de faire, sans conseil juridique ni jugement de valeur.`;
}

export async function POST(request: Request) {
  // 1. Authentification.
  const utilisateur = await utilisateurDeLaRequete(request);
  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  // 2. Quota anti-abus : 15 appels / 60 s.
  const quota = await verifierQuotaIa(request, "assistant", 15, 60);
  if (!quota.autorise) {
    return Response.json(
      { erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.` },
      { status: 429 }
    );
  }

  // 3. Cle Mistral : strictement serveur.
  const cle = process.env.MISTRAL_API_KEY;
  if (!cle) {
    return Response.json({ erreur: "Clé MISTRAL_API_KEY absente du .env.local" }, { status: 500 });
  }

  // 4. Lecture et controle de l'entree.
  const corps = await request.json().catch(() => ({}));
  const phrase = corps.phrase;
  if (typeof phrase !== "string" || phrase.trim() === "") {
    return Response.json({ erreur: "Aucune demande." }, { status: 400 });
  }
  if (phrase.length > 500) {
    return Response.json(
      { erreur: "Demande trop longue (500 caractères maximum)." },
      { status: 400 }
    );
  }

  // 5. Appel Mistral.
  try {
    const reponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cle}` },
      body: JSON.stringify({
        model: MODELE_ASSISTANT,
        temperature: 0,
        max_tokens: 200,
        messages: [
          { role: "system", content: consigne() },
          { role: "user", content: phrase },
        ],
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();
      console.error("=== ERREUR MISTRAL (aiguiller) ===", reponse.status, detail);
      return Response.json({ erreur: `Mistral a répondu ${reponse.status}` }, { status: 502 });
    }

    const data = await reponse.json();
    const brut = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Nettoyage d'eventuelles balises ```json puis lecture du JSON.
    const nettoye = brut.replace(/```json/gi, "").replace(/```/g, "").trim();
    let cleChoisie: string | null = null;
    let raison = "";
    try {
      const obj = JSON.parse(nettoye);
      if (typeof obj.cle === "string") cleChoisie = obj.cle;
      if (typeof obj.raison === "string") raison = obj.raison;
    } catch {
      // Reponse non exploitable : on renverra "aucune".
    }

    // Securite : on n'accepte qu'une cle reellement presente dans la liste.
    const connue = DESTINATIONS.some((d) => d.cle === cleChoisie);
    if (!connue) cleChoisie = null;

    return Response.json({ ok: true, cle: cleChoisie, raison });
  } catch (e) {
    console.error("=== APPEL IMPOSSIBLE (aiguiller) ===", e);
    return Response.json({ erreur: "Appel à Mistral impossible." }, { status: 502 });
  }
}
