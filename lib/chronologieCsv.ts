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
// On le redéfinit ici plutôt que de l'importer, pour que ce fichier reste pur
// (chronologiePdf.ts importe jsPDF, qu'on ne veut pas embarquer ici).
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
  du?: string;                 // "AAAA-MM-JJ" ou vide
  au?: string;                 // "AAAA-MM-JJ" ou vide
  etiquetteProcedure?: string; // libellé libre de la procédure active
};

// Échappe une cellule : on l'entoure toujours de guillemets et on double les
// guillemets internes. Cela neutralise les ; ,
