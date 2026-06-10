'use client'

import { PieceDisponible } from '@/lib/piecesnote'

export default function SelecteurPieces({
  disponibles,
  selection,
  onChange,
}: {
  disponibles: PieceDisponible[]
  selection: string[]            // ids, dans l'ordre du bordereau
  onChange: (ids: string[]) => void
}) {
  const estChoisie = (id: string) => selection.includes(id)

  function ajouter(id: string) {
    if (!estChoisie(id)) onChange([...selection, id])
  }
  function retirer(id: string) {
    onChange(selection.filter((x) => x !== id))
  }
  function deplacer(index: number, sens: -1 | 1) {
    const cible = index + sens
    if (cible < 0 || cible >= selection.length) return
    const copie = [...selection]
    ;[copie[index], copie[cible]] = [copie[cible], copie[index]]
    onChange(copie)
  }

  const choisies = selection
    .map((id) => disponibles.find((p) => p.id === id))
    .filter((p): p is PieceDisponible => Boolean(p))

  return (
    <div className="space-y-5">
      {/* Pièces disponibles */}
      <div>
        <h3 className="text-sm font-medium text-[#15233F] mb-2">Pièces disponibles</h3>
        {disponibles.length === 0 ? (
          <p className="text-sm text-[#1F2733]/60">
            Aucune pièce. Ajoutez d'abord des documents ou des preuves dans le dossier.
          </p>
        ) : (
          <ul className="space-y-2">
            {disponibles.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#15233F]/15 bg-white px-3 py-2"
              >
                <span className="text-sm text-[#1F2733]">
                  {p.libelle}
                  <span className="text-[#1F2733]/55"> · {p.categorie}{p.date ? ` · ${p.date}` : ''}</span>
                </span>
                {estChoisie(p.id) ? (
                  <span className="text-xs text-[#2E6A4D]">Ajoutée ✓</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => ajouter(p.id)}
                    className="rounded-md border border-[#15233F]/25 px-2 py-1 text-xs text-[#15233F] hover:bg-[#F8F6F1]"
                  >
                    Ajouter +
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bordereau (ordre d'apparition) */}
      <div>
        <h3 className="text-sm font-medium text-[#15233F] mb-2">Bordereau (ordre d'apparition)</h3>
        {choisies.length === 0 ? (
          <p className="text-sm text-[#1F2733]/60">Aucune pièce sélectionnée.</p>
        ) : (
          <ul className="space-y-2">
            {choisies.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#15233F]/15 bg-[#F8F6F1] px-3 py-2"
              >
                <span className="text-sm text-[#1F2733]">
                  <strong>Pièce n°{i + 1}</strong> — {p.libelle}
                </span>
                <span className="flex items-center gap-1">
                  <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0}
                    className="rounded border border-[#15233F]/20 px-2 py-0.5 text-xs text-[#15233F] disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => deplacer(i, 1)} disabled={i === choisies.length - 1}
                    className="rounded border border-[#15233F]/20 px-2 py-0.5 text-xs text-[#15233F] disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => retirer(p.id)}
                    className="rounded border border-[#9B2C2C]/30 px-2 py-0.5 text-xs text-[#9B2C2C] hover:bg-[#9B2C2C]/5">Retirer</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}