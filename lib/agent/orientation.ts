// lib/agent/orientation.ts
//
// Orientation centralisée du futur Agent Parent Preuve.
//
// Ce fichier ne déclenche aucune action :
// - aucun appel IA ;
// - aucune lecture Supabase ;
// - aucune écriture en base ;
// - aucune consommation de quota.
//
// Il transforme seulement une demande utilisateur en orientation applicative.

import type { AgentActionId } from "@/lib/agent/types";
import { estTexteProbablementJuridiquePersonnalise } from "@/lib/agent/gardeFous";

export type AgentOrientation = {
  actionId: AgentActionId;
  titre: string;
  raison: string;
  href: string;
};

function contientUnDesTermes(message: string, termes: string[]) {
  const normalise = message.toLowerCase();

  return termes.some((terme) => normalise.includes(terme));
}

export function estDemandeJuridiqueSensibleAgent(message: string) {
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

export function orienterDemandeAgent(message: string): AgentOrientation {
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
      "un fait",
      "des faits",
      "ajouter un fait",
      "noter un fait",
      "consigner",
      "retard",
      "absence",
      "non-représentation",
      "non representation",
      "incident",
      "il s'est passé",
      "il s est passe",
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