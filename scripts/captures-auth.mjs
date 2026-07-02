// scripts/captures-auth.mjs
//
// Fonctions d'authentification Playwright PARTAGÉES par les scripts de captures
// (captures-ui-variants, captures-ui-secondary-variants) et par le diagnostic
// captures-auth-check. Une seule logique d'auth pour tous, pas de duplication.
//
// Résolution des identifiants avec priorité :
//   1. CAPTURES_TEST_EMAIL / CAPTURES_TEST_PASSWORD (compte dédié aux captures)
//   2. TEST_EMAIL / TEST_PASSWORD (compte de test générique)
//
// Détection de session : le signal principal est le token Supabase écrit en
// localStorage (sb-<ref>-auth-token). C'est le seul signal fiable sur cette
// application, car la page /connexion NE REDIRIGE PAS après connexion : elle
// affiche une vue « connecté » en restant sur /connexion. Se reposer uniquement
// sur un changement d'URL produit donc un faux « échec ».
//
// Ne jamais afficher le mot de passe dans les logs. Ne jamais hardcoder d'identifiants.

import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const TIMEOUT_SIGNAL_CONNEXION = 15000;
const TIMEOUT_CHAMP = 8000;
// Généreux : en `next dev`, la 1re ouverture d'une page protégée déclenche une
// compilation à la demande (lente), à laquelle s'ajoute la validation réseau
// de session côté client (GardeAcces → supabase.auth.getUser()).
const TIMEOUT_PAGE_PROTEGEE = 25000;

// Textes transitoires affichés par GardeAcces tant que la session n'est pas tranchée.
const TEXTES_TRANSITOIRES = [
  "Chargement…",
  "Chargement...",
  "Redirection…",
  "Redirection...",
];

// ── Chargement des variables d'environnement (.env.local, .env, ...) ───────────

let envCharge = false;

/**
 * Charge .env.local (et .env, .env.development…) via @next/env, comme le fait
 * Next lui-même. Idempotent : ne recharge pas si déjà fait dans ce process.
 */
export function chargerEnv() {
  if (envCharge) return;
  loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });
  envCharge = true;
}

// ── Résolution des identifiants ────────────────────────────────────────────────

/**
 * Résout les identifiants de test depuis les variables d'environnement.
 * Priorité : CAPTURES_TEST_* > TEST_*.
 * @returns {{ email: string|null, motDePasse: string|null, source: string|null }}
 */
export function resoudreIdentifiants() {
  const emailCaptures = process.env.CAPTURES_TEST_EMAIL?.trim();
  const emailTest = process.env.TEST_EMAIL?.trim();
  const mdpCaptures = process.env.CAPTURES_TEST_PASSWORD?.trim();
  const mdpTest = process.env.TEST_PASSWORD?.trim();

  const email = emailCaptures || emailTest || null;
  const motDePasse = mdpCaptures || mdpTest || null;

  let source = null;
  if (emailCaptures) source = "CAPTURES_TEST_EMAIL / CAPTURES_TEST_PASSWORD";
  else if (emailTest) source = "TEST_EMAIL / TEST_PASSWORD (fallback)";

  return { email, motDePasse, source };
}

// ── Localisation robuste des champs du formulaire ──────────────────────────────

/**
 * Renvoie le premier locator visible parmi une liste de fabriques, ou null.
 * Chaque fabrique est une fonction () => Locator, essayée dans l'ordre.
 */
async function premierLocatorVisible(fabriques, timeout = TIMEOUT_CHAMP) {
  for (const fabrique of fabriques) {
    const loc = fabrique().first();
    try {
      await loc.waitFor({ state: "visible", timeout });
      return loc;
    } catch {
      // Candidat suivant.
    }
  }
  return null;
}

/**
 * Localise les champs email / mot de passe / bouton de soumission de /connexion
 * avec des sélecteurs robustes (labels accessibles, type, name, placeholder,
 * rôle). Ne dépend pas d'un seul texte fragile.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<{ email, password, submit }>} locators (ou null par champ)
 */
