"use client";

// components/onboarding/CalendrierVisites.tsx
//
// Calendrier mensuel cliquable pour les visites mediatisees : l'utilisateur
// coche directement les dates prevues par le centre de visite. Chaque date
// cochee est enregistree comme un evenement (table `events`, categorie
// `visite_mediatisee`, statut `valide`) ; decocher supprime l'evenement.
//
// Ces dates remontent ensuite dans les rappels de l'accueil (ProchainesEcheances).

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const CATEGORIE_VISITE = "visite_mediatisee";

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function ymd(annee: number, mois0: number, jour: number): string {
  return `${annee}-${String(mois0 + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
}

export default function CalendrierVisites({ enfantId }: { enfantId: string }) {
  const today = new Date();
  const [annee, setAnnee] = useState(today.getFullYear());
  const [mois, setMois] = useState(today.getMonth()); // 0 = janvier
  // date "YYYY-MM-DD" -> id de l'evenement (pour pouvoir le supprimer).
  const [parDate, setParDate] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(true);
  const [occupe, setOccupe] = useState<string | null>(null);
  const [erreur, setErreur] = useState("");
  // Procédure de l'enfant : un événement de visite hérite directement de la
  // procédure de l'enfant ciblé (cohérence avec la contrainte composite SQL).
  const [procedureId, setProcedureId] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    Promise.resolve().then(async () => {
      if (annule) return;
      setChargement(true);
      const { data: enfant } = await supabase
        .from("children")
        .select("procedure_id")
        .eq("id", enfantId)
        .single();
      if (annule) return;
      setProcedureId((enfant as { procedure_id: string | null } | null)?.procedure_id ?? null);
      const { data } = await supabase
        .from("events")
        .select("id, date_evenement")
        .eq("categorie", CATEGORIE_VISITE)
        .eq("child_id", enfantId);
      if (annule) return;
      const map: Record<string, string> = {};
      (data ?? []).forEach((e) => {
        map[(e as { date_evenement: string }).date_evenement] = (e as { id: string }).id;
      });
      setParDate(map);
      setChargement(false);
    });
    return () => {
      annule = true;
    };
  }, [enfantId]);

  async function basculer(dateStr: string) {
    if (occupe) return;
    setErreur("");
    setOccupe(dateStr);
    const existant = parDate[dateStr];

    if (existant) {
      const { error } = await supabase.from("events").delete().eq("id", existant);
      if (error) setErreur("Erreur : " + error.message);
      else
        setParDate((prev) => {
          const copie = { ...prev };
          delete copie[dateStr];
          return copie;
        });
    } else {
      if (!procedureId) {
        setErreur("Procédure de l'enfant introuvable. Réessaie après avoir rechargé la page.");
        setOccupe(null);
        return;
      }
      const { data, error } = await supabase
        .from("events")
        .insert({
          child_id: enfantId,
          titre: "Visite médiatisée",
          categorie: CATEGORIE_VISITE,
          date_evenement: dateStr,
          statut: "valide",
          procedure_id: procedureId,
        })
        .select("id")
        .single();
      if (error || !data) setErreur("Erreur : " + (error?.message ?? "inconnue"));
      else setParDate((prev) => ({ ...prev, [dateStr]: data.id }));
    }
    setOccupe(null);
  }

  function moisPrecedent() {
    if (mois === 0) {
      setMois(11);
      setAnnee(annee - 1);
    } else setMois(mois - 1);
  }
  function moisSuivant() {
    if (mois === 11) {
      setMois(0);
      setAnnee(annee + 1);
    } else setMois(mois + 1);
  }

  const premier = new Date(annee, mois, 1);
  const offset = (premier.getDay() + 6) % 7; // cases vides avant le 1er (lundi)
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cellules: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cellules.push(null);
  for (let j = 1; j <= nbJours; j++) cellules.push(j);

  const estAujourdhui = (jour: number) =>
    jour === today.getDate() &&
    mois === today.getMonth() &&
    annee === today.getFullYear();

  const titreMois = MOIS[mois].charAt(0).toUpperCase() + MOIS[mois].slice(1);
  const nbTotal = Object.keys(parDate).length;

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={moisPrecedent}
          className="rounded-md px-3 py-1 text-navy hover:bg-navy/5"
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <h4 className="font-display text-base text-navy">
          {titreMois} {annee}
        </h4>
        <button
          type="button"
          onClick={moisSuivant}
          className="rounded-md px-3 py-1 text-navy hover:bg-navy/5"
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {JOURS_COURTS.map((j) => (
          <div key={j} className="py-1 text-center text-xs font-medium text-texte-doux">
            {j}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cellules.map((jour, i) => {
          if (jour === null) return <div key={i} />;
          const dateStr = ymd(annee, mois, jour);
          const visite = !!parDate[dateStr];
          const enCours = occupe === dateStr;
          return (
            <button
              key={i}
              type="button"
              onClick={() => basculer(dateStr)}
              disabled={chargement || occupe !== null}
              aria-pressed={visite}
              className={[
                "min-h-[44px] rounded-md p-1.5 text-sm transition disabled:opacity-60",
                estAujourdhui(jour) ? "ring-1 ring-navy " : "",
                visite
                  ? "bg-[#C2A24C] font-semibold text-[#15233F]"
                  : "bg-slate-50 text-texte hover:bg-navy/5",
              ].join(" ")}
            >
              {enCours ? "…" : jour}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-texte-doux">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ backgroundColor: "#C2A24C" }}
          />
          Date de visite cochée
        </span>
        <span>
          {nbTotal} visite{nbTotal > 1 ? "s" : ""} enregistrée{nbTotal > 1 ? "s" : ""}
        </span>
      </div>

      {erreur && <p className="mt-2 text-sm text-rouge">{erreur}</p>}
    </div>
  );
}
