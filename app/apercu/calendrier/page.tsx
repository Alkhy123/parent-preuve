"use client";

// app/apercu/calendrier/page.tsx — APERCU. Données fictives, aucune logique métier.

import { useState } from "react";
import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon } from "@/components/apercu/icones";
import { Badge, FiltrePills, type Ton } from "@/components/apercu/ui";

type StatutE = "À venir" | "À préparer" | "Terminé";

const ECHEANCES: {
  jour: string;
  mois: string;
  titre: string;
  type: string;
  statut: StatutE;
}[] = [
  { jour: "18", mois: "juin", titre: "Rendez-vous médical — Léa", type: "Santé", statut: "À venir" },
  { jour: "28", mois: "juin", titre: "Début garde — vacances", type: "Garde", statut: "À venir" },
  { jour: "05", mois: "juil.", titre: "Paiement de pension", type: "Pension", statut: "À venir" },
  { jour: "12", mois: "sept.", titre: "Audience", type: "Audience", statut: "À préparer" },
  { jour: "01", mois: "juin", titre: "Réunion parents-profs", type: "École", statut: "Terminé" },
];

const TON_STATUT: Record<StatutE, Ton> = {
  "À venir": "info",
  "À préparer": "attention",
  Terminé: "succes",
};

const TYPES = ["Tous", "Garde", "Pension", "Santé", "École", "Audience"];

const COPILOTE: CopiloteContenu = {
  module: "Calendrier",
  intro: "Des pistes pour anticiper. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Préparer un rappel", desc: "Anticiper une échéance importante.", icon: "calendrier" },
    { titre: "Repérer un chevauchement", desc: "Vérifier les périodes de garde.", icon: "check" },
    { titre: "Résumer le mois", desc: "Synthèse des échéances à venir.", icon: "syntheses" },
  ],
  conseil: "Tenez le calendrier à jour : cela évite les oublis et les malentendus.",
};

export default function ApercuCalendrier() {
  const [type, setType] = useState("Tous");
  const liste = ECHEANCES.filter((e) => type === "Tous" || e.type === type);

  return (
    <AppShell
      active="calendrier"
      titre="Calendrier"
      sousTitre="Échéances, gardes et rendez-vous à venir."
      copilote={COPILOTE}
      actions={
        <button type="button" className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex">
          <Icon name="plus" className="h-4 w-4" />
          <span>Ajouter une échéance</span>
        </button>
      }
    >
      {/* Bascule de vue : liste (active) / mois (à venir) */}
      <div className="mb-3 inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
        <span className="rounded-md bg-[#2563EB] px-3 py-1 font-medium text-white">
          Vue liste
        </span>
        <span className="flex items-center gap-1 px-3 py-1 text-slate-400" title="Bientôt disponible">
          Vue mois
          <Badge ton="neutre">Bientôt</Badge>
        </span>
      </div>

      {/* Filtres par type */}
      <FiltrePills options={TYPES} actif={type} onChange={setType} />

      {/* Liste des échéances */}
      <ul className="mt-4 space-y-3">
        {liste.map((e) => (
          <li
            key={e.titre}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:border-[#2563EB]/30"
          >
            <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
              <span className="text-base font-bold leading-none">{e.jour}</span>
              <span className="text-[11px] lowercase">{e.mois}</span>
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-slate-900">{e.titre}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-2">
                <Badge ton="neutre">{e.type}</Badge>
                <Badge ton={TON_STATUT[e.statut]}>{e.statut}</Badge>
              </p>
            </div>
          </li>
        ))}
        {liste.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Aucune échéance pour ce type.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
