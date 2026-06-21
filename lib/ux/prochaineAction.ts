// lib/ux/prochaineAction.ts
//
// Logique PURE de "prochaine etape recommandee" pour l'accueil connecte.
//
// - Ne lit jamais Supabase et n'appelle jamais l'IA : le composant charge
//   l'etat reel (helpers existants) puis appelle cette fonction.
// - Renvoie UNE seule action prioritaire, ou null si rien d'utile a proposer.
// - Reste robuste si des donnees manquent (socle null, etc.).
//
// L'ordre de priorite suit le bloc UX 01. Les etapes "assistant de demarrage"
// et "calendrier" ne sont pas encore detectables (blocs ulterieurs) : elles
// sont volontairement absentes ici.

export type ProchaineAction = {
  cle: string;
  priorite: "bloquant" | "important" | "conseil";
  titre: string;
  description: string;
  href: string;
  cta: string;
};

// Etat deja charge, transmis par le composant (aucune dependance Supabase ici).
export type EntreeProchaineAction = {
  // Socle declarant + autre parent + reference jugement (null si lecture impossible).
  socle:
    | {
        parent1Complet: boolean;
        parent2Complet: boolean;
        referenceJugementRenseignee: boolean;
      }
    | null;
  nombreEnfants: number;
  // Etat des regles extraites du jugement : "a_valider" = regles proposees non validees.
  jugement: "a_analyser" | "a_valider" | "analyse";
  fraisSansJustificatif: number;
  evenementsEnBrouillon: number;
  preuvesHorodatageARefaire: number;
  soldePension: number;
};

const pluriel = (n: number) => (n > 1 ? "s" : "");

/**
 * Determine l'unique prochaine action recommandee selon l'etat du dossier.
 * Renvoie null quand aucune action n'est prioritaire (le composant affiche
 * alors un message de secours rassurant et non anxiogene).
 */
export function prochaineAction(
  entree: EntreeProchaineAction
): ProchaineAction | null {
  const {
    socle,
    nombreEnfants,
    jugement,
    fraisSansJustificatif,
    evenementsEnBrouillon,
    preuvesHorodatageARefaire,
    soldePension,
  } = entree;

  // 1. Socle declarant incomplet (ou lecture du socle impossible).
  if (!socle || !socle.parent1Complet) {
    return {
      cle: "socle",
      priorite: "bloquant",
      titre: "Compléter votre état civil",
      description:
        "Renseignez vos nom et prénom de déclarant pour poser le socle du dossier.",
      href: "/dossier",
      cta: "Compléter le socle",
    };
  }

  // 2. Autre parent / procedure incomplet.
  if (!socle.parent2Complet) {
    return {
      cle: "autre-parent",
      priorite: "bloquant",
      titre: "Renseigner l'autre parent",
      description:
        "Indiquez l'autre parent rattaché à la procédure pour structurer le dossier.",
      href: "/procedure",
      cta: "Renseigner la procédure",
    };
  }

  // 3. Aucun enfant rattache a la procedure active.
  if (nombreEnfants === 0) {
    return {
      cle: "enfants",
      priorite: "bloquant",
      titre: "Ajouter un enfant",
      description:
        "Ajoutez au moins un enfant pour rattacher les faits, frais et preuves.",
      href: "/enfants",
      cta: "Ajouter un enfant",
    };
  }

  // 4. Reference du jugement non renseignee.
  if (!socle.referenceJugementRenseignee) {
    return {
      cle: "jugement",
      priorite: "important",
      titre: "Renseigner le jugement",
      description:
        "Ajoutez la juridiction et la date du jugement pour cadrer les règles du dossier.",
      href: "/dossier/importer-pdf",
      cta: "Renseigner le jugement",
    };
  }

  // 5. Regles extraites a relire et valider.
  if (jugement === "a_valider") {
    return {
      cle: "regles",
      priorite: "important",
      titre: "Valider les règles du dossier",
      description:
        "Des règles ont été proposées à partir du jugement : relisez-les et validez-les.",
      href: "/dossier/importer-pdf",
      cta: "Vérifier les règles",
    };
  }

  // 6. Frais sans justificatif rattache.
  if (fraisSansJustificatif > 0) {
    const n = fraisSansJustificatif;
    return {
      cle: "frais",
      priorite: "conseil",
      titre: `Rattacher ${n} justificatif${pluriel(n)}`,
      description: `${n} frais ${n > 1 ? "n'ont" : "n'a"} pas encore de justificatif rattaché.`,
      href: "/frais",
      cta: "Compléter les frais",
    };
  }

  // 7. Evenements encore en brouillon.
  if (evenementsEnBrouillon > 0) {
    const n = evenementsEnBrouillon;
    return {
      cle: "brouillons",
      priorite: "conseil",
      titre: `Finaliser ${n} brouillon${pluriel(n)}`,
      description: `${n} événement${pluriel(n)} ${n > 1 ? "sont" : "est"} encore en brouillon dans le journal.`,
      href: "/journal",
      cta: "Ouvrir le journal",
    };
  }

  // 8. Preuves dont l'horodatage est a reprendre.
  if (preuvesHorodatageARefaire > 0) {
    const n = preuvesHorodatageARefaire;
    return {
      cle: "preuves",
      priorite: "conseil",
      titre: `Reprendre ${n} preuve${pluriel(n)}`,
      description: `L'horodatage de ${n} preuve${pluriel(n)} est à reprendre.`,
      href: "/preuves",
      cta: "Ouvrir les preuves",
    };
  }

  // 9. Pension : reste du a suivre.
  if (soldePension > 0) {
    return {
      cle: "pension",
      priorite: "conseil",
      titre: "Suivre la pension",
      description: "Un reste dû de pension est à suivre.",
      href: "/pension",
      cta: "Ouvrir la pension",
    };
  }

  // Rien de prioritaire : le composant affiche le message de secours.
  return null;
}
