"use client";

// app/rattacher/page.tsx
//
// Ecran "Elements a rattacher" (etape D du cloisonnement multi-procedures).
//
// Les lignes heritees dont procedure_id est NULL (cas ambigus laisses tels quels
// par la migration 009) n'apparaissent plus dans les vues cloisonnees. Cet ecran
// les rend visibles et permet de les rattacher MANUELLEMENT a une procedure.
//
// Regles :
//  - aucune deduction automatique ici : le rattachement est un choix humain ;
//  - une ligne qui porte deja un enfant est rattachee a la procedure de cet
//    enfant (la contrainte composite SQL l'impose) ;
//  - lecture/ecriture sous RLS, aucune autre donnee modifiee.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FormMessage from "@/components/ui/FormMessage";

type Procedure = { id: string; etiquette: string | null };
type Enfant = { id: string; prenom_ou_alias: string; procedure_id: string | null };

// Une ligne a rattacher, normalisee depuis l'une des quatre tables metier.
type ARattacher = {
  table: "events" | "expenses" | "documents" | "preuves_photo";
  id: string;
  nature: string; // libelle de type affiche
  intitule: string;
  date: string;
  childId: string | null;
};

function libelleProcedure(p: Procedure): string {
  return p.etiquette?.trim() ? p.etiquette : "Procédure sans nom";
}

