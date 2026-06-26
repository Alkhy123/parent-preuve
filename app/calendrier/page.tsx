"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/app/AppShell";
import { Icon } from "@/components/apercu/icones";
import { JOURS, type RegleGarde } from "@/lib/gardeCalendrier";
import CalendrierMensuel from "@/components/CalendrierMensuel";
import RegleDVH from '@/components/RegleDVH';
import EncartPliable from "@/components/EncartPliable";
import { useEnfantsProcedureActive } from "@/lib/useEnfantsProcedureActive";
import SelecteurEnfantCalendrier from "@/components/calendrier/SelecteurEnfantCalendrier";
import SelecteurZoneVacances from "@/components/calendrier/SelecteurZoneVacances";
import ProchainsWeekendsCard from "@/components/calendrier/ProchainsWeekendsCard";
import EtatCalendrierVide from "@/components/calendrier/EtatCalendrierVide";
import { isoJourLocal } from "@/lib/calendrier/chevauchementVacances";
import type { PeriodeVacances } from "@/lib/calendrier/types";

const CLE_ZONE = "zone_vacances";

export default function CalendrierPage() {
  const { enfants, enfantId, setEnfantId, chargementEnfants } = useEnfantsProcedureActive();
  const [regleId, setRegleId] = useState<string | null>(null);

  const [parentPrincipal, setParentPrincipal] = useState<"moi" | "autre">("autre");
  const [dateReference, setDateReference] = useState("");
  const [jourDebut, setJourDebut] = useState(5);
  const [heureDebut, setHeureDebut] = useState("18:00");
  const [jourFin, setJourFin] = useState(7);
  const [heureFin, setHeureFin] = useState("18:00");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [signalFermeture, setSignalFermeture] = useState(0);
  const [chargement, setChargement] = useState(false);

  // Zone de vacances scolaires (A/B/C), memorisee en local. Sert UNIQUEMENT a
  // annoter le calendrier : on n'attribue jamais la garde des vacances (le
  // jugement la fixe). Lecture paresseuse au 1er rendu (garde SSR).
  const [zoneVacances, setZoneVacances] = useState<string>(() => {
    if (typeof window === "undefined") return "A";
    try {
      const z = window.localStorage.getItem(CLE_ZONE);
      return z === "A" || z === "B" || z === "C" ? z : "A";
    } catch {
      return "A";
    }
  });
  const [vacances, setVacances] = useState<PeriodeVacances[]>([]);

  // Enfants de la procédure active : résolus par le hook partagé
  // (cloisonnement procedure_id inchangé, garde de chargement incluse).

  function changerZone(z: string) {
    setZoneVacances(z);
    try {
      window.localStorage.setItem(CLE_ZONE, z);
    } catch {
      /* ignore */
    }
  }

  // Vacances scolaires de la zone, sur ~1 an : annotations seulement.
  // Tout echec est silencieux (fallback []) : le calendrier reste fonctionnel.
  useEffect(() => {
    let annule = false;
    (async () => {
      const du = new Date();
      du.setHours(0, 0, 0, 0);
      const au = new Date(du);
      au.setFullYear(au.getFullYear() + 1);
      try {
        const r = await fetch(
          `/api/calendrier/vacances?zone=${zoneVacances}&du=${isoJourLocal(du)}&au=${isoJourLocal(au)}`
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
  }, [zoneVacances]);

  // 2) à chaque changement d'enfant, charger sa règle (ou remettre les défauts)
  useEffect(() => {
    if (!enfantId) return;
    (async () => {
      const { data } = await supabase
        .from("garde_regles")
        .select("*")
        .eq("enfant_id", enfantId)
        .eq("actif", true)
        .maybeSingle();

      if (data) {
        setRegleId(data.id);
        setParentPrincipal(data.parent_principal);
        setDateReference(data.date_reference);
        setJourDebut(data.jour_debut);
        setHeureDebut((data.heure_debut || "18:00").slice(0, 5));
        setJourFin(data.jour_fin);
        setHeureFin((data.heure_fin || "18:00").slice(0, 5));
        setNotes(data.notes || "");
      } else {
        setRegleId(null);
        setParentPrincipal("autre");
        setDateReference("");
        setJourDebut(5);
        setHeureDebut("18:00");
        setJourFin(7);
        setHeureFin("18:00");
        setNotes("");
      }
      setMessage("");
    })();
  }, [enfantId]);

  // 3) enregistrer
  async function enregistrer() {
    if (!enfantId) return setMessage("Choisis d'abord un enfant.");
    if (!dateReference) return setMessage("Indique une date de référence.");

    setChargement(true);
    const valeurs = {
      enfant_id: enfantId,
      type_garde: "weekend_sur_deux",
      parent_principal: parentPrincipal,
      date_reference: dateReference,
      jour_debut: jourDebut,
      heure_debut: heureDebut,
      jour_fin: jourFin,
      heure_fin: heureFin,
      notes: notes || null,
      source: "manuel",
      valide: true,
      actif: true,
    };

    let erreur;
    if (regleId) {
      ({ error: erreur } = await supabase.from("garde_regles").update(valeurs).eq("id", regleId));
    } else {
      const { data, error } = await supabase
        .from("garde_regles")
        .insert(valeurs)
        .select("id")
        .single();
      erreur = error;
      if (data) setRegleId(data.id);
    }

    setChargement(false);
    setMessage(erreur ? "Erreur : " + erreur.message : "Règle enregistrée ✓");
    if (!erreur) setSignalFermeture((n) => n + 1);
  }

  // aperçu calculé en direct depuis le formulaire
  const regleCourante: RegleGarde | null = dateReference
    ? {
        type_garde: "weekend_sur_deux",
        parent_principal: parentPrincipal,
        date_reference: dateReference,
        jour_debut: jourDebut,
        heure_debut: heureDebut,
        jour_fin: jourFin,
        heure_fin: heureFin,
      } as RegleGarde
    : null;

  const champ = "w-full rounded-md border border-slate-300 bg-white text-[#1F2733] p-2";
  const labelCss = "block text-sm font-medium text-[#1F2733] mb-1";

  return (
    <AppShell
      activeModule="calendrier"
      title="Calendrier"
      subtitle="Règle de garde et prochaines périodes, par enfant."
      copilotContext="calendrier"
      actions={
        <Link
          href="/calendrier/avance"
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition"
          style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
        >
          <Icon name="calendrier" className="h-4 w-4" />
          Calendrier avancé (bêta)
        </Link>
      }
    >
      <div className="space-y-6">
        <RegleDVH />

        {chargementEnfants || enfants.length === 0 ? (
          <EtatCalendrierVide chargement={chargementEnfants} />
        ) : (
          <>
            <div className="app-cols-2">
              <div className="space-y-6">
            <SelecteurEnfantCalendrier
              enfants={enfants}
              value={enfantId}
              onChange={setEnfantId}
              label="Enfant concerné"
              enCarte
              aide="Règle déclarée pour cet enfant. À vérifier avec votre jugement ou vos documents : ces informations ne constituent pas un conseil juridique."
            />

            <EncartPliable
              titre="Règle de garde"
              pliable={regleId !== null}
              replieParDefaut={regleId !== null}
              signalFermeture={signalFermeture}
              idPersistance="garde-calendrier"
            >
              <div className="space-y-4">

              <div>
                <label className={labelCss}>Chez qui l&apos;enfant vit-il principalement ?</label>
                <select
                  value={parentPrincipal}
                  onChange={(e) => setParentPrincipal(e.target.value as "moi" | "autre")}
                  className={champ}
                >
                  <option value="autre">Chez l&apos;autre parent (j&apos;ai le DVH)</option>
                  <option value="moi">Chez moi (l&apos;autre parent a le DVH)</option>
                </select>
              </div>

              <div>
                <label className={labelCss}>Date de référence (un week-end de garde connu)</label>
                <input type="date" value={dateReference} onChange={(e) => setDateReference(e.target.value)} className={champ} />
                <p className="text-xs text-slate-500 mt-1">
                  Indique un vendredi (ou samedi/dimanche) où l&apos;enfant est en garde.
                  Les week-ends suivants seront calculés un sur deux.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCss}>Début — jour</label>
                  <select value={jourDebut} onChange={(e) => setJourDebut(Number(e.target.value))} className={champ}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => <option key={j} value={j}>{JOURS[j]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCss}>Début — heure</label>
                  <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} className={champ} />
                </div>
                <div>
                  <label className={labelCss}>Fin — jour</label>
                  <select value={jourFin} onChange={(e) => setJourFin(Number(e.target.value))} className={champ}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => <option key={j} value={j}>{JOURS[j]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCss}>Fin — heure</label>
                  <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} className={champ} />
                </div>
              </div>

              <div>
                <label className={labelCss}>Notes (facultatif)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={champ} />
              </div>

              <button
                onClick={enregistrer}
                disabled={chargement}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ backgroundColor: "var(--app-primary)" }}
              >
                {chargement ? "Enregistrement…" : "Enregistrer la règle"}
              </button>

              {message && <p className="text-sm" style={{ color: "var(--app-text)" }}>{message}</p>}
              </div>
            </EncartPliable>
              </div>

              <div className="space-y-6">
            <SelecteurZoneVacances value={zoneVacances} onChange={changerZone} />

            <ProchainsWeekendsCard regle={regleCourante} vacances={vacances} />
              </div>
            </div>
          <CalendrierMensuel regle={regleCourante} vacances={vacances} />
          </>
        )}
      </div>
    </AppShell>
  );
}
