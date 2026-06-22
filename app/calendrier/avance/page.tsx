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
  ReglePlanning,
} from "@/lib/calendrier/types";

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

    const du = new Date();
    du.setHours(0, 0, 0, 0);
    const au = new Date(du);
    au.setDate(au.getDate() + 56); // 8 semaines

    return calculerPlanningAvance({
      regles,
      exceptions,
      chezQuiParDefaut,
      du,
      au,
    });
  }, [regle, mercredi, exceptions]);

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
