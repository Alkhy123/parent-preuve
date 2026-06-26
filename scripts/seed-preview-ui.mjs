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
  const valeur = process.env[nom]?.trim();
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

function nomDiagnostic(nom) {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function capture(page, nom, rapport) {
  const chemin = join(SORTIE, `${String(rapport.captures.length + 1).padStart(2, "0")}-${nom}.png`);
  await page.screenshot({ path: chemin, fullPage: true });
  rapport.captures.push(chemin);
  console.log(`  capture : ${chemin}`);
}

async function screenshotDiagnostic(page, nom) {
  mkdirSync(SORTIE, { recursive: true });
  const chemin = join(SORTIE, `diagnostic-${nomDiagnostic(nom)}-${Date.now()}.png`);
  await page.screenshot({ path: chemin, fullPage: true });

  const diagnostic = await page.evaluate(() => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const texte = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
    const titres = Array.from(document.querySelectorAll("h1,h2,h3"))
      .filter(visible)
      .map(texte)
      .filter(Boolean);
    const boutons = Array.from(document.querySelectorAll("button"))
      .filter(visible)
      .map(texte)
      .filter(Boolean);
    const inputs = Array.from(document.querySelectorAll("input, textarea, select"))
      .filter(visible)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type") ?? "",
        name: el.getAttribute("name") ?? "",
        placeholder: el.getAttribute("placeholder") ?? "",
        ariaLabel: el.getAttribute("aria-label") ?? "",
      }));
    const mots = ["Ajouter", "Frais", "Libellé", "Libelle", "Date", "Montant"];
    const textesCibles = Array.from(document.querySelectorAll("body *"))
      .filter(visible)
      .map(texte)
      .filter((t) => t && mots.some((mot) => t.includes(mot)))
      .slice(0, 80);
    return {
      url: window.location.href,
      titres,
      boutons,
      inputs,
      textesCibles,
    };
  });

  console.log(`\n--- Diagnostic ${nom} ---`);
  console.log(`Capture : ${chemin}`);
  console.log(`URL : ${diagnostic.url}`);
  console.log(`Titres visibles : ${JSON.stringify(diagnostic.titres)}`);
  console.log(`Boutons visibles : ${JSON.stringify(diagnostic.boutons)}`);
  console.log(`Inputs visibles : ${JSON.stringify(diagnostic.inputs)}`);
  console.log(`Textes cibles : ${JSON.stringify(diagnostic.textesCibles)}`);
  console.log("--- Fin diagnostic ---\n");
  return chemin;
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

async function findFirstVisible(locatorList) {
  for (const locator of locatorList) {
    const total = await locator.count();
    for (let i = 0; i < total; i += 1) {
      const element = locator.nth(i);
      if (await element.isVisible()) return element;
    }
  }
  return null;
}

async function clickFirstVisibleByRole(page, role, names, contexte = "bouton") {
  for (const name of names) {
    const boutons = page.getByRole(role, { name });
    const total = await boutons.count();
    for (let i = 0; i < total; i += 1) {
      const bouton = boutons.nth(i);
      if (await bouton.isVisible()) {
        await bouton.click();
        console.log(`  ${contexte} : "${name}"`);
        return true;
      }
    }
  }
  return false;
}

async function maybeClickByTextOrRole(scope, names, contexte = "bouton optionnel") {
  for (const name of names) {
    const bouton = await findFirstVisible([
      scope.getByRole("button", { name }),
      scope.getByText(name),
    ]);
    if (bouton) {
      await bouton.click();
      console.log(`  ${contexte} : "${name}"`);
      return true;
    }
  }
  return false;
}

async function fillByLabelOrFallback(scope, labels, fallbackLocators, valeur, nomChamp) {
  for (const label of labels) {
    const champAccessible = scope.getByLabel(label);
    if ((await champAccessible.count()) > 0) {
      const cible = champAccessible.first();
      if (await cible.isVisible()) {
        await cible.fill(valeur);
        console.log(`  champ ${nomChamp} rempli via label "${label}"`);
        return;
      }
    }

    const labelTexte = scope.locator("label").filter({ hasText: label });
    if ((await labelTexte.count()) > 0) {
      const cible = labelTexte.first().locator("xpath=following-sibling::input[1]");
      if ((await cible.count()) > 0 && (await cible.first().isVisible())) {
        await cible.first().fill(valeur);
        console.log(`  champ ${nomChamp} rempli via label voisin "${label}"`);
        return;
      }
    }
  }

  const fallback = await findFirstVisible(fallbackLocators);
  if (fallback) {
    await fallback.fill(valeur);
    console.log(`  fallback locator utilise pour ${nomChamp}`);
    return;
  }

  throw new Error(`Champ introuvable pour ${nomChamp}`);
}

