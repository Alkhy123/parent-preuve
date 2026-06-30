"use client";

// components/onboarding/EtapeEnfants.tsx
//
// Etape 4 : les enfants rattaches a la procedure active (table `children`).
// Ajout/suppression au fil de l'eau ; le parcours n'est jamais bloque.

import { useEffect, useState } from "react";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import { getProcedureActiveId } from "@/lib/procedureActive";
import {
  listerEnfantsDeProcedure,
  ajouterEnfant,
  supprimerEnfant,
  type EnfantLigne,
} from "@/lib/onboarding/sauvegarde";

const champCss =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-ring)] focus:outline-none focus:ring-1 focus:ring-[var(--app-ring)]";

export default function EtapeEnfants({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [procId, setProcId] = useState<string | null>(null);
  const [enfants, setEnfants] = useState<EnfantLigne[]>([]);
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [chargement, setChargement] = useState(true);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  async function rafraichir(id: string) {
    const liste = await listerEnfantsDeProcedure(id);
    setEnfants(liste);
  }

  useEffect(() => {
    let annule = false;
    (async () => {
      const id = await getProcedureActiveId();
      if (annule) return;
      setProcId(id);
      if (id) await rafraichir(id);
      if (!annule) setChargement(false);
    })();
    return () => {
      annule = true;
    };
  }, []);

  async function ajouter() {
    setErreur("");
    if (!procId) return;
    setOccupe(true);
    const { erreur } = await ajouterEnfant(procId, prenom, dateNaissance);
    setOccupe(false);
    if (erreur) {
      setErreur(erreur);
      return;
    }
    setPrenom("");
    setDateNaissance("");
    await rafraichir(procId);
  }

  async function retirer(id: string) {
    if (!procId) return;
    const { erreur } = await supprimerEnfant(id);
    if (erreur) {
      setErreur(erreur);
      return;
    }
    await rafraichir(procId);
  }

  if (chargement) {
    return <p className="text-sm text-[var(--app-text-muted)]">Chargement…</p>;
  }

  if (!procId) {
    return (
      <div>
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aucune procédure active. Revenez à l&apos;étape « Procédure » pour en créer
          ou en choisir une.
        </div>
        <PiedEtape
          onPrecedent={onPrecedent}
          estPremiere={estPremiere}
          onContinuer={onPrecedent}
          libelleContinuer="Revenir en arrière"
        />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[var(--app-text-muted)]">
        Ajoutez chaque enfant concerné par cette procédure. Vous pourrez en ajouter
        d&apos;autres plus tard depuis « Mes enfants ».
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[var(--app-text)]">Prénom ou alias</span>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Ex : Enfant A"
            className={champCss}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--app-text)]">
            Date de naissance (facultatif)
          </span>
          <input
            type="date"
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            className={champCss}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={ajouter}
        disabled={occupe || prenom.trim() === ""}
        className="btn mt-3 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:opacity-50"
      >
        {occupe ? "Ajout…" : "Ajouter cet enfant"}
      </button>

      {erreur && <p className="mt-3 text-sm text-red-700">{erreur}</p>}

      <ul className="mt-5 space-y-2">
        {enfants.length === 0 ? (
          <li className="text-sm text-[var(--app-text-muted)]">Aucun enfant pour le moment.</li>
        ) : (
          enfants.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm"
            >
              <span className="text-[var(--app-text)]">
                {e.prenom_ou_alias}
                {e.date_naissance ? ` — né(e) le ${e.date_naissance}` : ""}
              </span>
              <button
                type="button"
                onClick={() => retirer(e.id)}
                className="text-sm text-red-700 hover:underline"
              >
                Retirer
              </button>
            </li>
          ))
        )}
      </ul>

      <PiedEtape
        onPrecedent={onPrecedent}
        estPremiere={estPremiere}
        onContinuer={onContinuer}
        libelleContinuer={estDerniere ? "Accéder à mon tableau de bord" : "Continuer"}
      />
    </div>
  );
}
