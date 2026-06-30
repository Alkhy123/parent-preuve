"use client";

// components/onboarding/EtapeCalendrier.tsx
//
// Etape 7 : calendrier de garde (un week-end sur deux), par enfant de la
// procedure active. Reutilise le moteur existant (lib/gardeCalendrier) pour
// l'apercu et ecrit dans la table `garde_regles`, comme la page /calendrier.
//
// Si le DVH actif est mediatise, on propose en plus un calendrier cliquable
// pour cocher les dates de visite prevues par le centre (CalendrierVisites).
// Pas de calendrier avance ici (bloc 07).

import { useEffect, useState } from "react";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import { supabase } from "@/lib/supabase";
import {
  getEnfantsDeProcedureActive,
  getProcedureActiveId,
} from "@/lib/procedureActive";
import { prochainsWeekends, JOURS, type RegleGarde } from "@/lib/gardeCalendrier";
import CalendrierVisites from "@/components/onboarding/CalendrierVisites";

type Enfant = { id: string; prenom_ou_alias: string };

const champCss =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-ring)] focus:outline-none focus:ring-1 focus:ring-[var(--app-ring)]";
const labelCss = "text-sm font-medium text-[var(--app-text)]";

export default function EtapeCalendrier({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [enfantId, setEnfantId] = useState("");
  const [regleId, setRegleId] = useState<string | null>(null);

  const [parentPrincipal, setParentPrincipal] = useState<"moi" | "autre">("autre");
  const [dateReference, setDateReference] = useState("");
  const [jourDebut, setJourDebut] = useState(5);
  const [heureDebut, setHeureDebut] = useState("18:00");
  const [jourFin, setJourFin] = useState(7);
  const [heureFin, setHeureFin] = useState("18:00");
  const [notes, setNotes] = useState("");

  const [chargement, setChargement] = useState(true);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState("");

  // Le DVH actif est-il mediatise ? (active alors le calendrier de visites)
  const [mediatise, setMediatise] = useState(false);

  // 1) enfants de la procedure active + nature du DVH
  useEffect(() => {
    let annule = false;
    (async () => {
      const data = await getEnfantsDeProcedureActive();
      if (annule) return;
      setEnfants(data);
      if (data.length > 0) setEnfantId(data[0].id);

      const procId = await getProcedureActiveId();
      if (procId) {
        const { data: dvh } = await supabase
          .from("dvh_regle")
          .select("type_dvh")
          .eq("procedure_id", procId)
          .eq("actif", true)
          .maybeSingle();
        if (!annule && dvh?.type_dvh === "mediatise") setMediatise(true);
      }
      if (!annule) setChargement(false);
    })();
    return () => {
      annule = true;
    };
  }, []);

  // 2) a chaque changement d'enfant, charger sa regle (ou remettre les defauts)
  useEffect(() => {
    if (!enfantId) return;
    let annule = false;
    (async () => {
      const { data } = await supabase
        .from("garde_regles")
        .select("*")
        .eq("enfant_id", enfantId)
        .eq("actif", true)
        .maybeSingle();
      if (annule) return;
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
    return () => {
      annule = true;
    };
  }, [enfantId]);

  async function enregistrer() {
    if (!enfantId) return setMessage("Choisissez d'abord un enfant.");
    if (!dateReference) return setMessage("Indiquez une date de référence.");

    setOccupe(true);
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
      ({ error: erreur } = await supabase
        .from("garde_regles")
        .update(valeurs)
        .eq("id", regleId));
    } else {
      const { data, error } = await supabase
        .from("garde_regles")
        .insert(valeurs)
        .select("id")
        .single();
      erreur = error;
      if (data) setRegleId(data.id);
    }

    setOccupe(false);
    setMessage(erreur ? "Erreur : " + erreur.message : "Règle enregistrée ✓");
  }

  const regleCourante: RegleGarde | null = dateReference
    ? {
        type_garde: "weekend_sur_deux",
        parent_principal: parentPrincipal,
        date_reference: dateReference,
        jour_debut: jourDebut,
        heure_debut: heureDebut,
        jour_fin: jourFin,
        heure_fin: heureFin,
      }
    : null;

  const apercu = regleCourante ? prochainsWeekends(regleCourante, 4) : [];
  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  if (chargement) {
    return <p className="text-sm text-[var(--app-text-muted)]">Chargement…</p>;
  }

  if (enfants.length === 0) {
    return (
      <div>
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aucun enfant dans la procédure active. Revenez à l&apos;étape « Enfants » pour
          en ajouter, ou continuez : vous pourrez renseigner le calendrier plus tard.
        </div>
        <PiedEtape
          onPrecedent={onPrecedent}
          estPremiere={estPremiere}
          onContinuer={onContinuer}
          libelleContinuer={
            estDerniere ? "Accéder à mon tableau de bord" : "Continuer"
          }
        />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[var(--app-text-muted)]">
        Enregistrez la règle « un week-end sur deux » pour chaque enfant. Vous pourrez
        l&apos;ajuster plus tard depuis « Calendrier de garde ».
      </p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className={labelCss}>Enfant</span>
          <select
            value={enfantId}
            onChange={(e) => setEnfantId(e.target.value)}
            className={champCss}
          >
            {enfants.map((en) => (
              <option key={en.id} value={en.id}>
                {en.prenom_ou_alias}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelCss}>Chez qui l&apos;enfant vit-il principalement ?</span>
          <select
            value={parentPrincipal}
            onChange={(e) => setParentPrincipal(e.target.value as "moi" | "autre")}
            className={champCss}
          >
            <option value="autre">Chez l&apos;autre parent (j&apos;ai le DVH)</option>
            <option value="moi">Chez moi (l&apos;autre parent a le DVH)</option>
          </select>
        </label>

        <label className="block">
          <span className={labelCss}>Date de référence (un week-end de garde connu)</span>
          <input
            type="date"
            value={dateReference}
            onChange={(e) => setDateReference(e.target.value)}
            className={champCss}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCss}>Début — jour</span>
            <select
              value={jourDebut}
              onChange={(e) => setJourDebut(Number(e.target.value))}
              className={champCss}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <option key={j} value={j}>
                  {JOURS[j]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCss}>Début — heure</span>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className={champCss}
            />
          </label>
          <label className="block">
            <span className={labelCss}>Fin — jour</span>
            <select
              value={jourFin}
              onChange={(e) => setJourFin(Number(e.target.value))}
              className={champCss}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <option key={j} value={j}>
                  {JOURS[j]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCss}>Fin — heure</span>
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className={champCss}
            />
          </label>
        </div>

        <label className="block">
          <span className={labelCss}>Notes (facultatif)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={champCss}
          />
        </label>

        <button
          type="button"
          onClick={enregistrer}
          disabled={occupe}
          className="btn border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:opacity-50"
        >
          {occupe ? "Enregistrement…" : "Enregistrer la règle"}
        </button>

        {message && <p className="text-sm text-[var(--app-text)]">{message}</p>}
      </div>

      {apercu.length > 0 && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-display text-base text-[var(--app-text)]">Prochains week-ends</h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--app-text)]">
            {apercu.map((p, i) => (
              <li key={i}>
                Du {fmt(p.debut)} au {fmt(p.fin)} —{" "}
                {p.chezQui === "moi" ? "chez moi" : "chez l'autre parent"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visites mediatisees : le jugement ne fixe pas le calendrier, il est
          convenu avec le centre. L'utilisateur coche directement les dates. */}
      {mediatise && (
        <div className="mt-6 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
          <h3 className="font-display text-base text-[var(--app-text)]">Visites médiatisées</h3>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            Le droit de visite est médiatisé : le jugement ne fixe pas de calendrier, il
            est convenu avec le centre de visite. Cochez ci-dessous les dates de visite
            prévues pour {enfants.find((e) => e.id === enfantId)?.prenom_ou_alias ?? "cet enfant"}.
            Elles apparaîtront dans les rappels de votre accueil.
          </p>
          {enfantId && <CalendrierVisites enfantId={enfantId} />}
        </div>
      )}

      <PiedEtape
        onPrecedent={onPrecedent}
        estPremiere={estPremiere}
        onContinuer={onContinuer}
        libelleContinuer={estDerniere ? "Accéder à mon tableau de bord" : "Continuer"}
      />
    </div>
  );
}
