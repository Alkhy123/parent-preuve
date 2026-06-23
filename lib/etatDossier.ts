// lib/etatDossier.ts
//
// Charge l'etat du dossier depuis Supabase et le traduit dans la forme
// attendue par le moteur de controle (lib/controleDossier.ts).
//
// Logique extraite de components/ControleDossier.tsx : memes requetes,
// meme cloisonnement par procedure active. Lecture seule, aucune ecriture.

import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import type { DonneesControle } from "@/lib/controleDossier";

// Vrai si une chaine contient autre chose que des espaces.
function estRempli(x: string | null | undefined) {
  return !!(x && x.trim() !== "");
}

/**
 * Lit le dossier (cloisonne sur la procedure active) et renvoie l'objet
 * attendu par controlerDossier(). Sur l'accueil, du/au sont vides : le
 * controle de periode ne se declenche alors pas.
 */
export async function chargerEtatDossier(
  du: string,
  au: string
): Promise<DonneesControle> {
  const procId = await getProcedureActiveId();

  // 1) Nombre d'enfants de la procedure active.
  let nombreEnfants = 0;
  if (procId) {
    const { data: enfantsRows } = await supabase
      .from("children")
      .select("id")
      .eq("procedure_id", procId);
    nombreEnfants = (enfantsRows ?? []).length;
  }

  // 2) Declarant : socle global (/dossier).
  const { data: socleRow } = await supabase
    .from("dossier")
    .select("declarant_nom, declarant_prenom")
    .maybeSingle();

  // 3) Autre parent + jugement : procedure active.
  let procRow:
    | {
        autre_parent_nom: string | null;
        autre_parent_prenom: string | null;
        jugement_juridiction: string | null;
        jugement_date: string | null;
      }
    | null = null;
  if (procId) {
    const r = await supabase
      .from("procedures")
      .select("autre_parent_nom, autre_parent_prenom, jugement_juridiction, jugement_date")
      .eq("id", procId)
      .maybeSingle();
    procRow = r.data;
  }

  // 4) Compteurs : cloisonnement strict en base sur procedure_id.
  //    Sans procedure active, aucun compteur (rien a afficher).
  let preuvesARefaire = 0;
  let brouillons = 0;
  let fraisSansJustif = 0;
  if (procId) {
    const [preuvesRes, brouillonsRes, fraisRes] = await Promise.all([
      supabase
        .from("preuves_photo")
        .select("id")
        .eq("procedure_id", procId)
        .eq("horodatage_statut", "a_refaire"),
      supabase
        .from("events")
        .select("id")
        .eq("procedure_id", procId)
        .eq("statut", "brouillon"),
      supabase
        .from("expenses")
        .select("id")
        .eq("procedure_id", procId)
        .is("document_id", null)
        .eq("sans_justificatif", false),
    ]);
    preuvesARefaire = (preuvesRes.data ?? []).length;
    brouillons = (brouillonsRes.data ?? []).length;
    fraisSansJustif = (fraisRes.data ?? []).length;
  }

  return {
    socle: {
      parent1Complet:
        estRempli(socleRow?.declarant_nom) && estRempli(socleRow?.declarant_prenom),
      parent2Complet:
        estRempli(procRow?.autre_parent_nom) && estRempli(procRow?.autre_parent_prenom),
      referenceJugementRenseignee:
        estRempli(procRow?.jugement_juridiction) && estRempli(procRow?.jugement_date),
    },
    nombreEnfants,
    periode: { du, au },
    fraisSansJustificatif: fraisSansJustif,
    evenementsEnBrouillon: brouillons,
    piecesNonRattachees: 0,
    preuvesHorodatageARefaire: preuvesARefaire,
  };
}
