import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Relire",
    description:
      "Vérifier les faits, frais, pensions, documents et preuves déjà présents dans le dossier actif.",
  },
  {
    numero: "2",
    titre: "Choisir une synthèse",
    description:
      "Sélectionner le type de document le plus adapté : préparation avocat, audience, pension ou difficultés.",
  },
  {
    numero: "3",
    titre: "Exporter",
    description:
      "Générer un PDF de travail à relire avant un rendez-vous, un échange ou une transmission.",
  },
];

const SYNTHESES = [
  {
    titre: "Préparation avocat",
    texte:
      "Rassembler les éléments utiles pour préparer un échange avec un professionnel.",
  },
  {
    titre: "Préparation audience",
    texte:
      "Obtenir une lecture structurée des faits et points à vérifier avant une échéance.",
  },
  {
    titre: "Pension",
    texte:
      "Mettre en avant les paiements, retards, écarts ou éléments financiers à contrôler.",
  },
  {
    titre: "Difficultés",
    texte:
      "Présenter les incidents, blocages ou éléments récurrents de manière factuelle.",
  },
];

const CONTROLES = [
  "La procédure active est-elle la bonne ?",
  "Les enfants concernés sont-ils bien rattachés à la procédure ?",
  "Les faits importants sont-ils datés ?",
  "Les frais et pensions sont-ils cohérents ?",
  "Les pièces importantes sont-elles classées ?",
  "Le document généré a-t-il été relu avant transmission ?",
];

export default function ExporterDossierAvocatPage() {
  return (
    <AppShell
      titre="Dossier avocat"
      description="Préparer un document de travail structuré, factuel et relu avant un rendez-vous, une audience ou une transmission à un professionnel."
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
            Ce document est une aide à l&apos;organisation factuelle du dossier. Il
            ne constitue pas un conseil juridique et ne garantit ni la
            recevabilité des pièces ni l&apos;issue d&apos;une procédure.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Méthode
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Préparer le dossier en trois étapes
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
          titre="Types de synthèses disponibles"
          description="L'outil existant permet de choisir une synthèse selon le besoin du moment. Chaque document doit rester court, relu et factuel."
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
          <AppCard titre="Contrôles avant génération">
            <ul className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard titre="Où se génère le PDF ?">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La génération du PDF reste dans l&apos;outil existant{" "}
              <span className="font-semibold text-[var(--app-text)]">
                Dossier avocat
              </span>
              . Cette page sert uniquement de point d&apos;entrée clair depuis
              l&apos;espace Exporter.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppButtonLink href="/dossier-avocat">
                Générer un dossier de travail
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
