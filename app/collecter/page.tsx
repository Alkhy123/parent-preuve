import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Collecter vite",
    description:
      "Ajouter un element au moment ou il se produit, meme si le classement detaille vient plus tard.",
  },
  {
    numero: "2",
    titre: "Completer ensuite",
    description:
      "Rattacher progressivement les informations au bon enfant, au bon dossier et a la bonne procedure.",
  },
  {
    numero: "3",
    titre: "Retrouver dans le dossier",
    description:
      "Faire ressortir les elements dans la chronologie, les tableaux et les exports.",
  },
];

const ACTIONS_PRIORITAIRES = [
  {
    href: "/collecter/rapide",
    titre: "Collecte rapide",
    badge: "Nouveau parcours",
    description:
      "Demarrer par une entree simple quand vous ne savez pas encore dans quel module ranger l element.",
  },
  {
    href: "/journal",
    titre: "Noter un fait",
    badge: "Le plus courant",
    description:
      "Ajouter un evenement date : retard, absence, echange difficile, information importante ou incident.",
  },
  {
    href: "/preuves",
    titre: "Ajouter une preuve photo",
    badge: "Preuve visuelle",
    description:
      "Conserver une photo utile avec son contexte : date, lieu, enfant concerne et commentaire factuel.",
  },
  {
    href: "/documents",
    titre: "Importer un document",
    badge: "Piece utile",
    description:
      "Ajouter un jugement, une ordonnance, une facture, un certificat, un courrier ou un document important.",
  },
];

const ACTIONS_COMPLEMENTAIRES = [
  {
    href: "/frais",
    titre: "Ajouter un frais",
    description:
      "Renseigner une depense liee a un enfant et conserver le justificatif associe.",
  },
  {
    href: "/pension",
    titre: "Ajouter un paiement de pension",
    description:
      "Suivre les paiements recus, partiels ou en retard, mois par mois.",
  },
  {
    href: "/calendrier",
    titre: "Ajouter une echeance",
    description:
      "Inscrire une audience, un rendez-vous, une garde, une remise ou un rappel.",
  },
];

export default function CollecterPage() {
  return (
    <AppShell
      titre="Collecter"
      description="Ajoutez rapidement les faits, justificatifs, frais et echeances avant de les organiser plus finement."
      actions={
        <AppButtonLink href="/collecter/rapide">
          Lancer la collecte rapide
        </AppButtonLink>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {ETAPES.map((etape) => (
            <section
              key={etape.numero}
              className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                Etape {etape.numero}
              </p>

              <h2 className="mt-2 text-lg font-semibold text-[var(--app-text)]">
                {etape.titre}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                {etape.description}
              </p>
            </section>
          ))}
        </div>

        <AppNotice titre="A retenir">
          <p>
            Vous pouvez collecter un element sans tout organiser immediatement.
            Le classement detaille peut etre complete ensuite dans l espace
            Organiser.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Actions prioritaires
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Que voulez-vous ajouter ?
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
              Ces actions couvrent les besoins les plus frequents : noter un
              fait, conserver une preuve ou importer une piece.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {ACTIONS_PRIORITAIRES.map((action) => (
              <AppCard
                key={action.href}
                titre={action.titre}
                description={action.description}
              >
                <div className="flex flex-col gap-4">
                  <span className="inline-flex w-fit rounded-full border border-[var(--app-tag-border)] bg-[var(--app-tag-bg)] px-3 py-1 text-xs font-semibold text-[var(--app-tag-text)]">
                    {action.badge}
                  </span>

                  <AppButtonLink href={action.href} variant="secondary">
                    Commencer
                  </AppButtonLink>
                </div>
              </AppCard>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Autres elements
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Frais, pension et echeances
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
              Ces elements alimentent ensuite les tableaux financiers, la
              chronologie et les futurs exports.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {ACTIONS_COMPLEMENTAIRES.map((action) => (
              <AppCard
                key={action.href}
                titre={action.titre}
                description={action.description}
              >
                <AppButtonLink href={action.href} variant="secondary">
                  Ouvrir
                </AppButtonLink>
              </AppCard>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
