import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir les volets",
    description:
      "Sélectionner les parties utiles de la note : contexte, enfants, faits, frais, pension, pièces ou demandes à clarifier.",
  },
  {
    numero: "2",
    titre: "Compléter",
    description:
      "Relire les informations préchargées et compléter uniquement ce qui manque avec des formulations factuelles.",
  },
  {
    numero: "3",
    titre: "Relire et exporter",
    description:
      "Vérifier la cohérence du brouillon, les pièces associées et le contenu généré avant tout export ou partage.",
  },
];

const USAGES = [
  {
    titre: "Préparer un rendez-vous",
    texte: "Avoir une vue claire des éléments importants avant un échange avec un professionnel.",
  },
  {
    titre: "Clarifier une situation",
    texte: "Résumer les faits, frais, pensions ou difficultés sans mélanger les sujets.",
  },
  {
    titre: "Structurer un dossier",
    texte: "Transformer des informations dispersées en note courte, lisible et organisée.",
  },
  {
    titre: "Garder une trace de travail",
    texte: "Conserver un brouillon relu avant de préparer un export plus complet.",
  },
];

const CONTROLES = [
  "La procédure active est-elle la bonne ?",
  "Les informations préchargées sont-elles exactes ?",
  "Les formulations restent-elles courtes et factuelles ?",
  "Les pièces sélectionnées correspondent-elles bien au contenu ?",
  "Le brouillon a-t-il été relu avant export ou transmission ?",
];

export default function ExporterNoteSynthesePage() {
  return (
    <main>
      <PageHeader
        eyebrow="Exporter"
        title="Note de synthèse"
        subtitle="Préparer une note claire, courte et factuelle à partir des informations déjà présentes dans le dossier."
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="carte rounded-2xl bg-[var(--surface)] p-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                Synthèse de travail
              </p>

              <h2 className="mt-2 text-2xl font-bold text-texte">
                Résumer le dossier sans perdre le fil
              </h2>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                La note de synthèse sert à organiser les informations
                importantes dans un format plus court qu’un dossier complet.
                Elle peut aider à préparer un rendez-vous, un échange ou une
                relecture personnelle.
              </p>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                L’outil existant permet de choisir les volets à inclure, de
                compléter les champs utiles, de sélectionner des pièces et de
                conserver un brouillon local.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/note-synthese"
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
                >
                  Ouvrir l’outil note de synthèse
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
                Cette note est une aide à l’organisation factuelle du dossier.
                Elle ne constitue pas un conseil juridique et ne garantit pas
                l’appréciation des pièces par un juge ou un professionnel.
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

        <section className="mt-8 carte rounded-2xl bg-[var(--surface)] p-6">
          <h2 className="text-xl font-bold text-texte">
            Quand utiliser la note de synthèse ?
          </h2>

          <p className="mt-2 text-sm leading-6 text-texte-doux">
            La note de synthèse est utile quand il faut expliquer rapidement le
            dossier sans générer un rapport complet.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {USAGES.map((usage) => (
              <article
                key={usage.titre}
                className="rounded-xl border border-slate-200 bg-white/70 p-4"
              >
                <h3 className="font-semibold text-texte">{usage.titre}</h3>
                <p className="mt-2 text-sm leading-6 text-texte-doux">
                  {usage.texte}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
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

          <div className="carte rounded-2xl bg-[var(--surface)] p-6">
            <h2 className="text-xl font-bold text-texte">
              Où se prépare la note ?
            </h2>

            <p className="mt-2 text-sm leading-6 text-texte-doux">
              La préparation de la note reste dans l’outil existant
              <span className="font-semibold"> Note de synthèse</span>. Cette
              page sert uniquement de point d’entrée clair depuis l’espace
              Exporter.
            </p>

            <Link
              href="/note-synthese"
              className="mt-5 inline-flex rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
            >
              Préparer une note de synthèse
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
