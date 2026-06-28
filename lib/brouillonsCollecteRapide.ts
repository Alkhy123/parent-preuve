export const CLE_BROUILLONS_COLLECTE_RAPIDE =
  "parent-preuve:brouillons-collecte-rapide";

export type BrouillonCollecteRapideLocal = {
  id: string;
  type: string;
  href: string;
  date: string;
  titre: string;
  enfant: string;
  contenu: string;
  creeLe: string;
};

function estBrouillonCollecteRapide(
  valeur: unknown,
): valeur is BrouillonCollecteRapideLocal {
  if (!valeur || typeof valeur !== "object") {
    return false;
  }

  const brouillon = valeur as Record<string, unknown>;

  return (
    typeof brouillon.id === "string" &&
    typeof brouillon.type === "string" &&
    typeof brouillon.href === "string" &&
    typeof brouillon.date === "string" &&
    typeof brouillon.titre === "string" &&
    typeof brouillon.enfant === "string" &&
    typeof brouillon.contenu === "string" &&
    typeof brouillon.creeLe === "string"
  );
}

export function normaliserBrouillonsCollecteRapide(
  valeur: unknown,
): BrouillonCollecteRapideLocal[] {
  if (!Array.isArray(valeur)) {
    return [];
  }

  return valeur.filter(estBrouillonCollecteRapide);
}

export function lireBrouillonsCollecteRapideDepuisLocalStorage(): BrouillonCollecteRapideLocal[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const brut = window.localStorage.getItem(CLE_BROUILLONS_COLLECTE_RAPIDE);

    if (!brut) {
      return [];
    }

    return normaliserBrouillonsCollecteRapide(JSON.parse(brut));
  } catch {
    return [];
  }
}
