// src/app/dossier/extraire/page.tsx
"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ConsentementIA from "@/components/ConsentementIA";
import ReglePension from "@/components/ReglePension";
import RegleFrais from "@/components/RegleFrais";
import RegleDVH from "@/components/RegleDVH";
import RegleDecision from "@/components/RegleDecision";

// Type d'un champ renvoyé par la route /api/ia/extraire
type Champ = {
  valeur: number | string | boolean | null;
  confiance: "haute" | "moyenne" | "absente";
  citation: string | null;
};
type Section = {
  table: string;
  champs: Record<string, Champ>;
  avertissements: string[];
};
// Nouvelle forme de la route : { sections: { pension, frais } }
type Resultat = {
    sections: {
      pension: Section;
      frais: Section;
      dvh: Section;
      decision: Section;
    };
  };

// Valeurs pré-remplies à passer à <ReglePension>
type ValeursReglePension = {
  montant_base: number | null;
  debiteur: string;
  jour_echeance: number | null;
  paiement_avance: boolean;
  inclut_vacances: boolean;
  intermediation: boolean;
  indexation_active: boolean;
  indexation_jour: number | null;
  indexation_mois: number | null;
  indexation_premiere_date: string | null;
  indexation_indice: string | null;
};

// Valeurs pré-remplies à passer à <RegleFrais> (format "règle", comme la pension)
type ValeursRegleFrais = {
  categories_couvertes: string | null;
  part_moi_pourcentage: number | null;
  part_autre_pourcentage: number | null;
  accord_prealable_requis: boolean;
  accord_prealable_seuil: number | null;
  delai_remboursement_jours: number | null;
  justificatif_obligatoire: boolean;
  s_ajoute_a_pension: boolean;
};

// Petits lecteurs sûrs : on ne fait jamais confiance aveuglément au JSON.
function lireNombre(c?: Champ): number | null {
  return typeof c?.valeur === "number" ? c.valeur : null;
}
function lireBool(c?: Champ): boolean {
  return c?.valeur === true; // null ou absent => false
}
function lireTexte(c?: Champ): string | null {
  return typeof c?.valeur === "string" ? c.valeur : null;
}

// Convertit le JSON pension en valeurs prêtes pour <ReglePension>
function versReglePension(champs: Record<string, Champ>): ValeursReglePension {
  const debiteur = champs.debiteur?.valeur;
  return {
    montant_base: lireNombre(champs.montant_base),
    debiteur: debiteur === "moi" || debiteur === "autre" ? debiteur : "autre",
    jour_echeance: lireNombre(champs.jour_echeance),
    paiement_avance: lireBool(champs.paiement_avance),
    inclut_vacances: lireBool(champs.inclut_vacances),
    intermediation: lireBool(champs.intermediation),
    indexation_active: lireBool(champs.indexation_active),
    indexation_jour: lireNombre(champs.indexation_jour),
    indexation_mois: lireNombre(champs.indexation_mois),
    indexation_premiere_date: lireTexte(champs.indexation_premiere_date),
    indexation_indice: lireTexte(champs.indexation_indice),
  };
}

// Convertit le JSON frais en valeurs prêtes pour <RegleFrais>.
// IMPORTANT : justificatif_obligatoire est null par défaut dans le JSON
// (l'IA ne dit pas false quand le texte se tait). Côté formulaire, le défaut
// manuel est "true" → on ne force donc PAS false : null retombe sur le défaut
// du composant (true) via le ?? côté RegleFrais. Ici on transmet le booléen
// seulement s'il a été explicitement extrait.
function versRegleFrais(champs: Record<string, Champ>): ValeursRegleFrais {
  return {
    categories_couvertes: lireTexte(champs.categories_couvertes),
    part_moi_pourcentage: lireNombre(champs.part_moi_pourcentage),
    part_autre_pourcentage: lireNombre(champs.part_autre_pourcentage),
    accord_prealable_requis: lireBool(champs.accord_prealable_requis),
    accord_prealable_seuil: lireNombre(champs.accord_prealable_seuil),
    delai_remboursement_jours: lireNombre(champs.delai_remboursement_jours),
    // null si non extrait → RegleFrais retombera sur son défaut (true)
    justificatif_obligatoire:
      champs.justificatif_obligatoire?.valeur === false ? false : true,
    s_ajoute_a_pension: lireBool(champs.s_ajoute_a_pension),
  };
}

