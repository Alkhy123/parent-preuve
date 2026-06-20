"use client";

// app/test-resume/page.tsx
// PAGE TEMPORAIRE de verification (etapes 1 a 3). A SUPPRIMER ensuite.

import { useEffect, useState } from "react";
import Link from "next/link";
import { enteteAuth } from "@/lib/enteteAuth";
import {
  chargerResumeDossier,
  formaterResumeTexte,
  type ResumeDossier,
} from "@/lib/resumeDossier";
import { DESTINATIONS } from "@/lib/destinationsAssistant";

export default function TestResume() {
  const [resume, setResume] = useState<ResumeDossier | null>(null);
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState(false);

  // Question / reponse
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreurQuestion, setErreurQuestion] = useState("");

  // Aiguillage
  const [phrase, setPhrase] = useState("");
  const [destination, setDestination] = useState<{ href: string; label: string } | null>(null);
  const [raison, setRaison] = useState("");
  const [pasDeDestination, setPasDeDestination] = useState(false);
  const [enCoursAig, setEnCoursAig] = useState(false);
  const [erreurAig, setErreurAig] = useState("");

  useEffect(() => {
    chargerResumeDossier()
      .then((r) => {
        setResume(r);
        setTexte(formaterResumeTexte(r));
      })
      .catch(() => setErreur(true));
  }, []);

  async function poser() {
    if (question.trim() === "" || texte === "") return;
    setEnCours(true);
    setReponse("");
    setErreurQuestion("");
    try {
      const r = await fetch("/api/assistant/repondre", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ question, resume: texte }),
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-[#1F2733]">
      <h1 className="font-display text-2xl text-[#15233F]">Test — Assistant</h1>

      {erreur && (
        <p className="mt-4 text-sm text-[#9B2C2C]">
          Chargement impossible. Es-tu connecté et une procédure est-elle active ?
        </p>
      )}
      {!erreur && resume === null && (
        <p className="mt-4 text-sm text-[#5A6473]">Chargement…</p>
      )}

      {resume && (
        <>
          {/* Aiguillage */}
          <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
            Que voulez-vous faire ?
          </h2>
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Ex. : je veux noter un retard"
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm"
          />
          <button
            onClick={aiguiller}
            disabled={enCoursAig || phrase.trim() === ""}
            className="mt-2 rounded-lg bg-[#15233F] px-4 py-2 text-sm text-[#F8F6F1] disabled:opacity-50"
          >
            {enCoursAig ? "…" : "M'orienter"}
          </button>

          {erreurAig && <p className="mt-3 text-sm text-[#9B2C2C]">{erreurAig}</p>}
          {raison && <p className="mt-3 text-sm text-[#5A6473]">{raison}</p>}
          {destination && (
            <Link
              href={destination.href}
              className="mt-2 inline-block rounded-lg border border-[#C2A24C] bg-[#F8F6F1] px-4 py-2 text-sm font-medium text-[#15233F]"
            >
              Aller sur « {destination.label} » →
            </Link>
          )}
          {pasDeDestination && (
            <p className="mt-2 text-sm text-[#8A5A12]">
              Aucune page ne correspond clairement. Essayez de reformuler.
            </p>
          )}

          {/* Question / reponse */}
          <h2 className="mt-10 text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
            Poser une question
          </h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex. : où en est ma pension ?"
            rows={2}
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm"
          />
          <button
            onClick={poser}
            disabled={enCours || question.trim() === ""}
            className="mt-2 rounded-lg bg-[#15233F] px-4 py-2 text-sm text-[#F8F6F1] disabled:opacity-50"
          >
            {enCours ? "…" : "Demander"}
          </button>
          {erreurQuestion && <p className="mt-3 text-sm text-[#9B2C2C]">{erreurQuestion}</p>}
          {reponse && (
            <div className="mt-3 whitespace-pre-wrap rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-4 text-sm">
              {reponse}
            </div>
          )}

          {/* Resume */}
          <h2 className="mt-10 text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
            Résumé envoyé à l'assistant
          </h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-[#F8F6F1] p-4 text-sm">
            {texte}
          </pre>
        </>
      )}
    </div>
  );
}
