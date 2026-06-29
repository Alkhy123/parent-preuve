"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import TimelineDossier from "@/components/timeline/TimelineDossier";
import BrouillonsChronologieInfo from "@/components/timeline/BrouillonsChronologieInfo";
import ApercuExportChronologie from "@/components/chronologie/ApercuExportChronologie";
import EtatExportChronologie from "@/components/chronologie/EtatExportChronologie";

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

// Cases de filtre par type exportable PDF/CSV.
// Les exports historiques restent volontairement limités aux 4 sources déjà prévues.
const TYPES: { cle: TypeEntree; label: string }[] = [
  { cle: "fait", label: "Faits" },
  { cle: "frais", label: "Frais" },
  { cle: "pension", label: "Pension" },
  { cle: "preuve", label: "Preuves" },
];

const SOURCES_CHRONOLOGIE = [
  {
    titre: "Journal",
    texte: "Faits datés, incidents, remises d'enfant et observations factuelles.",
  },
  {
    titre: "Frais",
    texte: "Dépenses enregistrées, montants, statuts de remboursement et justificatifs associés.",
  },
  {
    titre: "Pension",
    texte: "Mois dus, montants payés, paiements partiels et écarts constatés.",
  },
  {
    titre: "Documents",
    texte: "Pièces classées dans le dossier actif : factures, courriers, décisions ou justificatifs.",
  },
  {
    titre: "Preuves photo",
    texte: "Photos conservées dans l'application avec leurs informations de suivi.",
  },
  {
    titre: "Règles de garde",
    texte: "Règles actuellement connues pour les enfants de la procédure active.",
  },
];

const POINTS_CONTROLE = [
  "Vérifier les éléments sans date ou avec une date approximative.",
  "Relire les titres pour garder une formulation courte et factuelle.",
  "Contrôler les frais, pensions et pièces avant de générer un export.",
];

