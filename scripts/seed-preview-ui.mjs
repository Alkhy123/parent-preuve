// scripts/seed-preview-ui.mjs
//
// Remplissage local d'une preview Parent Preuve avec des donnees fictives.
// Le script pilote uniquement l'interface utilisateur avec Playwright.
// Aucun secret ne doit etre stocke dans le depot : tout passe par variables
// d'environnement locales ou .env.local ignore par git.

import { chromium, expect } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SORTIE =
  process.env.PARENT_PREUVE_SEED_SCREENSHOTS_DIR ??
  "C:/tmp/parent-preuve-seed-preview";

const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const JOURNAL = [
  {
    titre: "Absence scolaire",
    description: "Absence scolaire signalee pour la matinee. Information notee pour suivi factuel.",
  },
  {
    titre: "Retard de remise d'enfant",
    description: "Remise de l'enfant constatee avec un retard d'environ trente minutes.",
  },
  {
    titre: "Message important recu",
    description: "Message important recu concernant l'organisation de la semaine.",
  },
  {
    titre: "Difficulte d'execution d'un droit de visite",
    description: "Difficulte constatee lors de l'organisation d'un droit de visite prevu.",
  },
  {
    titre: "Rendez-vous medical",
    description: "Rendez-vous medical note dans le dossier avec horaire et contexte factuel.",
  },
];

const FRAIS = [
  { libelle: "Orthopedie", montant: "25" },
  { libelle: "Podologue", montant: "50" },
  { libelle: "Pharmacie", montant: "18,40" },
  { libelle: "Activite scolaire", montant: "32" },
  { libelle: "Vetement", montant: "45" },
];

const DOCUMENTS = [
  "Facture pediatre",
  "Certificat medical",
  "Courrier ecole",
  "Capture echange parent",
];

const PREUVES = [
  {
    titre: "Photo fictive de sac d'ecole",
    description: "Photo fictive d'un sac d'ecole, ajoutee pour tester le parcours preuve.",
  },
  {
    titre: "Photo fictive de justificatif",
    description: "Photo fictive d'un justificatif, ajoutee pour tester la tracabilite technique.",
  },
  {
    titre: "Photo fictive de lieu de rendez-vous",
    description: "Photo fictive d'un lieu de rendez-vous, sans donnee personnelle reelle.",
  },
];

function chargerEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const ligne of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let valeur = m[2].trim();
    if (
      (valeur.startsWith('"') && valeur.endsWith('"')) ||
      (valeur.startsWith("'") && valeur.endsWith("'"))
    ) {
      valeur = valeur.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = valeur;
  }
}

function variableObligatoire(nom) {
  const valeur = process.env[nom];
  if (!valeur) {
    throw new Error(
      `Variable ${nom} absente. Definissez-la localement avant de lancer le seed.`
    );
  }
  return valeur;
}

function dateIsoAujourdhui() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function horodatageRun() {
  return new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12);
}

function creerImageTest(nom) {
  const chemin = join(SORTIE, nom);
  writeFileSync(chemin, Buffer.from(PNG_1X1, "base64"));
  return chemin;
}

async function capture(page, nom, rapport) {
  const chemin = join(SORTIE, `${String(rapport.captures.length + 1).padStart(2, "0")}-${nom}.png`);
  await page.screenshot({ path: chemin, fullPage: true });
  rapport.captures.push(chemin);
  console.log(`  capture : ${chemin}`);
}

async function attendrePage(page, chemin, titre) {
  await page.goto(chemin, { waitUntil: "domcontentloaded", timeout: 30000 });
  if (titre) {
    await expect(page.getByRole("heading", { name: titre }).first()).toBeVisible({
      timeout: 20000,
    });
  }
}

async function accepterRgpdSiPresent(page) {
  await attendrePage(page, "/");
  const accepter = page.getByRole("button", { name: "J'ai lu et j'accepte" });
  try {
    await accepter.click({ timeout: 7000 });
    await expect(accepter).toBeHidden({ timeout: 7000 });
    console.log("  RGPD accepte.");
  } catch {
    console.log("  RGPD deja accepte ou non affiche.");
  }
}

