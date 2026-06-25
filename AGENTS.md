# AGENTS.md — Parent Preuve

Ce fichier sert de guide obligatoire pour tout agent de code travaillant sur le dépôt **Parent Preuve** : Claude Code, Codex, Cursor Agent ou tout autre assistant automatisé.

Objectif : protéger l'architecture, les données sensibles, les garde-fous juridiques, l'IA, Supabase/RLS, les preuves photo et le cloisonnement multi-procédures.

---

## 1. Description du projet

**Parent Preuve** est une application de coparentalité orientée justice française.

Elle aide un parent à organiser un dossier factuel autour de situations familiales sensibles :

- journal d'événements ;
- frais liés aux enfants ;
- pension alimentaire ;
- documents et justificatifs ;
- preuves photo ;
- règles issues d'un jugement ;
- courriers ;
- notes de synthèse ;
- exports PDF ;
- dossier avocat ;
- aide IA encadrée.

L'application doit rester un outil d'organisation, de clarification et de préparation de dossier.

Elle ne doit jamais être présentée comme :

- un avocat numérique ;
- un outil de conseil juridique personnalisé ;
- un commissaire de justice ;
- un outil garantissant la recevabilité d'une preuve ;
- un outil de surveillance de l'autre parent ;
- un outil permettant de contourner une décision judiciaire.

---

## 2. Principes produit non négociables

### 2.1 Neutralité factuelle

Le ton doit rester neutre, chronologique, précis et non accusatoire.

L'application aide à formuler des faits, pas à amplifier un conflit.

### 2.2 Validation humaine

L'IA ne doit jamais enregistrer automatiquement un événement, un frais, une pension, un courrier ou une preuve.

Toute suggestion IA doit être relue et validée par l'utilisateur.

### 2.3 Prudence juridique

Ne jamais promettre qu'une preuve sera recevable.

Ne jamais dire qu'une photo vaut constat de commissaire de justice.

Ne jamais générer un conseil juridique personnalisé présenté comme fiable.

Toujours préserver les disclaimers existants.

### 2.4 Protection des enfants

Les données d'enfants sont sensibles.

Ne jamais ajouter de mécanisme intrusif, de surveillance ou de collecte excessive.

Minimiser les données demandées.

### 2.5 Cloisonnement strict

Les données d'un utilisateur ne doivent jamais être visibles par un autre.

Les données d'une procédure ne doivent jamais apparaître dans une autre procédure.

---

## 3. Stack technique

Le projet utilise principalement :

- Next.js App Router ;
- React ;
- TypeScript strict ;
- Tailwind CSS ;
- Supabase Auth ;
- Supabase Postgres ;
- Supabase Storage ;
- Supabase Row Level Security ;
- Mistral pour certaines routes IA côté serveur ;
- jsPDF / pdf-lib pour les exports ;
- scripts Node de garde-fous.

Le projet est organisé principalement autour de :

- `app/`
- `components/`
- `lib/`
- `supabase/migrations/`
- `scripts/`
- fichiers de documentation projet à la racine.

Ne pas déplacer massivement l'architecture sans raison claire.

---

## 4. Fichiers à lire avant toute intervention

Avant toute modification importante, lire au minimum :

- `README.md`
- `CLAUDE.md`
- `AGENTS.md`
- `PARENT_PREUVE_REFERENCE.md`
- `PARENT_PREUVE_AGENT_IA.md`
- `PARENT_PREUVE_ROADMAP_UX.md`
- `package.json`
- `next.config.ts`

Pour les changements base de données / Supabase :

- `supabase/migrations/001_init_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_storage_policies.sql`
- toutes les migrations ultérieures pertinentes.

Pour les changements IA :

- `components/AssistantFlottant.tsx`
- `components/ConsentementIA.tsx`
- `components/ReformulationIA.tsx`
- `lib/consentementIaServeur.ts`
- `lib/quotaIa.ts`
- `app/api/agent/*`
- `app/api/ia/*`

