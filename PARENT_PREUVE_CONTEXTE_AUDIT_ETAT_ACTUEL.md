# Parent Preuve — Contexte d’audit vérifié et état actuel

> Audit du code local aligné sur `origin/main`, commit `4b0f7c5`.
> Date de vérification : 22 juin 2026.
> Ce document remplace l’audit initial fondé en partie sur des hypothèses.
> Le code et les migrations versionnées restent les sources de vérité.

---

## 1. Objet du document

Ce document décrit l’état réellement observé de l’application Parent Preuve avant stabilisation.

Il sert à :

- distinguer les problèmes confirmés des problèmes déjà corrigés ;
- fixer l’ordre des corrections avant une bêta publique ;
- protéger les invariants juridiques, RGPD et métier ;
- éviter une refonte massive ou des corrections fondées sur une documentation obsolète.

L’objectif immédiat n’est pas d’ajouter de nouvelles fonctions. Il est de fiabiliser le produit existant.

---

## 2. Positionnement invariant

Parent Preuve aide un parent à organiser un dossier factuel de coparentalité : faits, frais, pension, documents, preuves photo, décisions, chronologie et exports.

Parent Preuve n’est jamais :

- un avocat ou un assistant juridique ;
- un moteur de stratégie judiciaire ;
- un outil de prédiction d’une décision ;
- un commissaire de justice ;
- une garantie de recevabilité ou de résultat.

Principe central :

```text
L’IA propose.
L’utilisateur vérifie.
L’utilisateur valide.
L’application n’exécute aucune action engageante sans validation explicite.
```

---

## 3. Périmètre et méthode de l’audit

L’audit a porté sur :

- les pages et composants React ;
- les routes API Next.js ;
- le Copilote Agent et ses garde-fous ;
- les migrations Supabase, la RLS et Storage ;
- le cloisonnement par procédure ;
- les flux de création, modification, suppression et export ;
- les preuves photo et l’horodatage ;
- le consentement IA et les quotas ;
- la suppression de compte ;
- la PWA et le service worker ;
- les textes légaux présents dans l’application ;
- les scripts, le build, TypeScript, ESLint et les dépendances.

Vérifications exécutées :

```text
npm run check:agent-boundaries  -> réussi
npx tsc --noEmit                -> réussi
npm run build                   -> réussi
npm run lint                    -> échec : 129 erreurs, 10 avertissements
npm audit --omit=dev            -> 3 vulnérabilités modérées, 2 faibles
smoke test HTTP                 -> réussi ; API Agent sans jeton refusée en 401
```

Limites :

- aucune comparaison directe avec le schéma Supabase distant n’a été faite ;
- aucun test E2E authentifié avec plusieurs comptes n’a été exécuté ;
- les engagements contractuels réels de Vercel, Supabase et Mistral n’ont pas été vérifiés dans leurs consoles ou contrats.

---

## 4. État global du produit

Parent Preuve est une bêta avancée, riche et compilable.

Fonctions principales présentes :

- authentification Supabase ;
- procédures multiples et procédure active ;
- dossier déclarant et informations de l’autre parent ;
- enfants ;
- journal ;
- frais et justificatifs ;
- pension ;
- documents et coffre-fort ;
- preuves photo ;
- chronologie et calendrier ;
- courriers factuels ;
- note de synthèse ;
- exports PDF et CSV ;
- dossier de transmission à l’avocat ;
- extraction de jugement ;
- reformulation ;
- Copilote Agent ;
- onboarding ;
- PWA ;
- pages légales et suppression de compte.

Le produit n’est toutefois pas prêt pour une préproduction publique. Les principaux blocages sont le cloisonnement multi-procédures, le consentement IA côté serveur, l’intégrité relationnelle et la robustesse RGPD.

---

## 5. Point désormais validé — migration du Copilote Agent

L’ancien audit signalait une migration incomplète entre `/api/assistant/*` et `/api/agent/*`. Ce diagnostic n’est plus actuel.

État réel :

```text
Orientation             -> /api/agent/analyser-demande
Pré-remplissage         -> /api/agent/pre-remplir
Question sur le dossier -> /api/agent/question-dossier
Mode diagnostic         -> /copilote
```

Les anciennes routes suivantes sont absentes :

```text
/api/assistant/repondre
/api/assistant/pre-remplir
/api/assistant/aiguiller
```

