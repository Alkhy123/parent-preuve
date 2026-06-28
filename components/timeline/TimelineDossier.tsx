"use client";

import { useMemo, useState } from "react";

import { euros } from "@/lib/dossierCalculs";
import {
  filtrerTimelineParMode,
  type ModeLectureTimeline,
} from "@/lib/timeline/filtrerTimeline";
import {
  construireResumeTimeline,
  type ResumeTimeline,
} from "@/lib/timeline/resumeTimeline";
import type { TimelineItem, TimelineSource } from "@/lib/timeline/types";
import FiltresTimeline, {
  SOURCES_TIMELINE,
  type TriTimeline,
} from "@/components/timeline/FiltresTimeline";
import DetailTimelineItem from "@/components/timeline/DetailTimelineItem";

type Props = {
  items: TimelineItem[];
  enfants: { id: string; prenom_ou_alias: string }[];
  onRecharger: () => void;
};

// "AAAA-MM-JJ" -> "JJ/MM/AAAA"
function dateFr(d: string): string {
  const [a, m, j] = d.split("-");
  return j && m && a ? `${j}/${m}/${a}` : d;
}

// Libellé + pastille d'une source.
function metaSource(source: TimelineSource) {
  return SOURCES_TIMELINE.find((s) => s.cle === source);
}

// Classe de badge selon le statut factuel.
function badgeStatut(statut: string): string {
  if (statut === "Payé" || statut === "Remboursé") return "badge badge-succes";
  if (statut === "Impayé" || statut === "Non remboursé") {
    return "badge badge-erreur";
  }
  if (statut === "Partiel" || statut === "Horodatage à refaire") {
    return "badge badge-attention";
  }
  return "badge badge-neutre";
}

// Clé d'ordre : "AAAA-MM-JJTHH:MM".
// Les chaînes ISO se trient comme des dates.
function cleTri(item: TimelineItem): string {
  return `${item.date ?? "0000-00-00"}T${item.heure ?? "00:00"}`;
}

function CarteResume({
  label,
  valeur,
  aide,
}: {
  label: string;
  valeur: string | number;
  aide: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
      <p className="text-sm text-texte-doux">{label}</p>
      <p className="mt-1 text-2xl font-bold text-texte">{valeur}</p>
      <p className="mt-1 text-xs leading-5 text-texte-doux">{aide}</p>
    </div>
  );
}

