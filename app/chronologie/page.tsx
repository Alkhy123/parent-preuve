"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Chronologie from "@/components/Chronologie";
import {
  fusionnerChronologie,
  type EntreeChronologie,
  type FaitSource,
  type FraisSource,
  type PensionSource,
  type PreuveSource,
} from "@/lib/chronologie";
import {
  getProcedureActiveId,
  getEnfantsDeProcedureActive,
  type EnfantProcedure,
} from "@/lib/procedureActive";

export default function ChronologiePage() {
  const [entrees, setEntrees] = useState<EntreeChronologie[]>([]);
  const [enfants, setEnfants] = useState<EnfantProcedure[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      // Procédure active + ses enfants (sert au cloisonnement dans la fusion).
      const [procId, listeEnfants] = await Promise.all([
        getProcedureActiveId(),
        getEnfantsDeProcedureActive(),
      ]);

      // On charge les 4 sources (la RLS limite déjà à l'utilisateur).
      // Le cloisonnement par procédure est fait par fusionnerChronologie.
      const [evRes, frRes, peRes, prRes] = await Promise.all([
        supabase
          .from("events")
          .select(
            "id, titre, categorie, date_evenement, heure_evenement, description_factuelle, child_id",
          ),
        supabase
          .from("expenses")
          .select("id, libelle, categorie, montant, date_frais, rembourse, child_id"),
        supabase
          .from("pension_payments")
          .select("id, mois_du, montant_du, montant_paye, date_paiement, notes, procedure_id"),
        supabase
          .from("preuves_photo")
          .select("id, titre, description, enfant_id, created_at, horodatage_statut"),
      ]);

      const resultat = fusionnerChronologie(
        {
          faits: (evRes.data ?? []) as FaitSource[],
          frais: (frRes.data ?? []) as FraisSource[],
          pensions: (peRes.data ?? []) as PensionSource[],
          preuves: (prRes.data ?? []) as PreuveSource[],
        },
        { procedureId: procId, enfantIds: listeEnfants.map((e) => e.id) },
      );

      setEnfants(listeEnfants);
      setEntrees(resultat);
      setChargement(false);
    }
    charger();
  }, []);

  return (
    <main>
      <PageHeader
        eyebrow="Mon dossier"
        title="Chronologie"
        subtitle="Vos faits, frais, paiements de pension et preuves de la procédure active, réunis sur une seule frise datée."
      />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {chargement ? (
          <p className="text-texte-doux">Chargement…</p>
        ) : (
          <Chronologie entrees={entrees} enfants={enfants} />
        )}
      </div>
    </main>
  );
}