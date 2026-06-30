"use client";

import { useState, ReactNode } from "react";

type Props = {
  titre?: string;
  // État d'ouverture initial. Quand le parent remonte le composant
  // (ex. clé qui change à l'arrivée d'un pré-remplissage Agent), l'état
  // est réinitialisé à cette valeur : le bloc s'ouvre si un champ avancé
  // a été pré-rempli.
  ouvertParDefaut?: boolean;
  children: ReactNode;
};

// Repli des champs avancés à l'intérieur d'un formulaire.
// Les champs essentiels restent visibles ; le détail reste accessible en un tap.
export default function OptionsAvancees({
  titre = "Options avancées",
  ouvertParDefaut = false,
  children,
}: Props) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--app-text)]"
      >
        <span>{titre}</span>
        <span className="shrink-0 text-[var(--app-text-muted)]">
          {ouvert ? "Masquer ▴" : "Afficher ▾"}
        </span>
      </button>
      {ouvert && <div className="space-y-4 px-4 pb-4">{children}</div>}
    </div>
  );
}
