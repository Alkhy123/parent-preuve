"use client";

import CourrierModele from "@/components/CourrierModele";
import { v, dateFr } from "@/lib/courrierHelpers";

export default function Page() {
  return (
    <CourrierModele
      titre="Relance de pension impayée"
      sousTitre="Réclamer le paiement d'une pension alimentaire en retard."
      champs={[
        { nom: "periode", label: "Période concernée", placeholder: "ex. mars, avril et mai 2026" },
        { nom: "montant", label: "Montant dû (€)", type: "number", placeholder: "ex. 450" },
        { nom: "dateLimite", label: "Date limite de paiement", type: "date" },
      ]}
      objet={() => "Relance pour pension alimentaire impayée"}
      corps={(d, vals) => {
        const civ = v(d?.autre_parent_civilite, "Madame, Monsieur");
        const rg = d?.jugement_numero_rg ? ` (RG n° ${d.jugement_numero_rg})` : "";
        return `${civ},

Par jugement rendu le ${dateFr(d?.jugement_date, "[date du jugement]")} par ${v(d?.jugement_juridiction, "[juridiction]")}${rg}, une pension alimentaire a été mise à votre charge au titre de la contribution à l'entretien et à l'éducation de notre/nos enfant(s).

À ce jour, la pension correspondant à ${v(vals.periode, "[période concernée]")} n'a pas été réglée. La somme restant due s'élève à ${v(vals.montant, "[montant]")} €.${vals.reference?.trim() ? "\n\n" + vals.reference.trim() : ""}

Je vous demande de bien vouloir procéder à son règlement avant le ${vals.dateLimite ? dateFr(vals.dateLimite) : "[date limite]"}.${vals.precisions?.trim() ? "\n\n" + vals.precisions.trim() : ""}

À défaut de régularisation dans ce délai, je me réserve la possibilité de faire valoir mes droits par les voies appropriées.

Je vous prie d'agréer, ${civ}, l'expression de mes salutations distinguées.

${v(d?.declarant_prenom, "")} ${v(d?.declarant_nom, "")}`;
      }}
    />
  );
}
