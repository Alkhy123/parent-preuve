"use client";

// components/onboarding/EtapeJugement.tsx
//
// Etape 5 : l'utilisateur dispose-t-il d'un jugement ?
//  - Oui : il saisit la reference du jugement (juridiction + date, et au besoin
//    n RG et intitule), enregistree sur la procedure active. Il peut aussi
//    extraire les regles via les modules d'import EXISTANTS.
//  - Non / pas encore : on continue sans bloquer.
//
// La reference juridiction + date est ce qui fait basculer le statut "jugement"
// du dossier sur "renseigne" (lib/etatDossier.referenceJugementRenseignee).

import { useEffect, useState } from "react";
import Link from "next/link";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import { getProcedureActiveId } from "@/lib/procedureActive";
import {
  chargerJugement,
  enregistrerJugement,
  JUGEMENT_VIDE,
  type ChampsJugement,
} from "@/lib/onboarding/sauvegarde";

type Choix = "oui" | "non" | null;

const champCss =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-ring)] focus:outline-none focus:ring-1 focus:ring-[var(--app-ring)]";

export default function EtapeJugement({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [choix, setChoix] = useState<Choix>(null);
  const [procId, setProcId] = useState<string | null>(null);
  const [form, setForm] = useState<ChampsJugement>(JUGEMENT_VIDE);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  // Charge la procedure active et sa reference de jugement. Si le jugement est
  // deja renseigne, on preselectionne "Oui" et on pre-remplit le formulaire.
  useEffect(() => {
    let annule = false;
    (async () => {
      const id = await getProcedureActiveId();
      if (annule) return;
      setProcId(id);
      if (id) {
        const champs = await chargerJugement(id);
        if (annule) return;
        setForm(champs);
        if (champs.jugement_juridiction || champs.jugement_date) setChoix("oui");
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  function maj(champ: keyof ChampsJugement, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function continuer() {
    setErreur("");
    if (choix === "oui" && procId) {
      setOccupe(true);
      const { erreur } = await enregistrerJugement(procId, form);
      setOccupe(false);
      if (erreur) {
        setErreur("Enregistrement impossible : " + erreur);
        return;
      }
    }
    onContinuer();
  }

  return (
    <div>
      <p className="text-sm text-[var(--app-text-muted)]">
        Avez-vous une décision de justice (jugement, ordonnance) qui fixe les règles
        de votre situation ?
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setChoix("oui")}
          className={[
            "rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-left text-sm shadow-sm transition",
            choix === "oui" ? "ring-2 ring-[var(--app-ring)]" : "hover:bg-black/5",
          ].join(" ")}
        >
          <span className="font-medium text-navy">Oui, j&apos;ai un jugement</span>
          <span className="mt-1 block text-[var(--app-text-muted)]">
            Renseignez sa référence et, si besoin, extrayez les règles.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setChoix("non")}
          className={[
            "rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-left text-sm shadow-sm transition",
            choix === "non" ? "ring-2 ring-[var(--app-ring)]" : "hover:bg-black/5",
          ].join(" ")}
        >
          <span className="font-medium text-navy">Pas de jugement (ou pas encore)</span>
          <span className="mt-1 block text-[var(--app-text-muted)]">
            Vous pourrez renseigner les règles à la main, sans être bloqué.
          </span>
        </button>
      </div>

      {choix === "oui" && (
        <div className="mt-5 space-y-5">
          {/* Reference du jugement, enregistree sur la procedure active. */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-display text-base text-navy">Référence du jugement</h3>
            <p className="mt-1 text-xs text-[var(--app-text-muted)]">
              La juridiction et la date suffisent à marquer le jugement comme
              renseigné dans votre dossier.
            </p>
            {!procId && (
              <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Aucune procédure active. Revenez à l&apos;étape « Procédure » pour en
                créer ou en choisir une.
              </div>
            )}
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-navy">Juridiction</span>
                <input
                  type="text"
                  value={form.jugement_juridiction}
                  onChange={(e) => maj("jugement_juridiction", e.target.value)}
                  placeholder="Tribunal judiciaire de…"
                  className={champCss}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy">Date du jugement</span>
                <input
                  type="date"
                  value={form.jugement_date}
                  onChange={(e) => maj("jugement_date", e.target.value)}
                  className={champCss}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy">Numéro RG (facultatif)</span>
                <input
                  type="text"
                  value={form.jugement_numero_rg}
                  onChange={(e) => maj("jugement_numero_rg", e.target.value)}
                  className={champCss}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-navy">
                  Intitulé / objet (facultatif)
                </span>
                <textarea
                  value={form.jugement_intitule}
                  onChange={(e) => maj("jugement_intitule", e.target.value)}
                  rows={2}
                  className={champCss}
                />
              </label>
            </div>
          </div>

          {/* Extraction des regles via les modules existants. */}
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 text-sm">
            <p className="text-[var(--app-text)]">
              Pour pré-remplir les règles, importez le jugement. Après analyse,
              l&apos;application a détecté ces éléments dans le document : vérifiez
              qu&apos;ils correspondent bien à votre jugement avant de les valider.
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dossier/importer-pdf?retour=assistant"
                className="btn justify-center border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
              >
                Importer le PDF du jugement
              </Link>
              <Link
                href="/dossier/extraire?retour=assistant"
                className="btn justify-center border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
              >
                Décrire le jugement avec mes mots
              </Link>
            </div>
            <p className="mt-3 text-xs text-[var(--app-text-muted)]">
              Un bouton « Continuer dans l&apos;assistant » vous ramènera directement à
              l&apos;étape des règles.
            </p>
          </div>
        </div>
      )}

      {choix === "non" && (
        <div className="mt-5 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--app-text-muted)]">
          Pas de souci. Vous continuez le parcours et pourrez compléter les règles à
          l&apos;étape suivante, puis ajouter un jugement plus tard.
        </div>
      )}

      {erreur && <p className="mt-3 text-sm text-rouge">{erreur}</p>}

      <PiedEtape
        onPrecedent={onPrecedent}
        estPremiere={estPremiere}
        onContinuer={continuer}
        libelleContinuer={estDerniere ? "Accéder à mon tableau de bord" : "Continuer"}
        occupe={occupe}
      />
    </div>
  );
}
