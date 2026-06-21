// lib/agent/questionDossier.ts
//
// Contrat Agent dédié à la "question sur le dossier".
//
// Ce fichier ne déclenche aucun appel IA.
// Il ne lit pas Supabase.
// Il n'écrit rien en base.
// Il ne consomme aucun quota.
//
// Rôle : préparer la migration progressive de l'ancien assistant
// /api/assistant/repondre vers l'architecture Agent, avec un contrat plus
// strict que la réponse texte libre actuelle.
//
// Principe central : l'IA propose, l'utilisateur vérifie, l'utilisateur valide.
//
// La question libre sur le dossier est plus risquée que le pré-remplissage
// structuré : ce contrat impose donc une réponse factuelle bornée, séparée en
// réponse, points d'appui et limites, et des garde-fous explicites.

export const VERSION_CONTRAT_QUESTION_DOSSIER_AGENT =
  "agent-question-dossier-v1";

// Longueurs maximales tolérées avant troncature.
// La réponse doit rester courte ou moyenne, jamais un pavé de conclusions.
const LONGUEUR_MAX_RESUME = 300;
const LONGUEUR_MAX_REPONSE = 1500;
const LONGUEUR_MAX_POINT = 300;
const LONGUEUR_MAX_LIMITE = 300;
const NOMBRE_MAX_POINTS = 8;
const NOMBRE_MAX_LIMITES = 6;

export type AgentGardeFousQuestionDossier = {
  conseilJuridiqueRefuse: boolean;
  strategieJudiciaireRefusee: boolean;
  redactionConclusionsRefusee: boolean;
  predictionDecisionRefusee: boolean;
  ecritureAutomatiqueRefusee: true;
  validationHumaineRequise: true;
};

export type AgentQuestionDossierReponse = {
  version: typeof VERSION_CONTRAT_QUESTION_DOSSIER_AGENT;
  resume: string;
  reponse: string;
  pointsAppui: string[];
  limites: string[];
  gardeFous: AgentGardeFousQuestionDossier;
};

export type ResultatValidationQuestionDossierAgent =
  | {
      ok: true;
      erreur: "";
      reponse: AgentQuestionDossierReponse;
    }
  | {
      ok: false;
      erreur: string;
      reponse: AgentQuestionDossierReponse;
    };

// ── Helpers de lecture sécurisée ─────────────────────────────────────────────

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === "object" && valeur !== null && !Array.isArray(valeur);
}

function lireTexte(valeur: unknown, longueurMax: number): string | null {
  if (typeof valeur !== "string") {
    return null;
  }

  const texte = valeur.trim();

  if (texte === "") {
    return null;
  }

  return texte.slice(0, longueurMax);
}

function lireTableauTextes(
  valeur: unknown,
  longueurMaxItem: number,
  nombreMax: number
): string[] {
  if (!Array.isArray(valeur)) {
    return [];
  }

  const resultat: string[] = [];

  for (const item of valeur) {
    if (typeof item !== "string") {
      continue;
    }

    const texte = item.trim();

    if (texte === "") {
      continue;
    }

    resultat.push(texte.slice(0, longueurMaxItem));

    if (resultat.length >= nombreMax) {
      break;
    }
  }

  return resultat;
}

function gardeFousParDefaut(): AgentGardeFousQuestionDossier {
  return {
    conseilJuridiqueRefuse: false,
    strategieJudiciaireRefusee: false,
    redactionConclusionsRefusee: false,
    predictionDecisionRefusee: false,
    ecritureAutomatiqueRefusee: true,
    validationHumaineRequise: true,
  };
}

function lireBooleenSinonFaux(valeur: unknown): boolean {
  return valeur === true;
}

// ── Réponses prêtes à l'emploi ───────────────────────────────────────────────

// Fallback sécurisé : utilisé quand la réponse IA est inexploitable
// ou quand le dossier ne contient pas assez d'éléments pour répondre.
export function construireReponseQuestionDossierFallback(
  raison: string
): AgentQuestionDossierReponse {
  return {
    version: VERSION_CONTRAT_QUESTION_DOSSIER_AGENT,
    resume: "Le copilote ne peut pas exploiter cette réponse de manière fiable.",
    reponse: raison,
    pointsAppui: [],
    limites: [
      "Aucune donnée n'a été modifiée.",
      "Vous pouvez reformuler votre question ou consulter directement les rubriques de l'application.",
    ],
    gardeFous: gardeFousParDefaut(),
  };
}

