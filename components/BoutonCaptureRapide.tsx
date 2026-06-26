"use client";

// components/BoutonCaptureRapide.tsx
//
// ⚠️ COMPOSANT VOLONTAIREMENT CONSERVÉ — NE PAS SUPPRIMER COMME "CODE MORT".
// Monté une seule fois dans app/layout.tsx, il flotte sur toutes les pages du dossier.
// Point d'ancrage de la future CAPTURE PHOTO NATIVE mobile (React Native/Expo ou PWA).
//
// Rôle (web) : un appui ouvre un petit menu de raccourcis vers les gestes quotidiens
// (fait, dépense, preuve). Bouton DEPLACABLE (voir lib/useDeplacable). Visible
// uniquement quand le parent est connecté ; masqué sur les pages auth/légales.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useDeplacable } from "@/lib/useDeplacable";

const ROUTES_MASQUEES = [
  "/connexion",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/mentions-legales",
  "/confidentialite",
];

const ROUTES_SHELL_REEL = ["/", "/journal", "/frais", "/documents", "/preuves", "/preuves/nouvelle", "/calendrier", "/calendrier/avance"];

const RACCOURCIS = [
  { href: "/journal", label: "Noter un fait" },
  { href: "/frais", label: "Ajouter une dépense" },
  { href: "/preuves", label: "Capturer une preuve photo" },
];

const TAILLE = 48; // h-12 w-12

export default function BoutonCaptureRapide() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [connecte, setConnecte] = useState<boolean | null>(null);
  const { pos, onPointerDown, consommerDeplacement, ancrage } = useDeplacable(
    "pos-capture",
    "bas-droite",
    TAILLE
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnecte(!!session?.user)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Réinitialisation d'UI au changement de route (pas de cascade de rendu).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOuvert(false);
  }, [pathname]);

  // Masqué aussi sur les aperçus de design (/apercu/*), qui ont leur propre shell.
  if (
    !connecte ||
    ROUTES_MASQUEES.includes(pathname) ||
    pathname.startsWith("/apercu") ||
    ROUTES_SHELL_REEL.includes(pathname) ||
    !pos
  ) {
    return null;
  }

  const a = ancrage();
  const classesMenu = [
    "absolute flex flex-col gap-2",
    a.vertical === "haut" ? "bottom-full mb-3" : "top-full mt-3",
    a.horizontal === "droite" ? "right-0 items-end" : "left-0 items-start",
  ].join(" ");

  return (
    <>
      {ouvert && (
        <button
          type="button"
          aria-label="Fermer le menu de capture rapide"
          onClick={() => setOuvert(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}

      <div style={{ left: pos.x, top: pos.y }} className="fixed z-50 h-12 w-12">
        {ouvert && (
          <div className={classesMenu}>
            {RACCOURCIS.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                onClick={() => setOuvert(false)}
                className="whitespace-nowrap rounded-full bg-[#15233F] px-4 py-2 text-sm font-medium text-[#ECE7DC] shadow-lg transition hover:bg-[#1d3056] focus:outline-none focus:ring-2 focus:ring-[#C2A24C] focus:ring-offset-2"
              >
                {r.label}
              </Link>
            ))}
          </div>
        )}

        <button
          type="button"
          onPointerDown={onPointerDown}
          onClick={() => {
            if (consommerDeplacement()) return;
            setOuvert((v) => !v);
          }}
          aria-expanded={ouvert}
          aria-label={ouvert ? "Fermer le menu de capture rapide" : "Ouvrir le menu de capture rapide"}
          className="flex h-12 w-12 touch-none items-center justify-center rounded-full bg-[#C2A24C] text-2xl font-medium text-[#15233F] shadow-lg transition hover:bg-[#d4b25a] focus:outline-none focus:ring-2 focus:ring-[#C2A24C] focus:ring-offset-2"
        >
          <span aria-hidden="true" className="-mt-0.5">
            {ouvert ? "×" : "+"}
          </span>
        </button>
      </div>
    </>
  );
}
