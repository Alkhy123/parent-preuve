"use client";

// components/apercu/AppShell.tsx
//
// Coque d'application REUTILISABLE pour l'apercu de design (prototype visuel).
// Architecture : sidebar gauche + procedure active, topbar (recherche /
// notifications / profil), zone centrale a page unique avec en-tete d'actions
// contextuelles, copilote contextuel a droite (desktop) ou en feuille laterale
// (mobile / tablette), navigation basse + bouton flottant "+" sur mobile.
//
// 100 % visuel : aucune lecture/ecriture Supabase, aucun appel IA. Le contenu
// (titre, actions, copilote, enfants) est fourni par chaque page.
//
// Rendu en overlay plein ecran pour recouvrir la chrome globale (NavBar/Footer)
// SANS modifier le layout racine ni les routes existantes.

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/apercu/icones";

export type ModuleKey =
  | "tableau-de-bord"
  | "journal"
  | "frais"
  | "documents"
  | "preuves"
  | "calendrier"
  | "procedures"
  | "autres-parents"
  | "modeles"
  | "syntheses"
  | "parametres";

export type CopiloteSuggestion = {
  titre: string;
  desc: string;
  icon: IconName;
};

export type CopiloteContenu = {
  module: string;
  intro: string;
  suggestions: CopiloteSuggestion[];
  conseil: string;
};

type NavItem = {
  key: ModuleKey;
  label: string;
  icon: IconName;
  href?: string; // present = navigable (pages d'apercu reelles)
};

// Navigation principale, libelles alignes sur Parent Preuve.
const NAV: NavItem[] = [
  { key: "tableau-de-bord", label: "Tableau de bord", icon: "tableau", href: "/apercu/tableau-de-bord" },
  { key: "journal", label: "Journal / Événements", icon: "journal", href: "/apercu/journal" },
  { key: "frais", label: "Frais", icon: "frais", href: "/apercu/frais" },
  { key: "documents", label: "Documents", icon: "documents", href: "/apercu/documents" },
  { key: "preuves", label: "Preuves", icon: "preuves", href: "/apercu/preuves" },
  { key: "calendrier", label: "Calendrier", icon: "calendrier", href: "/apercu/calendrier" },
  { key: "procedures", label: "Procédures", icon: "procedures", href: "/apercu/procedures" },
  { key: "autres-parents", label: "Autres parents", icon: "autresParents", href: "/apercu/autres-parents" },
  { key: "modeles", label: "Modèles", icon: "modeles" },
  { key: "syntheses", label: "Synthèses & exports", icon: "syntheses", href: "/apercu/syntheses" },
  { key: "parametres", label: "Paramètres", icon: "parametres", href: "/apercu/parametres" },
];

// Items de la barre basse mobile (sous-ensemble + action Copilote).
const BAS: { key: ModuleKey | "copilote"; label: string; icon: IconName; href?: string }[] = [
  { key: "tableau-de-bord", label: "Accueil", icon: "tableau", href: "/apercu/tableau-de-bord" },
  { key: "journal", label: "Journal", icon: "journal", href: "/apercu/journal" },
  { key: "documents", label: "Documents", icon: "documents", href: "/apercu/documents" },
  { key: "copilote", label: "Copilote", icon: "copilote" },
  { key: "parametres", label: "Réglages", icon: "parametres", href: "/apercu/parametres" },
];

const MESSAGE_PRUDENT =
  "L'assistant propose, vous vérifiez et validez. Il ne remplace pas un professionnel du droit.";