Pour les changements multi-procédures :

- `lib/procedureActive.ts`
- `app/journal/page.tsx`
- `app/frais/page.tsx`
- `app/documents/page.tsx`
- `app/preuves/page.tsx`
- `app/preuves/nouvelle/page.tsx`
- `app/pension/page.tsx`
- `app/export/page.tsx`
- `lib/resumeDossier.ts`
- `lib/etatDossier.ts`

Pour les preuves photo :

- `app/preuves/page.tsx`
- `app/preuves/nouvelle/page.tsx`
- `app/api/preuves/*`
- les helpers de hash, horodatage et génération PDF associés.

---

## 5. Méthode de travail obligatoire

Avant de modifier :

1. Lire les fichiers pertinents.
2. Résumer brièvement le comportement actuel.
3. Identifier les risques.
4. Proposer un plan court.
5. Modifier par petits blocs.
6. Lancer les commandes de vérification.
7. Résumer les fichiers modifiés.
8. Signaler les tests non exécutés.

Ne pas faire de grosse refonte silencieuse.

Ne pas modifier plusieurs chantiers sensibles en même temps.

Ne pas mélanger dans un même changement :

- migration Supabase ;
- refonte IA ;
- refonte UX ;
- export PDF ;
- suppression de code legacy ;
- modification de sécurité.

---

## 6. Commandes utiles

À lancer selon le contexte :

```bash
git status
npm install
npm run lint
npm run build
```

Si les scripts existent :

```bash
npm run check
npm run check:agent-boundaries
npm run check:multi-procedure-migration
```

Avant de conclure une tâche, afficher idéalement :

```bash
git diff --stat
git diff
```

Toujours signaler clairement :

- les commandes exécutées ;
- les commandes non exécutées ;
- les erreurs restantes ;
- les risques non traités.

---

## 7. Règles Agent IA

L'application contient plusieurs routes IA. Elles doivent rester strictement encadrées.

### 7.1 Routes Agent attendues

Le bouton flottant doit utiliser les routes Agent prévues :

- `/api/agent/analyser-demande`
- `/api/agent/pre-remplir`
- `/api/agent/question-dossier`

Ne pas réintroduire les anciennes routes `/api/assistant/*` comme chemin principal du bouton flottant.

### 7.2 Orientation

`/api/agent/analyser-demande` doit rester une route d'orientation légère.

Elle ne doit pas :

- appeler Mistral ;
- consommer de quota IA ;
- lire inutilement les données métier ;
- écrire en base.

### 7.3 Préremplissage

`/api/agent/pre-remplir` peut proposer une structure, mais ne doit jamais enregistrer automatiquement.

L'utilisateur doit toujours valider avant création d'un élément.

Types autorisés selon l'état actuel du projet :

- journal ;
- frais ;
- pension ;
- aucun / refus / indéterminé.

### 7.4 Question dossier

`/api/agent/question-dossier` doit répondre uniquement à partir des données factuelles disponibles dans le dossier.

Elle ne doit pas :

- donner de conseil juridique personnalisé ;
- inventer des faits ;
- interpréter juridiquement une situation complexe ;
- promettre un résultat devant le JAF.

### 7.5 Consentement IA

Toute route qui appelle Mistral ou une IA externe doit vérifier le consentement côté serveur.

Ne jamais se contenter d'un contrôle côté client.

Le contrôle doit être fait avant l'appel IA.

### 7.6 Quotas IA

Les quotas IA doivent être vérifiés côté serveur.

Ne pas faire dépendre les quotas d'un état client.

### 7.7 Refus local

Les demandes interdites ou sensibles doivent être refusées localement avant appel au modèle lorsque c'est possible.

Exemples de demandes à refuser ou rediriger :

- stratégie judiciaire personnalisée agressive ;
- contournement d'une décision ;
- surveillance de l'autre parent ;
- création d'accusations non factuelles ;
- promesse de recevabilité ;
- interprétation juridique ferme.

---

