// components/app/appShellNavigation.ts
//
// Source unique de vérité de la navigation applicative (AppSidebar desktop +
// drawer NavBar mobile). Sert à construire la sidebar/drawer et à décider quand
// masquer l'ancienne NavBar en desktop pour éviter la double navigation.
// Aucune logique métier ici, seulement des chemins.
//
// Structure « hybride » : chaque groupe expose des liens PRINCIPAUX (structure
// épurée mise en avant) et des liens SECONDAIRES (repliés derrière « Voir plus »)
// afin de préserver l'accès à toutes les pages existantes sans les orpheliner.

export type AppNavItem = {
  href: string;
  label: string;
};

export type AppNavGroupe = {
  /** Libellé affiché en en-tête de section. */
  label: string;
  /** Route principale du hub — détermine si le groupe est actif. */
  hrefPrincipal: string;
  /** Liens mis en avant, toujours visibles quand le groupe est ouvert. */
  liensPrincipaux: AppNavItem[];
  /** Liens secondaires, repliés derrière « Voir plus ». */
  liensSecondaires: AppNavItem[];
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

// Groupes structurés partagés par AppSidebar (desktop) et le drawer NavBar
// (mobile). L'ordre et les libellés suivent la structure de navigation
// obligatoire (Lot 13A).
export const APP_NAV_GROUPS: AppNavGroupe[] = [
  {
    label: "Collecter",
    hrefPrincipal: "/collecter",
    liensPrincipaux: [
      { href: "/journal", label: "Journal factuel" },
      { href: "/frais", label: "Frais" },
      { href: "/documents", label: "Documents" },
      { href: "/preuves", label: "Preuves photo" },
    ],
    liensSecondaires: [
      { href: "/collecter/rapide", label: "Collecte rapide" },
      { href: "/pension", label: "Paiement de pension" },
      { href: "/collecter", label: "Vue Collecter" },
    ],
  },
  {
    label: "Organiser",
    hrefPrincipal: "/organiser",
    liensPrincipaux: [
      { href: "/calendrier", label: "Calendrier" },
      { href: "/copilote", label: "Copilote" },
    ],
    liensSecondaires: [
      { href: "/organiser", label: "Vue Organiser" },
      { href: "/chronologie", label: "Chronologie" },
      { href: "/organiser/brouillons", label: "Brouillons locaux" },
      { href: "/documents/coffre-fort", label: "Coffre-fort" },
      { href: "/dossier", label: "Dossier" },
      { href: "/enfants", label: "Enfants" },
      { href: "/procedure", label: "Procédure et jugement" },
      { href: "/rattacher", label: "Éléments à rattacher" },
      { href: "/reformuler", label: "Reformuler un message" },
      { href: "/implication-parentale", label: "Implication parentale" },
    ],
  },
  {
    label: "Exporter",
    hrefPrincipal: "/exporter",
    liensPrincipaux: [{ href: "/exporter", label: "Exporter" }],
    liensSecondaires: [
      { href: "/exporter/checklist", label: "Checklist export" },
      { href: "/exporter/chronologie", label: "Chronologie" },
      { href: "/exporter/note-synthese", label: "Note de synthèse" },
      { href: "/exporter/courriers", label: "Courriers factuels" },
      { href: "/exporter/dossier-avocat", label: "Dossier avocat" },
      { href: "/exporter/pdf", label: "Export PDF" },
    ],
  },
];

/** Tous les liens d'un groupe (principaux puis secondaires). */
export function tousLiensGroupe(groupe: AppNavGroupe): AppNavItem[] {
  return [...groupe.liensPrincipaux, ...groupe.liensSecondaires];
}

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
 * Priorité : hrefPrincipal (préfixe) > lien exact (principal ou secondaire).
 * Premier match gagne. Retourne null si aucun groupe ne correspond
 * (ex. "/" ou routes orphelines).
 */
export function groupeActifPour(pathname: string): string | null {
  for (const groupe of APP_NAV_GROUPS) {
    if (
      pathname === groupe.hrefPrincipal ||
      pathname.startsWith(groupe.hrefPrincipal + "/")
    ) {
      return groupe.label;
    }
  }
  // Second passage : correspondance exacte sur les liens (principaux + secondaires).
  for (const groupe of APP_NAV_GROUPS) {
    if (tousLiensGroupe(groupe).some((l) => l.href !== "/" && pathname === l.href)) {
      return groupe.label;
    }
  }
  return null;
}

/** Vrai si la route active se trouve dans les liens secondaires du groupe. */
export function routeDansSecondaires(
  groupe: AppNavGroupe,
  pathname: string,
): boolean {
  return groupe.liensSecondaires.some(
    (l) => l.href !== "/" && (pathname === l.href || pathname.startsWith(l.href + "/")),
  );
}
