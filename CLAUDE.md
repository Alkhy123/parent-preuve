# CLAUDE.md — Instructions Claude Code pour Parent Preuve

@AGENTS.md

## Rôle

Tu travailles sur Parent Preuve, une application Next.js / Supabase destinée à aider un parent à organiser un dossier familial clair, daté, factuel et exportable.

Tu dois toujours préserver :

* les garde-fous juridiques ;
* la sécurité des données ;
* le cloisonnement multi-procédures ;
* la RLS Supabase ;
* le consentement IA ;
* les quotas IA côté serveur ;
* l'expérience mobile ;
* les fonctionnalités existantes.

## Règle principale

Ne commence jamais par coder.

Avant toute modification significative :

1. lis les fichiers concernés ;
2. résume le comportement actuel ;
3. identifie les risques ;
4. propose un plan court ;
5. liste les fichiers à modifier ;
6. attends le feu vert si la tâche est large ou risquée.

Travaille par petites étapes testables.

## Fichiers de contexte à lire

Au début d'une nouvelle tâche, lire :

* `PARENT_PREUVE_CONTEXTE.md`
* `AGENTS.md`
* `PARENT_PREUVE_REFERENCE.md` si la tâche est technique, Supabase, architecture ou dette ;
* `PARENT_PREUVE_ROADMAP_UX.md` si la tâche touche UX, navigation, design ou fonctionnalités ;
* `PARENT_PREUVE_AGENT_IA.md` si la tâche touche l'IA, le Copilote, Mistral, les routes Agent ou `lib/agent`.

Ne relis pas tout inutilement si les fichiers viennent d'être lus et n'ont pas changé.

## Méthode de travail

Pour chaque tâche :

1. Comprendre le besoin.
2. Auditer le code existant.
3. Identifier les impacts.
4. Préserver le fonctionnement actuel.
5. Modifier le minimum nécessaire.
6. Tester.
7. Lancer les commandes de vérification.
8. Résumer précisément.

Ne fais pas de grosse refonte silencieuse.

Ne mélange pas plusieurs chantiers sensibles dans un même changement.

Évite de modifier en même temps :

* migration Supabase ;
* refonte IA ;
* refonte UX ;
* export PDF ;
* sécurité/RLS ;
* suppression de code legacy.

## Commandes de vérification

Selon le contexte, lancer :

```bash
npm run lint
npm run build
```

Si disponibles :

```bash
npm run check
npm run check:agent-boundaries
npm run check:multi-procedure-migration
```

Avant de conclure, indiquer :

* les commandes exécutées ;
* les commandes non exécutées ;
* le résultat ;
* les erreurs restantes.

Ne jamais affirmer qu'un test a été fait s'il ne l'a pas été.

## Règles produit non négociables

Parent Preuve n'est pas :

* un avocat numérique ;
* un assistant juridique ;
* un outil de conseil juridique personnalisé ;
* un commissaire de justice ;
* un outil garantissant la recevabilité d'une preuve ;
* un outil de surveillance de l'autre parent.

Utiliser des formulations prudentes :

* dossier clair ;
* dossier factuel ;
* informations datées ;
* éléments organisés ;
* synthèse exportable ;
* à faire relire si nécessaire par un professionnel du droit.

Préserver tous les disclaimers existants.

## Règles IA

L'IA propose, l'utilisateur vérifie, l'utilisateur valide.

Ne jamais créer :

* d'écriture automatique en base sans validation utilisateur ;
* de conseil juridique personnalisé ;
* de conclusion judiciaire prête à déposer ;
* de promesse d'issue devant le JAF ;
* de promesse de recevabilité ;
* de contournement d'une décision judiciaire.

Toute route appelant Mistral ou une IA externe doit vérifier côté serveur :

* l'authentification ;
* le consentement IA ;
* le quota IA ;
* les garde-fous ;
* la validation de réponse.

## Séparation Assistant historique / Agent nouvelle génération

Ne jamais fusionner les anciennes routes `assistant` avec les routes `agent`.

Routes Agent principales :

* `/api/agent/analyser-demande`
* `/api/agent/pre-remplir`
* `/api/agent/question-dossier`

Règles :

* `/api/agent/analyser-demande` reste une route d'orientation déterministe.
* Elle ne doit pas appeler Mistral.
* Elle ne doit pas écrire en base.
* Elle ne doit pas consommer de quota IA.
* `/api/agent/question-dossier` ne doit rien écrire en base métier.
* `components/AssistantFlottant.tsx` ne doit pas réintroduire les anciennes routes `/api/assistant/*`.

Avant tout commit touchant l'Agent ou le bouton flottant, lancer :

```bash
npm run check:agent-boundaries
```

## Règles multi-procédures

Le multi-procédures est critique.

Un utilisateur peut avoir :

* plusieurs procédures ;
* plusieurs enfants ;
* plusieurs autres parents ;
* des frais, événements, documents et preuves distincts.

Principe :

* `procedure_id` cloisonne le dossier ;
* `child_id` ou `enfant_id` précise seulement l'enfant concerné ;
* une donnée sans enfant doit quand même appartenir à une procédure unique.

Quand une table possède `procedure_id`, filtrer en base :

```ts
.eq("procedure_id", procId)
```

Éviter les anciens filtres dangereux du type :

```ts
child_id === null || idsProc.has(child_id)
```

Les exports, synthèses, questions IA et widgets doivent utiliser uniquement la procédure active.

