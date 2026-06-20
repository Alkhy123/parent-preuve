"use client";

// app/test-resume/page.tsx
// PAGE TEMPORAIRE de verification de l'etape 1. A SUPPRIMER ensuite.

import { useEffect, useState } from "react";
import {
  chargerResumeDossier,
  formaterResumeTexte,
  type ResumeDossier,
} from "@/lib/resumeDossier";

export default function TestResume() {
  const [resume, setResume] = useState<ResumeDossier | null>(null);
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    chargerResumeDossier()
      .then((r) => {
        setResume(r);
        setTexte(formaterResumeTexte(r));
      })
      .catch(() => setErreur(true));
  }, []);

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
            Texte généré
          </h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-[#F8F6F1] p-4 text-sm">
            {texte}
          </pre>

          <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-[#C2A24C]">
            Objet structuré
          </h2>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-[#F8F6F1] p-4 text-xs">
            {JSON.stringify(resume, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
