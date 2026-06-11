"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import StatutConsentementIA from "@/components/StatutConsentementIA";
import EffacerDonnees from "@/components/EffacerDonnees";

// Socle = le DÉCLARANT uniquement (info globale à l'utilisateur).
// L'autre parent et le jugement se gèrent désormais PAR PROCÉDURE (page /procedure).
type Dossier = {
  declarant_civilite: string;
  declarant_nom: string;
  declarant_prenom: string;
  declarant_adresse: string;
  declarant_code_postal: string;
  declarant_ville: string;
  declarant_email: string;
  declarant_telephone: string;
};

const DOSSIER_VIDE: Dossier = {
  declarant_civilite: "", declarant_nom: "", declarant_prenom: "",
  declarant_adresse: "", declarant_code_postal: "", declarant_ville: "",
  declarant_email: "", declarant_telephone: "",
};

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

export default function DossierPage() {
  const [form, setForm] = useState<Dossier>(DOSSIER_VIDE);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function charger() {
      const { data, error } = await supabase.from("dossier").select("*").maybeSingle();
      if (error) {
        setMessage("Erreur de chargement : " + error.message);
      } else if (data) {
        const rempli = { ...DOSSIER_VIDE };
        (Object.keys(DOSSIER_VIDE) as (keyof Dossier)[]).forEach((champ) => {
          rempli[champ] = data[champ] ?? "";
        });
        setForm(rempli);
      }
      setChargement(false);
    }
    charger();
  }, []);

  function maj(champ: keyof Dossier, valeur: string) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  async function enregistrer() {
    setEnregistrement(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Erreur : vous n'êtes pas connecté.");
      setEnregistrement(false);
      return;
    }

    // On n'écrit QUE le déclarant : l'autre parent / le jugement vivent dans `procedures`.
    const payload: Record<string, string | null> = { user_id: user.id };
    (Object.keys(form) as (keyof Dossier)[]).forEach((champ) => {
      payload[champ] = form[champ].trim() === "" ? null : form[champ];
    });

    const { error } = await supabase.from("dossier").upsert(payload, { onConflict: "user_id" });

    if (error) setMessage("Erreur d'enregistrement : " + error.message);
    else setMessage("Dossier enregistré ✔");
    setEnregistrement(false);
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Socle"
        title="Mon dossier"
        subtitle="Vos informations personnelles, réutilisées automatiquement dans vos courriers."
      />

      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">
        {chargement ? (
          <p className="text-slate-600">Chargement…</p>
        ) : (
          <div className="space-y-6">

            {/* Le déclarant (vous) */}
            <section className="carte rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="font-display text-xl text-[#15233F]">Vous</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Champ label="Civilité" value={form.declarant_civilite} onChange={(v) => maj("declarant_civilite", v)} placeholder="M. ou Mme" />
                <Champ label="Nom" value={form.declarant_nom} onChange={(v) => maj("declarant_nom", v)} />
                <Champ label="Prénom" value={form.declarant_prenom} onChange={(v) => maj("declarant_prenom", v)} />
                <Champ label="Adresse" value={form.declarant_adresse} onChange={(v) => maj("declarant_adresse", v)} />
                <Champ label="Code postal" value={form.declarant_code_postal} onChange={(v) => maj("declarant_code_postal", v)} />
                <Champ label="Ville" value={form.declarant_ville} onChange={(v) => maj("declarant_ville", v)} />
                <Champ label="Email" type="email" value={form.declarant_email} onChange={(v) => maj("declarant_email", v)} />
                <Champ label="Téléphone" value={form.declarant_telephone} onChange={(v) => maj("declarant_telephone", v)} />
              </div>
            </section>

            {/* Renvoi vers l'édition de la procédure */}
            <section className="carte rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-6">
              <h2 className="font-display text-xl text-[#15233F]">L'autre parent et le jugement</h2>
              <p className="mt-2 text-sm text-[#1F2733]/80">
                Ces informations dépendent de chaque procédure (un autre parent, un jugement).
                Elles se saisissent maintenant dans l'écran dédié, pour la procédure active.
              </p>
              <Link
                href="/procedure"
                className="mt-4 inline-block rounded-md bg-[#15233F] px-5 py-2.5 text-sm font-medium text-[#F8F6F1] hover:bg-[#1d2f54]"
              >
                Ouvrir l'édition de la procédure active
              </Link>
            </section>

            {/* Consentement IA par fonctionnalité */}
            <StatutConsentementIA fonctionnalite="reformulation" />

            <div className="flex items-center gap-4">
              <button
                onClick={enregistrer}
                disabled={enregistrement}
                className="rounded-md bg-[#15233F] px-5 py-2.5 text-sm font-medium text-[#F8F6F1] hover:bg-[#1d2f54] disabled:opacity-60"
              >
                {enregistrement ? "Enregistrement…" : "Enregistrer le dossier"}
              </button>
              {message && (
                <p className={message.startsWith("Erreur") ? "text-red-600 text-sm" : "text-emerald-700 text-sm"}>
                  {message}
                </p>
              )}
            </div>

            {/* Zone sensible : remise à zéro complète du dossier */}
            <EffacerDonnees />

          </div>
        )}
      </div>
    </main>
  );
}