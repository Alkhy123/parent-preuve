"use client";

// Sélecteur de zone de vacances scolaires (A/B/C), présentationnel.
// Le stockage localStorage et la valeur restent gérés par la page appelante :
// ce composant ne fait qu'afficher le menu et le texte d'aide.

import { CHAMP_CALENDRIER, LABEL_CALENDRIER } from "@/components/calendrier/champs";

export default function SelecteurZoneVacances({
  value,
  onChange,
}: {
  value: string;
  onChange: (zone: string) => void;
}) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
    >
      <label className={LABEL_CALENDRIER}>Zone de vacances scolaires</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={CHAMP_CALENDRIER}
      >
        <option value="A">Zone A</option>
        <option value="B">Zone B</option>
        <option value="C">Zone C</option>
      </select>
      <p className="mt-1 text-xs" style={{ color: "var(--app-text-muted)" }}>
        Zone A : Besançon, Bordeaux, Clermont-Ferrand, Dijon, Grenoble, Limoges,
        Lyon, Poitiers. Zone B : Aix-Marseille, Amiens, Lille, Nancy-Metz, Nantes,
        Nice, Orléans-Tours, Reims, Rennes, Rouen, Strasbourg. Zone C : Créteil,
        Montpellier, Paris, Toulouse, Versailles.
      </p>
    </div>
  );
}
