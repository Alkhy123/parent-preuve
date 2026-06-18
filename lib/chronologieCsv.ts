// lib/chronologieCsv.ts
//
// Logique PURE de génération d'un export CSV de la chronologie unifiée.
// Ne touche NI à Supabase, NI à React, NI au navigateur (pas de Blob, pas de
// document) : elle reçoit des lignes DÉJÀ filtrées et mises en forme par
// chronologieExport.filtrerEtFormaterPourPdf(), et renvoie une simple chaîne CSV.
// Cette séparation rend le fichier réutilisable tel quel en mobile (React Native).
//
// Le téléchargement (propre au web) est fait côté page, pas ici.

// En-tête des colonnes : identique à celui du PDF (lib/chronologiePdf.ts).
const EN_TETE = [
  "Date",
  "Heure",
  "Type",
  "Enfant",
  "Titre",
  "Détails",
  "Montant",
  "Statut",
];

// Même avertissement que le PDF, ajouté en pied du fichier CSV.
const AVERTISSEMENT =
  "Document généré à partir des données saisies par l'utilisateur. Il ne " +
  "constitue ni un constat de commissaire de justice ni un conseil juridique. " +
  "L'horodatage des preuves est non qualifié. À vérifier avant toute utilisation.";

// Séparateur de colonnes : point-virgule, défaut d'Excel en français.
const SEPARATEUR = ";";

// Fin de ligne CSV standard (CRLF), bien gérée par Excel.
const FIN_LIGNE = "\r\n";

export type ContexteCsvChrono = {
  du?: string;
  au?: string;
  etiquetteProcedure?: string;
};

// Échappe une cellule : guillemets autour + guillemets internes doublés.
function echapper(valeur: string): string {
  return `"${valeur.replace(/"/g, '""')}"`;
}

// Transforme un tableau de cellules en une ligne CSV échappée.
function ligneCsv(cellules: string[]): string {
  return cellules.map(echapper).join(SEPARATEUR);
}

export function construireCsvChronologie(
  lignes: string[][],
  contexte: ContexteCsvChrono,
): string {
  const blocs: string[] = [];

  // 1) Tableau de données : en-tête + lignes (toutes à 8 colonnes).
  blocs.push(ligneCsv(EN_TETE));
  for (const l of lignes) {
    blocs.push(ligneCsv(l));
  }

  // 2) Pied de fichier : ligne vide, puis métadonnées et avertissement.
  blocs.push("");
  if (contexte.etiquetteProcedure) {
    blocs.push(ligneCsv([`Procédure : ${contexte.etiquetteProcedure}`]));
  }
  const periode =
    contexte.du || contexte.au
      ? `Période : ${contexte.du || "début"} au ${contexte.au || "aujourd'hui"}`
      : "Période : toutes les données";
  blocs.push(ligneCsv([periode]));
  blocs.push(ligneCsv([AVERTISSEMENT]));

  // BOM UTF-8 + assemblage final.
  return "\uFEFF" + blocs.join(FIN_LIGNE) + FIN_LIGNE;
}
