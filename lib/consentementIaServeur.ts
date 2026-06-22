import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type ResultatConsentementIa =
  | { autorise: true; erreur: "" }
  | { autorise: false; erreur: string };

/**
 * Vérifie côté serveur le consentement granulaire de l'utilisateur courant.
 *
 * Le client Supabase agit avec le jeton Bearer de la requête : la RLS de
 * consentements_ia limite donc la lecture aux seules lignes de cet utilisateur.
 * Toute erreur de lecture provoque un refus (fail-closed).
 */
export async function verifierConsentementIa(
  request: Request,
  fonctionnalite: string
): Promise<ResultatConsentementIa> {
  const entete = request.headers.get("authorization") ?? "";
  const jeton = entete.toLowerCase().startsWith("bearer ")
    ? entete.slice(7).trim()
    : "";

  if (!jeton) {
    return {
      autorise: false,
      erreur: "Impossible de vérifier le consentement IA. L'appel est refusé par sécurité.",
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${jeton}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("consentements_ia")
    .select("id")
    .eq("fonctionnalite", fonctionnalite)
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      autorise: false,
      erreur: "Impossible de vérifier le consentement IA. L'appel est refusé par sécurité.",
    };
  }

  if (!data) {
    return {
      autorise: false,
      erreur: "Consentement IA requis pour utiliser cette fonctionnalité.",
    };
  }

  return { autorise: true, erreur: "" };
}
