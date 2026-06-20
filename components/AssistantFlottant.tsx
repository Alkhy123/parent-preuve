"use client";

// components/AssistantFlottant.tsx
//
// Assistant flottant (LECTURE SEULE). Monte une seule fois dans app/layout.tsx,
// il flotte sur toutes les pages du dossier et suit la navigation.
// Deux usages : s'orienter ("que voulez-vous faire ?") et poser une question
// sur l'etat du dossier. Aucune ecriture en base : l'IA propose, l'utilisateur agit.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import { chargerResumeDossier, formaterResumeTexte } from "@/lib/resumeDossier";
import { DESTINATIONS } from "@/lib/destinationsAssistant";

// Pages ou l'assistant ne doit jamais apparaitre, meme connecte.
const ROUTES_MASQUEES = [
  "/connexion",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/mentions-legales",
  "/confidentialite",
];

export default function AssistantFlottant() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [connecte, setConnecte] = useState<boolean | null>(null);

  // Resume du dossier (recharge a chaque ouverture, pour les questions).
  const [resume, setResume] = useState("");
  const [resumePret, setResumePret] = useState(false);

  // Aiguillage
  const [phrase, setPhrase] = useState("");
  const [destination, setDestination] = useState<{ href: string; label: string } | null>(null);
  const [raison, setRaison] = useState("");
  const [pasDeDestination, setPasDeDestination] = useState(false);
  const [enCoursAig, setEnCoursAig] = useState(false);
  const [erreurAig, setErreurAig] = useState("");

  // Question / reponse
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreurQuestion, setErreurQuestion] = useState("");

  // Auth (meme logique que le bouton de capture rapide).
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnecte(!!session?.user)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  // On referme le panneau a chaque changement de page.
  useEffect(() => {
    setOuvert(false);
  }, [pathname]);

  // A chaque ouverture : resume frais (lecture seule).
  useEffect(() => {
    if (!ouvert) return;
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
        if (!annule) setResumePret(false);
      });
    return () => {
      annule = true;
    };
  }, [ouvert]);

  if (!connecte || ROUTES_MASQUEES.includes(pathname)) {
    return null;
  }

  async function aiguiller() {
    if (phrase.trim() === "") return;
    setEnCoursAig(true);
    setDestination(null);
    setRaison("");
    setPasDeDestination(false);
    setErreurAig("");
    try {
      const r = await fetch("/api/assistant/aiguiller", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ phrase }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErreurAig(data.erreur ?? "Erreur inconnue.");
      } else {
        setRaison(data.raison ?? "");
        const d = DESTINATIONS.find((x) => x.cle === data.cle);
        if (d) setDestination({ href: d.href, label: d.label });
        else setPasDeDestination(true);
      }
    } catch {
      setErreurAig("Connexion impossible.");
    } finally {
      setEnCoursAig(false);
    }
  }

  async function poser() {
    if (question.trim() === "" || !resumePret) return;
    setEnCours(true);
    setReponse("");
    setErreurQuestion("");
    try {
      const r = await fetch("/api/assistant/repondre", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ question, resume }),
      });
      const data = await r.json();
      if (!r.ok) setErreurQuestion(data.erreur ?? "Erreur inconnue.");
      else setReponse(data.reponse ?? "");
    } catch {
      setErreurQuestion("Connexion impossible.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <>
      {/* Appui en dehors : referme le panneau. */}
      {ouvert && (
        <button
          type="button"
          aria-label="Fermer l'assistant"
          onClick={() => setOuvert(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}

      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        {ouvert && (
          <div className="w-80 max-w-[calc(100vw-3rem)] max-h-[70vh] overflow-y-auto rounded-2xl border border-[#C2A24C]/40 bg-white p-4 shadow-xl">
            <h2 className="font-display text-lg text-[#15233F]">Assistant</h2>
            <p className="mt-1 text-xs text-[#5A6473]">
              Il vous oriente et répond à partir de vos saisies. Il n'enregistre rien.
            </p>

            {/* Aiguillage */}
            <h3 className="mt-4 text-xs font-medium uppercase tracking-wide text-[#C2A24C]">
              Que voulez-vous faire ?
            </h3>
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Ex. : noter un retard"
              className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
            <button
              onClick={aiguiller}
              disabled={enCoursAig || phrase.trim() === ""}
              className="mt-2 rounded-lg bg-[#15233F] px-3 py-2 text-sm text-[#F8F6F1] disabled:opacity-50"
            >
              {enCoursAig ? "…" : "M'orienter"}
            </button>
            {erreurAig && <p className="mt-2 text-sm text-[#9B2C2C]">{erreurAig}</p>}
            {raison && <p className="mt-2 text-sm text-[#5A6473]">{raison}</p>}
            {destination && (
              <Link
                href={destination.href}
                onClick={() => setOuvert(false)}
                className="mt-2 inline-block rounded-lg border border-[#C2A24C] bg-[#F8F6F1] px-3 py-2 text-sm font-medium text-[#15233F]"
              >
                Aller sur « {destination.label} » →
              </Link>
            )}
            {pasDeDestination && (
              <p className="mt-2 text-sm text-[#8A5A12]">
                Aucune page ne correspond clairement. Reformulez ?
              </p>
            )}

            {/* Question / reponse */}
            <h3 className="mt-5 text-xs font-medium uppercase tracking-wide text-[#C2A24C]">
              Poser une question
            </h3>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex. : où en est ma pension ?"
              rows={2}
              className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
            <button
              onClick={poser}
              disabled={enCours || question.trim() === "" || !resumePret}
              className="mt-2 rounded-lg bg-[#15233F] px-3 py-2 text-sm text-[#F8F6F1] disabled:opacity-50"
            >
              {enCours ? "…" : resumePret ? "Demander" : "Chargement…"}
            </button>
            {erreurQuestion && <p className="mt-2 text-sm text-[#9B2C2C]">{erreurQuestion}</p>}
            {reponse && (
              <div className="mt-2 whitespace-pre-wrap rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-3 text-sm">
                {reponse}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          aria-label={ouvert ? "Fermer l'assistant" : "Ouvrir l'assistant"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15233F] text-[#ECE7DC] shadow-lg transition hover:bg-[#1d3056] focus:outline-none focus:ring-2 focus:ring-[#C2A24C] focus:ring-offset-2"
        >
          <span aria-hidden="true" className="text-2xl">
            {ouvert ? "×" : "?"}
          </span>
        </button>
      </div>
    </>
  );
}