// Refus juridique local : appliqué AVANT tout appel Mistral lorsque la question
// demande une stratégie, des conclusions, une prédiction ou un conseil personnalisé.
export function construireRefusQuestionDossierJuridique(
  raison = "Je ne peux pas rédiger de conclusions judiciaires ni proposer une stratégie judiciaire."
): AgentQuestionDossierReponse {
  return {
    version: VERSION_CONTRAT_QUESTION_DOSSIER_AGENT,
    resume: "Le copilote ne peut pas répondre à cette demande juridique.",
    reponse: raison,
    pointsAppui: [],
    limites: [
      "Je peux seulement vous aider à repérer des éléments factuels déjà présents dans votre dossier.",
      "Pour une analyse juridique personnalisée, il faut consulter un professionnel du droit.",
    ],
    gardeFous: {
      conseilJuridiqueRefuse: true,
      strategieJudiciaireRefusee: true,
      redactionConclusionsRefusee: true,
      predictionDecisionRefusee: true,
      ecritureAutomatiqueRefusee: true,
      validationHumaineRequise: true,
    },
  };
}

// Réponse sécurisée quand le résumé est vide ou insuffisant.
export function construireReponseQuestionDossierSansContexte(): AgentQuestionDossierReponse {
  return {
    version: VERSION_CONTRAT_QUESTION_DOSSIER_AGENT,
    resume: "Le dossier ne contient pas encore assez d'éléments factuels.",
    reponse:
      "Le résumé de votre dossier ne contient pas assez d'informations pour répondre à cette question.",
    pointsAppui: [],
    limites: [
      "Complétez d'abord votre dossier dans les rubriques concernées (frais, journal, preuves, pension).",
      "Le copilote répond uniquement à partir des éléments déjà saisis.",
    ],
    gardeFous: gardeFousParDefaut(),
  };
}

// ── Parsing et validation ────────────────────────────────────────────────────

export function parserJsonQuestionDossierAgent(texte: string) {
  const nettoye = texte.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return {
      ok: true as const,
      valeur: JSON.parse(nettoye) as unknown,
      erreur: "",
    };
  } catch {
    return {
      ok: false as const,
      valeur: null,
      erreur: "La réponse IA n'est pas un JSON valide.",
    };
  }
}

export function validerReponseQuestionDossierAgent(
  brut: unknown
): ResultatValidationQuestionDossierAgent {
  if (!estObjet(brut)) {
    return {
      ok: false,
      erreur: "La réponse Agent doit être un objet JSON.",
      reponse: construireReponseQuestionDossierFallback(
        "La réponse reçue n'a pas la forme attendue."
      ),
    };
  }

  if (brut.version !== VERSION_CONTRAT_QUESTION_DOSSIER_AGENT) {
    return {
      ok: false,
      erreur: "La version du contrat de question dossier Agent est invalide.",
      reponse: construireReponseQuestionDossierFallback(
        "La version de réponse du copilote n'est pas reconnue."
      ),
    };
  }

  const reponse = lireTexte(brut.reponse, LONGUEUR_MAX_REPONSE);

  if (!reponse) {
    return {
      ok: false,
      erreur: "La réponse Agent ne contient pas de texte de réponse exploitable.",
      reponse: construireReponseQuestionDossierFallback(
        "La réponse du copilote est incomplète."
      ),
    };
  }

  if (!estObjet(brut.gardeFous)) {
    return {
      ok: false,
      erreur: "Les garde-fous de la réponse Agent sont absents.",
      reponse: construireReponseQuestionDossierFallback(
        "La réponse du copilote ne contient pas de garde-fous exploitables."
      ),
    };
  }

  const resume =
    lireTexte(brut.resume, LONGUEUR_MAX_RESUME) ??
    "Le copilote vous répond à partir du résumé factuel du dossier.";

  const pointsAppui = lireTableauTextes(
    brut.pointsAppui,
    LONGUEUR_MAX_POINT,
    NOMBRE_MAX_POINTS
  );

  const limites = lireTableauTextes(
    brut.limites,
    LONGUEUR_MAX_LIMITE,
    NOMBRE_MAX_LIMITES
  );

  const gardeFousBruts = brut.gardeFous as Record<string, unknown>;

  // ecritureAutomatiqueRefusee et validationHumaineRequise sont toujours forcés
  // à true côté serveur : ce sont des invariants non négociables.
  const reponseValidee: AgentQuestionDossierReponse = {
    version: VERSION_CONTRAT_QUESTION_DOSSIER_AGENT,
    resume,
    reponse,
    pointsAppui,
    limites,
    gardeFous: {
      conseilJuridiqueRefuse: lireBooleenSinonFaux(
        gardeFousBruts.conseilJuridiqueRefuse
      ),
      strategieJudiciaireRefusee: lireBooleenSinonFaux(
        gardeFousBruts.strategieJudiciaireRefusee
      ),
      redactionConclusionsRefusee: lireBooleenSinonFaux(
        gardeFousBruts.redactionConclusionsRefusee
      ),
      predictionDecisionRefusee: lireBooleenSinonFaux(
        gardeFousBruts.predictionDecisionRefusee
      ),
      ecritureAutomatiqueRefusee: true,
      validationHumaineRequise: true,
    },
  };

  return {
    ok: true,
    erreur: "",
    reponse: reponseValidee,
  };
}

