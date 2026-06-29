"use client";

import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

type Modele = {
  href: string;
  titre: string;
  description: string;
  disponible: boolean;
};

// Pour ajouter un modele plus tard : une ligne ici, on passe disponible a true le jour ou la page existe.
const MODELES: Modele[] = [
  {
    href: "/courriers/relance-pension",
    titre: "Relance de pension impayée",
    description: "Réclamer le paiement d'une pension alimentaire en retard.",
    disponible: true,
  },
  {
    href: "/courriers/remboursement-frais",
    titre: "Remboursement de frais",
    description: "Demander la part due par l'autre parent sur des frais partagés.",
    disponible: true,
  },
  {
    href: "/courriers/non-representation",
    titre: "Non-représentation d'enfant",
    description: "Signaler un manquement au droit de visite et d'hébergement.",
    disponible: true,
  },
  {
    href: "/courriers/info-scolarite-sante",
    titre: "Demande d'information (scolarité / santé)",
    description: "Demander des informations sur la scolarité ou la santé de l'enfant.",
    disponible: true,
  },
];

export default function CourriersPage() {
  return (
    <AppShell
      titre="Courriers"
      description="Des modèles pré-remplis avec votre dossier, à relire et compléter."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter/courriers" variant="secondary">
            Retour Exporter
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Ces courriers sont des brouillons de travail. Relisez, adaptez et
            vérifiez chaque courrier avant tout envoi. Parent Preuve ne remplace
            pas un conseil juridique.
          </p>
        </AppNotice>

        <div className="grid gap-4">
          {MODELES.map((m) =>
            m.disponible ? (
              <AppCard
                key={m.href}
                titre={m.titre}
                description={m.description}
              >
                <AppButtonLink href={m.href}>Rédiger</AppButtonLink>
              </AppCard>
            ) : (
              <div
                key={m.href}
                className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] p-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[var(--app-text-muted)]">
                    {m.titre}
                  </h2>
                  <span className="rounded-full border border-[var(--app-border)] px-2.5 py-0.5 text-xs text-[var(--app-text-muted)]">
                    A venir
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--app-text-muted)]">
                  {m.description}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}
