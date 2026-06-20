"use client";

// components/AssistantFlottant.tsx
//
// Assistant flottant monté une fois dans app/layout.tsx.
//
// Principes :
// - le bouton est déplaçable ;
// - l'orientation utilise le Copilote Agent en dry-run sécurisé ;
// - l'orientation n'appelle pas Mistral ;
// - l'orientation ne consomme pas de quota IA ;
// - l'orientation ne modifie aucune donnée ;
// - les fonctions IA existantes restent séparées et soumises à validation humaine.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import { chargerResumeDossier, formaterResumeTexte } from "@/lib/resumeDossier";
import { DESTINATIONS } from "@/lib/destinationsAssistant";
import { useDeplacable } from "@/lib/useDeplacable";
import { CLE_SESSION_PREREMPLISSAGE } from "@/lib/preRemplissage";

const ROUTES_MASQUEES = [
  "/connexion",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/mentions-legales",
  "/confidentialite",
];

const TAILLE = 48; // h-12 w-12

type DestinationCopilote = {
  href: string;
  label: string;
  raison?: string;
};

type ReponseAgent = {
  resume?: string;
  messages?: string[];
  actionProposee?: {
    href?: string;
    titre?: string;
    raison?: string;
  } | null;
  gardeFous?: {
    conseilJuridiqueRefuse?: boolean;
    ecritureAutomatiqueRefusee?: boolean;
    validationHumaineRequise?: boolean;
  };
};

type ReponseAgentApi = {
  erreur?: string;
  reponse?: ReponseAgent;
};

