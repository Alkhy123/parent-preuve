"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppShell from "@/components/app/AppShell";
import StatutConsentementIA from "@/components/StatutConsentementIA";
import EffacerDonnees from "@/components/EffacerDonnees";

// Socle = le DECLARANT uniquement (info globale a l'utilisateur).
// L'autre parent et le jugement se gerent desormais PAR PROCEDURE (page /procedure).
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
      <span className="text-sm font-medium text-[var(--app-text)]">{label}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)] focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]"
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

    // On n'ecrit QUE le declarant : l'autre parent / le jugement vivent dans `procedures`.
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
    <AppShell
      titre="Dossier"
      description="Completer les informations du declarant et acceder aux reglages lies au dossier."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/compte" variant="secondary">
            Retour Compte
          </AppButtonLink>
          <AppButtonLink href="/procedure" variant="secondary">
            Procedure active
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        {chargement ? (
          <p className="text-sm text-[var(--app-text-muted)]">Chargement...</p>
        ) : (
          <>
            {/* Le declarant (vous) */}
            <AppCard titre="Vous">
              <div className="grid gap-4 sm:grid-cols-2">
                <Champ label="Civilité" value={form.declarant_civilite} onChange={(v) => maj("declarant_civilite", v)} placeholder="M. ou Mme" />
                <Champ label="Nom" value={form.declarant_nom} onChange={(v) => maj("declarant_nom", v)} />
                <Champ label="Prénom" value={form.declarant_prenom} onChange={(v) => maj("declarant_prenom", v)} />
                <Champ label="Adresse" value={form.declarant_adresse} onChange={(v) => maj("declarant_adresse", v)} />
                <Champ label="Code postal" value={form.declarant_code_postal} onChange={(v) => maj("declarant_code_postal", v)} />
                <Champ label="Ville" value={form.declarant_ville} onChange={(v) => maj("declarant_ville", v)} />
                <Champ label="Email" type="email" value={form.declarant_email} onChange={(v) => maj("declarant_email", v)} />
                <Champ label="Téléphone" value={form.declarant_telephone} onChange={(v) => maj("declarant_telephone", v)} />
              </div>
            </AppCard>

            {/* Renvoi vers l'edition de la procedure */}
            <AppCard titre="L'autre parent et le jugement">
              <p className="text-sm text-[var(--app-text-muted)]">
                Ces informations dépendent de chaque procédure (un autre parent, un jugement).
                Elles se saisissent maintenant dans l&apos;écran dédié, pour la procédure active.
              </p>
              <div className="mt-4">
                <AppButtonLink href="/procedure">
                  Ouvrir l&apos;édition de la procédure active
                </AppButtonLink>
              </div>
            </AppCard>

            {/* Consentement IA par fonctionnalite */}
            <StatutConsentementIA fonctionnalite="reformulation" />

            <div className="flex items-center gap-4">
              <button
                onClick={enregistrer}
                disabled={enregistrement}
                className="rounded-md bg-[#15233F] px-5 py-2.5 text-sm font-medium text-[#F8F6F1] hover:bg-[#1d2f54] disabled:opacity-60"
              >
                {enregistrement ? "Enregistrement..." : "Enregistrer le dossier"}
              </button>
              {message && (
                <p className={message.startsWith("Erreur") ? "text-red-600 text-sm" : "text-emerald-700 text-sm"}>
                  {message}
                </p>
              )}
            </div>

            {/* Zone sensible : remise a zero complete du dossier */}
            <EffacerDonnees />
          </>
        )}
      </div>
    </AppShell>
  );
}
