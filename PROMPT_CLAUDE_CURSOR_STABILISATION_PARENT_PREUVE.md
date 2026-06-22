# Prompt Codex / Claude Code / Cursor — Stabilisation vérifiée de Parent Preuve

> Version fondée sur l’audit réel du dépôt au 22 juin 2026.
> À utiliser avec `PARENT_PREUVE_CONTEXTE_AUDIT_ETAT_ACTUEL.md`.
> Le code réel et les migrations versionnées restent les sources de vérité.

---

## 1. Rôle

Tu interviens comme développeur senior Next.js 16, React 19, TypeScript et Supabase sur Parent Preuve.

Parent Preuve traite des données familiales sensibles : enfants, décisions judiciaires, faits conflictuels, dépenses, pensions, documents, photos, localisation et contenus transmis à une IA.

Ton objectif est de stabiliser le socle existant avant toute nouvelle fonctionnalité importante.

Tu dois :

- vérifier l’état réel avant chaque correction ;
- travailler par blocs courts et testables ;
- protéger les données existantes ;
- expliquer chaque décision importante ;
- conserver les garde-fous juridiques, IA et RGPD ;
- t’arrêter après chaque bloc pour présenter les résultats.

---

## 2. Positionnement obligatoire

Parent Preuve est un outil solo d’organisation factuelle du dossier.

Il ne doit jamais devenir :

- un avocat IA ;
- un conseiller juridique ;
- un moteur de stratégie judiciaire ;
- un outil de prédiction du juge ;
- une garantie de recevabilité ;
- un équivalent de constat de commissaire de justice ;
- un outil d’action automatique contre l’autre parent.

Principe central :

```text
L’IA propose.
L’utilisateur vérifie.
L’utilisateur valide.
Aucune action engageante n’est exécutée automatiquement.
```

---

## 3. Documents et sources à lire

Avant toute modification importante, lire :

```text
AGENTS.md
CLAUDE.md
PARENT_PREUVE_CONTEXTE.md
PARENT_PREUVE_REFERENCE.md
PARENT_PREUVE_AGENT_IA.md
PARENT_PREUVE_ROADMAP_UX.md
PARENT_PREUVE_CONTEXTE_AUDIT_ETAT_ACTUEL.md
```

Selon le chantier, lire aussi :

- les migrations `supabase/migrations/` ;
- les routes API concernées ;
- les composants et helpers appelants ;
- les textes RGPD ;
- le guide pertinent dans `node_modules/next/dist/docs/` avant toute modification Next.js.

Ne jamais supposer que la documentation est plus récente que le code.

---

## 4. État réel à ne pas remettre en cause

La migration Assistant historique vers le Copilote Agent est terminée.

Routage attendu :

```text
AssistantFlottant — orientation     -> /api/agent/analyser-demande
AssistantFlottant — pré-remplissage -> /api/agent/pre-remplir
AssistantFlottant — question        -> /api/agent/question-dossier
/copilote — Agent général           -> /api/agent/repondre
```

Interdictions :

- ne pas recréer `/api/assistant/repondre` ;
- ne pas recréer `/api/assistant/pre-remplir` ;
- ne pas brancher `/api/agent/repondre` au bouton flottant ;
- ne pas affaiblir `scripts/check-agent-boundaries.mjs`.

La première correction ne consiste donc pas à refaire la migration Agent.

---

## 5. Règles générales de modification

1. Ne pas refondre toute l’application.
2. Ne pas mélanger plusieurs priorités dans le même bloc.
3. Ne jamais modifier une migration historique déjà appliquée.
4. Créer une nouvelle migration numérotée pour chaque évolution du schéma.
5. Prévoir un backfill avant toute contrainte `NOT NULL`.
6. Ne jamais désactiver la RLS.
7. Ne jamais utiliser la service role depuis un composant client.
8. Ne jamais rendre un bucket sensible public.
9. Ne jamais faire confiance à un `user_id`, `procedure_id`, `child_id`, `document_id` ou chemin Storage fourni par le client.
10. Ne jamais journaliser de contenu sensible.
11. Préserver autant que possible la compatibilité avec les données existantes.
12. Ajouter des tests ou scripts anti-régression pour les invariants corrigés.
13. Ne pas poursuivre vers le bloc suivant si le bloc courant n’est pas vérifié.

