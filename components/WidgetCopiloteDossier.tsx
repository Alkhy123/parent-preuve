
// components/WidgetCopiloteDossier.tsx
//
// Première brique "Copilote dossier" sur l'accueil connecté.
// LECTURE SEULE : aucune écriture en base, aucun appel IA, aucune route API.
// Objectif : transformer l'état réel du dossier en une prochaine action simple.

import { useEffect, useState } from "react";
import Link from "next/link";

import { chargerEtatDossier } from "@/lib/etatDossier";

type EtatDossier = Awaited<ReturnType<typeof chargerEtatDossier>>;

type NiveauCopilote = "bloquant" | "avertissement" | "pret";

type ActionCopilote = {
  niveau: NiveauCopilote;
  titre: string;
  description: string;
  href: string;
  cta: string;
};

function choisirProchaineAction(donnees: EtatDossier): ActionCopilote {
  const socleComplet =
    donnees.socle !== null &&
    donnees.socle.parent1Complet &&
    donnees.socle.parent2Complet &&
    donnees.socle.referenceJugementRenseignee;

  if (!socleComplet) {
    return {
      niveau: "bloquant",
      titre: "Compléter le socle du dossier",
      description:
        "Le copilote vous conseille de commencer par les informations de base : parents, autre parent et référence du jugement.",
      href: "/dossier",
      cta: "Ouvrir mon dossier",
    };
  }

  if (donnees.nombreEnfants === 0) {
    return {
      niveau: "bloquant",
      titre: "Renseigner au moins un enfant",
      description:
        "Sans enfant rattaché au dossier, les événements, frais et justificatifs seront moins faciles à organiser.",
      href: "/enfants",
      cta: "Ajouter un enfant",
    };
  }

  if (donnees.fraisSansJustificatif > 0) {
    return {
      niveau: "avertissement",
      titre: "Rattacher les justificatifs manquants",
      description: `${donnees.fraisSansJustificatif} frais n'ont pas encore de justificatif rattaché. C'est une bonne prochaine action pour renforcer le dossier.`,
      href: "/frais",
      cta: "Voir les frais",
    };
  }

  if (donnees.evenementsEnBrouillon > 0) {
    const n = donnees.evenementsEnBrouillon;

    return {
      niveau: "avertissement",
      titre: "Finaliser les événements en brouillon",
      description: `${n} événement${n > 1 ? "s" : ""} encore en brouillon ${
        n > 1 ? "peuvent" : "peut"
      } être relu${n > 1 ? "s" : ""}, précisé${n > 1 ? "s" : ""} puis finalisé${
        n > 1 ? "s" : ""
      }.`,
      href: "/journal",
      cta: "Ouvrir le journal",
    };
  }

  if (donnees.preuvesHorodatageARefaire > 0) {
    const n = donnees.preuvesHorodatageARefaire;

    return {
      niveau: "avertissement",
      titre: "Reprendre l'horodatage des preuves",
      description: `${n} preuve${n > 1 ? "s" : ""} ${
        n > 1 ? "nécessitent" : "nécessite"
      } une vérification d'horodatage avant d&apos;être considérée${
        n > 1 ? "s" : ""
      } comme proprement exploitable${n > 1 ? "s" : ""}.`,
      href: "/preuves",
      cta: "Voir les preuves",
    };
  }

  return {
    niveau: "pret",
    titre: "Dossier prêt à être vérifié",
    description:
      "Aucun point prioritaire n'est ressorti du contrôle d'accueil. Vous pouvez vérifier l'export avant de générer un document.",
    href: "/export",
    cta: "Vérifier l'export",
  };
}

function libelleNiveau(niveau: NiveauCopilote) {
  if (niveau === "bloquant") return "À compléter";
  if (niveau === "avertissement") return "À vérifier";
  return "Prêt";
}

function classesNiveau(niveau: NiveauCopilote) {
  if (niveau === "bloquant") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (niveau === "avertissement") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export default function WidgetCopiloteDossier() {
  const [action, setAction] = useState<ActionCopilote | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        const donnees = await chargerEtatDossier("", "");
        const prochaineAction = choisirProchaineAction(donnees);

        if (!annule) {
          setAction(prochaineAction);
          setErreur(false);
        }
      } catch {
        if (!annule) {
          setErreur(true);
        }
      } finally {
        if (!annule) {
          setChargement(false);
        }
      }
    })();

    return () => {
      annule = true;
    };
  }, []);

  if (chargement) {
    return (
      <div className="carte rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Analyse du dossier par le copilote…
      </div>
    );
  }

  if (erreur || action === null) {
    return (
      <div className="carte rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-lg text-[#15233F]">Copilote dossier</h2>

        <p className="mt-2 text-sm text-slate-500">
          Le copilote ne peut pas analyser le dossier pour le moment. Vous pouvez
          continuer à utiliser les rubriques habituelles.
        </p>
      </div>
    );
  }

  return (
    <div className="carte rounded-xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
            Copilote dossier
          </p>

          <h2 className="mt-1 font-display text-xl text-[#15233F]">
            Votre prochaine action utile
          </h2>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${classesNiveau(
            action.niveau
          )}`}
        >
          {libelleNiveau(action.niveau)}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
        <h3 className="font-semibold text-[#15233F]">{action.titre}</h3>

        <p className="mt-2 text-sm leading-6 text-[#5A6473]">
          {action.description}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
                href={action.href}
                className="inline-flex rounded-lg bg-[#15233F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F1A2E]"
            >
                {action.cta}
            </Link>

            <Link
                href="/copilote"
                className="inline-flex rounded-lg border border-[#C2A24C]/60 bg-white px-4 py-2 text-sm font-medium text-[#15233F] transition hover:bg-[#F1E8D0]"
            >
                Tester le copilote agent
            </Link>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Aide à l'organisation factuelle uniquement : le copilote ne donne
        pas de conseil juridique et n'enregistre rien automatiquement.
      </p>
    </div>
  );
}