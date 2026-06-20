// lib/useDeplacable.ts
"use client";

// Petit outil partage : rend un bouton flottant DEPLACABLE (souris + tactile),
// borne dans l'ecran, avec position memorisee (localStorage). Distingue un appui
// (clic) d'un deplacement, pour ne pas declencher l'action quand on deplace.

import { useEffect, useRef, useState } from "react";

export type Ancrage = { horizontal: "gauche" | "droite"; vertical: "haut" | "bas" };
type Coin = "bas-droite" | "bas-gauche";

const MARGE = 8; // distance minimale au bord
const SEUIL = 6; // px au-dela desquels c'est un deplacement, pas un appui

export function useDeplacable(cle: string, coinParDefaut: Coin, taille: number) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const aBougeRef = useRef(false);
  const startRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  function clamp(x: number, y: number) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: Math.min(Math.max(x, MARGE), w - taille - MARGE),
      y: Math.min(Math.max(y, MARGE), h - taille - MARGE),
    };
  }

  // Position initiale : sauvegardee si presente, sinon coin par defaut.
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let initial: { x: number; y: number } | null = null;
    try {
      const brut = localStorage.getItem(cle);
      if (brut) {
        const p = JSON.parse(brut);
        if (typeof p.x === "number" && typeof p.y === "number") initial = p;
      }
    } catch {}
    if (!initial) {
      const x = coinParDefaut === "bas-droite" ? w - taille - 24 : 24;
      const y = h - taille - 24;
      initial = { x, y };
    }
    const c = clamp(initial.x, initial.y);
    posRef.current = c;
    setPos(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle, taille]);

  function onPointerDown(e: React.PointerEvent) {
    const p = posRef.current;
    if (!p) return;
    aBougeRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY, ox: e.clientX - p.x, oy: e.clientY - p.y };

    function move(ev: PointerEvent) {
      const s = startRef.current;
      if (!s) return;
      if (Math.hypot(ev.clientX - s.x, ev.clientY - s.y) > SEUIL) aBougeRef.current = true;
      const c = clamp(ev.clientX - s.ox, ev.clientY - s.oy);
      posRef.current = c;
      setPos(c);
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      startRef.current = null;
      if (aBougeRef.current && posRef.current) {
        try {
          localStorage.setItem(cle, JSON.stringify(posRef.current));
        } catch {}
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  // Renvoie true (une seule fois) si le dernier geste etait un deplacement.
  function consommerDeplacement(): boolean {
    if (aBougeRef.current) {
      aBougeRef.current = false;
      return true;
    }
    return false;
  }

  // Ou ouvrir le panneau selon la place disponible autour du bouton.
  function ancrage(): Ancrage {
    const w = typeof window !== "undefined" ? window.innerWidth : 0;
    const h = typeof window !== "undefined" ? window.innerHeight : 0;
    const p = pos ?? { x: 0, y: h };
    return {
      horizontal: p.x > w / 2 ? "droite" : "gauche",
      vertical: p.y > h / 2 ? "haut" : "bas",
    };
  }

  return { pos, onPointerDown, consommerDeplacement, ancrage };
}