---

# Ordre d’exécution

## Bloc 0 — Baseline et protection du travail existant

### Objectif

Établir une référence avant toute correction.

### Actions

1. Vérifier `git status --short --branch`.
2. Ne jamais écraser les modifications utilisateur non liées.
3. Exécuter :

```bash
npm run check:agent-boundaries
npx tsc --noEmit
npm run build
npm run lint
```

4. Enregistrer les échecs préexistants sans les attribuer aux futures modifications.
5. Confirmer la liste réelle des migrations.

### État connu

Au 22 juin 2026 :

```text
Agent boundaries -> vert
TypeScript        -> vert
Build             -> vert
ESLint            -> rouge, dette préexistante importante
```

### Sortie attendue

Un bref état initial, sans modification métier.

---

## Bloc 1 — P0 : imposer le consentement IA côté serveur

### Statut

Terminé et vérifié le 22 juin 2026.

```text
lib/consentementIaServeur.ts
scripts/check-ia-consent-boundaries.mjs
npm run check:ia-consent
build protégé
```

### Objectif

Empêcher tout appel à Mistral sans consentement enregistré, même si la route est appelée directement.

### Routes concernées

```text
app/api/ia/reformuler/route.ts
app/api/ia/extraire/route.ts
app/api/ia/extraire-pdf/route.ts
```

### Travail demandé

1. Identifier les fonctionnalités exactes utilisées par l’interface :

```text
reformulation
extraction
```

2. Extraire un helper serveur commun de vérification du consentement, ou réutiliser proprement un helper existant.
3. Vérifier le consentement avec le client Supabase agissant au nom de l’utilisateur.
4. Appliquer un comportement fail-closed en cas d’erreur de lecture.
5. Effectuer la vérification après authentification et avant quota/appel Mistral.
6. Ne pas consommer de quota si le consentement est absent.
7. Renvoyer une erreur stable et compréhensible, idéalement HTTP 403.
8. Ne pas modifier les contrats de réponse métier plus que nécessaire.

### Tests obligatoires

Pour chaque route :

- sans jeton -> 401 ;
- jeton valide sans consentement -> 403 ;
- consentement correspondant -> traitement autorisé ;
- consentement d’une autre fonctionnalité -> refus ;
- erreur Supabase lors du contrôle -> refus ;
- retrait du consentement -> nouvel appel refusé.

Ajouter un test ou script automatisé ciblé si possible.

### Garde-fous

- ne jamais envoyer le contenu à Mistral avant validation du consentement ;
- ne pas logger le texte, le PDF ou la réponse complète du fournisseur ;
- ne pas fusionner toutes les fonctionnalités sous un consentement global.

### Commit conseillé

```text
fix(ia): imposer le consentement côté serveur
```

---

## Bloc 2 — P0 : concevoir la migration multi-procédures

### Statut

Terminé et documenté le 22 juin 2026.

Décisions validées :

```text
priorité : events, expenses, documents, preuves_photo
procedure_id nullable pendant la transition
backfill déterministe uniquement
aucune duplication des lignes ambiguës
rattachement humain pour les cas multi-procédures indécidables
garde_regles dans une étape secondaire
note_brouillon dans une migration séparée par procédure
```

### Objectif

Produire un plan de migration précis avant de toucher au schéma.

### Tables prioritaires

```text
events
expenses
documents
preuves_photo
```

Étudier également :

```text
garde_regles
note_brouillon
exports ou historiques futurs
```

### Diagnostic obligatoire

Pour chaque table, documenter :

- rattachement actuel ;
- présence de `child_id` ou `enfant_id` ;
- création de lignes sans enfant ;
- comportement après suppression de l’enfant ;
- pages de lecture et d’écriture ;
- exports et résumés consommateurs ;
- stratégie de backfill ;
- cas impossible à déduire automatiquement.

