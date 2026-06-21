// app/dossier/extraire/page.tsx
"use client";

import { useState, type ReactNode } from "react";
import PageHeader from "@/components/PageHeader";
import ConsentementIA from "@/components/ConsentementIA";
import RetourAssistant from "@/components/onboarding/RetourAssistant";
import ReglePension from "@/components/ReglePension";
import RegleFrais from "@/components/RegleFrais";
import RegleDVH from "@/components/RegleDVH";
import RegleDecision from "@/components/RegleDecision";
import ApercuExtraction from "@/components/ApercuExtraction";
import { enteteAuth } from "@/lib/enteteAuth";

import {
  LIBELLES_PENSION,
  LIBELLES_FRAIS,
  LIBELLES_DVH,
  LIBELLES_DECISION,
} from "@/lib/libellesRegles";

import {
  type Sections,
  versReglePension,
  versRegleFrais,
  versRegleDVH,
  versRegleDecision,
} from "@/lib/regleConvertisseurs";

type Resultat = { sections: Sections };

// Une étape du fil d'avancement (Décrire → Vérifier et valider).
function Etape({ n, libelle, actif }: { n: number; libelle: string; actif: boolean }) {
  return (
    <div className={"flex items-center gap-2 " + (actif ? "" : "opacity-50")}>
      <span
        className={
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold " +
          (actif ? "bg-[#C2A24C] text-[#15233F]" : "bg-[#15233F] text-[#F8F6F1]")
        }
      >
        {n}
      </span>
      <span className="text-sm text-[#15233F]">{libelle}</span>
    </div>
  );
}

// Une ligne d'avertissement colorée (icône + texte).
function LigneAvert({
  couleur,
  icone,
  children,
}: {
  couleur: string;
  icone: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-sm" style={{ color: couleur }}>
      <span className="mt-0.5 shrink-0">{icone}</span>
      <span>{children}</span>
    </div>
  );
}

// Petits SVG en ligne (aucune dépendance d'icônes).
const svgProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const IconeCheck = (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);
const IconeCrayon = (
  <svg {...svgProps}>
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);
const IconeBouclier = (
  <svg {...svgProps}>
    <path d="M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" />
  </svg>
);

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
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
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

  // Avertissements remontés par l'analyse (regroupés des quatre sections).
  const avertissements = resultat
    ? [
        ...resultat.sections.pension.avertissements.map((a) => `Pension : ${a}`),
        ...resultat.sections.frais.avertissements.map((a) => `Frais : ${a}`),
        ...resultat.sections.dvh.avertissements.map((a) => `DVH : ${a}`),
        ...resultat.sections.decision.avertissements.map((a) => `Décision : ${a}`),
      ]
    : [];

  // Étape courante : 1 tant qu'on n'a pas analysé, 2 dès qu'il y a un résultat.
  const etape = resultat ? 2 : 1;

  return (
    <main className="min-h-screen bg-[#ECE7DC]">
      <PageHeader
        eyebrow="Mon dossier"
        title="Analyse du jugement"
        subtitle="Décrivez votre jugement avec vos mots : l'assistant propose les règles, que vous vérifiez et validez une par une."
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <RetourAssistant />
        <ConsentementIA fonctionnalite="extraction">
          {/* Fil d'avancement */}
          <div className="mb-6 flex items-center gap-3">
            <Etape n={1} libelle="Décrire" actif={etape === 1} />
            <span className="h-px flex-1 bg-[#C2A24C]" />
            <Etape n={2} libelle="Vérifier et valider" actif={etape === 2} />
          </div>

          {/* Étape 1 : description libre + analyse */}
          {!resultat && (
            <div className="carte rounded-xl border border-black/5 bg-white p-6">
              <label className="text-sm font-medium text-[#15233F]">
                Description de votre situation (telle que dans le dispositif du jugement)
              </label>
              <p className="mt-1 text-sm text-[#1F2733]/60">
                Exemple : « Le jugement dit que je verse 180 € par mois pour notre fils,
                payables avant le 5 de chaque mois. Les frais exceptionnels sont partagés
                par moitié, avec accord préalable au-delà de 200 €. »
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

              <div className="mt-3">
                <LigneAvert couleur="#A32D2D" icone={IconeBouclier}>
                  N&apos;indiquez jamais de données de santé.
                </LigneAvert>
              </div>

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
              {/* Bandeau d'avertissements, hiérarchisé */}
              <div className="carte rounded-xl border border-[#C2A24C]/40 bg-white p-4">
                <p className="mb-3 text-sm font-medium text-[#15233F]">
                  Propositions de l&apos;assistant — à vérifier
                </p>
                <div className="space-y-2">
                  <LigneAvert couleur="#0F6E56" icone={IconeCheck}>
                    Rien n&apos;est enregistré tant que vous ne validez pas chaque règle.
                  </LigneAvert>
                  <LigneAvert couleur="#854F0B" icone={IconeCrayon}>
                    Relisez et corrigez chaque valeur : l&apos;assistant ne fait que proposer.
                  </LigneAvert>
                  <LigneAvert couleur="#A32D2D" icone={IconeBouclier}>
                    N&apos;indiquez jamais de données de santé.
                  </LigneAvert>
                </div>

                {avertissements.length > 0 && (
                  <ul className="mt-3 list-disc border-t border-black/5 pl-5 pt-3 text-sm text-[#1F2733]/70">
                    {avertissements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Règle de pension pré-remplie */}
              <div className="space-y-2">
              <ApercuExtraction champs={resultat.sections.pension.champs} libelles={LIBELLES_PENSION} />
                <ReglePension
                  valeursInitiales={versReglePension(resultat.sections.pension.champs)}
                  origineIA
                />
              </div>

              {/* Règle de frais pré-remplie */}
              <div className="space-y-2">
              <ApercuExtraction champs={resultat.sections.frais.champs} libelles={LIBELLES_FRAIS} />
                <RegleFrais
                  valeursInitiales={versRegleFrais(resultat.sections.frais.champs)}
                  origineIA
                />
              </div>

              {/* Modalités de DVH pré-remplies */}
              <div className="space-y-2">
              <ApercuExtraction champs={resultat.sections.dvh.champs} libelles={LIBELLES_DVH} />
                <RegleDVH
                  valeursInitiales={versRegleDVH(resultat.sections.dvh.champs)}
                  origineIA
                />
              </div>

              {/* Nature et échéances de la décision pré-remplies */}
              <div className="space-y-2">
              <ApercuExtraction champs={resultat.sections.decision.champs} libelles={LIBELLES_DECISION} />
                <RegleDecision
                  valeursInitiales={versRegleDecision(resultat.sections.decision.champs)}
                  origineIA
                />
              </div>

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
        <RetourAssistant variante="pied" />
      </div>
    </main>
  );
}