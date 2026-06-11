"use client";

// Brique C — étape C2 : l'écran (cloisonné par procédure active).
//
// Va chercher les données dans Supabase, les traduit dans la forme attendue par
// le moteur (controleDossier.ts), puis affiche le bilan. Tout est filtré sur la
// PROCÉDURE ACTIVE pour rester cohérent avec l'export.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import {
  controlerDossier,
  resumeControle,
  type DonneesControle,
  type Probleme,
} from "@/lib/controleDossier";

type Props = {
  du: string;
  au: string;
  onChange?: (peutExporter: boolean) => void;
};

// Vrai si une chaîne contient autre chose que des espaces.
function estRempli(x: string | null | undefined) {
  return !!(x && x.trim() !== "");
}

export default function ControleDossier({ du, au, onChange }: Props) {
  const [problemes, setProblemes] = useState<Probleme[] | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let annule = false;

    async function controler() {
      setErreur("");
      try {
        const procId = await getProcedureActiveId();

        // 1) Enfants de la procédure active (compte + filtrage des compteurs).
        let idsProc = new Set<string>();
        if (procId) {
          const { data: enfantsRows } = await supabase
            .from("children")
            .select("id")
            .eq("procedure_id", procId);
          idsProc = new Set((enfantsRows ?? []).map((e) => e.id));
        }
        const garde = (cid: string | null) => cid === null || idsProc.has(cid);

        // 2) Déclarant : depuis le socle global (/dossier).
        const { data: socleRow } = await supabase
          .from("dossier")
          .select("declarant_nom, declarant_prenom")
          .maybeSingle();

        // 3) Autre parent + jugement : depuis la PROCÉDURE active.
        let procRow:
          | {
              autre_parent_nom: string | null;
              autre_parent_prenom: string | null;
              jugement_juridiction: string | null;
              jugement_date: string | null;
            }
          | null = null;
        if (procId) {
          const r = await supabase
            .from("procedures")
            .select("autre_parent_nom, autre_parent_prenom, jugement_juridiction, jugement_date")
            .eq("id", procId)
            .maybeSingle();
          procRow = r.data;
        }

        // 4) Compteurs, filtrés ensuite sur la procédure (enfant de la procédure ou sans enfant).
        const [preuvesRes, brouillonsRes, fraisRes] = await Promise.all([
          supabase.from("preuves_photo").select("id, enfant_id").eq("horodatage_statut", "a_refaire"),
          supabase.from("events").select("id, child_id").eq("statut", "brouillon"),
          supabase.from("expenses").select("id, child_id").is("document_id", null),
        ]);

        const preuvesARefaire = (preuvesRes.data ?? []).filter((p) => garde(p.enfant_id)).length;
        const brouillons = (brouillonsRes.data ?? []).filter((e) => garde(e.child_id)).length;
        const fraisSansJustif = (fraisRes.data ?? []).filter((f) => garde(f.child_id)).length;

        const donnees: DonneesControle = {
          socle: {
            parent1Complet:
              estRempli(socleRow?.declarant_nom) && estRempli(socleRow?.declarant_prenom),
            parent2Complet:
              estRempli(procRow?.autre_parent_nom) && estRempli(procRow?.autre_parent_prenom),
            referenceJugementRenseignee:
              estRempli(procRow?.jugement_juridiction) && estRempli(procRow?.jugement_date),
          },
          nombreEnfants: idsProc.size,
          periode: { du, au },
          fraisSansJustificatif: fraisSansJustif,
          evenementsEnBrouillon: brouillons,
          piecesNonRattachees: 0,
          preuvesHorodatageARefaire: preuvesARefaire,
        };

        const liste = controlerDossier(donnees);
        if (!annule) {
          setProblemes(liste);
          onChange?.(resumeControle(liste).peutExporter);
        }
      } catch {
        if (!annule) {
          setErreur("Le contrôle automatique n'a pas pu s'exécuter.");
          setProblemes([]);
          onChange?.(true);
        }
      }
    }

    controler();
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [du, au]);

  if (problemes === null) {
    return (
      <div className="carte rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Vérification du dossier…
      </div>
    );
  }

  const resume = resumeControle(problemes);

  return (
    <div className="carte rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-lg text-[#15233F]">Contrôle du dossier</h2>

      {erreur && <p className="mt-2 text-sm text-slate-500">{erreur}</p>}

      {resume.toutEstBon && !erreur && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Dossier prêt à l'export.
        </div>
      )}

      {resume.bloquants.length > 0 && (
        <div className="mt-3 space-y-2">
          {resume.bloquants.map((p, i) => (
            <div
              key={`b-${i}`}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              🔴 {p.message}
            </div>
          ))}
        </div>
      )}

      {resume.avertissements.length > 0 && (
        <div className="mt-3 space-y-2">
          {resume.avertissements.map((p, i) => (
            <div
              key={`a-${i}`}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              🟠 {p.message}
            </div>
          ))}
        </div>
      )}

      {!resume.peutExporter && (
        <p className="mt-3 text-xs text-slate-500">
          Tant qu'un point bloquant subsiste, l'export reste désactivé.
        </p>
      )}
    </div>
  );
}
