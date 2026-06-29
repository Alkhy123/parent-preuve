import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

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
    texte:
      "Avoir une vue claire des éléments importants avant un échange avec un professionnel.",
  },
  {
    titre: "Clarifier une situation",
    texte:
      "Résumer les faits, frais, pensions ou difficultés sans mélanger les sujets.",
  },
  {
    titre: "Structurer un dossier",
    texte:
      "Transformer des informations dispersées en note courte, lisible et organisée.",
  },
  {
    titre: "Garder une trace de travail",
    texte:
      "Conserver un brouillon relu avant de préparer un export plus complet.",
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
    <AppShell
      titre="Note de synthèse"
      description="Préparer une synthèse courte, structurée et factuelle du dossier pour un rendez-vous, un échange ou une relecture personnelle."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>

          <AppButtonLink href="/note-synthese">
            Ouvrir l&apos;outil note de synthèse
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Cette note est une aide à l&apos;organisation factuelle du dossier. Elle
            ne constitue pas un conseil juridique et ne garantit pas
            l&apos;appréciation des pièces par un juge ou un professionnel.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Méthode
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Préparer la note en trois étapes
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
          titre="Quand utiliser la note de synthèse ?"
          description="La note de synthèse est utile quand il faut expliquer rapidement le dossier sans générer un rapport complet."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {USAGES.map((usage) => (
              <article
                key={usage.titre}
                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
              >
                <h3 className="font-semibold text-[var(--app-text)]">
                  {usage.titre}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                  {usage.texte}
                </p>
              </article>
            ))}
          </div>
        </AppCard>

        <section className="grid gap-6 lg:grid-cols-2">
          <AppCard titre="Contrôles avant export">
            <ul className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard titre="Où se prépare la note ?">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La préparation de la note reste dans l&apos;outil existant{" "}
              <span className="font-semibold text-[var(--app-text)]">
                Note de synthèse
              </span>
              . Cette page sert uniquement de point d&apos;entrée clair depuis
              l&apos;espace Exporter.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppButtonLink href="/note-synthese">
                Préparer une note de synthèse
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
