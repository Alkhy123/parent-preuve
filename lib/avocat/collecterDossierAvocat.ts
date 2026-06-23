// lib/avocat/collecterDossierAvocat.ts
//
// Collecte LECTURE SEULE des donnees du "Dossier de transmission a l'avocat",
// cloisonnee sur la procedure active. Reutilise les briques existantes :
//  - prechargerNote()        : parties, jugement, regles, enfants
//  - chargerResumeDossier()  : compteurs + montants (memes chiffres que l'accueil)
//  - fusionnerChronologie()  : chronologie unifiee (memes 4 sources que /chronologie)
//  - chargerPiecesDisponibles() : bordereau de pieces
//
// Aucune ecriture en base, aucun appel IA.

import { supabase } from "@/lib/supabase";
import {
  getProcedureActiveId,
  getEnfantsDeProcedureActive,
} from "@/lib/procedureActive";
import { prechargerNote } from "@/lib/prechargerNote";
import {
  chargerResumeDossier,
  formaterResumeTexte,
} from "@/lib/resumeDossier";
import {
  fusionnerChronologie,
  type FaitSource,
  type FraisSource,
  type PensionSource,
  type PreuveSource,
} from "@/lib/chronologie";
import { chargerPiecesDisponibles } from "@/lib/piecesnote";
import type {
  DossierTransmissionAvocatV1,
  PieceLigne,
  FaitFactuel,
  ThemeFactuel,
} from "@/lib/avocat/types";

export async function collecterDossierAvocat(): Promise<DossierTransmissionAvocatV1> {
  const [procId, enfantsProc, precharge, resume] = await Promise.all([
    getProcedureActiveId(),
    getEnfantsDeProcedureActive(),
    prechargerNote(),
    chargerResumeDossier(),
  ]);

  // Etiquette de la procedure active (en-tete du document).
  let procedureEtiquette = "Procédure sans nom";
  if (procId) {
    const { data } = await supabase
      .from("procedures")
      .select("etiquette")
      .eq("id", procId)
      .maybeSingle();
    procedureEtiquette = data?.etiquette?.trim() || "Procédure sans nom";
  }

  // Chronologie : memes 4 sources que la page /chronologie. Cloisonnement strict
  // en base sur procedure_id. Sans procedure active, aucune source.
  let evData: FaitSource[] = [];
  let frData: FraisSource[] = [];
  let peData: PensionSource[] = [];
  let prData: PreuveSource[] = [];
  if (procId) {
    const [evRes, frRes, peRes, prRes] = await Promise.all([
      supabase
        .from("events")
        .select(
          "id, titre, categorie, date_evenement, heure_evenement, description_factuelle, child_id"
        )
        .eq("procedure_id", procId),
      supabase
        .from("expenses")
        .select("id, libelle, categorie, montant, date_frais, rembourse, child_id")
        .eq("procedure_id", procId),
      supabase
        .from("pension_payments")
        .select("id, mois_du, montant_du, montant_paye, date_paiement, notes, procedure_id")
        .eq("procedure_id", procId),
      supabase
        .from("preuves_photo")
        .select("id, titre, description, enfant_id, created_at, horodatage_statut")
        .eq("procedure_id", procId),
    ]);
    evData = (evRes.data ?? []) as FaitSource[];
    frData = (frRes.data ?? []) as FraisSource[];
    peData = (peRes.data ?? []) as PensionSource[];
    prData = (prRes.data ?? []) as PreuveSource[];
  }

  const enfantIds = enfantsProc.map((e) => e.id);

  const chronologie = fusionnerChronologie(
    { faits: evData, frais: frData, pensions: peData, preuves: prData },
    { procedureId: procId, enfantIds }
  );

  // Expose factuel par theme : faits regroupes par categorie (deja cloisonnes en base).
  const parTheme = new Map<string, FaitFactuel[]>();
  for (const f of evData) {
    const theme = f.categorie?.trim() || "Autre";
    const arr = parTheme.get(theme) ?? [];
    arr.push({
      date: f.date_evenement.slice(0, 10),
      titre: f.titre?.trim() || "Fait",
      details: f.description_factuelle?.trim() || "",
    });
    parTheme.set(theme, arr);
  }
  const faitsParTheme: ThemeFactuel[] = [...parTheme.entries()].map(
    ([theme, faits]) => ({ theme, faits })
  );

  // Pieces (bordereau).
  const piecesDispo = await chargerPiecesDisponibles();
  const pieces: PieceLigne[] = piecesDispo.map((p) => ({
    origine: p.origine,
    libelle: p.libelle,
    date: p.date,
    categorie: p.categorie,
  }));

  // Noms d'enfants (id -> nom) pour annoter la chronologie au rendu.
  const nomsEnfants: Record<string, string> = {};
  for (const e of enfantsProc) nomsEnfants[e.id] = e.prenom_ou_alias;
  const enfants = enfantsProc.map((e) => e.prenom_ou_alias).filter(Boolean);

  // Points a verifier par le conseil (factuels, jamais de conseil juridique).
  const pointsAVerifier: string[] = [
    "Vérifier la cohérence des montants (pension, frais) avec les pièces.",
    "Confirmer les dates clés de la chronologie.",
    "Arbitrer les pièces à produire et leur pertinence.",
  ];
  if (!resume.socleComplet) {
    pointsAVerifier.push(
      "Compléter les informations des parties et la référence du jugement."
    );
  }
  if (resume.fraisSansJustificatif > 0) {
    pointsAVerifier.push(
      `Rattacher les justificatifs manquants (${resume.fraisSansJustificatif} frais).`
    );
  }
  if (resume.evenementsEnBrouillon > 0) {
    pointsAVerifier.push(
      `Finaliser ${resume.evenementsEnBrouillon} événement(s) en brouillon.`
    );
  }

  return {
    genereLe: new Date().toISOString(),
    procedureEtiquette,
    parties: {
      declarant: precharge.valeurs["declarant"] ?? "",
      autreParent: precharge.valeurs["autre_parent"] ?? "",
    },
    enfants,
    nomsEnfants,
    cadre: {
      juridiction: precharge.valeurs["juridiction"] ?? "",
      numeroRg: precharge.valeurs["numero_rg"] ?? "",
      intitule: precharge.valeurs["intitule"] ?? "",
      typeDecision: precharge.valeurs["type_decision"] ?? "",
      audienceProchaine: precharge.valeurs["audience_prochaine"] ?? "",
      residenceModalite: precharge.resumes["residence_modalite"] ?? "",
    },
    resumeTexte: formaterResumeTexte(resume),
    decisionsAnterieures: precharge.resumes["decision_anterieure"] ?? "",
    mesuresDejaFixees: precharge.resumes["mesures_deja_fixees"] ?? "",
    faitsParTheme,
    chronologie,
    chiffrage: {
      pensionSolde: resume.pensionSolde,
      fraisResteDu: resume.fraisResteDu,
      fraisSansJustificatif: resume.fraisSansJustificatif,
    },
    pieces,
    pointsAVerifier,
    argumentsAdverses: "",
    reponseClient: "",
  };
}
