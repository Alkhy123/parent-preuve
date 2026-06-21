"use client";

// app/onboarding/page.tsx
//
// Page de l'assistant de premiere utilisation.
//  - Si l'assistant n'a pas ete demarre (ou a ete termine) : page d'invitation.
//  - Si l'assistant est en cours : le wizard reprend a l'etape memorisee.

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import InvitationOnboarding from "@/components/onboarding/InvitationOnboarding";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { lireProgression, demarrerProgression } from "@/lib/onboarding/progression";
import { PREMIERE_ETAPE } from "@/lib/onboarding/types";

export default function OnboardingPage() {
  // null = lecture de la progression en cours (localStorage cote client).
  const [enCours, setEnCours] = useState<boolean | null>(null);

  useEffect(() => {
    let annule = false;
    // Lecture differee (microtache) : evite tout setState synchrone en effet
    // et toute divergence d'hydratation entre serveur et navigateur.
    Promise.resolve().then(() => {
      if (annule) return;
      const p = lireProgression();
      setEnCours(p.demarre && !p.termine);
    });
    return () => {
      annule = true;
    };
  }, []);

  function demarrer() {
    demarrerProgression(PREMIERE_ETAPE);
    setEnCours(true);
  }

  return (
    <>
      <PageHeader
        eyebrow="Assistant de démarrage"
        title="Préparer votre dossier pas à pas"
        subtitle="Un parcours guidé pour organiser un dossier clair, daté et factuel."
      />
      <div className="bg-[#ECE7DC] text-[#1F2733]">
        <div className="mx-auto max-w-3xl px-6 py-10">
          {enCours === null ? (
            <p className="text-sm text-texte-doux">Chargement…</p>
          ) : enCours ? (
            <OnboardingWizard />
          ) : (
            <InvitationOnboarding onDemarrer={demarrer} />
          )}
        </div>
      </div>
    </>
  );
}
