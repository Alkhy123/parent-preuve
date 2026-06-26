// app/apercu/autres-parents/page.tsx — APERCU. Données fictives, aucune logique métier.

import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon } from "@/components/apercu/icones";
import { Badge } from "@/components/apercu/ui";

const PARENTS: {
  nom: string;
  procedure: string;
  champs: { label: string; ok: boolean }[];
}[] = [
  {
    nom: "M. Dupont",
    procedure: "Garde — Léa & Tom",
    champs: [
      { label: "Adresse", ok: true },
      { label: "Téléphone", ok: true },
      { label: "Email", ok: false },
    ],
  },
  {
    nom: "Mme Martin",
    procedure: "Procédure — Maxime",
    champs: [
      { label: "Adresse", ok: false },
      { label: "Téléphone", ok: false },
      { label: "Email", ok: false },
    ],
  },
];

const COPILOTE: CopiloteContenu = {
  module: "Autres parents",
  intro: "Des pistes pour compléter vos fiches. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Compléter une fiche", desc: "Renseigner les coordonnées utiles.", icon: "autresParents" },
    { titre: "Préparer un courrier", desc: "Adresser un courrier factuel.", icon: "modeles" },
    { titre: "Vérifier les coordonnées", desc: "S'assurer que les informations sont à jour.", icon: "check" },
  ],
  conseil: "Renseignez les coordonnées utiles : elles alimentent vos courriers et synthèses.",
};

export default function ApercuAutresParents() {
  return (
    <AppShell
      active="autres-parents"
      titre="Autres parents"
      sousTitre="Les autres parents rattachés à vos procédures."
      copilote={COPILOTE}
      actions={
        <button type="button" className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex">
          <Icon name="plus" className="h-4 w-4" />
          <span>Ajouter un autre parent</span>
        </button>
      }
    >
      {/* Cadrage : pas un carnet d'adresses général */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
        <Icon name="procedures" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>
          Chaque fiche est rattachée à une procédure. Ce module n&apos;est pas un
          carnet d&apos;adresses général : seules les coordonnées utiles au dossier
          sont nécessaires.
        </p>
      </div>

      <ul className="mt-4 grid gap-4 lg:grid-cols-2">
        {PARENTS.map((p) => {
          const complet = p.champs.every((c) => c.ok);
          return (
            <li
              key={p.nom}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                    <Icon name="autresParents" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-900">{p.nom}</h3>
                    <p className="text-xs text-slate-500">{p.procedure}</p>
                  </div>
                </div>
                <Badge ton={complet ? "succes" : "attention"}>
                  {complet ? "Complet" : "À compléter"}
                </Badge>
              </div>

              {/* Coordonnées disponibles / manquantes */}
              <ul className="mt-3 space-y-1.5">
                {p.champs.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm">
                    <span
                      className={[
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        c.ok ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600",
                      ].join(" ")}
                    >
                      <Icon name={c.ok ? "check" : "fermer"} className="h-3 w-3" />
                    </span>
                    <span className={c.ok ? "text-slate-700" : "text-slate-400"}>
                      {c.label}
                      {!c.ok && " — manquant"}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <button type="button" className="flex items-center gap-1.5 rounded-lg border border-[#2563EB]/30 px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#2563EB]/[0.06]">
                  Compléter la fiche
                  <Icon name="fleche" className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