export default function AppShell({
  active,
  titre,
  sousTitre,
  actions,
  copilote,
  procedure = { nom: "Garde — Léa & Tom", reference: "Affaire n° 24/00123" },
  children,
}: {
  active: ModuleKey;
  titre: string;
  sousTitre?: string;
  actions?: ReactNode;
  copilote: CopiloteContenu;
  procedure?: { nom: string; reference: string };
  children: ReactNode;
}) {
  const [copiloteOuvert, setCopiloteOuvert] = useState(false);
  const pathname = usePathname();
  // Le bandeau "Aperçu de design" ne s'affiche QUE sur les routes /apercu/*.
  // Réutilisé en production (autre route), il disparaît automatiquement.
  const surApercu = (pathname ?? "").startsWith("/apercu");

  return (
    <div className="apercu-shell fixed inset-0 z-50 flex bg-[#F2F5FA] text-slate-700">
      {/* ============================ Sidebar (desktop) ============================ */}
      <aside className="app-sidebar hidden w-60 shrink-0 flex-col border-r border-slate-200 lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white">
            <Icon name="shield" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold text-slate-900">
              Parent Preuve
            </span>
            <span className="block text-xs text-slate-400">Espace dossier</span>
          </span>
        </div>

        {/* Procedure active : cloisonne le dossier (selecteur dans la vraie app). */}
        <div className="mx-3 mb-1">
          <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Procédure active
          </p>
          <button
            type="button"
            className="mt-1 flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:bg-slate-100"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {procedure.nom}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {procedure.reference}
              </span>
            </span>
            <span className="shrink-0 text-slate-400">
              <Icon name="chevron" className="h-4 w-4" />
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((item) => {
            const estActif = item.key === active;
            const classe = [
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
              estActif
                ? "app-nav-active font-semibold"
                : "text-slate-600 hover:bg-slate-50",
            ].join(" ");
            const contenu = (
              <>
                <span className="shrink-0">
                  <Icon name={item.icon} />
                </span>
                <span className="truncate">{item.label}</span>
              </>
            );
            return item.href ? (
              <Link key={item.key} href={item.href} className={classe}>
                {contenu}
              </Link>
            ) : (
              <button key={item.key} type="button" className={classe}>
                {contenu}
              </button>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Icon name="shield" className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-semibold">Vos données sont sécurisées</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-emerald-700/80">
            Stockage privé et conforme RGPD. Vous gardez la maîtrise de votre
            dossier.
          </p>
        </div>
      </aside>

      {/* ============================ Colonne centrale ============================ */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <span className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white">
              <Icon name="shield" />
            </span>
          </span>
          <div className="relative flex-1 sm:max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" />
            </span>
            <input
              type="text"
              placeholder="Rechercher dans le dossier"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
          {/* Acces copilote quand la colonne droite est masquee (sous xl). */}
          <button
            type="button"
            onClick={() => setCopiloteOuvert(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 xl:hidden"
          >
            <Icon name="copilote" className="h-4 w-4 text-[#2563EB]" />
            <span className="hidden sm:inline">Copilote</span>
          </button>
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 sm:flex"
            aria-label="Notifications"
          >
            <Icon name="bell" />
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]/10 text-sm font-semibold text-[#2563EB]">
              ML
            </span>
            <span className="text-sm font-medium text-slate-700">Marie L.</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            <Icon name="retour" className="h-4 w-4" />
            <span className="hidden sm:inline">Quitter l&apos;aperçu</span>
          </Link>
        </header>

        {/* Contenu : en-tete + actions contextuelles, puis page active */}
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-5 sm:px-6 lg:pb-6">
          {surApercu && (
            <div className="app-banner mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
              <Icon name="alerte" className="h-4 w-4 shrink-0" />
              Aperçu de design — données fictives, non reliées à votre dossier.
              Aucune valeur juridique.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                {titre}
              </h1>
              {sousTitre && (
                <p className="mt-0.5 text-sm text-slate-500">{sousTitre}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>

          <div className="mt-4">{children}</div>
        </main>
      </div>

      {/* ============================ Copilote (desktop large) ============================ */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white px-4 py-5 xl:block">
        <PanneauCopilote contenu={copilote} />
      </aside>

      {/* ============================ Bouton flottant "+" (mobile) ============================ */}
      <button
        type="button"
        aria-label="Ajouter"
        className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8] md:hidden"
      >
        <Icon name="plus" className="h-6 w-6" />
      </button>

      {/* ============================ Navigation basse (mobile) ============================ */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-slate-200 bg-white py-2 lg:hidden">
        {BAS.map((t) => {
          const estActif = t.key === active;
          const classe = [
            "flex flex-col items-center gap-0.5 px-2 text-[11px]",
            estActif ? "text-[#2563EB]" : "text-slate-400",
          ].join(" ");
          const contenu = (
            <>
              <Icon name={t.icon} />
              {t.label}
            </>
          );
          if (t.key === "copilote") {
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setCopiloteOuvert(true)}
                className={classe}
              >
                {contenu}
              </button>
            );
          }
          return t.href ? (
            <Link key={t.key} href={t.href} className={classe}>
              {contenu}
            </Link>
          ) : (
            <button key={t.key} type="button" className={classe}>
              {contenu}
            </button>
          );
        })}
      </nav>

      {/* ============================ Feuille copilote (mobile / tablette) ============================ */}
      {copiloteOuvert && (
        <div className="fixed inset-0 z-30 xl:hidden">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setCopiloteOuvert(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Icon name="copilote" className="h-5 w-5 text-[#2563EB]" />
                Copilote
              </span>
              <button
                type="button"
                onClick={() => setCopiloteOuvert(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
                aria-label="Fermer le copilote"
              >
                <Icon name="fermer" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <PanneauCopilote contenu={copilote} sansEntete />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Panneau Copilote ------------------------------ */
// Contextuel : son contenu depend de la page active (prop `contenu`).
function PanneauCopilote({
  contenu,
  sansEntete = false,
}: {
  contenu: CopiloteContenu;
  sansEntete?: boolean;
}) {
  return (
    <div className="space-y-4">
      {!sansEntete && (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
            <Icon name="copilote" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight text-slate-900">
              Copilote
            </h2>
            <p className="truncate text-xs text-slate-400">
              Adapté à : {contenu.module}
            </p>
          </div>
        </div>
      )}

      <p className="text-sm leading-relaxed text-slate-500">{contenu.intro}</p>

      <div className="space-y-2.5">
        {contenu.suggestions.map((s) => (
          <button
            key={s.titre}
            type="button"
            className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#2563EB]/30 hover:bg-slate-50"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Icon name={s.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-900">
                {s.titre}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                {s.desc}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Conseil
        </p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-800">
          {contenu.conseil}
        </p>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
      >
        <Icon name="question" className="h-4 w-4" />
        Poser une question
      </button>

      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        {MESSAGE_PRUDENT}
      </p>
    </div>
  );
}
