import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const EXPORTS = [
  {
    href: "/chronologie",
    titre: "Chronologie",
    description:
      "Préparer une lecture datée des faits importants du dossier.",
  },
  {
    href: "/resume-mois",
    titre: "Résumé du mois",
    description:
      "Obtenir une synthèse mensuelle des éléments financiers et factuels.",
  },
  {
    href: "/courriers",
    titre: "Courriers factuels",
    description:
      "Générer des courriers neutres à partir des informations du dossier.",
  },
  {
    href: "/note-synthese",
    titre: "Note de synthèse",
    description:
      "Préparer une note claire et factuelle destinée à un professionnel.",
  },
  {
    href: "/dossier-avocat",
    titre: "Dossier avocat",
    description:
      "Rassembler les éléments utiles pour préparer un rendez-vous ou un échange avocat.",
  },
  {
    href: "/export",
    titre: "Export PDF",
    description:
      "Exporter les éléments disponibles sous une forme lisible et transmissible.",
  },
  {
    href: "/frais",
    titre: "Tableau des frais",
    description:
      "Retrouver les dépenses, justificatifs et remboursements à présenter.",
  },
  {
    href: "/pension",
    titre: "Tableau pension",
    description:
      "Suivre les paiements, retards, paiements partiels et soldes restants.",
  },
];

export default function ExporterPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Exporter"
        title="Préparer un dossier clair"
        subtitle="Transformez les éléments collectés et organisés en chronologie, courrier, note de synthèse ou export PDF."
      />

      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-base font-semibold text-amber-900">
          Rappel important
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Parent Preuve aide à produire un dossier structuré, daté et
          exportable. L’application ne garantit pas la recevabilité d’une preuve
          ni l’issue d’une procédure.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {EXPORTS.map((exportItem) => (
          <Link
            key={exportItem.href}
            href={exportItem.href}
            className="carte block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2A24C]/60 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-[#15233F]">
              {exportItem.titre}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {exportItem.description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
