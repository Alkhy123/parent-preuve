import { test } from "node:test";
import assert from "node:assert/strict";
import { filtrerEtFormaterPourPdf } from "@/lib/chronologieExport";
import type { EntreeChronologie } from "@/lib/chronologie";

const base: EntreeChronologie[] = [
  {
    id: "a",
    type: "fait",
    date: "2026-06-05",
    heure: "09:30",
    titre: "Rendez-vous",
    details: "École",
    montant: null,
    enfantId: "E1",
    statut: null,
  },
  {
    id: "b",
    type: "preuve",
    date: "2026-06-20",
    heure: null,
    titre: "Photo",
    details: "Salon",
    montant: null,
    enfantId: null,
    statut: null,
  },
  {
    id: "c",
    type: "frais",
    date: "2026-07-01",
    heure: null,
    titre: "Cantine",
    details: null,
    montant: 30,
    enfantId: "E1",
    statut: "Non remboursé",
  },
];

const nomEnfant = (id: string) => (id === "E1" ? "Léa" : "?");

test("filtre de période (du/au) inclusif", () => {
  const lignes = filtrerEtFormaterPourPdf(
    base,
    { du: "2026-06-01", au: "2026-06-30" },
    nomEnfant,
  );
  // Seules les entrées de juin passent (a et b), pas la frais de juillet.
  assert.equal(lignes.length, 2);
});

test("filtre par types", () => {
  const lignes = filtrerEtFormaterPourPdf(base, { types: ["frais"] }, nomEnfant);
  assert.equal(lignes.length, 1);
  assert.equal(lignes[0][2], "Frais"); // colonne Type
});

test("rappel non qualifié ajouté sur chaque ligne preuve", () => {
  const lignes = filtrerEtFormaterPourPdf(base, { types: ["preuve"] }, nomEnfant);
  assert.equal(lignes.length, 1);
  const details = lignes[0][5];
  assert.match(details, /constat de commissaire de justice/i);
});

test("enfant null → « Général », sinon nom résolu", () => {
  const lignes = filtrerEtFormaterPourPdf(base, {}, nomEnfant);
  const parId = new Map(base.map((e, i) => [e.id, i]));
  // Ligne preuve (enfant null) -> "Général".
  const lignePreuve = lignes[parId.get("b")!];
  assert.equal(lignePreuve[3], "Général");
  // Ligne fait (E1) -> "Léa".
  const ligneFait = lignes[parId.get("a")!];
  assert.equal(ligneFait[3], "Léa");
});
