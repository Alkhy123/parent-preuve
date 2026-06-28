import Link from "next/link";

import AppShell from "@/components/app/AppShell";

const ELEMENTS = [
  {
    titre: "Collecter",
    description:
      "Regrouper rapidement les faits, frais, justificatifs et échéances sans conclure juridiquement.",
  },
  {
    titre: "Organiser",
    description:
      "Classer les éléments du dossier, compléter les brouillons et préparer une chronologie lisible.",
  },
  {
    titre: "Exporter",
    description:
      "Préparer des documents sobres, factuels et exploitables pour un échange ou un rendez-vous.",
  },
];

export default function ApercuAppShellPage() {
  return (
    <AppShell
      titre="Aperçu AppShell"
      description="Page de contrôle non reliée à la navigation principale. Elle sert uniquement à vérifier la base visuelle de la refonte UI avant activation progressive."
      actions={
        <Link
          href="/"
          className="inline-flex rounded-full bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-on-primary)] transition hover:bg-[var(--app-primary-hover)]"
        >
          Retour accueil
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {ELEMENTS.map((element) => (
          <section
            key={element.titre}
            className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Parcours
            </p>

            <h2 className="mt-2 text-lg font-semibold text-[var(--app-text)]">
              {element.titre}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
              {element.description}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-info-soft)] p-4">
        <h2 className="text-base font-semibold text-[var(--app-info)]">
          Garde-fou
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
          Cette page ne modifie aucune donnée, ne remplace pas la NavBar et
          n’active pas l’AppShell globalement. Elle prépare uniquement le
          contrôle visuel de la refonte.
        </p>
      </section>
    </AppShell>
  );
}
