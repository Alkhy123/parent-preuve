// lib/regleConvertisseurs.ts
// Convertisseurs PARTAGÉS : transforment le JSON sectionné renvoyé par l'IA
// (champs { valeur, confiance, citation }) en valeurs prêtes pour les composants
// ReglePension / RegleFrais / RegleDVH / RegleDecision.
// Utilisés par le hub (/dossier/extraire) ET par l'import PDF (/dossier/importer-pdf).

export type Champ = {
  valeur: number | string | boolean | null;
  confiance: "haute" | "moyenne" | "absente";
  citation: string | null;
};
export type Section = {
  table: string;
  champs: Record<string, Champ>;
  avertissements: string[];
};
export type Sections = {
  pension: Section;
  frais: Section;
  dvh: Section;
  decision: Section;
};

export type ValeursReglePension = {
  montant_base: number | null;
  debiteur: string;
  jour_echeance: number | null;
  paiement_avance: boolean;
  inclut_vacances: boolean;
  intermediation: boolean;
  indexation_active: boolean;
  indexation_jour: number | null;
  indexation_mois: number | null;
  indexation_premiere_date: string | null;
  indexation_indice: string | null;
};

export type ValeursRegleFrais = {
  categories_couvertes: string | null;
  part_moi_pourcentage: number | null;
  part_autre_pourcentage: number | null;
  accord_prealable_requis: boolean;
  accord_prealable_seuil: number | null;
  delai_remboursement_jours: number | null;
  justificatif_obligatoire: boolean;
  s_ajoute_a_pension: boolean;
};

export type ValeursRegleDVH = {
  type_dvh: string | null;
  titulaire: string | null;
  lieu_visite: string | null;
  presence_tiers: boolean;
  tiers_details: string | null;
  frequence: string | null;
  duree: string | null;
  duree_limitee: boolean;
  clause_renonciation: boolean;
  clause_renonciation_details: string | null;
  remise_lieu: string | null;
  vacances_partage: string | null;
};

export type ValeursRegleDecision = {
  type_decision: string | null;
  provisoire: boolean;
  execution_provisoire: boolean;
  susceptible_appel: boolean;
  frappee_appel: boolean;
  appel_date: string | null;
  appel_juridiction: string | null;
  date_decision: string | null;
  date_signification: string | null;
  date_audience_prochaine: string | null;
  mise_en_etat: boolean;
  mise_en_etat_details: string | null;
};

// Lecteurs sûrs : on ne fait jamais confiance aveuglément au JSON.
function lireNombre(c?: Champ): number | null {
  return typeof c?.valeur === "number" ? c.valeur : null;
}
function lireBool(c?: Champ): boolean {
  return c?.valeur === true; // null ou absent => false
}
function lireTexte(c?: Champ): string | null {
  return typeof c?.valeur === "string" ? c.valeur : null;
}

export function versReglePension(champs: Record<string, Champ>): ValeursReglePension {
  const debiteur = champs.debiteur?.valeur;
  return {
    montant_base: lireNombre(champs.montant_base),
    debiteur: debiteur === "moi" || debiteur === "autre" ? debiteur : "autre",
    jour_echeance: lireNombre(champs.jour_echeance),
    paiement_avance: lireBool(champs.paiement_avance),
    inclut_vacances: lireBool(champs.inclut_vacances),
    intermediation: lireBool(champs.intermediation),
    indexation_active: lireBool(champs.indexation_active),
    indexation_jour: lireNombre(champs.indexation_jour),
    indexation_mois: lireNombre(champs.indexation_mois),
    indexation_premiere_date: lireTexte(champs.indexation_premiere_date),
    indexation_indice: lireTexte(champs.indexation_indice),
  };
}

// justificatif_obligatoire : null si non extrait => on retombe sur le défaut (true).
export function versRegleFrais(champs: Record<string, Champ>): ValeursRegleFrais {
  return {
    categories_couvertes: lireTexte(champs.categories_couvertes),
    part_moi_pourcentage: lireNombre(champs.part_moi_pourcentage),
    part_autre_pourcentage: lireNombre(champs.part_autre_pourcentage),
    accord_prealable_requis: lireBool(champs.accord_prealable_requis),
    accord_prealable_seuil: lireNombre(champs.accord_prealable_seuil),
    delai_remboursement_jours: lireNombre(champs.delai_remboursement_jours),
    justificatif_obligatoire:
      champs.justificatif_obligatoire?.valeur === false ? false : true,
    s_ajoute_a_pension: lireBool(champs.s_ajoute_a_pension),
  };
}

export function versRegleDVH(champs: Record<string, Champ>): ValeursRegleDVH {
  return {
    type_dvh: lireTexte(champs.type_dvh),
    titulaire: lireTexte(champs.titulaire),
    lieu_visite: lireTexte(champs.lieu_visite),
    presence_tiers: lireBool(champs.presence_tiers),
    tiers_details: lireTexte(champs.tiers_details),
    frequence: lireTexte(champs.frequence),
    duree: lireTexte(champs.duree),
    duree_limitee: lireBool(champs.duree_limitee),
    clause_renonciation: lireBool(champs.clause_renonciation),
    clause_renonciation_details: lireTexte(champs.clause_renonciation_details),
    remise_lieu: lireTexte(champs.remise_lieu),
    vacances_partage: lireTexte(champs.vacances_partage),
  };
}

export function versRegleDecision(champs: Record<string, Champ>): ValeursRegleDecision {
  return {
    type_decision: lireTexte(champs.type_decision),
    provisoire: lireBool(champs.provisoire),
    execution_provisoire: lireBool(champs.execution_provisoire),
    susceptible_appel: lireBool(champs.susceptible_appel),
    frappee_appel: lireBool(champs.frappee_appel),
    appel_date: lireTexte(champs.appel_date),
    appel_juridiction: lireTexte(champs.appel_juridiction),
    date_decision: lireTexte(champs.date_decision),
    date_signification: lireTexte(champs.date_signification),
    date_audience_prochaine: lireTexte(champs.date_audience_prochaine),
    mise_en_etat: lireBool(champs.mise_en_etat),
    mise_en_etat_details: lireTexte(champs.mise_en_etat_details),
  };
}
