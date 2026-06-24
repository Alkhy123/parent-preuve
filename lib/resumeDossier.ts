// lib/resumeDossier.ts
//
// Resume lecture seule de la procedure active.
// Deux parties, comme controleDossier.ts / etatDossier.ts :
//   1) formaterResumeTexte()  -> fonction PURE (aucun Supabase), donc testable
//      et reutilisable cote serveur plus tard (pour l'IA).
//   2) chargerResumeDossier() -> chargement cote client, LECTURE SEULE, cloisonne
//      sur la procedure active. Mfor les memes requetes que TableauDeBord, donc
//      les memes chiffres que l'accueil et l'export.
//
// Aucune ecriture en base. Aucun appel a Mistral a ce stade.

import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { chargerEtatDossier } from "@/lib/etatDossier";
import { controlerDossier, resumeControle } from "@/lib/controleDossier";
import {
  totauxFrais,
  totauxPension,
  euros,
  type FraisCalcul,
  type PensionCalcul,
} from "@/lib/dossierCalculs";

// ── Forme structuree du resume ────────────────────────────────────────────────

export type ResumeDossier = {
  socleComplet: boolean;
  nombreEnfants: number;
  pensionSolde: number; // > 0 impaye, = 0 a jour, < 0 trop-percu
  // Regle de pension de la procedure active. Optionnel pour compat ascendante :
  //   undefined => non charge (ex. tests purs) ;
  //   null      => charge, aucune regle active ;
  //   objet     => regle active trouvee.
  pensionRegle?: {
    montant: number | null; // montant courant si dispo, sinon montant de base
    debiteur: string | null;
    jourEcheance: number | null;
  } | null;
  fraisResteDu: number; // euros restant a rembourser
  fraisSansJustificatif: number;
  evenementsEnBrouillon: number;
  preuvesHorodatageARefaire: number;
  nombreBloquants: number;
  nombreAvertissements: number;
};

// ── Partie 1 : texte neutre (fonction PURE) ──────────────────────────────────

/**
 * Transforme l'objet resume en un texte court et factuel.
 * Pure : memes entrees => meme sortie. Vocabulaire prudent, aucune qualification.
 */
export function formaterResumeTexte(r: ResumeDossier): string {
  const lignes: string[] = [];

  lignes.push(
    `Socle du dossier : ${r.socleComplet ? "complet" : "a completer"}.`
  );
  lignes.push(`Enfants enregistres : ${r.nombreEnfants}.`);

  // Pension
  if (r.pensionSolde > 0) {
    lignes.push(`Pension : reste du ${euros(r.pensionSolde)}.`);
  } else if (r.pensionSolde < 0) {
    lignes.push(`Pension : trop-percu ${euros(-r.pensionSolde)}.`);
  } else {
    lignes.push("Pension : a jour.");
  }

  // Regle de pension (montant prevu par le jugement, saisi/valide par l'utilisateur).
  // Distinct du solde ci-dessus : aide l'IA a repondre aux questions sur la regle.
  if (r.pensionRegle === null) {
    lignes.push("Regle de pension : non renseignee.");
  } else if (r.pensionRegle && r.pensionRegle.montant != null) {
    const qui = r.pensionRegle.debiteur
      ? ` (debiteur : ${r.pensionRegle.debiteur})`
      : "";
    const echeance =
      r.pensionRegle.jourEcheance != null
        ? `, echeance le ${r.pensionRegle.jourEcheance} du mois`
        : "";
    lignes.push(
      `Regle de pension : ${euros(r.pensionRegle.montant)} par mois${qui}${echeance}.`
    );
  }

  // Frais
  if (r.fraisResteDu > 0) {
    lignes.push(`Frais : reste du ${euros(r.fraisResteDu)}.`);
  } else {
    lignes.push("Frais : a jour.");
  }
  if (r.fraisSansJustificatif > 0) {
    lignes.push(`Frais sans justificatif : ${r.fraisSansJustificatif}.`);
  }

  // Saisies a finaliser
  if (r.evenementsEnBrouillon > 0) {
    lignes.push(`Evenements en brouillon : ${r.evenementsEnBrouillon}.`);
  }
  if (r.preuvesHorodatageARefaire > 0) {
    lignes.push(`Preuves a re-horodater : ${r.preuvesHorodatageARefaire}.`);
  }

  // Etat pour l'export
  lignes.push(
    `Controle export : ${r.nombreBloquants} point(s) bloquant(s), ${r.nombreAvertissements} avertissement(s).`
  );

  lignes.push(
    "Montants calcules a partir des saisies. Elements factuels, soumis a l'appreciation du juge."
  );

  return lignes.join("\n");
}

// ── Partie 2 : chargement cote client (LECTURE SEULE) ────────────────────────

/**
 * Lit l'etat reel de la procedure active et renvoie l'objet ResumeDossier.
 * Memes requetes que TableauDeBord => memes chiffres que l'accueil/export.
 * Lecture seule : aucune ecriture en base.
 */
export async function chargerResumeDossier(): Promise<ResumeDossier> {
  // 1) Etat "compteurs" + socle (reutilise la brique existante).
  //    Sur l'accueil, du/au vides : pas de controle de periode.
  const donnees = await chargerEtatDossier("", "");

  // 2) Controle (bloquants / avertissements) via le moteur pur existant.
  const ctrl = resumeControle(controlerDossier(donnees));

  // 3) Montants : frais reste du + solde pension, cloisonnement strict en base
  //    sur procedure_id. Sans procedure active, aucun montant.
  const procId = await getProcedureActiveId();

  let fraisRows: FraisCalcul[] = [];
  let pensionRows: PensionCalcul[] = [];
  // null = procedure active mais aucune regle de pension active trouvee.
  let pensionRegle: ResumeDossier["pensionRegle"] = procId ? null : undefined;
  if (procId) {
    const [frRes, peRes, prRes] = await Promise.all([
      supabase.from("expenses").select("part_autre, rembourse").eq("procedure_id", procId),
      supabase
        .from("pension_payments")
        .select("montant_du, montant_paye")
        .eq("procedure_id", procId),
      supabase
        .from("pension_regle")
        .select("montant_base, montant_courant, debiteur, jour_echeance")
        .eq("procedure_id", procId)
        .eq("actif", true)
        .eq("valide", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    fraisRows = (frRes.data ?? []) as FraisCalcul[];
    pensionRows = (peRes.data ?? []) as PensionCalcul[];
    if (prRes.data) {
      pensionRegle = {
        montant: prRes.data.montant_courant ?? prRes.data.montant_base ?? null,
        debiteur: prRes.data.debiteur ?? null,
        jourEcheance: prRes.data.jour_echeance ?? null,
      };
    }
  }

  const tf = totauxFrais(fraisRows);
  const tp = totauxPension(pensionRows);

  // 4) Assemblage de l'objet structure.
  const socleComplet =
    donnees.socle !== null &&
    donnees.socle.parent1Complet &&
    donnees.socle.parent2Complet &&
    donnees.socle.referenceJugementRenseignee;

  return {
    socleComplet,
    nombreEnfants: donnees.nombreEnfants,
    pensionSolde: tp.solde,
    pensionRegle,
    fraisResteDu: tf.resteDu,
    fraisSansJustificatif: donnees.fraisSansJustificatif,
    evenementsEnBrouillon: donnees.evenementsEnBrouillon,
    preuvesHorodatageARefaire: donnees.preuvesHorodatageARefaire,
    nombreBloquants: ctrl.bloquants.length,
    nombreAvertissements: ctrl.avertissements.length,
  };
}
