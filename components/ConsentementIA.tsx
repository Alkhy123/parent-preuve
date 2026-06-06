"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Cette "porte" enveloppe une fonctionnalité IA.
// - Tant que l'utilisateur n'a pas consenti : on affiche l'explication + le bouton.
// - Une fois le consentement donné : on laisse passer (on affiche `children`).
export default function ConsentementIA({
  fonctionnalite,
  children,
}: {
  fonctionnalite: string;
  children: React.ReactNode;
}) {
  const [chargement, setChargement] = useState(true);
  const [consenti, setConsenti] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Au montage : on lit l'état du consentement dans consentements_ia.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("consentements_ia")
        .select("id")
        .eq("fonctionnalite", fonctionnalite)
        .limit(1)
        .maybeSingle();
      if (error) setErreur(error.message);
      else setConsenti(data !== null);
      setChargement(false);
    })();
  }, [fonctionnalite]);

  // Au clic sur "J'accepte" : on enregistre dans consentements_ia.
  async function accepter() {
    setEnCours(true);
    setErreur(null);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setErreur("Session expirée, reconnecte-toi.");
      setEnCours(false);
      return;
    }

    const { error } = await supabase
      .from("consentements_ia")
      .insert({ user_id: userId, fonctionnalite });

    if (error) setErreur(error.message);
    else setConsenti(true);
    setEnCours(false);
  }

  if (chargement) {
    return <p className="text-[#1F2733]/60">Chargement…</p>;
  }

  // Consentement donné → on affiche la fonctionnalité IA.
  if (consenti) {
    return <>{children}</>;
  }

  // Sinon → l'écran de consentement.
  return (
    <div className="rounded-lg border border-[#C2A24C]/40 bg-white p-6 text-[#1F2733]">
      <p className="font-display text-xl text-[#15233F]">
        Avant d'utiliser l'assistant
      </p>

      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        <p>
          Pour fonctionner, l'assistant envoie le texte que vous saisissez à un
          prestataire d'intelligence artificielle : <strong>Mistral AI</strong>,
          société française, dont les serveurs sont situés dans l'Union européenne.
        </p>
        <p>
          Seul le <strong>texte que vous écrivez</strong> est transmis. Aucune autre
          donnée de votre dossier n'est envoyée (ni jugement, ni information de santé,
          ni pièce jointe). Ce texte n'est <strong>pas utilisé pour entraîner</strong>{" "}
          les modèles du prestataire.
        </p>
        <p>
          L'assistant est une <strong>aide à la rédaction</strong>. Il ne fournit
          aucun conseil juridique. Vous restez responsable du contenu : relisez et
          corrigez toujours le résultat avant de l'utiliser.
        </p>
        <p className="text-[#1F2733]/70">
          Vous pourrez retirer votre accord à tout moment depuis la page « Mon dossier ».
        </p>
      </div>

      {erreur && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreur}
        </p>
      )}

      <button
        onClick={accepter}
        disabled={enCours}
        className="mt-5 rounded-md bg-[#15233F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#15233F]/90 disabled:opacity-50"
      >
        {enCours ? "Enregistrement…" : "J'accepte et je continue"}
      </button>
    </div>
  );
}
