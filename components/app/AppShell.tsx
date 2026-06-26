"use client";

// components/app/AppShell.tsx
//
// Shell réel de l'application. Il reprend la structure validée dans les aperçus
// sans embarquer de données fictives ni de logique métier lourde. Les pages
// conservent leurs propres chargements Supabase, formulaires et sauvegardes.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/apercu/icones";
import { supabase } from "@/lib/supabase";
import {
  getProcedureActiveIdLocal,
  setProcedureActiveIdLocal,
} from "@/lib/procedureActive";

export type AppModule =
  | "dashboard"
  | "journal"
  | "frais"
  | "documents"
  | "preuves"
  | "calendrier"
  | "procedures"
  | "syntheses"
  | "parametres";

type AppShellProps = {
  activeModule: AppModule;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  copilotContext?: AppModule;
  children: ReactNode;
};

type Procedure = { id: string; etiquette: string | null };

type NavItem = {
  key: AppModule;
  label: string;
  icon: IconName;
  href: string;
};

const NAV: NavItem[] = [
  { key: "dashboard", label: "Tableau de bord", icon: "tableau", href: "/" },
  { key: "journal", label: "Journal", icon: "journal", href: "/journal" },
  { key: "frais", label: "Frais", icon: "frais", href: "/frais" },
  { key: "documents", label: "Documents", icon: "documents", href: "/documents" },
  { key: "preuves", label: "Preuves", icon: "preuves", href: "/preuves" },
  { key: "calendrier", label: "Calendrier", icon: "calendrier", href: "/calendrier" },
  { key: "procedures", label: "Procédure", icon: "procedures", href: "/procedure" },
  { key: "syntheses", label: "Synthèses & exports", icon: "syntheses", href: "/export" },
  { key: "parametres", label: "Compte", icon: "parametres", href: "/compte" },
];

type CopiloteConfig = {
  module: string;
  intro: string;
  conseil: string;
  suggestions: { label: string; href: string; icon: IconName }[];
};

const COPILOTE: Record<AppModule, CopiloteConfig> = {
  dashboard: {
    module: "Tableau de bord",
    intro: "Retrouvez les prochaines actions utiles et les points à compléter dans votre dossier.",
    conseil: "Avancez par petites étapes : chaque information ajoutée rend le dossier plus clair.",
    suggestions: [
      { label: "Noter un fait", href: "/journal", icon: "journal" },
      { label: "Ajouter un document", href: "/documents", icon: "documents" },
      { label: "Exporter le dossier", href: "/export", icon: "syntheses" },
    ],
  },
  journal: {
    module: "Journal",
    intro: "Notez des faits datés, neutres et reliés à une procédure active.",
    conseil: "Décrivez ce qui est observable : date, heure, lieu, pièce éventuelle.",
    suggestions: [
      { label: "Ajouter un événement", href: "#ajouter-fait", icon: "plus" },
      { label: "Lier une pièce", href: "/documents", icon: "attache" },
      { label: "Exporter en CSV", href: "#export-journal", icon: "syntheses" },
    ],
  },
  frais: {
    module: "Frais",
    intro: "Suivez les dépenses et les justificatifs rattachés à la procédure.",
    conseil: "Joignez un justificatif à chaque dépense : un frais documenté est plus simple à présenter.",
    suggestions: [
      { label: "Catégoriser une dépense", href: "/frais", icon: "frais" },
      { label: "Repérer les frais sans justificatif", href: "/frais", icon: "attache" },
      { label: "Calculer une part à rembourser", href: "/frais", icon: "syntheses" },
    ],
  },
  documents: {
    module: "Documents",
    intro: "Des pistes pour organiser vos pièces. L'assistant propose, vous vérifiez et validez.",
    conseil: "Nommez clairement vos fichiers : un dossier rangé se relit plus vite.",
    suggestions: [
      { label: "Classer un document", href: "/documents", icon: "documents" },
      { label: "Repérer les pièces manquantes", href: "/documents", icon: "check" },
      { label: "Préparer un bordereau", href: "/export", icon: "syntheses" },
    ],
  },
  preuves: {
    module: "Preuves",
    intro: "Des pistes pour documenter vos preuves. L'assistant propose, vous vérifiez et validez.",
    conseil: "Une preuve reste un élément de dossier : sa portée s'apprécie au cas par cas.",
    suggestions: [
      { label: "Décrire une preuve", href: "/preuves", icon: "copilote" },
      { label: "Consulter les informations techniques", href: "/preuves", icon: "check" },
      { label: "Préparer un rapport de preuve", href: "/preuves", icon: "syntheses" },
    ],
  },
  calendrier: {
    module: "Calendrier",
    intro: "Des pistes pour anticiper vos échéances. L'assistant propose, vous vérifiez et validez.",
    conseil: "Tenez le calendrier à jour : cela évite les oublis et les malentendus.",
    suggestions: [
      { label: "Préparer un rappel", href: "/calendrier", icon: "calendrier" },
      { label: "Repérer un chevauchement", href: "/calendrier", icon: "check" },
      { label: "Résumer le mois", href: "/calendrier", icon: "syntheses" },
    ],
  },
  procedures: {
    module: "Procédure",
    intro: "Vérifiez que chaque dossier reste séparé des autres procédures.",
    conseil: "Ne mélangez pas les dossiers : chaque donnée appartient à une procédure.",
    suggestions: [{ label: "Vérifier la procédure", href: "/procedure", icon: "procedures" }],
  },
  syntheses: {
    module: "Synthèses & exports",
    intro: "Préparez des documents factuels à relire avant transmission.",
    conseil: "L'export organise vos données ; il ne remplace pas un avis juridique.",
    suggestions: [{ label: "Exporter le dossier", href: "/export", icon: "syntheses" }],
  },
  parametres: {
    module: "Paramètres",
    intro: "Adaptez l'apparence et les réglages de votre espace.",
    conseil: "Ces réglages modifient votre confort, pas le contenu de votre dossier.",
    suggestions: [{ label: "Régler le thème", href: "/compte", icon: "parametres" }],
  },
};

