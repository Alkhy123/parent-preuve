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
  "acceptation_politique",
  "dossier",
  "children",
  "note_brouillon",
  "audit_log",
  // procedures EN DERNIER : children / regles / pension_payments le referencent
  // via procedure_id (ON DELETE SET NULL) et sont deja supprimes au-dessus.
  "procedures",
] as const;

const BUCKETS = ["preuves", "justificatifs"] as const;

// Taille de page pour list() et de lot pour remove() (limite Storage = 1000).
const TAILLE_PAGE = 1000;

// Liste récursive de TOUS les fichiers sous un préfixe, avec pagination :
// chaque niveau est parcouru par pages de 1000 jusqu'à épuisement (sinon un
// dossier de plus de 1000 entrées laisserait des fichiers non supprimés).
async function listerFichiers(
  client: SupabaseClient,
  bucket: string,
  prefixe: string
): Promise<string[]> {
  const chemins: string[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await client.storage
      .from(bucket)
      .list(prefixe, { limit: TAILLE_PAGE, offset });
    if (error || !data || data.length === 0) break;
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
    if (data.length < TAILLE_PAGE) break;
    offset += TAILLE_PAGE;
  }
  return chemins;
}

// Supprime tous les fichiers de l'utilisateur dans un bucket, par lots de 1000,
// puis vérifie qu'il n'en reste aucun. Renvoie un message d'erreur ou null.
async function viderBucket(
  client: SupabaseClient,
  bucket: string,
  userId: string
): Promise<string | null> {
  const chemins = await listerFichiers(client, bucket, userId);
  for (let i = 0; i < chemins.length; i += TAILLE_PAGE) {
    const lot = chemins.slice(i, i + TAILLE_PAGE);
    const { error } = await client.storage.from(bucket).remove(lot);
    if (error) return error.message;
  }
  // Vérification finale : plus aucun fichier ne doit subsister.
  const restants = await listerFichiers(client, bucket, userId);
  if (restants.length > 0) {
    return `${restants.length} fichier(s) non supprimé(s)`;
  }
  return null;
}

export async function DELETE(request: Request) {
  // 1. Authentifier : on ne supprime que SON propre compte.
  const utilisateur = await utilisateurDeLaRequete(request);
  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }
  const userId = utilisateur.id;

  // 2. Effacer les fichiers Storage de l'utilisateur (préfixe = son id),
  //    avec pagination, suppression par lots et vérification finale.
  for (const bucket of BUCKETS) {
    const erreur = await viderBucket(supabaseAdmin, bucket, userId);
    if (erreur) {
      return Response.json(
        { erreur: "Échec de l'effacement des fichiers. Réessayez." },
        { status: 500 }
      );
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