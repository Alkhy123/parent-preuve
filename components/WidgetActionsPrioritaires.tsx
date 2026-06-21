"use client";

// components/WidgetActionsPrioritaires.tsx
//
// Widget d'accueil : 3-4 actions prioritaires, classees, cliquables.
// LECTURE SEULE, aucune ecriture en base.
//
// Source 1 : lib/etatDossier.ts (socle, enfants, frais, brouillons, preuves),
//   meme cloisonnement par procedure active que le reste de l'accueil.
// Source 2 : pension_payments (solde) via totauxPension, filtre sur la
//   procedure active. La pension n'est pas couverte par chargerEtatDossier.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { chargerEtatDossier } from "@/lib/etatDossier";
import {
  totauxPension,
  euros,
  type PensionCalcul,
} from "@/lib/dossierCalculs";

type Niveau = "bloquant" | "avertissement";

type Action = {
  cle: string;
  niveau: Niveau;
  libelle: string;
  lien: string;
};

export default function WidgetActionsPrioritaires() {
  const [actions, setActions] = useState<Action[] | null>(null);
  const [reste, setReste] = useState(0); // actions au-dela des 4 affichees
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        // Accueil : pas de selecteur de periode, du/au vides.
        const [donnees, procId] = await Promise.all([
          chargerEtatDossier("", ""),
          getProcedureActiveId(),
        ]);

        // Solde de pension (cloisonne sur la procedure active).
        let soldePension = 0;
        if (procId) {
          const { data } = await supabase
            .from("pension_payments")
            .select("montant_du, montant_paye")
            .eq("procedure_id", procId);
          soldePension = totauxPension((data ?? []) as PensionCalcul[]).solde;
        }

        // Construction des actions a partir de l'etat reel du dossier.
        const liste: Action[] = [];

        const socleComplet =
          donnees.socle !== null &&
          donnees.socle.parent1Complet &&
          donnees.socle.parent2Complet &&
          donnees.socle.referenceJugementRenseignee;
        if (!socleComplet) {
          liste.push({
            cle: "socle",
            niveau: "bloquant",
            libelle:
              "Compléter le socle du dossier : état civil des parents et référence du jugement.",
            lien: "/dossier",
          });
        }

        if (donnees.nombreEnfants === 0) {
          liste.push({
            cle: "enfants",
            niveau: "bloquant",
            libelle: "Renseigner au moins un enfant.",
            lien: "/enfants",
          });
        }

        if (donnees.fraisSansJustificatif > 0) {
          liste.push({
            cle: "frais",
            niveau: "avertissement",
            libelle: `Rattacher un justificatif à ${donnees.fraisSansJustificatif} frais.`,
            lien: "/frais",
          });
        }

        if (donnees.evenementsEnBrouillon > 0) {
          const n = donnees.evenementsEnBrouillon;
          liste.push({
            cle: "brouillons",
            niveau: "avertissement",
            libelle: `Finaliser ${n} événement${n > 1 ? "s" : ""} en brouillon.`,
            lien: "/journal",
          });
        }

        if (donnees.preuvesHorodatageARefaire > 0) {
          const n = donnees.preuvesHorodatageARefaire;
          liste.push({
            cle: "preuves",
            niveau: "avertissement",
            libelle: `Reprendre l'horodatage de ${n} preuve${n > 1 ? "s" : ""}.`,
            lien: "/preuves",
          });
        }

        if (soldePension > 0) {
          liste.push({
            cle: "pension",
            niveau: "avertissement",
            libelle: `Pension : ${euros(soldePension)} restant dû à suivre.`,
            lien: "/pension",
          });
        }

        // Bloquants d'abord, puis avertissements ; 4 maximum.
        const rang = (x: Niveau) => (x === "bloquant" ? 0 : 1);
        const triees = [...liste].sort((a, b) => rang(a.niveau) - rang(b.niveau));
        const top = triees.slice(0, 4);

        if (!annule) {
          setActions(top);
          setReste(triees.length - top.length);
        }
      } catch {
        if (!annule) setErreur(true);
      }
    })();

    return () => {
      annule = true;
    };
  }, []);

  // Etat : recherche en cours.
  if (actions === null && !erreur) {
    return (
      <div className="carte rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Recherche des actions prioritaires…
      </div>
    );
  }

  // Etat : echec. On n'affirme jamais que tout est en ordre.
  if (erreur || actions === null) {
    return (
      <div className="carte rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-lg text-[#15233F]">Que faire maintenant ?</h2>
        <p className="mt-2 text-sm text-slate-500">
          Liste indisponible pour le moment. Vous pouvez réessayer plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="carte rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-lg text-[#15233F]">Que faire maintenant ?</h2>

      {actions.length === 0 ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Votre dossier ne présente pas d&apos;action urgente. Vous pouvez
          continuer à noter les faits au fil de l&apos;eau.
        </div>
      ) : (
        <>
          <ul className="mt-3 space-y-2">
            {actions.map((a) => (
              <li key={a.cle}>
                <Link
                  href={a.lien}
                  className="flex items-start gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm text-[#1F2733] transition hover:border-[#C2A24C] hover:bg-[#F8F6F1]"
                >
                  <span aria-hidden="true">
                    {a.niveau === "bloquant" ? "🔴" : "🟠"}
                  </span>
                  <span>{a.libelle}</span>
                </Link>
              </li>
            ))}
          </ul>

          {reste > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              +{reste} autre{reste > 1 ? "s" : ""} point{reste > 1 ? "s" : ""} à vérifier.
            </p>
          )}
        </>
      )}
    </div>
  );
}
