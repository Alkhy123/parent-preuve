"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
        subtitle="Votre tableau de bord pour organiser un dossier clair, daté et factuel."
      />
      <div className="bg-[#ECE7DC] text-[#1F2733]">
        <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
          {/* 1. Plan d'action central : "Que faire maintenant ?" */}
          <WidgetActionsPrioritaires />

          {/* 2. Saisie rapide : les trois gestes du quotidien, visibles d'emblée. */}
          <section aria-label="Saisie rapide">
            <h2 className="font-display text-lg text-[#15233F]">Saisie rapide</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {ACTIONS_RAPIDES.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-center rounded-xl bg-[#15233F] px-4 py-3 text-center text-sm font-medium text-[#F8F6F1] transition hover:bg-[#0F1A2E]"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </section>

          {/* 3. Situation du mois (pension). */}
          <WidgetSituationMois />

          {/* 4. Dossier prêt à l'export (bloquants / avertissements). */}
          <WidgetDossierPret />

          {/* 5. Échéances de garde à venir. */}
          <ProchainesEcheances />

          {/* 6. Résumé chiffré global. */}
          <TableauDeBord />

          {/* 7. Aide à l'organisation (copilote), discrète. */}
          <WidgetCopiloteDossier />

          {/* 8. Configuration du dossier. */}
          <ConfigurationDossier />
        </div>
      </div>
    </>
  );
}

// Trois gestes du quotidien, accessibles dès l'accueil (en plus du bouton
// flottant de capture rapide monté globalement dans le layout).
const ACTIONS_RAPIDES = [
  { href: "/journal", label: "Noter un fait" },
  { href: "/frais", label: "Ajouter une dépense" },
  { href: "/preuves", label: "Ajouter une preuve" },
];
