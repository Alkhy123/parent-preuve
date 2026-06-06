// lib/libellesRegles.ts
//
// Libellés lisibles (français) pour chaque champ extrait, par section.
// Sert à afficher des puces nommées dans ApercuExtraction
// (ex. clé "montant_base" -> "Montant").
// Source des clés : les convertisseurs (versReglePension / versRegleFrais / ...).

export const LIBELLES_PENSION: Record<string, string> = {
    montant_base: "Montant",
    debiteur: "Débiteur",
    jour_echeance: "Jour d'échéance",
    paiement_avance: "Paiement d'avance",
    inclut_vacances: "Inclut les vacances",
    intermediation: "Intermédiation financière",
    indexation_active: "Indexation",
    indexation_jour: "Jour d'indexation",
    indexation_mois: "Mois d'indexation",
    indexation_premiere_date: "1re indexation",
    indexation_indice: "Indice d'indexation",
  };
  
  export const LIBELLES_FRAIS: Record<string, string> = {
    categories_couvertes: "Catégories couvertes",
    part_moi_pourcentage: "Ma part (%)",
    part_autre_pourcentage: "Part de l'autre (%)",
    accord_prealable_requis: "Accord préalable requis",
    accord_prealable_seuil: "Seuil d'accord préalable",
    delai_remboursement_jours: "Délai de remboursement (j)",
    justificatif_obligatoire: "Justificatif obligatoire",
    s_ajoute_a_pension: "S'ajoute à la pension",
  };
  
  export const LIBELLES_DVH: Record<string, string> = {
    type_dvh: "Type de DVH",
    titulaire: "Titulaire",
    lieu_visite: "Lieu de visite",
    presence_tiers: "Présence d'un tiers",
    tiers_details: "Détails sur le tiers",
    frequence: "Fréquence",
    duree: "Durée",
    duree_limitee: "Durée limitée",
    clause_renonciation: "Clause de renonciation",
    clause_renonciation_details: "Détails de la renonciation",
    remise_lieu: "Lieu de remise",
    vacances_partage: "Partage des vacances",
  };
  
  export const LIBELLES_DECISION: Record<string, string> = {
    type_decision: "Type de décision",
    provisoire: "Provisoire",
    execution_provisoire: "Exécution provisoire",
    susceptible_appel: "Susceptible d'appel",
    frappee_appel: "Frappée d'appel",
    appel_date: "Date d'appel",
    appel_juridiction: "Juridiction d'appel",
    date_decision: "Date de la décision",
    date_signification: "Date de signification",
    date_audience_prochaine: "Prochaine audience",
    mise_en_etat: "Mise en état",
    mise_en_etat_details: "Détails de la mise en état",
  };