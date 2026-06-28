import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir le modèle",
    description:
      "Sélectionner le type de courrier adapté : pension, frais, non-représentation ou demande d’information.",
  },
  {
    numero: "2",
    titre: "Compléter les faits",
    description:
      "Renseigner uniquement les éléments factuels : dates, montants, enfants concernés et pièces utiles.",
  },
  {
    numero: "3",
    titre: "Relire avant usage",
    description:
      "Vérifier le ton, les dates, les montants et les pièces avant tout envoi ou transmission.",
  },
];

const MODELES = [
  {
    titre: "Relance de pension impayée",
    texte: "Préparer une relance factuelle lorsqu’un paiement de pension est absent, partiel ou en retard.",
  },
  {
    titre: "Remboursement de frais",
    texte: "Demander la part due sur des frais partagés avec une présentation claire des montants.",
  },
  {
    titre: "Non-représentation d’enfant",
    texte: "Structurer un signalement factuel autour d’une date, d’un horaire et d’un contexte précis.",
  },
  {
    titre: "Demande d’information",
    texte: "Demander des informations liées à la scolarité, à la santé ou à l’organisation de l’enfant.",
  },
];

const CONTROLES = [
  "Le modèle choisi correspond-il bien à la situation ?",
  "Les dates et montants sont-ils exacts ?",
  "Le message reste-t-il factuel et sobre ?",
  "Les pièces ou justificatifs mentionnés existent-ils dans le dossier ?",
  "Le courrier a-t-il été relu avant tout envoi ?",
];

export default function ExporterCourriersPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Exporter"
        title="Courriers factuels"
        subtitle="Préparer des courriers sobres, datés et factuels à partir des éléments déjà présents dans le dossier."
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="carte rounded-2xl bg-[var(--surface)] p-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                Courrier de travail
              </p>

              <h2 className="mt-2 text-2xl font-bold text-texte">
                Rédiger un courrier sans sortir du cadre factuel
              </h2>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                Les courriers factuels servent à préparer une formulation claire
                à partir d’une situation précise. Ils doivent rester courts,
                datés, vérifiables et relus avant utilisation.
              </p>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                L’outil existant propose plusieurs modèles. Cette page sert de
                point d’entrée pour choisir le bon modèle et rappeler les
                contrôles à faire avant tout envoi.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/courriers"
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
                >
                  Ouvrir les modèles de courriers
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
                Un courrier généré par Parent Preuve est un brouillon de
                travail. Il doit être relu, adapté et vérifié avant tout envoi.
                L’application ne remplace pas un conseil juridique.
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
            Modèles actuellement disponibles
          </h2>

          <p className="mt-2 text-sm leading-6 text-texte-doux">
            Les modèles existants couvrent les situations fréquentes à formuler
            de manière factuelle.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {MODELES.map((modele) => (
              <article
                key={modele.titre}
                className="rounded-xl border border-slate-200 bg-white/70 p-4"
              >
                <h3 className="font-semibold text-texte">{modele.titre}</h3>
                <p className="mt-2 text-sm leading-6 text-texte-doux">
                  {modele.texte}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="carte rounded-2xl bg-[var(--surface)] p-6">
            <h2 className="text-xl font-bold text-texte">
              Contrôles avant envoi
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
              Où se rédige le courrier ?
            </h2>

            <p className="mt-2 text-sm leading-6 text-texte-doux">
              La rédaction reste dans l’outil existant
              <span className="font-semibold"> Courriers factuels</span>. Cette
              page sert uniquement de point d’entrée clair depuis l’espace
              Exporter.
            </p>

            <Link
              href="/courriers"
              className="mt-5 inline-flex rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
            >
              Choisir un modèle de courrier
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
