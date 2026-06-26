// lib/onboarding/metadata.ts
//
// Metadonnees PUREMENT VISUELLES de l'assistant de demarrage : textes d'aide
// affiches autour de chaque etape (sous-titre, encart d'aide, bloc "pourquoi",
// conseil, sous-titre du rail de progression).
//
// Aucune logique metier ici, aucune dependance runtime. Ces textes habillent le
// wizard existant sans modifier le comportement des etapes. Ton prudent : pas
// de promesse juridique, pas de garantie de recevabilite.

import { type EtapeOnboarding } from "@/lib/onboarding/types";

export type MetaEtape = {
  /** Sous-titre affiche sous le titre dans la grande carte centrale. */
  objectif: string;
  /** Encart d'aide (bandeau doux) place sous le titre. */
  aide: string;
  /** Bloc "Pourquoi cette etape est utile ?" de la colonne d'aide. */
  pourquoi: string;
  /** Conseil pratique (encart vert) dans la colonne d'aide. */
  conseil: string;
  /** Seconde ligne dans le rail de progression (libelle court). */
  railSousTitre: string;
};

export const META_ONBOARDING: Record<EtapeOnboarding, MetaEtape> = {
  "vos-informations": {
    objectif: "Renseigner les informations de base du déclarant.",
    aide: "Ces informations pourront être reprises dans vos courriers et synthèses. Vous pourrez les modifier plus tard.",
    pourquoi:
      "Ces informations servent de base à votre dossier et peuvent être reprises dans vos courriers et synthèses.",
    conseil:
      "Commencez avec les informations essentielles. Vous pourrez compléter ensuite.",
    railSousTitre: "Vos informations",
  },
  procedure: {
    objectif: "Créer ou choisir le dossier concerné.",
    aide: "Une procédure permet de séparer les situations et d'éviter de mélanger les informations lorsque plusieurs dossiers existent.",
    pourquoi:
      "Une procédure regroupe les éléments d'un même dossier. Cela évite de mélanger les informations lorsque plusieurs dossiers existent.",
    conseil:
      "Si un enfant concerne un autre parent, créez une procédure différente.",
    railSousTitre: "Dossier concerné",
  },
  "autre-parent": {
    objectif: "Identifier l'autre parent concerné par cette procédure.",
    aide: "Ces informations servent à organiser le dossier et à éviter les mélanges entre procédures.",
    pourquoi:
      "Ces informations permettent d'identifier l'autre parent dans le cadre de cette procédure. Tous les champs sont facultatifs au démarrage, vous pourrez les compléter plus tard.",
    conseil:
      "Si un autre enfant concerne un autre parent différent, il devra être rattaché à une autre procédure.",
    railSousTitre: "Informations",
  },
  enfants: {
    objectif: "Ajouter les enfants concernés par cette procédure.",
    aide: "Les enfants doivent être rattachés à la bonne procédure pour que les frais, événements et calendriers restent cohérents.",
    pourquoi:
      "Rattacher chaque enfant à la bonne procédure garde les frais, événements et calendriers cohérents.",
    conseil: "Ajoutez uniquement les enfants concernés par cette procédure.",
    railSousTitre: "Enfants concernés",
  },
  jugement: {
    objectif: "Indiquer si une décision de justice existe.",
    aide: "Cette étape permet d'indiquer si une décision existe et de noter ses principales références.",
    pourquoi:
      "Noter les références d'une décision aide à organiser le dossier. L'application ne remplace pas une analyse juridique.",
    conseil:
      "L'application vous aide à organiser les informations, mais ne remplace pas une analyse juridique.",
    railSousTitre: "Décision de justice",
  },
  "validation-regles": {
    objectif: "Relire les règles importantes du dossier.",
    aide: "Cette étape permet de vérifier les règles importantes : pension, frais, droit de visite et décisions.",
    pourquoi:
      "Relire les règles importantes (pension, frais, droit de visite, décisions) évite les oublis avant de poursuivre.",
    conseil: "Relisez toujours les règles avant validation.",
    railSousTitre: "Pension, frais, DVH",
  },
  calendrier: {
    objectif: "Préparer les rappels liés à la garde ou aux visites.",
    aide: "Le calendrier aide à suivre les prochaines échéances et les dates importantes.",
    pourquoi:
      "Un calendrier clair aide à suivre les prochaines échéances et les dates importantes.",
    conseil: "Commencez simplement. Vous pourrez ajuster ensuite.",
    railSousTitre: "Garde et visites",
  },
  resume: {
    objectif: "Voir ce qui est renseigné et ce qui reste à compléter.",
    aide: "Le résumé vous montre les informations déjà renseignées et les éléments encore à compléter.",
    pourquoi:
      "Le résumé montre les informations déjà renseignées et les éléments encore à compléter.",
    conseil: "Les éléments à compléter ne bloquent pas l'utilisation.",
    railSousTitre: "Récapitulatif",
  },
};