// Valeurs pré-remplies à passer à <RegleDVH> (format "règle", chaînes/booléens).
type ValeursRegleDVH = {
    type_dvh: string | null;
    titulaire: string | null;
    lieu_visite: string | null;
    presence_tiers: boolean;
    tiers_details: string | null;
    frequence: string | null;
    duree: string | null;
    duree_limitee: boolean;
    clause_renonciation: boolean;
    clause_renonciation_details: string | null;
    remise_lieu: string | null;
    vacances_partage: string | null;
  };
  
  function versRegleDVH(champs: Record<string, Champ>): ValeursRegleDVH {
    return {
      type_dvh: lireTexte(champs.type_dvh),
      titulaire: lireTexte(champs.titulaire),
      lieu_visite: lireTexte(champs.lieu_visite),
      presence_tiers: lireBool(champs.presence_tiers),
      tiers_details: lireTexte(champs.tiers_details),
      frequence: lireTexte(champs.frequence),
      duree: lireTexte(champs.duree),
      duree_limitee: lireBool(champs.duree_limitee),
      clause_renonciation: lireBool(champs.clause_renonciation),
      clause_renonciation_details: lireTexte(champs.clause_renonciation_details),
      remise_lieu: lireTexte(champs.remise_lieu),
      vacances_partage: lireTexte(champs.vacances_partage),
    };
  }
  // Valeurs pré-remplies à passer à <RegleDecision> (format "règle").
type ValeursRegleDecision = {
    type_decision: string | null;
    provisoire: boolean;
    execution_provisoire: boolean;
    susceptible_appel: boolean;
    frappee_appel: boolean;
    appel_date: string | null;
    appel_juridiction: string | null;
    date_decision: string | null;
    date_signification: string | null;
    date_audience_prochaine: string | null;
    mise_en_etat: boolean;
    mise_en_etat_details: string | null;
  };
  
  function versRegleDecision(champs: Record<string, Champ>): ValeursRegleDecision {
    return {
      type_decision: lireTexte(champs.type_decision),
      provisoire: lireBool(champs.provisoire),
      execution_provisoire: lireBool(champs.execution_provisoire),
      susceptible_appel: lireBool(champs.susceptible_appel),
      frappee_appel: lireBool(champs.frappee_appel),
      appel_date: lireTexte(champs.appel_date),
      appel_juridiction: lireTexte(champs.appel_juridiction),
      date_decision: lireTexte(champs.date_decision),
      date_signification: lireTexte(champs.date_signification),
      date_audience_prochaine: lireTexte(champs.date_audience_prochaine),
      mise_en_etat: lireBool(champs.mise_en_etat),
      mise_en_etat_details: lireTexte(champs.mise_en_etat_details),
    };
  }