## 8. Règles multi-procédures

Le multi-procédures est critique.

Un utilisateur peut avoir plusieurs procédures, plusieurs enfants et plusieurs autres parents.

### 8.1 Principe

`procedure_id` est le champ de cloisonnement du dossier.

`child_id` ou `enfant_id` sert seulement à préciser l'enfant concerné.

Un élément sans enfant doit quand même appartenir à une procédure unique.

### 8.2 Tables métier concernées

Vérifier le cloisonnement sur :

- `procedures`
- `children`
- `events`
- `expenses`
- `documents`
- `preuves_photo`
- `pension_payments`
- `pension_regle`
- toute nouvelle table métier.

### 8.3 Lecture des données

Quand une table possède `procedure_id`, les lectures principales doivent filtrer en base :

```ts
.eq("procedure_id", procId)
```

Éviter les anciens filtres de type :

```ts
child_id === null || idsProc.has(child_id)
```

Ces filtres sont dangereux, car une donnée sans enfant peut apparaître dans plusieurs procédures.

### 8.4 Écriture des données

Toute création de donnée métier doit rattacher explicitement la donnée à la procédure active.

Si aucune procédure active n'existe :

- bloquer la création ;
- afficher un message clair ;
- inviter l'utilisateur à créer ou sélectionner une procédure.

### 8.5 Export

Les exports doivent utiliser uniquement les données de la procédure active.

Un export de la procédure A ne doit jamais contenir une donnée de la procédure B.

---

## 9. Règles Supabase, RLS et Storage

### 9.1 Supabase client

Le client Supabase côté navigateur ne doit jamais recevoir de clé service role.

Utiliser uniquement la clé anonyme côté client.

### 9.2 Supabase admin

`supabaseAdmin` ou la clé service role ne doivent être utilisés que côté serveur.

Chaque usage doit être justifié et filtré explicitement par `user_id`.

Ne jamais utiliser `supabaseAdmin` pour contourner la RLS par confort.

### 9.3 RLS

Toutes les tables sensibles doivent avoir RLS activée.

Les policies doivent empêcher :

- lecture inter-utilisateur ;
- écriture inter-utilisateur ;
- modification d'une ligne pour la sortir du périmètre utilisateur ;
- suppression d'une ligne appartenant à un autre utilisateur.

Pour les policies `UPDATE`, utiliser `WITH CHECK` quand pertinent :

