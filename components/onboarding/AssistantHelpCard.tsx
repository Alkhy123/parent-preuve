"use client";

// components/onboarding/AssistantHelpCard.tsx
//
// Carte d'aide contextuelle (colonne droite en desktop, sous la carte en
// mobile). Affiche "Pourquoi cette etape est utile ?" et un conseil pratique.
// Textes issus de lib/onboarding/metadata. Purement visuel, ton prudent
// (aucune promesse juridique).

import { type EtapeOnboarding } from "@/lib/onboarding/types";
import { META_ONBOARDING } from "@/lib/onboarding/metadata";

export default function AssistantHelpCard({
  etape,
}: {
  etape: EtapeOnboarding;
}) {
  const meta = META_ONBOARDING[etape];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg text-[var(--app-text)]">
          Pourquoi cette étape est utile ?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
          {meta.pourquoi}
        </p>
      </div>

      <div className="rounded-xl border border-[var(--app-success,var(--pp-success,#16a34a))]/20 bg-[var(--app-success-soft,var(--app-success,var(--pp-success,#16a34a)))]/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-success,var(--pp-success,#16a34a))]">
          Conseil
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--app-text)]">
          {meta.conseil}
        </p>
      </div>
    </div>
  );
}
