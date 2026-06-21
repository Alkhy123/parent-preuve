// lib/onboarding/types.ts
//
// Definitions partagees de l'assistant de premiere utilisation (wizard).
// Aucune dependance runtime : types + liste ordonnee des etapes.

export type EtapeOnboarding =
  | "vos-informations"
  | "procedure"
  | "autre-parent"
  | "enfants"
  | "jugement"
  | "validation-regles"
  | "calendrier"
  | "resume";

export type DefinitionEtape = {
  id: EtapeOnboarding;
  titre: string; // titre complet de l'etape
  titreCourt: string; // libelle court pour la barre de progression
};

// Ordre du parcours. L'ordre suit le modele de donnees : une procedure (le
// conteneur) doit exister avant d'y rattacher l'autre parent puis les enfants.
export const ETAPES_ONBOARDING: DefinitionEtape[] = [
  { id: "vos-informations", titre: "Vos informations", titreCourt: "Vous" },
  { id: "procedure", titre: "La procédure", titreCourt: "Procédure" },
  { id: "autre-parent", titre: "L'autre parent", titreCourt: "Autre parent" },
  { id: "enfants", titre: "Vos enfants", titreCourt: "Enfants" },
  { id: "jugement", titre: "Le jugement", titreCourt: "Jugement" },
  { id: "validation-regles", titre: "Les règles", titreCourt: "Règles" },
  { id: "calendrier", titre: "Le calendrier de garde", titreCourt: "Calendrier" },
  { id: "resume", titre: "Résumé", titreCourt: "Résumé" },
];

export const PREMIERE_ETAPE: EtapeOnboarding = ETAPES_ONBOARDING[0].id;

/** Index (0-based) d'une etape dans le parcours, ou -1 si inconnue. */
export function indexEtape(id: EtapeOnboarding): number {
  return ETAPES_ONBOARDING.findIndex((e) => e.id === id);
}
