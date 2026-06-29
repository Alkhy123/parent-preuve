"use client";

// components/WidgetDossierPret.tsx
//
// Widget d'accueil : montre en un coup d'oeil si le dossier est pret a
// l'export (bloquants / avertissements / pret). LECTURE SEULE.
//
// Reutilise le moteur de controle (lib/controleDossier.ts) via le helper
// de chargement (lib/etatDossier.ts). Aucune logique de controle dupliquee.

import { useEffect, useState } from "react";
import Link from "next/link";
import { chargerEtatDossier } from "@/lib/etatDossier";
import {
  controlerDossier,
  resumeControle,
  type Probleme,
} from "@/lib/controleDossier";

export default function WidgetDossierPret() {
  const [problemes, setProblemes] = useState<Probleme[] | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        // Accueil : pas de selecteur de periode, donc du/au vides.
        const donnees = await chargerEtatDossier("", "");
        const liste = controlerDossier(donnees);
        if (!annule) setProblemes(liste);
      } catch {
        if (!annule) setErreur(true);
      }
    })();

    return () => {
      annule = true;
    };
  }, []);

  // Etat : verification en cours.
  if (problemes === null && !erreur) {
    return (
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm text-sm text-slate-500">
        Vérification du dossier...
      </div>
    );
  }

  // Etat : echec du controle. On n'affirme JAMAIS que le dossier est pret.
  if (erreur || problemes === null) {
    return (
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        <h2 className="font-display text-lg text-[#15233F]">Dossier prêt à l&apos;export</h2>
        <p className="mt-2 text-sm text-slate-500">
          Contrôle indisponible pour le moment. Vous pouvez réessayer plus tard ou
          ouvrir la page Export.
        </p>
        <Link
          href="/export"
          className="mt-3 inline-block text-sm text-[#15233F] underline underline-offset-2"
        >
          Ouvrir l&apos;export
        </Link>
      </div>
    );
  }

  const resume = resumeControle(problemes);

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-[#15233F]">Dossier prêt à l&apos;export</h2>
        <Link
          href="/export"
          className="text-sm text-[#15233F] underline underline-offset-2"
        >
          Voir le détail
        </Link>
      </div>

      {/* Bandeau d'etat global */}
      {resume.toutEstBon ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Dossier prêt à l&apos;export.
        </div>
      ) : resume.peutExporter ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Exportable, mais {resume.avertissements.length} point
          {resume.avertissements.length > 1 ? "s" : ""} à vérifier.
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Votre dossier peut être complété avant l&apos;export : {resume.bloquants.length} point
          {resume.bloquants.length > 1 ? "s" : ""} à finaliser.
        </div>
      )}

      {/* Liste des bloquants */}
      {resume.bloquants.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {resume.bloquants.map((p, i) => (
            <li key={`b-${i}`} className="text-sm text-red-800">
              🔴 {p.message}
            </li>
          ))}
        </ul>
      )}

      {/* Liste des avertissements */}
      {resume.avertissements.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {resume.avertissements.map((p, i) => (
            <li key={`a-${i}`} className="text-sm text-amber-800">
              🟠 {p.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
