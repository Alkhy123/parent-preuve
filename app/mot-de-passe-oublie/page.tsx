"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/app/AppShell";
import AppButtonLink from "@/components/app/AppButtonLink";

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
    <AppShell
      titre="Mot de passe oublie"
      description="Recevoir un lien pour choisir un nouveau mot de passe."
      actions={
        <AppButtonLink href="/connexion" variant="secondary">
          Retour connexion
        </AppButtonLink>
      }
    >
      <div className="mx-auto max-w-md px-6 py-8">
        <div className="space-y-4">
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
            {envoiEnCours ? "Envoi en cours..." : "Envoyer le lien de reinitialisation"}
          </button>

          {message && <p className="text-sm text-slate-700">{message}</p>}
        </div>
      </div>
    </AppShell>
  );
}