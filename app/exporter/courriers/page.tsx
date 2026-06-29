import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir le modele",
    description:
      "Selectionner le type de courrier adapte : pension, frais, non-representation ou demande d'information.",
  },
  {
    numero: "2",
    titre: "Completer les faits",
    description:
      "Renseigner uniquement les elements factuels : dates, montants, enfants concernes et pieces utiles.",
  },
  {
    numero: "3",
    titre: "Relire avant usage",
    description:
      "Verifier le ton, les dates, les montants et les pieces avant tout envoi ou transmission.",
  },
];

const MODELES = [
  {
    titre: "Relance de pension impayee",
    texte:
      "Preparer une relance factuelle lorsqu'un paiement de pension est absent, partiel ou en retard.",
  },
  {
    titre: "Remboursement de frais",
    texte:
      "Demander la part due sur des frais partages avec une presentation claire des montants.",
  },
  {
    titre: "Non-representation d'enfant",
    texte:
      "Structurer un signalement factuel autour d'une date, d'un horaire et d'un contexte precis.",
  },
  {
    titre: "Demande d'information",
    texte:
      "Demander des informations liees a la scolarite, a la sante ou a l'organisation de l'enfant.",
  },
];

const CONTROLES = [
  "Le modele choisi correspond-il bien a la situation ?",
  "Les dates et montants sont-ils exacts ?",
  "Le message reste-t-il factuel et sobre ?",
  "Les pieces ou justificatifs mentionnes existent-ils dans le dossier ?",
  "Le courrier a-t-il ete relu avant tout envoi ?",
];

export default function ExporterCourriersPage() {
  return (
    <AppShell
      titre="Courriers factuels"
      description="Preparer un courrier de travail sobre, date et verifiable a partir d'une situation precise. Les courriers generes doivent etre relus avant tout envoi."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>

          <AppButtonLink href="/courriers">
            Ouvrir les modeles de courriers
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Un courrier genere par Parent Preuve est un brouillon de travail. Il
            doit etre relu, adapte et verifie avant tout envoi. L&apos;application ne
            remplace pas un conseil juridique.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Methode
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Preparer le courrier en trois etapes
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {ETAPES.map((etape) => (
              <AppCard
                key={etape.numero}
                titre={`${etape.numero}. ${etape.titre}`}
                description={etape.description}
              />
            ))}
          </div>
        </section>

        <AppCard
          titre="Modeles actuellement disponibles"
          description="Les modeles existants couvrent les situations frequentes a formuler de maniere factuelle."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {MODELES.map((modele) => (
              <article
                key={modele.titre}
                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
              >
                <h3 className="font-semibold text-[var(--app-text)]">
                  {modele.titre}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                  {modele.texte}
                </p>
              </article>
            ))}
          </div>
        </AppCard>

        <section className="grid gap-6 lg:grid-cols-2">
          <AppCard titre="Controles avant envoi">
            <ul className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard titre="Ou se redige le courrier ?">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La redaction reste dans l&apos;outil existant{" "}
              <span className="font-semibold text-[var(--app-text)]">
                Courriers factuels
              </span>
              . Cette page sert uniquement de point d&apos;entree clair depuis
              l&apos;espace Exporter.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppButtonLink href="/courriers">
                Choisir un modele de courrier
              </AppButtonLink>

              <AppButtonLink href="/chronologie" variant="secondary">
                Relire la chronologie
              </AppButtonLink>
            </div>
          </AppCard>
        </section>
      </div>
    </AppShell>
  );
}
