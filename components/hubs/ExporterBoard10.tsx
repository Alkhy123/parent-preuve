// components/hubs/ExporterBoard10.tsx
//
// Variante Board10 de la page /exporter.
// Inspiré de 04_PAGES_MOBILE_PARCOURS/mobile_exporter_guide_export.png :
// hero card "Préparer un document", grille 2×2 des modèles, état du dossier,
// grand CTA final.
//
// Inclut WidgetDossierPret (client) pour l'état réel du dossier.

import Link from "next/link";

import HomeGuidedHint from "@/components/home/HomeGuidedHint";
import WidgetDossierPret from "@/components/WidgetDossierPret";

const MODELES = [
  {
    href: "/exporter/chronologie",
    titre: "Chronologie",
    description: "Affichez les faits par ordre chronologique avec dates et pièces associées.",
    color: "text-violet-600 bg-violet-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: "/exporter/note-synthese",
    titre: "Note de synthèse",
    description: "Résumez les éléments clés de votre dossier en quelques pages.",
    color: "text-amber-600 bg-amber-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/exporter/courriers",
    titre: "Courrier factuel",
    description: "Générez un courrier clair et factuel à destination d'un tiers.",
    color: "text-emerald-600 bg-emerald-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/exporter/pdf",
    titre: "Export PDF",
    description: "Compilez votre dossier complet en un fichier PDF prêt à partager.",
    color: "text-rose-600 bg-rose-50",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
];

export default function ExporterBoard10() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero : Préparer un document ────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--app-text)]">
              Préparer un document
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--app-text-muted)]">
              Choisissez un modèle, vérifiez que votre dossier est complet et générez
              un document clair et prêt à l&apos;emploi.
            </p>
          </div>
        </div>
      </div>

      {/* ── Grille 2×2 des modèles ────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          Choisir un modèle
        </p>
        <div className="grid grid-cols-2 gap-3">
          {MODELES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition hover:border-[var(--app-primary)]/40 hover:shadow-sm"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}>
                {m.svg}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--app-text)]">{m.titre}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--app-text-muted)]">{m.description}</p>
              </div>
              <span className="mt-auto text-xs text-[var(--app-primary)]">Ouvrir ›</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── État du dossier (WidgetDossierPret réutilisé) ─────────────── */}
      <WidgetDossierPret />

      {/* ── Grand CTA final ───────────────────────────────────────────── */}
      <Link
        href="/exporter/checklist"
        className="flex items-center gap-4 rounded-2xl bg-[var(--app-text)] px-5 py-4 text-[var(--app-surface)] transition hover:opacity-90"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <span className="flex-1 text-base font-semibold">Préparer l&apos;export</span>
        <span className="text-lg" aria-hidden="true">›</span>
      </Link>

      {/* ── Point de méthode ──────────────────────────────────────────── */}
      <p className="text-center text-xs text-[var(--app-text-muted)]">
        🔒 Vos données restent privées et sécurisées
      </p>

      {/* ── Aide contextuelle (guided uniquement) ─────────────────────── */}
      <HomeGuidedHint>
        Commencez par la checklist pour vérifier que votre dossier est complet avant
        de générer un document. Chaque modèle correspond à un besoin spécifique :
        chronologie pour l&apos;historique, note pour une synthèse, courrier pour un
        destinataire précis. Relisez toujours le document avant de le transmettre.
      </HomeGuidedHint>
    </div>
  );
}
