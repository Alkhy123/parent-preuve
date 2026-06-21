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
    <div className="rounded-xl border border-[#C2A24C]/50 bg-[#C2A24C]/10 p-4">
      <p className="text-sm font-medium text-navy">Document préparatoire</p>
      <p className="mt-1 text-sm text-texte">{AVERTISSEMENT_PREPARATOIRE}</p>
      <p className="mt-2 text-xs text-texte-doux">{MENTION_PIED}</p>
    </div>
  );
}
