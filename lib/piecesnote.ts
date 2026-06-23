// lib/piecesNote.ts
// Charge les pièces (documents + preuves photo) pour le bordereau, CLOISONNÉ en
// base sur la procédure active (procedure_id). Lecture seule, RLS auto.
import { supabase } from '@/lib/supabase'
import { getProcedureActiveId } from '@/lib/procedureActive'

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

  // Cloisonnement strict en base : sans procédure active, aucune pièce.
  const procId = await getProcedureActiveId()
  if (!procId) return liste

  const { data: docs } = await supabase
    .from('documents')
    .select('id, libelle, categorie, date_document, chemin_fichier, child_id')
    .eq('procedure_id', procId)
  if (docs) {
    for (const d of docs as {
      id: string
      libelle: string | null
      categorie: string | null
      date_document: string | null
      chemin_fichier: string | null
      child_id: string | null
    }[]) {
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
    .eq('procedure_id', procId)
  if (preuves) {
    for (const p of preuves as {
      id: string
      titre: string | null
      created_at: string | null
      storage_path: string | null
      type_fichier: string | null
      enfant_id: string | null
    }[]) {
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
