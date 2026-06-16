"use client";

// components/BoutonCaptureRapide.tsx
//
// ⚠️ COMPOSANT VOLONTAIREMENT CONSERVÉ — NE PAS SUPPRIMER COMME "CODE MORT".
// Il n'est pas encore monté dans une page, mais c'est un choix assumé (décision du 07/06/2026) :
//   1) Il pourra être monté une seule fois dans le layout pour s'afficher sur TOUTES les pages.
//   2) Il est le point d'ancrage de la future CAPTURE PHOTO NATIVE mobile (React Native/Expo ou PWA).
//      Sur mobile, seule sa destination/action changera (ouvrir la caméra au lieu d'aller au journal) ;
//      sa place flottante et son rôle de "geste rapide" restent les mêmes.
//
// Rôle actuel (web) : bouton d'action flottant en bas à droite, menant au geste quotidien
// le plus fréquent — ajouter un fait au journal.

import Link from "next/link";

export default function BoutonCaptureRapide() {
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