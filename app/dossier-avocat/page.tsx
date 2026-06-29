"use client";

// app/dossier-avocat/page.tsx
//
// Synthèses contextuelles (lecture seule) : on collecte UNE FOIS les données du
// dossier (cloisonnées sur la procédure active), puis on rend l'une des quatre
// synthèses au choix (préparation avocat / audience / pension / difficultés).
// Même prévisualisation et même export PDF pour les quatre.

import { useEffect, useMemo, useState } from "react";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
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
    <AppShell
      titre="Dossier avocat"
      description="Preparer un document de travail structure avant un rendez-vous, une audience ou une transmission."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter/dossier-avocat" variant="secondary">
            Retour Exporter
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AvertissementDocumentPreparatoire />

        {/* Sélecteur de synthèse */}
        <AppCard titre="Choisir une synthèse">
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
                      ? "bg-[#15233F] text-white"
                      : "border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text)] hover:opacity-90")
                  }
                >
                  <p className="font-semibold text-base">{s.libelle}</p>
                  <p
                    className={
                      "mt-1 text-sm " +
                      (actif ? "text-white/80" : "text-[var(--app-text-muted)]")
                    }
                  >
                    {s.description}
                  </p>
                </button>
              );
            })}
          </div>
        </AppCard>

        {rendu !== null && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => genererPdfDossierAvocat(rendu)}
              className="rounded-md bg-[#15233F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1d2f54]"
            >
              Exporter en PDF
            </button>
          </div>
        )}

        {erreur ? (
          <AppNotice titre="Erreur de chargement">
            <p>
              Certaines données n&apos;ont pas pu être chargées. Réessayez plus
              tard.
            </p>
          </AppNotice>
        ) : rendu === null ? (
          <p className="text-sm text-[var(--app-text-muted)]">
            Préparation du document...
          </p>
        ) : (
          <PreviewDossierAvocat rendu={rendu} />
        )}
      </div>
    </AppShell>
  );
}
