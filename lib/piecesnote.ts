// lib/piecesNote.ts
// Charge les pièces (documents + preuves photo) pour le bordereau, CLOISONNÉ sur la
// procédure active (enfant de la procédure, ou pièce sans enfant = générale).
// Lecture seule, RLS auto.
import { supabase } from '@/lib/supabase'
import { getEnfantsDeProcedureActive } from '@/lib/procedureActive'

export type PieceDisponible = {
  id: string
  origine: 'document' | 'preuve'
  libelle: string
  date: string
  categorie: string
  bucket: 'justificatifs' | 'preuves'
  cheminStockage: string
  typeFichier: string // mime si connu, sinon ''
}

// Sous-ensemble utilisé par l'assembleur de texte.
export type PieceBordereau = { libelle: string; date: string; categorie: string }

export async function chargerPiecesDisponibles(): Promise<PieceDisponible[]> {
  const liste: PieceDisponible[] = []

  const enfants = await getEnfantsDeProcedureActive()
  const idsProc = new Set(enfants.map((e) => e.id))
  const garde = (cid: string | null) => cid === null || idsProc.has(cid)

  const { data: docs } = await supabase
    .from('documents')
    .select('id, libelle, categorie, date_document, chemin_fichier, child_id')
  if (docs) {
    for (const d of docs as any[]) {
      if (!garde(d.child_id ?? null)) continue
      liste.push({
        id: d.id,
        origine: 'document',
        libelle: d.libelle || 'Document sans titre',
        date: (d.date_document ?? '').slice(0, 10),
        categorie: d.categorie || 'Document',
        bucket: 'justificatifs',
        cheminStockage: d.chemin_fichier || '',
        typeFichier: '',
      })
    }
  }

  const { data: preuves } = await supabase
    .from('preuves_photo')
    .select('id, titre, created_at, storage_path, type_fichier, enfant_id')
  if (preuves) {
    for (const p of preuves as any[]) {
      if (!garde(p.enfant_id ?? null)) continue
      liste.push({
        id: p.id,
        origine: 'preuve',
        libelle: p.titre || 'Preuve photo',
        date: (p.created_at ?? '').slice(0, 10),
        categorie: 'Preuve photo',
        bucket: 'preuves',
        cheminStockage: p.storage_path || '',
        typeFichier: p.type_fichier || '',
      })
    }
  }

  return liste
}
