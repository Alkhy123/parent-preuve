"use client";

// Carte d'accueil "Prochaine etape recommandee".
// Lecture seule : aucune ecriture en base, aucun appel IA.

import { useEffect, useState, type ReactNode } from "react";
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

const BADGE: Record<
  ProchaineAction["priorite"],
  { classe: string; libelle: string }
> = {
  bloquant: { classe: "badge-erreur", libelle: "Prioritaire" },
  important: { classe: "badge-attention", libelle: "Important" },
  conseil: { classe: "badge-info", libelle: "Conseille" },
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
        const [donnees, config, procId] = await Promise.all([
          chargerEtatDossier("", ""),
          getEtatConfigurationDossier(),
          getProcedureActiveId(),
        ]);

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

  if (etat.phase === "chargement") {
    return (
      <CarteAction>
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
          Recherche de la prochaine étape…
        </p>
      </CarteAction>
    );
  }

  if (etat.phase === "erreur") {
    return (
      <CarteAction>
        <Titre />
        <p className="mt-2 text-sm" style={{ color: "var(--app-text-muted)" }}>
          Indisponible pour le moment. Vous pouvez réessayer plus tard.
        </p>
      </CarteAction>
    );
  }

  if (etat.action === null) {
    return (
      <CarteAction>
        <Titre />
        <p className="mt-2 text-sm" style={{ color: "var(--app-text-muted)" }}>
          Votre dossier ne présente pas d&apos;action urgente. Vous pouvez continuer
          à noter les faits au fil de l&apos;eau.
        </p>
      </CarteAction>
    );
  }

  const action = etat.action;
  const badge = BADGE[action.priorite];

  return (
    <CarteAction>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Titre />
        <span className={`badge ${badge.classe}`}>{badge.libelle}</span>
      </div>

      <p className="mt-3 text-lg font-semibold" style={{ color: "var(--app-text)" }}>
        {action.titre}
      </p>
      <p className="mt-1 max-w-3xl text-sm" style={{ color: "var(--app-text-muted)" }}>
        {action.description}
      </p>

      <Link
        href={action.href}
        className="mt-4 inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white transition sm:w-auto"
        style={{ backgroundColor: "var(--app-primary)" }}
      >
        {action.cta}
      </Link>
    </CarteAction>
  );
}

function CarteAction({ children }: { children: ReactNode }) {
  return (
    <section
      className="rounded-xl border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      style={{
        backgroundColor: "var(--app-primary-soft)",
        borderColor: "color-mix(in srgb, var(--app-primary) 28%, var(--app-border))",
      }}
    >
      {children}
    </section>
  );
}

function Titre() {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-wide"
      style={{ color: "var(--app-primary)" }}
    >
      Prochaine étape recommandée
    </p>
  );
}
