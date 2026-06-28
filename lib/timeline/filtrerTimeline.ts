import type { TimelineItem } from "@/lib/timeline/types";

export type ModeLectureTimeline = "tout" | "dates" | "sans_date" | "attention";

const STATUTS_A_CONTROLER = new Set([
  "Impayé",
  "Partiel",
  "Non remboursé",
  "Horodatage à refaire",
]);

export function elementTimelineAControler(item: TimelineItem): boolean {
  return item.date === null || STATUTS_A_CONTROLER.has(item.statut ?? "");
}

export function filtrerTimelineParMode(
  items: TimelineItem[],
  mode: ModeLectureTimeline,
): TimelineItem[] {
  if (mode === "dates") {
    return items.filter((item) => item.date !== null);
  }

  if (mode === "sans_date") {
    return items.filter((item) => item.date === null);
  }

  if (mode === "attention") {
    return items.filter(elementTimelineAControler);
  }

  return items;
}
