"use client";

// app/apercu/journal/page.tsx
//
// APERCU DE DESIGN — page Journal / Événements montee dans l'AppShell reutilisable.
// Donnees FICTIVES, aucune logique metier / Supabase / IA. Prototype visuel.

import { useState } from "react";
import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon } from "@/components/apercu/icones";

type Categorie = "Retard" | "Absence" | "Communication" | "Autre";

const EVENEMENTS: {
  jour: string;
  mois: string;
  titre: string;
  desc: string;
  cat: Categorie;
  heure: string;
  piece: boolean;
}[] = [
  { jour: "24", mois: "juin", titre: "Retard à l'arrivée", desc: "Enfant déposé à 18h45 au lieu de 18h00 prévu.", cat: "Retard", heure: "18:45", piece: true },
  { jour: "22", mois: "juin", titre: "Absence — sortie scolaire", desc: "Information transmise le jour même par l'établissement.", cat: "Absence", heure: "09:10", piece: false },
  { jour: "20", mois: "juin", titre: "Message de l'autre parent", desc: "Échange concernant l'organisation des vacances d'été.", cat: "Communication", heure: "20:30", piece: true },
  { jour: "17", mois: "juin", titre: "Retard à l'arrivée", desc: "Enfant déposé à 18h30 au lieu de 18h00 prévu.", cat: "Retard", heure: "18:30", piece: false },
  { jour: "15", mois: "juin", titre: "Entretien avec le CPE", desc: "Point sur le suivi scolaire et les absences récentes.", cat: "Autre", heure: "14:00", piece: true },
];

const STYLE_CAT: Record<Categorie, string> = {
  Retard: "border-amber-200 bg-amber-50 text-amber-700",
  Absence: "border-rose-200 bg-rose-50 text-rose-700",
  Communication: "app-badge-info border-blue-200 bg-blue-50 text-blue-700",
  Autre: "app-badge-neutre border-slate-200 bg-slate-100 text-slate-600",
};

const FILTRES: { label: string; cat?: Categorie }[] = [
  { label: "Tous" },
  { label: "Retards", cat: "Retard" },
  { label: "Absences", cat: "Absence" },
  { label: "Communications", cat: "Communication" },
  { label: "Autres", cat: "Autre" },
];

const COPILOTE: CopiloteContenu = {
  module: "Journal / Événements",
  intro:
    "Des pistes adaptées à votre journal. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Reformuler un événement", desc: "Obtenez une formulation neutre et factuelle d'un fait que vous avez noté.", icon: "copilote" },
    { titre: "Repérer les événements sans pièce", desc: "Identifiez les faits à compléter par un justificatif.", icon: "attache" },
    { titre: "Résumer le mois", desc: "Préparez une synthèse chronologique des événements récents.", icon: "syntheses" },
  ],
  conseil:
    "Notez les faits dès qu'ils surviennent : un journal régulier donne un dossier plus clair et plus facile à relire.",
};

function ActionsJournal() {
  return (
    <>
      <button
        type="button"
        className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex"
      >
        <Icon name="calendrier" className="h-4 w-4" />
        <span>Juin 2026</span>
        <Icon name="chevron" className="h-4 w-4 text-slate-400" />
      </button>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <Icon name="filtre" className="h-4 w-4" />
        <span className="hidden sm:inline">Filtrer</span>
      </button>
      <button
        type="button"
        className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex"
      >
        <Icon name="syntheses" className="h-4 w-4" />
        <span>Exporter</span>
      </button>
      <button
        type="button"
        className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex"
      >
        <Icon name="plus" className="h-4 w-4" />
        <span>Ajouter un événement</span>
      </button>
    </>
  );
}

export default function ApercuJournal() {
  const [filtreActif, setFiltreActif] = useState("Tous");
  const catActive = FILTRES.find((f) => f.label === filtreActif)?.cat;
  const evenements = catActive
    ? EVENEMENTS.filter((e) => e.cat === catActive)
    : EVENEMENTS;

  return (
    <AppShell
      active="journal"
      titre="Journal / Événements"
      sousTitre="Vos faits datés, classés et prêts à être exportés."
      actions={<ActionsJournal />}
      copilote={COPILOTE}
    >
      {/* Onglets de filtre */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTRES.map((f) => {
          const actif = f.label === filtreActif;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setFiltreActif(f.label)}
              className={[
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                actif
                  ? "app-chip-active bg-[#2563EB] text-white"
                  : "app-chip border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Liste d'evenements */}
      <ul className="mt-4 space-y-3">
        {evenements.map((e, i) => (
          <li
            key={i}
            className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:border-[#2563EB]/30 hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
          >
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
              <span className="text-lg font-bold leading-none">{e.jour}</span>
              <span className="text-[11px] lowercase">{e.mois}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-slate-900">{e.titre}</h3>
                <span
                  className={[
                    "rounded-full border px-2 py-0.5 text-xs font-medium",
                    STYLE_CAT[e.cat],
                  ].join(" ")}
                >
                  {e.cat}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{e.desc}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {e.heure}
                  </span>
                  <span
                    className={[
                      "inline-flex items-center gap-1",
                      e.piece ? "text-emerald-600" : "text-amber-600",
                    ].join(" ")}
                  >
                    <Icon name={e.piece ? "attache" : "alerte"} className="h-3.5 w-3.5" />
                    {e.piece ? "Pièce associée" : "Sans pièce associée"}
                  </span>
                </span>
                {/* Actions par événement */}
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Voir"
                    aria-label="Voir l'événement"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#2563EB]"
                  >
                    <Icon name="oeil" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Associer une pièce"
                    aria-label="Associer une pièce"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#2563EB]"
                  >
                    <Icon name="attache" className="h-4 w-4" />
                  </button>
                </span>
              </div>
            </div>
          </li>
        ))}
        {evenements.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Aucun événement dans cette catégorie pour le moment.
          </li>
        )}
      </ul>

      {/* Pied de liste : actions de fin de page */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Afficher plus
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Icon name="syntheses" className="h-4 w-4" />
            Exporter les événements filtrés
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Icon name="journal" className="h-4 w-4" />
            Résumé du mois
          </button>
        </div>
      </div>
    </AppShell>
  );
}