export default function RattacherPage() {
  const [lignes, setLignes] = useState<ARattacher[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [choix, setChoix] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState<string | null>(null);

  async function charger() {
    setChargement(true);
    setMessage("");

    const [evRes, frRes, docRes, prRes, procRes, enfRes] = await Promise.all([
      supabase
        .from("events")
        .select("id, titre, categorie, date_evenement, child_id")
        .is("procedure_id", null),
      supabase
        .from("expenses")
        .select("id, libelle, montant, date_frais, child_id")
        .is("procedure_id", null),
      supabase
        .from("documents")
        .select("id, libelle, categorie, date_document, child_id")
        .is("procedure_id", null),
      supabase
        .from("preuves_photo")
        .select("id, titre, created_at, enfant_id")
        .is("procedure_id", null),
      supabase.from("procedures").select("id, etiquette").order("created_at", { ascending: true }),
      supabase.from("children").select("id, prenom_ou_alias, procedure_id"),
    ]);

    const liste: ARattacher[] = [];
    for (const e of evRes.data ?? []) {
      liste.push({
        table: "events",
        id: e.id,
        nature: "Fait",
        intitule: e.titre?.trim() || e.categorie?.trim() || "Fait",
        date: (e.date_evenement ?? "").slice(0, 10),
        childId: e.child_id,
      });
    }
    for (const f of frRes.data ?? []) {
      liste.push({
        table: "expenses",
        id: f.id,
        nature: "Frais",
        intitule: f.libelle?.trim() || "Frais",
        date: (f.date_frais ?? "").slice(0, 10),
        childId: f.child_id,
      });
    }
    for (const d of docRes.data ?? []) {
      liste.push({
        table: "documents",
        id: d.id,
        nature: "Pièce",
        intitule: d.libelle?.trim() || "Document",
        date: (d.date_document ?? "").slice(0, 10),
        childId: d.child_id,
      });
    }
    for (const p of prRes.data ?? []) {
      liste.push({
        table: "preuves_photo",
        id: p.id,
        nature: "Preuve",
        intitule: p.titre?.trim() || "Preuve photo",
        date: (p.created_at ?? "").slice(0, 10),
        childId: p.enfant_id,
      });
    }

    setLignes(liste);
    setProcedures(procRes.data ?? []);
    setEnfants((enfRes.data ?? []) as Enfant[]);
    setChargement(false);
  }

  useEffect(() => {
    // Chargement async (setState après await, pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, []);

  function enfantDe(childId: string | null): Enfant | null {
    if (!childId) return null;
    return enfants.find((e) => e.id === childId) ?? null;
  }

  // Procedure imposee par l'enfant rattache, le cas echeant (contrainte SQL).
  function procedureImposee(ligne: ARattacher): Procedure | null {
    const enfant = enfantDe(ligne.childId);
    if (!enfant?.procedure_id) return null;
    return procedures.find((p) => p.id === enfant.procedure_id) ?? null;
  }

  async function rattacher(ligne: ARattacher) {
    setMessage("");
    const imposee = procedureImposee(ligne);
    const cleLigne = `${ligne.table}:${ligne.id}`;
    const procId = imposee ? imposee.id : choix[cleLigne];
    if (!procId) {
      setMessage("Choisissez une procédure pour cet élément.");
      return;
    }

    setEnCours(cleLigne);
    const { error } = await supabase
      .from(ligne.table)
      .update({ procedure_id: procId })
      .eq("id", ligne.id);
    setEnCours(null);

    if (error) {
      setMessage("Rattachement impossible : " + error.message);
      return;
    }
    // Retire la ligne rattachee de la liste locale.
    setLignes((prev) => prev.filter((l) => !(l.table === ligne.table && l.id === ligne.id)));
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Dossier & règles"
        title="Éléments à rattacher"
        subtitle="Des éléments anciens ne sont rattachés à aucune procédure. Choisissez la procédure de chacun pour qu'il réapparaisse dans le bon dossier."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">
        {chargement ? (
          <p className="text-slate-600">Chargement…</p>
        ) : lignes.length === 0 ? (
          <EmptyState
            titre="Rien à rattacher"
            message="Tous vos éléments sont rattachés à une procédure. Cet écran apparaît uniquement quand d'anciens éléments restent à classer."
          />
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {lignes.length} élément{lignes.length > 1 ? "s" : ""} à rattacher. Le
              rattachement est définitif côté affichage : l&apos;élément réapparaît
              ensuite dans la procédure choisie.
            </p>

            <FormMessage message={message} type="erreur" />

            <div className="mt-6 space-y-3">
              {lignes.map((ligne) => {
                const cleLigne = `${ligne.table}:${ligne.id}`;
                const imposee = procedureImposee(ligne);
                const enfant = enfantDe(ligne.childId);
                const occupe = enCours === cleLigne;
                return (
                  <div
                    key={cleLigne}
                    className="carte rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                        {ligne.nature}
                      </span>
                      {enfant && (
                        <span className="inline-block rounded-full border border-[#C2A24C]/40 bg-[#C2A24C]/10 px-2.5 py-0.5 text-xs text-[#8A5A12]">
                          Enfant : {enfant.prenom_ou_alias}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-semibold text-[#15233F]">{ligne.intitule}</p>
                    <p className="text-sm text-slate-500">{ligne.date || "Sans date"}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {imposee ? (
                        <p className="text-sm text-slate-600">
                          Rattachement imposé à la procédure de l&apos;enfant :{" "}
                          <strong>{libelleProcedure(imposee)}</strong>.
                        </p>
                      ) : (
                        <select
                          value={choix[cleLigne] ?? ""}
                          onChange={(e) =>
                            setChoix((prev) => ({ ...prev, [cleLigne]: e.target.value }))
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="">— Choisir une procédure —</option>
                          {procedures.map((p) => (
                            <option key={p.id} value={p.id}>
                              {libelleProcedure(p)}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => rattacher(ligne)}
                        disabled={occupe}
                        className="rounded-lg bg-[#15233F] px-4 py-2 text-sm text-white hover:bg-[#1d2f52] disabled:opacity-60"
                      >
                        {occupe ? "Rattachement…" : "Rattacher"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {procedures.length === 0 && (
              <p className="mt-4 text-sm text-[#9B2C2C]">
                Aucune procédure n&apos;existe encore. Créez d&apos;abord une procédure
                en ajoutant un enfant dans « Mes enfants ».
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
