"use client";

// app/test-resume/page.tsx
// PAGE TEMPORAIRE de verification (etapes 1 et 2). A SUPPRIMER ensuite.

import { useEffect, useState } from "react";
import { enteteAuth } from "@/lib/enteteAuth";
import {
  chargerResumeDossier,
  formaterResumeTexte,
  type ResumeDossier,
} from "@/lib/resumeDossier";

export default function TestResume() {
  const [resume, setResume] = useState<ResumeDossier | null>(null);
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState(false);

  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreurQuestion, setErreurQuestion] = useState("");

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

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-[#1F2733]">
      <h1 className="font-display text-2xl text-[#15233F]">
        Test — Résumé du dossier
      </h1>

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
          <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
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

          {erreurQuestion && (
            <p className="mt-3 text-sm text-[#9B2C2C]">{erreurQuestion}</p>
          )}
          {reponse && (
            <div className="mt-3 whitespace-pre-wrap rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-4 text-sm">
              {reponse}
            </div>
          )}

          <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
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
