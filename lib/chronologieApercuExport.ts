export const COLONNES_APERCU_EXPORT_CHRONOLOGIE = [
  "Date",
  "Heure",
  "Type",
  "Enfant",
  "Titre",
  "Détails",
  "Montant",
  "Statut",
] as const;

export type ApercuExportChronologie = {
  totalLignes: number;
  lignesApercu: string[][];
  lignesMasquees: number;
  colonnes: readonly string[];
};

export function construireApercuExportChronologie(
  lignes: string[][],
  limite = 5,
): ApercuExportChronologie {
  const limiteNormalisee = Math.max(0, Math.floor(limite));
  const lignesApercu = lignes.slice(0, limiteNormalisee);

  return {
    totalLignes: lignes.length,
    lignesApercu,
    lignesMasquees: Math.max(0, lignes.length - lignesApercu.length),
    colonnes: COLONNES_APERCU_EXPORT_CHRONOLOGIE,
  };
}
