// components/app/appShellNavigation.ts
//
// Liste partagée des routes couvertes par le shell applicatif (AppSidebar +
// NavBar) : sert à construire la navigation de la sidebar desktop et à
// décider quand masquer l'ancienne NavBar en desktop pour éviter la double
// navigation. Aucune logique métier ici, seulement des chemins.

export type AppNavItem = {
  href: string;
  label: string;
};

export type AppNavGroupe = {
  /** Libellé affiché en en-tête de section. */
  label: string;
  /** Route principale du hub — détermine si le groupe est actif. */
  hrefPrincipal: string;
  /** Sous-liens affichés quand le groupe est ouvert. */
  liens: AppNavItem[];
};

// "/" matche en exact uniquement ; les autres routes couvrent aussi leurs
// sous-routes (ex. /documents/coffre-fort reste une route AppShell).
export const APP_SHELL_ROUTES: string[] = [
  "/",
  "/journal",
  "/frais",
  "/documents",
  "/preuves",
  "/calendrier",
  "/compte",
  "/onboarding",
  "/collecter",
  "/organiser",
  "/exporter",
  "/copilote",
];

// Groupes structurés utilisés par AppSidebar (desktop) et éventuellement
// d'autres surfaces. NavBar mobile conserve ses propres GROUPES pour l'instant.
export const APP_NAV_GROUPS: AppNavGroupe[] = [
  {
    label: "Collecter",
    hrefPrincipal: "/collecter",
    liens: [
      { href: "/collecter", label: "Vue Collecter" },
      { href: "/collecter/rapide", label: "Collecte rapide" },
      { href: "/journal", label: "Noter un fait" },
      { href: "/preuves", label: "Ajouter une preuve" },
      { href: "/documents", label: "Importer un document" },
      { href: "/frais", label: "Ajouter un frais" },
      { href: "/pension", label: "Paiement de pension" },
      { href: "/calendrier", label: "Ajouter une échéance" },
    ],
  },
  {
    label: "Organiser",
    hrefPrincipal: "/organiser",
    liens: [
      { href: "/organiser", label: "Vue Organiser" },
      { href: "/organiser/brouillons", label: "Brouillons locaux" },
      { href: "/dossier", label: "Dossier" },
      { href: "/enfants", label: "Enfants" },
      { href: "/procedure", label: "Procédure et jugement" },
      { href: "/rattacher", label: "Éléments à rattacher" },
      { href: "/documents/coffre-fort", label: "Coffre-fort" },
      { href: "/chronologie", label: "Chronologie" },
      { href: "/calendrier", label: "Calendrier" },
    ],
  },
  {
    label: "Exporter",
    hrefPrincipal: "/exporter",
    liens: [
      { href: "/exporter", label: "Vue Exporter" },
      { href: "/exporter/checklist", label: "Checklist export" },
      { href: "/exporter/chronologie", label: "Chronologie" },
      { href: "/exporter/note-synthese", label: "Note de synthèse" },
      { href: "/exporter/courriers", label: "Courriers factuels" },
      { href: "/exporter/dossier-avocat", label: "Dossier avocat" },
      { href: "/exporter/pdf", label: "Export PDF" },
    ],
  },
];

// Conservé pour compatibilité descendante. AppSidebar utilise désormais
// APP_NAV_GROUPS ; ce tableau n'est plus rendu dans la sidebar.
export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: "/", label: "Tableau de bord" },
  { href: "/journal", label: "Journal" },
  { href: "/frais", label: "Frais" },
  { href: "/documents", label: "Documents" },
  { href: "/preuves", label: "Preuves" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/exporter", label: "Exporter" },
  { href: "/copilote", label: "Copilote" },
  { href: "/compte", label: "Compte" },
];

function estCheminCouvert(route: string, pathname: string): boolean {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(route + "/");
}

// Vrai si pathname correspond à une route AppShell (exacte ou sous-route).
export function estRouteAppShell(pathname: string): boolean {
  return APP_SHELL_ROUTES.some((route) => estCheminCouvert(route, pathname));
}

/**
 * Renvoie le label du groupe actif pour un pathname donné.
 * Priorité : hrefPrincipal (préfixe) > sous-lien (exact). Premier match gagne.
 * Retourne null si aucun groupe ne correspond (ex. "/" ou routes orphelines).
 */
export function groupeActifPour(pathname: string): string | null {
  for (const groupe of APP_NAV_GROUPS) {
    // Vérifie si le pathname est sous la route principale du groupe.
    if (
      pathname === groupe.hrefPrincipal ||
      pathname.startsWith(groupe.hrefPrincipal + "/")
    ) {
      return groupe.label;
    }
  }
  // Second passage : correspondance exacte sur les sous-liens.
  for (const groupe of APP_NAV_GROUPS) {
    if (groupe.liens.some((l) => l.href !== "/" && pathname === l.href)) {
      return groupe.label;
    }
  }
  return null;
}
