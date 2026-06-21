// lib/agent/preRemplissage.ts
//
// Contrat Agent du futur pré-remplissage.
//
// Ce fichier ne déclenche aucun appel IA.
// Il ne lit pas Supabase.
// Il n'écrit rien en base.
// // Il remplace désormais l'ancien pré-remplissage assistant supprimé.
//
// Rôle : préparer la migration progressive du pré-remplissage historique vers
// l'architecture Agent, en imposant un contrat structuré, validable et compatible
// avec la règle centrale : l'IA propose, l'utilisateur vérifie, l'utilisateur valide.

import {
    CATEGORIES_FRAIS,
    CATEGORIES_JOURNAL,
    nettoyerProposition,
  } from "@/lib/preRemplissage";
  
  import type { Proposition, TypeProposition } from "@/lib/preRemplissage";
  
  export const VERSION_CONTRAT_PREREMPLISSAGE_AGENT =
    "agent-pre-remplissage-v1";
  
  export const TYPES_PREREMPLISSAGE_AGENT = [
    "frais",
    "journal",
    "aucun",
  ] as const satisfies readonly TypeProposition[];
  
  export type AgentTypePreRemplissage = (typeof TYPES_PREREMPLISSAGE_AGENT)[number];
  
  export type AgentGardeFousPreRemplissage = {
    conseilJuridiqueRefuse: boolean;
    ecritureAutomatiqueRefusee: true;
    validationHumaineRequise: true;
    enfantUuidInterdit: true;
  };
  
  export type AgentReponsePreRemplissage = {
    version: typeof VERSION_CONTRAT_PREREMPLISSAGE_AGENT;
    resume: string;
    messages: string[];
    proposition: Proposition;
    gardeFous: AgentGardeFousPreRemplissage;
  };
  
  export type ResultatValidationPreRemplissageAgent =
    | {
        ok: true;
        erreur: "";
        reponse: AgentReponsePreRemplissage;
      }
    | {
        ok: false;
        erreur: string;
        reponse: AgentReponsePreRemplissage;
      };
  
  function lireObjet(valeur: unknown): Record<string, unknown> | null {
    if (valeur && typeof valeur === "object" && !Array.isArray(valeur)) {
      return valeur as Record<string, unknown>;
    }
  
    return null;
  }
  
  function texteCourtOuDefaut(valeur: unknown, defaut: string) {
    if (typeof valeur !== "string") {
      return defaut;
    }
  
    const texte = valeur.trim();
  
    if (texte === "") {
      return defaut;
    }
  
    return texte.slice(0, 300);
  }
  
  function messagesPropres(valeur: unknown) {
    if (!Array.isArray(valeur)) {
      return [];
    }
  
    const messages: string[] = [];
  
    for (const item of valeur) {
      if (typeof item !== "string") {
        continue;
      }
  
      const texte = item.trim();
  
      if (texte === "") {
        continue;
      }
  
      messages.push(texte.slice(0, 300));
  
      if (messages.length >= 5) {
        break;
      }
    }
  
    return messages;
  }
  
  function gardeFousParDefaut(): AgentGardeFousPreRemplissage {
    return {
      conseilJuridiqueRefuse: false,
      ecritureAutomatiqueRefusee: true,
      validationHumaineRequise: true,
      enfantUuidInterdit: true,
    };
  }
  
  export function construireReponsePreRemplissageAgent({
    proposition,
    resume = "Le copilote peut proposer un pré-remplissage à vérifier.",
    messages = [],
  }: {
    proposition: unknown;
    resume?: string;
    messages?: string[];
  }): AgentReponsePreRemplissage {
    return {
      version: VERSION_CONTRAT_PREREMPLISSAGE_AGENT,
      resume,
      messages: [
        ...messages,
        "Aucune donnée n'a été enregistrée.",
        "L'utilisateur doit vérifier et valider lui-même les champs proposés.",
      ],
      proposition: nettoyerProposition(proposition),
      gardeFous: gardeFousParDefaut(),
    };
  }
  
  export function construireReponsePreRemplissageRefusee(
    raison: string
  ): AgentReponsePreRemplissage {
    return {
      version: VERSION_CONTRAT_PREREMPLISSAGE_AGENT,
      resume: "Le copilote ne peut pas proposer ce pré-remplissage.",
      messages: [
        raison,
        "Aucune donnée n'a été enregistrée.",
        "Vous pouvez saisir les informations manuellement dans la rubrique adaptée.",
      ],
      proposition: {
        type: "aucun",
        champs: null,
        avertissements: [raison.slice(0, 200)],
      },
      gardeFous: {
        conseilJuridiqueRefuse: true,
        ecritureAutomatiqueRefusee: true,
        validationHumaineRequise: true,
        enfantUuidInterdit: true,
      },
    };
  }
  
  export function parserJsonPreRemplissageAgent(texte: string) {
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
  
  export function validerReponsePreRemplissageAgent(
    brut: unknown
  ): ResultatValidationPreRemplissageAgent {
    const objet = lireObjet(brut);
  
    if (!objet) {
      return {
        ok: false,
        erreur: "La réponse IA n'est pas un objet.",
        reponse: construireReponsePreRemplissageAgent({
          proposition: null,
          resume: "Le pré-remplissage n'a pas pu être exploité.",
          messages: ["La réponse reçue n'a pas la forme attendue."],
        }),
      };
    }
  
    if (objet.version !== VERSION_CONTRAT_PREREMPLISSAGE_AGENT) {
      return {
        ok: false,
        erreur: "La version du contrat de pré-remplissage Agent est invalide.",
        reponse: construireReponsePreRemplissageAgent({
          proposition: null,
          resume: "Le pré-remplissage n'a pas pu être exploité.",
          messages: ["La version du contrat Agent est absente ou invalide."],
        }),
      };
    }
  
    const proposition = nettoyerProposition(objet.proposition);
  
    const reponse: AgentReponsePreRemplissage = {
      version: VERSION_CONTRAT_PREREMPLISSAGE_AGENT,
      resume: texteCourtOuDefaut(
        objet.resume,
        "Le copilote propose un pré-remplissage à vérifier."
      ),
      messages: [
        ...messagesPropres(objet.messages),
        "Aucune donnée n'a été enregistrée automatiquement.",
        "La validation humaine reste obligatoire.",
      ],
      proposition,
      gardeFous: gardeFousParDefaut(),
    };
  
    return {
      ok: true,
      erreur: "",
      reponse,
    };
  }
  
  export function parserEtValiderReponsePreRemplissageAgent(
    texte: string
  ): ResultatValidationPreRemplissageAgent {
    const parse = parserJsonPreRemplissageAgent(texte);
  
    if (!parse.ok) {
      return {
        ok: false,
        erreur: parse.erreur,
        reponse: construireReponsePreRemplissageAgent({
          proposition: null,
          resume: "Le pré-remplissage n'a pas pu être exploité.",
          messages: [parse.erreur],
        }),
      };
    }
  
    return validerReponsePreRemplissageAgent(parse.valeur);
  }
  
  export function construireConsignePreRemplissageAgent(aujourdhui: string) {
    const fraisListe = CATEGORIES_FRAIS.join(", ");
    const journalListe = CATEGORIES_JOURNAL.join(", ");
  
    return `
  Tu aides l'utilisateur à préparer un pré-remplissage factuel dans Parent Preuve.
  
  Tu ne valides rien.
  Tu n'enregistres rien.
  Tu ne modifies aucune donnée.
  Tu ne donnes aucun conseil juridique.
  Tu proposes uniquement des champs que l'utilisateur devra vérifier puis valider lui-même.
  
  Tu dois répondre uniquement en JSON strict, sans Markdown et sans texte autour.
  
  Version obligatoire :
  ${VERSION_CONTRAT_PREREMPLISSAGE_AGENT}
  
  Types autorisés :
  - "frais" si la phrase décrit une dépense, un paiement, un montant, un achat ou un remboursement.
  - "journal" si la phrase décrit un fait daté à noter : retard, absence, incident, échange, événement.
  - "aucun" si rien ne correspond clairement.
  
  Priorité :
  - Si un montant, un paiement, une facture, une cantine ou un remboursement apparaît, choisir "frais".
  - Si aucun montant n'apparaît et que la phrase décrit un fait, choisir "journal".
  - Si la phrase demande une stratégie judiciaire, des conclusions ou un conseil juridique, choisir "aucun".
  
  Catégories frais autorisées :
  ${fraisListe}
  
  Catégories journal autorisées :
  ${journalListe}
  
  Date du jour serveur :
  ${aujourdhui}
  
  Règles strictes :
  - N'invente jamais une information absente.
  - Si une information manque ou semble douteuse, mets null.
  - L'enfant doit être un prénom ou alias en texte, jamais un UUID.
  - Le montant doit être un nombre en euros, sans symbole.
  - La date doit être au format AAAA-MM-JJ.
  - Si l'année n'est pas précisée, choisir la date la plus proche dans le passé.
  - Si la date reste impossible à déterminer, mettre null.
  - La catégorie doit être exactement une catégorie autorisée, sinon "Autre".
  - Les avertissements doivent être courts, neutres et factuels.
  
  Format attendu :
  
  {
    "version": "${VERSION_CONTRAT_PREREMPLISSAGE_AGENT}",
    "resume": "Résumé court du pré-remplissage proposé.",
    "messages": [
      "Message factuel utile."
    ],
    "proposition": {
      "type": "frais",
      "champs": {
        "libelle": "string ou null",
        "categorie": "catégorie autorisée",
        "montant": 45,
        "date": "AAAA-MM-JJ ou null",
        "enfant": "string ou null"
      },
      "avertissements": []
    }
  }
  
  Pour un journal :
  
  {
    "version": "${VERSION_CONTRAT_PREREMPLISSAGE_AGENT}",
    "resume": "Résumé court du pré-remplissage proposé.",
    "messages": [
      "Message factuel utile."
    ],
    "proposition": {
      "type": "journal",
      "champs": {
        "titre": "string ou null",
        "categorie": "catégorie autorisée",
        "date": "AAAA-MM-JJ ou null",
        "description": "string ou null",
        "enfant": "string ou null"
      },
      "avertissements": []
    }
  }
  
  Pour aucun résultat :
  
  {
    "version": "${VERSION_CONTRAT_PREREMPLISSAGE_AGENT}",
    "resume": "Aucun pré-remplissage fiable n'a été identifié.",
    "messages": [
      "Vous pouvez saisir les informations manuellement."
    ],
    "proposition": {
      "type": "aucun",
      "champs": null,
      "avertissements": []
    }
  }
  `.trim();
  }