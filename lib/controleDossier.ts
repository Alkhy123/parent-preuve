// src/lib/controleDossier.ts
//
// Brique C — Contrôle du dossier AVANT export PDF.
//
// Ce fichier ne contient QUE de la logique : il ne parle pas à Supabase.
// Il reçoit un objet "tout prêt" (DonneesControle) décrivant l'état du dossier,
// et il renvoie la liste des problèmes trouvés. C'est le composant ControleDossier.tsx
// (étape C2) qui ira chercher les vraies données dans Supabase et les traduira
// dans cette forme avant d'appeler ce moteur.
//
// Avantage : cette fonction est "pure" (mêmes entrées => mêmes sorties),
// donc facile à lire, à tester et à faire évoluer sans rien casser.

// ── Les types ───────────────────────────────────────────────────────────────

/** Gravité d'un problème détecté. */
export type NiveauProbleme = "bloquant" | "avertissement";

/** Un point relevé par le contrôle. */
export type Probleme = {
  niveau: NiveauProbleme;
  /** Message affichable tel quel à l'utilisateur. */
  message: string;
};

/**
 * État du dossier, sous une forme simple et stable.
 * Le composant C2 remplit cet objet à partir des données Supabase.
 */
export type DonneesControle = {
  /**
   * Le socle (/dossier). `null` s'il n'existe aucune ligne enregistrée.
   * On passe des booléens "déjà calculés" pour que ce moteur n'ait pas
   * à connaître les noms exacts des colonnes du socle.
   */
  socle: {
    parent1Complet: boolean; // état civil du parent 1 renseigné
    parent2Complet: boolean; // état civil du parent 2 renseigné
    referenceJugementRenseignee: boolean; // référence du jugement présente
  } | null;

  /** Nombre d'enfants enregistrés. */
  nombreEnfants: number;

  /** Période d'export choisie sur la page /export ("YYYY-MM-DD" ou "" si vide). */
  periode: { du: string; au: string };

  /** Nombre de frais sans aucun justificatif rattaché. */
  fraisSansJustificatif: number;

  /** Nombre d'événements restés en statut « brouillon ». */
  evenementsEnBrouillon: number;

  /** Nombre de pièces (documents) rattachées à rien. */
  piecesNonRattachees: number;

  /** Nombre de preuves photo dont l'horodatage est « à refaire ». */
  preuvesHorodatageARefaire: number;
};

// ── Le moteur ─────────────────────────────────────────────────────────────────

/**
 * Examine l'état du dossier et renvoie la liste des problèmes.
 * Liste vide = tout est bon.
 */
export function controlerDossier(d: DonneesControle): Probleme[] {
  const problemes: Probleme[] = [];

  // 🔴 1. Socle incomplet
  const socleComplet =
    d.socle !== null &&
    d.socle.parent1Complet &&
    d.socle.parent2Complet &&
    d.socle.referenceJugementRenseignee;
  if (!socleComplet) {
    problemes.push({
      niveau: "bloquant",
      message:
        "Socle incomplet : il manque l'état civil des deux parents et/ou la référence du jugement (page « Mon dossier »).",
    });
  }

  // 🔴 2. Aucun enfant
  if (d.nombreEnfants === 0) {
    problemes.push({
      niveau: "bloquant",
      message: "Aucun enfant n'est renseigné.",
    });
  }

  // 🔴 3. Période incohérente
  // On ne contrôle que si les deux dates sont remplies (comparaison de chaînes
  // "YYYY-MM-DD", qui se comparent correctement dans l'ordre alphabétique).
  if (d.periode.du && d.periode.au && d.periode.du > d.periode.au) {
    problemes.push({
      niveau: "bloquant",
      message:
        "Période incohérente : la date de début est postérieure à la date de fin.",
    });
  }

  // 🟠 4. Frais sans justificatif
  if (d.fraisSansJustificatif > 0) {
    problemes.push({
      niveau: "avertissement",
      message: `Frais sans justificatif : ${d.fraisSansJustificatif}.`,
    });
  }

  // 🟠 5. Événements en brouillon
  if (d.evenementsEnBrouillon > 0) {
    problemes.push({
      niveau: "avertissement",
      message: `Événements encore en brouillon : ${d.evenementsEnBrouillon}.`,
    });
  }

  // 🟠 6. Pièces non rattachées
  if (d.piecesNonRattachees > 0) {
    problemes.push({
      niveau: "avertissement",
      message: `Pièces rattachées à rien : ${d.piecesNonRattachees}.`,
    });
  }

  // 🟠 7. Preuves dont l'horodatage est à refaire
  if (d.preuvesHorodatageARefaire > 0) {
    problemes.push({
      niveau: "avertissement",
      message: `Preuves dont l'horodatage est à refaire : ${d.preuvesHorodatageARefaire}.`,
    });
  }

  return problemes;
}

// ── Aide à l'affichage ──────────────────────────────────────────────────────

/**
 * Résume la liste des problèmes pour l'interface :
 * - sépare bloquants / avertissements ;
 * - `peutExporter` = vrai s'il n'y a aucun bloquant ;
 * - `toutEstBon` = vrai s'il n'y a aucun problème du tout.
 */
export function resumeControle(problemes: Probleme[]) {
  const bloquants = problemes.filter((p) => p.niveau === "bloquant");
  const avertissements = problemes.filter((p) => p.niveau === "avertissement");
  return {
    bloquants,
    avertissements,
    peutExporter: bloquants.length === 0,
    toutEstBon: problemes.length === 0,
  };
}