// lib/extractionRegles.ts
// Cœur PARTAGÉ de l'extraction des 4 règles d'un jugement (pension, frais, DVH, décision).
// Utilisé à la fois par /api/ia/extraire (description libre) et /api/ia/extraire-pdf (PDF).
// Un seul prompt, un seul validateur : une seule vérité. L'IA propose ; rien n'est écrit en base ici.

import { MODELE_EXTRACTION } from "@/lib/modelesIA";

const CONSIGNE = `Tu es un assistant qui lit la description libre d'un jugement du Juge aux affaires familiales (JAF), rédigée par un parent, et qui en extrait QUATRE règles : la règle de pension alimentaire, la règle de partage des frais, les modalités du droit de visite et d'hébergement (DVH), ET la nature/échéances de la décision (statut procédural).

Tu réponds STRICTEMENT en JSON, sans aucun texte autour, sans balises Markdown.

Principes impératifs (valables pour les QUATRE règles) :
- Le DISPOSITIF fait foi : fonde-toi sur ce que le juge a tranché ("PAR CES MOTIFS", verbes "Dit", "Fixe", "Condamne", "Déboute", "Constate", "Ordonne"). Ne te fonde JAMAIS sur les demandes des parties. En cas d'ambiguïté, baisse la confiance et ajoute un avertissement.
- Perspective : l'auteur du texte est "moi", l'autre parent est "autre". "debiteur" = celui qui PAIE la pension ; les "parts" de frais suivent la même logique ; "titulaire" du DVH = le parent qui exerce le droit. À la 3e personne ("le père", "la mère") avec un rôle incertain : confiance "moyenne" + avertissement.
- Ne qualifie JAMAIS juridiquement et n'INFÈRE JAMAIS de motif (jamais "abandon de famille" ; ne déduis pas pourquoi un DVH est médiatisé ; ne déduis pas un statut procédural depuis le seul type de décision). Tu n'enregistres que ce que le dispositif énonce. Aucun conseil juridique.
- N'invente RIEN. Information absente => "valeur": null, "confiance": "absente", "citation": null. Ne déduis pas.
- Dates au format AAAA-MM-JJ. Une conversion de date ("15 mars 2026" => "2026-03-15") prend une confiance "moyenne".
- "citation" = court extrait EXACT du texte fourni, ou null.
- "confiance" vaut "haute", "moyenne" ou "absente". Si "valeur" est null, alors "confiance" est OBLIGATOIREMENT "absente".

Renvoie EXACTEMENT cette structure JSON (mêmes clés) :
{
  "sections": {
    "pension": {
      "table": "pension_regle",
      "champs": {
        "montant_base":   { "valeur": null, "confiance": "absente", "citation": null },
        "debiteur":       { "valeur": null, "confiance": "absente", "citation": null },
        "jour_echeance":  { "valeur": null, "confiance": "absente", "citation": null },
        "paiement_avance":{ "valeur": null, "confiance": "absente", "citation": null },
        "inclut_vacances":{ "valeur": null, "confiance": "absente", "citation": null },
        "intermediation": { "valeur": null, "confiance": "absente", "citation": null },
        "indexation_active":        { "valeur": null, "confiance": "absente", "citation": null },
        "indexation_jour":          { "valeur": null, "confiance": "absente", "citation": null },
        "indexation_mois":          { "valeur": null, "confiance": "absente", "citation": null },
        "indexation_premiere_date": { "valeur": null, "confiance": "absente", "citation": null },
        "indexation_indice":        { "valeur": null, "confiance": "absente", "citation": null }
      },
      "avertissements": []
    },
    "frais": {
      "table": "frais_regle",
      "champs": {
        "categories_couvertes":      { "valeur": null, "confiance": "absente", "citation": null },
        "part_moi_pourcentage":      { "valeur": null, "confiance": "absente", "citation": null },
        "part_autre_pourcentage":    { "valeur": null, "confiance": "absente", "citation": null },
        "accord_prealable_requis":   { "valeur": null, "confiance": "absente", "citation": null },
        "accord_prealable_seuil":    { "valeur": null, "confiance": "absente", "citation": null },
        "delai_remboursement_jours": { "valeur": null, "confiance": "absente", "citation": null },
        "justificatif_obligatoire":  { "valeur": null, "confiance": "absente", "citation": null },
        "s_ajoute_a_pension":        { "valeur": null, "confiance": "absente", "citation": null }
      },
      "avertissements": []
    },
    "dvh": {
      "table": "dvh_regle",
      "champs": {
        "type_dvh":                    { "valeur": null, "confiance": "absente", "citation": null },
        "titulaire":                   { "valeur": null, "confiance": "absente", "citation": null },
        "lieu_visite":                 { "valeur": null, "confiance": "absente", "citation": null },
        "presence_tiers":              { "valeur": null, "confiance": "absente", "citation": null },
        "tiers_details":               { "valeur": null, "confiance": "absente", "citation": null },
        "frequence":                   { "valeur": null, "confiance": "absente", "citation": null },
        "duree":                       { "valeur": null, "confiance": "absente", "citation": null },
        "duree_limitee":               { "valeur": null, "confiance": "absente", "citation": null },
        "clause_renonciation":         { "valeur": null, "confiance": "absente", "citation": null },
        "clause_renonciation_details": { "valeur": null, "confiance": "absente", "citation": null },
        "remise_lieu":                 { "valeur": null, "confiance": "absente", "citation": null },
        "vacances_partage":            { "valeur": null, "confiance": "absente", "citation": null }
      },
      "avertissements": []
    },
    "decision": {
      "table": "decision_regle",
      "champs": {
        "type_decision":           { "valeur": null, "confiance": "absente", "citation": null },
        "provisoire":              { "valeur": null, "confiance": "absente", "citation": null },
        "execution_provisoire":    { "valeur": null, "confiance": "absente", "citation": null },
        "susceptible_appel":       { "valeur": null, "confiance": "absente", "citation": null },
        "frappee_appel":           { "valeur": null, "confiance": "absente", "citation": null },
        "appel_date":              { "valeur": null, "confiance": "absente", "citation": null },
        "appel_juridiction":       { "valeur": null, "confiance": "absente", "citation": null },
        "date_decision":           { "valeur": null, "confiance": "absente", "citation": null },
        "date_signification":      { "valeur": null, "confiance": "absente", "citation": null },
        "date_audience_prochaine": { "valeur": null, "confiance": "absente", "citation": null },
        "mise_en_etat":            { "valeur": null, "confiance": "absente", "citation": null },
        "mise_en_etat_details":    { "valeur": null, "confiance": "absente", "citation": null }
      },
      "avertissements": []
    }
  }
}

Signification des champs de PENSION :
- montant_base : nombre, contribution mensuelle de base en euros, ou null.
- debiteur : "moi" ou "autre", ou null.
- jour_echeance : entier 1 à 31, ou null.
- paiement_avance : true si payable d'avance, false si payable à terme échu, sinon null.
- inclut_vacances : true UNIQUEMENT si le dispositif dit explicitement que la PENSION reste due pendant les vacances ou est versée 12 mois sur 12. N'active JAMAIS ce champ à partir d'une clause de frais, ni d'un partage des vacances scolaires qui relève du droit de visite. Sinon null.
- intermediation : true si intermédiation financière (CAF/ARIPA), sinon null.
- indexation_active : true si une clause d'indexation est prévue, sinon null.
- indexation_jour, indexation_mois : entiers de la révision annuelle, ou null.
- indexation_premiere_date : date AAAA-MM-JJ, ou null.
- indexation_indice : libellé de l'indice, ou null.

Signification des champs de FRAIS :
- categories_couvertes : texte de ce que le dispositif range dans les frais partagés/exceptionnels, ou null.
- part_moi_pourcentage : nombre, part de "moi". "par moitié" / "à parts égales" => 50 pour chacun. Ne déduis pas la part manquante par soustraction. Sinon null.
- part_autre_pourcentage : nombre, part de "autre", même logique, ou null.
- accord_prealable_requis : true si un accord préalable est exigé, sinon null.
- accord_prealable_seuil : nombre en euros du seuil (ex. 200), ou null.
- delai_remboursement_jours : entier de jours. "sous un mois" => 30, "sous quinze jours" => 15 (confiance "moyenne" pour une conversion) ; sinon null.
- justificatif_obligatoire : true si remboursement subordonné à un justificatif. N'écris PAS false si le texte n'en parle pas : mets null.
- s_ajoute_a_pension : true si le dispositif précise que ces frais s'ajoutent à la contribution, false si exclus explicitement, sinon null.

Signification des champs de DVH :
- type_dvh : une de ces valeurs EXACTES sinon null : "classique", "mediatise", "reduit", "progressif", "libre", "suspendu", "sans_dvh".
- titulaire : "moi" ou "autre", ou null.
- lieu_visite : une de ces valeurs EXACTES sinon null : "domicile", "espace_rencontre", "tiers", "autre".
- presence_tiers : true si tiers/espace rencontre imposé, sinon null.
- tiers_details : texte, ou null.
- frequence : texte tel quel, ou null.
- duree : texte tel quel, ou null.
- duree_limitee : true si DVH limité dans le temps/progressif, sinon null.
- clause_renonciation : true s'il existe une clause de renonciation/déchéance en cas de non-exercice, sinon null.
- clause_renonciation_details : texte, ou null.
- remise_lieu : texte du lieu de remise, ou null.
- vacances_partage : texte du partage des vacances, ou null.

Signification des champs de DECISION (statut procédural ; NE DÉDUIS RIEN du seul type) :
- type_decision : une de ces valeurs EXACTES sinon null : "jugement", "ordonnance", "convention_homologuee", "arret", "autre".
- provisoire : true si ce sont des mesures provisoires (avant jugement au fond) énoncées comme telles, sinon null.
- execution_provisoire : true UNIQUEMENT si le texte mentionne l'exécution provisoire / "exécutoire par provision". Sinon null.
- susceptible_appel : true UNIQUEMENT si le texte l'indique. Ne l'infère pas du type de décision. Sinon null.
- frappee_appel : true si un appel a effectivement été interjeté, sinon null.
- appel_date : date AAAA-MM-JJ de la déclaration d'appel, ou null.
- appel_juridiction : texte (cour d'appel saisie), ou null.
- date_decision : date du prononcé AAAA-MM-JJ, ou null.
- date_signification : date de signification/notification AAAA-MM-JJ, ou null.
- date_audience_prochaine : date AAAA-MM-JJ d'une prochaine audience, ou null.
- mise_en_etat : true si l'affaire est en cours de mise en état, sinon null.
- mise_en_etat_details : texte, ou null.

Chaque section a son propre tableau "avertissements" (phrases courtes ; tableau vide si rien).`;

