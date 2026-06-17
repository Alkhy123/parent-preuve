"use client";

// components/BoutonCaptureRapide.tsx
//
// ⚠️ COMPOSANT VOLONTAIREMENT CONSERVÉ — NE PAS SUPPRIMER COMME "CODE MORT".
// Monté une seule fois dans app/layout.tsx, il flotte sur toutes les pages du dossier.
// Il est le point d'ancrage de la future CAPTURE PHOTO NATIVE mobile (React Native/Expo
// ou PWA) : sur mobile, seule sa destination/action changera (ouvrir la caméra) ; sa place
// flottante et son rôle de "geste rapide" restent les mêmes.
//
// Rôle actuel (web) : bouton d'action flottant en bas à droite menant au geste quotidien
// le plus fréquent — ajouter un fait au journal.
//
// Il se masque automatiquement sur les pages publiques (accueil, connexion, mots de passe,
// pages légales) : un parent déconnecté ne doit pas voir un bouton "ajouter un fait".

import Link from "next/link";
import { usePathname } from "next/navigation";

// Pages où le bouton ne doit PAS apparaître.
const ROUTES_PUBLIQUES = [
  "/",
  "/connexion",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/mentions-legales",
  "/confidentialite",
];

export default function BoutonCaptureRapide() {
  const pathname = usePathname();

  if (ROUTES_PUBLIQUES.includes(pathname)) {
    return null;
  }

  return (
    <Link
      href="/journal"
      aria-label="Ajouter rapidement un fait au journal"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#C2A24C] text-3xl font-medium text-[#15233F] shadow-lg transition hover:bg-[#d4b25a] focus:outline-none focus:ring-2 focus:ring-[#C2A24C] focus:ring-offset-2"
    >
      <span aria-hidden="true" className="-mt-1">+</span>
    </Link>
  );
}
