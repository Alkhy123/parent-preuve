// lib/agent/catalogueActions.ts
//
// Catalogue central des actions connues du futur agent.
// Important : ce catalogue ne déclenche aucune action.
// Il décrit seulement ce qui sera autorisé, limité ou interdit.

import type { AgentActionAutorisee, AgentActionId } from "@/lib/agent/types";

export const CATALOGUE_ACTIONS_AGENT: readonly AgentActionAutorisee[] = [
  {
    id: "consulter_etat_dossier",
    libelle: "Consulter l'état du dossier",
    domaine: "dossier",
    description:
      "Lire les informations déjà présentes dans le dossier pour aider l'utilisateur à prioriser ses prochaines actions.",
    modeMinimal: "lecture_seule",
    risque: "faible",
    href: "/",
    appelIa: false,
    ecritureBase: false,
    validationUtilisateurObligatoire: false,
  },
  {
    id: "orienter_page",
    libelle: "Orienter vers une page",
    domaine: "navigation",
    description:
      "Proposer la rubrique la plus adaptée de l'application selon la demande de l'utilisateur.",
    modeMinimal: "lecture_seule",
    risque: "faible",
    appelIa: true,
    ecritureBase: false,
    validationUtilisateurObligatoire: false,
  },
  {
    id: "proposer_brouillon_journal",
    libelle: "Proposer un brouillon de journal",
    domaine: "journal",
    description:
      "Préparer une proposition de saisie pour le journal, à relire et valider manuellement.",
    modeMinimal: "brouillon_a_valider",
    risque: "moyen",
    href: "/journal",
    appelIa: true,
    ecritureBase: false,
    validationUtilisateurObligatoire: true,
  },
  {
    id: "proposer_brouillon_frais",
    libelle: "Proposer un brouillon de frais",
    domaine: "frais",
    description:
      "Préparer une proposition de dépense, à relire et valider manuellement.",
    modeMinimal: "brouillon_a_valider",
    risque: "moyen",
    href: "/frais",
    appelIa: true,
    ecritureBase: false,
    validationUtilisateurObligatoire: true,
  },
  {
    id: "proposer_brouillon_courrier",
    libelle: "Proposer un brouillon de courrier",
    domaine: "courriers",
    description:
      "Aider à rédiger un brouillon neutre, factuel et apaisé, sans envoi automatique.",
    modeMinimal: "brouillon_a_valider",
    risque: "moyen",
    href: "/courriers",
    appelIa: true,
    ecritureBase: false,
    validationUtilisateurObligatoire: true,
  },
  {
    id: "preparer_export",
    libelle: "Préparer l'export",
    domaine: "export",
    description:
      "Aider l'utilisateur à vérifier les points manquants avant de générer un export.",
    modeMinimal: "lecture_seule",
    risque: "faible",
    href: "/export",
    appelIa: false,
    ecritureBase: false,
    validationUtilisateurObligatoire: false,
  },
  {
    id: "expliquer_point_application",
    libelle: "Expliquer une fonction de l'application",
    domaine: "navigation",
    description:
      "Expliquer comment utiliser une rubrique de Parent Preuve, sans conseil juridique personnalisé.",
    modeMinimal: "lecture_seule",
    risque: "faible",
    appelIa: true,
    ecritureBase: false,
    validationUtilisateurObligatoire: false,
  },
  {
    id: "donner_conseil_juridique_personnalise",
    libelle: "Donner un conseil juridique personnalisé",
    domaine: "securite",
    description:
      "Action interdite : le copilote ne remplace pas un avocat ou un professionnel du droit.",
    modeMinimal: "action_confirmee",
    risque: "interdit",
    appelIa: false,
    ecritureBase: false,
    validationUtilisateurObligatoire: true,
  },
  {
    id: "rediger_conclusions_a_deposer",
    libelle: "Rédiger des conclusions à déposer",
    domaine: "securite",
    description:
      "Action interdite : le copilote ne doit pas produire un acte judiciaire prêt à déposer.",
    modeMinimal: "action_confirmee",
    risque: "interdit",
    appelIa: false,
    ecritureBase: false,
    validationUtilisateurObligatoire: true,
  },
  {
    id: "modifier_dossier_sans_validation",
    libelle: "Modifier le dossier sans validation",
    domaine: "securite",
    description:
      "Action interdite : aucune modification du dossier ne doit être faite sans validation explicite.",
    modeMinimal: "action_confirmee",
    risque: "interdit",
    appelIa: false,
    ecritureBase: true,
    validationUtilisateurObligatoire: true,
  },
  {
    id: "envoyer_message_sans_validation",
    libelle: "Envoyer un message sans validation",
    domaine: "securite",
    description:
      "Action interdite : aucun message ne doit être envoyé automatiquement par le copilote.",
    modeMinimal: "action_confirmee",
    risque: "interdit",
    appelIa: false,
    ecritureBase: false,
    validationUtilisateurObligatoire: true,
  },
];

export function trouverActionAgent(
  id: AgentActionId
): AgentActionAutorisee | null {
  return CATALOGUE_ACTIONS_AGENT.find((action) => action.id === id) ?? null;
}

export function listerActionsAgentAutorisees(): readonly AgentActionAutorisee[] {
  return CATALOGUE_ACTIONS_AGENT.filter(
    (action) => action.risque !== "interdit"
  );
}

export function listerActionsAgentInterdites(): readonly AgentActionAutorisee[] {
  return CATALOGUE_ACTIONS_AGENT.filter(
    (action) => action.risque === "interdit"
  );
}