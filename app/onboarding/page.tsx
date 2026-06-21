"use client";

// app/onboarding/page.tsx
//
// Page d'invitation a l'assistant de premiere utilisation. Enveloppe seulement
// (le wizard complet arrive dans un bloc ulterieur). Non bloquante.

import PageHeader from "@/components/PageHeader";
import InvitationOnboarding from "@/components/onboarding/InvitationOnboarding";

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Assistant de démarrage"
        title="Préparer votre dossier pas à pas"
        subtitle="Un parcours guidé pour organiser un dossier clair, daté et factuel."
      />
      <div className="bg-[#ECE7DC] text-[#1F2733]">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <InvitationOnboarding />
        </div>
      </div>
    </>
  );
}