```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

### 9.4 Storage

Les buckets contenant des documents ou preuves doivent rester privés.

Les fichiers doivent être cloisonnés par utilisateur, idéalement via un chemin contenant l'ID utilisateur.

Les accès publics permanents aux fichiers sensibles sont interdits.

Utiliser des URL signées temporaires si nécessaire.

### 9.5 Suppression de compte

La suppression de compte doit supprimer ou anonymiser correctement :

- données en base ;
- fichiers Storage ;
- compte Auth ;
- données liées aux quotas ou consentements ;
- traces techniques si nécessaire selon la politique de conservation.

Ne jamais supprimer le compte Auth avant d'avoir traité les données dépendantes.

---

## 10. Règles preuves photo

Le module preuve photo est un différenciateur important, mais juridiquement sensible.

### 10.1 Ce que l'application peut dire

L'application peut parler de :

- fichier original ;
- empreinte SHA-256 ;
- horodatage interne ;
- vérification technique ;
- métadonnées ;
- rapport de preuve ;
- élément de dossier ;
- traçabilité renforcée.

### 10.2 Ce que l'application ne doit pas dire

Ne jamais dire :

- preuve certifiée juridiquement ;
- preuve forcément recevable ;
- équivalent à un constat de commissaire de justice ;
- preuve incontestable ;
- certification officielle.

### 10.3 Intégrité

Préserver :

- hash SHA-256 ;
- fichier original ;
- statut de vérification ;
- horodatage interne ;
- rapport PDF ;
- éventuelle géolocalisation consentie.

### 10.4 Géolocalisation

La géolocalisation est sensible.

Elle doit rester :

- optionnelle ;
- explicite ;
- compréhensible ;
- limitée au besoin réel.

---

## 11. Règles exports et dossier avocat

Les exports sont une valeur centrale du produit.

Ils doivent être :

- neutres ;
- chronologiques ;
- lisibles ;
- factuels ;
- cloisonnés par procédure ;
- accompagnés d'avertissements juridiques ;
- vérifiables.

Un export ne doit pas :

- mélanger plusieurs procédures ;
- inventer des faits ;
- conclure juridiquement à la place d'un professionnel ;
- masquer les limites de l'application.

Le module dossier avocat doit rester une aide à la préparation, pas un acte juridique automatisé.

---

## 12. Règles RGPD et données sensibles

Parent Preuve peut contenir :

- données d'enfants ;
- photos ;
- documents familiaux ;
- jugements ;
- frais médicaux ou scolaires ;
- informations financières ;
- géolocalisation ;
- conflits familiaux.

Conséquences :

- minimiser les données collectées ;
- ne pas logger de contenu sensible ;
- ne pas envoyer de données à l'IA sans consentement ;
- prévoir suppression de compte ;
- préserver les avertissements de confidentialité ;
- ne pas créer de partage public par défaut.

Les logs doivent contenir des informations techniques, pas des contenus familiaux.

---

## 13. Règles UX

L'application doit éviter l'effet “fourre-tout”.

La logique cible est :

### Ajouter

- journal ;
- frais ;
- pension ;
- document ;
- preuve photo.

### Comprendre

- accueil ;
- situation du mois ;
- chronologie ;
- règles du jugement ;
- dossier prêt ;
- échéances.

### Produire

- export PDF ;
- dossier avocat ;
- courriers ;
- note de synthèse ;
- bordereau.

Quand une fonctionnalité est ajoutée, se demander :

- est-elle indispensable ?
- est-elle compréhensible par un parent stressé ?
- ajoute-t-elle de la clarté ou de la complexité ?
- doit-elle être visible dans la navigation principale ou seulement contextuelle ?

---

## 14. Scripts de garde-fous

Le projet peut contenir des scripts comme :

- `scripts/check-agent-boundaries.mjs`
- `scripts/check-multi-procedure-migration.mjs`

Ces scripts sont importants.

Ne pas les supprimer sans remplacement.

Si possible, le build doit lancer :

- vérification Agent IA ;
- vérification multi-procédures ;
- lint ;
- build Next.

Objectif recommandé dans `package.json` :

```json
{
  "scripts": {
    "check:agent-boundaries": "node scripts/check-agent-boundaries.mjs",
    "check:multi-procedure-migration": "node scripts/check-multi-procedure-migration.mjs",
    "check": "npm run check:agent-boundaries && npm run check:multi-procedure-migration && npm run lint",
    "build": "npm run check && next build"
  }
}
```

Adapter selon l'état réel du projet.

---

## 15. Interdictions importantes

Ne pas :

- exposer une clé secrète côté client ;
- désactiver la RLS pour résoudre un bug ;
- rendre un bucket sensible public ;
- appeler Mistral depuis le client ;
- contourner le consentement IA ;
- contourner les quotas IA ;
- réintroduire `/api/assistant/*` dans le bouton flottant ;
- mélanger les procédures via `child_id === null` ;
- supprimer les disclaimers juridiques ;
- promettre une valeur juridique automatique ;
- faire une refonte globale sans demande explicite ;
- ignorer un échec de build ;
- masquer un test non exécuté.

---

## 16. Critères de pré-production

L'application peut être considérée comme proche d'une base pré-production quand :

1. Le multi-procédures est strict.
2. Les exports sont strictement filtrés par procédure.
3. Les routes IA sont protégées par consentement serveur.
4. Les quotas IA sont côté serveur.
5. Les RLS sont cohérentes.
6. Les fichiers Storage sont privés.
7. Les preuves photo gardent leur intégrité.
8. La suppression compte est testée.
9. Le build lance les garde-fous essentiels.
10. Les parcours principaux fonctionnent de bout en bout.
11. La documentation correspond au code réel.
12. Un scénario avec deux procédures ne produit aucun mélange.

---

## 17. Scénario de test prioritaire

Tester régulièrement le scénario suivant :

- un utilisateur ;
- deux procédures ;
- deux enfants ;
- deux autres parents différents ;
- événements distincts ;
- frais distincts ;
- pensions distinctes ;
- documents distincts ;
- preuves photo distinctes ;
- exports séparés ;
- questions IA séparées par procédure.

Critère de réussite :

Aucune donnée de la procédure A ne doit apparaître dans la procédure B.

---

## 18. Format de réponse attendu d'un agent

Après intervention, répondre avec :

1. Résumé de la demande.
2. Fichiers lus.
3. Plan appliqué.
4. Fichiers modifiés.
5. Détails des modifications.
6. Commandes exécutées.
7. Résultats des commandes.
8. Tests non exécutés.
9. Risques restants.
10. Prochaine étape recommandée.

Ne jamais prétendre qu'un test a été exécuté s'il ne l'a pas été.

---

## 19. Priorités actuelles recommandées

Ordre conseillé :

1. Cloisonnement multi-procédures en lecture/export/résumé.
2. Consentement IA serveur sur toutes les routes Mistral.
3. Scripts qualité branchés au build.
4. Nettoyage documentation/commentaires Agent IA.
5. Durcissement RLS `UPDATE`.
6. Renforcement preuves photo/export.
7. Test complet avec deux procédures.
8. Préparation staging / pré-production.

Ne pas commencer par ajouter de nouvelles fonctionnalités majeures tant que ces points ne sont pas stabilisés.

## 20. Workflow mixte design, technique et tests

Ce projet doit être travaillé avec une méthode mixte : produit, UX, technique, sécurité et tests.

Aucune intervention ne doit être purement esthétique si elle risque de casser un flux métier existant.

Aucune intervention technique ne doit ignorer l'expérience utilisateur, notamment sur mobile.

Aucune nouvelle fonctionnalité ne doit être considérée comme terminée sans vérification de non-régression.

### 20.1 Ordre de réflexion obligatoire

Pour toute tâche significative, l'agent doit raisonner dans cet ordre :

1. Comprendre le besoin utilisateur.
2. Identifier les fichiers concernés.
3. Lire le code existant avant toute modification.
4. Résumer le comportement actuel.
5. Identifier les risques fonctionnels.
6. Identifier les risques UX.
7. Identifier les risques sécurité / RGPD / RLS.
8. Proposer une solution minimale.
9. Modifier par petits blocs.
10. Tester le comportement existant.
11. Tester le nouveau comportement.
12. Lancer les commandes de vérification.
13. Résumer clairement ce qui a été fait.

L'agent ne doit pas commencer par coder directement.

### 20.2 Principe de refonte contrôlée

Toute refonte visuelle doit respecter le principe suivant :

Le design habille le fonctionnement existant, il ne le remplace pas.

Lorsqu'un composant métier fonctionne déjà, il faut préférer une approche par wrapper visuel plutôt qu'une réécriture.

Exemple recommandé :

```text
Composant métier existant
  -> Wrapper visuel
    -> Progression
    -> Aide contextuelle
    -> Layout responsive
```

Exemple à éviter :

```text
Suppression du composant existant
  -> Réécriture complète
  -> Nouvelle logique de sauvegarde
  -> Nouveaux effets de bord
```

### 20.3 Règles de design Parent Preuve

Le design de Parent Preuve doit être :

* clair ;
* sobre ;
* rassurant ;
* mobile-first ;
* lisible par un parent stressé ;
* non anxiogène ;
* non culpabilisant ;
* cohérent avec l'objectif de dossier factuel.

Les interfaces doivent éviter l'effet fourre-tout.

Chaque écran important doit répondre à trois questions :

1. Où suis-je ?
2. Que dois-je faire maintenant ?
3. Pourquoi cette action est utile ?

### 20.4 Design mobile obligatoire

Toute modification d'écran doit être pensée en desktop et mobile.

Sur mobile :

* pas de colonnes serrées ;
* pas de scroll horizontal obligatoire ;
* boutons suffisamment grands ;
* textes courts ;
* cartes pleine largeur ;
* progression lisible ;
* action principale visible ;
* aide contextuelle accessible mais non envahissante.

Un design desktop réussi mais une version mobile confuse doit être considéré comme incomplet.

### 20.5 Écrans vides intelligents

Une page vide ne doit jamais être simplement vide.

Chaque écran vide doit contenir :

* une phrase expliquant à quoi sert la page ;
* un exemple concret ;
* un bouton d'action principal ;
* éventuellement un lien “Voir un exemple”.

Exemple :

```text
Aucun événement ajouté pour le moment.

Le journal sert à noter des faits datés de manière claire et factuelle :
retard, absence, incident de communication, information importante concernant l'enfant.

Bouton : Ajouter un événement
Bouton secondaire : Voir un exemple
```

### 20.6 Prochaine action recommandée

L'accueil doit progressivement guider l'utilisateur vers la prochaine action utile.

Exemples :

* ajouter un enfant ;
* créer une procédure ;
* renseigner l'autre parent ;
* ajouter une décision ;
* configurer une pension ;
* ajouter un premier événement ;
* ajouter un premier document ;
* préparer un export.

La prochaine action recommandée doit être utile, non intrusive, et liée à la procédure active.

### 20.7 Assistant de démarrage et onboarding

L'assistant de démarrage est une partie sensible du produit.

Il doit aider l'utilisateur à poser les bases du dossier sans tout exiger immédiatement.

Il doit respecter les étapes existantes :

1. Vos informations
2. La procédure
3. L'autre parent
4. Vos enfants
5. Le jugement
6. Les règles
7. Le calendrier de garde
8. Résumé

Les identifiants techniques existants ne doivent pas être renommés sans raison majeure :

* `vos-informations`
* `procedure`
* `autre-parent`
* `enfants`
* `jugement`
* `validation-regles`
* `calendrier`
* `resume`

La refonte de l'assistant doit prioritairement utiliser une approche wrapper :

* `OnboardingWizard` conserve la logique de progression ;
* les composants d'étape conservent leurs sauvegardes ;
* les nouveaux composants gèrent seulement l'affichage, la progression, la checklist, l'aide et le responsive.

### 20.8 Règles spécifiques à l'assistant de démarrage

Pour toute modification de l'assistant :

Ne pas casser :

* la lecture de progression ;
* la reprise de parcours ;
* la compatibilité avec `?etape=...` ;
* les boutons précédent / continuer ;
* la fin d'assistant ;
* le retour vers l'accueil ;
* les sauvegardes Supabase ;
* les formulaires existants ;
* la procédure active.

Ne pas modifier sans nécessité :

* `EtapeVosInformations.tsx`
* `EtapeProcedure.tsx`
* `EtapeAutreParent.tsx`
* `EtapeEnfants.tsx`
* `EtapeJugement.tsx`
* `EtapeValidationRegles.tsx`
* `EtapeCalendrier.tsx`
* `EtapeResumeFinal.tsx`

### 20.9 Vidéo de première connexion

La vidéo de présentation doit être courte, rassurante et non bloquante.

Elle doit :

* s'afficher uniquement lors de la première connexion ;
* apparaître après acceptation RGPD ;
* pouvoir être passée ;
* ne pas utiliser d'hébergement externe si cela implique une fuite de données ;
* ne pas contenir de promesse juridique ;
* introduire l'assistant de démarrage.

Elle ne doit pas :

* empêcher définitivement l'accès à l'application ;
* collecter de donnée supplémentaire ;
* envoyer de donnée personnelle à un service tiers ;
* remplacer l'assistant.

### 20.10 Assistant par nouvelle procédure

À terme, l'assistant doit pouvoir se relancer lorsqu'une nouvelle procédure est créée.

Principe :

* première connexion : vidéo puis assistant ;
* nouvelle procédure : assistant relancé pour cette procédure ;
* procédure déjà configurée : ne pas relancer inutilement ;
* ne jamais mélanger les procédures ;
* une procédure A peut être terminée ;
* une procédure B peut rester à configurer.

Toute donnée d'onboarding par procédure doit être rattachée à `procedure_id` et `user_id`.

### 20.11 Tests de non-régression UX

Pour toute refonte visuelle, tester au minimum :

1. affichage desktop ;
2. affichage tablette ;
3. affichage mobile ;
4. action principale ;
5. action secondaire ;
6. retour arrière ;
7. refresh de page ;
8. reprise de progression ;
9. sauvegarde réelle ;
10. absence d'erreur console évidente ;
11. build final.

### 20.12 Tests de non-régression métier

Pour toute modification touchant un flux métier, tester au minimum :

1. lecture des données existantes ;
2. création ;
3. modification ;
4. suppression si disponible ;
5. filtrage par procédure active ;
6. comportement sans procédure active ;
7. comportement avec deux procédures ;
8. export ou résumé si concerné ;
9. RLS si une table est modifiée ;
10. absence de fuite inter-utilisateur ou inter-procédure.

### 20.13 Tests Agent IA

Pour toute modification touchant l'Agent IA, tester :

1. orientation ;
2. pré-remplissage ;
3. question dossier ;
4. consentement serveur ;
5. quota serveur ;
6. refus local ;
7. absence d'écriture automatique ;
8. absence de conseil juridique personnalisé ;
9. absence d'appel à Mistral dans `/api/agent/analyser-demande` ;
10. `npm run check:agent-boundaries`.

### 20.14 Tests Supabase et RLS

Pour toute migration ou modification Supabase :

1. vérifier `user_id` ;
2. vérifier `procedure_id` si nécessaire ;
3. activer RLS ;
4. créer les policies `SELECT`, `INSERT`, `UPDATE`, `DELETE` si nécessaire ;
5. utiliser `WITH CHECK` sur `UPDATE` quand pertinent ;
6. ne jamais exposer la service role côté client ;
7. ne jamais rendre un bucket sensible public ;
8. tester avec deux utilisateurs si possible ;
9. tester avec deux procédures.

### 20.15 Tests build et qualité

Avant de conclure une tâche, lancer selon le contexte :

```bash
npm run lint
npm run build
```

Si les scripts existent :

```bash
npm run check
npm run check:agent-boundaries
npm run check:multi-procedure-migration
```

Toujours indiquer clairement :

* commandes exécutées ;
* commandes non exécutées ;
* résultat ;
* erreurs restantes ;
* limites ;
* tests manuels réalisés.

### 20.16 Format obligatoire des réponses après intervention

Après une intervention, l'agent doit répondre avec :

1. Résumé court de la demande.
2. Fichiers lus.
3. Fichiers créés.
4. Fichiers modifiés.
5. Composants métier préservés.
6. Changements UX réalisés.
7. Changements techniques réalisés.
8. Tests réalisés.
9. Commandes exécutées.
10. Résultat du build.
11. Risques restants.
12. Prochaine étape recommandée.

Ne jamais prétendre qu'un test a été exécuté s'il ne l'a pas été.

### 20.17 Règle de prudence finale

En cas de doute entre :

* améliorer le design ;
* préserver une fonctionnalité existante ;

il faut préserver la fonctionnalité existante.

En cas de doute entre :

* aller vite ;
* vérifier le cloisonnement des données ;

il faut vérifier le cloisonnement.

En cas de doute entre :

* ajouter une promesse utilisateur forte ;
* rester juridiquement prudent ;

il faut rester juridiquement prudent.

