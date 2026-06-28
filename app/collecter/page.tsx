import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const ACTIONS = [
  {
    href: "/journal",
    titre: "Noter un fait",
    description:
      "Ajouter rapidement un événement daté : retard, échange, difficulté, information importante.",
  },
  {
    href: "/preuves",
    titre: "Ajouter une preuve photo",
    description:
      "Conserver une photo avec les informations utiles pour votre dossier.",
  },
  {
    href: "/documents",
    titre: "Importer un document",
    description:
      "Ajouter un justificatif, une facture, un jugement, un courrier ou une pièce utile.",
  },
  {
    href: "/frais",
    titre: "Ajouter un frais",
    description:
      "Renseigner une dépense liée à l’enfant et conserver le justificatif associé.",
  },
  {
    href: "/pension",
    titre: "Ajouter un paiement de pension",
    description:
      "Suivre les paiements reçus, partiels ou en retard, mois par mois.",
  },
  {
    href: "/calendrier",
    titre: "Ajouter une échéance",
    description:
      "Inscrire une date importante : audience, rendez-vous, garde, remise ou rappel.",
  },
];

export default function CollecterPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Collecter"
        title="Ajouter rapidement un élément"
        subtitle="Commencez par enregistrer les faits, preuves, frais, pensions, documents ou échéances. Vous pourrez les organiser ensuite."
      />

      <section className="mt-6 rounded-2xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Vous vivez les faits. Parent Preuve les organise.
        </p>
        <p className="mt-2 text-sm text-slate-700">
          L’objectif est de collecter vite, sans tout classer parfaitement dès
          le départ. Chaque élément pourra ensuite être rattaché au bon dossier,
          au bon enfant et à la bonne procédure.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="carte block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2A24C]/60 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-[#15233F]">
              {action.titre}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {action.description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
