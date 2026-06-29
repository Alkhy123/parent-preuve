import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir les volets",
    description:
      "Selectionner les parties utiles de la note : contexte, enfants, faits, frais, pension, pieces ou demandes a clarifier.",
  },
  {
    numero: "2",
    titre: "Completer",
    description:
      "Relire les informations prechargees et completer uniquement ce qui manque avec des formulations factuelles.",
  },
  {
    numero: "3",
    titre: "Relire et exporter",
    description:
      "Verifier la coherence du brouillon, les pieces associees et le contenu genere avant tout export ou partage.",
  },
];

const USAGES = [
  {
    titre: "Preparer un rendez-vous",
    texte:
      "Avoir une vue claire des elements importants avant un echange avec un professionnel.",
  },
  {
    titre: "Clarifier une situation",
    texte:
      "Resumer les faits, frais, pensions ou difficultes sans melanger les sujets.",
  },
  {
    titre: "Structurer un dossier",
    texte:
      "Transformer des informations dispersees en note courte, lisible et organisee.",
  },
  {
    titre: "Garder une trace de travail",
    texte:
      "Conserver un brouillon relu avant de preparer un export plus complet.",
  },
];

const CONTROLES = [
  "La procedure active est-elle la bonne ?",
  "Les informations prechargees sont-elles exactes ?",
  "Les formulations restent-elles courtes et factuelles ?",
  "Les pieces selectionnees correspondent-elles bien au contenu ?",
  "Le brouillon a-t-il ete relu avant export ou transmission ?",
];

export default function ExporterNoteSynthesePage() {
  return (
    <AppShell
      titre="Note de synthese"
      description="Preparer une synthese courte, structuree et factuelle du dossier pour un rendez-vous, un echange ou une relecture personnelle."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>

          <AppButtonLink href="/note-synthese">
            Ouvrir l&apos;outil note de synthese
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Cette note est une aide a l&apos;organisation factuelle du dossier. Elle
            ne constitue pas un conseil juridique et ne garantit pas
            l&apos;appreciation des pieces par un juge ou un professionnel.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Methode
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Preparer la note en trois etapes
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
          titre="Quand utiliser la note de synthese ?"
          description="La note de synthese est utile quand il faut expliquer rapidement le dossier sans generer un rapport complet."
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
          <AppCard titre="Controles avant export">
            <ul className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard titre="Ou se prepare la note ?">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La preparation de la note reste dans l&apos;outil existant{" "}
              <span className="font-semibold text-[var(--app-text)]">
                Note de synthese
              </span>
              . Cette page sert uniquement de point d&apos;entree clair depuis
              l&apos;espace Exporter.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppButtonLink href="/note-synthese">
                Preparer une note de synthese
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
