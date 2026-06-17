"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getEtatConfigurationDossier,
  type EtatConfigurationDossier,
} from "@/lib/etatConfiguration";

// Couleurs sémantiques (jamais l'or) : vert = fait, ambre = à faire.
const VERT = "#2E6A4D";
const AMBRE = "#8A5A12";
const GRIS = "#5A6473"; // état neutre pendant le chargement

// Pour chaque carte : le libellé affiché et l'adresse de destination.
const CARTES = [
  { cle: "procedure", libelle: "Procédure (autre parent)", href: "/procedure" },
  { cle: "enfants", libelle: "Enfants", href: "/enfants" },
  { cle: "jugement", libelle: "Le jugement", href: "/dossier/importer-pdf" },
] as const;

// Traduit l'état brut d'une carte en { couleur de pastille, texte court }.
function presentation(
  etat: EtatConfigurationDossier | null,
  cle: (typeof CARTES)[number]["cle"]
): { couleur: string; texte: string } {
  // Tant que la lecture n'est pas finie : repère neutre, pas de couleur de statut.
  if (etat === null) return { couleur: GRIS, texte: "…" };

  if (cle === "jugement") {
    if (etat.jugement === "analyse") return { couleur: VERT, texte: "Analysé" };
    if (etat.jugement === "a_valider") return { couleur: AMBRE, texte: "À valider" };
    return { couleur: AMBRE, texte: "À analyser" };
  }

  // Procédure et Enfants : même logique configuré / à configurer.
  const valeur = cle === "procedure" ? etat.procedure : etat.enfants;
  return valeur === "configure"
    ? { couleur: VERT, texte: "Configuré" }
    : { couleur: AMBRE, texte: "À configurer" };
}

export default function ConfigurationDossier() {
  // null = lecture en cours ; sinon, l'état des trois cartes.
  const [etat, setEtat] = useState<EtatConfigurationDossier | null>(null);

  useEffect(() => {
    let actif = true;
    getEtatConfigurationDossier().then((resultat) => {
      if (actif) setEtat(resultat);
    });
    // Évite de mettre à jour l'état si le composant est démonté entre-temps.
    return () => {
      actif = false;
    };
  }, []);

  return (
    <>
      <h2 className="font-display text-xl text-[#15233F]">Configuration du dossier</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CARTES.map((carte) => {
          const { couleur, texte } = presentation(etat, carte.cle);
          return (
            <Link
              key={carte.href}
              href={carte.href}
              className="carte flex flex-col items-center gap-2 rounded-xl bg-white px-4 py-4 text-center text-sm font-medium text-[#15233F] transition hover:bg-[#15233F]/5"
            >
              <span>{carte.libelle}</span>
              <span
                className="flex items-center gap-1.5 text-xs font-normal"
                style={{ color: couleur }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: couleur }}
                />
                {texte}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
