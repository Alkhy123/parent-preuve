import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const BLOCS_CHECKLIST = [
  {
    titre: "Dossier actif",
    description:
      "Verifier que la bonne procedure est selectionnee avant de preparer un export.",
    points: [
      "La procedure active correspond au dossier a preparer.",
      "Les enfants concernes sont bien rattaches a cette procedure.",
      "Les informations principales du dossier sont coherentes.",
    ],
  },
  {
    titre: "Chronologie",
    description:
      "Controler les faits, les dates et les elements a verifier avant export.",
    points: [
      "Les faits importants sont dates.",
      "Les elements sans date ont ete verifies.",
      "Les points d attention de la chronologie ont ete relus.",
      "Les brouillons locaux ont ete traites ou ignores volontairement.",
    ],
  },
  {
    titre: "Frais et pension",
    description:
      "Relire les montants, paiements partiels et remboursements indiques.",
    points: [
      "Les frais importants sont enregistres.",
      "Les remboursements sont correctement indiques.",
      "Les paiements de pension sont a jour.",
      "Les paiements partiels ou absents sont clairement visibles.",
    ],
  },
  {
    titre: "Documents et preuves",
    description:
      "Controler les pieces, justificatifs et preuves photo avant de les mentionner.",
    points: [
      "Les documents utiles sont classes.",
      "Les justificatifs importants sont presents.",
      "Les preuves photo utiles sont rattachees a la bonne procedure.",
      "Les titres des pieces restent courts et comprehensibles.",
    ],
  },
  {
    titre: "Relecture finale",
    description:
      "Verifier le ton, la coherence et les limites du document genere.",
    points: [
      "Le document reste factuel et sobre.",
      "Les dates et montants ont ete relus.",
      "Les formulations sensibles ont ete evitees.",
      "Le document est relu avant toute transmission.",
    ],
  },
];

const RACCOURCIS = [
  {
    href: "/chronologie",
    titre: "Relire la chronologie",
    description:
      "Verifier les dates, filtres, points d attention et lignes exportables.",
  },
  {
    href: "/organiser/brouillons",
    titre: "Traiter les brouillons",
    description:
      "Relire les brouillons locaux avant de generer un document.",
  },
  {
    href: "/documents",
    titre: "Controler les documents",
    description:
      "Verifier les pieces et justificatifs presents dans le dossier.",
  },
  {
    href: "/preuves",
    titre: "Controler les preuves",
    description:
      "Relire les preuves photo et leurs informations de suivi.",
  },
];

export default function ExporterChecklistPage() {
  return (
    <AppShell
      titre="Checklist avant export"
      description="Relisez les points essentiels du dossier avant de produire une chronologie, une note, un courrier ou un PDF."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>

          <AppButtonLink href="/chronologie">
            Relire la chronologie
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Parent Preuve aide a organiser les informations du dossier. Les
            documents generes doivent etre relus avant toute transmission et ne
            garantissent pas l appreciation des pieces ou l issue d une
            procedure.
          </p>
        </AppNotice>

        <section className="grid gap-4 lg:grid-cols-2">
          {BLOCS_CHECKLIST.map((bloc) => (
            <AppCard
              key={bloc.titre}
              titre={bloc.titre}
              description={bloc.description}
            >
              <ul className="space-y-3">
                {bloc.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm leading-6 text-[var(--app-text-muted)]"
                  >
                    <span
                      className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-semibold text-[var(--app-primary)]"
                      aria-hidden="true"
                    >
                      ✓
                    </span>

                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </AppCard>
          ))}
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Raccourcis de verification
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Controler les sources avant export
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
              Ces acces permettent de relire rapidement les parties du dossier
              les plus souvent utilisees dans les exports.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {RACCOURCIS.map((raccourci) => (
              <AppCard
                key={raccourci.href}
                titre={raccourci.titre}
                description={raccourci.description}
              >
                <AppButtonLink href={raccourci.href} variant="secondary">
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
