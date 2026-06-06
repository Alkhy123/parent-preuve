"use client";

import { useState } from "react";
import { periodesGarde, chezQuiLeJour, type RegleGarde } from "@/lib/gardeCalendrier";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function CalendrierMensuel({ regle }: { regle: RegleGarde | null }) {
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
    <section className="carte rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={moisPrecedent} className="rounded-md px-3 py-1 text-[#15233F] hover:bg-gray-100">‹</button>
        <h2 className="font-display text-xl text-[#15233F]">{titreMois} {annee}</h2>
        <button onClick={moisSuivant} className="rounded-md px-3 py-1 text-[#15233F] hover:bg-gray-100">›</button>
      </div>

      {!regle ? (
        <p className="text-sm text-gray-500">
          Renseigne une date de référence ci-dessus pour colorer le calendrier.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {JOURS_COURTS.map((j) => (
              <div key={j} className="text-center text-xs font-medium text-gray-500 py-1">{j}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cellules.map((jour, i) => {
              if (jour === null) return <div key={i} />;
              const chez = chezQui(jour);
              const fondMoi = chez === "moi";
              return (
                <div
                  key={i}
                  className={
                    "min-h-[52px] rounded-md p-1.5 text-sm " +
                    (estAujourdhui(jour) ? "ring-2 ring-[#15233F] " : "")
                  }
                  style={{
                    backgroundColor: fondMoi ? "#F6EFD6" : "#F3F4F6",
                    color: fondMoi ? "#15233F" : "#6B7280",
                  }}
                >
                  <span className="font-medium">{jour}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-5 mt-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#F6EFD6" }} />
              Garde chez moi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#F3F4F6" }} />
              Chez l'autre parent
            </span>
          </div>
        </>
      )}
    </section>
  );
}