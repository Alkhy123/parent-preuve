// lib/onboarding/etatOnboarding.ts
//
// Detection V1 du statut de l'assistant de premiere utilisation.
//
// - Lecture seule, sans migration : le statut est DEDUIT des donnees reelles
//   du dossier (memes sources que l'accueil, cloisonnees sur la procedure active).
// - Heuristique prudente : "termine" signifie seulement que les etapes de
//   demarrage semblent renseignees, jamais que le dossier est juridiquement complet.

import { chargerEtatDossier } from "@/lib/etatDossier";

export type StatutOnboarding = "non_commence" | "en_cours" | "termine";

// Signaux de demarrage observables aujourd'hui (sans table dediee).
export type SignauxOnboarding = {
  declarantComplet: boolean;
  autreParentComplet: boolean;
  auMoinsUnEnfant: boolean;
  jugementRenseigne: boolean;
};

/**
 * Derive le statut a partir des signaux. Fonction pure (testable, sans I/O).
 *  - termine        : les quatre signaux de demarrage sont presents ;
 *  - non_commence   : aucun signal present ;
 *  - en_cours       : au moins un signal, mais pas tous.
 */
export function deriverStatutOnboarding(
  signaux: SignauxOnboarding
): StatutOnboarding {
  const valeurs = [
    signaux.declarantComplet,
    signaux.autreParentComplet,
    signaux.auMoinsUnEnfant,
    signaux.jugementRenseigne,
  ];
  const presents = valeurs.filter(Boolean).length;

  if (presents === valeurs.length) return "termine";
  if (presents === 0) return "non_commence";
  return "en_cours";
}

/**
 * Charge l'etat reel du dossier et en deduit le statut d'onboarding.
 * En cas de lecture impossible, renvoie l'etat le plus prudent ("non_commence")
 * pour continuer a inviter l'utilisateur sans jamais le bloquer.
 */
export async function chargerStatutOnboarding(): Promise<StatutOnboarding> {
  try {
    const donnees = await chargerEtatDossier("", "");
    const socle = donnees.socle;
    return deriverStatutOnboarding({
      declarantComplet: !!socle?.parent1Complet,
      autreParentComplet: !!socle?.parent2Complet,
      auMoinsUnEnfant: donnees.nombreEnfants > 0,
      jugementRenseigne: !!socle?.referenceJugementRenseignee,
    });
  } catch {
    return "non_commence";
  }
}
