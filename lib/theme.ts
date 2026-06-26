// lib/theme.ts
//
// Système de thèmes visuels de l'application (habillage uniquement). Le thème
// choisi est appliqué via l'attribut data-theme sur <html> et persisté en
// localStorage. Les tokens CSS correspondants vivent dans app/globals.css.
//
// Aucune logique métier ici. Persistance Supabase volontairement non incluse
// dans cette passe (pas de migration) ; l'API ci-dessous est prête à être
// étendue (un setter unique appliquerTheme).

export const THEMES = [
  {
    id: "classique-bleu",
    label: "Classique bleu",
    description: "Clair, moderne et rassurant.",
    pastilles: ["#2563EB", "#DBE4F3", "#0F172A"],
  },
  {
    id: "ivoire-greffe",
    label: "Ivoire & Greffe",
    description: "Clair, institutionnel, inspiré des dossiers de greffe.",
    pastilles: ["#F7F2EA", "#D5BE98", "#875A20"],
  },
  {
    id: "noir-or-sombre",
    label: "Noir & Or sombre",
    description: "Sombre, premium, noir charbon et accents or.",
    pastilles: ["#080B10", "#2D3542", "#D8AA4F"],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_DEFAUT: ThemeId = "classique-bleu";
export const CLE_THEME = "parent-preuve-theme";

const IDS = THEMES.map((t) => t.id) as readonly string[];

function estThemeConnu(x: unknown): x is ThemeId {
  return typeof x === "string" && IDS.includes(x);
}

/** Lit le thème mémorisé localement (valeur prudente par défaut). */
export function lireTheme(): ThemeId {
  if (typeof window === "undefined") return THEME_DEFAUT;
  try {
    const brut = window.localStorage.getItem(CLE_THEME);
    return estThemeConnu(brut) ? brut : THEME_DEFAUT;
  } catch {
    return THEME_DEFAUT;
  }
}

/** Applique le thème sur <html> et le persiste en localStorage. */
export function appliquerTheme(theme: ThemeId) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
  try {
    window.localStorage.setItem(CLE_THEME, theme);
  } catch {
    // Stockage indisponible (mode privé, quota) : on ignore sans bloquer.
  }
}
