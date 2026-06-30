"use client";

// components/onboarding/EtapeValidationRegles.tsx
//
// Etape 6 : relecture et validation des regles de la procedure active.
// On REUTILISE les composants existants (ReglePension, RegleFrais, RegleDVH,
// RegleDecision) : chacun lit/ecrit sa propre regle pour la procedure active et
// gere sa validation. Rien n'est valide sans confirmation explicite.

import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import ReglePension from "@/components/ReglePension";
import RegleFrais from "@/components/RegleFrais";
import RegleDVH from "@/components/RegleDVH";
import RegleDecision from "@/components/RegleDecision";

export default function EtapeValidationRegles({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  return (
    <div>
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 text-sm text-[var(--app-text)]">
        Relisez chaque règle de la procédure active et validez-la. Si une règle a été
        proposée à partir de votre jugement, vérifiez qu&apos;elle correspond bien
        avant de la valider. Rien n&apos;est enregistré comme validé sans votre
        confirmation.
      </div>

      <div className="mt-4 space-y-4">
        <ReglePension />
        <RegleFrais />
        <RegleDVH />
        <RegleDecision />
      </div>

      <PiedEtape
        onPrecedent={onPrecedent}
        estPremiere={estPremiere}
        onContinuer={onContinuer}
        libelleContinuer={estDerniere ? "Accéder à mon tableau de bord" : "Continuer"}
      />
    </div>
  );
}
