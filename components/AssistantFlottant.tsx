"use client";

// components/AssistantFlottant.tsx
//
// Assistant flottant monté une fois dans app/layout.tsx.
//
// Ce composant fait cohabiter temporairement trois usages distincts :
//
// 1. Copilote rapide
//    - route : /api/agent/analyser-demande
//    - génération : Agent nouvelle génération
//    - comportement : dry-run déterministe
//    - aucun appel Mistral
//    - aucun quota IA
//    - aucune écriture
//
// 2. Aide à la saisie
//    - route : /api/agent/pre-remplir
//    - génération : Agent nouvelle génération
//    - comportement : proposition structurée de pré-remplissage
//    - contrat : agent-pre-remplissage-v1
//    - validation humaine obligatoire
//
// 3. Question sur le dossier
//    - route : /api/agent/question-dossier
//    - génération : Agent nouvelle génération
//    - contrat : agent-question-dossier-v1
//    - comportement : réponse factuelle à partir du résumé du dossier
//    - aucun conseil juridique, aucune écriture, aucune action automatique
//
// La route /api/agent/repondre ne doit pas être appelée directement ici.
// Elle reste réservée au mode avancé /copilote.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ConsentementIA from "@/components/ConsentementIA";
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

const ROUTES_SHELL_REEL = ["/", "/journal", "/frais", "/documents", "/preuves", "/preuves/nouvelle", "/calendrier", "/calendrier/avance"];

const TAILLE = 48;

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

type ReponseQuestionDossierAgent = {
  resume?: string;
  reponse?: string;
  pointsAppui?: string[];
  limites?: string[];
  gardeFous?: {
    conseilJuridiqueRefuse?: boolean;
    strategieJudiciaireRefusee?: boolean;
    redactionConclusionsRefusee?: boolean;
    predictionDecisionRefusee?: boolean;
    ecritureAutomatiqueRefusee?: boolean;
    validationHumaineRequise?: boolean;
  };
};

