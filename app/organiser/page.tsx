import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const RUBRIQUES = [
  {
    href: "/dossier",
    titre: "Dossier",
    description:
      "Vérifier les informations générales utilisées pour structurer le dossier.",
  },
  {
    href: "/enfants",
    titre: "Enfants",
    description:
      "Gérer les enfants concernés et rattacher les éléments au bon enfant.",
  },
  {
    href: "/procedure",
    titre: "Procédure et jugement",
    description:
      "Renseigner l’autre parent, la procédure et les décisions importantes.",
  },
  {
    href: "/rattacher",
    titre: "Éléments à rattacher",
    description:
      "Compléter les éléments incomplets pour éviter un dossier désorganisé.",
  },
  {
    href: "/documents/coffre-fort",
    titre: "Coffre-fort documentaire",
    description:
      "Retrouver les pièces rangées, justificatifs et documents importants.",
  },
  {
    href: "/chronologie",
    titre: "Chronologie",
    description:
      "Voir les faits dans l’ordre pour comprendre rapidement l’évolution du dossier.",
  },
  {
    href: "/calendrier",
    titre: "Calendrier",
    description:
      "Organiser les échéances, rappels, gardes et événements familiaux.",
  },
  {
    href: "/frais",
    titre: "Frais",
    description:
      "Suivre les dépenses, justificatifs, remboursements et éléments financiers.",
  },
];

export default function OrganiserPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Organiser"
        title="Structurer votre dossier"
        subtitle="Classez vos éléments par enfant, procédure, date, thème et pièce associée pour préparer un dossier clair."
      />

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-[#15233F]">
          Une seule donnée, plusieurs usages
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Un fait, un frais ou une preuve ne doit pas être dupliqué. Il est
          collecté une fois, puis organisé ici pour apparaître ensuite dans la
          chronologie, les tableaux et les exports.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {RUBRIQUES.map((rubrique) => (
          <Link
            key={rubrique.href}
            href={rubrique.href}
            className="carte block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2A24C]/60 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-[#15233F]">
              {rubrique.titre}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {rubrique.description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
