"use client";

// components/TableauDeBord.tsx
//
// Petit tableau de bord chiffré pour l'accueil.
// Il lit les MÊMES fonctions de calcul que l'export (dossierCalculs.ts),
// donc les chiffres ne peuvent pas diverger entre les écrans.
//
// En tête : une bannière « Reste dû global » (pension impayée + frais non remboursés).
// Puis trois cartes "vue d'ensemble" (toutes les données, sans filtre de période) :
//   - Frais   : ce qui reste dû par l'autre parent
//   - Pension : le solde (dû − payé)
//   - Preuves : nombre de preuves scellées + état de l'horodatage

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  totauxFrais,
  totauxPension,
  resteDuGlobal,
  euros,
  type TotauxFrais,
  type TotauxPension,
} from "@/lib/dossierCalculs";

// Compteur simple pour la carte Preuves.
type StatPreuves = {
  total: number;
  aRefaire: number; // horodatage à refaire
};

export default function TableauDeBord() {
  const [frais, setFrais] = useState<TotauxFrais | null>(null);
  const [pension, setPension] = useState<TotauxPension | null>(null);
  const [preuves, setPreuves] = useState<StatPreuves | null>(null);

  useEffect(() => {
    let annule = false;

    async function charger() {
      // RLS limite déjà aux données de l'utilisateur connecté.
      const [frRes, peRes, prRes] = await Promise.all([
        supabase.from("expenses").select("part_autre, rembourse"),
        supabase.from("pension_payments").select("montant_du, montant_paye"),
        supabase.from("preuves_photo").select("horodatage_statut"),
      ]);

      if (annule) return;
      setFrais(totauxFrais(frRes.data ?? []));
      setPension(totauxPension(peRes.data ?? []));

      const lignes = prRes.data ?? [];
      setPreuves({
        total: lignes.length,
        aRefaire: lignes.filter((l) => l.horodatage_statut === "a_refaire").length,
      });
    }

    charger();
    return () => {
      annule = true;
    };
  }, []);

  // Libellé lisible pour le solde de pension.
  function libellePension(p: TotauxPension) {
    if (p.solde > 0) return { texte: `Impayé : ${euros(p.solde)}`, alerte: true };
    if (p.solde < 0) return { texte: `Trop-perçu : ${euros(-p.solde)}`, alerte: false };
    return { texte: "À jour", alerte: false };
  }

  // Reste dû global : disponible seulement quand frais ET pension sont chargés.
  const global =
    frais && pension ? resteDuGlobal(pension.solde, frais.resteDu) : null;

  return (
    <>
      {/* Bannière : reste dû global */}
      <div className="mb-4 rounded-xl border border-[#C2A24C]/40 bg-[#15233F] p-5 text-[#F8F6F1]">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
          Reste dû global
        </h2>
        {global === null ? (
          <p className="mt-2 text-sm text-[#F8F6F1]/60">Chargement…</p>
        ) : (
          <>
            <p className="mt-1 text-4xl font-bold">{euros(global.total)}</p>
            <p className="mt-1 text-sm text-[#F8F6F1]/70">
              Pension impayée {euros(global.pensionResteDu)} · frais non remboursés{" "}
              {euros(global.fraisResteDu)}.
            </p>
            {global.pensionTropPercu > 0 && (
              <p className="mt-1 text-sm text-[#F8F6F1]/70">
                Trop-perçu de pension : {euros(global.pensionTropPercu)} (non déduit du total).
              </p>
            )}
            <p className="mt-2 text-xs text-[#F8F6F1]/50">
              Montants calculés à partir de vos saisies. Éléments factuels, soumis à
              l&apos;appréciation du juge.
            </p>
          </>
        )}
      </div>

      {/* Trois cartes de détail */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Carte Frais */}
        <div className="carte rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
            Frais — reste dû
          </h2>
          {frais === null ? (
            <p className="mt-2 text-sm text-slate-400">Chargement…</p>
          ) : frais.resteDu > 0 ? (
            <>
              <p className="mt-1 text-3xl font-bold text-[#15233F]">{euros(frais.resteDu)}</p>
              <p className="mt-1 text-sm text-slate-500">
                Sur {euros(frais.totalDemande)} demandés.
              </p>
            </>
          ) : (
            <p className="mt-2 text-lg font-semibold text-emerald-700">À jour</p>
          )}
        </div>

        {/* Carte Pension */}
        <div className="carte rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
            Pension — solde
          </h2>
          {pension === null ? (
            <p className="mt-2 text-sm text-slate-400">Chargement…</p>
          ) : (
            (() => {
              const l = libellePension(pension);
              return (
                <>
                  <p
                    className={`mt-1 text-3xl font-bold ${
                      l.alerte ? "text-red-700" : "text-[#15233F]"
                    }`}
                  >
                    {l.texte}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Dû {euros(pension.totalDu)} · payé {euros(pension.totalPaye)}.
                  </p>
                </>
              );
            })()
          )}
        </div>

        {/* Carte Preuves */}
        <div className="carte rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
            Preuves scellées
          </h2>
          {preuves === null ? (
            <p className="mt-2 text-sm text-slate-400">Chargement…</p>
          ) : preuves.total === 0 ? (
            <>
              <p className="mt-1 text-3xl font-bold text-[#15233F]">0</p>
              <p className="mt-1 text-sm text-slate-500">Aucune preuve pour l'instant.</p>
            </>
          ) : (
            <>
              <p className="mt-1 text-3xl font-bold text-[#15233F]">{preuves.total}</p>
              {preuves.aRefaire > 0 ? (
                <p className="mt-1 text-sm font-medium text-amber-700">
                  {preuves.aRefaire} à horodater de nouveau.
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Toutes horodatées.</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}