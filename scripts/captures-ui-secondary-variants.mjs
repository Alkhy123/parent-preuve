// scripts/captures-ui-secondary-variants.mjs
//
// Capture des 4 pages secondaires (/journal, /frais, /documents, /preuves)
// dans les 4 combinaisons de préférences UI × 2 viewports = 32 images.
//
// Combinaisons :
//   board10      + guided
//   board10      + comfort
//   vue-ensemble + guided
//   vue-ensemble + comfort
//
// Viewports : desktop 1440×900, mobile 390×844.
//
// Usage :
//   npm run dev                    # dans un autre terminal
//   npm run captures:ui-secondary
//
// Variables d'environnement (.env.local) :
//   PARENT_PREUVE_CAPTURE_URL        URL de base (défaut : http://localhost:3000)
//   CAPTURES_TEST_EMAIL              Compte dédié captures (priorité 1)
//   CAPTURES_TEST_PASSWORD           Mot de passe du compte dédié (priorité 1)
//   TEST_EMAIL                       Compte de test générique (fallback)
//   TEST_PASSWORD                    Mot de passe générique (fallback)
//
// Sortie :
//   captures-ui/<AAAA-MM-JJ>_secondary-ui-variants/
//     *.png      (32 captures)
//     rapport.json
//
// Aucune écriture en base. captures-ui/ est ignoré par git.

import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { chromium } from "@playwright/test";
import {
  chargerEnv,
  etablirSession,
  resoudreIdentifiants,
  attendreContenuStable,
  classifierEtatPage,
} from "./captures-auth.mjs";

chargerEnv();

// ── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL = (
  process.env.PARENT_PREUVE_CAPTURE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const DATE = new Date().toISOString().slice(0, 10);
const DOSSIER = `captures-ui/${DATE}_secondary-ui-variants`;

// Clé localStorage telle que définie dans lib/ui-preferences/storage.ts.
const CLE_UI_PREFERENCES = "parent-preuve-ui-preferences";

const COMBINAISONS = [
  { comfortMode: "guided",  interfaceStyle: "board10" },
  { comfortMode: "comfort", interfaceStyle: "board10" },
  { comfortMode: "guided",  interfaceStyle: "vue-ensemble" },
  { comfortMode: "comfort", interfaceStyle: "vue-ensemble" },
];

// Pages secondaires modifiées au Lot 5.
const PAGES = [
  { chemin: "/journal",   nom: "journal" },
  { chemin: "/frais",     nom: "frais" },
  { chemin: "/documents", nom: "documents" },
  { chemin: "/preuves",   nom: "preuves" },
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

// ── Capture d'une page ────────────────────────────────────────────────────────

async function capturerPage(page, viewport, page_def, combinaison, resultats) {
  const { comfortMode, interfaceStyle } = combinaison;
  const nomFichier = `${viewport.nom}_${page_def.nom}_${interfaceStyle}_${comfortMode}.png`;
  const cheminFichier = `${DOSSIER}/${nomFichier}`;
  const url = `${BASE_URL}${page_def.chemin}`;
  const debut = performance.now();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Attendre un contenu stable (fin de « Chargement… » / redirection tranchée).
    await attendreContenuStable(page, 20000);
    await page.addStyleTag({ content: CSS_SANS_ANIMATION }).catch(() => {});

    // Attendre que les préférences UI soient appliquées sur <html>.
    await page
      .waitForFunction(
        (style) =>
          document.documentElement.getAttribute("data-interface-style") === style,
        interfaceStyle,
        { timeout: 5000 },
      )
      .catch(() => {});

    // Diagnostic d'état : ok / chargement / connexion.
    const { etat, urlFinale, texteChargementPresent } =
      await classifierEtatPage(page);

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
      etat_page: etat,
      url_finale: urlFinale,
      texte_chargement_present: texteChargementPresent,
    };

    if (etat === "ok") {
      resultats.ok.push(entree);
      console.log(`✅ ${nomFichier} (${duree}ms)`);
    } else if (etat === "connexion") {
      entree.redirigee_vers = urlFinale;
      resultats.redirigees.push(entree);
      console.warn(
        `↪ ${viewport.nom} ${page_def.chemin} [${interfaceStyle}+${comfortMode}] → connexion (${urlFinale})`,
      );
    } else {
      // "chargement" : capture invalide, classée en erreur avec message clair.
      entree.erreur =
        "Page bloquée sur « Chargement… » après attente (session/contenu non stabilisé).";
      resultats.erreurs.push(entree);
      console.error(`❌ ${nomFichier} — bloquée sur Chargement`);
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
      duree_ms: duree,
      etat_page: "timeout",
      url_finale: page.url(),
      texte_chargement_present: false,
      erreur: e.message ?? String(e),
    });
    console.error(`❌ ${nomFichier} — ${e.message ?? e}`);
  }
}

