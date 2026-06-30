// components/avocat/AvertissementDocumentPreparatoire.tsx
//
// Encart d'avertissement obligatoire du "Dossier de transmission a l'avocat".
// Document preparatoire factuel : ni conseil juridique, ni conclusions.

import {
  AVERTISSEMENT_PREPARATOIRE,
  MENTION_PIED,
} from "@/lib/avocat/rendreDossierAvocat";

export default function AvertissementDocumentPreparatoire() {
  return (
    <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">Document préparatoire</p>
      <p className="mt-1 text-sm text-[var(--app-text)]">{AVERTISSEMENT_PREPARATOIRE}</p>
      <p className="mt-2 text-xs text-[var(--app-text-muted)]">{MENTION_PIED}</p>
    </div>
  );
}
