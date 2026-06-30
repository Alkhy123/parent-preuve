// scripts/captures-ui.mjs
//
// Capture des écrans desktop + mobile pour comparer visuellement l'état de
// l'application avant/après une série de lots (AppShell, NavBar, thèmes...).
// Outil local de revue visuelle uniquement : n'écrit rien en base, ne modifie
// aucune donnée, et les images produites ne sont jamais commitées (captures-ui/
// est ignoré par git).
//
//   npm run capture:ui -- --label baseline-main
//
// Variables d'environnement :
//   PARENT_PREUVE_CAPTURE_URL   URL de base (défaut : http://localhost:3000)
//   TEST_EMAIL / TEST_PASSWORD  Optionnel : connexion avant capture des pages
//                                protégées (mêmes identifiants que les tests e2e).
//
// Si aucun identifiant n'est fourni, le script capture quand même les pages
// accessibles et journalise celles qui ont redirigé (ex. vers /connexion).
// Une page en erreur n'interrompt jamais le reste des captures.

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

// Petit chargeur .env.local (même convention que les autres scripts/*.mjs).
function chargerEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const ligne of readFileSync(".env.local", "utf8").split("\n")) {
    const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
}

chargerEnvLocal();

// --label valeur (ou --label=valeur). Défaut : "capture".
function lireLabel() {
  const args = process.argv.slice(2);
  const i = args.indexOf("--label");
  if (i !== -1 && args[i + 1]) return args[i + 1];
  const eg = args.find((a) => a.startsWith("--label="));
  if (eg) return eg.slice("--label=".length);
  return "capture";
}

const BASE_URL = (
  process.env.PARENT_PREUVE_CAPTURE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const LABEL = lireLabel();
const DATE = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ
const DOSSIER = `captures-ui/${DATE}_${LABEL}`;

mkdirSync(DOSSIER, { recursive: true });

// Routes à capturer : [chemin, nom de fichier].
const PAGES = [
  ["/", "accueil"],
  ["/journal", "journal"],
  ["/frais", "frais"],
  ["/documents", "documents"],
  ["/preuves", "preuves"],
  ["/calendrier", "calendrier"],
  ["/compte", "compte"],
  ["/onboarding", "onboarding"],
  ["/exporter", "exporter"],
  ["/copilote", "copilote"],
];

const VIEWPORTS = [
  { nom: "desktop", width: 1440, height: 1000, isMobile: false, hasTouch: false },
  { nom: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
];

// Coupe les animations/transitions pour des captures stables et comparables.
const CSS_SANS_ANIMATION = `
  *, *::before, *::after {
    animation-duration: 0.001s !important;
    animation-delay: 0s !important;
    transition-duration: 0.001s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`;

async function seConnecter(page) {
  const email = process.env.TEST_EMAIL;
  const motDePasse = process.env.TEST_PASSWORD;
  if (!email || !motDePasse) return false;

  try {
    await page.goto(`${BASE_URL}/connexion`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.getByPlaceholder("Adresse e-mail").fill(email);
    await page.getByPlaceholder("Mot de passe").fill(motDePasse);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.getByText("Vous êtes connecté").waitFor({ timeout: 15000 });

    // Modale RGPD éventuelle (compte neuf) : on l'accepte si présente.
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const accepter = page.getByRole("button", { name: "J'ai lu et j'accepte" });
    try {
      await accepter.click({ timeout: 8000 });
    } catch {
      // Déjà acceptée, ou non affichée : rien à faire.
    }
    console.log(`✅ Connecté en tant que ${email}.`);
    return true;
  } catch (e) {
    console.warn(`⚠ Connexion impossible (${e.message ?? e}). Capture sans session.`);
    return false;
  }
}

async function capturerPage(page, viewport, chemin, nomFichier, resultats) {
  const url = `${BASE_URL}${chemin}`;
  const cible = `${viewport.nom}_${nomFichier}.png`;

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Best-effort : certaines pages gardent une connexion réseau ouverte
    // (Supabase realtime) et n'atteignent jamais networkidle.
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.addStyleTag({ content: CSS_SANS_ANIMATION }).catch(() => {});

    const urlFinale = page.url();
    const redirigee =
      !chemin.startsWith("/connexion") &&
      new URL(urlFinale).pathname !== chemin &&
      (urlFinale.includes("/connexion") || urlFinale.includes("/rgpd"));

    await page.screenshot({ path: `${DOSSIER}/${cible}`, fullPage: true });

    if (redirigee) {
      resultats.redirigees.push({ chemin, viewport: viewport.nom, vers: urlFinale });
      console.warn(`↪ ${viewport.nom} ${chemin} -> redirigée vers ${urlFinale} (capturée quand même)`);
    } else {
      resultats.ok.push({ chemin, viewport: viewport.nom, fichier: cible });
      console.log(`✅ ${viewport.nom} ${chemin} -> ${cible}`);
    }
  } catch (e) {
    resultats.erreurs.push({ chemin, viewport: viewport.nom, erreur: e.message ?? String(e) });
    console.error(`❌ ${viewport.nom} ${chemin} -> ${e.message ?? e}`);
  }
}

async function main() {
  console.log(`Captures UI — base ${BASE_URL}, dossier ${DOSSIER}`);

  const navigateur = await chromium.launch();
  const resultats = { ok: [], erreurs: [], redirigees: [] };

  // Connexion (une fois, viewport desktop) puis réutilisation de la session
  // pour le contexte mobile, comme playwright.config.ts (storageState).
  let storageState;
  const contexteAuth = await navigateur.newContext({
    viewport: { width: VIEWPORTS[0].width, height: VIEWPORTS[0].height },
  });
  const pageAuth = await contexteAuth.newPage();
  const connecte = await seConnecter(pageAuth);
  if (connecte) storageState = await contexteAuth.storageState();

  for (const viewport of VIEWPORTS) {
    const contexte = await navigateur.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch,
      storageState,
    });
    const page = await contexte.newPage();

    for (const [chemin, nomFichier] of PAGES) {
      await capturerPage(page, viewport, chemin, nomFichier, resultats);
    }

    await contexte.close();
  }

  await contexteAuth.close();
  await navigateur.close();

  console.log("\n— Résumé —");
  console.log(`OK         : ${resultats.ok.length}`);
  console.log(`Redirigées : ${resultats.redirigees.length}`);
  for (const r of resultats.redirigees) {
    console.log(`  - ${r.viewport} ${r.chemin} -> ${r.vers}`);
  }
  console.log(`Erreurs    : ${resultats.erreurs.length}`);
  for (const r of resultats.erreurs) {
    console.log(`  - ${r.viewport} ${r.chemin} : ${r.erreur}`);
  }
  console.log(`\nCaptures dans ${DOSSIER}/`);
}

main().catch((e) => {
  console.error("❌ Erreur fatale :", e.message ?? e);
  process.exit(1);
});
