"use client";

import type { ModeLectureTimeline } from "@/lib/timeline/filtrerTimeline";
import type { TimelineSource } from "@/lib/timeline/types";

// Sens de tri de la frise.
export type TriTimeline = "recent" | "ancien";

// Métadonnées d'affichage par source (libellé + pastille de couleur).
// L'or vif reste rare : on n'en fait pas une pastille de catégorie.
export const SOURCES_TIMELINE: {
  cle: TimelineSource;
  libelle: string;
  pastille: string;
}[] = [
  { cle: "journal", libelle: "Faits", pastille: "bg-slate-700" },
  { cle: "frais", libelle: "Frais", pastille: "bg-amber-500" },
  { cle: "pension", libelle: "Pension", pastille: "bg-emerald-600" },
  { cle: "document", libelle: "Documents", pastille: "bg-slate-400" },
  { cle: "preuve", libelle: "Preuves", pastille: "bg-slate-700/60" },
  { cle: "garde", libelle: "Garde", pastille: "bg-amber-500/60" },
];

const MODES_LECTURE: {
  cle: ModeLectureTimeline;
  libelle: string;
  aide: string;
}[] = [
  {
    cle: "tout",
    libelle: "Tout",
    aide: "Tous les éléments visibles",
  },
  {
    cle: "dates",
    libelle: "Datés",
    aide: "Éléments placés dans la frise",
  },
  {
    cle: "sans_date",
    libelle: "À dater",
    aide: "Éléments sans date",
  },
  {
    cle: "attention",
    libelle: "Attention",
    aide: "Éléments à vérifier",
  },
];

type Props = {
  actives: Set<TimelineSource>;
  basculer: (source: TimelineSource) => void;
  toutAfficher: () => void;
  compte: Record<TimelineSource, number>;
  total: number;
  tri: TriTimeline;
  setTri: (tri: TriTimeline) => void;
  mode: ModeLectureTimeline;
  setMode: (mode: ModeLectureTimeline) => void;
  compteModes: Record<ModeLectureTimeline, number>;
};

// Style commun d'une puce (chip), actif = fond plein foncé.
function styleChip(actif: boolean): string {
  return (
    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition " +
    (actif
      ? "border-slate-700 bg-slate-700 text-white"
      : "border-slate-300 bg-white text-slate-500 hover:border-slate-400")
  );
}

export default function FiltresTimeline({
  actives,
  basculer,
  toutAfficher,
  compte,
  total,
  tri,
  setTri,
  mode,
  setMode,
  compteModes,
}: Props) {
  const toutActif = actives.size === SOURCES_TIMELINE.length;

  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
            Lecture
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {MODES_LECTURE.map((m) => {
              const actif = mode === m.cle;

              return (
                <button
                  key={m.cle}
                  type="button"
                  onClick={() => setMode(m.cle)}
                  className={styleChip(actif)}
                  aria-pressed={actif}
                  title={m.aide}
                >
                  {m.libelle}
                  <span className="rounded-full bg-black/10 px-2 text-xs">
                    {compteModes[m.cle]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
            Sources
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toutAfficher}
              className={styleChip(toutActif)}
              aria-pressed={toutActif}
            >
              Tout
              <span className="rounded-full bg-black/10 px-2 text-xs">
                {total}
              </span>
            </button>

            {SOURCES_TIMELINE.map((s) => {
              const actif = actives.has(s.cle);

              return (
                <button
                  key={s.cle}
                  type="button"
                  onClick={() => basculer(s.cle)}
                  className={styleChip(actif)}
                  aria-pressed={actif}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${s.pastille}`}
                  />
                  {s.libelle}
                  <span className="rounded-full bg-black/10 px-2 text-xs">
                    {compte[s.cle]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
            Tri
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTri("recent")}
              className={styleChip(tri === "recent")}
              aria-pressed={tri === "recent"}
            >
              Plus récent d&apos;abord
            </button>

            <button
              type="button"
              onClick={() => setTri("ancien")}
              className={styleChip(tri === "ancien")}
              aria-pressed={tri === "ancien"}
            >
              Plus ancien d&apos;abord
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
