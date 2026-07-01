// components/ui-preview/Board10PreviewSkeleton.tsx
//
// Squelette minimal représentant l'esprit "board10" (cockpit, prochaine
// action, actions rapides, indicateurs). Inspiré de
// design-ui-bank/02_INTERFACE_BOARD10_GUIDAGE/board10_mobile_accueil_cockpit_priorite.png.
//
// Ce composant ne remplace aucun écran réel : il sert uniquement de preview
// dans /ui-preview pour valider la direction visuelle avant déclinaison.

import { INTERFACE_STYLE_TOKENS } from "@/components/ui-themes/ThemeTokens";

const ACTIONS_RAPIDES = ["Fait", "Preuve", "Document", "Frais"];

const INDICATEURS = [
  { label: "À classer", valeur: "12" },
  { label: "Échéances", valeur: "3" },
  { label: "Exports", valeur: "2" },
];

export default function Board10PreviewSkeleton() {
  const tokens = INTERFACE_STYLE_TOKENS.board10;

  return (
    <div
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4"
      style={{ borderRadius: tokens.cardRadius }}
    >
      <div className="rounded-2xl bg-[var(--app-primary)] px-4 py-3 text-[var(--app-on-primary)]">
        <p className="text-sm font-semibold">Parent Preuve</p>
      </div>

      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-accent)]">
          Prochaine étape recommandée
        </p>
        <p className="mt-2 text-lg font-semibold text-[var(--app-text)]">
          Renseigner l&apos;autre parent
        </p>
        <p className="mt-1 text-sm leading-5 text-[var(--app-text-muted)]">
          Indiquez l&apos;autre parent rattaché à la procédure.
        </p>
        <button
          type="button"
          disabled
          className="mt-3 w-full rounded-full bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-on-primary)]"
        >
          Renseigner la procédure
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
          Ajouter au dossier
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {ACTIONS_RAPIDES.map((action) => (
            <div
              key={action}
              className="flex flex-col items-center gap-1 rounded-xl bg-[var(--app-surface-muted)] py-2 text-center"
            >
              <span className="h-6 w-6 rounded-full bg-[var(--app-accent-soft)]" />
              <span className="text-[11px] text-[var(--app-text)]">{action}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {INDICATEURS.map((indicateur) => (
          <div
            key={indicateur.label}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-center"
          >
            <p className="text-lg font-semibold text-[var(--app-text)]">{indicateur.valeur}</p>
            <p className="text-[11px] text-[var(--app-text-muted)]">{indicateur.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
