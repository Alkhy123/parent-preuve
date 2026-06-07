// src/lib/dossierCalculs.ts
//
// Brique D — étape D2 : les calculs du dossier, au même endroit.
//
// Avant, le « reste dû » des frais était calculé à la main dans la page d'export,
// et la pension n'avait aucun solde. Ce fichier centralise ces calculs pour que
// l'export ET l'accueil affichent EXACTEMENT les mêmes chiffres.
//
// Comme controleDossier.ts, ce sont des fonctions pures : pas de Supabase ici.
// Chaque écran récupère ses données, puis appelle ces fonctions.

// ── Frais ─────────────────────────────────────────────────────────────────────

/** Forme minimale d'un frais nécessaire aux calculs. */
export type FraisCalcul = {
    part_autre: number | string; // part demandée à l'autre parent
    rembourse: boolean;
  };
  
  export type TotauxFrais = {
    /** Somme des parts demandées, tous frais confondus. */
    totalDemande: number;
    /** Somme des parts déjà remboursées. */
    totalRembourse: number;
    /** Ce qui reste dû (parts non remboursées). */
    resteDu: number;
  };
  
  /** Calcule les totaux de frais à partir d'une liste de frais. */
  export function totauxFrais(frais: FraisCalcul[]): TotauxFrais {
    let totalDemande = 0;
    let totalRembourse = 0;
  
    for (const f of frais) {
      const part = Number(f.part_autre) || 0;
      totalDemande += part;
      if (f.rembourse) totalRembourse += part;
    }
  
    return {
      totalDemande,
      totalRembourse,
      resteDu: totalDemande - totalRembourse,
    };
  }
  
  // ── Pension ───────────────────────────────────────────────────────────────────
  
  /** Forme minimale d'un paiement de pension nécessaire aux calculs. */
  export type PensionCalcul = {
    montant_du: number | string;
    montant_paye: number | string;
  };
  
  export type TotauxPension = {
    /** Somme des montants dus sur la période. */
    totalDu: number;
    /** Somme des montants effectivement payés. */
    totalPaye: number;
    /**
     * Solde cumulé : dû − payé.
     *   > 0  → il reste de la pension impayée
     *   = 0  → tout est réglé
     *   < 0  → trop-perçu (l'autre parent a payé plus que dû)
     */
    solde: number;
  };
  
  /** Calcule les totaux de pension à partir d'une liste de paiements. */
  export function totauxPension(pension: PensionCalcul[]): TotauxPension {
    let totalDu = 0;
    let totalPaye = 0;
  
    for (const p of pension) {
      totalDu += Number(p.montant_du) || 0;
      totalPaye += Number(p.montant_paye) || 0;
    }
  
    return {
      totalDu,
      totalPaye,
      solde: totalDu - totalPaye,
    };
  }
  
  // ── Affichage ─────────────────────────────────────────────────────────────────
  
  /** Formate un nombre en euros (ex. 30 → « 30,00 € »). */
  export function euros(n: number) {
    return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  }

  // ── Reste dû global (pension + frais) ───────────────────────────────────────

  export type ResteDuGlobal = {
    /** Pension impayée (uniquement la part positive du solde dû − payé). */
    pensionResteDu: number;
    /** Éventuel trop-perçu de pension (solde négatif), exposé à part. */
    pensionTropPercu: number;
    /** Frais non remboursés. */
    fraisResteDu: number;
    /** Somme factuelle des montants encore dus (pension impayée + frais non remboursés). */
    total: number;
  };

  /**
   * Combine le solde de pension et le reste dû des frais en un seul montant
   * « encore dû », de façon strictement factuelle.
   *
   * Choix volontaire : un éventuel trop-perçu de pension (solde négatif) n'est PAS
   * soustrait des frais dus — masquer des frais non remboursés derrière une avance
   * de pension serait trompeur. Le trop-perçu est donc exposé séparément.
   */
  export function resteDuGlobal(pensionSolde: number, fraisResteDu: number): ResteDuGlobal {
    const pensionRD = Math.max(pensionSolde, 0);
    const tropPercu = Math.max(-pensionSolde, 0);
    const fraisRD = Math.max(fraisResteDu, 0);
    return {
      pensionResteDu: pensionRD,
      pensionTropPercu: tropPercu,
      fraisResteDu: fraisRD,
      total: pensionRD + fraisRD,
    };
  }