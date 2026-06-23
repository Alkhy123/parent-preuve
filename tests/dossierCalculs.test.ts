import { test } from "node:test";
import assert from "node:assert/strict";
import {
  totauxFrais,
  totauxPension,
  resteDuGlobal,
} from "@/lib/dossierCalculs";

test("totauxFrais somme les parts et le reste dû", () => {
  const t = totauxFrais([
    { part_autre: 40, rembourse: false },
    { part_autre: "60", rembourse: true }, // chaîne acceptée
    { part_autre: 10, rembourse: false },
  ]);
  assert.equal(t.totalDemande, 110);
  assert.equal(t.totalRembourse, 60);
  assert.equal(t.resteDu, 50);
});

test("totauxFrais : valeurs non numériques comptées comme 0", () => {
  const t = totauxFrais([{ part_autre: "abc", rembourse: false }]);
  assert.equal(t.totalDemande, 0);
  assert.equal(t.resteDu, 0);
});

test("totauxPension calcule le solde dû − payé", () => {
  const t = totauxPension([
    { montant_du: 200, montant_paye: 150 },
    { montant_du: "100", montant_paye: "100" },
  ]);
  assert.equal(t.totalDu, 300);
  assert.equal(t.totalPaye, 250);
  assert.equal(t.solde, 50);
});

test("resteDuGlobal : trop-perçu de pension non soustrait des frais", () => {
  // Pension trop-perçue (solde -30) + 50 de frais non remboursés.
  const r = resteDuGlobal(-30, 50);
  assert.equal(r.pensionResteDu, 0);
  assert.equal(r.pensionTropPercu, 30);
  assert.equal(r.fraisResteDu, 50);
  assert.equal(r.total, 50); // le trop-perçu ne masque pas les frais
});

test("resteDuGlobal : pension impayée + frais s'additionnent", () => {
  const r = resteDuGlobal(80, 20);
  assert.equal(r.pensionResteDu, 80);
  assert.equal(r.pensionTropPercu, 0);
  assert.equal(r.total, 100);
});
