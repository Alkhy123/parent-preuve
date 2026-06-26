"use client";

// app/calendrier/avance/page.tsx
//
// Page calendrier AVANCÉ (bêta), conservée et accessible (ni supprimée, ni
// masquée, ni redirigée). Les options avancées (mercredi, exceptions, jours
// fériés, aperçu enrichi) sont rendues par le composant partagé
// OptionsAvanceesCalendrier, lui-même réutilisé en mode replié dans /calendrier.
// La règle de base (garde_regles) reste gérée dans /calendrier.

import Link from "next/link";
import AppShell from "@/components/app/AppShell";
import { Icon } from "@/components/apercu/icones";
import { useEnfantsProcedureActive } from "@/lib/useEnfantsProcedureActive";
import SelecteurEnfantCalendrier from "@/components/calendrier/SelecteurEnfantCalendrier";
import EtatCalendrierVide from "@/components/calendrier/EtatCalendrierVide";
import OptionsAvanceesCalendrier from "@/components/calendrier/OptionsAvanceesCalendrier";

export default function CalendrierAvancePage() {
  const { enfants, enfantId, setEnfantId, chargementEnfants } = useEnfantsProcedureActive();

  return (
    <AppShell
      activeModule="calendrier"
      title="Calendrier avancé (bêta)"
      subtitle="Aperçu enrichi : mercredi, exceptions, vacances et jours fériés."
      copilotContext="calendrier"
      actions={
        <Link
          href="/calendrier"
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition"
          style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
        >
          <Icon name="retour" className="h-4 w-4" />
          Retour au calendrier
        </Link>
      }
    >
      <div className="space-y-6">
        <div
          className="rounded-lg border p-3 text-sm"
          style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
        >
          <p className="font-medium" style={{ color: "var(--app-text)" }}>
            Calendrier avancé (bêta) — page temporaire
          </p>
          <p className="mt-1">
            La règle de base reste gérée dans{" "}
            <Link href="/calendrier" className="underline" style={{ color: "var(--app-primary)" }}>
              le calendrier de garde
            </Link>
            . Ici, le mercredi, les exceptions et les jours fériés sont enregistrés pour
            cet enfant. Aide à l&apos;organisation : à vérifier avec votre jugement ou vos
            documents.
          </p>
        </div>

        {chargementEnfants || enfants.length === 0 ? (
          <EtatCalendrierVide chargement={chargementEnfants} />
        ) : (
          <>
            <SelecteurEnfantCalendrier
              enfants={enfants}
              value={enfantId}
              onChange={setEnfantId}
            />

            <OptionsAvanceesCalendrier enfantId={enfantId} mode="page" />
          </>
        )}
      </div>
    </AppShell>
  );
}
