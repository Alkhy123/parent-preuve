"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AppShell from "@/components/app/AppShell";
import AppButtonLink from "@/components/app/AppButtonLink";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [utilisateur, setUtilisateur] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  // Au chargement : qui est connecté ? Et on écoute les changements.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUtilisateur(data.user));

    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => setUtilisateur(session?.user ?? null)
    );

    return () => ecouteur.subscription.unsubscribe();
  }, []);

  async function sInscrire() {
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password: motDePasse });
    setMessage(error ? "Erreur : " + error.message : "Compte créé ! Connectez-vous.");
  }

  async function seConnecter() {
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    if (error) setMessage("Erreur : " + error.message);
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
  }

  // Vue quand on EST connecté
  if (utilisateur) {
    return (
      <AppShell
        titre="Vous etes connecte"
        description="Session active sur ce navigateur."
      >
        <div className="mx-auto max-w-md px-6 py-10 text-center">
          <p className="text-slate-600">{utilisateur.email}</p>
          <button
            onClick={seDeconnecter}
            className="mt-6 rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
          >
            Se deconnecter
          </button>
        </div>
      </AppShell>
    );
  }

  // Vue quand on n'est PAS connecté
  return (
    <AppShell
      titre="Connexion"
      description="Acceder a votre espace Parent Preuve."
      actions={
        <AppButtonLink href="/mot-de-passe-oublie" variant="secondary">
          Mot de passe oublie ?
        </AppButtonLink>
      }
    >
      <div className="mx-auto max-w-md px-6 py-8">
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />

          <div className="flex gap-3">
            <button
              onClick={seConnecter}
              className="flex-1 rounded-lg bg-[#15233F] px-4 py-2 text-white hover:bg-[#1d2f52]"
            >
              Se connecter
            </button>
            <button
              onClick={sInscrire}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              S&apos;inscrire
            </button>
          </div>

          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>
      </div>
    </AppShell>
  );
}