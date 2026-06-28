import { test } from "node:test";
import assert from "node:assert/strict";

import { construireResumeTimeline } from "@/lib/timeline/resumeTimeline";
import type { TimelineItem } from "@/lib/timeline/types";

const items: TimelineItem[] = [
  {
    id: "fait-1",
    source: "journal",
    date: "2026-06-10",
    heure: "08:30",
    titre: "Remise enfant",
  },
  {
    id: "frais-1",
    source: "frais",
    date: "2026-06-12",
    heure: null,
    titre: "Frais médical",
    montant: 45,
    statut: "Non remboursé",
    pieceLiee: true,
  },
  {
    id: "pension-1",
    source: "pension",
    date: "2026-06-01",
    heure: null,
    titre: "Pension",
    montant: 180,
    statut: "Partiel",
  },
  {
    id: "doc-1",
    source: "document",
    date: null,
    heure: null,
    titre: "Document à dater",
    pieceLiee: true,
  },
];

test("construit les compteurs par source", () => {
  const resume = construireResumeTimeline(items);

  assert.equal(resume.total, 4);
  assert.equal(resume.compteParSource.journal, 1);
  assert.equal(resume.compteParSource.frais, 1);
  assert.equal(resume.compteParSource.pension, 1);
  assert.equal(resume.compteParSource.document, 1);
  assert.equal(resume.compteParSource.preuve, 0);
  assert.equal(resume.compteParSource.garde, 0);
});

test("calcule la période lisible à partir des éléments datés", () => {
  const resume = construireResumeTimeline(items);

  assert.equal(resume.premiereDate, "2026-06-01");
  assert.equal(resume.derniereDate, "2026-06-12");
  assert.equal(resume.periodeLisible, "01/06/2026 → 12/06/2026");
});

test("repère les éléments à dater et les points d'attention", () => {
  const resume = construireResumeTimeline(items);

  assert.equal(resume.totalDates, 3);
  assert.equal(resume.totalSansDate, 1);
  assert.equal(resume.totalPiecesLiees, 2);
  assert.equal(resume.totalPointsAttention, 3);

  assert.ok(
    resume.pointsAttention.some((point) =>
      point.includes("élément") && point.includes("dater"),
    ),
  );

  assert.ok(
    resume.pointsAttention.some((point) => point.includes("pension")),
  );

  assert.ok(
    resume.pointsAttention.some((point) => point.includes("frais")),
  );
});

test("gère une chronologie vide", () => {
  const resume = construireResumeTimeline([]);

  assert.equal(resume.total, 0);
  assert.equal(resume.totalDates, 0);
  assert.equal(resume.totalSansDate, 0);
  assert.equal(resume.totalPiecesLiees, 0);
  assert.equal(resume.totalPointsAttention, 0);
  assert.equal(resume.periodeLisible, "Aucune période à afficher");
  assert.deepEqual(resume.sourcesAlimentees, []);
  assert.ok(resume.pointsAttention[0].includes("Aucun élément"));
});
