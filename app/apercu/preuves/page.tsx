// app/apercu/preuves/page.tsx — APERCU. Données fictives, aucune logique métier.
// Ton volontairement prudent : pas de "preuve vérifiée/certifiée". On décrit des
// INFORMATIONS TECHNIQUES (empreinte présente, horodatage enregistré) sans
// préjuger de la valeur juridique.

import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon } from "@/components/apercu/icones";
import { Badge } from "@/components/apercu/ui";

const PREUVES: {
  titre: string;
  type: string;
  date: string;
  procedure: string;
  enfant?: string;
  empreinte: boolean;
  horodatage: boolean;
  evenement?: string;
}[] = [
  { titre: "Photo — remise des enfants", type: "Photo", date: "24 juin", procedure: "Garde — Léa & Tom", enfant: "Léa", empreinte: true, horodatage: true, evenement: "Retard à l'arrivée" },
  { titre: "Capture — échange écrit", type: "Capture", date: "20 juin", procedure: "Garde — Léa & Tom", empreinte: true, horodatage: true },
  { titre: "Document scanné", type: "Document", date: "12 juin", procedure: "Garde — Léa & Tom", enfant: "Tom", empreinte: true, horodatage: false },
];

const COPILOTE: CopiloteContenu = {
  module: "Preuves",
  intro: "Des pistes pour vos preuves. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Décrire une preuve", desc: "Obtenir une description neutre et factuelle.", icon: "copilote" },
    { titre: "Consulter les informations techniques", desc: "Empreinte et horodatage enregistrés pour un fichier.", icon: "check" },
    { titre: "Préparer un rapport de preuve", desc: "Rassembler les informations techniques disponibles.", icon: "syntheses" },
  ],
  conseil: "Une preuve reste un élément de dossier ; sa portée s'apprécie au cas par cas.",
};

export default function ApercuPreuves() {
  return (
    <AppShell
      active="preuves"
      titre="Preuves"
      sousTitre="Photos et pièces avec informations techniques (empreinte, horodatage)."
      copilote={COPILOTE}
      actions={
        <button type="button" className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex">
          <Icon name="plus" className="h-4 w-4" />
          <span>Ajouter une preuve</span>
        </button>
      }
    >
      {/* Avertissement prudent */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
        <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>
          Les informations techniques (empreinte, horodatage) facilitent la
          traçabilité d&apos;un fichier. Elles ne préjugent pas de sa valeur
          juridique, qui s&apos;apprécie au cas par cas.
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {PREUVES.map((p) => (
          <li
            key={p.titre}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <Icon name="preuves" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-slate-900">{p.titre}</h3>
                  <Badge ton="neutre">{p.type}</Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{p.date}</span>
                  <span>{p.procedure}</span>
                  {p.enfant && (
                    <span className="inline-flex items-center gap-1">
                      <Icon name="autresParents" className="h-3.5 w-3.5" />
                      {p.enfant}
                    </span>
                  )}
                </p>

                {/* Informations techniques (formulation neutre) */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge ton={p.empreinte ? "info" : "neutre"}>
                    {p.empreinte ? "Empreinte technique présente" : "Empreinte absente"}
                  </Badge>
                  <Badge ton={p.horodatage ? "info" : "neutre"}>
                    {p.horodatage ? "Horodatage enregistré" : "Horodatage non enregistré"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Lien éventuel avec un événement + action */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                {p.evenement ? (
                  <span className="inline-flex items-center gap-1">
                    <Icon name="attache" className="h-3.5 w-3.5" />
                    Lié à : {p.evenement}
                  </span>
                ) : (
                  "Aucun événement associé"
                )}
              </p>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Icon name="journal" className="h-3.5 w-3.5" />
                Associer au journal
              </button>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
