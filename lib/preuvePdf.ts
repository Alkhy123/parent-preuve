import jsPDF from "jspdf";

export type PreuvePourPdf = {
  titre: string | null;
  description: string | null;
  nom_enfant: string;
  created_at: string;
  nom_fichier: string | null;
  type_fichier: string | null;
  taille_octets: number | null;
  empreinte_sha256: string | null;
  empreinte_sha256_serveur: string | null;
  hash_verifie: boolean | null;
  heure_appareil: string | null;
  ecart_heure_secondes: number | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_precision_metres: number | null;
  horodatage_jeton: string | null;
  horodatage_date: string | null;
  horodatage_statut: string | null;
  horodatage_prestataire: string | null;
  horodatage_algorithme: string | null;
};

// Image déjà ré-encodée en JPEG (voir blobVersImage dans la page liste)
export type ImagePdf = { dataUrl: string; w: number; h: number } | null;

function dateHeureFr(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formaterTaille(octets: number | null): string {
  if (!octets) return "—";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

// Traduit le statut technique en phrase honnête pour le rapport.
function statutHorodatageFr(statut: string | null): string {
  if (statut === "non_qualifie") return "horodatage non qualifié";
  if (statut === "qualifie") return "horodatage qualifié (eIDAS)";
  if (statut === "a_refaire") return "horodatage non effectué (à refaire)";
  return "aucun horodatage";
}

// Statut de la vérification serveur du hash (intégrité technique).
// Formulation prudente : on décrit un fait (concordance ou écart), jamais
// une garantie d'authenticité ou de recevabilité.
function statutIntegriteFr(hashVerifie: boolean | null): string {
  if (hashVerifie === true)
    return "empreinte recalculée côté serveur : concordante";
  if (hashVerifie === false)
    return "écart constaté entre l'empreinte d'origine et l'empreinte recalculée";
  return "vérification serveur non effectuée";
}

export function exporterPreuvePdf(p: PreuvePourPdf, image: ImagePdf) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margeG = 20;
  const largeur = 210 - margeG * 2;
  let y = 22;

  // Ajoute une page si on manque de place
  function verifierEspace(besoin: number) {
    if (y + besoin > 275) {
      doc.addPage();
      y = 22;
    }
  }

  function ligne(label: string, valeur: string) {
    verifierEspace(12);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(label, margeG, y);
    doc.setFont("times", "normal");
    const lignes = doc.splitTextToSize(valeur, largeur - 55);
    doc.text(lignes, margeG + 55, y);
    y += lignes.length * 6 + 2;
  }

  function titreSection(t: string) {
    verifierEspace(14);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text(t, margeG, y);
    y += 7;
  }

  // --- En-tête ---
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("Rapport de preuve numérique", margeG, y);
  y += 8;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text("Preuve numérique renforcée, scellée et horodatée.", margeG, y);
  doc.setTextColor(0);
  y += 4;
  doc.setDrawColor(194, 162, 76);
  doc.setLineWidth(0.5);
  doc.line(margeG, y, margeG + largeur, y);
  y += 10;

  // --- Photographie (rendu) ---
  if (image) {
    titreSection("Photographie");
    const maxW = largeur;
    const maxH = 115;
    let dispW = maxW;
    let dispH = (image.h / image.w) * dispW;
    if (dispH > maxH) {
      dispH = maxH;
      dispW = (image.w / image.h) * dispH;
    }
    verifierEspace(dispH + 8);
    const x = (210 - dispW) / 2;
    doc.addImage(image.dataUrl, "JPEG", x, y, dispW, dispH);
    y += dispH + 4;
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(110);
    const note = doc.splitTextToSize(
      "Rendu de la photographie à titre d'illustration. Le fichier original scellé, " +
        "non modifié, correspond à l'empreinte SHA-256 indiquée ci-dessous.",
      largeur
    );
    doc.text(note, margeG, y);
    doc.setTextColor(0);
    y += note.length * 4 + 6;
  }

  // --- Identification ---
  titreSection("Identification");
  ligne("Titre", p.titre || "—");
  ligne("Enfant concerné", p.nom_enfant);
  if (p.description) ligne("Description", p.description);
  y += 2;

  // --- Datation ---
  titreSection("Datation");
  ligne("Horodatage serveur", dateHeureFr(p.created_at));
  ligne("Heure de l'appareil", dateHeureFr(p.heure_appareil));
  ligne(
    "Écart appareil / serveur",
    p.ecart_heure_secondes != null
      ? `${p.ecart_heure_secondes} seconde(s)` +
          (Math.abs(p.ecart_heure_secondes) > 120 ? " — écart important" : "")
      : "—"
  );
  y += 2;

  // --- Fichier et intégrité ---
  titreSection("Fichier et intégrité");
  ligne("Nom du fichier", p.nom_fichier || "—");
  ligne("Type", p.type_fichier || "—");
  ligne("Taille", formaterTaille(p.taille_octets));
  ligne("Empreinte SHA-256", p.empreinte_sha256 || "—");
  ligne("Intégrité serveur", statutIntegriteFr(p.hash_verifie));
  y += 2;

  // --- Horodatage ---
  titreSection("Horodatage");
  ligne("Type", statutHorodatageFr(p.horodatage_statut));
  if (p.horodatage_statut === "non_qualifie" || p.horodatage_statut === "qualifie") {
    ligne("Date attestée", dateHeureFr(p.horodatage_date));
    ligne("Prestataire", p.horodatage_prestataire || "—");
    ligne("Méthode", p.horodatage_algorithme || "—");
    ligne("Jeton", p.horodatage_jeton || "—");
  }
  if (p.horodatage_statut === "non_qualifie") {
    verifierEspace(16);
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(110);
    const noteH = doc.splitTextToSize(
      "Horodatage non qualifié au sens du règlement eIDAS : la date est attestée par " +
        "l'application elle-même, sans recours à un prestataire de confiance qualifié. " +
        "Il renforce la datation sans lui conférer de présomption légale.",
      largeur
    );
    doc.text(noteH, margeG, y);
    doc.setTextColor(0);
    y += noteH.length * 4 + 4;
  }
  y += 2;


  // --- Localisation ---
  titreSection("Localisation");
  ligne(
    "Position GPS",
    p.gps_latitude != null && p.gps_longitude != null
      ? `${p.gps_latitude.toFixed(6)}, ${p.gps_longitude.toFixed(6)}`
      : "non disponible"
  );
  ligne(
    "Précision annoncée",
    p.gps_precision_metres != null
      ? `± ${Math.round(p.gps_precision_metres)} mètres`
      : "—"
  );
  y += 6;

  // --- Avertissement ---
  verifierEspace(30);
  const avertissement =
    "Ce rapport est généré automatiquement à partir des données saisies et collectées " +
    "par l'application. La photographie et ce rapport constituent une preuve numérique " +
    "renforcée, scellée et horodatée. Ils ne constituent pas un constat de commissaire " +
    "de justice et doivent être vérifiés par l'utilisateur.";
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(doc.splitTextToSize(avertissement, largeur), margeG, y);
  doc.setTextColor(0);

  doc.save(`rapport-preuve-${p.created_at.slice(0, 10)}.pdf`);
}