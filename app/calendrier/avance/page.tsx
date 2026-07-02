"use client";

// app/calendrier/avance/page.tsx
//
// Aperçu du calendrier AVANCÉ (bêta). Séparé de /calendrier : ne remplace pas
// le calendrier actuel. La règle de base (garde_regles) est lue en lecture
// seule ; les règles avancées (mercredi) et les exceptions sont PERSISTÉES
// dans calendar_advanced_rules / calendar_exceptions (cloisonnées par enfant).

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/app/AppShell";
import AppButtonLink from "@/components/app/AppButtonLink";
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";
import PreviewCalendrierAvance from "@/components/calendrier/PreviewCalendrierAvance";
import { calculerPlanningAvance } from "@/lib/calendrier/calculerPlanningAvance";
import {
  chargerExceptions,
  ajouterException as ajouterExceptionDb,
  supprimerException as supprimerExceptionDb,
} from "@/lib/calendrier/exceptions";
import {
  chargerReglesAvancees,
  ajouterRegleAvancee,
  supprimerRegleAvancee,
  type RegleAvanceeStockee,
} from "@/lib/calendrier/reglesAvancees";
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

const JOURS = ["", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

// Libellé lisible d'une règle avancée (pour la liste « Retirer »).
function libelleRegleAvancee(regle: ReglePlanning): string {
  const chez = regle.chezQui === "moi" ? "chez moi" : "chez l'autre parent";
  if (regle.type === "hebdomadaire") {
    const j = JOURS[regle.jourDebut] ?? "jour";
    return `${j.charAt(0).toUpperCase()}${j.slice(1)} (${chez})`;
  }
  if (regle.type === "weekend_alterne") return `Week-end sur deux (${chez})`;
  return `Semaines alternées (${chez})`;
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

  // Règles avancées + exceptions PERSISTÉES (chargées par enfant).
  const [reglesAvancees, setReglesAvancees] = useState<RegleAvanceeStockee[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionGarde[]>([]);
  const [enErreur, setEnErreur] = useState("");

  // La case « mercredi » reflète l'existence d'une règle hebdomadaire le mercredi.
  const mercrediStocke = reglesAvancees.find(
    (r) => r.regle.type === "hebdomadaire" && r.regle.jourDebut === 3,
  );
  const mercredi = !!mercrediStocke;

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
      // Règles avancées + exceptions persistées de cet enfant.
      const [rav, exc] = await Promise.all([
        chargerReglesAvancees(enfantId),
        chargerExceptions(enfantId),
      ]);
      setReglesAvancees(rav);
      setExceptions(exc);
      setChargement(false);
    })();
  }, [enfantId]);

  // Recharge les éléments persistés après une écriture.
  async function rechargerPersistance() {
    if (!enfantId) return;
    const [rav, exc] = await Promise.all([
      chargerReglesAvancees(enfantId),
      chargerExceptions(enfantId),
    ]);
    setReglesAvancees(rav);
    setExceptions(exc);
  }

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
      // Règles avancées persistées (mercredi, etc.).
      ...reglesAvancees.map((r) => r.regle),
    ];

    return calculerPlanningAvance({
      regles,
      exceptions,
      chezQuiParDefaut,
      vacances,
      joursFeries,
      du,
      au,
    });
  }, [regle, reglesAvancees, exceptions, vacances, joursFeries, du, au]);

  // Active/désactive la règle « mercredi » persistée.
  async function basculerMercredi(actif: boolean) {
    if (!enfantId || !regle) return;
    setEnErreur("");
    const chezQui: ChezQui = regle.parent_principal === "autre" ? "moi" : "autre";
    if (actif) {
      const { error } = await ajouterRegleAvancee(enfantId, {
        type: "hebdomadaire",
        jourDebut: 3,
        heureDebut: "09:00",
        jourFin: 3,
        heureFin: "19:00",
        chezQui,
      });
      if (error) return setEnErreur(error);
    } else if (mercrediStocke) {
      const { error } = await supprimerRegleAvancee(mercrediStocke.id);
      if (error) return setEnErreur(error);
    }
    rechargerPersistance();
  }

  async function ajouterException() {
    if (!enfantId || !excDebut || !excFin) return;
    setEnErreur("");
    const { error } = await ajouterExceptionDb(enfantId, {
      debut: excDebut,
      fin: excFin,
      chezQui: excChezQui,
      motif: excMotif.trim() || undefined,
    });
    if (error) return setEnErreur(error);
    setExcDebut("");
    setExcFin("");
    setExcMotif("");
    rechargerPersistance();
  }

  async function retirerException(id: string) {
    setEnErreur("");
    const { error } = await supprimerExceptionDb(id);
    if (error) return setEnErreur(error);
    rechargerPersistance();
  }

  async function retirerRegleAvancee(id: string) {
    setEnErreur("");
    const { error } = await supprimerRegleAvancee(id);
    if (error) return setEnErreur(error);
    rechargerPersistance();
  }

  return (
    <AppShell
      titre="Calendrier avance"
      description="Tester les regles avancees, exceptions et annotations sans remplacer le calendrier principal."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/calendrier" variant="secondary">
            Retour Calendrier
          </AppButtonLink>
          <AppButtonLink href="/organiser" variant="secondary">
            Retour à Organiser
          </AppButtonLink>
        </div>
      }
    >
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <p className="text-sm text-texte-doux">
          La regle de base reste geree dans{" "}
          <a href="/calendrier" className="text-or-fonce underline">le calendrier de garde</a>
          . Ici, le mercredi et les exceptions sont enregistres pour cet enfant.
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
              <p className="text-sm text-texte-doux">Chargement...</p>
            ) : !regle ? (
              <p className="text-sm text-texte-doux">
                Aucune règle pour cet enfant. Créez-la d&apos;abord dans{" "}
                <a href="/calendrier" className="text-or-fonce underline">
                  le calendrier de garde
                </a>
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
                      onChange={(e) => basculerMercredi(e.target.checked)}
                    />
                    Ajouter le mercredi (journée de DVH)
                  </label>

                  {enErreur && <p className="text-sm text-rouge">{enErreur}</p>}

                  {reglesAvancees.length > 0 && (
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-sm font-medium text-[#1F2733]">
                        Règles avancées enregistrées
                      </p>
                      <ul className="mt-2 space-y-1">
                        {reglesAvancees.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center justify-between gap-3 text-sm text-texte-doux"
                          >
                            <span>{libelleRegleAvancee(r.regle)}</span>
                            <button
                              type="button"
                              onClick={() => retirerRegleAvancee(r.id)}
                              className="text-rouge hover:underline"
                            >
                              Retirer
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
    </AppShell>
  );
}
