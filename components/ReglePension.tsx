"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { euros } from "@/lib/dossierCalculs";
import { getProcedureActiveId } from "@/lib/procedureActive";
import EncartPliable from "@/components/EncartPliable";

// La RÈGLE de pension posée par le jugement (≠ les paiements réels de pension_payments).
type Regle = {
  id?: string;
  montant_base: number | null;
  montant_courant: number | null;
  debiteur: string; // 'moi' | 'autre'
  jour_echeance: number | null;
  paiement_avance: boolean;
  inclut_vacances: boolean;
  intermediation: boolean;
  indexation_active: boolean;
  indexation_jour: number | null;
  indexation_mois: number | null;
  indexation_premiere_date: string | null; // 'AAAA-MM-JJ'
  indexation_indice: string | null;
  notes: string | null;
  valide?: boolean;
};

const REGLE_VIDE: Regle = {
  montant_base: null,
  montant_courant: null,
  debiteur: "autre",
  jour_echeance: null,
  paiement_avance: false,
  inclut_vacances: false,
  intermediation: false,
  indexation_active: false,
  indexation_jour: null,
  indexation_mois: null,
  indexation_premiere_date: null,
  indexation_indice: null,
  notes: null,
};

export default function ReglePension({
  valeursInitiales,
  origineIA = false,
}: {
  valeursInitiales?: Partial<Regle>;
  origineIA?: boolean;
} = {}) {
  const [regle, setRegle] = useState<Regle | null>(null);
  const [procedureId, setProcedureId] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [edition, setEdition] = useState(!!valeursInitiales);
  const [form, setForm] = useState<Regle>(
    valeursInitiales ? { ...REGLE_VIDE, ...valeursInitiales } : REGLE_VIDE
  );
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [signalFermeture, setSignalFermeture] = useState(0);

  useEffect(() => {
    async function charger() {
      const procId = await getProcedureActiveId();
      setProcedureId(procId);

      if (!procId) {
        setRegle(null);
        setChargement(false);
        return;
      }

      const { data, error } = await supabase
        .from("pension_regle")
        .select("*")
        .eq("procedure_id", procId)
        .eq("actif", true)
        .limit(1)
        .maybeSingle();
      if (error) setErreur("Impossible de charger la règle de pension.");
      setRegle(data ?? null);
      setChargement(false);
    }
    charger();
  }, []);

  function maj<K extends keyof Regle>(champ: K, valeur: Regle[K]) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  function nombre(valeur: string): number | null {
    return valeur === "" ? null : Number(valeur);
  }

  function ouvrirEdition() {
    setForm(regle ?? REGLE_VIDE);
    setErreur("");
    setEdition(true);
  }

  async function enregistrer() {
    setErreur("");
    if (form.montant_base === null || isNaN(Number(form.montant_base))) {
      setErreur("Le montant de base est obligatoire.");
      return;
    }
    setEnregistrement(true);

    const aEnregistrer = {
      ...form,
      montant_courant: form.montant_courant ?? form.montant_base,
      valide: true,
      ...(origineIA ? { source: "ia", valide: false } : {}),
    };

    let resultat;
    if (regle?.id) {
      resultat = await supabase
        .from("pension_regle")
        .update(aEnregistrer)
        .eq("id", regle.id)
        .select()
        .single();
    } else {
      if (!procedureId) {
        setEnregistrement(false);
        setErreur(
          "Aucune procédure active. Ajoutez d'abord un enfant dans « Mes enfants » pour créer une procédure."
        );
        return;
      }
      resultat = await supabase
        .from("pension_regle")
        .insert({ ...aEnregistrer, procedure_id: procedureId })
        .select()
        .single();
    }

    setEnregistrement(false);
    if (resultat.error) {
      setErreur("Échec de l'enregistrement : " + resultat.error.message);
      return;
    }
    setRegle(resultat.data);
    setEdition(false);
    if (!origineIA) setSignalFermeture((n) => n + 1);
  }

  async function valider() {
    if (!regle?.id) return;
    const { data, error } = await supabase
      .from("pension_regle")
      .update({ valide: true })
      .eq("id", regle.id)
      .select()
      .single();
    if (error) {
      setErreur("Échec de la validation.");
      return;
    }
    setRegle(data);
    setSignalFermeture((n) => n + 1);
  }

  // --- Affichage ---

  if (chargement) {
    return (
      <div className="carte rounded-xl border border-black/5 bg-[#F8F6F1] p-6">
        <p className="text-[#1F2733]/50">Chargement de la règle…</p>
      </div>
    );
  }

  if (edition) {
    const champ =
      "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[#1F2733] focus:border-[#C2A24C] focus:outline-none";
    return (
      <div className="carte rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-6 text-[#1F2733]">
        <h2 className="font-display text-xl font-semibold text-[#15233F]">Règle de pension</h2>
        <p className="mt-1 text-sm text-[#1F2733]/60">
          Saisissez ce que le jugement impose (le dispositif), pas une demande.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Montant de base (€) *
            <input
              type="number"
              className={champ}
              value={form.montant_base ?? ""}
              onChange={(e) => maj("montant_base", nombre(e.target.value))}
            />
          </label>

          <label className="text-sm">
            Qui paie ?
            <select
              className={champ}
              value={form.debiteur}
              onChange={(e) => maj("debiteur", e.target.value)}
            >
              <option value="autre">L'autre parent</option>
              <option value="moi">Moi</option>
            </select>
          </label>

          <label className="text-sm">
            Jour d'échéance (ex. 5)
            <input
              type="number"
              className={champ}
              value={form.jour_echeance ?? ""}
              onChange={(e) => maj("jour_echeance", nombre(e.target.value))}
            />
          </label>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.paiement_avance}
              onChange={(e) => maj("paiement_avance", e.target.checked)} />
            Payable d'avance
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.inclut_vacances}
              onChange={(e) => maj("inclut_vacances", e.target.checked)} />
            Dû aussi pendant les vacances
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.intermediation}
              onChange={(e) => maj("intermediation", e.target.checked)} />
            Versée via un organisme (intermédiation / ARIPA)
          </label>
        </div>

        <div className="mt-4 rounded-lg border border-black/10 p-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.indexation_active}
              onChange={(e) => maj("indexation_active", e.target.checked)} />
            Indexation prévue (le montant changera avec le temps)
          </label>

          {form.indexation_active && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Jour (ex. 1)
                <input type="number" className={champ}
                  value={form.indexation_jour ?? ""}
                  onChange={(e) => maj("indexation_jour", nombre(e.target.value))} />
              </label>
              <label className="text-sm">
                Mois (1 = janvier … 7 = juillet)
                <input type="number" className={champ}
                  value={form.indexation_mois ?? ""}
                  onChange={(e) => maj("indexation_mois", nombre(e.target.value))} />
              </label>
              <label className="text-sm">
                1re réindexation
                <input type="date" className={champ}
                  value={form.indexation_premiere_date ?? ""}
                  onChange={(e) => maj("indexation_premiere_date", e.target.value || null)} />
              </label>
              <label className="text-sm sm:col-span-2">
                Indice de référence (INSEE)
                <input type="text" className={champ}
                  value={form.indexation_indice ?? ""}
                  onChange={(e) => maj("indexation_indice", e.target.value || null)} />
              </label>
            </div>
          )}
        </div>

        <label className="mt-4 block text-sm">
          Notes
          <textarea className={champ} rows={2}
            value={form.notes ?? ""}
            onChange={(e) => maj("notes", e.target.value || null)} />
        </label>

        {erreur && <p className="mt-3 text-sm text-red-600">{erreur}</p>}

        <div className="mt-5 flex gap-3">
          <button onClick={enregistrer} disabled={enregistrement}
            className="rounded-lg bg-[#15233F] px-5 py-2 text-[#F8F6F1] transition hover:bg-[#1d2f52] disabled:opacity-50">
            {enregistrement ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button onClick={() => setEdition(false)}
            className="rounded-lg border border-black/10 px-5 py-2 text-[#1F2733] hover:bg-white">
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (!regle) {
    return (
      <div className="carte rounded-xl border border-black/5 bg-[#F8F6F1] p-6">
        <h2 className="font-display text-xl font-semibold text-[#15233F]">Règle de pension</h2>
        <p className="mt-1 text-sm text-[#1F2733]/60">Aucune règle enregistrée pour le moment.</p>
        {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
        <button onClick={ouvrirEdition}
          className="mt-4 rounded-lg bg-[#15233F] px-5 py-2 text-[#F8F6F1] transition hover:bg-[#1d2f52]">
          Ajouter la règle de pension
        </button>
      </div>
    );
  }

  const modalites = [
    regle.paiement_avance && "payable d'avance",
    regle.inclut_vacances && "due pendant les vacances",
    regle.intermediation && "versée via un organisme",
  ].filter(Boolean);

  const resumePension = [
    regle.valide === false ? "⚠ à valider" : null,
    `${euros(Number(regle.montant_courant ?? regle.montant_base))} par mois`,
    `payée par ${regle.debiteur === "moi" ? "vous" : "l'autre parent"}${
      regle.jour_echeance ? `, le ${regle.jour_echeance}` : ""
    }`,
  ].filter(Boolean).join(" · ");

  return (
    <EncartPliable
      titre="Règle de pension"
      pliable
      replieParDefaut={regle.valide !== false}
      resume={resumePension}
      signalFermeture={signalFermeture}
      idPersistance={procedureId ? `regle-pension:${procedureId}` : undefined}
    >
      {regle.valide === false && (
        <div className="mb-4 rounded-lg border border-[#C2A24C]/60 bg-[#C2A24C]/10 p-3 text-sm">
          <p className="font-medium text-[#15233F]">Proposée par l'IA — à vérifier</p>
          <p className="mt-1 text-[#1F2733]/70">
            Relisez les informations ci-dessous. Si elles sont fidèles au jugement,
            validez ; sinon, cliquez sur « Modifier ».
          </p>
          <button
            onClick={valider}
            className="mt-2 rounded-lg bg-[#15233F] px-4 py-1.5 text-sm text-[#F8F6F1] transition hover:bg-[#1d2f52]"
          >
            Valider cette règle
          </button>
        </div>
      )}
      <div className="flex items-start justify-between">
        <p className="font-display text-3xl font-semibold text-[#15233F]">
          {euros(Number(regle.montant_courant ?? regle.montant_base))}
          <span className="ml-2 text-base font-normal text-[#1F2733]/60">par mois</span>
        </p>
        <button onClick={ouvrirEdition}
          className="rounded-lg border border-black/10 px-4 py-1.5 text-sm text-[#1F2733] hover:bg-white">
          Modifier
        </button>
      </div>

      <div className="mt-3 space-y-1 text-sm text-[#1F2733]/80">
        <p>Payée par {regle.debiteur === "moi" ? "vous" : "l'autre parent"}
          {regle.jour_echeance ? `, le ${regle.jour_echeance} de chaque mois` : ""}.</p>
        {modalites.length > 0 && <p>Modalités : {modalites.join(", ")}.</p>}
        {regle.indexation_active && (
          <p>Indexation prévue
            {regle.indexation_premiere_date ? ` (1re fois le ${regle.indexation_premiere_date})` : ""}
            {regle.indexation_indice ? ` — indice : ${regle.indexation_indice}` : ""}.</p>
        )}
        {regle.notes && <p className="text-[#1F2733]/60">Note : {regle.notes}</p>}
      </div>
    </EncartPliable>
  );
}