`/api/agent/repondre` reste volontairement réservé au laboratoire `/copilote` et ne doit pas être appelé par le bouton flottant.

Le script `scripts/check-agent-boundaries.mjs` protège correctement ces frontières et passe avec succès.

Décision : ne pas refaire cette migration. Maintenir les garde-fous et les tests existants.

---

## 6. P0 — Cloisonnement multi-procédures incomplet

### 6.1. Cause structurelle

Les tables suivantes n’ont pas de `procedure_id` direct :

- `events` ;
- `expenses` ;
- `documents` ;
- `preuves_photo` ;
- `garde_regles` dépend uniquement de l’enfant.

Leur procédure est déduite du rattachement à un enfant.

Les lignes dont `child_id` ou `enfant_id` vaut `null` sont considérées comme générales. Le code les inclut dans toutes les procédures de l’utilisateur.

Ce comportement apparaît notamment dans :

- le journal ;
- les frais ;
- les documents et le coffre-fort ;
- les preuves photo ;
- la chronologie ;
- les tableaux de bord ;
- le résumé transmis au Copilote ;
- les exports ;
- le dossier avocat.

### 6.2. Effet des suppressions

Les clés étrangères vers les enfants utilisent souvent `ON DELETE SET NULL`.

Lorsqu’un enfant est supprimé :

- ses faits deviennent des faits sans enfant ;
- ses frais deviennent des frais sans enfant ;
- ses documents deviennent des documents sans enfant ;
- ses preuves deviennent des preuves sans enfant.

Ces données peuvent alors apparaître dans toutes les autres procédures du même compte.

La suppression automatique d’une procédure devenue sans enfant aggrave le problème : elle supprime les règles et pensions directement rattachées, mais pas les données métier indirectement rattachées à l’enfant supprimé.

### 6.3. Risque

Il ne s’agit pas, dans l’état observé, d’une fuite entre utilisateurs : la RLS limite les lignes au propriétaire.

Il s’agit néanmoins d’un défaut métier majeur :

- mélange entre plusieurs dossiers familiaux ;
- export d’éléments dans la mauvaise procédure ;
- résumé IA contaminé ;
- dossier avocat incorrect ;
- perte de la provenance après suppression d’un enfant.

### 6.4. Cible

Ajouter un `procedure_id` direct aux données métier concernées, puis :

- backfiller depuis l’enfant quand c’est possible ;
- traiter explicitement les anciennes lignes sans enfant ;
- enregistrer la procédure active à chaque création ;
- filtrer en base par `procedure_id` ;
- interdire le mélange dans les exports ;
- définir une stratégie de suppression sans transformation silencieuse en donnée générale.

### 6.5. Résultat du bloc 2 — matrice de migration

Le bloc 2 a cartographié le schéma et tous les flux sans modifier la base.

| Table | État actuel | Créations principales | Lectures sensibles | Décision |
|---|---|---|---|---|
| `events` | `child_id` nullable, aucun `procedure_id` | journal, calendrier de visites | journal, accueil, résumé mensuel, chronologie, export, dossier avocat | ajouter `procedure_id` direct en priorité |
| `expenses` | `child_id` nullable, `document_id` nullable | page frais | frais, accueil, résumé, chronologie, export, dossier avocat | ajouter `procedure_id` direct en priorité |
| `documents` | `child_id` nullable | documents, frais, champ pièce jointe | documents, coffre-fort, journal, frais, chronologie, notes, exports | ajouter `procedure_id` direct en priorité |
| `preuves_photo` | `enfant_id` nullable | nouvelle preuve | preuves, accueil, chronologie, notes, dossier avocat | ajouter `procedure_id` direct en priorité |
| `garde_regles` | `enfant_id` obligatoire, suppression en cascade | calendrier, onboarding | calendrier, échéances, chronologie, note | ajouter ensuite pour cohérence ; risque immédiat plus faible |
| `note_brouillon` | une seule ligne par utilisateur | note de synthèse | note de synthèse | migration séparée vers une ligne par utilisateur et procédure |

Tables déjà directement rattachées à une procédure :

```text
children
pension_payments
pension_regle
frais_regle
dvh_regle
decision_regle
```

Leurs clés étrangères utilisent toutefois souvent `ON DELETE SET NULL`. Leur
comportement de suppression devra être harmonisé avec la stratégie stricte avant
de rendre `procedure_id` obligatoire partout.

