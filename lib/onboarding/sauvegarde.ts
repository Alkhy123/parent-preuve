// lib/onboarding/sauvegarde.ts
//
// Helpers d'ECRITURE partages par les etapes du wizard. Ils ecrivent dans les
// VRAIES tables existantes (dossier, procedures, children), exactement comme
// les pages dediees, pour ne rien dupliquer ni introduire de nouvelle table.
//
// Aucune ecriture automatique : ces fonctions ne sont appelees qu'apres une
// action explicite de l'utilisateur dans une etape.

import { supabase } from "@/lib/supabase";

// ── Declarant (table dossier, 1 ligne par utilisateur) ──────────────────────

export type ChampsDeclarant = {
  declarant_civilite: string;
  declarant_nom: string;
  declarant_prenom: string;
  declarant_adresse: string;
  declarant_code_postal: string;
  declarant_ville: string;
  declarant_email: string;
  declarant_telephone: string;
};

export const DECLARANT_VIDE: ChampsDeclarant = {
  declarant_civilite: "",
  declarant_nom: "",
  declarant_prenom: "",
  declarant_adresse: "",
  declarant_code_postal: "",
  declarant_ville: "",
  declarant_email: "",
  declarant_telephone: "",
};

/** Lit le socle declarant (ou valeurs vides si aucune ligne). */
export async function chargerDeclarant(): Promise<ChampsDeclarant> {
  const { data } = await supabase.from("dossier").select("*").maybeSingle();
  const rempli = { ...DECLARANT_VIDE };
  if (data) {
    (Object.keys(DECLARANT_VIDE) as (keyof ChampsDeclarant)[]).forEach((c) => {
      rempli[c] = (data as Record<string, string | null>)[c] ?? "";
    });
  }
  return rempli;
}

/** Enregistre le socle declarant (upsert sur user_id, comme la page /dossier). */
export async function enregistrerDeclarant(
  champs: ChampsDeclarant
): Promise<{ erreur: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Vous n'êtes pas connecté." };

  const payload: Record<string, string | null> = { user_id: user.id };
  (Object.keys(champs) as (keyof ChampsDeclarant)[]).forEach((c) => {
    payload[c] = champs[c].trim() === "" ? null : champs[c];
  });

  const { error } = await supabase
    .from("dossier")
    .upsert(payload, { onConflict: "user_id" });
  return { erreur: error ? error.message : null };
}

// ── Procedures ──────────────────────────────────────────────────────────────

export type ProcedureLigne = { id: string; etiquette: string | null };

/** Liste les procedures de l'utilisateur (les plus anciennes d'abord). */
export async function listerProcedures(): Promise<ProcedureLigne[]> {
  const { data, error } = await supabase
    .from("procedures")
    .select("id, etiquette")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data;
}

/** Cree une procedure (etiquette = l'autre parent) et renvoie son id. */
export async function creerProcedure(
  etiquette: string
): Promise<{ id: string | null; erreur: string | null }> {
  const valeur = etiquette.trim();
  if (!valeur) return { id: null, erreur: "Indiquez un nom pour la procédure." };
  const { data, error } = await supabase
    .from("procedures")
    .insert({ etiquette: valeur })
    .select("id")
    .single();
  if (error || !data) return { id: null, erreur: error?.message ?? "inconnue" };
  return { id: data.id, erreur: null };
}

export type ChampsAutreParent = {
  etiquette: string;
  autre_parent_civilite: string;
  autre_parent_nom: string;
  autre_parent_prenom: string;
  autre_parent_adresse: string;
  autre_parent_code_postal: string;
  autre_parent_ville: string;
};

export const AUTRE_PARENT_VIDE: ChampsAutreParent = {
  etiquette: "",
  autre_parent_civilite: "",
  autre_parent_nom: "",
  autre_parent_prenom: "",
  autre_parent_adresse: "",
  autre_parent_code_postal: "",
  autre_parent_ville: "",
};

/** Lit les champs "autre parent" d'une procedure. */
export async function chargerAutreParent(
  procedureId: string
): Promise<ChampsAutreParent> {
  const { data } = await supabase
    .from("procedures")
    .select(
      "etiquette, autre_parent_civilite, autre_parent_nom, autre_parent_prenom, autre_parent_adresse, autre_parent_code_postal, autre_parent_ville"
    )
    .eq("id", procedureId)
    .maybeSingle();
  const rempli = { ...AUTRE_PARENT_VIDE };
  if (data) {
    (Object.keys(AUTRE_PARENT_VIDE) as (keyof ChampsAutreParent)[]).forEach(
      (c) => {
        rempli[c] = (data as Record<string, string | null>)[c] ?? "";
      }
    );
  }
  return rempli;
}

/** Enregistre les champs "autre parent" sur une procedure existante. */
export async function enregistrerAutreParent(
  procedureId: string,
  champs: ChampsAutreParent
): Promise<{ erreur: string | null }> {
  const payload: Record<string, string | null> = {};
  (Object.keys(champs) as (keyof ChampsAutreParent)[]).forEach((c) => {
    payload[c] = champs[c].trim() === "" ? null : champs[c];
  });
  const { error } = await supabase
    .from("procedures")
    .update(payload)
    .eq("id", procedureId);
  return { erreur: error ? error.message : null };
}

// ── Enfants (children) ───────────────────────────────────────────────────────

export type EnfantLigne = {
  id: string;
  prenom_ou_alias: string;
  date_naissance: string | null;
};

/** Liste les enfants rattaches a une procedure. */
export async function listerEnfantsDeProcedure(
  procedureId: string
): Promise<EnfantLigne[]> {
  const { data, error } = await supabase
    .from("children")
    .select("id, prenom_ou_alias, date_naissance")
    .eq("procedure_id", procedureId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data;
}

/** Ajoute un enfant a une procedure. */
export async function ajouterEnfant(
  procedureId: string,
  prenom: string,
  dateNaissance: string
): Promise<{ erreur: string | null }> {
  const valeur = prenom.trim();
  if (!valeur) return { erreur: "Le prénom (ou alias) est obligatoire." };
  const { error } = await supabase.from("children").insert({
    prenom_ou_alias: valeur,
    date_naissance: dateNaissance || null,
    procedure_id: procedureId,
  });
  return { erreur: error ? error.message : null };
}

/** Supprime un enfant. */
export async function supprimerEnfant(
  enfantId: string
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from("children").delete().eq("id", enfantId);
  return { erreur: error ? error.message : null };
}
