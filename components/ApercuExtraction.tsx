// components/ApercuExtraction.tsx
//
// Affiche, au-dessus d'une règle proposée par l'IA, ce que l'assistant a "lu" :
// le détail champ par champ (libellé, valeur, niveau de confiance) et les
// passages du jugement qu'il a cités. Composant générique : il fonctionne pour
// les quatre sections. Aucune écriture, purement informatif.

import type { Champ } from "@/lib/regleConvertisseurs";

// Valeur courte et lisible pour une puce (ex. true -> "oui", 180 -> "180").
function formatValeur(v: number | string | boolean | null): string {
  if (v === true) return "oui";
  if (v === false) return "non";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v.length > 32 ? v.slice(0, 32) + "…" : v;
  return "";
}

export default function ApercuExtraction({
  champs,
  libelles = {},
}: {
  champs: Record<string, Champ>;
  libelles?: Record<string, string>;
}) {
  // On ne garde que les champs réellement remplis (valeur non nulle).
  const remplis = Object.entries(champs).filter(([, c]) => c.valeur !== null);

  const haute = remplis.filter(([, c]) => c.confiance === "haute").length;
  const moyenne = remplis.filter(([, c]) => c.confiance === "moyenne").length;

  // Citations uniques (un même passage peut servir à plusieurs champs).
  const citations = Array.from(
    new Set(
      remplis.map(([, c]) => (c.citation ?? "").trim()).filter((t) => t.length > 0)
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
    <details open={moyenne > 0} className="carte rounded-xl border border-[#C2A24C]/30 bg-white p-3 text-sm">
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

      {/* Détail champ par champ */}
      <p className="mt-3 text-xs uppercase tracking-wide text-[#9b833f]">
        Détail des valeurs proposées
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {remplis.map(([cle, c]) => {
          const libelle = libelles[cle] ?? cle;
          const valeur = formatValeur(c.valeur);
          const estHaute = c.confiance === "haute";
          return (
            <span
              key={cle}
              className={
                "rounded px-2 py-1 text-xs " +
                (estHaute
                  ? "bg-[#0F6E56]/10 text-[#0F6E56]"
                  : "bg-[#854F0B]/10 text-[#854F0B]")
              }
              title={estHaute ? "Confiance haute" : "À revérifier (confiance moyenne)"}
            >
              {libelle}
              {valeur ? ` : ${valeur}` : ""}
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[#1F2733]/50">
        Vert : confiance haute · Ambre : à revérifier. Les valeurs restent modifiables
        dans le formulaire ci-dessous.
      </p>

      {/* Passages cités */}
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