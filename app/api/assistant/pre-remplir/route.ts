// app/api/assistant/pre-remplir/route.ts
//
// DEPRECIEE — ancienne route Assistant de pré-remplissage.
//
// Cette route est conservée temporairement comme filet de sécurité et pour
// comparaison éventuelle dans /copilote.
//
// Elle ne doit plus être appelée par components/AssistantFlottant.tsx.
// Le pré-remplissage de production du bouton flottant doit passer par :
// app/api/agent/pre-remplir/route.ts
//
// Cette route sera supprimée après stabilisation complète du pré-remplissage
// Agent.
//
// Sécurité historique conservée :
// - aucune écriture en base ;
// - quota anti-abus ;
// - appel Mistral côté serveur ;
// - nettoyage serveur via nettoyerProposition() ;
// - validation humaine obligatoire sur l'écran final.

import { verifierQuotaIa } from "@/lib/quotaIa";
import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { MODELE_ASSISTANT } from "@/lib/modelesIA";

import {
  nettoyerProposition,
  CATEGORIES_FRAIS,
  CATEGORIES_JOURNAL,
} from "@/lib/preRemplissage";

function dateDuJour(): string {
  return new Date().toISOString().slice(0, 10);
}

function consigne(aujourdhui: string): string {
  const fraisListe = CATEGORIES_FRAIS.join(", ");
  const journalListe = CATEGORIES_JOURNAL.join(", ");

  return `
Tu aides un parent séparé à saisir un élément dans une application de dossier familial.

Cette route est une ancienne route de pré-remplissage conservée temporairement.
Tu ne valides rien.
Tu n'enregistres rien.
Tu proposes uniquement des champs que l'utilisateur devra relire et valider lui-même.

À partir de la phrase utilisateur, choisis UN type :
- "frais" si la phrase décrit une dépense, un paiement, un montant, un achat ou un remboursement.
- "journal" si la phrase décrit un fait daté à noter : retard, absence, incident, échange, événement.
- "aucun" si rien ne correspond clairement.

Priorité :
- S'il existe un montant, un paiement, une facture, une cantine ou un remboursement, choisir "frais".
- S'il n'existe aucun montant et que la phrase décrit un fait, choisir "journal".
- Si la phrase demande une stratégie judiciaire, des conclusions ou un conseil juridique, choisir "aucun".

Catégories autorisées pour "frais" :
${fraisListe}

Catégories autorisées pour "journal" :
${journalListe}

Date du jour serveur :
${aujourdhui}

Règles strictes :
- N'invente jamais une information absente.
- Si une information manque, mets null.
- L'enfant doit être un prénom ou alias en texte, jamais un UUID.
- Le montant doit être un nombre en euros, sans symbole.
- La date doit être au format AAAA-MM-JJ.
- Si l'année n'est pas précisée, choisir la date la plus proche dans le passé.
- Si la date reste impossible à déterminer, mettre null.
- La catégorie doit être exactement une catégorie autorisée, sinon "Autre".
- Les avertissements doivent être courts, neutres et factuels.

Réponds uniquement en JSON strict.

Format frais :
{
  "type": "frais",
  "champs": {
    "libelle": "string ou null",
    "categorie": "catégorie autorisée",
    "montant": 45,
    "date": "AAAA-MM-JJ ou null",
    "enfant": "string ou null"
  },
  "avertissements": []
}

Format journal :
{
  "type": "journal",
  "champs": {
    "titre": "string ou null",
    "categorie": "catégorie autorisée",
    "date": "AAAA-MM-JJ ou null",
    "description": "string ou null",
    "enfant": "string ou null"
  },
  "avertissements": []
}

Format aucun :
{
  "type": "aucun",
  "champs": null,
  "avertissements": []
}
`.trim();
}

function reponseJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);

  headers.set("X-Parent-Preuve-Deprecated", "true");
  headers.set("X-Parent-Preuve-Replaced-By", "/api/agent/pre-remplir");

  return Response.json(body, {
    ...init,
    headers,
  });
}

export async function POST(request: Request) {
  const utilisateur = await utilisateurDeLaRequete(request);

  if (!utilisateur) {
    return reponseJson(
      { erreur: "Vous devez être connecté." },
      { status: 401 }
    );
  }

  const quota = await verifierQuotaIa(request, "pre-remplir", 15, 60);

  if (!quota.autorise) {
    return reponseJson(
      {
        erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.`,
      },
      { status: 429 }
    );
  }

  const cle = process.env.MISTRAL_API_KEY;

  if (!cle) {
    return reponseJson(
      { erreur: "Clé MISTRAL_API_KEY absente du .env.local" },
      { status: 500 }
    );
  }

  const corps = await request.json().catch(() => ({}));
  const phrase = corps.phrase;

  if (typeof phrase !== "string" || phrase.trim() === "") {
    return reponseJson({ erreur: "Aucune saisie." }, { status: 400 });
  }

  const phraseNettoyee = phrase.trim();

  if (phraseNettoyee.length > 500) {
    return reponseJson(
      { erreur: "Saisie trop longue (500 caractères maximum)." },
      { status: 400 }
    );
  }

  try {
    const reponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
      },
      body: JSON.stringify({
        model: MODELE_ASSISTANT,
        temperature: 0,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content: consigne(dateDuJour()),
          },
          {
            role: "user",
            content: phraseNettoyee,
          },
        ],
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();

      console.error(
        "=== ERREUR MISTRAL (pre-remplir deprecated) ===",
        reponse.status,
        detail
      );

      return reponseJson(
        { erreur: `Mistral a répondu ${reponse.status}` },
        { status: 502 }
      );
    }

    const data = await reponse.json();
    const brut = data.choices?.[0]?.message?.content?.trim() ?? "";
    const nettoye = brut.replace(/```json/gi, "").replace(/```/g, "").trim();

    let objet: unknown = null;

    try {
      objet = JSON.parse(nettoye);
    } catch {
      objet = null;
    }

    const proposition = nettoyerProposition(objet);

    return reponseJson({
      ok: true,
      deprecated: true,
      remplacePar: "/api/agent/pre-remplir",
      proposition,
    });
  } catch (e) {
    console.error("=== APPEL IMPOSSIBLE (pre-remplir deprecated) ===", e);

    return reponseJson(
      { erreur: "Appel à Mistral impossible." },
      { status: 502 }
    );
  }
}