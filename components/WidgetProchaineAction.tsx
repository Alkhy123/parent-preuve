"use client";

// components/WidgetProchaineAction.tsx
//
// Carte d'accueil "Prochaine etape recommandee" : met en avant UNE seule
// action utile, avec un bouton clair. LECTURE SEULE, aucune ecriture en base,
// aucun appel IA.
//
// Reutilise les helpers existants (memes sources que WidgetActionsPrioritaires
// et ConfigurationDossier) puis delegue le choix a la fonction pure
// lib/ux/prochaineAction.ts.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { chargerEtatDossier } from "@/lib/etatDossier";
import { getEtatConfigurationDossier } from "@/lib/etatConfiguration";
import { totauxPension, type PensionCalcul } from "@/lib/dossierCalculs";
import {
  prochaineAction,
  type ProchaineAction,
} from "@/lib/ux/prochaineAction";

// Libelle + style de badge selon la priorite (jamais l'or vif en texte).
const BADGE: Record<
  ProchaineAction["priorite"],
  { classe: string; libelle: string }
> = {
  bloquant: { classe: "badge-erreur", libelle: "Prioritaire" },
  important: { classe: "badge-attention", libelle: "Important" },
  conseil: { classe: "badge-info", libelle: "Conseillé" },
};

type Etat =
  | { phase: "chargement" }
  | { phase: "erreur" }
  | { phase: "pret"; action: ProchaineAction | null };

export default function WidgetProchaineAction() {
  const [etat, setEtat] = useState<Etat>({ phase: "chargement" });

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        // Memes sources que le reste de l'accueil, cloisonnees sur la procedure active.
        const [donnees, config, procId] = await Promise.all([
          chargerEtatDossier("", ""),
          getEtatConfigurationDossier(),
          getProcedureActiveId(),
        ]);

        // Solde de pension (la pension n'est pas couverte par chargerEtatDossier).
        let soldePension = 0;
        if (procId) {
          const { data } = await supabase
            .from("pension_payments")
            .select("montant_du, montant_paye")
            .eq("procedure_id", procId);
          soldePension = totauxPension((data ?? []) as PensionCalcul[]).solde;
        }

        const action = prochaineAction({
          socle: donnees.socle,
          nombreEnfants: donnees.nombreEnfants,
          jugement: config.jugement,
          fraisSansJustificatif: donnees.fraisSansJustificatif,
          evenementsEnBrouillon: donnees.evenementsEnBrouillon,
          preuvesHorodatageARefaire: donnees.preuvesHorodatageARefaire,
          soldePension,
        });

        if (!annule) setEtat({ phase: "pret", action });
      } catch {
        if (!annule) setEtat({ phase: "erreur" });
      }
    })();

    return () => {
      annule = true;
    };
  }, []);

  // Chargement : repere neutre, sans clignotement.
  if (etat.phase === "chargement") {
    return (
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm text-sm text-texte-doux">
        Recherche de la prochaine étape...
      </div>
    );
  }

  // Echec : on ne propose rien d'affirmatif, on invite a reessayer.
  if (etat.phase === "erreur") {
    return (
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        <h2 className="font-display text-lg text-navy">Prochaine étape recommandée</h2>
        <p className="mt-2 text-sm text-texte-doux">
          Indisponible pour le moment. Vous pouvez réessayer plus tard.
        </p>
      </div>
    );
  }

  // Rien de prioritaire : message de secours, ton rassurant et non anxiogene.
  if (etat.action === null) {
    return (
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        <h2 className="font-display text-lg text-navy">Prochaine étape recommandée</h2>
        <p className="mt-2 text-sm text-texte-doux">
          Votre dossier ne présente pas d&apos;action urgente. Vous pouvez continuer
          à noter les faits au fil de l&apos;eau.
        </p>
      </div>
    );
  }

  const action = etat.action;
  const badge = BADGE[action.priorite];

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-navy">Prochaine étape recommandée</h2>
        <span className={`badge ${badge.classe}`}>{badge.libelle}</span>
      </div>

      <p className="mt-3 text-base font-medium text-texte">{action.titre}</p>
      <p className="mt-1 text-sm text-texte-doux">{action.description}</p>

      <Link
        href={action.href}
        className="mt-4 inline-flex w-full justify-center sm:w-auto rounded-xl bg-[var(--app-text)] px-4 py-2 text-sm font-semibold text-[var(--app-surface)] transition hover:opacity-90"
      >
        {action.cta}
      </Link>
    </div>
  );
}