### 6.6. Backfill déterministe retenu

Le backfill doit suivre cet ordre et ne jamais inventer une relation :

1. rattacher depuis l'enfant lorsque l'enfant et la ligne appartiennent au même utilisateur ;
2. pour un fait ou un frais sans enfant, utiliser la procédure du document lié seulement si ce document possède un enfant avec une procédure certaine ;
3. pour un document sans enfant, utiliser la procédure des faits ou frais liés seulement si toutes les références certaines convergent vers une seule procédure ;
4. si l'utilisateur possède exactement une procédure, y rattacher les lignes encore non ambiguës ;
5. laisser `procedure_id = null` dans tous les autres cas.

Interdictions :

- ne pas choisir la première procédure arbitrairement ;
- ne pas copier une ligne dans plusieurs procédures ;
- ne pas déduire depuis un nom, un titre ou un texte libre ;
- ne pas demander à l'IA de choisir la procédure ;
- ne pas supprimer une ligne ambiguë.

### 6.7. Traitement des lignes ambiguës

Une ligne est ambiguë lorsqu'elle n'a pas d'enfant exploitable, qu'aucune relation
unique ne permet de retrouver sa procédure et que l'utilisateur possède plusieurs
procédures.

Ces lignes doivent :

- rester en base avec `procedure_id = null` pendant la transition ;
- être exclues des vues et exports strictement rattachés ;
- apparaître dans un écran ou encart « Éléments à rattacher » ;
- être rattachées uniquement par un choix humain explicite ;
- conserver leur identifiant, leur fichier et leur historique.

Le passage à `NOT NULL` n'est autorisé qu'après résolution de toutes les lignes ambiguës.

### 6.8. Séquençage de migration retenu

#### Étape A — structure compatible

Créer une nouvelle migration ajoutant `procedure_id` nullable et indexé sur :

```text
events
expenses
documents
preuves_photo
```

Effectuer uniquement le backfill déterministe. La migration doit pouvoir être
appliquée avant le nouveau front sans casser les insertions existantes.

#### Étape B — écritures

Adapter tous les créateurs pour enregistrer la procédure active, y compris :

```text
app/journal/page.tsx
app/frais/page.tsx
app/documents/page.tsx
app/preuves/nouvelle/page.tsx
components/ChampPieceJointe.tsx
components/onboarding/CalendrierVisites.tsx
```

Chaque création sans procédure doit être refusée proprement.

#### Étape C — lectures strictes

Filtrer en base sur `procedure_id` dans les pages, widgets, résumés, chronologies,
notes et exports. Supprimer la règle `child_id === null || idsProc.has(child_id)`
comme mécanisme de cloisonnement.

#### Étape D — ambiguïtés et contrainte finale

Livrer le rattachement manuel, vérifier qu'il ne reste aucune ligne ambiguë, puis
ajouter `NOT NULL` dans une migration ultérieure.

#### Étape E — tables secondaires

Migrer `garde_regles` vers un rattachement direct cohérent. Migrer séparément
`note_brouillon` vers une unicité `(user_id, procedure_id)` afin d'éviter qu'un
brouillon d'une procédure soit chargé dans une autre.

### 6.9. Intégrité relationnelle cible

La base doit garantir, indépendamment du client :

- que `procedure_id` appartient au même `user_id` que la ligne ;
- que l'enfant appartient à cette procédure et à cet utilisateur ;
- que le document lié appartient à cette même procédure ;
- qu'une mise à jour ne déplace pas une ligne vers une procédure étrangère.

Option principale recommandée : contraintes composites appuyées par des clés
uniques sur les triplets utiles, complétées par des policies RLS `WITH CHECK`.
Une solution par triggers n'est à retenir que si les contraintes composites se
révèlent impraticables lors du prototype SQL.

### 6.10. Stratégie de suppression

Pendant la transition :

- empêcher la suppression d'un enfant tant que des données lui sont rattachées,
  ou demander une action explicite de détachement/réaffectation ;
- empêcher la suppression d'une procédure tant qu'elle contient des données métier ;
- ne jamais utiliser `ON DELETE SET NULL` pour rendre une donnée générale ;
- ne jamais ignorer une erreur de suppression intermédiaire.

Après ajout du `procedure_id` direct, détacher volontairement un enfant peut
laisser la donnée dans sa procédure, mais ce choix doit être visible et confirmé.

