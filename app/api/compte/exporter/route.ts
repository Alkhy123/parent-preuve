// app/api/compte/exporter/route.ts
// Export de portabilite RGPD : renvoie TOUTES les donnees structurees du compte
// (au format JSON) + des liens temporaires vers les fichiers (pieces, preuves).
//
// Distinct du dossier avocat (qui est une mise en forme metier d'une procedure).
// Ici : portabilite = l'integralite des donnees personnelles, brutes, lisibles.
//
// Securite :
// - identite derivee UNIQUEMENT du jeton verifie (jamais du corps/QS) ;
// - lecture via le client admin mais filtree par user_id, strictement serveur ;
// - URL signees temporaires (1 h) ; aucune URL ni donnee sensible journalisee.

import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Toutes les tables rattachees a l'utilisateur (colonne user_id).
const TABLES_EXPORT = [
  "procedures",
  "children",
  "dossier",
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
  "note_brouillon",
  "consentements_ia",
  "acceptation_politique",
  "ia_appels",
] as const;

// Duree de validite des liens de telechargement (1 h).
const DUREE_LIEN_SECONDES = 3600;

type LienFichier = { chemin: string; url: string | null };

// Genere des liens signes pour une liste de chemins dans un bucket.
async function liensSignes(
  bucket: string,
  chemins: string[]
): Promise<LienFichier[]> {
  if (chemins.length === 0) return [];
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrls(chemins, DUREE_LIEN_SECONDES);
  if (error || !data) return chemins.map((chemin) => ({ chemin, url: null }));
  return data.map((d) => ({ chemin: d.path ?? "", url: d.signedUrl ?? null }));
}

export async function GET(request: Request) {
  // 1. Authentifier : on n'exporte que SES propres donnees.
  const utilisateur = await utilisateurDeLaRequete(request);
  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }
  const userId = utilisateur.id;

  // 2. Lire chaque table, filtree par user_id.
  const donnees: Record<string, unknown[]> = {};
  for (const table of TABLES_EXPORT) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .eq("user_id", userId);
    if (error) {
      return Response.json(
        { erreur: `Échec de l'export (${table}). Réessayez.` },
        { status: 500 }
      );
    }
    donnees[table] = data ?? [];
  }

  // 3. Liens temporaires vers les fichiers (pieces + preuves).
  const cheminsJustif = (donnees["documents"] as { chemin_fichier?: string | null }[])
    .map((d) => d.chemin_fichier)
    .filter((c): c is string => !!c);
  const cheminsPreuves = (donnees["preuves_photo"] as { storage_path?: string | null }[])
    .map((p) => p.storage_path)
    .filter((c): c is string => !!c);

  const fichiers = {
    justificatifs: await liensSignes("justificatifs", cheminsJustif),
    preuves: await liensSignes("preuves", cheminsPreuves),
  };

  // 4. Document d'export.
  const corps = {
    format: "parent-preuve-export-v1",
    genere_le: new Date().toISOString(),
    compte: { id: userId, email: utilisateur.email },
    note:
      "Export de portabilité de vos données personnelles. Les liens de téléchargement des fichiers sont valables 1 heure ; relancez l'export pour les régénérer.",
    donnees,
    fichiers,
  };

  return new Response(JSON.stringify(corps, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="parent-preuve-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
