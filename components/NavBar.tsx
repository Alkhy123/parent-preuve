"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import SelecteurProcedure from "@/components/SelecteurProcedure";
import { estRouteAppShell } from "@/components/app/appShellNavigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type LienNavigation = {
  href: string;
  label: string;
};

type GroupeNavigation = {
  label: string;
  hrefPrincipal: string;
  liens: LienNavigation[];
};

const ACCUEIL = { href: "/", label: "Accueil" };

const GROUPES: GroupeNavigation[] = [
  {
    label: "Collecter",
    hrefPrincipal: "/collecter",
    liens: [
      { href: "/collecter", label: "Vue Collecter" },
      { href: "/collecter/rapide", label: "Collecte rapide" },
      { href: "/journal", label: "Noter un fait" },
      { href: "/preuves", label: "Ajouter une preuve" },
      { href: "/documents", label: "Importer un document" },
      { href: "/frais", label: "Ajouter un frais" },
      { href: "/pension", label: "Paiement de pension" },
      { href: "/calendrier", label: "Ajouter une échéance" },
    ],
  },
  {
    label: "Organiser",
    hrefPrincipal: "/organiser",
    liens: [
      { href: "/organiser", label: "Vue Organiser" },
      { href: "/organiser/brouillons", label: "Brouillons locaux" },
      { href: "/dossier", label: "Dossier" },
      { href: "/enfants", label: "Enfants" },
      { href: "/procedure", label: "Procédure et jugement" },
      { href: "/rattacher", label: "Éléments à rattacher" },
      { href: "/documents/coffre-fort", label: "Coffre-fort documentaire" },
      { href: "/chronologie", label: "Chronologie" },
      { href: "/calendrier", label: "Calendrier" },
    ],
  },
  {
    label: "Exporter",
    hrefPrincipal: "/exporter",
    liens: [
      { href: "/exporter", label: "Vue Exporter" },
      { href: "/exporter/checklist", label: "Checklist export" },
      { href: "/exporter/chronologie", label: "Export chronologie" },
      { href: "/exporter/resume-mois", label: "Résumé du mois" },
      { href: "/exporter/courriers", label: "Courriers factuels" },
      { href: "/exporter/note-synthese", label: "Note de synthèse" },
      { href: "/exporter/dossier-avocat", label: "Dossier avocat" },
      { href: "/exporter/pdf", label: "Export PDF" },
    ],
  },
  {
    label: "Assistant",
    hrefPrincipal: "/copilote",
    liens: [
      { href: "/copilote", label: "Copilote dossier" },
      { href: "/reformuler", label: "Reformuler un message" },
      { href: "/implication-parentale", label: "Implication parentale" },
    ],
  },
];

