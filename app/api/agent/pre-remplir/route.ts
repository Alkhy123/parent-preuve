// app/api/agent/pre-remplir/route.ts
//
// Agent Parent Preuve — pré-remplissage structuré.
//
// Cette route remplace l'ancien assistant /api/assistant/pre-remplir
// (supprimé après migration vers l'architecture Agent).
//
// Elle est branchée au bouton flottant : usage « pré-remplissage » de
// components/AssistantFlottant.tsx. Elle propose une structure à valider et
// n'enregistre jamais automatiquement (validation humaine obligatoire).
//
// Sécurité :
// - authentification obligatoire ;
// - consentement IA Agent obligatoire ;
// - quota IA Agent obligatoire ;
// - refus local des demandes juridiques sensibles avant appel Mistral ;
// - appel Mistral côté serveur uniquement ;
// - validation stricte du contrat agent-pre-remplissage-v1 ;
// - nettoyage final via nettoyerProposition() ;
// - aucune écriture métier en base ;
// - aucune action automatique ;
// - validation humaine obligatoire côté écran final.

import { createClient } from "@supabase/supabase-js";

import { utilisateurDeLaRequete } from "@/lib/authServeur";
import { verifierQuotaIa } from "@/lib/quotaIa";
import { MODELE_ASSISTANT } from "@/lib/modelesIA";

import {
  ENDPOINT_MISTRAL_CHAT_COMPLETIONS,
  FONCTIONNALITE_CONSENTEMENT_AGENT,
  FONCTIONNALITE_QUOTA_AGENT,
  MAX_TOKENS_AGENT_MISTRAL,
  QUOTA_AGENT_FENETRE_SECONDES,
  QUOTA_AGENT_NOMBRE_APPELS,
  construireConsignePreRemplissageAgent,
  construireReponsePreRemplissageRefusee,
  estDemandeJuridiqueSensibleAgent,
  parserEtValiderReponsePreRemplissageAgent,
} from "@/lib/agent";

const LIMITE_CARACTERES_PHRASE_PREREMPLISSAGE_AGENT = 500;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function clientUtilisateur(request: Request) {
  const entete = request.headers.get("authorization") ?? "";
  const jeton = entete.toLowerCase().startsWith("bearer ")
    ? entete.slice(7).trim()
    : "";

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jeton}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function verifierConsentementAgent(request: Request) {
  const supabase = clientUtilisateur(request);

  const { data, error } = await supabase
    .from("consentements_ia")
    .select("id")
    .eq("fonctionnalite", FONCTIONNALITE_CONSENTEMENT_AGENT)
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      autorise: false,
      erreur:
        "Impossible de vérifier le consentement IA. L'appel est refusé par sécurité.",
    };
  }

  if (!data) {
    return {
      autorise: false,
      erreur:
        "Consentement IA requis pour utiliser le pré-remplissage de l'Agent.",
    };
  }

  return {
    autorise: true,
    erreur: "",
  };
}

function dateDuJourParis() {
  const format = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return format.format(new Date());
}

export async function POST(request: Request) {
  const utilisateur = await utilisateurDeLaRequete(request);

  if (!utilisateur) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  const corps = await request.json().catch(() => ({}));
  const phrase = corps.phrase;

  if (typeof phrase !== "string" || phrase.trim() === "") {
    return Response.json({ erreur: "Aucune saisie." }, { status: 400 });
  }

  const phraseNettoyee = phrase.trim();

  if (phraseNettoyee.length > LIMITE_CARACTERES_PHRASE_PREREMPLISSAGE_AGENT) {
    return Response.json(
      {
        erreur: `Saisie trop longue (${LIMITE_CARACTERES_PHRASE_PREREMPLISSAGE_AGENT} caractères maximum).`,
      },
      { status: 400 }
    );
  }

  if (estDemandeJuridiqueSensibleAgent(phraseNettoyee)) {
    return Response.json({
      ok: true,
      source: "garde_fou_local",
      validation: {
        ok: true,
        erreur: "",
      },
      reponse: construireReponsePreRemplissageRefusee(
        "Le copilote ne peut pas traiter une demande de conseil juridique personnalisé ou de stratégie judiciaire."
      ),
    });
  }

  const consentement = await verifierConsentementAgent(request);

  if (!consentement.autorise) {
    return Response.json({ erreur: consentement.erreur }, { status: 403 });
  }

  const quota = await verifierQuotaIa(
    request,
    FONCTIONNALITE_QUOTA_AGENT,
    QUOTA_AGENT_NOMBRE_APPELS,
    QUOTA_AGENT_FENETRE_SECONDES
  );

  if (!quota.autorise) {
    return Response.json(
      {
        erreur: `Trop de demandes. Réessayez dans ${quota.resteSecondes} secondes.`,
      },
      { status: 429 }
    );
  }

  const cle = process.env.MISTRAL_API_KEY;

  if (!cle) {
    return Response.json(
      { erreur: "Clé MISTRAL_API_KEY absente du .env.local" },
      { status: 500 }
    );
  }

  try {
    const reponse = await fetch(ENDPOINT_MISTRAL_CHAT_COMPLETIONS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
      },
      body: JSON.stringify({
        model: MODELE_ASSISTANT,
        temperature: 0,
        max_tokens: Math.min(MAX_TOKENS_AGENT_MISTRAL, 500),
        messages: [
          {
            role: "system",
            content: construireConsignePreRemplissageAgent(dateDuJourParis()),
          },
          {
            role: "user",
            content: phraseNettoyee,
          },
        ],
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();

      console.error(
        "=== ERREUR MISTRAL (agent/pre-remplir) ===",
        reponse.status,
        detail
      );

      return Response.json(
        { erreur: `Mistral a répondu ${reponse.status}` },
        { status: 502 }
      );
    }

    const data = await reponse.json();
    const brut = data.choices?.[0]?.message?.content?.trim();

    if (!brut) {
      return Response.json({ erreur: "Réponse vide de l'IA." }, { status: 502 });
    }

    const validation = parserEtValiderReponsePreRemplissageAgent(brut);

    return Response.json({
      ok: true,
      source: "mistral",
      validation: {
        ok: validation.ok,
        erreur: validation.ok ? "" : validation.erreur,
      },
      reponse: validation.reponse,
    });
  } catch (e) {
    console.error("=== APPEL IMPOSSIBLE (agent/pre-remplir) ===", e);

    return Response.json(
      { erreur: "Appel à Mistral impossible." },
      { status: 502 }
    );
  }
}