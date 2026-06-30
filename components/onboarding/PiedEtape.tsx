"use client";

// components/onboarding/PiedEtape.tsx
//
// Pied de page commun a chaque etape du wizard : "Precedent" + action
// principale ("Continuer" ou libelle personnalise). Centralise le style pour
// que toutes les etapes restent coherentes.

export type EtapeProps = {
  onContinuer: () => void;
  onPrecedent: () => void;
  estPremiere: boolean;
  estDerniere: boolean;
};

export default function PiedEtape({
  onPrecedent,
  estPremiere,
  onContinuer,
  libelleContinuer = "Continuer",
  continuerDesactive = false,
  occupe = false,
}: {
  onPrecedent: () => void;
  estPremiere: boolean;
  onContinuer: () => void;
  libelleContinuer?: string;
  continuerDesactive?: boolean;
  occupe?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrecedent}
        disabled={estPremiere || occupe}
        className="btn text-[var(--app-text-muted)] hover:bg-black/5 hover:text-[var(--app-text)] disabled:opacity-40"
      >
        Précédent
      </button>
      <button
        type="button"
        onClick={onContinuer}
        disabled={continuerDesactive || occupe}
        className="btn bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90 disabled:opacity-50"
      >
        {occupe ? "Enregistrement…" : libelleContinuer}
      </button>
    </div>
  );
}
