"use client";

// components/SelecteurProcedure.tsx
//
// Sélecteur de la procédure active (mémorisation locale, pas de logique
// serveur). Deux usages :
//  - "compact" (par défaut) : tel qu'utilisé dans NavBar, comportement
//    historique inchangé (masqué tant qu'il n'y a pas au moins 2 procédures) ;
//  - "sidebar" : utilisé par AppSidebar, peut s'afficher dès une seule
//    procédure (afficherSiUnique) pour donner un contexte dossier lisible.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getProcedureActiveIdLocal,
  setProcedureActiveIdLocal,
} from "@/lib/procedureActive";

type Procedure = { id: string; etiquette: string | null };

export type SelecteurProcedureProps = {
  variant?: "compact" | "sidebar";
  /** Mode sidebar uniquement : afficher un contexte même avec une seule procédure. */
  afficherSiUnique?: boolean;
  /** Libellé du sélecteur (texte visible en compact, aria-label en sidebar). */
  libelle?: string;
};

function etiquetteDe(p: Procedure) {
  return p.etiquette?.trim() ? p.etiquette : "Procédure sans nom";
}

export default function SelecteurProcedure({
  variant = "compact",
  afficherSiUnique = false,
  libelle = "Procédure :",
}: SelecteurProcedureProps) {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [actif, setActif] = useState<string>("");
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("procedures")
        .select("id, etiquette")
        .order("created_at", { ascending: true });
      if (error || !data) {
        setCharge(true);
        return;
      }
      setProcedures(data);

      const memorisee = getProcedureActiveIdLocal();
      const existe = memorisee && data.some((p) => p.id === memorisee);
      setActif(existe ? (memorisee as string) : data[0]?.id ?? "");
      setCharge(true);
    })();
  }, []);

  function changer(id: string) {
    setProcedureActiveIdLocal(id);
    // Recharge pour que toutes les pages relisent la procédure active.
    window.location.reload();
  }

  // Mode sidebar avec affichage forcé : message neutre si aucune procédure,
  // mais seulement après le premier chargement (évite un flash pendant la
  // lecture Supabase, où procedures est encore vide par défaut).
  if (variant === "sidebar" && afficherSiUnique && procedures.length === 0) {
    if (!charge) return null;
    return (
      <p className="text-sm text-[var(--app-sidebar-procedure-text,var(--app-sidebar-text,var(--app-text-muted)))]">
        Aucune procédure sélectionnée.
      </p>
    );
  }

  const seuilMinimum = afficherSiUnique ? 1 : 2;
  if (procedures.length < seuilMinimum) return null;

  if (variant === "sidebar") {
    if (procedures.length === 1) {
      return (
        <p className="truncate text-sm font-medium text-[var(--app-sidebar-procedure-text,var(--app-sidebar-text,var(--app-text)))]">
          {etiquetteDe(procedures[0])}
        </p>
      );
    }

    return (
      <select
        value={actif}
        onChange={(e) => changer(e.target.value)}
        aria-label={libelle}
        className="w-full rounded-lg border px-2 py-1.5 text-sm
          border-[var(--app-sidebar-procedure-border,var(--app-sidebar-border,var(--app-border)))]
          bg-[var(--app-sidebar-procedure-bg,var(--app-sidebar-bg,var(--app-surface)))]
          text-[var(--app-sidebar-procedure-text,var(--app-sidebar-text,var(--app-text)))]"
      >
        {procedures.map((p) => (
          <option key={p.id} value={p.id}>
            {etiquetteDe(p)}
          </option>
        ))}
      </select>
    );
  }

  // variant === "compact" : comportement historique (NavBar), couleurs en tokens.
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-[var(--app-accent)]">{libelle}</span>
      <select
        value={actif}
        onChange={(e) => changer(e.target.value)}
        className="rounded border border-[var(--app-accent)]/40 bg-[var(--app-surface)] px-2 py-1 text-[var(--app-text)]"
      >
        {procedures.map((p) => (
          <option key={p.id} value={p.id}>
            {etiquetteDe(p)}
          </option>
        ))}
      </select>
    </label>
  );
}
