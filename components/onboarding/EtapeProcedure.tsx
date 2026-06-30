"use client";

// components/onboarding/EtapeProcedure.tsx
//
// Etape 2 : la procedure = le conteneur (un autre parent + son jugement).
// L'utilisateur cree une nouvelle procedure ou selectionne une procedure
// existante ; elle devient la procedure active. Aucun melange entre procedures.

import { useEffect, useState } from "react";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import {
  getProcedureActiveIdLocal,
  setProcedureActiveIdLocal,
} from "@/lib/procedureActive";
import {
  listerProcedures,
  creerProcedure,
  type ProcedureLigne,
} from "@/lib/onboarding/sauvegarde";

const NOUVELLE = "__nouvelle__";

const champCss =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-ring)] focus:outline-none focus:ring-1 focus:ring-[var(--app-ring)]";

function libelle(p: ProcedureLigne) {
  return p.etiquette?.trim() ? p.etiquette : "Procédure sans nom";
}

export default function EtapeProcedure({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [procedures, setProcedures] = useState<ProcedureLigne[]>([]);
  const [choix, setChoix] = useState<string>(NOUVELLE);
  const [etiquette, setEtiquette] = useState("");
  const [chargement, setChargement] = useState(true);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let annule = false;
    listerProcedures().then((procs) => {
      if (annule) return;
      setProcedures(procs);
      const active = getProcedureActiveIdLocal();
      if (active && procs.some((p) => p.id === active)) setChoix(active);
      else if (procs.length > 0) setChoix(procs[0].id);
      else setChoix(NOUVELLE);
      setChargement(false);
    });
    return () => {
      annule = true;
    };
  }, []);

  async function continuer() {
    setErreur("");

    if (choix === NOUVELLE) {
      setOccupe(true);
      const { id, erreur } = await creerProcedure(etiquette);
      setOccupe(false);
      if (erreur || !id) {
        setErreur("Création impossible : " + (erreur ?? "inconnue"));
        return;
      }
      setProcedureActiveIdLocal(id);
    } else {
      setProcedureActiveIdLocal(choix);
    }
    onContinuer();
  }

  if (chargement) {
    return <p className="text-sm text-[var(--app-text-muted)]">Chargement…</p>;
  }

  return (
    <div>
      <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-text)]">
        Les enfants ayant le même autre parent peuvent être regroupés dans une
        procédure. Si un enfant concerne un autre parent différent, l&apos;application
        créera une procédure séparée.
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-navy">
            Procédure (l&apos;autre parent concerné)
          </span>
          <select
            value={choix}
            onChange={(e) => setChoix(e.target.value)}
            className={`${champCss} bg-white`}
          >
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {libelle(p)}
              </option>
            ))}
            <option value={NOUVELLE}>➕ Nouvelle procédure (autre parent)</option>
          </select>
        </label>

        {choix === NOUVELLE && (
          <label className="block">
            <span className="text-sm font-medium text-navy">
              Nom de la procédure
            </span>
            <input
              type="text"
              value={etiquette}
              onChange={(e) => setEtiquette(e.target.value)}
              placeholder="Ex : Camille, ou « Papa de … »"
              className={champCss}
            />
          </label>
        )}
      </div>

      {erreur && <p className="mt-3 text-sm text-rouge">{erreur}</p>}

      <PiedEtape
        onPrecedent={onPrecedent}
        estPremiere={estPremiere}
        onContinuer={continuer}
        libelleContinuer={estDerniere ? "Accéder à mon tableau de bord" : "Continuer"}
        continuerDesactive={choix === NOUVELLE && etiquette.trim() === ""}
        occupe={occupe}
      />
    </div>
  );
}
