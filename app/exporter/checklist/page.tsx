import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const BLOCS_CHECKLIST = [
  {
    titre: "Dossier actif",
    description:
      "Vérifier que la bonne procédure est sélectionnée avant de préparer un export.",
    points: [
      "La procédure active correspond au dossier à préparer.",
      "Les enfants concernés sont bien rattachés à cette procédure.",
      "Les informations principales du dossier sont cohérentes.",
    ],
  },
  {
    titre: "Chronologie",
    description:
      "Contrôler les faits, les dates et les éléments à vérifier avant export.",
    points: [
      "Les faits importants sont datés.",
      "Les éléments sans date ont été vérifiés.",
      "Les points d’attention de la chronologie ont été relus.",
      "Les brouillons locaux ont été traités ou ignorés volontairement.",
    ],
  },
  {
    titre: "Frais et pension",
    description:
      "Relire les montants, paiements partiels et remboursements indiqués.",
    points: [
      "Les frais importants sont enregistrés.",
      "Les remboursements sont correctement indiqués.",
      "Les paiements de pension sont à jour.",
      "Les paiements partiels ou absents sont clairement visibles.",
    ],
  },
  {
    titre: "Documents et preuves",
    description:
      "Contrôler les pièces, justificatifs et preuves photo avant de les mentionner.",
    points: [
      "Les documents utiles sont classés.",
      "Les justificatifs importants sont présents.",
      "Les preuves photo utiles sont rattachées à la bonne procédure.",
      "Les titres des pièces restent courts et compréhensibles.",
    ],
  },
  {
    titre: "Relecture finale",
    description:
      "Vérifier le ton, la cohérence et les limites du document généré.",
    points: [
      "Le document reste factuel et sobre.",
      "Les dates et montants ont été relus.",
      "Les formulations sensibles ont été évitées.",
      "Le document est relu avant toute transmission.",
    ],
  },
];

const RACCOURCIS = [
  {
    href: "/chronologie",
    titre: "Relire la chronologie",
    description: "Vérifier les dates, filtres, points d’attention et lignes exportables.",
  },
  {
    href: "/organiser/brouillons",
    titre: "Traiter les brouillons",
    description: "Relire les brouillons locaux avant de générer un document.",
  },
  {
    href: "/documents",
    titre: "Contrôler les documents",
    description: "Vérifier les pièces et justificatifs présents dans le dossier.",
  },
  {
    href: "/preuves",
    titre: "Contrôler les preuves",
    description: "Relire les preuves photo et leurs informations de suivi.",
  },
];

export default function ExporterChecklistPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Exporter"
        title="Checklist avant export"
        subtitle="Relire les points essentiels avant de générer une chronologie, une note, un courrier ou un PDF."
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="carte rounded-2xl bg-[var(--surface)] p-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                Contrôle final
              </p>

              <h2 className="mt-2 text-2xl font-bold text-texte">
                Vérifier le dossier avant de produire un document
              </h2>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                Cette checklist aide à relire les éléments essentiels avant un
                export. Elle ne modifie aucune donnée et ne remplace pas les
                contrôles propres à chaque outil.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/exporter"
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
                >
                  Retour à l’espace Exporter
                </Link>

                <Link
                  href="/chronologie"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-[#15233F] hover:border-[#C2A24C]/70"
                >
                  Relire la chronologie
                </Link>
              </div>
            </div>

            <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <p className="font-semibold text-amber-950">Rappel important</p>

              <p className="mt-2">
                Parent Preuve aide à organiser les informations du dossier. Les
                documents générés doivent être relus avant toute transmission et
                ne garantissent pas l’appréciation des pièces ou l’issue d’une
                procédure.
              </p>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-5">
          {BLOCS_CHECKLIST.map((bloc) => (
            <article
              key={bloc.titre}
              className="carte rounded-2xl bg-[var(--surface)] p-6"
            >
              <h2 className="text-xl font-bold text-texte">{bloc.titre}</h2>

              <p className="mt-2 text-sm leading-6 text-texte-doux">
                {bloc.description}
              </p>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-texte-doux">
                {bloc.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs"
                    >
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-8 carte rounded-2xl bg-[var(--surface)] p-6">
          <h2 className="text-xl font-bold text-texte">
            Raccourcis de vérification
          </h2>

          <p className="mt-2 text-sm leading-6 text-texte-doux">
            Ces accès permettent de contrôler rapidement les parties du dossier
            les plus souvent utilisées dans les exports.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {RACCOURCIS.map((raccourci) => (
              <Link
                key={raccourci.href}
                href={raccourci.href}
                className="rounded-xl border border-slate-200 bg-white/70 p-4 transition hover:border-[#C2A24C]/70"
              >
                <h3 className="font-semibold text-texte">{raccourci.titre}</h3>
                <p className="mt-2 text-sm leading-6 text-texte-doux">
                  {raccourci.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
