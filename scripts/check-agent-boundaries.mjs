// scripts/check-agent-boundaries.mjs
//
// Vérifie que les routes Assistant historique et Agent nouvelle génération
// ne sont pas mélangées.
//
// Objectif : bloquer le build Vercel si /api/agent/analyser-demande
// redevient accidentellement une route Mistral avec quota, consentement ou
// appel IA.
//
// Ce script est volontairement simple, sans dépendance externe.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

const fichiers = {
  agentDryRun: "app/api/agent/analyser-demande/route.ts",
  agentMistral: "app/api/agent/repondre/route.ts",
  agentPreRemplir: "app/api/agent/pre-remplir/route.ts",
  assistantRepondre: "app/api/assistant/repondre/route.ts",
  assistantPreRemplir: "app/api/assistant/pre-remplir/route.ts",
  assistantFlottant: "components/AssistantFlottant.tsx",
};

const erreurs = [];

function chemin(relatif) {
  return join(racine, relatif);
}

function lire(relatif) {
  const absolu = chemin(relatif);

  if (!existsSync(absolu)) {
    erreurs.push(`Fichier introuvable : ${relatif}`);
    return "";
  }

  return readFileSync(absolu, "utf8");
}

function verifierPresences(relatif, termes, contexte) {
  const contenu = lire(relatif);

  for (const terme of termes) {
    if (!contenu.includes(terme)) {
      erreurs.push(
        `${relatif} : terme obligatoire absent (${contexte}) : ${terme}`
      );
    }
  }
}

function verifierAbsences(relatif, termes, contexte) {
  const contenu = lire(relatif);

  for (const terme of termes) {
    if (contenu.includes(terme)) {
      erreurs.push(`${relatif} : terme interdit (${contexte}) : ${terme}`);
    }
  }
}

verifierPresences(
  fichiers.agentDryRun,
  [
    "Agent Parent Preuve — route dry-run sécurisée",
    "aucun appel Mistral",
    "orienterDemandeAgent",
    "construireReponseOrientation",
  ],
  "la route dry-run Agent doit rester déterministe"
);

verifierAbsences(
  fichiers.agentDryRun,
  [
    "MISTRAL_API_KEY",
    "ENDPOINT_MISTRAL_CHAT_COMPLETIONS",
    "verifierQuotaIa",
    "MODELE_ASSISTANT",
    "createClient(",
    "FONCTIONNALITE_CONSENTEMENT_AGENT",
    "FONCTIONNALITE_QUOTA_AGENT",
    "MAX_TOKENS_AGENT_MISTRAL",
    "parserEtValiderReponseAgent",
    "construirePromptSystemeAgent",
    "clientUtilisateur",
    "nettoyerJsonEventuel",
  ],
  "la route /api/agent/analyser-demande ne doit jamais appeler Mistral, quota ou consentement"
);

verifierPresences(
  fichiers.agentMistral,
  [
    "ENDPOINT_MISTRAL_CHAT_COMPLETIONS",
    "verifierQuotaIa",
    "MISTRAL_API_KEY",
    "parserEtValiderReponseAgent",
    "orienterDemandeAgent",
    "construireReponseOrientationDeterminee",
  ],
  "la route /api/agent/repondre doit rester la route Agent Mistral expérimentale"
);

verifierPresences(
  fichiers.agentPreRemplir,
  [
    "Agent Parent Preuve — pré-remplissage expérimental",
    "ENDPOINT_MISTRAL_CHAT_COMPLETIONS",
    "verifierQuotaIa",
    "MISTRAL_API_KEY",
    "construireConsignePreRemplissageAgent",
    "parserEtValiderReponsePreRemplissageAgent",
    "aucune écriture métier en base",
  ],
  "la route /api/agent/pre-remplir doit rester une route expérimentale structurée et non branchée"
);

verifierPresences(
  fichiers.assistantRepondre,
  ["app/api/assistant/repondre/route.ts", "verifierQuotaIa", "MISTRAL_API_KEY"],
  "l'assistant historique de question/réponse reste séparé"
);

verifierPresences(
  fichiers.assistantPreRemplir,
  [
    "app/api/assistant/pre-remplir/route.ts",
    "verifierQuotaIa",
    "nettoyerProposition",
    "MISTRAL_API_KEY",
  ],
  "l'assistant historique de pré-remplissage reste séparé"
);

verifierPresences(
  fichiers.assistantFlottant,
  [
    'fetch("/api/agent/analyser-demande"',
    'fetch("/api/assistant/repondre"',
    'fetch("/api/assistant/pre-remplir"',
  ],
  "le bouton flottant doit appeler les bonnes routes"
);

verifierAbsences(
  fichiers.assistantFlottant,
  ['fetch("/api/agent/repondre"', 'fetch("/api/agent/pre-remplir"'],
  "le bouton flottant ne doit pas appeler directement les routes Mistral Agent expérimentales"
);

if (erreurs.length > 0) {
  console.error("\n❌ Séparation Assistant / Agent non conforme.\n");

  for (const erreur of erreurs) {
    console.error(`- ${erreur}`);
  }

  console.error(
    "\nCorrection attendue : /api/agent/analyser-demande doit rester dry-run pur, les routes Agent Mistral doivent rester isolées, et /api/assistant/* doit rester l'ancienne génération tant qu'elle est utilisée.\n"
  );

  process.exit(1);
}

console.log("✅ Séparation Assistant / Agent vérifiée.");