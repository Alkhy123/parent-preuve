"use client";

// components/app/AppSidebar.tsx
//
// Rail de navigation applicatif desktop.
// Affiche : Tableau de bord → groupes Collecter / Organiser / Exporter
// (repliables, groupe actif toujours ouvert) → Copilote → Compte.
//
// Règle UX : le groupe qui contient la route active reste toujours ouvert.
// Les autres groupes peuvent être ouverts/fermés manuellement.
// Aucun setState dans un useEffect (interdit par la règle lint du projet).

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import SelecteurProcedure from "@/components/SelecteurProcedure";
import {
  APP_NAV_GROUPS,
  estRouteAppShell,
  groupeActifPour,
  type AppNavGroupe,
} from "@/components/app/appShellNavigation";

// ── Helpers ───────────────────────────────────────────────────────────────────

function estActif(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// ── Classes CSS partagées ─────────────────────────────────────────────────────

const CLS_LIEN_ACTIF =
  "bg-[var(--app-sidebar-active-bg,var(--app-accent))] font-semibold " +
  "text-[var(--app-sidebar-active-text,var(--app-on-primary,#ffffff))]";

const CLS_LIEN_INACTIF =
  "text-[var(--app-sidebar-text,var(--app-text))] hover:bg-black/5";

// ── Sous-composant : groupe repliable ─────────────────────────────────────────

type GroupeSidebarProps = {
  groupe: AppNavGroupe;
  ouvert: boolean;
  actif: boolean;
  pathname: string;
  onToggle: () => void;
};

function GroupeSidebar({
  groupe,
  ouvert,
  actif,
  pathname,
  onToggle,
}: GroupeSidebarProps) {
  return (
    <div>
      {/* En-tête cliquable du groupe */}
      <button
        type="button"
        onClick={onToggle}
        className={
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition " +
          (actif ? CLS_LIEN_ACTIF : CLS_LIEN_INACTIF)
        }
      >
        <span>{groupe.label}</span>
        <span aria-hidden="true" className="text-xs opacity-60">
          {ouvert ? "▾" : "▸"}
        </span>
      </button>

      {/* Sous-liens, visibles quand le groupe est ouvert */}
      {ouvert && (
        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-[var(--app-border)] pl-3">
          {groupe.liens.map((lien) => {
            const lienActif = estActif(lien.href, pathname);

            return (
              <Link
                key={lien.href}
                href={lien.href}
                className={
                  "rounded-lg px-2 py-1.5 text-xs transition " +
                  (lienActif
                    ? "bg-[var(--app-sidebar-active-bg,var(--app-accent))]/70 font-semibold " +
                      "text-[var(--app-sidebar-active-text,var(--app-on-primary,#ffffff))]"
                    : "text-[var(--app-sidebar-text,var(--app-text-muted))] hover:bg-black/5")
                }
              >
                {lien.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function AppSidebar() {
  const pathname = usePathname();

  // Toggles manuels de l'utilisateur. Le groupe actif est TOUJOURS ouvert
  // indépendamment de cet état (voir estOuvert ci-dessous).
  const [manuelOuverts, setManuelOuverts] = useState<Record<string, boolean>>(
    {},
  );

  if (!estRouteAppShell(pathname)) return null;

  // Groupe dont la route principale ou une sous-route correspond au pathname.
  // Calculé au rendu, pas dans un effet.
  const actifLabel = groupeActifPour(pathname);

  // Un groupe est ouvert si : c'est le groupe actif (toujours), OU l'utilisateur
  // l'a ouvert manuellement.
  function estOuvert(label: string): boolean {
    if (label === actifLabel) return true;
    return manuelOuverts[label] ?? false;
  }

  // Toggle : le groupe actif ne peut pas être fermé (il est toujours ouvert).
  function toggleGroupe(label: string) {
    if (label === actifLabel) return;
    setManuelOuverts((prev) => ({
      ...prev,
      [label]: !estOuvert(label),
    }));
  }

  return (
    <aside
      className="hidden shrink-0 lg:flex lg:w-64 lg:flex-col lg:gap-4 lg:rounded-3xl lg:border lg:p-4
        lg:border-[var(--app-sidebar-border,var(--app-border))]
        lg:bg-[var(--app-sidebar-bg,var(--app-surface))]
        lg:text-[var(--app-sidebar-text,var(--app-text))]"
    >
      {/* ── Procédure active ─────────────────────────────────────────── */}
      <div>
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-sidebar-accent,var(--app-sidebar-accent-bg,var(--app-accent)))]">
          Procédure active
        </p>
        <div className="mt-2 px-2">
          <SelecteurProcedure variant="sidebar" afficherSiUnique />
        </div>
        <p className="mt-2 px-2 text-xs leading-5 text-[var(--app-sidebar-muted,var(--app-sidebar-text-muted,var(--app-text-muted)))]">
          Les pages du dossier utilisent cette procédure comme contexte.
        </p>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex flex-col gap-1 overflow-y-auto">
        {/* Tableau de bord */}
        <Link
          href="/"
          className={
            "rounded-xl px-3 py-2 text-sm transition " +
            (pathname === "/" ? CLS_LIEN_ACTIF : CLS_LIEN_INACTIF)
          }
        >
          Tableau de bord
        </Link>

        {/* Groupes Collecter / Organiser / Exporter */}
        {APP_NAV_GROUPS.map((groupe) => (
          <GroupeSidebar
            key={groupe.label}
            groupe={groupe}
            ouvert={estOuvert(groupe.label)}
            actif={groupe.label === actifLabel}
            pathname={pathname}
            onToggle={() => toggleGroupe(groupe.label)}
          />
        ))}

        {/* Copilote & Compte */}
        <div className="mt-2 border-t border-[var(--app-border)] pt-2">
          {[
            { href: "/copilote", label: "Copilote" },
            { href: "/compte", label: "Compte" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "block rounded-xl px-3 py-2 text-sm transition " +
                (estActif(item.href, pathname) ? CLS_LIEN_ACTIF : CLS_LIEN_INACTIF)
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Pied de page ─────────────────────────────────────────────── */}
      <p className="mt-auto px-2 text-xs leading-5 text-[var(--app-sidebar-muted,var(--app-sidebar-text-muted,var(--app-text-muted)))]">
        Aide à l&apos;organisation d&apos;un dossier factuel de coparentalité. Ne
        constitue pas un conseil juridique.
      </p>
    </aside>
  );
}
