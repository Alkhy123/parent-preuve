// lib/ui-preferences/types.ts
//
// Types du système de préférences d'interface (confort d'utilisation).
// Deux réglages indépendants :
// - comfortMode : niveau d'accompagnement (infobulles, aide contextuelle).
// - interfaceStyle : organisation visuelle des écrans (cockpit vs dashboard).
// Le style visuel de couleurs (thème) reste géré séparément par lib/theme.ts.

export type ComfortMode = "guided" | "comfort";

export type InterfaceStyle = "board10" | "vue-ensemble";

export interface UiPreferences {
  comfortMode: ComfortMode;
  interfaceStyle: InterfaceStyle;
}

export interface UiPreferencesContextValue extends UiPreferences {
  setComfortMode: (mode: ComfortMode) => void;
  setInterfaceStyle: (style: InterfaceStyle) => void;
}
