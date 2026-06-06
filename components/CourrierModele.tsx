"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import { exporterCourrierPdf } from "@/lib/courrierPdf";
import { v, dateFr, type Dossier } from "@/lib/courrierHelpers";

export type Champ = {
  nom: string;               // clé utilisée dans "vals"
  label: string;
  type?: string;             // "text" (défaut), "number", "date"
  placeholder?: string;
  pleineLargeur?: boolean;   // true => grande zone de texte sur toute la largeur
};

type Props = {
  eyebrow?: string;
  titre: string;
  sousTitre?: string;
  champs: Champ[];
  objet: (d: Dossier | null, vals: Record<string, string>) => string;
  corps: (d: Dossier | null, vals: Record<string, string>) => string;
};

function ChampTexte({ label, value, onChange, type = "text", placeholder }: {
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

export default function CourrierModele({ eyebrow = "Courrier", titre, sousTitre, champs, objet, corps }: Props) {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [chargement, setChargement] = useState(true);
  const [lieu, setLieu] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [brouillon, setBrouillon] = useState("");
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    async function charger() {
      const { data } = await supabase.from("dossier").select("*").maybeSingle();
      setDossier(data);
      if (data?.declarant_ville) setLieu(data.declarant_ville);
      const init: Record<string, string> = { reference: "", precisions: "" };
      champs.forEach((c) => (init[c.nom] = ""));
      setVals(init);
      setChargement(false);
    }
    charger();
  }, []);

  function maj(nom: string, valeur: string) {
    setVals((prev) => ({ ...prev, [nom]: valeur }));
  }

  function generer() {
    const d = dossier;
    const expediteur = [
      `${v(d?.declarant_civilite, "")} ${v(d?.declarant_prenom, "")} ${v(d?.declarant_nom, "")}`.trim(),
      v(d?.declarant_adresse, "[votre adresse]"),
      `${v(d?.declarant_code_postal, "")} ${v(d?.declarant_ville, "")}`.trim(),
      d?.declarant_email ?? "", d?.declarant_telephone ?? "",
    ].filter((l) => l.trim() !== "").join("\n");

    const destinataire = [
      `${v(d?.autre_parent_civilite, "")} ${v(d?.autre_parent_prenom, "")} ${v(d?.autre_parent_nom, "")}`.trim(),
      v(d?.autre_parent_adresse, "[adresse de l'autre parent]"),
      `${v(d?.autre_parent_code_postal, "")} ${v(d?.autre_parent_ville, "")}`.trim(),
    ].filter((l) => l.trim() !== "").join("\n");

    const aujourdhui = dateFr(new Date().toISOString().slice(0, 10));

    const lettre =
`${expediteur}


${destinataire}


${v(lieu, "[lieu]")}, le ${aujourdhui}

Objet : ${objet(d, vals)}

${corps(d, vals)}`;

    setBrouillon(lettre.trim());
    setCopie(false);
  }

  async function copier() {
    await navigator.clipboard.writeText(brouillon);
    setCopie(true);
  }

  const dossierVide = !dossier || (!dossier.declarant_nom && !dossier.autre_parent_nom);

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader eyebrow={eyebrow} title={titre} subtitle={sousTitre} />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">
        {chargement ? (
          <p className="text-slate-600">Chargement…</p>
        ) : (
          <div className="space-y-6">
            {dossierVide && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                Votre dossier semble incomplet. Renseignez vos informations dans{" "}
                <a href="/dossier" className="font-semibold underline">Mon dossier</a>{" "}
                pour qu'elles se reportent automatiquement.
              </div>
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-display text-xl text-[#15233F]">À compléter</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <ChampTexte label="Lieu" value={lieu} onChange={setLieu} placeholder="Ville d'envoi" />
                {champs.filter((c) => !c.pleineLargeur).map((c) => (
                  <ChampTexte key={c.nom} label={c.label} type={c.type} placeholder={c.placeholder}
                    value={vals[c.nom] ?? ""} onChange={(val) => maj(c.nom, val)} />
                ))}
              </div>

              {champs.filter((c) => c.pleineLargeur).map((c) => (
                <label key={c.nom} className="block">
                  <span className="text-sm font-medium text-[#15233F]">{c.label}</span>
                  <textarea rows={2} placeholder={c.placeholder}
                    value={vals[c.nom] ?? ""} onChange={(e) => maj(c.nom, e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]" />
                </label>
              ))}

              <label className="block">
                <span className="text-sm font-medium text-[#15233F]">Référence(s) légale(s) — à compléter et vérifier par vos soins</span>
                <textarea rows={2} value={vals.reference ?? ""} onChange={(e) => maj("reference", e.target.value)}
                  placeholder="Laissez vide, ou indiquez le ou les articles que vous aurez vérifiés."
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#15233F]">Précisions (facultatif)</span>
                <textarea rows={2} value={vals.precisions ?? ""} onChange={(e) => maj("precisions", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]" />
              </label>

              <button onClick={generer} className="rounded-md bg-[#15233F] px-5 py-2.5 text-sm font-medium text-[#F8F6F1] hover:bg-[#1d2f54]">
                Générer le brouillon
              </button>
            </section>

            {brouillon && (
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl text-[#15233F]">Brouillon</h2>
                  <div className="flex gap-2">
                    <button onClick={copier} className="rounded-md border border-[#15233F] px-3 py-1.5 text-sm text-[#15233F] hover:bg-[#15233F] hover:text-[#F8F6F1]">
                      {copie ? "Copié ✔" : "Copier"}
                    </button>
                    <button onClick={() => exporterCourrierPdf(titre, brouillon)} className="rounded-md bg-[#15233F] px-3 py-1.5 text-sm text-[#F8F6F1] hover:bg-[#1d2f54]">
                      Télécharger en PDF
                    </button>
                  </div>
                </div>
                <textarea value={brouillon} onChange={(e) => setBrouillon(e.target.value)} rows={20}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]" />
                <p className="text-xs text-slate-500">
                  Aide à la rédaction : relisez et adaptez librement. La portée juridique tient surtout au mode d'envoi (par ex. lettre recommandée avec accusé de réception).
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}