// Ouvre le formulaire d'ajout de frais. Priorite au data-testid stable
// `frais-add-toggle`, puis fallback sur les boutons visibles par texte.
async function ouvrirFormulaireFrais(page) {
  const toggle = page.locator('[data-testid="frais-add-toggle"]');
  if ((await toggle.count()) > 0) {
    const cible = toggle.first();
    if (await cible.isVisible()) {
      await cible.click();
      console.log("  ouverture formulaire frais : data-testid frais-add-toggle");
      return;
    }
  }

  const ouvert = await clickFirstVisibleByRole(
    page,
    "button",
    [/Ajouter une dépense/i, /Ajouter un frais/i, /^Ajouter$/i],
    "ouverture formulaire frais"
  );
  if (!ouvert) {
    await screenshotDiagnostic(page, "frais-ouverture-impossible");
    throw new Error("Impossible d'ouvrir le formulaire frais.");
  }
}

// Vrai si le formulaire d'ajout de frais (champs Libelle/Montant/Date) est visible.
async function formulaireFraisDetecte(page) {
  const form = page.locator('[data-testid="frais-add-form"]');
  if ((await form.count()) > 0 && (await form.first().isVisible())) return true;
  const signaux = [
    page.getByText(/Libellé/i),
    page.getByText(/Libelle/i),
    page.getByText(/Montant total/i),
    page.getByText(/^Date\b/i),
    page.getByRole("button", { name: /Ajouter le frais/i }),
    page.getByRole("button", { name: /Enregistrer les modifications/i }),
  ];
  for (const signal of signaux) {
    if (await findFirstVisible([signal])) return true;
  }
  return false;
}

// Tente de re-ouvrir / deplier le formulaire si le premier clic n'a pas suffi.
async function tenterRouvertureFormulaireFrais(page) {
  // a) data-testid du bouton principal.
  const toggle = page.locator('[data-testid="frais-add-toggle"]');
  if ((await toggle.count()) > 0 && (await toggle.first().isVisible())) {
    await toggle.first().click().catch(() => {});
  }
  // b) bouton "Afficher" a l'interieur de l'encart d'ajout.
  const section = page.locator('[data-testid="frais-add-section"]');
  if ((await section.count()) > 0) {
    const afficher = section.getByRole("button", { name: /Afficher/i });
    if ((await afficher.count()) > 0 && (await afficher.first().isVisible())) {
      await afficher.first().click().catch(() => {});
      console.log('  encart frais deplie via "Afficher"');
    }
  }
  // c) bouton "Ajouter un frais" de l'etat vide.
  const vide = page.getByRole("button", { name: /Ajouter un frais/i });
  if ((await vide.count()) > 0 && (await vide.first().isVisible())) {
    await vide.first().click().catch(() => {});
  }
}

async function attendreSignalFormulaireFrais(page) {
  const depart = Date.now();
  let recuperationTentee = false;
  while (Date.now() - depart < 15000) {
    if (await formulaireFraisDetecte(page)) {
      console.log("  formulaire frais detecte apres ouverture");
      return;
    }
    // Mi-parcours : si rien n'apparait, on tente de deplier/rouvrir une fois.
    if (!recuperationTentee && Date.now() - depart > 2500) {
      recuperationTentee = true;
      await tenterRouvertureFormulaireFrais(page);
    }
    await page.waitForTimeout(250);
  }

  await screenshotDiagnostic(page, "frais-formulaire-non-detecte");
  throw new Error(
    "Formulaire frais non detecte apres clic : aucun signal Libelle/Montant/Date/submit visible."
  );
}

