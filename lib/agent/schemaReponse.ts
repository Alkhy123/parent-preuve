// lib/agent/schemaReponse.ts
//
// Validation stricte des réponses du futur Agent IA Parent Preuve.
//
// Ce fichier ne déclenche aucun appel IA.
// Il ne lit pas Supabase.
// Il n'écrit rien en base.
// Il ne consomme aucun quota.
//
// Objectif : sécuriser les futures réponses Mistral avant tout affichage ou
// toute proposition d'action côté interface.

import type {
    AgentActionId,
    AgentActionProposee,
    AgentMode,
    AgentReponseStructuree,
  } from "@/lib/agent/types";
  
  import { evaluerActionAgent } from "@/lib/agent/gardeFous";
  import { trouverActionAgent } from "@/lib/agent/catalogueActions";
  
  export type ResultatValidationReponseAgent =
    | {
        ok: true;
        reponse: AgentReponseStructuree;
      }
    | {
        ok: false;
        erreur: string;
        reponse: AgentReponseStructuree;
      };
  
  const VERSION_REPONSE_AGENT = "agent-parent-preuve-v1" as const;
  
  const HREF_AGENT_AUTORISES = [
    "/",
    "/dossier",
    "/enfants",
    "/journal",
    "/frais",
    "/preuves",
    "/courriers",
    "/export",
  ] as const;
  
  type ObjetInconnu = Record<string, unknown>;
  
  function estObjet(valeur: unknown): valeur is ObjetInconnu {
    return typeof valeur === "object" && valeur !== null && !Array.isArray(valeur);
  }
  
  function lireTexte(
    objet: ObjetInconnu,
    cle: string,
    longueurMax = 800
  ): string | null {
    const valeur = objet[cle];
  
    if (typeof valeur !== "string") {
      return null;
    }
  
    const texte = valeur.trim();
  
    if (texte === "") {
      return null;
    }
  
    return texte.slice(0, longueurMax);
  }
  
  function lireBooleen(objet: ObjetInconnu, cle: string): boolean | null {
    const valeur = objet[cle];
  
    if (typeof valeur !== "boolean") {
      return null;
    }
  
    return valeur;
  }
  
  function normaliserMessages(valeur: unknown): string[] | null {
    if (!Array.isArray(valeur)) {
      return null;
    }
  
    const messages = valeur
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8)
      .map((item) => item.slice(0, 600));
  
    if (messages.length !== valeur.length) {
      return null;
    }
  
    return messages;
  }
  
  function hrefAutorise(href: string) {
    return HREF_AGENT_AUTORISES.includes(
      href as (typeof HREF_AGENT_AUTORISES)[number]
    );
  }
  
  function construireReponseFallback(raison: string): AgentReponseStructuree {
    return {
      version: VERSION_REPONSE_AGENT,
      resume:
        "Le copilote ne peut pas utiliser cette réponse de manière fiable.",
      messages: [
        raison,
        "Aucune donnée n'a été modifiée. Vous pouvez revenir au tableau de bord ou reformuler votre demande.",
      ],
      actionProposee: {
        id: "consulter_etat_dossier",
        titre: "Revenir au tableau de bord",
        raison:
          "Le tableau de bord reste le point d'entrée le plus sûr pour organiser le dossier.",
        href: "/",
      },
      gardeFous: {
        conseilJuridiqueRefuse: false,
        ecritureAutomatiqueRefusee: true,
        validationHumaineRequise: true,
      },
    };
  }
  
  function validerActionProposee(
    valeur: unknown,
    mode: AgentMode
  ): { ok: true; action: AgentActionProposee | null } | { ok: false; erreur: string } {
    if (valeur === null) {
      return { ok: true, action: null };
    }
  
    if (!estObjet(valeur)) {
      return {
        ok: false,
        erreur: "L'action proposée doit être un objet ou null.",
      };
    }
  
    const id = lireTexte(valeur, "id", 120);
    const titre = lireTexte(valeur, "titre", 160);
    const raison = lireTexte(valeur, "raison", 500);
  
    if (!id || !titre || !raison) {
      return {
        ok: false,
        erreur: "L'action proposée est incomplète.",
      };
    }
  
    const actionCatalogue = trouverActionAgent(id as AgentActionId);
  
    if (!actionCatalogue) {
      return {
        ok: false,
        erreur: "L'action proposée n'existe pas dans le catalogue Agent.",
      };
    }
  
    const decision = evaluerActionAgent({
      action: actionCatalogue,
      mode,
      confirmationUtilisateur: false,
    });
  
    if (!decision.autorise) {
      return {
        ok: false,
        erreur: decision.raison,
      };
    }
  
    const hrefBrut = valeur.href;
    let hrefFinal: string | undefined = actionCatalogue.href;
  
    if (typeof hrefBrut === "string" && hrefBrut.trim() !== "") {
      const href = hrefBrut.trim();
  
      if (!hrefAutorise(href)) {
        return {
          ok: false,
          erreur: "L'URL proposée n'est pas autorisée pour l'Agent.",
        };
      }
  
      hrefFinal = href;
    }
  
    const action: AgentActionProposee = {
      id: actionCatalogue.id,
      titre,
      raison,
    };
  
    if (hrefFinal) {
      action.href = hrefFinal;
    }
  
    return {
      ok: true,
      action,
    };
  }
  
  export function parserJsonReponseAgent(texte: string): unknown {
    return JSON.parse(texte);
  }
  
  export function validerReponseAgent(
    valeur: unknown,
    mode: AgentMode = "lecture_seule"
  ): ResultatValidationReponseAgent {
    if (!estObjet(valeur)) {
      return {
        ok: false,
        erreur: "La réponse Agent doit être un objet JSON.",
        reponse: construireReponseFallback(
          "La réponse reçue n'est pas un objet JSON valide."
        ),
      };
    }
  
    if (valeur.version !== VERSION_REPONSE_AGENT) {
      return {
        ok: false,
        erreur: "Version de réponse Agent invalide.",
        reponse: construireReponseFallback(
          "La version de réponse du copilote n'est pas reconnue."
        ),
      };
    }
  
    const resume = lireTexte(valeur, "resume", 500);
    const messages = normaliserMessages(valeur.messages);
  
    if (!resume || messages === null) {
      return {
        ok: false,
        erreur: "La réponse Agent ne contient pas un résumé ou des messages valides.",
        reponse: construireReponseFallback(
          "La réponse du copilote est incomplète."
        ),
      };
    }
  
    const gardeFous = valeur.gardeFous;
  
    if (!estObjet(gardeFous)) {
      return {
        ok: false,
        erreur: "Les garde-fous de la réponse Agent sont absents.",
        reponse: construireReponseFallback(
          "La réponse du copilote ne contient pas de garde-fous exploitables."
        ),
      };
    }
  
    const conseilJuridiqueRefuse = lireBooleen(
      gardeFous,
      "conseilJuridiqueRefuse"
    );
    const ecritureAutomatiqueRefusee = lireBooleen(
      gardeFous,
      "ecritureAutomatiqueRefusee"
    );
    const validationHumaineRequise = lireBooleen(
      gardeFous,
      "validationHumaineRequise"
    );
  
    if (
      conseilJuridiqueRefuse === null ||
      ecritureAutomatiqueRefusee === null ||
      validationHumaineRequise === null
    ) {
      return {
        ok: false,
        erreur: "Les garde-fous de la réponse Agent sont incomplets.",
        reponse: construireReponseFallback(
          "La réponse du copilote ne permet pas de vérifier les garde-fous."
        ),
      };
    }
  
    const resultatAction = validerActionProposee(valeur.actionProposee, mode);
  
    if (!resultatAction.ok) {
      return {
        ok: false,
        erreur: resultatAction.erreur,
        reponse: construireReponseFallback(resultatAction.erreur),
      };
    }
  
    const actionProposee = conseilJuridiqueRefuse
      ? null
      : resultatAction.action;
  
    return {
      ok: true,
      reponse: {
        version: VERSION_REPONSE_AGENT,
        resume,
        messages,
        actionProposee,
        gardeFous: {
          conseilJuridiqueRefuse,
          ecritureAutomatiqueRefusee: true,
          validationHumaineRequise:
            validationHumaineRequise || actionProposee !== null,
        },
      },
    };
  }
  
  export function parserEtValiderReponseAgent(
    texte: string,
    mode: AgentMode = "lecture_seule"
  ): ResultatValidationReponseAgent {
    try {
      const json = parserJsonReponseAgent(texte);
      return validerReponseAgent(json, mode);
    } catch {
      return {
        ok: false,
        erreur: "La réponse Agent n'est pas un JSON valide.",
        reponse: construireReponseFallback(
          "La réponse du copilote n'est pas lisible."
        ),
      };
    }
  }
  
  export { construireReponseFallback };