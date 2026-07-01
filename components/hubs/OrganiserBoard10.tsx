// components/hubs/OrganiserBoard10.tsx
//
// Variante Board10 de la page /organiser.
// Compact, liens directs, CTA vers les points les plus utiles.
// Aucun appel Supabase : layout statique.

import Link from "next/link";

import AppNotice from "@/components/app/AppNotice";
import HomeGuidedHint from "@/components/home/HomeGuidedHint";

const LIENS_PRINCIPAUX = [
  {
    href: "/rattacher",
    label: "Éléments à rattacher",
    sous: "Compléter les éléments incomplets",
    color: "text-amber-600 bg-amber-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    href: "/chronologie",
    label: "Chronologie",
    sous: "Voir les faits dans l'ordre",
    color: "text-emerald-600 bg-emerald-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: "/organiser/brouillons",
    label: "Brouillons locaux",
    sous: "Finaliser les saisies incomplètes",
    color: "text-sky-600 bg-sky-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: "/documents/coffre-fort",
    label: "Coffre-fort",
    sous: "Retrouver les pièces rangées",
    color: "text-violet-600 bg-violet-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    href: "/calendrier",
    label: "Calendrier",
    sous: "Organiser les échéances",
    color: "text-rose-600 bg-rose-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/frais",
    label: "Frais",
    sous: "Suivre les dépenses",
    color: "text-amber-600 bg-amber-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

const STRUCTURE_BASE = [
  { href: "/dossier", label: "Dossier", sous: "Informations générales" },
  { href: "/enfants", label: "Enfants", sous: "Rattachement" },
  { href: "/procedure", label: "Procédure", sous: "Autre parent & jugement" },
];

export default function OrganiserBoard10() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── CTA principal ─────────────────────────────────────────────── */}
      <Link
        href="/chronologie"
        className="flex items-center gap-4 rounded-2xl bg-[var(--app-text)] px-5 py-4 text-[var(--app-surface)] transition hover:opacity-90"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </span>
        <span className="flex-1 text-base font-semibold">Voir la chronologie</span>
        <span className="text-lg" aria-hidden="true">›</span>
      </Link>

      {/* ── Liens principaux : liste avec icône ───────────────────────── */}
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
        <ul className="divide-y divide-[var(--app-border)]">
          {LIENS_PRINCIPAUX.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-[var(--app-surface-muted)]"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${l.color}`}>
                  {l.svg}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--app-text)]">{l.label}</p>
                  <p className="text-xs text-[var(--app-text-muted)] truncate">{l.sous}</p>
                </div>
                <span className="text-[var(--app-text-muted)]" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Structure de base : 3 mini-liens ──────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          Vérifier les bases
        </p>
        <div className="grid grid-cols-3 gap-3">
          {STRUCTURE_BASE.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex flex-col gap-1 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition hover:border-[var(--app-primary)]/40 hover:shadow-sm"
            >
              <span className="text-sm font-semibold text-[var(--app-text)]">{s.label}</span>
              <span className="text-xs text-[var(--app-text-muted)]">{s.sous}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Notice ────────────────────────────────────────────────────── */}
      <AppNotice titre="Objectif de cette zone">
        <p>
          Rangez les informations déjà collectées. Les modifications ne sont appliquées
          qu&apos;après confirmation explicite de votre part.
        </p>
      </AppNotice>

      {/* ── Aide contextuelle (guided uniquement) ─────────────────────── */}
      <HomeGuidedHint>
        Commencez par les &laquo;&nbsp;Éléments à rattacher&nbsp;&raquo; pour compléter les saisies
        incomplètes. Vérifiez ensuite la chronologie pour vous assurer que les faits
        sont bien ordonnés. Les bases du dossier (Dossier, Enfants, Procédure) sont
        à compléter une seule fois.
      </HomeGuidedHint>
    </div>
  );
}
