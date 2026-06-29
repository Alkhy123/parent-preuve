import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const PILIERS = [
  {
    numero: "1",
    titre: "Selectionner",
    description:
      "Choisir les elements utiles : faits, frais, pension, documents, preuves ou echeances.",
  },
  {
    numero: "2",
    titre: "Structurer",
    description:
      "Transformer les elements collectes en chronologie, tableau, courrier ou note de synthese.",
  },
  {
    numero: "3",
    titre: "Relire",
    description:
      "Verifier le contenu avant tout telechargement ou partage avec un professionnel.",
  },
];

const EXPORTS_PRIORITAIRES = [
  {
    href: "/exporter/checklist",
    titre: "Checklist avant export",
    badge: "Controle",
    description:
      "Relire les points essentiels du dossier avant de generer une chronologie, un courrier, une note ou un PDF.",
  },
  {
    href: "/exporter/chronologie",
    titre: "Chronologie",
    badge: "Base du dossier",
    description:
      "Preparer une lecture datee des faits, frais, pensions, documents et preuves.",
  },
  {
    href: "/exporter/note-synthese",
    titre: "Note de synthese",
    badge: "Vue globale",
    description:
      "Preparer une note courte, sobre et factuelle a relire avant un echange ou un rendez-vous.",
  },
  {
    href: "/exporter/dossier-avocat",
    titre: "Dossier avocat",
    badge: "Preparation",
    description:
      "Assembler un document de travail factuel avant un rendez-vous ou une audience.",
  },
];

const EXPORTS_COMPLEMENTAIRES = [
  {
    href: "/exporter/courriers",
    titre: "Courriers factuels",
    description:
      "Preparer un courrier sobre, date et factuel avant de choisir un modele de redaction.",
  },
  {
    href: "/exporter/resume-mois",
    titre: "Resume du mois",
    description:
      "Preparer une lecture mensuelle des frais, pensions et faits enregistres.",
  },
  {
    href: "/exporter/pdf",
    titre: "Export PDF",
    description:
      "Preparer un PDF global regroupant faits, frais, pension, pieces et preuves photo.",
  },
];

const TABLEAUX = [
  {
    href: "/frais",
    titre: "Tableau des frais",
    description:
      "Retrouver les depenses, justificatifs, remboursements et montants restant a suivre.",
  },
  {
    href: "/pension",
    titre: "Tableau pension",
    description:
      "Suivre les paiements, retards, paiements partiels et soldes restants.",
  },
  {
    href: "/chronologie",
    titre: "Chronologie intelligente",
    description:
      "Verifier la lecture globale du dossier avant de preparer un export.",
  },
];

const PACKS_A_VENIR = [
  "Pack Chronologie",
  "Pack Pension / ARIPA",
  "Pack Frais",
  "Pack Dossier JAF",
  "Pack Avocat",
  "Pack Urgence audience",
];

export default function ExporterPage() {
  return (
    <AppShell
      titre="Exporter"
      description="Transformez les elements collectes et organises en documents sobres, dates et exploitables."
      actions={
        <AppButtonLink href="/exporter/checklist">
          Ouvrir la checklist
        </AppButtonLink>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {PILIERS.map((pilier) => (
            <section
              key={pilier.numero}
              className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                Etape {pilier.numero}
              </p>

              <h2 className="mt-2 text-lg font-semibold text-[var(--app-text)]">
                {pilier.titre}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                {pilier.description}
              </p>
            </section>
          ))}
        </div>

        <AppNotice titre="Point de methode">
          <p>
            Les exports servent a presenter les informations de facon claire. Ils
            ne remplacent pas une analyse juridique et doivent toujours etre
            relus avant transmission.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Exports prioritaires
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Preparer la lecture du dossier
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
              Commencez par la checklist, puis choisissez le format le plus
              adapte a votre besoin : chronologie, note, dossier ou courrier.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {EXPORTS_PRIORITAIRES.map((exportItem) => (
              <AppCard
                key={exportItem.href}
                titre={exportItem.titre}
                description={exportItem.description}
              >
                <div className="flex flex-col gap-4">
                  <span className="inline-flex w-fit rounded-full border border-[var(--app-tag-border)] bg-[var(--app-tag-bg)] px-3 py-1 text-xs font-semibold text-[var(--app-tag-text)]">
                    {exportItem.badge}
                  </span>

                  <AppButtonLink href={exportItem.href} variant="secondary">
                    Ouvrir
                  </AppButtonLink>
                </div>
              </AppCard>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Formats complementaires
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Courriers, resume et PDF
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {EXPORTS_COMPLEMENTAIRES.map((exportItem) => (
              <AppCard
                key={exportItem.href}
                titre={exportItem.titre}
                description={exportItem.description}
              >
                <AppButtonLink href={exportItem.href} variant="secondary">
                  Ouvrir
                </AppButtonLink>
              </AppCard>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Verification
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Revenir aux tableaux sources
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
              Avant export, vous pouvez relire les tableaux et la chronologie
              pour verifier les montants, dates et pieces associees.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TABLEAUX.map((tableau) => (
              <AppCard
                key={tableau.href}
                titre={tableau.titre}
                description={tableau.description}
              >
                <AppButtonLink href={tableau.href} variant="secondary">
                  Verifier
                </AppButtonLink>
              </AppCard>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Packs a venir
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
            Preparation progressive des dossiers guides
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {PACKS_A_VENIR.map((pack) => (
              <span
                key={pack}
                className="rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--app-chip-text)]"
              >
                {pack}
              </span>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