const CHAMPS_PENSION = [
  "montant_base", "debiteur", "jour_echeance", "paiement_avance",
  "inclut_vacances", "intermediation", "indexation_active",
  "indexation_jour", "indexation_mois", "indexation_premiere_date", "indexation_indice",
];
const CHAMPS_FRAIS = [
  "categories_couvertes", "part_moi_pourcentage", "part_autre_pourcentage",
  "accord_prealable_requis", "accord_prealable_seuil", "delai_remboursement_jours",
  "justificatif_obligatoire", "s_ajoute_a_pension",
];
const CHAMPS_DVH = [
  "type_dvh", "titulaire", "lieu_visite", "presence_tiers", "tiers_details",
  "frequence", "duree", "duree_limitee", "clause_renonciation",
  "clause_renonciation_details", "remise_lieu", "vacances_partage",
];
const CHAMPS_DECISION = [
  "type_decision", "provisoire", "execution_provisoire", "susceptible_appel",
  "frappee_appel", "appel_date", "appel_juridiction", "date_decision",
  "date_signification", "date_audience_prochaine", "mise_en_etat", "mise_en_etat_details",
];
const CONFIANCES = ["haute", "moyenne", "absente"];

function nettoyerJson(s: string): string {
  return s.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function champsValides(champs: any, attendus: string[]): boolean {
  if (!champs || typeof champs !== "object") return false;
  for (const cle of attendus) {
    const champ = champs[cle];
    if (!champ || typeof champ !== "object") return false;
    if (!("valeur" in champ) || !("confiance" in champ) || !("citation" in champ)) return false;
    if (!CONFIANCES.includes(champ.confiance)) return false;
    if (champ.valeur === null && champ.confiance !== "absente") return false;
  }
  return true;
}

function structureValide(parsed: any): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  const s = parsed.sections;
  if (!s || typeof s !== "object") return false;
  if (!s.pension || typeof s.pension !== "object") return false;
  if (!s.frais || typeof s.frais !== "object") return false;
  if (!s.dvh || typeof s.dvh !== "object") return false;
  if (!s.decision || typeof s.decision !== "object") return false;
  if (!champsValides(s.pension.champs, CHAMPS_PENSION)) return false;
  if (!champsValides(s.frais.champs, CHAMPS_FRAIS)) return false;
  if (!champsValides(s.dvh.champs, CHAMPS_DVH)) return false;
  if (!champsValides(s.decision.champs, CHAMPS_DECISION)) return false;
  return true;
}

