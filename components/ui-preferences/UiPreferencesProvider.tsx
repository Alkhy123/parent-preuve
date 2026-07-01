"use client";

// components/ui-preferences/UiPreferencesProvider.tsx
//
// Fournit le contexte global des préférences d'interface (comfortMode,
// interfaceStyle). Monté une seule fois dans app/layout.tsx, à côté de
// ThemeProvider. Ne contient aucune logique métier : purement de la
// préférence d'affichage, persistée en localStorage (lib/ui-preferences/storage.ts).

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";

import { DEFAULT_UI_PREFERENCES } from "@/lib/ui-preferences/defaults";
import {
  appliquerAttributsUiPreferences,
  ecrireUiPreferences,
  lireUiPreferences,
} from "@/lib/ui-preferences/storage";
import type {
  ComfortMode,
  InterfaceStyle,
  UiPreferences,
  UiPreferencesContextValue,
} from "@/lib/ui-preferences/types";

export const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(null);

export default function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UiPreferences>(DEFAULT_UI_PREFERENCES);

  useEffect(() => {
    // Sécurité : applique la préférence mémorisée si le script no-flash de
    // layout.tsx n'a pas pu s'exécuter (ex. JS temporairement indisponible
    // au premier rendu). N'écrit pas en storage, la valeur y est déjà.
    // Lecture localStorage impossible côté serveur : la synchronisation doit
    // se faire après montage, d'où le setState dans cet effet ponctuel.
    const stockees = lireUiPreferences();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferences(stockees);
    appliquerAttributsUiPreferences(stockees);
  }, []);

  const setComfortMode = useCallback((comfortMode: ComfortMode) => {
    setPreferences((actuelles) => {
      const suivantes = { ...actuelles, comfortMode };
      appliquerAttributsUiPreferences(suivantes);
      ecrireUiPreferences(suivantes);
      return suivantes;
    });
  }, []);

  const setInterfaceStyle = useCallback((interfaceStyle: InterfaceStyle) => {
    setPreferences((actuelles) => {
      const suivantes = { ...actuelles, interfaceStyle };
      appliquerAttributsUiPreferences(suivantes);
      ecrireUiPreferences(suivantes);
      return suivantes;
    });
  }, []);

  return (
    <UiPreferencesContext.Provider
      value={{ ...preferences, setComfortMode, setInterfaceStyle }}
    >
      {children}
    </UiPreferencesContext.Provider>
  );
}
