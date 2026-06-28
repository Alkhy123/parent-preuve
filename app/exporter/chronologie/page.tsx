import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const ETAPES = [
  {
    numero: "1",
    titre: "Vérifier",
    description:
      "Relire les brouillons locaux, les éléments sans date et les points d’attention avant de générer un export.",
  },
  {
    numero: "2",
    titre: "Filtrer",
    description:
      "Afficher uniquement les sources utiles : faits, frais, pension, documents, preuves ou règles de garde.",
  },
  {
    numero: "3",
    titre: "Exporter",
    description:
      "Générer une chronologie de travail en PDF ou CSV à partir des éléments déjà enregistrés.",
  },
];

const SOURCES = [
  "Faits du journal",
  "Frais",
  "Pension",
  "Documents",
  "Preuves photo",
  "Règles de garde",
];

const CONTROLES = [
  "Les brouillons locaux ont-ils été traités ?",
  "Les éléments importants ont-ils une date ?",
  "Les titres sont-ils courts et factuels ?",
  "Les frais et pensions à suivre sont-ils visibles ?",
  "Les documents et preuves utiles sont-ils bien rattachés ?",
];

export default function ExporterChronologiePage() {
  return (
    <main>
      <PageHeader
        eyebrow="Exporter"
        title="Export chronologie"
        subtitle="Préparer une chronologie claire, datée et vérifiable à partir des éléments déjà enregistrés dans le dossier."
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="carte rounded-2xl bg-[var(--surface)] p-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                Export de travail
              </p>

              <h2 className="mt-2 text-2xl font-bold text-texte">
                Transformer la chronologie en document exploitable
              </h2>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                La chronologie rassemble les éléments du dossier dans l’ordre.
                Cette page sert à préparer l’export : vérifier les informations,
                filtrer ce qui est utile, puis générer un PDF ou un CSV depuis
                l’écran chronologie.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/chronologie"
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
                >
                  Ouvrir la chronologie
                </Link>

                <Link
                  href="/organiser/brouillons"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-[#15233F] hover:border-[#C2A24C]/70"
                >
                  Vérifier les brouillons
                </Link>
              </div>
            </div>

            <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <p className="font-semibold text-amber-950">Rappel important</p>

              <p className="mt-2">
                Parent Preuve aide à produire un dossier structuré, daté et
                exportable. L’application ne garantit pas la recevabilité d’une
                preuve ni l’issue d’une procédure. Chaque export doit être relu
                avant transmission.
              </p>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {ETAPES.map((etape) => (
            <article
              key={etape.numero}
              className="carte rounded-2xl bg-[var(--surface)] p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15233F] text-sm font-bold text-white">
                {etape.numero}
              </div>

              <h2 className="mt-4 text-xl font-bold text-texte">
                {etape.titre}
              </h2>

              <p className="mt-2 text-sm leading-6 text-texte-doux">
                {etape.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="carte rounded-2xl bg-[var(--surface)] p-6">
            <h2 className="text-xl font-bold text-texte">
              Sources incluses dans la lecture
            </h2>

            <p className="mt-2 text-sm leading-6 text-texte-doux">
              La chronologie s’appuie sur les éléments déjà présents dans les
              modules du dossier actif.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {SOURCES.map((source) => (
                <span key={source} className="badge badge-neutre">
                  {source}
                </span>
              ))}
            </div>
          </div>

          <div className="carte rounded-2xl bg-[var(--surface)] p-6">
            <h2 className="text-xl font-bold text-texte">
              Contrôles avant export
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-texte-doux">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-6">
          <h2 className="text-xl font-bold text-texte">
            Où se fait l’export ?
          </h2>

          <p className="mt-2 text-sm leading-6 text-texte-doux">
            Les boutons PDF et CSV restent dans la page chronologie, car ils
            utilisent les filtres de période et de type présents sur cette page.
            Cette page sert de point d’entrée clair depuis l’espace Exporter.
          </p>

          <Link
            href="/chronologie"
            className="mt-5 inline-flex rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
          >
            Aller à l’export chronologie
          </Link>
        </section>
      </div>
    </main>
  );
}
