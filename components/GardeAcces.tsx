"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Pages accessibles SANS connexion. Tout le reste exige d'être connecté.
// (Ajoute ici une page si tu en crées une nouvelle qui doit rester publique.)
const CHEMINS_PUBLICS = [
  "/",
  "/connexion",
  "/confidentialite",
  "/mentions-legales",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
];

function estPublic(chemin: string) {
  return CHEMINS_PUBLICS.includes(chemin);
}

export default function GardeAcces({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // null = on ne sait pas encore ; true/false = état de connexion connu.
  const [connecte, setConnecte] = useState<boolean | null>(null);

  // On suit l'état de connexion une seule fois (et on réagit aux connexions/déconnexions).
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnecte(!!session?.user)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  // Page privée + utilisateur non connecté -> redirection vers la connexion.
  useEffect(() => {
    if (connecte === false && !estPublic(pathname)) {
      router.replace("/connexion");
    }
  }, [connecte, pathname, router]);

  // Page publique : toujours affichée.
  if (estPublic(pathname)) {
    return <>{children}</>;
  }

  // Page privée : on attend de connaître l'état de connexion.
  if (connecte === null) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-[#1F2733]">Chargement…</div>;
  }

  // Page privée + non connecté : la redirection est en cours.
  if (!connecte) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-[#1F2733]">Redirection…</div>;
  }

  // Page privée + connecté.
  return <>{children}</>;
}