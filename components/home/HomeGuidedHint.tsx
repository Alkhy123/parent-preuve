"use client";

// components/home/HomeGuidedHint.tsx
//
// Courte aide contextuelle affichée uniquement en mode "guided".
// En mode "comfort" : ne rend rien.
// Composant purement présentationnel, passif.

import type { ReactNode } from "react";

import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

export default function HomeGuidedHint({ children }: { children: ReactNode }) {
  const { comfortMode } = useUiPreferences();
  if (comfortMode !== "guided") return null;

  return (
    <aside
      role="note"
      className="rounded-2xl border border-[var(--app-info-border)] bg-[var(--app-info-soft)] p-4"
    >
      <p className="text-sm leading-6 text-[var(--app-info)]">{children}</p>
    </aside>
  );
}
