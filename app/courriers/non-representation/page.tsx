"use client";

import CourrierModele from "@/components/CourrierModele";
import { v, dateFr } from "@/lib/courrierHelpers";

export default function Page() {
  return (
    <CourrierModele
      titre="Non-représentation d'enfant"
      sousTitre="Signaler un manquement au droit de visite et d'hébergement."
      champs={[
        { nom: "dateFait", label: "Date du manquement", type: "date" },
        { nom: "modalite", label: "Modalité prévue", placeholder: "ex. un week-end sur deux" },
        { nom: "circonstances", label: "Circonstances (faits)", placeholder: "Décrivez les faits, sans jugement de valeur.", pleineLargeur: true },
      ]}
      objet={() => "Manquement aux modalités de droit de visite et d'hébergement"}
      corps={(d, vals) => {
        const civ = v(d?.autre_parent_civilite, "Madame, Monsieur");
        const rg = d?.jugement_numero_rg ? ` (RG n° ${d.jugement_numero_rg})` : "";
        return `${civ},

Par jugement rendu le ${dateFr(d?.jugement_date, "[date du jugement]")} par ${v(d?.jugement_juridiction, "[juridiction]")}${rg}, les modalités du droit de visite et d'hébergement ont été fixées (${v(vals.modalite, "[modalité prévue]")}).

Le ${vals.dateFait ? dateFr(vals.dateFait) : "[date]"}, ces modalités n'ont pas été respectées. ${v(vals.circonstances, "[circonstances]")}${vals.reference?.trim() ? "\n\n" + vals.reference.trim() : ""}

Je vous demande de veiller au strict respect des modalités fixées par le juge.${vals.precisions?.trim() ? "\n\n" + vals.precisions.trim() : ""}

Je vous prie d'agréer, ${civ}, l'expression de mes salutations distinguées.

${v(d?.declarant_prenom, "")} ${v(d?.declarant_nom, "")}`;
      }}
    />
  );
}