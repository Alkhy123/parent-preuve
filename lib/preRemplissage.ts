// lib/preRemplissage.ts
//
// Lib PURE (aucun accès navigateur, réutilisable mobile / serveur).
// Rôle : définir le CONTRAT du pré-remplissage assistant et ASSAINIR la sortie IA.
//
// Principe non négociable : l'IA propose, l'utilisateur valide.
// Cette lib ne fait QUE nettoyer une proposition. Elle n'écrit jamais en base,
// ne qualifie rien juridiquement et n'invente aucune valeur : un champ absent
// ou douteux devient null (l'utilisateur le saisira lui-même à l'écran).

// Type de proposition. "aucun" = la phrase ne correspond à aucun écran connu.
export type TypeProposition = "frais" | "journal" | "pension" | "aucun";

// Listes FERMÉES, strictement identiques aux <select> des écrans /frais et /journal.
export const CATEGORIES_FRAIS = [
  "Santé",
  "École",
  "Activités",
  "Vêtements",
  "Garde",
  "Autre",
] as const;

export const CATEGORIES_JOURNAL = [
  "Remise d'enfant",
  "Santé",
  "École",
  "Communication",
  "Frais",
  "Autre",
] as const;

export type CategorieFrais = (typeof CATEGORIES_FRAIS)[number];
export type CategorieJournal = (typeof CATEGORIES_JOURNAL)[number];

// Champs proposés pour une dépense (écran /frais).
export type ChampsFrais = {
  libelle: string | null;
  categorie: CategorieFrais; // toujours une valeur sûre (défaut "Autre")
  montant: number | null; // euros, nombre fini >= 0, sinon null
  date: string | null; // AAAA-MM-JJ réellement valide, sinon null
  enfant: string | null; // prénom / alias en TEXTE (jamais d'UUID)
};

// Champs proposés pour un fait (écran /journal).
export type ChampsJournal = {
  titre: string | null;
  categorie: CategorieJournal; // toujours une valeur sûre (défaut "Autre")
  date: string | null; // AAAA-MM-JJ réellement valide, sinon null
  description: string | null;
  enfant: string | null; // prénom / alias en TEXTE (jamais d'UUID)
};

// Champs proposés pour un paiement de pension (écran /pension).
// Pas d'enfant : la pension se gère par procédure, pas par enfant.
// Le montant attendu (montant_du) vient en principe du jugement : si la phrase
// ne le donne pas explicitement, il reste null et l'utilisateur le complète.
export type ChampsPension = {
  mois: string | null; // AAAA-MM réellement valide, sinon null (champ <input type="month">)
  montant_du: number | null; // euros, nombre fini >= 0, sinon null
  montant_paye: number | null; // euros, nombre fini >= 0, sinon null
  date_paiement: string | null; // AAAA-MM-JJ réellement valide, sinon null
};

// Contrat de sortie renvoyé au formulaire. Union discriminée par "type".
export type Proposition =
  | { type: "frais"; champs: ChampsFrais; avertissements: string[] }
  | { type: "journal"; champs: ChampsJournal; avertissements: string[] }
  | { type: "pension"; champs: ChampsPension; avertissements: string[] }
  | { type: "aucun"; champs: null; avertissements: string[] };

// Bornes anti-abus (cohérentes avec la limite de 500 caractères de la phrase).
const LONGUEUR_TEXTE_MAX = 300;
const LONGUEUR_AVERTISSEMENT_MAX = 200;
const NB_AVERTISSEMENTS_MAX = 5;
const MONTANT_MAX = 1_000_000; // garde-fou : au-delà, on considère la valeur douteuse -> null

// --- Petits assainisseurs internes (purs) ---

// Texte propre ou null : impose une chaîne, retire les espaces de bord, coupe à une longueur max.
function texteOuNull(valeur: unknown): string | null {
  if (typeof valeur !== "string") return null;
  const t = valeur.trim();
  if (t === "") return null;
  return t.slice(0, LONGUEUR_TEXTE_MAX);
}

// Montant en euros ou null : accepte un nombre ou une chaîne numérique ("45", "45,50").
// N'accepte que les nombres finis >= 0 et sous le garde-fou. Sinon null (l'IA n'invente pas).
function montantOuNull(valeur: unknown): number | null {
  let n: number;
  if (typeof valeur === "number") {
    n = valeur;
  } else if (typeof valeur === "string") {
    const t = valeur.trim().replace(",", ".");
    if (t === "") return null;
    n = Number(t);
  } else {
    return null;
  }
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > MONTANT_MAX) return null;
  return n;
}

