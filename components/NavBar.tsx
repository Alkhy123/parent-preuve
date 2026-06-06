"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// Chaque entrée de la barre est une "famille" qui regroupe plusieurs liens.
// Pour AJOUTER un lien plus tard : ajoute-le dans la bonne famille ci-dessous.
// Pour CRÉER une nouvelle famille : ajoute un objet { label, liens: [...] }.
const GROUPES = [
  {
    label: "Mon dossier",
    liens: [
      { href: "/dossier", label: "Socle (état civil)" },
      { href : "/dossier/extraire", label: "Analyse du jugement"},
      { href: "/enfants", label: "Enfants" },
    ],
  },
  {
    label: "Suivi",
    liens: [
      { href: "/frais", label: "Frais" },
      { href: "/pension", label: "Pension" },
    ],
  },
  {
    label: "Organisation",
    liens: [
      { href: "/calendrier", label: "Calendrier" },
      { href: "/journal", label: "Journal" },
    ],
  },
  {
    label: "Pièces & preuves",
    liens: [
      { href: "/documents", label: "Documents" },
      { href: "/preuves", label: "Preuves" },
    ],
  },
  {
    label: "Production",
    liens: [
      { href: "/courriers", label: "Courriers" },
      { href: "/export", label: "Export PDF" },
      { href: "/reformuler", label : "Reformulation" },
    ],
  },
];

export default function NavBar() {
  const [utilisateur, setUtilisateur] = useState<User | null>(null);
  // Quel menu est ouvert ? (le label de la famille, ou null si tout est fermé)
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUtilisateur(data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => setUtilisateur(session?.user ?? null)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  // Fermer le menu si on clique en dehors de la barre, ou avec la touche Échap.
  useEffect(() => {
    function clicDehors(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOuvert(null);
      }
    }
    function toucheEchap(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOuvert(null);
    }
    document.addEventListener("mousedown", clicDehors);
    document.addEventListener("keydown", toucheEchap);
    return () => {
      document.removeEventListener("mousedown", clicDehors);
      document.removeEventListener("keydown", toucheEchap);
    };
  }, []);

  async function seDeconnecter() {
    await supabase.auth.signOut();
  }

  // Une famille (ou un lien) est "active" si la page courante en fait partie.
  function estActif(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }
  function familleActive(liens: { href: string }[]) {
    return liens.some((l) => estActif(l.href));
  }

  return (
    <nav ref={navRef} className="bg-[#15233F] text-[#F8F6F1]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-wide text-[#C2A24C]"
          onClick={() => setMenuOuvert(null)}
        >
          Parent Preuve
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {GROUPES.map((groupe) => {
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

          {utilisateur ? (
            <button
              onClick={seDeconnecter}
              className="ml-1 text-sm text-[#F8F6F1]/80 transition hover:text-[#C2A24C]"
            >
              Se déconnecter
            </button>
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
      </div>
    </nav>
  );
}
