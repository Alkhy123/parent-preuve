// scripts/captures-ui-simple.mjs
//
// Baseline de captures UI SIMPLE, locale et robuste. Repart de zéro par rapport
// aux anciens scripts (captures-ui*.mjs) restés instables — ceux-ci ne sont NI
// réparés NI utilisés ici. Deux modes seulement :
//
//   node scripts/captures-ui-simple.mjs --auth   → ouvre un navigateur visible,
//        laisse l'utilisateur se connecter à la main, puis enregistre une
//        session locale (storageState) réutilisable pour les captures.
//
//   node scripts/captures-ui-simple.mjs          → capture les pages en 4
//        variantes UI × 2 viewports sur localhost, en réutilisant la session
//        locale si elle existe.
//
// Sécurité :
//   - ne lit JAMAIS .env.local et n'affiche aucun secret ;
//   - la session locale (.playwright/captures-local-auth.json) reste locale et
//     n'est jamais commitée (voir .gitignore) ;
//   - les captures (captures-ui/) ne sont jamais commitées (voir .gitignore).
//
// Localhost uniquement par défaut. Aucune dépendance Vercel / URL externe.

import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

// ── Configuration ───────────────────────────────────────────────────────────

const BASE_URL = (
  process.env.PARENT_PREUVE_CAPTURE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

// Session locale (jamais commitée). Réutilisée par le mode capture.
const AUTH_FILE = ".playwright/captures-local-auth.json";

// Clé et forme réelles des préférences UI (cf. lib/ui-preferences/storage.ts).
const CLE_UI_PREFERENCES = "parent-preuve-ui-preferences";

// Captures viewport par défaut (évite les artefacts des boutons flottants en
// fullPage). Activable via CAPTURE_FULL_PAGE=1.
const FULL_PAGE = process.env.CAPTURE_FULL_PAGE === "1";

const PAGES = [
  ["/", "accueil"],
  ["/collecter", "collecter"],
  ["/organiser", "organiser"],
  ["/exporter", "exporter"],
  ["/journal", "journal"],
  ["/frais", "frais"],
  ["/documents", "documents"],
  ["/preuves", "preuves"],
  ["/calendrier", "calendrier"],
  ["/copilote", "copilote"],
  ["/compte", "compte"],
];

const VARIANTES = [
  { nom: "board10-guided", interfaceStyle: "board10", comfortMode: "guided" },
  { nom: "board10-comfort", interfaceStyle: "board10", comfortMode: "comfort" },
  { nom: "vue-ensemble-guided", interfaceStyle: "vue-ensemble", comfortMode: "guided" },
  { nom: "vue-ensemble-comfort", interfaceStyle: "vue-ensemble", comfortMode: "comfort" },
];

const VIEWPORTS = [
  { nom: "desktop", width: 1440, height: 1000, isMobile: false, hasTouch: false },
  { nom: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
];

// Écrans transitoires de la garde d'accès (GardeAcces) : tant qu'ils sont là,
// la session n'est pas encore tranchée.
const TEXTES_TRANSITOIRES = [
  "Chargement…",
  "Chargement...",
  "Redirection…",
  "Redirection...",
];

const CHEMINS_PUBLICS = ["/"];

// ── Utilitaires ─────────────────────────────────────────────────────────────

function estModeAuth() {
  return process.argv.includes("--auth");
}

function attendreEntree(message) {
  return new Promise((resolve) => {
    process.stdout.write(`\n${message}\n> `);
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.pause();
      resolve();
    });
  });
}

async function serveurRepond() {
  try {
    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), 5000);
    const r = await fetch(`${BASE_URL}/connexion`, { signal: controleur.signal });
    clearTimeout(minuteur);
    return r.status < 500;
  } catch {
    return false;
  }
}

// ── Mode auth : session locale interactive ──────────────────────────────────

async function modeAuth() {
  console.log(`\n▶ Session locale — base : ${BASE_URL}`);

  if (!(await serveurRepond())) {
    console.error(
      `❌ Serveur injoignable sur ${BASE_URL}.\n   Lance d'abord « npm run dev » dans un autre terminal.`,
    );
    process.exit(1);
  }

  mkdirSync(".playwright", { recursive: true });

  const navigateur = await chromium.launch({ headless: false });
  const contexte = await navigateur.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await contexte.newPage();
  await page
    .goto(`${BASE_URL}/connexion`, { waitUntil: "domcontentloaded", timeout: 30000 })
    .catch(() => {});

  await attendreEntree(
    "Connecte-toi manuellement dans la fenêtre ouverte, accepte le RGPD si besoin,\n" +
      "puis reviens ici et appuie sur Entrée.",
  );

  await contexte.storageState({ path: AUTH_FILE });
  await navigateur.close();

  console.log(
    `\n✅ Session enregistrée : ${AUTH_FILE}\n` +
      "   (fichier local, non commité — voir .gitignore).\n" +
      "   Tu peux maintenant lancer : npm run capture:ui:simple",
  );
}

