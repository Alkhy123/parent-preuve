// lib/avocat/rendreDossierAvocat.ts
//
// Fonction PURE : transforme les donnees collectees en une representation de
// rendu neutre (sections -> blocs), consommee par la previsualisation et le PDF.
// Aucun Supabase, aucun React, aucun jsPDF. Vocabulaire factuel uniquement.

import { euros } from "@/lib/dossierCalculs";
import type { EntreeChronologie, TypeEntree } from "@/lib/chronologie";
import type {
  DossierTransmissionAvocatV1,
  RenduDossierAvocat,
  SectionRendue,
  BlocRendu,
} from "@/lib/avocat/types";

export const TITRE_DOSSIER = "Dossier de transmission à l'avocat";

export const AVERTISSEMENT_PREPARATOIRE =
  "Ce document est un support préparatoire. Il doit être vérifié, qualifié, " +
  "arbitré et reformulé par votre avocat avant toute utilisation procédurale.";

export const MENTION_PIED =
  "Document préparatoire généré par Parent Preuve — à vérifier par le conseil.";

const RAPPEL_PREUVE =
  "Horodatage non qualifié, pas un constat de commissaire de justice.";

const LIBELLE_TYPE: Record<TypeEntree, string> = {
  fait: "Fait",
  frais: "Frais",
  pension: "Pension",
  preuve: "Preuve",
};

// "2026-06-21T..." -> "21/06/2026" (sans dependance de locale).
function dateFr(iso: string): string {
  const d = iso.slice(0, 10);
  const [a, m, j] = d.split("-");
  return a && m && j ? `${j}/${m}/${a}` : d;
}

function champs(
  paires: { label: string; valeur: string }[]
): BlocRendu {
  // On garde aussi les champs vides : ils signalent "à compléter" au lecteur.
  return {
    type: "champs",
    champs: paires.map((p) => ({
      label: p.label,
      valeur: p.valeur.trim() === "" ? "Non renseigné" : p.valeur,
    })),
  };
}

function paragraphe(texte: string): BlocRendu {
  return { type: "paragraphe", texte };
}

function ligneChronologie(
  e: EntreeChronologie,
  nomsEnfants: Record<string, string>
): string[] {
  const enfant =
    e.enfantId === null ? "Général" : nomsEnfants[e.enfantId] ?? "Enfant";
  let details = e.details?.trim() ?? "";
  if (e.type === "preuve") {
    details = details ? `${details} — ${RAPPEL_PREUVE}` : RAPPEL_PREUVE;
  }
  return [
    e.date,
    LIBELLE_TYPE[e.type],
    enfant,
    e.titre,
    details,
    e.montant != null ? euros(e.montant) : "",
    e.statut ?? "",
  ];
}

