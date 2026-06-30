"use client";

// components/app/AppSidebar.tsx
//
// Rail de navigation applicatif desktop, affiché à l'intérieur d'AppShell sur
// les routes couvertes par appShellNavigation. Purement présentationnel : pas
// d'appel Supabase ici, pas de logique métier. SelecteurProcedure est réutilisé
// tel quel (ni déplacé ni modifié), seulement encadré dans un petit bloc.

import Link from "next/link";
import { usePathname } from "next/navigation";

import SelecteurProcedure from "@/components/SelecteurProcedure";
import { APP_NAV_ITEMS, estRouteAppShell } from "@/components/app/appShellNavigation";

function estLienActif(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppSidebar() {
  const pathname = usePathname();

  if (!estRouteAppShell(pathname)) return null;

  return (
    <aside
      className="hidden shrink-0 lg:flex lg:w-64 lg:flex-col lg:gap-6 lg:rounded-3xl lg:border lg:p-4
        lg:border-[var(--app-sidebar-border,var(--app-border))]
        lg:bg-[var(--app-sidebar-bg,var(--app-surface))]
        lg:text-[var(--app-sidebar-text,var(--app-text))]"
    >
      <div>
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-sidebar-accent,var(--app-sidebar-accent-bg,var(--app-accent)))]">
          Procédure active
        </p>
        <div className="mt-2 px-2">
          <SelecteurProcedure />
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {APP_NAV_ITEMS.map((item) => {
          const actif = estLienActif(item.href, pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "rounded-xl px-3 py-2 text-sm transition " +
                (actif
                  ? "bg-[var(--app-sidebar-active-bg,var(--app-accent))] font-semibold text-[var(--app-sidebar-active-text,var(--app-on-primary,#ffffff))]"
                  : "text-[var(--app-sidebar-text,var(--app-text))] hover:bg-black/5")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-auto px-2 text-xs leading-5 text-[var(--app-sidebar-muted,var(--app-sidebar-text-muted,var(--app-text-muted)))]">
        Aide à l&apos;organisation d&apos;un dossier factuel de coparentalité. Ne
        constitue pas un conseil juridique.
      </p>
    </aside>
  );
}
