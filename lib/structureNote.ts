// lib/structureNote.ts
// Moteur de structure de la « Note de synthèse factuelle pour l'avocat ».
// Logique PURE : aucune dépendance Supabase, aucune IA. Testable seul.
// Décrit QUELLES sections existent, QUAND elles s'affichent, et QUELS champs
// elles contiennent (+ d'où vient l'info, et si la reformulation IA est permise).

// ── Aiguillage : ce que le questionnaire détermine ───────────────────────────
export type Volets = {
    procedure: 'hors_divorce' | 'divorce'
    autoriteParentale: boolean
    residence: boolean
    dvh: boolean
    pension: boolean
    fraisExceptionnels: boolean
    demandesAccessoires: boolean
  }
  
  export function voletsParDefaut(): Volets {
    return {
      procedure: 'hors_divorce',
      autoriteParentale: false,
      residence: false,
      dvh: false,
      pension: false,
      fraisExceptionnels: false,
      demandesAccessoires: false,
    }
  }
  
  // ── Champs ───────────────────────────────────────────────────────────────────
  // origine :
  //   'dossier'           → pré-rempli depuis une table (l'utilisateur relit)
  //   'nouvelle_question' → saisi dans l'assistant
  // (l'argumentation en droit n'est PAS générée → aucun champ ne la couvre)
  export type OrigineChamp = 'dossier' | 'nouvelle_question'
  
  export type TypeChamp =
    | 'texte_court'    // une ligne
    | 'texte_libre'    // paragraphe ; SEUL type éligible à la reformulation IA
    | 'montant'
    | 'date'
    | 'liste_enfants'  // pré-rempli depuis children
    | 'regle'          // bloc pré-rempli depuis une table règle
    | 'calcul'         // valeur calculée (ex. impayés)
    | 'pieces'         // rattachement de pièces (documents / preuves_photo)
    | 'recapitulatif'  // assemblé depuis les volets actifs
  
  export type Champ = {
    id: string
    libelle: string
    origine: OrigineChamp
    type: TypeChamp
    source?: string            // ex. 'pension_regle', 'children', 'events'
    reformulationIA?: boolean  // true UNIQUEMENT sur des texte_libre narratifs
    obligatoire?: boolean
    aide?: string              // micro-aide neutre affichée sous le champ
  }
  
  // ── Sections ─────────────────────────────────────────────────────────────────
  export type Section = {
    id: string
    titre: string
    estActive: (v: Volets) => boolean  // fonction PURE des volets
    champs: Champ[]
  }
  
  const toujours = () => true
  
  export const STRUCTURE_NOTE: Section[] = [
    {
      id: 'entete',
      titre: 'En-tête',
      estActive: toujours,
      champs: [
        { id: 'juridiction', libelle: 'Juridiction', origine: 'dossier', type: 'texte_court', source: 'procedure.jugement_juridiction' },
        { id: 'numero_rg', libelle: 'Numéro RG', origine: 'dossier', type: 'texte_court', source: 'procedure.jugement_numero_rg' },
        { id: 'intitule', libelle: 'Intitulé du jugement', origine: 'dossier', type: 'texte_court', source: 'procedure.jugement_intitule' },
        { id: 'type_decision', libelle: 'Nature de la décision', origine: 'dossier', type: 'texte_court', source: 'decision_regle.type_decision' },
        { id: 'audience_prochaine', libelle: 'Prochaine audience', origine: 'dossier', type: 'date', source: 'decision_regle.date_audience_prochaine' },
      ],
    },
    {
      id: 'parties',
      titre: 'Parties',
      estActive: toujours,
      champs: [
        { id: 'declarant', libelle: 'Vous (déclarant)', origine: 'dossier', type: 'texte_court', source: 'dossier.declarant_*' },
        { id: 'autre_parent', libelle: 'Autre parent', origine: 'dossier', type: 'texte_court', source: 'procedure.autre_parent_*' },
      ],
    },
    {
      id: 'objet',
      titre: 'Objet du litige',
      estActive: toujours,
      champs: [
        { id: 'objet_litige', libelle: 'Objet', origine: 'nouvelle_question', type: 'texte_court', aide: 'Pré-rempli selon les volets cochés ; ajustable.' },
      ],
    },
    {
      id: 'situation_familiale',
      titre: 'Situation personnelle et familiale',
      estActive: toujours,
      champs: [
        { id: 'union_type', libelle: "Type d'union", origine: 'nouvelle_question', type: 'texte_court' },
        { id: 'union_date', libelle: "Date de l'union", origine: 'nouvelle_question', type: 'date' },
        { id: 'separation_date', libelle: 'Date de séparation', origine: 'nouvelle_question', type: 'date' },
        { id: 'separation_circonstances', libelle: 'Circonstances de la séparation', origine: 'nouvelle_question', type: 'texte_libre', reformulationIA: true, aide: "Restez factuel et chronologique. L'IA peut proposer une reformulation neutre ; vous validez." },
        { id: 'enfants', libelle: 'Enfants concernés', origine: 'dossier', type: 'liste_enfants', source: 'children' },
      ],
    },
    {
      id: 'procedure_anterieure',
      titre: 'Procédure antérieure et éléments nouveaux',
      estActive: toujours,
      champs: [
        { id: 'decision_anterieure', libelle: 'Décision déjà intervenue', origine: 'dossier', type: 'regle', source: 'decision_regle' },
        { id: 'mesures_deja_fixees', libelle: 'Mesures déjà fixées', origine: 'dossier', type: 'regle', source: 'pension_regle, frais_regle, dvh_regle' },
        { id: 'elements_nouveaux', libelle: 'Éléments nouveaux depuis la décision', origine: 'nouvelle_question', type: 'texte_libre', reformulationIA: true, source: "events (à l'appui)" },
      ],
    },
    {
      id: 'situation_materielle',
      titre: 'Situation matérielle',
      estActive: toujours,
      champs: [
        { id: 'situation_moi', libelle: 'Votre situation (revenus, charges)', origine: 'nouvelle_question', type: 'texte_libre' },
        { id: 'situation_autre', libelle: "Situation de l'autre parent (si connue)", origine: 'nouvelle_question', type: 'texte_libre' },
        { id: 'besoins_enfants', libelle: 'Besoins des enfants', origine: 'nouvelle_question', type: 'texte_libre', reformulationIA: true },
      ],
    },
    {
      id: 'autorite_parentale',
      titre: 'Autorité parentale',
      estActive: (v) => v.autoriteParentale,
      champs: [
        { id: 'ap_souhait', libelle: 'Exercice souhaité', origine: 'nouvelle_question', type: 'texte_court' },
        { id: 'ap_justification', libelle: "Éléments à l'appui", origine: 'nouvelle_question', type: 'texte_libre', reformulationIA: true, source: 'events' },
      ],
    },
    {
      id: 'residence',
      titre: 'Résidence habituelle',
      estActive: (v) => v.residence,
      champs: [
        { id: 'residence_modalite', libelle: 'Modalité de résidence', origine: 'dossier', type: 'regle', source: 'garde_regles' },
        { id: 'residence_justification', libelle: "Éléments à l'appui", origine: 'nouvelle_question', type: 'texte_libre', reformulationIA: true, source: 'events' },
      ],
    },
    {
      id: 'dvh',
      titre: "Droit de visite et d'hébergement",
      estActive: (v) => v.dvh,
      champs: [
        { id: 'dvh_modalites', libelle: 'Modalités du DVH', origine: 'dossier', type: 'regle', source: 'dvh_regle' },
        { id: 'dvh_pieces', libelle: "Pièces à l'appui", origine: 'dossier', type: 'pieces', source: 'documents, preuves_photo' },
      ],
    },
    {
      id: 'pension',
      titre: "Contribution à l'entretien et à l'éducation",
      estActive: (v) => v.pension,
      champs: [
        { id: 'pension_regle', libelle: 'Règle de pension', origine: 'dossier', type: 'regle', source: 'pension_regle' },
        { id: 'pension_impayes', libelle: 'Impayés constatés', origine: 'dossier', type: 'calcul', source: 'pension_payments' },
        { id: 'pension_pieces', libelle: "Pièces à l'appui", origine: 'dossier', type: 'pieces', source: 'documents' },
      ],
    },
    {
      id: 'frais_exceptionnels',
      titre: 'Frais exceptionnels',
      estActive: (v) => v.fraisExceptionnels,
      champs: [
        { id: 'frais_regle', libelle: 'Règle de partage des frais', origine: 'dossier', type: 'regle', source: 'frais_regle' },
        { id: 'frais_non_rembourses', libelle: 'Frais non remboursés', origine: 'dossier', type: 'calcul', source: 'expenses' },
        { id: 'frais_pieces', libelle: 'Justificatifs', origine: 'dossier', type: 'pieces', source: 'documents' },
      ],
    },
    {
      id: 'demandes_accessoires',
      titre: 'Demandes accessoires',
      estActive: (v) => v.demandesAccessoires,
      champs: [
        { id: 'accessoires_liste', libelle: 'Demandes (passeport, scolarité, communication de pièces…)', origine: 'nouvelle_question', type: 'texte_libre' },
        { id: 'accessoires_pieces', libelle: "Pièces à l'appui", origine: 'dossier', type: 'pieces', source: 'documents' },
      ],
    },
    {
      id: 'divorce',
      titre: 'Volet divorce',
      estActive: (v) => v.procedure === 'divorce',
      champs: [
        { id: 'divorce_principe', libelle: 'Fondement du divorce', origine: 'nouvelle_question', type: 'texte_court' },
        { id: 'divorce_mesures_epoux', libelle: 'Mesures entre époux', origine: 'nouvelle_question', type: 'texte_libre', reformulationIA: true },
        { id: 'divorce_prestation', libelle: 'Prestation compensatoire envisagée', origine: 'nouvelle_question', type: 'texte_libre' },
        { id: 'divorce_patrimoine', libelle: 'Conséquences patrimoniales', origine: 'nouvelle_question', type: 'texte_libre' },
      ],
    },
    {
      id: 'souhaits',
      titre: 'Ce que je souhaite demander (à valider avec mon avocat)',
      estActive: toujours,
      champs: [
        { id: 'recap_souhaits', libelle: 'Récapitulatif des souhaits', origine: 'dossier', type: 'recapitulatif', source: 'volets actifs', aide: 'Assemblé depuis les sections actives ; éditable. Ce sont vos souhaits, pas des conclusions.' },
      ],
    },
    {
      id: 'bordereau',
      titre: 'Bordereau de pièces',
      estActive: toujours,
      champs: [
        { id: 'liste_pieces', libelle: 'Pièces sélectionnées', origine: 'dossier', type: 'pieces', source: 'documents, preuves_photo' },
      ],
    },
  ]
  
  // ── Fonction pure : sections à afficher selon les volets ──────────────────────
  export function sectionsActives(volets: Volets): Section[] {
    return STRUCTURE_NOTE.filter((s) => s.estActive(volets))
  }
  
  // ── Helper pour l'écran : ids des champs éligibles à la reformulation IA ───────
  export function champsReformulables(volets: Volets): string[] {
    return sectionsActives(volets)
      .flatMap((s) => s.champs)
      .filter((c) => c.reformulationIA)
      .map((c) => c.id)
  }