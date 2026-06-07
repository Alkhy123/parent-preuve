// lib/enteteAuth.ts
// Petit utilitaire CÔTÉ NAVIGATEUR : récupère le jeton de la session Supabase
// et le place dans un en-tête "Authorization: Bearer ...".
// À joindre à chaque appel fetch vers une route serveur protégée (/api/ia/...).
// Si l'utilisateur n'est pas connecté, renvoie {} (la route répondra alors 401).

import { supabase } from "@/lib/supabase";

export async function enteteAuth(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const jeton = data.session?.access_token;
  return jeton ? { Authorization: `Bearer ${jeton}` } : {};
}