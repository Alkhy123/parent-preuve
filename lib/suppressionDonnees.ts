// lib/suppressionDonnees.ts
//
// Suppressions controlees CLIENT (sous RLS + filtre user_id explicite), avec
// resultat explicite par etape. Meme approche que components/EffacerDonnees.tsx.
//
// Deux operations destructives :
//  - supprimerDonneesEnfant : un enfant ET toutes ses donnees (faits, frais,
//    pieces, preuves, regles de garde) + fichiers Storage. La procedure et les
//    donnees des autres enfants sont preservees.
//  - supprimerProcedureComplete : une procedure ET toutes ses donnees metier,
//    ses regles, ses paiements, ses enfants et leurs fichiers Storage.
//
// Ordre de suppression respecte les contraintes FK (009) :
//   - procedure_id sur events/expenses/documents/preuves est ON DELETE RESTRICT
//     -> on supprime ces donnees AVANT la procedure.
//   - child_id/enfant_id est ON DELETE SET NULL + FK composite : on supprime les
//     donnees de l'enfant AVANT l'enfant.
// Aucune erreur intermediaire n'est ignoree : la premiere erreur stoppe et est
// renvoyee. L'operation est rejouable (suppressions idempotentes par filtre).

import { supabase } from "@/lib/supabase";

export type ResultatSuppression = { ok: boolean; erreurs: string[] };

// Retire une liste de fichiers d'un bucket. Erreur dure = signalee (on stoppe
// avant de toucher la base, pour rester rejouable).
async function retirerFichiers(
  bucket: "justificatifs" | "preuves",
  chemins: string[],
  erreurs: string[],
): Promise<boolean> {
  if (chemins.length === 0) return true;
  const { error } = await supabase.storage.from(bucket).remove(chemins);
  if (error) {
    erreurs.push(`Stockage (${bucket}) : ${error.message}`);
    return false;
  }
  return true;
}

// Supprime des lignes d'une table selon un filtre colonne -> valeur (toutes les
// conditions en egalite), en signalant toute erreur.
async function supprimerLignes(
  table: string,
  filtres: Record<string, string>,
  erreurs: string[],
): Promise<boolean> {
  let req = supabase.from(table).delete();
  for (const [colonne, valeur] of Object.entries(filtres)) {
    req = req.eq(colonne, valeur);
  }
  const { error } = await req;
  if (error) {
    erreurs.push(`${table} : ${error.message}`);
    return false;
  }
  return true;
}

/**
 * Supprime un enfant ET toutes ses donnees rattachees + fichiers Storage.
 * Ne touche ni a la procedure ni aux donnees des autres enfants.
 */
export async function supprimerDonneesEnfant(
  userId: string,
  childId: string,
): Promise<ResultatSuppression> {
  const erreurs: string[] = [];

  // 1) Collecter les fichiers Storage AVANT de supprimer les fiches.
  const [docs, preuves] = await Promise.all([
    supabase
      .from("documents")
      .select("chemin_fichier")
      .eq("user_id", userId)
      .eq("child_id", childId),
    supabase
      .from("preuves_photo")
      .select("storage_path")
      .eq("user_id", userId)
      .eq("enfant_id", childId),
  ]);
  const fichiersJustif = (docs.data ?? [])
    .map((d) => d.chemin_fichier)
    .filter(Boolean) as string[];
  const fichiersPreuves = (preuves.data ?? [])
    .map((p) => p.storage_path)
    .filter(Boolean) as string[];

  // 2) Retirer les fichiers (on stoppe si echec, pour rester rejouable).
  if (!(await retirerFichiers("justificatifs", fichiersJustif, erreurs)))
    return { ok: false, erreurs };
  if (!(await retirerFichiers("preuves", fichiersPreuves, erreurs)))
    return { ok: false, erreurs };

  // 3) Supprimer les donnees de l'enfant, puis l'enfant. Ordre : donnees
  //    referencantes d'abord, garde_regles, enfant en dernier.
  const etapes: [string, Record<string, string>][] = [
    ["events", { user_id: userId, child_id: childId }],
    ["expenses", { user_id: userId, child_id: childId }],
    ["documents", { user_id: userId, child_id: childId }],
    ["preuves_photo", { user_id: userId, enfant_id: childId }],
    ["garde_regles", { user_id: userId, enfant_id: childId }],
    ["children", { user_id: userId, id: childId }],
  ];
  for (const [table, filtres] of etapes) {
    if (!(await supprimerLignes(table, filtres, erreurs)))
      return { ok: false, erreurs };
  }

  return { ok: true, erreurs };
}

/**
 * Supprime une procedure ET toutes ses donnees metier, regles, paiements,
 * enfants et fichiers Storage. Suppression complete explicite.
 */
export async function supprimerProcedureComplete(
  userId: string,
  procId: string,
): Promise<ResultatSuppression> {
  const erreurs: string[] = [];

  // 1) Collecter les fichiers Storage de toute la procedure.
  const [docs, preuves] = await Promise.all([
    supabase
      .from("documents")
      .select("chemin_fichier")
      .eq("user_id", userId)
      .eq("procedure_id", procId),
    supabase
      .from("preuves_photo")
      .select("storage_path")
      .eq("user_id", userId)
      .eq("procedure_id", procId),
  ]);
  const fichiersJustif = (docs.data ?? [])
    .map((d) => d.chemin_fichier)
    .filter(Boolean) as string[];
  const fichiersPreuves = (preuves.data ?? [])
    .map((p) => p.storage_path)
    .filter(Boolean) as string[];

  if (!(await retirerFichiers("justificatifs", fichiersJustif, erreurs)))
    return { ok: false, erreurs };
  if (!(await retirerFichiers("preuves", fichiersPreuves, erreurs)))
    return { ok: false, erreurs };

  // 2) Supprimer dans un ordre compatible avec les FK :
  //    donnees metier (procedure_id RESTRICT) -> regles/paiements -> enfants
  //    (cascade garde_regles) -> procedure.
  const etapes: [string, Record<string, string>][] = [
    ["events", { user_id: userId, procedure_id: procId }],
    ["expenses", { user_id: userId, procedure_id: procId }],
    ["documents", { user_id: userId, procedure_id: procId }],
    ["preuves_photo", { user_id: userId, procedure_id: procId }],
    ["pension_payments", { user_id: userId, procedure_id: procId }],
    ["pension_regle", { user_id: userId, procedure_id: procId }],
    ["frais_regle", { user_id: userId, procedure_id: procId }],
    ["dvh_regle", { user_id: userId, procedure_id: procId }],
    ["decision_regle", { user_id: userId, procedure_id: procId }],
    ["children", { user_id: userId, procedure_id: procId }],
    ["procedures", { user_id: userId, id: procId }],
  ];
  for (const [table, filtres] of etapes) {
    if (!(await supprimerLignes(table, filtres, erreurs)))
      return { ok: false, erreurs };
  }

  return { ok: true, erreurs };
}
