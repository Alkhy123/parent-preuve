// components/hubs/CollecterBoard10.tsx
//
// Variante Board10 de la page /collecter.
// Action-first, mobile-first : un gros CTA en haut, grille d'icônes,
// actions secondaires, notice courte. Aucun appel Supabase.

import Link from "next/link";

import AppNotice from "@/components/app/AppNotice";
import HomeGuidedHint from "@/components/home/HomeGuidedHint";

const ACTIONS_PRINCIPALES = [
  {
    href: "/journal",
    label: "Noter un fait",
    color: "text-emerald-600 bg-emerald-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: "/preuves/nouvelle",
    label: "Ajouter une preuve",
    color: "text-sky-600 bg-sky-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Importer un document",
    color: "text-violet-600 bg-violet-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const ACTIONS_SECONDAIRES = [
  {
    href: "/frais",
    label: "Ajouter un frais",
    color: "text-amber-600 bg-amber-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: "/calendrier",
    label: "Ajouter une échéance",
    color: "text-rose-600 bg-rose-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function CollecterBoard10() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── CTA principal ─────────────────────────────────────────────── */}
      <Link
        href="/collecter/rapide"
        className="flex items-center gap-4 rounded-2xl bg-[var(--app-text)] px-5 py-4 text-[var(--app-surface)] transition hover:opacity-90"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
        <span className="flex-1 text-base font-semibold">Ajouter un élément</span>
        <span className="text-lg" aria-hidden="true">›</span>
      </Link>

      {/* ── Actions principales : 3 tuiles ────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS_PRINCIPALES.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-5 text-center transition hover:border-[var(--app-primary)]/40 hover:shadow-sm"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${a.color}`}>
              {a.svg}
            </span>
            <span className="text-xs font-medium leading-tight text-[var(--app-text)]">
              {a.label}
            </span>
            <span className="text-xs text-[var(--app-text-muted)]" aria-hidden="true">›</span>
          </Link>
        ))}
      </div>

      {/* ── Actions secondaires : 2 tuiles ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS_SECONDAIRES.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-5 text-center transition hover:border-[var(--app-primary)]/40 hover:shadow-sm"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${a.color}`}>
              {a.svg}
            </span>
            <span className="text-sm font-medium text-[var(--app-text)]">{a.label}</span>
            <span className="text-xs text-[var(--app-text-muted)]" aria-hidden="true">›</span>
          </Link>
        ))}
      </div>

      {/* ── Notice ────────────────────────────────────────────────────── */}
      <AppNotice titre="À retenir">
        <p>
          Collectez au fil de l&apos;eau, organisez ensuite depuis votre dossier.
          Un élément collecté rapidement vaut mieux qu&apos;un élément oublié.
        </p>
      </AppNotice>

      {/* ── Aide contextuelle (guided uniquement) ─────────────────────── */}
      <HomeGuidedHint>
        Commencez par &laquo;&nbsp;Ajouter un élément&nbsp;&raquo; pour une saisie guidée.
        Les raccourcis ci-dessus vous permettent d&apos;aller directement dans le bon module.
        Vous pourrez compléter le classement plus tard depuis la section Organiser.
      </HomeGuidedHint>
    </div>
  );
}
