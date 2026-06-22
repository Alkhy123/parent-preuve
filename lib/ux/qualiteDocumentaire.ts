// lib/ux/qualiteDocumentaire.ts
//
// Calcul PURE et LECTURE SEULE de la "qualité documentaire" d'un élément du
// dossier (fait, frais, pension, document...). Aucun accès Supabase ni React.
//
// Objectif : aider l'utilisateur à voir, factuellement, ce qui est renseigné et
// ce qui manque pour rendre un élément clair et exploitable (date, pièce, etc.).
//
// Vocabulaire IMPOSÉ et non négociable :
//   Documentation faible / correcte / complète.
// Ne JAMAIS employer : "preuve forte", "recevable", "certifié", ni aucune
// promesse de valeur juridique. Ce calcul n'évalue PAS la portée d'une preuve :
// il mesure seulement si les informations utiles sont présentes.

export type NiveauDoc = "faible" | "correcte" | "complète";

// Descripteur générique d'un élément.
// Pour chaque critère :
//   true        = renseigné ;
//   false       = applicable mais manquant (compté + listé dans `manquants`) ;
//   null/absent = non applicable (ignoré, ne pénalise pas).
// C'est l'appelant qui décide de l'applicabilité (ex. un fait « général » sans
// enfant passe `enfant: null` ; une pension sans pièce passe `pieceLiee: null`).
export type ElementDoc = {
  date?: boolean | null;
  enfant?: boolean | null;
  procedure?: boolean | null;
  pieceLiee?: boolean | null;
  description?: boolean | null;
  montant?: boolean | null; // pour les éléments financiers (frais, pension)
};

export type QualiteDoc = {
  niveau: NiveauDoc;
  score: number; // critères applicables renseignés
  total: number; // critères applicables
  manquants: string[]; // libellés des critères applicables non renseignés
};

// Libellés lisibles des critères (ordre d'affichage stable).
const CRITERES: { cle: keyof ElementDoc; label: string }[] = [
  { cle: "date", label: "Date" },
  { cle: "enfant", label: "Enfant rattaché" },
  { cle: "procedure", label: "Procédure" },
  { cle: "pieceLiee", label: "Pièce liée" },
  { cle: "description", label: "Description factuelle" },
  { cle: "montant", label: "Montant" },
];

/**
 * Évalue la qualité documentaire d'un élément.
 * Un critère absent (null/undefined) est ignoré. Le niveau découle de la part
 * de critères applicables qui sont renseignés.
 */
export function evaluerQualiteDoc(el: ElementDoc): QualiteDoc {
  const applicables = CRITERES.filter(
    (c) => el[c.cle] !== undefined && el[c.cle] !== null,
  );
  const score = applicables.filter((c) => el[c.cle] === true).length;
  const manquants = applicables
    .filter((c) => el[c.cle] === false)
    .map((c) => c.label);
  const total = applicables.length;
  const ratio = total === 0 ? 1 : score / total;

  const niveau: NiveauDoc =
    ratio >= 1 ? "complète" : ratio >= 0.6 ? "correcte" : "faible";

  return { niveau, score, total, manquants };
}

/**
 * Libellé + classe de badge sobres pour un niveau.
 * Pas de rouge alarmant : « faible » reste une invitation à compléter, pas une
 * erreur ni un jugement sur la valeur de l'élément.
 */
export function badgeQualite(niveau: NiveauDoc): {
  label: string;
  classe: string;
} {
  if (niveau === "complète")
    return { label: "Documentation complète", classe: "badge badge-succes" };
  if (niveau === "correcte")
    return { label: "Documentation correcte", classe: "badge badge-info" };
  return { label: "Documentation faible", classe: "badge badge-attention" };
}
