export type EtatExportChronologie = {
  peutExporter: boolean;
  totalLignes: number;
  titre: string;
  message: string;
  niveau: "ok" | "attention";
};

export function construireEtatExportChronologie(
  lignes: string[][],
): EtatExportChronologie {
  if (lignes.length === 0) {
    return {
      peutExporter: false,
      totalLignes: 0,
      titre: "Aucune ligne à exporter",
      message:
        "Aucun élément ne correspond aux filtres actuels. Modifiez la période ou les types sélectionnés avant de générer un PDF ou un CSV.",
      niveau: "attention",
    };
  }

  return {
    peutExporter: true,
    totalLignes: lignes.length,
    titre: `${lignes.length} ligne${lignes.length > 1 ? "s" : ""} prête${
      lignes.length > 1 ? "s" : ""
    } pour l’export`,
    message:
      "Les boutons PDF et CSV utilisent les lignes visibles dans l’aperçu ci-dessus. Relisez l’export généré avant toute transmission.",
    niveau: "ok",
  };
}
