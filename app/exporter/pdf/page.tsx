import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir la période",
    description:
      "Définir une période précise ou laisser les dates vides pour inclure toutes les données de la procédure active.",
  },
  {
    numero: "2",
    titre: "Contrôler le dossier",
    description:
      "Vérifier les éléments à compléter, les pièces, les frais, les pensions et les preuves avant génération.",
  },
  {
    numero: "3",
    titre: "Générer le PDF",
    description:
      "Créer un document de travail qui regroupe les éléments principaux du dossier dans un format lisible.",
  },
];

const CONTENU_PDF = [
  {
    titre: "Chronologie des événements",
    texte: "Faits enregistrés dans le journal, classés par date sur la période choisie.",
  },
  {
    titre: "Frais partagés",
    texte: "Dépenses, catégories, montants, parts dues et remboursements indiqués.",
  },
  {
    titre: "Pension alimentaire",
    texte: "Montants dus, montants payés, dates de paiement et solde calculé.",
  },
  {
    titre: "Bordereau de pièces",
    texte: "Documents actifs rattachés à la procédure, avec date, catégorie et enfant concerné si disponible.",
  },
  {
    titre: "Preuves photo",
    texte: "Bordereau des preuves photo avec titre, statut d’horodatage et empreinte technique si disponible.",
  },
  {
    titre: "Avertissement",
    texte: "Rappel que le document doit être relu et ne remplace pas un conseil juridique.",
  },
];

const CONTROLES = [
  "La procédure active est-elle la bonne ?",
  "La période sélectionnée correspond-elle au besoin ?",
  "Les faits importants sont-ils bien renseignés ?",
  "Les frais et pensions sont-ils cohérents ?",
  "Les pièces importantes sont-elles présentes ?",
  "Les preuves photo utiles sont-elles bien classées ?",
  "Le PDF généré a-t-il été relu avant transmission ?",
];

export default function ExporterPdfPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Exporter"
        title="Export PDF"
        subtitle="Préparer un PDF de travail regroupant les principaux éléments du dossier actif."
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="carte rounded-2xl bg-[var(--surface)] p-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                PDF de travail
              </p>

              <h2 className="mt-2 text-2xl font-bold text-texte">
                Générer un document global à partir du dossier actif
              </h2>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                L’export PDF rassemble plusieurs parties du dossier : faits,
                frais, pension, pièces et preuves photo. Il sert à produire une
                base de travail structurée, à relire avant toute utilisation.
              </p>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                Cette page sert de guide d’entrée. La génération du PDF reste
                dans l’outil existant Export PDF.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/export"
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
                >
                  Ouvrir l’export PDF
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
                Le PDF généré est un document de travail basé sur les données
                saisies. Il ne constitue pas un constat de commissaire de
                justice, ne remplace pas un conseil juridique et doit être relu
                avant toute transmission.
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
            Ce que le PDF peut contenir
          </h2>

          <p className="mt-2 text-sm leading-6 text-texte-doux">
            Le contenu dépend des données déjà enregistrées dans la procédure
            active et de la période choisie au moment de la génération.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {CONTENU_PDF.map((item) => (
              <article
                key={item.titre}
                className="rounded-xl border border-slate-200 bg-white/70 p-4"
              >
                <h3 className="font-semibold text-texte">{item.titre}</h3>
                <p className="mt-2 text-sm leading-6 text-texte-doux">
                  {item.texte}
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
              La génération reste dans l’outil existant
              <span className="font-semibold"> Export PDF</span>. Cette page
              sert uniquement de point d’entrée clair depuis l’espace Exporter.
            </p>

            <Link
              href="/export"
              className="mt-5 inline-flex rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
            >
              Générer un PDF de travail
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
