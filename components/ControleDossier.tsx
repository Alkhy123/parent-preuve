"use client";

// src/components/ControleDossier.tsx
//
// Brique C — étape C2 : l'écran.
//
// Ce composant va chercher les données dans Supabase, les traduit dans la forme
// attendue par le moteur (controleDossier.ts), puis affiche le bilan :
//   - 🔴 points bloquants (l'export n'a pas de sens sans eux)
//   - 🟠 avertissements (recommandés, mais on peut exporter quand même)
//   - 🟢 tout est bon
//
// Il prévient aussi la page parente (/export) du résultat via `onChange`,
// pour qu'elle puisse désactiver le bouton tant qu'un point bloquant subsiste.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  controlerDossier,
  resumeControle,
  type DonneesControle,
  type Probleme,
} from "@/lib/controleDossier";

type Props = {
  /** Période choisie sur la page /export (chaînes "YYYY-MM-DD" ou ""). */
  du: string;
  au: string;
  /** Appelé à chaque calcul pour informer la page parente si l'export est permis. */
  onChange?: (peutExporter: boolean) => void;
};

// Vrai si une chaîne contient autre chose que des espaces.
function estRempli(x: string | null | undefined) {
  return !!(x && x.trim() !== "");
}

export default function ControleDossier({ du, au, onChange }: Props) {
  // `null` = pas encore calculé (on affiche « Vérification… »).
  const [problemes, setProblemes] = useState<Probleme[] | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let annule = false; // évite de mettre à jour l'état si le composant a été démonté

    async function controler() {
      setErreur("");
      try {
        // 1) Le socle (une seule ligne par utilisateur, filtrée par RLS).
        const { data: socleRow } = await supabase
          .from("dossier")
          .select(
            "declarant_nom, declarant_prenom, autre_parent_nom, autre_parent_prenom, jugement_juridiction, jugement_date"
          )
          .maybeSingle();

        // 2) Les enfants (on a juste besoin du nombre).
        const { data: enfantsRows } = await supabase.from("children").select("id");

        // 3) Les preuves dont l'horodatage est à refaire.
        const { data: preuvesRows } = await supabase
          .from("preuves_photo")
          .select("id")
          .eq("horodatage_statut", "a_refaire");

        // 4) On traduit tout ça dans la forme attendue par le moteur.
        //    Les trois compteurs à 0 (frais/brouillons/pièces) ne sont pas encore
        //    calculables faute de colonnes en base : ils ne déclencheront donc rien.
        const donnees: DonneesControle = {
          socle: socleRow
            ? {
                // « Complet » = critères volontairement simples, faciles à ajuster ici.
                parent1Complet:
                  estRempli(socleRow.declarant_nom) && estRempli(socleRow.declarant_prenom),
                parent2Complet:
                  estRempli(socleRow.autre_parent_nom) &&
                  estRempli(socleRow.autre_parent_prenom),
                referenceJugementRenseignee:
                  estRempli(socleRow.jugement_juridiction) && estRempli(socleRow.jugement_date),
              }
            : null,
          nombreEnfants: enfantsRows?.length ?? 0,
          periode: { du, au },
          fraisSansJustificatif: 0, // à brancher quand la base reliera frais ↔ justificatif
          evenementsEnBrouillon: 0, // à brancher quand `events` aura une colonne de statut
          piecesNonRattachees: 0, // à brancher quand un document pourra pointer vers un frais/événement
          preuvesHorodatageARefaire: preuvesRows?.length ?? 0,
        };

        const liste = controlerDossier(donnees);
        if (!annule) {
          setProblemes(liste);
          onChange?.(resumeControle(liste).peutExporter);
        }
      } catch (e) {
        if (!annule) {
          // En cas de pépin réseau, on ne bloque pas l'export (comportement d'origine).
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
    // On relance le contrôle quand la période change. `onChange` est volontairement
    // hors des dépendances (sinon il se relancerait à chaque rendu).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [du, au]);

  // ── Affichage ───────────────────────────────────────────────────────────────

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