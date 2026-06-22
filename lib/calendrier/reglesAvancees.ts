// lib/calendrier/reglesAvancees.ts
//
// Accès données des règles de garde avancées (table calendar_advanced_rules).
// Ce sont des règles EN PLUS de la règle de base garde_regles (ex. le mercredi).
// Mappe les lignes DB vers/depuis le type ReglePlanning consommé par le moteur.

import { supabase } from "@/lib/supabase";
import type { ChezQui, ReglePlanning } from "@/lib/calendrier/types";

type RegleRow = {
  id: string;
  type: "hebdomadaire" | "weekend_alterne" | "semaines_alternees";
  jour_debut: number | null;
  heure_debut: string | null;
  jour_fin: number | null;
  heure_fin: string | null;
  date_reference: string | null;
  heure_bascule: string | null;
  chez_qui: ChezQui;
};

// Une règle avancée + son identifiant DB (pour la suppression).
export type RegleAvanceeStockee = { id: string; regle: ReglePlanning };

function heure(t: string | null, defaut: string): string {
  return t ? t.slice(0, 5) : defaut;
}

function rowVersRegle(r: RegleRow): ReglePlanning | null {
  if (r.type === "hebdomadaire") {
    return {
      type: "hebdomadaire",
      jourDebut: r.jour_debut ?? 1,
      heureDebut: heure(r.heure_debut, "09:00"),
      jourFin: r.jour_fin ?? r.jour_debut ?? 1,
      heureFin: heure(r.heure_fin, "19:00"),
      chezQui: r.chez_qui,
    };
  }
  if (r.type === "weekend_alterne") {
    if (!r.date_reference) return null;
    return {
      type: "weekend_alterne",
      jourDebut: r.jour_debut ?? 5,
      heureDebut: heure(r.heure_debut, "18:00"),
      jourFin: r.jour_fin ?? 7,
      heureFin: heure(r.heure_fin, "18:00"),
      dateReference: r.date_reference,
      chezQui: r.chez_qui,
    };
  }
  // semaines_alternees
  if (!r.date_reference) return null;
  return {
    type: "semaines_alternees",
    dateReference: r.date_reference,
    heureBascule: heure(r.heure_bascule, "18:00"),
    chezQui: r.chez_qui,
  };
}

export async function chargerReglesAvancees(
  enfantId: string,
): Promise<RegleAvanceeStockee[]> {
  const { data } = await supabase
    .from("calendar_advanced_rules")
    .select(
      "id, type, jour_debut, heure_debut, jour_fin, heure_fin, date_reference, heure_bascule, chez_qui",
    )
    .eq("enfant_id", enfantId)
    .eq("actif", true)
    .order("created_at", { ascending: true });

  const out: RegleAvanceeStockee[] = [];
  for (const row of (data ?? []) as RegleRow[]) {
    const regle = rowVersRegle(row);
    if (regle) out.push({ id: row.id, regle });
  }
  return out;
}

export async function ajouterRegleAvancee(
  enfantId: string,
  regle: ReglePlanning,
): Promise<{ error: string | null }> {
  const base = {
    enfant_id: enfantId,
    type: regle.type,
    chez_qui: regle.chezQui,
  };
  let payload: Record<string, unknown> = base;

  if (regle.type === "hebdomadaire" || regle.type === "weekend_alterne") {
    payload = {
      ...base,
      jour_debut: regle.jourDebut,
      heure_debut: regle.heureDebut,
      jour_fin: regle.jourFin,
      heure_fin: regle.heureFin,
      date_reference:
        regle.type === "weekend_alterne" ? regle.dateReference : null,
    };
  } else {
    payload = {
      ...base,
      date_reference: regle.dateReference,
      heure_bascule: regle.heureBascule,
    };
  }

  const { error } = await supabase
    .from("calendar_advanced_rules")
    .insert(payload);
  return { error: error?.message ?? null };
}

export async function supprimerRegleAvancee(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("calendar_advanced_rules")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}
