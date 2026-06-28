import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const TYPES_COLLECTE = [
  {
    href: "/journal",
    titre: "Fait ou événement",
    priorite: "Prioritaire",
    description:
      "Noter rapidement ce qui vient de se passer : retard, absence, conflit, information importante ou difficulté.",
    exemples: ["Retard", "Absence", "Incident", "Information importante"],
  },
  {
    href: "/preuves",
    titre: "Preuve photo",
    priorite: "Prioritaire",
    description:
      "Ajouter une photo utile au dossier avec un contexte factuel et une date.",
    exemples: ["Photo du lieu", "Justificatif visuel", "Document photographié"],
  },
  {
    href: "/documents",
    titre: "Document",
    priorite: "Prioritaire",
    description:
      "Importer un jugement, une ordonnance, une facture, un certificat, un courrier ou une pièce utile.",
    exemples: ["Jugement", "Facture", "Courrier", "Certificat"],
  },
  {
    href: "/frais",
    titre: "Frais",
    priorite: "Financier",
    description:
      "Ajouter une dépense liée à l’enfant et conserver le justificatif associé.",
    exemples: ["Santé", "École", "Transport", "Activité"],
  },
  {
    href: "/pension",
    titre: "Pension",
    priorite: "Financier",
    description:
      "Ajouter un paiement reçu, un paiement partiel, un retard ou un solde restant à suivre.",
    exemples: ["Paiement reçu", "Paiement partiel", "Retard", "Solde"],
  },
  {
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

export default function CollecteRapidePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Collecte rapide"
        title="Que voulez-vous ajouter maintenant ?"
        subtitle="Choisissez le type d’élément à collecter. Vous pourrez le compléter et le rattacher ensuite au bon dossier."
      />

      <section className="mt-6 rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Objectif : ajouter un élément important en moins de 30 secondes.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Cette page sert de point d’entrée rapide. Elle vous oriente vers le
          bon module existant sans vous demander de tout organiser tout de suite.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TYPES_COLLECTE.map((type) => (
          <Link
            key={type.href}
            href={type.href}
            className="carte group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2A24C]/70 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#15233F]">
                {type.titre}
              </h2>
              <span className="rounded-full bg-[#C2A24C]/10 px-3 py-1 text-xs font-semibold text-[#8A5A12]">
                {type.priorite}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {type.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {type.exemples.map((exemple) => (
                <span
                  key={exemple}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                >
                  {exemple}
                </span>
              ))}
            </div>

            <p className="mt-auto pt-5 text-sm font-semibold text-[#15233F] transition group-hover:text-[#8A5A12]">
              Ajouter →
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-[#15233F]">
          Méthode de collecte
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {PRINCIPES.map((principe) => (
            <div
              key={principe}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
            >
              {principe}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-[#15233F]">
          Après la collecte
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Les éléments ajoutés doivent ensuite être vérifiés dans l’espace
          Organiser, notamment pour les rattacher au bon enfant, au bon dossier,
          à la bonne procédure et aux pièces utiles.
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
