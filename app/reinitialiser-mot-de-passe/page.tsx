"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ReinitialiserMotDePassePage() {
  // "attente" = on vérifie le lien ; "ok" = lien valide ; "invalide" = lien expiré/invalide
  const [etatLien, setEtatLien] = useState<"attente" | "ok" | "invalide">("attente");

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    // 1) Quand le lien de l'e-mail est valide, Supabase ouvre une session de
    //    récupération et déclenche cet événement.
    const { data: ecouteur } = supabase.auth.onAuthStateChange((evenement, session) => {
      if (evenement === "PASSWORD_RECOVERY" || session) {
        setEtatLien("ok");
      }
    });

    // 2) Au cas où la session existe déjà au chargement de la page.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setEtatLien("ok");
    });

    // 3) Si rien ne se passe au bout de quelques secondes, le lien est sans doute
    //    expiré, déjà utilisé, ou ouvert sur un autre appareil que celui de la demande.
    const minuterie = setTimeout(() => {
      setEtatLien((etat) => (etat === "attente" ? "invalide" : etat));
    }, 4000);

    return () => {
      ecouteur.subscription.unsubscribe();
      clearTimeout(minuterie);
    };
  }, []);

  async function enregistrer() {
    setMessage("");

    if (motDePasse.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setMessage("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setEnCours(true);
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnCours(false);

    if (error) {
      setMessage("Une erreur est survenue. Réessayez ou redemandez un lien.");
      return;
    }

    setSucces(true);
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-[#15233F]">
          Choisir un nouveau mot de passe
        </h1>

        {/* Cas 1 : on vérifie encore le lien */}
        {etatLien === "attente" && (
          <p className="mt-4 text-slate-600">Vérification du lien…</p>
        )}

        {/* Cas 2 : lien invalide ou expiré */}
        {etatLien === "invalide" && (
          <div className="mt-4 space-y-4">
            <p className="text-slate-700">
              Ce lien n&apos;est plus valide. Il a peut-être expiré, déjà été
              utilisé, ou été ouvert sur un autre appareil que celui de la demande.
            </p>
            <Link
              href="/mot-de-passe-oublie"
              className="inline-block rounded-lg bg-[#15233F] px-4 py-2 text-white hover:bg-[#1d2f52]"
            >
              Redemander un lien
            </Link>
          </div>
        )}

        {/* Cas 3 : lien valide -> formulaire */}
        {etatLien === "ok" && !succes && (
          <div className="mt-8 space-y-4">
            <div className="space-y-1">
              <label htmlFor="mdp" className="block text-sm font-medium text-[#15233F]">
                Nouveau mot de passe
              </label>
              <input
                id="mdp"
                type="password"
                placeholder="Au moins 8 caractères"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmation" className="block text-sm font-medium text-[#15233F]">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmation"
                type="password"
                placeholder="Saisissez-le à nouveau"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 bg-white"
              />
            </div>

            <button
              onClick={enregistrer}
              disabled={enCours}
              className="w-full rounded-lg bg-[#15233F] px-4 py-2 text-white hover:bg-[#1d2f52] disabled:opacity-60"
            >
              {enCours ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
            </button>

            {message && <p className="text-sm text-slate-700">{message}</p>}
          </div>
        )}

        {/* Cas 4 : succès */}
        {succes && (
          <div className="mt-8 space-y-4">
            <p className="text-[#2E6A4D] font-medium">
              Votre mot de passe a bien été modifié.
            </p>
            <Link
              href="/connexion"
              className="inline-block rounded-lg bg-[#15233F] px-4 py-2 text-white hover:bg-[#1d2f52]"
            >
              Aller à la connexion
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}