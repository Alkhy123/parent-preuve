"use client";

// Brique C — étape C2 : l'écran (cloisonné par procédure active).
//
// Affiche le bilan du contrôle avant export. Le chargement des données
// Supabase est délégué au helper partagé lib/etatDossier.ts (même logique,
// même cloisonnement), pour éviter toute duplication avec WidgetDossierPret.

import { useEffect, useState } from "react";
import { chargerEtatDossier } from "@/lib/etatDossier";
import {
  controlerDossier,
  resumeControle,
  type Probleme,
} from "@/lib/controleDossier";

type Props = {
  du: string;
  au: string;
  onChange?: (peutExporter: boolean) => void;
};

export default function ControleDossier({ du, au, onChange }: Props) {
  const [problemes, setProblemes] = useState<Probleme[] | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let annule = false;

    async function controler() {
      setErreur("");
      try {
        const donnees = await chargerEtatDossier(du, au);
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
          ✓ Dossier prêt à l&apos;export.
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
          Vous pourrez générer l&apos;export une fois ces points complétés.
        </p>
      )}
    </div>
  );
}
