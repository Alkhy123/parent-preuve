"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { dateFr } from "@/lib/courrierHelpers";

// Affiche l'état du consentement IA pour une fonctionnalité donnée.
// À placer sur la page /dossier avec le prop fonctionnalite correspondant.
export default function StatutConsentementIA({
  fonctionnalite,
}: {
  fonctionnalite: string;
}) {
  const [chargement, setChargement] = useState(true);
  const [consenti, setConsenti] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("consentements_ia")
        .select("created_at")
        .eq("fonctionnalite", fonctionnalite)
        .limit(1)
        .maybeSingle();
      if (error) setErreur(error.message);
      else {
        setConsenti(data !== null);
        setDate(data?.created_at ?? null);
      }
      setChargement(false);
    })();
  }, [fonctionnalite]);

  async function retirer() {
    setEnCours(true);
    setErreur(null);

    const { error } = await supabase
      .from("consentements_ia")
      .delete()
      .eq("fonctionnalite", fonctionnalite);

    if (error) setErreur(error.message);
    else {
      setConsenti(false);
      setDate(null);
    }
    setEnCours(false);
  }

  if (chargement) return null;

  return (
    <div className="rounded-lg border border-[#C2A24C]/40 bg-white p-5 text-[#1F2733]">
      <p className="font-display text-lg text-[#15233F]">
        Assistant IA — {fonctionnalite === "reformulation" ? "Reformulation" : "Général"}
      </p>

      {consenti ? (
        <>
          <p className="mt-2 text-sm">
            ✅ Vous avez autorisé cette fonctionnalité
            {date && (
              <> le <strong>{dateFr(date.slice(0, 10))}</strong></>
            )}
            .
          </p>
          <p className="mt-1 text-sm text-[#1F2733]/70">
            Vous pouvez retirer cet accord à tout moment. L'assistant cessera alors
            de fonctionner ; il vous redemandera votre accord avant tout nouvel usage.
          </p>

          {erreur && (
            <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {erreur}
            </p>
          )}

          <button
            onClick={retirer}
            disabled={enCours}
            className="mt-4 rounded-md border border-[#15233F] px-4 py-2 text-sm font-medium text-[#15233F] hover:bg-[#15233F]/5 disabled:opacity-50"
          >
            {enCours ? "Retrait…" : "Retirer mon accord"}
          </button>
        </>
      ) : (
        <p className="mt-2 text-sm text-[#1F2733]/70">
          Cette fonctionnalité IA n'est pas encore activée. Votre accord vous sera demandé
          lors de votre première utilisation.
        </p>
      )}
    </div>
  );
}
