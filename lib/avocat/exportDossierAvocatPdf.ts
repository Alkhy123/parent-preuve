// lib/avocat/exportDossierAvocatPdf.ts
//
// Export PDF du "Dossier de transmission a l'avocat".
// Consomme le rendu neutre (sections -> blocs) de rendreDossierAvocat.
// Meme moteur que le reste du projet : jsPDF + jspdf-autotable. N'altere PAS
// lib/exportNotePdf.ts.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { RenduDossierAvocat, SectionRendue } from "@/lib/avocat/types";

// Couleurs de marque.
const NAVY: [number, number, number] = [21, 35, 63]; // #15233F
const GRIS: [number, number, number] = [90, 100, 115]; // #5A6473
const TEXTE: [number, number, number] = [31, 39, 51]; // #1F2733

// jsPDF + autotable expose lastAutoTable.finalY pour enchainer les tableaux.
type DocAvecTable = jsPDF & { lastAutoTable?: { finalY: number } };

// Convertit la ponctuation "intelligente" en equivalents surs pour la police
// WinAnsi de jsPDF (on garde accents et le symbole euro).
function safe(t: string): string {
  return (t || "")
    .replace(/[‘’‚‹›]/g, "'")
    .replace(/[“”„«»]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/•/g, "-")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE");
}

const MARGE_X = 14;
const MARGE_HAUT = 18;
const MARGE_BAS = 18;

export function genererPdfDossierAvocat(rendu: RenduDossierAvocat): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largeurPage = doc.internal.pageSize.getWidth();
  const hauteurPage = doc.internal.pageSize.getHeight();
  const largeurTexte = largeurPage - MARGE_X * 2;
  let y = MARGE_HAUT;

  function saut(h: number) {
    if (y + h > hauteurPage - MARGE_BAS) {
      doc.addPage();
      y = MARGE_HAUT;
    }
  }

  function ecrireLignes(
    texte: string,
    taille: number,
    couleur: [number, number, number],
    interligne: number
  ) {
    doc.setFontSize(taille);
    doc.setTextColor(couleur[0], couleur[1], couleur[2]);
    const morceaux = doc.splitTextToSize(safe(texte), largeurTexte);
    for (const m of morceaux) {
      saut(interligne);
      doc.text(m, MARGE_X, y);
      y += interligne;
    }
  }

  function ecrireSection(section: SectionRendue) {
    // Titre de section.
    saut(10);
    y += 2;
    doc.setFont("helvetica", "bold");
    ecrireLignes(section.titre, 13, NAVY, 6);
    doc.setFont("helvetica", "normal");
    y += 1;

    for (const bloc of section.blocs) {
      if (bloc.type === "paragraphe") {
        ecrireLignes(bloc.texte, 10, TEXTE, 5);
        y += 1;
      } else if (bloc.type === "champs") {
        for (const c of bloc.champs) {
          ecrireLignes(`${c.label} : ${c.valeur}`, 10, TEXTE, 5);
        }
        y += 1;
      } else {
        // tableau
        autoTable(doc, {
          startY: y,
          head: [bloc.entetes.map(safe)],
          body: bloc.lignes.map((l) => l.map(safe)),
          styles: { fontSize: 8, cellPadding: 2, valign: "top", textColor: TEXTE },
          headStyles: { fillColor: NAVY, textColor: [255, 255, 255] },
          margin: { left: MARGE_X, right: MARGE_X },
        });
        const finalY = (doc as DocAvecTable).lastAutoTable?.finalY;
        y = (finalY != null ? finalY : y) + 4;
      }
    }
  }

  for (const section of rendu.sections) ecrireSection(section);

  // Numeros de page.
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.text(
      `Page ${i} / ${n}`,
      largeurPage - MARGE_X,
      hauteurPage - 10,
      { align: "right" }
    );
    doc.setFont("helvetica", "normal");
  }

  doc.save(
    `dossier-avocat-parent-preuve-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}