// ── Script principal ──────────────────────────────────────────────────────────

async function main() {
  console.log(`\n▶ Captures UI Pages Secondaires — base : ${BASE_URL}`);
  console.log(`  Dossier de sortie : ${DOSSIER}/`);
  console.log(
    `  Captures attendues : ${COMBINAISONS.length} × ${PAGES.length} × ${VIEWPORTS.length} = ${COMBINAISONS.length * PAGES.length * VIEWPORTS.length}\n`,
  );

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

  // ── Résolution des identifiants + établissement de session ────────────────

  const { email, motDePasse, source } = resoudreIdentifiants();
  console.log(`  Identifiants       : ${source ?? "AUCUN"}${email ? ` (${email})` : ""}`);

  const contexteAuth = await navigateur.newContext({
    viewport: { width: VIEWPORTS[0].width, height: VIEWPORTS[0].height },
  });

  let storageState;
  try {
    const session = await etablirSession({
      contexte: contexteAuth,
      baseUrl: BASE_URL,
      email,
      motDePasse,
    });
    resultats.connecte = session.connecte;
    resultats.procedure_active = session.procedureActive;
    storageState = session.storageState;
  } catch (e) {
    await contexteAuth.close();
    await navigateur.close();
    // Écrire un rapport d'erreur avant de s'arrêter.
    resultats.erreurs.push({ erreur: e.message ?? String(e) });
    try {
      writeFileSync(`${DOSSIER}/rapport.json`, JSON.stringify(resultats, null, 2));
    } catch { /* non critique */ }
    console.error(`\n❌ Arrêt : ${e.message ?? e}`);
    console.error(
      "  → Vérifiez CAPTURES_TEST_EMAIL / CAPTURES_TEST_PASSWORD dans .env.local.",
    );
    process.exit(1);
  }
  await contexteAuth.close();

  // ── Boucle principale : combinaison × viewport ────────────────────────────

  for (const combinaison of COMBINAISONS) {
    const { comfortMode, interfaceStyle } = combinaison;
    console.log(
      `\n── Combinaison : ${interfaceStyle} + ${comfortMode} ──────────────────────`,
    );

    const prefsJSON = JSON.stringify({ comfortMode, interfaceStyle });

    for (const viewport of VIEWPORTS) {
      // Nouveau contexte par combinaison × viewport pour garantir l'isolation.
      const contexte = await navigateur.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
        storageState,
      });

      const page = await contexte.newPage();

      // Injecter les préférences UI AVANT chaque navigation (no-flash).
      await page.addInitScript(
        ({ cle, prefs }) => {
          try { window.localStorage.setItem(cle, prefs); } catch { /* silencieux */ }
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
  for (const r of resultats.redirigees) console.log(`  ↪ ${r.fichier} → ${r.redirigee_vers}`);
  console.log(`Erreurs            : ${resultats.erreurs.length}`);
  for (const r of resultats.erreurs) console.log(`  ❌ ${r.fichier ?? ""} — ${r.erreur}`);
  console.log(`Dossier de sortie  : ${DOSSIER}/`);

  // ── Rapport JSON ─────────────────────────────────────────────────────────

  try {
    writeFileSync(`${DOSSIER}/rapport.json`, JSON.stringify(resultats, null, 2));
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