// ── Mode capture ─────────────────────────────────────────────────────────────

async function attendreStable(page) {
  await Promise.race([
    page.waitForURL((u) => u.pathname === "/connexion", { timeout: 15000 }),
    page.waitForFunction(
      (textes) => {
        if (location.pathname === "/connexion") return true;
        const t = (document.body?.innerText ?? "").trim();
        const enChargement = textes.some((x) => t.includes(x)) && t.length < 400;
        return !enChargement && t.length > 0;
      },
      TEXTES_TRANSITOIRES,
      { timeout: 15000 },
    ),
  ]).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
}

async function capturerPage(page, dossier, variante, viewport, chemin, nom, resultats) {
  const dossierCible = `${dossier}/${variante.nom}/${viewport.nom}`;
  const cheminFichier = `${dossierCible}/${nom}.png`;
  const relatif = `${variante.nom}/${viewport.nom}/${nom}.png`;
  mkdirSync(dossierCible, { recursive: true });

  const erreursConsole = [];
  const onConsole = (msg) => {
    if (msg.type() === "error") erreursConsole.push(msg.text().slice(0, 200));
  };
  const onPageError = (e) =>
    erreursConsole.push(`pageerror: ${(e.message ?? String(e)).slice(0, 200)}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  const entree = {
    variante: variante.nom,
    viewport: viewport.nom,
    chemin,
    fichier: relatif,
  };

  try {
    await page.goto(`${BASE_URL}${chemin}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await attendreStable(page);

    // Préférence UI appliquée sur <html> ? (data-interface-style)
    const prefOk = await page
      .waitForFunction(
        (style) =>
          document.documentElement.getAttribute("data-interface-style") === style,
        variante.interfaceStyle,
        { timeout: 5000 },
      )
      .then(() => true)
      .catch(() => false);

    // Petite stabilisation visuelle.
    await page.waitForTimeout(FULL_PAGE ? 600 : 400);

    const urlFinale = page.url();
    const pathname = new URL(urlFinale).pathname;
    const enChargement = await page
      .evaluate((textes) => {
        const t = (document.body?.innerText ?? "").trim();
        return textes.some((x) => t.includes(x)) && t.length < 400;
      }, TEXTES_TRANSITOIRES)
      .catch(() => false);

    await page.screenshot({ path: cheminFichier, fullPage: FULL_PAGE });
    const cree = existsSync(cheminFichier);

    entree.url_finale = urlFinale;
    entree.pref_appliquee = prefOk;
    entree.erreurs_console = erreursConsole.length;
    if (erreursConsole.length) entree.details_console = erreursConsole.slice(0, 3);

    if (pathname.includes("/connexion")) {
      entree.etat = "connexion";
      resultats.redirigees.push(entree);
      console.warn(`↪ ${variante.nom}/${viewport.nom} ${chemin} → /connexion`);
    } else if (enChargement) {
      entree.etat = "chargement";
      entree.erreur = "Page bloquée sur « Chargement… ».";
      resultats.erreurs.push(entree);
      console.error(`❌ ${variante.nom}/${viewport.nom} ${chemin} — Chargement`);
    } else if (!cree) {
      entree.etat = "sans-capture";
      entree.erreur = "Screenshot non créé.";
      resultats.erreurs.push(entree);
      console.error(`❌ ${variante.nom}/${viewport.nom} ${chemin} — pas de screenshot`);
    } else {
      entree.etat = "ok";
      if (!prefOk) entree.avertissement = "Préférence UI non confirmée sur <html>.";
      resultats.ok.push(entree);
      console.log(`✅ ${variante.nom}/${viewport.nom} ${chemin}`);
    }
  } catch (e) {
    entree.etat = "timeout";
    entree.erreur = e.message ?? String(e);
    resultats.erreurs.push(entree);
    console.error(`❌ ${variante.nom}/${viewport.nom} ${chemin} — ${e.message ?? e}`);
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }
}

