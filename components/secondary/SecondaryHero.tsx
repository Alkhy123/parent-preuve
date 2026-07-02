// components/secondary/SecondaryHero.tsx
//
// Bannière hero Board10 pour les pages secondaires (Journal, Frais,
// Documents, Preuves). CTA pleine largeur fond navy, icône cerclée, flèche.
// Purement présentationnel — aucune logique métier ni appel réseau.

import type { ReactNode } from "react";
import Link from "next/link";

type SecondaryHeroProps = {
  titre: string;
  sousTitre?: string;
  // Passer soit href (lien) soit onClick (bouton) — pas les deux.
  ctaLabel: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  icon?: ReactNode;
};

const IconDefault = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export default function SecondaryHero({
  titre,
  sousTitre,
  ctaLabel,
  ctaHref,
  ctaOnClick,
  icon = IconDefault,
}: SecondaryHeroProps) {
  // Contenu du CTA. Les enfants sont des éléments flex DIRECTS de l'élément CTA
  // (voir `classes` : `flex`), sans span-conteneur intermédiaire — sinon un bloc
  // flex imbriqué dans un <a> inline (`w-full` ignoré) fragmente le fond navy.
  const ctaContent = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent,#c2a24c)]/25 text-[var(--app-accent,#c2a24c)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-base font-semibold">{ctaLabel}</span>
        {sousTitre ? (
          <span className="block text-xs text-white/70">{sousTitre}</span>
        ) : null}
      </span>
      <span className="text-lg text-white/70" aria-hidden="true">›</span>
    </>
  );

  // `flex` (block-level) sur l'élément CTA lui-même : `w-full` s'applique aussi
  // bien sur <a> que sur <button>, le fond navy couvre toute la largeur.
  const classes =
    "flex w-full items-center gap-3 rounded-2xl bg-[var(--app-text)] px-5 py-4 text-left text-[var(--app-surface)] transition hover:opacity-90 active:scale-[0.99]";

  if (ctaHref) {
    return (
      <div>
        {titre ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            {titre}
          </p>
        ) : null}
        <Link href={ctaHref} className={classes}>
          {ctaContent}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {titre ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          {titre}
        </p>
      ) : null}
      <button type="button" onClick={ctaOnClick} className={classes}>
        {ctaContent}
      </button>
    </div>
  );
}
