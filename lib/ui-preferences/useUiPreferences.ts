"use client";

// lib/ui-preferences/useUiPreferences.ts
//
// Accès au contexte de préférences d'interface. Doit être utilisé sous
// UiPreferencesProvider (monté dans app/layout.tsx). Expose comfortMode,
// interfaceStyle et leurs setters.

import { useContext } from "react";

import { UiPreferencesContext } from "@/components/ui-preferences/UiPreferencesProvider";

export function useUiPreferences() {
  const contexte = useContext(UiPreferencesContext);

  if (!contexte) {
    throw new Error(
      "useUiPreferences doit être utilisé à l'intérieur de UiPreferencesProvider.",
    );
  }

  return contexte;
}
