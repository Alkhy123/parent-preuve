"use client";

// app/copilote/page.tsx
//
// Page de test du Copilote Agent.
//
// Cette page permet deux tests séparés :
// 1. Dry-run sécurisé : /api/agent/analyser-demande
//    - aucun appel IA ;
//    - aucun quota IA ;
//    - aucune écriture.
//
// 2. Test expérimental Mistral : /api/agent/repondre
//    - appel IA réel ;
//    - consentement IA requis ;
//    - quota IA requis ;
//    - validation stricte de la réponse ;
//    - aucune écriture métier ;
//    - aucune action automatique.

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import ConsentementIA from "@/components/ConsentementIA";

import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import type { AgentReponseStructuree } from "@/lib/agent";

type ValidationAgentApi = {
  ok: boolean;
  erreur: string;
};

type ReponseAgentApi =
  | {
      ok: true;
      source?: "dry_run" | "mistral" | "garde_fou_local";
      validation?: ValidationAgentApi;
      reponse: AgentReponseStructuree;
    }
  | {
      erreur: string;
    };

type ModeReponse = "dry-run" | "mistral";

const EXEMPLES_DEMANDES = [
  "Je veux ajouter une facture de cantine",
  "Je veux noter un retard dans le journal",
  "Je veux classer une photo comme preuve",
  "Je veux préparer mon export PDF",
  "Rédige mes conclusions pour gagner devant le JAF",
];

function libelleBooleen(valeur: boolean) {
  return valeur ? "Oui" : "Non";
}

function libelleMode(mode: ModeReponse | null) {
  if (mode === "mistral") return "Test Mistral expérimental";
  return "Dry-run sécurisé";
}

