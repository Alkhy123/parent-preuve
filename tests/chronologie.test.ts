import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fusionnerChronologie,
  type SourcesChronologie,
} from "@/lib/chronologie";

// Procédure active P1 avec un enfant E1. Données croisées avec P2/E2.
const sources: SourcesChronologie = {
  faits: [
    {
      id: "f-e1",
      titre: "Fait E1",
      categorie: "École",
      date_evenement: "2026-06-10",
      heure_evenement: "08:00:00",
      description_factuelle: null,
      child_id: "E1",
    },
    {
      id: "f-general",
      titre: "Fait sans enfant",
      categorie: null,
      date_evenement: "2026-06-12",
      heure_evenement: null,
      description_factuelle: null,
      child_id: null,
    },
    {
      id: "f-e2",
      titre: "Fait E2 (autre procédure)",
      categorie: null,
      date_evenement: "2026-06-11",
      heure_evenement: null,
      description_factuelle: null,
      child_id: "E2",
    },
  ],
  frais: [],
  pensions: [
    {
      id: "p-p1",
      mois_du: "2026-06-01",
      montant_du: 100,
      montant_paye: 100,
      date_paiement: null,
      notes: null,
      procedure_id: "P1",
    },
    {
      id: "p-p2",
      mois_du: "2026-06-01",
      montant_du: 100,
      montant_paye: 0,
      date_paiement: null,
      notes: null,
      procedure_id: "P2",
    },
  ],
  preuves: [],
};

test("la pension est cloisonnée par procedure_id", () => {
  const r = fusionnerChronologie(sources, { procedureId: "P1", enfantIds: ["E1"] });
  const pensions = r.filter((e) => e.type === "pension");
  assert.equal(pensions.length, 1);
  assert.equal(pensions[0].id, "p-p1");
});

test("filtre enfant secondaire : E2 exclu, E1 et sans-enfant inclus", () => {
  const r = fusionnerChronologie(sources, { procedureId: "P1", enfantIds: ["E1"] });
  const ids = r.filter((e) => e.type === "fait").map((e) => e.id);
  assert.ok(ids.includes("f-e1"));
  assert.ok(ids.includes("f-general"));
  assert.ok(!ids.includes("f-e2"));
});

test("tri du plus récent au plus ancien", () => {
  const r = fusionnerChronologie(sources, { procedureId: "P1", enfantIds: ["E1"] });
  const dates = r.map((e) => e.date);
  const triees = [...dates].sort((a, b) => b.localeCompare(a));
  assert.deepEqual(dates, triees);
});
