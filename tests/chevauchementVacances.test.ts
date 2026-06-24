import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isoJourLocal,
  vacancesQuiChevauchent,
  jourEnVacances,
} from "@/lib/calendrier/chevauchementVacances";
import type { PeriodeVacances } from "@/lib/calendrier/types";

const ete: PeriodeVacances = {
  nom: "Vacances d'été",
  debut: "2026-07-04",
  fin: "2026-08-31",
  zone: "A",
};

test("isoJourLocal formate en YYYY-MM-DD local", () => {
  assert.equal(isoJourLocal(new Date(2026, 6, 9)), "2026-07-09");
});

test("week-end pendant les vacances : chevauchement détecté", () => {
  const debut = new Date(2026, 6, 10); // 10 juillet
  const fin = new Date(2026, 6, 12); // 12 juillet
  assert.equal(vacancesQuiChevauchent(debut, fin, [ete])?.nom, "Vacances d'été");
});

test("week-end hors vacances : aucun chevauchement", () => {
  const debut = new Date(2026, 5, 5); // 5 juin
  const fin = new Date(2026, 5, 7); // 7 juin
  assert.equal(vacancesQuiChevauchent(debut, fin, [ete]), null);
});

test("jourEnVacances : bornes incluses", () => {
  assert.equal(jourEnVacances(new Date(2026, 6, 4), [ete])?.nom, "Vacances d'été");
  assert.equal(jourEnVacances(new Date(2026, 7, 31), [ete])?.nom, "Vacances d'été");
  assert.equal(jourEnVacances(new Date(2026, 8, 1), [ete]), null);
});
