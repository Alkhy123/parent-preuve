// lib/calendrier/types.ts
//
// Types du moteur de calendrier AVANCÉ (parallèle à lib/gardeCalendrier.ts).
// Ce moteur ne remplace PAS l'existant : il est testable séparément.
//
// Convention des jours : 1 = lundi … 7 = dimanche (comme lib/gardeCalendrier).

export type ChezQui = "moi" | "autre";

// Une règle récurrente du planning.
export type ReglePlanning =
  // Un week-end sur deux (cadence 14 jours), ancré sur un week-end connu.
  | {
      type: "weekend_alterne";
      jourDebut: number; // 1..7
      heureDebut: string; // "HH:MM"
      jourFin: number;
      heureFin: string;
      dateReference: string; // "YYYY-MM-DD" : un week-end de garde connu
      chezQui: ChezQui; // à qui appartient ce week-end
    }
  // Un (ou plusieurs) jour(s) récurrent(s) chaque semaine, ex. le mercredi.
  | {
      type: "hebdomadaire";
      jourDebut: number;
      heureDebut: string;
      jourFin: number;
      heureFin: string;
      chezQui: ChezQui;
    }
  // Semaine entière en alternance (paires/impaires), ancrée sur une semaine connue.
  | {
      type: "semaines_alternees";
      dateReference: string; // "YYYY-MM-DD" : un jour de la semaine de référence
      heureBascule: string; // heure de remise (ex. "18:00")
      chezQui: ChezQui; // à qui appartient la semaine de référence
    };

export type TypeRegle = ReglePlanning["type"];

// Période de vacances scolaires (annotation, alimentée au sous-bloc 2).
export type PeriodeVacances = {
  nom: string;
  debut: string; // "YYYY-MM-DD" inclus
  fin: string; // "YYYY-MM-DD" inclus
  zone?: string; // "A" | "B" | "C"
};

// Jour férié (annotation, alimentée au sous-bloc 2).
export type JourFerie = {
  date: string; // "YYYY-MM-DD"
  nom: string;
};

// Exception manuelle : impose chezQui sur une plage, prioritaire sur les règles.
export type ExceptionGarde = {
  id: string;
  debut: string; // "YYYY-MM-DD" inclus
  fin: string; // "YYYY-MM-DD" inclus
  chezQui: ChezQui;
  motif?: string;
};

// Période de garde calculée (sortie du moteur).
export type PeriodeGardeCalculee = {
  debut: Date;
  fin: Date;
  chezQui: ChezQui;
  origine: "regle" | "exception" | "defaut";
  regleType?: TypeRegle;
  motif?: string;
};

// Conflit : sur une plage, plusieurs règles attribuent des parents différents.
export type ConflitRegles = {
  debut: Date;
  fin: Date;
  details: string;
};

// Entrée du moteur (fonction pure : aucune dépendance Supabase ici).
export type EntreePlanning = {
  regles: ReglePlanning[];
  exceptions?: ExceptionGarde[];
  chezQuiParDefaut: ChezQui; // parent principal : jours non couverts par une règle
  du: Date;
  au: Date;
  // Annotations (sous-bloc 2). NON utilisées pour l'attribution en V1.
  vacances?: PeriodeVacances[];
  joursFeries?: JourFerie[];
};

// Sortie du moteur.
export type PlanningCalcule = {
  periodes: PeriodeGardeCalculee[];
  conflits: ConflitRegles[];
};