### Décisions à prendre explicitement

1. Une donnée sans enfant doit tout de même appartenir à une procédure.
2. L’IA ne choisit jamais un UUID enfant ou procédure arbitraire.
3. La procédure active est résolue par l’application puis validée par la base ou le serveur.
4. Une ligne historiquement ambiguë ne doit pas être copiée dans toutes les procédures.
5. Aucune suppression ne doit rendre silencieusement une donnée « générale ».

### Résultat attendu

Un plan de migration et une matrice fichiers/tables. Ne pas encore lancer une migration massive dans ce bloc.

---

## Bloc 3 — P0 : ajouter `procedure_id` aux données métier

> État au 22 juin 2026 : implémenté par la migration 009, avec colonnes
> nullable/indexées, backfill déterministe, contraintes composites et tests de
> régression locaux. La migration distante reste manuelle. Le bloc suivant doit
> adapter les écritures ; il ne faut pas rendre les colonnes `NOT NULL` tant que
> les lignes héritées ambiguës ne sont pas résolues.

### Précondition

Le plan du bloc 2 est validé.

### Migration

Créer une nouvelle migration, par exemple :

```text
supabase/migrations/009_cloisonnement_donnees_metier.sql
```

Le numéro doit être ajusté à la liste réelle au moment du travail.

### Travail demandé

1. Ajouter `procedure_id` nullable sur les tables validées.
2. Ajouter les clés étrangères et index nécessaires.
3. Backfiller à partir de l’enfant lorsque la relation est non ambiguë.
4. Ne pas inventer de procédure pour les anciennes lignes ambiguës.
5. Définir une stratégie explicite pour ces lignes : écran de rattachement, quarantaine ou procédure unique certaine.
6. Ajouter les contrôles empêchant une procédure appartenant à un autre utilisateur.
7. Ne rendre `procedure_id` obligatoire qu’après résolution vérifiée des anciennes lignes.
8. Prévoir une migration distincte ultérieure si le `NOT NULL` ne peut pas être posé immédiatement.

### Tests SQL

- backfill correct depuis l’enfant ;
- aucune ligne correctement rattachée perdue ;
- ligne sans enfant non dupliquée ;
- procédure d’un autre utilisateur refusée ;
- suppression d’un enfant ne modifie pas `procedure_id` ;
- index utilisés sur les lectures principales.

### Commit conseillé

```text
feat(db): rattacher les données métier aux procédures
```

---

## Bloc 4 — P0 : adapter toutes les écritures

### Statut

TERMINÉ et validé en production le 22 juin 2026 (soir). Commit `b59b359`.

```text
6 créateurs modifiés : journal, frais (documents + expenses), documents,
preuves/nouvelle, ChampPieceJointe, onboarding/CalendrierVisites.
procedure_id enregistré sur chaque insert (procédure active, ou hérité de
l'enfant pour le calendrier de visites).
Refus propre si aucune procédure ; résolution avant upload (pas d'orphelin).
Édition d'un frais : procedure_id non modifié.
Migration 009 appliquée en distant. tsc + build + agent-boundaries verts ;
lint inchangé (129 erreurs préexistantes). Validation SQL : toutes les
nouvelles lignes portent le bon procedure_id, A et B cloisonnés.
Limite : lier une pièce héritée (procedure_id null) à une nouvelle ligne est
rejeté par la contrainte composite -> à débloquer par l'écran de rattachement.
```

Prochain bloc : Bloc 5 (lectures, résumés, exports).

### Objectif

Enregistrer systématiquement la procédure active sur les nouvelles données.

### Modules concernés

- journal ;
- frais ;
- documents ;
- preuves photo ;
- capture rapide ;
- onboarding ;
- import et pré-remplissage ;
- autres créateurs identifiés au bloc 2.

### Travail demandé

1. Résoudre la procédure active avant création.
2. Refuser proprement la création si aucune procédure n’existe.
3. Envoyer `procedure_id` avec la ligne.
4. Vérifier que l’enfant choisi appartient à cette procédure.
5. Vérifier que les documents liés appartiennent à la même procédure.
6. Conserver le choix enfant facultatif quand le métier l’autorise.
7. Ne jamais laisser l’IA produire directement les UUID.

