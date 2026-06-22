"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { euros } from "@/lib/dossierCalculs";
import type { TimelineItem, TimelineSource } from "@/lib/timeline/types";
import FiltresTimeline, {
  SOURCES_TIMELINE,
  type TriTimeline,
} from "@/components/timeline/FiltresTimeline";

type Props = {
  items: TimelineItem[];
  enfants: { id: string; prenom_ou_alias: string }[];
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

// Classe de badge selon le statut factuel (réglé = succès, en attente = attention).
function badgeStatut(statut: string): string {
  if (statut === "Payé" || statut === "Remboursé") return "badge badge-succes";
  if (statut === "Impayé" || statut === "Non remboursé") return "badge badge-erreur";
  if (statut === "Partiel") return "badge badge-attention";
  return "badge badge-neutre";
}

// Clé d'ordre : "AAAA-MM-JJTHH:MM" (les chaînes ISO se trient comme des dates).
function cleTri(item: TimelineItem): string {
  return `${item.date}T${item.heure ?? "00:00"}`;
}

export default function TimelineDossier({ items, enfants }: Props) {
  // Sources actives (toutes par défaut) et sens de tri.
  const [actives, setActives] = useState<Set<TimelineSource>>(
    () => new Set(SOURCES_TIMELINE.map((s) => s.cle)),
  );
  const [tri, setTri] = useState<TriTimeline>("recent");

  const nomEnfant = useMemo(() => {
    const map = new Map(enfants.map((e) => [e.id, e.prenom_ou_alias]));
    return (id: string | null | undefined) =>
      id ? map.get(id) ?? "Enfant" : null;
  }, [enfants]);

  // Compteur par source sur l'ensemble (indépendant du filtre actif).
  const compte = useMemo(() => {
    const c = Object.fromEntries(
      SOURCES_TIMELINE.map((s) => [s.cle, 0]),
    ) as Record<TimelineSource, number>;
    for (const it of items) c[it.source]++;
    return c;
  }, [items]);

  // Filtrage par source active, puis séparation daté / à dater + tri.
  const { dates, sansDate } = useMemo(() => {
    const visibles = items.filter((it) => actives.has(it.source));
    const dates = visibles.filter((it) => it.date !== null);
    const sansDate = visibles.filter((it) => it.date === null);
    dates.sort((a, b) => {
      const cmp = cleTri(a).localeCompare(cleTri(b));
      return tri === "recent" ? -cmp : cmp;
    });
    return { dates, sansDate };
  }, [items, actives, tri]);

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
    const contenu = (
      <div className="flex items-start gap-3">
        <span
          className={"mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full " + (meta?.pastille ?? "bg-texte-doux")}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="font-display text-lg text-texte">{item.titre}</p>
            <p className="text-sm text-texte-doux">
              {item.date ? dateFr(item.date) : "Sans date"}
              {item.heure ? ` · ${item.heure}` : ""}
            </p>
          </div>

          {item.description && (
            <p className="mt-1 text-sm text-texte-doux">{item.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="badge badge-info">{meta?.libelle ?? item.source}</span>
            {enfant && <span className="text-texte-doux">Enfant : {enfant}</span>}
            {item.montant != null && (
              <span className="text-texte">{euros(item.montant)}</span>
            )}
            {item.statut && (
              <span className={badgeStatut(item.statut)}>{item.statut}</span>
            )}
          </div>
        </div>
      </div>
    );

    // La timeline est en lecture seule : on renvoie vers la page métier d'origine.
    return (
      <li key={`${item.source}-${item.id}`} className="carte p-4">
        {item.href ? (
          <Link href={item.href} className="block hover:opacity-90">
            {contenu}
          </Link>
        ) : (
          contenu
        )}
      </li>
    );
  }

  const total = items.length;
  const vide = dates.length === 0 && sansDate.length === 0;

  return (
    <div>
      <FiltresTimeline
        actives={actives}
        basculer={basculer}
        toutAfficher={toutAfficher}
        compte={compte}
        total={total}
        tri={tri}
        setTri={setTri}
      />

      {vide ? (
        <p className="rounded-lg bg-surface px-4 py-8 text-center text-texte-doux">
          Aucun élément à afficher pour cette sélection.
        </p>
      ) : (
        <>
          {dates.length > 0 && (
            <ol className="space-y-3">{dates.map(ligne)}</ol>
          )}

          {sansDate.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-texte-doux">
                À dater / à vérifier
              </h2>
              <p className="mb-3 text-sm text-texte-doux">
                Ces éléments n&apos;ont pas de date. Ouvrez la pièce d&apos;origine
                pour compléter cette information.
              </p>
              <ol className="space-y-3">{sansDate.map(ligne)}</ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
