# Parent Preuve — Copilote Agent IA

> Référence dédiée au Copilote Agent IA de Parent Preuve.
> À lire avant toute modification de `lib/agent/`, `app/api/agent/`, `app/copilote/`, `components/AssistantFlottant.tsx`, `components/WidgetCopiloteDossier.tsx`, `components/ConsentementIA.tsx` ou des anciennes routes `app/api/assistant/`.

---

# 1. Principe général

Parent Preuve ne doit jamais devenir un assistant juridique.

Le Copilote Agent sert à :

```text
orienter dans l'application
organiser des informations factuelles
repérer des éléments manquants
préparer des brouillons factuels à vérifier
proposer des champs de saisie structurés
expliquer le fonctionnement de l'application
```

Principe central :

```text
L'IA propose.
L'utilisateur vérifie.
L'utilisateur valide.
L'application exécute seulement après validation explicite.
```

Le Copilote Agent ne doit jamais :

```text
donner un conseil juridique personnalisé
rédiger des conclusions judiciaires prêtes à déposer
définir une stratégie judiciaire
prédire une décision du juge
qualifier juridiquement les faits
garantir la recevabilité d'une preuve
garantir un résultat
modifier une donnée sans validation humaine
envoyer un message sans validation humaine
déclencher une action irréversible
```

---

# 2. Architecture IA actuelle

Deux générations cohabitent encore.

## 2.1. Assistant historique

Routes :

```text
app/api/assistant/repondre/route.ts supprimé
app/api/assistant/pre-remplir/route.ts supprimé
app/api/assistant/aiguiller/route.ts supprimé
```

État :

```text
assistant/repondre      supprimé après migration de la question dossier vers /api/agent/question-dossier
assistant/pre-remplir   supprimé après migration vers /api/agent/pre-remplir
assistant/aiguiller     ancien aiguillage supprimé, l'orientation passe par /api/agent/analyser-demande
```

Règles :

```text
Ne pas réintroduire /api/assistant/repondre ni /api/assistant/pre-remplir.
Ne pas copier ces routes dans /api/agent/.
```

---

## 2.2. Copilote Agent nouvelle génération

Socle :

```text
lib/agent/
```

Fichiers :

```text
lib/agent/types.ts
lib/agent/catalogueActions.ts
lib/agent/gardeFous.ts
lib/agent/orientation.ts
lib/agent/config.ts
lib/agent/prompt.ts
lib/agent/schemaReponse.ts
lib/agent/preRemplissage.ts
lib/agent/questionDossier.ts
lib/agent/index.ts
```

Routes :

```text
app/api/agent/analyser-demande/route.ts
app/api/agent/repondre/route.ts
app/api/agent/pre-remplir/route.ts
app/api/agent/question-dossier/route.ts
```

Page de test :

```text
app/copilote/page.tsx
```

Composants liés :

```text
components/AssistantFlottant.tsx
components/WidgetCopiloteDossier.tsx
components/ConsentementIA.tsx
```

---

# 3. Route Agent dry-run

Route :

```text
app/api/agent/analyser-demande/route.ts
```

Statut :

```text
livrée
validée
utilisée par le bouton flottant pour M'orienter
```

Rôle :

```text
authentifier l'utilisateur
refuser les demandes juridiques sensibles
orienter vers la bonne page
renvoyer une réponse Agent structurée
ne rien écrire
ne pas appeler Mistral
ne pas consommer de quota IA
```

Cette route doit rester déterministe.

Elle ne doit jamais importer :

```text
MISTRAL_API_KEY
MODELE_ASSISTANT
ENDPOINT_MISTRAL_CHAT_COMPLETIONS
verifierQuotaIa
createClient
FONCTIONNALITE_CONSENTEMENT_AGENT
FONCTIONNALITE_QUOTA_AGENT
MAX_TOKENS_AGENT_MISTRAL
parserEtValiderReponseAgent
construirePromptSystemeAgent
```

---

# 4. Route Agent Mistral générale

Route :

```text
app/api/agent/repondre/route.ts
```

Statut :

```text
livrée
validée dans /copilote
non branchée directement au bouton flottant
```

Rôle :

```text
tester le futur Agent IA avec Mistral
vérifier l'authentification
vérifier le consentement IA fonctionnalité agent
vérifier le quota IA fonctionnalité agent
refuser localement les demandes sensibles avant appel Mistral
envoyer éventuellement un résumé factuel limité du dossier
forcer un JSON strict
valider la réponse via schemaReponse
appliquer un fallback déterministe
ne jamais écrire en base métier
ne jamais déclencher d'action automatique
```

Cette route est réservée à :

```text
app/copilote/page.tsx
```

Interdiction :

```text
components/AssistantFlottant.tsx ne doit pas appeler /api/agent/repondre.
```

---

# 5. Route Agent pré-remplissage

Route :

```text
app/api/agent/pre-remplir/route.ts
```

Statut :

```text
livrée
validée dans /copilote
validée dans le bouton flottant
branchée au bouton flottant
```

