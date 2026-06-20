// lib/agent/gardeFous.ts
//
// Garde-fous centraux du futur agent.
// Ce fichier ne fait aucun appel réseau et ne modifie aucune donnée.
// Il décide seulement si une action décrite par le catalogue peut être proposée.

import type {
    AgentActionAutorisee,
    AgentDecisionGardeFou,
    AgentMode,
  } from "@/lib/agent/types";
  
  const ORDRE_MODES_AGENT: Record<AgentMode, number> = {
    lecture_seule: 0,
    brouillon_a_valider: 1,
    action_confirmee: 2,
  };
  
  type EvaluerActionAgentParams = {
    action: AgentActionAutorisee | null;
    mode: AgentMode;
    confirmationUtilisateur?: boolean;
  };
  
  export function evaluerActionAgent({
    action,
    mode,
    confirmationUtilisateur = false,
  }: EvaluerActionAgentParams): AgentDecisionGardeFou {
    if (action === null) {
      return {
        autorise: false,
        raison: "Action inconnue du catalogue agent.",
        niveauRisque: "interdit",
        validationUtilisateurObligatoire: true,
      };
    }
  
    if (action.risque === "interdit") {
      return {
        autorise: false,
        raison: "Action interdite par les garde-fous Parent Preuve.",
        niveauRisque: "interdit",
        validationUtilisateurObligatoire: true,
      };
    }
  
    const modeActuel = ORDRE_MODES_AGENT[mode];
    const modeMinimal = ORDRE_MODES_AGENT[action.modeMinimal];
  
    if (modeActuel < modeMinimal) {
      return {
        autorise: false,
        raison:
          "Le mode actuel du copilote ne permet pas encore cette action. Une étape de validation supplémentaire est nécessaire.",
        niveauRisque: action.risque,
        validationUtilisateurObligatoire:
          action.validationUtilisateurObligatoire,
      };
    }
  
    if (action.ecritureBase && !confirmationUtilisateur) {
      return {
        autorise: false,
        raison:
          "Une action qui écrit en base nécessite une confirmation explicite de l'utilisateur.",
        niveauRisque: action.risque,
        validationUtilisateurObligatoire: true,
      };
    }
  
    return {
      autorise: true,
      raison: "Action autorisée dans le mode actuel du copilote.",
      niveauRisque: action.risque,
      validationUtilisateurObligatoire:
        action.validationUtilisateurObligatoire || action.ecritureBase,
    };
  }
  
  export function estTexteProbablementJuridiquePersonnalise(texte: string) {
    const normalise = texte.toLowerCase();
  
    const signaux = [
      "que dois-je demander au juge",
      "quelle stratégie",
      "mes conclusions",
      "conclusions à déposer",
      "appel incident",
      "gagner devant le jaf",
      "obtenir la garde",
      "faire condamner",
    ];
  
    return signaux.some((signal) => normalise.includes(signal));
  }
  
  export function construireRefusConseilJuridique() {
    return {
      version: "agent-parent-preuve-v1" as const,
      resume:
        "Je ne peux pas fournir de conseil juridique personnalisé ni rédiger une stratégie judiciaire à votre place.",
      messages: [
        "Je peux vous aider à organiser les faits, repérer les éléments manquants et préparer des brouillons factuels à relire.",
        "Pour une stratégie juridique personnalisée, il faut consulter un avocat ou un professionnel du droit.",
      ],
      actionProposee: {
        id: "expliquer_point_application" as const,
        titre: "Revenir à l'organisation factuelle du dossier",
        raison:
          "Le copilote peut aider à structurer les informations sans se substituer à un professionnel du droit.",
        href: "/",
      },
      gardeFous: {
        conseilJuridiqueRefuse: true,
        ecritureAutomatiqueRefusee: true,
        validationHumaineRequise: true,
      },
    };
  }