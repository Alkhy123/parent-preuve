import { test } from "node:test";
import assert from "node:assert/strict";

import { normaliserBrouillonsCollecteRapide } from "@/lib/brouillonsCollecteRapide";

test("normalise une liste de brouillons valides", () => {
  const resultat = normaliserBrouillonsCollecteRapide([
    {
      id: "brouillon-1",
      type: "Fait ou événement",
      href: "/journal",
      date: "2026-06-28",
      titre: "Retard à la remise",
      enfant: "Enfant",
      contenu: "Description factuelle",
      creeLe: "2026-06-28T10:00:00.000Z",
    },
  ]);

  assert.equal(resultat.length, 1);
  assert.equal(resultat[0].id, "brouillon-1");
  assert.equal(resultat[0].href, "/journal");
});

test("ignore une valeur qui n'est pas une liste", () => {
  assert.deepEqual(normaliserBrouillonsCollecteRapide(null), []);
  assert.deepEqual(normaliserBrouillonsCollecteRapide({}), []);
  assert.deepEqual(normaliserBrouillonsCollecteRapide("texte"), []);
});

test("ignore les entrées incomplètes", () => {
  const resultat = normaliserBrouillonsCollecteRapide([
    {
      id: "incomplet",
      type: "Fait ou événement",
    },
    {
      id: "valide",
      type: "Frais",
      href: "/frais",
      date: "2026-06-28",
      titre: "Frais médical",
      enfant: "",
      contenu: "Type : Frais",
      creeLe: "2026-06-28T10:00:00.000Z",
    },
  ]);

  assert.equal(resultat.length, 1);
  assert.equal(resultat[0].id, "valide");
});
