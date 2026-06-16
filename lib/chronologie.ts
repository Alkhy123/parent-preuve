// lib/chronologie.ts
//
// Logique PURE de la chronologie unifiée.
// Ce fichier ne touche NI à Supabase NI à React : il reçoit des tableaux
// déjà chargés et renvoie une liste d'entrées prêtes à afficher.
// C'est ce qui le rend facile à tester isolément.

import { euros } from "@/lib/dossierCalculs";

// --- 1. Les quatre formes "brutes" lues en base (uniquement les colonnes utiles) ---

export type FaitSource = {
  id: string;
  titre: string | null;
  categorie: string | null;
  date_evenement: string;          // "AAAA-MM-JJ"
  heure_evenement: string | null;  // "HH:MM:SS" ou null
  description_factuelle: string | null;
  child_id: string | null;
};

export type FraisSource = {
  id: string;
  libelle: string | null;
  categorie: string | null;
  montant: number | null;
  date_frais: string;              // "AAAA-MM-JJ"
  rembourse: boolean | null;
  child_id: string | null;
};

export type PensionSource = {
  id: string;
  mois_du: string;                 // "AAAA-MM-JJ" (souvent le 1er du mois)
  montant_du: number | null;
  montant_paye: number | null;
  date_paiement: string | null;
  notes: string | null;
  procedure_id: string | null;
};

export type PreuveSource = {
  id: string;
  titre: string | null;
  description: string | null;
  enfant_id: string | null;        // ⚠️ colonne en français pour cette table
  created_at: string;              // horodatage serveur (ISO)
  horodatage_statut: string | null;
};

// --- 2. La forme COMMUNE renvoyée (une ligne de la frise) ---

export type TypeEntree = "fait" | "frais" | "pension" | "preuve";

export type EntreeChronologie = {
  id: string;
  type: TypeEntree;
  date: string;            // "AAAA-MM-JJ" : sert au tri ET au filtre
  heure: string | null;    // "HH:MM" pour les faits, sinon null
  titre: string;           // libellé court, factuel
  details: string | null;  // description / contexte, factuel
  montant: number | null;  // frais & pension uniquement
  enfantId: string | null; // rattachement enfant (null = général)
  statut: string | null;   // info neutre (remboursé, payé, horodatage…)
};

// --- 3. Ce dont la fonction a besoin pour cloisonner par procédure ---

export type SourcesChronologie = {
  faits: FaitSource[];
  frais: FraisSource[];
  pensions: PensionSource[];
  preuves: PreuveSource[];
};

export type ContexteProcedure = {
  procedureId: string | null;  // procédure active
  enfantIds: string[];         // enfants de la procédure active
};

// --- Petits utilitaires internes (non exportés) ---

// Garde les 10 premiers caractères : transforme un ISO complet en "AAAA-MM-JJ".
function jour(valeur: string): string {
  return valeur.slice(0, 10);
}

// "HH:MM:SS" -> "HH:MM" ; null reste null.
function heureCourte(valeur: string | null): string | null {
  return valeur ? valeur.slice(0, 5) : null;
}

// Libellé neutre du statut d'horodatage d'une preuve.
function libelleHorodatage(statut: string | null): string | null {
  if (statut === "qualifie") return "Horodatage qualifié";
  if (statut === "a_refaire") return "Horodatage à refaire";
  if (statut === "non_qualifie") return "Horodatage non qualifié";
  return null;
}

// --- 4. La fonction de fusion ---

export function fusionnerChronologie(
  sources: SourcesChronologie,
  contexte: ContexteProcedure,
): EntreeChronologie[] {
  const ensembleEnfants = new Set(contexte.enfantIds);

  // Règle de garde commune (faits / frais / preuves) :
  // on garde si la ligne est rattachée à un enfant de la procédure,
  // OU si elle n'a aucun enfant (élément "général", visible partout).
  const gardeParEnfant = (enfantId: string | null) =>
    enfantId === null || ensembleEnfants.has(enfantId);

  const entrees: EntreeChronologie[] = [];

  // 4.1 Faits (journal)
  for (const f of sources.faits) {
    if (!gardeParEnfant(f.child_id)) continue;
    entrees.push({
      id: f.id,
      type: "fait",
      date: jour(f.date_evenement),
      heure: heureCourte(f.heure_evenement),
      titre: f.titre?.trim() || f.categorie?.trim() || "Fait",
      details: f.description_factuelle?.trim() || null,
      montant: null,
      enfantId: f.child_id,
      statut: null,
    });
  }

  // 4.2 Frais
  for (const fr of sources.frais) {
    if (!gardeParEnfant(fr.child_id)) continue;
    entrees.push({
      id: fr.id,
      type: "frais",
      date: jour(fr.date_frais),
      heure: null,
      titre: fr.libelle?.trim() || "Frais",
      details: fr.categorie?.trim() || null,
      montant: fr.montant,
      enfantId: fr.child_id,
      statut: fr.rembourse ? "Remboursé" : "Non remboursé",
    });
  }

  // 4.3 Pension (cloisonnée par procédure, pas par enfant)
  for (const p of sources.pensions) {
    if (p.procedure_id !== contexte.procedureId) continue;
    const du = p.montant_du ?? 0;
    const paye = p.montant_paye ?? 0;
    let statut: string;
    if (du <= 0) statut = "—";
    else if (paye >= du) statut = "Payé";
    else if (paye <= 0) statut = "Impayé";
    else statut = "Partiel";
    const details =
      `Dû ${euros(du)} · payé ${euros(paye)}` +
      (p.notes?.trim() ? ` — ${p.notes.trim()}` : "");
    entrees.push({
      id: p.id,
      type: "pension",
      date: jour(p.mois_du),
      heure: null,
      titre: "Pension",
      details,
      montant: p.montant_du,
      enfantId: null,
      statut,
    });
  }

  // 4.4 Preuves photo (colonne enfant_id)
  for (const pr of sources.preuves) {
    if (!gardeParEnfant(pr.enfant_id)) continue;
    entrees.push({
      id: pr.id,
      type: "preuve",
      date: jour(pr.created_at),
      heure: null,
      titre: pr.titre?.trim() || "Preuve photo",
      details: pr.description?.trim() || null,
      montant: null,
      enfantId: pr.enfant_id,
      statut: libelleHorodatage(pr.horodatage_statut),
    });
  }

  // 4.5 Tri du plus récent au plus ancien.
  // Clé = "AAAA-MM-JJTHH:MM" : les chaînes ISO se trient comme des dates.
  const cle = (e: EntreeChronologie) => `${e.date}T${e.heure ?? "00:00"}`;
  entrees.sort((a, b) => cle(b).localeCompare(cle(a)));

  return entrees;
}