export async function localiserChamps(page) {
  // Le 1er champ visible suffit ; petit timeout pour ne pas cumuler les attentes.
  const t = 4000;

  const email = await premierLocatorVisible(
    [
      () => page.getByLabel(/adresse e-?mail|e-?mail|courriel/i),
      () => page.locator('input[type="email"]'),
      () => page.locator('input[name="email"]'),
      () => page.getByPlaceholder(/adresse e-?mail|e-?mail/i),
    ],
    t,
  );

  const password = await premierLocatorVisible(
    [
      () => page.getByLabel(/mot de passe|password/i),
      () => page.locator('input[type="password"]'),
      () => page.locator('input[name="password"]'),
      () => page.getByPlaceholder(/mot de passe/i),
    ],
    t,
  );

  const submit = await premierLocatorVisible(
    [
      () => page.getByRole("button", { name: "Se connecter", exact: true }),
      () => page.getByRole("button", { name: /^se connecter$/i }),
      () => page.locator('button[type="submit"]'),
      () => page.getByRole("button", { name: /se connecter|connexion/i }),
    ],
    t,
  );

  return { email, password, submit };
}

// ── Détection de session ────────────────────────────────────────────────────────

/**
 * Attend un signal fiable de session établie après soumission.
 * Signal principal : token Supabase en localStorage. Signaux secondaires :
 * bouton « Se déconnecter », disparition du champ mot de passe, changement d'URL.
 * @returns {Promise<string|null>} le signal détecté, ou null si timeout.
 */
async function attendreSessionEtablie(page, timeout = TIMEOUT_SIGNAL_CONNEXION) {
  try {
    return await Promise.any([
      page
        .waitForFunction(
          () =>
            Object.keys(window.localStorage).some(
              (k) =>
                /^sb-.*-auth-token$/.test(k) &&
                !!window.localStorage.getItem(k),
            ),
          null,
          { timeout },
        )
        .then(() => "token-supabase"),
      page
        .getByRole("button", { name: /se d[ée]connecter/i })
        .first()
        .waitFor({ timeout })
        .then(() => "bouton-deconnexion"),
      page
        .locator('input[type="password"]')
        .waitFor({ state: "hidden", timeout })
        .then(() => "formulaire-disparu"),
      page
        .waitForURL((url) => url.pathname !== "/connexion", { timeout })
        .then(() => "url"),
    ]);
  } catch {
    return null;
  }
}

/**
 * Lit un message d'erreur éventuellement affiché sur la page (« Erreur : … »).
 * @returns {Promise<string|null>}
 */
export async function lireMessageErreurPage(page) {
  try {
    const p = page.locator("p", { hasText: /erreur/i }).first();
    if ((await p.count()) > 0) {
      const texte = (await p.innerText()).trim();
      if (texte) return texte;
    }
  } catch {
    // Non bloquant.
  }
  return null;
}

/**
 * Compte les clés localStorage Supabase (sb-*-auth-token) sans exposer de token.
 * @returns {Promise<number>}
 */
export async function compterClesSupabase(page) {
  try {
    return await page.evaluate(() =>
      Object.keys(window.localStorage).filter((k) => /^sb-/.test(k)).length,
    );
  } catch {
    return 0;
  }
}

/**
 * Indique si le texte visible de la page contient un motif (regex).
 * @returns {Promise<boolean>}
 */
export async function pageContientTexte(page, motif) {
  try {
    const t = await page.evaluate(() => document.body?.innerText ?? "");
    return motif.test(t);
  } catch {
    return false;
  }
}

// ── Connexion ────────────────────────────────────────────────────────────────

/**
 * Tente de se connecter sur /connexion, avec diagnostic précis en cas d'échec.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} baseUrl
 * @param {string} email
 * @param {string} motDePasse - jamais journalisé
 * @param {object} [hooks] - callbacks optionnels pour instrumentation (captures)
 * @param {() => Promise<void>} [hooks.apresNavigation] - après ouverture de /connexion
 * @param {() => Promise<void>} [hooks.apresRemplissage] - après remplissage des champs
 * @param {() => Promise<void>} [hooks.apresSubmit] - après soumission + attente
 * @returns {Promise<{ ok, code, message, signal, urlApresSubmit, messagePage }>}
 */
