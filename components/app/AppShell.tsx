import type { ReactNode } from "react";

type AppShellProps = {
  titre: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  // Rappel prudent facultatif (ex. « outil d'organisation, ne remplace pas un
  // conseil juridique »), affiché sous la description si fourni. N'apparaît
  // sur aucune page existante tant qu'il n'est pas explicitement passé.
  avertissement?: ReactNode;
};

export default function AppShell({
  titre,
  description,
  actions,
  children,
  avertissement,
}: AppShellProps) {
  return (
    <div className="app-shell min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:px-8">
        <header className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                Parent Preuve
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-[var(--app-text)] sm:text-3xl">
                {titre}
              </h1>

              {description ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
                  {description}
                </p>
              ) : null}

              {avertissement ? (
                <p className="mt-3 max-w-3xl text-xs leading-5 text-[var(--app-text-muted)]">
                  {avertissement}
                </p>
              ) : null}
            </div>

            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </header>

        <main className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
