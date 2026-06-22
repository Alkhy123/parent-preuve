// lib/avocat/syntheses.ts
//
// Synthèses contextuelles : à partir des MÊMES données collectées que le
// dossier avocat (collecterDossierAvocat -> DossierTransmissionAvocatV1), on
// produit des RenduDossierAvocat focalisés selon le besoin du moment.
//
// Fonction PURE : aucun Supabase, aucun React, aucun jsPDF. Le rendu est
// consommé par la même prévisualisation et le même export PDF que le dossier
// avocat. Vocabulaire factuel uniquement : jamais de conseil sur ce qu'il faut
// demander au juge, jamais de promesse de recevabilité.

import { euros } from "@/lib/dossierCalculs";
import {
  rendreDossierAvocat,
  AVERTISSEMENT_PREPARATOIRE,
  MENTION_PIED,
} from "@/lib/avocat/rendreDossierAvocat";
import type {
  DossierTransmissionAvocatV1,
  RenduDossierAvocat,
  SectionRendue,
  BlocRendu,
} from "@/lib/avocat/types";

export type TypeSynthese = "avocat" | "audience" | "pension" | "difficultes";

// Catalogue affiché dans le sélecteur (ordre stable).
export const SYNTHESES: {
  cle: TypeSynthese;
  libelle: string;
  description: string;
}[] = [
  {
    cle: "avocat",
    libelle: "Préparation rendez-vous avocat",
    description: "Dossier complet de transmission, factuel et daté.",
  },
  {
    cle: "audience",
    libelle: "Préparation audience",
    description: "Cadre, chronologie et chiffrages utiles pour l'audience.",
  },
  {
    cle: "pension",
    libelle: "Synthèse pension",
    description: "Attendu, reçu, reste dû et historique des paiements.",
  },
  {
    cle: "difficultes",
    libelle: "Synthèse difficultés",
    description: "Faits de difficulté d'exécution, datés et factuels.",
  },
];

// Doit correspondre à la catégorie du journal (sous-bloc 1).
const THEME_DIFFICULTE = "Difficulté d'exécution";

const RAPPEL_PREUVE =
  "Horodatage non qualifié, pas un constat de commissaire de justice.";

const LIBELLE_TYPE: Record<string, string> = {
  fait: "Fait",
  frais: "Frais",
  pension: "Pension",
  preuve: "Preuve",
};

// ── Petits constructeurs de blocs (triviaux, locaux pour ne pas modifier le
//    rendu du dossier avocat qui fonctionne) ─────────────────────────────────

function paragraphe(texte: string): BlocRendu {
  return { type: "paragraphe", texte };
}

function champs(paires: { label: string; valeur: string }[]): BlocRendu {
  return {
    type: "champs",
    champs: paires.map((p) => ({
      label: p.label,
      valeur: p.valeur.trim() === "" ? "Non renseigné" : p.valeur,
    })),
  };
}

function dateFr(iso: string): string {
  const d = iso.slice(0, 10);
  const [a, m, j] = d.split("-");
  return a && m && j ? `${j}/${m}/${a}` : d;
}

function libellePension(solde: number): string {
  if (solde > 0) return `reste dû ${euros(solde)}`;
  if (solde < 0) return `trop-perçu ${euros(-solde)}`;
  return "à jour";
}

// Détails d'une entrée chronologie, avec rappel obligatoire sur les preuves.
function detailsEntree(e: {
  type: string;
  details: string | null;
}): string {
  const base = e.details?.trim() ?? "";
  if (e.type !== "preuve") return base;
  return base ? `${base} — ${RAPPEL_PREUVE}` : RAPPEL_PREUVE;
}

// Page de garde + avertissement communs à toutes les synthèses.
function sectionsEntete(
  d: DossierTransmissionAvocatV1,
  titre: string,
): SectionRendue[] {
  return [
    {
      id: "page-de-garde",
      titre,
      blocs: [
        champs([
          { label: "Procédure", valeur: d.procedureEtiquette },
          { label: "Généré le", valeur: dateFr(d.genereLe) },
        ]),
        paragraphe(MENTION_PIED),
      ],
    },
    {
      id: "avertissement",
      titre: "Avertissement",
      blocs: [paragraphe(AVERTISSEMENT_PREPARATOIRE)],
    },
  ];
}

// ── Préparation d'audience ────────────────────────────────────────────────────

