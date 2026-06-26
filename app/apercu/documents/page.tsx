"use client";

// app/apercu/documents/page.tsx — APERCU. Données fictives, aucune logique métier.

import { useState } from "react";
import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon } from "@/components/apercu/icones";
import { Badge, FiltrePills } from "@/components/apercu/ui";

const DOCS: { nom: string; categorie: string; date: string; classe: boolean }[] = [
  { nom: "Jugement.pdf", categorie: "Jugement", date: "10 juin", classe: true },
  { nom: "Facture cantine.pdf", categorie: "Factures", date: "14 juin", classe: true },
  { nom: "Certificat médical.pdf", categorie: "Médical", date: "6 juin", classe: false },
  { nom: "Bulletin scolaire.pdf", categorie: "École", date: "2 juin", classe: true },
  { nom: "Courrier recommandé.pdf", categorie: "Courriers", date: "28 mai", classe: false },
  { nom: "Scan divers.pdf", categorie: "Autres", date: "20 mai", classe: false },
];

const CATEGORIES = ["Tous", "Jugement", "Factures", "École", "Médical", "Courriers", "Autres"];

const COPILOTE: CopiloteContenu = {
  module: "Documents",
  intro: "Des pistes pour organiser vos pièces. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Classer un document", desc: "Ranger une pièce dans la bonne catégorie.", icon: "documents" },
    { titre: "Repérer les pièces manquantes", desc: "Voir ce qu'il reste à fournir.", icon: "check" },
    { titre: "Préparer un bordereau", desc: "Lister les pièces pour un envoi.", icon: "syntheses" },
  ],
  conseil: "Nommez clairement vos fichiers : un dossier rangé se relit plus vite.",
};

export default function ApercuDocuments() {
  const [categorie, setCategorie] = useState("Tous");
  const [recherche, setRecherche] = useState("");

  const liste = DOCS.filter(
    (d) =>
      (categorie === "Tous" || d.categorie === categorie) &&
      d.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <AppShell
      active="documents"
      titre="Documents"
      sousTitre="Vos fichiers et justificatifs, rangés au même endroit."
      copilote={COPILOTE}
      actions={
        <button type="button" className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex">
          <Icon name="plus" className="h-4 w-4" />
          <span>Importer un document</span>
        </button>
      }
    >
      {/* Recherche */}
      <div className="relative max-w-md">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon name="search" />
        </span>
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un document"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
        />
      </div>

      {/* Catégories */}
      <div className="mt-3">
        <FiltrePills options={CATEGORIES} actif={categorie} onChange={setCategorie} />
      </div>

      {/* Liste des documents */}
      <ul className="mt-4 space-y-3">
        {liste.map((d) => (
          <li
            key={d.nom}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:border-[#2563EB]/30"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Icon name="documents" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium text-slate-900">{d.nom}</span>
                <Badge ton="neutre">{d.categorie}</Badge>
                <Badge ton={d.classe ? "succes" : "attention"}>
                  {d.classe ? "Classé" : "À classer"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Ajouté le {d.date}</p>
            </div>
            {/* Actions : voir, renommer, associer à un événement */}
            <div className="flex shrink-0 items-center gap-1">
              {[
                { ic: "oeil" as const, label: "Voir" },
                { ic: "crayon" as const, label: "Renommer" },
                { ic: "attache" as const, label: "Associer à un événement" },
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  aria-label={a.label}
                  title={a.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#2563EB]"
                >
                  <Icon name={a.ic} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </li>
        ))}
        {liste.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Aucun document pour ce filtre.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
