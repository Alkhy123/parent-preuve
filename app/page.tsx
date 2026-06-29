"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AccueilPublic from "@/components/AccueilPublic";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppShell from "@/components/app/AppShell";
import ConfigurationDossier from "@/components/ConfigurationDossier";
import ProchainesEcheances from "@/components/ProchainesEcheances";
import TableauDeBord from "@/components/TableauDeBord";
import WidgetActionsPrioritaires from "@/components/WidgetActionsPrioritaires";
import WidgetCopiloteDossier from "@/components/WidgetCopiloteDossier";
import WidgetDossierPret from "@/components/WidgetDossierPret";
import WidgetOnboardingPrioritaire from "@/components/WidgetOnboardingPrioritaire";
import WidgetProchaineAction from "@/components/WidgetProchaineAction";
import WidgetSituationMois from "@/components/WidgetSituationMois";
import { supabase } from "@/lib/supabase";

const POLES_PRINCIPAUX = [
  {
    href: "/collecter",
    titre: "Collecter",
    accroche: "Ajouter rapidement un élément",
    description:
      "Notez un fait, ajoutez une preuve, un document, un frais, une pension ou une échéance.",
    cta: "Collecter un élément",
  },
  {
    href: "/organiser",
    titre: "Organiser",
    accroche: "Structurer votre dossier",
    description:
      "Classez vos éléments par enfant, procédure, date, thème et pièce associée.",
    cta: "Organiser mon dossier",
  },
  {
    href: "/exporter",
    titre: "Exporter",
    accroche: "Préparer un dossier clair",
    description:
      "Générez une chronologie, un courrier, une note de synthèse ou un export PDF.",
    cta: "Exporter mon dossier",
  },
];

const ACTIONS_RAPIDES = [
  { href: "/journal", label: "Noter un fait" },
  { href: "/frais", label: "Ajouter une dépense" },
  { href: "/preuves", label: "Ajouter une preuve" },
  { href: "/documents", label: "Importer un document" },
];

export default function Home() {
  const [connecte, setConnecte] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));

    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => setConnecte(!!session?.user),
    );

    return () => ecouteur.subscription.unsubscribe();
  }, []);

  if (connecte === null) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-slate-600">Chargement...</p>
      </main>
    );
  }

  if (!connecte) {
    return <AccueilPublic />;
  }

  return (
    <AppShell
      titre="Parent Preuve"
      description="Collecter, organiser et exporter les elements utiles de votre dossier."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/collecter" variant="secondary">Collecter</AppButtonLink>
          <AppButtonLink href="/organiser" variant="secondary">Organiser</AppButtonLink>
          <AppButtonLink href="/exporter" variant="secondary">Exporter</AppButtonLink>
        </div>
      }
    >
      <section className="rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Vous vivez les faits. Parent Preuve les organise.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Commencez par collecter ce qui se passe, organisez ensuite vos
          elements par dossier, enfant et procedure, puis exportez une
          chronologie, un courrier ou un dossier clair.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {POLES_PRINCIPAUX.map((pole) => (
          <Link
            key={pole.href}
            href={pole.href}
            className="carte group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2A24C]/70 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C2A24C]">
              {pole.titre}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#15233F]">
              {pole.accroche}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {pole.description}
            </p>
            <p className="mt-4 text-sm font-semibold text-[#15233F] transition group-hover:text-[#8A5A12]">
              {pole.cta} →
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <WidgetOnboardingPrioritaire />
      </section>

      <section className="mt-8">
        <WidgetProchaineAction />
      </section>

      <section className="mt-8">
        <WidgetActionsPrioritaires />
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#15233F]">
          Saisie rapide
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Ajoutez un élément du quotidien sans attendre. Vous pourrez le classer
          plus précisément ensuite.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {ACTIONS_RAPIDES.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-[#15233F] transition hover:border-[#C2A24C]/70 hover:bg-[#C2A24C]/10"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <WidgetSituationMois />
      </section>

      <section className="mt-8">
        <WidgetDossierPret />
      </section>

      <section className="mt-8">
        <ProchainesEcheances />
      </section>

      <section className="mt-8">
        <TableauDeBord />
      </section>

      <section className="mt-8">
        <WidgetCopiloteDossier />
      </section>

      <section className="mt-8">
        <ConfigurationDossier />
      </section>
    </AppShell>
  );
}
