import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const ACTIONS_PRIORITAIRES = [
  {
    href: "/journal",
    titre: "Noter un fait",
    badge: "Le plus courant",
    description:
      "Ajoutez rapidement un événement daté : retard, absence, échange difficile, information importante ou incident.",
    exemples: ["Retard", "Absence", "Échange conflictuel", "Information importante"],
  },
  {
    href: "/preuves",
    titre: "Ajouter une preuve photo",
    badge: "Preuve visuelle",
    description:
      "Conservez une photo utile au dossier avec son contexte : date, lieu, enfant concerné et commentaire factuel.",
    exemples: ["Photo de document", "Lieu de remise", "Justificatif visuel"],
  },
  {
    href: "/documents",
    titre: "Importer un document",
    badge: "Pièce utile",
    description:
      "Ajoutez un jugement, une ordonnance, une facture, un certificat, un courrier ou tout document important.",
    exemples: ["Jugement", "Facture", "Courrier", "Certificat"],
  },
];

const ACTIONS_COMPLEMENTAIRES = [
  {
    href: "/frais",
    titre: "Ajouter un frais",
    description:
      "Renseignez une dépense liée à l’enfant et conservez le justificatif associé.",
  },
  {
    href: "/pension",
    titre: "Ajouter un paiement de pension",
    description:
      "Suivez les paiements reçus, partiels ou en retard, mois par mois.",
  },
  {
    href: "/calendrier",
    titre: "Ajouter une échéance",
    description:
      "Inscrivez une audience, un rendez-vous, une garde, une remise ou un rappel.",
  },
];

const ETAPES = [
  {
    numero: "1",
    titre: "Je collecte vite",
    description:
      "Vous ajoutez l’élément sans chercher à tout classer parfaitement dès le départ.",
  },
  {
    numero: "2",
    titre: "Je complète ensuite",
    description:
      "Vous pourrez rattacher l’élément au bon enfant, au bon dossier et à la bonne procédure.",
  },
  {
    numero: "3",
    titre: "Je retrouve dans le dossier",
    description:
      "L’élément pourra ensuite apparaître dans la chronologie, les tableaux et les exports.",
  },
];

export default function CollecterPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Collecter"
        title="Ajouter rapidement un élément"
        subtitle="Commencez par enregistrer les faits, preuves, documents, frais ou échéances. Vous pourrez les organiser ensuite."
      />

      <section className="mt-6 rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Vous vivez les faits. Parent Preuve les organise.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          L’objectif de cette page est d’ajouter rapidement ce qui vient de se
          passer, sans perdre de temps dans un formulaire trop long. Le
          classement précis peut être fait plus tard dans l’espace Organiser.
        </p>
      </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
              Nouveau parcours
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
              Commencer par la collecte rapide
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Vous ne savez pas encore dans quel module aller ? La collecte
              rapide vous aide à choisir le bon type d’élément sans perdre de
              temps.
            </p>
          </div>

          <Link
            href="/collecter/rapide"
            className="inline-flex items-center justify-center rounded-full bg-[#15233F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F1A30]"
          >
            Lancer la collecte rapide
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {ETAPES.map((etape) => (
          <div
            key={etape.numero}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#15233F] text-sm font-semibold text-white">
              {etape.numero}
            </div>
            <h2 className="mt-4 text-base font-semibold text-[#15233F]">
              {etape.titre}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {etape.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
              Actions prioritaires
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#15233F]">
              Que voulez-vous ajouter ?
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Ces actions couvrent les besoins les plus fréquents : noter un fait,
            conserver une preuve ou importer une pièce.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {ACTIONS_PRIORITAIRES.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="carte group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2A24C]/70 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#15233F]">
                  {action.titre}
                </h3>
                <span className="rounded-full bg-[#C2A24C]/10 px-3 py-1 text-xs font-semibold text-[#8A5A12]">
                  {action.badge}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {action.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {action.exemples.map((exemple) => (
                  <span
                    key={exemple}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                  >
                    {exemple}
                  </span>
                ))}
              </div>

              <p className="mt-auto pt-5 text-sm font-semibold text-[#15233F] transition group-hover:text-[#8A5A12]">
                Commencer →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
              Autres éléments
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
              Frais, pension et échéances
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Ces éléments alimentent ensuite les tableaux financiers, la
            chronologie et les futurs exports.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {ACTIONS_COMPLEMENTAIRES.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-[#C2A24C]/70 hover:bg-white hover:shadow-sm"
            >
              <h3 className="text-base font-semibold text-[#15233F]">
                {action.titre}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-[#15233F]">
          À retenir
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Vous n’avez pas besoin de tout organiser immédiatement. L’important
          est de conserver les éléments au bon moment, avec une date, un contexte
          et une formulation factuelle. Le classement détaillé se fera ensuite
          dans l’espace Organiser.
        </p>
      </section>
    </main>
  );
}
