// Isole le "dispositif" d'une décision de justice : la partie qui fait foi,
// introduite par « PAR CES MOTIFS ». On ne s'appuie jamais sur les demandes des
// parties (situées avant) mais sur ce qui est effectivement décidé (après).

export type CiblageDispositif = {
    texte: string; // le texte à transmettre à l'IA
    dispositifTrouve: boolean;
    tronque: boolean; // true si on a dû couper pour respecter la limite
    avertissement: string | null;
  };
  
  // Limite de caractères envoyés à l'IA (alignée sur /api/ia/extraire).
  const LIMITE_CARACTERES = 5000;
  
  export function ciblerDispositif(texteComplet: string): CiblageDispositif {
    const texte = (texteComplet ?? "").trim();
  
    // Recherche tolérante de « PAR CES MOTIFS » : insensible à la casse et au
    // nombre d'espaces / sauts de ligne entre les mots (utile pour l'OCR).
    const motif = /par\s+ces\s+motifs/gi;
    let dernierIndex = -1;
    let m: RegExpExecArray | null;
    while ((m = motif.exec(texte)) !== null) {
      // On garde la DERNIÈRE occurrence : le dispositif opérant est en fin de décision.
      dernierIndex = m.index;
    }
  
    let extrait: string;
    let dispositifTrouve: boolean;
    if (dernierIndex !== -1) {
      extrait = texte.slice(dernierIndex).trim();
      dispositifTrouve = true;
    } else {
      // Pas de marqueur : le dispositif est généralement en fin de document.
      // On envoie la fin du texte, en signalant que l'analyse peut être moins fiable.
      extrait = texte.slice(Math.max(0, texte.length - LIMITE_CARACTERES)).trim();
      dispositifTrouve = false;
    }
  
    let tronque = false;
    if (extrait.length > LIMITE_CARACTERES) {
      extrait = extrait.slice(0, LIMITE_CARACTERES);
      tronque = true;
    }
  
    let avertissement: string | null = null;
    if (!dispositifTrouve) {
      avertissement =
        "La partie « PAR CES MOTIFS » n'a pas été trouvée clairement. L'analyse peut être " +
        "moins fiable : vérifiez attentivement les propositions.";
    } else if (tronque) {
      avertissement =
        "Le dispositif est très long : seule sa première partie a été analysée. Vérifiez " +
        "que rien d'important n'a été laissé de côté.";
    }
  
    return { texte: extrait, dispositifTrouve, tronque, avertissement };
  }