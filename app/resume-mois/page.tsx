"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
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
    <AppShell
      titre="Resume du mois"
      description="Consulter une lecture mensuelle des frais, pensions et faits de la procedure active."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter/resume-mois" variant="secondary">
            Retour Exporter
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppCard titre="Mois sélectionné">
          <div className="flex items-center gap-3">
            <input
              id="mois"
              type="month"
              value={mois}
              onChange={(e) => setMois(e.target.value || moisCourant())}
              className="rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-[var(--app-text)]"
            />
            <span className="text-sm text-[var(--app-text-muted)] capitalize">
              {moisLisible(mois)}
            </span>
          </div>
        </AppCard>

        {chargement || !resume ? (
          <p className="text-sm text-[var(--app-text-muted)]">Chargement...</p>
        ) : (
          <div className="space-y-4">
            <AppCard titre="Frais du mois">
              {resume.nbFrais === 0 ? (
                <p className="text-sm text-[var(--app-text-muted)]">
                  Aucun frais ce mois-ci.
                </p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-[var(--app-text)]">
                    {euros(resume.frais.resteDu)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                    Reste dû · {resume.nbFrais} frais · {euros(resume.frais.totalDemande)}{" "}
                    demandés, {euros(resume.frais.totalRembourse)} remboursés.
                  </p>
                </>
              )}
            </AppCard>

            <AppCard titre="Pension du mois">
              {resume.nbPension === 0 ? (
                <p className="text-sm text-[var(--app-text-muted)]">
                  Aucun paiement enregistré pour ce mois.
                </p>
              ) : (
                <>
                  <p
                    className={`text-3xl font-bold ${
                      resume.pension.solde > 0 ? "text-[#9B2C2C]" : "text-[#2E6A4D]"
                    }`}
                  >
                    {resume.pension.solde > 0
                      ? `Reste dû ${euros(resume.pension.solde)}`
                      : resume.pension.solde < 0
                        ? `Trop-perçu ${euros(-resume.pension.solde)}`
                        : "À jour"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                    Dû {euros(resume.pension.totalDu)} · payé{" "}
                    {euros(resume.pension.totalPaye)}.
                  </p>
                </>
              )}
            </AppCard>

            <AppCard titre="Faits notés du mois">
              {resume.nbFaits === 0 ? (
                <p className="text-sm text-[var(--app-text-muted)]">
                  Aucun fait noté ce mois-ci.
                </p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-[var(--app-text)]">
                    {resume.nbFaits}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--app-text-muted)]">
                    {resume.categories.map((c) => (
                      <li key={c.categorie} className="flex justify-between">
                        <span>{c.categorie}</span>
                        <span className="font-medium text-[var(--app-text)]">
                          {c.nombre}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </AppCard>
          </div>
        )}

        <AppNotice titre="Rappel">
          <p>
            Chiffres factuels issus de vos saisies, cloisonnés par la procédure
            active. Aucune donnée n&apos;est modifiée par cette page. À vérifier
            avant tout usage.
          </p>
        </AppNotice>
      </div>
    </AppShell>
  );
}
