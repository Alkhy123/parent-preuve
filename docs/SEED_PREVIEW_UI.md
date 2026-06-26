# Seed local de la preview UI

Ce script remplit une preview Parent Preuve avec des donnees fictives, en pilotant
l'interface avec Playwright. Il sert a tester l'ergonomie des pages remplies sans
saisir manuellement tout un dossier.

Le script ecrit dans le compte de test utilise. N'utilisez jamais de vraies
donnees personnelles.

## Variables d'environnement

Les secrets restent locaux. Ne les commitez jamais.

Variables requises :

```powershell
$env:PARENT_PREUVE_PREVIEW_URL="https://votre-preview-vercel.example"
$env:PARENT_PREUVE_TEST_EMAIL="compte-test@example.invalid"
$env:PARENT_PREUVE_TEST_PASSWORD="mot-de-passe-local"
```

Le script lit aussi `.env.local` si ces variables y sont deja definies. Ce fichier
doit rester ignore par git.

Variable facultative pour choisir le dossier des captures :

```powershell
$env:PARENT_PREUVE_SEED_SCREENSHOTS_DIR="C:\tmp\parent-preuve-seed-preview"
```

Par defaut, les captures sont ecrites dans :

```text
C:\tmp\parent-preuve-seed-preview
```

## Commande

```powershell
npm.cmd run seed:preview-ui
```

## Donnees fictives creees

Le script cree une procedure et un enfant de test prefixes par `[TEST UI <run>]`.

Journal :

- Absence scolaire
- Retard de remise d'enfant
- Message important recu
- Difficulte d'execution d'un droit de visite
- Rendez-vous medical

Frais :

- Orthopedie 25 EUR
- Podologue 50 EUR
- Pharmacie 18,40 EUR
- Activite scolaire 32 EUR
- Vetement 45 EUR

Documents :

- Facture pediatre
- Certificat medical
- Courrier ecole
- Capture echange parent

Preuves photo :

- Photo fictive de sac d'ecole
- Photo fictive de justificatif
- Photo fictive de lieu de rendez-vous

Le fichier envoye est une image PNG fictive 1x1 generee localement dans le dossier
temporaire des captures.

## Parcours couvert

Le script :

- ouvre la preview ;
- se connecte avec le compte de test ;
- accepte le RGPD si la modale apparait ;
- cree une procedure et un enfant fictifs ;
- ajoute les evenements, frais, documents et preuves photo ;
- visite `/calendrier` et `/calendrier/avance`, et verifie que la procedure
  active y est reconnue (un enfant detecte) ; sinon un avertissement clair est
  ajoute au rapport et un diagnostic est capture ;
- verifie de maniere legere (non bloquante) que le bouton « Options avancees »
  de `/calendrier` ouvre bien l'encart replie ; sinon un avertissement est ajoute
  au rapport ;
- revisite `/journal`, `/frais`, `/documents` et `/preuves` pour verifier que les
  donnees apparaissent ;
- pour chaque preuve photo, attend un signal de succes reel a l'ecran
  (bandeau « Élément enregistré ») avant de quitter la page, puis verifie que la
  preuve apparait reellement dans `/preuves`. En cas d'absence, un diagnostic
  liste les titres, boutons et textes contenant preuve/photo/fichier/image/`[TEST UI]` ;
- capture des screenshots apres les modules principaux ;
- affiche un rapport console.

## Precautions

- Ne jamais utiliser un compte contenant de vraies donnees personnelles.
- Ne jamais stocker l'email, le mot de passe ou une cle Supabase dans le depot.
- Ne pas lancer ce script sur un compte utilisateur reel.
- Le script ne supprime rien et ne fait aucune action destructive.
- Les donnees et fichiers ajoutes devront etre nettoyes via les outils de test ou
  la suppression du compte de test si necessaire.

## Limites connues

- Le script depend des libelles visibles de l'interface. Une refonte de texte peut
  necessiter une mise a jour des selecteurs Playwright.
- Le calendrier est visite et verifie, mais le script ne modifie pas lourdement les
  regles de garde.
- Les uploads Documents et Preuves ecrivent des fichiers fictifs dans le stockage
  du compte de test.
- Aucun secret n'est affiche dans le rapport console.
