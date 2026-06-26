// app/apercu/tableau-de-bord/page.tsx
//
// APERCU DE DESIGN — Tableau de bord (synthese globale du dossier), distinct du
// Journal. Monte dans l'AppShell reutilisable. Donnees FICTIVES, aucune logique
// metier / Supabase / IA. Le contenu metier utile pourra etre repris plus tard
// avec branchement reel cloisonne par procedure (chantier dedie).

import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import { Icon, type IconName } from "@/components/apercu/icones";
import Link from "next/link";
import { type ReactNode } from "react";

const COPILOTE: CopiloteContenu = {
  module: "Tableau de bord",
  intro:
    "Des pistes pour avancer sur l'ensemble de votre dossier. L'assistant propose, vous vérifiez et validez.",
  suggestions: [
    { titre: "Que faire en priorité ?", desc: "Identifier la prochaine action utile pour votre dossier.", icon: "fleche" },
    { titre: "Repérer les éléments à compléter", desc: "Voir ce qui manque encore dans cette procédure.", icon: "check" },
    { titre: "Préparer un export", desc: "Rassembler les pièces pour une synthèse claire.", icon: "syntheses" },
  ],
  conseil:
    "Avancez par petites étapes : chaque information ajoutée rend votre dossier plus clair.",
};

function ActionsTableau() {
  return (
    <>
      <button
        type="button"
        className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex"
      >
        <Icon name="calendrier" className="h-4 w-4" />
        <span>Juin 2026</span>
        <Icon name="chevron" className="h-4 w-4 text-slate-400" />
      </button>
      <button
        type="button"
        className="hidden items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] md:flex"
      >
        <Icon name="syntheses" className="h-4 w-4" />
        <span>Exporter le dossier</span>
      </button>
    </>
  );
}

