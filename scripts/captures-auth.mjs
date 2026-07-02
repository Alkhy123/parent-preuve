// scripts/captures-auth.mjs
//
// Fonctions d'authentification Playwright partagées par les scripts de captures.
// Résolution des identifiants avec priorité :
//   1. CAPTURES_TEST_EMAIL / CAPTURES_TEST_PASSWORD (compte dédié aux captures)
//   2. TEST_EMAIL / TEST_PASSWORD (compte de test générique)
//
// Ne jamais afficher le mot de passe dans les logs.
// Ne jamais hardcoder d'identifiants.

const TIMEOUT_SIGNAL_CONNEXION = 14000;

/**
 * Résout les identifiants de test depuis les variables d'environnement.
 * Priorité : CAPTURES_TEST_* > TEST_*.
 * Retourne { email, motDePasse } ou { email: null, motDePasse: null }.
 */
export function resoudreIdentifiants() {
  const email =
    process.env.CAPTURES_TEST_EMAIL?.trim() ||
    process.env.TEST_EMAIL?.trim() ||
    null;
  const motDePasse =
    process.env.CAPTURES_TEST_PASSWORD?.trim() ||
    process.env.TEST_PASSWORD?.trim() ||
    null;

  if (email) {
    const source =
      process.env.CAPTURES_TEST_EMAIL?.trim()
        ? "CAPTURES_TEST_EMAIL"
        : "TEST_EMAIL";
    console.log(`  Identifiant résolu depuis ${source} : ${email}`);
  }

  return { email, motDePasse };
}

/**
 * Attend un signal de connexion réussie (sans se limiter à un seul indicateur).
 * Retourne le signal détecté ou null si timeout.
 */
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
        .then(() => "bouton-deconnexion"),
      page
        .getByPlaceholder("Adresse e-mail")
        .waitFor({ state: "hidden", timeout: TIMEOUT_SIGNAL_CONNEXION })
        .then(() => "formulaire-disparu"),
    ]);
  } catch {
    return null;
  }
}

/**
 * Tente de se connecter sur la page /connexion.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} baseUrl
 * @param {string} email
 * @param {string} motDePasse - jamais journalisé
 * @returns {Promise<boolean>} true si connexion établie
 */
export async function seConnecter(page, baseUrl, email, motDePasse) {
  try {
    await page.goto(`${baseUrl}/connexion`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Remplir le formulaire.
    await page.getByPlaceholder("Adresse e-mail").fill(email);
    await page.getByPlaceholder("Mot de passe").fill(motDePasse);
    await page.getByRole("button", { name: "Se connecter" }).click();

    let signal = await attendreSignalConnexion(page);

    if (!signal) {
      // Dernier recours : vérifier si /compte est accessible.
      await page
        .goto(`${baseUrl}/compte`, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        })
        .catch(() => {});
      await page
        .waitForLoadState("networkidle", { timeout: 6000 })
        .catch(() => {});
      if (new URL(page.url()).pathname !== "/connexion") {
        signal = "page-protegee-accessible";
      }
    }

    if (!signal) {
      console.warn(
        "⚠ Connexion échouée : aucun signal de session active (URL, bouton, formulaire).",
      );
      return false;
    }

    // Modale RGPD éventuelle (première connexion d'un compte neuf).
    await page.goto(`${baseUrl}/`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    try {
      await page
        .getByRole("button", { name: "J'ai lu et j'accepte" })
        .click({ timeout: 6000 });
    } catch {
      // Déjà acceptée ou non affichée : on continue.
    }

    console.log(`✅ Connecté en tant que ${email} (signal : ${signal}).`);
    return true;
  } catch (e) {
    console.warn(`⚠ Erreur pendant la connexion : ${e.message ?? e}`);
    return false;
  }
}

/**
 * Vérifie qu'une page protégée est bien accessible (non redirigée vers /connexion).
 * À appeler après seConnecter() pour confirmer que la session est active.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} baseUrl
 * @returns {Promise<boolean>}
 */
export async function verifierSessionActive(page, baseUrl) {
  try {
    await page.goto(`${baseUrl}/journal`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
    const url = new URL(page.url());
    const ok = url.pathname !== "/connexion" && !url.pathname.includes("connexion");
    if (!ok) {
      console.warn(
        "⚠ Vérification de session : /journal redirige encore vers /connexion.",
      );
    }
    return ok;
  } catch (e) {
    console.warn(`⚠ Vérification de session impossible : ${e.message ?? e}`);
    return false;
  }
}

/**
 * Établit la connexion et récupère le storageState Playwright.
 * Lance une erreur explicite si la connexion est requise mais échoue.
 *
 * @param {object} options
 * @param {import("@playwright/test").BrowserContext} options.contexte
 * @param {string} options.baseUrl
 * @param {string|null} options.email
 * @param {string|null} options.motDePasse
 * @returns {Promise<{ connecte: boolean, storageState: object|undefined, procedureActive: string|null }>}
 */
export async function etablirSession({ contexte, baseUrl, email, motDePasse }) {
  if (!email || !motDePasse) {
    console.warn(
      "⚠ Aucun identifiant fourni. Les pages protégées seront capturées\n" +
      "  en redirection vers /connexion.\n" +
      "  → Définir CAPTURES_TEST_EMAIL + CAPTURES_TEST_PASSWORD dans .env.local.",
    );
    return { connecte: false, storageState: undefined, procedureActive: null };
  }

  const page = await contexte.newPage();
  const connecte = await seConnecter(page, baseUrl, email, motDePasse);

  if (!connecte) {
    await page.close();
    throw new Error(
      "Connexion échouée avec les identifiants fournis.\n" +
      "Vérifiez que le compte existe et que le mot de passe est correct.",
    );
  }

  // Vérification sur une page protégée.
  const sessionValide = await verifierSessionActive(page, baseUrl);
  if (!sessionValide) {
    await page.close();
    throw new Error(
      "Session invalide : /journal redirige vers /connexion après connexion.",
    );
  }

  const storageState = await contexte.storageState();

  // Procédure active (non critique).
  let procedureActive = null;
  try {
    procedureActive = await page.evaluate(() =>
      window.localStorage.getItem("parent-preuve-procedure-active"),
    );
  } catch {
    // Non bloquant.
  }

  await page.close();
  return { connecte: true, storageState, procedureActive };
}
