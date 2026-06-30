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
  "/exporter",
  "/copilote",
];

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