function Carte({
  titre,
  icon,
  action,
  actionHref,
  children,
}: {
  titre: string;
  icon: IconName;
  action?: string;
  actionHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
            <Icon name={icon} className="h-4 w-4" />
          </span>
          {titre}
        </h2>
        {action && actionHref && (
          <Link
            href={actionHref}
            className="text-xs font-medium text-[#2563EB] hover:underline"
          >
            {action}
          </Link>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// Liens vers les pages d'aperçu /apercu/* (mêmes modules dans le nouveau shell).
// Exceptions sans page d'aperçu : pension/dossier -> routes réelles existantes.
const A_COMPLETER = [
  { fait: true, label: "Renseigner vos informations", href: "/dossier" },
  { fait: true, label: "Identifier l'autre parent", href: "/apercu/autres-parents" },
  { fait: false, label: "Ajouter la décision de justice", href: "/apercu/procedures" },
  { fait: false, label: "Configurer la pension", href: "/pension" },
];

const ECHEANCES = [
  { jour: "05", mois: "juil.", label: "Paiement de pension", detail: "Échéance mensuelle", href: "/pension" },
  { jour: "18", mois: "juin", label: "Rendez-vous médical", detail: "Pédiatre — Léa", href: "/apercu/calendrier" },
  { jour: "12", mois: "sept.", label: "Audience", detail: "À préparer en amont", href: "/apercu/calendrier" },
];

const EVENEMENTS = [
  { label: "Retard à l'arrivée", detail: "24 juin · 18:45", cat: "Retard", href: "/apercu/journal" },
  { label: "Message de l'autre parent", detail: "20 juin · 20:30", cat: "Communication", href: "/apercu/journal" },
];

const DOCUMENTS = [
  { label: "Jugement.pdf", detail: "Ajouté le 10 juin", href: "/apercu/documents" },
  { label: "Facture cantine.pdf", detail: "Ajouté le 14 juin", href: "/apercu/documents" },
];

const SAISIE = [
  { label: "Événement", icon: "journal" as IconName, href: "/apercu/journal" },
  { label: "Frais", icon: "frais" as IconName, href: "/apercu/frais" },
  { label: "Document", icon: "documents" as IconName, href: "/apercu/documents" },
  { label: "Preuve", icon: "preuves" as IconName, href: "/apercu/preuves" },
];

// Démo : statut de l'assistant. Remplacé par chargerStatutOnboarding() dans
// l'app réelle. Type union conservé (pas de narrowing littéral).
function statutAssistantDemo(): "en_cours" | "termine" {
  return "en_cours";
}

export default function ApercuTableauDeBord() {
  // Complétion du dossier, dérivée des éléments à compléter (démo).
  const total = A_COMPLETER.length;
  const faits = A_COMPLETER.filter((e) => e.fait).length;
  const pourcentage = Math.round((faits / total) * 100);

  // État de l'assistant de démarrage. La carte n'apparaît QUE s'il n'est pas
  // terminé. (Dans la vraie app : dérivé de chargerStatutOnboarding().)
  const statutAssistant = statutAssistantDemo();

  return (
    <AppShell
      active="tableau-de-bord"
      titre="Tableau de bord"
      sousTitre="Vue d'ensemble de votre procédure active."
      actions={<ActionsTableau />}
      copilote={COPILOTE}
    >
      {/* Prochaine action recommandee */}
      <section className="rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/[0.06] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
          Prochaine action recommandée
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              Ajouter la décision de justice
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Renseigner le jugement permet d&apos;organiser les règles (pension,
              frais, droit de visite) de cette procédure.
            </p>
          </div>
          <Link
            href="/apercu/procedures"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Commencer
            <Icon name="fleche" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Elements a completer */}
        <Carte titre="Éléments à compléter" icon="check" action="Tout voir" actionHref="/onboarding">
          {/* Indication de complétion du dossier */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Dossier complété</span>
              <span className="text-slate-500">
                {faits}/{total} · {pourcentage} %
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all"
                style={{ width: `${pourcentage}%` }}
              />
            </div>
          </div>

          <ul className="space-y-1">
            {A_COMPLETER.map((e) =>
              e.fait ? (
                <li
                  key={e.label}
                  className="flex items-center gap-2.5 px-1 py-1.5 text-sm"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-slate-400 line-through">{e.label}</span>
                </li>
              ) : (
                // Élément non fait = actionnable (lien discret vers la route).
                <li key={e.label}>
                  <Link
                    href={e.href}
                    className="group flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left text-sm transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="h-5 w-5 shrink-0 rounded-full border border-slate-300" />
                      <span className="text-slate-700">{e.label}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#2563EB]">
                      Compléter
                      <Icon
                        name="fleche"
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              )
            )}
          </ul>
        </Carte>

        {/* Prochaines echeances */}
        <Carte titre="Prochaines échéances" icon="calendrier" action="Calendrier" actionHref="/apercu/calendrier">
          <ul className="space-y-2.5">
            {ECHEANCES.map((e) => (
              <li key={e.label}>
                <Link
                  href={e.href}
                  className="-mx-1 flex items-center gap-3 rounded-lg px-1 py-1 transition hover:bg-slate-50"
                >
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <span className="text-sm font-bold leading-none">{e.jour}</span>
                    <span className="text-[10px]">{e.mois}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">{e.label}</span>
                    <span className="block text-xs text-slate-500">{e.detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Carte>

        {/* Evenements recents */}
        <Carte titre="Événements récents" icon="journal" action="Journal" actionHref="/apercu/journal">
          <ul className="space-y-2.5">
            {EVENEMENTS.map((e) => (
              <li key={e.label}>
                <Link
                  href={e.href}
                  className="-mx-1 flex items-center justify-between gap-2 rounded-lg px-1 py-1 transition hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">{e.label}</span>
                    <span className="block text-xs text-slate-500">{e.detail}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {e.cat}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Carte>

        {/* Frais & pension du mois */}
        <Carte titre="Frais & pension du mois" icon="frais" action="Détail" actionHref="/apercu/frais">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/apercu/frais"
              className="rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
            >
              <p className="text-xs text-slate-500">Frais du mois</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">240 €</p>
              <p className="text-xs text-slate-400">3 dépenses</p>
            </Link>
            <Link
              href="/pension"
              className="rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
            >
              <p className="text-xs text-slate-500">Pension</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">350 €</p>
              <p className="text-xs text-emerald-600">Réglée</p>
            </Link>
          </div>
        </Carte>

        {/* Documents recents */}
        <Carte titre="Documents récents" icon="documents" action="Documents" actionHref="/apercu/documents">
          <ul className="space-y-2">
            {DOCUMENTS.map((d) => (
              <li key={d.label}>
                <Link
                  href={d.href}
                  className="-mx-1 flex items-center gap-2.5 rounded-lg px-1 py-1 text-sm transition hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon name="documents" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-900">{d.label}</span>
                    <span className="block text-xs text-slate-500">{d.detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Carte>

        {/* Saisie rapide */}
        <Carte titre="Saisie rapide" icon="plus">
          <div className="grid grid-cols-2 gap-2">
            {SAISIE.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#2563EB]/30 hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                  <Icon name={s.icon} className="h-4 w-4" />
                </span>
                {s.label}
              </Link>
            ))}
          </div>
        </Carte>
      </div>

      {/* Acces a l'assistant de demarrage : seulement si non termine. */}
      {statutAssistant !== "termine" && (
      <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
            <Icon name="shield" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              Assistant de démarrage
            </h2>
            <p className="text-xs text-slate-500">
              Reprenez la configuration pas à pas de cette procédure.
            </p>
          </div>
        </div>
        <Link
          href="/onboarding"
          className="flex items-center gap-1.5 rounded-lg border border-[#2563EB]/30 px-3 py-2 text-sm font-semibold text-[#2563EB] hover:bg-[#2563EB]/[0.06]"
        >
          Reprendre l&apos;assistant
          <Icon name="fleche" className="h-4 w-4" />
        </Link>
      </section>
      )}
    </AppShell>
  );
}