## Règles Supabase / RLS / Storage

Ne jamais exposer la clé service role côté client.

Ne jamais désactiver RLS pour corriger un bug.

Ne jamais rendre public un bucket sensible.

Toute nouvelle table sensible doit avoir :

* `user_id` ;
* `procedure_id` si les données sont liées au dossier ;
* RLS activée ;
* policies cohérentes ;
* `WITH CHECK` sur les updates quand pertinent.

Les fichiers sensibles doivent rester privés.

Utiliser des URL signées temporaires si nécessaire.

## Règles design et UX

Le design doit aider un parent stressé à comprendre rapidement :

1. où il se trouve ;
2. ce qu'il doit faire ;
3. pourquoi cela est utile ;
4. ce qu'il pourra faire ensuite.

Le design doit être :

* sobre ;
* clair ;
* rassurant ;
* mobile-first ;
* non anxiogène ;
* non culpabilisant.

Éviter l'effet fourre-tout.

Privilégier :

* cartes claires ;
* progression visible ;
* aide contextuelle ;
* prochaine action recommandée ;
* écrans vides intelligents ;
* textes courts ;
* boutons explicites.

## Règle de refonte visuelle

Une refonte visuelle ne doit pas casser la logique métier.

Utiliser une approche wrapper :

```text
Logique existante conservée
  -> Wrapper design
  -> Progression
  -> Aide contextuelle
  -> Responsive
```

Ne pas réécrire un composant métier fonctionnel uniquement pour améliorer le style.

En cas de doute, préserver la fonctionnalité.

## Règles assistant de démarrage / onboarding

L'assistant de démarrage contient les étapes suivantes :

1. Vos informations
2. La procédure
3. L'autre parent
4. Vos enfants
5. Le jugement
6. Les règles
7. Le calendrier de garde
8. Résumé

Identifiants à préserver :

* `vos-informations`
* `procedure`
* `autre-parent`
* `enfants`
* `jugement`
* `validation-regles`
* `calendrier`
* `resume`

Ne pas casser :

* la progression existante ;
* la reprise via `?etape=...` ;
* précédent / continuer ;
* la sauvegarde des étapes ;
* la procédure active ;
* le retour vers l'accueil ;
* les formulaires existants.

Composants métier à modifier le moins possible :

* `EtapeVosInformations.tsx`
* `EtapeProcedure.tsx`
* `EtapeAutreParent.tsx`
* `EtapeEnfants.tsx`
* `EtapeJugement.tsx`
* `EtapeValidationRegles.tsx`
* `EtapeCalendrier.tsx`
* `EtapeResumeFinal.tsx`

Pour la refonte de l'assistant, préférer créer :

* `AssistantShell.tsx`
* `AssistantProgress.tsx`
* `AssistantChecklist.tsx`
* `AssistantHelpCard.tsx`
* `AssistantStepHeader.tsx`
* `AssistantStepCards.tsx`
* `lib/onboarding/metadata.ts`

Ces composants doivent rester principalement visuels.

## Version mobile obligatoire

Toute refonte doit être vérifiée sur mobile.

Sur mobile :

* pas de colonnes ;
* carte principale pleine largeur ;
* progression lisible ;
* pastilles ou étapes compactes ;
* boutons larges ;
* pas de scroll horizontal obligatoire ;
* aide contextuelle sous le formulaire ;
* textes courts.

Un design desktop réussi mais mobile confus est incomplet.

## Vidéo de première connexion

La vidéo de présentation doit :

* s'afficher uniquement à la première connexion ;
* apparaître après RGPD ;
* être courte ;
* pouvoir être passée ;
* ne pas bloquer l'application ;
* ne pas promettre de valeur juridique ;
* guider vers l'assistant de démarrage.

Ne pas envoyer de données personnelles à un service vidéo externe.

Préférer un fichier local dans `public/videos/` si une vidéo est intégrée.

## Tests de non-régression

Pour une modification UX ou onboarding, tester :

1. ouverture de `/onboarding` ;
2. invitation ;
3. démarrage assistant ;
4. étape suivante ;
5. étape précédente ;
6. retour à une étape déjà atteinte ;
7. reprise via `?etape=...` ;
8. refresh pendant le parcours ;
9. sauvegarde des informations ;
10. procédure ;
11. autre parent ;
12. enfants ;
13. jugement ;
14. règles ;
15. calendrier ;
16. résumé ;
17. fin ;
18. retour accueil ;
19. desktop ;
20. tablette ;
21. mobile.

Pour le multi-procédures, tester le scénario :

* un utilisateur ;
* deux procédures ;
* deux enfants ;
* deux autres parents ;
* données distinctes ;
* exports séparés ;
* aucune fuite entre procédures.

## Format de réponse après intervention

Après une intervention, répondre avec :

1. Résumé de la demande.
2. Fichiers lus.
3. Fichiers créés.
4. Fichiers modifiés.
5. Composants métier préservés.
6. Changements UX.
7. Changements techniques.
8. Tests réalisés.
9. Commandes exécutées.
10. Résultat du build.
11. Tests non exécutés.
12. Risques restants.
13. Prochaine étape recommandée.

Ne pas ajouter de flatterie ou de conclusion inutile.

## Priorité absolue

Préserver le fonctionnement existant.

Puis améliorer l'expérience.

Puis seulement ajouter de nouvelles fonctionnalités.

En cas de doute, choisir la solution la moins risquée.
