// components/hubs/ExporterVueEnsemble.tsx
//
// Variante Vue d'ensemble de la page /exporter.
// Vue détaillée : piliers, exports prioritaires, formats complémentaires,
// tableaux sources, packs à venir. Hérite du contenu de l'ancienne page
// avec aide contextuelle comfortMode.

import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import HomeGuidedHint from "@/components/home/HomeGuidedHint";

const PILIERS = [
  {
    numero: "1",
    titre: "Sélectionner",
    description:
      "Choisir les éléments utiles : faits, frais, pension, documents, preuves ou échéances.",
  },
  {
    numero: "2",
    titre: "Structurer",
    description:
      "Transformer les éléments collectés en chronologie, tableau, courrier ou note de synthèse.",
  },
  {
    numero: "3",
    titre: "Relire",
    description:
      "Vérifier le contenu avant tout téléchargement ou partage avec un professionnel.",
  },
];

const EXPORTS_PRIORITAIRES = [
  {
    href: "/exporter/checklist",
    titre: "Checklist avant export",
    badge: "Contrôle",
    description:
      "Relire les points essentiels du dossier avant de générer une chronologie, un courrier, une note ou un PDF.",
  },
  {
    href: "/exporter/chronologie",
    titre: "Chronologie",
    badge: "Base du dossier",
    description:
      "Préparer une lecture datée des faits, frais, pensions, documents et preuves.",
  },
  {
    href: "/exporter/note-synthese",
    titre: "Note de synthèse",
    badge: "Vue globale",
    description:
      "Préparer une note courte, sobre et factuelle à relire avant un échange ou un rendez-vous.",
  },
  {
    href: "/exporter/dossier-avocat",
    titre: "Dossier avocat",
    badge: "Préparation",
    description:
      "Assembler un document de travail factuel avant un rendez-vous ou une audience.",
  },
];

const EXPORTS_COMPLEMENTAIRES = [
  {
    href: "/exporter/courriers",
    titre: "Courriers factuels",
    description:
      "Préparer un courrier sobre, daté et factuel avant de choisir un modèle de rédaction.",
  },
  {
    href: "/exporter/resume-mois",
    titre: "Résumé du mois",
    description:
      "Préparer une lecture mensuelle des frais, pensions et faits enregistrés.",
  },
  {
    href: "/exporter/pdf",
    titre: "Export PDF",
    description:
      "Préparer un PDF global regroupant faits, frais, pension, pièces et preuves photo.",
  },
];

const TABLEAUX = [
  {
    href: "/frais",
    titre: "Tableau des frais",
    description:
      "Retrouver les dépenses, justificatifs, remboursements et montants restant à suivre.",
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
      "Vérifier la lecture globale du dossier avant de préparer un export.",
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

export default function ExporterVueEnsemble() {
  return (
    <div className="space-y-6">

      {/* ── Piliers ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {PILIERS.map((pilier) => (
          <section
            key={pilier.numero}
            className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Étape {pilier.numero}
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

      {/* ── Notice ────────────────────────────────────────────────────── */}
      <AppNotice titre="Point de méthode">
        <p>
          Les exports servent à présenter les informations de façon claire. Ils
          ne remplacent pas une analyse juridique et doivent toujours être
          relus avant transmission.
        </p>
      </AppNotice>

      {/* ── Exports prioritaires ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Exports prioritaires
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
            Préparer la lecture du dossier
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            Commencez par la checklist, puis choisissez le format le plus
            adapté à votre besoin : chronologie, note, dossier ou courrier.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {EXPORTS_PRIORITAIRES.map((exportItem) => (
            <AppCard key={exportItem.href} titre={exportItem.titre} description={exportItem.description}>
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

      {/* ── Formats complémentaires ───────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Formats complémentaires
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
            Courriers, résumé et PDF
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {EXPORTS_COMPLEMENTAIRES.map((exportItem) => (
            <AppCard key={exportItem.href} titre={exportItem.titre} description={exportItem.description}>
              <AppButtonLink href={exportItem.href} variant="secondary">
                Ouvrir
              </AppButtonLink>
            </AppCard>
          ))}
        </div>
      </section>

      {/* ── Tableaux sources ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Vérification
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
            Revenir aux tableaux sources
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            Avant export, vous pouvez relire les tableaux et la chronologie
            pour vérifier les montants, dates et pièces associées.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TABLEAUX.map((tableau) => (
            <AppCard key={tableau.href} titre={tableau.titre} description={tableau.description}>
              <AppButtonLink href={tableau.href} variant="secondary">
                Vérifier
              </AppButtonLink>
            </AppCard>
          ))}
        </div>
      </section>

      {/* ── Packs à venir ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          Packs à venir
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
          Préparation progressive des dossiers guidés
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

      {/* ── Aide contextuelle (guided uniquement) ─────────────────────── */}
      <HomeGuidedHint>
        Commencez toujours par la checklist pour vérifier que le dossier est prêt.
        Choisissez ensuite le format adapté à votre besoin du moment. Relisez
        systématiquement le document généré avant de le transmettre à un professionnel.
        Les exports n&apos;ont pas de valeur juridique automatique.
      </HomeGuidedHint>
    </div>
  );
}
