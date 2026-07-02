"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import { prochainsWeekends, JOURS, type RegleGarde } from "@/lib/gardeCalendrier";
import CalendrierMensuel from "@/components/CalendrierMensuel";
import RegleDVH from '@/components/RegleDVH';
import EncartPliable from "@/components/EncartPliable";
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";
import {
  isoJourLocal,
  vacancesQuiChevauchent,
} from "@/lib/calendrier/chevauchementVacances";
import type { PeriodeVacances } from "@/lib/calendrier/types";

const CLE_ZONE = "zone_vacances";

type Enfant = { id: string; prenom_ou_alias: string };

export default function CalendrierPage() {
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

  // 1) charger les enfants DE LA PROCEDURE ACTIVE
  useEffect(() => {
    (async () => {
      const data = await getEnfantsDeProcedureActive();
      setEnfants(data);
      if (data.length > 0) setEnfantId(data[0].id);
    })();
  }, []);

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

  const apercu = regleCourante ? prochainsWeekends(regleCourante, 8) : [];

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const fmtHeure = (d: Date) =>
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const champ = "w-full rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] p-2";
  const labelCss = "block text-sm font-medium text-[var(--app-text)] mb-1";

  return (
    <AppShell
      titre="Calendrier"
      description="Visualiser les week-ends, les regles de garde et les periodes de vacances a verifier dans le dossier."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/organiser" variant="secondary">
            Retour à Organiser
          </AppButtonLink>
          <AppButtonLink href="/journal" variant="secondary">
            Noter un fait
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <RegleDVH />

        <div className="text-sm">
          <a href="/calendrier/avance" className="text-[#7A6326] underline">
            Aperçu du calendrier avancé (bêta)
          </a>
        </div>

        {enfants.length === 0 ? (
          <p className="text-[var(--app-text)]">Ajoute d&apos;abord un enfant dans la rubrique « Enfants ».</p>
        ) : (
          <>
            <div>
              <label className={labelCss}>Enfant</label>
              <select value={enfantId} onChange={(e) => setEnfantId(e.target.value)} className={champ}>
                {enfants.map((en) => (
                  <option key={en.id} value={en.id}>{en.prenom_ou_alias}</option>
                ))}
              </select>
            </div>

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
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">
                    Indique un vendredi (ou samedi/dimanche) où l&apos;enfant est en garde.
                    Les week-ends suivants seront calculés un sur deux.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCss}>Début - jour</label>
                    <select value={jourDebut} onChange={(e) => setJourDebut(Number(e.target.value))} className={champ}>
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => <option key={j} value={j}>{JOURS[j]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCss}>Début - heure</label>
                    <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} className={champ} />
                  </div>
                  <div>
                    <label className={labelCss}>Fin - jour</label>
                    <select value={jourFin} onChange={(e) => setJourFin(Number(e.target.value))} className={champ}>
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => <option key={j} value={j}>{JOURS[j]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCss}>Fin - heure</label>
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
                  className="rounded-md bg-[var(--app-primary)] px-5 py-2 text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)] disabled:opacity-50"
                >
                  {chargement ? "Enregistrement..." : "Enregistrer la règle"}
                </button>

                {message && <p className="text-sm text-[var(--app-text)]">{message}</p>}
              </div>
            </EncartPliable>

            <AppCard titre="Zone de vacances scolaires">
              <div className="space-y-2">
                <select
                  value={zoneVacances}
                  onChange={(e) => changerZone(e.target.value)}
                  className={champ}
                >
                  <option value="A">Zone A</option>
                  <option value="B">Zone B</option>
                  <option value="C">Zone C</option>
                </select>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Zone A : Besançon, Bordeaux, Clermont-Ferrand, Dijon, Grenoble, Limoges,
                  Lyon, Poitiers. Zone B : Aix-Marseille, Amiens, Lille, Nancy-Metz, Nantes,
                  Nice, Orléans-Tours, Reims, Rennes, Rouen, Strasbourg. Zone C : Créteil,
                  Montpellier, Paris, Toulouse, Versailles.
                </p>
              </div>
            </AppCard>

            <AppCard titre="Prochains week-ends de garde">
              {apercu.length === 0 ? (
                <p className="text-sm text-[var(--app-text-muted)]">
                  Renseigne une date de référence pour voir l&apos;aperçu.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--app-border)]">
                  {apercu.map((p, i) => {
                    const vac = vacancesQuiChevauchent(p.debut, p.fin, vacances);
                    return (
                      <li key={i} className="py-3 flex items-start gap-3">
                        <span
                          className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: p.chezQui === "moi" ? "var(--app-accent)" : "var(--app-border)" }}
                        />
                        <span className="text-[var(--app-text)]">
                          Du <strong>{fmt(p.debut)}</strong> {fmtHeure(p.debut)} au{" "}
                          <strong>{fmt(p.fin)}</strong> {fmtHeure(p.fin)}
                          <span className="block text-xs text-[var(--app-text-muted)]">
                            {p.chezQui === "moi" ? "Garde chez moi" : "Garde chez l'autre parent"}
                          </span>
                          {vac && (
                            <span className="mt-1 inline-block rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                              ⚠ {vac.nom} - répartition selon le jugement
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {apercu.some((p) => vacancesQuiChevauchent(p.debut, p.fin, vacances)) && (
                <p className="mt-3 text-xs leading-relaxed text-[var(--app-text-muted)]">
                  Certains week-ends tombent pendant les vacances scolaires. La règle
                  «un week-end sur deux» peut alors ne pas s&apos;appliquer : la
                  répartition des vacances est fixée par votre jugement. Vérifiez votre
                  décision et, au besoin, ajustez via le calendrier avancé.
                </p>
              )}
            </AppCard>

            <CalendrierMensuel regle={regleCourante} vacances={vacances} />
          </>
        )}

        <AppNotice titre="Rappel vacances scolaires">
          <p>
            Les vacances scolaires sont affichées comme annotation uniquement. La
            répartition exacte dépend de la décision applicable. Vérifiez le jugement
            avant tout usage.
          </p>
        </AppNotice>
      </div>
    </AppShell>
  );
}
