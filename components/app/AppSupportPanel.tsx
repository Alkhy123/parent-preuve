// components/app/AppSupportPanel.tsx
//
// Panneau d'aide contextualisé, affiché à droite du contenu dans AppShell sur
// desktop large uniquement. Purement présentationnel : aucune logique IA,
// aucun appel réseau, aucune action automatique. Oriente seulement vers la
// page /copilote existante et rappelle ses limites.

import AppButtonLink from "@/components/app/AppButtonLink";

const USAGES = [
  "Reformuler une demande factuelle",
  "Préparer un brouillon à vérifier",
  "Comprendre les éléments déjà saisis",
];

export default function AppSupportPanel() {
  return (
    <aside
      className="hidden shrink-0 xl:flex xl:w-72 xl:flex-col xl:gap-4 xl:rounded-3xl xl:border xl:p-5 xl:shadow-sm
        xl:border-[var(--app-border)]
        xl:bg-[var(--app-surface)]
        xl:text-[var(--app-text)]"
    >
      <h2 className="text-base font-semibold text-[var(--app-text)]">
        Besoin d&apos;aide ?
      </h2>

      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-info-soft)] px-3 py-2.5">
        <p className="text-sm leading-6 text-[var(--app-text)]">
          Le Copilote peut vous aider à organiser une demande, repérer les
          informations utiles ou préparer un pré-remplissage à vérifier.
        </p>
      </div>

      <ul className="space-y-1.5 text-sm text-[var(--app-text-muted)]">
        {USAGES.map((usage) => (
          <li key={usage} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-accent)]"
            />
            <span>{usage}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-[var(--app-warning-border,var(--app-border))] bg-[var(--app-warning-soft,#fef3c7)] px-3 py-2.5">
        <p className="text-xs leading-5 text-[var(--app-text)]">
          Il ne remplace pas un conseil juridique et ne déclenche aucune
          action automatique.
        </p>
      </div>

      <AppButtonLink href="/copilote">Ouvrir le Copilote</AppButtonLink>
    </aside>
  );
}
