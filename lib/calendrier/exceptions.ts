// lib/calendrier/exceptions.ts
//
// Accès données des exceptions manuelles (table calendar_exceptions).
// Lecture/écriture par enfant ; la RLS limite déjà à l'utilisateur.
// Mappe les lignes DB vers le type ExceptionGarde consommé par le moteur.

import { supabase } from "@/lib/supabase";
import type { ChezQui, ExceptionGarde } from "@/lib/calendrier/types";

type ExceptionRow = {
  id: string;
  date_debut: string;
  date_fin: string;
  chez_qui: ChezQui;
  motif: string | null;
};

export async function chargerExceptions(
  enfantId: string,
): Promise<ExceptionGarde[]> {
  const { data } = await supabase
    .from("calendar_exceptions")
    .select("id, date_debut, date_fin, chez_qui, motif")
    .eq("enfant_id", enfantId)
    .order("date_debut", { ascending: true });

  return ((data ?? []) as ExceptionRow[]).map((r) => ({
    id: r.id,
    debut: r.date_debut,
    fin: r.date_fin,
    chezQui: r.chez_qui,
    motif: r.motif ?? undefined,
  }));
}

export async function ajouterException(
  enfantId: string,
  exc: { debut: string; fin: string; chezQui: ChezQui; motif?: string },
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("calendar_exceptions").insert({
    enfant_id: enfantId,
    date_debut: exc.debut,
    date_fin: exc.fin,
    chez_qui: exc.chezQui,
    motif: exc.motif?.trim() || null,
  });
  return { error: error?.message ?? null };
}

export async function supprimerException(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("calendar_exceptions")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}
