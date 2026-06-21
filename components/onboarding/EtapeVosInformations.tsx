"use client";

// components/onboarding/EtapeVosInformations.tsx
//
// Etape 1 : le socle declarant. Formulaire compact qui ecrit dans la table
// `dossier` (meme upsert que la page /dossier), via lib/onboarding/sauvegarde.

import { useEffect, useState } from "react";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import {
  chargerDeclarant,
  enregistrerDeclarant,
  DECLARANT_VIDE,
  type ChampsDeclarant,
} from "@/lib/onboarding/sauvegarde";

const champCss =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-texte focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]";

export default function EtapeVosInformations({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [form, setForm] = useState<ChampsDeclarant>(DECLARANT_VIDE);
  const [chargement, setChargement] = useState(true);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let annule = false;
    chargerDeclarant().then((d) => {
      if (!annule) {
        setForm(d);
        setChargement(false);
      }
    });
    return () => {
      annule = true;
    };
  }, []);

  function maj(champ: keyof ChampsDeclarant, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function continuer() {
    setErreur("");
    setOccupe(true);
    const { erreur } = await enregistrerDeclarant(form);
    setOccupe(false);
    if (erreur) {
      setErreur("Enregistrement impossible : " + erreur);
      return;
    }
    onContinuer();
  }

  if (chargement) {
    return <p className="text-sm text-texte-doux">Chargement…</p>;
  }

  const champs: { cle: keyof ChampsDeclarant; label: string; type?: string }[] = [
    { cle: "declarant_civilite", label: "Civilité" },
    { cle: "declarant_nom", label: "Nom" },
    { cle: "declarant_prenom", label: "Prénom" },
    { cle: "declarant_adresse", label: "Adresse" },
    { cle: "declarant_code_postal", label: "Code postal" },
    { cle: "declarant_ville", label: "Ville" },
    { cle: "declarant_email", label: "Email", type: "email" },
    { cle: "declarant_telephone", label: "Téléphone" },
  ];

  return (
    <div>
      <p className="text-sm text-texte-doux">
        Vos informations de déclarant sont réutilisées dans vos courriers et votre
        note de synthèse. Vous pourrez les compléter ou les corriger plus tard.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {champs.map((c) => (
          <label key={c.cle} className="block">
            <span className="text-sm font-medium text-navy">{c.label}</span>
            <input
              type={c.type ?? "text"}
              value={form[c.cle]}
              onChange={(e) => maj(c.cle, e.target.value)}
              className={champCss}
            />
          </label>
        ))}
      </div>

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