// Résultat de l'analyse : soit les 4 sections, soit une erreur avec son code HTTP.
export type ResultatAnalyse =
  | { ok: true; sections: any }
  | { ok: false; status: number; erreur: string };

// Envoie le texte (description libre OU dispositif déjà ciblé, <= 5000 caractères)
// à Mistral, puis valide strictement la réponse. Ne valide PAS la présence/longueur
// du texte : c'est à l'appelant de le faire avant d'appeler cette fonction.
export async function analyserDispositif(
  texte: string,
  cle: string
): Promise<ResultatAnalyse> {
  let data: any;
  try {
    const reponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
      },
      body: JSON.stringify({
        model: MODELE_EXTRACTION,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: CONSIGNE },
          { role: "user", content: texte },
        ],
      }),
    });
    if (!reponse.ok) {
      return { ok: false, status: 502, erreur: "Le service Mistral a renvoyé une erreur." };
    }
    data = await reponse.json();
  } catch {
    return { ok: false, status: 502, erreur: "Impossible de joindre le service Mistral." };
  }

  const contenu = data?.choices?.[0]?.message?.content;
  if (typeof contenu !== "string") {
    return { ok: false, status: 502, erreur: "Réponse Mistral inattendue." };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(nettoyerJson(contenu));
  } catch {
    return { ok: false, status: 502, erreur: "La réponse n'est pas un JSON valide." };
  }

  if (!structureValide(parsed)) {
    return { ok: false, status: 502, erreur: "Le JSON renvoyé ne respecte pas le format attendu." };
  }

  const s = parsed.sections;
  s.pension.table = "pension_regle";
  s.frais.table = "frais_regle";
  s.dvh.table = "dvh_regle";
  s.decision.table = "decision_regle";
  if (!Array.isArray(s.pension.avertissements)) s.pension.avertissements = [];
  if (!Array.isArray(s.frais.avertissements)) s.frais.avertissements = [];
  if (!Array.isArray(s.dvh.avertissements)) s.dvh.avertissements = [];
  if (!Array.isArray(s.decision.avertissements)) s.decision.avertissements = [];

  return { ok: true, sections: parsed.sections };
}