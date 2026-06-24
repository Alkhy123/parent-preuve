// lib/calendrier/chevauchementVacances.ts
//
// Helpers PURS (aucun I/O) pour reperer les chevauchements entre une periode de
// garde et les vacances scolaires. Sert a ANNOTER le calendrier : on signale
// qu'un week-end tombe en vacances, sans jamais reattribuer la garde (la
// repartition des vacances est fixee par le jugement, pas par l'application).

import type { PeriodeVacances } from "@/lib/calendrier/types";

// Date locale -> "YYYY-MM-DD" (comparaison lexicale fiable pour ce format).
export function isoJourLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// La periode [debut, fin] (Dates) chevauche-t-elle une periode de vacances ?
// Renvoie la premiere periode de vacances chevauchee, ou null.
export function vacancesQuiChevauchent(
  debut: Date,
  fin: Date,
  vacances: PeriodeVacances[]
): PeriodeVacances | null {
  const d = isoJourLocal(debut);
  const f = isoJourLocal(fin);
  return vacances.find((v) => d <= v.fin && f >= v.debut) ?? null;
}

// Le jour donne (Date) tombe-t-il dans une periode de vacances ?
export function jourEnVacances(
  jour: Date,
  vacances: PeriodeVacances[]
): PeriodeVacances | null {
  const j = isoJourLocal(jour);
  return vacances.find((v) => j >= v.debut && j <= v.fin) ?? null;
}
