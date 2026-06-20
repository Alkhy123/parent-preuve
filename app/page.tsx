"use client";

import { useEffect, useState } from "react";
import ProchainesEcheances from "@/components/ProchainesEcheances";
import TableauDeBord from "@/components/TableauDeBord";
import PageHeader from "@/components/PageHeader";
import AccueilPublic from "@/components/AccueilPublic";
import ConfigurationDossier from "@/components/ConfigurationDossier";
import WidgetDossierPret from "@/components/WidgetDossierPret";
import WidgetActionsPrioritaires from "@/components/WidgetActionsPrioritaires";
import WidgetCopiloteDossier from "@/components/WidgetCopiloteDossier";
import WidgetSituationMois from "@/components/WidgetSituationMois";
import { supabase } from "@/lib/supabase";

export default function Home() {
  // null = vérification en cours ; true/false = état de connexion connu.
  const [connecte, setConnecte] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnecte(!!session?.user)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  // Pendant la vérification : placeholder neutre (évite tout clignotement).
  if (connecte === null) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-[#1F2733]">Chargement…</div>;
  }

  // Visiteur non connecté : page de présentation.
  if (!connecte) {
    return <AccueilPublic />;
  }

  // Utilisateur connecté : tableau de bord (contenu d'origine).
  return (
    <>
      <PageHeader
        eyebrow="Accueil"
        title="Parent Preuve"
        subtitle="Centralisez frais, pension, justificatifs et événements pour préparer un dossier clair, daté et factuel."
      />
      <div className="bg-[#ECE7DC] text-[#1F2733]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="mt-10">
            <WidgetCopiloteDossier />
          </div>
          <div className="mt-10">
            <WidgetActionsPrioritaires />
          </div>

          <div className="mt-10">
            <WidgetSituationMois />
          </div>

          <div className="mt-10">
            <TableauDeBord />
          </div>

          <div className="mt-10">
            <WidgetDossierPret />
          </div>

          <div className="mt-10">
            <ProchainesEcheances />
          </div>

          <div className="mt-10">
            <ConfigurationDossier />
          </div>
        </div>
      </div>
    </>
  );
}