### 6.11. Matrice de tests obligatoire

Préparer au minimum :

```text
U1 / procédure A / enfant A / données avec et sans enfant
U1 / procédure B / enfant B / données avec et sans enfant
U2 / procédure C / enfant C
```

Vérifier :

- aucune ligne A dans B et réciproquement ;
- aucune référence de U1 vers une procédure, un enfant ou un document de U2 ;
- backfill depuis enfant correct ;
- backfill mono-procédure correct ;
- ligne multi-procédures ambiguë laissée à null ;
- aucune duplication ;
- exports et résumé IA strictement cloisonnés ;
- suppression enfant/procédure bloquée ou explicitement traitée ;
- fichiers Storage préservés pendant le backfill ;
- migration rejouable sur une base de test reconstruite depuis 001 à 008.

---

## 7. P0 corrigé — Consentement IA imposé sur toutes les routes serveur

Les routes Agent vérifiaient déjà correctement :

- l’authentification ;
- le consentement `agent` ;
- le quota ;
- les garde-fous ;
- la validation de la réponse.

L’audit avait confirmé que les routes suivantes ne vérifiaient pas le consentement en base :

```text
/api/ia/reformuler
/api/ia/extraire
/api/ia/extraire-pdf
```

Ce défaut a été corrigé dans le bloc de stabilisation 1.

État actuel :

```text
helper partagé : lib/consentementIaServeur.ts
/api/ia/reformuler   -> consentement "reformulation"
/api/ia/extraire     -> consentement "extraction"
/api/ia/extraire-pdf -> consentement "extraction"
ordre obligatoire   -> authentification, consentement, quota, traitement
erreur de lecture   -> refus fail-closed HTTP 403
```

Le script `scripts/check-ia-consent-boundaries.mjs` protège cet ordre et fait désormais partie du build.

---

## 8. P1 — Intégrité RLS et relations entre tables

### 8.1. Points positifs

- RLS activée sur les 17 tables initiales ;
- policies de lecture et d’écriture basées sur `auth.uid() = user_id` ;
- buckets `preuves` et `justificatifs` privés ;
- chemins Storage préfixés par l’identifiant utilisateur ;
- aucune policy Storage `UPDATE` sur les originaux ;
- clés Mistral, horodatage et service role côté serveur ;
- `supabaseAdmin` filtré par `user_id` dans les routes sensibles observées.

### 8.2. Limite confirmée

Les policies vérifient le propriétaire de la ligne, mais pas le propriétaire des objets référencés.

Il manque des garanties empêchant par exemple qu’une ligne appartenant à un utilisateur référence :

- un enfant d’un autre utilisateur ;
- une procédure d’un autre utilisateur ;
- un document d’un autre utilisateur.

Connaître ou deviner un UUID reste difficile, mais la base doit garantir cette cohérence indépendamment du client.

### 8.3. Validation métier insuffisante

La majorité des écritures est effectuée directement depuis le navigateur. Le schéma impose peu de contraintes sur :

- les montants négatifs ;
- une part due supérieure au montant ;
- la cohérence entre enfant et procédure ;
- la cohérence entre frais, fait et document ;
- les catégories libres ;
- les changements de rattachement.

Cible : renforcer les contraintes SQL, les policies relationnelles et, pour les écritures les plus sensibles, la validation serveur ou des fonctions SQL sécurisées.

---

## 9. P1 — Uploads et Storage

### 9.1. Limites absentes

Les buckets ne déclarent ni taille maximale ni types MIME autorisés.

Les interfaces contrôlent partiellement les fichiers, mais les policies Storage autorisent tout fichier dont le chemin commence par l’identifiant de l’utilisateur.

Risques :

- stockage de fichiers arbitraires ;
- fichiers très volumineux ;
- coût ou déni de service applicatif ;
- divergence entre règles UI et sécurité réelle.

### 9.2. Fichiers orphelins

Le flux courant téléverse souvent le fichier avant de créer la ligne métier. Si l’insertion échoue, aucun rollback ne supprime systématiquement le fichier.

Inversement, certains flux suppriment le fichier puis la ligne sans traiter strictement l’échec Storage.

Cible : limites bucket, validation serveur, noms sûrs, nettoyage compensatoire et tests des échecs partiels.

---

## 10. P1 — Suppression de compte et RGPD

### 10.1. Points positifs

