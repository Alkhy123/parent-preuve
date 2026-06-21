// scripts/check-agent-boundaries.mjs
//
// Vérifie que les routes Assistant historique et Agent nouvelle génération
// ne sont pas mélangées.
//
// État attendu :
// - /api/agent/analyser-demande reste dry-run pur.
// - /api/agent/repondre reste réservé au mode avancé /copilote.
// - /api/agent/pre-remplir est la seule route de pré-remplissage utilisée.
// - /api/assistant/repondre reste utilisé par le bouton flottant pour la question dossier.
// - /api/assistant/pre-remplir est supprimé.
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
  assistantFlottant: "components/AssistantFlottant.tsx",
  copilote: "app/copilote/page.tsx",
};

const fichiersSupprimes = {
  assistantPreRemplir: "app/api/assistant/pre-remplir/route.ts",
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

function verifierFichierAbsent(relatif, contexte) {
  if (existsSync(chemin(relatif))) {
    erreurs.push(`${relatif} : fichier interdit encore présent (${contexte})`);
  }
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

verifierFichierAbsent(
  fichiersSupprimes.assistantPreRemplir,
  "l'ancien pré-remplissage assistant doit être supprimé"
);

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
  "la route /api/agent/repondre doit rester la route Agent Mistral expérimentale générale"
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
  "la route /api/agent/pre-remplir doit rester la seule route de pré-remplissage"
);

verifierPresences(
  fichiers.assistantRepondre,
  [
    "app/api/assistant/repondre/route.ts",
    "verifierQuotaIa",
    "MISTRAL_API_KEY",
  ],
  "l'assistant historique de question/réponse reste séparé"
);

verifierPresences(
  fichiers.assistantFlottant,
  [
    'fetch("/api/agent/analyser-demande"',
    'fetch("/api/agent/pre-remplir"',
    'fetch("/api/assistant/repondre"',
    "data.reponse?.proposition",
  ],
  "le bouton flottant doit utiliser l'Agent pour l'orientation et le pré-remplissage, et conserver l'assistant historique pour la question dossier"
);

verifierAbsences(
  fichiers.assistantFlottant,
  [
    'fetch("/api/agent/repondre"',
    'fetch("/api/assistant/pre-remplir"',
  ],
  "le bouton flottant ne doit pas appeler directement /api/agent/repondre ni l'ancien pré-remplissage assistant"
);

verifierPresences(
  fichiers.copilote,
  [
    'fetch("/api/agent/analyser-demande"',
    'fetch("/api/agent/repondre"',
    'fetch("/api/agent/pre-remplir"',
  ],
  "la page /copilote doit rester le laboratoire Agent"
);

verifierAbsences(
  fichiers.copilote,
  [
    'fetch("/api/assistant/pre-remplir"',
    "Comparer ancien / Agent",
    "appelerAssistantHistoriquePreRemplissage",
    "propositionAssistant",
    "comparaisonEffectuee",
  ],
  "la page /copilote ne doit plus appeler l'ancien pré-remplissage assistant"
);

if (erreurs.length > 0) {
  console.error("\n❌ Séparation Assistant / Agent non conforme.\n");

  for (const erreur of erreurs) {
    console.error(`- ${erreur}`);
  }

  console.error(
    "\nCorrection attendue : /api/agent/analyser-demande doit rester dry-run pur, /api/agent/pre-remplir doit être la seule route de pré-remplissage, /api/agent/repondre doit rester réservé au mode avancé, et /api/assistant/repondre doit rester l'ancienne question dossier tant qu'elle n'est pas migrée.\n"
  );

  process.exit(1);
}

console.log("✅ Séparation Assistant / Agent vérifiée.");