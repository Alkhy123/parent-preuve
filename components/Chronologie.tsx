"use client";

import { useMemo, useState } from "react";
import type { EntreeChronologie, TypeEntree } from "@/lib/chronologie";

type Props = {
  entrees: EntreeChronologie[];
  enfants: { id: string; prenom_ou_alias: string }[];
};

type Onglet = TypeEntree | "tout";

// Onglets + pastille de couleur (l'or reste rare → pas utilisé ici).
const TYPES: { cle: TypeEntree; libelle: string; pastille: string }[] = [
  { cle: "fait", libelle: "Faits", pastille: "bg-navy" },
  { cle: "frais", libelle: "Frais", pastille: "bg-amber" },
  { cle: "pension", libelle: "Pension", pastille: "bg-vert" },
  { cle: "preuve", libelle: "Preuves", pastille: "bg-texte-doux" },
];

function pastilleDe(type: TypeEntree): string {
  return TYPES.find((t) => t.cle === type)?.pastille ?? "bg-texte-doux";
}

// "AAAA-MM-JJ" -> "JJ/MM/AAAA"
function dateFr(d: string): string {
  const [a, m, j] = d.split("-");
  return j && m && a ? `${j}/${m}/${a}` : d;
}

// Couleur du texte de statut (factuel : vert = réglé, rouge = en attente).
function couleurStatut(statut: string | null): string {
  if (!statut) return "text-texte-doux";
  if (statut === "Payé" || statut === "Remboursé") return "text-vert";
  if (statut === "Impayé" || statut === "Partiel" || statut === "Non remboursé")
    return "text-rouge";
  return "text-texte-doux";
}

export default function Chronologie({ entrees, enfants }: Props) {
  // Un seul onglet actif à la fois. "tout" par défaut.
  const [onglet, setOnglet] = useState<Onglet>("tout");

  const nomEnfant = useMemo(() => {
    const map = new Map(enfants.map((e) => [e.id, e.prenom_ou_alias]));
    return (id: string | null) => (id ? map.get(id) ?? "Enfant" : null);
  }, [enfants]);

  // Compteur par type (sur l'ensemble).
  const compte = useMemo(() => {
    const c: Record<TypeEntree, number> = { fait: 0, frais: 0, pension: 0, preuve: 0 };
    for (const e of entrees) c[e.type]++;
    return c;
  }, [entrees]);

  const visibles = onglet === "tout" ? entrees : entrees.filter((e) => e.type === onglet);

  // Style d'un onglet (actif = navy plein).
  const styleOnglet = (actif: boolean) =>
    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition " +
    (actif
      ? "border-navy bg-navy text-surface"
      : "border-texte-doux/30 bg-surface text-texte-doux hover:border-navy/40");

  return (
    <div>
      {/* Onglets */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => setOnglet("tout")} className={styleOnglet(onglet === "tout")}>
          Tout
          <span className={onglet === "tout" ? "text-surface/70" : "text-texte-doux/70"}>
            {entrees.length}
          </span>
        </button>
        {TYPES.map((t) => {
          const actif = onglet === t.cle;
          return (
            <button key={t.cle} type="button" onClick={() => setOnglet(t.cle)} className={styleOnglet(actif)}>
              <span className={"h-2 w-2 rounded-full " + t.pastille} />
              {t.libelle}
              <span className={actif ? "text-surface/70" : "text-texte-doux/70"}>
                {compte[t.cle]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {visibles.length === 0 ? (
        <p className="rounded-lg bg-surface px-4 py-8 text-center text-texte-doux">
          Aucune entrée à afficher pour cette sélection.
        </p>
      ) : (
        <ol className="space-y-3">
          {visibles.map((e) => (
            <li key={`${e.type}-${e.id}`} className="carte p-4">
              <div className="flex items-start gap-3">
                <span
                  className={"mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full " + pastilleDe(e.type)}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="font-display text-lg text-texte">{e.titre}</p>
                    <p className="text-sm text-texte-doux">
                      {dateFr(e.date)}
                      {e.heure ? ` · ${e.heure}` : ""}
                    </p>
                  </div>

                  {e.details && (
                    <p className="mt-1 text-sm text-texte-doux">{e.details}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {nomEnfant(e.enfantId) && (
                      <span className="text-texte-doux">
                        Enfant : {nomEnfant(e.enfantId)}
                      </span>
                    )}
                    {e.montant != null && (
                      <span className="text-texte">
                        {e.montant.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    )}
                    {e.statut && (
                      <span className={couleurStatut(e.statut)}>{e.statut}</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}