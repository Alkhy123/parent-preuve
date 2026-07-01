// components/home/HomeQuickActions.tsx
//
// 4 raccourcis d'action rapide (Fait, Preuve, Document, Frais).
// Deux variantes : "grille" (tuiles icônes, Board10) et "liste" (VueEnsemble).
// Purement présentationnel, aucun appel réseau.

import type { ReactNode } from "react";

import Link from "next/link";

type Icone = {
  href: string;
  label: string;
  description: string;
  color: string;
  svg: ReactNode;
};

const ACTIONS: Icone[] = [
  {
    href: "/journal",
    label: "Fait",
    description: "Ajouter un fait",
    color: "text-emerald-600 bg-emerald-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/preuves/nouvelle",
    label: "Preuve",
    description: "Ajouter une preuve",
    color: "text-sky-600 bg-sky-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Document",
    description: "Importer un document",
    color: "text-violet-600 bg-violet-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/frais",
    label: "Frais",
    description: "Ajouter un frais",
    color: "text-amber-600 bg-amber-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

type HomeQuickActionsProps = {
  variant?: "grille" | "liste";
};

export default function HomeQuickActions({ variant = "grille" }: HomeQuickActionsProps) {
  if (variant === "liste") {
    return (
      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          Raccourcis
        </h2>
        <ul className="mt-3 divide-y divide-[var(--app-border)]">
          {ACTIONS.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="flex items-center justify-between py-3 text-sm text-[var(--app-text)] transition hover:text-[var(--app-primary)]"
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${a.color}`}
                  >
                    {a.svg}
                  </span>
                  {a.description}
                </span>
                <span className="text-[var(--app-text-muted)]" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
        Ajouter au dossier
      </h2>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2 py-4 text-center transition hover:border-[var(--app-primary)]/40 hover:shadow-sm"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.color}`}
            >
              {a.svg}
            </span>
            <span className="text-xs font-medium leading-tight text-[var(--app-text)]">
              {a.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
