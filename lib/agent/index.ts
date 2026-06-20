// lib/agent/index.ts
//
// Point d'entrée public du socle agent.
// Les futures routes API devront importer depuis ce fichier plutôt que depuis
// les fichiers internes, afin de garder une architecture claire.

export type {
    AgentActionAutorisee,
    AgentActionId,
    AgentActionProposee,
    AgentDecisionGardeFou,
    AgentDomaine,
    AgentMessage,
    AgentMessageRole,
    AgentMode,
    AgentReponseStructuree,
    AgentRisque,
  } from "@/lib/agent/types";
  
  export {
    CATALOGUE_ACTIONS_AGENT,
    listerActionsAgentAutorisees,
    listerActionsAgentInterdites,
    trouverActionAgent,
  } from "@/lib/agent/catalogueActions";
  
  export {
    construireRefusConseilJuridique,
    estTexteProbablementJuridiquePersonnalise,
    evaluerActionAgent,
  } from "@/lib/agent/gardeFous";
  
  export type { AgentOrientation } from "@/lib/agent/orientation";
  
  export {
    estDemandeJuridiqueSensibleAgent,
    orienterDemandeAgent,
  } from "@/lib/agent/orientation";
  
  export type { ConstruirePromptSystemeAgentParams } from "@/lib/agent/prompt";
  
  export {
    PROMPT_SYSTEME_AGENT_PARENT_PREUVE,
    VERSION_PROMPT_AGENT_PARENT_PREUVE,
    construirePromptSystemeAgent,
  } from "@/lib/agent/prompt";
  
  export type { ResultatValidationReponseAgent } from "@/lib/agent/schemaReponse";
  
  export {
    construireReponseFallback,
    parserEtValiderReponseAgent,
    parserJsonReponseAgent,
    validerReponseAgent,
  } from "@/lib/agent/schemaReponse";