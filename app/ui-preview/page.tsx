// app/ui-preview/page.tsx
//
// Page de démonstration interne du système de confort d'utilisation et
// variantes d'interface. Non reliée à la navigation principale, accessible
// uniquement en dev/debug (404 en production). Ne modifie aucune donnée
// métier.

import { notFound } from "next/navigation";

import AppButtonLink from "@/components/app/AppButtonLink";
import AppShell from "@/components/app/AppShell";
import UiPreviewContent from "@/components/ui-preview/UiPreviewContent";

export default function UiPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <AppShell
      titre="Préférences d'interface (démo)"
      description="Page de contrôle non reliée à la navigation principale. Sert uniquement à vérifier la fondation du système de confort d'utilisation avant connexion aux écrans réels."
      actions={<AppButtonLink href="/">Retour accueil</AppButtonLink>}
    >
      <UiPreviewContent />
    </AppShell>
  );
}
