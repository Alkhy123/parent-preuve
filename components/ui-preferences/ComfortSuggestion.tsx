"use client";

// components/ui-preferences/ComfortSuggestion.tsx
//
// Squelette de bannière proposant de passer en mode confort. Ce lot ne câble
// aucun déclenchement automatique (ex. après N visites) : le composant est
// purement présentationnel et doit être affiché explicitement par
// l'appelant. La logique de déclenchement est une étape future.

import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

type ComfortSuggestionProps = {
  onIgnorer?: () => void;
};

export default function ComfortSuggestion({ onIgnorer }: ComfortSuggestionProps) {
  const { comfortMode, setComfortMode } = useUiPreferences();

  if (comfortMode === "comfort") return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-5 text-[var(--app-text)]">
        Vous pouvez passer en mode confort pour afficher moins d&apos;aide à
        l&apos;écran, sans rien changer à vos données.
      </p>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setComfortMode("comfort")}
          className="rounded-full bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-on-primary)] transition hover:bg-[var(--app-primary-hover)]"
        >
          Activer le mode confort
        </button>

        {onIgnorer ? (
          <button
            type="button"
            onClick={onIgnorer}
            className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-surface-muted)]"
          >
            Plus tard
          </button>
        ) : null}
      </div>
    </div>
  );
}
