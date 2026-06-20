// app/api/agent/analyser-demande/route.ts
//
// Agent Parent Preuve — étape 4.
//
// Route "dry-run" sécurisée :
// - authentification obligatoire ;
// - aucun appel IA ;
// - aucun appel Mistral ;
// - aucune consommation de quota IA ;
// - aucune lecture métier Supabase ;
// - aucune écriture en base ;
// - aucune action automatique.
//
// Objectif : valider le socle de garde-fous du futur Super Agent avant de le
// brancher à une vraie interface ou à un modèle IA.

import { utilisateurDeLaRequete } from "@/lib/authServeur";

import type { AgentActionId, AgentReponseStructuree } from "@/lib/agent";
import {
  construireRefusConseilJuridique,
  estTexteProbablementJuridiquePersonnalise,
  evaluerActionAgent,
  trouverActionAgent,
} from "@/lib/agent";

type OrientationAgent = {
  actionId: AgentActionId;
  titre: string;
  raison: string;
  href: string;
};

function contientUnDesTermes(message: string, termes: string[]) {
  const normalise = message.toLowerCase();

  return termes.some((terme) => normalise.includes(terme));
}

function estDemandeJuridiqueSensible(message: string) {
  if (estTexteProbablementJuridiquePersonnalise(message)) {
    return true;
  }

  return contientUnDesTermes(message, [
    "que dois-je demander",
    "quoi demander au juge",
    "stratégie judiciaire",
    "strategie judiciaire",
    "mes conclusions",
    "conclusion jaf",
    "conclusions jaf",
    "conclusions au jaf",
    "rédige mes conclusions",
    "redige mes conclusions",
    "gagner devant le juge",
    "gagner devant le jaf",
    "obtenir la garde",
    "retirer la garde",
    "faire condamner",
    "porter plainte contre",
    "saisir le juge pour obtenir",
  ]);
}

function orienterDemande(message: string): OrientationAgent {
  if (
    contientUnDesTermes(message, [
      "frais",
      "facture",
      "cantine",
      "mutuelle",
      "orthophoniste",
      "ostéopathe",
      "osteopathe",
      "médecin",
      "medecin",
      "remboursement",
      "justificatif",
    ])
  ) {
    return {
      actionId: "orienter_page",
      titre: "Ouvrir la rubrique des frais",
      raison:
        "La demande semble concerner une dépense, un remboursement ou un justificatif.",
      href: "/frais",
    };
  }

  if (
    contientUnDesTermes(message, [
      "journal",
      "événement",
      "evenement",
      "retard",
      "absence",
      "incident",
      "note",
      "noter",
      "raconter",
      "main courante factuelle",
    ])
  ) {
    return {
      actionId: "orienter_page",
      titre: "Ouvrir le journal",
      raison:
        "La demande semble concerner un événement à consigner de manière factuelle.",
      href: "/journal",
    };
  }

  if (
    contientUnDesTermes(message, [
      "preuve",
      "photo",
      "document",
      "capture",
      "sms",
      "mail",
      "email",
      "horodatage",
      "fichier",
      "pièce",
      "piece",
    ])
  ) {
    return {
      actionId: "orienter_page",
      titre: "Ouvrir les preuves",
      raison:
        "La demande semble concerner un document ou une preuve à classer dans le dossier.",
      href: "/preuves",
    };
  }

  if (
    contientUnDesTermes(message, [
      "courrier",
      "message",
      "écrire",
      "ecrire",
      "répondre",
      "repondre",
      "reformuler",
      "mail à envoyer",
      "mail a envoyer",
    ])
  ) {
    return {
      actionId: "orienter_page",
      titre: "Ouvrir les courriers",
      raison:
        "La demande semble concerner un message ou un brouillon à préparer puis relire.",
      href: "/courriers",
    };
  }

  if (
    contientUnDesTermes(message, [
      "export",
      "pdf",
      "dossier complet",
      "imprimer",
      "télécharger",
      "telecharger",
      "préparer le dossier",
      "preparer le dossier",
    ])
  ) {
    return {
      actionId: "preparer_export",
      titre: "Vérifier l'export",
      raison:
        "La demande semble concerner la préparation ou la vérification d'un dossier à exporter.",
      href: "/export",
    };
  }

  if (
    contientUnDesTermes(message, [
      "enfant",
      "enfants",
      "mon fils",
      "ma fille",
      "résidence",
      "residence",
      "planning enfant",
    ])
  ) {
    return {
      actionId: "orienter_page",
      titre: "Ouvrir la rubrique enfants",
      raison:
        "La demande semble concerner les informations liées à un enfant du dossier.",
      href: "/enfants",
    };
  }

  return {
    actionId: "consulter_etat_dossier",
    titre: "Revenir au tableau de bord",
    raison:
      "Le copilote peut commencer par l'accueil pour repérer les prochaines actions utiles.",
    href: "/",
  };
}

function construireReponseOrientation(
  orientation: OrientationAgent
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
      "Cette route est en mode test sécurisé : elle n'appelle pas l'IA et ne modifie aucune donnée.",
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

  if (messageNettoye.length > 1000) {
    return Response.json(
      { erreur: "Demande trop longue (1000 caractères maximum)." },
      { status: 400 }
    );
  }

  if (estDemandeJuridiqueSensible(messageNettoye)) {
    return Response.json({
      ok: true,
      reponse: construireRefusConseilJuridique(),
    });
  }

  const orientation = orienterDemande(messageNettoye);
  const reponse = construireReponseOrientation(orientation);

  return Response.json({
    ok: true,
    reponse,
  });
}