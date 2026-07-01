"use client";

// components/home/HomeVueEnsemble.tsx
//
// Variante d'accueil "Vue d'ensemble" : tableau de bord synthétique.
// Inspiré de 03_INTERFACE_VUE_ENSEMBLE_DASHBOARD — vision globale du dossier,
// indicateurs, modules accessibles directement.
//
// Charge quelques compteurs supplémentaires (events, documents, expenses,
// preuves_photo) via Supabase, cloisonnés sur la procédure active.
// Les widgets existants (Actions prioritaires, Dossier prêt, Situation mois)
// sont réutilisés tels quels et gèrent leurs propres données.

import { useEffect, useState } from "react";
import Link from "next/link";

import HomeGuidedHint from "@/components/home/HomeGuidedHint";
import HomeQuickActions from "@/components/home/HomeQuickActions";
import WidgetActionsPrioritaires from "@/components/WidgetActionsPrioritaires";
import WidgetDossierPret from "@/components/WidgetDossierPret";
import WidgetSituationMois from "@/components/WidgetSituationMois";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

type IndicateursDossier = {
  events: number;
  documents: number;
  expenses: number;
  preuves: number;
  procedureLabel: string | null;
  procedureCreatedAt: string | null;
};

// ── Modules ───────────────────────────────────────────────────────────────────

const MODULES = [
  {
    href: "/journal",
    titre: "Journal",
    sous: "Faits notés",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-600" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/frais",
    titre: "Frais",
    sous: "Dépenses",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-600" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: "/documents",
    titre: "Documents",
    sous: "Pièces",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-violet-600" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/preuves",
    titre: "Preuves",
    sous: "Photos",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-sky-600" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/calendrier",
    titre: "Calendrier",
    sous: "Garde",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-rose-600" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/exporter",
    titre: "Exporter",
    sous: "PDF",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-600" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function dateOuverte(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function HomeVueEnsemble() {
  const [indicateurs, setIndicateurs] = useState<IndicateursDossier | null>(null);

  useEffect(() => {
    let annule = false;

    (async () => {
      const procId = await getProcedureActiveId();

      if (!procId) {
        if (!annule) {
          setIndicateurs({
            events: 0,
            documents: 0,
            expenses: 0,
            preuves: 0,
            procedureLabel: null,
            procedureCreatedAt: null,
          });
        }
        return;
      }

      // Compteurs cloisonnés sur la procédure active — requêtes légères (count only).
      const [evRes, docRes, expRes, prRes, procRes] = await Promise.all([
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("procedure_id", procId)
          .eq("statut", "valide"),
        supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("procedure_id", procId),
        supabase
          .from("expenses")
          .select("*", { count: "exact", head: true })
          .eq("procedure_id", procId),
        supabase
          .from("preuves_photo")
          .select("*", { count: "exact", head: true })
          .eq("procedure_id", procId),
        supabase
          .from("procedures")
          .select("etiquette, created_at")
          .eq("id", procId)
          .maybeSingle(),
      ]);

      if (!annule) {
        setIndicateurs({
          events: evRes.count ?? 0,
          documents: docRes.count ?? 0,
          expenses: expRes.count ?? 0,
          preuves: prRes.count ?? 0,
          procedureLabel: procRes.data?.etiquette ?? null,
          procedureCreatedAt: procRes.data?.created_at ?? null,
        });
      }
    })();

    return () => {
      annule = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Dossier actif ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-accent)]">
              Dossier actif
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--app-text)]">
              {indicateurs?.procedureLabel ?? "Procédure en cours"}
            </h2>
            {indicateurs?.procedureCreatedAt ? (
              <p className="mt-0.5 text-sm text-[var(--app-text-muted)]">
                Ouvert le {dateOuverte(indicateurs.procedureCreatedAt)}
              </p>
            ) : null}
          </div>

          <Link
            href="/collecter"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-on-primary)] transition hover:bg-[var(--app-primary-hover)]"
          >
            Continuer mon dossier
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Indicateurs chiffrés */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Faits notés",
              value: indicateurs?.events ?? "–",
              href: "/journal",
            },
            {
              label: "Documents",
              value: indicateurs?.documents ?? "–",
              href: "/documents",
            },
            {
              label: "Frais suivis",
              value: indicateurs?.expenses ?? "–",
              href: "/frais",
            },
            {
              label: "Preuves photo",
              value: indicateurs?.preuves ?? "–",
              href: "/preuves",
            },
          ].map((ind) => (
            <Link
              key={ind.href}
              href={ind.href}
              className="group rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 transition hover:border-[var(--app-primary)]/40"
            >
              <p className="text-2xl font-bold text-[var(--app-text)]">{ind.value}</p>
              <p className="mt-0.5 text-xs text-[var(--app-text-muted)] group-hover:text-[var(--app-primary)]">
                {ind.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Contenu principal : 2 colonnes sur desktop ────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* Colonne principale */}
        <div className="flex flex-col gap-6">
          <WidgetActionsPrioritaires />
          <WidgetSituationMois />
        </div>

        {/* Panneau latéral */}
        <div className="flex flex-col gap-6">
          <WidgetDossierPret />
          <HomeQuickActions variant="liste" />
        </div>
      </div>

      {/* ── Modules ───────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          Modules
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex flex-col gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition hover:border-[var(--app-primary)]/40 hover:shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--app-surface-muted)]">
                {m.svg}
              </span>
              <div>
                <p className="font-semibold text-[var(--app-text)]">{m.titre}</p>
                <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{m.sous}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Aide contextuelle (guided uniquement) ─────────────────────── */}
      <HomeGuidedHint>
        Cette vue d&apos;ensemble vous donne une vision synthétique de votre
        dossier. Cliquez sur un indicateur ou un module pour y accéder directement.
        La section &laquo;&nbsp;À surveiller&nbsp;&raquo; signale les points à
        compléter en priorité.
      </HomeGuidedHint>
    </div>
  );
}
