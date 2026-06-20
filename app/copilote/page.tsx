"use client";

// app/copilote/page.tsx
//
// Page de test du Copilote Agent.
// Cette page appelle la route dry-run /api/agent/analyser-demande.
//
// Sécurité étape 5 :
// - aucune écriture en base ;
// - aucun appel IA ;
// - aucune consommation de quota ;
// - aucune action automatique ;
// - affichage uniquement de la réponse structurée renvoyée par la route.

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import type { AgentReponseStructuree } from "@/lib/agent";

type ReponseAgentApi =
  | {
      ok: true;
      reponse: AgentReponseStructuree;
    }
  | {
      erreur: string;
    };

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

export default function PageCopilote() {
  const [utilisateur, setUtilisateur] = useState<User | null>(null);
  const [verificationConnexion, setVerificationConnexion] = useState(true);

  const [message, setMessage] = useState("");
  const [reponse, setReponse] = useState<AgentReponseStructuree | null>(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

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

  async function analyserDemande(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const demande = message.trim();

    if (demande === "") {
      return;
    }

    setChargement(true);
    setErreur("");
    setReponse(null);

    try {
      const resultat = await fetch("/api/agent/analyser-demande", {
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
    } catch {
      setErreur("Connexion impossible avec le copilote.");
    } finally {
      setChargement(false);
    }
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
            Vous devez être connecté pour tester le copilote. La route Agent
            refuse les demandes non authentifiées.
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
          Cette page teste uniquement la route dry-run du copilote. Aucun appel
          IA n&apos;est effectué, aucun quota n&apos;est consommé et aucune donnée
          n&apos;est modifiée.
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
                setReponse(null);
                setErreur("");
              }}
              className="text-[#8A6F2A] underline-offset-2 hover:underline"
            >
              Effacer
            </button>
          </div>

          <button
            type="submit"
            disabled={chargement || message.trim() === ""}
            className="mt-4 inline-flex rounded-lg bg-[#15233F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {chargement ? "Analyse…" : "Analyser ma demande"}
          </button>
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
                  setReponse(null);
                  setErreur("");
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

            <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              {reponse.version}
            </span>
          </div>

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