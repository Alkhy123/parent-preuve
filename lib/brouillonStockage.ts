// lib/brouillonStockage.ts
// Charge / enregistre le brouillon de note (1 ligne par utilisateur, RLS).
import { supabase } from '@/lib/supabase'
import { Volets } from '@/lib/structureNote'

export type BrouillonEnregistre = {
  contenu: string
  volets: Volets | null
  valeurs: Record<string, string> | null
  pieces_ids: string[] | null
}

export async function chargerBrouillon(): Promise<BrouillonEnregistre | null> {
  const { data, error } = await supabase
    .from('note_brouillon')
    .select('contenu, volets, valeurs, pieces_ids')
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return {
    contenu: data.contenu ?? '',
    volets: (data.volets as Volets) ?? null,
    valeurs: (data.valeurs as Record<string, string>) ?? null,
    pieces_ids: (data.pieces_ids as string[]) ?? null,
  }
}

export async function sauvegarderBrouillon(params: {
  contenu: string
  volets: Volets
  valeurs: Record<string, string>
  piecesIds: string[]
}): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return false

  const { error } = await supabase.from('note_brouillon').upsert(
    {
      user_id: userId,
      contenu: params.contenu,
      volets: params.volets,
      valeurs: params.valeurs,
      pieces_ids: params.piecesIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  return !error
}