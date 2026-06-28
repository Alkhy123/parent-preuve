"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";

const TYPES_COLLECTE = [
  {
    id: "fait",
    href: "/journal",
    titre: "Fait ou événement",
    priorite: "Prioritaire",
    description:
      "Noter rapidement ce qui vient de se passer : retard, absence, conflit, information importante ou difficulté.",
    exemples: ["Retard", "Absence", "Incident", "Information importante"],
  },
  {
    id: "preuve",
    href: "/preuves",
    titre: "Preuve photo",
    priorite: "Prioritaire",
    description:
      "Ajouter une photo utile au dossier avec un contexte factuel et une date.",
    exemples: ["Photo du lieu", "Justificatif visuel", "Document photographié"],
  },
  {
    id: "document",
    href: "/documents",
    titre: "Document",
    priorite: "Prioritaire",
    description:
      "Importer un jugement, une ordonnance, une facture, un certificat, un courrier ou une pièce utile.",
    exemples: ["Jugement", "Facture", "Courrier", "Certificat"],
  },
  {
    id: "frais",
    href: "/frais",
    titre: "Frais",
    priorite: "Financier",
    description:
      "Ajouter une dépense liée à l’enfant et conserver le justificatif associé.",
    exemples: ["Santé", "École", "Transport", "Activité"],
  },
  {
    id: "pension",
    href: "/pension",
    titre: "Pension",
    priorite: "Financier",
    description:
      "Ajouter un paiement reçu, un paiement partiel, un retard ou un solde restant à suivre.",
    exemples: ["Paiement reçu", "Paiement partiel", "Retard", "Solde"],
  },
  {
    id: "echeance",
    href: "/calendrier",
    titre: "Échéance",
    priorite: "Organisation",
    description:
      "Ajouter une date importante : audience, rendez-vous, garde, remise, rappel ou limite de réponse.",
    exemples: ["Audience", "Rendez-vous", "Remise", "Rappel"],
  },
];

const PRINCIPES = [
  "Saisir vite, même si tout n’est pas encore complet.",
  "Rester factuel : qui, quoi, quand, où.",
  "Ajouter les détails plus tard dans Organiser.",
  "Éviter les formulations agressives ou les conclusions juridiques.",
];

function dateDuJour() {
  return new Date().toISOString().slice(0, 10);
}

export default function CollecteRapidePage() {
  const [typeSelectionne, setTypeSelectionne] = useState(TYPES_COLLECTE[0]);
  const [date, setDate] = useState(dateDuJour());
  const [titre, setTitre] = useState("");
  const [enfant, setEnfant] = useState("");
  const [lieu, setLieu] = useState("");
  const [description, setDescription] = useState("");
  const [piece, setPiece] = useState("");
  const [copie, setCopie] = useState(false);

  const brouillon = useMemo(() => {
    return [
      `Type : ${typeSelectionne.titre}`,
      `Date : ${date || "à compléter"}`,
      `Titre : ${titre || "à compléter"}`,
      `Enfant concerné : ${enfant || "à compléter"}`,
      `Lieu : ${lieu || "à compléter"}`,
      `Pièce associée : ${piece || "aucune pièce indiquée"}`,
      "",
      "Description factuelle :",
      description || "à compléter",
    ].join("\n");
  }, [date, description, enfant, lieu, piece, titre, typeSelectionne]);

  async function copierBrouillon() {
    try {
      await navigator.clipboard.writeText(brouillon);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2500);
    } catch {
      setCopie(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Collecte rapide"
        title="Préparer rapidement un élément"
        subtitle="Choisissez un type d’élément, notez l’essentiel, puis envoyez-le vers le bon module pour l’enregistrer proprement."
      />

      <section className="mt-6 rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Objectif : préparer une saisie utile en moins de 30 secondes.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Cette page sert de brouillon guidé. Elle ne remplace pas encore les
          formulaires existants, mais elle aide à formuler l’essentiel avant de
          l’enregistrer au bon endroit.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
            1. Choisir le type
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
            Que voulez-vous collecter ?
          </h2>

          <div className="mt-5 grid gap-3">
            {TYPES_COLLECTE.map((type) => {
              const actif = type.id === typeSelectionne.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTypeSelectionne(type)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    actif
                      ? "border-[#C2A24C] bg-[#C2A24C]/10"
                      : "border-slate-200 bg-slate-50 hover:border-[#C2A24C]/70 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-[#15233F]">
                      {type.titre}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#8A5A12]">
                      {type.priorite}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
            2. Noter l’essentiel
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
            Brouillon de collecte
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#15233F]">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F]">
              Enfant concerné
              <input
                value={enfant}
                onChange={(e) => setEnfant(e.target.value)}
                placeholder="Nom ou prénom"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F] md:col-span-2">
              Titre court
              <input
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex. Retard à la remise, facture médicale, paiement partiel..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F]">
              Lieu
              <input
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
                placeholder="Lieu ou contexte"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F]">
              Pièce associée
              <input
                value={piece}
                onChange={(e) => setPiece(e.target.value)}
                placeholder="Photo, facture, capture, document..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F] md:col-span-2">
              Description factuelle
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Décrivez uniquement les faits : qui, quoi, quand, où. Évitez les accusations ou conclusions juridiques."
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
            3. Résumé prêt à copier
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
            Brouillon généré
          </h2>

          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
            {brouillon}
          </pre>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copierBrouillon}
              className="rounded-full bg-[#15233F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F1A30]"
            >
              {copie ? "Brouillon copié" : "Copier le brouillon"}
            </button>

            <Link
              href={typeSelectionne.href}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70"
            >
              Aller vers {typeSelectionne.titre}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#15233F]">
            Méthode de collecte
          </h2>

          <div className="mt-4 grid gap-3">
            {PRINCIPES.map((principe) => (
              <div
                key={principe}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
              >
                {principe}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Important
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              Ce brouillon aide à préparer une saisie factuelle. Il ne garantit
              pas la recevabilité d’une preuve et ne remplace pas un conseil
              juridique.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-[#15233F]">
          Après la collecte
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Une fois l’élément enregistré dans le bon module, vérifiez-le dans
          l’espace Organiser pour le rattacher au bon enfant, au bon dossier, à
          la bonne procédure et aux pièces utiles.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/organiser"
            className="rounded-full bg-[#15233F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F1A30]"
          >
            Aller dans Organiser
          </Link>

          <Link
            href="/rattacher"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70"
          >
            Voir les éléments à rattacher
          </Link>
        </div>
      </section>
    </main>
  );
}