async function connecter(page, baseUrl, email, motDePasse) {
  console.log("Connexion a la preview...");
  await page.goto(`${baseUrl}/connexion`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Adresse e-mail").fill(email);
  await page.getByPlaceholder("Mot de passe").fill(motDePasse);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Vous êtes connecté")).toBeVisible({ timeout: 20000 });
  await accepterRgpdSiPresent(page);
  console.log("  connexion OK.");
}

async function ouvrirEncartSiBesoin(page, titre) {
  const heading = page.getByRole("heading", { name: titre });
  await heading.waitFor({ state: "visible", timeout: 15000 });
  const carte = page.locator("div.carte").filter({ has: heading });
  const afficher = carte.getByRole("button", { name: /Afficher/ });
  if (await afficher.count()) {
    await afficher.first().click();
  }
}

async function activerProcedureDepuisEnfants(page, etiquette) {
  await attendrePage(page, "/enfants");
  await page.waitForFunction(
    (nom) =>
      Array.from(
        document.querySelectorAll('select:has(option[value="__nouvelle__"]) option')
      ).some((option) => (option.textContent ?? "").includes(nom)),
    etiquette
  );
  const options = await page
    .locator('select:has(option[value="__nouvelle__"]) option')
    .evaluateAll((els) =>
      els.map((e) => ({
        value: e.value,
        text: e.textContent ?? "",
      }))
    );
  const uuid = /^[0-9a-f-]{36}$/i;
  const trouve = options.find((o) => uuid.test(o.value) && o.text.includes(etiquette));
  if (!trouve) throw new Error(`Procedure creee mais introuvable : ${etiquette}`);
  await page.evaluate((id) => localStorage.setItem("procedure_active_id", id), trouve.value);
  await attendrePage(page, "/");
  console.log(`  procedure active : ${etiquette}`);
}

async function creerProcedureDeTest(page, runId, rapport) {
  const etiquette = `[TEST UI ${runId}] Parent seed`;
  const enfant = `[TEST UI ${runId}] Enfant seed`;

  console.log("Creation d'une procedure et d'un enfant fictifs...");
  await attendrePage(page, "/enfants");
  await page.getByPlaceholder("Ex : Enfant A").fill(enfant);
  const selectProc = page.locator('select:has(option[value="__nouvelle__"])');
  await selectProc.selectOption("__nouvelle__");
  await page.getByPlaceholder(/Nom de l'autre parent/).fill(etiquette);
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.getByText(enfant).first()).toBeVisible({ timeout: 20000 });
  await activerProcedureDepuisEnfants(page, etiquette);
  await capture(page, "procedure-enfant", rapport);
  return { etiquette, enfant };
}

async function ajouterJournal(page, runId, rapport) {
  console.log("Ajout des evenements Journal...");
  for (const item of JOURNAL) {
    const titre = `[TEST UI ${runId}] ${item.titre}`;
    await attendrePage(page, "/journal", /Journal/);
    const bouton = page.getByRole("button", { name: "Ajouter un événement" });
    if (await bouton.count()) await bouton.first().click();
    await ouvrirEncartSiBesoin(page, "Ajouter un fait");
    const encart = page.locator("#ajouter-fait");
    await encart.getByPlaceholder("Ex : Remise de l'enfant en retard").fill(titre);
    await encart.locator('input[type="date"]').first().fill(dateIsoAujourdhui());
    await encart
      .getByPlaceholder("Décrivez les faits observables, sans interprétation.")
      .fill(item.description);
    await encart.getByRole("button", { name: "Ajouter au journal" }).click();
    await expect(page.getByText(titre).first()).toBeVisible({ timeout: 20000 });
    rapport.journal.push(titre);
    console.log(`  journal : ${titre}`);
  }
  await capture(page, "journal", rapport);
}

async function ajouterFrais(page, runId, rapport) {
  console.log("Ajout des frais fictifs...");
  for (const item of FRAIS) {
    const libelle = `[TEST UI ${runId}] ${item.libelle}`;
    await attendrePage(page, "/frais", /Frais/);
    const bouton = page.getByRole("button", { name: "Ajouter un frais" });
    if (await bouton.count()) await bouton.first().click();
    await ouvrirEncartSiBesoin(page, "Ajouter un frais");
    await page.getByPlaceholder("Ex : Consultation orthodontiste").fill(libelle);
    await page.getByPlaceholder("80").fill(item.montant);
    await page.locator('input[type="date"]').first().fill(dateIsoAujourdhui());
    await page.getByRole("button", { name: "Ajouter le frais" }).click();
    await expect(page.getByText(libelle).first()).toBeVisible({ timeout: 20000 });
    rapport.frais.push(`${libelle} - ${item.montant} EUR`);
    console.log(`  frais : ${libelle}`);
  }
  await capture(page, "frais", rapport);
}

async function ajouterDocuments(page, runId, image, rapport) {
  console.log("Ajout des documents fictifs...");
  for (const nom of DOCUMENTS) {
    const libelle = `[TEST UI ${runId}] ${nom}`;
    await attendrePage(page, "/documents", "Documents");
    const bouton =
      (await page.getByRole("button", { name: "Importer un document" }).count()) > 0
        ? page.getByRole("button", { name: "Importer un document" }).first()
        : page.getByRole("button", { name: "Importer" }).first();
    await bouton.click();
    await page.getByPlaceholder("Ex : Facture orthodontiste mars").fill(libelle);
    await page.locator("#champ-fichier").setInputFiles(image);
    await page.getByRole("button", { name: "Envoyer le document" }).click();
    await expect(page.getByText(libelle).first()).toBeVisible({ timeout: 25000 });
    rapport.documents.push(libelle);
    console.log(`  document : ${libelle}`);
  }
  await capture(page, "documents", rapport);
}

async function ajouterPreuves(page, runId, image, rapport) {
  console.log("Ajout des preuves photo fictives...");
  for (const item of PREUVES) {
    const titre = `[TEST UI ${runId}] ${item.titre}`;
    await attendrePage(page, "/preuves/nouvelle", /Ajouter/);
    const input = page.locator("#preuve-photo-fichier, input[type='file']").first();
    await input.setInputFiles(image);
    await expect(page.getByText(/Empreinte SHA-256/)).toBeVisible({ timeout: 15000 });
    await page.getByPlaceholder("Ex. État du logement, document remis…").fill(titre);
    await page.getByPlaceholder(/Décris les faits/).fill(item.description);
    const enregistrer =
      (await page.getByRole("button", { name: /Enregistrer l/ }).count()) > 0
        ? page.getByRole("button", { name: /Enregistrer l/ }).first()
        : page.getByRole("button", { name: /Enregistrer et sceller/ }).first();
    await expect(enregistrer).toBeEnabled({ timeout: 15000 });
    await enregistrer.click();
    await expect(
      page.getByText(/enregistr[ée]e|traçabilit|scell[ée]e/i).first()
    ).toBeVisible({ timeout: 35000 });
    rapport.preuves.push(titre);
    console.log(`  preuve : ${titre}`);
  }
  await attendrePage(page, "/preuves", "Preuves");
  await capture(page, "preuves", rapport);
}

async function visiterCalendriers(page, rapport) {
  console.log("Verification des calendriers...");
  await attendrePage(page, "/calendrier", "Calendrier");
  await expect(page.getByText(/Prochains week-ends|Règle de garde|Renseigne/i).first()).toBeVisible({
    timeout: 20000,
  });
  await capture(page, "calendrier", rapport);

  await attendrePage(page, "/calendrier/avance", /Calendrier/);
  await page.waitForLoadState("domcontentloaded");
  await capture(page, "calendrier-avance", rapport);
}

async function verifierDonnees(page, rapport) {
  console.log("Verification des donnees ajoutees...");
  const verifications = [
    { chemin: "/journal", titres: rapport.journal },
    { chemin: "/frais", titres: rapport.frais.map((x) => x.replace(/ - .+$/, "")) },
    { chemin: "/documents", titres: rapport.documents },
    { chemin: "/preuves", titres: rapport.preuves },
  ];
  for (const verification of verifications) {
    await attendrePage(page, verification.chemin);
    for (const titre of verification.titres) {
      await expect(page.getByText(titre).first()).toBeVisible({ timeout: 20000 });
    }
    console.log(`  OK ${verification.chemin}`);
  }
  await attendrePage(page, "/compte", "Mon compte");
  await capture(page, "compte", rapport);
}

function imprimerRapport(rapport) {
  console.log("\n=== Rapport seed preview UI ===");
  console.log(`Run : ${rapport.runId}`);
  console.log(`Procedure : ${rapport.procedure}`);
  console.log(`Journal : ${rapport.journal.length} evenement(s)`);
  console.log(`Frais : ${rapport.frais.length} frais`);
  console.log(`Documents : ${rapport.documents.length} document(s)`);
  console.log(`Preuves : ${rapport.preuves.length} preuve(s) photo`);
  console.log(`Captures : ${rapport.captures.length}`);
  for (const capturePath of rapport.captures) console.log(`- ${capturePath}`);
  console.log("Aucune action destructive executee.");
}

async function main() {
  chargerEnvLocal();

  const baseUrl = variableObligatoire("PARENT_PREUVE_PREVIEW_URL").replace(/\/$/, "");
  const email = variableObligatoire("PARENT_PREUVE_TEST_EMAIL");
  const motDePasse = variableObligatoire("PARENT_PREUVE_TEST_PASSWORD");
  const runId = horodatageRun();

  mkdirSync(SORTIE, { recursive: true });
  const image = creerImageTest(`parent-preuve-seed-${runId}.png`);
  const rapport = {
    runId,
    procedure: "",
    journal: [],
    frais: [],
    documents: [],
    preuves: [],
    captures: [],
  };

  const navigateur = await chromium.launch({ headless: true });
  const contexte = await navigateur.newContext({
    baseURL: baseUrl,
    viewport: { width: 1440, height: 900 },
    permissions: ["geolocation"],
    geolocation: { latitude: 48.8566, longitude: 2.3522 },
  });
  const page = await contexte.newPage();

  try {
    await connecter(page, baseUrl, email, motDePasse);
    const procedure = await creerProcedureDeTest(page, runId, rapport);
    rapport.procedure = procedure.etiquette;
    await ajouterJournal(page, runId, rapport);
    await ajouterFrais(page, runId, rapport);
    await ajouterDocuments(page, runId, image, rapport);
    await ajouterPreuves(page, runId, image, rapport);
    await visiterCalendriers(page, rapport);
    await verifierDonnees(page, rapport);
    imprimerRapport(rapport);
  } finally {
    await navigateur.close();
  }
}

main().catch((e) => {
  console.error("\nECHEC seed preview UI :", e.message ?? e);
  process.exit(1);
});
