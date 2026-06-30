"use client";

// components/onboarding/InvitationOnboarding.tsx
//
// Enveloppe de l'assistant de premiere utilisation : invitation claire,
// non bloquante. Aucun wizard ici (bloc ulterieur), aucune ecriture en base,
// aucun appel IA.

import { useRouter } from "next/navigation";

// Etapes presentees a l'utilisateur (informatif, pas de promesse juridique).
const ETAPES = [
  "Vos informations de déclarant",
  "L'autre parent et la procédure",
  "Les enfants concernés",
  "Le jugement et les règles qui en découlent",
  "Le calendrier de garde",
];

export default function InvitationOnboarding({
  onDemarrer,
}: {
  // Demarre le wizard. Si absent, on retombe sur la premiere etape concrete.
  onDemarrer?: () => void;
} = {}) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
      <p className="text-sm text-[var(--app-text-muted)]">
        L&apos;assistant de démarrage vous aide à préparer un dossier clair : vos
        informations, l&apos;autre parent, les enfants, la procédure, le jugement,
        les règles et le calendrier de garde. Vous pourrez vérifier chaque élément
        avant validation.
      </p>

      <h2 className="mt-5 font-display text-lg text-navy">Les étapes à venir</h2>
      <ol className="mt-3 space-y-2">
        {ETAPES.map((etape, i) => (
          <li key={etape} className="flex items-start gap-3 text-sm text-[var(--app-text)]">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--app-text)] text-xs font-medium text-[var(--app-surface)]"
            >
              {i + 1}
            </span>
            <span>{etape}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => (onDemarrer ? onDemarrer() : router.push("/dossier"))}
          className="btn justify-center bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
        >
          Démarrer l&apos;assistant
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn justify-center border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
        >
          Passer pour le moment
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--app-text-muted)]">
        Vous pouvez passer cette étape : l&apos;invitation restera disponible sur
        votre accueil tant que l&apos;assistant n&apos;est pas terminé.
      </p>
    </div>
  );
}
