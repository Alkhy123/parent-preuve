// lib/hashServeur.ts
// Calcul SHA-256 côté SERVEUR pour la vérification d'intégrité des preuves.
//
// Pourquoi : l'empreinte stockée dans preuves_photo.empreinte_sha256 est
// calculée côté CLIENT (navigateur) avec crypto.subtle. Pour vérifier qu'on
// peut s'y fier, le serveur retélécharge le fichier réellement stocké et
// recalcule son empreinte avec cette fonction, puis compare les deux.
//
// Format de sortie : 64 caractères hexadécimaux en MINUSCULES.
// C'est exactement le format produit côté client
// (octets -> toString(16).padStart(2,"0") -> join("")), donc les deux
// empreintes sont directement comparables.
//
// Réservé au serveur : ce module importe "crypto" de Node. Ne jamais l'importer
// dans un composant client.

import { createHash } from "crypto";

/**
 * Calcule l'empreinte SHA-256 d'un contenu binaire.
 * @param contenu Le contenu du fichier (ArrayBuffer, typiquement issu d'un
 *                téléchargement depuis le Storage Supabase).
 * @returns L'empreinte en hexadécimal minuscule (64 caractères).
 */
export function calculerSha256Hex(contenu: ArrayBuffer): string {
  const buffer = Buffer.from(contenu);
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Compare deux empreintes SHA-256 sans tenir compte de la casse ni des espaces.
 * Renvoie true si elles coïncident.
 * @param a Première empreinte.
 * @param b Seconde empreinte.
 */
export function empreintesConcordent(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}