export default function AssistantFlottant() {
  const pathname = usePathname();
  const router = useRouter();

  const [ouvert, setOuvert] = useState(false);
  const [connecte, setConnecte] = useState<boolean | null>(null);

  const { pos, onPointerDown, consommerDeplacement, ancrage } = useDeplacable(
    "pos-assistant",
    "bas-gauche",
    TAILLE
  );

  const [resume, setResume] = useState("");
  const [resumePret, setResumePret] = useState(false);

  const [phrase, setPhrase] = useState("");
  const [destination, setDestination] = useState<DestinationCopilote | null>(
    null
  );
  const [raison, setRaison] = useState("");
  const [pasDeDestination, setPasDeDestination] = useState(false);
  const [enCoursAig, setEnCoursAig] = useState(false);
  const [erreurAig, setErreurAig] = useState("");

  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreurQuestion, setErreurQuestion] = useState("");

  // Pré-remplissage : phrase libre -> proposition de champs, transmise par
  // sessionStorage puis ouverte sur /frais ou /journal pour validation humaine.
  const [saisie, setSaisie] = useState("");
  const [enCoursPre, setEnCoursPre] = useState(false);
  const [erreurPre, setErreurPre] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));

    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => setConnecte(!!session?.user)
    );

    return () => ecouteur.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setOuvert(false);
  }, [pathname]);

  useEffect(() => {
    if (!ouvert) {
      return;
    }

    let annule = false;

    setResumePret(false);
    setResume("");

    chargerResumeDossier()
      .then((r) => {
        if (!annule) {
          setResume(formaterResumeTexte(r));
          setResumePret(true);
        }
      })
      .catch(() => {
        if (!annule) {
          setResumePret(false);
        }
      });

    return () => {
      annule = true;
    };
  }, [ouvert]);

  if (!connecte || ROUTES_MASQUEES.includes(pathname) || !pos) {
    return null;
  }

  function reinitialiserOrientation() {
    setDestination(null);
    setRaison("");
    setPasDeDestination(false);
    setErreurAig("");
  }

  async function aiguiller() {
    const demande = phrase.trim();

    if (demande === "") {
      return;
    }

    setEnCoursAig(true);
    reinitialiserOrientation();

    try {
      const r = await fetch("/api/agent/analyser-demande", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify({ message: demande }),
      });

      const data = (await r.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }))) as ReponseAgentApi;

      if (!r.ok || data.erreur) {
        setErreurAig(data.erreur ?? "Erreur inconnue.");
        return;
      }

      const reponseAgent = data.reponse;

      if (!reponseAgent) {
        setErreurAig("Réponse du copilote invalide.");
        return;
      }

      const messages = Array.isArray(reponseAgent.messages)
        ? reponseAgent.messages
        : [];

      const texteRaison = [reponseAgent.resume, ...messages]
        .filter(Boolean)
        .join("\n\n");

      setRaison(texteRaison);

      if (reponseAgent.gardeFous?.conseilJuridiqueRefuse) {
        setDestination(null);
        setPasDeDestination(false);
        return;
      }

      const action = reponseAgent.actionProposee;

      if (action?.href && action?.titre) {
        setDestination({
          href: action.href,
          label: action.titre,
          raison: action.raison,
        });
      } else {
        setPasDeDestination(true);
      }
    } catch {
      setErreurAig("Connexion impossible.");
    } finally {
      setEnCoursAig(false);
    }
  }

  async function poser() {
    if (question.trim() === "" || !resumePret) {
      return;
    }

    setEnCours(true);
    setReponse("");
    setErreurQuestion("");

    try {
      const r = await fetch("/api/assistant/repondre", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify({ question, resume }),
      });

      const data = await r.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }));

      if (!r.ok) {
        setErreurQuestion(data.erreur ?? "Erreur inconnue.");
      } else {
        setReponse(data.reponse ?? "");
      }
    } catch {
      setErreurQuestion("Connexion impossible.");
    } finally {
      setEnCours(false);
    }
  }

  // Demande une proposition de pré-remplissage, la dépose dans sessionStorage
  // jamais dans l'URL, puis ouvre l'écran de saisie correspondant.
  // L'IA n'écrit rien : l'utilisateur valide via le bouton de l'écran.
  async function preRemplir() {
    if (saisie.trim() === "") {
      return;
    }

    setEnCoursPre(true);
    setErreurPre("");

    try {
      const r = await fetch("/api/assistant/pre-remplir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify({ phrase: saisie }),
      });

      const data = await r.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }));

      if (!r.ok) {
        setErreurPre(data.erreur ?? "Erreur inconnue.");
        return;
      }

      const proposition = data.proposition;

      if (!proposition || proposition.type === "aucun") {
        setErreurPre(
          "Aucune saisie reconnue. Reformulez en précisant une dépense avec un montant, ou un fait à noter."
        );
        return;
      }

      // Destination tirée de la liste fermée, jamais fabriquée.
      const dest = DESTINATIONS.find((d) => d.cle === proposition.type);

      if (!dest) {
        setErreurPre("Type de saisie non pris en charge.");
        return;
      }

      try {
        sessionStorage.setItem(
          CLE_SESSION_PREREMPLISSAGE,
          JSON.stringify(proposition)
        );
      } catch {
        setErreurPre(
          "Stockage local indisponible : impossible de transmettre la proposition."
        );
        return;
      }

      setSaisie("");
      setOuvert(false);
      router.push(dest.href);
    } catch {
      setErreurPre("Connexion impossible.");
    } finally {
      setEnCoursPre(false);
    }
  }

  const a = ancrage();

  const classesPanneau = [
    "absolute w-80 max-w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto rounded-2xl border border-[#C2A24C]/40 bg-white p-4 shadow-xl",
    a.vertical === "haut" ? "bottom-full mb-3" : "top-full mt-3",
    a.horizontal === "droite" ? "right-0" : "left-0",
  ].join(" ");

  return (
    <>
      {ouvert && (
        <button
          type="button"
          aria-label="Fermer le copilote"
          onClick={() => setOuvert(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}

      <div
        className="fixed z-50"
        style={{
          left: pos.x,
          top: pos.y,
        }}
      >
        {ouvert && (
          <div className={classesPanneau}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6F2A]">
                  Copilote
                </p>

                <h2 className="font-display text-lg text-[#15233F]">
                  Parent Preuve
                </h2>
              </div>

              <Link
                href="/copilote"
                onClick={() => setOuvert(false)}
                className="rounded-full border border-[#C2A24C]/50 bg-[#F8F6F1] px-3 py-1 text-xs font-medium text-[#15233F] transition hover:bg-[#F1E8D0]"
              >
                Mode avancé
              </Link>
            </div>

            <p className="mt-2 text-sm leading-5 text-[#5A6473]">
              Il vous aide à organiser votre dossier factuel. Il propose, vous
              validez : rien n'est enregistré sans votre action.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                Lecture seule
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                Orientation sécurisée
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                Aucune donnée modifiée
              </span>
            </div>

            <section className="mt-4 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-[#15233F]">
                Que voulez-vous faire ?
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Orientation rapide sans appel Mistral. Le copilote choisit une
                rubrique à partir de règles fermées.
              </p>

              <textarea
                value={phrase}
                onChange={(event) => {
                  setPhrase(event.target.value);
                  reinitialiserOrientation();
                }}
                placeholder="Ex. : noter un retard"
                rows={2}
                maxLength={1000}
                className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm leading-5 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
              />

              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={aiguiller}
                  disabled={enCoursAig || phrase.trim() === ""}
                  className="rounded-lg bg-[#15233F] px-3 py-2 text-sm font-medium text-[#F8F6F1] transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enCoursAig ? "Analyse…" : "M'orienter"}
                </button>

                <span className="text-[11px] text-slate-400">
                  {phrase.length}/1000
                </span>
              </div>

              {erreurAig && (
                <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-[#9B2C2C]">
                  {erreurAig}
                </p>
              )}

              {raison && (
                <div className="mt-3 whitespace-pre-wrap rounded-xl border border-[#C2A24C]/30 bg-[#F8F6F1] p-3 text-sm leading-5 text-[#5A6473]">
                  {raison}
                </div>
              )}

              {destination && (
                <div className="mt-3 rounded-xl border border-[#C2A24C]/50 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A6F2A]">
                    Page proposée
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#15233F]">
                    {destination.label}
                  </p>

                  {destination.raison && (
                    <p className="mt-1 text-xs leading-5 text-[#5A6473]">
                      {destination.raison}
                    </p>
                  )}

                  <Link
                    href={destination.href}
                    onClick={() => setOuvert(false)}
                    className="mt-3 inline-flex rounded-lg border border-[#C2A24C] bg-[#F8F6F1] px-3 py-2 text-sm font-medium text-[#15233F] transition hover:bg-[#F1E8D0]"
                  >
                    Ouvrir la page →
                  </Link>
                </div>
              )}

              {pasDeDestination && (
                <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-600">
                  Aucune page ne correspond clairement. Reformulez en indiquant
                  s'il s'agit d'un frais, d'un retard, d'une preuve, d'un
                  courrier ou d'un export.
                </p>
              )}
            </section>

            <section className="mt-4 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-[#15233F]">
                Pré-remplir une saisie
              </h3>

              <textarea
                value={saisie}
                onChange={(event) => setSaisie(event.target.value)}
                placeholder="Ex. : payé 45 € de cantine pour Léa le 12 mars"
                rows={2}
                maxLength={500}
                className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm leading-5 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Votre saisie est envoyée à notre prestataire d'IA hébergé dans
                l'UE pour proposer un pré-remplissage. Aucune donnée n'est
                enregistrée à cette étape : rien n'est ajouté à votre dossier
                tant que vous ne validez pas vous-même à l'écran.
              </p>

              <button
                type="button"
                onClick={preRemplir}
                disabled={enCoursPre || saisie.trim() === ""}
                className="mt-2 rounded-lg bg-[#15233F] px-3 py-2 text-sm font-medium text-[#F8F6F1] transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enCoursPre ? "Préparation…" : "Pré-remplir"}
              </button>

              {erreurPre && (
                <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-[#9B2C2C]">
                  {erreurPre}
                </p>
              )}
            </section>

            <section className="mt-4 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-[#15233F]">
                Poser une question
              </h3>

              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ex. : où en est ma pension ?"
                rows={2}
                className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm leading-5 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
              />

              <button
                type="button"
                onClick={poser}
                disabled={enCours || question.trim() === "" || !resumePret}
                className="mt-2 rounded-lg bg-[#15233F] px-3 py-2 text-sm font-medium text-[#F8F6F1] transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enCours ? "Recherche…" : resumePret ? "Demander" : "Chargement…"}
              </button>

              {erreurQuestion && (
                <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-[#9B2C2C]">
                  {erreurQuestion}
                </p>
              )}

              {reponse && (
                <div className="mt-2 whitespace-pre-wrap rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-3 text-sm leading-5 text-[#5A6473]">
                  {reponse}
                </div>
              )}
            </section>
          </div>
        )}

        <button
          type="button"
          onPointerDown={onPointerDown}
          onClick={() => {
            if (consommerDeplacement()) {
              return;
            }

            setOuvert((valeur) => !valeur);
          }}
          aria-expanded={ouvert}
          aria-label={ouvert ? "Fermer le copilote" : "Ouvrir le copilote"}
          className="flex h-12 w-12 touch-none items-center justify-center rounded-full bg-[#15233F] text-[#ECE7DC] shadow-lg transition hover:bg-[#1d3056] focus:outline-none focus:ring-2 focus:ring-[#C2A24C] focus:ring-offset-2"
        >
          <span aria-hidden="true" className="text-xl">
            {ouvert ? "×" : "?"}
          </span>
        </button>
      </div>
    </>
  );
}