function syntheseAudience(d: DossierTransmissionAvocatV1): RenduDossierAvocat {
  const sections: SectionRendue[] = sectionsEntete(d, "Préparation d'audience");

  sections.push({
    id: "cadre-procedural",
    titre: "Cadre procédural",
    blocs: [
      champs([
        { label: "Juridiction", valeur: d.cadre.juridiction },
        { label: "Numéro RG", valeur: d.cadre.numeroRg },
        { label: "Type de décision", valeur: d.cadre.typeDecision },
        { label: "Prochaine audience", valeur: d.cadre.audienceProchaine },
        { label: "Résidence / modalités", valeur: d.cadre.residenceModalite },
      ]),
    ],
  });

  sections.push({
    id: "synthese",
    titre: "Synthèse factuelle",
    blocs: d.resumeTexte
      .split("\n")
      .filter((l) => l.trim() !== "")
      .map(paragraphe),
  });

  sections.push({
    id: "chronologie",
    titre: "Chronologie utile",
    blocs:
      d.chronologie.length > 0
        ? [
            {
              type: "tableau",
              entetes: ["Date", "Type", "Titre", "Détails", "Montant", "Statut"],
              lignes: d.chronologie.map((e) => [
                e.date,
                LIBELLE_TYPE[e.type] ?? e.type,
                e.titre,
                detailsEntree(e),
                e.montant != null ? euros(e.montant) : "",
                e.statut ?? "",
              ]),
            },
          ]
        : [paragraphe("Aucun élément chronologique enregistré.")],
  });

  sections.push({
    id: "chiffrages",
    titre: "Chiffrages",
    blocs: [
      champs([
        { label: "Pension", valeur: libellePension(d.chiffrage.pensionSolde) },
        {
          label: "Frais",
          valeur:
            d.chiffrage.fraisResteDu > 0
              ? `reste dû ${euros(d.chiffrage.fraisResteDu)}`
              : "à jour",
        },
        {
          label: "Frais sans justificatif",
          valeur: String(d.chiffrage.fraisSansJustificatif),
        },
      ]),
    ],
  });

  sections.push({
    id: "points-a-verifier",
    titre: "Points à vérifier",
    blocs: d.pointsAVerifier.map((p) => paragraphe(`• ${p}`)),
  });

  return {
    titre: "Préparation d'audience",
    sousTitre: d.procedureEtiquette,
    sections,
  };
}

// ── Synthèse pension ──────────────────────────────────────────────────────────

function synthesePension(d: DossierTransmissionAvocatV1): RenduDossierAvocat {
  const sections: SectionRendue[] = sectionsEntete(d, "Synthèse pension");
  const lignes = d.chronologie.filter((e) => e.type === "pension");

  sections.push({
    id: "situation",
    titre: "Situation de la pension",
    blocs: [
      champs([{ label: "Solde", valeur: libellePension(d.chiffrage.pensionSolde) }]),
      paragraphe(
        "Montants calculés à partir des saisies. Éléments factuels, soumis à l'appréciation du juge.",
      ),
    ],
  });

  sections.push({
    id: "historique",
    titre: "Historique des paiements",
    blocs:
      lignes.length > 0
        ? [
            {
              type: "tableau",
              entetes: ["Mois", "Détails", "Montant attendu", "Statut"],
              lignes: lignes.map((e) => [
                e.date,
                detailsEntree(e),
                e.montant != null ? euros(e.montant) : "",
                e.statut ?? "",
              ]),
            },
          ]
        : [paragraphe("Aucun paiement de pension enregistré.")],
  });

  return {
    titre: "Synthèse pension",
    sousTitre: d.procedureEtiquette,
    sections,
  };
}

// ── Synthèse difficultés ──────────────────────────────────────────────────────

function syntheseDifficultes(d: DossierTransmissionAvocatV1): RenduDossierAvocat {
  const sections: SectionRendue[] = sectionsEntete(d, "Synthèse des difficultés");
  const theme = d.faitsParTheme.find((t) => t.theme === THEME_DIFFICULTE);

  sections.push({
    id: "difficultes",
    titre: "Difficultés d'exécution",
    blocs:
      theme && theme.faits.length > 0
        ? [
            {
              type: "tableau",
              entetes: ["Date", "Élément", "Détails"],
              lignes: theme.faits.map((f) => [f.date, f.titre, f.details]),
            },
          ]
        : [
            paragraphe(
              "Aucun fait de difficulté d'exécution enregistré. Ajoutez-en depuis le " +
                "journal en choisissant la catégorie « Difficulté d'exécution ».",
            ),
          ],
  });

  sections.push({
    id: "points-a-verifier",
    titre: "Points à vérifier",
    blocs: [
      paragraphe("• Vérifier que chaque difficulté est datée et décrite factuellement."),
      paragraphe("• Rattacher une pièce à chaque difficulté quand c'est possible."),
    ],
  });

  return {
    titre: "Synthèse des difficultés",
    sousTitre: d.procedureEtiquette,
    sections,
  };
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

export function construireSynthese(
  type: TypeSynthese,
  d: DossierTransmissionAvocatV1,
): RenduDossierAvocat {
  switch (type) {
    case "audience":
      return syntheseAudience(d);
    case "pension":
      return synthesePension(d);
    case "difficultes":
      return syntheseDifficultes(d);
    case "avocat":
    default:
      return rendreDossierAvocat(d);
  }
}
