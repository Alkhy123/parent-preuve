"use client";

// components/ui-preview/UiPreviewContent.tsx
//
// Contenu interactif de la page de démonstration /ui-preview : permet de
// choisir comfortMode et interfaceStyle, et affiche un aperçu simplifié du
// résultat. Aucune donnée métier n'est lue ni écrite ici.

import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import ComfortModeSelector from "@/components/ui-preferences/ComfortModeSelector";
import ComfortSuggestion from "@/components/ui-preferences/ComfortSuggestion";
import InterfaceStyleSelector from "@/components/ui-preferences/InterfaceStyleSelector";
import TooltipCoachmark from "@/components/ui-preferences/TooltipCoachmark";
import Board10PreviewSkeleton from "@/components/ui-preview/Board10PreviewSkeleton";
import OverviewPreviewSkeleton from "@/components/ui-preview/OverviewPreviewSkeleton";
import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

export default function UiPreviewContent() {
  const { comfortMode, interfaceStyle } = useUiPreferences();

  return (
    <div className="flex flex-col gap-6">
      <AppNotice titre="Page de démonstration interne">
        <p>
          Cette page ne modifie aucune donnée du dossier. Elle sert à valider
          la fondation technique du système de confort d&apos;utilisation
          (mode d&apos;accompagnement + style d&apos;interface), avant toute
          déclinaison sur les écrans réels.
        </p>
      </AppNotice>

      <AppCard
        titre="Mode d'accompagnement"
        description="Réglage indépendant du style d'interface choisi ci-dessous."
      >
        <ComfortModeSelector />
        <TooltipCoachmark>
          Astuce : en mode accompagné, ce type d&apos;infobulle s&apos;affiche
          automatiquement pour vous guider.
        </TooltipCoachmark>
      </AppCard>

      <AppCard
        titre="Style d'interface"
        description="Disponible aussi bien en mode accompagné qu'en mode confort."
      >
        <InterfaceStyleSelector />
      </AppCard>

      <AppCard
        titre="Aperçu simplifié"
        description={`Combinaison actuelle : ${comfortMode} + ${interfaceStyle}.`}
      >
        {interfaceStyle === "board10" ? (
          <Board10PreviewSkeleton />
        ) : (
          <OverviewPreviewSkeleton />
        )}
      </AppCard>

      <AppCard titre="Suggestion de mode confort (squelette)">
        <ComfortSuggestion />
      </AppCard>
    </div>
  );
}
