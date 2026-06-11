import { supabase } from "@/lib/supabase";

// Clé de mémorisation locale (navigateur) de la procédure choisie.
const CLE = "procedure_active_id";

/** Lit la procédure mémorisée localement (ou null). Sans effet côté serveur. */
export function getProcedureActiveIdLocal(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLE);
}

/** Mémorise (ou efface) localement la procédure choisie. */
export function setProcedureActiveIdLocal(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(CLE, id);
  else window.localStorage.removeItem(CLE);
}

/**
 * Identifiant de la procédure active de l'utilisateur.
 *
 *  1) si une procédure est mémorisée localement ET qu'elle existe encore → on la prend ;
 *  2) sinon → la première procédure (la plus ancienne), qu'on mémorise au passage.
 *
 * Renvoie null si l'utilisateur n'a aucune procédure.
 */
export async function getProcedureActiveId(): Promise<string | null> {
  const { data, error } = await supabase
    .from("procedures")
    .select("id")
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return null;

  const memorisee = getProcedureActiveIdLocal();
  const existeEncore = memorisee !== null && data.some((p) => p.id === memorisee);
  const choisie = existeEncore ? (memorisee as string) : data[0].id;

  // Si rien n'était mémorisé (ou pointait sur une procédure supprimée), on fixe le défaut.
  if (choisie !== memorisee) setProcedureActiveIdLocal(choisie);

  return choisie;
}

// ---------------------------------------------------------------------------

export type EnfantProcedure = { id: string; prenom_ou_alias: string };

/**
 * Renvoie les enfants rattachés à la procédure active (triés par prénom).
 * Tableau vide si aucune procédure active ou aucun enfant.
 * C'est le point unique que chaque écran "par enfant" utilise pour se filtrer.
 */
export async function getEnfantsDeProcedureActive(): Promise<EnfantProcedure[]> {
  const procId = await getProcedureActiveId();
  if (!procId) return [];

  const { data, error } = await supabase
    .from("children")
    .select("id, prenom_ou_alias")
    .eq("procedure_id", procId)
    .order("prenom_ou_alias", { ascending: true });

  if (error || !data) return [];
  return data;
}
