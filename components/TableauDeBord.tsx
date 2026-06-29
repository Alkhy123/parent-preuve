"use client";

// components/TableauDeBord.tsx
//
// Tableau de bord chiffré de l'accueil, CLOISONNÉ sur la procédure active.
// Utilise les mêmes fonctions de calcul que l'export (dossierCalculs.ts).

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import {
  totauxFrais,
  totauxPension,
  resteDuGlobal,
  euros,
  type FraisCalcul,
  type PensionCalcul,
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
      const procId = await getProcedureActiveId();

      // Cloisonnement strict en base sur procedure_id (frais, pension, preuves).
      // Sans procédure active, rien à afficher.
      let fraisRows: FraisCalcul[] = [];
      let pensionRows: PensionCalcul[] = [];
      let preuvesRows: { horodatage_statut: string | null }[] = [];
      if (procId) {
        const [frRes, peRes, prRes] = await Promise.all([
          supabase.from("expenses").select("part_autre, rembourse").eq("procedure_id", procId),
          supabase
            .from("pension_payments")
            .select("montant_du, montant_paye")
            .eq("procedure_id", procId),
          supabase.from("preuves_photo").select("horodatage_statut").eq("procedure_id", procId),
        ]);
        fraisRows = (frRes.data ?? []) as FraisCalcul[];
        pensionRows = (peRes.data ?? []) as PensionCalcul[];
        preuvesRows = (prRes.data ?? []) as { horodatage_statut: string | null }[];
      }

      if (annule) return;

      setFrais(totauxFrais(fraisRows));
      setPension(totauxPension(pensionRows));
      setPreuves({
        total: preuvesRows.length,
        aRefaire: preuvesRows.filter((l) => l.horodatage_statut === "a_refaire").length,
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
      <div className="mb-6 rounded-xl border border-[#C2A24C]/40 bg-[#15233F] p-5 text-[#F8F6F1]">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
          Reste dû global
        </h2>
        {global === null ? (
          <p className="mt-2 text-sm text-[#F8F6F1]/60">Chargement...</p>
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Carte Frais */}
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wide text-or-fonce">
            Frais - reste dû
          </h2>
          {frais === null ? (
            <p className="mt-2 text-sm text-[#5A6473]">Chargement...</p>
          ) : frais.resteDu > 0 ? (
            <>
              <p className="mt-1 text-3xl font-bold text-[#15233F]">{euros(frais.resteDu)}</p>
              <p className="mt-1 text-sm text-[#5A6473]">
                Sur {euros(frais.totalDemande)} demandés.
              </p>
            </>
          ) : (
            <p className="mt-2 text-lg font-semibold text-[#2E6A4D]">À jour</p>
          )}
        </div>

        {/* Carte Pension */}
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wide text-or-fonce">
            Pension - solde
          </h2>
          {pension === null ? (
            <p className="mt-2 text-sm text-[#5A6473]">Chargement...</p>
          ) : (
            (() => {
              const l = libellePension(pension);
              return (
                <>
                  <p
                    className={`mt-1 text-3xl font-bold ${
                      l.alerte ? "text-[#9B2C2C]" : "text-[#15233F]"
                    }`}
                  >
                    {l.texte}
                  </p>
                  <p className="mt-1 text-sm text-[#5A6473]">
                    Dû {euros(pension.totalDu)} · payé {euros(pension.totalPaye)}.
                  </p>
                </>
              );
            })()
          )}
        </div>

        {/* Carte Preuves */}
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wide text-or-fonce">
            Preuves photo horodatées
          </h2>
          {preuves === null ? (
            <p className="mt-2 text-sm text-[#5A6473]">Chargement...</p>
          ) : preuves.total === 0 ? (
            <>
              <p className="mt-1 text-3xl font-bold text-[#15233F]">0</p>
              <p className="mt-1 text-sm text-[#5A6473]">Aucune preuve pour l&apos;instant.</p>
            </>
          ) : (
            <>
              <p className="mt-1 text-3xl font-bold text-[#15233F]">{preuves.total}</p>
              {preuves.aRefaire > 0 ? (
                <p className="mt-1 text-sm font-medium text-[#8A5A12]">
                  {preuves.aRefaire} à horodater de nouveau.
                </p>
              ) : (
                <p className="mt-1 text-sm text-[#5A6473]">Toutes horodatées.</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
