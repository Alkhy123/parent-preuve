import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ELEMENTS = [
  {
    titre: "Collecter",
    description:
      "Regrouper rapidement les faits, frais, justificatifs et echeances sans conclure juridiquement.",
  },
  {
    titre: "Organiser",
    description:
      "Classer les elements du dossier, completer les brouillons et preparer une chronologie lisible.",
  },
  {
    titre: "Exporter",
    description:
      "Preparer des documents sobres, factuels et exploitables pour un echange ou un rendez-vous.",
  },
];

export default function ApercuAppShellPage() {
  return (
    <AppShell
      titre="Apercu AppShell"
      description="Page de controle non reliee a la navigation principale. Elle sert uniquement a verifier la base visuelle de la refonte UI avant activation progressive."
      actions={<AppButtonLink href="/">Retour accueil</AppButtonLink>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {ELEMENTS.map((element) => (
          <AppCard
            key={element.titre}
            titre={element.titre}
            description={element.description}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Parcours Parent Preuve
            </p>
          </AppCard>
        ))}
      </div>

      <div className="mt-6">
        <AppNotice titre="Garde-fou">
          <p>
            Cette page ne modifie aucune donnee, ne remplace pas la NavBar et
            n’active pas l’AppShell globalement. Elle prepare uniquement le
            controle visuel de la refonte.
          </p>
        </AppNotice>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <AppButtonLink href="/compte">Tester le choix du theme</AppButtonLink>
        <AppButtonLink href="/" variant="secondary">
          Revenir a l’accueil
        </AppButtonLink>
      </div>
    </AppShell>
  );
}
