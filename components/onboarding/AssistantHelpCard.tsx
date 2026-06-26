"use client";

// components/onboarding/AssistantHelpCard.tsx
//
// Carte d'aide contextuelle (colonne droite en desktop, sous la carte en mobile).
// Affiche "Pourquoi cette etape est utile ?" et un conseil pratique. Textes issus
// de lib/onboarding/metadata. Purement visuel, ton prudent (aucune promesse
// juridique).

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
      {/* Vignette d'accompagnement, decorative et legere (pas d'image externe). */}
      <div
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB]/10"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8 text-[#2563EB]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
          <path d="M12 17h.01" />
        </svg>
      </div>

      <div>
        <h3 className="font-display text-lg text-navy">
          Pourquoi cette étape est utile ?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-texte-doux">
          {meta.pourquoi}
        </p>
      </div>

      <div className="rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/[0.07] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#15803D]">
          Conseil
        </p>
        <p className="mt-1 text-sm leading-relaxed text-texte">{meta.conseil}</p>
      </div>
    </div>
  );
}
