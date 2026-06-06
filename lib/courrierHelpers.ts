// Outils partagés par tous les modèles de courrier.

export type Dossier = {
    declarant_civilite: string | null; declarant_nom: string | null; declarant_prenom: string | null;
    declarant_adresse: string | null; declarant_code_postal: string | null; declarant_ville: string | null;
    declarant_email: string | null; declarant_telephone: string | null;
    autre_parent_civilite: string | null; autre_parent_nom: string | null; autre_parent_prenom: string | null;
    autre_parent_adresse: string | null; autre_parent_code_postal: string | null; autre_parent_ville: string | null;
    jugement_juridiction: string | null; jugement_date: string | null;
    jugement_numero_rg: string | null; jugement_intitule: string | null;
  };
  
  export function v(x: string | null | undefined, secours = "[à compléter]") {
    return x && x.trim() !== "" ? x : secours;
  }
  
  export function dateFr(iso: string | null | undefined, secours = "[date]") {
    if (!iso) return secours;
    const [a, m, j] = iso.split("-");
    return `${j}/${m}/${a}`;
  }