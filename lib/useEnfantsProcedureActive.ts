"use client";

// Hook partagé : résout les enfants de la PROCÉDURE ACTIVE et gère la sélection.
//
// Encapsule le motif commun à /calendrier et /calendrier/avance :
//   - chargement via getEnfantsDeProcedureActive() (cloisonnement procédure) ;
//   - garde de chargement pour ne pas afficher l'état vide trop tôt ;
//   - enfant sélectionné par défaut = le premier de la liste.
//
// Ne requête JAMAIS de règle calendrier ici : seulement la liste des enfants de
// la procédure active. Le cloisonnement multi-procédures repose entièrement sur
// getEnfantsDeProcedureActive() (procedure_id), inchangé.

import { useEffect, useState } from "react";
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";

export type EnfantCalendrier = { id: string; prenom_ou_alias: string };

export function useEnfantsProcedureActive() {
  const [enfants, setEnfants] = useState<EnfantCalendrier[]>([]);
  const [enfantId, setEnfantId] = useState("");
  // true tant que la résolution de la procédure active n'est pas terminée.
  const [chargementEnfants, setChargementEnfants] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      const data = await getEnfantsDeProcedureActive();
      if (annule) return;
      // setState après await (pas de cascade synchrone).
      setEnfants(data);
      if (data.length > 0) setEnfantId((prec) => prec || data[0].id);
      setChargementEnfants(false);
    })();
    return () => {
      annule = true;
    };
  }, []);

  return { enfants, enfantId, setEnfantId, chargementEnfants };
}
