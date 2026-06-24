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
  // Cible le <select> « Procédure concernée » du formulaire (le seul à contenir
  // l'option __nouvelle__) : la page peut aussi afficher le sélecteur de
  // procédure global du bandeau.
  const selectProc = page.locator('select:has(option[value="__nouvelle__"])');
  await selectProc.selectOption("__nouvelle__");
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
  // Attend que les options du select du formulaire soient chargées (async).
  await page.waitForFunction(
    (etq) =>
      Array.from(
        document.querySelectorAll(
          'select:has(option[value="__nouvelle__"]) option'
        )
      ).some((o) => (o.textContent ?? "").includes(etq)),
    etiquette
  );
  const options = await page
    .locator('select:has(option[value="__nouvelle__"]) option')
    .evaluateAll((els) =>
      (els as HTMLOptionElement[]).map((e) => ({
        value: e.value,
        text: e.textContent ?? "",
      }))
    );
  const uuid = /^[0-9a-f-]{36}$/i;
  const trouve = options.find(
    (o) => uuid.test(o.value) && o.text.includes(etiquette)
  );
  if (!trouve) throw new Error(`Procédure introuvable pour : ${etiquette}`);
  return trouve.value;
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

// Ouvre un encart pliable (EncartPliable) replié par défaut, repéré par son titre.
// Attend que l'encart soit rendu (chargement async des pages) avant d'agir.
async function ouvrirEncart(page: Page, titre: string): Promise<void> {
  const heading = page.getByRole("heading", { name: titre });
  await heading.waitFor({ state: "visible" });
  const toggle = page
    .locator("div.carte")
    .filter({ has: heading })
    .getByRole("button", { name: /Afficher/ });
  // Bouton "Afficher ▾" présent => encart replié : on l'ouvre.
  if (await toggle.count()) {
    await toggle.first().click();
  }
}

// Ajoute un fait au journal (procédure active).
export async function ajouterFait(
  page: Page,
  fait: { titre: string; description: string }
): Promise<void> {
  await page.goto("/journal");
  await ouvrirEncart(page, "Ajouter un fait");
  const encart = page
    .locator("div.carte")
    .filter({ has: page.getByRole("heading", { name: "Ajouter un fait" }) });
  await page
    .getByPlaceholder("Ex : Remise de l'enfant en retard")
    .fill(fait.titre);
  await encart.locator('input[type="date"]').first().fill(aujourdhuiIso());
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
  await ouvrirEncart(page, "Ajouter un frais");
  const encart = page
    .locator("div.carte")
    .filter({ has: page.getByRole("heading", { name: "Ajouter un frais" }) });
  await page
    .getByPlaceholder("Ex : Consultation orthodontiste")
    .fill(frais.libelle);
  await page.getByPlaceholder("80").fill(frais.montant);
  await encart.locator('input[type="date"]').first().fill(aujourdhuiIso());
  await page.getByRole("button", { name: "Ajouter le frais" }).click();
  await expect(page.getByText(frais.libelle).first()).toBeVisible();
}

// Crée la règle de pension de la procédure active (composant ReglePension).
export async function ajouterReglePension(
  page: Page,
  regle: { montant: string; debiteur: "moi" | "autre"; jourEcheance: string }
): Promise<void> {
  await page.goto("/pension");
  const carte = page
    .locator("div.carte")
    .filter({ has: page.getByRole("heading", { name: "Règle de pension" }) });
  // Aucune règle encore : ouvre le formulaire (labels enveloppants ⇒ getByLabel ok).
  const ajouter = carte.getByRole("button", {
    name: "Ajouter la règle de pension",
  });
  await ajouter.waitFor({ state: "visible" });
  await ajouter.click();
  await carte.getByLabel(/Montant de base/).fill(regle.montant);
  await carte.getByLabel(/Qui paie/).selectOption(regle.debiteur);
  await carte.getByLabel(/échéance/).fill(regle.jourEcheance);
  await carte.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText(/par mois/).first()).toBeVisible();
}

// Configure le calendrier de garde (date de référence) + la zone de vacances
// de la procédure active. NB : sur /calendrier, libellés et champs sont des
// frères (pas d'association label↔input) ⇒ on cible par type/option.
export async function configurerCalendrier(
  page: Page,
  config: { dateReference: string; zone: "A" | "B" | "C" }
): Promise<void> {
  await page.goto("/calendrier");
  // Attend la fin des lectures async (enfants de la procédure active) : sans
  // enfant sélectionné, l'enregistrement de la règle est refusé.
  await page.waitForLoadState("networkidle");
  const carte = page
    .locator("div.carte")
    .filter({ has: page.getByRole("heading", { name: "Règle de garde" }) });
  await carte
    .getByRole("heading", { name: "Règle de garde" })
    .waitFor({ state: "visible" });
  // Si l'encart est replié (règle déjà créée), l'ouvrir.
  const toggle = carte.getByRole("button", { name: /Afficher/ });
  if (await toggle.count()) await toggle.first().click();
  await carte.locator('input[type="date"]').first().fill(config.dateReference);
  await carte.getByRole("button", { name: "Enregistrer la règle" }).click();
  // À l'enregistrement, l'encart se replie (signalFermeture) : le message succès
  // disparaît avec lui. On vérifie plutôt l'aperçu des week-ends (preuve que la
  // règle est active) et le repli de l'encart.
  await expect(
    page.getByRole("heading", { name: "Prochains week-ends de garde" })
  ).toBeVisible();
  await expect(carte.getByRole("button", { name: /Afficher/ })).toBeVisible();
  // Sélecteur de zone (options A/B/C), au niveau page.
  await page.locator('select:has(option[value="A"])').selectOption(config.zone);
}
