"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProchainesEcheances from "@/components/ProchainesEcheances";
import TableauDeBord from "@/components/TableauDeBord";
import PageHeader from "@/components/PageHeader";
import AccueilPublic from "@/components/AccueilPublic";
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
  const actions = [
    { libelle: "Noter un fait", href: "/journal" },
    { libelle: "Capturer une preuve photo", href: "/preuves/nouvelle" },
    { libelle: "Courrier", href: "/courriers" },
    { libelle: "Export PDF", href: "/export" },
  ];

  const reglages = [
    { libelle: "Procédure (autre parent)", href: "/procedure" },
    { libelle: "Enfants", href: "/enfants" },
    { libelle: "Le jugement", href: "/dossier/importer-pdf" },
  ];

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
            <TableauDeBord />
          </div>

          <div className="mt-10">
            <h2 className="font-display text-xl text-[#15233F]">Actions rapides</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="carte rounded-xl bg-white px-4 py-4 text-center text-sm font-medium text-[#15233F] transition hover:bg-[#15233F]/5"
                >
                  {action.libelle}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <ProchainesEcheances />
          </div>

          <div className="mt-10">
            <h2 className="font-display text-xl text-[#15233F]">Configuration du dossier</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {reglages.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="carte rounded-xl bg-white px-4 py-4 text-center text-sm font-medium text-[#15233F] transition hover:bg-[#15233F]/5"
                >
                  {r.libelle}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}