// Date AAAA-MM-JJ ou null : exige le format ET une date calendaire réelle
// (ex. "2026-02-31" est rejeté). Sinon null (l'utilisateur la saisit).
function dateOuNull(valeur: unknown): string | null {
  if (typeof valeur !== "string") return null;
  const t = valeur.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return null;
  const annee = Number(m[1]);
  const mois = Number(m[2]);
  const jour = Number(m[3]);
  const d = new Date(Date.UTC(annee, mois - 1, jour));
  const reelle =
    d.getUTCFullYear() === annee &&
    d.getUTCMonth() === mois - 1 &&
    d.getUTCDate() === jour;
  return reelle ? t : null;
}

// Mois AAAA-MM ou null : exige le format ET un mois réel (01 à 12).
// Tolère une date complète AAAA-MM-JJ en ne gardant que l'année et le mois.
// Sinon null (l'utilisateur choisira le mois lui-même).
function moisOuNull(valeur: unknown): string | null {
  if (typeof valeur !== "string") return null;
  const t = valeur.trim();
  const m = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(t);
  if (!m) return null;
  const mois = Number(m[2]);
  if (mois < 1 || mois > 12) return null;
  return `${m[1]}-${m[2]}`;
}

// Catégorie forcée dans une liste fermée, sinon valeur sûre "Autre".
function categorieDansListe<T extends string>(
  valeur: unknown,
  liste: readonly T[]
): T {
  if (typeof valeur === "string") {
    const trouvee = liste.find((c) => c === valeur);
    if (trouvee) return trouvee;
  }
  return "Autre" as T;
}

// Avertissements : tableau de textes propres, bornés en nombre et en longueur.
function avertissementsPropres(valeur: unknown): string[] {
  if (!Array.isArray(valeur)) return [];
  const sortie: string[] = [];
  for (const item of valeur) {
    if (typeof item !== "string") continue;
    const t = item.trim();
    if (t === "") continue;
    sortie.push(t.slice(0, LONGUEUR_AVERTISSEMENT_MAX));
    if (sortie.length >= NB_AVERTISSEMENTS_MAX) break;
  }
  return sortie;
}

// Lit un objet "champs" potentiellement inconnu sans planter.
function lireChamps(brut: unknown): Record<string, unknown> {
  if (brut && typeof brut === "object" && !Array.isArray(brut)) {
    return brut as Record<string, unknown>;
  }
  return {};
}

// --- Fonction publique : assainit la sortie brute de l'IA en une Proposition sûre ---
//
// `brut` est typé `unknown` : on ne fait JAMAIS confiance à la forme renvoyée par l'IA.
// Toute valeur absente ou non conforme retombe sur null (ou "Autre" pour la catégorie).
export function nettoyerProposition(brut: unknown): Proposition {
  const racine = lireChamps(brut);
  const avertissements = avertissementsPropres(racine.avertissements);
  const type = racine.type;

  if (type === "frais") {
    const c = lireChamps(racine.champs);
    return {
      type: "frais",
      champs: {
        libelle: texteOuNull(c.libelle),
        categorie: categorieDansListe<CategorieFrais>(c.categorie, CATEGORIES_FRAIS),
        montant: montantOuNull(c.montant),
        date: dateOuNull(c.date),
        enfant: texteOuNull(c.enfant),
      },
      avertissements,
    };
  }

  if (type === "journal") {
    const c = lireChamps(racine.champs);
    return {
      type: "journal",
      champs: {
        titre: texteOuNull(c.titre),
        categorie: categorieDansListe<CategorieJournal>(c.categorie, CATEGORIES_JOURNAL),
        date: dateOuNull(c.date),
        description: texteOuNull(c.description),
        enfant: texteOuNull(c.enfant),
      },
      avertissements,
    };
  }

  if (type === "pension") {
    const c = lireChamps(racine.champs);
    return {
      type: "pension",
      champs: {
        mois: moisOuNull(c.mois),
        montant_du: montantOuNull(c.montant_du),
        montant_paye: montantOuNull(c.montant_paye),
        date_paiement: dateOuNull(c.date_paiement),
      },
      avertissements,
    };
  }


  // Tout autre cas (y compris "aucun" ou type inconnu) : proposition vide et sûre.
  return { type: "aucun", champs: null, avertissements };
}
// Clé de transport du pré-remplissage via sessionStorage (source unique partagée
// par l'assistant qui écrit, et les écrans /frais et /journal qui lisent une fois
// puis effacent). On NE passe PAS par l'URL : un prénom/montant ne doit jamais
// finir dans l'URL, l'historique ou les journaux.
export const CLE_SESSION_PREREMPLISSAGE = "pp_preremplissage";