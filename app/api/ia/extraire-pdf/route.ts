import { extractText, getDocumentProxy } from "unpdf";
import { ciblerDispositif } from "@/lib/dispositif";
import { analyserDispositif } from "@/lib/extractionRegles";
import { verifierQuotaIa } from "@/lib/quotaIa";
import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { enteteAuth } from "@/lib/enteteAuth";
import { MODELE_OCR } from "@/lib/modelesIA";

// Cette route a besoin du moteur Node (pas "edge") pour lire un PDF.
export const runtime = "nodejs";

const TAILLE_MAX_MO = 10;
const SEUIL_TEXTE_MINI = 100;
export async function POST(request: Request) {
// 1. Authentification : seul un utilisateur connecté peut appeler cette route.
const utilisateur = await utilisateurDeLaRequete(request);
if (!utilisateur) {
  return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
}

// 2. Quota anti-abus (compté en base, par utilisateur) : 15 appels / 60 s.
const quota = await verifierQuotaIa(request, "extraction-pdf", 5, 120);
if (!quota.autorise) {
  return Response.json(
    { erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.` },
    { status: 429 }
  );
}
  // La clé Mistral est nécessaire pour l'analyse finale (et l'OCR éventuel).
  const cle = process.env.MISTRAL_API_KEY;
  if (!cle) {
    return Response.json(
      { erreur: "Clé MISTRAL_API_KEY absente du .env.local" },
      { status: 500 }
    );
  }

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
  const ocrAutorise = form.get("ocr") === "true";

  // 1. Présence + type + taille.
  if (!(fichier instanceof File)) {
    return Response.json(
      { erreur: "Aucun fichier reçu. Importez le PDF du jugement." },
      { status: 400 }
    );
  }
  const estPdf =
    fichier.type === "application/pdf" ||
    fichier.name.toLowerCase().endsWith(".pdf");
  if (!estPdf) {
    return Response.json({ erreur: "Le fichier reçu n'est pas un PDF." }, { status: 400 });
  }
  if (fichier.size > TAILLE_MAX_MO * 1024 * 1024) {
    return Response.json(
      { erreur: `Le PDF est trop volumineux (maximum ${TAILLE_MAX_MO} Mo).` },
      { status: 400 }
    );
  }

  // 2. Lecture du texte natif (côté serveur, rien n'est envoyé à l'extérieur).
  let texteBrut: string;
  try {
    const bytes = new Uint8Array(await fichier.arrayBuffer());
    const pdf = await getDocumentProxy(bytes);
    const resultat = await extractText(pdf, { mergePages: true });
    texteBrut = (resultat.text ?? "").trim();
  } catch {
    return Response.json(
      { erreur: "Le PDF n'a pas pu être lu. Il est peut-être endommagé ou protégé." },
      { status: 502 }
    );
  }

  // 3. Texte final + provenance.
  let texteFinal: string;
  let source: "texte" | "ocr";

  if (texteBrut.length >= SEUIL_TEXTE_MINI) {
    texteFinal = texteBrut;
    source = "texte";
  } else if (!ocrAutorise) {
    return Response.json({ scanne: true });
  } else {
    let texteOcr: string;
    try {
      const base64 = Buffer.from(await fichier.arrayBuffer()).toString("base64");
      const reponse = await fetch("https://api.mistral.ai/v1/ocr", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cle}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODELE_OCR,
          document: {
            type: "document_url",
            document_url: `data:application/pdf;base64,${base64}`,
          },
        }),
      });
      if (!reponse.ok) {
        return Response.json(
          { erreur: `Mistral a répondu ${reponse.status}` },
          { status: 502 }
        );
      }
      const data = await reponse.json();
      const pages: Array<{ markdown?: string }> = data?.pages ?? [];
      texteOcr = pages
        .map((p) => p.markdown ?? "")
        .join("\n\n")
        .trim();
    } catch {
      return Response.json({ erreur: "Appel à Mistral impossible." }, { status: 502 });
    }
    if (texteOcr.length < SEUIL_TEXTE_MINI) {
      return Response.json(
        {
          erreur:
            "Même avec la reconnaissance de texte, aucun contenu lisible n'a été trouvé " +
            "dans ce PDF.",
        },
        { status: 422 }
      );
    }
    texteFinal = texteOcr;
    source = "ocr";
  }

  // 4. Ciblage du dispositif (commun aux deux sources).
  const cible = ciblerDispositif(texteFinal);

  // 5. Analyse des 4 règles via le moteur partagé.
  const analyse = await analyserDispositif(cible.texte, cle);
  if (!analyse.ok) {
    return Response.json({ erreur: analyse.erreur }, { status: analyse.status });
  }

  return Response.json({
    ok: true,
    source,
    dispositifTrouve: cible.dispositifTrouve,
    tronque: cible.tronque,
    avertissement: cible.avertissement,
    sections: analyse.sections,
  });
}