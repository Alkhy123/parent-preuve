// lib/csvExport.ts
//
// Générateur CSV générique et PUR (aucun accès Supabase / React / navigateur).
// Reçoit un en-tête + des lignes déjà mises en forme (chaînes), renvoie une
// chaîne CSV prête à télécharger. Mêmes conventions que lib/chronologieCsv.ts :
// séparateur ';' (Excel FR), BOM UTF-8, fin de ligne CRLF, échappement guillemets.
// Le téléchargement (Blob, propre au web) est fait à part dans lib/telechargerCsv.ts.

const SEPARATEUR = ";";
const FIN_LIGNE = "\r\n";

// Avertissement non-qualifié, identique au reste de l'application.
const AVERTISSEMENT =
  "Document généré à partir des données saisies par l'utilisateur. Il ne " +
  "constitue ni un constat de commissaire de justice ni un conseil juridique. " +
  "L'horodatage des preuves est non qualifié. À vérifier avant toute utilisation.";

export type ContexteCsv = {
  titre?: string; // ex. "Frais" — identifie l'export dans le pied de fichier
  du?: string; // période début (AAAA-MM-JJ)
  au?: string; // période fin (AAAA-MM-JJ)
  etiquetteProcedure?: string;
};

// Échappe une cellule : guillemets autour + guillemets internes doublés.
function echapper(valeur: string): string {
  return `"${String(valeur ?? "").replace(/"/g, '""')}"`;
}

// Transforme un tableau de cellules en une ligne CSV échappée.
function ligneCsv(cellules: string[]): string {
  return cellules.map(echapper).join(SEPARATEUR);
}

export function construireCsv(params: {
  enTete: string[];
  lignes: string[][];
  contexte?: ContexteCsv;
}): string {
  const { enTete, lignes, contexte = {} } = params;
  const blocs: string[] = [];

  // 1) Tableau de données : en-tête + lignes.
  blocs.push(ligneCsv(enTete));
  for (const l of lignes) {
    blocs.push(ligneCsv(l));
  }

  // 2) Pied de fichier : ligne vide, puis métadonnées et avertissement.
  blocs.push("");
  if (contexte.titre) {
    blocs.push(ligneCsv([`Export : ${contexte.titre}`]));
  }
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