function ResumeLecture({ resume }: { resume: ResumeTimeline }) {
  const sources = resume.sourcesAlimentees
    .map((source) => metaSource(source)?.libelle ?? source)
    .join(", ");

  return (
    <section className="carte rounded-2xl bg-[var(--surface)] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
            Résumé de lecture
          </p>

          <h2 className="mt-1 text-xl font-bold text-texte">
            Vue d’ensemble de la chronologie
          </h2>

          <p className="mt-2 text-sm leading-6 text-texte-doux">
            Ce résumé est calculé automatiquement à partir des éléments déjà
            enregistrés. Il sert à repérer les zones à compléter avant un export
            de travail.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-texte-doux md:max-w-xs">
          <p className="font-semibold text-texte">Période couverte</p>
          <p className="mt-1">{resume.periodeLisible}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CarteResume
          label="Éléments"
          valeur={resume.total}
          aide="Nombre total de lignes visibles dans la chronologie."
        />

        <CarteResume
          label="Datés"
          valeur={resume.totalDates}
          aide="Éléments pouvant être placés directement dans la frise."
        />

        <CarteResume
          label="À vérifier"
          valeur={resume.totalPointsAttention}
          aide="Éléments sans date ou avec un statut nécessitant un contrôle."
        />

        <CarteResume
          label="Pièces"
          valeur={resume.totalPiecesLiees}
          aide="Documents, justificatifs ou preuves déjà rattachés."
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
          <p className="font-semibold text-texte">Sources alimentées</p>
          <p className="mt-2 text-sm leading-6 text-texte-doux">
            {sources || "Aucune source alimentée pour le moment."}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-950">Points d’attention</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-900">
            {resume.pointsAttention.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function TimelineDossier({
  items,
  enfants,
  onRecharger,
}: Props) {
  const resume = useMemo(() => construireResumeTimeline(items), [items]);

  // Sources actives, toutes cochées par défaut.
  const [actives, setActives] = useState<Set<TimelineSource>>(
    () => new Set(SOURCES_TIMELINE.map((s) => s.cle)),
  );

  const [tri, setTri] = useState<TriTimeline>("recent");
  const [modeLecture, setModeLecture] = useState<ModeLectureTimeline>("tout");

  // Item ouvert dans la modale de détail.
  const [itemActif, setItemActif] = useState<TimelineItem | null>(null);

  const nomEnfant = useMemo(() => {
    const map = new Map(enfants.map((e) => [e.id, e.prenom_ou_alias]));

    return (id: string | null | undefined) =>
      id ? map.get(id) ?? "Enfant" : null;
  }, [enfants]);

  const itemsSourcesActives = useMemo(
    () => items.filter((it) => actives.has(it.source)),
    [items, actives],
  );

  const compteModes = useMemo<Record<ModeLectureTimeline, number>>(
    () => ({
      tout: itemsSourcesActives.length,
      dates: filtrerTimelineParMode(itemsSourcesActives, "dates").length,
      sans_date: filtrerTimelineParMode(itemsSourcesActives, "sans_date").length,
      attention: filtrerTimelineParMode(itemsSourcesActives, "attention").length,
    }),
    [itemsSourcesActives],
  );

  // Filtrage par source active, mode de lecture, puis séparation daté / à dater + tri.
  const { dates, sansDate } = useMemo(() => {
    const visibles = filtrerTimelineParMode(itemsSourcesActives, modeLecture);

    const dates = visibles.filter((it) => it.date !== null);
    const sansDate = visibles.filter((it) => it.date === null);

    dates.sort((a, b) => {
      const cmp = cleTri(a).localeCompare(cleTri(b));
      return tri === "recent" ? -cmp : cmp;
    });

    return { dates, sansDate };
  }, [itemsSourcesActives, modeLecture, tri]);

  function basculer(source: TimelineSource) {
    setActives((prev) => {
      const suivant = new Set(prev);

      if (suivant.has(source)) suivant.delete(source);
      else suivant.add(source);

      return suivant;
    });
  }

  function toutAfficher() {
    setActives(new Set(SOURCES_TIMELINE.map((s) => s.cle)));
  }

  function ligne(item: TimelineItem) {
    const meta = metaSource(item.source);
    const enfant = nomEnfant(item.childId);

    return (
      <button
        key={`${item.source}-${item.id}`}
        type="button"
        onClick={() => setItemActif(item)}
        className="carte block w-full p-4 text-left transition hover:opacity-90"
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-texte">{item.titre}</h3>

              <p className="mt-1 text-sm text-texte-doux">
                {item.date ? dateFr(item.date) : "Sans date"}
                {item.heure ? ` · ${item.heure}` : ""}
              </p>
            </div>

            {meta && (
              <span className="badge badge-neutre inline-flex w-fit items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${meta.pastille}`}
                />
                {meta.libelle}
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-sm leading-6 text-texte-doux">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-sm">
            {enfant && <span className="badge badge-neutre">Enfant : {enfant}</span>}

            {item.montant != null && (
              <span className="badge badge-neutre">{euros(item.montant)}</span>
            )}

            {item.statut && (
              <span className={badgeStatut(item.statut)}>{item.statut}</span>
            )}

            {item.pieceLiee && (
              <span className="badge badge-neutre">Pièce liée</span>
            )}
          </div>
        </div>
      </button>
    );
  }

  const vide = dates.length === 0 && sansDate.length === 0;

  return (
    <section className="space-y-6">
      <ResumeLecture resume={resume} />

      <FiltresTimeline
        actives={actives}
        basculer={basculer}
        toutAfficher={toutAfficher}
        compte={resume.compteParSource}
        total={resume.total}
        tri={tri}
        setTri={setTri}
        mode={modeLecture}
        setMode={setModeLecture}
        compteModes={compteModes}
      />

      {vide ? (
        <div className="carte p-6 text-texte-doux">
          Aucun élément à afficher pour cette sélection.
        </div>
      ) : (
        <>
          {dates.length > 0 && <div className="space-y-3">{dates.map(ligne)}</div>}

          {sansDate.length > 0 && (
            <section className="space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h2 className="font-semibold text-amber-950">
                  À dater / à vérifier
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-900">
                  Ces éléments n’ont pas de date. Ouvrez la pièce d’origine pour
                  compléter cette information.
                </p>
              </div>

              {sansDate.map(ligne)}
            </section>
          )}
        </>
      )}

      <DetailTimelineItem
        item={itemActif}
        onFermer={() => setItemActif(null)}
        onRecharger={onRecharger}
        nomEnfant={nomEnfant}
      />
    </section>
  );
}
