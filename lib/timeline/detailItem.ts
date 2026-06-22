// lib/timeline/detailItem.ts
//
// Lecture du détail complet d'un item de timeline + actions d'écriture.
// Les actions sont déclenchées par l'utilisateur depuis la modale (jamais par
// l'IA). Elles reprennent strictement la logique déjà présente sur chaque page
// métier (statut d'un fait, remboursement d'un frais, archivage d'un document…).
//
// Toute lecture/écriture passe par le client Supabase navigateur : la RLS
// limite déjà l'accès aux données de l'utilisateur connecté.

import { supabase } from "@/lib/supabase";
import type { TimelineSource } from "@/lib/timeline/types";

// --- Formes de détail par source (colonnes utiles à l'affichage / aux actions) ---

export type DetailFait = {
  source: "journal";
  id: string;
  titre: string | null;
  categorie: string | null;
  date_evenement: string | null;
  heure_evenement: string | null;
  description_factuelle: string | null;
  child_id: string | null;
  statut: string | null;
};

export type DetailFrais = {
  source: "frais";
  id: string;
  libelle: string | null;
  categorie: string | null;
  montant: number | null;
  part_autre: number | null;
  date_frais: string | null;
  rembourse: boolean | null;
  child_id: string | null;
  document_id: string | null;
  sans_justificatif: boolean | null;
};

export type DetailPension = {
  source: "pension";
  id: string;
  mois_du: string | null;
  montant_du: number | null;
  montant_paye: number | null;
  date_paiement: string | null;
  notes: string | null;
};

export type DetailDocument = {
  source: "document";
  id: string;
  libelle: string | null;
  categorie: string | null;
  chemin_fichier: string | null;
  date_document: string | null;
  child_id: string | null;
  etat: string | null;
};

export type DetailPreuve = {
  source: "preuve";
  id: string;
  titre: string | null;
  description: string | null;
  enfant_id: string | null;
  created_at: string | null;
  horodatage_statut: string | null;
  storage_path: string | null;
  nom_fichier: string | null;
};

export type DetailGarde = {
  source: "garde";
  id: string;
  type_garde: string | null;
  date_reference: string | null;
  enfant_id: string | null;
  notes: string | null;
};

export type DetailItem =
  | DetailFait
  | DetailFrais
  | DetailPension
  | DetailDocument
  | DetailPreuve
  | DetailGarde;

// Résultat d'une action d'écriture : message d'erreur ou null si succès.
export type ResultatAction = { error: string | null };

// --- Lecture du détail ---

export async function chargerDetailItem(
  source: TimelineSource,
  id: string,
): Promise<DetailItem | null> {
  switch (source) {
    case "journal": {
      const { data } = await supabase
        .from("events")
        .select(
          "id, titre, categorie, date_evenement, heure_evenement, description_factuelle, child_id, statut",
        )
        .eq("id", id)
        .single();
      return data ? { source, ...data } : null;
    }
    case "frais": {
      const { data } = await supabase
        .from("expenses")
        .select(
          "id, libelle, categorie, montant, part_autre, date_frais, rembourse, child_id, document_id, sans_justificatif",
        )
        .eq("id", id)
        .single();
      return data ? { source, ...data } : null;
    }
    case "pension": {
      const { data } = await supabase
        .from("pension_payments")
        .select("id, mois_du, montant_du, montant_paye, date_paiement, notes")
        .eq("id", id)
        .single();
      return data ? { source, ...data } : null;
    }
    case "document": {
      const { data } = await supabase
        .from("documents")
        .select("id, libelle, categorie, chemin_fichier, date_document, child_id, etat")
        .eq("id", id)
        .single();
      return data ? { source, ...data } : null;
    }
    case "preuve": {
      const { data } = await supabase
        .from("preuves_photo")
        .select(
          "id, titre, description, enfant_id, created_at, horodatage_statut, storage_path, nom_fichier",
        )
        .eq("id", id)
        .single();
      return data ? { source, ...data } : null;
    }
    case "garde": {
      const { data } = await supabase
        .from("garde_regles")
        .select("id, type_garde, date_reference, enfant_id, notes")
        .eq("id", id)
        .single();
      return data ? { source, ...data } : null;
    }
    default:
      return null;
  }
}

// --- Actions : journal (faits) ---

// Reprend changerStatut() de la page journal (brouillon <-> validé).
export async function changerStatutFait(
  id: string,
  nouveau: "valide" | "brouillon",
): Promise<ResultatAction> {
  const { error } = await supabase
    .from("events")
    .update({ statut: nouveau })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function supprimerFait(id: string): Promise<ResultatAction> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// --- Actions : frais ---

// Reprend basculerRembourse() de la page frais.
export async function basculerRemboursementFrais(
  id: string,
  rembourseActuel: boolean | null,
): Promise<ResultatAction> {
  const { error } = await supabase
    .from("expenses")
    .update({ rembourse: !rembourseActuel })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function supprimerFrais(id: string): Promise<ResultatAction> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// --- Actions : pension ---

// La page pension ne propose que la suppression d'un mois enregistré.
export async function supprimerPension(id: string): Promise<ResultatAction> {
  const { error } = await supabase
    .from("pension_payments")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}

// --- Actions : documents ---

// Reprend archiverDocument() de la page documents (conserver au coffre-fort).
export async function archiverDocument(id: string): Promise<ResultatAction> {
  const { error } = await supabase
    .from("documents")
    .update({ etat: "archive" })
    .eq("id", id);
  return { error: error?.message ?? null };
}

// Reprend supprimerDocument() : retire le fichier du stockage puis la ligne.
export async function supprimerDocument(
  id: string,
  cheminFichier: string | null,
): Promise<ResultatAction> {
  if (cheminFichier) {
    await supabase.storage.from("justificatifs").remove([cheminFichier]);
  }
  const { error } = await supabase.from("documents").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// --- Ouverture de fichiers (URL signées temporaires, buckets privés) ---

// Document / justificatif : bucket "justificatifs".
export async function urlSigneeDocument(
  cheminFichier: string | null,
): Promise<string | null> {
  if (!cheminFichier) return null;
  const { data } = await supabase.storage
    .from("justificatifs")
    .createSignedUrl(cheminFichier, 60);
  return data?.signedUrl ?? null;
}

// Justificatif lié à un frais : on résout d'abord le chemin via document_id.
export async function urlSigneeJustificatifFrais(
  documentId: string | null,
): Promise<string | null> {
  if (!documentId) return null;
  const { data } = await supabase
    .from("documents")
    .select("chemin_fichier")
    .eq("id", documentId)
    .single();
  return urlSigneeDocument(data?.chemin_fichier ?? null);
}

// Preuve photo : bucket "preuves".
export async function urlSigneePreuve(
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;
  const { data } = await supabase.storage
    .from("preuves")
    .createSignedUrl(storagePath, 60);
  return data?.signedUrl ?? null;
}