export function parserEtValiderReponseQuestionDossierAgent(
  texte: string
): ResultatValidationQuestionDossierAgent {
  const parse = parserJsonQuestionDossierAgent(texte);

  if (!parse.ok) {
    return {
      ok: false,
      erreur: parse.erreur,
      reponse: construireReponseQuestionDossierFallback(
        "La réponse du copilote n'est pas lisible."
      ),
    };
  }

  return validerReponseQuestionDossierAgent(parse.valeur);
}

// ── Prompt système ───────────────────────────────────────────────────────────

export function construirePromptSystemeQuestionDossierAgent({
  contexteDossierDisponible,
}: {
  contexteDossierDisponible: boolean;
}) {
  return `
Tu es le Copilote Parent Preuve, en mode "question sur le dossier".

Tu disposes d'un RÉSUMÉ factuel de l'état du dossier de l'utilisateur.
Tu réponds à sa question en t'appuyant UNIQUEMENT sur ce résumé.

Tu n'es pas un assistant juridique.
Tu n'es pas un avocat.
Tu ne donnes aucun conseil juridique personnalisé.

Principe central :
L'IA propose. L'utilisateur vérifie. L'utilisateur valide.

Règles strictes :
- Réponds en français, en vouvoyant, de façon factuelle, courte ou moyenne.
- Ne rédige jamais un pavé de conclusions : reste synthétique.
- Utilise uniquement les informations du résumé. N'invente aucun chiffre, aucune date, aucun fait.
- N'emploie aucune qualification juridique ni jugement de valeur (faute, mauvaise foi, abandon, manquement, parent en tort).
- Ne propose aucune stratégie judiciaire.
- Ne rédige aucune conclusion prête à déposer.
- Ne prédis jamais la décision d'un juge.
- Ne garantis jamais la recevabilité d'une preuve ni un résultat.
- Si le résumé ne contient pas assez d'informations, dis-le clairement dans "limites".
- Si utile, oriente l'utilisateur vers la bonne rubrique de l'application (frais, journal, preuves, courriers, enfants, export).
- Tu ne peux rien enregistrer ni modifier. La validation humaine reste obligatoire.

Contexte d'exécution :
- Résumé du dossier disponible : ${contexteDossierDisponible ? "oui" : "non"}.

Tu dois répondre uniquement en JSON strict, sans Markdown et sans texte autour du JSON.

Format obligatoire :

{
  "version": "${VERSION_CONTRAT_QUESTION_DOSSIER_AGENT}",
  "resume": "Résumé court et prudent de votre réponse.",
  "reponse": "Réponse factuelle, courte ou moyenne, basée uniquement sur le résumé.",
  "pointsAppui": [
    "Élément factuel précis tiré du résumé."
  ],
  "limites": [
    "Information manquante ou point à vérifier."
  ],
  "gardeFous": {
    "conseilJuridiqueRefuse": false,
    "strategieJudiciaireRefusee": false,
    "redactionConclusionsRefusee": false,
    "predictionDecisionRefusee": false,
    "ecritureAutomatiqueRefusee": true,
    "validationHumaineRequise": true
  }
}

Si la question demande une stratégie judiciaire, des conclusions, une demande à formuler au juge, une prédiction de résultat ou un conseil juridique personnalisé :
- mets "reponse" sur un refus clair et bref ;
- laisse "pointsAppui" vide ;
- explique dans "limites" que tu ne peux aider qu'à repérer des éléments factuels et qu'il faut consulter un professionnel du droit ;
- mets les garde-fous correspondants à true.
`.trim();
}