async function modeCapture() {
  console.log(`\n▶ Captures UI simples — base : ${BASE_URL}`);

  if (!(await serveurRepond())) {
    console.error(
      `❌ Serveur injoignable sur ${BASE_URL}.\n   Lance d'abord « npm run dev » dans un autre terminal.`,
    );
    process.exit(1);
  }

  const storageState = existsSync(AUTH_FILE) ? AUTH_FILE : undefined;
  if (!storageState) {
    console.warn(
      `⚠ Aucune session locale (${AUTH_FILE}).\n` +
        "  Les pages protégées redirigeront vers /connexion.\n" +
        "  Pour une baseline connectée : npm run capture:ui:auth (puis relancer).",
    );
  }

  const DATE = new Date().toISOString().slice(0, 10);
  const DOSSIER = `captures-ui/${DATE}_simple-baseline`;
  mkdirSync(DOSSIER, { recursive: true });

  const attendues = PAGES.length * VARIANTES.length * VIEWPORTS.length;
  console.log(
    `  Pages: ${PAGES.length} × Variantes: ${VARIANTES.length} × Viewports: ${VIEWPORTS.length} = ${attendues} captures attendues`,
  );
  console.log(`  fullPage: ${FULL_PAGE ? "oui" : "non (viewport)"}\n`);

  const navigateur = await chromium.launch();
  const resultats = { ok: [], redirigees: [], erreurs: [] };

  for (const variante of VARIANTES) {
    const prefs = JSON.stringify({
      comfortMode: variante.comfortMode,
      interfaceStyle: variante.interfaceStyle,
    });
    for (const viewport of VIEWPORTS) {
      const contexte = await navigateur.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
        storageState,
      });
      const page = await contexte.newPage();
      await page.addInitScript(
        ({ cle, p }) => {
          try {
            window.localStorage.setItem(cle, p);
          } catch {
            /* silencieux */
          }
        },
        { cle: CLE_UI_PREFERENCES, p: prefs },
      );

      for (const [chemin, nom] of PAGES) {
        await capturerPage(page, DOSSIER, variante, viewport, chemin, nom, resultats);
      }

      await contexte.close();
    }
  }

  await navigateur.close();

  // Connecté si au moins une page protégée a été rendue correctement.
  const connecte = resultats.ok.some((e) => !CHEMINS_PUBLICS.includes(e.chemin));

  const summary = {
    date: DATE,
    base_url: BASE_URL,
    connecte,
    session_locale: !!storageState,
    full_page: FULL_PAGE,
    pages: PAGES.length,
    variantes: VARIANTES.length,
    viewports: VIEWPORTS.length,
    attendues,
    ok: resultats.ok.length,
    erreurs: resultats.erreurs.length,
    redirigees: resultats.redirigees.length,
    dossier: DOSSIER,
  };

  try {
    writeFileSync(`${DOSSIER}/summary.json`, JSON.stringify(summary, null, 2));
    writeFileSync(
      `${DOSSIER}/manifest.json`,
      JSON.stringify({ summary, entrees: [...resultats.ok, ...resultats.redirigees, ...resultats.erreurs] }, null, 2),
    );
  } catch (e) {
    console.warn(`⚠ Rapport JSON non écrit (${e.message ?? e}).`);
  }

  console.log(`\n━━ Capture UI simple terminée ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`connecte   : ${connecte}`);
  console.log(`pages      : ${PAGES.length}`);
  console.log(`variantes  : ${VARIANTES.length}`);
  console.log(`viewports  : ${VIEWPORTS.length}`);
  console.log(`attendues  : ${attendues}`);
  console.log(`ok         : ${resultats.ok.length}`);
  console.log(`erreurs    : ${resultats.erreurs.length}`);
  for (const r of resultats.erreurs) console.log(`  ❌ ${r.variante}/${r.viewport} ${r.chemin} — ${r.erreur}`);
  console.log(`redirigees : ${resultats.redirigees.length}`);
  for (const r of resultats.redirigees) console.log(`  ↪ ${r.variante}/${r.viewport} ${r.chemin} → ${r.url_finale}`);
  console.log(`dossier    : ${DOSSIER}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Sortie non-zéro si des pages protégées ont échoué/redirigé, pour signaler
  // clairement un problème sans empêcher la génération des captures obtenues.
  if (resultats.erreurs.length > 0 || resultats.redirigees.length > 0) {
    process.exitCode = 1;
  }
}

// ── Entrée ────────────────────────────────────────────────────────────────────

(estModeAuth() ? modeAuth() : modeCapture()).catch((e) => {
  console.error("❌ Erreur fatale :", e.message ?? e);
  process.exit(1);
});
