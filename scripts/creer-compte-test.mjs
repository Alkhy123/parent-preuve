// scripts/creer-compte-test.mjs
//
// Crée (ou supprime) le COMPTE DE TEST utilisé par les tests Playwright.
// Utilise la clé service_role (serveur uniquement, jamais NEXT_PUBLIC_).
//
//   node scripts/creer-compte-test.mjs            -> crée un compte CONFIRMÉ
//   node scripts/creer-compte-test.mjs --delete   -> supprime le compte + ses données
//
// Variables nécessaires (lues depuis .env.local ou l'environnement) :
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   TEST_EMAIL
//   TEST_PASSWORD   (requis seulement à la création)
//
// Le compte est créé email_confirm:true pour permettre la connexion directe.
// La suppression s'appuie sur la cascade (auth.users on delete cascade) : toutes
// les lignes de l'utilisateur partent. NB : d'éventuels fichiers Storage ajoutés
// manuellement (preuves/documents) ne sont PAS purgés par ce script.

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Petit chargeur .env.local (pas de dépendance dotenv).
function chargerEnvLocal() {
  if (!existsSync(".env.local")) return;
  const contenu = readFileSync(".env.local", "utf8");
  for (const ligne of contenu.split("\n")) {
    const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const cle = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[cle] === undefined) process.env[cle] = val;
  }
}

chargerEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;
const suppression = process.argv.includes("--delete");

if (!url || !serviceKey) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (.env.local)."
  );
  process.exit(1);
}
if (!email) {
  console.error("❌ TEST_EMAIL est requis.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Recherche l'utilisateur par email (listUsers paginé).
async function trouverUtilisateur(emailCible) {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const trouve = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === emailCible.toLowerCase()
    );
    if (trouve) return trouve;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  const existant = await trouverUtilisateur(email);

  if (suppression) {
    if (!existant) {
      console.log(`ℹ Aucun compte ${email} : rien à supprimer.`);
      return;
    }
    const { error } = await admin.auth.admin.deleteUser(existant.id);
    if (error) throw error;
    console.log(`✅ Compte de test supprimé (${email}) + données en cascade.`);
    return;
  }

  if (existant) {
    // Idempotent : on remet le mot de passe et on confirme l'email si besoin.
    if (!password) {
      console.log(`ℹ Compte ${email} déjà présent (mot de passe inchangé).`);
      return;
    }
    const { error } = await admin.auth.admin.updateUserById(existant.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log(`✅ Compte de test mis à jour (${email}).`);
    return;
  }

  if (!password) {
    console.error("❌ TEST_PASSWORD est requis pour créer le compte.");
    process.exit(1);
  }
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`✅ Compte de test créé et confirmé (${email}).`);
}

main().catch((e) => {
  console.error("❌ Erreur :", e.message ?? e);
  process.exit(1);
});
