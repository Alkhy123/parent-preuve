"use client";

// components/theme/ThemeProvider.tsx
//
// Applique le thème mémorisé au montage.
// Le script inline dans app/layout.tsx limite le flash visuel au rechargement.
// Ce composant ne rend rien.

import { useEffect } from "react";

import { appliquerTheme, lireTheme } from "@/lib/theme";

export default function ThemeProvider() {
  useEffect(() => {
    appliquerTheme(lireTheme());
  }, []);

  return null;
}