const ETAPES_DOSSIER = [
  {
    titre: "1. Collecter",
    texte: "Ajouter rapidement une trace, un fait, une dépense ou un élément à compléter.",
    href: "/collecter/rapide",
    action: "Collecte rapide",
  },
  {
    titre: "2. Organiser",
    texte: "Relire les brouillons locaux et ouvrir le bon module avant enregistrement.",
    href: "/organiser/brouillons",
    action: "Voir les brouillons",
  },
  {
    titre: "3. Exporter",
    texte: "Préparer une chronologie ou un document de travail clair et daté.",
    href: "/exporter",
    action: "Préparer un export",
  },
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

  // Chargement (réutilisable) : sert au montage ET au rafraîchissement après
  // une action déclenchée depuis la modale de détail de la timeline.
  const charger = useCallback(async () => {
    setChargement(true);

    // Procédure active + ses enfants (sert au cloisonnement dans la fusion).
    const [procId, listeEnfants] = await Promise.all([
      getProcedureActiveId(),
      getEnfantsDeProcedureActive(),
    ]);

    // Sans procédure active : rien à afficher (cloisonnement strict).
    if (!procId) {
      setEnfants(listeEnfants);
      setEntrees([]);
      setTimelineItems([]);
      setChargement(false);
      return;
    }

    // Étiquette de la procédure active (pour l'en-tête du PDF).
    {
      const { data } = await supabase
        .from("procedures")
        .select("etiquette")
        .eq("id", procId)
        .single();

      setEtiquette(data?.etiquette?.trim() || "Procédure sans nom");
    }

    // Cloisonnement strict en base sur procedure_id pour les cinq sources
    // directement rattachées. garde_regles n'a pas encore de procedure_id
    // (étape E) : son cloisonnement reste par enfant dans collecterTimeline.
    const [evRes, frRes, peRes, prRes, docRes, gaRes] = await Promise.all([
      supabase
        .from("events")
        .select(
          "id, titre, categorie, date_evenement, heure_evenement, description_factuelle, child_id",
        )
        .eq("procedure_id", procId),

      supabase
        .from("expenses")
        .select("id, libelle, categorie, montant, date_frais, rembourse, child_id")
        .eq("procedure_id", procId),

      supabase
        .from("pension_payments")
        .select(
          "id, mois_du, montant_du, montant_paye, date_paiement, notes, procedure_id",
        )
        .eq("procedure_id", procId),

      supabase
        .from("preuves_photo")
        .select("id, titre, description, enfant_id, created_at, horodatage_statut")
        .eq("procedure_id", procId),

      supabase
        .from("documents")
        .select("id, libelle, categorie, date_document, child_id")
        .eq("procedure_id", procId)
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
  }, []);

  useEffect(() => {
    // charger() lance des requêtes async avant tout setState : pas de cascade synchrone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, [charger]);

  // Coche / décoche un type dans les filtres.
  function basculerType(cle: TypeEntree) {
    setTypesActifs((prev) =>
      prev.includes(cle) ? prev.filter((t) => t !== cle) : [...prev, cle],
    );
  }

  // Résolveur id d'enfant → nom (jamais appelé avec null par la fonction pure).
  function nomEnfant(id: string): string {
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? "-";
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
    const lignes = lignesFiltrees();

    if (lignes.length === 0) {
      return;
    }

    genererPdfChronologie(lignes, {
      du: du || undefined,
      au: au || undefined,
      etiquetteProcedure: etiquette || undefined,
    });
  }

  // Clic export CSV : mêmes lignes que le PDF, construites en CSV puis téléchargées.
  function exporterCsv() {
    const lignes = lignesFiltrees();

    if (lignes.length === 0) {
      return;
    }

    const csv = construireCsvChronologie(lignes, {
      du: du || undefined,
      au: au || undefined,
      etiquetteProcedure: etiquette || undefined,
    });

    const nomFichier = `chronologie-parent-preuve-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    telechargerCsv(csv, nomFichier);
  }

  const lignesExport = lignesFiltrees();
  const exportDesactive = lignesExport.length === 0;

  return (
    <AppShell
      titre="Chronologie"
      description="Relire les faits, frais, pensions, documents, preuves et regles de garde dans l ordre du dossier."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/organiser" variant="secondary">Retour Organiser</AppButtonLink>
          <AppButtonLink href="/exporter/chronologie" variant="secondary">Exporter</AppButtonLink>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl px-2 py-4">
        {chargement ? (
          <p className="text-texte-doux">Chargement...</p>
        ) : (
          <>
            <section className="carte mb-8 rounded-2xl bg-[var(--surface)] p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                    Lecture centrale du dossier
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-texte">
                    Comprendre ce qui s&apos;est passé, dans quel ordre, et avec
                    quelles pièces.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-texte-doux">
                    La chronologie rassemble les éléments déjà enregistrés dans
                    les modules de Parent Preuve. Elle sert à relire le dossier,
                    repérer les éléments à compléter et préparer un export de
                    travail. Elle ne crée aucune donnée automatiquement.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-texte-doux">
                  <p className="font-semibold text-texte">Procédure affichée</p>
                  <p className="mt-1">{etiquette || "Procédure active"}</p>
                  <p className="mt-3">
                    {timelineItems.length} élément
                    {timelineItems.length > 1 ? "s" : ""} dans la lecture
                    chronologique.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {ETAPES_DOSSIER.map((etape) => (
                  <div
                    key={etape.titre}
                    className="rounded-xl border border-slate-200 bg-white/70 p-4"
                  >
                    <h3 className="font-semibold text-texte">{etape.titre}</h3>
                    <p className="mt-2 text-sm leading-6 text-texte-doux">
                      {etape.texte}
                    </p>
                    <AppButtonLink href={etape.href} variant="secondary">
                      {etape.action}
                    </AppButtonLink>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="carte rounded-2xl bg-[var(--surface)] p-6">
                <h2 className="text-xl font-bold text-texte">
                  Ce que rassemble la chronologie
                </h2>

                <p className="mt-2 text-sm leading-6 text-texte-doux">
                  Les sources ci-dessous sont agrégées en lecture seule. Pour
                  modifier un élément, ouvrez le module d&apos;origine depuis le
                  détail de la ligne.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {SOURCES_CHRONOLOGIE.map((source) => (
                    <div
                      key={source.titre}
                      className="rounded-xl border border-slate-200 bg-white/70 p-4"
                    >
                      <p className="font-semibold text-texte">{source.titre}</p>
                      <p className="mt-1 text-sm leading-6 text-texte-doux">
                        {source.texte}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="carte rounded-2xl bg-[var(--surface)] p-6">
                <h2 className="text-xl font-bold text-texte">
                  À vérifier avant export
                </h2>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-texte-doux">
                  {POINTS_CONTROLE.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span aria-hidden="true">-</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <AppNotice titre="Brouillons locaux">
                  Les brouillons locaux issus de la collecte rapide ne sont pas
                  encore integres automatiquement a la chronologie. Ils doivent
                  etre relus, ouverts dans le bon module, puis enregistres
                  manuellement.
                </AppNotice>
              </aside>
            </section>

            {/* Encart : filtres d'export */}
            <section className="carte mb-8 rounded-2xl bg-[var(--surface)] p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-texte">
                    Exporter une chronologie de travail
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-texte-doux">
                    Choisissez une période facultative et les types à inclure.
                    Ces filtres concernent l&apos;export PDF ou CSV. L&apos;affichage
                    détaillé ci-dessous reste inchangé.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <ApercuExportChronologie lignes={lignesExport} />
              <EtatExportChronologie lignes={lignesExport} />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exporter}
                  disabled={exportDesactive}
                  className={
                    exportDesactive
                      ? "cursor-not-allowed rounded-lg bg-slate-300 px-5 py-2 text-slate-600"
                      : "rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
                  }
                >
                  Exporter la frise en PDF
                </button>

                <button
                  type="button"
                  onClick={exporterCsv}
                  disabled={exportDesactive}
                  className={
                    exportDesactive
                      ? "cursor-not-allowed rounded-lg border border-slate-200 px-5 py-2 text-slate-400"
                      : "rounded-lg border border-[#15233F] px-5 py-2 text-[#15233F] hover:bg-[#15233F] hover:text-white"
                  }
                >
                  Exporter en CSV
                </button>
              </div>

              <AppNotice titre="Export a relire">
                Cet export est un document de travail. A relire et verifier avant tout usage. Il ne constitue pas un avis juridique.
              </AppNotice>
            </section>

            <BrouillonsChronologieInfo />

            {/* Timeline centrale : agrégation lecture seule des 6 sources */}
            <TimelineDossier
              items={timelineItems}
              enfants={enfants}
              onRecharger={charger}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
