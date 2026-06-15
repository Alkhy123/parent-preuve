"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [message, setMessage] = useState("");

  async function envoyerLien() {
    setMessage("");

    if (!email.trim()) {
      setMessage("Veuillez saisir votre adresse e-mail.");
      return;
    }

    setEnvoiEnCours(true);

    // On renvoie vers la page de réinitialisation (créée à l'étape suivante).
    // window.location.origin = http://localhost:3000 en local, ou l'URL Vercel en production.
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });

    setEnvoiEnCours(false);

    if (error) {
      setMessage("Une erreur est survenue. Réessayez dans un instant.");
      return;
    }

    // Message neutre volontaire : on ne révèle jamais si un compte existe ou non.
    setMessage(
      "Si un compte est associé à cette adresse, un e-mail de réinitialisation vient d'être envoyé. Pensez à vérifier vos spams."
    );
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-[#15233F]">Mot de passe oublié</h1>
        <p className="mt-2 text-slate-600">
          Saisissez l&apos;adresse e-mail de votre compte. Vous recevrez un lien
          pour choisir un nouveau mot de passe.
        </p>

        <div className="mt-8 space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-[#15233F]">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 bg-white"
            />
          </div>

          <button
            onClick={envoyerLien}
            disabled={envoiEnCours}
            className="w-full rounded-lg bg-[#15233F] px-4 py-2 text-white hover:bg-[#1d2f52] disabled:opacity-60"
          >
            {envoiEnCours ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
          </button>

          {message && <p className="text-sm text-slate-700">{message}</p>}

          <p className="pt-2 text-sm">
            <Link href="/connexion" className="text-[#15233F] underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}