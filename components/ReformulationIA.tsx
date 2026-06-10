'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { enteteAuth } from '@/lib/enteteAuth'

// Petit panneau de reformulation, par champ.
// Gère lui-même : vérification du consentement, écran de consentement si besoin,
// appel de la route existante /api/ia/reformuler, puis validation humaine.
export default function ReformulationIA({
  texte,
  onAccepter,
}: {
  texte: string
  onAccepter: (nouveau: string) => void
}) {
  const [ouvert, setOuvert] = useState(false)
  const [consenti, setConsenti] = useState<boolean | null>(null)
  const [enregistrement, setEnregistrement] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [proposition, setProposition] = useState('')
  const [erreur, setErreur] = useState('')

  async function ouvrir() {
    setOuvert(true)
    setErreur('')
    setProposition('')
    if (consenti === null) {
      const { data, error } = await supabase
        .from('consentements_ia')
        .select('id')
        .eq('fonctionnalite', 'reformulation')
        .limit(1)
        .maybeSingle()
      if (error) { setErreur('Impossible de vérifier le consentement.'); setConsenti(false); return }
      setConsenti(data !== null)
    }
  }

  async function accepterConsentement() {
    setEnregistrement(true); setErreur('')
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) { setErreur('Session expirée, reconnectez-vous.'); setEnregistrement(false); return }
    const { error } = await supabase
      .from('consentements_ia')
      .insert({ user_id: userId, fonctionnalite: 'reformulation' })
    setEnregistrement(false)
    if (error) { setErreur("Impossible d'enregistrer le consentement."); return }
    setConsenti(true)
  }

  async function lancer() {
    if (!texte.trim()) { setErreur('Le champ est vide.'); return }
    setEnCours(true); setErreur(''); setProposition('')
    try {
      const reponse = await fetch('/api/ia/reformuler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await enteteAuth()) },
        body: JSON.stringify({ texte }),
      })
      const data = await reponse.json()
      if (!reponse.ok) { setErreur(data.erreur ?? 'Une erreur est survenue.'); return }
      setProposition(data.reformule)
    } catch {
      setErreur('Connexion impossible. Réessayez.')
    } finally {
      setEnCours(false)
    }
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={ouvrir}
        className="mt-1 rounded-md border border-[#15233F]/25 px-2 py-1 text-xs text-[#15233F] hover:bg-[#F8F6F1]"
      >
        Reformuler avec l'IA
      </button>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-[#C2A24C]/50 bg-white p-3 text-sm space-y-3">
      {consenti === null && <p className="text-[#1F2733]/60">Vérification…</p>}

      {consenti === false && (
        <div className="space-y-2">
          <p className="text-[#1F2733] leading-relaxed">
            Le texte de ce champ sera envoyé à <strong>Mistral AI</strong> (société française,
            serveurs en Union européenne) pour produire une version neutre. Seul ce texte est
            transmis ; il n'est pas utilisé pour entraîner les modèles. N'y faites pas figurer de
            données de santé ni d'extraits de jugement. L'IA propose, vous validez.
          </p>
          {erreur && <p className="text-[#9B2C2C]">{erreur}</p>}
          <button
            type="button"
            onClick={accepterConsentement}
            disabled={enregistrement}
            className="rounded-md bg-[#15233F] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1d2f54] disabled:opacity-50"
          >
            {enregistrement ? 'Enregistrement…' : "J'ai compris et j'accepte"}
          </button>
        </div>
      )}

      {consenti === true && (
        <div className="space-y-2">
          {!proposition && (
            <button
              type="button"
              onClick={lancer}
              disabled={enCours || !texte.trim()}
              className="rounded-md bg-[#15233F] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1d2f54] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enCours ? 'Reformulation en cours…' : 'Lancer la reformulation'}
            </button>
          )}

          {erreur && <p className="text-[#9B2C2C]">{erreur}</p>}

          {proposition && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#15233F]">Proposition neutre (à valider) :</p>
              <p className="whitespace-pre-wrap rounded-md bg-[#F8F6F1] p-2 text-[#1F2733]">
                {proposition}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { onAccepter(proposition); setOuvert(false) }}
                  className="rounded-md bg-[#2E6A4D] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  Remplacer mon texte
                </button>
                <button
                  type="button"
                  onClick={() => setProposition('')}
                  className="rounded-md border border-[#15233F]/25 px-3 py-1.5 text-xs text-[#15233F] hover:bg-[#F8F6F1]"
                >
                  Relancer
                </button>
                <button
                  type="button"
                  onClick={() => setOuvert(false)}
                  className="rounded-md border border-[#15233F]/25 px-3 py-1.5 text-xs text-[#15233F] hover:bg-[#F8F6F1]"
                >
                  Garder mon texte
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {consenti !== null && !proposition && (
        <button type="button" onClick={() => setOuvert(false)} className="text-xs text-[#15233F]/60 underline">
          Fermer
        </button>
      )}
    </div>
  )
}