// lib/assemblerNote.ts
// Assemble sections actives + valeurs + résumés + bordereau en UN texte de brouillon.
import { sectionsActives, Volets } from '@/lib/structureNote'
import { PieceBordereau } from '@/lib/piecesnote'

function valeurSimple(
  id: string,
  valeurs: Record<string, string>,
  resumes: Record<string, string>
): string {
  const v = (valeurs[id] ?? '').trim()
  if (v) return v
  return (resumes[id] ?? '').trim()
}

export function assemblerNote(
  volets: Volets,
  valeurs: Record<string, string>,
  resumes: Record<string, string>,
  pieces: PieceBordereau[] = []
): string {
  const lignes: string[] = []
  lignes.push('NOTE DE SYNTHESE FACTUELLE')
  lignes.push('A transmettre a mon avocat - document de travail')
  lignes.push('')

  for (const section of sectionsActives(volets)) {
    lignes.push(section.titre.toUpperCase())
    for (const champ of section.champs) {
      if (champ.type === 'pieces' && champ.id === 'liste_pieces') {
        if (pieces.length === 0) {
          lignes.push(`${champ.libelle} : [aucune piece selectionnee]`)
        } else {
          lignes.push(`${champ.libelle} :`)
          pieces.forEach((p, i) => {
            const d = p.date ? ` (${p.date})` : ''
            lignes.push(`  Piece n°${i + 1} : ${p.libelle}${d}`)
          })
        }
        continue
      }
      if (champ.type === 'pieces') {
        lignes.push(`${champ.libelle} : voir le bordereau de pieces`)
        continue
      }
      const val = valeurSimple(champ.id, valeurs, resumes)
      lignes.push(`${champ.libelle} : ${val || '[a completer]'}`)
    }
    lignes.push('')
  }

  lignes.push('----------------------------------------')
  lignes.push(
    "Ce document est une aide a l'organisation factuelle du dossier. " +
      "Il ne constitue pas un conseil juridique et ne garantit pas " +
      "l'appreciation des pieces par le juge."
  )
  return lignes.join('\n')
}