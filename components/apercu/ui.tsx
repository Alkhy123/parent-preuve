// components/apercu/ui.tsx
//
// Petits composants visuels partages par les pages d'apercu (badge de statut,
// carte resume, pastilles de filtre). Purement presentational, aucune logique
// metier. Les pastilles sont controlees par la page (etat dans la page).

import { type ReactNode } from "react";

export type Ton = "neutre" | "info" | "succes" | "attention" | "danger";

const TON_BADGE: Record<Ton, string> = {
  neutre: "app-badge-neutre border-slate-200 bg-slate-100 text-slate-600",
  info: "app-badge-info border-blue-200 bg-blue-50 text-blue-700",
  succes: "border-emerald-200 bg-emerald-50 text-emerald-700",
  attention: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
};

export function Badge({
  children,
  ton = "neutre",
}: {
  children: ReactNode;
  ton?: Ton;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        TON_BADGE[ton],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

const TON_TEXTE: Record<Ton, string> = {
  neutre: "text-slate-900",
  info: "text-blue-700",
  succes: "text-emerald-700",
  attention: "text-amber-700",
  danger: "text-rose-700",
};

export function StatCard({
  label,
  valeur,
  indice,
  ton = "neutre",
}: {
  label: string;
  valeur: string;
  indice?: string;
  ton?: Ton;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={["mt-1 text-xl font-semibold", TON_TEXTE[ton]].join(" ")}>
        {valeur}
      </p>
      {indice && <p className="mt-0.5 text-xs text-slate-400">{indice}</p>}
    </div>
  );
}

export function FiltrePills({
  options,
  actif,
  onChange,
}: {
  options: string[];
  actif: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((o) => {
        const estActif = o === actif;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={[
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
              estActif
                ? "app-chip-active border-[#2563EB] bg-[#2563EB] text-white"
                : "app-chip border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
