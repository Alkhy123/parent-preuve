"use client";

// app/calendrier/avance/page.tsx
//
// Aperçu du calendrier AVANCÉ (bêta). Séparé de /calendrier : ne remplace pas
// le calendrier actuel. Lecture seule en base (règle garde_regles existante,
// cloisonnée sur la procédure active). Les options avancées (mercredi,
// exceptions) sont locales et non persistées dans ce sous-bloc.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";
import PreviewCalendrierAvance from "@/components/calendrier/PreviewCalendrierAvance";
import { calculerPlanningAvance } from "@/lib/calendrier/calculerPlanningAvance";
import type {
  ChezQui,
  ExceptionGarde,
  JourFerie,
  PeriodeVacances,
  ReglePlanning,
} from "@/lib/calendrier/types";

// Date locale -> "YYYY-MM-DD".
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Enfant = { id: string; prenom_ou_alias: string };

type RegleDb = {
  parent_principal: "moi" | "autre";
  date_reference: string;
  jour_debut: number;
  heure_debut: string;
  jour_fin: number;
  heure_fin: string;
};

const champ = "w-full rounded-md border border-gray-300 bg-white text-[#1F2733] p-2";
const labelCss = "block text-sm font-medium text-[#1F2733] mb-1";

export default function CalendrierAvancePage() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [enfantId, setEnfantId] = useState("");
  const [regle, setRegle] = useState<RegleDb | null>(null);
  const [chargement, setChargement] = useState(true);

  // Options avancées locales (non persistées dans ce sous-bloc).
  const [mercredi, setMercredi] = useState(false);
  const [exceptions, setExceptions] = useState<ExceptionGarde[]>([]);

  // Zones + annotations (vacances scolaires, jours fériés) via les routes serveur.
  const [zoneVacances, setZoneVacances] = useState("A");
  const [zoneFerie, setZoneFerie] = useState("metropole");
  const [vacances, setVacances] = useState<PeriodeVacances[]>([]);
  const [joursFeries, setJoursFeries] = useState<JourFerie[]>([]);

  // Plage affichée : aujourd'hui -> +8 semaines (stable sur la session).
  const [du, au] = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const a = new Date(d);
    a.setDate(a.getDate() + 56);
    return [d, a] as const;
  }, []);

  // Formulaire d'exception manuelle.
  const [excDebut, setExcDebut] = useState("");
  const [excFin, setExcFin] = useState("");
  const [excChezQui, setExcChezQui] = useState<ChezQui>("moi");
  const [excMotif, setExcMotif] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getEnfantsDeProcedureActive();
      setEnfants(data);
      if (data.length > 0) setEnfantId(data[0].id);
      else setChargement(false);
    })();
  }, []);

  useEffect(() => {
    if (!enfantId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChargement(true);
    (async () => {
      const { data } = await supabase
        .from("garde_regles")
        .select("parent_principal, date_reference, jour_debut, heure_debut, jour_fin, heure_fin")
        .eq("enfant_id", enfantId)
        .eq("actif", true)
        .maybeSingle();
      setRegle((data as RegleDb) ?? null);
      setChargement(false);
    })();
  }, [enfantId]);

  // Annotations (vacances + jours fériés) via les routes serveur. Tout échec
  // est silencieux (fallback []) : l'aperçu reste fonctionnel sans annotations.
  useEffect(() => {
    let annule = false;
    (async () => {
      // Jours fériés : pour chaque année couverte par la plage.
      const annees = Array.from(new Set([du.getFullYear(), au.getFullYear()]));
      const feries: JourFerie[] = [];
      for (const an of annees) {
        try {
          const r = await fetch(`/api/calendrier/jours-feries?annee=${an}&zone=${zoneFerie}`);
          if (r.ok) {
            const j = await r.json();
            if (Array.isArray(j.data)) feries.push(...j.data);
          }
        } catch {
          /* silencieux : fallback */
        }
      }
      if (!annule) setJoursFeries(feries);

      // Vacances scolaires sur la plage.
      try {
        const r = await fetch(
          `/api/calendrier/vacances?zone=${zoneVacances}&du=${iso(du)}&au=${iso(au)}`,
        );
        const j = r.ok ? await r.json() : { data: [] };
        if (!annule) setVacances(Array.isArray(j.data) ? j.data : []);
      } catch {
        if (!annule) setVacances([]);
      }
    })();
    return () => {
      annule = true;
    };
  }, [du, au, zoneVacances, zoneFerie]);

  // Construit les règles avancées à partir de la règle existante + options.
  const planning = useMemo(() => {
    if (!regle) return null;

    // parent_principal "autre" -> l'enfant vit surtout chez l'autre -> mes week-ends de DVH.
    const chezQuiWeekend: ChezQui = regle.parent_principal === "autre" ? "moi" : "autre";
    const chezQuiParDefaut: ChezQui = regle.parent_principal === "autre" ? "autre" : "moi";

    const regles: ReglePlanning[] = [
      {
        type: "weekend_alterne",
        jourDebut: regle.jour_debut,
        heureDebut: (regle.heure_debut || "18:00").slice(0, 5),
        jourFin: regle.jour_fin,
        heureFin: (regle.heure_fin || "18:00").slice(0, 5),
        dateReference: regle.date_reference,
        chezQui: chezQuiWeekend,
      },
    ];

    if (mercredi) {
      regles.push({
        type: "hebdomadaire",
        jourDebut: 3, // mercredi
        heureDebut: "09:00",
        jourFin: 3,
        heureFin: "19:00",
        chezQui: chezQuiWeekend,
      });
    }

    return calculerPlanningAvance({
      regles,
      exceptions,
      chezQuiParDefaut,
      vacances,
      joursFeries,
      du,
      au,
    });
  }, [regle, mercredi, exceptions, vacances, joursFeries, du, au]);

  function ajouterException() {
    if (!excDebut || !excFin) return;
    setExceptions((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        debut: excDebut,
        fin: excFin,
        chezQui: excChezQui,
        motif: excMotif.trim() || undefined,
      },
    ]);
    setExcDebut("");
    setExcFin("");
    setExcMotif("");
  }

  function retirerException(id: string) {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC]">
      <PageHeader
        eyebrow="Organisation"
        title="Calendrier avancé (bêta)"
        subtitle="Aperçu d'un planning enrichi (mercredi, exceptions). N'affecte pas votre calendrier actuel."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <p className="text-sm text-texte-doux">
          Ceci est un aperçu. Il ne modifie rien : votre règle reste gérée dans{" "}
          <Link href="/calendrier" className="text-or-fonce underline">
            le calendrier de garde
          </Link>
          .
        </p>

        {enfants.length === 0 ? (
          <p className="text-[#1F2733]">
            Ajoutez d&apos;abord un enfant dans la rubrique « Enfants ».
          </p>
        ) : (
          <>
            <div>
              <label className={labelCss}>Enfant</label>
              <select
                value={enfantId}
                onChange={(e) => setEnfantId(e.target.value)}
                className={champ}
              >
                {enfants.map((en) => (
                  <option key={en.id} value={en.id}>
                    {en.prenom_ou_alias}
                  </option>
                ))}
              </select>
            </div>

            {chargement ? (
              <p className="text-sm text-texte-doux">Chargement…</p>
            ) : !regle ? (
              <p className="text-sm text-texte-doux">
                Aucune règle pour cet enfant. Créez-la d&apos;abord dans{" "}
                <Link href="/calendrier" className="text-or-fonce underline">
                  le calendrier de garde
                </Link>
                .
              </p>
            ) : (
              <>
                {/* Options avancées (locales) */}
                <div className="carte rounded-xl bg-white p-5 space-y-4">
                  <label className="flex items-center gap-2 text-sm text-[#1F2733]">
                    <input
                      type="checkbox"
                      checked={mercredi}
                      onChange={(e) => setMercredi(e.target.checked)}
                    />
                    Ajouter le mercredi (journée de DVH)
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelCss}>Zone de vacances scolaires</label>
                      <select
                        value={zoneVacances}
                        onChange={(e) => setZoneVacances(e.target.value)}
                        className={champ}
                      >
                        <option value="A">Zone A</option>
                        <option value="B">Zone B</option>
                        <option value="C">Zone C</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCss}>Zone des jours fériés</label>
                      <select
                        value={zoneFerie}
                        onChange={(e) => setZoneFerie(e.target.value)}
                        className={champ}
                      >
                        <option value="metropole">Métropole</option>
                        <option value="alsace-moselle">Alsace-Moselle</option>
                        <option value="guadeloupe">Guadeloupe</option>
                        <option value="guyane">Guyane</option>
                        <option value="martinique">Martinique</option>
                        <option value="mayotte">Mayotte</option>
                        <option value="la-reunion">La Réunion</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm font-medium text-[#1F2733]">
                      Exception manuelle
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelCss}>Du</label>
                        <input
                          type="date"
                          value={excDebut}
                          onChange={(e) => setExcDebut(e.target.value)}
                          className={champ}
                        />
                      </div>
                      <div>
                        <label className={labelCss}>Au</label>
                        <input
                          type="date"
                          value={excFin}
                          onChange={(e) => setExcFin(e.target.value)}
                          className={champ}
                        />
                      </div>
                      <div>
                        <label className={labelCss}>Chez qui</label>
                        <select
                          value={excChezQui}
                          onChange={(e) => setExcChezQui(e.target.value as ChezQui)}
                          className={champ}
                        >
                          <option value="moi">Chez moi</option>
                          <option value="autre">Chez l&apos;autre parent</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCss}>Motif (facultatif)</label>
                        <input
                          type="text"
                          value={excMotif}
                          onChange={(e) => setExcMotif(e.target.value)}
                          placeholder="Ex : vacances, événement familial"
                          className={champ}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={ajouterException}
                      className="btn btn-secondaire mt-3"
                    >
                      Ajouter l&apos;exception
                    </button>

                    {exceptions.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {exceptions.map((ex) => (
                          <li
                            key={ex.id}
                            className="flex items-center justify-between gap-3 text-sm text-texte-doux"
                          >
                            <span>
                              {ex.debut} → {ex.fin} ·{" "}
                              {ex.chezQui === "moi" ? "chez moi" : "chez l'autre"}
                              {ex.motif ? ` · ${ex.motif}` : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => retirerException(ex.id)}
                              className="text-rouge hover:underline"
                            >
                              Retirer
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {planning && <PreviewCalendrierAvance planning={planning} />}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
