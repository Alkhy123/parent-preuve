"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getProcedureActiveIdLocal,
  setProcedureActiveIdLocal,
} from "@/lib/procedureActive";

type Procedure = { id: string; etiquette: string | null };

export default function SelecteurProcedure() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [actif, setActif] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("procedures")
        .select("id, etiquette")
        .order("created_at", { ascending: true });
      if (error || !data) return;
      setProcedures(data);

      const memorisee = getProcedureActiveIdLocal();
      const existe = memorisee && data.some((p) => p.id === memorisee);
      setActif(existe ? (memorisee as string) : data[0]?.id ?? "");
    })();
  }, []);

  // N'apparaît que s'il y a au moins 2 procédures à départager.
  if (procedures.length < 2) return null;

  function libelle(p: Procedure) {
    return p.etiquette?.trim() ? p.etiquette : "Procédure sans nom";
  }

  function changer(id: string) {
    setProcedureActiveIdLocal(id);
    // Recharge pour que toutes les pages relisent la procédure active.
    window.location.reload();
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-[#C2A24C]">Procédure :</span>
      <select
        value={actif}
        onChange={(e) => changer(e.target.value)}
        className="rounded border border-[#C2A24C]/40 bg-[#15233F] px-2 py-1 text-[#F8F6F1]"
      >
        {procedures.map((p) => (
          <option key={p.id} value={p.id}>
            {libelle(p)}
          </option>
        ))}
      </select>
    </label>
  );
}
