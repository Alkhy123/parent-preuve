// app/api/agent/repondre/route.ts
//
// Agent Parent Preuve — route Copilote IA avancée (Mistral).
//
// Elle reste réservée au test avancé via /copilote tant qu'une étape dédiée
// de mise en production n'a pas été validée. Elle ne doit jamais être appelée
// par le bouton flottant (components/AssistantFlottant.tsx).
//
// Sécurité :
// - authentification obligatoire ;
// - consentement IA obligatoire ;
// - quota IA obligatoire ;
// - refus local des demandes juridiques sensibles avant appel Mistral ;
// - appel Mistral côté serveur uniquement ;
// - validation stricte de la réponse IA ;
// - fallback déterministe si Mistral invente une action ;
// - fallback déterministe si Mistral oublie une action utile ;
// - aucune écriture métier en base ;
// - aucune action automatique.

import { createClient } from "@supabase/supabase-js";

import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { verifierQuotaIa } from "@/lib/quotaIa";
import { MODELE_ASSISTANT } from "@/lib/modelesIA";

import type { AgentOrientation, AgentReponseStructuree } from "@/lib/agent";
import {
  construirePromptSystemeAgent,
  construireRefusConseilJuridique,
  construireReponseFallback,
  estDemandeJuridiqueSensibleAgent,
  evaluerActionAgent,
  orienterDemandeAgent,
  parserEtValiderReponseAgent,
  trouverActionAgent,
} from "@/lib/agent";

import {
  ENDPOINT_MISTRAL_CHAT_COMPLETIONS,
  FONCTIONNALITE_CONSENTEMENT_AGENT,
  FONCTIONNALITE_QUOTA_AGENT,
  LIMITE_CARACTERES_MESSAGE_AGENT,
  LIMITE_CARACTERES_RESUME_AGENT,
  MAX_TOKENS_AGENT_MISTRAL,
  QUOTA_AGENT_FENETRE_SECONDES,
  QUOTA_AGENT_NOMBRE_APPELS,
} from "@/lib/agent/config";

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

function construireReponseOrientationDeterminee(
  orientation: AgentOrientation,
  contexte: string
): AgentReponseStructuree {
  const actionCatalogue = trouverActionAgent(orientation.actionId);

  const decision = evaluerActionAgent({
    action: actionCatalogue,
    mode: "lecture_seule",
  });

  if (!decision.autorise) {
    return construireReponseFallback(decision.raison);
  }

  return {
    version: "agent-parent-preuve-v1",
    resume:
      "Le copilote vous propose une orientation sûre à partir des règles de l'application.",
    messages: [
      contexte,
      orientation.raison,
      "Aucune donnée n'a été modifiée. L'utilisateur garde la main.",
    ],
    actionProposee: {
      id: orientation.actionId,
      titre: orientation.titre,
      raison: orientation.raison,
      href: orientation.href,
    },
    gardeFous: {
      conseilJuridiqueRefuse: false,
      ecritureAutomatiqueRefusee: true,
      validationHumaineRequise: decision.validationUtilisateurObligatoire,
    },
  };
}

function orientationClaire(orientation: AgentOrientation) {
  return orientation.actionId !== "consulter_etat_dossier" || orientation.href !== "/";
}

function actionProposeeDifferenteDeLorentation(
  reponse: AgentReponseStructuree,
  orientation: AgentOrientation
) {
  if (!orientationClaire(orientation)) {
    return false;
  }

  if (reponse.actionProposee === null) {
    return true;
  }

  return reponse.actionProposee.href !== orientation.href;
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

  if (messageNettoye.length > LIMITE_CARACTERES_MESSAGE_AGENT) {
    return Response.json(
      {
        erreur: `Demande trop longue (${LIMITE_CARACTERES_MESSAGE_AGENT} caractères maximum).`,
      },
      { status: 400 }
    );
  }

  let resumeNettoye: string | null = null;

  if (typeof resume === "string" && resume.trim() !== "") {
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
    const orientation = orienterDemandeAgent(messageNettoye);

    if (!validation.ok) {
      return Response.json({
        ok: true,
        source: "mistral",
        validation: {
          ok: false,
          erreur: validation.erreur,
        },
        reponse: construireReponseOrientationDeterminee(
          orientation,
          "La réponse de l'IA n'a pas respecté le contrat Agent. Le copilote a donc repris une orientation déterministe plus sûre."
        ),
      });
    }

    if (actionProposeeDifferenteDeLorentation(validation.reponse, orientation)) {
      return Response.json({
        ok: true,
        source: "mistral",
        validation: {
          ok: true,
          erreur: "",
        },
        reponse: construireReponseOrientationDeterminee(
          orientation,
          "La réponse de l'IA était valide, mais l'orientation proposée n'était pas la plus cohérente avec la demande. Le copilote applique donc l'orientation déterministe de l'application."
        ),
      });
    }

    return Response.json({
      ok: true,
      source: "mistral",
      validation: {
        ok: true,
        erreur: "",
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