// lib/supabaseAdmin.ts
// Client Supabase "admin", à usage STRICTEMENT serveur.
//
// ⚠️ Il utilise la clé service_role, qui CONTOURNE la RLS et a un accès total à la base.
// - Ne jamais l'importer dans un composant client ("use client") ni l'exposer au navigateur.
// - Dans ce projet, il sert UNIQUEMENT à supprimer le compte Auth (auth.admin.deleteUser),
//   après que l'identité de l'utilisateur a été vérifiée par ailleurs.
//
// Sécurité by design : la clé n'a pas le préfixe NEXT_PUBLIC_, donc elle n'est jamais
// incluse dans le bundle navigateur. Si ce fichier était importé par erreur côté client,
// la clé y vaudrait "undefined" (rien à voler) et la création échouerait — elle ne fuit pas.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});