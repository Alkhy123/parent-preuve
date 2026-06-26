"use client";

// components/theme/ThemeProvider.tsx
//
// Applique le thème mémorisé au montage (cohérence client). Le no-flash au
// rechargement est assuré par un petit script inline dans app/layout.tsx.
// Ce composant ne rend rien.

import { useEffect } from "react";
import { appliquerTheme, lireTheme } from "@/lib/theme";

export default function ThemeProvider() {
  useEffect(() => {
    appliquerTheme(lireTheme());
  }, []);
  return null;
}
