"use client";

import { useEffect, useState } from "react";

import {
  THEME_DEFAUT,
  THEMES,
  appliquerTheme,
  lireTheme,
  type ThemeId,
} from "@/lib/theme";

export default function ThemeSelector() {
  const [actif, setActif] = useState<ThemeId>(THEME_DEFAUT);

  useEffect(() => {
    const animation = window.requestAnimationFrame(() => {
      setActif(lireTheme());
    });

    return () => {
      window.cancelAnimationFrame(animation);
    };
  }, []);

  function choisir(theme: ThemeId) {
    setActif(theme);
    appliquerTheme(theme);
  }

  function reinitialiser() {
    choisir(THEME_DEFAUT);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((theme) => {
          const selectionne = theme.id === actif;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => choisir(theme.id)}
              aria-pressed={selectionne}
              className={[
                "rounded-2xl border p-4 text-left transition",
                selectionne
                  ? "border-[var(--pp-primary)] bg-[var(--pp-accent-soft)] shadow-sm"
                  : "border-slate-200 bg-white hover:border-[var(--pp-accent)] hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="mb-3 flex items-center gap-2">
                {theme.pastilles.map((couleur) => (
                  <span
                    key={`${theme.id}-${couleur}`}
                    className="h-5 w-5 rounded-full border border-black/10"
                    style={{ backgroundColor: couleur }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <div className="font-semibold text-[#15233F]">{theme.label}</div>

              <p className="mt-1 text-sm text-slate-600">
                {theme.description}
              </p>

              {selectionne ? (
                <p className="mt-3 text-xs font-semibold text-[var(--pp-primary)]">
                  Theme actif sur cet appareil
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Ce choix est enregistre sur cet appareil. Il ne modifie pas les
          donnees du dossier.
        </p>

        <button
          type="button"
          onClick={reinitialiser}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#15233F] transition hover:border-[#C2A24C]"
        >
          Reinitialiser
        </button>
      </div>
    </div>
  );
}
