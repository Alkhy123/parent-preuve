// lib/calendrier/joursFeries.ts
//
// Récupération des jours fériés via l'API publique etalab (calendrier.api.gouv.fr).
// Conçue pour tourner CÔTÉ SERVEUR (route handler) avec cache `revalidate`.
//
// Robustesse imposée : aucune donnée personnelle envoyée (seulement année + zone),
// parsing défensif, et fallback `[]` sur toute erreur — l'aperçu ne doit jamais
// être bloqué par cette API.

import type { JourFerie } from "@/lib/calendrier/types";

// Zones gérées par l'API etalab. Défaut : métropole.
const ZONES_FERIES = new Set([
  "metropole",
  "alsace-moselle",
  "guadeloupe",
  "guyane",
  "martinique",
  "mayotte",
  "nouvelle-caledonie",
  "la-reunion",
  "polynesie",
  "saint-barthelemy",
  "saint-martin",
  "wallis-et-futuna",
  "saint-pierre-et-miquelon",
]);

export function zoneFerieValide(zone: string | null | undefined): string {
  return zone && ZONES_FERIES.has(zone) ? zone : "metropole";
}

const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function fetchJoursFeries(
  annee: number,
  zone = "metropole",
): Promise<JourFerie[]> {
  const z = zoneFerieValide(zone);
  const an = Number.isInteger(annee) ? annee : new Date().getFullYear();

  try {
    const res = await fetch(
      `https://calendrier.api.gouv.fr/jours-feries/${z}/${an}.json`,
      { next: { revalidate: 86400 } }, // cache 24 h côté serveur
    );
    if (!res.ok) return [];

    const json: unknown = await res.json();
    if (!json || typeof json !== "object") return [];

    const feries: JourFerie[] = [];
    for (const [date, nom] of Object.entries(json as Record<string, unknown>)) {
      if (RE_DATE.test(date)) {
        feries.push({ date, nom: typeof nom === "string" ? nom : "Jour férié" });
      }
    }
    return feries;
  } catch {
    return []; // API indisponible : on n'affiche simplement pas les fériés.
  }
}
