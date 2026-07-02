import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir le mois",
    description:
      "Selectionner le mois a analyser pour afficher uniquement les frais, pensions et faits concernes.",
  },
  {
    numero: "2",
    titre: "Controler les chiffres",
    description:
      "Verifier les frais du mois, les paiements de pension et les faits enregistres dans la procedure active.",
  },
  {
    numero: "3",
    titre: "Utiliser le resume",
    description:
      "S appuyer sur cette vue pour preparer un echange, completer le dossier ou verifier les elements avant export.",
  },
];

const CONTENU = [
  {
    titre: "Frais du mois",
    texte:
      "Montants demandes, montants rembourses, reste du et nombre de frais enregistres.",
  },
  {
    titre: "Pension du mois",
    texte:
      "Montant du, montant paye, solde restant ou situation a jour selon les paiements saisis.",
  },
  {
    titre: "Faits notes",
    texte:
      "Nombre de faits enregistres sur le mois et repartition par categorie.",
  },
];

const CONTROLES = [
  "Le mois selectionne est-il le bon ?",
  "Les frais du mois sont-ils tous enregistres ?",
  "Les remboursements sont-ils a jour ?",
  "Les paiements de pension sont-ils complets ?",
  "Les faits importants du mois ont-ils ete notes ?",
  "La procedure active est-elle bien celle a controler ?",
];

export default function ExporterResumeMoisPage() {
  return (
    <AppShell
      titre="Résumé du mois"
      description="Preparer une lecture mensuelle des frais, pensions et faits enregistres dans la procedure active."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>
          <AppButtonLink href="/resume-mois">
            Ouvrir le resume du mois
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Le resume du mois affiche des chiffres issus des saisies existantes.
            Il ne modifie aucune donnee et doit etre relu avant d etre utilise
            dans un export ou un echange.
          </p>
        </AppNotice>

        <section className="grid gap-4 md:grid-cols-3">
          {ETAPES.map((etape) => (
            <AppCard
              key={etape.numero}
              titre={`${etape.numero}. ${etape.titre}`}
              description={etape.description}
            />
          ))}
        </section>

        <AppCard
          titre="Ce que le resume mensuel affiche"
          description="Le resume se concentre sur les elements utiles pour comprendre un mois precis du dossier."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {CONTENU.map((item) => (
              <article
                key={item.titre}
                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
              >
                <h3 className="font-semibold text-[var(--app-text)]">
                  {item.titre}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                  {item.texte}
                </p>
              </article>
            ))}
          </div>
        </AppCard>

        <section className="grid gap-6 lg:grid-cols-2">
          <AppCard titre="Controles a faire">
            <ul className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard titre="Ou se consulte le resume ?">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La consultation reste dans l outil existant{" "}
              <span className="font-semibold text-[var(--app-text)]">
                Résumé du mois
              </span>
              . Cette page sert uniquement de point d entree clair depuis l
              espace Exporter.
            </p>

            <div className="mt-5">
              <AppButtonLink href="/resume-mois">
                Consulter le resume du mois
              </AppButtonLink>
            </div>
          </AppCard>
        </section>
      </div>
    </AppShell>
  );
}
