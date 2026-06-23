// lib/chronologiePdf.ts
//
// Génération du PDF de la chronologie (frise datée unique).
// Reçoit des lignes DÉJÀ filtrées et mises en forme par chronologieExport.ts.
// Réutilise le même moteur que app/export/page.tsx : jsPDF + jspdf-autotable.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Couleurs de marque (navy / gris de texte).
const NAVY: [number, number, number] = [21, 35, 63];   // #15233F
const GRIS: [number, number, number] = [90, 100, 115]; // #5A6473

export type ContexteExportChrono = {
  du?: string;                 // "AAAA-MM-JJ" ou vide
  au?: string;                 // "AAAA-MM-JJ" ou vide
  etiquetteProcedure?: string; // libellé libre de la procédure active
};

const EN_TETE = [
  "Date",
  "Heure",
  "Type",
  "Enfant",
  "Titre",
  "Détails",
  "Montant",
  "Statut",
];

const AVERTISSEMENT =
  "Document généré à partir des données saisies par l'utilisateur. Il ne constitue " +
  "ni un constat de commissaire de justice ni un conseil juridique. L'horodatage des " +
  "preuves est non qualifié. À vérifier avant toute utilisation.";

/**
 * Construit et télécharge le PDF de la chronologie.
 * @param lignes   Tableau [Date, Heure, Type, Enfant, Titre, Détails, Montant, Statut].
 * @param contexte Période et étiquette de procédure, pour l'en-tête.
 */
export function genererPdfChronologie(
  lignes: string[][],
  contexte: ContexteExportChrono,
): void {
  const doc = new jsPDF({ orientation: "landscape" }); // A4 paysage

  // --- En-tête ---
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setFontSize(18);
  doc.text("Chronologie du dossier", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
  if (contexte.etiquetteProcedure) {
    doc.text(`Procédure : ${contexte.etiquetteProcedure}`, 14, 25);
  }
  const periode =
    contexte.du || contexte.au
      ? `Période : ${contexte.du || "début"} au ${contexte.au || "aujourd'hui"}`
      : "Période : toutes les données";
  doc.text(periode, 14, 31);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 37);

  // --- Cas "aucune entrée" ---
  if (lignes.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.text("Aucune entrée pour cette sélection.", 14, 50);
  } else {
    // --- Tableau (frise) ---
    autoTable(doc, {
      startY: 44,
      head: [EN_TETE],
      body: lignes,
      styles: { fontSize: 8, cellPadding: 2, valign: "top" },
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 22 }, // Date
        1: { cellWidth: 16 }, // Heure
        2: { cellWidth: 18 }, // Type
        3: { cellWidth: 28 }, // Enfant
        4: { cellWidth: 50 }, // Titre
        5: { cellWidth: 73 }, // Détails (le plus large)
        6: { cellWidth: 22 }, // Montant
        7: { cellWidth: 34 }, // Statut
      },
    });
  }

  // --- Avertissement en bas ---
  const docAT = doc as { lastAutoTable?: { finalY: number } };
  const finY =
    docAT.lastAutoTable?.finalY != null ? docAT.lastAutoTable.finalY + 12 : 60;
  doc.setFontSize(8);
  doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
  doc.text(doc.splitTextToSize(AVERTISSEMENT, 269), 14, finY);

  // --- Téléchargement ---
  doc.save(`chronologie-parent-preuve-${new Date().toISOString().slice(0, 10)}.pdf`);
}