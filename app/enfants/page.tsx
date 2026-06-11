"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";

type Enfant = {
  id: string;
  prenom_ou_alias: string;
  date_naissance: string | null;
  procedure_id: string | null;
};

type Procedure = {
  id: string;
  etiquette: string | null;
};

const NOUVELLE = "__nouvelle__";

export default function EnfantsPage() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [procedureChoisie, setProcedureChoisie] = useState<string>(NOUVELLE);
  const [etiquetteNouvelle, setEtiquetteNouvelle] = useState("");
  const [message, setMessage] = useState("");

  // Étiquette lisible d'une procédure (repli si vide)
  function libelleProcedure(p: Procedure) {
    return p.etiquette?.trim() ? p.etiquette : "Procédure sans nom";
  }

  // Charge enfants + procédures
  async function chargerTout() {
    const [resEnfants, resProcedures] = await Promise.all([
      supabase
        .from("children")
        .select("id, prenom_ou_alias, date_naissance, procedure_id")
        .order("created_at", { ascending: true }),
      supabase
        .from("procedures")
        .select("id, etiquette")
        .order("created_at", { ascending: true }),
    ]);

    if (resEnfants.error) {
      setMessage("Erreur : " + resEnfants.error.message);
      return;
    }
    if (resProcedures.error) {
      setMessage("Erreur : " + resProcedures.error.message);
      return;
    }

    const procs = resProcedures.data ?? [];
    setEnfants(resEnfants.data ?? []);
    setProcedures(procs);

    // Par défaut : rattacher à la première procédure existante ;
    // s'il n'y en a aucune, basculer sur "nouvelle procédure".
    setProcedureChoisie((actuel) => {
      if (actuel !== NOUVELLE && procs.some((p) => p.id === actuel)) return actuel;
      return procs.length > 0 ? procs[0].id : NOUVELLE;
    });
  }

  useEffect(() => {
    chargerTout();
  }, []);

  async function ajouterEnfant() {
    setMessage("");

    if (!prenom.trim()) {
      setMessage("Le prénom (ou alias) est obligatoire.");
      return;
    }

    let procedureId = procedureChoisie;

    // Cas "autre parent différent" : on crée d'abord la procédure
    if (procedureChoisie === NOUVELLE) {
      if (!etiquetteNouvelle.trim()) {
        setMessage("Indiquez un nom pour la nouvelle procédure (l'autre parent).");
        return;
      }
      const { data, error } = await supabase
        .from("procedures")
        .insert({ etiquette: etiquetteNouvelle.trim() })
        .select("id")
        .single();

      if (error || !data) {
        setMessage("Erreur (création procédure) : " + (error?.message ?? "inconnue"));
        return;
      }
      procedureId = data.id;
    }

    const { error } = await supabase.from("children").insert({
      prenom_ou_alias: prenom.trim(),
      date_naissance: dateNaissance || null,
      procedure_id: procedureId,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
      return;
    }

    // Réinitialise le formulaire et rafraîchit
    setPrenom("");
    setDateNaissance("");
    setEtiquetteNouvelle("");
    chargerTout();
  }

  // Supprime la procédure UNIQUEMENT si plus rien ne lui est rattaché
  // (aucun enfant et aucune des 4 règles). Sinon on n'y touche pas.
  async function supprimerProcedureSiVide(procId: string) {
    const tables = [
      "children",
      "pension_regle",
      "frais_regle",
      "dvh_regle",
      "decision_regle",
    ] as const;

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("procedure_id", procId);
      if (error) return; // en cas de doute, on ne supprime rien
      if ((count ?? 0) > 0) return; // encore utilisée → on garde
    }

    // Tout est à zéro → on supprime la procédure devenue vide.
    await supabase.from("procedures").delete().eq("id", procId);
  }

  async function supprimerEnfant(enfant: Enfant) {
    const { error } = await supabase.from("children").delete().eq("id", enfant.id);
    if (error) {
      setMessage("Erreur : " + error.message);
      return;
    }

    // Nettoyage : si la procédure de cet enfant est désormais vide, on l'efface aussi.
    if (enfant.procedure_id) {
      await supprimerProcedureSiVide(enfant.procedure_id);
    }

    chargerTout();
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Profils"
        title="Mes enfants"
        subtitle="Ajoutez chaque enfant et rattachez-le à la bonne procédure (l'autre parent concerné)."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">

        {/* Formulaire d'ajout */}
        <div className="mt-8 carte rounded-xl border border-slate-200 bg-white p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Prénom ou alias
              </label>
              <input
                type="text"
                placeholder="Ex : Enfant A"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date de naissance (facultatif)
              </label>
              <input
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            {/* Procédure : même autre parent qu'un enfant déjà enregistré ? */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Procédure concernée (l'autre parent)
              </label>
              <select
                value={procedureChoisie}
                onChange={(e) => setProcedureChoisie(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2"
              >
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    Même autre parent que : {libelleProcedure(p)}
                  </option>
                ))}
                <option value={NOUVELLE}>➕ Autre parent différent (nouvelle procédure)</option>
              </select>

              {procedureChoisie === NOUVELLE && (
                <input
                  type="text"
                  placeholder="Nom de l'autre parent (ex : Camille, ou « Papa de … »)"
                  value={etiquetteNouvelle}
                  onChange={(e) => setEtiquetteNouvelle(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              )}
            </div>

            <button
              onClick={ajouterEnfant}
              className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
            >
              Ajouter
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        </div>

        {/* Liste des enfants */}
        <div className="mt-8 space-y-3">
          {enfants.length === 0 && (
            <p className="text-slate-500">Aucun enfant pour le moment.</p>
          )}
          {enfants.map((enfant) => {
            const proc = procedures.find((p) => p.id === enfant.procedure_id);
            return (
              <div
                key={enfant.id}
                className="carte flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-semibold text-[#15233F]">
                    {enfant.prenom_ou_alias}
                  </p>
                  {enfant.date_naissance && (
                    <p className="text-sm text-slate-500">
                      Né(e) le {enfant.date_naissance}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Procédure : {proc ? libelleProcedure(proc) : "non rattachée"}
                  </p>
                </div>
                <button
                  onClick={() => supprimerEnfant(enfant)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
