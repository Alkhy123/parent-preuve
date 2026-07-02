"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getProcedureActiveIdLocal,
  setProcedureActiveIdLocal,
} from "@/lib/procedureActive";

type Procedure = { id: string; etiquette: string | null };

export default function BandeauProcedure() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [actif, setActif] = useState<string>("");
  const [pret, setPret] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("procedures")
        .select("id, etiquette")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setProcedures(data);
        const memorisee = getProcedureActiveIdLocal();
        const existe = memorisee && data.some((p) => p.id === memorisee);
        setActif(existe ? (memorisee as string) : data[0]?.id ?? "");
      }
      setPret(true);
    })();
  }, []);

  // Rien tant que pas chargé, ou si aucune procédure (déconnecté / dossier vide).
  if (!pret || procedures.length === 0) return null;

  function libelle(p: Procedure) {
    return p.etiquette?.trim() ? p.etiquette : "Procédure sans nom";
  }

  function changer(id: string) {
    setProcedureActiveIdLocal(id);
    window.location.reload();
  }

  const actuelle = procedures.find((p) => p.id === actif);

  return (
    <div className="border-b border-[#C2A24C]/40 bg-[#F8F6F1]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 py-2">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#C2A24C]" />
          <span className="whitespace-nowrap text-[#5A6473]">Dossier en cours :</span>
          <span className="truncate font-display font-semibold text-[#15233F]">
            {actuelle ? libelle(actuelle) : "—"}
          </span>
        </div>

        {procedures.length >= 2 && (
          <label className="flex min-w-0 items-center gap-2 text-sm">
            <span className="whitespace-nowrap text-[#5A6473]">Changer :</span>
            <select
              value={actif}
              onChange={(e) => changer(e.target.value)}
              className="min-w-0 max-w-full rounded border border-[#C2A24C]/40 bg-white px-2 py-1 text-[#1F2733]"
            >
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {libelle(p)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