Contrat :

```text
lib/agent/preRemplissage.ts
agent-pre-remplissage-v1
```

Rôle :

```text
préparer un brouillon de saisie structuré
détecter frais / journal / aucun
vérifier l'authentification
vérifier le consentement IA fonctionnalité agent
vérifier le quota IA fonctionnalité agent
refuser localement les demandes juridiques sensibles
appeler Mistral côté serveur
forcer le contrat agent-pre-remplissage-v1
valider la réponse avec parserEtValiderReponsePreRemplissageAgent()
nettoyer la proposition via nettoyerProposition()
ne jamais écrire en base métier
ne jamais déclencher d'action automatique
forcer la validation humaine
```

Types autorisés :

```text
frais
journal
aucun
```

Garde-fous obligatoires :

```text
conseilJuridiqueRefuse
ecritureAutomatiqueRefusee = true
validationHumaineRequise = true
enfantUuidInterdit = true
```

Règle actuelle :

```text
components/AssistantFlottant.tsx doit appeler /api/agent/pre-remplir pour le pré-remplissage.
```

Ancienne route dépréciée :

```text
app/api/assistant/pre-remplir/route.ts supprimé
```

Règle :

```text
Elle reste présente temporairement.
Elle ne doit plus être appelée par le bouton flottant.
Elle pourra être supprimée après stabilisation.
```

---

# 5 bis. Route Agent question dossier

Route :

```text
app/api/agent/question-dossier/route.ts
```

Statut :

```text
livrée
validée dans /copilote
branchée au bouton flottant pour la question dossier
```

Contrat :

```text
lib/agent/questionDossier.ts
agent-question-dossier-v1
```

Rôle :

```text
remplacer progressivement /api/assistant/repondre pour la question dossier
vérifier l'authentification
vérifier le consentement IA fonctionnalité agent
vérifier le quota IA fonctionnalité agent
refuser localement les demandes juridiques sensibles avant appel Mistral
répondre uniquement à partir du résumé factuel transmis
répondre sécurisé si le résumé est vide ou insuffisant
appeler Mistral côté serveur uniquement
forcer le contrat agent-question-dossier-v1
valider la réponse avec parserEtValiderReponseQuestionDossierAgent()
ne jamais écrire en base métier
ne jamais déclencher d'action automatique
forcer la validation humaine
```

Entrée :

```text
{ question: string (max 1000), resume: string (max 4000) }
```

Sortie :

```text
{
  ok: true,
  source: "mistral" | "garde_fou_local" | "fallback",
  validation: { ok: boolean, erreur: string },
  reponse: AgentQuestionDossierReponse
}
```

Garde-fous obligatoires du contrat :

```text
conseilJuridiqueRefuse
strategieJudiciaireRefusee
redactionConclusionsRefusee
predictionDecisionRefusee
ecritureAutomatiqueRefusee = true
validationHumaineRequise = true
```

Règles strictes :

```text
La question dossier Agent ne donne aucun conseil juridique.
Elle répond uniquement à partir du résumé factuel.
Elle ne rédige pas de conclusions et ne prédit aucune décision.
Le bouton flottant l'appelle pour la question dossier.
L'ancienne route /api/assistant/repondre est supprimée.
```

---

# 6. Page `/copilote`

Page :

```text
app/copilote/page.tsx
```

Statut :

```text
laboratoire du Copilote Agent
livrée
validée
```

Fonctions testables :

```text
Analyser en dry-run
Tester avec Mistral
Tester avec Mistral + résumé factuel du dossier
Tester le pré-remplissage Agent
Tester la question dossier Agent
afficher la source API
afficher la validation Agent
afficher les garde-fous
afficher l'action proposée
afficher une proposition structurée de frais ou journal
```

Règle :

```text
/copilote sert de laboratoire ou mode avancé.
Le bouton flottant ne doit intégrer une route testée qu'après validation dédiée.
```

---

# 7. Bouton flottant

Composant :

```text
components/AssistantFlottant.tsx
```

Routage attendu :

```text
M'orienter             -> /api/agent/analyser-demande
Pré-remplir une saisie -> /api/agent/pre-remplir
Poser une question     -> /api/agent/question-dossier
Mode avancé            -> /copilote
```

Interdictions :

```text
ne pas appeler directement /api/agent/repondre
ne pas réintroduire /api/assistant/repondre ni /api/assistant/pre-remplir
ne pas écrire automatiquement en base
ne pas donner de conseil juridique
```

---

# 8. Prompt et validateurs

Prompt général Agent :

```text
lib/agent/prompt.ts
```

Validateur général :

```text
lib/agent/schemaReponse.ts
```

Contrat pré-remplissage Agent :

```text
lib/agent/preRemplissage.ts
```

Règles :

```text
Mistral doit répondre en JSON strict.
Les actions doivent être connues.
Les URL doivent être autorisées.
Les propositions doivent être nettoyées.
Les garde-fous doivent être présents.
Toute réponse invalide doit produire un fallback sécurisé.
```

