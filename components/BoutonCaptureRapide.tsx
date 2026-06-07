"use client";

// components/BoutonCaptureRapide.tsx
//
// Bouton d'action flottant pour la capture rapide.
// Toujours visible en bas à droite, il mène au geste quotidien le plus fréquent :
// ajouter un fait au journal. Conçu pour être réutilisable (on pourra plus tard
// le monter dans le layout pour l'afficher sur toutes les pages).

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