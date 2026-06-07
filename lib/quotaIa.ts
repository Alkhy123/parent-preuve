// lib/quotaIa.ts
// Quota anti-abus des routes IA, compté EN BASE (table public.ia_appels), par utilisateur.
//
// Pourquoi en base : l'ancien limiteur vivait en mémoire du serveur. Sur Vercel
// (plusieurs instances, redémarrages fréquents), un compteur en mémoire ne tient pas.
// Ici, chaque appel laisse une ligne dans ia_appels ; on compte les lignes récentes
// de l'utilisateur pour décider d'autoriser ou non. La RLS garantit qu'on ne voit et
// n'écrit que SES propres lignes.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type ResultatQuota = { autorise: boolean; resteSecondes: number };

// Fabrique un client Supabase agissant AU NOM de l'utilisateur (via son jeton),
// pour que auth.uid() vaille son id et que la RLS de ia_appels s'applique.
function clientUtilisateur(request: Request) {
  const entete = request.headers.get("authorization") ?? "";
  const jeton = entete.toLowerCase().startsWith("bearer ")
    ? entete.slice(7).trim()
    : "";
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${jeton}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function verifierQuotaIa(
  request: Request,
  fonctionnalite: string,
  maxAppels: number,
  fenetreSecondes: number
): Promise<ResultatQuota> {
  const supabase = clientUtilisateur(request);
  const depuis = new Date(Date.now() - fenetreSecondes * 1000).toISOString();

  // 1. Compter les appels récents de CET utilisateur pour CETTE fonctionnalité.
  const { count, error } = await supabase
    .from("ia_appels")
    .select("id", { count: "exact", head: true })
    .eq("fonctionnalite", fonctionnalite)
    .gte("created_at", depuis);

  // En cas d'erreur de comptage : on n'autorise pas (on ne laisse pas passer un appel
  // dont on ne peut pas vérifier le quota).
  if (error) {
    return { autorise: false, resteSecondes: fenetreSecondes };
  }

  if ((count ?? 0) >= maxAppels) {
    // Plafond atteint : estimer le délai restant à partir de l'appel le plus ancien
    // encore dans la fenêtre.
    const { data: plusAncien } = await supabase
      .from("ia_appels")
      .select("created_at")
      .eq("fonctionnalite", fonctionnalite)
      .gte("created_at", depuis)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let resteSecondes = fenetreSecondes;
    if (plusAncien?.created_at) {
      const fin = new Date(plusAncien.created_at).getTime() + fenetreSecondes * 1000;
      resteSecondes = Math.max(1, Math.ceil((fin - Date.now()) / 1000));
    }
    return { autorise: false, resteSecondes };
  }

  // 2. Sous le plafond : on enregistre l'appel (user_id et created_at par défaut).
  await supabase.from("ia_appels").insert({ fonctionnalite });

  return { autorise: true, resteSecondes: 0 };
}