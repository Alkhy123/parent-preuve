"use client";

// components/onboarding/EtapeResumeFinal.tsx
//
// Etape 8 : recapitulatif de l'etat du dossier construit pendant l'assistant.
// Lecture seule (helpers existants) : on n'affirme jamais qu'un dossier est
// juridiquement complet, on indique seulement ce qui est renseigne ou a completer.
// Le bouton final termine l'assistant et ramene vers le tableau de bord.

import { useEffect, useState } from "react";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { chargerEtatDossier } from "@/lib/etatDossier";
import { getEtatConfigurationDossier } from "@/lib/etatConfiguration";

type Ton = "ok" | "attention" | "neutre";
type Ligne = { cle: string; label: string; valeur: string; ton: Ton };

const BADGE: Record<Ton, string> = {
  ok: "badge-succes",
  attention: "badge-attention",
  neutre: "badge-neutre",
};

export default function EtapeResumeFinal({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [lignes, setLignes] = useState<Ligne[] | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      const [donnees, config] = await Promise.all([
        chargerEtatDossier("", ""),
        getEtatConfigurationDossier(),
      ]);

      // Calendrier : au moins une regle de garde (simple OU avancee) sur un
      // enfant de la procedure. On regarde les deux tables car le calendrier
      // avance (calendar_advanced_rules) n'ecrit pas dans garde_regles.
      let calendrierOk = false;
      const procId = await getProcedureActiveId();
      if (procId) {
        const { data: enf } = await supabase
          .from("children")
          .select("id")
          .eq("procedure_id", procId);
        const ids = (enf ?? []).map((e) => e.id);
        if (ids.length > 0) {
          const [simple, avance] = await Promise.all([
            supabase
              .from("garde_regles")
              .select("id", { count: "exact", head: true })
              .in("enfant_id", ids)
              .eq("actif", true),
            supabase
              .from("calendar_advanced_rules")
              .select("id", { count: "exact", head: true })
              .in("enfant_id", ids)
              .eq("actif", true),
          ]);
          calendrierOk = (simple.count ?? 0) > 0 || (avance.count ?? 0) > 0;
        }
      }

      const socle = donnees.socle;
      const n = donnees.nombreEnfants;

      const liste: Ligne[] = [
        {
          cle: "declarant",
          label: "Vos informations",
          valeur: socle?.parent1Complet ? "Complétées" : "À compléter",
          ton: socle?.parent1Complet ? "ok" : "neutre",
        },
        {
          cle: "autre-parent",
          label: "Autre parent / procédure",
          valeur: socle?.parent2Complet ? "Renseigné" : "À compléter",
          ton: socle?.parent2Complet ? "ok" : "neutre",
        },
        {
          cle: "enfants",
          label: "Enfants",
          valeur: n > 0 ? `${n} enfant${n > 1 ? "s" : ""}` : "Aucun enfant",
          ton: n > 0 ? "ok" : "neutre",
        },
        {
          cle: "jugement",
          // Renseigné si la référence est saisie OU si les règles du jugement
          // ont été validées (mêmes critères que l'assistant d'accueil).
          label: "Jugement",
          valeur:
            socle?.referenceJugementRenseignee || config.jugement === "analyse"
              ? "Renseigné"
              : "À compléter",
          ton:
            socle?.referenceJugementRenseignee || config.jugement === "analyse"
              ? "ok"
              : "neutre",
        },
        {
          cle: "regles",
          label: "Règles",
          valeur:
            config.jugement === "analyse"
              ? "Validées"
              : config.jugement === "a_valider"
                ? "À vérifier"
                : "À compléter",
          ton:
            config.jugement === "analyse"
              ? "ok"
              : config.jugement === "a_valider"
                ? "attention"
                : "neutre",
        },
        {
          cle: "calendrier",
          label: "Calendrier de garde",
          valeur: calendrierOk ? "Configuré" : "À compléter",
          ton: calendrierOk ? "ok" : "neutre",
        },
      ];

      if (!annule) setLignes(liste);
    })();
    return () => {
      annule = true;
    };
  }, []);

  return (
    <div>
      <p className="text-sm text-texte-doux">
        Voici l&apos;état de votre dossier. Tout reste modifiable à tout moment depuis
        votre tableau de bord et les pages dédiées.
      </p>

      {lignes === null ? (
        <p className="mt-4 text-sm text-texte-doux">Préparation du résumé…</p>
      ) : (
        <ul className="mt-4 divide-y divide-[#15233F]/10">
          {lignes.map((l) => (
            <li key={l.cle} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm text-texte">{l.label}</span>
              <span className={`badge ${BADGE[l.ton]}`}>{l.valeur}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-texte-doux">
        Les points « À compléter » ne bloquent pas : vous pouvez y revenir quand vous
        le souhaitez.
      </p>

      <PiedEtape
        onPrecedent={onPrecedent}
        estPremiere={estPremiere}
        onContinuer={onContinuer}
        libelleContinuer={
          estDerniere ? "Accéder à mon tableau de bord" : "Continuer"
        }
      />
    </div>
  );
}
