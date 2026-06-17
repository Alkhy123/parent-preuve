import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";

// État de configuration du dossier, calculé pour l'accueil.
// Lecture seule : ce fichier n'écrit jamais en base.
export type EtatConfigurationDossier = {
  procedure: "a_configurer" | "configure";
  enfants: "a_configurer" | "configure";
  jugement: "a_analyser" | "a_valider" | "analyse";
};

// Formes minimales des lignes qu'on lit (pour rester typé sans "any" implicite).
type LigneProcedure = {
  autre_parent_nom: string | null;
  autre_parent_prenom: string | null;
};
type LigneRegle = { valide: boolean | null };

/**
 * Calcule l'état des trois accès de configuration (procédure, enfants, jugement)
 * pour la procédure active. Tout est filtré sur la procédure active (cloisonnement).
 *
 * En cas d'erreur de lecture, on renvoie l'état le plus prudent
 * ("a_configurer" / "a_analyser") pour ne jamais faire planter l'accueil.
 */
export async function getEtatConfigurationDossier(): Promise<EtatConfigurationDossier> {
  const procId = await getProcedureActiveId();

  // Aucune procédure active : tout reste à configurer, on évite toute autre requête.
  if (!procId) {
    return {
      procedure: "a_configurer",
      enfants: "a_configurer",
      jugement: "a_analyser",
    };
  }

  // On lance toutes les lectures en parallèle pour gagner du temps.
  const [resProcedure, resEnfants, resPension, resFrais, resDvh, resDecision] =
    await Promise.all([
      supabase
        .from("procedures")
        .select("autre_parent_nom, autre_parent_prenom")
        .eq("id", procId)
        .maybeSingle(),
      // Comptage léger : on ne ramène pas les lignes, juste le nombre.
      supabase
        .from("children")
        .select("id", { count: "exact", head: true })
        .eq("procedure_id", procId),
      supabase.from("pension_regle").select("valide").eq("procedure_id", procId),
      supabase.from("frais_regle").select("valide").eq("procedure_id", procId),
      supabase.from("dvh_regle").select("valide").eq("procedure_id", procId),
      supabase.from("decision_regle").select("valide").eq("procedure_id", procId),
    ]);

  // --- Procédure : l'autre parent est-il renseigné (nom OU prénom) ? ---
  let procedure: EtatConfigurationDossier["procedure"] = "a_configurer";
  if (!resProcedure.error && resProcedure.data) {
    const ligne = resProcedure.data as LigneProcedure;
    const nom = (ligne.autre_parent_nom ?? "").trim();
    const prenom = (ligne.autre_parent_prenom ?? "").trim();
    if (nom !== "" || prenom !== "") procedure = "configure";
  }

  // --- Enfants : au moins un enfant rattaché à la procédure ? ---
  let enfants: EtatConfigurationDossier["enfants"] = "a_configurer";
  if (!resEnfants.error && (resEnfants.count ?? 0) > 0) enfants = "configure";

  // --- Jugement : état des 4 règles réunies ---
  let jugement: EtatConfigurationDossier["jugement"] = "a_analyser";
  const lecturesRegles = [resPension, resFrais, resDvh, resDecision];
  // Si une lecture a échoué, on reste prudent : on garde "a_analyser".
  const erreurRegle = lecturesRegles.some((r) => r.error);
  if (!erreurRegle) {
    const valeurs: (boolean | null)[] = [];
    for (const r of lecturesRegles) {
      const lignes = (r.data ?? []) as LigneRegle[];
      for (const l of lignes) valeurs.push(l.valide);
    }
    if (valeurs.length === 0) {
      jugement = "a_analyser"; // aucune règle : rien d'analysé
    } else if (valeurs.some((v) => v === false)) {
      jugement = "a_valider"; // au moins une règle proposée non validée
    } else {
      jugement = "analyse"; // toutes les règles sont validées
    }
  }

  return { procedure, enfants, jugement };
}
