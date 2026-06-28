// lib/theme.ts
//
// Système de thèmes visuels de l'application (habillage uniquement).
// Le thème choisi est appliqué via l'attribut data-theme et persisté en localStorage.
//
// Aucune logique métier ici.
// Persistance Supabase volontairement non incluse dans cette passe.

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
  {
    id: "marine-laiton",
    label: "Marine & Laiton",
    description: "Institutionnel, contrasté, accents laiton.",
    pastilles: ["#15263F", "#F1F4F8", "#B08D3C"],
  },
  {
    id: "bordeaux-juridique",
    label: "Bordeaux juridique",
    description: "Profond, solennel, esprit cabinet.",
    pastilles: ["#581620", "#F5F1EC", "#A9852F"],
  },
  {
    id: "ardoise-parchemin",
    label: "Ardoise & Parchemin",
    description: "Sobre, doux, gris charbon raffiné.",
    pastilles: ["#2D343C", "#EAE6DC", "#9C8456"],
  },
  {
    id: "vert-ministere",
    label: "Vert ministère",
    description: "Institutionnel, calme, ton officiel.",
    pastilles: ["#16382A", "#F2F3EC", "#A98F3C"],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_DEFAUT: ThemeId = "classique-bleu";
export const CLE_THEME = "parent-preuve-theme";

const IDS = THEMES.map((theme) => theme.id) as readonly string[];

function estThemeConnu(valeur: unknown): valeur is ThemeId {
  return typeof valeur === "string" && IDS.includes(valeur);
}

export function lireTheme(): ThemeId {
  if (typeof window === "undefined") {
    return THEME_DEFAUT;
  }

  try {
    const brut = window.localStorage.getItem(CLE_THEME);
    return estThemeConnu(brut) ? brut : THEME_DEFAUT;
  } catch {
    return THEME_DEFAUT;
  }
}

export function appliquerTheme(theme: ThemeId) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }

  try {
    window.localStorage.setItem(CLE_THEME, theme);
  } catch {
    // Stockage indisponible : on ignore sans bloquer l'application.
  }
}
