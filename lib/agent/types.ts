// lib/agent/types.ts
//
// Contrats de base du futur Super Agent Parent Preuve.
// Ce fichier ne contient aucune logique métier, aucun appel IA et aucune écriture.
// Il sert uniquement à typer les futures réponses et actions autorisées.

export type AgentMode =
  | "lecture_seule"
  | "brouillon_a_valider"
  | "action_confirmee";

export type AgentRisque = "faible" | "moyen" | "eleve" | "interdit";

export type AgentDomaine =
  | "navigation"
  | "dossier"
  | "enfants"
  | "journal"
  | "frais"
  | "preuves"
  | "courriers"
  | "export"
  | "securite";

export type AgentActionId =
  | "consulter_etat_dossier"
  | "orienter_page"
  | "proposer_brouillon_journal"
  | "proposer_brouillon_frais"
  | "proposer_brouillon_courrier"
  | "preparer_export"
  | "expliquer_point_application"
  | "donner_conseil_juridique_personnalise"
  | "rediger_conclusions_a_deposer"
  | "modifier_dossier_sans_validation"
  | "envoyer_message_sans_validation";

export type AgentActionAutorisee = {
  id: AgentActionId;
  libelle: string;
  domaine: AgentDomaine;
  description: string;
  modeMinimal: AgentMode;
  risque: AgentRisque;
  href?: string;
  appelIa: boolean;
  ecritureBase: boolean;
  validationUtilisateurObligatoire: boolean;
};

export type AgentDecisionGardeFou = {
  autorise: boolean;
  raison: string;
  niveauRisque: AgentRisque;
  validationUtilisateurObligatoire: boolean;
};

export type AgentMessageRole = "systeme" | "utilisateur" | "assistant";

export type AgentMessage = {
  role: AgentMessageRole;
  contenu: string;
};

export type AgentActionProposee = {
  id: AgentActionId;
  titre: string;
  raison: string;
  href?: string;
};

export type AgentReponseStructuree = {
  version: "agent-parent-preuve-v1";
  resume: string;
  messages: string[];
  actionProposee: AgentActionProposee | null;
  gardeFous: {
    conseilJuridiqueRefuse: boolean;
    ecritureAutomatiqueRefusee: boolean;
    validationHumaineRequise: boolean;
  };
};