import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir le modèle",
    description:
      "Sélectionner le type de courrier adapté : pension, frais, non-représentation ou demande d'information.",
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
    texte:
      "Préparer une relance factuelle lorsqu'un paiement de pension est absent, partiel ou en retard.",
  },
  {
    titre: "Remboursement de frais",
    texte:
      "Demander la part due sur des frais partagés avec une présentation claire des montants.",
  },
  {
    titre: "Non-représentation d'enfant",
    texte:
      "Structurer un signalement factuel autour d'une date, d'un horaire et d'un contexte précis.",
  },
  {
    titre: "Demande d'information",
    texte:
      "Demander des informations liées à la scolarité, à la santé ou à l'organisation de l'enfant.",
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
    <AppShell
      titre="Courriers factuels"
      description="Préparer un courrier de travail sobre, daté et vérifiable à partir d'une situation précise. Les courriers générés doivent être relus avant tout envoi."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>

          <AppButtonLink href="/courriers">
            Ouvrir les modèles de courriers
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Un courrier généré par Parent Preuve est un brouillon de travail. Il
            doit être relu, adapté et vérifié avant tout envoi. L&apos;application ne
            remplace pas un conseil juridique.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Méthode
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Préparer le courrier en trois étapes
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
          titre="Modèles actuellement disponibles"
          description="Les modèles existants couvrent les situations fréquentes à formuler de manière factuelle."
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
          <AppCard titre="Contrôles avant envoi">
            <ul className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard titre="Où se rédige le courrier ?">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La rédaction reste dans l&apos;outil existant{" "}
              <span className="font-semibold text-[var(--app-text)]">
                Courriers factuels
              </span>
              . Cette page sert uniquement de point d&apos;entrée clair depuis
              l&apos;espace Exporter.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppButtonLink href="/courriers">
                Choisir un modèle de courrier
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
