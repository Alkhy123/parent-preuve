import { test } from "node:test";
import assert from "node:assert/strict";

import { construireEtatExportChronologie } from "@/lib/chronologieEtatExport";

test("bloque l'export quand aucune ligne n'est disponible", () => {
  const etat = construireEtatExportChronologie([]);

  assert.equal(etat.peutExporter, false);
  assert.equal(etat.totalLignes, 0);
  assert.equal(etat.niveau, "attention");
  assert.ok(etat.titre.includes("Aucune ligne"));
});

test("autorise l'export quand des lignes existent", () => {
  const etat = construireEtatExportChronologie([
    ["2026-06-01", "10:00", "Fait", "Enfant", "Titre", "Détails", "", ""],
  ]);

  assert.equal(etat.peutExporter, true);
  assert.equal(etat.totalLignes, 1);
  assert.equal(etat.niveau, "ok");
  assert.ok(etat.titre.includes("1 ligne"));
});

test("accorde le pluriel quand plusieurs lignes existent", () => {
  const etat = construireEtatExportChronologie([
    ["2026-06-01", "", "Fait", "Enfant", "Titre 1", "", "", ""],
    ["2026-06-02", "", "Frais", "Enfant", "Titre 2", "", "45,00 €", ""],
  ]);

  assert.equal(etat.peutExporter, true);
  assert.equal(etat.totalLignes, 2);
  assert.ok(etat.titre.includes("2 lignes"));
});
