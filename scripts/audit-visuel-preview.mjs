// scripts/audit-visuel-preview.mjs
//
// Capture automatique de la preview Vercel pour audit visuel.
// - Charge .env.local (TEST_EMAIL / TEST_PASSWORD / PREVIEW_URL) sans dépendance.
// - Se connecte avec le compte de test (jamais affiché).
// - Parcourt les pages principales en desktop 1440 et mobile 390,
//   pour les 3 thèmes (classique-bleu, ivoire-greffe, noir-or-sombre).
// - Enregistre les PNG dans docs/audit-visuel-preview/screenshots/.
//
// Usage : node scripts/audit-visuel-preview.mjs
// Aucune écriture en base, aucune modification métier.

import { chromium } from "@playwright/test";
import {
  existsSync,
  readFileSync,
  mkdirSync,
} from "node:fs";

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

const BASE =
  process.env.PREVIEW_URL ??
  process.env.PARENT_PREUVE_URL ??
  "https://parent-preuve-gsa559prt-alkhyom-s-projects.vercel.app";

const EMAIL = process.env.TEST_EMAIL;
const MDP = process.env.TEST_PASSWORD;

const THEMES = ["classique-bleu", "ivoire-greffe", "noir-or-sombre"];
const VIEWPORTS = [
  { nom: "desktop", width: 1440, height: 900 },
  { nom: "mobile", width: 390, height: 844 },
];
const PAGES = [
  "/",
  "/journal",
  "/frais",
  "/documents",
  "/preuves",
  "/preuves/nouvelle",
  "/calendrier",
  "/calendrier/avance",
  "/compte",
];

const OUT = "docs/audit-visuel-preview/screenshots";

function slug(p) {
  if (p === "/") return "accueil";
  return p.replace(/^\//, "").replace(/\//g, "-");
}

async function main() {
  if (!EMAIL || !MDP) {
    console.error(
      "ERREUR: TEST_EMAIL / TEST_PASSWORD absents (.env.local). Abandon."
    );
    process.exit(1);
  }

  const navigateur = await chromium.launch({ headless: true });
  const contexte = await navigateur.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["geolocation"],
    geolocation: { latitude: 48.8566, longitude: 2.3522 },
  });
  const page = await contexte.newPage();

  // --- Connexion (réutilise le flux e2e existant) ---
  console.log("Connexion...");
  await page.goto(`${BASE}/connexion`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Adresse e-mail").fill(EMAIL);
  await page.getByPlaceholder("Mot de passe").fill(MDP);
  await page.getByRole("button", { name: "Se connecter" }).click();
  try {
    await page.getByText("Vous êtes connecté").waitFor({ timeout: 20000 });
    console.log("  connecté OK");
  } catch {
    console.log("  AVERTISSEMENT: confirmation de connexion non détectée");
  }

  // Accepte le RGPD si la modale s'affiche (compte neuf).
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  try {
    const accepter = page.getByRole("button", { name: "J'ai lu et j'accepte" });
    await accepter.click({ timeout: 8000 });
    await accepter.waitFor({ state: "hidden", timeout: 8000 });
    console.log("  RGPD accepté");
  } catch {
    console.log("  RGPD déjà accepté / non affiché");
  }

  const resultats = [];

  for (const theme of THEMES) {
    // Mémorise le thème (lu au chargement par le script no-flash -> data-theme).
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await page.evaluate((t) => {
      try {
        localStorage.setItem("parent-preuve-theme", t);
      } catch {}
    }, theme);

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const dir = `${OUT}/${theme}/${vp.nom}`;
      mkdirSync(dir, { recursive: true });

      for (const p of PAGES) {
        const cible = `${dir}/${slug(p)}.png`;
        try {
          await page.goto(`${BASE}${p}`, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
          // Laisse le temps aux chargements Supabase / au rendu de s'afficher.
          await page.waitForTimeout(2800);
          // Confirme l'application du thème.
          const themeApplique = await page.evaluate(() =>
            document.documentElement.getAttribute("data-theme")
          );
          await page.screenshot({ path: cible, fullPage: true });
          resultats.push({ theme, vp: vp.nom, page: p, ok: true, themeApplique });
          console.log(`OK  ${theme}/${vp.nom}${p}  (data-theme=${themeApplique})`);
        } catch (e) {
          resultats.push({ theme, vp: vp.nom, page: p, ok: false, err: String(e).slice(0, 120) });
          console.log(`KO  ${theme}/${vp.nom}${p}  -> ${String(e).slice(0, 120)}`);
        }
      }
    }
  }

  await navigateur.close();

  const ok = resultats.filter((r) => r.ok).length;
  console.log(`\n=== Terminé : ${ok}/${resultats.length} captures ===`);
}

main().catch((e) => {
  console.error("ÉCHEC GLOBAL:", e);
  process.exit(1);
});
