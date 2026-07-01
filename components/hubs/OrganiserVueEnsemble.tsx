// components/hubs/OrganiserVueEnsemble.tsx
//
// Variante Vue d'ensemble de la page /organiser.
// Vue détaillée : piliers, structure du dossier, classement complet.
// Hérite du contenu de l'ancienne page avec aide contextuelle comfortMode.

import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import HomeGuidedHint from "@/components/home/HomeGuidedHint";

const PILIERS = [
  {
    numero: "1",
    titre: "Identifier",
    description:
      "Vérifier les enfants, dossiers, procédures et décisions concernées.",
  },
  {
    numero: "2",
    titre: "Rattacher",
    description:
      "Relier chaque fait, preuve, document ou frais au bon contexte.",
  },
  {
    numero: "3",
    titre: "Préparer",
    description:
      "Construire une chronologie claire qui servira aux exports et synthèses.",
  },
];

const STRUCTURE_DOSSIER = [
  {
    href: "/dossier",
    titre: "Dossier",
    badge: "Base du dossier",
    description:
      "Vérifier les informations générales utilisées pour structurer le dossier.",
  },
  {
    href: "/enfants",
    titre: "Enfants",
    badge: "Rattachement",
    description:
      "Gérer les enfants concernés et rattacher les éléments au bon enfant.",
  },
  {
    href: "/procedure",
    titre: "Procédure et jugement",
    badge: "Cadre",
    description:
      "Renseigner l'autre parent, la procédure et les décisions importantes.",
  },
];

const CLASSEMENT = [
  {
    href: "/rattacher",
    titre: "Éléments à rattacher",
    description:
      "Compléter les éléments incomplets pour éviter un dossier désorganisé.",
  },
  {
    href: "/organiser/brouillons",
    titre: "Brouillons locaux",
    description:
      "Retrouver les brouillons préparés depuis la collecte rapide et les envoyer vers le bon module.",
  },
  {
    href: "/documents/coffre-fort",
    titre: "Coffre-fort documentaire",
    description:
      "Retrouver les pièces rangées, justificatifs et documents importants.",
  },
  {
    href: "/chronologie",
    titre: "Chronologie",
    description:
      "Voir les faits dans l'ordre pour comprendre rapidement l'évolution du dossier.",
  },
  {
    href: "/calendrier",
    titre: "Calendrier",
    description:
      "Organiser les échéances, rappels, gardes et événements familiaux.",
  },
  {
    href: "/frais",
    titre: "Frais",
    description:
      "Suivre les dépenses, justificatifs, remboursements et éléments financiers.",
  },
];

export default function OrganiserVueEnsemble() {
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
      <AppNotice titre="Objectif de cette zone">
        <p>
          Cette partie sert à ranger les informations déjà collectées. Elle ne
          remplace pas une analyse juridique et ne modifie pas vos données
          sans action explicite de votre part.
        </p>
      </AppNotice>

      {/* ── Structure du dossier ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Structure
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
            Vérifier les bases du dossier
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {STRUCTURE_DOSSIER.map((item) => (
            <AppCard key={item.href} titre={item.titre} description={item.description}>
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

      {/* ── Classement ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Classement
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
            Ranger et compléter les éléments
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {CLASSEMENT.map((item) => (
            <AppCard key={item.href} titre={item.titre} description={item.description}>
              <AppButtonLink href={item.href} variant="secondary">
                Ouvrir
              </AppButtonLink>
            </AppCard>
          ))}
        </div>
      </section>

      {/* ── Aide contextuelle (guided uniquement) ─────────────────────── */}
      <HomeGuidedHint>
        Vérifiez d&apos;abord les bases du dossier (informations, enfants, procédure).
        Puis rattachez les éléments orphelins, finalisez les brouillons et consultez
        la chronologie pour vous assurer que tout est cohérent.
      </HomeGuidedHint>
    </div>
  );
}
