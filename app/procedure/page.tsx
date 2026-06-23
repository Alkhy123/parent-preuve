"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import { getProcedureActiveId, setProcedureActiveIdLocal } from "@/lib/procedureActive";
import { supprimerProcedureComplete } from "@/lib/suppressionDonnees";
import RegleDecision from "@/components/RegleDecision";

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
  const router = useRouter();
  const [procId, setProcId] = useState<string | null>(null);
  const [form, setForm] = useState<FormeProcedure>(VIDE);
  const [nbEnfants, setNbEnfants] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  useEffect(() => {
    async function charger() {
      const id = await getProcedureActiveId();
      setProcId(id);
      if (!id) { setChargement(false); return; }

      const [procRes, enfantsRes] = await Promise.all([
        supabase
          .from("procedures")
          .select(
            "etiquette, autre_parent_civilite, autre_parent_nom, autre_parent_prenom, autre_parent_adresse, autre_parent_code_postal, autre_parent_ville, jugement_juridiction, jugement_date, jugement_numero_rg, jugement_intitule"
          )
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("children")
          .select("id", { count: "exact", head: true })
          .eq("procedure_id", id),
      ]);

      if (procRes.error) {
        setMessage("Erreur de chargement : " + procRes.error.message);
      } else if (procRes.data) {
        const rempli = { ...VIDE };
        (Object.keys(VIDE) as (keyof FormeProcedure)[]).forEach((c) => {
          rempli[c] = (procRes.data as Record<string, string | null>)[c] ?? "";
        });
        setForm(rempli);
      }
      setNbEnfants(enfantsRes.count ?? 0);
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

    const payload: Record<string, string | null> = {};
    (Object.keys(form) as (keyof FormeProcedure)[]).forEach((c) => {
      payload[c] = form[c].trim() === "" ? null : form[c];
    });

    const { error } = await supabase.from("procedures").update(payload).eq("id", procId);
    if (error) setMessage("Erreur d'enregistrement : " + error.message);
    else setMessage("Procédure enregistrée ✔");
    setEnregistrement(false);
  }

  async function supprimerProcedure() {
    if (!procId) return;
    setSuppressionEnCours(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setMessage("Vous devez être connecté.");
      setSuppressionEnCours(false);
      return;
    }

    // Suppression complète explicite : données métier, règles, paiements, enfants
    // et fichiers Storage, dans un ordre compatible avec les contraintes FK.
    const resultat = await supprimerProcedureComplete(userId, procId);
    if (!resultat.ok) {
      setMessage("Suppression incomplète. " + resultat.erreurs.join(" · "));
      setSuppressionEnCours(false);
      return;
    }

    // Remet à zéro la sélection ; getProcedureActiveId retombera sur une procédure restante.
    setProcedureActiveIdLocal(null);
    router.push("/");
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
            Aucune procédure active. Ajoutez d&apos;abord un enfant dans{" "}
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
              <h2 className="font-display text-xl text-[#15233F]">L&apos;autre parent</h2>
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
                <p className={message.startsWith("Erreur") || message.startsWith("Impossible")
                  ? "text-red-600 text-sm" : "text-emerald-700 text-sm"}>
                  {message}
                </p>
              )}
            </div>

            {/* Zone de suppression : suppression complète explicite */}
            <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
              <h2 className="font-display text-lg text-[#9B2C2C]">Supprimer cette procédure</h2>

              {!confirmationSuppression ? (
                <>
                  <p className="mt-2 text-sm text-[#1F2733]/80">
                    La suppression efface <strong>toute la procédure</strong> :
                    {nbEnfants > 0 ? (
                      <>
                        {" "}ses <strong>{nbEnfants} enfant(s)</strong>,
                      </>
                    ) : null}{" "}
                    ses faits, frais, pièces, preuves, règles (pension, frais, DVH,
                    décision), paiements de pension et fichiers stockés. Cette action
                    est irréversible.
                  </p>
                  <button
                    onClick={() => setConfirmationSuppression(true)}
                    className="mt-4 rounded-md border border-[#9B2C2C] px-4 py-2 text-sm text-[#9B2C2C] hover:bg-[#9B2C2C] hover:text-white"
                  >
                    Supprimer cette procédure…
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm font-medium text-[#9B2C2C]">
                    Êtes-vous certain(e) ? Toute la procédure et ses données seront
                    définitivement supprimées. Cette action est irréversible.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={supprimerProcedure}
                      disabled={suppressionEnCours}
                      className="rounded-md bg-[#9B2C2C] px-4 py-2 text-sm text-white hover:bg-[#822525] disabled:opacity-60"
                    >
                      {suppressionEnCours ? "Suppression…" : "Confirmer la suppression"}
                    </button>
                    <button
                      onClick={() => setConfirmationSuppression(false)}
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm text-[#1F2733] hover:bg-slate-100"
                    >
                      Annuler
                    </button>
                  </div>
                </>
              )}
            </section>

          </div>
        )}
      </div>
    </main>
  );
}