export default function PageCopilote() {
  const [utilisateur, setUtilisateur] = useState<User | null>(null);
  const [verificationConnexion, setVerificationConnexion] = useState(true);

  const [message, setMessage] = useState("");
  const [reponse, setReponse] = useState<AgentReponseStructuree | null>(null);
  const [validation, setValidation] = useState<ValidationAgentApi | null>(null);
  const [modeReponse, setModeReponse] = useState<ModeReponse | null>(null);
  const [sourceApi, setSourceApi] = useState("");

  const [erreur, setErreur] = useState("");
  const [chargementDryRun, setChargementDryRun] = useState(false);
  const [chargementMistral, setChargementMistral] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUtilisateur(data.user);
      setVerificationConnexion(false);
    });

    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUtilisateur(session?.user ?? null);
        setVerificationConnexion(false);
      }
    );

    return () => ecouteur.subscription.unsubscribe();
  }, []);

  function viderResultats() {
    setReponse(null);
    setValidation(null);
    setModeReponse(null);
    setSourceApi("");
    setErreur("");
  }

  async function envoyerDemandeAgent({
    endpoint,
    mode,
  }: {
    endpoint: "/api/agent/analyser-demande" | "/api/agent/repondre";
    mode: ModeReponse;
  }) {
    const demande = message.trim();

    if (demande === "") {
      return;
    }

    if (mode === "dry-run") {
      setChargementDryRun(true);
    } else {
      setChargementMistral(true);
    }

    viderResultats();

    try {
      const resultat = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify({ message: demande }),
      });

      const data = (await resultat.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }))) as ReponseAgentApi;

      if (!resultat.ok || "erreur" in data) {
        setErreur(
          "erreur" in data ? data.erreur : "Le copilote n'a pas pu répondre."
        );
        return;
      }

      setReponse(data.reponse);
      setValidation(data.validation ?? null);
      setModeReponse(mode);
      setSourceApi(data.source ?? "");
    } catch {
      setErreur("Connexion impossible avec le copilote.");
    } finally {
      setChargementDryRun(false);
      setChargementMistral(false);
    }
  }

  async function analyserDemande(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await envoyerDemandeAgent({
      endpoint: "/api/agent/analyser-demande",
      mode: "dry-run",
    });
  }

  async function analyserAvecMistral() {
    await envoyerDemandeAgent({
      endpoint: "/api/agent/repondre",
      mode: "mistral",
    });
  }

  if (verificationConnexion) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-slate-500">Chargement…</p>
      </main>
    );
  }

  if (!utilisateur) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="carte rounded-2xl border border-[#E1D7C4] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
            Copilote Agent
          </p>

          <h1 className="mt-2 font-display text-3xl text-[#15233F]">
            Connexion requise
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#5A6473]">
            Vous devez être connecté pour tester le copilote. Les routes Agent
            refusent les demandes non authentifiées.
          </p>

          <Link
            href="/connexion"
            className="mt-5 inline-flex rounded-lg bg-[#15233F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F1A2E]"
          >
            Aller à la connexion
          </Link>
        </div>
      </main>
    );
  }

  const chargementGlobal = chargementDryRun || chargementMistral;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
          Copilote Agent
        </p>

        <h1 className="mt-2 font-display text-3xl text-[#15233F]">
          Test sécurisé du futur agent
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#5A6473]">
          Cette page permet de tester séparément le dry-run déterministe et la
          route expérimentale Mistral. Aucune donnée métier n&apos;est modifiée et
          aucune action automatique n&apos;est déclenchée.
        </p>
      </div>

      <section className="carte rounded-2xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
        <form onSubmit={analyserDemande}>
          <label
            htmlFor="demande-copilote"
            className="text-sm font-semibold text-[#15233F]"
          >
            Demande à analyser
          </label>

          <textarea
            id="demande-copilote"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="Ex. : Je veux ajouter une facture de cantine"
            className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
          />

          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{message.length}/1000 caractères</span>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                viderResultats();
              }}
              className="text-[#8A6F2A] underline-offset-2 hover:underline"
            >
              Effacer
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <button
              type="submit"
              disabled={chargementGlobal || message.trim() === ""}
              className="inline-flex rounded-lg bg-[#15233F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chargementDryRun ? "Analyse dry-run…" : "Analyser en dry-run"}
            </button>

            <div className="rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-3">
              <ConsentementIA fonctionnalite="agent">
                <button
                  type="button"
                  onClick={analyserAvecMistral}
                  disabled={chargementGlobal || message.trim() === ""}
                  className="inline-flex rounded-lg border border-[#C2A24C]/60 bg-white px-4 py-2 text-sm font-medium text-[#15233F] transition hover:bg-[#F1E8D0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {chargementMistral
                    ? "Test Mistral…"
                    : "Tester avec Mistral"}
                </button>

                <p className="mt-2 text-xs leading-5 text-[#5A6473]">
                  Test expérimental : appel IA réel, quota IA consommé, réponse
                  validée par les garde-fous Agent.
                </p>
              </ConsentementIA>
            </div>
          </div>
        </form>

        <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
          <p className="text-sm font-semibold text-[#15233F]">
            Exemples de test
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXEMPLES_DEMANDES.map((exemple) => (
              <button
                key={exemple}
                type="button"
                onClick={() => {
                  setMessage(exemple);
                  viderResultats();
                }}
                className="rounded-full border border-[#C2A24C]/50 bg-white px-3 py-1 text-xs text-[#15233F] transition hover:bg-[#F1E8D0]"
              >
                {exemple}
              </button>
            ))}
          </div>
        </div>
      </section>

      {erreur && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900">Erreur</h2>

          <p className="mt-2 text-sm text-red-800">{erreur}</p>
        </section>
      )}

      {reponse && (
        <section className="mt-6 rounded-2xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
                Réponse structurée
              </p>

              <h2 className="mt-1 font-display text-2xl text-[#15233F]">
                Résultat du copilote
              </h2>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                {reponse.version}
              </span>

              <span className="inline-flex w-fit rounded-full border border-[#C2A24C]/40 bg-[#F8F6F1] px-3 py-1 text-xs font-medium text-[#15233F]">
                {libelleMode(modeReponse)}
              </span>
            </div>
          </div>

          {sourceApi && (
            <p className="mt-3 text-xs text-slate-500">
              Source API : <span className="font-medium">{sourceApi}</span>
            </p>
          )}

          {validation && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                validation.ok
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <h3
                className={`font-semibold ${
                  validation.ok ? "text-emerald-900" : "text-amber-900"
                }`}
              >
                Validation de la réponse IA
              </h3>

              <p
                className={`mt-2 text-sm ${
                  validation.ok ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {validation.ok
                  ? "La réponse a passé le validateur Agent."
                  : validation.erreur ||
                    "La réponse IA a été remplacée par une réponse de sécurité."}
              </p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
            <h3 className="font-semibold text-[#15233F]">Résumé</h3>

            <p className="mt-2 text-sm leading-6 text-[#5A6473]">
              {reponse.resume}
            </p>
          </div>

          {reponse.messages.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-[#15233F]">Messages</h3>

              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[#5A6473]">
                {reponse.messages.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {reponse.actionProposee && (
            <div className="mt-4 rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-4">
              <h3 className="font-semibold text-[#15233F]">
                {reponse.actionProposee.titre}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#5A6473]">
                {reponse.actionProposee.raison}
              </p>

              {reponse.actionProposee.href && (
                <Link
                  href={reponse.actionProposee.href}
                  className="mt-4 inline-flex rounded-lg bg-[#15233F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F1A2E]"
                >
                  Ouvrir la page proposée
                </Link>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-[#15233F]">Garde-fous</h3>

            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Conseil juridique refusé
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(reponse.gardeFous.conseilJuridiqueRefuse)}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Écriture automatique refusée
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponse.gardeFous.ecritureAutomatiqueRefusee
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Validation humaine requise
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponse.gardeFous.validationHumaineRequise
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Cette réponse sert à tester le cadrage du futur agent. Elle ne
            déclenche aucune action et ne remplace pas un professionnel du droit.
          </p>
        </section>
      )}
    </main>
  );
}