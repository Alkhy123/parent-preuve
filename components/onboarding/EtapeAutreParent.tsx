"use client";

// components/onboarding/EtapeAutreParent.tsx
//
// Etape 3 : coordonnees de l'autre parent, enregistrees sur la procedure
// active (table `procedures`). Le jugement se renseigne a l'etape dediee.

import { useEffect, useState } from "react";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import { getProcedureActiveId } from "@/lib/procedureActive";
import {
  chargerAutreParent,
  enregistrerAutreParent,
  AUTRE_PARENT_VIDE,
  type ChampsAutreParent,
} from "@/lib/onboarding/sauvegarde";

const champCss =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-ring)] focus:outline-none focus:ring-1 focus:ring-[var(--app-ring)]";

export default function EtapeAutreParent({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [procId, setProcId] = useState<string | null>(null);
  const [form, setForm] = useState<ChampsAutreParent>(AUTRE_PARENT_VIDE);
  const [chargement, setChargement] = useState(true);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let annule = false;
    (async () => {
      const id = await getProcedureActiveId();
      if (annule) return;
      setProcId(id);
      if (id) {
        const champs = await chargerAutreParent(id);
        if (!annule) setForm(champs);
      }
      if (!annule) setChargement(false);
    })();
    return () => {
      annule = true;
    };
  }, []);

  function maj(champ: keyof ChampsAutreParent, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function continuer() {
    setErreur("");
    if (!procId) {
      setErreur(
        "Aucune procédure active. Revenez à l'étape précédente pour en créer ou en choisir une."
      );
      return;
    }
    setOccupe(true);
    const { erreur } = await enregistrerAutreParent(procId, form);
    setOccupe(false);
    if (erreur) {
      setErreur("Enregistrement impossible : " + erreur);
      return;
    }
    onContinuer();
  }

  if (chargement) {
    return <p className="text-sm text-[var(--app-text-muted)]">Chargement…</p>;
  }

  if (!procId) {
    return (
      <div>
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aucune procédure active. Revenez à l&apos;étape précédente pour créer ou
          choisir une procédure.
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

  const champs: { cle: keyof ChampsAutreParent; label: string }[] = [
    { cle: "etiquette", label: "Nom de la procédure" },
    { cle: "autre_parent_civilite", label: "Civilité" },
    { cle: "autre_parent_nom", label: "Nom" },
    { cle: "autre_parent_prenom", label: "Prénom" },
    { cle: "autre_parent_adresse", label: "Adresse" },
    { cle: "autre_parent_code_postal", label: "Code postal" },
    { cle: "autre_parent_ville", label: "Ville" },
  ];

  return (
    <div>
      <p className="text-sm text-[var(--app-text-muted)]">
        Ces coordonnées concernent la procédure active. Elles alimentent vos
        courriers et votre note de synthèse. Tous les champs sont facultatifs ici.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {champs.map((c) => (
          <label key={c.cle} className="block">
            <span className="text-sm font-medium text-[var(--app-text)]">{c.label}</span>
            <input
              type="text"
              value={form[c.cle]}
              onChange={(e) => maj(c.cle, e.target.value)}
              className={champCss}
            />
          </label>
        ))}
      </div>

      {erreur && <p className="mt-3 text-sm text-red-700">{erreur}</p>}

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
