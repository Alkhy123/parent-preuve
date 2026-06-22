"use client";

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
  { cle: "journal", libelle: "Faits", pastille: "bg-navy" },
  { cle: "frais", libelle: "Frais", pastille: "bg-amber" },
  { cle: "pension", libelle: "Pension", pastille: "bg-vert" },
  { cle: "document", libelle: "Documents", pastille: "bg-texte-doux" },
  { cle: "preuve", libelle: "Preuves", pastille: "bg-navy/60" },
  { cle: "garde", libelle: "Garde", pastille: "bg-amber/60" },
];

type Props = {
  actives: Set<TimelineSource>;
  basculer: (source: TimelineSource) => void;
  toutAfficher: () => void;
  compte: Record<TimelineSource, number>;
  total: number;
  tri: TriTimeline;
  setTri: (tri: TriTimeline) => void;
};

// Style commun d'une puce (chip), actif = navy plein.
function styleChip(actif: boolean): string {
  return (
    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition " +
    (actif
      ? "border-navy bg-navy text-surface"
      : "border-texte-doux/30 bg-surface text-texte-doux hover:border-navy/40")
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
}: Props) {
  const toutActif = actives.size === SOURCES_TIMELINE.length;

  return (
    <div className="mb-6 space-y-3">
      {/* Filtres par source (multi-sélection) */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toutAfficher}
          className={styleChip(toutActif)}
          aria-pressed={toutActif}
        >
          Tout
          <span className={toutActif ? "text-surface/70" : "text-texte-doux/70"}>
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
              <span className={"h-2 w-2 rounded-full " + s.pastille} aria-hidden />
              {s.libelle}
              <span className={actif ? "text-surface/70" : "text-texte-doux/70"}>
                {compte[s.cle]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sens de tri */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-texte-doux">Tri :</span>
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
  );
}
