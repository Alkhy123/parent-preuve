// tests-e2e/seed.spec.ts
//
// Remplit automatiquement le dossier de test via l'UI déployée, avec le scénario
// prioritaire de la checklist : DEUX procédures distinctes (deux autres parents),
// un enfant par procédure, et des données distinctes (fait + frais) par procédure.
// Objectif : pouvoir vérifier ensuite VISUELLEMENT le cloisonnement A/B, l'export,
// le calendrier et le copilote, sans tout saisir à la main.
//
// Préfixe [TEST] partout pour repérer/nettoyer (le nettoyage se fait via
// `npm run e2e:compte -- --delete`, qui supprime le compte de test et ses données).
//
// Couvre par procédure : détails/jugement, fait, frais, règle de pension,
// paiement de pension, calendrier de garde + zone vacances, justificatif
// (coffre-fort) et preuve photo (upload + empreinte + horodatage + GPS).

import { test } from "@playwright/test";
import {
  creerProcedureEtEnfant,
  idProcedure,
  activerProcedure,
  remplirProcedure,
  ajouterFait,
  ajouterFrais,
  ajouterReglePension,
  configurerCalendrier,
  ajouterDocument,
  ajouterPaiementPension,
  ajouterPreuve,
  creerImageTest,
} from "./helpers";

const P = "[TEST]";

test("seed : deux procédures avec données distinctes", async ({ page }) => {
  const image = creerImageTest();

  // 1) Création des deux procédures + un enfant chacune.
  await creerProcedureEtEnfant(page, `${P} Parent A`, `${P} Enfant A`);
  await creerProcedureEtEnfant(page, `${P} Parent B`, `${P} Enfant B`);

  const idA = await idProcedure(page, `${P} Parent A`);
  const idB = await idProcedure(page, `${P} Parent B`);

  // 2) Procédure A : détails + un fait + un frais qui lui sont propres.
  await activerProcedure(page, idA);
  await remplirProcedure(page, {
    nom: "Dupont",
    prenom: "Alex",
    juridiction: "Tribunal judiciaire de Lyon",
    dateJugement: "2024-03-15",
  });
  await ajouterFait(page, {
    titre: `${P} Retard A`,
    description: "Enfant A remis avec 45 minutes de retard.",
  });
  await ajouterFrais(page, { libelle: `${P} Cantine A`, montant: "120" });
  await ajouterReglePension(page, {
    montant: "300",
    debiteur: "autre",
    jourEcheance: "5",
  });
  await ajouterPaiementPension(page, {
    mois: "2026-05",
    montantDu: "300",
    montantPaye: "150",
  });
  await configurerCalendrier(page, { dateReference: "2026-06-05", zone: "A" });
  await ajouterDocument(page, {
    libelle: `${P} Facture A`,
    fichierPath: image,
  });
  await ajouterPreuve(page, {
    titre: `${P} Photo A`,
    description: "État du logement, procédure A.",
    fichierPath: image,
  });

  // 3) Procédure B : détails + un fait + un frais différents.
  await activerProcedure(page, idB);
  await remplirProcedure(page, {
    nom: "Martin",
    prenom: "Camille",
    juridiction: "Tribunal judiciaire de Paris",
    dateJugement: "2023-09-01",
  });
  await ajouterFait(page, {
    titre: `${P} Absence B`,
    description: "Enfant B non présenté au week-end prévu.",
  });
  await ajouterFrais(page, { libelle: `${P} Orthodontie B`, montant: "300" });
  await ajouterReglePension(page, {
    montant: "450",
    debiteur: "autre",
    jourEcheance: "10",
  });
  await ajouterPaiementPension(page, {
    mois: "2026-05",
    montantDu: "450",
    montantPaye: "450",
  });
  await configurerCalendrier(page, { dateReference: "2026-06-12", zone: "C" });
  await ajouterDocument(page, {
    libelle: `${P} Facture B`,
    fichierPath: image,
  });
  await ajouterPreuve(page, {
    titre: `${P} Photo B`,
    description: "État du logement, procédure B.",
    fichierPath: image,
  });
});
