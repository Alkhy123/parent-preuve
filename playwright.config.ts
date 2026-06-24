// playwright.config.ts
//
// Tests end-to-end qui pilotent l'APPLICATION DÉPLOYÉE (Vercel) avec un compte
// de test dédié. Sert à remplir automatiquement le dossier pour les tests
// manuels (scénario 2 procédures, cloisonnement...).
//
// Prérequis : voir tests-e2e/README.md
//   1) npm i -D @playwright/test && npm run e2e:install
//   2) variables d'env TEST_EMAIL / TEST_PASSWORD (compte de test confirmé,
//      créé via `npm run e2e:compte`)
//   3) npm run test:e2e
//
// L'URL cible vient de PARENT_PREUVE_URL (défaut : l'app Vercel de prod).

import { defineConfig, devices } from "@playwright/test";

const BASE_URL =
  process.env.PARENT_PREUVE_URL ?? "https://parent-preuve.vercel.app";

export default defineConfig({
  testDir: "./tests-e2e",
  // Un seul worker : le seed est séquentiel (création procédures puis données).
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // 1) Authentification : se connecte une fois et sauvegarde la session.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    // 2) Seed : réutilise la session enregistrée.
    {
      name: "seed",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
