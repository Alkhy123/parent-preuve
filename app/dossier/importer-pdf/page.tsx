"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const TAILLE_MAX_MO = 10;

function tailleLisible(octets: number): string {
  if (octets < 1024 * 1024) return (octets / 1024).toFixed(0) + " Ko";
  return (octets / (1024 * 1024)).toFixed(1) + " Mo";
}

export default function ImporterPdfPage() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [infoServeur, setInfoServeur] = useState("");

  function choisirFichier(e: React.ChangeEvent<HTMLInputElement>) {
    setErreur("");
    setInfoServeur("");
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

  // Envoie le PDF à la route serveur, qui revérifie de son côté.
  async function analyser() {
    if (!fichier) return;
    setEnCours(true);
    setErreur("");
    setInfoServeur("");
    try {
      const donnees = new FormData();
      donnees.append("fichier", fichier);
      const reponse = await fetch("/api/ia/extraire-pdf", {
        method: "POST",
        body: donnees,
      });
      const data = await reponse.json();
      if (!reponse.ok) {
        setErreur(data.erreur ?? "Une erreur est survenue.");
        return;
      }
      setInfoServeur(
        `PDF bien reçu côté serveur : ${data.nom} (${tailleLisible(data.taille)}).`
      );
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
          onClick={analyser}
          disabled={!fichier || enCours}
          className="rounded-md bg-[#15233F] px-4 py-2 font-medium text-white hover:bg-[#1d2f54] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enCours ? "Envoi en cours…" : "Analyser le jugement"}
        </button>

        {infoServeur && <p className="text-sm text-green-700">{infoServeur}</p>}
      </div>
    </>
  );
}