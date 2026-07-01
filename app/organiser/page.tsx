"use client";

// app/organiser/page.tsx
//
// Hub principal d'organisation. Dispatche sur interfaceStyle :
//   board10      → OrganiserBoard10 (cockpit liens directs, compact)
//   vue-ensemble → OrganiserVueEnsemble (piliers + structure + classement)
//
// comfortMode est géré à l'intérieur des composants via HomeGuidedHint.

import AppButtonLink from "@/components/app/AppButtonLink";
import AppShell from "@/components/app/AppShell";
import OrganiserBoard10 from "@/components/hubs/OrganiserBoard10";
import OrganiserVueEnsemble from "@/components/hubs/OrganiserVueEnsemble";
import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

export default function OrganiserPage() {
  const { interfaceStyle } = useUiPreferences();

  if (interfaceStyle === "vue-ensemble") {
    return (
      <AppShell
        titre="Organiser"
        description="Classez les éléments collectés pour obtenir un dossier lisible, cohérent et exploitable."
        actions={
          <AppButtonLink href="/chronologie">Voir la chronologie</AppButtonLink>
        }
      >
        <OrganiserVueEnsemble />
      </AppShell>
    );
  }

  // board10 (valeur par défaut)
  return (
    <AppShell
      titre="Organiser"
      description="Classez et complétez les éléments de votre dossier."
    >
      <OrganiserBoard10 />
    </AppShell>
  );
}
