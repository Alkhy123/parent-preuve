"use client";

import CourrierModele from "@/components/CourrierModele";
import { v, dateFr } from "@/lib/courrierHelpers";

export default function Page() {
  return (
    <CourrierModele
      titre="Remboursement de frais"
      sousTitre="Demander à l'autre parent sa part sur des frais partagés."
      champs={[
        { nom: "nature", label: "Nature des frais", placeholder: "ex. cantine, activité sportive..." },
        { nom: "montantTotal", label: "Montant total (€)", type: "number", placeholder: "ex. 180" },
        { nom: "partDue", label: "Part due par l'autre parent (€)", type: "number", placeholder: "ex. 90" },
        { nom: "dateLimite", label: "Date limite de paiement", type: "date" },
      ]}
      objet={() => "Demande de remboursement de frais relatifs à l'enfant"}
      corps={(d, vals) => {
        const civ = v(d?.autre_parent_civilite, "Madame, Monsieur");
        const rg = d?.jugement_numero_rg ? ` (RG n° ${d.jugement_numero_rg})` : "";
        return `${civ},

Par jugement rendu le ${dateFr(d?.jugement_date, "[date du jugement]")} par ${v(d?.jugement_juridiction, "[juridiction]")}${rg}, la prise en charge partagée des frais relatifs à notre/nos enfant(s) a été fixée.

J'ai engagé des frais au titre de ${v(vals.nature, "[nature des frais]")}, pour un montant total de ${v(vals.montantTotal, "[montant]")} €. La part vous incombant s'élève à ${v(vals.partDue, "[part due]")} €.${vals.reference?.trim() ? "\n\n" + vals.reference.trim() : ""}

Je vous remercie de bien vouloir me régler cette somme avant le ${vals.dateLimite ? dateFr(vals.dateLimite) : "[date limite]"}. Les justificatifs correspondants sont à votre disposition.${vals.precisions?.trim() ? "\n\n" + vals.precisions.trim() : ""}

Je vous prie d'agréer, ${civ}, l'expression de mes salutations distinguées.

${v(d?.declarant_prenom, "")} ${v(d?.declarant_nom, "")}`;
      }}
    />
  );
}
