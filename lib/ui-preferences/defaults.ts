// lib/ui-preferences/defaults.ts
//
// Valeurs par défaut sûres si aucune préférence n'est encore enregistrée.
// guided + board10 correspond au parcours le plus accompagné, adapté à une
// première utilisation.

import type { UiPreferences } from "./types";

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  comfortMode: "guided",
  interfaceStyle: "board10",
};
