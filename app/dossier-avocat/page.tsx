"use client";

// app/dossier-avocat/page.tsx
//
// Previsualisation du "Dossier de transmission a l'avocat". Lecture seule :
// collecte (cloisonnee procedure active) -> rendu pur -> affichage.
// L'export PDF est ajoute dans un sous-bloc ulterieur.

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import AvertissementDocumentPreparatoire from "@/components/avocat/AvertissementDocumentPreparatoire";
import PreviewDossierAvocat from "@/components/avocat/PreviewDossierAvocat";
import { collecterDossierAvocat } from "@/lib/avocat/collecterDossierAvocat";
import { rendreDossierAvocat } from "@/lib/avocat/rendreDossierAvocat";
import { genererPdfDossierAvocat } from "@/lib/avocat/exportDossierAvocatPdf";
import type { RenduDossierAvocat } from "@/lib/avocat/types";

export default function DossierAvocatPage() {
  const [rendu, setRendu] = useState<RenduDossierAvocat | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let annule = false;
    collecterDossierAvocat()
      .then((dossier) => {
        if (!annule) setRendu(rendreDossierAvocat(dossier));
      })
      .catch(() => {
        if (!annule) setErreur(true);
      });
    return () => {
      annule = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Synthèses & exports"
        title="Dossier de transmission à l'avocat"
        subtitle="Un document préparatoire, factuel et daté, à vérifier et reformuler par votre conseil."
      />

      <div className="mx-auto max-w-3xl space-y-4 px-6 py-10">
        <AvertissementDocumentPreparatoire />

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
