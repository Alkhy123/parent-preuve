# CONTEXTE — Refonte de l’assistant de démarrage Parent Preuve

## Projet

Application : Parent Preuve
Objectif de l’application : aider un parent à organiser un dossier familial clair, daté, factuel et exportable.

L’application ne doit jamais être présentée comme :

* un assistant juridique ;
* un avocat IA ;
* un outil de preuve irréfutable ;
* un outil certifiant la recevabilité des preuves ;
* un équivalent huissier ;
* un équivalent commissaire de justice.

Le vocabulaire à utiliser doit rester prudent :

* dossier clair ;
* dossier factuel ;
* informations datées ;
* éléments organisés ;
* synthèse exportable ;
* éléments à faire relire si nécessaire par un professionnel du droit.

## Objectif de la refonte

L’objectif est de moderniser l’assistant de démarrage existant pour le rendre plus proche d’une expérience d’onboarding premium :

* interface guidée ;
* progression visible ;
* checklist des étapes ;
* aide contextuelle ;
* design rassurant ;
* version mobile aussi soignée que la version desktop ;
* aucune perte fonctionnelle.

La refonte doit s’inspirer de la maquette créée pour Parent Preuve :

* colonne gauche avec la progression ;
* grande carte centrale avec l’étape active ;
* colonne droite avec une aide contextuelle ;
* barre de progression ;
* pastilles ou statuts d’étapes ;
* cartes récapitulatives ;
* bloc vidéo d’accueil ;
* bloc “ce que vous allez accomplir” ;
* bloc “besoin d’aide”.

## Principe fondamental

Cette tâche est une refonte visuelle contrôlée.

Le design doit habiller l’assistant actuel, pas le réécrire.

Les fonctionnalités existantes doivent rester intactes.

Les composants métier actuels doivent être conservés autant que possible.

## Assistant actuel

L’assistant actuel contient déjà les étapes importantes :

1. Vos informations
2. La procédure
3. L’autre parent
4. Vos enfants
5. Le jugement
6. Les règles
7. Le calendrier de garde
8. Résumé

Ces étapes doivent rester dans le même ordre.

Les identifiants techniques des étapes ne doivent pas être modifiés :

* `vos-informations`
* `procedure`
* `autre-parent`
* `enfants`
* `jugement`
* `validation-regles`
* `calendrier`
* `resume`

## Composants métier à préserver

Les composants suivants contiennent la logique métier et doivent être modifiés le moins possible :

* `components/onboarding/EtapeVosInformations.tsx`
* `components/onboarding/EtapeProcedure.tsx`
* `components/onboarding/EtapeAutreParent.tsx`
* `components/onboarding/EtapeEnfants.tsx`
* `components/onboarding/EtapeJugement.tsx`
* `components/onboarding/EtapeValidationRegles.tsx`
* `components/onboarding/EtapeCalendrier.tsx`
* `components/onboarding/EtapeResumeFinal.tsx`

Ces composants doivent continuer à :

* charger les mêmes données ;
* sauvegarder les mêmes informations ;
* utiliser les mêmes tables Supabase ;
* conserver les mêmes validations ;
* conserver les mêmes champs ;
* conserver les mêmes redirections ;
* conserver les mêmes comportements utilisateur.

## Composants existants importants

Les fichiers suivants sont au cœur de l’assistant :

* `lib/onboarding/types.ts`
* `lib/onboarding/progression.ts`
* `components/onboarding/OnboardingWizard.tsx`
* `components/onboarding/InvitationOnboarding.tsx`
* `components/onboarding/PiedEtape.tsx`
* `app/onboarding/page.tsx`

La progression actuelle repose sur `lib/onboarding/progression.ts`.

Le wizard est orchestré par `OnboardingWizard.tsx`.

La page `/onboarding` décide si elle affiche l’invitation ou l’assistant en cours.

## Résultat visuel attendu

### Desktop

Sur desktop, l’assistant doit être affiché en trois zones :

