"use client";

// components/ui-preferences/TooltipCoachmark.tsx
//
// Courte aide contextuelle affichée uniquement en mode "guided". Ne rend
// rien en mode "comfort" (moins d'aide affichée, conformément au cahier des
// charges du chantier confort/variantes). Composant purement présentationnel,
// à utiliser au cas par cas dans les écrans qui le souhaitent.

import type { ReactNode } from "react";

import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

type TooltipCoachmarkProps = {
  children: ReactNode;
};

export default function TooltipCoachmark({ children }: TooltipCoachmarkProps) {
  const { comfortMode } = useUiPreferences();

  if (comfortMode !== "guided") return null;

  return (
    <p
      role="note"
      className="mt-2 rounded-xl border border-[var(--app-info-border)] bg-[var(--app-info-soft)] px-3 py-2 text-xs leading-5 text-[var(--app-info)]"
    >
      {children}
    </p>
  );
}
