"use client";

// app/apercu/frais/page.tsx — APERCU. Données fictives, aucune logique métier.

import { useState } from "react";
import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon } from "@/components/apercu/icones";
import { Badge, StatCard, FiltrePills, type Ton } from "@/components/apercu/ui";

type Statut = "À rembourser" | "Remboursé" | "En attente";

const DEPENSES: {
  titre: string;
  date: string;
  montant: string;
  categorie: string;
  statut: Statut;
  justificatif: boolean;
  enfant: string;
}[] = [
  { titre: "Cantine scolaire", date: "14 juin", montant: "84 €", categorie: "Scolaire", statut: "À rembourser", justificatif: true, enfant: "Léa" },
  { titre: "Cours de natation", date: "10 juin", montant: "45 €", categorie: "Activité", statut: "Remboursé", justificatif: true, enfant: "Tom" },
  { titre: "Consultation médicale", date: "6 juin", montant: "28 €", categorie: "Santé", statut: "En attente", justificatif: false, enfant: "Léa" },
  { titre: "Fournitures scolaires", date: "3 juin", montant: "36 €", categorie: "Scolaire", statut: "Remboursé", justificatif: true, enfant: "Tom" },
];

const TON_STATUT: Record<Statut, Ton> = {
  "À rembourser": "attention",
  Remboursé: "succes",
  "En attente": "neutre",
};

const COPILOTE: CopiloteContenu = {
  module: "Frais",
  intro: "Des pistes pour suivre vos dépenses. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Catégoriser une dépense", desc: "Classer un frais (santé, scolaire, activité) pour s'y retrouver.", icon: "frais" },
    { titre: "Repérer les frais sans justificatif", desc: "Identifier les dépenses à compléter par une pièce.", icon: "attache" },
    { titre: "Calculer une part à rembourser", desc: "Estimer la répartition d'un frais partagé.", icon: "syntheses" },
  ],
  conseil: "Joignez un justificatif à chaque dépense : un frais documenté est plus simple à présenter.",
};

const STATUTS = ["Tous", "À rembourser", "Remboursé", "En attente"];
const CATEGORIES = ["Toutes", "Santé", "Scolaire", "Activité"];

export default function ApercuFrais() {
  const [statut, setStatut] = useState("Tous");
  const [categorie, setCategorie] = useState("Toutes");

  const liste = DEPENSES.filter(
    (d) =>
      (statut === "Tous" || d.statut === statut) &&
      (categorie === "Toutes" || d.categorie === categorie)
  );

  return (
    <AppShell
      active="frais"
      titre="Frais"
      sousTitre="Dépenses liées aux enfants, classées et exportables."
      copilote={COPILOTE}
      actions={
        <>
          <button type="button" className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex">
            <Icon name="syntheses" className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          <button type="button" className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex">
            <Icon name="plus" className="h-4 w-4" />
            <span>Ajouter une dépense</span>
          </button>
        </>
      }
    >
      {/* Cartes résumé */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total du mois" valeur="193 €" indice="4 dépenses" />
        <StatCard label="À rembourser" valeur="84 €" indice="1 dépense" ton="attention" />
        <StatCard label="Remboursé" valeur="81 €" indice="2 dépenses" ton="succes" />
        <StatCard label="Sans justificatif" valeur="1" indice="à compléter" ton="danger" />
      </div>

      {/* Filtres */}
      <div className="mt-4 space-y-2">
        <FiltrePills options={STATUTS} actif={statut} onChange={setStatut} />
        <FiltrePills options={CATEGORIES} actif={categorie} onChange={setCategorie} />
      </div>

      {/* Liste des dépenses */}
      <ul className="mt-4 space-y-3">
        {liste.map((d) => (
          <li key={d.titre}>
            <button
              type="button"
              className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:border-[#2563EB]/30 hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <Icon name="frais" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{d.titre}</span>
                  <Badge ton="neutre">{d.categorie}</Badge>
                  <Badge ton={TON_STATUT[d.statut]}>{d.statut}</Badge>
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{d.date}</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="autresParents" className="h-3.5 w-3.5" />
                    {d.enfant}
                  </span>
                  <span
                    className={[
                      "inline-flex items-center gap-1",
                      d.justificatif ? "text-emerald-600" : "text-amber-600",
                    ].join(" ")}
                  >
                    <Icon name={d.justificatif ? "check" : "alerte"} className="h-3.5 w-3.5" />
                    {d.justificatif ? "Justificatif" : "Justificatif manquant"}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-base font-semibold text-slate-900">
                {d.montant}
              </span>
            </button>
          </li>
        ))}
        {liste.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Aucune dépense pour ce filtre.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
