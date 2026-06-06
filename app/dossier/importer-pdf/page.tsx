"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const TAILLE_MAX_MO = 10;

type Champ = {
  valeur: number | string | boolean | null;
  confiance: string;
  citation: string | null;
};
type Section = { table: string; champs: Record<string, Champ>; avertissements: string[] };
type Sections = { pension: Section; frais: Section; dvh: Section; decision: Section };
type Resultat = {
  source: "texte" | "ocr";
  dispositifTrouve: boolean;
  tronque: boolean;
  avertissement: string | null;
  sections: Sections;
};

const TITRES: Record<keyof Sections, string> = {
  pension: "Pension alimentaire",
  frais: "Frais partagés",
  dvh: "Droit de visite et d'hébergement",
  decision: "Décision (statut)",
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

  return (
    <>
      <PageHeader
        eyebrow="Mon dossier"
        title="Import du jugement (PDF)"
        subtitle="Importez le PDF de votre décision. L'application en lira le texte pour vous proposer un pré-remplissage, que vous validerez."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
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
            Format PDF uniquement · {TAILLE_MAX_MO} Mo maximum. Le fichier n&apos;est envoyé
            au serveur que lorsque vous cliquez sur « Analyser ».
          </p>
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        {fichier && (
          <div className="rounded-lg border border-[#C2A24C] bg-[#F8F6F1] p-5 space-y-1">
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
          className="rounded-md bg-[#15233F] px-4 py-2 font-medium text-white hover:bg-[#1d2f54] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enCours ? "Analyse en cours…" : "Analyser le jugement"}
        </button>

        {scanne && (
          <div className="rounded-lg border border-[#C2A24C] bg-white p-5 space-y-3">
            <h2 className="font-display text-lg text-[#15233F]">Ce PDF est un scan</h2>
            <p className="text-sm leading-relaxed text-[#1F2733]">
              Ce document ne contient pas de texte lisible directement (c&apos;est une image).
              Pour le lire, le PDF sera envoyé à <strong>Mistral</strong> (société française,
              hébergement en Union européenne, sans conservation durable) afin d&apos;en
              reconnaître le texte. Vous validerez ensuite les informations proposées.
            </p>
            <button
              type="button"
              onClick={() => envoyer(true)}
              disabled={enCours}
              className="rounded-md bg-[#15233F] px-4 py-2 font-medium text-white hover:bg-[#1d2f54] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enCours ? "Reconnaissance en cours…" : "Lancer la reconnaissance de texte"}
            </button>
          </div>
        )}

        {resultat && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#C2A24C] bg-[#F8F6F1] p-4 space-y-1">
              <p className="text-sm text-[#1F2733]">
                {resultat.source === "ocr"
                  ? "Texte obtenu par reconnaissance (OCR Mistral)."
                  : "Texte lu directement dans le PDF."}{" "}
                {resultat.dispositifTrouve
                  ? "« PAR CES MOTIFS » trouvé."
                  : "« PAR CES MOTIFS » non trouvé."}
              </p>
              {resultat.avertissement && (
                <p className="text-sm text-amber-700">{resultat.avertissement}</p>
              )}
              <p className="text-xs text-gray-500">
                Propositions à vérifier — rien n&apos;est enregistré tant que vous ne validez pas.
              </p>
            </div>

            {(Object.keys(TITRES) as Array<keyof Sections>).map((nom) => {
              const sec = resultat.sections[nom];
              const remplis = Object.entries(sec.champs).filter(
                ([, c]) => c.valeur !== null
              );
              return (
                <div
                  key={nom}
                  className="rounded-lg border border-[#C2A24C] bg-white p-5 space-y-2"
                >
                  <h3 className="font-display text-lg text-[#15233F]">{TITRES[nom]}</h3>
                  {sec.avertissements.map((a, i) => (
                    <p key={i} className="text-sm text-amber-700">
                      {a}
                    </p>
                  ))}
                  {remplis.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucune information détectée.</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-[#1F2733]">
                      {remplis.map(([k, c]) => (
                        <li key={k}>
                          <span className="font-medium">{k}</span> : {String(c.valeur)}{" "}
                          <span className="text-gray-500">({c.confiance})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            <p className="text-xs text-gray-500">
              Affichage provisoire. Les encarts éditables à valider (les mêmes que le hub)
              arrivent à l&apos;étape suivante.
            </p>
          </div>
        )}
      </div>
    </>
  );
}