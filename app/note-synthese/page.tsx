'use client'

import { useEffect, useState } from 'react'
import AppButtonLink from '@/components/app/AppButtonLink'
import AppCard from '@/components/app/AppCard'
import AppNotice from '@/components/app/AppNotice'
import AppShell from '@/components/app/AppShell'
import QuestionnaireAiguillage from '@/components/QuestionnaireAiguillage'
import FormulaireNote from '@/components/FormulaireNote'
import SelecteurPieces from '@/components/SelecteurPieces'
import BrouillonNote from '@/components/BrouillonNote'
import { voletsParDefaut, Volets } from '@/lib/structureNote'
import { prechargerNote, PrechargeNote, prechargeVide } from '@/lib/prechargerNote'
import { chargerPiecesDisponibles, PieceDisponible } from '@/lib/piecesnote'
import { chargerBrouillon, sauvegarderBrouillon } from '@/lib/brouillonStockage'

export default function PageNoteSynthese() {
  const [volets, setVolets] = useState<Volets>(voletsParDefaut())
  const [precharge, setPrecharge] = useState<PrechargeNote | null>(null)
  const [erreur, setErreur] = useState(false)
  const [valeurs, setValeurs] = useState<Record<string, string>>({})
  const [contenuInitial, setContenuInitial] = useState<string | null>(null)

  const [piecesDispo, setPiecesDispo] = useState<PieceDisponible[]>([])
  const [piecesIds, setPiecesIds] = useState<string[]>([])

  useEffect(() => {
    let actif = true
    Promise.all([prechargerNote(), chargerBrouillon()])
      .then(([p, b]) => {
        if (!actif) return
        setPrecharge(p)
        if (b) {
          if (b.volets) setVolets(b.volets)
          setValeurs({ ...p.valeurs, ...(b.valeurs ?? {}) })
          if (b.pieces_ids) setPiecesIds(b.pieces_ids)
          setContenuInitial(b.contenu || null)
        } else {
          setValeurs((prev) => ({ ...p.valeurs, ...prev }))
        }
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

  async function sauvegarder(contenu: string) {
    return sauvegarderBrouillon({ contenu, volets, valeurs, piecesIds })
  }

  const piecesBordereau = piecesIds
    .map((id) => piecesDispo.find((p) => p.id === id))
    .filter((p): p is PieceDisponible => Boolean(p))

  return (
    <AppShell
      titre="Note de synthese"
      description="Construire une synthese courte, structuree et factuelle a partir des informations du dossier."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter/note-synthese" variant="secondary">
            Retour Exporter
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <QuestionnaireAiguillage volets={volets} onChange={setVolets} />

        {precharge === null ? (
          <p className="text-sm text-[var(--app-text-muted)]">
            Chargement de vos données...
          </p>
        ) : (
          <>
            {erreur && (
              <AppNotice titre="Données incomplètes">
                <p>
                  Certaines données n&apos;ont pas pu être chargées. Vous pouvez
                  tout de même remplir la note manuellement.
                </p>
              </AppNotice>
            )}

            <FormulaireNote
              volets={volets}
              precharge={precharge}
              valeurs={valeurs}
              onChange={majChamp}
            />

            <AppCard titre="Bordereau de pièces">
              <SelecteurPieces
                disponibles={piecesDispo}
                selection={piecesIds}
                onChange={setPiecesIds}
              />
            </AppCard>

            <AppCard titre="Brouillon et export">
              <BrouillonNote
                volets={volets}
                valeurs={valeurs}
                resumes={precharge.resumes}
                pieces={piecesBordereau}
                contenuInitial={contenuInitial}
                onSauvegarder={sauvegarder}
              />
            </AppCard>
          </>
        )}

        <AppNotice titre="Rappel important">
          <p>
            Ce document est une aide à l&apos;organisation factuelle du dossier.
            Il ne constitue pas un conseil juridique et ne garantit pas
            l&apos;appréciation des pièces par le juge. À relire avant usage.
          </p>
        </AppNotice>
      </div>
    </AppShell>
  )
}
