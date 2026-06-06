"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

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
      <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#15233F]">Vous êtes connecté</h1>
          <p className="mt-2 text-slate-600">{utilisateur.email}</p>
          <button
            onClick={seDeconnecter}
            className="mt-6 rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
          >
            Se déconnecter
          </button>
        </div>
      </main>
    );
  }

  // Vue quand on n'est PAS connecté
  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-[#15233F]">Connexion</h1>
        <p className="mt-2 text-slate-600">Accédez à votre espace Parent Preuve.</p>

        <div className="mt-8 space-y-4">
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
    </main>
  );
}