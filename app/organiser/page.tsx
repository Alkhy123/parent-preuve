import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const PILIERS = [
  {
    numero: "1",
    titre: "Identifier",
    description:
      "Vérifiez les enfants, dossiers, procédures et décisions concernées.",
  },
  {
    numero: "2",
    titre: "Rattacher",
    description:
      "Reliez chaque fait, preuve, document ou frais au bon contexte.",
  },
  {
    numero: "3",
    titre: "Préparer",
    description:
      "Construisez une chronologie claire qui servira aux exports et synthèses.",
  },
];

const STRUCTURE_DOSSIER = [
  {
    href: "/dossier",
    titre: "Dossier",
    badge: "Base du dossier",
    description:
      "Vérifier les informations générales utilisées pour structurer le dossier.",
  },
  {
    href: "/enfants",
    titre: "Enfants",
    badge: "Rattachement",
    description:
      "Gérer les enfants concernés et rattacher les éléments au bon enfant.",
  },
  {
    href: "/procedure",
    titre: "Procédure et jugement",
    badge: "Cadre",
    description:
      "Renseigner l’autre parent, la procédure et les décisions importantes.",
  },
];

const CLASSEMENT = [
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

      <section className="mt-6 rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Une seule donnée, plusieurs usages.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Un fait, un frais ou une preuve ne doit pas être dupliqué. Il est
          collecté une fois, puis organisé ici pour apparaître ensuite dans la
          chronologie, les tableaux, les courriers et les exports.
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
              Structure du dossier
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#15233F]">
              Les informations de base
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Ces rubriques permettent de poser le cadre : enfant concerné,
            procédure, décision et informations générales.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {STRUCTURE_DOSSIER.map((rubrique) => (
            <Link
              key={rubrique.href}
              href={rubrique.href}
              className="carte group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2A24C]/70 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#15233F]">
                  {rubrique.titre}
                </h3>
                <span className="rounded-full bg-[#C2A24C]/10 px-3 py-1 text-xs font-semibold text-[#8A5A12]">
                  {rubrique.badge}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {rubrique.description}
              </p>

              <p className="mt-auto pt-5 text-sm font-semibold text-[#15233F] transition group-hover:text-[#8A5A12]">
                Ouvrir →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
              Classement et suivi
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
              Ranger les éléments collectés
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Cette zone permet de vérifier que les preuves, frais, documents et
            événements sont bien exploitables dans la chronologie et les exports.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CLASSEMENT.map((rubrique) => (
            <Link
              key={rubrique.href}
              href={rubrique.href}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-[#C2A24C]/70 hover:bg-white hover:shadow-sm"
            >
              <h3 className="text-base font-semibold text-[#15233F]">
                {rubrique.titre}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {rubrique.description}
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
          L’espace Organiser sert à rendre les éléments collectés exploitables.
          Plus les faits, preuves, frais et documents sont correctement
          rattachés, plus les chronologies, synthèses et exports seront clairs.
        </p>
      </section>
    </main>
  );
}
