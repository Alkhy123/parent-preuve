// app/api/agent/question-dossier/route.ts
//
// Agent Parent Preuve — question sur le dossier.
//
// Cette route remplace l'ancien assistant /api/assistant/repondre
// (supprimé après migration vers l'architecture Agent).
//
// Elle est branchée au bouton flottant : usage « question dossier » de
// components/AssistantFlottant.tsx. Elle répond uniquement à partir des
// données factuelles du dossier et n'écrit rien en base métier.
//
// Contrat de réponse : agent-question-dossier-v1.
//
// Sécurité :
// - authentification obligatoire ;
// - consentement IA Agent obligatoire ;
// - quota IA Agent obligatoire ;
// - refus local des demandes juridiques sensibles avant appel Mistral ;
// - réponse sécurisée si le résumé est vide ou insuffisant ;
// - appel Mistral côté serveur uniquement ;
// - validation stricte via parserEtValiderReponseQuestionDossierAgent() ;
// - aucune écriture métier en base ;
// - aucune action automatique ;
// - validation humaine obligatoire côté écran final.

import { createClient } from "@supabase/supabase-js";

import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { verifierQuotaIa } from "@/lib/quotaIa";
import { MODELE_ASSISTANT } from "@/lib/modelesIA";

import {
  ENDPOINT_MISTRAL_CHAT_COMPLETIONS,
  FONCTIONNALITE_CONSENTEMENT_AGENT,
  FONCTIONNALITE_QUOTA_AGENT,
  LIMITE_CARACTERES_MESSAGE_AGENT,
  LIMITE_CARACTERES_RESUME_AGENT,
  MAX_TOKENS_AGENT_MISTRAL,
  QUOTA_AGENT_FENETRE_SECONDES,
  QUOTA_AGENT_NOMBRE_APPELS,
  construirePromptSystemeQuestionDossierAgent,
  construireReponseQuestionDossierSansContexte,
  construireRefusQuestionDossierJuridique,
  estDemandeJuridiqueSensibleAgent,
  parserEtValiderReponseQuestionDossierAgent,
} from "@/lib/agent";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

// Lecture seule : on vérifie uniquement la présence du consentement IA Agent.
// Aucune écriture métier en base.
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
        "Consentement IA requis pour utiliser la question dossier Agent expérimentale.",
    };
  }

  return {
    autorise: true,
    erreur: "",
  };
}

function construireMessageUtilisateur(question: string, resume: string) {
  return [
    "RÉSUMÉ DE L'ÉTAT DU DOSSIER :",
    resume,
    "",
    "QUESTION :",
    question,
    "",
    "Consigne finale : répondre uniquement en JSON strict, sans Markdown et sans texte autour du JSON.",
  ].join("\n");
}

export async function POST(request: Request) {
  const utilisateur = await utilisateurDeLaRequete(request);

  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  const corps = await request.json().catch(() => ({}));
  const question = corps.question;
  const resume = corps.resume;

  if (typeof question !== "string" || question.trim() === "") {
    return Response.json({ erreur: "Aucune question." }, { status: 400 });
  }

  const questionNettoyee = question.trim();

  if (questionNettoyee.length > LIMITE_CARACTERES_MESSAGE_AGENT) {
    return Response.json(
      {
        erreur: `Question trop longue (${LIMITE_CARACTERES_MESSAGE_AGENT} caractères maximum).`,
      },
      { status: 400 }
    );
  }

  let resumeNettoye = "";

  if (typeof resume === "string") {
    resumeNettoye = resume.trim();

    if (resumeNettoye.length > LIMITE_CARACTERES_RESUME_AGENT) {
      return Response.json(
        {
          erreur: `Résumé trop long (${LIMITE_CARACTERES_RESUME_AGENT} caractères maximum).`,
        },
        { status: 400 }
      );
    }
  }

  // Refus local AVANT tout appel Mistral : conclusions, stratégie, prédiction,
  // conseil juridique personnalisé, recevabilité garantie.
  if (estDemandeJuridiqueSensibleAgent(questionNettoyee)) {
    return Response.json({
      ok: true,
      source: "garde_fou_local",
      validation: {
        ok: true,
        erreur: "",
      },
      reponse: construireRefusQuestionDossierJuridique(),
    });
  }

  // Résumé vide ou insuffisant : réponse sécurisée, sans appel Mistral.
  if (resumeNettoye === "") {
    return Response.json({
      ok: true,
      source: "fallback",
      validation: {
        ok: true,
        erreur: "",
      },
      reponse: construireReponseQuestionDossierSansContexte(),
    });
  }

  const consentement = await verifierConsentementAgent(request);

  if (!consentement.autorise) {
    return Response.json({ erreur: consentement.erreur }, { status: 403 });
  }

  const quota = await verifierQuotaIa(
    request,
    FONCTIONNALITE_QUOTA_AGENT,
    QUOTA_AGENT_NOMBRE_APPELS,
    QUOTA_AGENT_FENETRE_SECONDES
  );

  if (!quota.autorise) {
    return Response.json(
      {
        erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.`,
      },
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
    const reponse = await fetch(ENDPOINT_MISTRAL_CHAT_COMPLETIONS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
      },
      body: JSON.stringify({
        model: MODELE_ASSISTANT,
        temperature: 0,
        max_tokens: MAX_TOKENS_AGENT_MISTRAL,
        messages: [
          {
            role: "system",
            content: construirePromptSystemeQuestionDossierAgent({
              contexteDossierDisponible: true,
            }),
          },
          {
            role: "user",
            content: construireMessageUtilisateur(questionNettoyee, resumeNettoye),
          },
        ],
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();

      console.error(
        "=== ERREUR MISTRAL (agent/question-dossier) ===",
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

    const validation = parserEtValiderReponseQuestionDossierAgent(brut);

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
    console.error("=== APPEL IMPOSSIBLE (agent/question-dossier) ===", e);

    return Response.json(
      { erreur: "Appel à Mistral impossible." },
      { status: 502 }
    );
  }
}