async function trouverZoneFormulaireFrais(page) {
  // Priorite au conteneur stable du formulaire.
  const form = page.locator('[data-testid="frais-add-form"]');
  if ((await form.count()) > 0 && (await form.first().isVisible())) {
    console.log("  zone formulaire frais : data-testid frais-add-form");
    return form.first();
  }

  const candidats = page
    .locator("form, section, div")
    .filter({ hasText: /Libellé|Libelle|Montant total|Montant/i });
  const total = await candidats.count();
  for (let i = total - 1; i >= 0; i -= 1) {
    const candidat = candidats.nth(i);
    if (
      (await candidat.isVisible()) &&
      (await candidat.locator('input[type="text"], input[inputmode="decimal"], input[inputMode="decimal"]').count()) >= 2
    ) {
      console.log("  zone formulaire frais detectee par champs visibles");
      return candidat;
    }
  }

  console.log("  fallback formulaire frais : zone main");
  return page.locator("main").first();
}

async function remplirDateFrais(page, formulaire) {
  const dateVisible = await findFirstVisible([formulaire.locator('input[type="date"]')]);
  if (dateVisible) {
    await dateVisible.fill(dateIsoAujourdhui());
    console.log("  champ date frais rempli via input date");
    return;
  }

  const labelsDate = formulaire.locator("label").filter({ hasText: /^Date\b/i });
  if ((await labelsDate.count()) > 0) {
    const champProche = labelsDate
      .first()
      .locator("xpath=following-sibling::input[1]");
    if ((await champProche.count()) > 0 && (await champProche.first().isVisible())) {
      await champProche.first().fill(dateIsoAujourdhui());
      console.log("  champ date frais rempli via label voisin");
      return;
    }
  }

  await screenshotDiagnostic(page, "frais-date-introuvable");
  throw new Error("Champ date frais introuvable apres ouverture du formulaire.");
}

