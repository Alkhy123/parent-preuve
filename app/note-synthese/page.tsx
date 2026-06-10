'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import QuestionnaireAiguillage from '@/components/QuestionnaireAiguillage'
import FormulaireNote from '@/components/FormulaireNote'
import SelecteurPieces from '@/components/SelecteurPieces'
import BrouillonNote from '@/components/BrouillonNote'
import { voletsParDefaut } from '@/lib/structureNote'
import { prechargerNote, PrechargeNote, prechargeVide } from '@/lib/prechargerNote'
import { chargerPiecesDisponibles, PieceDisponible } from '@/lib/piecesnote'

export default function PageNoteSynthese() {
  const [volets, setVolets] = useState(voletsParDefaut())
  const [precharge, setPrecharge] = useState<PrechargeNote | null>(null)
  const [erreur, setErreur] = useState(false)
  const [valeurs, setValeurs] = useState<Record<string, string>>({})

  const [piecesDispo, setPiecesDispo] = useState<PieceDisponible[]>([])
  const [piecesIds, setPiecesIds] = useState<string[]>([])

  useEffect(() => {
    let actif = true
    prechargerNote()
      .then((p) => {
        if (!actif) return
        setPrecharge(p)
        setValeurs((prev) => ({ ...p.valeurs, ...prev }))
      })
      .catch(() => {
        if (!actif) return
        setPrecharge(prechargeVide)
        setErreur(true)
      })
    chargerPiecesDisponibles()
      .then((liste) => { if (actif) setPiecesDispo(liste) })
      .catch(() => {})
    return () => { actif = false }
  }, [])

  function majChamp(id: string, val: string) {
    setValeurs((v) => ({ ...v, [id]: val }))
  }

  const piecesBordereau = piecesIds
    .map((id) => piecesDispo.find((p) => p.id === id))
    .filter((p): p is PieceDisponible => Boolean(p))

  return (
    <main className="min-h-screen">
      <PageHeader
        eyebrow="Production"
        title="Note de synthèse pour l'avocat"
        subtitle="Remplissez les sections, choisissez les pièces, générez un brouillon, puis exportez en PDF."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <QuestionnaireAiguillage volets={volets} onChange={setVolets} />

        {precharge === null ? (
          <p className="text-sm text-[#1F2733]/60">Chargement de vos données…</p>
        ) : (
          <>
            {erreur && (
              <div className="rounded-lg border border-[#8A5A12]/30 bg-[#8A5A12]/5 px-3 py-2 text-sm text-[#8A5A12]">
                Certaines données n'ont pas pu être chargées. Vous pouvez tout de même remplir la note manuellement.
              </div>
            )}

            <FormulaireNote volets={volets} precharge={precharge} valeurs={valeurs} onChange={majChamp} />

            <div className="rounded-xl bg-[#F8F6F1] p-5 carte space-y-3">
              <h2 className="font-display text-lg text-[#15233F]">Bordereau de pièces</h2>
              <SelecteurPieces disponibles={piecesDispo} selection={piecesIds} onChange={setPiecesIds} />
            </div>

            <div className="rounded-xl bg-[#F8F6F1] p-5 carte space-y-3">
              <h2 className="font-display text-lg text-[#15233F]">Brouillon et export</h2>
              <BrouillonNote volets={volets} valeurs={valeurs} resumes={precharge.resumes} pieces={piecesBordereau} />
            </div>
          </>
        )}

        <p className="text-xs text-[#1F2733]/60">
          Ce document est une aide à l'organisation factuelle du dossier. Il ne constitue pas un
          conseil juridique et ne garantit pas l'appréciation des pièces par le juge.
        </p>
      </div>
    </main>
  )
}