const MESSAGE_PRUDENT =
  "L'assistant propose, vous vérifiez et validez. Il ne remplace pas un professionnel du droit.";

export default function AppShell({
  activeModule,
  title,
  subtitle,
  actions,
  copilotContext,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [actif, setActif] = useState("");
  const [copiloteOuvert, setCopiloteOuvert] = useState(false);

  useEffect(() => {
    let annule = false;
    (async () => {
      const { data, error } = await supabase
        .from("procedures")
        .select("id, etiquette")
        .order("created_at", { ascending: true });
      if (annule || error || !data) return;
      setProcedures(data);
      const memorisee = getProcedureActiveIdLocal();
      const existe = memorisee && data.some((p) => p.id === memorisee);
      setActif(existe ? memorisee : data[0]?.id ?? "");
    })();
    return () => {
      annule = true;
    };
  }, []);

  function libelleProcedure(p: Procedure) {
    return p.etiquette?.trim() ? p.etiquette : "Procédure sans nom";
  }

  function changerProcedure(id: string) {
    setProcedureActiveIdLocal(id);
    window.location.reload();
  }

  const actuelle = procedures.find((p) => p.id === actif);
  const contexte = COPILOTE[copilotContext ?? activeModule];

  return (
    <div
      className="app-shell min-h-screen"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}
    >
      <div className="grid min-h-screen lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_20rem]">
        <aside
          className="hidden border-r lg:flex lg:flex-col"
          style={{
            backgroundColor: "var(--app-sidebar-bg, var(--app-sidebar))",
            borderColor: "var(--app-sidebar-border, var(--app-border))",
            color: "var(--app-sidebar-text, var(--app-text))",
          }}
        >
          <div className="flex items-center gap-2.5 px-5 py-4">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "var(--app-sidebar-accent-bg, var(--app-primary))",
                color: "var(--app-sidebar-accent-text, var(--app-on-primary))",
              }}
            >
              <Icon name="shield" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold" style={{ color: "var(--app-sidebar-text, var(--app-text))" }}>Parent Preuve</span>
              <span className="block text-xs" style={{ color: "var(--app-sidebar-text-muted, var(--app-text-muted))" }}>
                Espace dossier
              </span>
            </span>
          </div>

          <div className="mx-3 mb-1">
            <p
              className="px-1 text-[11px] font-medium uppercase tracking-wide"
              style={{ color: "var(--app-sidebar-text-muted, var(--app-text-muted))" }}
            >
              Procédure active
            </p>
            <div
              className="mt-1 rounded-lg border px-3 py-2.5"
              style={{
                backgroundColor: "var(--app-sidebar-procedure-bg, var(--app-surface-muted))",
                borderColor: "var(--app-sidebar-procedure-border, var(--app-border))",
                color: "var(--app-sidebar-procedure-text, var(--app-text))",
              }}
            >
              {procedures.length >= 2 ? (
                <select
                  value={actif}
                  onChange={(e) => changerProcedure(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  style={{ color: "var(--app-sidebar-procedure-text, var(--app-text))" }}
                >
                  {procedures.map((p) => (
                    <option key={p.id} value={p.id}>
                      {libelleProcedure(p)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="truncate text-sm font-semibold">
                  {actuelle ? libelleProcedure(actuelle) : "Aucune procédure"}
                </p>
              )}
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
            {NAV.map((item) => {
              const active = item.key === activeModule;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition"
                  style={{
                    backgroundColor: active ? "var(--app-sidebar-active-bg, var(--app-sidebar-active))" : "transparent",
                    color: active ? "var(--app-sidebar-active-text, var(--app-primary))" : "var(--app-sidebar-text-muted, var(--app-text-muted))",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <Icon name={item.icon} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header
            className="sticky top-0 z-20 border-b px-4 py-3 sm:px-6"
            style={{
              backgroundColor: "var(--app-surface)",
              borderColor: "var(--app-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 lg:hidden">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "var(--app-primary)",
                    color: "var(--app-on-primary)",
                  }}
                >
                  <Icon name="shield" className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">Parent Preuve</span>
              </Link>
              <div
                className="relative hidden min-w-[14rem] flex-1 sm:block"
                aria-label="Recherche dans le dossier"
              >
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                />
                <input
                  type="search"
                  disabled
                  placeholder="Rechercher dans le dossier"
                  className="h-10 w-full max-w-xl rounded-lg border bg-transparent pl-9 pr-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    borderColor: "var(--app-border)",
                    color: "var(--app-text-muted)",
                    backgroundColor: "var(--app-surface-muted)",
                  }}
                />
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm font-medium">
                  {actuelle ? libelleProcedure(actuelle) : "Aucune procédure active"}
                </p>
                <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                  Données réelles de votre dossier, filtrées par les pages métier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCopiloteOuvert(true)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-sm font-medium xl:hidden"
                style={{
                  borderColor: "var(--app-border)",
                  color: "var(--app-text-muted)",
                }}
              >
                <Icon name="copilote" className="h-4 w-4" />
                <span>Copilote</span>
              </button>
            </div>
          </header>

          <main className="px-4 pb-36 pt-5 sm:px-6 lg:pb-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="mt-0.5 text-sm" style={{ color: "var(--app-text-muted)" }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>

            <div className="mt-4">{children}</div>
          </main>

          <nav
            className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"
            style={{
              backgroundColor: "var(--app-surface)",
              borderColor: "var(--app-border)",
            }}
          >
            {NAV.slice(0, 5).map((item) => {
              const active = pathname === item.href || item.key === activeModule;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-2 text-[11px]"
                  style={{ color: active ? "var(--app-primary)" : "var(--app-text-muted)" }}
                >
                  <Icon name={item.icon} />
                  {item.label.split(" ")[0]}
                </Link>
              );
            })}
          </nav>
        </div>

        <aside
          className="hidden border-l px-4 py-5 xl:block"
          style={{
            backgroundColor: "var(--app-surface)",
            borderColor: "var(--app-border)",
          }}
        >
          <PanneauCopilote contexte={contexte} />
        </aside>
      </div>

      {copiloteOuvert && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Fermer le copilote"
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setCopiloteOuvert(false)}
          />
          <div
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col px-4 py-5 shadow-2xl"
            style={{ backgroundColor: "var(--app-surface)" }}
          >
            <PanneauCopilote contexte={contexte} />
          </div>
        </div>
      )}
    </div>
  );
}

function PanneauCopilote({ contexte }: { contexte: CopiloteConfig }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            backgroundColor: "var(--app-primary-soft)",
            color: "var(--app-primary)",
          }}
        >
          <Icon name="copilote" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-tight">Copilote</h2>
          <p className="truncate text-xs" style={{ color: "var(--app-text-muted)" }}>
            Adapté à : {contexte.module}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
        {contexte.intro}
      </p>

      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: "var(--app-surface-muted)",
          borderColor: "var(--app-border)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--app-primary)" }}
        >
          Conseil
        </p>
        <p className="mt-1 text-sm leading-relaxed">{contexte.conseil}</p>
      </div>

      {contexte.suggestions.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--app-text-muted)" }}
          >
            Actions utiles
          </p>
          {contexte.suggestions.map((suggestion) => (
            <Link
              key={`${suggestion.href}-${suggestion.label}`}
              href={suggestion.href}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition"
              style={{
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
                backgroundColor: "var(--app-surface-muted)",
              }}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon name={suggestion.icon} className="h-4 w-4 shrink-0" />
                <span className="truncate">{suggestion.label}</span>
              </span>
              <Icon name="fleche" className="h-4 w-4 shrink-0" />
            </Link>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
        {MESSAGE_PRUDENT}
      </p>
    </div>
  );
}
