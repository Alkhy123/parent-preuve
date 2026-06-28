import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const ETAPES = [
  {
    numero: "1",
    titre: "Relire",
    description:
      "Vérifier les faits, frais, pensions, documents et preuves déjà présents dans le dossier actif.",
  },
  {
    numero: "2",
    titre: "Choisir une synthèse",
    description:
      "Sélectionner le type de document le plus adapté : préparation avocat, audience, pension ou difficultés.",
  },
  {
    numero: "3",
    titre: "Exporter",
    description:
      "Générer un PDF de travail à relire avant un rendez-vous, un échange ou une transmission.",
  },
];

const SYNTHESES = [
  {
    titre: "Préparation avocat",
    texte: "Rassembler les éléments utiles pour préparer un échange avec un professionnel.",
  },
  {
    titre: "Préparation audience",
    texte: "Obtenir une lecture structurée des faits et points à vérifier avant une échéance.",
  },
  {
    titre: "Pension",
    texte: "Mettre en avant les paiements, retards, écarts ou éléments financiers à contrôler.",
  },
  {
    titre: "Difficultés",
    texte: "Présenter les incidents, blocages ou éléments récurrents de manière factuelle.",
  },
];

const CONTROLES = [
  "La procédure active est-elle la bonne ?",
  "Les enfants concernés sont-ils bien rattachés à la procédure ?",
  "Les faits importants sont-ils datés ?",
  "Les frais et pensions sont-ils cohérents ?",
  "Les pièces importantes sont-elles classées ?",
  "Le document généré a-t-il été relu avant transmission ?",
];

export default function ExporterDossierAvocatPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Exporter"
        title="Dossier avocat / préparation audience"
        subtitle="Préparer un document de travail clair, factuel et relisible à partir des données déjà présentes dans Parent Preuve."
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="carte rounded-2xl bg-[var(--surface)] p-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                Document préparatoire
              </p>

              <h2 className="mt-2 text-2xl font-bold text-texte">
                Structurer les éléments du dossier avant un échange important
              </h2>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                Le dossier avocat est un export de travail. Il s’appuie sur les
                informations déjà saisies dans l’application pour produire une
                synthèse lisible, structurée et factuelle.
              </p>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                L’objectif est d’aider à préparer un rendez-vous, une audience
                ou une discussion avec un professionnel, sans remplacer une
                analyse juridique.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dossier-avocat"
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
                >
                  Ouvrir l’outil dossier avocat
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
                Ce document est une aide à l’organisation factuelle du dossier.
                Il ne constitue pas un conseil juridique et ne garantit ni la
                recevabilité des pièces ni l’issue d’une procédure.
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
            Types de synthèses disponibles
          </h2>

          <p className="mt-2 text-sm leading-6 text-texte-doux">
            L’outil existant permet de choisir une synthèse selon le besoin du
            moment. Chaque document doit rester court, relu et factuel.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {SYNTHESES.map((synthese) => (
              <article
                key={synthese.titre}
                className="rounded-xl border border-slate-200 bg-white/70 p-4"
              >
                <h3 className="font-semibold text-texte">{synthese.titre}</h3>
                <p className="mt-2 text-sm leading-6 text-texte-doux">
                  {synthese.texte}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="carte rounded-2xl bg-[var(--surface)] p-6">
            <h2 className="text-xl font-bold text-texte">
              Contrôles avant génération
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
              Où se génère le PDF ?
            </h2>

            <p className="mt-2 text-sm leading-6 text-texte-doux">
              La génération du PDF reste dans l’outil existant
              <span className="font-semibold"> Dossier avocat</span>. Cette
              page sert uniquement de point d’entrée clair depuis l’espace
              Exporter.
            </p>

            <Link
              href="/dossier-avocat"
              className="mt-5 inline-flex rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
            >
              Générer un dossier de travail
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
