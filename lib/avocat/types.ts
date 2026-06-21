// lib/avocat/types.ts
//
// Types du "Dossier de transmission a l'avocat".
//
// Deux niveaux :
//  1) DossierTransmissionAvocatV1 : DONNEES brutes collectees (lecture seule).
//  2) RenduDossierAvocat : representation de RENDU neutre (sections -> blocs),
//     consommee a la fois par la previsualisation React et par l'export PDF.
//
// Aucun vocabulaire "conclusions" / strategie / dispositif : document
// preparatoire factuel uniquement.

import type { EntreeChronologie } from "@/lib/chronologie";

// ── 1. Donnees collectees ─────────────────────────────────────────────────────

export type PartiesDossier = {
  declarant: string; // "Nom Prenom · adresse · …"
  autreParent: string;
};

export type CadreProcedural = {
  juridiction: string;
  numeroRg: string;
  intitule: string;
  typeDecision: string;
  audienceProchaine: string;
  residenceModalite: string;
};

export type ChiffrageDossier = {
  pensionSolde: number; // > 0 reste du, < 0 trop-percu, 0 a jour
  fraisResteDu: number;
  fraisSansJustificatif: number;
};

export type PieceLigne = {
  origine: "document" | "preuve";
  libelle: string;
  date: string; // "AAAA-MM-JJ"
  categorie: string;
};

export type FaitFactuel = { date: string; titre: string; details: string };
export type ThemeFactuel = { theme: string; faits: FaitFactuel[] };

export type DossierTransmissionAvocatV1 = {
  genereLe: string; // ISO (date de generation)
  procedureEtiquette: string;
  parties: PartiesDossier;
  enfants: string[]; // noms / alias
  nomsEnfants: Record<string, string>; // id -> nom (pour la chronologie)
  cadre: CadreProcedural;
  resumeTexte: string; // synthese executive factuelle
  decisionsAnterieures: string;
  mesuresDejaFixees: string;
  faitsParTheme: ThemeFactuel[];
  chronologie: EntreeChronologie[];
  chiffrage: ChiffrageDossier;
  pieces: PieceLigne[];
  pointsAVerifier: string[];
  // Champs libres non stockes en V1 (a completer avec le conseil).
  argumentsAdverses: string;
  reponseClient: string;
};

// ── 2. Representation de rendu (neutre, sans React ni jsPDF) ──────────────────

export type BlocRendu =
  | { type: "paragraphe"; texte: string }
  | { type: "champs"; champs: { label: string; valeur: string }[] }
  | { type: "tableau"; entetes: string[]; lignes: string[][] };

export type SectionRendue = {
  id: string;
  titre: string;
  blocs: BlocRendu[];
};

export type RenduDossierAvocat = {
  titre: string;
  sousTitre: string;
  sections: SectionRendue[];
};
