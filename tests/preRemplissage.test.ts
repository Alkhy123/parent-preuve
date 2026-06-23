import { test } from "node:test";
import assert from "node:assert/strict";
import { nettoyerProposition } from "@/lib/preRemplissage";

test("frais : montant en chaîne « 45,50 » accepté, date invalide → null", () => {
  const p = nettoyerProposition({
    type: "frais",
    champs: {
      libelle: "  Orthodontie  ",
      categorie: "Santé",
      montant: "45,50",
      date: "2026-02-31", // date calendaire impossible
      enfant: "Léa",
    },
  });
  assert.equal(p.type, "frais");
  if (p.type !== "frais") return;
  assert.equal(p.champs.libelle, "Orthodontie");
  assert.equal(p.champs.categorie, "Santé");
  assert.equal(p.champs.montant, 45.5);
  assert.equal(p.champs.date, null);
  assert.equal(p.champs.enfant, "Léa");
});

test("frais : catégorie hors liste → « Autre », montant négatif/énorme → null", () => {
  const p = nettoyerProposition({
    type: "frais",
    champs: { categorie: "Inventée", montant: -5 },
  });
  if (p.type !== "frais") return assert.fail("type frais attendu");
  assert.equal(p.champs.categorie, "Autre");
  assert.equal(p.champs.montant, null);

  const p2 = nettoyerProposition({
    type: "frais",
    champs: { montant: 9_999_999 },
  });
  if (p2.type !== "frais") return assert.fail("type frais attendu");
  assert.equal(p2.champs.montant, null);
});

test("pension : mois AAAA-MM valide, date complète tronquée au mois", () => {
  const p = nettoyerProposition({
    type: "pension",
    champs: { mois: "2026-06-15", montant_du: 300, montant_paye: "300" },
  });
  if (p.type !== "pension") return assert.fail("type pension attendu");
  assert.equal(p.champs.mois, "2026-06");
  assert.equal(p.champs.montant_du, 300);
  assert.equal(p.champs.montant_paye, 300);
});

test("type inconnu → proposition « aucun » vide et sûre", () => {
  const p = nettoyerProposition({ type: "n_importe_quoi", champs: { x: 1 } });
  assert.equal(p.type, "aucun");
  assert.equal(p.champs, null);
});

test("entrée non-objet ne plante pas", () => {
  assert.equal(nettoyerProposition(null).type, "aucun");
  assert.equal(nettoyerProposition("texte").type, "aucun");
});

test("avertissements bornés à 5 et tronqués à 200 caractères", () => {
  const p = nettoyerProposition({
    type: "journal",
    champs: {},
    avertissements: ["a", "b", "c", "d", "e", "f", "g", "x".repeat(300)],
  });
  assert.equal(p.avertissements.length, 5);
  for (const a of p.avertissements) assert.ok(a.length <= 200);
});
