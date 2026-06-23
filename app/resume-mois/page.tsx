"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import {
  totauxFrais,
  totauxPension,
  euros,
  type FraisCalcul,
  type PensionCalcul,
} from "@/lib/dossierCalculs";
import { getProcedureActiveId } from "@/lib/procedureActive";

// ── Formes minimales des lignes chargées ────────────────────────────────────
type FraisRow = FraisCalcul & {
  date_frais: string;
};
type PensionRow = PensionCalcul & {
  mois_du: string;
};
type EventRow = {
  categorie: string;
  date_evenement: string;
};

// ── Helpers mois (chaînes "AAAA-MM", pas de souci de fuseau) ─────────────────
function moisCourant(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}

function moisLisible(mois: string): string {
  const [annee, m] = mois.split("-");
  const d = new Date(Number(annee), Number(m) - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default function ResumeMoisPage() {
  // Mois affiché (par défaut : le mois en cours).
  const [mois, setMois] = useState<string>(moisCourant());

  // Lignes de la procédure active, chargées une seule fois (lecture seule).
  const [fraisProc, setFraisProc] = useState<FraisRow[] | null>(null);
  const [pensionProc, setPensionProc] = useState<PensionRow[] | null>(null);
  const [eventsProc, setEventsProc] = useState<EventRow[] | null>(null);

  useEffect(() => {
    let annule = false;

    async function charger() {
      const procId = await getProcedureActiveId();

      // Cloisonnement strict en base sur procedure_id. Sans procédure active,
      // rien à afficher.
      if (!procId) {
        if (!annule) {
          setFraisProc([]);
          setPensionProc([]);
          setEventsProc([]);
        }
        return;
      }

      const [frRes, peRes, evRes] = await Promise.all([
        supabase
          .from("expenses")
          .select("part_autre, rembourse, date_frais")
          .eq("procedure_id", procId),
        supabase
          .from("pension_payments")
          .select("montant_du, montant_paye, mois_du")
          .eq("procedure_id", procId),
        supabase
          .from("events")
          .select("categorie, date_evenement")
          .eq("procedure_id", procId),
      ]);

      if (annule) return;

      setFraisProc((frRes.data ?? []) as FraisRow[]);
      setPensionProc((peRes.data ?? []) as PensionRow[]);
      setEventsProc((evRes.data ?? []) as EventRow[]);
    }

    charger();
    return () => {
      annule = true;
    };
  }, []);

  const chargement = fraisProc === null || pensionProc === null || eventsProc === null;

  // Tranche du mois sélectionné + calculs (recalculé quand le mois change).
  const resume = useMemo(() => {
    if (chargement) return null;

    const fraisMois = fraisProc!.filter((f) => (f.date_frais ?? "").startsWith(mois));
    const pensionMois = pensionProc!.filter((p) => (p.mois_du ?? "").startsWith(mois));
    const eventsMois = eventsProc!.filter((e) =>
      (e.date_evenement ?? "").startsWith(mois)
    );

    // Comptage des faits par catégorie (trié par nombre décroissant).
    const parCategorie = new Map<string, number>();
    for (const e of eventsMois) {
      const cat = e.categorie || "Autre";
      parCategorie.set(cat, (parCategorie.get(cat) ?? 0) + 1);
    }
    const categories = [...parCategorie.entries()]
      .map(([categorie, nombre]) => ({ categorie, nombre }))
      .sort((a, b) => b.nombre - a.nombre);

    return {
      frais: totauxFrais(fraisMois),
      nbFrais: fraisMois.length,
      pension: totauxPension(pensionMois),
      nbPension: pensionMois.length,
      nbFaits: eventsMois.length,
      categories,
    };
  }, [chargement, fraisProc, pensionProc, eventsProc, mois]);

  return (
    <>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Résumé du mois"
        subtitle="Pour le mois choisi : frais, pension et faits notés. Lecture seule, à partir de vos saisies."
      />
      <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* Sélecteur de mois */}
          <div className="carte rounded-xl border border-[#C2A24C]/20 bg-white p-4">
            <label
              htmlFor="mois"
              className="block text-sm font-medium text-[#1F2733]/70"
            >
              Mois
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="mois"
                type="month"
                value={mois}
                onChange={(e) => setMois(e.target.value || moisCourant())}
                className="rounded-lg border border-[#C2A24C]/40 bg-white px-3 py-2 text-[#1F2733]"
              />
              <span className="text-sm text-[#1F2733]/60 capitalize">
                {moisLisible(mois)}
              </span>
            </div>
          </div>

          {chargement || !resume ? (
            <p className="mt-6 text-sm text-[#5A6473]">Chargement…</p>
          ) : (
            <div className="mt-6 space-y-5">
              {/* Frais du mois */}
              <section className="carte rounded-xl border border-[#C2A24C]/20 bg-white p-5">
                <h2 className="text-sm font-medium uppercase tracking-wide text-or-fonce">
                  Frais du mois
                </h2>
                {resume.nbFrais === 0 ? (
                  <p className="mt-2 text-sm text-[#5A6473]">Aucun frais ce mois-ci.</p>
                ) : (
                  <>
                    <p className="mt-1 text-3xl font-bold text-[#15233F]">
                      {euros(resume.frais.resteDu)}
                    </p>
                    <p className="mt-1 text-sm text-[#5A6473]">
                      Reste dû · {resume.nbFrais} frais · {euros(resume.frais.totalDemande)}{" "}
                      demandés, {euros(resume.frais.totalRembourse)} remboursés.
                    </p>
                  </>
                )}
              </section>

              {/* Pension du mois */}
              <section className="carte rounded-xl border border-[#C2A24C]/20 bg-white p-5">
                <h2 className="text-sm font-medium uppercase tracking-wide text-or-fonce">
                  Pension du mois
                </h2>
                {resume.nbPension === 0 ? (
                  <p className="mt-2 text-sm text-[#5A6473]">
                    Aucun paiement enregistré pour ce mois.
                  </p>
                ) : (
                  <>
                    <p
                      className={`mt-1 text-3xl font-bold ${
                        resume.pension.solde > 0 ? "text-[#9B2C2C]" : "text-[#2E6A4D]"
                      }`}
                    >
                      {resume.pension.solde > 0
                        ? `Reste dû ${euros(resume.pension.solde)}`
                        : resume.pension.solde < 0
                          ? `Trop-perçu ${euros(-resume.pension.solde)}`
                          : "À jour"}
                    </p>
                    <p className="mt-1 text-sm text-[#5A6473]">
                      Dû {euros(resume.pension.totalDu)} · payé{" "}
                      {euros(resume.pension.totalPaye)}.
                    </p>
                  </>
                )}
              </section>

              {/* Faits notés du mois */}
              <section className="carte rounded-xl border border-[#C2A24C]/20 bg-white p-5">
                <h2 className="text-sm font-medium uppercase tracking-wide text-or-fonce">
                  Faits notés du mois
                </h2>
                {resume.nbFaits === 0 ? (
                  <p className="mt-2 text-sm text-[#5A6473]">Aucun fait noté ce mois-ci.</p>
                ) : (
                  <>
                    <p className="mt-1 text-3xl font-bold text-[#15233F]">
                      {resume.nbFaits}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-[#5A6473]">
                      {resume.categories.map((c) => (
                        <li key={c.categorie} className="flex justify-between">
                          <span>{c.categorie}</span>
                          <span className="font-medium text-[#1F2733]">{c.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>

              <p className="text-xs text-[#1F2733]/50">
                Chiffres factuels issus de vos saisies, cloisonnés par la procédure
                active. Aucune donnée n'est modifiée par cette page.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
