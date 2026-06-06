import jsPDF from "jspdf";

// Transforme un titre en nom de fichier propre : "Relance de pension" -> "relance-de-pension"
function slugifier(titre: string) {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Génère et télécharge un PDF à partir du titre et du texte d'un courrier.
// Réutilisable par TOUS les modèles : il suffit de l'appeler avec leur brouillon.
export function exporterCourrierPdf(titre: string, texte: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margeX = 20;
  const margeHaut = 20;
  const margeBas = 20;
  const hauteur = doc.internal.pageSize.getHeight();
  const largeurTexte = doc.internal.pageSize.getWidth() - margeX * 2;
  const interligne = 6; // mm entre deux lignes

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20);

  // On découpe le texte en lignes qui tiennent dans la largeur, et on les pose une à une
  const lignes = doc.splitTextToSize(texte, largeurTexte);
  let y = margeHaut;
  lignes.forEach((ligne: string) => {
    if (y + interligne > hauteur - margeBas - 18) {
      doc.addPage();
      y = margeHaut;
    }
    doc.text(ligne, margeX, y);
    y += interligne;
  });

  // L'avertissement, en bas de la dernière page
  const avertissement =
    "Document généré à partir des données saisies par l'utilisateur. Il ne constitue ni un constat de commissaire de justice ni un conseil juridique, et doit être relu avant tout envoi.";
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(doc.splitTextToSize(avertissement, largeurTexte), margeX, hauteur - margeBas - 6);

  doc.save(`${slugifier(titre) || "courrier"}-${new Date().toISOString().slice(0, 10)}.pdf`);
}