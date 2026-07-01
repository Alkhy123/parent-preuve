"use client";

// app/exporter/page.tsx
//
// Hub principal d'export. Dispatche sur interfaceStyle :
//   board10      → ExporterBoard10 (hero + grille modèles + état dossier + CTA)
//   vue-ensemble → ExporterVueEnsemble (piliers + sections détaillées)
//
// comfortMode est géré à l'intérieur des composants via HomeGuidedHint.

import AppButtonLink from "@/components/app/AppButtonLink";
import AppShell from "@/components/app/AppShell";
import ExporterBoard10 from "@/components/hubs/ExporterBoard10";
import ExporterVueEnsemble from "@/components/hubs/ExporterVueEnsemble";
import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

export default function ExporterPage() {
  const { interfaceStyle } = useUiPreferences();

  if (interfaceStyle === "vue-ensemble") {
    return (
      <AppShell
        titre="Exporter"
        description="Transformez les éléments collectés et organisés en documents sobres, datés et exploitables."
        actions={
          <AppButtonLink href="/exporter/checklist">
            Ouvrir la checklist
          </AppButtonLink>
        }
      >
        <ExporterVueEnsemble />
      </AppShell>
    );
  }

  // board10 (valeur par défaut)
  return (
    <AppShell
      titre="Exporter"
      description="Préparez un document clair à partir de votre dossier."
      actions={
        <AppButtonLink href="/exporter/checklist">
          Ouvrir la checklist
        </AppButtonLink>
      }
    >
      <ExporterBoard10 />
    </AppShell>
  );
}