### Tests métier

- création avec enfant ;
- création sans enfant ;
- aucune procédure active ;
- enfant d’une autre procédure ;
- document d’une autre procédure ;
- changement de procédure active entre deux créations.

---

## Bloc 5 — P0 : adapter les lectures, résumés et exports

### Objectif

Filtrer les données en base par `procedure_id` et supprimer la règle « null = visible partout ».

### Modules à contrôler

```text
app/journal
app/frais
app/documents
app/documents/coffre-fort
app/preuves
app/chronologie
app/resume-mois
app/export
app/dossier-avocat
app/implication-parentale
components/TableauDeBord
components/Widget*
lib/etatDossier.ts
lib/resumeDossier.ts
lib/piecesnote.ts
lib/chronologie.ts
lib/timeline/
lib/avocat/
```

### Travail demandé

1. Filtrer `.eq("procedure_id", procedureId)` dans la requête lorsque possible.
2. Éviter de charger toutes les procédures avant filtrage client.
3. Retirer les gardes de type `child_id === null || idsProc.has(child_id)` comme mécanisme principal de cloisonnement.
4. Maintenir le filtre enfant uniquement comme filtre secondaire.
5. Vérifier que le résumé envoyé au Copilote ne contient que la procédure active.
6. Vérifier PDF, CSV, chronologie et dossier avocat.

### Scénario anti-régression obligatoire

Créer ou simuler :

```text
utilisateur U
procédure A + enfant A + données A + données A sans enfant
procédure B + enfant B + données B + données B sans enfant
```

Vérifier :

- A ne montre et n’exporte que A ;
- B ne montre et n’exporte que B ;
- les données sans enfant restent dans leur procédure ;
- le résumé IA A ne contient rien de B ;
- le dossier avocat A ne contient rien de B.

---

## Bloc 6 — P0/P1 : corriger les suppressions enfant et procédure

### Objectif

Empêcher la perte de rattachement et les nettoyages partiels.

### Travail demandé

1. Définir le comportement produit avant suppression :

- empêcher la suppression si des données existent ;
- proposer un rattachement préalable ;
- ou supprimer explicitement les données après confirmation claire.

2. Ne jamais dépendre de `ON DELETE SET NULL` pour transformer automatiquement une donnée métier en donnée générale.
3. Regrouper autant que possible les suppressions Database dans une fonction transactionnelle.
4. Ne pas ignorer les erreurs intermédiaires.
5. Ne pas supprimer une procédure tant que des données métier lui appartiennent, sauf suppression explicite et contrôlée.
6. Préserver les fichiers ou les supprimer en cohérence avec les lignes.

### Tests

- enfant sans donnée ;
- enfant avec faits, frais, documents et preuves ;
- dernier enfant d’une procédure ;
- procédure avec pension et règles ;
- échec d’une étape intermédiaire ;
- aucune donnée devenue visible dans une autre procédure.

---

## Bloc 7 — P1 : renforcer RLS et intégrité relationnelle

### Objectif

Garantir que toutes les références d’une ligne appartiennent au même utilisateur et à la même procédure.

### À vérifier

- `WITH CHECK` effectif sur les écritures ;
- cohérence `user_id` ;
- appartenance du `procedure_id` ;
- appartenance de l’enfant à la procédure ;
- appartenance du document lié ;
- impossibilité de déplacer une ligne vers une procédure étrangère ;
- restrictions Storage cohérentes.

### Moyens possibles

Choisir la solution la plus simple et robuste :

- policies avec `exists` ;
- triggers de validation ;
- fonctions SQL sécurisées ;
- contraintes composites si compatibles avec le schéma.

Ne pas empiler plusieurs mécanismes sans nécessité.

### Tests avec deux utilisateurs

- lecture étrangère refusée ;
- modification étrangère refusée ;
- référence vers enfant étranger refusée ;
- référence vers procédure étrangère refusée ;
- référence vers document étranger refusée ;
- mutation de `user_id` refusée.

