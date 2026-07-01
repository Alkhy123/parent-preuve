"use client";

import { useEffect, useState } from "react";

import AccueilPublic from "@/components/AccueilPublic";
import AppShell from "@/components/app/AppShell";
import HomeBoard10 from "@/components/home/HomeBoard10";
import HomeVueEnsemble from "@/components/home/HomeVueEnsemble";
import { supabase } from "@/lib/supabase";
import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

export default function Home() {
  const [connecte, setConnecte] = useState<boolean | null>(null);
  const { interfaceStyle } = useUiPreferences();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));

    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => setConnecte(!!session?.user),
    );

    return () => ecouteur.subscription.unsubscribe();
  }, []);

  // Chargement : neutre, sans flash.
  if (connecte === null) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-slate-600">Chargement...</p>
      </main>
    );
  }

  // Non connecté : page publique de présentation.
  if (!connecte) {
    return <AccueilPublic />;
  }

  // ── Connecté : variante selon interfaceStyle ──────────────────────────────

  if (interfaceStyle === "vue-ensemble") {
    return (
      <AppShell
        titre="Votre dossier"
        description="Vue d'ensemble de votre situation."
      >
        <HomeVueEnsemble />
      </AppShell>
    );
  }

  // interfaceStyle === "board10" (valeur par défaut)
  return (
    <AppShell
      titre="Parent Preuve"
      description="Ce qu'il faut faire maintenant dans votre dossier."
    >
      <HomeBoard10 />
    </AppShell>
  );
}
