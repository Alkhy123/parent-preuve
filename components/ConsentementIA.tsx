"use client";

// components/ConsentementIA.tsx
//
// Porte de consentement IA réutilisable.
//
// Par défaut, le composant affiche le texte historique utilisé pour les
// fonctions IA simples.
// Certaines fonctionnalités, comme le Copilote Agent, peuvent fournir un texte
// plus précis via titre, descriptionTransmission et descriptionResponsabilite.

import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/lib/supabase";

type ConsentementIAProps = {
  fonctionnalite: string;
  children: ReactNode;
  titre?: string;
  descriptionTransmission?: string;
  descriptionResponsabilite?: string;
};

export default function ConsentementIA({
  fonctionnalite,
  children,
  titre = "Avant d'utiliser l'assistant",
  descriptionTransmission = "Pour fonctionner, l'assistant envoie le texte que vous saisissez à un prestataire d'intelligence artificielle : Mistral AI, société française, dont les serveurs sont situés dans l'Union européenne. Seul le texte que vous écrivez est transmis. Aucune autre donnée de votre dossier n'est envoyée, sauf indication explicite sur l'écran concerné. Ce texte n'est pas utilisé pour entraîner les modèles du prestataire.",
  descriptionResponsabilite = "L'assistant est une aide à la rédaction et à l'organisation factuelle. Il ne fournit aucun conseil juridique. Vous restez responsable du contenu : relisez et corrigez toujours le résultat avant de l'utiliser.",
}: ConsentementIAProps) {
  const [chargement, setChargement] = useState(true);
  const [consenti, setConsenti] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;

    (async () => {
      const { data, error } = await supabase
        .from("consentements_ia")
        .select("id")
        .eq("fonctionnalite", fonctionnalite)
        .limit(1)
        .maybeSingle();

      if (annule) {
        return;
      }

      if (error) {
        setErreur(error.message);
      } else {
        setConsenti(data !== null);
      }

      setChargement(false);
    })();

    return () => {
      annule = true;
    };
  }, [fonctionnalite]);

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

    const { error } = await supabase.from("consentements_ia").insert({
      user_id: userId,
      fonctionnalite,
    });

    if (error) {
      setErreur(error.message);
    } else {
      setConsenti(true);
    }

    setEnCours(false);
  }

  if (chargement) {
    return <p className="text-sm text-slate-500">Chargement…</p>;
  }

  if (consenti) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-4">
      <h3 className="font-semibold text-[#15233F]">{titre}</h3>

      <p className="mt-2 text-sm leading-6 text-[#5A6473]">
        {descriptionTransmission}
      </p>

      <p className="mt-2 text-sm leading-6 text-[#5A6473]">
        {descriptionResponsabilite}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Vous pourrez retirer votre accord à tout moment depuis la page « Mon
        dossier ».
      </p>

      {erreur && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {erreur}
        </p>
      )}

      <button
        type="button"
        onClick={accepter}
        disabled={enCours}
        className="mt-4 inline-flex rounded-lg bg-[#15233F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enCours ? "Enregistrement…" : "J'accepte et je continue"}
      </button>
    </div>
  );
}