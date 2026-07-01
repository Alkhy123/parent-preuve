// components/ui-preview/OverviewPreviewSkeleton.tsx
//
// Squelette minimal représentant l'esprit "vue-ensemble" (dashboard
// synthétique, indicateurs, progression). Inspiré de
// design-ui-bank/03_INTERFACE_VUE_ENSEMBLE_DASHBOARD/vue_ensemble_desktop_06_03_principale.png.
//
// Ce composant ne remplace aucun écran réel : il sert uniquement de preview
// dans /ui-preview pour valider la direction visuelle avant déclinaison.

import { INTERFACE_STYLE_TOKENS } from "@/components/ui-themes/ThemeTokens";

const ELEMENTS_A_COMPLETER = [
  "Informations sur l'autre parent",
  "Preuves de dépenses courantes",
  "Calendrier des échanges",
];

export default function OverviewPreviewSkeleton() {
  const tokens = INTERFACE_STYLE_TOKENS["vue-ensemble"];

  return (
    <div
      className="w-full rounded-3xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4"
      style={{ borderRadius: tokens.cardRadius }}
    >
      <p className="text-sm text-[var(--app-text-muted)]">Bonjour,</p>
      <p className="text-lg font-semibold text-[var(--app-text)]">
        Voici votre dossier en un coup d&apos;œil.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-accent)]">
            Dossier actif
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--app-text)]">
            Séparation – Garde partagée
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-semibold text-[var(--app-text)]">82</p>
              <p className="text-[11px] text-[var(--app-text-muted)]">Éléments</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--app-text)]">47</p>
              <p className="text-[11px] text-[var(--app-text-muted)]">Pièces jointes</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--app-text)]">2</p>
              <p className="text-[11px] text-[var(--app-text-muted)]">Enfants</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-accent)]">
            Prêt à exporter
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--app-text)]">78%</p>
          <p className="text-[11px] text-[var(--app-text-muted)]">Très bon avancement</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
          Éléments à compléter
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {ELEMENTS_A_COMPLETER.map((element) => (
            <li
              key={element}
              className="flex items-center justify-between rounded-xl bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text)]"
            >
              <span>{element}</span>
              <span className="text-[11px] font-semibold text-[var(--app-accent)]">
                Compléter
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
