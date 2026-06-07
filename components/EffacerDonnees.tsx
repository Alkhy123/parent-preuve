"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Tables contenant les données du dossier (effacées à la remise à zéro).
// On supprime d'abord les tables qui référencent children, children plus bas.
const TABLES = [
  "events",
  "expenses",
  "pension_payments",
  "pension_regle",
  "frais_regle",
  "dvh_regle",
  "decision_regle",
  "garde_regles",
  "documents",
  "preuves_photo",
  "children",
  "consentements_ia",
  "dossier",
];

const MOT_CONFIRMATION = "EFFACER";

export default function EffacerDonnees() {
  const [confirmation, setConfirmation] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");

  async function toutEffacer() {
    setMessage("");
    setEnCours(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setMessage("Vous devez être connecté.");
        return;
      }

      // 1) Récupérer les chemins de fichiers AVANT de supprimer les fiches,
      //    pour pouvoir vider le stockage.
      const [docs, preuves] = await Promise.all([
        supabase.from("documents").select("chemin_fichier").eq("user_id", userId),
        supabase.from("preuves_photo").select("storage_path").eq("user_id", userId),
      ]);

      const fichiersJustificatifs = (docs.data ?? [])
        .map((d) => d.chemin_fichier)
        .filter(Boolean) as string[];
      const fichiersPreuves = (preuves.data ?? [])
        .map((p) => p.storage_path)
        .filter(Boolean) as string[];

      if (fichiersJustificatifs.length > 0) {
        await supabase.storage.from("justificatifs").remove(fichiersJustificatifs);
      }
      if (fichiersPreuves.length > 0) {
        await supabase.storage.from("preuves").remove(fichiersPreuves);
      }

      // 2) Supprimer les lignes de chaque table (RLS + filtre explicite par user).
      const erreurs: string[] = [];
      for (const table of TABLES) {
        const { error } = await supabase.from(table).delete().eq("user_id", userId);
        if (error) erreurs.push(`${table} : ${error.message}`);
      }

      if (erreurs.length > 0) {
        setMessage("Effacement partiel. " + erreurs.join(" · "));
        return;
      }

      // 3) Tout est effacé : on recharge pour repartir d'un dossier vide.
      setMessage("Toutes vos données ont été effacées.");
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setMessage("Erreur : " + (e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <section className="carte rounded-lg border border-red-300 bg-red-50 p-6">
      <h2 className="font-display text-xl text-red-800">Zone sensible</h2>
      <p className="mt-2 text-sm text-red-800/80">
        Effacer toutes vos données supprime définitivement votre socle, vos enfants,
        votre journal, vos frais, votre pension, vos documents et vos preuves (y compris
        les fichiers stockés). Cette action est <strong>irréversible</strong>.
      </p>

      {!confirmation ? (
        <button
          onClick={() => setConfirmation(true)}
          className="mt-4 rounded-md border border-red-400 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Effacer toutes mes données
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-red-800">
            Pour confirmer, tapez <strong>{MOT_CONFIRMATION}</strong> ci-dessous.
            Aucune donnée ne sera récupérable ensuite.
          </p>
          <input
            type="text"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder={MOT_CONFIRMATION}
            className="w-full max-w-xs rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-[#1F2733]"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toutEffacer}
              disabled={enCours || saisie !== MOT_CONFIRMATION}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
            >
              {enCours ? "Effacement…" : "Confirmer l'effacement définitif"}
            </button>
            <button
              onClick={() => {
                setConfirmation(false);
                setSaisie("");
                setMessage("");
              }}
              disabled={enCours}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {message && (
        <p
          className={
            "mt-3 text-sm " +
            (message.startsWith("Erreur") || message.startsWith("Effacement partiel")
              ? "text-red-700"
              : "text-emerald-700")
          }
        >
          {message}
        </p>
      )}
    </section>
  );
}