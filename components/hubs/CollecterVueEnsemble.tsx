// components/hubs/CollecterVueEnsemble.tsx
//
// Variante Vue d'ensemble de la page /collecter.
// Vue organisée : étapes, actions prioritaires détaillées, éléments complémentaires.
// Hérite du contenu de l'ancienne page mais dans un layout plus lisible et
// avec aide contextuelle comfortMode.

import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import HomeGuidedHint from "@/components/home/HomeGuidedHint";

const ETAPES = [
  {
    numero: "1",
    titre: "Collecter vite",
    description:
      "Ajouter un élément au moment où il se produit, même si le classement détaillé vient plus tard.",
  },
  {
    numero: "2",
    titre: "Compléter ensuite",
    description:
      "Rattacher progressivement les informations au bon enfant, au bon dossier et à la bonne procédure.",
  },
  {
    numero: "3",
    titre: "Retrouver dans le dossier",
    description:
      "Faire ressortir les éléments dans la chronologie, les tableaux et les exports.",
  },
];

const ACTIONS_PRIORITAIRES = [
  {
    href: "/collecter/rapide",
    titre: "Collecte rapide",
    badge: "Nouveau parcours",
    description:
      "Démarrer par une entrée simple quand vous ne savez pas encore dans quel module ranger l'élément.",
  },
  {
    href: "/journal",
    titre: "Noter un fait",
    badge: "Le plus courant",
    description:
      "Ajouter un événement daté : retard, absence, échange difficile, information importante ou incident.",
  },
  {
    href: "/preuves",
    titre: "Ajouter une preuve photo",
    badge: "Preuve visuelle",
    description:
      "Conserver une photo utile avec son contexte : date, lieu, enfant concerné et commentaire factuel.",
  },
  {
    href: "/documents",
    titre: "Importer un document",
    badge: "Pièce utile",
    description:
      "Ajouter un jugement, une ordonnance, une facture, un certificat, un courrier ou un document important.",
  },
];

const ACTIONS_COMPLEMENTAIRES = [
  {
    href: "/frais",
    titre: "Ajouter un frais",
    description:
      "Renseigner une dépense liée à un enfant et conserver le justificatif associé.",
  },
  {
    href: "/pension",
    titre: "Ajouter un paiement de pension",
    description:
      "Suivre les paiements reçus, partiels ou en retard, mois par mois.",
  },
  {
    href: "/calendrier",
    titre: "Ajouter une échéance",
    description:
      "Inscrire une audience, un rendez-vous, une garde, une remise ou un rappel.",
  },
];

export default function CollecterVueEnsemble() {
  return (
    <div className="space-y-6">

      {/* ── Étapes ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {ETAPES.map((etape) => (
          <section
            key={etape.numero}
            className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Étape {etape.numero}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--app-text)]">
              {etape.titre}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
              {etape.description}
            </p>
          </section>
        ))}
      </div>

      {/* ── Notice ────────────────────────────────────────────────────── */}
      <AppNotice titre="À retenir">
        <p>
          Vous pouvez collecter un élément sans tout organiser immédiatement.
          Le classement détaillé peut être complété ensuite dans l&apos;espace Organiser.
        </p>
      </AppNotice>

      {/* ── Actions prioritaires ───────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Actions prioritaires
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
            Que voulez-vous ajouter ?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            Ces actions couvrent les besoins les plus fréquents : noter un fait,
            conserver une preuve ou importer une pièce.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {ACTIONS_PRIORITAIRES.map((action) => (
            <AppCard key={action.href} titre={action.titre} description={action.description}>
              <div className="flex flex-col gap-4">
                <span className="inline-flex w-fit rounded-full border border-[var(--app-tag-border)] bg-[var(--app-tag-bg)] px-3 py-1 text-xs font-semibold text-[var(--app-tag-text)]">
                  {action.badge}
                </span>
                <AppButtonLink href={action.href} variant="secondary">
                  Commencer
                </AppButtonLink>
              </div>
            </AppCard>
          ))}
        </div>
      </section>

      {/* ── Actions complémentaires ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Autres éléments
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
            Frais, pension et échéances
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            Ces éléments alimentent ensuite les tableaux financiers, la chronologie
            et les futurs exports.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ACTIONS_COMPLEMENTAIRES.map((action) => (
            <AppCard key={action.href} titre={action.titre} description={action.description}>
              <AppButtonLink href={action.href} variant="secondary">
                Ouvrir
              </AppButtonLink>
            </AppCard>
          ))}
        </div>
      </section>

      {/* ── Aide contextuelle (guided uniquement) ─────────────────────── */}
      <HomeGuidedHint>
        Commencez par la collecte rapide si vous ne savez pas encore où ranger
        l&apos;élément. Vous le classerez plus précisément depuis la section Organiser.
        Les actions prioritaires couvrent les cas les plus fréquents du quotidien.
      </HomeGuidedHint>
    </div>
  );
}
