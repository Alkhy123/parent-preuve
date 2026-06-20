// lib/agent/config.ts
//
// Configuration centralisée du Copilote Agent.
//
// Ce fichier ne déclenche aucun appel IA.
// Il ne lit pas Supabase.
// Il n'écrit rien en base.
// Il centralise uniquement les constantes partagées entre les routes Agent.

export const FONCTIONNALITE_CONSENTEMENT_AGENT = "agent";
export const FONCTIONNALITE_QUOTA_AGENT = "agent";

export const LIMITE_CARACTERES_MESSAGE_AGENT = 1000;
export const LIMITE_CARACTERES_RESUME_AGENT = 4000;

export const QUOTA_AGENT_NOMBRE_APPELS = 10;
export const QUOTA_AGENT_FENETRE_SECONDES = 60;

export const MAX_TOKENS_AGENT_MISTRAL = 700;

export const ENDPOINT_MISTRAL_CHAT_COMPLETIONS =
  "https://api.mistral.ai/v1/chat/completions";