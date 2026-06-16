// lib/chronologieExport.ts
//
// Logique PURE de préparation des lignes pour l'export PDF de la chronologie.
// Ne touche NI à Supabase, NI à React, NI à jsPDF.
// Entrée : les entrées DÉJÀ fusionnées/triées par fusionnerChronologie().
// Sortie : un tableau de lignes (string[][]) prêt pour jspdf-autotable.

import { euros } from "@/lib/dossierCalculs";
import type { EntreeChronologie, TypeEntree } from "@/lib/chronologie";

// Filtres facultatifs appliqués à l'export.
export type FiltresExportChrono = {
  du?: string;            // "AAAA-MM-JJ" inclus, ou vide
  au?: string;            // "AAAA-MM-JJ" inclus, ou vide
  types?: TypeEntree[];   // vide ou absent = tous les types
};

// Libellés lisibles pour la colonne "Type".
const LIBELLE_TYPE: Record<TypeEntree, string> = {
  fait: "Fait",
  frais: "Frais",
  pension: "Pension",
  preuve: "Preuve",
};

// Rappel juridique imposé sur CHAQUE ligne "preuve".
const RAPPEL_PREUVE =
  "Horodatage non qualifié, pas un constat de commissaire de justice.";

// Vrai si l'entrée passe le filtre de période (bornes incluses).
// Les dates "AAAA-MM-JJ" se comparent correctement en tant que chaînes.
function dansPeriode(date: string, du?: string, au?: string): boolean {
  if (du && date < du) return false;
  if (au && date > au) return false;
  return true;
}

// Construit la colonne "Détails" selon le type.
function colonneDetails(e: EntreeChronologie): string {
  const base = e.details?.trim() ?? "";
  if (e.type !== "preuve") return base;
  // Sur une preuve, on ajoute toujours le rappel non qualifié.
  return base ? `${base} — ${RAPPEL_PREUVE}` : RAPPEL_PREUVE;
}

/**
 * Filtre les entrées (période + types) puis les met en forme en lignes de tableau.
 * Le tri est déjà fait par fusionnerChronologie (récent → ancien), on n'y touche pas.
 *
 * @param entrees   Entrées déjà fusionnées/cloisonnées par procédure active.
 * @param filtres   Période (du/au) et types facultatifs.
 * @param nomEnfant Résolveur id d'enfant → nom (jamais appelé avec null).
 * @returns Lignes prêtes pour autoTable :
 *          [Date, Heure, Type, Enfant, Titre, Détails, Montant, Statut]
 */
export function filtrerEtFormaterPourPdf(
  entrees: EntreeChronologie[],
  filtres: FiltresExportChrono,
  nomEnfant: (enfantId: string) => string,
): string[][] {
  const { du, au, types } = filtres;
  const typesActifs = types && types.length > 0 ? new Set(types) : null;

  return entrees
    .filter((e) => dansPeriode(e.date, du, au))
    .filter((e) => (typesActifs ? typesActifs.has(e.type) : true))
    .map((e) => [
      e.date,
      e.heure ?? "",
      LIBELLE_TYPE[e.type],
      e.enfantId === null ? "Général" : nomEnfant(e.enfantId),
      e.titre,
      colonneDetails(e),
      e.montant != null ? euros(e.montant) : "",
      e.statut ?? "",
    ]);
}