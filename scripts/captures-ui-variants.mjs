// scripts/captures-ui-variants.mjs
//
// Capture des 4 pages principales (/, /collecter, /organiser, /exporter)
// dans les 4 combinaisons de préférences UI × 2 viewports = 32 images.
//
// Combinaisons :
//   board10    + guided
//   board10    + comfort
//   vue-ensemble + guided
//   vue-ensemble + comfort
//
// Viewports : desktop 1440×900, mobile 390×844.
//
// Usage :
//   npm run dev            # dans un autre terminal
//   npm run captures:ui-variants
//
// Variables d'environnement (.env.local) :
//   PARENT_PREUVE_CAPTURE_URL   URL de base (défaut : http://localhost:3000)
//   TEST_EMAIL / TEST_PASSWORD  Compte de test pour capturer les pages protégées.
//
// Sortie :
//   captures-ui/<AAAA-MM-JJ>_ui-variants/
//     *.png      (32 captures)
//     rapport.json
//
// Aucune écriture en base. captures-ui/ est ignoré par git.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { chromium } from "@playwright/test";

// ── Chargeur .env.local ───────────────────────────────────────────────────────

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

// ── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL = (
  process.env.PARENT_PREUVE_CAPTURE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const DATE = new Date().toISOString().slice(0, 10);
const DOSSIER = `captures-ui/${DATE}_ui-variants`;

// Clé localStorage telle que définie dans lib/ui-preferences/storage.ts.
const CLE_UI_PREFERENCES = "parent-preuve-ui-preferences";

const COMBINAISONS = [
  { comfortMode: "guided",  interfaceStyle: "board10" },
  { comfortMode: "comfort", interfaceStyle: "board10" },
  { comfortMode: "guided",  interfaceStyle: "vue-ensemble" },
  { comfortMode: "comfort", interfaceStyle: "vue-ensemble" },
];

const PAGES = [
  { chemin: "/",          nom: "home" },
  { chemin: "/collecter", nom: "collecter" },
  { chemin: "/organiser", nom: "organiser" },
  { chemin: "/exporter",  nom: "exporter" },
];

const VIEWPORTS = [
  { nom: "desktop", width: 1440, height: 900,  isMobile: false, hasTouch: false },
  { nom: "mobile",  width: 390,  height: 844,  isMobile: true,  hasTouch: true  },
];

// Coupe les animations pour des captures stables.
const CSS_SANS_ANIMATION = `
  *, *::before, *::after {
    animation-duration: 0.001s !important;
    animation-delay: 0s !important;
    transition-duration: 0.001s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`;

// ── Connexion (réutilisée de captures-ui.mjs) ─────────────────────────────────

const TIMEOUT_SIGNAL_CONNEXION = 12000;

async function attendreSignalConnexion(page) {
  try {
    return await Promise.any([
      page
        .waitForURL((url) => url.pathname !== "/connexion", {
          timeout: TIMEOUT_SIGNAL_CONNEXION,
        })
        .then(() => "url"),
      page
        .getByRole("button", { name: "Se deconnecter" })
        .waitFor({ timeout: TIMEOUT_SIGNAL_CONNEXION })
        .then(() => "session-active"),
      page
        .getByPlaceholder("Adresse e-mail")
        .waitFor({ state: "hidden", timeout: TIMEOUT_SIGNAL_CONNEXION })
        .then(() => "formulaire-disparu"),
    ]);
  } catch {
    return null;
  }
}

