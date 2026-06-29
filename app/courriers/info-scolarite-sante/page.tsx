"use client";

import CourrierModele from "@/components/CourrierModele";
import { v, dateFr } from "@/lib/courrierHelpers";

export default function Page() {
  return (
    <CourrierModele
      titre="Demande d'information (scolarité / santé)"
      sousTitre="Demander à l'autre parent des informations sur l'enfant."
      champs={[
        { nom: "domaine", label: "Domaine", placeholder: "ex. scolarité, santé, activité" },
        { nom: "demande", label: "Informations demandées", placeholder: "Précisez ce que vous demandez.", pleineLargeur: true },
        { nom: "dateLimite", label: "Réponse souhaitée avant le", type: "date" },
      ]}
      objet={(d, vals) => `Demande d'information concernant ${v(vals.domaine, "l'enfant")}`}
      corps={(d, vals) => {
        const civ = v(d?.autre_parent_civilite, "Madame, Monsieur");
        const rg = d?.jugement_numero_rg ? ` (RG n° ${d.jugement_numero_rg})` : "";
        return `${civ},

En ma qualité de parent exerçant l'autorité parentale, et conformément au jugement rendu le ${dateFr(d?.jugement_date, "[date du jugement]")} par ${v(d?.jugement_juridiction, "[juridiction]")}${rg}, je souhaite être tenu informé de ce qui concerne notre/nos enfant(s).

Je vous remercie de bien vouloir me communiquer les informations suivantes : ${v(vals.demande, "[informations demandées]")}.${vals.reference?.trim() ? "\n\n" + vals.reference.trim() : ""}

Je vous saurais gré de m'apporter ces éléments avant le ${vals.dateLimite ? dateFr(vals.dateLimite) : "[date]"}.${vals.precisions?.trim() ? "\n\n" + vals.precisions.trim() : ""}

Je vous prie d'agréer, ${civ}, l'expression de mes salutations distinguées.

${v(d?.declarant_prenom, "")} ${v(d?.declarant_nom, "")}`;
      }}
    />
  );
}
