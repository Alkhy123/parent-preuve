"use client";

import type { ReactNode } from "react";

import AppSidebar from "@/components/app/AppSidebar";
import AppSupportPanel from "@/components/app/AppSupportPanel";
import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

type AppShellProps = {
  titre: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  // Rappel prudent facultatif (ex. « outil d'organisation, ne remplace pas un
  // conseil juridique »), affiché sous la description si fourni. N'apparaît
  // sur aucune page existante tant qu'il n'est pas explicitement passé.
  avertissement?: ReactNode;
  // AppShell est aussi utilisé par des pages publiques (ex. AccueilPublic
  // pour les visiteurs non connectés) où la navigation applicative (rail +
  // "Procédure active") n'a pas de sens. Optionnel, défaut false : ne change
  // rien pour les pages existantes qui ne le passent pas.
  masquerSidebar?: boolean;
  // Masque uniquement le panneau d'aide (ex. page /copilote elle-même, où le
  // lien "Ouvrir le Copilote" serait redondant). Optionnel, défaut false.
  masquerAide?: boolean;
};

export default function AppShell({
  titre,
  description,
  actions,
  children,
  avertissement,
  masquerSidebar = false,
  masquerAide = false,
}: AppShellProps) {
  // Lecture du style d'interface choisi (board10 / vue-ensemble). Point
  // d'extension pour une déclinaison future de layout par interfaceStyle :
  // aujourd'hui data-interface-style n'est ciblé par aucun style, donc
  // aucun changement visuel pour les pages existantes.
  const { interfaceStyle } = useUiPreferences();

  return (
    <div
      className="app-shell min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]"
      data-interface-style={interfaceStyle}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        {masquerSidebar ? null : <AppSidebar />}

        <div className="flex min-w-0 flex-1 flex-col gap-6 lg:gap-8">
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

        {masquerSidebar || masquerAide ? null : <AppSupportPanel />}
      </div>
    </div>
  );
}