async function cliquerSubmitFrais(page, formulaire) {
  // Priorite au data-testid stable du bouton de validation.
  const submitTestId = page.locator('[data-testid="frais-submit"]');
  if ((await submitTestId.count()) > 0) {
    const cible = submitTestId.first();
    if ((await cible.isVisible()) && (await cible.isEnabled())) {
      await cible.click();
      console.log("  submit frais : data-testid frais-submit");
      return;
    }
  }

  const nomsSubmit = [
    /Ajouter le frais/i,
    /Ajouter la dépense/i,
    /Ajouter la depense/i,
    /^Enregistrer$/i,
    /^Valider$/i,
  ];

  for (const name of nomsSubmit) {
    const bouton = await findFirstVisible([formulaire.getByRole("button", { name })]);
    if (bouton && await bouton.isEnabled()) {
      await bouton.click();
      console.log(`  submit frais : "${name}"`);
      return;
    }
  }

  for (const name of nomsSubmit) {
    const bouton = await findFirstVisible([page.getByRole("button", { name })]);
    if (bouton && await bouton.isEnabled()) {
      await bouton.click();
      console.log(`  submit frais global : "${name}"`);
      return;
    }
  }

  const boutonsAjouter = formulaire.getByRole("button", { name: /^Ajouter$/i });
  for (let i = 0; i < await boutonsAjouter.count(); i += 1) {
    const bouton = boutonsAjouter.nth(i);
    if ((await bouton.isVisible()) && (await bouton.isEnabled())) {
      await bouton.click();
      console.log('  submit frais : "Ajouter"');
      return;
    }
  }

  const boutonsAjouterGlobaux = page.getByRole("button", { name: /^Ajouter$/i });
  for (let i = 0; i < await boutonsAjouterGlobaux.count(); i += 1) {
    const bouton = boutonsAjouterGlobaux.nth(i);
    if ((await bouton.isVisible()) && (await bouton.isEnabled())) {
      await bouton.click();
      console.log('  submit frais global : "Ajouter"');
      return;
    }
  }

  throw new Error("Bouton de validation frais introuvable.");
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
    try {
      await attendrePage(page, "/frais", /Frais/);
      await ouvrirFormulaireFrais(page);
      await attendreSignalFormulaireFrais(page);
      const formulaire = await trouverZoneFormulaireFrais(page);
      await fillByLabelOrFallback(
        formulaire,
        ["Libellé", "Libelle"],
        [
          formulaire.getByPlaceholder(/consultation|orthodontiste|libell/i),
          formulaire.locator('input[type="text"]').first(),
        ],
        libelle,
        "libelle du frais"
      );
      await fillByLabelOrFallback(
        formulaire,
        ["Montant total (€)", "Montant total", "Montant"],
        [
          formulaire.getByPlaceholder(/^80$/),
          formulaire.locator('input[inputmode="decimal"], input[inputMode="decimal"]').first(),
          formulaire.locator('input[type="number"]').first(),
          formulaire.locator('input[type="text"]').nth(1),
        ],
        item.montant,
        "montant du frais"
      );
      await remplirDateFrais(page, formulaire);
      await maybeClickByTextOrRole(
        formulaire,
        [/Non, pas de justificatif/i, /Pas de justificatif/i, /^Non$/i],
        "justificatif frais"
      );
      await cliquerSubmitFrais(page, formulaire);
      try {
        await expect(page.getByText(libelle).first()).toBeVisible({ timeout: 20000 });
      } catch (e) {
        await screenshotDiagnostic(page, `frais-libelle-non-visible-${item.libelle}`);
        throw e;
      }
      rapport.frais.push(`${libelle} - ${item.montant} EUR`);
      console.log(`  frais : ${libelle}`);
    } catch (e) {
      await screenshotDiagnostic(page, `frais-echec-${item.libelle}`);
      throw e;
    }
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

// Diagnostic dedie a /preuves : capture + textes contenant les mots utiles.
async function diagnosticPreuves(page, contexte) {
  await screenshotDiagnostic(page, `preuves-${nomDiagnostic(contexte)}`);
  const infos = await page.evaluate(() => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const texte = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
    const titres = Array.from(document.querySelectorAll("h1,h2,h3"))
      .filter(visible)
      .map(texte)
      .filter(Boolean);
    const boutons = Array.from(document.querySelectorAll("button, a"))
      .filter(visible)
      .map(texte)
      .filter(Boolean)
      .slice(0, 60);
    const mots = ["preuve", "photo", "fichier", "image", "[TEST UI]"];
    const textesCibles = Array.from(document.querySelectorAll("body *"))
      .filter(visible)
      .map(texte)
      .filter((t) => t && mots.some((mot) => t.toLowerCase().includes(mot.toLowerCase())))
      .slice(0, 80);
    return { url: window.location.href, titres, boutons, textesCibles };
  });
  console.log(`\n--- Diagnostic preuves (${contexte}) ---`);
  console.log(`URL : ${infos.url}`);
  console.log(`Titres : ${JSON.stringify(infos.titres)}`);
  console.log(`Boutons/liens : ${JSON.stringify(infos.boutons)}`);
  console.log(`Textes preuve/photo/fichier/image/[TEST UI] : ${JSON.stringify(infos.textesCibles)}`);
  console.log("--- Fin diagnostic preuves ---\n");
}

