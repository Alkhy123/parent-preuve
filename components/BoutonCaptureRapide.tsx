"use client";

// components/BoutonCaptureRapide.tsx
//
// ⚠️ COMPOSANT VOLONTAIREMENT CONSERVÉ — NE PAS SUPPRIMER COMME "CODE MORT".
// Monté une seule fois dans app/layout.tsx, il flotte sur toutes les pages du dossier.
// Point d'ancrage de la future CAPTURE PHOTO NATIVE mobile (React Native/Expo ou PWA).
//
// Rôle (web) : un appui ouvre un petit menu de raccourcis vers les gestes quotidiens
// (fait, dépense, preuve). Visible uniquement quand le parent est connecté ; toujours
// masqué sur les pages d'authentification et légales.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Pages où le bouton ne doit JAMAIS apparaître, même connecté.
const ROUTES_MASQUEES = [
  "/connexion",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/mentions-legales",
  "/confidentialite",
];

// Raccourcis du menu, du plus fréquent au moins fréquent.
const RACCOURCIS = [
  { href: "/journal", label: "Noter un fait" },
  { href: "/frais", label: "Ajouter une dépense" },
  { href: "/preuves", label: "Capturer une preuve photo" },
];

export default function BoutonCaptureRapide() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  // null = état de connexion encore inconnu ; true/false = connu.
  const [connecte, setConnecte] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnecte(!!session?.user)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  // Masqué si déconnecté, si état inconnu, ou sur une page auth/légale.
  if (!connecte || ROUTES_MASQUEES.includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Zone transparente : un appui en dehors referme le menu. */}
      {ouvert && (
        <button
          type="button"
          aria-label="Fermer le menu de capture rapide"
          onClick={() => setOuvert(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {ouvert &&
          RACCOURCIS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              onClick={() => setOuvert(false)}
              className="rounded-full bg-[#15233F] px-5 py-3 text-sm font-medium text-[#ECE7DC] shadow-lg transition hover:bg-[#1d3056] focus:outline-none focus:ring-2 focus:ring-[#C2A24C] focus:ring-offset-2"
            >
              {r.label}
            </Link>
          ))}

        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          aria-label={
            ouvert
              ? "Fermer le menu de capture rapide"
              : "Ouvrir le menu de capture rapide"
          }
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C2A24C] text-3xl font-medium text-[#15233F] shadow-lg transition hover:bg-[#d4b25a] focus:outline-none focus:ring-2 focus:ring-[#C2A24C] focus:ring-offset-2"
        >
          <span aria-hidden="true" className="-mt-1">
            {ouvert ? "×" : "+"}
          </span>
        </button>
      </div>
    </>
  );
}
