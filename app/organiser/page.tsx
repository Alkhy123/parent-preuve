import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const PILIERS = [
  {
    numero: "1",
    titre: "Identifier",
    description:
      "Verifier les enfants, dossiers, procedures et decisions concernees.",
  },
  {
    numero: "2",
    titre: "Rattacher",
    description:
      "Relier chaque fait, preuve, document ou frais au bon contexte.",
  },
  {
    numero: "3",
    titre: "Preparer",
    description:
      "Construire une chronologie claire qui servira aux exports et syntheses.",
  },
];

const STRUCTURE_DOSSIER = [
  {
    href: "/dossier",
    titre: "Dossier",
    badge: "Base du dossier",
    description:
      "Verifier les informations generales utilisees pour structurer le dossier.",
  },
  {
    href: "/enfants",
    titre: "Enfants",
    badge: "Rattachement",
    description:
      "Gerer les enfants concernes et rattacher les elements au bon enfant.",
  },
  {
    href: "/procedure",
    titre: "Procedure et jugement",
    badge: "Cadre",
    description:
      "Renseigner l autre parent, la procedure et les decisions importantes.",
  },
];

const CLASSEMENT = [
  {
    href: "/rattacher",
    titre: "Elements a rattacher",
    description:
      "Completer les elements incomplets pour eviter un dossier desorganise.",
  },
  {
    href: "/organiser/brouillons",
    titre: "Brouillons locaux",
    description:
      "Retrouver les brouillons prepares depuis la collecte rapide et les envoyer vers le bon module.",
  },
  {
    href: "/documents/coffre-fort",
    titre: "Coffre-fort documentaire",
    description:
      "Retrouver les pieces rangees, justificatifs et documents importants.",
  },
  {
    href: "/chronologie",
    titre: "Chronologie",
    description:
      "Voir les faits dans l ordre pour comprendre rapidement l evolution du dossier.",
  },
  {
    href: "/calendrier",
    titre: "Calendrier",
    description:
      "Organiser les echeances, rappels, gardes et evenements familiaux.",
  },
  {
    href: "/frais",
    titre: "Frais",
    description:
      "Suivre les depenses, justificatifs, remboursements et elements financiers.",
  },
];

export default function OrganiserPage() {
  return (
    <AppShell
      titre="Organiser"
      description="Classez les elements collectes pour obtenir un dossier lisible, coherent et exploitable."
      actions={
        <AppButtonLink href="/chronologie">Voir la chronologie</AppButtonLink>
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

        <AppNotice titre="Objectif de cette zone">
          <p>
            Cette partie sert a ranger les informations deja collectees. Elle ne
            remplace pas une analyse juridique et ne modifie pas vos donnees
            sans action explicite de votre part.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Structure
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Verifier les bases du dossier
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {STRUCTURE_DOSSIER.map((item) => (
              <AppCard
                key={item.href}
                titre={item.titre}
                description={item.description}
              >
                <div className="flex flex-col gap-4">
                  <span className="inline-flex w-fit rounded-full border border-[var(--app-tag-border)] bg-[var(--app-tag-bg)] px-3 py-1 text-xs font-semibold text-[var(--app-tag-text)]">
                    {item.badge}
                  </span>

                  <AppButtonLink href={item.href} variant="secondary">
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
              Classement
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Ranger et completer les elements
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {CLASSEMENT.map((item) => (
              <AppCard
                key={item.href}
                titre={item.titre}
                description={item.description}
              >
                <AppButtonLink href={item.href} variant="secondary">
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
