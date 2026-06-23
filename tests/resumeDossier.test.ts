import { test } from "node:test";
import assert from "node:assert/strict";
import { formaterResumeTexte, type ResumeDossier } from "@/lib/resumeDossier";

const baseResume: ResumeDossier = {
  socleComplet: true,
  nombreEnfants: 2,
  pensionSolde: 0,
  fraisResteDu: 0,
  fraisSansJustificatif: 0,
  evenementsEnBrouillon: 0,
  preuvesHorodatageARefaire: 0,
  nombreBloquants: 0,
  nombreAvertissements: 0,
};

test("pension à jour / impayée / trop-perçu", () => {
  assert.match(formaterResumeTexte({ ...baseResume, pensionSolde: 0 }), /Pension : a jour/);
  assert.match(
    formaterResumeTexte({ ...baseResume, pensionSolde: 120 }),
    /Pension : reste du/,
  );
  assert.match(
    formaterResumeTexte({ ...baseResume, pensionSolde: -50 }),
    /Pension : trop-percu/,
  );
});

test("frais à jour vs reste dû", () => {
  assert.match(formaterResumeTexte(baseResume), /Frais : a jour/);
  assert.match(
    formaterResumeTexte({ ...baseResume, fraisResteDu: 40 }),
    /Frais : reste du/,
  );
});

test("la ligne de contrôle export est toujours présente", () => {
  const txt = formaterResumeTexte({
    ...baseResume,
    nombreBloquants: 1,
    nombreAvertissements: 2,
  });
  assert.match(txt, /Controle export : 1 point\(s\) bloquant\(s\), 2 avertissement\(s\)/);
});

test("socle à compléter signalé", () => {
  assert.match(
    formaterResumeTexte({ ...baseResume, socleComplet: false }),
    /Socle du dossier : a completer/,
  );
});
