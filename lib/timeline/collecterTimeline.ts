// lib/timeline/collecterTimeline.ts
//
// Logique PURE de collecte de la timeline centrale.
// Ne touche NI à Supabase NI à React : reçoit des tableaux déjà chargés
// et renvoie une liste de TimelineItem prête à afficher.
//
// Réutilisation : le cloisonnement par procédure des quatre sources
// historiques (faits, frais, pension, preuves) est délégué à
// fusionnerChronologie(), déjà éprouvé. La timeline ajoute par-dessus
// deux sources en lecture seule : documents et règles de garde.

import {
  fusionnerChronologie,
  type ContexteProcedure,
  type SourcesChronologie,
  type TypeEntree,
} from "@/lib/chronologie";
import type { TimelineItem, TimelineSource } from "@/lib/timeline/types";

// --- Sources supplémentaires propres à la timeline ---

export type DocumentSource = {
  id: string;
  libelle: string | null;
  categorie: string | null;
  date_document: string | null;   // "AAAA-MM-JJ" ou null (à dater)
  child_id: string | null;
};

export type GardeSource = {
  id: string;
  type_garde: string | null;
  date_reference: string | null;  // "AAAA-MM-JJ"
  enfant_id: string;              // garde_regles : colonne en français, non nulle
};

export type SourcesTimeline = SourcesChronologie & {
  documents: DocumentSource[];
  gardes: GardeSource[];
};

// --- Correspondances internes ---

// Type d'entrée chronologie historique -> source timeline.
const SOURCE_DEPUIS_TYPE: Record<TypeEntree, TimelineSource> = {
  fait: "journal",
  frais: "frais",
  pension: "pension",
  preuve: "preuve",
};

// Page métier d'origine (navigation en lecture seule).
const HREF_PAR_SOURCE: Record<TimelineSource, string> = {
  journal: "/journal",
  frais: "/frais",
  pension: "/pension",
  document: "/documents",
  preuve: "/preuves",
  garde: "/calendrier",
};

// Garde les 10 premiers caractères : "AAAA-MM-JJ".
function jour(valeur: string | null): string | null {
  return valeur ? valeur.slice(0, 10) : null;
}

// Libellé neutre d'un type de garde (aligné sur lib/prechargerNote.ts).
function libelleTypeGarde(type: string | null): string {
  if (type === "weekend_sur_deux") return "un week-end sur deux";
  return type?.trim() ? type.replace(/_/g, " ") : "à préciser";
}

/**
 * Agrège les six sources du dossier en une liste de TimelineItem.
 * Lecture seule : aucune écriture, aucune donnée créée.
 *
 * Le tri (récent/ancien) et la séparation des éléments sans date sont
 * laissés au composant d'affichage, qui propose une bascule de tri.
 *
 * @param sources  Les six sources déjà chargées (RLS appliquée à la lecture).
 * @param contexte Procédure active + enfants de la procédure active.
 */
export function collecterTimeline(
  sources: SourcesTimeline,
  contexte: ContexteProcedure,
): TimelineItem[] {
  const items: TimelineItem[] = [];

  // 1. Sources historiques : on délègue le cloisonnement par procédure.
  const entrees = fusionnerChronologie(
    {
      faits: sources.faits,
      frais: sources.frais,
      pensions: sources.pensions,
      preuves: sources.preuves,
    },
    contexte,
  );
  for (const e of entrees) {
    const source = SOURCE_DEPUIS_TYPE[e.type];
    items.push({
      id: e.id,
      source,
      date: e.date,
      heure: e.heure,
      titre: e.titre,
      description: e.details ?? undefined,
      href: HREF_PAR_SOURCE[source],
      montant: e.montant,
      procedureId: contexte.procedureId,
      childId: e.enfantId,
      statut: e.statut ?? undefined,
      pieceLiee: e.type === "preuve" ? true : undefined,
    });
  }

  // 2. Documents (mêmes règles de cloisonnement enfant que la chronologie :
  //    enfant de la procédure OU pièce générale sans enfant).
  const ensembleEnfants = new Set(contexte.enfantIds);
  const gardeParEnfant = (enfantId: string | null) =>
    enfantId === null || ensembleEnfants.has(enfantId);

  for (const d of sources.documents) {
    if (!gardeParEnfant(d.child_id)) continue;
    items.push({
      id: d.id,
      source: "document",
      date: jour(d.date_document),
      heure: null,
      titre: d.libelle?.trim() || "Document",
      description: d.categorie?.trim() || undefined,
      href: HREF_PAR_SOURCE.document,
      procedureId: contexte.procedureId,
      childId: d.child_id,
      pieceLiee: true,
    });
  }

  // 3. Règles de garde (enfant_id toujours renseigné en base).
  for (const g of sources.gardes) {
    if (!gardeParEnfant(g.enfant_id)) continue;
    items.push({
      id: g.id,
      source: "garde",
      date: jour(g.date_reference),
      heure: null,
      titre: `Règle de garde : ${libelleTypeGarde(g.type_garde)}`,
      href: HREF_PAR_SOURCE.garde,
      procedureId: contexte.procedureId,
      childId: g.enfant_id,
    });
  }

  return items;
}
