// app/api/agent/analyser-demande/route.ts
//
// Agent Parent Preuve — route dry-run sécurisée.
//
// Cette route sert uniquement à orienter l'utilisateur dans l'application.
//
// Sécurité :
// - authentification obligatoire ;
// - aucun appel IA ;
// - aucun appel Mistral ;
// - aucun consentement IA requis ;
// - aucune consommation de quota IA ;
// - aucune lecture métier Supabase ;
// - aucune écriture en base ;
// - aucune action automatique.

import { utilisateurDeLaRequete } from "@/lib/authServeur";

import { LIMITE_CARACTERES_MESSAGE_AGENT } from "@/lib/agent/config";

import type { AgentOrientation } from "@/lib/agent/orientation";
import type { AgentReponseStructuree } from "@/lib/agent/types";

import { trouverActionAgent } from "@/lib/agent/catalogueActions";
import {
  construireRefusConseilJuridique,
  evaluerActionAgent,
} from "@/lib/agent/gardeFous";
import {
  estDemandeJuridiqueSensibleAgent,
  orienterDemandeAgent,
} from "@/lib/agent/orientation";

function construireReponseOrientation(
  orientation: AgentOrientation
): AgentReponseStructuree {
  const actionCatalogue = trouverActionAgent(orientation.actionId);

  const decision = evaluerActionAgent({
    action: actionCatalogue,
    mode: "lecture_seule",
  });

  if (!decision.autorise) {
    return {
      version: "agent-parent-preuve-v1",
      resume:
        "Le copilote ne peut pas proposer cette action dans le mode actuel.",
      messages: [
        decision.raison,
        "Aucune donnée n'a été modifiée. Vous pouvez continuer à utiliser les rubriques habituelles.",
      ],
      actionProposee: {
        id: "consulter_etat_dossier",
        titre: "Revenir au tableau de bord",
        raison:
          "Le tableau de bord reste le point d'entrée le plus sûr pour organiser le dossier.",
        href: "/",
      },
      gardeFous: {
        conseilJuridiqueRefuse: false,
        ecritureAutomatiqueRefusee: true,
        validationHumaineRequise: true,
      },
    };
  }

  return {
    version: "agent-parent-preuve-v1",
    resume: "Le copilote peut vous orienter vers la rubrique adaptée.",
    messages: [
      orientation.raison,
      "Cette orientation est générée en mode sécurisé : aucun appel Mistral, aucun quota IA et aucune donnée modifiée.",
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

export async function POST(request: Request) {
  const utilisateur = await utilisateurDeLaRequete(request);

  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  const corps = await request.json().catch(() => ({}));
  const message = corps.message;

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

  if (estDemandeJuridiqueSensibleAgent(messageNettoye)) {
    return Response.json({
      ok: true,
      reponse: construireRefusConseilJuridique(),
    });
  }

  const orientation = orienterDemandeAgent(messageNettoye);
  const reponse = construireReponseOrientation(orientation);

  return Response.json({
    ok: true,
    reponse,
  });
}