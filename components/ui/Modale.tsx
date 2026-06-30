"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  ouverte: boolean;
  onFermer: () => void;
  titre?: string;
  children: ReactNode;
};

// Modale générique, réutilisable partout dans l'application.
// - overlay assombri ;
// - panneau centré, style sobre (bordure neutre, fond clair) ;
// - fermeture par la croix, le clic sur le fond ou la touche Échap ;
// - scroll de la page bloqué tant que la modale est ouverte.
export default function Modale({ ouverte, onFermer, titre, children }: Props) {
  // Échap ferme la modale ; on bloque aussi le scroll de fond.
  useEffect(() => {
    if (!ouverte) return;
    function surTouche(e: KeyboardEvent) {
      if (e.key === "Escape") onFermer();
    }
    document.addEventListener("keydown", surTouche);
    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = overflowInitial;
    };
  }, [ouverte, onFermer]);

  if (!ouverte) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      onClick={onFermer}
      role="presentation"
    >
      <div
        className="my-8 w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titre ?? "Détail"}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {titre ? (
            <h2 className="font-display text-xl text-[var(--app-text)]">{titre}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="shrink-0 rounded-full p-1 text-[var(--app-text-muted)] transition hover:bg-black/10 hover:text-[var(--app-text)]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
