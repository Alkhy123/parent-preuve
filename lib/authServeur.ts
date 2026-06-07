// lib/authServeur.ts
// Vérifie CÔTÉ SERVEUR que l'appelant d'une route est un utilisateur connecté.
//
// Principe (version légère) : le navigateur, déjà connecté, envoie son jeton de
// session dans l'en-tête HTTP "Authorization: Bearer <jeton>". Ici, on demande à
// Supabase de valider ce jeton et de nous dire à qui il appartient.
//
// Aucune clé secrète : on réutilise l'URL + la clé publique (anon/publishable),
// exactement comme le client navigateur. La validation du jeton est faite par
// Supabase, donc un jeton inventé ou expiré est rejeté.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type UtilisateurServeur = { id: string; email: string | null };

// Retourne l'utilisateur si le jeton est valide, sinon null.
export async function utilisateurDeLaRequete(
  request: Request
): Promise<UtilisateurServeur | null> {
  const entete = request.headers.get("authorization") ?? "";
  const jeton = entete.toLowerCase().startsWith("bearer ")
    ? entete.slice(7).trim()
    : "";

  // Pas d'en-tête Bearer : inutile d'appeler Supabase, on refuse tout de suite.
  if (!jeton) return null;

  // Client serveur jetable : pas de session persistée ni de refresh automatique.
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(jeton);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}