// lib/exportNotePdf.ts
// Construit le PDF final : note (texte) + pièces jointes (images natives, PDF fusionnés).
// Fichiers récupérés via URL signée 60 s. Aucun log de contenu.
import { jsPDF } from 'jspdf'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { supabase } from '@/lib/supabase'
import { PieceDisponible } from '@/lib/piecesnote'

// Convertit la ponctuation « intelligente » (guillemets courbes, tirets longs, …, œ, €)
// en équivalents sûrs et conserve les accents (Latin-1). Sécurise jsPDF ET pdf-lib.
function versWinAnsi(t: string): string {
  return (t || '')
    .replace(/[\u2018\u2019\u201A\u2039\u203A]/g, "'")
    .replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u20AC/g, 'EUR')
    .replace(/\u0153/g, 'oe')
    .replace(/\u0152/g, 'OE')
    .replace(/[^\x00-\xFF]/g, '')
}

// La note (texte) rendue par jsPDF en Times, avec numéros de page. Renvoyée en octets.
function pdfNoteTexte(brouillon: string): ArrayBuffer {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margeX = 56, margeHaut = 64, margeBas = 56, interligne = 15
  const largeur = doc.internal.pageSize.getWidth() - margeX * 2
  const hauteur = doc.internal.pageSize.getHeight()

  doc.setFont('times', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(20)

  let y = margeHaut
  for (const ligne of brouillon.split('\n')) {
    const propre = versWinAnsi(ligne)
    const morceaux = doc.splitTextToSize(propre === '' ? ' ' : propre, largeur)
    for (const m of morceaux) {
      if (y + interligne > hauteur - margeBas) { doc.addPage(); y = margeHaut }
      doc.text(m, margeX, y)
      y += interligne
    }
  }

  // Numéros de page sur les pages de la note
  const n = doc.getNumberOfPages()
  for (let i = 1; i <= n; i++) {
    doc.setPage(i)
    doc.setFont('times', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(`Page ${i} / ${n}`, doc.internal.pageSize.getWidth() - margeX, hauteur - 28, { align: 'right' })
  }

  return doc.output('arraybuffer')
}

type Fichier = { bytes: Uint8Array; kind: 'pdf' | 'jpg' | 'png' | 'autre' }

function detecterKind(p: PieceDisponible): Fichier['kind'] {
  const t = (p.typeFichier || '').toLowerCase()
  const ext = (p.cheminStockage.split('.').pop() || '').toLowerCase()
  if (t.includes('pdf') || ext === 'pdf') return 'pdf'
  if (t.includes('png') || ext === 'png') return 'png'
  if (t.includes('jpeg') || t.includes('jpg') || ext === 'jpg' || ext === 'jpeg') return 'jpg'
  return 'autre'
}

async function octetsPiece(p: PieceDisponible): Promise<Fichier | null> {
  if (!p.cheminStockage) return null
  try {
    const { data, error } = await supabase.storage.from(p.bucket).createSignedUrl(p.cheminStockage, 60)
    if (error || !data?.signedUrl) return null
    const resp = await fetch(data.signedUrl)
    if (!resp.ok) return null
    return { bytes: new Uint8Array(await resp.arrayBuffer()), kind: detecterKind(p) }
  } catch {
    return null
  }
}

export async function genererPdfNote(brouillon: string, pieces: PieceDisponible[]): Promise<Blob> {
  const merged = await PDFDocument.load(pdfNoteTexte(brouillon))
  const police = await merged.embedFont(StandardFonts.TimesRoman)
  const policeGras = await merged.embedFont(StandardFonts.TimesRomanBold)

  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i]
    const inter = merged.addPage()
    const { height } = inter.getSize()
    inter.drawText(`Pièce n°${i + 1}`, { x: 56, y: height - 90, size: 18, font: policeGras, color: rgb(0.08, 0.14, 0.25) })
    inter.drawText(versWinAnsi(p.libelle), { x: 56, y: height - 116, size: 12, font: police, color: rgb(0.12, 0.15, 0.2) })

    const f = await octetsPiece(p)
    if (!f) {
      inter.drawText('(fichier indisponible)', { x: 56, y: height - 146, size: 11, font: police, color: rgb(0.6, 0.17, 0.17) })
      continue
    }

    try {
      if (f.kind === 'pdf') {
        const src = await PDFDocument.load(f.bytes)
        const copies = await merged.copyPages(src, src.getPageIndices())
        copies.forEach((pg) => merged.addPage(pg))
      } else if (f.kind === 'jpg' || f.kind === 'png') {
        const img = f.kind === 'jpg' ? await merged.embedJpg(f.bytes) : await merged.embedPng(f.bytes)
        const page = merged.addPage()
        const pw = page.getWidth(), ph = page.getHeight(), m = 40
        const ratio = Math.min((pw - m * 2) / img.width, (ph - m * 2) / img.height, 1)
        const w = img.width * ratio, h = img.height * ratio
        page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h })
      } else {
        inter.drawText('(aperçu non pris en charge pour ce type de fichier)', { x: 56, y: height - 146, size: 11, font: police, color: rgb(0.54, 0.35, 0.07) })
      }
    } catch {
      inter.drawText('(fichier illisible ou protégé)', { x: 56, y: height - 146, size: 11, font: police, color: rgb(0.6, 0.17, 0.17) })
    }
  }

  const out = await merged.save()
  const copie = new Uint8Array(out.length)
  copie.set(out)
  return new Blob([copie], { type: 'application/pdf' })
}