"use client";

// components/app/AppSidebar.tsx
//
// Rail de navigation applicatif desktop.
// Ordre : Tableau de bord → groupes Collecter / Organiser / Exporter
// (accordéons repliables, groupe actif toujours ouvert, liens secondaires
// derrière « Voir plus ») → Compte → Déconnexion.
//
// Règle UX : le groupe qui contient la route active reste toujours ouvert.
// Le sous-bloc « Voir plus » est fermé par défaut sauf si la route active s'y
// trouve. Les autres groupes / « Voir plus » se togglent manuellement.
// Aucun setState dans un useEffect (interdit par la règle lint du projet).

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import SelecteurProcedure from "@/components/SelecteurProcedure";
import { supabase } from "@/lib/supabase";
import {
  APP_NAV_GROUPS,
  estRouteAppShell,
  groupeActifPour,
  routeDansSecondaires,
  type AppNavGroupe,
  type AppNavItem,
} from "@/components/app/appShellNavigation";

// ── Helpers ───────────────────────────────────────────────────────────────────

function estActif(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// ── Icônes inline (outline, trait 1.75px, sans dépendance) ─────────────────────

type NomIcone =
  | "dashboard"
  | "collecter"
  | "organiser"
  | "exporter"
  | "compte"
  | "deconnexion";

function Icone({ nom }: { nom: NomIcone }) {
  const commun = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "shrink-0",
  };

  switch (nom) {
    case "dashboard":
      return (
        <svg {...commun}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "collecter":
      return (
        <svg {...commun}>
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
        </svg>
      );
    case "organiser":
      return (
        <svg {...commun}>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        </svg>
      );
    case "exporter":
      return (
        <svg {...commun}>
          <path d="M12 15V3" />
          <path d="m8 7 4-4 4 4" />
          <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
        </svg>
      );
    case "compte":
      return (
        <svg {...commun}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "deconnexion":
      return (
        <svg {...commun}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
  }
}

const ICONE_GROUPE: Record<string, NomIcone> = {
  Collecter: "collecter",
  Organiser: "organiser",
  Exporter: "exporter",
};

// ── Classes CSS partagées ─────────────────────────────────────────────────────

const CLS_LIEN_ACTIF =
  "bg-[var(--app-sidebar-active-bg,var(--app-accent))] font-semibold " +
  "text-[var(--app-sidebar-active-text,var(--app-on-primary,#ffffff))]";

const CLS_LIEN_INACTIF =
  "text-[var(--app-sidebar-text,var(--app-text))] hover:bg-black/5";

// ── Sous-composant : lien enfant (retrait + puce) ─────────────────────────────

function LienEnfant({
  lien,
  pathname,
}: {
  lien: AppNavItem;
  pathname: string;
}) {
  const actif = estActif(lien.href, pathname);

  return (
    <Link
      href={lien.href}
      className={
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition " +
        (actif
          ? "bg-[var(--app-sidebar-active-bg,var(--app-accent))]/70 font-semibold " +
            "text-[var(--app-sidebar-active-text,var(--app-on-primary,#ffffff))]"
          : "text-[var(--app-sidebar-text,var(--app-text-muted))] hover:bg-black/5")
      }
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50"
      />
      <span>{lien.label}</span>
    </Link>
  );
}

// ── Sous-composant : groupe accordéon ─────────────────────────────────────────

type GroupeSidebarProps = {
  groupe: AppNavGroupe;
  ouvert: boolean;
  actif: boolean;
  voirPlusOuvert: boolean;
  pathname: string;
  onToggle: () => void;
  onToggleVoirPlus: () => void;
};

function GroupeSidebar({
  groupe,
  ouvert,
  actif,
  voirPlusOuvert,
  pathname,
  onToggle,
  onToggleVoirPlus,
}: GroupeSidebarProps) {
  return (
    <div>
      {/* En-tête cliquable du groupe */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={ouvert}
        className={
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition " +
          (actif ? CLS_LIEN_ACTIF : CLS_LIEN_INACTIF)
        }
      >
        <span className="flex items-center gap-2.5">
          <Icone nom={ICONE_GROUPE[groupe.label]} />
          <span>{groupe.label}</span>
        </span>
        <span aria-hidden="true" className="text-xs opacity-60">
          {ouvert ? "▾" : "▸"}
        </span>
      </button>

      {/* Contenu du groupe */}
      {ouvert && (
        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-[var(--app-border)] pl-3">
          {groupe.liensPrincipaux.map((lien) => (
            <LienEnfant key={lien.href} lien={lien} pathname={pathname} />
          ))}

          {groupe.liensSecondaires.length > 0 && (
            <>
              <button
                type="button"
                onClick={onToggleVoirPlus}
                aria-expanded={voirPlusOuvert}
                className="mt-0.5 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[var(--app-sidebar-muted,var(--app-text-muted))] transition hover:bg-black/5"
              >
                <span aria-hidden="true" className="opacity-60">
                  {voirPlusOuvert ? "▾" : "▸"}
                </span>
                <span>{voirPlusOuvert ? "Voir moins" : "Voir plus"}</span>
              </button>

              {voirPlusOuvert &&
                groupe.liensSecondaires.map((lien) => (
                  <LienEnfant key={lien.href} lien={lien} pathname={pathname} />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function AppSidebar() {
  const pathname = usePathname();

  // Toggles manuels. Le groupe actif est TOUJOURS ouvert, et le « Voir plus »
  // contenant la route active est TOUJOURS ouvert (voir helpers ci-dessous).
  const [groupesManuel, setGroupesManuel] = useState<Record<string, boolean>>(
    {},
  );
  const [voirPlusManuel, setVoirPlusManuel] = useState<Record<string, boolean>>(
    {},
  );

  if (!estRouteAppShell(pathname)) return null;

  const actifLabel = groupeActifPour(pathname);

  function estOuvert(groupe: AppNavGroupe): boolean {
    if (groupe.label === actifLabel) return true;
    return groupesManuel[groupe.label] ?? false;
  }

  function estVoirPlusOuvert(groupe: AppNavGroupe): boolean {
    if (routeDansSecondaires(groupe, pathname)) return true;
    return voirPlusManuel[groupe.label] ?? false;
  }

  function toggleGroupe(groupe: AppNavGroupe) {
    if (groupe.label === actifLabel) return;
    setGroupesManuel((prev) => ({
      ...prev,
      [groupe.label]: !estOuvert(groupe),
    }));
  }

  function toggleVoirPlus(groupe: AppNavGroupe) {
    if (routeDansSecondaires(groupe, pathname)) return;
    setVoirPlusManuel((prev) => ({
      ...prev,
      [groupe.label]: !estVoirPlusOuvert(groupe),
    }));
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
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
            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition " +
            (pathname === "/" ? CLS_LIEN_ACTIF : CLS_LIEN_INACTIF)
          }
        >
          <Icone nom="dashboard" />
          <span>Tableau de bord</span>
        </Link>

        {/* Groupes Collecter / Organiser / Exporter */}
        {APP_NAV_GROUPS.map((groupe) => (
          <GroupeSidebar
            key={groupe.label}
            groupe={groupe}
            ouvert={estOuvert(groupe)}
            actif={groupe.label === actifLabel}
            voirPlusOuvert={estVoirPlusOuvert(groupe)}
            pathname={pathname}
            onToggle={() => toggleGroupe(groupe)}
            onToggleVoirPlus={() => toggleVoirPlus(groupe)}
          />
        ))}

        {/* Compte & Déconnexion */}
        <div className="mt-2 border-t border-[var(--app-border)] pt-2">
          <Link
            href="/compte"
            className={
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition " +
              (estActif("/compte", pathname) ? CLS_LIEN_ACTIF : CLS_LIEN_INACTIF)
            }
          >
            <Icone nom="compte" />
            <span>Compte</span>
          </Link>

          <button
            type="button"
            onClick={seDeconnecter}
            className={
              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition " +
              CLS_LIEN_INACTIF
            }
          >
            <Icone nom="deconnexion" />
            <span>Déconnexion</span>
          </button>
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