async function seConnecter(page) {
  const email = process.env.TEST_EMAIL;
  const motDePasse = process.env.TEST_PASSWORD;
  if (!email || !motDePasse) return false;

  try {
    await page.goto(`${BASE_URL}/connexion`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.getByPlaceholder("Adresse e-mail").fill(email);
    await page.getByPlaceholder("Mot de passe").fill(motDePasse);
    await page.getByRole("button", { name: "Se connecter" }).click();

    let signal = await attendreSignalConnexion(page);

    if (!signal) {
      await page
        .goto(`${BASE_URL}/compte`, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        })
        .catch(() => {});
      await page
        .waitForLoadState("networkidle", { timeout: 8000 })
        .catch(() => {});
      if (new URL(page.url()).pathname !== "/connexion") {
        signal = "page-protegee-accessible";
      }
    }

    if (!signal) {
      console.warn(
        "⚠ Connexion impossible : aucun signal de session active. Captures sans session.",
      );
      return false;
    }

    // Modale RGPD éventuelle.
    await page.goto(`${BASE_URL}/`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    try {
      await page
        .getByRole("button", { name: "J'ai lu et j'accepte" })
        .click({ timeout: 8000 });
    } catch {
      // Déjà acceptée ou non affichée.
    }

    console.log(`✅ Connecté en tant que ${email} (signal : ${signal}).`);
    return true;
  } catch (e) {
    console.warn(`⚠ Connexion impossible (${e.message ?? e}). Captures sans session.`);
    return false;
  }
}

// ── Capture d'une page ────────────────────────────────────────────────────────

async function capturerPage(page, viewport, page_def, combinaison, resultats) {
  const { comfortMode, interfaceStyle } = combinaison;
  const nomFichier = `${viewport.nom}_${page_def.nom}_${interfaceStyle}_${comfortMode}.png`;
  const cheminFichier = `${DOSSIER}/${nomFichier}`;
  const url = `${BASE_URL}${page_def.chemin}`;
  const debut = performance.now();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.addStyleTag({ content: CSS_SANS_ANIMATION }).catch(() => {});

    // Attendre que les préférences UI soient appliquées (useEffect du provider).
    // On vérifie la présence de data-interface-style sur <html>.
    await page
      .waitForFunction(
        (style) =>
          document.documentElement.getAttribute("data-interface-style") === style,
        interfaceStyle,
        { timeout: 5000 },
      )
      .catch(() => {
        // Si l'attribut n'est pas apparu, on capture quand même.
      });

    const urlFinale = page.url();
    const redirigee =
      !page_def.chemin.startsWith("/connexion") &&
      new URL(urlFinale).pathname !== page_def.chemin &&
      (urlFinale.includes("/connexion") || urlFinale.includes("/rgpd"));

    await page.screenshot({ path: cheminFichier, fullPage: true });

    const duree = Math.round(performance.now() - debut);

    const entree = {
      fichier: nomFichier,
      page: page_def.nom,
      chemin: page_def.chemin,
      viewport: viewport.nom,
      interfaceStyle,
      comfortMode,
      duree_ms: duree,
    };

    if (redirigee) {
      entree.redirigee_vers = urlFinale;
      resultats.redirigees.push(entree);
      console.warn(
        `↪ ${viewport.nom} ${page_def.chemin} [${interfaceStyle}+${comfortMode}] → redirigée (capturée quand même)`,
      );
    } else {
      resultats.ok.push(entree);
      console.log(
        `✅ ${nomFichier} (${duree}ms)`,
      );
    }
  } catch (e) {
    const duree = Math.round(performance.now() - debut);
    resultats.erreurs.push({
      fichier: nomFichier,
      page: page_def.nom,
      chemin: page_def.chemin,
      viewport: viewport.nom,
      interfaceStyle,
      comfortMode,
      erreur: e.message ?? String(e),
      duree_ms: duree,
    });
    console.error(
      `❌ ${nomFichier} — ${e.message ?? e}`,
    );
  }
}

// ── Script principal ──────────────────────────────────────────────────────────

