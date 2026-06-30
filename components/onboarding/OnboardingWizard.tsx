"use client";

// components/onboarding/OnboardingWizard.tsx
//
// Orchestrateur de l'assistant de premiere utilisation. Affiche la barre de
// progression et l'etape courante. La POSITION est memorisee en localStorage
// (lib/onboarding/progression) ; les DONNEES sont enregistrees dans les vraies
// tables a chaque etape.
//
// Sous-bloc 3a : etapes 1 a 4 reelles ; etapes 5 a 8 en attente (sous-blocs
// suivants), affichees via un placeholder neutre et non bloquant.

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ETAPES_ONBOARDING,
  indexEtape,
  type EtapeOnboarding,
} from "@/lib/onboarding/types";
import {
  lireProgression,
  definirEtapeCourante,
  marquerEtapeCompletee,
  terminerProgression,
  type Progression,
} from "@/lib/onboarding/progression";
import { type EtapeProps } from "@/components/onboarding/PiedEtape";
import AssistantShell from "@/components/onboarding/AssistantShell";
import EtapeVosInformations from "@/components/onboarding/EtapeVosInformations";
import EtapeProcedure from "@/components/onboarding/EtapeProcedure";
import EtapeAutreParent from "@/components/onboarding/EtapeAutreParent";
import EtapeEnfants from "@/components/onboarding/EtapeEnfants";
import EtapeJugement from "@/components/onboarding/EtapeJugement";
import EtapeValidationRegles from "@/components/onboarding/EtapeValidationRegles";
import EtapeCalendrier from "@/components/onboarding/EtapeCalendrier";
import EtapeResumeFinal from "@/components/onboarding/EtapeResumeFinal";

export default function OnboardingWizard() {
  const router = useRouter();
  const [progression, setProgression] = useState<Progression>(() =>
    lireProgression()
  );

  const courante = progression.etapeCourante;
  const idx = indexEtape(courante);
  const estPremiere = idx <= 0;
  const estDerniere = idx === ETAPES_ONBOARDING.length - 1;

  function allerA(etape: EtapeOnboarding) {
    setProgression(definirEtapeCourante(etape));
  }

  function continuer() {
    marquerEtapeCompletee(courante);
    if (estDerniere) {
      terminerProgression();
      router.push("/");
      return;
    }
    const suivante = ETAPES_ONBOARDING[idx + 1].id;
    setProgression(definirEtapeCourante(suivante));
  }

  function precedent() {
    if (estPremiere) return;
    allerA(ETAPES_ONBOARDING[idx - 1].id);
  }

  const propsEtape: EtapeProps = {
    onContinuer: continuer,
    onPrecedent: precedent,
    estPremiere,
    estDerniere,
  };

  function corps() {
    switch (courante) {
      case "vos-informations":
        return <EtapeVosInformations {...propsEtape} />;
      case "procedure":
        return <EtapeProcedure {...propsEtape} />;
      case "autre-parent":
        return <EtapeAutreParent {...propsEtape} />;
      case "enfants":
        return <EtapeEnfants {...propsEtape} />;
      case "jugement":
        return <EtapeJugement {...propsEtape} />;
      case "validation-regles":
        return <EtapeValidationRegles {...propsEtape} />;
      case "calendrier":
        return <EtapeCalendrier {...propsEtape} />;
      case "resume":
        return <EtapeResumeFinal {...propsEtape} />;
      default:
        return null;
    }
  }

  return (
    <AssistantShell
      etapes={ETAPES_ONBOARDING}
      idx={idx}
      courante={courante}
      completees={progression.completees}
      onAller={allerA}
    >
      {corps()}
    </AssistantShell>
  );
}
