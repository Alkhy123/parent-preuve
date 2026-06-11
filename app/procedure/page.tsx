"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import { getProcedureActiveId } from "@/lib/procedureActive";
import RegleDecision from "@/components/RegleDecision";

// Champs éditables d'une procédure (hors enfants/règles, gérés ailleurs).
type FormeProcedure = {
  etiquette: string;
  autre_parent_civilite: string;
  autre_parent_nom: string;
  autre_parent_prenom: string;
  autre_parent_adresse: string;
  autre_parent_code_postal: string;
  autre_parent_ville: string;
  jugement_juridiction: string;
  jugement_date: string;
  jugement_numero_rg: string;
  jugement_intitule: string;
};

const VIDE: FormeProcedure = {
  etiquette: "",
  autre_parent_civilite: "", autre_parent_nom: "", autre_parent_prenom: "",
  autre_parent_adresse: "", autre_parent_code_postal: "", autre_parent_ville: "",
  jugement_juridiction: "", jugement_date: "", jugement_numero_rg: "", jugement_intitule: "",
};

// Champ réutilisable (même style que la page Dossier).
function Champ({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#15233F]">{label}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-[#1F2733] focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]"
      />
    </label>
  );
}

export default function ProcedurePage() {
  const [procId, setProcId] = useState<string | null>(null);
  const [form, setForm] = useState<FormeProcedure>(VIDE);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function charger() {
      const id = await getProcedureActiveId();
      setProcId(id);
      if (!id) { setChargement(false); return; }

      const { data, error } = await supabase
        .from("procedures")
        .select(
          "etiquette, autre_parent_civilite, autre_parent_nom, autre_parent_prenom, autre_parent_adresse, autre_parent_code_postal, autre_parent_ville, jugement_juridiction, jugement_date, jugement_numero_rg, jugement_intitule"
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setMessage("Erreur de chargement : " + error.message);
      } else if (data) {
        const rempli = { ...VIDE };
        (Object.keys(VIDE) as (keyof FormeProcedure)[]).forEach((c) => {
          rempli[c] = (data as Record<string, string | null>)[c] ?? "";
        });
        setForm(rempli);
      }
      setChargement(false);
    }
    charger();
  }, []);

  function maj(champ: keyof FormeProcedure, valeur: string) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  async function enregistrer() {
    if (!procId) {
      setMessage("Aucune procédure active. Ajoutez d'abord un enfant dans « Mes enfants ».");
      return;
    }
    setEnregistrement(true);
    setMessage("");

    // Champs vides → null (et date vide acceptée).
    const payload: Record<string, string | null> = {};
    (Object.keys(form) as (keyof FormeProcedure)[]).forEach((c) => {
      payload[c] = form[c].trim() === "" ? null : form[c];
    });

    const { error } = await supabase.from("procedures").update(payload).eq("id", procId);
    if (error) setMessage("Erreur d'enregistrement : " + error.message);
    else setMessage("Procédure enregistrée ✔");
    setEnregistrement(false);
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Procédure"
        title="L'autre parent et le jugement"
        subtitle="Ces informations concernent la procédure active (affichée dans le bandeau) et alimentent vos courriers et la note de synthèse."
      />

      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">
        {chargement ? (
          <p className="text-slate-600">Chargement…</p>
        ) : !procId ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Aucune procédure active. Ajoutez d'abord un enfant dans{" "}
            <a href="/enfants" className="font-semibold underline">Mes enfants</a>{" "}
            : une procédure sera créée et vous pourrez la compléter ici.
          </div>
        ) : (
          <div className="space-y-6">

            <div className="rounded-md border border-[#C2A24C]/40 bg-[#F8F6F1] px-4 py-3 text-sm text-[#1F2733]">
              Vous éditez la procédure active. Pour en modifier une autre, changez-la
              dans le bandeau « Dossier en cours », puis revenez ici.
            </div>

            {/* Étiquette */}
            <section className="carte rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="font-display text-xl text-[#15233F]">Nom de la procédure</h2>
              <div className="mt-4">
                <Champ
                  label="Étiquette (telle qu'affichée dans le bandeau et le sélecteur)"
                  value={form.etiquette}
                  onChange={(v) => maj("etiquette", v)}
                  placeholder="Ex : Camille, ou « Papa de … »"
                />
              </div>
            </section>

            {/* Autre parent */}
            <section className="carte rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="font-display text-xl text-[#15233F]">L'autre parent</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Champ label="Civilité" value={form.autre_parent_civilite} onChange={(v) => maj("autre_parent_civilite", v)} placeholder="M. ou Mme" />
                <Champ label="Nom" value={form.autre_parent_nom} onChange={(v) => maj("autre_parent_nom", v)} />
                <Champ label="Prénom" value={form.autre_parent_prenom} onChange={(v) => maj("autre_parent_prenom", v)} />
                <Champ label="Adresse" value={form.autre_parent_adresse} onChange={(v) => maj("autre_parent_adresse", v)} />
                <Champ label="Code postal" value={form.autre_parent_code_postal} onChange={(v) => maj("autre_parent_code_postal", v)} />
                <Champ label="Ville" value={form.autre_parent_ville} onChange={(v) => maj("autre_parent_ville", v)} />
              </div>
            </section>

            {/* Jugement */}
            <section className="carte rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="font-display text-xl text-[#15233F]">Le jugement en vigueur</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Champ label="Juridiction" value={form.jugement_juridiction} onChange={(v) => maj("jugement_juridiction", v)} placeholder="Tribunal judiciaire de…" />
                <Champ label="Date du jugement" type="date" value={form.jugement_date} onChange={(v) => maj("jugement_date", v)} />
                <Champ label="Numéro RG" value={form.jugement_numero_rg} onChange={(v) => maj("jugement_numero_rg", v)} />
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-medium text-[#15233F]">Intitulé / objet du jugement</span>
                <textarea
                  value={form.jugement_intitule}
                  onChange={(e) => maj("jugement_intitule", e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-[#1F2733] focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]"
                />
              </label>
            </section>
            <RegleDecision />

            <div className="flex items-center gap-4">
              <button
                onClick={enregistrer}
                disabled={enregistrement}
                className="rounded-md bg-[#15233F] px-5 py-2.5 text-sm font-medium text-[#F8F6F1] hover:bg-[#1d2f54] disabled:opacity-60"
              >
                {enregistrement ? "Enregistrement…" : "Enregistrer la procédure"}
              </button>
              {message && (
                <p className={message.startsWith("Erreur") ? "text-red-600 text-sm" : "text-emerald-700 text-sm"}>
                  {message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}