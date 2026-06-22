"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import TimelineDossier from "@/components/timeline/TimelineDossier";
import {
  fusionnerChronologie,
  type EntreeChronologie,
  type FaitSource,
  type FraisSource,
  type PensionSource,
  type PreuveSource,
  type TypeEntree,
} from "@/lib/chronologie";
import {
  collecterTimeline,
  type DocumentSource,
  type GardeSource,
} from "@/lib/timeline/collecterTimeline";
import type { TimelineItem } from "@/lib/timeline/types";
import {
  getProcedureActiveId,
  getEnfantsDeProcedureActive,
  type EnfantProcedure,
} from "@/lib/procedureActive";
import { filtrerEtFormaterPourPdf } from "@/lib/chronologieExport";
import { genererPdfChronologie } from "@/lib/chronologiePdf";
import { construireCsvChronologie } from "@/lib/chronologieCsv";

// Cases de filtre par type (toutes cochées par défaut).
const TYPES: { cle: TypeEntree; label: string }[] = [
  { cle: "fait", label: "Faits" },
  { cle: "frais", label: "Frais" },
  { cle: "pension", label: "Pension" },
  { cle: "preuve", label: "Preuves" },
];

// Déclenche le téléchargement d'un fichier CSV dans le navigateur.
// Opération propre au web (Blob + lien) : on la garde hors de la lib pure,
// pour que lib/chronologieCsv.ts reste réutilisable en mobile.
function telechargerCsv(contenu: string, nomFichier: string) {
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ChronologiePage() {
  const [entrees, setEntrees] = useState<EntreeChronologie[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [enfants, setEnfants] = useState<EnfantProcedure[]>([]);
  const [etiquette, setEtiquette] = useState("");
  const [chargement, setChargement] = useState(true);

  // État des filtres d'export.
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [typesActifs, setTypesActifs] = useState<TypeEntree[]>(
    TYPES.map((t) => t.cle),
  );

  useEffect(() => {
    async function charger() {
      // Procédure active + ses enfants (sert au cloisonnement dans la fusion).
      const [procId, listeEnfants] = await Promise.all([
        getProcedureActiveId(),
        getEnfantsDeProcedureActive(),
      ]);

      // Étiquette de la procédure active (pour l'en-tête du PDF).
      if (procId) {
        const { data } = await supabase
          .from("procedures")
          .select("etiquette")
          .eq("id", procId)
          .single();
        setEtiquette(data?.etiquette?.trim() || "Procédure sans nom");
      }

      // On charge les 6 sources en lecture seule (la RLS limite déjà à l'utilisateur).
      // Le cloisonnement par procédure est fait par fusionnerChronologie / collecterTimeline.
      const [evRes, frRes, peRes, prRes, docRes, gaRes] = await Promise.all([
        supabase
          .from("events")
          .select(
            "id, titre, categorie, date_evenement, heure_evenement, description_factuelle, child_id",
          ),
        supabase
          .from("expenses")
          .select("id, libelle, categorie, montant, date_frais, rembourse, child_id"),
        supabase
          .from("pension_payments")
          .select("id, mois_du, montant_du, montant_paye, date_paiement, notes, procedure_id"),
        supabase
          .from("preuves_photo")
          .select("id, titre, description, enfant_id, created_at, horodatage_statut"),
        supabase
          .from("documents")
          .select("id, libelle, categorie, date_document, child_id")
          .eq("etat", "actif"),
        supabase
          .from("garde_regles")
          .select("id, type_garde, date_reference, enfant_id")
          .eq("actif", true),
      ]);

      const sources = {
        faits: (evRes.data ?? []) as FaitSource[],
        frais: (frRes.data ?? []) as FraisSource[],
        pensions: (peRes.data ?? []) as PensionSource[],
        preuves: (prRes.data ?? []) as PreuveSource[],
      };
      const contexte = {
        procedureId: procId,
        enfantIds: listeEnfants.map((e) => e.id),
      };

      // Export PDF/CSV : inchangé, toujours sur les 4 sources historiques.
      const resultat = fusionnerChronologie(sources, contexte);

      // Affichage : timeline centrale enrichie (documents + règles de garde).
      const items = collecterTimeline(
        {
          ...sources,
          documents: (docRes.data ?? []) as DocumentSource[],
          gardes: (gaRes.data ?? []) as GardeSource[],
        },
        contexte,
      );

      setEnfants(listeEnfants);
      setEntrees(resultat);
      setTimelineItems(items);
      setChargement(false);
    }
    charger();
  }, []);

  // Coche / décoche un type dans les filtres.
  function basculerType(cle: TypeEntree) {
    setTypesActifs((prev) =>
      prev.includes(cle) ? prev.filter((t) => t !== cle) : [...prev, cle],
    );
  }

  // Résolveur id d'enfant → nom (jamais appelé avec null par la fonction pure).
  function nomEnfant(id: string): string {
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? "—";
  }

  // Filtre/formate les entrées avec les MÊMES filtres que le PDF.
  // Réutilisé par l'export PDF et l'export CSV pour garantir un contenu identique.
  function lignesFiltrees(): string[][] {
    return filtrerEtFormaterPourPdf(
      entrees,
      { du: du || undefined, au: au || undefined, types: typesActifs },
      nomEnfant,
    );
  }

  // Clic export PDF : on filtre/formate en mémoire, puis on génère le PDF.
  function exporter() {
    genererPdfChronologie(lignesFiltrees(), {
      du: du || undefined,
      au: au || undefined,
      etiquetteProcedure: etiquette || undefined,
    });
  }

  // Clic export CSV : mêmes lignes que le PDF, construites en CSV puis téléchargées.
  function exporterCsv() {
    const csv = construireCsvChronologie(lignesFiltrees(), {
      du: du || undefined,
      au: au || undefined,
      etiquetteProcedure: etiquette || undefined,
    });
    const nomFichier = `chronologie-parent-preuve-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  return (
    <main>
      <PageHeader
        eyebrow="Mon dossier"
        title="Chronologie"
        subtitle="Vos faits, frais, paiements de pension et preuves de la procédure active, réunis sur une seule frise datée."
      />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {chargement ? (
          <p className="text-texte-doux">Chargement…</p>
        ) : (
          <>
            {/* Encart : filtres d'export */}
            <div className="carte mb-8 rounded-xl bg-[var(--surface)] p-5">
              <p className="text-sm text-texte-doux">
                Exportez la frise en PDF ou en CSV. Choisissez une période
                (facultatif) et les types à inclure. L'affichage ci-dessous
                n'est pas modifié.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium">Du</label>
                  <input
                    type="date"
                    value={du}
                    onChange={(e) => setDu(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Au</label>
                  <input
                    type="date"
                    value={au}
                    onChange={(e) => setAu(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                {TYPES.map((t) => (
                  <label key={t.cle} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={typesActifs.includes(t.cle)}
                      onChange={() => basculerType(t.cle)}
                    />
                    {t.label}
                  </label>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={exporter}
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
                >
                  Exporter la frise en PDF
                </button>
                <button
                  onClick={exporterCsv}
                  className="rounded-lg border border-[#15233F] px-5 py-2 text-[#15233F] hover:bg-[#15233F] hover:text-white"
                >
                  Exporter en CSV
                </button>
              </div>
            </div>

            {/* Timeline centrale : agrégation lecture seule des 6 sources */}
            <TimelineDossier items={timelineItems} enfants={enfants} />
          </>
        )}
      </div>
    </main>
  );
                    }
