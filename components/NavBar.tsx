"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import SelecteurProcedure from "@/components/SelecteurProcedure";
import {
  APP_NAV_GROUPS,
  estRouteAppShell,
  routeDansSecondaires,
  tousLiensGroupe,
  type AppNavGroupe,
} from "@/components/app/appShellNavigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const ACCUEIL = { href: "/", label: "Tableau de bord" };

export default function NavBar() {
  const [utilisateur, setUtilisateur] = useState<User | null>(null);
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null);
  const [mobileOuvert, setMobileOuvert] = useState(false);
  // « Voir plus » (liens secondaires) ouverts manuellement dans le drawer mobile.
  const [voirPlusMobile, setVoirPlusMobile] = useState<Record<string, boolean>>(
    {},
  );

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

  function groupeActif(groupe: AppNavGroupe) {
    return (
      estActif(groupe.hrefPrincipal) ||
      tousLiensGroupe(groupe).some((lien) => estActif(lien.href))
    );
  }

  function voirPlusOuvert(groupe: AppNavGroupe) {
    if (routeDansSecondaires(groupe, pathname)) return true;
    return voirPlusMobile[groupe.label] ?? false;
  }

  function toggleVoirPlus(groupe: AppNavGroupe) {
    if (routeDansSecondaires(groupe, pathname)) return;
    setVoirPlusMobile((prev) => ({
      ...prev,
      [groupe.label]: !voirPlusOuvert(groupe),
    }));
  }

  // Sur une route AppShell, la navigation desktop est portée par AppSidebar :
  // on masque la NavBar uniquement en desktop pour éviter la double navigation.
  // Le mobile garde la NavBar (AppSidebar y est masquée).
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
            APP_NAV_GROUPS.map((groupe) => {
              const ouvert = menuOuvert === groupe.label;
              const actif = groupeActif(groupe);

              return (
                <div key={groupe.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOuvert(ouvert ? null : groupe.label)}
                    aria-expanded={ouvert}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition hover:text-[var(--app-accent)] ${
                      actif ? "text-[var(--app-accent)]" : "text-[var(--app-surface)]/80"
                    }`}
                  >
                    {groupe.label}
                    <span aria-hidden="true">▾</span>
                  </button>

                  {ouvert && (
                    <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-2 text-[var(--app-text)] shadow-lg">
                      {groupe.liensPrincipaux.map((lien) => (
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

                      {groupe.liensSecondaires.length > 0 && (
                        <>
                          <div className="my-1 border-t border-[var(--app-border)]" />
                          {groupe.liensSecondaires.map((lien) => (
                            <Link
                              key={lien.href}
                              href={lien.href}
                              onClick={() => setMenuOuvert(null)}
                              className={`block px-4 py-2 text-sm transition hover:bg-[var(--app-text)]/5 hover:text-[var(--app-text)] ${
                                estActif(lien.href)
                                  ? "font-semibold text-[var(--app-text)]"
                                  : "text-[var(--app-text)]/70"
                              }`}
                            >
                              {lien.label}
                            </Link>
                          ))}
                        </>
                      )}
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
                Compte
              </Link>

              <button
                type="button"
                onClick={seDeconnecter}
                className="ml-1 text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)]"
              >
                Déconnexion
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

          {APP_NAV_GROUPS.map((groupe) => (
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
                {groupe.liensPrincipaux.map((lien) => (
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

                {groupe.liensSecondaires.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleVoirPlus(groupe)}
                      aria-expanded={voirPlusOuvert(groupe)}
                      className="flex items-center gap-1 rounded px-2 py-2 text-left text-xs text-[var(--app-surface)]/60 transition hover:text-[var(--app-accent)]"
                    >
                      <span aria-hidden="true">
                        {voirPlusOuvert(groupe) ? "▾" : "▸"}
                      </span>
                      <span>
                        {voirPlusOuvert(groupe) ? "Voir moins" : "Voir plus"}
                      </span>
                    </button>

                    {voirPlusOuvert(groupe) &&
                      groupe.liensSecondaires.map((lien) => (
                        <Link
                          key={lien.href}
                          href={lien.href}
                          onClick={() => setMobileOuvert(false)}
                          className={`rounded px-2 py-2 pl-4 text-sm transition hover:text-[var(--app-accent)] ${
                            estActif(lien.href)
                              ? "font-semibold text-[var(--app-accent)]"
                              : "text-[var(--app-surface)]/70"
                          }`}
                        >
                          {lien.label}
                        </Link>
                      ))}
                  </>
                )}
              </div>
            </div>
          ))}

          <div className="mt-5 flex flex-col gap-3 border-t border-[var(--app-surface)]/10 pt-4">
            <Link
              href="/compte"
              onClick={() => setMobileOuvert(false)}
              className="text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)]"
            >
              Compte
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOuvert(false);
                seDeconnecter();
              }}
              className="text-left text-sm text-[var(--app-surface)]/80 transition hover:text-[var(--app-accent)]"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
