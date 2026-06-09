// app/api/compte/supprimer/route.ts
// Suppression définitive du compte de l'utilisateur connecté (droit à l'effacement, RGPD).
//
// Sécurité :
// - L'identité provient UNIQUEMENT de la session vérifiée (jeton Bearer), jamais du corps
//   de la requête : un utilisateur ne peut donc supprimer QUE son propre compte.
// - L'effacement (données + fichiers + compte Auth) utilise le client admin (service_role),
//   mais chaque opération est filtrée par l'id de cet utilisateur. Le client admin reste
//   strictement serveur, dans cette seule route protégée.

import type { SupabaseClient } from "@supabase/supabase-js";
import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Toutes les tables contenant des lignes rattachées à un utilisateur (colonne user_id).
const TABLES_UTILISATEUR = [
  "events",
  "expenses",
  "pension_payments",
  "pension_regle",
  "frais_regle",
  "dvh_regle",
  "decision_regle",
  "documents",
  "preuves_photo",
  "garde_regles",
  "consentements_ia",
  "ia_appels",
  "dossier",
  "children",
] as const;

const BUCKETS = ["preuves", "justificatifs"] as const;

// Liste récursive de tous les fichiers situés sous un préfixe (gère 2 ou 3 niveaux).
async function listerFichiers(
  client: SupabaseClient,
  bucket: string,
  prefixe: string
): Promise<string[]> {
  const { data, error } = await client.storage.from(bucket).list(prefixe, { limit: 1000 });
  if (error || !data) return [];
  const chemins: string[] = [];
  for (const item of data) {
    const cheminItem = `${prefixe}/${item.name}`;
    if (item.id) {
      // item avec id = fichier
      chemins.push(cheminItem);
    } else {
      // item sans id = sous-dossier -> on descend
      chemins.push(...(await listerFichiers(client, bucket, cheminItem)));
    }
  }
  return chemins;
}

export async function DELETE(request: Request) {
  // 1. Authentifier : on ne supprime que SON propre compte.
  const utilisateur = await utilisateurDeLaRequete(request);
  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }
  const userId = utilisateur.id;

  // 2. Effacer les fichiers Storage de l'utilisateur (préfixe = son id).
  for (const bucket of BUCKETS) {
    const chemins = await listerFichiers(supabaseAdmin, bucket, userId);
    if (chemins.length > 0) {
      const { error } = await supabaseAdmin.storage.from(bucket).remove(chemins);
      if (error) {
        return Response.json(
          { erreur: "Échec de l'effacement des fichiers. Réessayez." },
          { status: 500 }
        );
      }
    }
  }

  // 3. Effacer les lignes de toutes les tables (filtrées par son id).
  for (const table of TABLES_UTILISATEUR) {
    const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
    if (error) {
      return Response.json(
        { erreur: `Échec de la suppression (${table}). Réessayez.` },
        { status: 500 }
      );
    }
  }

  // 4. En dernier : supprimer le compte Auth lui-même.
  const { error: erreurAuth } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (erreurAuth) {
    return Response.json(
      { erreur: "Vos données ont été effacées, mais la suppression du compte a échoué. Contactez le support." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}