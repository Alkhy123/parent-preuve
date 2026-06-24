// tests-e2e/auth.setup.ts
//
// Se connecte à l'application déployée avec le compte de test (TEST_EMAIL /
// TEST_PASSWORD) et sauvegarde la session pour les autres tests.
//
// L'authentification Parent Preuve est entièrement côté navigateur (session
// Supabase en localStorage) : storageState capture donc bien la session.

import { test as setup, expect } from "@playwright/test";

const fichierAuth = "playwright/.auth/user.json";

setup("se connecter", async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const motDePasse = process.env.TEST_PASSWORD;

  if (!email || !motDePasse) {
    throw new Error(
      "Définissez TEST_EMAIL et TEST_PASSWORD (compte de test confirmé). " +
        "Créez-le d'abord avec `npm run e2e:compte`."
    );
  }

  await page.goto("/connexion");
  await page.getByPlaceholder("Adresse e-mail").fill(email);
  await page.getByPlaceholder("Mot de passe").fill(motDePasse);
  await page.getByRole("button", { name: "Se connecter" }).click();

  // La page de connexion affiche « Vous êtes connecté » une fois la session ouverte.
  await expect(page.getByText("Vous êtes connecté")).toBeVisible();

  await page.context().storageState({ path: fichierAuth });
});