- identité dérivée du jeton vérifié ;
- aucune cible utilisateur fournie par le client ;
- suppressions admin filtrées par `user_id` ;
- données, fichiers et compte Auth inclus dans le flux.

### 10.2. Risques

La liste Storage utilise une limite de 1 000 éléments sans pagination. Un compte volumineux peut donc laisser des fichiers non supprimés.

Le processus est non transactionnel : un échec au milieu produit un état partiellement supprimé. Ce point est parfois inévitable entre Database, Storage et Auth, mais il doit être rendu reprenable et observable sans journaliser de données sensibles.

Il n’existe pas encore de véritable export de portabilité complet.

Cible : pagination Storage, procédure idempotente, reprise après erreur, vérification finale et export structuré des données.

---

## 11. P1 — Robustesse des suppressions métier

Les suppressions de procédure et de procédure orpheline exécutent plusieurs requêtes successives mais ignorent certaines erreurs intermédiaires.

Conséquences possibles :

- nettoyage partiel ;
- règles résiduelles ;
- procédure supprimée alors qu’une dépendance n’a pas été traitée ;
- rattachements transformés en `null` par les clés étrangères.

Cible : opération atomique en base lorsque possible, ou procédure serveur contrôlée avec résultat explicite pour chaque étape.

---

## 12. P1 — Qualité technique et tests

### 12.1. État des contrôles

Le build de production et TypeScript passent.

ESLint échoue avec 129 erreurs et 10 avertissements. Les catégories principales sont :

- `.gitnexus/run.cjs` inclus à tort dans le lint ;
- apostrophes JSX non échappées ;
- `any` explicites ;
- appels synchrones à `setState` dans des effets selon les nouvelles règles React ;
- dépendances de hooks manquantes ;
- imports inutilisés.

Next.js 16 ne bloque pas le build sur ce lint, ce qui explique le build vert malgré la dette.

### 12.2. Couverture de tests

Le dépôt ne contient pas de suite de tests métier automatisés.

Tests présents :

- frontières Agent ;
- petit script de hash.

Tests manquants en priorité :

- deux procédures avec données strictement séparées ;
- suppression d’un enfant ;
- suppression d’une procédure ;
- consentement IA absent, accordé puis retiré ;
- relations appartenant à un autre utilisateur ;
- suppression RGPD avec plus de 1 000 fichiers ;
- exports par procédure ;
- erreurs partielles d’upload.

---

## 13. P1/P2 — Dépendances et configuration Next.js

`npm audit --omit=dev` signale :

- trois vulnérabilités modérées ;
- deux vulnérabilités faibles ;
- aucune vulnérabilité haute ou critique ;
- aucun correctif automatique actuellement proposé.

Les dépendances concernées incluent indirectement `postcss` et `dompurify`, via Next.js et jsPDF.

Le build émet aussi une dépréciation Node liée à `module.register()`.

`next.config.ts` est vide. Pour une application aussi sensible, il faut étudier des en-têtes de sécurité adaptés :

- Content-Security-Policy ;
- Referrer-Policy ;
- Permissions-Policy ;
- X-Content-Type-Options ;
- protection contre l’intégration dans une iframe.

Toute modification Next.js doit être précédée de la lecture du guide correspondant dans `node_modules/next/dist/docs/`.

---

## 14. P1 — Cohérence des textes RGPD et légaux

Les pages légales sont déjà substantielles, mais plusieurs affirmations doivent être démontrées contractuellement ou par configuration :

- exécution Vercel exclusivement en région Paris `cdg1` ;
- traitement Mistral dans l’Union européenne ;
- absence de réutilisation des contenus ;
- suppression des sauvegardes sous 30 jours ;
- conformité de la région Supabase annoncée ;
- DPA et ZDR réellement activés.

Le code ne suffit pas à prouver ces engagements.

Avant ouverture commerciale : vérifier les consoles, contrats, DPA et paramètres réels, puis aligner les textes publics.

---

## 15. P2 — Performance et architecture client

De nombreuses pages chargent toutes les lignes de l’utilisateur, puis filtrent la procédure active dans le navigateur.

Conséquences :

- requêtes plus lourdes à mesure que le dossier grandit ;
- absence de pagination ;
- toutes les procédures transitent dans le navigateur avant filtrage ;
- duplication des règles de filtrage ;
- risque d’incohérence entre widgets, exports et pages.

Cible : filtrage en base par `procedure_id`, sélections de colonnes minimales et pagination progressive.