export async function seConnecter(page, baseUrl, email, motDePasse, hooks = {}) {
  const resultat = {
    ok: false,
    code: null,
    message: "",
    signal: null,
    urlApresSubmit: null,
    messagePage: null,
  };

  // 1. Navigation.
  try {
    await page.goto(`${baseUrl}/connexion`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
  } catch (e) {
    resultat.code = "NAVIGATION_CONNEXION";
    resultat.message = `Impossible d'ouvrir /connexion : ${e.message ?? e}`;
    return resultat;
  }
  if (hooks.apresNavigation) await hooks.apresNavigation();

  // 2. Localisation des champs.
  const { email: champEmail, password: champMdp, submit } =
    await localiserChamps(page);

  if (!champEmail) {
    resultat.code = "CHAMP_EMAIL_INTROUVABLE";
    resultat.message =
      "Champ e-mail introuvable sur /connexion (label, input[type=email], name=email, placeholder).";
    return resultat;
  }
  if (!champMdp) {
    resultat.code = "CHAMP_MOTDEPASSE_INTROUVABLE";
    resultat.message =
      "Champ mot de passe introuvable sur /connexion (label, input[type=password], name=password, placeholder).";
    return resultat;
  }

  // 3. Remplissage.
  try {
    await champEmail.fill(email);
    await champMdp.fill(motDePasse);
  } catch (e) {
    resultat.code = "REMPLISSAGE_ECHOUE";
    resultat.message = `Remplissage des champs impossible : ${e.message ?? e}`;
    return resultat;
  }
  if (hooks.apresRemplissage) await hooks.apresRemplissage();

  if (!submit) {
    resultat.code = "BOUTON_SUBMIT_INTROUVABLE";
    resultat.message =
      "Bouton de soumission introuvable sur /connexion (rôle button « Se connecter », button[type=submit]).";
    return resultat;
  }

  // 4. Soumission.
  try {
    await submit.click();
  } catch (e) {
    resultat.code = "CLIC_SUBMIT_ECHOUE";
    resultat.message = `Clic sur le bouton de connexion impossible : ${e.message ?? e}`;
    return resultat;
  }

  // 5. Attente d'un signal de session.
  const signal = await attendreSessionEtablie(page);
  resultat.urlApresSubmit = page.url();
  resultat.messagePage = await lireMessageErreurPage(page);

  if (hooks.apresSubmit) await hooks.apresSubmit();

  if (!signal) {
    if (resultat.messagePage) {
      resultat.code = "MESSAGE_ERREUR_PAGE";
      resultat.message = `La page affiche un message d'erreur : ${resultat.messagePage}`;
    } else if (new URL(resultat.urlApresSubmit).pathname === "/connexion") {
      resultat.code = "URL_RESTE_CONNEXION";
      resultat.message =
        "Formulaire rempli et soumis, mais aucune session détectée (aucun token Supabase, URL reste /connexion). " +
        "Vérifier que le compte existe, que l'e-mail est confirmé et que le mot de passe est correct.";
    } else {
      resultat.code = "SESSION_NON_DETECTEE";
      resultat.message =
        "Aucun signal de session active après soumission (token, bouton, formulaire, URL) — timeout.";
    }
    return resultat;
  }

  resultat.ok = true;
  resultat.signal = signal;
  resultat.message = `Connecté en tant que ${email} (signal : ${signal}).`;
  return resultat;
}

// ── Vérification d'une page protégée ───────────────────────────────────────────

/**
 * Lit l'état courant d'une page protégée sans attendre :
 *   "connexion"   → redirigée vers /connexion (session absente/invalide) ;
 *   "chargement"  → GardeAcces bloqué sur « Chargement… » / « Redirection… »
 *                   (getUser() côté client non résolu) ;
 *   "accessible"  → contenu métier rendu (session exploitable).
 */
async function lireEtatProtege(page) {
  if (new URL(page.url()).pathname === "/connexion") return "connexion";
  try {
    const enChargement = await page.evaluate((textes) => {
      const t = (document.body?.innerText ?? "").trim();
      // Écran transitoire = page quasi vide contenant un texte de chargement.
      return textes.some((x) => t.includes(x)) && t.length < 400;
    }, TEXTES_TRANSITOIRES);
    return enChargement ? "chargement" : "accessible";
  } catch {
    return "chargement";
  }
}

/**
 * Ouvre une page protégée et attend un état STABLE et exploitable.
 * GardeAcces affiche « Chargement… » (getUser en cours) puis, si non connecté,
 * « Redirection… » avant de rediriger vers /connexion. On attend donc la sortie
 * de ces états transitoires (ou l'apparition du contenu métier) avant de lire
 * l'état — et un reload de secours débloque un getUser() lent ou une première
 * compilation `next dev`.
 *
 * @returns {Promise<{ etat: "accessible"|"connexion"|"chargement", url: string }>}
 */
export async function attendrePageProtegee(page, baseUrl, chemin = "/journal", options = {}) {
  const timeout = options.timeout ?? TIMEOUT_PAGE_PROTEGEE;
  const avecReload = options.avecReload ?? true;

  const attendreStabilite = async (budget) => {
    try {
      await Promise.race([
        page.waitForURL((url) => url.pathname === "/connexion", { timeout: budget }),
        page.waitForFunction(
          (textes) => {
            if (location.pathname === "/connexion") return true;
            const t = (document.body?.innerText ?? "").trim();
            const enChargement = textes.some((x) => t.includes(x)) && t.length < 400;
            return !enChargement && t.length > 0;
          },
          TEXTES_TRANSITOIRES,
          { timeout: budget },
        ),
      ]);
    } catch {
      // Timeout : l'état sera lu ci-dessous.
    }
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  };

  try {
    await page.goto(`${baseUrl}${chemin}`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
  } catch {
    return { etat: "chargement", url: page.url() };
  }

  await attendreStabilite(timeout);
  let etat = await lireEtatProtege(page);

  // Un reload peut débloquer un getUser() lent ou une 1re compilation dev.
  if (etat === "chargement" && avecReload) {
    await page
      .reload({ waitUntil: "domcontentloaded", timeout: 45000 })
      .catch(() => {});
    await attendreStabilite(Math.min(timeout, 15000));
    etat = await lireEtatProtege(page);
  }

  return { etat, url: page.url() };
}

/**
 * Compat : true si la page protégée est accessible (ni /connexion ni bloquée).
 * @returns {Promise<boolean>}
 */
export async function pageProtegeeAccessible(page, baseUrl, chemin = "/journal") {
  const { etat } = await attendrePageProtegee(page, baseUrl, chemin);
  return etat === "accessible";
}

/**
 * Attend, sur la page COURANTE (déjà naviguée), que les états transitoires
 * (« Chargement… » / « Redirection… ») disparaissent et qu'un contenu réel soit
 * rendu — ou qu'une redirection vers /connexion soit tranchée.
 */
export async function attendreContenuStable(page, timeout = TIMEOUT_PAGE_PROTEGEE) {
  try {
    await page.waitForFunction(
      (textes) => {
        if (location.pathname === "/connexion") return true;
        const t = (document.body?.innerText ?? "").trim();
        const enChargement = textes.some((x) => t.includes(x)) && t.length < 400;
        return !enChargement && t.length > 0;
      },
      TEXTES_TRANSITOIRES,
      { timeout },
    );
  } catch {
    // Timeout : l'état sera classifié par classifierEtatPage().
  }
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
}

/**
 * Classe l'état visible de la page COURANTE d'une capture :
 *   "connexion"  → URL /connexion ou formulaire de connexion visible ;
 *   "chargement" → écran transitoire « Chargement… » / « Redirection… » ;
 *   "ok"         → contenu réel rendu.
 * @returns {Promise<{ etat, urlFinale, texteChargementPresent, formulaireConnexionVisible }>}
 */
export async function classifierEtatPage(page) {
  const urlFinale = page.url();
  const pathname = new URL(urlFinale).pathname;

  let texteChargementPresent = false;
  try {
    texteChargementPresent = await page.evaluate((textes) => {
      const t = (document.body?.innerText ?? "").trim();
      return textes.some((x) => t.includes(x)) && t.length < 400;
    }, TEXTES_TRANSITOIRES);
  } catch {
    // Non bloquant.
  }

  let formulaireConnexionVisible = false;
  try {
    formulaireConnexionVisible = await page
      .locator('input[type="password"]')
      .first()
      .isVisible();
  } catch {
    // Non bloquant.
  }

  let etat;
  if (pathname.includes("/connexion") || formulaireConnexionVisible) {
    etat = "connexion";
  } else if (texteChargementPresent) {
    etat = "chargement";
  } else {
    etat = "ok";
  }

  return { etat, urlFinale, texteChargementPresent, formulaireConnexionVisible };
}

/**
 * Vérifie qu'une session est active en contrôlant l'accès à /journal.
 * @returns {Promise<boolean>}
 */
export async function verifierSessionActive(page, baseUrl) {
  const { etat } = await attendrePageProtegee(page, baseUrl, "/journal");
  if (etat !== "accessible") {
    console.warn(
      `⚠ Vérification de session : /journal → état « ${etat} ».`,
    );
  }
  return etat === "accessible";
}

// ── Acceptation RGPD (best-effort) ─────────────────────────────────────────────

/**
 * Accepte la modale RGPD si elle est affichée (compte neuf). Best-effort :
 * l'acceptation est enregistrée côté compte, donc réutilisable via storageState.
 */
async function accepterRgpdSiPresente(page, baseUrl) {
  try {
    await page.goto(`${baseUrl}/`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page
      .getByRole("button", { name: "J'ai lu et j'accepte" })
      .click({ timeout: 6000 });
  } catch {
    // Déjà acceptée ou non affichée : on continue.
  }
}

// ── Établissement de session (idempotent) ──────────────────────────────────────

/**
 * Établit une session utilisable et récupère le storageState Playwright.
 * Idempotent : si /journal est déjà accessible dans le contexte fourni, on ne
 * repasse pas par le formulaire. Sinon, on se connecte puis on revérifie.
 * Lance une erreur explicite (message précis) si la connexion échoue.
 *
 * @param {object} options
 * @param {import("@playwright/test").BrowserContext} options.contexte
 * @param {string} options.baseUrl
 * @param {string|null} options.email
 * @param {string|null} options.motDePasse
 * @returns {Promise<{ connecte: boolean, storageState: object, procedureActive: string|null }>}
 */
export async function etablirSession({ contexte, baseUrl, email, motDePasse }) {
  if (!email || !motDePasse) {
    throw new Error(
      "Variables d'identifiants absentes.\n" +
        "Ces scripts capturent des pages protégées : sans session, ils produiraient\n" +
        "des captures invalides de /connexion.\n\n" +
        "→ Ajouter dans .env.local :\n" +
        "    CAPTURES_TEST_EMAIL=votre-compte@example.com\n" +
        "    CAPTURES_TEST_PASSWORD=votre-mot-de-passe\n\n" +
        "  ou, en fallback :\n" +
        "    TEST_EMAIL=...\n" +
        "    TEST_PASSWORD=...",
    );
  }

  const page = await contexte.newPage();

  try {
    // 1. Session déjà active dans ce contexte ? (idempotence)
    //    Le contrôle se fait dans LE MÊME contexte que la connexion (pas de
    //    storageState extrait trop tôt puis rouvert dans un contexte incomplet).
    const dejaConnecte = await pageProtegeeAccessible(page, baseUrl, "/journal");

    if (!dejaConnecte) {
      // 2. Connexion via le formulaire.
      const res = await seConnecter(page, baseUrl, email, motDePasse);
      if (!res.ok) {
        throw new Error(`Connexion échouée [${res.code}] : ${res.message}`);
      }

      // 3. Laisser Supabase persister la session (token déjà détecté, court délai
      //    de sécurité avant de naviguer vers une page protégée).
      await page.waitForTimeout(800);

      // 4. Acceptation RGPD éventuelle (compte neuf).
      await accepterRgpdSiPresente(page, baseUrl);

      // 5. Revérification stricte sur page protégée, avec états distincts.
      const { etat } = await attendrePageProtegee(page, baseUrl, "/journal");
      if (etat === "connexion") {
        throw new Error(
          "Session invalide : /journal redirige vers /connexion après connexion.",
        );
      }
      if (etat !== "accessible") {
        throw new Error(
          "Session créée mais page protégée bloquée sur Chargement " +
            "(getUser() côté client non résolu après attente et reload).",
        );
      }
    }

    // 5. Récupération du storageState réutilisable par les scripts.
    const storageState = await contexte.storageState();
    if (!storageState?.origins?.length && !storageState?.cookies?.length) {
      throw new Error(
        "storageState vide après connexion : la session n'a pas été persistée.",
      );
    }

    // 6. Procédure active (non critique).
    let procedureActive = null;
    try {
      procedureActive = await page.evaluate(() =>
        window.localStorage.getItem("parent-preuve-procedure-active"),
      );
    } catch {
      // Non bloquant.
    }

    return { connecte: true, storageState, procedureActive };
  } finally {
    await page.close().catch(() => {});
  }
}
