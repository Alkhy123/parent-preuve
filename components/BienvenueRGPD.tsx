"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Version de la politique. Si la politique change réellement un jour, incrémente cette
// valeur (ex. "2") : la boîte sera redemandée à tous, et l'acceptation sera réenregistrée.
const VERSION_POLITIQUE = "1";

export default function BienvenueRGPD() {
  const [userId, setUserId] = useState<string | null>(null);
  const [doitAfficher, setDoitAfficher] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  // Suivre l'utilisateur connecté.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setUserId(session?.user?.id ?? null)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  // A-t-il déjà accepté la version courante ?
  useEffect(() => {
    if (!userId) {
      setDoitAfficher(false);
      return;
    }
    let actif = true;
    supabase
      .from("acceptation_politique")
      .select("id")
      .eq("version", VERSION_POLITIQUE)
      .limit(1)
      .then(({ data }) => {
        if (actif) setDoitAfficher((data?.length ?? 0) === 0);
      });
    return () => {
      actif = false;
    };
  }, [userId]);

  async function accepter() {
    setEnregistrement(true);
    const { error } = await supabase
      .from("acceptation_politique")
      .insert({ version: VERSION_POLITIQUE });
    if (!error) {
      setDoitAfficher(false);
    }
    setEnregistrement(false);
  }

  if (!doitAfficher) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="carte w-full max-w-md rounded-xl bg-white p-6 text-[#1F2733]">
        <h2 className="font-display text-xl text-[#15233F]">Bienvenue sur Parent Preuve</h2>

        <p className="mt-3 text-sm">
          Parent Preuve vous aide à organiser un dossier clair, daté et factuel.
          L&apos;application ne fournit pas de conseil juridique et ne remplace pas un
          professionnel du droit.
        </p>
        <p className="mt-2 text-sm">
          Les fonctions d&apos;intelligence artificielle sont optionnelles : elles vous seront
          proposées avec un consentement séparé, au moment où vous les utilisez.
        </p>
        <p className="mt-3 text-sm">
          Avant de continuer, merci de prendre connaissance de notre{" "}
          <Link
            href="/confidentialite"
            target="_blank"
            className="text-[#15233F] underline"
          >
            politique de confidentialité
          </Link>{" "}
          (s&apos;ouvre dans un nouvel onglet).
        </p>

        <button
          onClick={accepter}
          disabled={enregistrement}
          className="mt-5 w-full rounded-lg bg-[#15233F] px-4 py-2.5 text-sm font-medium text-[#F8F6F1] transition hover:bg-[#1d3057] disabled:opacity-50"
        >
          {enregistrement ? "Enregistrement…" : "J'ai lu et j'accepte"}
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-2 w-full text-center text-xs text-[#1F2733]/60 underline"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}