// components/ui-themes/ThemeTokens.tsx
//
// Tokens de mise en page propres à chaque style d'interface (board10 /
// vue-ensemble) : densité, largeur de carte, esprit général. Ne pas
// confondre avec le système de thème de couleurs existant (lib/theme.ts +
// app/theme-tokens.css), qui reste inchangé et continue de s'appliquer via
// data-theme indépendamment du style d'interface.
//
// Ce module exporte des constantes consommées par les squelettes de preview
// (components/ui-preview/*) ; il ne rend rien lui-même.

import type { InterfaceStyle } from "@/lib/ui-preferences/types";

export type InterfaceStyleTokens = {
  label: string;
  esprit: string;
  cardRadius: string;
  density: "compacte" | "confortable";
};

export const INTERFACE_STYLE_TOKENS: Record<InterfaceStyle, InterfaceStyleTokens> = {
  board10: {
    label: "Board 10",
    esprit: "Cockpit : priorités du jour, action principale, assistant visible.",
    cardRadius: "1.5rem",
    density: "confortable",
  },
  "vue-ensemble": {
    label: "Vue d'ensemble",
    esprit: "Dashboard synthétique : indicateurs, progression, vue globale.",
    cardRadius: "1rem",
    density: "compacte",
  },
};

// Composant volontairement inerte : sert de point d'extension si une
// injection de styles globaux par interfaceStyle devient nécessaire plus
// tard (actuellement les tokens sont consommés directement par les
// composants via INTERFACE_STYLE_TOKENS).
export default function ThemeTokens() {
  return null;
}
