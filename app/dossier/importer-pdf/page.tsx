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

const TAILLE_MAX_MO = 10;

type Resultat = {
  source: "texte" | "ocr";
  dispositifTrouve: boolean;
  tronque: boolean;
  avertissement: string | null;
  sections: Sections;
};

function tailleLisible(octets: number): string {
  if (octets < 1024 * 1024) return (octets / 1024).toFixed(0) + " Ko";
  return (octets / (1024 * 1024)).toFixed(1) + " Mo";
}

export default function ImporterPdfPage() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [scanne, setScanne] = useState(false);
  const [resultat, setResultat] = useState<Resultat | null>(null);

  function reinitialiser() {
    setErreur("");
    setScanne(false);
    setResultat(null);
  }

  function choisirFichier(e: React.ChangeEvent<HTMLInputElement>) {
    reinitialiser();
    setFichier(null);
    const f = e.target.files?.[0];
    if (!f) return;
    const estPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!estPdf) {
      setErreur("Ce fichier n'est pas un PDF. Importez le jugement au format PDF.");
      return;
    }
    if (f.size > TAILLE_MAX_MO * 1024 * 1024) {
      setErreur(
        `Le fichier PDF est trop volumineux (maximum ${TAILLE_MAX_MO} Mo). ` +
          "Essayez une version plus légère ou uniquement les pages utiles du jugement."
      );
      return;
    }
    setFichier(f);
  }

  async function envoyer(avecOcr: boolean) {
    if (!fichier) return;
    setEnCours(true);
    setErreur("");
    setResultat(null);
    if (!avecOcr) setScanne(false);
    try {
      const donnees = new FormData();
      donnees.append("fichier", fichier);
      if (avecOcr) donnees.append("ocr", "true");
      const reponse = await fetch("/api/ia/extraire-pdf", {
        method: "POST",
        body: donnees,
      });
      const data = await reponse.json();
      if (!reponse.ok) {
        setErreur(data.erreur ?? "Une erreur est survenue.");
        return;
      }
      if (data.scanne) {
        setScanne(true);
        return;
      }
      setScanne(false);
      setResultat(data);
    } catch {
      setErreur("Connexion impossible. Réessayez.");
    } finally {
      setEnCours(false);
    }
  }

  // Avertissements regroupés (ciblage du dispositif + chaque section).
  const avertissements = resultat
    ? [
        ...(resultat.avertissement ? [resultat.avertissement] : []),
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
        title="Import du jugement (PDF)"
        subtitle="Importez le PDF de votre décision : l'assistant propose les règles, que vous vérifiez et validez."
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <ConsentementIA fonctionnalite="extraction">
          {/* Étape 1 : import + analyse */}
          {!resultat && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="pdf" className="block font-medium text-[#15233F]">
                  Fichier PDF du jugement
                </label>
                <input
                  id="pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={choisirFichier}
                  className="block w-full text-[#1F2733] file:mr-4 file:rounded-md file:border-0 file:bg-[#15233F] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#1d2f54]"
                />
                <p className="text-xs text-gray-500">
                  Format PDF uniquement · {TAILLE_MAX_MO} Mo maximum. Le fichier n&apos;est
                  envoyé au serveur que lorsque vous cliquez sur « Analyser ».
                </p>
              </div>

              {erreur && <p className="text-sm text-red-600">{erreur}</p>}

              {fichier && (
                <div className="rounded-lg border border-[#C2A24C] bg-white p-5 space-y-1">
                  <p className="font-display text-lg text-[#15233F]">Fichier sélectionné</p>
                  <p className="text-sm text-[#1F2733]">
                    <strong>{fichier.name}</strong> — {tailleLisible(fichier.size)}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => envoyer(false)}
                disabled={!fichier || enCours}
                className="rounded-lg bg-[#15233F] px-5 py-2 text-[#F8F6F1] transition hover:bg-[#1d2f52] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enCours ? "Analyse en cours…" : "Analyser le jugement"}
              </button>

              {scanne && (
                <div className="rounded-lg border border-[#C2A24C] bg-white p-5 space-y-3">
                  <h2 className="font-display text-lg text-[#15233F]">Ce PDF est un scan</h2>
                  <p className="text-sm leading-relaxed text-[#1F2733]">
                    Ce document ne contient pas de texte lisible directement (c&apos;est une
                    image). Pour le lire, le PDF sera envoyé à <strong>Mistral</strong>{" "}
                    (société française, hébergement en Union européenne, sans conservation
                    durable) afin d&apos;en reconnaître le texte. Vous validerez ensuite les
                    informations proposées.
                  </p>
                  <button
                    type="button"
                    onClick={() => envoyer(true)}
                    disabled={enCours}
                    className="rounded-lg bg-[#15233F] px-5 py-2 text-[#F8F6F1] transition hover:bg-[#1d2f52] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enCours ? "Reconnaissance en cours…" : "Lancer la reconnaissance de texte"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Étape 2 : relecture + validation (mêmes encarts que le hub) */}
          {resultat && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#C2A24C]/40 bg-[#C2A24C]/10 p-4 text-sm">
                <p className="font-medium text-[#15233F]">
                  Propositions de l&apos;assistant — à vérifier
                </p>
                <p className="mt-1 text-[#1F2733]/70">
                  {resultat.source === "ocr"
                    ? "Texte obtenu par reconnaissance de texte (OCR). "
                    : "Texte lu directement dans le PDF. "}
                  L&apos;assistant ne fait que proposer. Relisez chaque règle, corrigez si
                  besoin, puis enregistrez et validez chacune séparément. Rien n&apos;est écrit
                  tant que vous n&apos;enregistrez pas.
                </p>
                {avertissements.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-[#1F2733]/80">
                    {avertissements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>

              <ReglePension
                valeursInitiales={versReglePension(resultat.sections.pension.champs)}
                origineIA
              />
              <RegleFrais
                valeursInitiales={versRegleFrais(resultat.sections.frais.champs)}
                origineIA
              />
              <RegleDVH
                valeursInitiales={versRegleDVH(resultat.sections.dvh.champs)}
                origineIA
              />
              <RegleDecision
                valeursInitiales={versRegleDecision(resultat.sections.decision.champs)}
                origineIA
              />

              <button
                onClick={reinitialiser}
                className="rounded-lg border border-black/10 px-5 py-2 text-sm text-[#1F2733] hover:bg-white"
              >
                Importer un autre jugement
              </button>
            </div>
          )}
        </ConsentementIA>
      </div>
    </main>
  );
}