1. Colonne gauche : progression
2. Zone centrale : étape active
3. Colonne droite : aide contextuelle

Structure attendue :

```text
┌───────────────────────┬───────────────────────────────┬───────────────────────┐
│ Votre progression      │ Étape active                   │ Aide contextuelle      │
│                       │                               │                       │
│ ✓ Vous                │ L’autre parent                 │ Pourquoi cette étape ? │
│ ✓ Procédure           │ Formulaire existant            │ Conseil pratique       │
│ → L’autre parent      │                               │                       │
│ ○ Enfants             │ Précédent / Continuer          │                       │
│ ○ Jugement            │                               │                       │
│ ○ Règles              │                               │                       │
│ ○ Calendrier          │                               │                       │
│ ○ Résumé              │                               │                       │
└───────────────────────┴───────────────────────────────┴───────────────────────┘
```

### Mobile

Sur mobile, le design doit garder le même style, mais sans colonnes.

Structure attendue :

```text
Parent Preuve
Assistant de démarrage

Étape 3 sur 8              38 %
████████░░░░░░░░░░░░░░░

✓ ✓ 3 4 5 6 7 8

┌──────────────────────────────┐
│ L’autre parent               │
│ Identifier l’autre parent    │
│                              │
│ Conseil bleu                 │
│ Formulaire existant          │
│                              │
│ Précédent       Continuer    │
└──────────────────────────────┘

Pourquoi cette étape est utile ?
Explication courte.
```

La version mobile ne doit pas être un simple empilement mal adapté du desktop.

Elle doit être pensée comme une vraie expérience mobile :

* lisible ;
* claire ;
* boutons larges ;
* pas de scroll horizontal obligatoire ;
* aide contextuelle sous le formulaire ;
* pastilles de progression ;
* carte principale pleine largeur.

## Design attendu

Le design doit être :

* moderne ;
* doux ;
* rassurant ;
* professionnel ;
* clair ;
* mobile-first ;
* non anxiogène.

Style visuel recommandé :

* fond général gris très clair ou bleu très clair ;
* cartes blanches ;
* bordures douces ;
* coins arrondis ;
* ombres légères ;
* bouton principal bleu ;
* état terminé en vert ;
* état actif en bleu ;
* état à venir en gris ;
* textes courts et pédagogiques.

## Textes d’aide par étape

### Vos informations

Objectif :
“Renseigner les informations de base du déclarant.”

Aide :
“Ces informations pourront être reprises dans vos courriers et synthèses. Vous pourrez les modifier plus tard.”

Conseil :
“Commencez avec les informations essentielles. Vous pourrez compléter ensuite.”

### Procédure

Objectif :
“Créer ou choisir le dossier concerné.”

Aide :
“Une procédure permet de séparer les situations. Cela évite de mélanger les informations lorsque plusieurs dossiers existent.”

Conseil :
“Si un enfant concerne un autre parent, créez une procédure différente.”

### L’autre parent

Objectif :
“Identifier l’autre parent concerné par cette procédure.”

Aide :
“Ces informations servent à identifier l’autre parent dans le cadre de cette procédure.”

Conseil :
“Tous les champs ne sont pas obligatoires au démarrage. Vous pourrez les compléter plus tard.”

### Vos enfants

Objectif :
“Ajouter les enfants concernés par cette procédure.”

Aide :
“Les enfants doivent être rattachés à la bonne procédure pour que les frais, événements et calendriers restent cohérents.”

Conseil :
“Ajoutez uniquement les enfants concernés par cette procédure.”

### Le jugement

Objectif :
“Indiquer si une décision de justice existe.”

Aide :
“Cette étape permet d’indiquer si une décision existe et de noter ses principales références.”

Conseil :
“L’application vous aide à organiser les informations, mais ne remplace pas une analyse juridique.”

### Les règles

Objectif :
“Relire les règles importantes du dossier.”

Aide :
“Cette étape permet de vérifier les règles importantes : pension, frais, droit de visite et décisions.”

