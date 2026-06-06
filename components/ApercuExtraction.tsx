// components/ApercuExtraction.tsx
//
// Affiche, au-dessus d'une règle proposée par l'IA, ce que l'assistant a "lu" :
// son niveau de confiance et les passages du jugement qu'il a cités.
// Composant générique : il fonctionne pour les quatre sections (pension, frais,
// DVH, décision). Aucune écriture, purement informatif.

import type { Champ } from "@/lib/regleConvertisseurs";

export default function ApercuExtraction({
  champs,
}: {
  champs: Record<string, Champ>;
}) {
  // On ne regarde que les champs réellement remplis (valeur non nulle).
  const remplis = Object.values(champs).filter((c) => c.valeur !== null);

  const haute = remplis.filter((c) => c.confiance === "haute").length;
  const moyenne = remplis.filter((c) => c.confiance === "moyenne").length;

  // Citations uniques (un même passage peut servir à plusieurs champs).
  const citations = Array.from(
    new Set(
      remplis.map((c) => (c.citation ?? "").trim()).filter((t) => t.length > 0)
    )
  );

  // Rien de détecté pour cette règle : on le dit clairement.
  if (remplis.length === 0) {
    return (
      <p className="px-1 text-sm text-[#1F2733]/50">
        L'assistant n'a rien détecté pour cette règle dans votre description.
      </p>
    );
  }

  return (
    <details className="carte rounded-xl border border-[#C2A24C]/30 bg-white p-3 text-sm">
      <summary className="cursor-pointer text-[#15233F]">
        <span className="font-medium">Ce que l'assistant a lu</span>
        <span className="ml-2 rounded-full bg-[#0F6E56]/10 px-2 py-0.5 text-xs text-[#0F6E56]">
          confiance haute&nbsp;: {haute}
        </span>
        {moyenne > 0 && (
          <span className="ml-1 rounded-full bg-[#854F0B]/10 px-2 py-0.5 text-xs text-[#854F0B]">
            à revérifier&nbsp;: {moyenne}
          </span>
        )}
      </summary>

      {citations.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs uppercase tracking-wide text-[#9b833f]">
            Passages cités du jugement
          </p>
          {citations.map((c, i) => (
            <blockquote
              key={i}
              className="border-l-2 border-[#C2A24C] bg-[#F8F6F1] px-3 py-2 italic text-[#1F2733]"
            >
              « {c} »
            </blockquote>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#1F2733]/60">
          L'assistant n'a pas cité de passage précis pour cette règle. Vérifiez les
          valeurs proposées avec attention.
        </p>
      )}
    </details>
  );
}