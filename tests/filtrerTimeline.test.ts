import { test } from "node:test";
import assert from "node:assert/strict";

import {
  elementTimelineAControler,
  filtrerTimelineParMode,
} from "@/lib/timeline/filtrerTimeline";
import type { TimelineItem } from "@/lib/timeline/types";

const items: TimelineItem[] = [
  {
    id: "fait-date",
    source: "journal",
    date: "2026-06-10",
    heure: "10:00",
    titre: "Fait daté",
  },
  {
    id: "document-sans-date",
    source: "document",
    date: null,
    heure: null,
    titre: "Document sans date",
  },
  {
    id: "pension-partielle",
    source: "pension",
    date: "2026-06-01",
    heure: null,
    titre: "Pension partielle",
    statut: "Partiel",
  },
  {
    id: "frais-rembourse",
    source: "frais",
    date: "2026-06-12",
    heure: null,
    titre: "Frais remboursé",
    statut: "Remboursé",
  },
];

test("filtre les éléments datés", () => {
  const resultat = filtrerTimelineParMode(items, "dates");

  assert.deepEqual(
    resultat.map((item) => item.id),
    ["fait-date", "pension-partielle", "frais-rembourse"],
  );
});

test("filtre les éléments sans date", () => {
  const resultat = filtrerTimelineParMode(items, "sans_date");

  assert.deepEqual(
    resultat.map((item) => item.id),
    ["document-sans-date"],
  );
});

test("filtre les points d'attention", () => {
  const resultat = filtrerTimelineParMode(items, "attention");

  assert.deepEqual(
    resultat.map((item) => item.id),
    ["document-sans-date", "pension-partielle"],
  );
});

test("conserve tous les éléments en mode tout", () => {
  const resultat = filtrerTimelineParMode(items, "tout");

  assert.equal(resultat.length, items.length);
});

test("repère un élément à contrôler", () => {
  assert.equal(elementTimelineAControler(items[0]), false);
  assert.equal(elementTimelineAControler(items[1]), true);
  assert.equal(elementTimelineAControler(items[2]), true);
  assert.equal(elementTimelineAControler(items[3]), false);
});
