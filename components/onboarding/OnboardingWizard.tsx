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

  const def = ETAPES_ONBOARDING[idx];

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
      {/* Barre de progression : retour libre vers une etape deja atteinte. */}
      <ol className="flex flex-wrap gap-x-2 gap-y-2 text-xs">
        {ETAPES_ONBOARDING.map((e, i) => {
          const fait = progression.completees.includes(e.id);
          const actif = e.id === courante;
          const accessible = i <= idx || fait;
          return (
            <li key={e.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => accessible && allerA(e.id)}
                disabled={!accessible}
                className={[
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition",
                  actif
                    ? "bg-[var(--app-text)] text-[var(--app-surface)]"
                    : fait
                      ? "text-vert"
                      : "text-[var(--app-text-muted)]",
                  accessible ? "hover:bg-black/5" : "cursor-default opacity-60",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium",
                    actif
                      ? "bg-[var(--app-surface)] text-navy"
                      : fait
                        ? "bg-emerald-100 text-vert"
                        : "bg-slate-100 text-[var(--app-text-muted)]",
                  ].join(" ")}
                >
                  {fait && !actif ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{e.titreCourt}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <h2 className="mt-6 font-display text-xl text-navy">{def.titre}</h2>
      <p className="mt-1 text-xs text-[var(--app-text-muted)]">
        Étape {idx + 1} sur {ETAPES_ONBOARDING.length}
      </p>

      <div className="mt-4">{corps()}</div>
    </div>
  );
}
