"use client";

// app/onboarding/page.tsx
//
// Page de l'assistant de premiere utilisation.
//  - Si l'assistant n'a pas ete demarre (ou a ete termine) : page d'invitation.
//  - Si l'assistant est en cours : le wizard reprend a l'etape memorisee.

import { useEffect, useState } from "react";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppShell from "@/components/app/AppShell";
import InvitationOnboarding from "@/components/onboarding/InvitationOnboarding";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import {
  lireProgression,
  demarrerProgression,
  definirEtapeCourante,
} from "@/lib/onboarding/progression";
import {
  PREMIERE_ETAPE,
  indexEtape,
  type EtapeOnboarding,
} from "@/lib/onboarding/types";

export default function OnboardingPage() {
  // null = lecture de la progression en cours (localStorage cote client).
  const [enCours, setEnCours] = useState<boolean | null>(null);

  useEffect(() => {
    let annule = false;
    // Lecture differee (microtache) : evite tout setState synchrone en effet
    // et toute divergence d'hydratation entre serveur et navigateur.
    Promise.resolve().then(() => {
      if (annule) return;
      // Retour depuis les modules d'import (?etape=...) : on reprend l'assistant
      // directement a l'etape demandee.
      const params = new URLSearchParams(window.location.search);
      const etapeParam = params.get("etape") as EtapeOnboarding | null;
      if (etapeParam && indexEtape(etapeParam) >= 0) {
        definirEtapeCourante(etapeParam);
        setEnCours(true);
        return;
      }
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
    <AppShell
      titre="Assistant de demarrage"
      description="Configurer les premiers elements du dossier avant d utiliser les modules."
      actions={
        <AppButtonLink href="/" variant="secondary">
          Retour accueil
        </AppButtonLink>
      }
    >
      <div className="mx-auto max-w-3xl px-6 py-10">
        {enCours === null ? (
          <p className="text-sm text-texte-doux">Chargement...</p>
        ) : enCours ? (
          <OnboardingWizard />
        ) : (
          <InvitationOnboarding onDemarrer={demarrer} />
        )}
      </div>
    </AppShell>
  );
}
