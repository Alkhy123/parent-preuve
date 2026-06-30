"use client";

// components/ui-preferences/ComfortModeSelector.tsx
//
// Sélection du mode d'accompagnement (guided / comfort). Composant
// présentationnel : toute la logique de persistance vit dans
// UiPreferencesProvider via useUiPreferences().

import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";
import type { ComfortMode } from "@/lib/ui-preferences/types";

const OPTIONS: { id: ComfortMode; label: string; description: string }[] = [
  {
    id: "guided",
    label: "Accompagné",
    description:
      "Infobulles activées, aide contextuelle visible, parcours plus guidé. Mode par défaut.",
  },
  {
    id: "comfort",
    label: "Confort",
    description:
      "Plus calme, moins d'aide affichée à l'écran. Mêmes fonctionnalités, accès identique.",
  },
];

export default function ComfortModeSelector() {
  const { comfortMode, setComfortMode } = useUiPreferences();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map((option) => {
        const selectionne = option.id === comfortMode;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setComfortMode(option.id)}
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
                Mode actif sur cet appareil
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
