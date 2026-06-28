import Link from "next/link";

import PageHeader from "@/components/PageHeader";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir le mois",
    description:
      "Sélectionner le mois à analyser pour afficher uniquement les frais, pensions et faits concernés.",
  },
  {
    numero: "2",
    titre: "Contrôler les chiffres",
    description:
      "Vérifier les frais du mois, les paiements de pension et les faits enregistrés dans la procédure active.",
  },
  {
    numero: "3",
    titre: "Utiliser le résumé",
    description:
      "S’appuyer sur cette vue pour préparer un échange, compléter le dossier ou vérifier les éléments avant export.",
  },
];

const CONTENU = [
  {
    titre: "Frais du mois",
    texte: "Montants demandés, montants remboursés, reste dû et nombre de frais enregistrés.",
  },
  {
    titre: "Pension du mois",
    texte: "Montant dû, montant payé, solde restant ou situation à jour selon les paiements saisis.",
  },
  {
    titre: "Faits notés",
    texte: "Nombre de faits enregistrés sur le mois et répartition par catégorie.",
  },
];

const CONTROLES = [
  "Le mois sélectionné est-il le bon ?",
  "Les frais du mois sont-ils tous enregistrés ?",
  "Les remboursements sont-ils à jour ?",
  "Les paiements de pension sont-ils complets ?",
  "Les faits importants du mois ont-ils été notés ?",
  "La procédure active est-elle bien celle à contrôler ?",
];

export default function ExporterResumeMoisPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Exporter"
        title="Résumé du mois"
        subtitle="Préparer une lecture mensuelle des frais, pensions et faits enregistrés dans la procédure active."
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="carte rounded-2xl bg-[var(--surface)] p-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                Vue mensuelle
              </p>

              <h2 className="mt-2 text-2xl font-bold text-texte">
                Contrôler rapidement un mois du dossier
              </h2>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                Le résumé du mois regroupe les frais, les pensions et les faits
                enregistrés sur une période mensuelle. Il aide à repérer un
                reste dû, un paiement partiel ou un mois peu documenté.
              </p>

              <p className="mt-3 text-sm leading-6 text-texte-doux">
                Cette page sert de guide d’entrée. Le calcul et l’affichage des
                chiffres restent dans l’outil existant Résumé du mois.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/resume-mois"
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
                >
                  Ouvrir le résumé du mois
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
                Le résumé du mois affiche des chiffres issus des saisies
                existantes. Il ne modifie aucune donnée et doit être relu avant
                d’être utilisé dans un export ou un échange.
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
            Ce que le résumé mensuel affiche
          </h2>

          <p className="mt-2 text-sm leading-6 text-texte-doux">
            Le résumé se concentre sur les éléments utiles pour comprendre un
            mois précis du dossier.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {CONTENU.map((item) => (
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
              Contrôles à faire
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
              Où se consulte le résumé ?
            </h2>

            <p className="mt-2 text-sm leading-6 text-texte-doux">
              La consultation reste dans l’outil existant
              <span className="font-semibold"> Résumé du mois</span>. Cette
              page sert uniquement de point d’entrée clair depuis l’espace
              Exporter.
            </p>

            <Link
              href="/resume-mois"
              className="mt-5 inline-flex rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
            >
              Consulter le résumé du mois
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