export default function NavBar() {
  const [utilisateur, setUtilisateur] = useState<User | null>(null);
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null);
  const [mobileOuvert, setMobileOuvert] = useState(false);

  const navRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUtilisateur(data.user));

    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => setUtilisateur(session?.user ?? null),
    );

    return () => ecouteur.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function clicDehors(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOuvert(null);
        setMobileOuvert(false);
      }
    }

    function toucheEchap(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOuvert(null);
        setMobileOuvert(false);
      }
    }

    document.addEventListener("mousedown", clicDehors);
    document.addEventListener("keydown", toucheEchap);

    return () => {
      document.removeEventListener("mousedown", clicDehors);
      document.removeEventListener("keydown", toucheEchap);
    };
  }, []);

    useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setMenuOuvert(null);
      setMobileOuvert(false);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [pathname]);

  async function seDeconnecter() {
    await supabase.auth.signOut();
  }

  function estActif(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(href + "/");
  }

  function groupeActif(groupe: GroupeNavigation) {
    return (
      estActif(groupe.hrefPrincipal) ||
      groupe.liens.some((lien) => estActif(lien.href))
    );
  }

  // Sur une route AppShell, la navigation desktop est désormais portée par
  // AppSidebar : on masque la NavBar uniquement en desktop pour éviter la
  // double navigation. Le mobile garde la NavBar (AppSidebar y est masquée).
  const routeAppShell = estRouteAppShell(pathname);
  const masquerEnDesktop = !!utilisateur && routeAppShell;

  return (
    <nav
      ref={navRef}
      className={`bg-[var(--app-text)] text-[var(--app-surface)] shadow-sm ${
        masquerEnDesktop ? "lg:hidden" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          onClick={() => {
            setMenuOuvert(null);
            setMobileOuvert(false);
          }}
          className="text-base font-semibold tracking-tight text-[var(--app-surface)] transition hover:text-[var(--app-accent)]"
        >
          Parent Preuve
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {utilisateur && (
            <Link
              href={ACCUEIL.href}
              onClick={() => setMenuOuvert(null)}
              className={`rounded px-2 py-1 text-sm transition hover:text-[var(--app-accent)] ${
                estActif(ACCUEIL.href)
                  ? "text-[var(--app-accent)]"
                  : "text-[var(--app-surface)]/80"
              }`}
            >
              {ACCUEIL.label}
            </Link>
          )}

          {utilisateur &&
            GROUPES.map((groupe) => {
              const ouvert = menuOuvert === groupe.label;
              const actif = groupeActif(groupe);

              return (
                <div key={groupe.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOuvert(ouvert ? null : groupe.label)}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition hover:text-[var(--app-accent)] ${
                      actif ? "text-[var(--app-accent)]" : "text-[var(--app-surface)]/80"
                    }`}
                  >
                    {groupe.label}
                    <span aria-hidden="true">▾</span>
                  </button>

                  {ouvert && (
                    <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-2 text-[var(--app-text)] shadow-lg">
                      {groupe.liens.map((lien) => (
                        <Link
                          key={lien.href}
                          href={lien.href}
                          onClick={() => setMenuOuvert(null)}
                          className={`block px-4 py-2 text-sm transition hover:bg-[var(--app-text)]/5 hover:text-[var(--app-text)] ${
                            estActif(lien.href)
                              ? "font-semibold text-[var(--app-text)]"
                              : "text-[var(--app-text)]"
                          }`}
                        >
                          {lien.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          {utilisateur && <SelecteurProcedure />}

          {utilisateur ? (
            <>
              <Link
                href="/compte"
                onClick={() => setMenuOuvert(null)}
                className="ml-1 text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)]"
              >
                Mon compte
              </Link>

              <button
                type="button"
                onClick={seDeconnecter}
                className="ml-1 text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)]"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link
              href="/connexion"
              onClick={() => setMenuOuvert(null)}
              className="ml-1 text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)]"
            >
              Connexion
            </Link>
          )}
        </div>

        {utilisateur ? (
          <button
            type="button"
            onClick={() => setMobileOuvert((ouvert) => !ouvert)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOuvert}
            className="rounded p-1 text-[var(--app-surface)] transition hover:text-[var(--app-accent)] md:hidden"
          >
            <span className="text-2xl leading-none">
              {mobileOuvert ? "×" : "☰"}
            </span>
          </button>
        ) : (
          <Link
            href="/connexion"
            className="text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)] md:hidden"
          >
            Connexion
          </Link>
        )}
      </div>

      {mobileOuvert && utilisateur && (
        <div className="border-t border-[var(--app-surface)]/10 px-4 py-4 md:hidden">
          <div className="mb-4">
            <SelecteurProcedure />
          </div>

          <Link
            href={ACCUEIL.href}
            onClick={() => setMobileOuvert(false)}
            className={`block rounded px-2 py-2 text-sm transition hover:text-[var(--app-accent)] ${
              estActif(ACCUEIL.href)
                ? "font-semibold text-[var(--app-accent)]"
                : "text-[var(--app-surface)]/80"
            }`}
          >
            {ACCUEIL.label}
          </Link>

          {GROUPES.map((groupe) => (
            <div key={groupe.label} className="mt-4">
              <p
                className={`px-2 text-xs font-semibold uppercase tracking-wide ${
                  groupeActif(groupe)
                    ? "text-[var(--app-accent)]"
                    : "text-[var(--app-surface)]/60"
                }`}
              >
                {groupe.label}
              </p>

              <div className="mt-2 grid gap-1">
                {groupe.liens.map((lien) => (
                  <Link
                    key={lien.href}
                    href={lien.href}
                    onClick={() => setMobileOuvert(false)}
                    className={`rounded px-2 py-2 text-sm transition hover:text-[var(--app-accent)] ${
                      estActif(lien.href)
                        ? "font-semibold text-[var(--app-accent)]"
                        : "text-[var(--app-surface)]/80"
                    }`}
                  >
                    {lien.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-5 flex flex-col gap-3 border-t border-[var(--app-surface)]/10 pt-4">
            <Link
              href="/compte"
              onClick={() => setMobileOuvert(false)}
              className="text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)]"
            >
              Mon compte
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOuvert(false);
                seDeconnecter();
              }}
              className="text-left text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)]"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
