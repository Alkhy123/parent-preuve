"use client";

// components/onboarding/EtapeJugement.tsx
//
// Etape 5 : l'utilisateur dispose-t-il d'un jugement ?
//  - Oui : on oriente vers les modules d'import/analyse EXISTANTS (reutilises
//    tels quels). La progression est memorisee : on revient ensuite a l'assistant.
//  - Non / pas encore : on continue sans bloquer. Les regles pourront etre
//    saisies a la main a l'etape suivante.
//
// Aucune ecriture en base ici, aucun appel IA declenche depuis cette etape.

import { useState } from "react";
import Link from "next/link";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";

type Choix = "oui" | "non" | null;

export default function EtapeJugement({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [choix, setChoix] = useState<Choix>(null);

  return (
    <div>
      <p className="text-sm text-texte-doux">
        Avez-vous une décision de justice (jugement, ordonnance) qui fixe les règles
        de votre situation ?
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setChoix("oui")}
          className={[
            "carte rounded-xl bg-white p-4 text-left text-sm transition",
            choix === "oui" ? "ring-2 ring-[#C2A24C]" : "hover:bg-navy/5",
          ].join(" ")}
        >
          <span className="font-medium text-navy">Oui, j&apos;ai un jugement</span>
          <span className="mt-1 block text-texte-doux">
            L&apos;assistant vous aide à en extraire les règles probables.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setChoix("non")}
          className={[
            "carte rounded-xl bg-white p-4 text-left text-sm transition",
            choix === "non" ? "ring-2 ring-[#C2A24C]" : "hover:bg-navy/5",
          ].join(" ")}
        >
          <span className="font-medium text-navy">Pas de jugement (ou pas encore)</span>
          <span className="mt-1 block text-texte-doux">
            Vous pourrez renseigner les règles à la main, sans être bloqué.
          </span>
        </button>
      </div>

      {choix === "oui" && (
        <div className="mt-5 rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-4 text-sm">
          <p className="text-texte">
            Choisissez une méthode. Après analyse, l&apos;application a détecté ces
            éléments dans le document : vérifiez qu&apos;ils correspondent bien à votre
            jugement avant de les valider.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dossier/importer-pdf?retour=assistant"
              className="btn btn-secondaire justify-center"
            >
              Importer le PDF du jugement
            </Link>
            <Link
              href="/dossier/extraire?retour=assistant"
              className="btn btn-secondaire justify-center"
            >
              Décrire le jugement avec mes mots
            </Link>
          </div>
          <p className="mt-3 text-xs text-texte-doux">
            Ces pages s&apos;ouvrent dans l&apos;assistant existant. Un bouton « Revenir
            à l&apos;assistant » vous y ramènera directement à l&apos;étape des règles.
          </p>
        </div>
      )}

      {choix === "non" && (
        <div className="mt-5 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-texte-doux">
          Pas de souci. Vous continuez le parcours et pourrez compléter les règles à
          l&apos;étape suivante, puis ajouter un jugement plus tard.
        </div>
      )}

      <PiedEtape
        onPrecedent={onPrecedent}
        estPremiere={estPremiere}
        onContinuer={onContinuer}
        libelleContinuer={estDerniere ? "Accéder à mon tableau de bord" : "Continuer"}
      />
    </div>
  );
}
