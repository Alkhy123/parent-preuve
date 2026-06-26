"use client";

// Widget d'accueil : actions prioritaires, lecture seule et cloisonnee par procedure.

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/apercu/icones";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { chargerEtatDossier } from "@/lib/etatDossier";
import {
  totauxPension,
  euros,
  type PensionCalcul,
} from "@/lib/dossierCalculs";

type Niveau = "bloquant" | "avertissement";

type Action = {
  cle: string;
  niveau: Niveau;
  libelle: string;
  lien: string;
};

export default function WidgetActionsPrioritaires() {
  const [actions, setActions] = useState<Action[] | null>(null);
  const [reste, setReste] = useState(0);
  const [erreur, setErreur] = useState(false);
  // Progression des fondations du dossier (donnée réelle déjà chargée, pas un
  // pourcentage inventé) : état civil des 2 parents, référence jugement, ≥ 1 enfant.
  const [prog, setProg] = useState<{ faits: number; total: number } | null>(null);

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        const [donnees, procId] = await Promise.all([
          chargerEtatDossier("", ""),
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

        const liste: Action[] = [];
        const socleComplet =
          donnees.socle !== null &&
          donnees.socle.parent1Complet &&
          donnees.socle.parent2Complet &&
          donnees.socle.referenceJugementRenseignee;

        if (!socleComplet) {
          liste.push({
            cle: "socle",
            niveau: "bloquant",
            libelle:
              "Compléter le socle du dossier : état civil des parents et référence du jugement.",
            lien: "/dossier",
          });
        }

        if (donnees.nombreEnfants === 0) {
          liste.push({
            cle: "enfants",
            niveau: "bloquant",
            libelle: "Renseigner au moins un enfant.",
            lien: "/enfants",
          });
        }

        if (donnees.fraisSansJustificatif > 0) {
          liste.push({
            cle: "frais",
            niveau: "avertissement",
            libelle: `Rattacher un justificatif à ${donnees.fraisSansJustificatif} frais.`,
            lien: "/frais",
          });
        }

        if (donnees.evenementsEnBrouillon > 0) {
          const n = donnees.evenementsEnBrouillon;
          liste.push({
            cle: "brouillons",
            niveau: "avertissement",
            libelle: `Finaliser ${n} événement${n > 1 ? "s" : ""} en brouillon.`,
            lien: "/journal",
          });
        }

        if (donnees.preuvesHorodatageARefaire > 0) {
          const n = donnees.preuvesHorodatageARefaire;
          liste.push({
            cle: "preuves",
            niveau: "avertissement",
            libelle: `Reprendre l'horodatage de ${n} preuve${n > 1 ? "s" : ""}.`,
            lien: "/preuves",
          });
        }

        if (soldePension > 0) {
          liste.push({
            cle: "pension",
            niveau: "avertissement",
            libelle: `Pension : ${euros(soldePension)} restant dû à suivre.`,
            lien: "/pension",
          });
        }

        const rang = (x: Niveau) => (x === "bloquant" ? 0 : 1);
        const triees = [...liste].sort((a, b) => rang(a.niveau) - rang(b.niveau));
        const top = triees.slice(0, 4);

        // Fondations du dossier (drapeaux déjà chargés dans `donnees`).
        const fondations = [
          !!donnees.socle?.parent1Complet,
          !!donnees.socle?.parent2Complet,
          !!donnees.socle?.referenceJugementRenseignee,
          donnees.nombreEnfants > 0,
        ];
        const faitsFond = fondations.filter(Boolean).length;

        if (!annule) {
          setActions(top);
          setReste(triees.length - top.length);
          setProg({ faits: faitsFond, total: fondations.length });
        }
      } catch {
        if (!annule) setErreur(true);
      }
    })();

    return () => {
      annule = true;
    };
  }, []);

  if (actions === null && !erreur) {
    return (
      <Carte>
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
          Recherche des actions prioritaires…
        </p>
      </Carte>
    );
  }

  if (erreur || actions === null) {
    return (
      <Carte>
        <Titre />
        <p className="mt-2 text-sm" style={{ color: "var(--app-text-muted)" }}>
          Liste indisponible pour le moment. Vous pouvez réessayer plus tard.
        </p>
      </Carte>
    );
  }

  return (
    <Carte>
      <Titre />

      {prog && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium" style={{ color: "var(--app-text-muted)" }}>
              Dossier complété
            </span>
            <span style={{ color: "var(--app-text-muted)" }}>
              {prog.faits}/{prog.total} · {Math.round((prog.faits / prog.total) * 100)} %
            </span>
          </div>
          <div
            className="mt-1 h-1.5 overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--app-surface-muted)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((prog.faits / prog.total) * 100)}%`,
                backgroundColor: "var(--app-primary)",
              }}
            />
          </div>
        </div>
      )}

      {actions.length === 0 ? (
        <div
          className="mt-3 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--app-border)",
            backgroundColor: "var(--app-surface-muted)",
            color: "var(--app-text-muted)",
          }}
        >
          Votre dossier ne présente pas d&apos;action urgente. Vous pouvez continuer
          à noter les faits au fil de l&apos;eau.
        </div>
      ) : (
        <>
          <ul className="mt-3 space-y-2">
            {actions.map((a) => (
              <li key={a.cle}>
                <Link
                  href={a.lien}
                  className="flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "var(--app-surface-muted)",
                    color: "var(--app-text)",
                  }}
                >
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        a.niveau === "bloquant"
                          ? "var(--app-danger, #9B2C2C)"
                          : "var(--app-primary)",
                    }}
                  />
                  <span>{a.libelle}</span>
                </Link>
              </li>
            ))}
          </ul>

          {reste > 0 && (
            <p className="mt-2 text-xs" style={{ color: "var(--app-text-muted)" }}>
              +{reste} autre{reste > 1 ? "s" : ""} point{reste > 1 ? "s" : ""} à vérifier.
            </p>
          )}
        </>
      )}
    </Carte>
  );
}

function Carte({ children }: { children: ReactNode }) {
  return (
    <section
      className="min-h-[15rem] rounded-xl border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      style={{
        backgroundColor: "var(--app-surface)",
        borderColor: "var(--app-border)",
      }}
    >
      {children}
    </section>
  );
}

function Titre() {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold" style={{ color: "var(--app-text)" }}>
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--app-primary-soft)", color: "var(--app-primary)" }}
      >
        <Icon name="check" className="h-4 w-4" />
      </span>
      Éléments à compléter
    </h2>
  );
}
