// Route serveur : réception du PDF du jugement.
// Étape actuelle : on vérifie seulement que le fichier reçu est un PDF valide
// et pas trop lourd. On ne lit pas encore son texte, on n'appelle pas encore l'IA.

const TAILLE_MAX_MO = 10;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { erreur: "Requête invalide : aucun fichier reçu." },
      { status: 400 }
    );
  }

  const fichier = form.get("fichier");

  // 1. Un fichier doit bien être présent.
  if (!(fichier instanceof File)) {
    return Response.json(
      { erreur: "Aucun fichier reçu. Importez le PDF du jugement." },
      { status: 400 }
    );
  }

  // 2. Ce fichier doit être un PDF.
  const estPdf =
    fichier.type === "application/pdf" ||
    fichier.name.toLowerCase().endsWith(".pdf");
  if (!estPdf) {
    return Response.json(
      { erreur: "Le fichier reçu n'est pas un PDF." },
      { status: 400 }
    );
  }

  // 3. Il ne doit pas dépasser la taille maximale.
  if (fichier.size > TAILLE_MAX_MO * 1024 * 1024) {
    return Response.json(
      { erreur: `Le PDF est trop volumineux (maximum ${TAILLE_MAX_MO} Mo).` },
      { status: 400 }
    );
  }

  // Tout est bon. Pour l'instant on confirme seulement la bonne réception.
  // (Aucun contenu du jugement n'est lu ni journalisé.)
  return Response.json({
    ok: true,
    nom: fichier.name,
    taille: fichier.size,
  });
}