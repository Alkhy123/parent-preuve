"use client";

// components/onboarding/AssistantProgress.tsx
//
// Progression visuelle de l'assistant de demarrage. Deux variantes partageant
// EXACTEMENT la meme logique d'accessibilite que le wizard d'origine :
//  - "rail"  : liste verticale (colonne gauche, desktop) ;
//  - "pills" : pastilles horizontales compactes (mobile).
//
// Composant purement visuel : il ne lit ni n'ecrit aucune donnee. Le retour vers
// une etape deja atteinte passe par le callback onAller fourni par le wizard.

import {
  type DefinitionEtape,
  type EtapeOnboarding,
} from "@/lib/onboarding/types";
import { META_ONBOARDING } from "@/lib/onboarding/metadata";

type EtatEtape = "fait" | "actif" | "avenir";

function etatDe(
  i: number,
  idx: number,
  estComplete: boolean,
  actif: boolean,
): EtatEtape {
  if (actif) return "actif";
  if (estComplete || i < idx) return "fait";
  return "avenir";
}

export type AssistantProgressProps = {
  etapes: DefinitionEtape[];
  idx: number;
  courante: EtapeOnboarding;
  completees: EtapeOnboarding[];
  onAller: (e: EtapeOnboarding) => void;
  variant: "rail" | "pills";
};

export default function AssistantProgress({
  etapes,
  idx,
  courante,
  completees,
  onAller,
  variant,
}: AssistantProgressProps) {
  // Accessibilite identique au wizard d'origine : etape deja atteinte ou completee.
  const accessible = (i: number, id: EtapeOnboarding) =>
    i <= idx || completees.includes(id);

  if (variant === "pills") {
    return (
      <ol className="flex items-center gap-1.5">
        {etapes.map((e, i) => {
          const actif = e.id === courante;
          const etat = etatDe(i, idx, completees.includes(e.id), actif);
          const ok = accessible(i, e.id);
          return (
            <li key={e.id} className="flex-1">
              <button
                type="button"
                onClick={() => ok && onAller(e.id)}
                disabled={!ok}
                aria-current={actif ? "step" : undefined}
                aria-label={`Étape ${i + 1} : ${e.titre}`}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition",
                  etat === "actif"
                    ? "bg-[var(--app-accent)] text-[var(--app-on-primary,#ffffff)]"
                    : etat === "fait"
                      ? "bg-[var(--app-success,var(--pp-success,#16a34a))]/15 text-[var(--app-success,var(--pp-success,#16a34a))]"
                      : "bg-[var(--app-surface-muted,var(--app-border))] text-[var(--app-text-muted)]",
                  ok ? "" : "cursor-default opacity-60",
                ].join(" ")}
              >
                {etat === "fait" ? "✓" : i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    );
  }

  // variant === "rail"
  return (
    <nav aria-label="Progression de l'assistant">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
        Votre progression
      </p>
      <ol className="mt-4 space-y-1">
        {etapes.map((e, i) => {
          const actif = e.id === courante;
          const etat = etatDe(i, idx, completees.includes(e.id), actif);
          const ok = accessible(i, e.id);
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => ok && onAller(e.id)}
                disabled={!ok}
                aria-current={actif ? "step" : undefined}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition",
                  actif
                    ? "bg-[var(--app-accent)]/10"
                    : ok
                      ? "hover:bg-[var(--app-accent)]/5"
                      : "cursor-default",
                  ok ? "" : "opacity-60",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    etat === "actif"
                      ? "bg-[var(--app-accent)] text-[var(--app-on-primary,#ffffff)]"
                      : etat === "fait"
                        ? "bg-[var(--app-success,var(--pp-success,#16a34a))] text-[var(--app-on-primary,#ffffff)]"
                        : "bg-[var(--app-surface-muted,var(--app-border))] text-[var(--app-text-muted)]",
                  ].join(" ")}
                >
                  {etat === "fait" ? "✓" : i + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={[
                      "block truncate text-sm",
                      actif
                        ? "font-semibold text-[var(--app-text)]"
                        : etat === "fait"
                          ? "font-medium text-[var(--app-text)]"
                          : "text-[var(--app-text-muted)]",
                    ].join(" ")}
                  >
                    {e.titre}
                  </span>
                  <span className="block truncate text-xs text-[var(--app-text-muted)]">
                    {META_ONBOARDING[e.id].railSousTitre}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
