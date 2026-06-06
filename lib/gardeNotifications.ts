import { periodesGarde, type RegleGarde, type PeriodeGarde } from "./gardeCalendrier";

export type Echeance = PeriodeGarde & {
  enfantId: string;
  enfantNom: string;
  joursRestants: number;
};

export function echeancesAVenir(
  regles: { regle: RegleGarde; enfantId: string; enfantNom: string }[],
  dansNJours = 30
): Echeance[] {
  const now = new Date();
  const fin = new Date();
  fin.setDate(fin.getDate() + dansNJours);

  const liste: Echeance[] = [];
  for (const { regle, enfantId, enfantNom } of regles) {
    for (const p of periodesGarde(regle, now, fin)) {
      if (p.debut < now) continue; // garde déjà commencée : on ne l'annonce pas
      const jours = Math.ceil((p.debut.getTime() - now.getTime()) / 86400000);
      liste.push({ ...p, enfantId, enfantNom, joursRestants: jours });
    }
  }
  return liste.sort((a, b) => a.debut.getTime() - b.debut.getTime());
}