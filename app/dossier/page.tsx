"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import StatutConsentementIA from "@/components/StatutConsentementIA";
import RegleDecision from '@/components/RegleDecision';
import EffacerDonnees from "@/components/EffacerDonnees";

// La forme d'un dossier : toutes les colonnes du formulaire
type Dossier = {
  declarant_civilite: string;
  declarant_nom: string;
  declarant_prenom: string;
  declarant_adresse: string;
  declarant_code_postal: string;
  declarant_ville: string;
  declarant_email: string;
  declarant_telephone: string;
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

// Une fiche vide : tous les champs à "" au départ
const DOSSIER_VIDE: Dossier = {
  declarant_civilite: "", declarant_nom: "", declarant_prenom: "",
  declarant_adresse: "", declarant_code_postal: "", declarant_ville: "",
  declarant_email: "", declarant_telephone: "",
  autre_parent_civilite: "", autre_parent_nom: "", autre_parent_prenom: "",
  autre_parent_adresse: "", autre_parent_code_postal: "", autre_parent_ville: "",
  jugement_juridiction: "", jugement_date: "", jugement_numero_rg: "",
  jugement_intitule: "",
};

// Petit champ réutilisable (étiquette + zone de saisie)
function Champ({ label, value, onChange, type = "text", placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#15233F]">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
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

  // Au démarrage : on charge la fiche si elle existe déjà
  useEffect(() => {
    async function charger() {
      const { data, error } = await supabase
        .from("dossier")
        .select("*")
        .maybeSingle();

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

  // Met à jour un seul champ du formulaire
  function maj(champ: keyof Dossier, valeur: string) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  // Enregistre : crée la fiche la 1re fois, la met à jour ensuite
  async function enregistrer() {
    setEnregistrement(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Erreur : vous n'êtes pas connecté.");
      setEnregistrement(false);
      return;
    }

    // On transforme les champs vides en null (et on évite l'erreur sur une date vide)
    const payload: Record<string, string | null> = { user_id: user.id };
    (Object.keys(form) as (keyof Dossier)[]).forEach((champ) => {
      payload[champ] = form[champ].trim() === "" ? null : form[champ];
    });

    const { error } = await supabase
      .from("dossier")
      .upsert(payload, { onConflict: "user_id" });

    if (error) setMessage("Erreur d'enregistrement : " + error.message);
    else setMessage("Dossier enregistré ✔");
    setEnregistrement(false);
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Socle"
        title="Mon dossier"
        subtitle="Vos informations réutilisées automatiquement dans vos courriers."
      />

      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">
        {chargement ? (
          <p className="text-slate-600">Chargement…</p>
        ) : (
          <div className="space-y-6">

            {/* Bloc 1 : toi */}
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

            {/* Bloc 2 : l'autre parent */}
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

            {/* Bloc 3 : le jugement */}
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
            <div className="mt-6">
            <RegleDecision />
          </div>
            {/* Consentements IA par fonctionnalité */}
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