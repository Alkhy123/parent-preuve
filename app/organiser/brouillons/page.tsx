"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/PageHeader";
import {
  construirePreRemplissageCollecte,
  type BrouillonCollectePourPreRemplissage,
} from "@/lib/collecteRapidePreRemplissage";
import { CLE_SESSION_PREREMPLISSAGE } from "@/lib/preRemplissage";

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
  const router = useRouter();

  const [brouillons, setBrouillons] = useState<BrouillonLocal[]>([]);
  const [message, setMessage] = useState("");

  function afficherMessage(texte: string) {
    setMessage(texte);
    window.setTimeout(() => setMessage(""), 2500);
  }

  function chargerBrouillons() {
    const brouillonsCharges = lireBrouillonsLocaux();
    setBrouillons(brouillonsCharges);

    if (brouillonsCharges.length === 0) {
      afficherMessage("Aucun brouillon local trouvé sur ce navigateur.");
    } else {
      afficherMessage(`${brouillonsCharges.length} brouillon(s) chargé(s).`);
    }
  }

  async function copierBrouillon(contenu: string) {
    try {
      await navigator.clipboard.writeText(contenu);
      afficherMessage("Brouillon copié.");
    } catch {
      afficherMessage("Impossible de copier automatiquement le brouillon.");
    }
  }

  function ouvrirModuleAvecPreRemplissage(
    source: BrouillonCollectePourPreRemplissage,
  ) {
    const resultat = construirePreRemplissageCollecte(source);

    try {
      if (resultat.proposition) {
        window.sessionStorage.setItem(
          CLE_SESSION_PREREMPLISSAGE,
          JSON.stringify(resultat.proposition),
        );
      }
    } catch {
      // sessionStorage indisponible : on ouvre simplement le module.
    }

    router.push(resultat.href);
  }

  function supprimerBrouillon(id: string) {
    const brouillonsMisAJour = brouillons.filter(
      (brouillon) => brouillon.id !== id,
    );

    enregistrerBrouillonsLocaux(brouillonsMisAJour);
    setBrouillons(brouillonsMisAJour);
    afficherMessage("Brouillon supprimé.");
  }

  function viderBrouillons() {
    enregistrerBrouillonsLocaux([]);
    setBrouillons([]);
    afficherMessage("Tous les brouillons locaux ont été supprimés.");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Organiser"
        title="Brouillons locaux de collecte"
        subtitle="Retrouvez les brouillons préparés depuis la collecte rapide pour les copier, les supprimer ou préremplir le bon module."
      />

      <section className="mt-6 rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Ces brouillons ne sont pas encore enregistrés dans votre dossier.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Ils sont conservés uniquement dans ce navigateur. Pour les faits, frais
          et pensions, vous pouvez maintenant préremplir le module correspondant
          avant validation.
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
            {brouillons.map((brouillon) => {
              const action = construirePreRemplissageCollecte({
                type: brouillon.type,
                href: brouillon.href,
                date: brouillon.date,
                titre: brouillon.titre,
                enfant: brouillon.enfant,
                contenu: brouillon.contenu,
              });

              return (
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

                      <button
                        type="button"
                        onClick={() =>
                          ouvrirModuleAvecPreRemplissage({
                            type: brouillon.type,
                            href: brouillon.href,
                            date: brouillon.date,
                            titre: brouillon.titre,
                            enfant: brouillon.enfant,
                            contenu: brouillon.contenu,
                          })
                        }
                        className="rounded-full bg-[#15233F] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0F1A30]"
                      >
                        {action.labelAction}
                      </button>

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
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-base font-semibold text-amber-900">
          Rappel important
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Un brouillon local n’est pas une preuve enregistrée dans le dossier.
          Le préremplissage aide seulement à préparer les champs. L’utilisateur
          doit vérifier puis enregistrer lui-même.
        </p>
      </section>
    </main>
  );
}