---

## Bloc 8 — P1 : sécuriser les uploads

### Objectif

Aligner la sécurité Storage avec les règles affichées dans l’interface.

### Travail demandé

1. Définir des tailles maximales adaptées par bucket.
2. Définir les types MIME autorisés.
3. Ne pas se fier uniquement à l’extension ou au MIME client.
4. Conserver des noms de fichiers neutralisés.
5. Supprimer le fichier si l’insertion métier échoue.
6. Traiter l’échec Storage lors d’une suppression.
7. Préserver l’original des preuves.
8. Ne jamais rendre les buckets publics.

### Tests

- fichier autorisé ;
- type interdit ;
- fichier trop volumineux ;
- insertion DB échouée après upload ;
- suppression Storage échouée ;
- tentative d’accès au chemin d’un autre utilisateur.

---

## Bloc 9 — P1 : fiabiliser suppression RGPD et portabilité

### Objectif

Garantir l’effacement complet et permettre un export exploitable des données.

### Travail demandé

1. Paginer récursivement la liste Storage au-delà de 1 000 éléments.
2. Rendre l’opération idempotente et reprenable.
3. Vérifier chaque bucket et chaque table après suppression.
4. Ne supprimer le compte Auth qu’après les données et fichiers.
5. Fournir un message précis en cas de suppression partielle sans exposer de données.
6. Concevoir un export de portabilité JSON/CSV et fichiers, distinct du dossier avocat.
7. Documenter les limites liées aux sauvegardes des prestataires.

### Tests

- compte vide ;
- compte complet ;
- plus de 1 000 fichiers ;
- sous-dossiers imbriqués ;
- reprise après erreur ;
- second appel après suppression partielle.

---

## Bloc 10 — P1 : tests automatisés

### Objectif

Créer une base de non-régression avant les évolutions UX.

### Priorités

1. Fonctions pures : calculs, filtrage, orientation et validateurs.
2. Contrats Agent et consentement serveur.
3. Tests SQL/RLS avec deux utilisateurs.
4. Scénarios multi-procédures.
5. Exports et résumés.
6. Suppressions.

Ajouter un framework minimal compatible avec le projet. Ne pas installer une infrastructure lourde sans justification.

Les tests doivent être exécutables par une commande documentée dans `package.json`.

---

## Bloc 11 — P1/P2 : dette ESLint et React 19

### Objectif

Obtenir un lint utile, puis vert, sans masquer les problèmes réels.

### Ordre recommandé

1. Exclure les artefacts générés comme `.gitnexus/**`.
2. Corriger les imports inutilisés.
3. Corriger les types `any` sur les chemins critiques.
4. Corriger les dépendances de hooks.
5. Examiner les erreurs `set-state-in-effect` selon React 19.
6. Corriger les erreurs JSX mécaniques.

Ne pas désactiver globalement une règle simplement pour rendre la commande verte.

---

## Bloc 12 — P1 : en-têtes de sécurité Next.js

### Précondition

Lire la documentation Next.js 16 locale pertinente avant modification.

### Objectif

Ajouter des en-têtes adaptés sans casser Supabase, Mistral, les polices, les blobs, les PDF ou la PWA.

Étudier :

- Content-Security-Policy ;
- Referrer-Policy ;
- Permissions-Policy, notamment géolocalisation ;
- X-Content-Type-Options ;
- frame-ancestors ou équivalent ;
- HSTS selon la responsabilité Vercel/domaine.

Commencer en mode test ou avec une politique mesurée si une CSP stricte risque de casser l’application.

---

## Bloc 13 — P1 : cohérence RGPD et juridique

### Objectif

Aligner les textes avec les configurations et contrats réellement vérifiés.

### Vérifications externes requises

- région Supabase ;
- région d’exécution Vercel ;
- DPA Supabase/Vercel/Mistral ;
- ZDR ou localisation Mistral ;
- politique d’entraînement ;
- durée réelle des sauvegardes ;
- durée de conservation des journaux techniques ;
- statut réel de l’éditeur.

