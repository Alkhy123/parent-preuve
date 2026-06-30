"use client";

// components/onboarding/AssistantShell.tsx
//
// Coquille visuelle de l'assistant de demarrage (approche wrapper) : elle
// habille le wizard existant sans en modifier la logique. Le corps de l'etape
// (formulaire metier + pied "Precedent / Continuer") est passe en `children`
// et reste inchange.
//
// Structure :
//  - desktop (lg+) : 3 colonnes -> progression | etape active | aide ;
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

export type AssistantShellProps = {
  etapes: DefinitionEtape[];
  idx: number;
  courante: EtapeOnboarding;
  completees: EtapeOnboarding[];
  onAller: (e: EtapeOnboarding) => void;
  /** Corps metier de l'etape (formulaire + pied), rendu tel quel. */
  children: ReactNode;
};

const CARTE =
  "rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm";

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

  const carteCentrale = (
    <section className={`${CARTE} p-5 sm:p-7`}>
      <h2 className="font-display text-xl text-[var(--app-text)] sm:text-2xl">
        {def.titre}
      </h2>
      <p className="mt-1 text-sm text-[var(--app-text-muted)]">{meta.objectif}</p>

      <div className="mt-4 rounded-xl border border-[var(--app-accent-soft,var(--app-info-border,#bfdbfe))] bg-[var(--app-accent-soft,var(--app-info-soft,#eff6ff))] px-4 py-3">
        <p className="text-sm leading-relaxed text-[var(--app-accent,var(--app-info,#1d4ed8))]">
          {meta.aide}
        </p>
      </div>

      {/* Corps metier inchange : formulaire + pied "Precedent / Continuer". */}
      <div className="mt-5">{children}</div>
    </section>
  );

  return (
    <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)_280px] lg:items-start lg:gap-6">
      {/* Colonne gauche : progression (desktop uniquement). */}
      <aside className="hidden lg:block">
        <div className={`${CARTE} p-5`}>
          <AssistantProgress
            etapes={etapes}
            idx={idx}
            courante={courante}
            completees={completees}
            onAller={onAller}
            variant="rail"
          />
          <p className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted,var(--app-bg))] px-3 py-2.5 text-xs leading-relaxed text-[var(--app-text-muted)]">
            Vous pouvez revenir en arrière à tout moment. Les informations
            restent modifiables ensuite.
          </p>
        </div>
      </aside>

      {/* Colonne centrale : barre + pastilles (mobile) + grande carte. */}
      <div className="mt-4 space-y-4 lg:mt-0">
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
        <div className={`${CARTE} p-5 lg:hidden`}>
          <AssistantHelpCard etape={courante} />
        </div>
      </div>

      {/* Colonne droite : aide contextuelle (desktop uniquement). */}
      <aside className="hidden lg:block">
        <div className={`${CARTE} p-5`}>
          <AssistantHelpCard etape={courante} />
        </div>
      </aside>
    </div>
  );
}
