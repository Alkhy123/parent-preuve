// lib/limiteurAppels.ts
// Garde-fou de fréquence EN MÉMOIRE pour les routes IA.
// But : empêcher qu'un même appelant martèle une route et brûle le quota Mistral.
// Limites assumées : l'historique est en mémoire du serveur. Il repart à zéro si le
// serveur redémarre, et n'est PAS partagé entre plusieurs instances (ex. Vercel
// multi-lambda). Suffisant en local et en petit déploiement ; à renforcer plus tard.

type Fenetre = { debut: number; nombre: number };

// Un "casier" par appelant (clé = IP). Vit tant que le serveur tourne.
const journaux = new Map<string, Fenetre>();

export type ResultatLimite = {
  autorise: boolean;
  resteSecondes: number; // délai avant de pouvoir réessayer (0 si autorisé)
};

// Vérifie et enregistre un appel. Retourne s'il est autorisé.
export function verifierLimite(
  cle: string,
  maxAppels: number,
  fenetreSecondes: number
): ResultatLimite {
  const maintenant = Date.now();
  const fenetreMs = fenetreSecondes * 1000;
  const actuel = journaux.get(cle);

  // Pas d'historique, ou fenêtre expirée -> on repart à 1 appel.
  if (!actuel || maintenant - actuel.debut >= fenetreMs) {
    // Petit ménage opportuniste pour éviter que la Map grossisse sans fin.
    if (journaux.size > 500) {
      for (const [k, v] of journaux) {
        if (maintenant - v.debut >= fenetreMs) journaux.delete(k);
      }
    }
    journaux.set(cle, { debut: maintenant, nombre: 1 });
    return { autorise: true, resteSecondes: 0 };
  }

  // Encore sous le plafond dans la fenêtre en cours -> on incrémente.
  if (actuel.nombre < maxAppels) {
    actuel.nombre += 1;
    return { autorise: true, resteSecondes: 0 };
  }

  // Plafond atteint -> refus, avec le temps restant avant remise à zéro.
  const resteMs = fenetreMs - (maintenant - actuel.debut);
  return { autorise: false, resteSecondes: Math.ceil(resteMs / 1000) };
}

// Trouve une clé d'appelant à partir des en-têtes (IP, même derrière un proxy).
export function cleAppelant(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim(); // 1re IP = client réel
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "local"; // en dev sur localhost, souvent aucun en-tête : clé commune
}