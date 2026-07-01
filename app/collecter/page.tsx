"use client";

// app/collecter/page.tsx
//
// Hub principal de collecte. Dispatche sur interfaceStyle :
//   board10      → CollecterBoard10 (cockpit action-first, mobile-first)
//   vue-ensemble → CollecterVueEnsemble (étapes détaillées, cartes complètes)
//
// comfortMode est géré à l'intérieur des composants via HomeGuidedHint.

import AppButtonLink from "@/components/app/AppButtonLink";
import AppShell from "@/components/app/AppShell";
import CollecterBoard10 from "@/components/hubs/CollecterBoard10";
import CollecterVueEnsemble from "@/components/hubs/CollecterVueEnsemble";
import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

export default function CollecterPage() {
  const { interfaceStyle } = useUiPreferences();

  if (interfaceStyle === "vue-ensemble") {
    return (
      <AppShell
        titre="Collecter"
        description="Ajoutez rapidement les faits, justificatifs, frais et échéances avant de les organiser."
        actions={
          <AppButtonLink href="/collecter/rapide">
            Lancer la collecte rapide
          </AppButtonLink>
        }
      >
        <CollecterVueEnsemble />
      </AppShell>
    );
  }

  // board10 (valeur par défaut)
  return (
    <AppShell
      titre="Collecter"
      description="Ajoutez rapidement ce qui compte."
    >
      <CollecterBoard10 />
    </AppShell>
  );
}
