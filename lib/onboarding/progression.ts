// lib/onboarding/progression.ts
//
// Sauvegarde progressive de la POSITION dans le wizard (etape courante +
// etapes completees) en localStorage. Les DONNEES, elles, sont enregistrees
// dans les vraies tables a chaque etape (voir lib/onboarding/sauvegarde.ts).
//
// Choix V1 sans migration : seule la position est locale au navigateur ; si
// l'utilisateur change d'appareil, ses donnees restent en base et le wizard
// repart proprement depuis le debut sans rien perdre.

import {
  type EtapeOnboarding,
  PREMIERE_ETAPE,
  ETAPES_ONBOARDING,
} from "@/lib/onboarding/types";

const CLE = "onboarding_progression";

export type Progression = {
  demarre: boolean;
  etapeCourante: EtapeOnboarding;
  completees: EtapeOnboarding[];
  termine: boolean;
};

const PROGRESSION_INITIALE: Progression = {
  demarre: false,
  etapeCourante: PREMIERE_ETAPE,
  completees: [],
  termine: false,
};

function estEtapeConnue(x: unknown): x is EtapeOnboarding {
  return (
    typeof x === "string" && ETAPES_ONBOARDING.some((e) => e.id === x)
  );
}

/** Lit la progression memorisee localement (valeurs prudentes si absente/illisible). */
export function lireProgression(): Progression {
  if (typeof window === "undefined") return { ...PROGRESSION_INITIALE };
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return { ...PROGRESSION_INITIALE };
    const p = JSON.parse(brut) as Partial<Progression>;
    return {
      demarre: !!p.demarre,
      etapeCourante: estEtapeConnue(p.etapeCourante)
        ? p.etapeCourante
        : PREMIERE_ETAPE,
      completees: Array.isArray(p.completees)
        ? p.completees.filter(estEtapeConnue)
        : [],
      termine: !!p.termine,
    };
  } catch {
    return { ...PROGRESSION_INITIALE };
  }
}

function ecrire(p: Progression) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(p));
  } catch {
    // Stockage indisponible (mode prive, quota) : on ignore sans bloquer.
  }
}

/** Marque le wizard comme demarre et positionne l'etape courante. */
export function demarrerProgression(etape: EtapeOnboarding): Progression {
  const p = lireProgression();
  const suivante: Progression = {
    ...p,
    demarre: true,
    termine: false,
    etapeCourante: etape,
  };
  ecrire(suivante);
  return suivante;
}

/** Definit l'etape courante (sans la marquer completee). */
export function definirEtapeCourante(etape: EtapeOnboarding): Progression {
  const p = lireProgression();
  const suivante: Progression = { ...p, demarre: true, etapeCourante: etape };
  ecrire(suivante);
  return suivante;
}

/** Marque une etape comme completee (idempotent). */
export function marquerEtapeCompletee(etape: EtapeOnboarding): Progression {
  const p = lireProgression();
  const completees = p.completees.includes(etape)
    ? p.completees
    : [...p.completees, etape];
  const suivante: Progression = { ...p, demarre: true, completees };
  ecrire(suivante);
  return suivante;
}

/** Marque le parcours comme termine. */
export function terminerProgression(): Progression {
  const p = lireProgression();
  const suivante: Progression = { ...p, termine: true };
  ecrire(suivante);
  return suivante;
}

/** Efface la progression locale (repart de zero). */
export function reinitialiserProgression() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // ignore
  }
}
