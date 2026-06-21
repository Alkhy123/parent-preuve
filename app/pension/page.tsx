"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import EncartPliable from "@/components/EncartPliable";
import FormMessage from "@/components/ui/FormMessage";
import EmptyState from "@/components/ui/EmptyState";
import ReglePension from "@/components/ReglePension";
import { euros } from "@/lib/dossierCalculs";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { construireCsv } from "@/lib/csvExport";
import { telechargerCsv } from "@/lib/telechargerCsv";

type Paiement = {
  id: string;
  mois_du: string;
  montant_du: number;
  montant_paye: number;
  date_paiement: string | null;
  notes: string | null;
};

// Affiche "2026-06-01" comme "juin 2026"
function moisLisible(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

// Décide du statut d'un mois à partir des faits
function statut(p: Paiement): { texte: string; classe: string } {
  const du = Number(p.montant_du);
  const paye = Number(p.montant_paye);

  if (paye >= du && du > 0) return { texte: "Payé", classe: "bg-green-100 text-green-700" };
  if (paye > 0 && paye < du) return { texte: "Partiel", classe: "bg-amber-100 text-amber-700" };

  // Rien (ou presque) payé : impayé. En retard si le mois est déjà passé.
  const finDuMois = new Date(p.mois_du);
  finDuMois.setMonth(finDuMois.getMonth() + 1); // début du mois suivant
  const enRetard = new Date() > finDuMois;
  return enRetard
    ? { texte: "En retard", classe: "bg-red-100 text-red-700" }
    : { texte: "À venir", classe: "bg-slate-100 text-slate-600" };
}

export default function PensionPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [procedureId, setProcedureId] = useState<string | null>(null);

  const [mois, setMois] = useState("");        // format "2026-06" (champ month)
  const [montantDu, setMontantDu] = useState("");
  const [montantPaye, setMontantPaye] = useState("");
  const [datePaiement, setDatePaiement] = useState("");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [signalAjout, setSignalAjout] = useState(0);

  async function chargerPaiements() {
    const procId = await getProcedureActiveId();
    setProcedureId(procId);

    if (!procId) {
      setPaiements([]);
      return;
    }

    const { data, error } = await supabase
      .from("pension_payments")
      .select("id, mois_du, montant_du, montant_paye, date_paiement, notes")
      .eq("procedure_id", procId)
      .order("mois_du", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setPaiements(data ?? []);
  }

  useEffect(() => {
    chargerPaiements();
  }, []);

  async function ajouterPaiement() {
    setMessage("");
    setConfirmation("");
    if (!mois) return setMessage("Le mois est obligatoire.");
    const duNum = parseFloat(montantDu.replace(",", "."));
    if (isNaN(duNum)) return setMessage("Le montant dû doit être un nombre.");
    const payeNum = montantPaye.trim() ? parseFloat(montantPaye.replace(",", ".")) : 0;

    if (!procedureId) {
      return setMessage("Aucune procédure active. Ajoutez d'abord un enfant dans « Mes enfants ».");
    }

    const { error } = await supabase.from("pension_payments").insert({
      mois_du: mois + "-01", // on ajoute le 1er du mois
      montant_du: duNum,
      montant_paye: isNaN(payeNum) ? 0 : payeNum,
      date_paiement: datePaiement || null,
      procedure_id: procedureId,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMois(""); setMontantDu(""); setMontantPaye(""); setDatePaiement("");
      setConfirmation(
        "Mois enregistré. Le statut (payé, partiel, en retard) est calculé automatiquement et visible dans la liste."
      );
      setSignalAjout((n) => n + 1);
      chargerPaiements();
    }
  }

  async function supprimerPaiement(id: string) {
    const { error } = await supabase.from("pension_payments").delete().eq("id", id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerPaiements();
  }

  // Total encore dû (somme des manques sur tous les mois)
  const totalDu = paiements.reduce(
    (s, p) => s + Math.max(0, Number(p.montant_du) - Number(p.montant_paye)),
    0
  );

  // Export CSV des paiements de la procédure active (ce qui est affiché à l'écran).
  // Données factuelles uniquement : aucun jugement, aucune qualification.
  function exporterCsv() {
    const enTete = [
      "Mois",
      "Montant dû",
      "Montant payé",
      "Reste dû",
      "Statut",
      "Date de paiement",
      "Notes",
    ];
    const lignes = paiements.map((p) => {
      const resteDu = Math.max(0, Number(p.montant_du) - Number(p.montant_paye));
      return [
        moisLisible(p.mois_du),
        euros(Number(p.montant_du)),
        euros(Number(p.montant_paye)),
        euros(resteDu),
        statut(p).texte,
        p.date_paiement ?? "",
        p.notes ?? "",
      ];
    });
    const csv = construireCsv({
      enTete,
      lignes,
      contexte: { titre: "Pension alimentaire" },
    });
    const nomFichier = `pension-parent-preuve-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  return (
    <>
      <PageHeader
        eyebrow="Suivi"
        title="Pension alimentaire"
        subtitle="Suivez mois par mois ce qui est dû et ce qui a été payé."
      />
      <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="mt-6">
            <ReglePension />
          </div>

          {/* Total restant dû */}
          <div className="mt-6 carte rounded-xl border border-[#C2A24C]/20 bg-white p-4">
            <p className="text-sm text-[#1F2733]/60">Total restant dû (tous mois)</p>
            <p className="mt-1 text-2xl font-bold text-[#15233F]">{euros(totalDu)}</p>
          </div>

          {/* Export CSV */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={exporterCsv}
              disabled={paiements.length === 0}
              className="rounded-lg border border-[#C2A24C]/30 bg-white px-4 py-2 text-sm text-[#15233F] hover:bg-[#ECE7DC]/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Exporter en CSV
            </button>
          </div>

          {/* Formulaire */}
          <div className="mt-8">
            <EncartPliable
              titre="Ajouter un paiement"
              replieParDefaut
              signalFermeture={signalAjout}
            >
              <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#15233F]">
                  Mois concerné <span className="text-[#9B2C2C]">*</span>
                </label>
                <input
                  type="month" value={mois}
                  onChange={(e) => setMois(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#C2A24C]/30 px-3 py-2 bg-white text-[#1F2733]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#15233F]">
                  Montant dû (€) <span className="text-[#9B2C2C]">*</span>
                </label>
                <input
                  type="text" inputMode="decimal" placeholder="300"
                  value={montantDu} onChange={(e) => setMontantDu(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#C2A24C]/30 px-3 py-2 bg-white text-[#1F2733]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#15233F]">Montant payé (€)</label>
                <input
                  type="text" inputMode="decimal" placeholder="0 si rien reçu"
                  value={montantPaye} onChange={(e) => setMontantPaye(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#C2A24C]/30 px-3 py-2 bg-white text-[#1F2733]"
                />
                <p className="mt-1 text-xs text-[#1F2733]/60">
                  Indiquez ce qui a réellement été reçu. Un paiement partiel ou un
                  retard est simplement constaté, sans interprétation.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#15233F]">Date de réception (facultatif)</label>
                <input
                  type="date" value={datePaiement}
                  onChange={(e) => setDatePaiement(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#C2A24C]/30 px-3 py-2 bg-white text-[#1F2733]"
                />
              </div>
            </div>

            <button
              onClick={ajouterPaiement}
              className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#15233F]/90"
            >
              Enregistrer le mois
            </button>
            <FormMessage message={message} type="erreur" />
              </div>
            </EncartPliable>
          </div>

          {confirmation && (
            <div className="mt-6 rounded-lg border border-[#2E6A4D]/30 bg-[#2E6A4D]/5 px-4 py-3">
              <FormMessage message={confirmation} type="succes" />
            </div>
          )}

          {/* Liste */}
          <div className="mt-8 space-y-3">
            {paiements.length === 0 && (
              <EmptyState
                titre="Aucun mois enregistré"
                message="Enregistrez un premier mois avec « Ajouter un paiement » ci-dessus."
              />
            )}
            {paiements.map((p) => {
              const s = statut(p);
              return (
                <div key={p.id} className="carte rounded-xl border border-[#C2A24C]/20 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold capitalize text-[#15233F]">
                          {moisLisible(p.mois_du)}
                        </p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.classe}`}>
                          {s.texte}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#1F2733]/60">
                        Dû {euros(Number(p.montant_du))} · Payé {euros(Number(p.montant_paye))}
                        {p.date_paiement ? ` le ${p.date_paiement}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => supprimerPaiement(p.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
