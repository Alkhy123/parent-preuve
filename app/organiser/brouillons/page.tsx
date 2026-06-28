"use client";

import Link from "next/link";
import { useState } from "react";

import PageHeader from "@/components/PageHeader";

type BrouillonLocal = {
  id: string;
  type: string;
  href: string;
  date: string;
  titre: string;
  enfant: string;
  contenu: string;
  creeLe: string;
};

const CLE_BROUILLONS = "parent-preuve:brouillons-collecte-rapide";

function lireBrouillonsLocaux() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const brut = window.localStorage.getItem(CLE_BROUILLONS);

    if (!brut) {
      return [];
    }

    const valeur = JSON.parse(brut);

    if (!Array.isArray(valeur)) {
      return [];
    }

    return valeur as BrouillonLocal[];
  } catch {
    return [];
  }
}

function enregistrerBrouillonsLocaux(brouillons: BrouillonLocal[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CLE_BROUILLONS, JSON.stringify(brouillons));
}

function formaterDate(dateIso: string) {
  if (!dateIso) {
    return "Date à compléter";
  }

  try {
    return new Intl.DateTimeFormat("fr-FR").format(new Date(dateIso));
  } catch {
    return dateIso;
  }
}

function formaterDateHeure(dateIso: string) {
  if (!dateIso) {
    return "Date inconnue";
  }

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateIso));
  } catch {
    return dateIso;
  }
}

export default function OrganiserBrouillonsPage() {
  const [brouillons, setBrouillons] = useState<BrouillonLocal[]>([]);
  const [message, setMessage] = useState("");

  function chargerBrouillons() {
    const brouillonsCharges = lireBrouillonsLocaux();
    setBrouillons(brouillonsCharges);

    if (brouillonsCharges.length === 0) {
      setMessage("Aucun brouillon local trouvé sur ce navigateur.");
    } else {
      setMessage(`${brouillonsCharges.length} brouillon(s) chargé(s).`);
    }

    window.setTimeout(() => setMessage(""), 2500);
  }

  async function copierBrouillon(contenu: string) {
    try {
      await navigator.clipboard.writeText(contenu);
      setMessage("Brouillon copié.");
      window.setTimeout(() => setMessage(""), 2500);
    } catch {
      setMessage("Impossible de copier automatiquement le brouillon.");
      window.setTimeout(() => setMessage(""), 2500);
    }
  }

  function supprimerBrouillon(id: string) {
    const brouillonsMisAJour = brouillons.filter(
      (brouillon) => brouillon.id !== id,
    );

    enregistrerBrouillonsLocaux(brouillonsMisAJour);
    setBrouillons(brouillonsMisAJour);
    setMessage("Brouillon supprimé.");
    window.setTimeout(() => setMessage(""), 2500);
  }

  function viderBrouillons() {
    enregistrerBrouillonsLocaux([]);
    setBrouillons([]);
    setMessage("Tous les brouillons locaux ont été supprimés.");
    window.setTimeout(() => setMessage(""), 2500);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Organiser"
        title="Brouillons locaux de collecte"
        subtitle="Retrouvez les brouillons préparés depuis la collecte rapide pour les copier, les supprimer ou les envoyer vers le bon module."
      />

      <section className="mt-6 rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Ces brouillons ne sont pas encore enregistrés dans votre dossier.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Ils sont conservés uniquement dans ce navigateur. Ils servent à ne pas
          perdre une saisie rapide avant de l’enregistrer proprement dans le bon
          module : journal, preuve, document, frais, pension ou calendrier.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
              Actions
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
              Charger les brouillons du navigateur
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Les brouillons locaux ne sont pas synchronisés entre appareils. Si
              vous changez de navigateur ou de téléphone, ils ne suivront pas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={chargerBrouillons}
              className="rounded-full bg-[#15233F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F1A30]"
            >
              Charger les brouillons
            </button>

            <Link
              href="/collecter/rapide"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70"
            >
              Créer un brouillon
            </Link>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        )}
      </section>

      {brouillons.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-[#15233F]">
            Aucun brouillon affiché
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Cliquez sur “Charger les brouillons” pour vérifier si ce navigateur
            contient des brouillons locaux. Vous pouvez aussi retourner dans la
            collecte rapide pour en préparer un nouveau.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/collecter/rapide"
              className="rounded-full bg-[#15233F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F1A30]"
            >
              Aller à la collecte rapide
            </Link>

            <Link
              href="/organiser"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70"
            >
              Retour à Organiser
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
                Brouillons chargés
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#15233F]">
                {brouillons.length} élément(s) à traiter
              </h2>
            </div>

            <button
              type="button"
              onClick={viderBrouillons}
              className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              Supprimer tous les brouillons
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            {brouillons.map((brouillon) => (
              <article
                key={brouillon.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#C2A24C]">
                      {brouillon.type}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-[#15233F]">
                      {brouillon.titre || "Brouillon sans titre"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Date : {formaterDate(brouillon.date)} · Enfant :{" "}
                      {brouillon.enfant || "à compléter"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Créé le {formaterDateHeure(brouillon.creeLe)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copierBrouillon(brouillon.contenu)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70"
                    >
                      Copier
                    </button>

                    <Link
                      href={brouillon.href}
                      className="rounded-full bg-[#15233F] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0F1A30]"
                    >
                      Ouvrir le module
                    </Link>

                    <button
                      type="button"
                      onClick={() => supprimerBrouillon(brouillon.id)}
                      className="rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {brouillon.contenu}
                </pre>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-base font-semibold text-amber-900">
          Rappel important
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Un brouillon local n’est pas une preuve enregistrée dans le dossier.
          Il sert uniquement à préparer une saisie factuelle avant de l’ajouter
          au bon module.
        </p>
      </section>
    </main>
  );
}
