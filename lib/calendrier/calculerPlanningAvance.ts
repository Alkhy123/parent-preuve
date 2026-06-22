// lib/calendrier/calculerPlanningAvance.ts
//
// Moteur de calcul AVANCÉ, fonction PURE : aucune dépendance Supabase, aucun
// fetch, aucun React. Prend des règles + exceptions en entrée et renvoie un
// planning calculé (périodes + conflits).
//
// V1 (sous-bloc 1) : attribution au jour le jour à partir de
//   - week-end alterné (cadence 14 jours) ;
//   - règle hebdomadaire (ex. mercredi) ;
//   - semaines alternées (paires/impaires) ;
//   - exceptions manuelles (prioritaires) ;
//   - parent par défaut pour les jours non couverts.
// Les conflits (règles qui s'opposent un même jour) sont détectés et signalés.
// vacances / joursFeries sont des ANNOTATIONS non encore intégrées au calcul.

import type {
  ChezQui,
  ConflitRegles,
  EntreePlanning,
  PeriodeGardeCalculee,
  PlanningCalcule,
  ReglePlanning,
  TypeRegle,
} from "@/lib/calendrier/types";

// ── Helpers de dates (locaux, sans dérive de fuseau) ─────────────────────────

// "YYYY-MM-DD" -> Date locale à minuit.
function dateLocale(iso: string): Date {
  const [a, m, j] = iso.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, j);
}

function minuit(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function finDeJour(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function ajouterJours(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// Nombre de jours entiers entre deux dates (via composantes UTC : pas de DST).
function joursEntre(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ua - ub) / 86400000);
}

// getDay() : 0=dimanche..6=samedi  ->  1=lundi..7=dimanche.
function jourIso(d: Date): number {
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

// Lundi de la semaine de d.
function lundiDeLaSemaine(d: Date): Date {
  return ajouterJours(minuit(d), -(jourIso(d) - 1));
}

// Recule jusqu'au dernier "jour" (1..7) à la date d ou avant.
function dernierJour(d: Date, jour: number): Date {
  const r = minuit(d);
  for (let i = 0; i < 7; i++) {
    if (jourIso(r) === jour) return r;
    r.setDate(r.getDate() - 1);
  }
  return r;
}

// weekday dans l'intervalle [debut, fin] (gère le passage dimanche->lundi).
function jourDansIntervalle(weekday: number, debut: number, fin: number): boolean {
  if (debut <= fin) return weekday >= debut && weekday <= fin;
  return weekday >= debut || weekday <= fin; // intervalle qui enjambe la semaine
}

function oppose(c: ChezQui): ChezQui {
  return c === "moi" ? "autre" : "moi";
}

// Priorité de résolution quand plusieurs règles couvrent un même jour.
const PRIORITE: Record<TypeRegle, number> = {
  weekend_alterne: 0,
  semaines_alternees: 1,
  hebdomadaire: 2,
};

// ── Attribution d'un jour par une règle (ou null si non couvert) ─────────────

function attributionRegle(r: ReglePlanning, jour: Date): ChezQui | null {
  if (r.type === "hebdomadaire") {
    return jourDansIntervalle(jourIso(jour), r.jourDebut, r.jourFin)
      ? r.chezQui
      : null;
  }

  if (r.type === "weekend_alterne") {
    const ancre = dernierJour(dateLocale(r.dateReference), r.jourDebut);
    let duree = r.jourFin - r.jourDebut;
    if (duree < 0) duree += 7;
    const k = Math.floor(joursEntre(jour, ancre) / 14);
    const debut = ajouterJours(ancre, k * 14);
    const fin = ajouterJours(debut, duree);
    const d = minuit(jour);
    return d >= minuit(debut) && d <= minuit(fin) ? r.chezQui : null;
  }

  // semaines_alternees : couvre toute la semaine, en alternance.
  const ancreLundi = lundiDeLaSemaine(dateLocale(r.dateReference));
  const semaines = Math.floor(joursEntre(lundiDeLaSemaine(jour), ancreLundi) / 7);
  const pair = ((semaines % 2) + 2) % 2 === 0;
  return pair ? r.chezQui : oppose(r.chezQui);
}

// ── Calcul jour par jour, puis fusion en périodes ────────────────────────────

type JourCalcule = {
  jour: Date;
  chezQui: ChezQui;
  origine: PeriodeGardeCalculee["origine"];
  regleType?: TypeRegle;
  motif?: string;
  conflit: boolean;
};

export function calculerPlanningAvance(entree: EntreePlanning): PlanningCalcule {
  const exceptions = entree.exceptions ?? [];
  const jours: JourCalcule[] = [];

  for (
    let d = minuit(entree.du);
    d <= entree.au;
    d = ajouterJours(d, 1)
  ) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // 1) Exception prioritaire.
    const exc = exceptions.find((e) => iso >= e.debut && iso <= e.fin);
    if (exc) {
      jours.push({
        jour: new Date(d),
        chezQui: exc.chezQui,
        origine: "exception",
        motif: exc.motif,
        conflit: false,
      });
      continue;
    }

    // 2) Règles applicables ce jour.
    const attributions = entree.regles
      .map((r) => ({ owner: attributionRegle(r, d), type: r.type }))
      .filter((a): a is { owner: ChezQui; type: TypeRegle } => a.owner !== null);

    if (attributions.length === 0) {
      jours.push({
        jour: new Date(d),
        chezQui: entree.chezQuiParDefaut,
        origine: "defaut",
        conflit: false,
      });
      continue;
    }

    const distinct = new Set(attributions.map((a) => a.owner));
    const gagnant = attributions
      .slice()
      .sort((a, b) => PRIORITE[a.type] - PRIORITE[b.type])[0];

    jours.push({
      jour: new Date(d),
      chezQui: gagnant.owner,
      origine: "regle",
      regleType: gagnant.type,
      conflit: distinct.size > 1,
    });
  }

  return {
    periodes: fusionnerPeriodes(jours),
    conflits: fusionnerConflits(jours),
  };
}

// Fusionne les jours consécutifs de même signature en périodes.
function fusionnerPeriodes(jours: JourCalcule[]): PeriodeGardeCalculee[] {
  const periodes: PeriodeGardeCalculee[] = [];
  for (const j of jours) {
    const dernier = periodes[periodes.length - 1];
    const memeSignature =
      dernier &&
      dernier.chezQui === j.chezQui &&
      dernier.origine === j.origine &&
      dernier.regleType === j.regleType &&
      dernier.motif === j.motif;

    if (memeSignature) {
      dernier.fin = finDeJour(j.jour);
    } else {
      periodes.push({
        debut: minuit(j.jour),
        fin: finDeJour(j.jour),
        chezQui: j.chezQui,
        origine: j.origine,
        regleType: j.regleType,
        motif: j.motif,
      });
    }
  }
  return periodes;
}

// Regroupe les jours en conflit consécutifs en plages.
function fusionnerConflits(jours: JourCalcule[]): ConflitRegles[] {
  const conflits: ConflitRegles[] = [];
  for (const j of jours) {
    if (!j.conflit) continue;
    const dernier = conflits[conflits.length - 1];
    const contigu =
      dernier && joursEntre(j.jour, dernier.fin) <= 1;
    if (contigu) {
      dernier.fin = finDeJour(j.jour);
    } else {
      conflits.push({
        debut: minuit(j.jour),
        fin: finDeJour(j.jour),
        details:
          "Plusieurs règles attribuent des parents différents sur cette période. À vérifier.",
      });
    }
  }
  return conflits;
}
