"use client";

// components/onboarding/RetourAssistant.tsx
//
// Bandeau affiche sur les pages d'import/analyse du jugement UNIQUEMENT quand
// l'utilisateur y est arrive depuis l'assistant de premiere utilisation
// (parametre ?retour=assistant). Il permet de revenir directement a l'etape
// des regles de l'assistant, sans repasser par l'accueil.
//
// Lecture du parametre via window.location.search (cote client) pour eviter
// d'imposer une frontiere <Suspense> avec useSearchParams.

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RetourAssistant({
  variante = "banniere",
}: {
  // "banniere" : encart explicatif (haut de page).
  // "pied" : simple bouton de continuation (bas de page, apres les regles).
  variante?: "banniere" | "pied";
} = {}) {
  const [depuisAssistant, setDepuisAssistant] = useState(false);

  useEffect(() => {
    let annule = false;
    Promise.resolve().then(() => {
      if (annule) return;
      const params = new URLSearchParams(window.location.search);
      setDepuisAssistant(params.get("retour") === "assistant");
    });
    return () => {
      annule = true;
    };
  }, []);

  if (!depuisAssistant) return null;

  const lien = (
    <Link
      href="/onboarding?etape=validation-regles"
      className="btn justify-center whitespace-nowrap bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
    >
      Continuer dans l&apos;assistant
    </Link>
  );

  if (variante === "pied") {
    return (
      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#1F2733]">
          Vos règles sont en place ? Revenez à l&apos;assistant pour continuer votre
          parcours.
        </p>
        {lien}
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#1F2733]">
        Vous préparez votre dossier avec l&apos;assistant de démarrage. Une fois vos
        règles établies, revenez à l&apos;assistant pour continuer.
      </p>
      {lien}
    </div>
  );
}
