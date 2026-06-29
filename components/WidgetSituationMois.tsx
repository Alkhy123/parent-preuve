"use client";

// components/WidgetSituationMois.tsx
//
// Widget d'accueil : situation de la PENSION du MOIS EN COURS.
// LECTURE SEULE, aucune ecriture en base.
//
// Reutilise la logique de app/resume-mois/page.tsx :
//   meme table (pension_payments), meme colonne mois_du, meme calcul
//   totauxPension, meme cloisonnement sur la procedure active.
//
// Difference avec TableauDeBord : ici on ne montre QUE le mois courant,
// pas le cumul tous mois confondus.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { totauxPension, euros, type PensionCalcul } from "@/lib/dossierCalculs";

// Forme minimale d'une ligne de pension chargee.
type LignePension = PensionCalcul & { mois_du: string | null };

// Etat calcule du mois (lecture seule).
type EtatMois = {
  nb: number;
  totalDu: number;
  totalPaye: number;
  solde: number;
};

// ── Helpers mois (chaines "AAAA-MM", pas de souci de fuseau) ────────────────
// Dupliques volontairement depuis resume-mois (2 fonctions triviales) pour
// ne pas modifier une page qui fonctionne. A extraire dans lib/mois.ts si un
// 3e ecran en a besoin.
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

export default function WidgetSituationMois() {
  const moisActuel = moisCourant();

  const [etat, setEtat] = useState<EtatMois | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        const procId = await getProcedureActiveId();

        let lignes: LignePension[] = [];
        if (procId) {
          const { data } = await supabase
            .from("pension_payments")
            .select("montant_du, montant_paye, mois_du")
            .eq("procedure_id", procId);
          lignes = (data ?? []) as LignePension[];
        }

        // Lignes du mois courant (robuste : mois_du peut etre "2026-06" ou "2026-06-01").
        const lignesMois = lignes.filter((l) =>
          (l.mois_du ?? "").startsWith(moisActuel)
        );
        const t = totauxPension(lignesMois);

        if (!annule) {
          setEtat({
            nb: lignesMois.length,
            totalDu: t.totalDu,
            totalPaye: t.totalPaye,
            solde: t.solde,
          });
        }
      } catch {
        if (!annule) setErreur(true);
      }
    })();

    return () => {
      annule = true;
    };
  }, [moisActuel]);

  // En-tete commun (titre + mois + lien detail).
  const entete = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-lg text-[#15233F]">Situation du mois</h2>
        <p className="mt-0.5 text-sm capitalize text-[#5A6473]">
          {moisLisible(moisActuel)}
        </p>
      </div>
      <Link
        href="/resume-mois"
        className="shrink-0 text-sm text-[#15233F] underline underline-offset-2"
      >
        Voir le résumé du mois
      </Link>
    </div>
  );

  // Etat : chargement.
  if (etat === null && !erreur) {
    return (
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm text-sm text-slate-500">
        Chargement de la situation du mois...
      </div>
    );
  }

  // Etat : echec. On n'affirme jamais que la pension est a jour.
  if (erreur || etat === null) {
    return (
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        {entete}
        <p className="mt-3 text-sm text-slate-500">
          Situation indisponible pour le moment. Vous pouvez réessayer plus tard.
        </p>
      </div>
    );
  }

  // Aucun paiement enregistre pour ce mois.
  if (etat.nb === 0) {
    return (
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        {entete}
        <p className="mt-3 text-sm text-[#5A6473]">
          Aucun paiement de pension enregistré pour ce mois.
        </p>
        <p className="mt-3 text-xs text-[#1F2733]/50">
          Chiffres issus de vos saisies, soumis à l&apos;appréciation du juge.
        </p>
      </div>
    );
  }

  // Mise en forme du chiffre principal + libelle, selon le solde.
  const vue =
    etat.solde > 0
      ? {
          principal: euros(etat.solde),
          libelle:
            etat.totalPaye > 0
              ? "Reste dû - paiement partiel"
              : "Reste dû - en attente de paiement",
          couleur: "#9B2C2C",
        }
      : etat.solde < 0
        ? {
            principal: euros(-etat.solde),
            libelle: "Trop-perçu",
            couleur: "#2E6A4D",
          }
        : {
            principal: "À jour",
            libelle: "Pension réglée pour ce mois",
            couleur: "#2E6A4D",
          };

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      {entete}

      <p className="mt-3 text-3xl font-bold" style={{ color: vue.couleur }}>
        {vue.principal}
      </p>
      <p className="mt-1 text-sm font-medium" style={{ color: vue.couleur }}>
        {vue.libelle}
      </p>
      <p className="mt-1 text-sm text-[#5A6473]">
        Due {euros(etat.totalDu)} · payé {euros(etat.totalPaye)}.
      </p>

      <p className="mt-3 text-xs text-[#1F2733]/50">
        Chiffres issus de vos saisies, soumis à l&apos;appréciation du juge.
      </p>
    </div>
  );
}
