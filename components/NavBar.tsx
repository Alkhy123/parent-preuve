"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import SelecteurProcedure from "@/components/SelecteurProcedure";

const ROUTES_NOUVEAU_SHELL = ["/", "/journal", "/compte", "/frais", "/documents", "/preuves", "/preuves/nouvelle", "/calendrier", "/calendrier/avance"];

// Lien direct vers l'accueil (premier pôle de navigation).
const ACCUEIL = { href: "/", label: "Accueil" };

// Chaque entrée de la barre est une "famille" qui regroupe plusieurs liens.
// Quatre pôles thématiques + l'accueil pour limiter l'effet fourre-tout.
const GROUPES = [
  {
    label: "Suivi quotidien",
    liens: [
      { href: "/journal", label: "Noter un fait" },
      { href: "/frais", label: "Ajouter une dépense" },
      { href: "/pension", label: "Paiement de pension" },
      { href: "/calendrier", label: "Calendrier de garde" },
    ],
  },
  {
    label: "Dossier & règles",
    liens: [
      { href: "/dossier", label: "Vos informations" },
      { href: "/enfants", label: "Enfants" },
      { href: "/procedure", label: "Autre parent et jugement" },
      { href: "/rattacher", label: "Éléments à rattacher" },
      { href: "/dossier/importer-pdf", label: "Importer un jugement" },
      { href: "/dossier/extraire", label: "Extraire les règles du jugement" },
    ],
  },
  {
    label: "Pièces & preuves",
    liens: [
      { href: "/documents", label: "Documents et justificatifs" },
      { href: "/documents/coffre-fort", label: "Pièces rangées" },
      { href: "/preuves", label: "Preuves photo horodatées" },
    ],
  },
  {
    label: "Synthèses & exports",
    liens: [
      { href: "/resume-mois", label: "Résumé du mois" },
      { href: "/chronologie", label: "Chronologie" },
      { href: "/courriers", label: "Courriers factuels" },
      { href: "/note-synthese", label: "Note de synthèse factuelle" },
      { href: "/dossier-avocat", label: "Dossier pour l'avocat" },
      { href: "/export", label: "Export PDF" },
      { href: "/reformuler", label: "Reformulation" },
      { href: "/implication-parentale", label: "Implication parentale" },
    ],
  },
];

