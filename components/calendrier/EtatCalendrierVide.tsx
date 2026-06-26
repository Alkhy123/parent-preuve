"use client";

// États « chargement / aucun enfant » partagés par les pages calendrier.
// Standardise les messages sans changer leur sens métier.

export default function EtatCalendrierVide({
  chargement,
}: {
  chargement: boolean;
}) {
  if (chargement) {
    return (
      <p style={{ color: "var(--app-text-muted)" }}>
        Chargement de la procédure active…
      </p>
    );
  }
  return (
    <p style={{ color: "var(--app-text)" }}>
      Ajoutez d&apos;abord un enfant dans la rubrique « Enfants ».
    </p>
  );
}
