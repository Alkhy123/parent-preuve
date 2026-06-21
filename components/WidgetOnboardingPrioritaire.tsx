"use client";

// components/WidgetOnboardingPrioritaire.tsx
//
// Widget d'accueil prioritaire : invite a demarrer ou reprendre l'assistant
// de premiere utilisation tant qu'il n'est pas termine. LECTURE SEULE, aucune
// ecriture en base, aucun appel IA.
//
// Le statut est deduit de l'etat reel du dossier (lib/onboarding/etatOnboarding.ts).
// Rien ne s'affiche pendant le chargement ni quand l'assistant est termine.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  chargerStatutOnboarding,
  type StatutOnboarding,
} from "@/lib/onboarding/etatOnboarding";

export default function WidgetOnboardingPrioritaire() {
  // null = lecture en cours ; sinon le statut connu.
  const [statut, setStatut] = useState<StatutOnboarding | null>(null);

  useEffect(() => {
    let annule = false;
    chargerStatutOnboarding().then((s) => {
      if (!annule) setStatut(s);
    });
    return () => {
      annule = true;
    };
  }, []);

  // Pas de flash : rien tant qu'on ne sait pas, rien si l'assistant est termine.
  if (statut === null || statut === "termine") return null;

  const enCours = statut === "en_cours";
  const cta = enCours ? "Reprendre l'assistant" : "Commencer l'assistant";

  return (
    <div className="carte rounded-xl bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-navy">Assistant de démarrage</h2>
        <span className="badge badge-info">
          {enCours ? "À reprendre" : "À commencer"}
        </span>
      </div>

      <p className="mt-3 text-sm text-texte-doux">
        {enCours
          ? "Vous avez commencé à préparer votre dossier. Reprenez l'assistant pour compléter les étapes restantes."
          : "Un parcours guidé vous aide à organiser un dossier clair : vos informations, l'autre parent, les enfants, le jugement et le calendrier de garde."}
      </p>

      <Link
        href="/onboarding"
        className="btn btn-primaire mt-4 inline-flex w-full justify-center sm:w-auto"
      >
        {cta}
      </Link>
    </div>
  );
}
