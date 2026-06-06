// src/app/dossier/extraire/page.tsx
"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ConsentementIA from "@/components/ConsentementIA";
import ReglePension from "@/components/ReglePension";
import RegleFrais from "@/components/RegleFrais";
import RegleDVH from "@/components/RegleDVH";
import RegleDecision from "@/components/RegleDecision";

import {
  type Sections,
  versReglePension,
  versRegleFrais,
  versRegleDVH,
  versRegleDecision,
} from "@/lib/regleConvertisseurs";

type Resultat = { sections: Sections };
export default function ExtrairePage() {
  const [texte, setTexte] = useState("");
  const [analyse, setAnalyse] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState<Resultat | null>(null);

  async function analyser() {
    setErreur("");
    if (texte.trim().length === 0) {
      setErreur("Collez d'abord la description de votre jugement.");
      return;
    }
    setAnalyse(true);
    try {
      const reponse = await fetch("/api/ia/extraire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte }),
      });
      const data = await reponse.json();
      if (!reponse.ok) {
        setErreur(data?.erreur ?? "L'analyse a échoué.");
        setAnalyse(false);
        return;
      }
      setResultat(data);
    } catch {
      setErreur("Impossible de contacter le service d'analyse.");
    }
    setAnalyse(false);
  }

  const champ =
    "w-full rounded-lg border border-black/10 bg-white p-3 text-[#1F2733] focus:border-[#C2A24C] focus:outline-none";

  // Avertissements regroupés des deux sections (pour le bandeau global)
  const avertissements = resultat
    ? [
        ...resultat.sections.pension.avertissements.map((a) => `Pension : ${a}`),
        ...resultat.sections.frais.avertissements.map((a) => `Frais : ${a}`),
        ...resultat.sections.dvh.avertissements.map((a) => `DVH : ${a}`),
        ...resultat.sections.decision.avertissements.map((a) => `Décision : ${a}`),
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#ECE7DC]">
      <PageHeader
        eyebrow="Mon dossier"
        title="Analyse du jugement"
        subtitle="Décrivez votre jugement avec vos mots : l'assistant propose les règles de pension et de frais, que vous vérifiez et validez."
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <ConsentementIA fonctionnalite="extraction">
          {/* Étape 1 : description libre + analyse */}
          {!resultat && (
            <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
              <label className="text-sm font-medium text-[#15233F]">
                Description de votre situation (telle que dans le dispositif du jugement)
              </label>
              <p className="mt-1 text-sm text-[#1F2733]/60">
                Exemple : « Le jugement dit que je verse 180 € par mois pour notre fils,
                payables avant le 5 de chaque mois. Les frais exceptionnels sont partagés
                par moitié, avec accord préalable au-delà de 200 €. »
                N'indiquez pas de données de santé.
              </p>
              <textarea
                className={`${champ} mt-3`}
                rows={6}
                maxLength={5000}
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                placeholder="Collez ou rédigez la description ici…"
              />
              <p className="mt-1 text-right text-xs text-[#1F2733]/50">
                {texte.length} / 5000
              </p>

              {erreur && <p className="mt-3 text-sm text-red-600">{erreur}</p>}

              <button
                onClick={analyser}
                disabled={analyse}
                className="mt-4 rounded-lg bg-[#15233F] px-5 py-2 text-[#F8F6F1] transition hover:bg-[#1d2f52] disabled:opacity-50"
              >
                {analyse ? "Analyse en cours…" : "Analyser"}
              </button>
            </div>
          )}

          {/* Étape 2 : relecture + validation */}
          {resultat && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#C2A24C]/40 bg-[#C2A24C]/10 p-4 text-sm">
                <p className="font-medium text-[#15233F]">
                  Propositions de l'assistant — à vérifier
                </p>
                <p className="mt-1 text-[#1F2733]/70">
                  L'assistant ne fait que proposer. Relisez chaque règle, corrigez si besoin,
                  puis enregistrez et validez chacune séparément. Rien n'est écrit tant que
                  vous n'enregistrez pas.
                </p>
                {avertissements.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-[#1F2733]/80">
                    {avertissements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Règle de pension pré-remplie */}
              <ReglePension
                valeursInitiales={versReglePension(resultat.sections.pension.champs)}
                origineIA
              />

              {/* Règle de frais pré-remplie */}
              <RegleFrais
                valeursInitiales={versRegleFrais(resultat.sections.frais.champs)}
                origineIA
              />

              {/* Modalités de DVH pré-remplies */}
              <RegleDVH
                valeursInitiales={versRegleDVH(resultat.sections.dvh.champs)}
                origineIA
              />

              {/* Nature et échéances de la décision pré-remplies */}
              <RegleDecision
                valeursInitiales={versRegleDecision(resultat.sections.decision.champs)}
                origineIA
              />

              <button
                onClick={() => {
                  setResultat(null);
                  setTexte("");
                }}
                className="rounded-lg border border-black/10 px-5 py-2 text-sm text-[#1F2733] hover:bg-white"
              >
                Recommencer une analyse
              </button>
            </div>
          )}
        </ConsentementIA>
      </div>
    </main>
  );
}
