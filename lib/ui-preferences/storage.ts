// lib/ui-preferences/storage.ts
//
// Persistance des préférences d'interface. Stockage navigateur uniquement
// pour cette passe (localStorage), même pattern que lib/theme.ts.
//
// Point d'extension futur : sauvegarderPreferencesDistantes() est prévu pour
// une synchronisation Supabase par utilisateur, non implémentée dans ce lot.

import { DEFAULT_UI_PREFERENCES } from "./defaults";
import type { ComfortMode, InterfaceStyle, UiPreferences } from "./types";

export const CLE_UI_PREFERENCES = "parent-preuve-ui-preferences";

const COMFORT_MODES: readonly ComfortMode[] = ["guided", "comfort"];
const INTERFACE_STYLES: readonly InterfaceStyle[] = ["board10", "vue-ensemble"];

function estComfortMode(valeur: unknown): valeur is ComfortMode {
  return typeof valeur === "string" && (COMFORT_MODES as readonly string[]).includes(valeur);
}

function estInterfaceStyle(valeur: unknown): valeur is InterfaceStyle {
  return typeof valeur === "string" && (INTERFACE_STYLES as readonly string[]).includes(valeur);
}

export function lireUiPreferences(): UiPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_UI_PREFERENCES;
  }

  try {
    const brut = window.localStorage.getItem(CLE_UI_PREFERENCES);
    if (!brut) return DEFAULT_UI_PREFERENCES;

    const parsed = JSON.parse(brut) as Partial<UiPreferences> | null;

    return {
      comfortMode: estComfortMode(parsed?.comfortMode)
        ? parsed.comfortMode
        : DEFAULT_UI_PREFERENCES.comfortMode,
      interfaceStyle: estInterfaceStyle(parsed?.interfaceStyle)
        ? parsed.interfaceStyle
        : DEFAULT_UI_PREFERENCES.interfaceStyle,
    };
  } catch {
    return DEFAULT_UI_PREFERENCES;
  }
}

export function ecrireUiPreferences(preferences: UiPreferences) {
  try {
    window.localStorage.setItem(CLE_UI_PREFERENCES, JSON.stringify(preferences));
  } catch {
    // Stockage indisponible (mode privé, quota...) : on ignore sans bloquer l'application.
  }
}

export function appliquerAttributsUiPreferences(preferences: UiPreferences) {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-comfort-mode", preferences.comfortMode);
  document.documentElement.setAttribute("data-interface-style", preferences.interfaceStyle);
}

// Point d'extension futur : persistance Supabase par utilisateur. À brancher
// ici sans changer l'API du hook useUiPreferences (ex. appel depuis le
// provider lors d'un changement, en plus de l'écriture locale).
export async function sauvegarderPreferencesDistantes(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _preferences: UiPreferences,
): Promise<void> {
  // Non implémenté dans ce lot.
}
