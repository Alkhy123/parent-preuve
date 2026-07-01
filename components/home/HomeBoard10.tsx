"use client";

// components/home/HomeBoard10.tsx
//
// Variante d'accueil "Board10" : cockpit du jour orienté action.
// Inspiré de 02_INTERFACE_BOARD10_GUIDAGE — mobile-first, prochaine action
// mise en avant, ajout rapide accessible immédiatement, liste des priorités.
//
// Ne contient aucune logique métier ni appel Supabase direct.
// Les données sont chargées par les widgets existants réutilisés tels quels.

import Link from "next/link";

import HomeGuidedHint from "@/components/home/HomeGuidedHint";
import HomeQuickActions from "@/components/home/HomeQuickActions";
import WidgetActionsPrioritaires from "@/components/WidgetActionsPrioritaires";
import WidgetOnboardingPrioritaire from "@/components/WidgetOnboardingPrioritaire";
import WidgetProchaineAction from "@/components/WidgetProchaineAction";

const PARCOURS = [
  {
    href: "/collecter",
    titre: "Collecter",
    sous: "Ajouter",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/organiser",
    titre: "Organiser",
    sous: "Classer",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
  },
  {
    href: "/exporter",
    titre: "Exporter",
    sous: "Préparer",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
];

export default function HomeBoard10() {
  return (
    <div className="flex flex-col gap-5">

      {/* Assistant de démarrage non terminé (disparaît une fois terminé) */}
      <WidgetOnboardingPrioritaire />

      {/* ── Prochaine action ─────────────────────────────────────────── */}
      {/* Rôle central du Board10 : l'utilisateur doit voir UNE action claire.  */}
      {/* Le widget gère son propre rendu (card + badge). Pas de double card.   */}
      <WidgetProchaineAction />

      {/* ── Actions rapides : tuiles icônes ──────────────────────────── */}
      <HomeQuickActions variant="grille" />

      {/* ── Ce qu'il faut faire maintenant ───────────────────────────── */}
      <WidgetActionsPrioritaires />

      {/* ── Parcours compact : 3 colonnes ────────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          Votre parcours
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PARCOURS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-4 text-center transition hover:border-[var(--app-primary)]/40 hover:shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]">
                {p.svg}
              </span>
              <span className="text-sm font-semibold text-[var(--app-text)]">{p.titre}</span>
              <span className="text-xs text-[var(--app-text-muted)]">{p.sous}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Aide contextuelle (guided uniquement) ────────────────────── */}
      <HomeGuidedHint>
        Ce tableau de bord vous indique la prochaine étape utile pour votre dossier.
        Commencez par l&apos;action recommandée en haut, puis complétez les points
        signalés. Les raccourcis permettent d&apos;ajouter un élément en quelques
        secondes.
      </HomeGuidedHint>
    </div>
  );
}
