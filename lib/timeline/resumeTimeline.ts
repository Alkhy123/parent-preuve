import { elementTimelineAControler } from "@/lib/timeline/filtrerTimeline";
import type { TimelineItem, TimelineSource } from "@/lib/timeline/types";

export const ORDRE_SOURCES_TIMELINE: TimelineSource[] = [
  "journal",
  "frais",
  "pension",
  "document",
  "preuve",
  "garde",
];

export type ResumeTimeline = {
  total: number;
  totalDates: number;
  totalSansDate: number;
  totalPiecesLiees: number;
  totalPointsAttention: number;
  premiereDate: string | null;
  derniereDate: string | null;
  periodeLisible: string;
  compteParSource: Record<TimelineSource, number>;
  sourcesAlimentees: TimelineSource[];
  pointsAttention: string[];
};

function compteursVides(): Record<TimelineSource, number> {
  return {
    journal: 0,
    frais: 0,
    pension: 0,
    document: 0,
    preuve: 0,
    garde: 0,
  };
}

function dateFr(date: string): string {
  const [annee, mois, jour] = date.slice(0, 10).split("-");
  return jour && mois && annee ? `${jour}/${mois}/${annee}` : date;
}

function cleUnique(item: TimelineItem): string {
  return `${item.source}:${item.id}`;
}

export function construireResumeTimeline(items: TimelineItem[]): ResumeTimeline {
  const compteParSource = compteursVides();
  const dates: string[] = [];
  const elementsAControler = new Set<string>();

  let totalPiecesLiees = 0;

  for (const item of items) {
    compteParSource[item.source]++;

    if (item.date) {
      dates.push(item.date.slice(0, 10));
    }

    if (item.pieceLiee) {
      totalPiecesLiees++;
    }

    if (elementTimelineAControler(item)) {
      elementsAControler.add(cleUnique(item));
    }
  }

  dates.sort((a, b) => a.localeCompare(b));

  const premiereDate = dates[0] ?? null;
  const derniereDate = dates.at(-1) ?? null;

  let periodeLisible = "Aucune période à afficher";
  if (premiereDate && derniereDate && premiereDate === derniereDate) {
    periodeLisible = dateFr(premiereDate);
  } else if (premiereDate && derniereDate) {
    periodeLisible = `${dateFr(premiereDate)} → ${dateFr(derniereDate)}`;
  }

  const sourcesAlimentees = ORDRE_SOURCES_TIMELINE.filter(
    (source) => compteParSource[source] > 0,
  );

  const totalSansDate = items.filter((item) => item.date === null).length;

  const pointsAttention: string[] = [];

  if (items.length === 0) {
    pointsAttention.push("Aucun élément n’est encore visible dans la chronologie.");
  }

  if (totalSansDate > 0) {
    pointsAttention.push(
      `${totalSansDate} élément${totalSansDate > 1 ? "s" : ""} à dater ou à vérifier.`,
    );
  }

  const pensionsAControler = items.filter(
    (item) =>
      item.source === "pension" &&
      (item.statut === "Impayé" || item.statut === "Partiel"),
  ).length;

  if (pensionsAControler > 0) {
    pointsAttention.push(
      `${pensionsAControler} ligne${pensionsAControler > 1 ? "s" : ""} de pension à contrôler.`,
    );
  }

  const fraisAControler = items.filter(
    (item) => item.source === "frais" && item.statut === "Non remboursé",
  ).length;

  if (fraisAControler > 0) {
    pointsAttention.push(
      `${fraisAControler} frais non remboursé${fraisAControler > 1 ? "s" : ""} à suivre.`,
    );
  }

  const preuvesAControler = items.filter(
    (item) => item.source === "preuve" && item.statut === "Horodatage à refaire",
  ).length;

  if (preuvesAControler > 0) {
    pointsAttention.push(
      `${preuvesAControler} preuve${preuvesAControler > 1 ? "s" : ""} avec horodatage à vérifier.`,
    );
  }

  if (pointsAttention.length === 0) {
    pointsAttention.push("Aucun point d’attention automatique détecté.");
  }

  return {
    total: items.length,
    totalDates: dates.length,
    totalSansDate,
    totalPiecesLiees,
    totalPointsAttention: elementsAControler.size,
    premiereDate,
    derniereDate,
    periodeLisible,
    compteParSource,
    sourcesAlimentees,
    pointsAttention,
  };
}
