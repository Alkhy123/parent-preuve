"use client";

// components/theme/ThemeSelector.tsx
//
// Sélecteur de thème : 3 cartes (nom, description, 3 pastilles, état
// sélectionné). Au clic, applique le thème et le persiste. Habillage uniquement.

import { useEffect, useState } from "react";
import {
  THEME_DEFAUT,
  THEMES,
  appliquerTheme,
  lireTheme,
  type ThemeId,
} from "@/lib/theme";
import { Icon } from "@/components/apercu/icones";

export default function ThemeSelector() {
  const [actif, setActif] = useState<ThemeId>("classique-bleu");

  // Synchronise l'état avec le thème réellement mémorisé (après montage).
  // Lecture différée (microtâche) pour éviter un setState synchrone en effet.
  useEffect(() => {
    Promise.resolve().then(() => setActif(lireTheme()));
  }, []);

  function choisir(id: ThemeId) {
    setActif(id);
    appliquerTheme(id);
  }

  function reinitialiser() {
    choisir(THEME_DEFAUT);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {THEMES.map((t) => {
          const selectionne = t.id === actif;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => choisir(t.id)}
              aria-pressed={selectionne}
              className={[
                "flex flex-col gap-3 rounded-xl border p-4 text-left transition",
                selectionne
                  ? "border-[#2563EB] bg-[#2563EB]/[0.06] ring-1 ring-[#2563EB]"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex gap-1.5" aria-hidden="true">
                  {t.pastilles.map((c, i) => (
                    <span
                      key={i}
                      className="h-5 w-5 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    selectionne
                      ? "bg-[#2563EB] text-white"
                      : "border border-slate-300 text-transparent",
                  ].join(" ")}
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
              </span>

              <span
                className="grid h-20 grid-cols-[34%_1fr] gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2"
                aria-hidden="true"
              >
                <span
                  className="rounded-md"
                  style={{ backgroundColor: t.pastilles[0] }}
                />
                <span className="flex flex-col gap-1.5">
                  <span
                    className="h-5 rounded-md"
                    style={{ backgroundColor: t.pastilles[1] }}
                  />
                  <span className="flex flex-1 gap-1.5">
                    <span
                      className="flex-1 rounded-md bg-white"
                      style={{ border: `1px solid ${t.pastilles[1]}` }}
                    />
                    <span
                      className="w-8 rounded-md"
                      style={{ backgroundColor: t.pastilles[2] }}
                    />
                  </span>
                </span>
              </span>

              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {t.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  {t.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p className="text-xs leading-relaxed text-slate-500">
          Ce choix est enregistré sur cet appareil. La synchronisation avec votre
          compte pourra être ajoutée plus tard.
        </p>
        <button
          type="button"
          onClick={reinitialiser}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Réinitialiser le thème
        </button>
      </div>
    </div>
  );
}