Ne pas inventer une garantie à partir du code.

Toute formulation incertaine doit être prudente ou marquée comme à confirmer.

---

## Bloc 14 — P2 : performance et pagination

### Objectif

Réduire les chargements complets et les filtrages côté navigateur.

### Travail demandé

- filtrer par procédure dans les requêtes ;
- limiter les colonnes sélectionnées ;
- ajouter une pagination aux listes volumineuses ;
- éviter les requêtes dupliquées entre widgets ;
- mesurer avant d’ajouter une abstraction ou un cache.

---

## Bloc 15 — P2 : UX et exports

Ne commencer ce bloc qu’après stabilisation du socle.

### UX

Organiser progressivement l’expérience autour de :

```text
Ajouter
Comprendre
Produire
```

### Exports

Consolider :

- dossier PDF par procédure ;
- chronologie ;
- tableaux financiers ;
- bordereau de pièces ;
- rapport de preuve photo ;
- dossier avocat ;
- export de portabilité RGPD.

Ne jamais confondre export métier, transmission à un avocat et portabilité des données.

---

# Vérifications après chaque bloc

Exécuter au minimum :

```bash
npm run check:agent-boundaries
npx tsc --noEmit
npm run build
```

Exécuter également :

```bash
npm run lint
```

Tant que la dette ESLint préexistante n’est pas résolue, comparer précisément les erreurs avant/après et ne tolérer aucune nouvelle erreur liée au bloc.

Ajouter les tests spécifiques du bloc et signaler toute commande non exécutée.

---

# Format de compte rendu obligatoire

Après chaque bloc :

```md
## Résumé du bloc

### Fichiers modifiés
- ...

### Correction réalisée
- ...

### Données et migrations
- migration créée ou aucune migration
- stratégie de backfill
- compatibilité avec l’existant

### Garde-fous conservés
- RLS
- consentement
- validation humaine
- absence de conseil juridique

### Tests lancés
- commande : résultat

### Risques ou limites restantes
- ...

### Prochain bloc recommandé
- ...
```

Ne jamais annoncer « tout est corrigé » si une commande échoue ou si la base distante n’a pas été vérifiée.

---

# Checklist avant chaque modification

- Le problème est-il confirmé dans le code actuel ?
- Le bloc est-il suffisamment petit ?
- Une migration historique risque-t-elle d’être modifiée ?
- Les anciennes données sont-elles préservées ?
- La procédure active est-elle respectée ?
- Les références appartiennent-elles au bon utilisateur ?
- La RLS reste-t-elle active ?
- Le Storage reste-t-il privé ?
- Le consentement est-il vérifié côté serveur ?
- Une donnée sensible risque-t-elle d’être loggée ?
- Une sortie IA reste-t-elle une proposition à valider ?
- Le vocabulaire juridique reste-t-il prudent ?
- Les tests anti-régression sont-ils prévus ?
- La documentation Next.js 16 pertinente a-t-elle été lue ?

---

# Résultat final attendu

À l’issue de la stabilisation :

- chaque donnée métier appartient directement à une procédure ;
- aucune donnée sans enfant n’apparaît dans plusieurs dossiers ;
- supprimer un enfant ne contamine pas une autre procédure ;
- tous les appels IA exigent un consentement serveur approprié ;
- les relations intertables sont protégées par utilisateur et procédure ;
- les uploads sont limités et les échecs ne laissent pas de fichiers orphelins ;
- la suppression RGPD couvre toutes les données et tous les fichiers ;
- les exports sont strictement cloisonnés ;
- les tests couvrent les scénarios sensibles ;
- le lint devient exploitable puis vert ;
- les textes publics correspondent aux engagements réellement vérifiés ;
- le Copilote reste factuel, prudent et soumis à validation humaine.

Règle finale :

```text
Quand un doute existe, ne pas inventer, ne pas élargir le périmètre et ne pas affaiblir la sécurité.
Vérifier, corriger un seul bloc, tester, puis rendre compte.
```