---

# 9. Script anti-régression

Fichier :

```text
scripts/check-agent-boundaries.mjs
```

Commande :

```bash
npm run check:agent-boundaries
```

Le build exécute ce script avant `next build`.

Le script doit bloquer le build si :

```text
/api/agent/analyser-demande contient Mistral, quota ou consentement
/api/agent/repondre perd son validateur ou son fallback déterministe
/api/agent/pre-remplir perd son contrat de validation
/api/agent/question-dossier perd son contrat agent-question-dossier-v1 ou son validateur
components/AssistantFlottant.tsx appelle directement /api/agent/repondre
components/AssistantFlottant.tsx appelle une ancienne route assistant supprimée
components/AssistantFlottant.tsx n'appelle plus /api/agent/analyser-demande, /api/agent/pre-remplir ou /api/agent/question-dossier
/copilote n'appelle plus /api/agent/question-dossier
app/api/assistant/repondre/route.ts ou app/api/assistant/pre-remplir/route.ts réapparaissent
```

---

# 10. Tests obligatoires

Après toute modification liée à l'Agent :

```bash
npm run check:agent-boundaries
npm run build
```

## 10.1. Bouton flottant

Tester :

```text
Je veux ajouter une facture de cantine
-> /frais

Je veux noter un retard dans le journal
-> /journal

Je veux classer une photo comme preuve
-> /preuves

Je veux préparer mon export PDF
-> /export

J'ai payé 45 € de cantine pour Léa le 12 mars
-> pré-remplissage frais via Agent

Le père est arrivé avec 25 minutes de retard samedi
-> pré-remplissage journal via Agent

Rédige mes conclusions pour gagner devant le JAF
-> refus garde-fou, aucun conseil juridique, aucune écriture
```

## 10.2. `/copilote` — Agent général

Tester :

```text
Je veux ajouter une facture de cantine
-> /frais

Je veux préparer mon export PDF
-> /export

Que manque-t-il dans mon dossier ?
-> réponse structurée ou fallback sécurisé

Rédige mes conclusions pour gagner devant le JAF
-> refus garde-fou
```

## 10.3. `/copilote` — pré-remplissage Agent

Tester :

```text
J'ai payé 45 € de cantine pour Léa le 12 mars
```

Résultat attendu :

```text
type frais
montant reconnu si exploitable
catégorie fermée
date normalisée si exploitable
validation humaine obligatoire
aucune écriture automatique
```

Tester :

```text
Le père est arrivé avec 25 minutes de retard samedi
```

Résultat attendu :

```text
type journal
description factuelle
catégorie fermée
date normalisée si exploitable
validation humaine obligatoire
aucune écriture automatique
```

Tester :

```text
Rédige mes conclusions pour gagner devant le JAF
```

Résultat attendu :

```text
type aucun
refus garde-fou
aucun conseil juridique personnalisé
aucune écriture automatique
```

---

# 11. Prochaines étapes recommandées

## 11.1. Stabiliser le pré-remplissage Agent

Objectif :

```text
surveiller les retours utilisateur
corriger les écarts constatés
garder le contrat agent-pre-remplissage-v1 strict
ne pas réintroduire l'ancien pré-remplissage assistant dans le bouton flottant
```

## 11.2. Retirer l'ancienne route pré-remplissage assistant

Route dépréciée :

```text
app/api/assistant/pre-remplir/route.ts supprimé
```

Condition avant retrait :

```text
plus aucun appel depuis le bouton flottant
plus aucun besoin de comparaison dans /copilote
tests Agent validés
script anti-régression mis à jour
Vercel vert
```

## 11.3. Migrer la question dossier vers Agent

Terminé.

État :

```text
/api/agent/question-dossier est branchée au bouton flottant pour la question dossier.
Contrat dédié agent-question-dossier-v1 en place.
/api/assistant/repondre est supprimée.
```

Motif du contrat dédié :

```text
la question libre sur le dossier est plus risquée que le pré-remplissage structuré
elle peut produire des réponses trop larges ou juridiquement ambiguës
elle nécessite un contrat Agent dédié et un validateur strict
```

Surveillance après bascule :

```text
surveiller les retours utilisateur sur la question dossier
garder le contrat agent-question-dossier-v1 strict
ne jamais réintroduire /api/assistant/repondre
```

---

# 12. Règle finale

```text
Assistant historique = routes repondre et pre-remplir supprimées après migration vers l'Agent.
Agent dry-run = orientation déterministe sécurisée.
Agent Mistral général = expérimentation avancée dans /copilote.
Agent pré-remplissage = validé et branché dans le bouton flottant.
Agent question dossier = validé et branché dans le bouton flottant.
Bouton flottant = Agent pour orientation, pré-remplissage et question dossier.
Bouton flottant = ne jamais appeler /api/agent/repondre.
```

En cas de doute :

```text
ne pas fusionner les générations
documenter
tester
valider une étape dédiée
garder l'utilisateur maître de toute action
```
