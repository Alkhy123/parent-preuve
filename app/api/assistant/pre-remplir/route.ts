// app/api/assistant/pre-remplir/route.ts
//
// Assistant — pré-remplissage (AUCUNE écriture en base). A partir d'une phrase
// libre ("j'ai paye 45 € de cantine pour Lea le 12 mars"), l'IA PROPOSE des
// champs pour l'ecran /frais ou /journal. L'utilisateur valide lui-meme a
// l'ecran (le bouton "Ajouter" existant EST la validation humaine).
//
// Le serveur VERROUILLE la sortie via nettoyerProposition() : categorie forcee
// dans la liste autorisee, montant fini >= 0 sinon null, date AAAA-MM-JJ reelle
// sinon null. L'IA n'invente rien (valeur null si absente).
//
// Confidentialite : la phrase est envoyee a Mistral (UE) puis OUBLIEE. On ne la
// journalise jamais (aucun console.log de la phrase).

import { verifierQuotaIa } from "@/lib/quotaIa";
import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { MODELE_ASSISTANT } from "@/lib/modelesIA";
import {
  nettoyerProposition,
  CATEGORIES_FRAIS,
  CATEGORIES_JOURNAL,
} from "@/lib/preRemplissage";

// Date du jour fournie par le SERVEUR (jamais par le client), pour resoudre les
// dates relatives ("le 12 mars", "hier"). Format AAAA-MM-JJ.
function dateDuJour(): string {
  return new Date().toISOString().slice(0, 10);
}

function consigne(aujourdhui: string): string {
  const fraisListe = CATEGORIES_FRAIS.join(", ");
  const journalListe = CATEGORIES_JOURNAL.join(", ");
  return `Tu aides un parent separe a saisir un element dans une application de dossier familial.

A partir de SA phrase, tu PROPOSES un pre-remplissage. Tu NE valides rien et tu n'enregistres rien : l'utilisateur relira et validera lui-meme.

Choisis UN type :
- "frais" si la phrase decrit une depense (un paiement, un montant, un achat, un remboursement). PRIORITE au type "frais" des qu'un montant ou un paiement apparait.
- "journal" si la phrase decrit un fait date a noter (retard, absence, incident, echange, evenement) sans depense.
- "aucun" si rien ne correspond clairement.

Categories autorisees pour "frais" : ${fraisListe}.
Categories autorisees pour "journal" : ${journalListe}.

Date du jour : ${aujourdhui}. Resous les dates relatives par rapport a cette date. Si l'annee n'est pas precisee, choisis la date la plus proche dans le PASSE (jamais dans le futur). Si la date reste impossible a determiner, mets null.

Regles STRICTES :
- Reponds UNIQUEMENT par un objet JSON, sans aucun texte autour, sans balises Markdown.
- N'INVENTE rien : si une information n'est pas dans la phrase, mets null.
- Ne qualifie jamais juridiquement, ne juge pas, n'interprete pas l'intention. Reste factuel et neutre.
- L'enfant est rendu en TEXTE (prenom ou alias exactement tel qu'ecrit), jamais un identifiant. null si absent.
- Le montant est un nombre en euros (point decimal, sans symbole), sinon null.
- La date est au format AAAA-MM-JJ, sinon null.
- La categorie doit etre EXACTEMENT l'une des categories autorisees du type choisi, sinon "Autre".
- "avertissements" : liste de phrases courtes et neutres signalant une incertitude (ex : date supposee, montant ambigu). Vide si tout est clair.

Format EXACT selon le type :
- frais : {"type":"frais","champs":{"libelle":<texte|null>,"categorie":<categorie>,"montant":<nombre|null>,"date":<"AAAA-MM-JJ"|null>,"enfant":<texte|null>},"avertissements":[]}
- journal : {"type":"journal","champs":{"titre":<texte|null>,"categorie":<categorie>,"date":<"AAAA-MM-JJ"|null>,"description":<texte|null>,"enfant":<texte|null>},"avertissements":[]}
- aucun : {"type":"aucun","champs":null,"avertissements":[]}`;
}

export async function POST(request: Request) {
  // 1. Authentification.
  const utilisateur = await utilisateurDeLaRequete(request);
  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  // 2. Quota anti-abus : 15 appels / 60 s, compteur distinct "pre-remplir".
  const quota = await verifierQuotaIa(request, "pre-remplir", 15, 60);
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

  // 4. Lecture et controle de l'entree (jamais journalisee).
  const corps = await request.json().catch(() => ({}));
  const phrase = corps.phrase;
  if (typeof phrase !== "string" || phrase.trim() === "") {
    return Response.json({ erreur: "Aucune saisie." }, { status: 400 });
  }
  if (phrase.length > 500) {
    return Response.json(
      { erreur: "Saisie trop longue (500 caractères maximum)." },
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
        max_tokens: 400,
        messages: [
          { role: "system", content: consigne(dateDuJour()) },
          { role: "user", content: phrase },
        ],
      }),
    });

    if (!reponse.ok) {
      // On NE journalise PAS la phrase : seulement le statut et le detail Mistral.
      const detail = await reponse.text();
      console.error("=== ERREUR MISTRAL (pre-remplir) ===", reponse.status, detail);
      return Response.json({ erreur: `Mistral a répondu ${reponse.status}` }, { status: 502 });
    }

    const data = await reponse.json();
    const brut = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Nettoyage d'eventuelles balises ```json puis lecture du JSON.
    const nettoye = brut.replace(/```json/gi, "").replace(/```/g, "").trim();
    let objet: unknown = null;
    try {
      objet = JSON.parse(nettoye);
    } catch {
      // Reponse non exploitable : nettoyerProposition renverra { type: "aucun" }.
      objet = null;
    }

    // VERROU serveur : la sortie IA est assainie ici. Rien d'autre ne sort.
    const proposition = nettoyerProposition(objet);

    return Response.json({ ok: true, proposition });
  } catch (e) {
    console.error("=== APPEL IMPOSSIBLE (pre-remplir) ===", e);
    return Response.json({ erreur: "Appel à Mistral impossible." }, { status: 502 });
  }
}