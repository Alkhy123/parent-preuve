// lib/timeline/types.ts
//
// Type commun de la timeline centrale du dossier.
// La timeline AGRÈGE en lecture seule des éléments déjà existants
// (journal, frais, pension, documents, preuves, règles de garde).
// Elle ne crée aucune donnée et ne dispose d'aucune table dédiée.

// Les six sources agrégées dans la timeline.
export type TimelineSource =
  | "journal"
  | "frais"
  | "pension"
  | "document"
  | "preuve"
  | "garde";

// Une ligne de la timeline, indépendante de la table d'origine.
// `date` peut être null : ces éléments sont regroupés dans la section
// « À dater / à vérifier » plutôt que placés sur la frise.
export type TimelineItem = {
  id: string;
  source: TimelineSource;
  date: string | null;        // "AAAA-MM-JJ" ou null (à dater)
  heure: string | null;       // "HH:MM" pour les faits du journal, sinon null
  titre: string;              // libellé court, factuel
  description?: string;       // contexte factuel facultatif
  href?: string;              // page métier d'origine (lecture seule)
  montant?: number | null;    // frais & pension uniquement
  procedureId?: string | null;
  childId?: string | null;    // rattachement enfant (null = général)
  statut?: string;            // info neutre (remboursé, payé, horodatage…)
  pieceLiee?: boolean;        // true si l'élément est lui-même une pièce
};
