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
// Authentification : mécanisme partagé et robuste de scripts/captures-auth.mjs
// (mêmes fonctions que captures:ui-variants). Résolution des identifiants avec
// priorité CAPTURES_TEST_EMAIL/PASSWORD puis TEST_EMAIL/PASSWORD.
//
// Variables d'environnement :
//   PARENT_PREUVE_CAPTURE_URL   URL de base (défaut : http://localhost:3000)
//   CAPTURES_TEST_EMAIL / CAPTURES_TEST_PASSWORD  Compte dédié captures (priorité)
//   TEST_EMAIL / TEST_PASSWORD                    Compte de test générique (fallback)
//
// Si aucun identifiant n'est fourni (ou si la connexion échoue), le script
// capture quand même les pages accessibles et journalise celles qui ont
// redirigé (ex. vers /connexion). Une page en erreur n'interrompt jamais le
// reste des captures.

import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import {
  chargerEnv,
  etablirSession,
  resoudreIdentifiants,
  attendreContenuStable,
  classifierEtatPage,
} from "./captures-auth.mjs";

chargerEnv();

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

async function capturerPage(page, viewport, chemin, nomFichier, resultats) {
  const url = `${BASE_URL}${chemin}`;
  const cible = `${viewport.nom}_${nomFichier}.png`;

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Attendre un contenu stable (fin de « Chargement… » / redirection tranchée)
    // avant de classifier et capturer : évite les captures d'écran transitoire.
    await attendreContenuStable(page, 20000);
    await page.addStyleTag({ content: CSS_SANS_ANIMATION }).catch(() => {});

    // Diagnostic d'état : ok / chargement / connexion.
    const { etat, urlFinale } = await classifierEtatPage(page);

    await page.screenshot({ path: `${DOSSIER}/${cible}`, fullPage: true });

    if (etat === "ok") {
      resultats.ok.push({ chemin, viewport: viewport.nom, fichier: cible });
      console.log(`✅ ${viewport.nom} ${chemin} -> ${cible}`);
    } else if (etat === "connexion") {
      resultats.redirigees.push({ chemin, viewport: viewport.nom, vers: urlFinale });
      console.warn(`↪ ${viewport.nom} ${chemin} -> redirigée vers ${urlFinale} (capturée quand même)`);
    } else {
      // "chargement" : capture invalide (contenu non stabilisé).
      resultats.erreurs.push({
        chemin,
        viewport: viewport.nom,
        erreur: "Page bloquée sur « Chargement… » après attente.",
      });
      console.error(`❌ ${viewport.nom} ${chemin} -> bloquée sur Chargement`);
    }
  } catch (e) {
    resultats.erreurs.push({ chemin, viewport: viewport.nom, erreur: e.message ?? String(e) });
    console.error(`❌ ${viewport.nom} ${chemin} -> ${e.message ?? e}`);
  }
}

async function main() {
  console.log(`Captures UI — base ${BASE_URL}, dossier ${DOSSIER}`);

  const navigateur = await chromium.launch();
  const resultats = { ok: [], erreurs: [], redirigees: [], connecte: false, procedure_active: null };

  // Connexion (une fois, viewport desktop) via le helper robuste partagé, puis
  // réutilisation du storageState pour les contextes desktop et mobile.
  const { email, motDePasse, source } = resoudreIdentifiants();
  console.log(`Identifiants : ${source ?? "AUCUN"}${email ? ` (${email})` : ""}`);

  let storageState;
  const contexteAuth = await navigateur.newContext({
    viewport: { width: VIEWPORTS[0].width, height: VIEWPORTS[0].height },
  });
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
    // Best-effort : sans session, on capture quand même les pages publiques et
    // on journalise les redirections (comportement historique de cet outil).
    console.warn(`⚠ Connexion impossible (${e.message ?? e}). Capture sans session.`);
  }
  await contexteAuth.close();

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

  await navigateur.close();

  console.log("\n— Résumé —");
  console.log(`Connecté   : ${resultats.connecte ? "oui" : "non"}`);
  console.log(`OK         : ${resultats.ok.length}`);
  console.log(`Redirigées : ${resultats.redirigees.length}`);
  for (const r of resultats.redirigees) {
    console.log(`  - ${r.viewport} ${r.chemin} -> ${r.vers}`);
  }
  console.log(`Erreurs    : ${resultats.erreurs.length}`);
  for (const r of resultats.erreurs) {
    console.log(`  - ${r.viewport} ${r.chemin} : ${r.erreur}`);
  }
  console.log(`Dossier    : ${DOSSIER}/`);

  // Petit rapport texte pour relecture rapide. captures-ui/ est ignoré par
  // git : ce fichier n'est jamais commité, comme les images du dossier.
  try {
    writeFileSync(
      `${DOSSIER}/rapport.json`,
      JSON.stringify(
        {
          base: BASE_URL,
          label: LABEL,
          date: DATE,
          connecte: resultats.connecte,
          procedure_active: resultats.procedure_active,
          ok: resultats.ok,
          redirigees: resultats.redirigees,
          erreurs: resultats.erreurs,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    console.warn(`⚠ Rapport JSON non écrit (${e.message ?? e}).`);
  }
}

main().catch((e) => {
  console.error("❌ Erreur fatale :", e.message ?? e);
  process.exit(1);
});
