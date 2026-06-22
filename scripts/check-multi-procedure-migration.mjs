import fs from "node:fs";

const chemin = "supabase/migrations/009_cloisonnement_donnees_metier.sql";
const source = fs.readFileSync(chemin, "utf8");
const erreurs = [];

const tables = ["events", "expenses", "documents", "preuves_photo"];

for (const table of tables) {
  if (!source.includes(`alter table public.${table}`)) {
    erreurs.push(`${table} n'est pas couvert par la migration 009.`);
  }
  if (!source.includes(`${table}_user_procedure_idx`)) {
    erreurs.push(`${table} n'a pas d'index user_id/procedure_id.`);
  }
  if (!source.includes(`${table}_procedure_owner_fk`)) {
    erreurs.push(`${table} n'a pas de contrainte procédure/propriétaire.`);
  }
}

const marqueursObligatoires = [
  "add column if not exists procedure_id uuid",
  "having count(distinct procedure_id) = 1",
  "having count(*) = 1",
  "children_id_procedure_user_unique",
  "documents_id_procedure_user_unique",
  "events_child_procedure_owner_fk",
  "expenses_child_procedure_owner_fk",
  "documents_child_procedure_owner_fk",
  "preuves_photo_child_procedure_owner_fk",
  "events_document_procedure_owner_fk",
  "expenses_document_procedure_owner_fk",
  "on delete restrict",
];

for (const marqueur of marqueursObligatoires) {
  if (!source.includes(marqueur)) {
    erreurs.push(`Marqueur de sécurité absent : ${marqueur}`);
  }
}

const sourceSansCommentaires = source
  .split("\n")
  .filter((ligne) => !ligne.trimStart().startsWith("--"))
  .join("\n")
  .toLowerCase();

const operationsInterdites = [
  " set not null",
  "delete from",
  "drop table",
  "drop column",
  "truncate ",
];

for (const operation of operationsInterdites) {
  if (sourceSansCommentaires.includes(operation)) {
    erreurs.push(`Opération destructive interdite dans le bloc 3 : ${operation.trim()}`);
  }
}

if (erreurs.length > 0) {
  console.error("❌ Migration multi-procédures invalide :\n");
  for (const erreur of erreurs) console.error(`- ${erreur}`);
  process.exit(1);
}

console.log("✅ Migration multi-procédures additive vérifiée.");
