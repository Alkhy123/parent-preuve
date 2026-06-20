// app/api/agent/repondre/route.ts
//
// Agent Parent Preuve — route expérimentale IA.
//
// Cette route prépare le futur Copilote IA avec Mistral.
// Elle n'est pas encore branchée à l'interface.
//
// Sécurité :
// - authentification obligatoire ;
// - consentement IA obligatoire ;
// - quota IA obligatoire ;
// - refus local des demandes juridiques sensibles avant appel Mistral ;
// - appel Mistral côté serveur uniquement ;
// - validation stricte de la réponse IA ;
// - aucune écriture métier en base ;
// - aucune action automatique.

import { createClient } from "@supabase/supabase-js";

import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { verifierQuotaIa } from "@/lib/quotaIa";
import { MODELE_ASSISTANT } from "@/lib/modelesIA";

import {
  construirePromptSystemeAgent,
  construireRefusConseilJuridique,
  estDemandeJuridiqueSensibleAgent,
  parserEtValiderReponseAgent,
} from "@/lib/agent";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const FONCTIONNALITE_CONSENTEMENT_AGENT = "agent";
const FONCTIONNALITE_QUOTA_AGENT = "agent";

function clientUtilisateur(request: Request) {
  const entete = request.headers.get("authorization") ?? "";
  const jeton = entete.toLowerCase().startsWith("bearer ")
    ? entete.slice(7).trim()
    : "";

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jeton}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function verifierConsentementAgent(request: Request) {
  const supabase = clientUtilisateur(request);

  const { data, error } = await supabase
    .from("consentements_ia")
    .select("id")
    .eq("fonctionnalite", FONCTIONNALITE_CONSENTEMENT_AGENT)
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      autorise: false,
      erreur:
        "Impossible de vérifier le consentement IA. L'appel est refusé par sécurité.",
    };
  }

  if (!data) {
    return {
      autorise: false,
      erreur:
        "Consentement IA requis pour utiliser le Copilote Agent avec Mistral.",
    };
  }

  return {
    autorise: true,
    erreur: "",
  };
}

function nettoyerJsonEventuel(texte: string) {
  return texte.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function construireMessageUtilisateur(message: string, resume: string | null) {
  const blocs = [
    "DEMANDE UTILISATEUR :",
    message,
    "",
    "CONTEXTE DOSSIER :",
  ];

  if (resume) {
    blocs.push(resume);
  } else {
    blocs.push(
      "Aucun résumé de dossier n'est fourni. Répondre uniquement à partir de la demande, sans inventer de contexte."
    );
  }

  blocs.push(
    "",
    "Consigne finale : répondre uniquement en JSON strict, sans Markdown et sans texte autour du JSON."
  );

  return blocs.join("\n");
}

export async function POST(request: Request) {
  const utilisateur = await utilisateurDeLaRequete(request);

  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  const corps = await request.json().catch(() => ({}));
  const message = corps.message;
  const resume = corps.resume;

  if (typeof message !== "string" || message.trim() === "") {
    return Response.json({ erreur: "Aucune demande." }, { status: 400 });
  }

  const messageNettoye = message.trim();

  if (messageNettoye.length > 1000) {
    return Response.json(
      { erreur: "Demande trop longue (1000 caractères maximum)." },
      { status: 400 }
    );
  }

  let resumeNettoye: string | null = null;

  if (typeof resume === "string" && resume.trim() !== "") {
    resumeNettoye = resume.trim();

    if (resumeNettoye.length > 4000) {
      return Response.json(
        { erreur: "Résumé trop long (4000 caractères maximum)." },
        { status: 400 }
      );
    }
  }

  if (estDemandeJuridiqueSensibleAgent(messageNettoye)) {
    return Response.json({
      ok: true,
      source: "garde_fou_local",
      validation: {
        ok: true,
        erreur: "",
      },
      reponse: construireRefusConseilJuridique(),
    });
  }

  const consentement = await verifierConsentementAgent(request);

  if (!consentement.autorise) {
    return Response.json({ erreur: consentement.erreur }, { status: 403 });
  }

  const quota = await verifierQuotaIa(request, FONCTIONNALITE_QUOTA_AGENT, 10, 60);

  if (!quota.autorise) {
    return Response.json(
      { erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.` },
      { status: 429 }
    );
  }

  const cle = process.env.MISTRAL_API_KEY;

  if (!cle) {
    return Response.json(
      { erreur: "Clé MISTRAL_API_KEY absente du .env.local" },
      { status: 500 }
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
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content: construirePromptSystemeAgent({
              mode: "lecture_seule",
              contexteDossierDisponible: resumeNettoye !== null,
            }),
          },
          {
            role: "user",
            content: construireMessageUtilisateur(messageNettoye, resumeNettoye),
          },
        ],
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();

      console.error(
        "=== ERREUR MISTRAL (agent/repondre) ===",
        reponse.status,
        detail
      );

      return Response.json(
        { erreur: `Mistral a répondu ${reponse.status}` },
        { status: 502 }
      );
    }

    const data = await reponse.json();
    const brut = data.choices?.[0]?.message?.content?.trim();

    if (!brut) {
      return Response.json({ erreur: "Réponse vide de l'IA." }, { status: 502 });
    }

    const nettoye = nettoyerJsonEventuel(brut);
    const validation = parserEtValiderReponseAgent(nettoye, "lecture_seule");

    return Response.json({
      ok: true,
      source: "mistral",
      validation: {
        ok: validation.ok,
        erreur: validation.ok ? "" : validation.erreur,
      },
      reponse: validation.reponse,
    });
  } catch (e) {
    console.error("=== APPEL IMPOSSIBLE (agent/repondre) ===", e);

    return Response.json(
      { erreur: "Appel à Mistral impossible." },
      { status: 502 }
    );
  }
}