export function rendreDossierAvocat(
  d: DossierTransmissionAvocatV1
): RenduDossierAvocat {
  const sections: SectionRendue[] = [];

  // 1. Page de garde
  sections.push({
    id: "page-de-garde",
    titre: TITRE_DOSSIER,
    blocs: [
      champs([
        { label: "Procédure", valeur: d.procedureEtiquette },
        { label: "Généré le", valeur: dateFr(d.genereLe) },
      ]),
      paragraphe(MENTION_PIED),
    ],
  });

  // 2. Avertissement
  sections.push({
    id: "avertissement",
    titre: "Avertissement",
    blocs: [paragraphe(AVERTISSEMENT_PREPARATOIRE)],
  });

  // 3. Synthese executive
  sections.push({
    id: "synthese-executive",
    titre: "Synthèse exécutive",
    blocs: d.resumeTexte
      .split("\n")
      .filter((l) => l.trim() !== "")
      .map((l) => paragraphe(l)),
  });

  // 4. Parties et procedure
  sections.push({
    id: "parties-procedure",
    titre: "Parties et procédure",
    blocs: [
      champs([
        { label: "Déclarant", valeur: d.parties.declarant },
        { label: "Autre parent", valeur: d.parties.autreParent },
        { label: "Juridiction", valeur: d.cadre.juridiction },
        { label: "Numéro RG", valeur: d.cadre.numeroRg },
        { label: "Intitulé du jugement", valeur: d.cadre.intitule },
      ]),
    ],
  });

  // 5. Enfants concernes
  sections.push({
    id: "enfants",
    titre: "Enfants concernés",
    blocs: [
      paragraphe(
        d.enfants.length > 0 ? d.enfants.join(", ") : "Aucun enfant renseigné."
      ),
    ],
  });

  // 6. Cadre procedural
  sections.push({
    id: "cadre-procedural",
    titre: "Cadre procédural",
    blocs: [
      champs([
        { label: "Type de décision", valeur: d.cadre.typeDecision },
        { label: "Prochaine audience", valeur: d.cadre.audienceProchaine },
        { label: "Résidence / modalités", valeur: d.cadre.residenceModalite },
      ]),
    ],
  });

  // 7. Decisions / accords / actes anterieurs
  sections.push({
    id: "decisions-anterieures",
    titre: "Décisions, accords et actes antérieurs",
    blocs: [
      paragraphe(d.decisionsAnterieures || "Aucune décision antérieure renseignée."),
      ...(d.mesuresDejaFixees
        ? d.mesuresDejaFixees.split("\n").filter(Boolean).map((l) => paragraphe(l))
        : []),
    ],
  });

  // 8. Chronologie utile
  sections.push({
    id: "chronologie-utile",
    titre: "Chronologie utile",
    blocs:
      d.chronologie.length > 0
        ? [
            {
              type: "tableau",
              entetes: ["Date", "Type", "Enfant", "Titre", "Détails", "Montant", "Statut"],
              lignes: d.chronologie.map((e) => ligneChronologie(e, d.nomsEnfants)),
            },
          ]
        : [paragraphe("Aucun élément chronologique enregistré.")],
  });

  // 9. Expose factuel par theme
  sections.push({
    id: "expose-factuel",
    titre: "Exposé factuel par thème",
    blocs:
      d.faitsParTheme.length > 0
        ? d.faitsParTheme.flatMap((t): BlocRendu[] => [
            paragraphe(`Thème : ${t.theme}`),
            {
              type: "tableau",
              entetes: ["Date", "Élément", "Détails"],
              lignes: t.faits.map((f) => [f.date, f.titre, f.details]),
            },
          ])
        : [paragraphe("Aucun fait enregistré.")],
  });

  // 10. Frais, pension et chiffrages
  sections.push({
    id: "chiffrages",
    titre: "Frais, pension et chiffrages",
    blocs: [
      champs([
        {
          label: "Pension",
          valeur:
            d.chiffrage.pensionSolde > 0
              ? `reste dû ${euros(d.chiffrage.pensionSolde)}`
              : d.chiffrage.pensionSolde < 0
                ? `trop-perçu ${euros(-d.chiffrage.pensionSolde)}`
                : "à jour",
        },
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
      paragraphe(
        "Montants calculés à partir des saisies. Éléments factuels, soumis à l'appréciation du juge."
      ),
    ],
  });

  // 11. Preuves et documents
  sections.push({
    id: "preuves-documents",
    titre: "Preuves et documents",
    blocs:
      d.pieces.length > 0
        ? [
            {
              type: "tableau",
              entetes: ["Date", "Catégorie", "Libellé", "Origine"],
              lignes: d.pieces.map((p) => [
                p.date,
                p.categorie,
                p.libelle,
                p.origine === "preuve" ? "Preuve photo" : "Document",
              ]),
            },
          ]
        : [paragraphe("Aucune pièce enregistrée.")],
  });

  // 12. Arguments adverses connus et reponse factuelle du client
  sections.push({
    id: "arguments-reponse",
    titre: "Arguments adverses connus et réponse factuelle du client",
    blocs: [
      paragraphe(
        d.argumentsAdverses || "À compléter : éléments soulevés par la partie adverse."
      ),
      paragraphe(
        d.reponseClient || "À compléter : réponse factuelle du client, à relire avec le conseil."
      ),
    ],
  });

  // 13. Points a verifier par l'avocat
  sections.push({
    id: "points-a-verifier",
    titre: "Points à vérifier par l'avocat",
    blocs: d.pointsAVerifier.map((p) => paragraphe(`• ${p}`)),
  });

  // 14. Bordereau de pieces
  sections.push({
    id: "bordereau",
    titre: "Bordereau de pièces",
    blocs:
      d.pieces.length > 0
        ? [
            {
              type: "tableau",
              entetes: ["N°", "Date", "Catégorie", "Libellé"],
              lignes: d.pieces.map((p, i) => [
                String(i + 1),
                p.date,
                p.categorie,
                p.libelle,
              ]),
            },
          ]
        : [paragraphe("Aucune pièce à lister.")],
  });

  // 15. Message de transmission au conseil
  sections.push({
    id: "message-transmission",
    titre: "Message de transmission au conseil",
    blocs: [
      paragraphe(
        "Maître, vous trouverez ci-joint un document préparatoire rassemblant, " +
          "de manière factuelle et datée, les éléments de mon dossier. Il est destiné " +
          "à faciliter votre analyse et reste à vérifier, qualifier et reformuler par vos soins."
      ),
      paragraphe(MENTION_PIED),
    ],
  });

  return {
    titre: TITRE_DOSSIER,
    sousTitre: d.procedureEtiquette,
    sections,
  };
}
