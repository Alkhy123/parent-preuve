"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import { prochainsWeekends, JOURS, type RegleGarde } from "@/lib/gardeCalendrier";
import CalendrierMensuel from "@/components/CalendrierMensuel";
import RegleDVH from '@/components/RegleDVH';
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";

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
  const [chargement, setChargement] = useState(false);

  // 1) charger les enfants DE LA PROCÉDURE ACTIVE
  useEffect(() => {
    (async () => {
      const data = await getEnfantsDeProcedureActive();
      setEnfants(data);
      if (data.length > 0) setEnfantId(data[0].id);
    })();
  }, []);

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

  const champ = "w-full rounded-md border border-gray-300 bg-white text-[#1F2733] p-2";
  const labelCss = "block text-sm font-medium text-[#1F2733] mb-1";

  return (
    <main className="min-h-screen bg-[#ECE7DC]">
      <PageHeader
        eyebrow="Organisation"
        title="Calendrier de garde"
        subtitle="Un week-end sur deux : enregistre la règle par enfant et visualise les prochaines périodes."
      />
      
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="mt-6">
            <RegleDVH />
          </div>
        {enfants.length === 0 ? (
          <p className="text-[#1F2733]">Ajoute d'abord un enfant dans la rubrique « Enfants ».</p>
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

            <section className="carte rounded-lg border border-gray-200 bg-white p-5 space-y-4">
              <h2 className="font-display text-xl text-[#15233F]">Règle de garde</h2>

              <div>
                <label className={labelCss}>Chez qui l'enfant vit-il principalement ?</label>
                <select
                  value={parentPrincipal}
                  onChange={(e) => setParentPrincipal(e.target.value as "moi" | "autre")}
                  className={champ}
                >
                  <option value="autre">Chez l'autre parent (j'ai le DVH)</option>
                  <option value="moi">Chez moi (l'autre parent a le DVH)</option>
                </select>
              </div>

              <div>
                <label className={labelCss}>Date de référence (un week-end de garde connu)</label>
                <input type="date" value={dateReference} onChange={(e) => setDateReference(e.target.value)} className={champ} />
                <p className="text-xs text-gray-500 mt-1">
                  Indique un vendredi (ou samedi/dimanche) où l'enfant est en garde.
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
                className="rounded-md bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f54] disabled:opacity-50"
              >
                {chargement ? "Enregistrement…" : "Enregistrer la règle"}
              </button>

              {message && <p className="text-sm text-[#1F2733]">{message}</p>}
            </section>

            <section className="carte rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="font-display text-xl text-[#15233F] mb-3">Prochains week-ends de garde</h2>
              {apercu.length === 0 ? (
                <p className="text-sm text-gray-500">Renseigne une date de référence pour voir l'aperçu.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {apercu.map((p, i) => (
                    <li key={i} className="py-3 flex items-start gap-3">
                      <span
                        className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: p.chezQui === "moi" ? "#C2A24C" : "#9CA3AF" }}
                      />
                      <span className="text-[#1F2733]">
                        Du <strong>{fmt(p.debut)}</strong> {fmtHeure(p.debut)} au{" "}
                        <strong>{fmt(p.fin)}</strong> {fmtHeure(p.fin)}
                        <span className="block text-xs text-gray-500">
                          {p.chezQui === "moi" ? "Garde chez moi" : "Garde chez l'autre parent"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          <CalendrierMensuel regle={regleCourante} />
          </>
        )}
      </div>
    </main>
  );
}
