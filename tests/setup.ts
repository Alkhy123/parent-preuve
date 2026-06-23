// tests/setup.ts
// Pré-chargé avant les tests (voir script "test" de package.json).
//
// Certaines libs testées importent @/lib/supabase, qui construit le client au
// chargement du module et exige les variables d'environnement publiques. Les
// tests ne font AUCUN appel réseau : on pose des valeurs factices, uniquement
// pour que l'import ne plante pas. Aucune connexion réelle n'est ouverte.

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??= "test-anon-key";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
