// tests-e2e/helpers.ts
//
// Helpers de remplissage via l'UI déployée. Sélecteurs alignés sur le code réel
// des pages (placeholders / libellés / boutons). Aucun appel direct à la base :
// tout passe par l'interface, comme un utilisateur.

import { type Page, expect } from "@playwright/test";

// Date du jour au format "YYYY-MM-DD" (valeur des <input type="date">).
export function aujourdhuiIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// Crée une NOUVELLE procédure (autre parent différent) + un premier enfant,
// depuis la page /enfants. `etiquette` = nom de la procédure (l'autre parent).
export async function creerProcedureEtEnfant(
  page: Page,
  etiquette: string,
  prenomEnfant: string
): Promise<void> {
  await page.goto("/enfants");
  await page.getByPlaceholder("Ex : Enfant A").fill(prenomEnfant);
  // Le <select> « Procédure concernée » : on force « nouvelle procédure ».
  await page.locator("select").first().selectOption("__nouvelle__");
  await page
    .getByPlaceholder(/Nom de l'autre parent/)
    .fill(etiquette);
  await page.getByRole("button", { name: "Ajouter" }).click();
  // L'enfant apparaît dans la liste une fois créé.
  await expect(page.getByText(prenomEnfant).first()).toBeVisible();
}

// Lit l'id de la procédure dont l'étiquette est donnée (valeur de l'<option>
// du sélecteur de /enfants : « Même autre parent que : <etiquette> »).
export async function idProcedure(
  page: Page,
  etiquette: string
): Promise<string> {
  await page.goto("/enfants");
  const option = page.locator("select option", { hasText: etiquette });
  await expect(option).toHaveCount(1);
  const value = await option.getAttribute("value");
  if (!value) throw new Error(`Procédure introuvable pour : ${etiquette}`);
  return value;
}

// Bascule la procédure active (localStorage) puis recharge l'accueil.
export async function activerProcedure(
  page: Page,
  procId: string
): Promise<void> {
  await page.goto("/");
  await page.evaluate(
    (id) => localStorage.setItem("procedure_active_id", id),
    procId
  );
  // Rechargement pour que les pages relisent la procédure active.
  await page.goto("/");
}

// Renseigne l'autre parent + la référence du jugement de la procédure ACTIVE.
export async function remplirProcedure(
  page: Page,
  champs: { nom: string; prenom: string; juridiction: string; dateJugement: string }
): Promise<void> {
  await page.goto("/procedure");
  await page.getByLabel("Nom", { exact: true }).fill(champs.nom);
  await page.getByLabel("Prénom", { exact: true }).fill(champs.prenom);
  await page.getByLabel("Juridiction").fill(champs.juridiction);
  await page.getByLabel("Date du jugement").fill(champs.dateJugement);
  await page.getByRole("button", { name: "Enregistrer la procédure" }).click();
  await expect(page.getByText(/enregistrée/i)).toBeVisible();
}

// Ajoute un fait au journal (procédure active).
export async function ajouterFait(
  page: Page,
  fait: { titre: string; description: string }
): Promise<void> {
  await page.goto("/journal");
  await page
    .getByPlaceholder("Ex : Remise de l'enfant en retard")
    .fill(fait.titre);
  await page.locator('input[type="date"]').first().fill(aujourdhuiIso());
  await page
    .getByPlaceholder("Décrivez les faits observables, sans interprétation.")
    .fill(fait.description);
  await page.getByRole("button", { name: "Ajouter au journal" }).click();
  await expect(page.getByText(fait.titre).first()).toBeVisible();
}

// Ajoute un frais (procédure active).
export async function ajouterFrais(
  page: Page,
  frais: { libelle: string; montant: string }
): Promise<void> {
  await page.goto("/frais");
  await page
    .getByPlaceholder("Ex : Consultation orthodontiste")
    .fill(frais.libelle);
  await page.getByPlaceholder("80").fill(frais.montant);
  await page.locator('input[type="date"]').first().fill(aujourdhuiIso());
  await page.getByRole("button", { name: "Ajouter le frais" }).click();
  await expect(page.getByText(frais.libelle).first()).toBeVisible();
}
