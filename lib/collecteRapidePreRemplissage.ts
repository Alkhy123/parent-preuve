import type { Proposition } from "@/lib/preRemplissage";

export type BrouillonCollectePourPreRemplissage = {
  type?: string;
  href: string;
  date?: string;
  titre?: string;
  enfant?: string;
  contenu?: string;
};

export type ResultatPreRemplissageCollecte = {
  href: string;
  proposition: Proposition | null;
  labelAction: string;
};

function texteOuNull(valeur: string | undefined) {
  const texte = valeur?.trim();

  return texte ? texte : null;
}

function dateOuNull(valeur: string | undefined) {
  const texte = valeur?.trim();

  if (!texte) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(texte) ? texte : null;
}

export function construirePreRemplissageCollecte(
  brouillon: BrouillonCollectePourPreRemplissage,
): ResultatPreRemplissageCollecte {
  const href = brouillon.href;
  const titre = texteOuNull(brouillon.titre);
  const enfant = texteOuNull(brouillon.enfant);
  const date = dateOuNull(brouillon.date);
  const contenu = texteOuNull(brouillon.contenu);

  if (href === "/journal") {
    return {
      href,
      labelAction: "Préremplir le journal",
      proposition: {
        type: "journal",
        champs: {
          titre,
          categorie: "Autre",
          date,
          description: contenu,
          enfant,
        },
        avertissements: [
          "Préremplissage issu d’un brouillon de collecte rapide.",
          "Vérifiez les champs avant d’enregistrer.",
        ],
      },
    };
  }

  if (href === "/frais") {
    return {
      href,
      labelAction: "Préremplir les frais",
      proposition: {
        type: "frais",
        champs: {
          libelle: titre,
          categorie: "Autre",
          montant: null,
          date,
          enfant,
        },
        avertissements: [
          "Préremplissage issu d’un brouillon de collecte rapide.",
          "Complétez le montant et le justificatif avant d’enregistrer.",
        ],
      },
    };
  }

  if (href === "/pension") {
    return {
      href,
      labelAction: "Préremplir la pension",
      proposition: {
        type: "pension",
        champs: {
          mois: date,
          montant_du: null,
          montant_paye: null,
          date_paiement: date,
        },
        avertissements: [
          "Préremplissage issu d’un brouillon de collecte rapide.",
          "Complétez les montants avant d’enregistrer.",
        ],
      },
    };
  }

  return {
    href,
    proposition: null,
    labelAction: "Ouvrir le module",
  };
}
