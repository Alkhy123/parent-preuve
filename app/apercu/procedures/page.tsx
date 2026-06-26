// app/apercu/procedures/page.tsx — APERCU. Données fictives, aucune logique métier.

import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon } from "@/components/apercu/icones";
import { Badge, type Ton } from "@/components/apercu/ui";

const PROCEDURES: {
  nom: string;
  reference: string;
  enfants: string[];
  autreParent: string;
  completion: number;
  derniereActivite: string;
  statut: string;
  ton: Ton;
}[] = [
  { nom: "Garde — Léa & Tom", reference: "Affaire n° 24/00123", enfants: ["Léa", "Tom"], autreParent: "M. Dupont", completion: 75, derniereActivite: "il y a 2 jours", statut: "Active", ton: "succes" },
  { nom: "Procédure — Maxime", reference: "Affaire n° 23/00890", enfants: ["Maxime"], autreParent: "Mme Martin", completion: 40, derniereActivite: "il y a 3 semaines", statut: "En préparation", ton: "attention" },
];

const COPILOTE: CopiloteContenu = {
  module: "Procédures",
  intro: "Des pistes pour gérer vos dossiers. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Comprendre le cloisonnement", desc: "Chaque procédure reste séparée des autres.", icon: "procedures" },
    { titre: "Vérifier les informations clés", desc: "Contrôler les éléments d'une procédure.", icon: "check" },
    { titre: "Préparer un export par procédure", desc: "Rassembler les pièces d'un dossier.", icon: "syntheses" },
  ],
  conseil: "Ne mélangez pas les dossiers : une donnée appartient à une seule procédure.",
};

export default function ApercuProcedures() {
  return (
    <AppShell
      active="procedures"
      titre="Procédures"
      sousTitre="Vos dossiers, cloisonnés les uns des autres."
      copilote={COPILOTE}
      actions={
        <button type="button" className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex">
          <Icon name="plus" className="h-4 w-4" />
          <span>Nouvelle procédure</span>
        </button>
      }
    >
      <ul className="grid gap-4 lg:grid-cols-2">
        {PROCEDURES.map((p) => (
          <li
            key={p.reference}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900">{p.nom}</h3>
                <p className="text-xs text-slate-500">{p.reference}</p>
              </div>
              <Badge ton={p.ton}>{p.statut}</Badge>
            </div>

            {/* Enfants + autre parent */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="autresParents" className="h-4 w-4 text-slate-400" />
                {p.enfants.join(", ")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="procedures" className="h-4 w-4 text-slate-400" />
                {p.autreParent}
              </span>
            </div>

            {/* Complétion */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Complétion</span>
                <span className="text-slate-500">{p.completion} %</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${p.completion}%` }} />
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Dernière activité : {p.derniereActivite}
            </p>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <button type="button" className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]">
                Ouvrir
                <Icon name="fleche" className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                Configurer
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Icon name="syntheses" className="h-3.5 w-3.5" />
                Exporter
              </button>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
