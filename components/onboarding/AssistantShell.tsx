"use client";

// components/onboarding/AssistantShell.tsx
//
// Coquille visuelle de l'assistant de demarrage (approche wrapper) : elle habille
// le wizard existant sans en modifier la logique. Le corps de l'etape (formulaire
// metier + pied "Precedent / Continuer") est passe en `children` et reste inchange.
//
// Structure (inspiree de la maquette de reference) :
//  - desktop (lg+) : 3 colonnes -> progression | etape active | aide contextuelle ;
//  - mobile        : pile -> barre + pastilles, grande carte, aide en dessous.
//
// Composant purement visuel : aucune lecture/ecriture de donnee, aucun appel IA.

import { type ReactNode } from "react";
import {
  type DefinitionEtape,
  type EtapeOnboarding,
} from "@/lib/onboarding/types";
import { META_ONBOARDING } from "@/lib/onboarding/metadata";
import AssistantProgress from "@/components/onboarding/AssistantProgress";
import AssistantStepHeader from "@/components/onboarding/AssistantStepHeader";
import AssistantHelpCard from "@/components/onboarding/AssistantHelpCard";

// Icones d'etape (SVG inline, aucune dependance externe).
const traits = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONES: Record<EtapeOnboarding, ReactNode> = {
  "vos-informations": (
    <svg viewBox="0 0 24 24" {...traits}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  ),
  procedure: (
    <svg viewBox="0 0 24 24" {...traits}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  "autre-parent": (
    <svg viewBox="0 0 24 24" {...traits}>
      <circle cx="9" cy="8" r="2.6" />
      <path d="M4 18a5 5 0 0 1 10 0" />
      <path d="M16 7.5a2.4 2.4 0 0 1 0 4.8" />
      <path d="M16.5 14a4.5 4.5 0 0 1 3.5 4" />
    </svg>
  ),
  enfants: (
    <svg viewBox="0 0 24 24" {...traits}>
      <circle cx="8" cy="9" r="2.2" />
      <circle cx="16" cy="9" r="2.2" />
      <path d="M4.5 18a3.5 3.5 0 0 1 7 0" />
      <path d="M12.5 18a3.5 3.5 0 0 1 7 0" />
    </svg>
  ),
  jugement: (
    <svg viewBox="0 0 24 24" {...traits}>
      <path d="M12 4v16" />
      <path d="M7 8h10" />
      <path d="M7 8l-2.5 5a2.5 2.5 0 0 0 5 0z" />
      <path d="M17 8l-2.5 5a2.5 2.5 0 0 0 5 0z" />
      <path d="M8 20h8" />
    </svg>
  ),
  "validation-regles": (
    <svg viewBox="0 0 24 24" {...traits}>
      <path d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M9 12l2 2 3-4" />
    </svg>
  ),
  calendrier: (
    <svg viewBox="0 0 24 24" {...traits}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" {...traits}>
      <path d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M9 13h6M9 16h4" />
    </svg>
  ),
};

export type AssistantShellProps = {
  etapes: DefinitionEtape[];
  idx: number;
  courante: EtapeOnboarding;
  completees: EtapeOnboarding[];
  onAller: (e: EtapeOnboarding) => void;
  /** Corps metier de l'etape (formulaire + pied), rendu tel quel. */
  children: ReactNode;
};

export default function AssistantShell({
  etapes,
  idx,
  courante,
  completees,
  onAller,
  children,
}: AssistantShellProps) {
  const def = etapes[idx];
  const meta = META_ONBOARDING[courante];

  // Style de carte facon maquette : surface blanche, bordure fine, ombre douce.
  const carte =
    "rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]";

  // Grande carte centrale : en-tete (icone + titre + objectif), encart d'aide,
  // puis corps metier inchange. Reutilisee a l'identique desktop / mobile.
  const carteCentrale = (
    <section className={`${carte} p-5 sm:p-7`}>
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]"
        >
          <span className="h-6 w-6">{ICONES[courante]}</span>
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl text-navy sm:text-2xl">
            {def.titre}
          </h2>
          <p className="mt-1 text-sm text-texte-doux">{meta.objectif}</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#2563EB]/15 bg-[#2563EB]/[0.06] px-4 py-3">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .9 1.6h5.2c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3z" />
        </svg>
        <p className="text-sm leading-relaxed text-[#1E40AF]">{meta.aide}</p>
      </div>

      {/* Corps metier inchange : formulaire + pied "Precedent / Continuer". */}
      <div className="mt-5">{children}</div>
    </section>
  );

  return (
    <div className="assistant-pilote lg:grid lg:grid-cols-[248px_minmax(0,1fr)_300px] lg:items-start lg:gap-6">
      {/* Colonne gauche : progression (desktop uniquement). */}
      <aside className="hidden lg:block">
        <div className={`${carte} p-5`}>
          <AssistantProgress
            etapes={etapes}
            idx={idx}
            courante={courante}
            completees={completees}
            onAller={onAller}
            variant="rail"
          />
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-texte-doux">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563EB]/70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" />
            </svg>
            <span>
              Vous pouvez revenir en arrière à tout moment. Les informations
              restent modifiables ensuite.
            </span>
          </div>
        </div>
      </aside>

      {/* Colonne centrale : barre + pastilles (mobile) + grande carte. */}
      <div className="space-y-4">
        <AssistantStepHeader idx={idx} total={etapes.length} />

        {/* Pastilles de progression : mobile / tablette uniquement. */}
        <div className="lg:hidden">
          <AssistantProgress
            etapes={etapes}
            idx={idx}
            courante={courante}
            completees={completees}
            onAller={onAller}
            variant="pills"
          />
        </div>

        {carteCentrale}

        {/* Aide contextuelle sous la carte : mobile / tablette uniquement. */}
        <div className={`${carte} p-5 lg:hidden`}>
          <AssistantHelpCard etape={courante} />
        </div>
      </div>

      {/* Colonne droite : aide contextuelle (desktop uniquement). */}
      <aside className="hidden lg:block">
        <div className={`${carte} p-5`}>
          <AssistantHelpCard etape={courante} />
        </div>
      </aside>
    </div>
  );
}
