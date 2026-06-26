"use client";

// app/apercu/syntheses/page.tsx — APERCU. Données fictives, aucune logique métier.

import { useState } from "react";
import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon, type IconName } from "@/components/apercu/icones";

const ETAPES = ["Choisir la période", "Choisir les éléments", "Vérifier les pièces", "Générer"];

const OPTIONS: { cle: string; label: string; desc: string; icon: IconName }[] = [
  { cle: "journal", label: "Export du journal", desc: "Faits datés de la période.", icon: "journal" },
  { cle: "frais", label: "Export des frais", desc: "Dépenses et justificatifs.", icon: "frais" },
  { cle: "preuves", label: "Export des preuves", desc: "Pièces et informations techniques.", icon: "preuves" },
  { cle: "bordereau", label: "Bordereau de pièces", desc: "Liste numérotée des pièces.", icon: "documents" },
  { cle: "complete", label: "Synthèse complète", desc: "Dossier organisé de bout en bout.", icon: "syntheses" },
];

const COPILOTE: CopiloteContenu = {
  module: "Synthèses & exports",
  intro: "Des pistes pour préparer un dossier. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Choisir les éléments à inclure", desc: "Sélectionner ce qui entre dans l'export.", icon: "check" },
    { titre: "Préparer une note de synthèse", desc: "Un document neutre et chronologique.", icon: "syntheses" },
    { titre: "Générer un bordereau", desc: "Lister les pièces transmises.", icon: "documents" },
  ],
  conseil: "Une synthèse organise vos éléments ; faites-la relire par un professionnel si nécessaire.",
};

export default function ApercuSyntheses() {
  const [etape, setEtape] = useState(1); // 1..4
  const [choisies, setChoisies] = useState<string[]>(["journal", "frais"]);

  function bascule(cle: string) {
    setChoisies((c) => (c.includes(cle) ? c.filter((x) => x !== cle) : [...c, cle]));
  }

  return (
    <AppShell
      active="syntheses"
      titre="Synthèses & exports"
      sousTitre="Préparez un dossier clair et exportable."
      copilote={COPILOTE}
      actions={
        <button type="button" className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex">
          <Icon name="plus" className="h-4 w-4" />
          <span>Nouvel export</span>
        </button>
      }
    >
      {/* Étapes */}
      <ol className="flex flex-wrap gap-2">
        {ETAPES.map((e, i) => {
          const n = i + 1;
          const actif = n === etape;
          const fait = n < etape;
          return (
            <li key={e}>
              <button
                type="button"
                onClick={() => setEtape(n)}
                className={[
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition",
                  actif
                    ? "bg-[#2563EB] text-white"
                    : fait
                      ? "bg-[#2563EB]/[0.08] text-[#2563EB]"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    actif ? "bg-white/20 text-white" : fait ? "bg-[#2563EB]/15 text-[#2563EB]" : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {fait ? "✓" : n}
                </span>
                {e}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Options d'export (sélectionnables) */}
      <div className="mt-5">
        <h2 className="text-sm font-semibold text-slate-900">Éléments à inclure</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((o) => {
            const choisi = choisies.includes(o.cle);
            return (
              <button
                key={o.cle}
                type="button"
                onClick={() => bascule(o.cle)}
                aria-pressed={choisi}
                className={[
                  "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                  choisi
                    ? "border-[#2563EB] bg-[#2563EB]/[0.06]"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                  <Icon name={o.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">{o.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{o.desc}</span>
                </span>
                <span
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    choisi ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-slate-300 text-transparent",
                  ].join(" ")}
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Générer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {choisies.length} élément{choisies.length > 1 ? "s" : ""} sélectionné
          {choisies.length > 1 ? "s" : ""}
        </p>
        <button
          type="button"
          disabled={choisies.length === 0}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          <Icon name="syntheses" className="h-4 w-4" />
          Générer l&apos;export
        </button>
      </div>

      {/* Avertissement prudent */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        <Icon name="alerte" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          L&apos;export organise vos informations de façon claire et datée. Il ne
          remplace pas une relecture par un professionnel du droit et ne préjuge
          pas de la recevabilité des pièces.
        </p>
      </div>
    </AppShell>
  );
}