export default function NavBar() {
  const [utilisateur, setUtilisateur] = useState<User | null>(null);
  const [authPret, setAuthPret] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null);
  const [mobileOuvert, setMobileOuvert] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUtilisateur(data.user);
      setAuthPret(true);
    });
    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => setUtilisateur(session?.user ?? null)
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
    // Réinitialisation d'UI au changement de route (pas de cascade de rendu).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOuvert(null);
    setMobileOuvert(false);
  }, [pathname]);

  async function seDeconnecter() {
    await supabase.auth.signOut();
  }

  function estActif(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }
  function familleActive(liens: { href: string }[]) {
    return liens.some((l) => estActif(l.href));
  }

  if (ROUTES_NOUVEAU_SHELL.includes(pathname) && (!authPret || utilisateur)) {
    return null;
  }

  return (
    <nav ref={navRef} className="bg-[#15233F] text-[#F8F6F1]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
        <Link
          href="/"
          className="font-display font-bold transition"
          style={{ color: "#C2A24C" }}
          onClick={() => {
            setMenuOuvert(null);
            setMobileOuvert(false);
          }}
        >
          Parent Preuve
        </Link>

        {/* ===== Version BUREAU (à partir de md) ===== */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {/* Les modules ne s'affichent que pour un utilisateur connecté. */}
          {utilisateur && (
            <Link
              href={ACCUEIL.href}
              onClick={() => setMenuOuvert(null)}
              className={`rounded px-2 py-1 text-sm transition hover:text-[#C2A24C] ${
                pathname === ACCUEIL.href
                  ? "text-[#C2A24C]"
                  : "text-[#F8F6F1]/80"
              }`}
            >
              {ACCUEIL.label}
            </Link>
          )}

          {utilisateur &&
            GROUPES.map((groupe) => {
              const ouvert = menuOuvert === groupe.label;
              const actif = familleActive(groupe.liens);
              return (
                <div key={groupe.label} className="relative">
                  <button
                    onClick={() => setMenuOuvert(ouvert ? null : groupe.label)}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition hover:text-[#C2A24C] ${
                      actif ? "text-[#C2A24C]" : "text-[#F8F6F1]/80"
                    }`}
                  >
                    {groupe.label}
                    <span
                      className={`text-[10px] transition-transform ${
                        ouvert ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {ouvert && (
                    <div className="absolute right-0 z-50 mt-2 min-w-[11rem] overflow-hidden rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] py-1 shadow-lg">
                      {groupe.liens.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMenuOuvert(null)}
                          className={`block px-4 py-2 text-sm transition hover:bg-[#15233F]/5 hover:text-[#15233F] ${
                            estActif(l.href)
                              ? "font-semibold text-[#15233F]"
                              : "text-[#1F2733]"
                          }`}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Sélecteur de procédure active (visible si >= 2 procédures). */}
          {utilisateur && <SelecteurProcedure />}

          {utilisateur ? (
            <>
              <Link
                href="/compte"
                onClick={() => setMenuOuvert(null)}
                className="ml-1 text-sm text-[#F8F6F1]/80 transition hover:text-[#C2A24C]"
              >
                Mon compte
              </Link>
              <button
                onClick={seDeconnecter}
                className="ml-1 text-sm text-[#F8F6F1]/80 transition hover:text-[#C2A24C]"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link
              href="/connexion"
              onClick={() => setMenuOuvert(null)}
              className="ml-1 text-sm text-[#F8F6F1]/80 transition hover:text-[#C2A24C]"
            >
              Connexion
            </Link>
          )}
        </div>

        {/* ===== Zone mobile (< md) : hamburger si connecté, sinon lien Connexion ===== */}
        {utilisateur ? (
          <button
            onClick={() => setMobileOuvert((o) => !o)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOuvert}
            className="rounded p-1 text-[#F8F6F1] transition hover:text-[#C2A24C] md:hidden"
          >
            {mobileOuvert ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        ) : (
          <Link
            href="/connexion"
            className="text-sm text-[#F8F6F1]/80 transition hover:text-[#C2A24C] md:hidden"
          >
            Connexion
          </Link>
        )}
      </div>

      {/* ===== Panneau MOBILE déroulé (uniquement si connecté) ===== */}
      {mobileOuvert && utilisateur && (
        <div className="border-t border-[#C2A24C]/30 px-6 pb-4 md:hidden">
          <div className="space-y-4 pt-3">
            {/* Sélecteur de procédure active (visible si >= 2 procédures). */}
            <SelecteurProcedure />

            <Link
              href={ACCUEIL.href}
              onClick={() => setMobileOuvert(false)}
              className={`block rounded px-2 py-2 text-sm transition hover:text-[#C2A24C] ${
                pathname === ACCUEIL.href
                  ? "font-semibold text-[#C2A24C]"
                  : "text-[#F8F6F1]/80"
              }`}
            >
              {ACCUEIL.label}
            </Link>

            {GROUPES.map((groupe) => (
              <div key={groupe.label}>
                <p className="text-xs uppercase tracking-wide text-[#C2A24C]/80">
                  {groupe.label}
                </p>
                <div className="mt-1 flex flex-col">
                  {groupe.liens.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOuvert(false)}
                      className={`rounded px-2 py-2 text-sm transition hover:text-[#C2A24C] ${
                        estActif(l.href)
                          ? "font-semibold text-[#C2A24C]"
                          : "text-[#F8F6F1]/80"
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t border-[#C2A24C]/20 pt-3">
              <div className="flex flex-col gap-3">
                <Link
                  href="/compte"
                  onClick={() => setMobileOuvert(false)}
                  className="text-sm text-[#F8F6F1]/80 transition hover:text-[#C2A24C]"
                >
                  Mon compte
                </Link>
                <button
                  onClick={() => {
                    setMobileOuvert(false);
                    seDeconnecter();
                  }}
                  className="text-left text-sm text-[#F8F6F1]/80 transition hover:text-[#C2A24C]"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
                            }
