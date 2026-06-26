"use client";

import { useState } from "react";
import { periodesGarde, chezQuiLeJour, type RegleGarde } from "@/lib/gardeCalendrier";
import { jourEnVacances } from "@/lib/calendrier/chevauchementVacances";
import type { PeriodeVacances } from "@/lib/calendrier/types";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function CalendrierMensuel({
  regle,
  vacances = [],
}: {
  regle: RegleGarde | null;
  vacances?: PeriodeVacances[];
}) {
  const today = new Date();
  const [annee, setAnnee] = useState(today.getFullYear());
  const [mois, setMois] = useState(today.getMonth()); // 0 = janvier

  function moisPrecedent() {
    if (mois === 0) { setMois(11); setAnnee(annee - 1); } else setMois(mois - 1);
  }
  function moisSuivant() {
    if (mois === 11) { setMois(0); setAnnee(annee + 1); } else setMois(mois + 1);
  }

  // Construction de la grille (semaine commençant le lundi)
  const premier = new Date(annee, mois, 1);
  const offset = (premier.getDay() + 6) % 7;         // cases vides avant le 1er
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  // Par défaut, l'enfant est chez le parent principal ; les périodes de DVH priment.
  const defaut: "moi" | "autre" = regle?.parent_principal === "moi" ? "moi" : "autre";
  const periodes = regle
    ? periodesGarde(regle, new Date(annee, mois, 1), new Date(annee, mois, nbJours))
    : [];

  const cellules: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cellules.push(null);
  for (let j = 1; j <= nbJours; j++) cellules.push(j);

  function chezQui(jour: number): "moi" | "autre" | null {
    if (!regle) return null;
    return chezQuiLeJour(periodes, new Date(annee, mois, jour)) ?? defaut;
  }

  const estAujourdhui = (jour: number) =>
    jour === today.getDate() && mois === today.getMonth() && annee === today.getFullYear();

  const titreMois = MOIS[mois].charAt(0).toUpperCase() + MOIS[mois].slice(1);

  return (
    <section
      className="rounded-lg border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={moisPrecedent}
          className="rounded-md px-3 py-1 transition hover:bg-[var(--app-surface-muted)]"
          style={{ color: "var(--app-text)" }}
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <h2 className="font-display text-xl" style={{ color: "var(--app-text)" }}>{titreMois} {annee}</h2>
        <button
          onClick={moisSuivant}
          className="rounded-md px-3 py-1 transition hover:bg-[var(--app-surface-muted)]"
          style={{ color: "var(--app-text)" }}
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>

      {!regle ? (
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
          Renseignez une date de référence ci-dessus pour colorer le calendrier.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {JOURS_COURTS.map((j) => (
              <div key={j} className="text-center text-xs font-medium py-1" style={{ color: "var(--app-text-muted)" }}>{j}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cellules.map((jour, i) => {
              if (jour === null) return <div key={i} />;
              const chez = chezQui(jour);
              const fondMoi = chez === "moi";
              const vac = jourEnVacances(new Date(annee, mois, jour), vacances);
              return (
                <div
                  key={i}
                  className="relative min-h-[52px] rounded-md p-1.5 text-sm"
                  style={{
                    backgroundColor: fondMoi ? "var(--app-primary-soft)" : "var(--app-surface-muted)",
                    color: fondMoi ? "var(--app-text)" : "var(--app-text-muted)",
                    outline: estAujourdhui(jour) ? "2px solid var(--app-primary)" : undefined,
                    outlineOffset: estAujourdhui(jour) ? "-2px" : undefined,
                  }}
                  title={vac ? vac.nom : undefined}
                >
                  <span className="font-medium">{jour}</span>
                  {vac && (
                    <span
                      className="absolute right-1 top-1 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "var(--app-primary)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs" style={{ color: "var(--app-text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "var(--app-primary-soft)", border: "1px solid var(--app-border)" }} />
              Garde chez moi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "var(--app-surface-muted)", border: "1px solid var(--app-border)" }} />
              Chez l&apos;autre parent
            </span>
            {vacances.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--app-primary)" }} />
                Vacances scolaires
              </span>
            )}
          </div>
          {vacances.length > 0 && (
            <p className="mt-2 text-xs" style={{ color: "var(--app-text-muted)" }}>
              Le repère vacances est indicatif : la répartition des vacances suit
              votre jugement, pas la règle d&apos;un week-end sur deux.
            </p>
          )}
        </>
      )}
    </section>
  );
}