export default function ExtrairePage() {
  const [texte, setTexte] = useState("");
  const [analyse, setAnalyse] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState<Resultat | null>(null);

  async function analyser() {
    setErreur("");
    if (texte.trim().length === 0) {
      setErreur("Collez d'abord la description de votre jugement.");
      return;
    }
    setAnalyse(true);
    try {
      const reponse = await fetch("/api/ia/extraire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte }),
      });
      const data = await reponse.json();
      if (!reponse.ok) {
        setErreur(data?.erreur ?? "L'analyse a échoué.");
        setAnalyse(false);
        return;
      }
      setResultat(data);
    } catch {
      setErreur("Impossible de contacter le service d'analyse.");
    }
    setAnalyse(false);
  }

  const champ =
    "w-full rounded-lg border border-black/10 bg-white p-3 text-[#1F2733] focus:border-[#C2A24C] focus:outline-none";

  // Avertissements regroupés des deux sections (pour le bandeau global)
  const avertissements = resultat
    ? [
        ...resultat.sections.pension.avertissements.map((a) => `Pension : ${a}`),
        ...resultat.sections.frais.avertissements.map((a) => `Frais : ${a}`),
        ...resultat.sections.dvh.avertissements.map((a) => `DVH : ${a}`),
        ...resultat.sections.decision.avertissements.map((a) => `Décision : ${a}`),
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#F8F6F1]">
      <PageHeader
        eyebrow="Mon dossier"
        title="Analyse du jugement"
        subtitle="Décrivez votre jugement avec vos mots : l'assistant propose les règles de pension et de frais, que vous vérifiez et validez."
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <ConsentementIA fonctionnalite="extraction">
          {/* Étape 1 : description libre + analyse */}
          {!resultat && (
            <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
              <label className="text-sm font-medium text-[#15233F]">
                Description de votre situation (telle que dans le dispositif du jugement)
              </label>
              <p className="mt-1 text-sm text-[#1F2733]/60">
                Exemple : « Le jugement dit que je verse 180 € par mois pour notre fils,
                payables avant le 5 de chaque mois. Les frais exceptionnels sont partagés
                par moitié, avec accord préalable au-delà de 200 €. »
                N'indiquez pas de données de santé.
              </p>
              <textarea
                className={`${champ} mt-3`}
                rows={6}
                maxLength={5000}
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                placeholder="Collez ou rédigez la description ici…"
              />
              <p className="mt-1 text-right text-xs text-[#1F2733]/50">
                {texte.length} / 5000
              </p>

              {erreur && <p className="mt-3 text-sm text-red-600">{erreur}</p>}

              <button
                onClick={analyser}
                disabled={analyse}
                className="mt-4 rounded-lg bg-[#15233F] px-5 py-2 text-[#F8F6F1] transition hover:bg-[#1d2f52] disabled:opacity-50"
              >
                {analyse ? "Analyse en cours…" : "Analyser"}
              </button>
            </div>
          )}

          {/* Étape 2 : relecture + validation */}
          {resultat && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#C2A24C]/40 bg-[#C2A24C]/10 p-4 text-sm">
                <p className="font-medium text-[#15233F]">
                  Propositions de l'assistant — à vérifier
                </p>
                <p className="mt-1 text-[#1F2733]/70">
                  L'assistant ne fait que proposer. Relisez chaque règle, corrigez si besoin,
                  puis enregistrez et validez chacune séparément. Rien n'est écrit tant que
                  vous n'enregistrez pas.
                </p>
                {avertissements.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-[#1F2733]/80">
                    {avertissements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Règle de pension pré-remplie */}
              <ReglePension
                valeursInitiales={versReglePension(resultat.sections.pension.champs)}
                origineIA
              />

              {/* Règle de frais pré-remplie */}
              <RegleFrais
                valeursInitiales={versRegleFrais(resultat.sections.frais.champs)}
                origineIA
              />

              {/* Modalités de DVH pré-remplies */}
              <RegleDVH
                valeursInitiales={versRegleDVH(resultat.sections.dvh.champs)}
                origineIA
              />

              {/* Nature et échéances de la décision pré-remplies */}
              <RegleDecision
                valeursInitiales={versRegleDecision(resultat.sections.decision.champs)}
                origineIA
              />

              <button
                onClick={() => {
                  setResultat(null);
                  setTexte("");
                }}
                className="rounded-lg border border-black/10 px-5 py-2 text-sm text-[#1F2733] hover:bg-white"
              >
                Recommencer une analyse
              </button>
            </div>
          )}
        </ConsentementIA>
      </div>
    </main>
  );
}