Conseil :
“Relisez toujours les règles avant validation.”

### Calendrier

Objectif :
“Préparer les rappels liés à la garde ou aux visites.”

Aide :
“Le calendrier aide à suivre les prochaines échéances et les dates importantes.”

Conseil :
“Commencez simplement. Vous pourrez ajuster ensuite.”

### Résumé

Objectif :
“Voir ce qui est renseigné et ce qui reste à compléter.”

Aide :
“Le résumé vous montre les informations déjà renseignées et les éléments encore à compléter.”

Conseil :
“Les éléments à compléter ne bloquent pas l’utilisation.”

## Vidéo de première connexion

Une vidéo de présentation pourra être ajoutée ensuite.

Elle doit s’afficher seulement lors de la première connexion de l’utilisateur, après acceptation RGPD.

La vidéo doit être courte :

* 60 à 90 secondes ;
* ton rassurant ;
* pas de promesse juridique ;
* présentation du fonctionnement général ;
* transition vers l’assistant de démarrage.

Texte recommandé :

“Bienvenue sur Parent Preuve. Cette application vous aide à organiser un dossier clair, daté et factuel lorsque la situation familiale devient difficile à suivre. Elle ne remplace pas un avocat, ne donne pas de conseil juridique et ne garantit pas l’issue d’une procédure. Son rôle est de vous aider à remettre de l’ordre : vos informations, l’autre parent, les enfants, le jugement, les frais, la pension, les événements, les documents et les preuves. Pour commencer, l’assistant de démarrage va vous guider étape par étape.”

## Assistant à chaque nouvelle procédure

À terme, l’assistant devra pouvoir se relancer à chaque création d’une nouvelle procédure.

Logique souhaitée :

* première connexion : vidéo + assistant ;
* procédure existante déjà configurée : ne pas relancer inutilement ;
* nouvelle procédure : relancer l’assistant pour cette procédure ;
* ne jamais mélanger les dossiers ;
* une procédure A peut avoir terminé l’assistant ;
* une procédure B peut encore nécessiter l’assistant.

Message recommandé lors d’une nouvelle procédure :

“Nouvelle procédure créée. L’assistant va vous aider à la configurer séparément pour éviter de mélanger vos dossiers.”

## Garde-fous

La refonte ne doit pas :

* casser la progression actuelle ;
* casser les sauvegardes ;
* casser les formulaires ;
* casser les redirections ;
* changer les tables Supabase ;
* modifier les identifiants d’étapes ;
* supprimer les comportements existants ;
* introduire une nouvelle librairie UI ;
* transformer l’assistant en refonte globale de l’application.

## Ordre recommandé de développement

1. Créer les nouveaux composants visuels.
2. Ajouter les métadonnées d’aide par étape.
3. Brancher progressivement le nouveau shell dans `OnboardingWizard`.
4. Adapter l’invitation de démarrage.
5. Adapter le pied d’étape si nécessaire.
6. Vérifier la version mobile.
7. Lancer les tests de non-régression.
8. Lancer `npm run build`.

## Tests indispensables

Après modification, vérifier :

1. ouverture de `/onboarding` ;
2. démarrage de l’assistant ;
3. étape suivante ;
4. étape précédente ;
5. retour vers une étape déjà atteinte ;
6. impossibilité de cliquer sur une étape future non accessible ;
7. sauvegarde des informations personnelles ;
8. création ou sélection d’une procédure ;
9. sauvegarde de l’autre parent ;
10. ajout d’un enfant ;
11. suppression d’un enfant si la fonction existe ;
12. choix jugement oui / non ;
13. import ou description du jugement si prévu ;
14. validation des règles ;
15. configuration calendrier ;
16. résumé final ;
17. fin d’assistant ;
18. retour accueil ;
19. refresh de page pendant l’assistant ;
20. reprise de progression ;
21. affichage mobile ;
22. affichage tablette ;
23. affichage desktop ;
24. `npm run build`.
