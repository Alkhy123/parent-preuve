import { test } from "node:test";
import assert from "node:assert/strict";

import {
  COLONNES_APERCU_EXPORT_CHRONOLOGIE,
  construireApercuExportChronologie,
} from "@/lib/chronologieApercuExport";

const lignes = [
  [
    "2026-06-01",
    "10:00",
    "Fait",
    "Enfant",
    "Remise enfant",
    "Description factuelle",
    "",
    "",
  ],
  [
    "2026-06-02",
    "",
    "Frais",
    "Enfant",
    "Frais médical",
    "Consultation",
    "45,00 €",
    "Non remboursé",
  ],
  [
    "2026-06-03",
    "",
    "Pension",
    "Général",
    "Pension juin",
    "Paiement partiel",
    "180,00 €",
    "Partiel",
  ],
];

test("construit un aperçu limité des lignes exportées", () => {
  const apercu = construireApercuExportChronologie(lignes, 2);

  assert.equal(apercu.totalLignes, 3);
  assert.equal(apercu.lignesApercu.length, 2);
  assert.equal(apercu.lignesMasquees, 1);
  assert.deepEqual(apercu.lignesApercu[0], lignes[0]);
});

test("retourne toutes les colonnes attendues", () => {
  const apercu = construireApercuExportChronologie(lignes);

  assert.deepEqual(
    apercu.colonnes,
    COLONNES_APERCU_EXPORT_CHRONOLOGIE,
  );
});

test("gère une liste vide", () => {
  const apercu = construireApercuExportChronologie([]);

  assert.equal(apercu.totalLignes, 0);
  assert.equal(apercu.lignesApercu.length, 0);
  assert.equal(apercu.lignesMasquees, 0);
});

test("normalise une limite négative", () => {
  const apercu = construireApercuExportChronologie(lignes, -10);

  assert.equal(apercu.totalLignes, 3);
  assert.equal(apercu.lignesApercu.length, 0);
  assert.equal(apercu.lignesMasquees, 3);
});
