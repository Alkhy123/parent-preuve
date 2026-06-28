import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const PILIERS = [
  {
    numero: "1",
    titre: "Sélectionner",
    description:
      "Choisissez les éléments utiles : faits, frais, pension, documents, preuves ou échéances.",
  },
  {
    numero: "2",
    titre: "Structurer",
    description:
      "Transformez les éléments collectés en chronologie, tableau, courrier ou note de synthèse.",
  },
  {
    numero: "3",
    titre: "Transmettre",
    description:
      "Préparez un export clair à relire, télécharger ou partager avec un professionnel.",
  },
];

const EXPORTS_PRIORITAIRES = [
  {
    href: "/chronologie",
    titre: "Chronologie",
    badge: "Base du dossier",
    description:
      "Préparer une lecture datée des faits importants pour comprendre l’évolution du dossier.",
  },
  {
    href: "/note-synthese",
    titre: "Note de synthèse",
    badge: "Vue globale",
    description:
      "Obtenir une présentation claire et factuelle des informations importantes du dossier.",
  },
  {
    href: "/dossier-avocat",
    titre: "Dossier avocat",
    badge: "Préparation",
    description:
      "Rassembler les éléments utiles pour préparer un rendez-vous ou un échange avec un professionnel.",
  },
];

const EXPORTS_COMPLEMENTAIRES = [
  {
    href: "/courriers",
    titre: "Courriers factuels",
    description:
      "Générer des courriers neutres à partir des informations déjà présentes dans le dossier.",
  },
  {
    href: "/resume-mois",
    titre: "Résumé du mois",
    description:
      "Obtenir une synthèse mensuelle des éléments financiers et factuels.",
  },
  {
    href: "/export",
    titre: "Export PDF",
    description:
      "Exporter les éléments disponibles sous une forme lisible et transmissible.",
  },
];

const TABLEAUX = [
  {
    href: "/frais",
    titre: "Tableau des frais",
    description:
      "Retrouver les dépenses, justificatifs, remboursements et montants restant à suivre.",
  },
  {
    href: "/pension",
    titre: "Tableau pension",
    description:
      "Suivre les paiements, retards, paiements partiels et soldes restants.",
  },
];

const PACKS_A_VENIR = [
  "Pack Chronologie",
  "Pack Pension / ARIPA",
  "Pack Frais",
  "Pack Dossier JAF",
  "Pack Avocat",
  "Pack Urgence audience",
];

export default function ExporterPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Exporter"
        title="Préparer un dossier clair"
        subtitle="Transformez les éléments collectés et organisés en chronologie, courrier, note de synthèse, tableau ou export PDF."
      />

      <section className="mt-6 rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          L’export est le résultat final de votre travail de classement.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Parent Preuve ne se limite pas à stocker des éléments. L’objectif est
          de produire une présentation claire, datée et structurée, plus simple
          à relire ou à transmettre.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {PILIERS.map((pilier) => (
          <div
            key={pilier.numero}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#15233F] text-sm font-semibold text-white">
              {pilier.numero}
            </div>
            <h2 className="mt-4 text-base font-semibold text-[#15233F]">
              {pilier.titre}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {pilier.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
              Exports prioritaires
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#15233F]">
              Préparer la lecture du dossier
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Ces exports servent à comprendre rapidement ce qui s’est passé, dans
            quel ordre, avec quels éléments associés.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {EXPORTS_PRIORITAIRES.map((exportItem) => (
            <Link
              key={exportItem.href}
              href={exportItem.href}
              className="carte group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2A24C]/70 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#15233F]">
                  {exportItem.titre}
                </h3>
                <span className="rounded-full bg-[#C2A24C]/10 px-3 py-1 text-xs font-semibold text-[#8A5A12]">
                  {exportItem.badge}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {exportItem.description}
              </p>

              <p className="mt-auto pt-5 text-sm font-semibold text-[#15233F] transition group-hover:text-[#8A5A12]">
                Ouvrir →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
                Documents de sortie
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
                Courriers, résumés et PDF
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-slate-600">
              Ces outils permettent de produire une sortie exploitable à partir
              du dossier déjà renseigné.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {EXPORTS_COMPLEMENTAIRES.map((exportItem) => (
              <Link
                key={exportItem.href}
                href={exportItem.href}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-[#C2A24C]/70 hover:bg-white hover:shadow-sm"
              >
                <h3 className="text-base font-semibold text-[#15233F]">
                  {exportItem.titre}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {exportItem.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
            Tableaux utiles
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
            Finances et pension
          </h2>

          <div className="mt-5 grid gap-3">
            {TABLEAUX.map((tableau) => (
              <Link
                key={tableau.href}
                href={tableau.href}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#C2A24C]/70 hover:shadow-sm"
              >
                <h3 className="text-base font-semibold text-[#15233F]">
                  {tableau.titre}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {tableau.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
              Packs dossier
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
              Évolutions prévues
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Les packs dossier serviront à générer des exports plus complets :
              chronologie, tableaux, pièces associées, annexes et dossier
              transmissible. Ils seront ajoutés après stabilisation de la
              structure Collecter / Organiser / Exporter.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            À venir
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {PACKS_A_VENIR.map((pack) => (
            <span
              key={pack}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
            >
              {pack}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-base font-semibold text-amber-900">
          Rappel important
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Parent Preuve aide à produire un dossier structuré, daté et
          exportable. L’application ne garantit pas la recevabilité d’une preuve
          ni l’issue d’une procédure. Les exports doivent être relus avant toute
          transmission.
        </p>
      </section>
    </main>
  );
}
