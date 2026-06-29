"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
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
    <AppShell
      titre="Brouillons locaux"
      description="Retrouver les brouillons issus de la collecte rapide et les envoyer vers le bon module avant enregistrement."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/organiser" variant="secondary">
            Retour Organiser
          </AppButtonLink>
          <AppButtonLink href="/collecter/rapide">
            Créer un brouillon
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Brouillons non enregistrés">
          <p>
            Ces brouillons ne sont pas encore enregistrés dans votre dossier.
            Ils sont conservés uniquement dans ce navigateur et ne sont pas
            synchronisés entre appareils. Pas encore enregistrés dans le dossier.
          </p>
        </AppNotice>

        <AppCard titre="Actions">
          <div className="space-y-4">
            <p className="text-sm text-[var(--app-text-muted)]">
              Les brouillons locaux ne sont pas synchronisés entre appareils. Si
              vous changez de navigateur ou de téléphone, ils ne suivront pas.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={chargerBrouillons}
                className="rounded-full bg-[#15233F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F1A30]"
              >
                Charger les brouillons
              </button>
            </div>
            {message && (
              <p className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-text-muted)]">
                {message}
              </p>
            )}
          </div>
        </AppCard>

        {brouillons.length === 0 ? (
          <AppCard titre="Aucun brouillon affiché">
            <div className="space-y-4">
              <p className="text-sm text-[var(--app-text-muted)]">
                Cliquez sur &quot;Charger les brouillons&quot; pour vérifier si ce
                navigateur contient des brouillons locaux. Vous pouvez aussi
                retourner dans la collecte rapide pour en préparer un nouveau.
              </p>
              <div className="flex flex-wrap gap-3">
                <AppButtonLink href="/collecter/rapide">
                  Aller à la collecte rapide
                </AppButtonLink>
              </div>
            </div>
          </AppCard>
        ) : (
          <AppCard titre={`${brouillons.length} élément(s) à traiter`}>
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={viderBrouillons}
                  className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Supprimer tous les brouillons
                </button>
              </div>

              <div className="grid gap-4">
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
                      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                            {brouillon.type}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-[var(--app-text)]">
                            {brouillon.titre || "Brouillon sans titre"}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                            Date : {formaterDate(brouillon.date)} · Enfant :{" "}
                            {brouillon.enfant || "à compléter"}
                          </p>
                          <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                            Créé le {formaterDateHeure(brouillon.creeLe)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => copierBrouillon(brouillon.contenu)}
                            className="rounded-full border border-[var(--app-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-surface-muted)]"
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

                      <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--app-border)] bg-white p-4 text-sm leading-6 text-[var(--app-text-muted)]">
                        {brouillon.contenu}
                      </pre>
                    </article>
                  );
                })}
              </div>
            </div>
          </AppCard>
        )}

        <AppNotice titre="Rappel important">
          <p>
            Un brouillon local n&apos;est pas une preuve enregistrée dans le
            dossier. Le préremplissage aide seulement à préparer les champs.
            L&apos;utilisateur doit vérifier puis enregistrer lui-même.
          </p>
        </AppNotice>
      </div>
    </AppShell>
  );
}
