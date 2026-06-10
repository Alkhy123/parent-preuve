'use client'

import { useState } from 'react'
import { Volets } from '@/lib/structureNote'
import { PieceDisponible } from '@/lib/piecesnote'
import { assemblerNote } from '@/lib/assemblerNote'
import { genererPdfNote } from '@/lib/exportNotePdf'

export default function BrouillonNote({
  volets,
  valeurs,
  resumes,
  pieces,
}: {
  volets: Volets
  valeurs: Record<string, string>
  resumes: Record<string, string>
  pieces: PieceDisponible[]
}) {
  const [brouillon, setBrouillon] = useState<string | null>(null)
  const [enExport, setEnExport] = useState(false)
  const [erreur, setErreur] = useState('')

  function genererOuRegenerer() {
    if (
      brouillon !== null &&
      !window.confirm('Régénérer remplacera vos modifications manuelles du brouillon. Continuer ?')
    ) {
      return
    }
    setBrouillon(assemblerNote(volets, valeurs, resumes, pieces))
  }

  async function telechargerPdf() {
    if (brouillon === null) return
    setEnExport(true)
    setErreur('')
    try {
      const blob = await genererPdfNote(brouillon, pieces)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'note-synthese.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setErreur("L'export a échoué. Réessayez ; si le problème persiste, retirez la dernière pièce ajoutée.")
    } finally {
      setEnExport(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={genererOuRegenerer}
          className="rounded-md bg-[#15233F] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d2f54]"
        >
          {brouillon === null ? 'Générer le brouillon éditable' : 'Régénérer depuis les champs'}
        </button>
        {brouillon !== null && (
          <button
            type="button"
            onClick={telechargerPdf}
            disabled={enExport}
            className="rounded-md border border-[#15233F] px-4 py-2 text-sm font-medium text-[#15233F] hover:bg-[#F8F6F1] disabled:opacity-50"
          >
            {enExport ? 'Génération du PDF…' : 'Télécharger en PDF (avec pièces)'}
          </button>
        )}
      </div>

      {erreur && <p className="text-sm text-[#9B2C2C]">{erreur}</p>}

      {brouillon !== null && (
        <>
          <p className="text-xs text-[#1F2733]/60">
            Modifiez librement ce brouillon avant de l'exporter. Le PDF reprend le texte ci-dessous,
            suivi des pièces du bordereau dans l'ordre choisi.
          </p>
          <textarea
            value={brouillon}
            onChange={(e) => setBrouillon(e.target.value)}
            rows={24}
            className="w-full rounded-lg border border-[#15233F]/20 bg-white px-3 py-2 text-sm font-mono leading-relaxed focus:border-[#15233F] focus:outline-none"
          />
        </>
      )}
    </div>
  )
}