"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";

type Modele = {
  href: string;
  titre: string;
  description: string;
  disponible: boolean;
};

// Pour ajouter un modèle plus tard : une ligne ici, et on passe disponible à true le jour où sa page existe.
const MODELES: Modele[] = [
  {
    href: "/courriers/relance-pension",
    titre: "Relance de pension impayée",
    description: "Réclamer le paiement d'une pension alimentaire en retard.",
    disponible: true,
  },
  {
    href: "/courriers/remboursement-frais",
    titre: "Remboursement de frais",
    description: "Demander la part due par l'autre parent sur des frais partagés.",
    disponible: true,
  },
  {
    href: "/courriers/non-representation",
    titre: "Non-représentation d'enfant",
    description: "Signaler un manquement au droit de visite et d'hébergement.",
    disponible: true,
  },
  {
    href: "/courriers/info-scolarite-sante",
    titre: "Demande d'information (scolarité / santé)",
    description: "Demander des informations sur la scolarité ou la santé de l'enfant.",
    disponible: true,
  },
];

export default function CourriersPage() {
  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Modèles"
        title="Courriers"
        subtitle="Des modèles préremplis avec votre dossier, à relire et compléter."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">
        <div className="grid gap-4">
          {MODELES.map((m) =>
            m.disponible ? (
              <Link
                key={m.href}
                href={m.href}
                className="carte group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-[#C2A24C]"
              >
                <h2 className="font-display text-lg text-[#15233F]">{m.titre}</h2>
                <p className="mt-1 text-sm text-slate-600">{m.description}</p>
                <span className="mt-3 inline-block text-sm font-medium text-[#C2A24C]">
                  Rédiger →
                </span>
              </Link>
            ) : (
              <div key={m.href} className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg text-slate-500">{m.titre}</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">À venir</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{m.description}</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}