type ReponseQuestionDossierApi = {
  erreur?: string;
  source?: "mistral" | "garde_fou_local" | "fallback";
  validation?: { ok: boolean; erreur: string };
  reponse?: ReponseQuestionDossierAgent;
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

  const [saisie, setSaisie] = useState("");
  const [enCoursPre, setEnCoursPre] = useState(false);
  const [erreurPre, setErreurPre] = useState("");

  const [question, setQuestion] = useState("");
  const [reponseQuestion, setReponseQuestion] =
    useState<ReponseQuestionDossierAgent | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreurQuestion, setErreurQuestion] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));

    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => setConnecte(!!session?.user)
    );

    return () => ecouteur.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Réinitialisation d'UI au changement de route (pas de cascade de rendu).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOuvert(false);
  }, [pathname]);

  useEffect(() => {
    if (!ouvert) {
      return;
    }

    let annule = false;

    // Réinitialisation avant un chargement asynchrone (pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Masqué aussi sur les aperçus de design (/apercu/*), qui ont leur propre copilote.
  if (
    !connecte ||
    ROUTES_MASQUEES.includes(pathname) ||
    pathname.startsWith("/apercu") ||
    ROUTES_SHELL_REEL.includes(pathname) ||
    !pos
  ) {
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

  async function preRemplir() {
    if (saisie.trim() === "") {
      return;
    }

    setEnCoursPre(true);
    setErreurPre("");

    try {
      const r = await fetch("/api/agent/pre-remplir", {
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
      const reponseAgent = data.reponse;
      const proposition = data.reponse?.proposition;

      if (reponseAgent?.gardeFous?.conseilJuridiqueRefuse) {
        setErreurPre(
          reponseAgent.messages?.join(" ") ||
            "Le copilote ne peut pas traiter une demande de conseil juridique personnalisé ou de stratégie judiciaire."
        );
        return;
      }

      if (!proposition || proposition.type === "aucun") {
        const messageAgent =
          reponseAgent?.messages?.find(
            (message: string) => message.trim() !== ""
          ) ||
          proposition?.avertissements?.find(
            (avertissement: string) => avertissement.trim() !== ""
          );

        setErreurPre(
          messageAgent ||
            "Aucune saisie reconnue. Reformulez en précisant une dépense avec un montant, ou un fait à noter."
        );
        return;
      }

      const dest = DESTINATIONS.find((d) => d.cle === proposition.type);

      if (!dest) {
        setErreurPre(
          "Aucune page ne correspond à cette proposition. Reformulez votre saisie."
        );
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

  async function poser() {
    if (question.trim() === "" || !resumePret) {
      return;
    }

    setEnCours(true);
    setReponseQuestion(null);
    setErreurQuestion("");

    try {
      const r = await fetch("/api/agent/question-dossier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify({ question, resume }),
      });

      const data = (await r.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }))) as ReponseQuestionDossierApi;

      if (!r.ok) {
        setErreurQuestion(data.erreur ?? "Erreur inconnue.");
        return;
      }

      const reponseAgent = data.reponse;

      if (
        !reponseAgent ||
        typeof reponseAgent.reponse !== "string" ||
        reponseAgent.reponse.trim() === ""
      ) {
        setErreurQuestion("Réponse du copilote invalide.");
        return;
      }

      setReponseQuestion(reponseAgent);
    } catch {
      setErreurQuestion("Connexion impossible.");
    } finally {
      setEnCours(false);
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
            </div>

            <p className="mt-2 rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-3 text-sm leading-5 text-[#5A6473]">
              Le Copilote vous aide à organiser votre dossier. Il ne donne pas de
              conseil juridique et rien n’est enregistré sans votre validation.
            </p>

            <section className="mt-4 rounded-2xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6F2A]">
                  Orientation
                </p>

                <h3 className="mt-1 text-sm font-semibold text-[#15233F]">
                  Je ne sais pas où aller
                </h3>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#5A6473]">
                Décrivez en une phrase ce que vous voulez faire : le Copilote
                vous indique la bonne rubrique. Rien n’est enregistré.
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
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm leading-5 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
              />

              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={aiguiller}
                  disabled={enCoursAig || phrase.trim() === ""}
                  className="rounded-lg bg-[#15233F] px-3 py-2 text-sm font-medium text-[#F8F6F1] transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enCoursAig ? "Analyse…" : "M’orienter"}
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
                <div className="mt-3 rounded-xl border border-[#C2A24C]/30 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6F2A]">
                    Ce que le Copilote a compris
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-[#5A6473]">
                    {raison}
                  </p>
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
                <p className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-600">
                  Aucune page ne correspond clairement. Reformulez en indiquant
                  s’il s’agit d’un frais, d’un retard, d’une preuve, d’un
                  courrier ou d’un export.
                </p>
              )}
            </section>

            <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                  Saisie
                </p>

                <h3 className="mt-1 text-sm font-semibold text-[#15233F]">
                  Pré-remplir une saisie
                </h3>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#5A6473]">
                Écrivez votre dépense, votre pension ou votre fait en une phrase :
                le Copilote prépare les champs à vérifier. Rien n’est ajouté au
                dossier tant que vous ne validez pas vous-même sur l’écran concerné.
              </p>

              <div className="mt-3">
                <ConsentementIA
                  fonctionnalite="agent"
                  titre="Avant de pré-remplir une saisie avec l’IA"
                  descriptionTransmission="Le pré-remplissage peut envoyer à Mistral la phrase que vous saisissez. Aucune pièce jointe, photo ou document original n’est envoyé."
                  descriptionResponsabilite="Le pré-remplissage ne crée aucune donnée dans votre dossier. Il propose uniquement des champs à vérifier. La validation humaine reste obligatoire."
                >
                  <textarea
                    value={saisie}
                    onChange={(event) => setSaisie(event.target.value)}
                    placeholder="Ex. : payé 45 € de cantine pour Léa le 12 mars"
                    rows={2}
                    maxLength={500}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm leading-5 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
                  />

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={preRemplir}
                      disabled={enCoursPre || saisie.trim() === ""}
                      className="rounded-lg bg-[#15233F] px-3 py-2 text-sm font-medium text-[#F8F6F1] transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {enCoursPre ? "Préparation…" : "Pré-remplir"}
                    </button>

                    <span className="text-[11px] text-slate-500">
                      Validation obligatoire
                    </span>
                  </div>

                  {erreurPre && (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-[#9B2C2C]">
                      {erreurPre}
                    </p>
                  )}
                </ConsentementIA>
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Dossier
                </p>

                <h3 className="mt-1 text-sm font-semibold text-[#15233F]">
                  Poser une question sur mon dossier
                </h3>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#5A6473]">
                Réponse factuelle à partir de votre dossier. Aucun conseil
                juridique. Le Copilote propose, vous vérifiez, vous validez.
              </p>

              <div className="mt-3">
                <ConsentementIA
                  fonctionnalite="agent"
                  titre="Avant de poser une question sur le dossier"
                  descriptionTransmission="La question peut envoyer à Mistral votre question et un résumé factuel limité de votre dossier. Aucune pièce jointe, photo, document original ou donnée de santé n’est envoyé."
                  descriptionResponsabilite="La question dossier répond uniquement à partir du résumé factuel. Elle ne fournit aucun conseil juridique et ne déclenche aucune action automatique."
                >
                  <textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ex. : où en est ma pension ?"
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm leading-5 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
                  />

                  <button
                    type="button"
                    onClick={poser}
                    disabled={enCours || question.trim() === "" || !resumePret}
                    className="mt-2 rounded-lg bg-[#15233F] px-3 py-2 text-sm font-medium text-[#F8F6F1] transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enCours
                      ? "Recherche…"
                      : resumePret
                        ? "Demander"
                        : "Chargement…"}
                  </button>

                  {erreurQuestion && (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-[#9B2C2C]">
                      {erreurQuestion}
                    </p>
                  )}

                  {reponseQuestion && (
                    <div className="mt-2 space-y-3 rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-3 text-sm leading-5 text-[#5A6473]">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6F2A]">
                          Réponse du copilote
                        </p>
                        <p className="mt-1 whitespace-pre-wrap">
                          {reponseQuestion.reponse}
                        </p>
                      </div>

                      {reponseQuestion.pointsAppui &&
                        reponseQuestion.pointsAppui.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6F2A]">
                              Points d’appui factuels
                            </p>
                            <ul className="mt-1 list-disc space-y-1 pl-5">
                              {reponseQuestion.pointsAppui.map((item, index) => (
                                <li key={`appui-${index}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {reponseQuestion.limites &&
                        reponseQuestion.limites.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6F2A]">
                              Limites
                            </p>
                            <ul className="mt-1 list-disc space-y-1 pl-5">
                              {reponseQuestion.limites.map((item, index) => (
                                <li key={`limite-${index}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </ConsentementIA>
              </div>
            </section>

            <div className="mt-4 rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-3">
              <p className="text-xs leading-5 text-[#5A6473]">
                Pour tester le Copilote en détail et vérifier son fonctionnement.
              </p>

              <Link
                href="/copilote"
                onClick={() => setOuvert(false)}
                className="mt-2 inline-flex rounded-lg border border-[#C2A24C] bg-white px-3 py-2 text-sm font-medium text-[#15233F] transition hover:bg-[#F1E8D0]"
              >
                Mode diagnostic →
              </Link>
            </div>
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
