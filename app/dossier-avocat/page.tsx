"use client";

// app/dossier-avocat/page.tsx
//
// Synthèses contextuelles (lecture seule) : on collecte UNE FOIS les données du
// dossier (cloisonnées sur la procédure active), puis on rend l'une des quatre
// synthèses au choix (préparation avocat / audience / pension / difficultés).
// Même prévisualisation et même export PDF pour les quatre.

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import AvertissementDocumentPreparatoire from "@/components/avocat/AvertissementDocumentPreparatoire";
import PreviewDossierAvocat from "@/components/avocat/PreviewDossierAvocat";
import { collecterDossierAvocat } from "@/lib/avocat/collecterDossierAvocat";
import { genererPdfDossierAvocat } from "@/lib/avocat/exportDossierAvocatPdf";
import {
  construireSynthese,
  SYNTHESES,
  type TypeSynthese,
} from "@/lib/avocat/syntheses";
import type { DossierTransmissionAvocatV1 } from "@/lib/avocat/types";

export default function DossierAvocatPage() {
  const [dossier, setDossier] = useState<DossierTransmissionAvocatV1 | null>(null);
  const [type, setType] = useState<TypeSynthese>("avocat");
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let annule = false;
    collecterDossierAvocat()
      .then((d) => {
        if (!annule) setDossier(d);
      })
      .catch(() => {
        if (!annule) setErreur(true);
      });
    return () => {
      annule = true;
    };
  }, []);

  // Rendu de la synthèse choisie, recalculé quand le type ou les données changent.
  const rendu = useMemo(
    () => (dossier ? construireSynthese(type, dossier) : null),
    [dossier, type],
  );

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Synthèses & exports"
        title="Synthèses contextuelles"
        subtitle="Des documents préparatoires, factuels et datés, à vérifier et reformuler par un professionnel du droit."
      />

      <div className="mx-auto max-w-3xl space-y-4 px-6 py-10">
        <AvertissementDocumentPreparatoire />

        {/* Sélecteur de synthèse */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SYNTHESES.map((s) => {
            const actif = s.cle === type;
            return (
              <button
                key={s.cle}
                type="button"
                onClick={() => setType(s.cle)}
                aria-pressed={actif}
                className={
                  "rounded-xl p-4 text-left transition " +
                  (actif
                    ? "bg-navy text-surface"
                    : "carte text-texte hover:opacity-90")
                }
              >
                <p className="font-display text-base">{s.libelle}</p>
                <p
                  className={
                    "mt-1 text-sm " +
                    (actif ? "text-surface/80" : "text-texte-doux")
                  }
                >
                  {s.description}
                </p>
              </button>
            );
          })}
        </div>

        {rendu !== null && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => genererPdfDossierAvocat(rendu)}
              className="btn btn-primaire"
            >
              Exporter en PDF
            </button>
          </div>
        )}

        {erreur ? (
          <div className="carte rounded-xl bg-white p-5 text-sm text-texte-doux">
            Certaines données n&apos;ont pas pu être chargées. Réessayez plus tard.
          </div>
        ) : rendu === null ? (
          <p className="text-sm text-texte-doux">Préparation du document…</p>
        ) : (
          <PreviewDossierAvocat rendu={rendu} />
        )}
      </div>
    </main>
  );
}