// Attend un signal REEL apres l'enregistrement d'une preuve :
// succes precis (data-testid ou texte "Élément enregistré") ou erreur affichee.
// On ne se fie plus a "traçabilité", present dans le texte statique de la page.
async function attendreResultatPreuve(page, titre) {
  const succesTestId = page.locator('[data-testid="preuve-succes"]');
  const succesTexte = page.getByText(/Élément enregistré/i);
  const erreur = page.locator('[data-testid="preuve-erreur"]');

  const depart = Date.now();
  while (Date.now() - depart < 45000) {
    if ((await erreur.count()) > 0 && (await erreur.first().isVisible())) {
      const message = ((await erreur.first().textContent()) ?? "").replace(/\s+/g, " ").trim();
      await diagnosticPreuves(page, `erreur-${titre}`);
      throw new Error(`Erreur affichee lors de l'enregistrement de la preuve : ${message}`);
    }
    const succesVisible =
      ((await succesTestId.count()) > 0 && (await succesTestId.first().isVisible())) ||
      Boolean(await findFirstVisible([succesTexte]));
    if (succesVisible) {
      console.log("  preuve enregistree (succes confirme a l'ecran)");
      return;
    }
    await page.waitForTimeout(250);
  }

  await diagnosticPreuves(page, `sans-resultat-${titre}`);
  throw new Error(
    `Aucun resultat (succes ou erreur) apres enregistrement de la preuve : ${titre}`
  );
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

    const enregistrer = await findFirstVisible([
      page.locator('[data-testid="preuve-submit"]'),
      page.getByRole("button", { name: /Enregistrer l/ }),
      page.getByRole("button", { name: /Enregistrer et sceller/ }),
    ]);
    if (!enregistrer) {
      await diagnosticPreuves(page, "bouton-enregistrer-introuvable");
      throw new Error("Bouton d'enregistrement de la preuve introuvable.");
    }
    await expect(enregistrer).toBeEnabled({ timeout: 15000 });
    await enregistrer.click();

    // Attente d'un signal fiable AVANT de quitter la page : sinon la navigation
    // suivante annulerait l'upload/insert Supabase encore en cours.
    await attendreResultatPreuve(page, titre);
    rapport.preuves.push(titre);
    console.log(`  preuve : ${titre}`);
  }

  // Verification reelle de persistance : chaque preuve doit apparaitre dans /preuves.
  await attendrePage(page, "/preuves", "Preuves");
  for (const titre of rapport.preuves) {
    try {
      await expect(page.getByText(titre).first()).toBeVisible({ timeout: 20000 });
    } catch {
      await diagnosticPreuves(page, `absente-${titre}`);
      throw new Error(`Preuve enregistree mais absente de /preuves : ${titre}`);
    }
  }
  console.log(`  OK /preuves : ${rapport.preuves.length} preuve(s) visible(s)`);
  await capture(page, "preuves", rapport);
}

// Verifie que la page calendrier reconnait la procedure active (un enfant vient
// d'etre cree). On attend d'abord la fin du message transitoire de chargement,
// puis on detecte un eventuel marqueur d'absence de contexte. En cas d'absence,
// on enregistre un avertissement clair dans le rapport (sans bloquer le run).
async function verifierContexteCalendrier(page, chemin, rapport) {
  // Laisse le temps a "Chargement de la procédure active…" de disparaitre.
  try {
    await page
      .getByText(/Chargement de la procédure active/i)
      .first()
      .waitFor({ state: "hidden", timeout: 15000 });
  } catch {
    /* Le message transitoire peut ne jamais apparaitre : non bloquant. */
  }

  const absenceEnfant = await findFirstVisible([
    page.getByText(/Ajoute[z]? d'abord un enfant/i),
    page.getByText(/Ajoute[z]? d.abord un enfant/i),
  ]);
  if (absenceEnfant) {
    const avertissement =
      `${chemin} : le calendrier n'a pas reconnu la procedure active ` +
      "(aucun enfant detecte) alors qu'une procedure de test vient d'etre creee.";
    rapport.avertissements.push(avertissement);
    console.warn(`  ⚠ ${avertissement}`);
    await screenshotDiagnostic(page, `calendrier-contexte-absent-${nomDiagnostic(chemin)}`);
    return;
  }
  console.log(`  contexte calendrier reconnu : ${chemin}`);
}

async function visiterCalendriers(page, rapport) {
  console.log("Verification des calendriers...");
  await attendrePage(page, "/calendrier", "Calendrier");
  await verifierContexteCalendrier(page, "/calendrier", rapport);
  await capture(page, "calendrier", rapport);

  await attendrePage(page, "/calendrier/avance", /Calendrier/);
  await page.waitForLoadState("domcontentloaded");
  await verifierContexteCalendrier(page, "/calendrier/avance", rapport);
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
  if (rapport.avertissements.length > 0) {
    console.warn(`\n⚠ Avertissements (${rapport.avertissements.length}) :`);
    for (const a of rapport.avertissements) console.warn(`- ${a}`);
  } else {
    console.log("Aucun avertissement.");
  }
  console.log("Aucune action destructive executee.");
}

async function main() {
  chargerEnvLocal();

  // URL de preview nettoyee : trim (deja fait par variableObligatoire) puis
  // suppression des slashs finaux. On refuse une URL vide apres nettoyage.
  const baseUrl = variableObligatoire("PARENT_PREUVE_PREVIEW_URL").trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("PARENT_PREUVE_PREVIEW_URL est vide apres nettoyage.");
  }
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
    avertissements: [],
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
