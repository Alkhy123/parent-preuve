import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Verifier",
    description:
      "Relire les brouillons locaux, les elements sans date et les points d'attention avant de generer un export.",
  },
  {
    numero: "2",
    titre: "Filtrer",
    description:
      "Afficher uniquement les sources utiles : faits, frais, pension, documents, preuves ou regles de garde.",
  },
  {
    numero: "3",
    titre: "Exporter",
    description:
      "Generer une chronologie de travail en PDF ou CSV a partir des elements deja enregistres.",
  },
];

const SOURCES = [
  "Faits du journal",
  "Frais",
  "Pension",
  "Documents",
  "Preuves photo",
  "Regles de garde",
];

const CONTROLES = [
  "Les brouillons locaux ont-ils ete traites ?",
  "Les elements importants ont-ils une date ?",
  "Les titres sont-ils courts et factuels ?",
  "Les frais et pensions a suivre sont-ils visibles ?",
  "Les documents et preuves utiles sont-ils bien rattaches ?",
];

export default function ExporterChronologiePage() {
  return (
    <AppShell
      titre="Export chronologie"
      description="Preparer une chronologie claire, datee et verifiable a partir des elements deja enregistres dans le dossier."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>

          <AppButtonLink href="/chronologie">
            Ouvrir la chronologie
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Parent Preuve aide a produire un dossier structure, date et
            exportable. L&apos;application ne garantit pas la recevabilite
            d&apos;une preuve ni l&apos;issue d&apos;une procedure. Chaque
            export doit etre relu avant transmission.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Methode
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Preparer l&apos;export en trois etapes
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

        <section className="grid gap-6 lg:grid-cols-2">
          <AppCard titre="Sources incluses dans la lecture">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La chronologie s&apos;appuie sur les elements deja presents dans
              les modules du dossier actif.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {SOURCES.map((source) => (
                <span
                  key={source}
                  className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--app-text-muted)]"
                >
                  {source}
                </span>
              ))}
            </div>
          </AppCard>

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
        </section>

        <AppCard titre="Ou se fait l'export ?">
          <p className="text-sm leading-6 text-[var(--app-text-muted)]">
            Les boutons PDF et CSV restent dans la page chronologie, car ils
            utilisent les filtres de periode et de type presents sur cette
            page. Cette page sert de point d&apos;entree clair depuis
            l&apos;espace Exporter.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <AppButtonLink href="/chronologie">
              Aller a l&apos;export chronologie
            </AppButtonLink>

            <AppButtonLink href="/organiser/brouillons" variant="secondary">
              Verifier les brouillons
            </AppButtonLink>
          </div>
        </AppCard>
      </div>
    </AppShell>
  );
}
