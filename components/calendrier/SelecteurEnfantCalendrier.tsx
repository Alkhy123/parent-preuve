"use client";

// Sélecteur d'enfant partagé par /calendrier et /calendrier/avance.
// Purement présentationnel : la logique de sélection reste dans la page.
// Configurable pour reproduire à l'identique les deux usages existants :
//   - /calendrier : en carte, label « Enfant concerné », microcopy prudente ;
//   - /calendrier/avance : bloc simple, label « Enfant ».

import type { ReactNode } from "react";
import { CHAMP_CALENDRIER, LABEL_CALENDRIER } from "@/components/calendrier/champs";

type EnfantOption = { id: string; prenom_ou_alias: string };

export default function SelecteurEnfantCalendrier({
  enfants,
  value,
  onChange,
  label = "Enfant",
  enCarte = false,
  aide,
}: {
  enfants: EnfantOption[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  enCarte?: boolean;
  aide?: ReactNode;
}) {
  const contenu = (
    <>
      <label className={LABEL_CALENDRIER}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={CHAMP_CALENDRIER}
      >
        {enfants.map((en) => (
          <option key={en.id} value={en.id}>
            {en.prenom_ou_alias}
          </option>
        ))}
      </select>
      {aide && (
        <p className="mt-2 text-xs" style={{ color: "var(--app-text-muted)" }}>
          {aide}
        </p>
      )}
    </>
  );

  if (!enCarte) return <div>{contenu}</div>;

  return (
    <div
      className="rounded-lg border p-4"
      style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
    >
      {contenu}
    </div>
  );
}