async function main() {
  console.log(`\n▶ Captures UI Variantes — base : ${BASE_URL}`);
  console.log(`  Dossier de sortie : ${DOSSIER}/`);
  console.log(`  Captures attendues : ${COMBINAISONS.length} × ${PAGES.length} × ${VIEWPORTS.length} = ${COMBINAISONS.length * PAGES.length * VIEWPORTS.length}\n`);

  mkdirSync(DOSSIER, { recursive: true });

  const navigateur = await chromium.launch();
  const resultats = {
    date: DATE,
    base_url: BASE_URL,
    connecte: false,
    procedure_active: null,
    ok: [],
    redirigees: [],
    erreurs: [],
  };

  // ── Connexion (une fois) ──────────────────────────────────────────────────

  let storageState;
  const contexteAuth = await navigateur.newContext({
    viewport: { width: VIEWPORTS[0].width, height: VIEWPORTS[0].height },
  });
  const pageAuth = await contexteAuth.newPage();
  const connecte = await seConnecter(pageAuth);
  resultats.connecte = connecte;
  if (connecte) {
    storageState = await contexteAuth.storageState();
    // Tenter de récupérer une procédure active depuis le localStorage.
    try {
      const procId = await pageAuth.evaluate(() =>
        window.localStorage.getItem("parent-preuve-procedure-active"),
      );
      resultats.procedure_active = procId ?? null;
    } catch {
      // Non critique.
    }
  }
  await contexteAuth.close();

  if (!connecte) {
    console.warn(
      "⚠ Session non établie. Les pages protégées seront capturées en redirection vers /connexion.",
    );
  }

  // ── Boucle principale : combinaison × viewport ────────────────────────────

  for (const combinaison of COMBINAISONS) {
    const { comfortMode, interfaceStyle } = combinaison;
    console.log(
      `\n── Combinaison : ${interfaceStyle} + ${comfortMode} ──────────────────────`,
    );

    // Préférences à injecter dans localStorage avant chaque navigation.
    const prefsJSON = JSON.stringify({ comfortMode, interfaceStyle });

    for (const viewport of VIEWPORTS) {
      // Nouveau contexte par combinaison × viewport pour réinitialiser
      // proprement localStorage et garantir l'isolation des préférences.
      const contexte = await navigateur.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
        storageState,
      });

      const page = await contexte.newPage();

      // Injection des préférences UI AVANT chaque navigation (addInitScript
      // s'exécute avant tout script de la page, y compris le no-flash de
      // layout.tsx). Cela garantit que UiPreferencesProvider lit la bonne
      // valeur dès le premier rendu.
      await page.addInitScript(
        ({ cle, prefs }) => {
          try {
            window.localStorage.setItem(cle, prefs);
          } catch {
            // Silencieux si localStorage indisponible.
          }
        },
        { cle: CLE_UI_PREFERENCES, prefs: prefsJSON },
      );

      for (const page_def of PAGES) {
        await capturerPage(page, viewport, page_def, combinaison, resultats);
      }

      await contexte.close();
    }
  }

  await navigateur.close();

  // ── Résumé console ────────────────────────────────────────────────────────

  const total = resultats.ok.length + resultats.redirigees.length + resultats.erreurs.length;
  console.log(`\n━━ Résumé ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Connecté           : ${resultats.connecte ? "oui" : "non"}`);
  console.log(`Procédure active   : ${resultats.procedure_active ?? "inconnue"}`);
  console.log(`Captures OK        : ${resultats.ok.length} / ${total}`);
  console.log(`Redirigées         : ${resultats.redirigees.length}`);
  for (const r of resultats.redirigees) {
    console.log(`  ↪ ${r.fichier} → ${r.redirigee_vers}`);
  }
  console.log(`Erreurs            : ${resultats.erreurs.length}`);
  for (const r of resultats.erreurs) {
    console.log(`  ❌ ${r.fichier} — ${r.erreur}`);
  }
  console.log(`Dossier de sortie  : ${DOSSIER}/`);

  // ── Rapport JSON ─────────────────────────────────────────────────────────

  try {
    writeFileSync(
      `${DOSSIER}/rapport.json`,
      JSON.stringify(resultats, null, 2),
    );
    console.log(`Rapport JSON       : ${DOSSIER}/rapport.json`);
  } catch (e) {
    console.warn(`⚠ Rapport JSON non écrit (${e.message ?? e}).`);
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch((e) => {
  console.error("❌ Erreur fatale :", e.message ?? e);
  process.exit(1);
});
