// lib/calendrier/vacancesScolaires.ts
//
// Récupération des vacances scolaires via l'API publique data.education.gouv.fr
// (Opendatasoft v2.1, dataset fr-en-calendrier-scolaire).
// Conçue pour tourner CÔTÉ SERVEUR (route handler) avec cache `revalidate`.
//
// Robustesse imposée : aucune donnée personnelle envoyée (seulement zone + dates),
// parsing défensif, dédoublonnage, et fallback `[]` sur toute erreur.

import type { PeriodeVacances } from "@/lib/calendrier/types";

const ZONES_VACANCES = new Set(["A", "B", "C"]);

export function zoneVacancesValide(zone: string | null | undefined): string {
  const z = (zone ?? "").toUpperCase();
  return ZONES_VACANCES.has(z) ? z : "A";
}

const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function fetchVacances(
  zone: string,
  du: string,
  au: string,
): Promise<PeriodeVacances[]> {
  const z = zoneVacancesValide(zone);
  if (!RE_DATE.test(du) || !RE_DATE.test(au)) return [];

  try {
    // ODSQL : période qui chevauche [du, au] pour la zone demandée.
    const where = `zones="Zone ${z}" and start_date<="${au}" and end_date>="${du}"`;
    const url =
      "https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/" +
      "fr-en-calendrier-scolaire/records" +
      `?where=${encodeURIComponent(where)}&limit=100&order_by=start_date`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];

    const json: unknown = await res.json();
    const obj = (json ?? {}) as { results?: unknown };
    const results = Array.isArray(obj.results) ? obj.results : [];

    const vues = new Set<string>();
    const vacances: PeriodeVacances[] = [];
    for (const item of results) {
      const r = (item ?? {}) as Record<string, unknown>;
      const nom =
        typeof r.description === "string" ? r.description : "Vacances scolaires";
      const debut =
        typeof r.start_date === "string" ? r.start_date.slice(0, 10) : "";
      const fin = typeof r.end_date === "string" ? r.end_date.slice(0, 10) : "";
      if (!RE_DATE.test(debut) || !RE_DATE.test(fin)) continue;

      const cle = `${nom}|${debut}|${fin}`;
      if (vues.has(cle)) continue; // dédoublonnage (plusieurs académies par zone)
      vues.add(cle);
      vacances.push({ nom, debut, fin, zone: z });
    }
    return vacances;
  } catch {
    return []; // API indisponible : on n'affiche simplement pas les vacances.
  }
}