---

## 16. Preuves photo

Le module possède de bonnes fondations :

- original dans un bucket privé ;
- SHA-256 côté client ;
- recalcul serveur ;
- comparaison des empreintes ;
- date serveur ;
- HMAC interne ;
- GPS facultatif ;
- métadonnées ;
- vocabulaire d’horodatage non qualifié ;
- avertissements sur la portée juridique.

Limites à conserver clairement :

- le hash démontre l’intégrité du fichier stocké, pas la vérité de la scène ;
- l’HMAC interne n’est pas un horodatage qualifié ;
- le système ne remplace pas un constat ;
- la recevabilité dépend du contexte et de l’appréciation du juge.

Améliorations futures : rapport technique, relance de vérification, historique, nettoyage des échecs et intégration stricte par procédure.

---

## 17. PWA et authentification

Le service worker exclut correctement :

- les routes `/api/` ;
- Supabase ;
- Mistral ;
- les requêtes non GET.

Les pages sont principalement des coquilles statiques et les données sont chargées côté client sous RLS. Le garde d’accès est lui-même côté client : une page privée peut répondre HTTP 200 avec sa coquille avant redirection, sans exposer les données Supabase.

Ce fonctionnement est acceptable pour la confidentialité actuelle, mais doit être pris en compte lors de toute future migration vers des Server Components contenant des données privées.

---

## 18. Hygiène des secrets

- `.env.local` est ignoré par Git ;
- `cleapi.txt` est ignoré par Git ;
- aucun secret littéral évident n’a été détecté dans les fichiers suivis ;
- les clés sensibles n’utilisent pas le préfixe `NEXT_PUBLIC_` ;
- la clé Supabase publique reste normalement exposable au client sous protection RLS.

Le fichier local `cleapi.txt` reste toutefois une mauvaise pratique : privilégier uniquement les variables d’environnement et supprimer ce fichier local après vérification de son utilité.

---

## 19. Priorités de stabilisation

### P0 — avant toute autre évolution

1. Ajouter un cloisonnement direct par `procedure_id` aux données métier.
2. Corriger les suppressions enfant/procédure pour préserver ou supprimer explicitement les données.
3. Maintenir le contrôle serveur du consentement IA livré au bloc 1.

### P1 — avant bêta publique

4. Renforcer l’intégrité des références et les validations SQL/serveur.
5. Sécuriser les uploads et les échecs partiels.
6. Fiabiliser la suppression RGPD et ajouter la portabilité.
7. Ajouter les tests métier multi-utilisateurs et multi-procédures.
8. Résorber les erreurs ESLint pertinentes.
9. Ajouter des en-têtes de sécurité compatibles Next.js 16.
10. Vérifier les engagements légaux et contractuels affichés.

### P2 — après stabilisation du socle

11. Filtrage serveur/base et pagination.
12. Simplification UX autour de Ajouter / Comprendre / Produire.
13. Consolidation des exports et rapports de preuve.
14. Revue des dépendances et dépréciations.

---

## 20. Règles d’exécution pour les corrections

- travailler par blocs courts et testables ;
- créer de nouvelles migrations, ne jamais modifier une migration déjà appliquée ;
- préserver les données existantes ;
- ne jamais désactiver la RLS ;
- ne jamais rendre un bucket public ;
- ne jamais exposer un secret au client ;
- ne jamais journaliser un jugement, une donnée enfant, une donnée médicale, une position GPS précise ou une URL signée ;
- conserver la validation humaine pour toute proposition IA ;
- ne pas mélanger migration de données, UX et nouvelle fonctionnalité dans un même bloc ;
- exécuter au minimum TypeScript, garde-fou Agent, build et tests spécifiques après chaque bloc.

---

## 21. Conclusion

Parent Preuve possède une base produit solide, un positionnement prudent et un ensemble fonctionnel déjà avancé.

Le Copilote Agent n’est plus le principal défaut : sa migration est achevée et protégée.

Le véritable chantier prioritaire est désormais la cohérence des données : une donnée doit appartenir directement à une procédure, rester dans cette procédure pendant toute sa vie, et ne jamais devenir silencieusement générale après une suppression.

Une fois le cloisonnement, le consentement serveur, l’intégrité relationnelle et la suppression RGPD stabilisés, le projet pourra raisonnablement avancer vers une bêta publique contrôlée.
