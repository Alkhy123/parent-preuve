import { supabase } from "@/lib/supabase";

/**
 * Identifiant de la procédure "active" de l'utilisateur.
 *
 * Phase 3 : on retient la première procédure (la plus ancienne). La plupart des
 * utilisateurs n'en ont qu'une. Renvoie null si l'utilisateur n'a aucune procédure.
 *
 * Phase 4 : ce point centralisera le sélecteur de contexte (procédure choisie +
 * persistée entre les pages). Seul ce fichier sera à faire évoluer.
 */
export async function getProcedureActiveId(): Promise<string | null> {
  const { data, error } = await supabase
    .from("procedures")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}
