import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Relire",
    description:
      "Verifier les faits, frais, pensions, documents et preuves deja presents dans le dossier actif.",
  },
  {
    numero: "2",
    titre: "Choisir une synthese",
    description:
      "Selectionner le type de document le plus adapte : preparation avocat, audience, pension ou difficultes.",
  },
  {
    numero: "3",
    titre: "Exporter",
    description:
      "Generer un PDF de travail a relire avant un rendez-vous, un echange ou une transmission.",
  },
];

const SYNTHESES = [
  {
    titre: "Preparation avocat",
    texte:
      "Rassembler les elements utiles pour preparer un echange avec un professionnel.",
  },
  {
    titre: "Preparation audience",
    texte:
      "Obtenir une lecture structuree des faits et points a verifier avant une echeance.",
  },
  {
    titre: "Pension",
    texte:
      "Mettre en avant les paiements, retards, ecarts ou elements financiers a controler.",
  },
  {
    titre: "Difficultes",
    texte:
      "Presenter les incidents, blocages ou elements recurrents de maniere factuelle.",
  },
];

const CONTROLES = [
  "La procedure active est-elle la bonne ?",
  "Les enfants concernes sont-ils bien rattaches a la procedure ?",
  "Les faits importants sont-ils dates ?",
  "Les frais et pensions sont-ils coherents ?",
  "Les pieces importantes sont-elles classees ?",
  "Le document genere a-t-il ete relu avant transmission ?",
];

export default function ExporterDossierAvocatPage() {
  return (
    <AppShell
      titre="Dossier avocat"
      description="Preparer un document de travail structure, factuel et relu avant un rendez-vous, une audience ou une transmission a un professionnel."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>

          <AppButtonLink href="/dossier-avocat">
            Ouvrir l&apos;outil dossier avocat
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Ce document est une aide a l&apos;organisation factuelle du dossier. Il
            ne constitue pas un conseil juridique et ne garantit ni la
            recevabilite des pieces ni l&apos;issue d&apos;une procedure.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Methode
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Preparer le dossier en trois etapes
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
          titre="Types de syntheses disponibles"
          description="L'outil existant permet de choisir une synthese selon le besoin du moment. Chaque document doit rester court, relu et factuel."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {SYNTHESES.map((synthese) => (
              <article
                key={synthese.titre}
                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
              >
                <h3 className="font-semibold text-[var(--app-text)]">
                  {synthese.titre}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                  {synthese.texte}
                </p>
              </article>
            ))}
          </div>
        </AppCard>

        <section className="grid gap-6 lg:grid-cols-2">
          <AppCard titre="Controles avant generation">
            <ul className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard titre="Ou se genere le PDF ?">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La generation du PDF reste dans l&apos;outil existant{" "}
              <span className="font-semibold text-[var(--app-text)]">
                Dossier avocat
              </span>
              . Cette page sert uniquement de point d&apos;entree clair depuis
              l&apos;espace Exporter.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppButtonLink href="/dossier-avocat">
                Generer un dossier de travail
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
