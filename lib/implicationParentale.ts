// lib/implicationParentale.ts
// Source unique du marqueur « implication parentale ».
// Documente un FAIT observable (rendez-vous honoré, démarche faite),
// jamais une qualification du parent. Réutilisable web ET mobile
// (aucun accès navigateur ici).

// Valeurs stockées en base dans events.implication_categorie
// et documents.implication_categorie (text, NULL = non marqué).
export const CATEGORIES_IMPLICATION = [
    { valeur: "sante", libelle: "Santé" },
    { valeur: "scolarite", libelle: "Scolarité" },
    { valeur: "activites", libelle: "Activités" },
    { valeur: "quotidien", libelle: "Quotidien" },
  ] as const;
  
  export type CategorieImplication =
    (typeof CATEGORIES_IMPLICATION)[number]["valeur"];
  
  // Renvoie le libellé lisible d'une catégorie, ou null si non marqué / inconnu.
  export function libelleImplication(
    valeur: string | null | undefined
  ): string | null {
    if (!valeur) return null;
    const trouve = CATEGORIES_IMPLICATION.find((c) => c.valeur === valeur);
    return trouve ? trouve.libelle : null;
  }