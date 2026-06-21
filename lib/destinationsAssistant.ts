// lib/destinationsAssistant.ts
// Liste FERMEE des pages vers lesquelles l'assistant peut orienter.
// Source unique : l'IA ne renvoie qu'une "cle" d'ici ; le code connait l'URL reelle.
// Reprend les pages de la barre de navigation.

export type Destination = {
  cle: string;
  href: string;
  label: string;
  description: string;
};

export const DESTINATIONS: Destination[] = [
  // Suivi quotidien
  { cle: "journal", href: "/journal", label: "Noter un fait",
    description: "Noter un fait date : retard, absence, incident, echange, evenement concernant les enfants." },
  { cle: "frais", href: "/frais", label: "Ajouter une depense",
    description: "Enregistrer une depense partagee (cantine, activite, sante) et la part demandee a l'autre parent." },
  { cle: "pension", href: "/pension", label: "Paiement de pension",
    description: "Enregistrer un versement de pension alimentaire : montant du, montant paye, date." },
  { cle: "calendrier", href: "/calendrier", label: "Calendrier de garde",
    description: "Voir le calendrier des periodes de garde." },
  // Dossier & regles
  { cle: "socle", href: "/dossier", label: "Vos informations",
    description: "Renseigner l'etat civil du declarant." },
  { cle: "enfants", href: "/enfants", label: "Enfants",
    description: "Ajouter ou modifier les enfants." },
  { cle: "procedure", href: "/procedure", label: "Autre parent et jugement",
    description: "Gerer la procedure : autre parent et reference du jugement." },
  { cle: "importer-jugement", href: "/dossier/importer-pdf", label: "Importer un jugement",
    description: "Importer le PDF du jugement." },
  { cle: "analyser-jugement", href: "/dossier/extraire", label: "Extraire les regles du jugement",
    description: "Extraire les regles du jugement : pension, frais, droits de visite." },
  // Pieces & preuves
  { cle: "documents", href: "/documents", label: "Documents et justificatifs",
    description: "Televerser un document ou un justificatif : facture, attestation, courrier recu." },
  { cle: "coffre-fort", href: "/documents/coffre-fort", label: "Pieces rangees",
    description: "Consulter les pieces deja rangees." },
  { cle: "preuves", href: "/preuves", label: "Preuves photo horodatees",
    description: "Prendre ou deposer une photo horodatee comme element date." },
  // Syntheses & exports
  { cle: "resume-mois", href: "/resume-mois", label: "Resume du mois",
    description: "Voir un recapitulatif du mois en cours." },
  { cle: "chronologie", href: "/chronologie", label: "Chronologie",
    description: "Voir tous les elements ranges dans l'ordre du temps." },
  { cle: "courriers", href: "/courriers", label: "Courriers factuels",
    description: "Preparer un courrier type : relance pension, remboursement de frais, etc." },
  { cle: "note-synthese", href: "/note-synthese", label: "Note de synthese factuelle",
    description: "Preparer une note factuelle a remettre a un professionnel du droit." },
  { cle: "export", href: "/export", label: "Export PDF",
    description: "Generer le dossier en PDF pour une periode donnee." },
  { cle: "reformuler", href: "/reformuler", label: "Reformulation",
    description: "Reformuler un message de facon neutre avant de l'archiver ou de l'envoyer." },
  { cle: "implication-parentale", href: "/implication-parentale", label: "Implication parentale",
    description: "Regrouper les elements lies a l'implication de chaque parent." },
];
