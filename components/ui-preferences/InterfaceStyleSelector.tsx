"use client";

// components/ui-preferences/InterfaceStyleSelector.tsx
//
// Sélection du style d'interface (board10 / vue-ensemble). Indépendant du
// mode d'accompagnement : les deux styles restent disponibles en guided
// comme en comfort. Composant présentationnel uniquement.

import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";
import type { InterfaceStyle } from "@/lib/ui-preferences/types";

const OPTIONS: { id: InterfaceStyle; label: string; description: string }[] = [
  {
    id: "board10",
    label: "Board 10",
    description:
      "Cockpit guidé, actions du jour, priorités et accompagnement.",
  },
  {
    id: "vue-ensemble",
    label: "Vue d'ensemble",
    description:
      "Tableau de bord synthétique, indicateurs et vision globale du dossier.",
  },
];

export default function InterfaceStyleSelector() {
  const { interfaceStyle, setInterfaceStyle } = useUiPreferences();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map((option) => {
        const selectionne = option.id === interfaceStyle;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setInterfaceStyle(option.id)}
            aria-pressed={selectionne}
            className={[
              "rounded-2xl border p-4 text-left transition",
              selectionne
                ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] shadow-sm"
                : "border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-muted)]",
            ].join(" ")}
          >
            <div className="font-semibold text-[var(--app-text)]">{option.label}</div>
            <p className="mt-1 text-sm leading-5 text-[var(--app-text-muted)]">
              {option.description}
            </p>
            {selectionne ? (
              <p className="mt-3 text-xs font-semibold text-[var(--app-primary)]">
                Style actif sur cet appareil
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
