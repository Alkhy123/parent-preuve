"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import { exporterCourrierPdf } from "@/lib/courrierPdf";
import { v, dateFr, type Dossier } from "@/lib/courrierHelpers";
import { getProcedureActiveId } from "@/lib/procedureActive";

export type Champ = {
  nom: string;               // cle utilisee dans "vals"
  label: string;
  type?: string;             // "text" (defaut), "number", "date"
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
      <span className="text-sm font-medium text-[var(--app-text)]">{label}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)] focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]"
      />
    </label>
  );
}

export default function CourrierModele({ titre, sousTitre, champs, objet, corps }: Props) {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [chargement, setChargement] = useState(true);
  const [lieu, setLieu] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [brouillon, setBrouillon] = useState("");
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    async function charger() {
      // Declarant : depuis le socle global. Autre parent + jugement : depuis la procedure active.
      const [resDossier, procId] = await Promise.all([
        supabase.from("dossier").select("*").maybeSingle(),
        getProcedureActiveId(),
      ]);
      const socle = resDossier.data;

      let proc:
        | {
            autre_parent_civilite: string | null;
            autre_parent_nom: string | null;
            autre_parent_prenom: string | null;
            autre_parent_adresse: string | null;
            autre_parent_code_postal: string | null;
            autre_parent_ville: string | null;
            jugement_juridiction: string | null;
            jugement_date: string | null;
            jugement_numero_rg: string | null;
            jugement_intitule: string | null;
          }
        | null = null;

      if (procId) {
        const r = await supabase
          .from("procedures")
          .select(
            "autre_parent_civilite, autre_parent_nom, autre_parent_prenom, autre_parent_adresse, autre_parent_code_postal, autre_parent_ville, jugement_juridiction, jugement_date, jugement_numero_rg, jugement_intitule"
          )
          .eq("id", procId)
          .maybeSingle();
        proc = r.data;
      }

      // Fusion : le socle fournit le declarant ; la procedure ecrase l'autre parent
      // et le jugement (les valeurs de la procedure active priment).
      const fusion: Dossier | null =
        socle || proc ? ({ ...(socle ?? {}), ...(proc ?? {}) } as Dossier) : null;

      setDossier(fusion);
      if (socle?.declarant_ville) setLieu(socle.declarant_ville);
      const init: Record<string, string> = { reference: "", precisions: "" };
      champs.forEach((c) => (init[c.nom] = ""));
      setVals(init);
      setChargement(false);
    }
    charger();
    // Chargement unique au montage (les champs du modele sont stables).
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <AppShell
      titre={titre}
      description={sousTitre}
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/courriers" variant="secondary">
            Retour aux modèles
          </AppButtonLink>
        </div>
      }
    >
      {chargement ? (
        <p className="text-sm text-[var(--app-text-muted)]">Chargement...</p>
      ) : (
        <div className="space-y-6">
          {dossierVide && (
            <AppNotice titre="Dossier incomplet">
              <p>
                Votre dossier semble incomplet. Renseignez vos informations dans{" "}
                <a href="/dossier" className="font-semibold underline">
                  Mon dossier
                </a>{" "}
                pour qu&apos;elles se reportent automatiquement.
              </p>
            </AppNotice>
          )}

          <AppCard titre="À compléter">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ChampTexte label="Lieu" value={lieu} onChange={setLieu} placeholder="Ville d'envoi" />
                {champs.filter((c) => !c.pleineLargeur).map((c) => (
                  <ChampTexte key={c.nom} label={c.label} type={c.type} placeholder={c.placeholder}
                    value={vals[c.nom] ?? ""} onChange={(val) => maj(c.nom, val)} />
                ))}
              </div>

              {champs.filter((c) => c.pleineLargeur).map((c) => (
                <label key={c.nom} className="block">
                  <span className="text-sm font-medium text-[var(--app-text)]">{c.label}</span>
                  <textarea rows={2} placeholder={c.placeholder}
                    value={vals[c.nom] ?? ""} onChange={(e) => maj(c.nom, e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--app-border)] bg-white px-3 py-2 text-sm focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]" />
                </label>
              ))}

              <label className="block">
                <span className="text-sm font-medium text-[var(--app-text)]">
                  Référence(s) légale(s) - à compléter et vérifier par vos soins
                </span>
                <textarea rows={2} value={vals.reference ?? ""} onChange={(e) => maj("reference", e.target.value)}
                  placeholder="Laissez vide, ou indiquez le ou les articles que vous aurez vérifiés."
                  className="mt-1 w-full rounded-md border border-[var(--app-border)] bg-white px-3 py-2 text-sm focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[var(--app-text)]">Précisions (facultatif)</span>
                <textarea rows={2} value={vals.precisions ?? ""} onChange={(e) => maj("precisions", e.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--app-border)] bg-white px-3 py-2 text-sm focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]" />
              </label>

              <button
                onClick={generer}
                className="rounded-md bg-[#15233F] px-5 py-2.5 text-sm font-medium text-[#F8F6F1] hover:bg-[#1d2f54]"
              >
                Générer le brouillon
              </button>
            </div>
          </AppCard>

          {brouillon && (
            <AppCard titre="Brouillon">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copier}
                    className="rounded-md border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                  >
                    {copie ? "Copié ✔" : "Copier"}
                  </button>
                  <button
                    onClick={() => exporterCourrierPdf(titre, brouillon)}
                    className="rounded-md bg-[#15233F] px-3 py-1.5 text-sm text-[#F8F6F1] hover:bg-[#1d2f54]"
                  >
                    Télécharger en PDF
                  </button>
                </div>
                <textarea
                  value={brouillon}
                  onChange={(e) => setBrouillon(e.target.value)}
                  rows={20}
                  className="w-full rounded-md border border-[var(--app-border)] bg-white px-3 py-2 text-sm leading-relaxed focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]"
                />
                <p className="text-xs text-[var(--app-text-muted)]">
                  Aide à la rédaction : relisez et adaptez librement. La portée
                  juridique tient surtout au mode d&apos;envoi (par ex. lettre
                  recommandée avec accusé de réception).
                </p>
              </div>
            </AppCard>
          )}

          <AppNotice titre="Brouillon à relire avant usage">
            <p>
              Ce brouillon est une aide à la rédaction. Relisez-le, adaptez-le
              et vérifiez-le avant tout envoi. Parent Preuve ne remplace pas un
              conseil juridique.
            </p>
          </AppNotice>
        </div>
      )}
    </AppShell>
  );
}
