import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// En-têtes de sécurité (bloc 12).
//
// Deux niveaux :
//  1) En-têtes simples APPLIQUÉS : sans risque pour l'application actuelle
//     (coquilles statiques + chargement client sous RLS + PWA).
//  2) Content-Security-Policy en REPORT-ONLY : non bloquante. Elle signale les
//     violations sans rien casser, le temps de la valider dans le navigateur.
//     À promouvoir en `Content-Security-Policy` (bloquante) une fois vérifiée.
//
// Le navigateur dialogue DIRECTEMENT avec Supabase (client supabase-js sous
// RLS) : la CSP doit donc autoriser le domaine Supabase en connect-src/img-src.
// Mistral n'est appelé que côté serveur (routes /api) : inutile en connect-src.
// Les polices next/font sont auto-hébergées (servies en 'self').
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV === "development";

// Origine Supabase de ce déploiement, si disponible (sinon on couvre *.supabase.co).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHttp = "https://*.supabase.co";
let supabaseWs = "wss://*.supabase.co";
try {
  if (supabaseUrl) {
    const u = new URL(supabaseUrl);
    supabaseHttp = `https://${u.host}`;
    supabaseWs = `wss://${u.host}`;
  }
} catch {
  // URL invalide ou absente : on garde le motif générique *.supabase.co.
}

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `img-src 'self' blob: data: ${supabaseHttp}`,
  "font-src 'self' data:",
  // Tailwind v4 et Next injectent des styles/scripts inline : 'unsafe-inline'
  // est requis tant qu'on n'est pas passé à une CSP à nonce (rendu dynamique).
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self' ${supabaseHttp} ${supabaseWs}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    // La géolocalisation est utilisée par les preuves photo (GPS facultatif).
    value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  // CSP NON bloquante pour l'instant (report-only). À promouvoir après vérif.
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
