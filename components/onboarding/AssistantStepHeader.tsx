"use client";

// components/onboarding/AssistantStepHeader.tsx
//
// Bandeau de progression chiffree : "Étape X sur Y" + barre de progression +
// pourcentage. Purement visuel, sans logique metier.

export type AssistantStepHeaderProps = {
  /** Index 0-based de l'etape courante. */
  idx: number;
  /** Nombre total d'etapes. */
  total: number;
};

export default function AssistantStepHeader({
  idx,
  total,
}: AssistantStepHeaderProps) {
  const numero = idx + 1;
  const pourcentage = Math.round((numero / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-sm font-medium text-[var(--app-text)]">
        Étape {numero} sur {total}
      </span>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--app-surface-muted,var(--app-border))]"
        role="progressbar"
        aria-valuenow={pourcentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression de l'assistant"
      >
        <div
          className="h-full rounded-full bg-[var(--app-accent)] transition-all duration-300"
          style={{ width: `${pourcentage}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-medium text-[var(--app-text-muted)]">
        {pourcentage} %
      </span>
    </div>
  );
}
