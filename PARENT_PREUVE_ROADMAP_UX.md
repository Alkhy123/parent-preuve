# Parent Preuve — Roadmap UX, produit & Super Agent IA

**Version :** roadmap complète réécrite avec intégration du Super Agent IA  
**Date :** 20 juin 2026  
**Objectif :** servir de document de référence pour continuer le développement de Parent Preuve avec Claude, Cursor ou tout autre assistant de développement.  
**Statut :** document prospectif. Le code réel fait toujours foi.

---

## 0. Résumé exécutif

Parent Preuve doit rester une application française, solo, factuelle et prudente, destinée à aider un parent séparé à transformer les faits du quotidien en dossier clair, daté, structuré et exportable.

Le risque principal n'est pas le manque de fonctionnalités. Le risque principal est l'effet « fourre-tout » : trop de modules visibles au même niveau, trop de menus, trop d'options avancées, et une IA qui deviendrait un chatbot généraliste.

La nouvelle trajectoire doit donc être simple :

> **Parent Preuve ne doit pas seulement stocker des éléments. Parent Preuve doit montrer à l'utilisateur ce qui compte maintenant.**

Le Super Agent IA doit devenir la couche intelligente de cette expérience, mais il ne doit jamais être présenté comme un assistant juridique. Son rôle est de :

- comprendre l'état du dossier ;
- repérer les manques ;
- proposer les prochaines actions utiles ;
- aider à formuler de manière neutre ;
- préparer des brouillons validables ;
- orienter l'utilisateur vers les bons écrans ;
- produire des synthèses factuelles ;
- rester dans un cadre strict : jamais de conseil juridique, jamais de promesse de recevabilité, jamais de décision automatique.

Formulation recommandée :

> **Copilote Parent Preuve : votre aide pour organiser un dossier clair et factuel.**

Formulations à éviter :

- assistant juridique ;
- avocat IA ;
- conseiller juridique ;
- l'IA vous dit quoi demander au juge ;
- l'IA vous aide à gagner ;
- votre preuve est recevable ;
- preuve certifiée ;
- équivalent commissaire de justice.

---

## 0.1. État livré (mise à jour — corrections UX par blocs)

Réalisé et en production (le code fait foi) :

- **Saisie progressive des formulaires** (Journal, Frais, Pension, Documents) : champs essentiels visibles, champs avancés repliés (`OptionsAvancees`), champs obligatoires marqués, messages succès/erreur unifiés (`FormMessage`), états vides (`EmptyState`), confirmation après enregistrement.
- **Frais** : édition d'un frais existant (bouton Modifier) ; parcours justificatif guidé (oui/non, puis téléverser une pièce ou en sélectionner une existante) ; choix « sans justificatif » mémorisé (`expenses.sans_justificatif`) et exclu du widget « Que faire maintenant ? ».
- **Copilote / bouton flottant** : 3 actions en langage clair (« Je ne sais pas où aller », « Pré-remplir une saisie », « Poser une question sur mon dossier »), phrase de cadrage, retrait du jargon (Agent, dry-run, Mistral, « mode avancé ») du parcours normal — labo accessible en « Mode diagnostic ».
- **Pré-remplissage Agent** : nouveau type `pension` (contrat `agent-pre-remplissage-v1` inchangé), désambiguïsation pension vs frais.
- **Design system léger** : `.carte` à relief marqué, token `--or-fonce` lisible (contraste AA) pour le texte doré sur fond clair, classes communes `.btn-*` / `.badge-*` (adoption progressive ; accueil déjà harmonisé).
- **Documents, preuves & exports plus guidés** : export en 3 étapes (période / contrôle / générer) ; preuves photo avec détails techniques repliés et libellé « Preuves photo horodatées » ; intros pédagogiques distinguant document rangé, justificatif et preuve photo ; formulation d'export non anxiogène (« dossier à compléter ») ; avertissements PDF rappelant « organisation factuelle, ni constat ni avis juridique ».
- **Pages publiques & confiance** : bandeaux internes « À faire relire » remplacés par une note discrète sur les mentions légales et la confidentialité (mentions réelles déjà renseignées, éditeur particulier) ; accueil public enrichi discrètement (« ce que Parent Preuve ne fait pas » + rappel confidentialité UE), sans alourdir l'UX. CGU / À propos non créées (non inventées), à décider par le propriétaire ; relecture juridique prévue post-production.

Reste à faire (progressif) : adoption des classes `.btn-*` / `.badge-*` sur les pages formulaires.

---

# 1. Vision produit

## 1.1. Boussole

Phrase de mission interne :

> **Quand tout est confus, Parent Preuve remet de l'ordre dans les faits pour que le parent reprenne pied.**

À chaque arbitrage produit, poser la question :

> Est-ce que cette fonctionnalité aide l'utilisateur à remettre de l'ordre et à reprendre pied ?

Si oui, elle peut entrer dans la roadmap.  
Si elle ajoute du bruit, de l'angoisse, du conflit ou du conseil juridique déguisé, elle doit être repoussée ou supprimée.

## 1.2. Le vrai problème résolu

Le parent séparé en conflit est souvent submergé par trois charges en même temps :

1. **La charge factuelle** : que s'est-il passé, quand, avec quelle preuve ?
2. **La charge administrative** : frais, pension, justificatifs, documents, courriers, échéances.
3. **La charge émotionnelle** : stress, colère, fatigue, sentiment d'injustice, peur d'oublier.

Parent Preuve doit réduire ces trois charges en ramenant l'utilisateur à une méthode :

```text
1. Comprendre la situation.
2. Ajouter les éléments utiles.
3. Produire un dossier clair.
```

## 1.3. Positionnement recommandé

Formule courte :

> **Parent Preuve : l'application française qui aide les parents séparés à transformer les faits du quotidien en dossier clair, daté et exportable.**

Formule plus complète :

> Parent Preuve permet à un parent séparé de centraliser les faits, frais, pensions, preuves photo, documents, courriers et échéances dans un dossier structuré, factuel et exportable pour un avocat, un médiateur, un commissaire de justice ou un juge aux affaires familiales.

## 1.4. Différence avec les applications de coparentalité classiques

Les applications de coparentalité classiques supposent souvent deux parents qui coopèrent autour d'un calendrier, d'une messagerie ou d'un partage de frais.

Parent Preuve doit rester différent :

- outil solo ;
- pas besoin d'inviter l'autre parent ;
- pas de messagerie directe entre deux comptes dans le MVP ;
- pas de promesse de médiation ;
- pas de ton léger ou collaboratif ;
- pas de gamification ;
- pas de vocabulaire agressif ;
- pas de promesse de victoire judiciaire.

Parent Preuve est un outil d'organisation factuelle, pas un réseau social parental.

---

# 2. Contraintes absolues

## 2.1. Contraintes juridiques

Parent Preuve ne doit jamais :

- donner de conseil juridique personnalisé ;
- dire quelle procédure engager ;
- dire quelle demande formuler devant le juge ;
- qualifier juridiquement les faits ;
- dire si l'autre parent est juridiquement en tort ;
- dire si une preuve sera recevable ;
- prédire une décision judiciaire ;
- rédiger des conclusions judiciaires prêtes à déposer ;
- remplacer un avocat ;
- remplacer un commissaire de justice ;
- présenter une photo comme un constat.

L'application peut aider à :

- classer ;
- dater ;
- reformuler ;
- résumer ;
- structurer ;
- extraire des dates, montants et faits ;
- générer une chronologie ;
- préparer une synthèse factuelle ;
- préparer un brouillon de courrier relu et validé par l'utilisateur.

Message de prudence à afficher dans les zones IA :

> Parent Preuve est un outil d'organisation personnelle et factuelle. L'application ne délivre aucun conseil juridique, ne remplace pas un avocat ou un commissaire de justice et ne garantit pas la recevabilité ou l'efficacité d'un élément devant une juridiction.

## 2.2. Contraintes RGPD et données sensibles

Parent Preuve manipule potentiellement :

- identité du parent utilisateur ;
- identité de l'autre parent ;
- identité des enfants ;
- décisions judiciaires ;
- frais médicaux ou scolaires ;
- données de localisation ;
- photos ;
- documents ;
- messages ;
- factures ;
- événements familiaux conflictuels ;
- données concernant des tiers.

Règles de conception :

- minimisation des données ;
- consentement IA clair ;
- possibilité de désactiver l'IA ;
- suppression de compte et des fichiers associés ;
- buckets privés ;
- RLS stricte ;
- pas de document envoyé à l'IA sans action explicite ;
- pas de stockage public de documents sensibles ;
- avertissement avant dépôt de justificatifs médicaux ;
- journalisation prudente des appels IA ;
- éviter les logs serveur contenant des données sensibles.

## 2.3. Contraintes UX

L'application doit rester :

- sobre ;
- neutre ;
- factuelle ;
- non agressive ;
- protectrice ;
- rassurante ;
- centrée sur l'intérêt de l'enfant ;
- utile pour clarifier, pas pour envenimer.

À éviter :

- « piéger l'autre parent » ;
- « prouver que votre ex ment » ;
- « gagner devant le juge » ;
- « dossier à charge » ;
- « faute » ;
- « condamnation » ;
- « preuve irréfutable ».

À préférer :

- « conserver une trace claire » ;
- « organiser les faits » ;
- « préparer un échange avec un professionnel » ;
- « suivre les éléments importants » ;
- « rester factuel » ;
- « dossier clair » ;
- « chronologie » ;
- « pièce » ;
- « élément » ;
- « statut » ;
- « reste dû » ;
- « écart constaté ».

---

# 3. Règle UX centrale : trois gestes

Toute l'application doit être organisée autour de trois gestes principaux.

## 3.1. Comprendre

Question utilisateur :

> Quelle est ma situation aujourd'hui ?

Écrans et composants liés :

- Accueil / Mon dossier ;
- Tableau de bord ;
- Résumé du mois ;
- Prochaines échéances ;
- Situation pension ;
- Situation frais ;
- État des preuves ;
- Contrôle du dossier ;
- Widget « À faire maintenant » ;
- Copilote de dossier.

Le Super Agent intervient ici pour expliquer l'état du dossier en langage simple, sans conseil juridique.

## 3.2. Ajouter

Question utilisateur :

> Qu'est-ce que je veux ajouter comme élément ?

Écrans et composants liés :

- Ajouter un fait ;
- Ajouter une dépense ;
- Ajouter un paiement de pension ;
- Ajouter un document ;
- Capturer une preuve photo ;
- Créer un courrier ;
- Importer un jugement ;
- Importer une ancienne preuve ;
- Bouton `+ Ajouter`.

Le Super Agent intervient ici pour transformer une phrase libre en brouillon structuré, mais l'utilisateur valide toujours avant enregistrement.

## 3.3. Produire

Question utilisateur :

> Que dois-je produire à partir de mon dossier ?

Écrans et composants liés :

- Export PDF ;
- Chronologie ;
- Note pour avocat ;
- Dossier d'audience ;
- Courrier ;
- Bordereau de pièces ;
- Export ZIP avocat ;
- Email suivi ;
- LRE.

Le Super Agent intervient ici pour préparer un document factuel, relu et validé par l'utilisateur avant export ou envoi.

## 3.4. Navigation cible

Navigation recommandée :

```text
Accueil / Mon dossier     → comprendre
+ Ajouter                 → alimenter
Chronologie               → relire
Produire                  → exporter / envoyer / préparer
Réglages                  → configurer
```

Les tables techniques ne doivent pas dicter la navigation.

---

# 4. Super Agent IA : concept produit

## 4.1. Nom recommandé

Ne pas utiliser :

- assistant juridique ;
- avocat IA ;
- conseiller IA ;
- assistant JAF ;
- assistant de procédure.

Utiliser plutôt :

- Copilote Parent Preuve ;
- Aide dossier ;
- Assistant de dossier factuel ;
- Guide de dossier ;
- Aide à l'organisation.

Nom recommandé :

> **Copilote Parent Preuve**

Sous-titre :

> **Votre aide pour organiser un dossier clair et factuel.**

## 4.2. Rôle exact

Le Copilote Parent Preuve doit aider à :

1. comprendre l'état du dossier ;
2. identifier les éléments incomplets ;
3. proposer les prochaines actions utiles ;
4. reformuler de manière neutre ;
5. préparer des brouillons ;
6. classer automatiquement ou semi-automatiquement ;
7. générer des synthèses factuelles ;
8. orienter vers les bons écrans ;
9. expliquer les limites de chaque module ;
10. réduire l'effet fourre-tout.

## 4.3. Ce que l'agent ne doit jamais faire

Le Copilote ne doit jamais :

- créer une action définitive sans validation ;
- supprimer une donnée ;
- modifier un élément validé sans confirmation ;
- dire qu'une preuve est recevable ;
- donner une stratégie judiciaire ;
- qualifier les faits juridiquement ;
- prédire une décision ;
- rédiger des conclusions judiciaires ;
- conseiller de saisir un juge ;
- conseiller de contourner une procédure ;
- inventer un article de loi ;
- inventer un fait absent du dossier.

## 4.4. Positionnement UX

Le Super Agent ne doit pas être un gros chatbot isolé.

Il doit être une couche transversale :

- sur l'accueil : widget « À faire maintenant » ;
- dans le journal : aide à formuler factuellement ;
- dans les frais : aide à comprendre les pièces manquantes ;
- dans la pension : aide à lire le reste dû ;
- dans les preuves : aide à vérifier la complétude technique ;
- dans les courriers : aide à préparer un brouillon neutre ;
- dans l'export : aide à expliquer ce qui est prêt ou incomplet ;
- dans la note avocat : aide à structurer une synthèse factuelle.

La page `/assistant` peut exister, mais elle ne doit pas être l'unique endroit où vit l'agent.

---

# 5. Architecture fonctionnelle du Super Agent

## 5.1. Principe général

Le Super Agent doit fonctionner en couches :

```text
Interface utilisateur
   ↓
Route API serveur
   ↓
Contexte dossier limité
   ↓
Outils internes lecture seule
   ↓
Modèle IA
   ↓
Réponse JSON structurée
   ↓
Validation utilisateur
   ↓
Action ou brouillon
```

## 5.2. Fichiers recommandés

Créer un dossier dédié :

```text
lib/agent/
  agentPrompt.ts
  agentSchemas.ts
  agentContext.ts
  agentTools.ts
  agentGuardrails.ts
  agentActions.ts
  agentValidation.ts
```

Créer une route :

```text
app/api/ia/agent/route.ts
```

Créer des composants :

```text
components/AgentDossier.tsx
components/AgentActionCard.tsx
components/AgentMessage.tsx
components/WidgetActionsPrioritaires.tsx
components/WidgetCopiloteDossier.tsx
components/AideContextuelleIA.tsx
```

Créer éventuellement une page :

```text
app/assistant/page.tsx
```

## 5.3. Réutilisation de l'existant

Le Super Agent doit réutiliser l'existant au lieu de tout recréer.

À réutiliser :

- `lib/authServeur.ts` ;
- `lib/quotaIa.ts` ;
- `consentements_ia` ;
- `ia_appels` ;
- `lib/dossierCalculs.ts` ;
- `lib/controleDossier.ts` ;
- `lib/etatDossier.ts` ;
- `lib/resumeDossier.ts` ;
- `lib/destinationsAssistant.ts` ;
- `lib/modelesIA.ts` ;
- `lib/extractionRegles.ts` ;
- `components/ConsentementIA.tsx` ;
- `components/StatutConsentementIA.tsx` ;
- `PageHeader` ;
- la palette navy/or/crème ;
- les patterns Supabase + RLS.

## 5.4. Tables possibles

Pour une V1, ne pas forcément conserver tout l'historique de conversation.  
Si l'historique devient utile, ajouter :

```sql
create table agent_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  procedure_id uuid references procedures(id) on delete cascade,
  titre text,
  created_at timestamptz not null default now()
);

create table agent_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  session_id uuid references agent_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  contenu text not null,
  intention text,
  action_proposee jsonb,
  created_at timestamptz not null default now()
);

alter table agent_sessions enable row level security;
alter table agent_messages enable row level security;

create policy "agent_sessions_select_own"
on agent_sessions for select
using (auth.uid() = user_id);

create policy "agent_sessions_insert_own"
on agent_sessions for insert
with check (auth.uid() = user_id);

create policy "agent_messages_select_own"
on agent_messages for select
using (auth.uid() = user_id);

create policy "agent_messages_insert_own"
on agent_messages for insert
with check (auth.uid() = user_id);
```

## 5.5. Consentement IA dédié

Ajouter une fonctionnalité de consentement :

```text
agent-dossier
```

Message recommandé :

> Le Copilote peut analyser les éléments de votre dossier afin de proposer une synthèse, des actions prioritaires et des brouillons factuels. Il ne donne pas de conseil juridique et ne prend aucune décision à votre place.

L'utilisateur doit pouvoir :

- accepter ;
- refuser ;
- retirer son consentement ;
- utiliser l'application sans agent.

---

# 6. Prompt système du Super Agent

Créer :

```text
lib/agent/agentPrompt.ts
```

Contenu recommandé :

```ts
export const PROMPT_AGENT_PARENT_PREUVE = `
Tu es le Copilote Parent Preuve.

Tu aides un parent séparé à organiser un dossier factuel après une décision ou une situation liée à la coparentalité.

Règles absolues :
- Tu ne donnes jamais de conseil juridique.
- Tu ne remplaces jamais un avocat, un juge, un médiateur ou un commissaire de justice.
- Tu ne garantis jamais la recevabilité d'une preuve.
- Tu ne garantis jamais l'issue d'une procédure.
- Tu n'inventes jamais un fait absent du dossier.
- Tu n'inventes jamais un article de loi.
- Tu ne qualifies jamais juridiquement les faits.
- Tu distingues toujours les faits saisis, les points manquants et les suggestions pratiques.
- Tu documentes des faits observables, jamais l'intention d'un parent.
- Toute action d'écriture doit rester un brouillon à valider par l'utilisateur.
- Tu ne supprimes rien.
- Tu ne modifies rien définitivement sans validation humaine.
- Tu ne parles pas de faute, culpabilité, condamnation, victoire ou stratégie judiciaire.

Ton rôle :
1. Résumer l'état du dossier.
2. Repérer les éléments incomplets.
3. Proposer les prochaines actions concrètes.
4. Orienter vers les pages autorisées de l'application.
5. Préparer des brouillons factuels, neutres et courts.
6. Aider à reformuler sans émotion excessive.
7. Aider à produire une chronologie ou une synthèse.

Ton ton :
sobre, factuel, protecteur, professionnel, rassurant.

Format de sortie :
Réponds uniquement en JSON conforme au schéma demandé par l'application.
`;
```

---

# 7. Schéma JSON de réponse du Super Agent

## 7.1. Structure générale

Créer dans `lib/agent/agentSchemas.ts` :

```ts
export type NiveauAgent = "info" | "attention" | "urgent";

export type ActionAgent = {
  label: string;
  destination: string;
  raison: string;
  type: "navigation" | "brouillon" | "verification" | "export";
};

export type BrouillonAgent = {
  type: "evenement" | "courrier" | "note" | "chronologie" | "frais" | "pension";
  titre?: string;
  contenu: string;
  doit_etre_valide: true;
};

export type ReponseAgent = {
  message: string;
  niveau: NiveauAgent;
  points: string[];
  actions: ActionAgent[];
  brouillon?: BrouillonAgent;
  limites: string[];
};
```

## 7.2. Exemple de réponse

```json
{
  "message": "Votre dossier contient plusieurs éléments utiles, mais certains doivent être finalisés avant export.",
  "niveau": "attention",
  "points": [
    "2 événements sont encore en brouillon.",
    "1 preuve photo nécessite une vérification.",
    "La pension du mois présente un reste dû."
  ],
  "actions": [
    {
      "label": "Relire le journal",
      "destination": "journal",
      "raison": "Des événements doivent être validés.",
      "type": "navigation"
    },
    {
      "label": "Voir les preuves",
      "destination": "preuves",
      "raison": "Une preuve nécessite une action.",
      "type": "verification"
    }
  ],
  "limites": [
    "Cette analyse est factuelle et ne constitue pas un conseil juridique."
  ]
}
```

## 7.3. Validation obligatoire côté serveur

Ne jamais faire confiance directement à la sortie IA.

Après réponse :

1. parser le JSON ;
2. valider le schéma ;
3. vérifier que les destinations existent dans `destinationsAssistant.ts` ;
4. supprimer toute action non autorisée ;
5. ajouter une limite juridique si elle manque ;
6. refuser les réponses contenant des mots interdits.

Mots ou formulations à bloquer ou à réécrire :

- recevable ;
- irrecevable ;
- condamnation ;
- saisir le juge ;
- faute ;
- abandon de famille ;
- vous devez demander ;
- vous avez toutes vos chances ;
- vous allez gagner ;
- preuve certaine ;
- preuve irréfutable ;
- équivalent huissier ;
- équivalent commissaire de justice.

---

# 8. Outils internes du Super Agent

## 8.1. Phase 1 : lecture seule

Commencer uniquement par des outils lecture seule.

Outils recommandés :

```text
get_resume_dossier
get_controle_dossier
get_situation_pension
get_situation_frais
get_situation_preuves
get_evenements_brouillon
get_documents_incomplets
get_destinations_autorisees
```

Objectif :

> L'agent comprend et explique, mais ne modifie rien.

## 8.2. Phase 2 : brouillons validables

Ajouter des outils de préparation :

```text
preparer_brouillon_evenement
preparer_brouillon_courrier
preparer_note_factuelle
preparer_chronologie
preparer_resume_avocat
preparer_liste_pieces_manquantes
```

Ces outils ne doivent jamais enregistrer directement.

Ils retournent :

```text
brouillon + bouton de validation utilisateur
```

## 8.3. Phase 3 : actions après validation

Uniquement après clic utilisateur :

```text
creer_evenement_brouillon
creer_courrier_brouillon
creer_note_brouillon
lier_piece
ouvrir_export
ouvrir_page_destination
```

Même dans cette phase, l'agent ne fait pas d'action définitive sans validation.

## 8.4. Actions interdites

Interdire au Super Agent :

```text
delete_user_data
delete_evidence
delete_document
send_lre_directly
send_email_directly
submit_legal_claim
create_final_legal_document
change_judgment_rules_without_validation
```

---

# 9. Expérience utilisateur du Super Agent

## 9.1. Sur l'accueil

Créer un widget en haut de page :

```text
À faire maintenant
```

Ce widget est alimenté par `controleDossier`, `dossierCalculs`, les statuts de preuves, les événements brouillons et les situations de pension/frais.

Exemple :

```text
À faire maintenant

1. Compléter 2 événements en brouillon
   Des faits ont été saisis mais pas encore validés.
   [Relire le journal]

2. Vérifier la pension de juin
   Le montant payé semble inférieur au montant attendu.
   [Voir la pension]

3. Ajouter un justificatif à 1 frais
   Un frais enregistré n'a pas encore de pièce liée.
   [Voir les frais]
```

Règles :

- 3 à 4 actions maximum ;
- une raison claire ;
- un bouton direct ;
- pas de jargon ;
- pas d'alarme excessive.

## 9.2. Sur la page Journal

Aide contextuelle :

```text
Transformer en fait neutre
```

Exemple utilisateur :

> Il fait exprès de me payer en retard pour me mettre dans la galère.

Proposition IA :

> La pension due le 5 juin a été versée après la date prévue. Les paiements ont été reçus en plusieurs fois au cours du mois.

Boutons :

```text
Utiliser cette formulation
Modifier
Annuler
```

## 9.3. Sur la page Frais

Aide contextuelle :

- détecter frais sans justificatif ;
- suggérer de lier une pièce ;
- préparer un brouillon de demande de remboursement ;
- rappeler de masquer les informations médicales non nécessaires.

Exemple :

```text
Ce frais est renseigné, mais aucun justificatif n'est lié.
Vous pouvez ajouter une facture ou indiquer que le justificatif est conservé ailleurs.
```

## 9.4. Sur la page Pension

Aide contextuelle :

- résumer le dû / payé / reste ;
- signaler paiements multiples ;
- produire un tableau mensuel ;
- préparer une formulation factuelle.

Exemple :

```text
Pour juin 2026, le montant attendu est de 180 €. Les paiements enregistrés totalisent 120 €. Le reste indiqué par l'application est donc de 60 €.
```

Attention :

Ne jamais écrire :

```text
L'autre parent est en faute.
```

Écrire :

```text
Un écart est constaté entre le montant attendu et les paiements enregistrés.
```

## 9.5. Sur la page Preuves photo

Aide contextuelle :

- expliquer hash ;
- expliquer date serveur ;
- expliquer EXIF absent ;
- vérifier si GPS présent ;
- distinguer horodatage interne et horodatage qualifié ;
- proposer de compléter le contexte.

Exemple :

```text
Cette photo contient une empreinte numérique et une date d'ajout serveur. Les métadonnées GPS ne sont pas disponibles. Vous pouvez ajouter un contexte factuel court pour expliquer la situation.
```

Ne jamais écrire :

```text
Cette photo sera recevable.
```

## 9.6. Sur la page Courriers

Aide contextuelle :

- rédiger une demande neutre ;
- transformer un brouillon émotionnel ;
- proposer un objet clair ;
- proposer une liste de pièces jointes ;
- rappeler les limites email/LRE.

Exemple :

```text
Objet : Transmission d'un justificatif de frais

Bonjour,
Je vous transmets le justificatif relatif au frais suivant : ...
Le montant total est de ...
La part demandée est de ...
Cordialement.
```

## 9.7. Sur la page Export

Aide contextuelle :

- expliquer ce qui est prêt ;
- signaler ce qui manque ;
- proposer les catégories utiles ;
- produire une synthèse factuelle ;
- préparer un bordereau.

Exemple :

```text
Votre dossier peut être exporté. Avant export, vous pouvez encore valider 2 événements en brouillon et lier 1 justificatif à un frais.
```

---

# 10. Widgets intelligents

## 10.1. Principe

Les widgets doivent transformer les données en action.

L'accueil n'est pas un menu bis.  
L'accueil est un poste de pilotage.

Il doit répondre à cinq questions :

1. Ai-je une action urgente ?
2. Combien reste-t-il dû ?
3. Quelles preuves ou pièces posent problème ?
4. Quelle est ma prochaine échéance ?
5. Mon dossier est-il prêt à être exporté ?

## 10.2. Widget `WidgetActionsPrioritaires`

Priorité absolue.

Sources :

- événements en brouillon ;
- frais sans justificatif ;
- frais non remboursés ;
- pension partielle ;
- preuve à vérifier ;
- contrôle du dossier ;
- prochaines échéances.

Affichage :

```text
À faire maintenant
- Compléter 2 événements en brouillon
- Ajouter un justificatif à 1 frais
- Vérifier la pension du mois
```

## 10.3. Widget `WidgetSituationMois`

Affichage :

```text
Juin 2026
Pension due : 180 €
Payé : 120 €
Reste : 60 €
Paiements reçus : 3
Statut : paiement partiel
```

## 10.4. Widget `WidgetFraisEnAttente`

Affichage :

```text
Frais en attente
- Ostéopathie : 45 €
- Pharmacie : 12,40 €
```

## 10.5. Widget `WidgetDossierPret`

Utilise `controleDossier`.

Affichage :

```text
Dossier exportable
3 points à vérifier avant export :
- 2 événements en brouillon
- 1 frais sans justificatif
- 1 preuve sans contexte
```

## 10.6. Widget `WidgetCopiloteDossier`

Résumé IA court, jamais bavard.

Exemple :

```text
Copilote
Votre dossier contient des éléments sur la pension, les frais et plusieurs preuves. Les prochaines actions utiles sont de valider les brouillons et de lier les justificatifs manquants.
```

Bouton :

```text
Voir les actions proposées
```

---

# 11. Modules produit principaux

## 11.1. Journal de faits

Objectif :

> Noter des faits datés, neutres, exportables.

Fonctionnalités :

- date ;
- enfant concerné ;
- catégorie ;
- description factuelle ;
- statut : brouillon / validé / exporté ;
- pièce liée ;
- aide IA de reformulation ;
- intégration chronologie ;
- export PDF.

Agent IA :

- reformuler en fait neutre ;
- retirer les formulations émotionnelles ;
- proposer une catégorie ;
- signaler si la date manque ;
- proposer un titre court.

## 11.2. Pension alimentaire

Objectif :

> Suivre ce qui est dû, payé, partiel ou en retard.

Fonctionnalités :

- règle de pension ;
- montant attendu ;
- date d'échéance ;
- paiements multiples ;
- reste dû ;
- tableau mensuel ;
- export PDF/CSV ;
- indexation future.

Agent IA :

- expliquer les écarts ;
- produire une phrase factuelle ;
- préparer une relance neutre ;
- ne jamais qualifier juridiquement l'impayé.

## 11.3. Frais partagés

Objectif :

> Suivre les frais médicaux, scolaires, exceptionnels ou autres.

Fonctionnalités :

- montant ;
- catégorie ;
- part demandée ;
- statut ;
- justificatif lié ;
- date de transmission ;
- date de réponse ;
- reste dû ;
- export.

Agent IA :

- proposer une demande de remboursement ;
- signaler justificatif manquant ;
- rappeler de masquer les informations médicales inutiles ;
- synthétiser les frais en attente.

## 11.4. Documents et coffre-fort

Objectif :

> Centraliser les pièces réutilisables.

Fonctionnalités :

- documents privés ;
- catégories ;
- lien avec frais, événements, courriers, preuves ;
- bordereau automatique ;
- export ZIP avocat ;
- empreinte fichier future ;
- recherche simple.

Agent IA :

- proposer un classement ;
- détecter pièces non liées ;
- préparer bordereau ;
- suggérer les documents à joindre à un courrier.

## 11.5. Preuves photo

Objectif :

> Renforcer la traçabilité technique d'une photo sans promettre une valeur juridique garantie.

Fonctionnalités :

- fichier original conservé ;
- hash SHA-256 client ;
- hash SHA-256 serveur ;
- comparaison ;
- date appareil si disponible ;
- date serveur ;
- GPS si autorisé ;
- précision GPS ;
- EXIF ;
- contexte factuel ;
- rapport PDF ;
- QR de vérification futur ;
- horodatage interne non qualifié ;
- horodatage qualifié futur.

Agent IA :

- expliquer ce qui est présent ou absent ;
- proposer un contexte neutre ;
- signaler les métadonnées manquantes ;
- rappeler les limites ;
- ne jamais dire « recevable ».

## 11.6. Chronologie

Objectif :

> Reconstituer une suite d'événements claire.

Sources :

- journal ;
- frais ;
- pension ;
- preuves ;
- courriers ;
- LRE future ;
- email suivi futur ;
- import de preuves futur.

Agent IA :

- produire une synthèse par période ;
- regrouper par thème ;
- détecter les trous ;
- préparer une version courte pour avocat.

## 11.7. Courriers

Objectif :

> Préparer des courriers neutres à partir des faits.

Fonctionnalités :

- modèles ;
- brouillons ;
- pièces jointes ;
- PDF ;
- export ;
- email suivi futur ;
- LRE future.

Agent IA :

- reformulation neutre ;
- objet ;
- structure ;
- liste de pièces ;
- résumé factuel ;
- validation obligatoire.

## 11.8. Import jugement

Objectif :

> Extraire les informations factuelles utiles d'une décision ou d'un jugement.

Fonctionnalités :

- PDF numérique ;
- PDF scanné via OCR après action explicite ;
- extraction dispositif ;
- règles pension/frais/DVH/décision ;
- confiance IA ;
- validation utilisateur ;
- aucune conservation automatique du PDF si ce choix est maintenu.

Agent IA :

- extraire ;
- citer les passages ;
- signaler les champs à vérifier ;
- ne jamais interpréter au-delà du texte.

## 11.9. Note avocat / synthèse factuelle

Objectif :

> Préparer une synthèse lisible pour un professionnel.

Fonctionnalités :

- résumé ;
- chronologie ;
- pension ;
- frais ;
- preuves ;
- pièces ;
- points en attente ;
- export PDF.

Agent IA :

- synthèse factuelle ;
- ton neutre ;
- pas de stratégie ;
- pas de demande judiciaire ;
- pas de conclusions.

## 11.10. Export PDF / dossier audience

Objectif :

> Produire un dossier clair, daté, structuré et lisible.

Contenu possible :

- page de garde ;
- avertissement ;
- résumé ;
- chronologie ;
- pension ;
- frais ;
- preuves ;
- documents ;
- courriers ;
- bordereau de pièces ;
- annexes.

Agent IA :

- résumé de dossier ;
- sélection de points importants ;
- détection des manques ;
- aide au bordereau ;
- aucune conclusion juridique.

---

# 12. Modules avancés et premium

## 12.1. Email suivi

Objectif :

> Conserver la trace technique d'un email envoyé depuis Parent Preuve.

Ce que l'application peut prouver :

- génération du message ;
- envoi au prestataire ;
- acceptation éventuelle par le serveur destinataire ;
- ouverture probable si tracking disponible ;
- clic éventuel ;
- hash du contenu ;
- logs de statut.

À ne pas promettre :

- lecture certaine ;
- réception humaine certaine ;
- preuve absolue.

Phrase prudente :

> Les statuts de livraison et d'ouverture d'un email sont des éléments techniques indicatifs. Ils ne garantissent pas à eux seuls la lecture effective par le destinataire. Pour une preuve renforcée de réception, utilisez une Lettre Recommandée Électronique ou une Lettre Recommandée avec Avis de Réception.

Agent IA :

- préparer l'email ;
- choisir les pièces ;
- expliquer le statut ;
- ne pas dire « l'autre parent a lu ».

## 12.2. LRE

Objectif :

> Permettre l'envoi de démarches importantes via un prestataire spécialisé.

Parcours :

1. choix du type de courrier ;
2. génération du PDF ;
3. vérification utilisateur ;
4. choix des pièces ;
5. envoi via prestataire ;
6. suivi des statuts ;
7. conservation des preuves ;
8. export dossier.

À ne pas faire :

- créer une LRE maison ;
- promettre une lecture certaine ;
- envoyer sans validation ;
- masquer les limites.

Phrase prudente :

> La Lettre Recommandée Électronique permet de renforcer la preuve de l'envoi, de la mise à disposition, de l'acceptation, du refus ou de l'absence de retrait. Elle ne garantit pas à elle seule que le destinataire a effectivement pris connaissance du contenu. La valeur probatoire reste soumise à l'appréciation du juge.

Agent IA :

- préparer le courrier ;
- proposer les pièces ;
- expliquer les statuts ;
- aider à choisir entre courrier simple, email suivi ou LRE selon le niveau de formalisation, sans donner de conseil juridique personnalisé.

## 12.3. QR code de vérification des preuves

Objectif :

> Permettre à un tiers de vérifier les métadonnées minimales d'un rapport de preuve.

Route :

```text
/preuves/verifier/[token]
```

Données affichées :

- statut de vérification ;
- identifiant preuve ;
- empreinte SHA-256 ;
- date serveur ;
- date d'horodatage ;
- statut d'horodatage ;
- type MIME ;
- taille ;
- hash serveur vérifié ou non.

Ne jamais afficher publiquement :

- photo originale ;
- nom de l'enfant ;
- nom de l'autre parent ;
- adresse ;
- document judiciaire ;
- commentaire sensible.

Agent IA :

- expliquer au destinataire ce que le QR vérifie ;
- rappeler que cela ne garantit pas une décision judiciaire.

## 12.4. Horodatage qualifié eIDAS

Objectif :

> Préparer l'intégration future d'un prestataire d'horodatage qualifié.

Statuts :

```text
interne_non_qualifie
qualifie_en_attente
qualifie_valide
qualifie_echec
```

Texte prudent :

```text
Horodatage interne non qualifié :
cet horodatage renforce la traçabilité interne mais ne constitue pas un horodatage qualifié.

Horodatage qualifié :
lorsqu'il est disponible, il est délivré par un prestataire qualifié et bénéficie d'une présomption d'exactitude de la date et d'intégrité des données liées.
```

## 12.5. Ligne dédiée

Objectif :

> Centraliser certains échanges via un numéro dédié.

À repousser tant que l'analyse juridique, RGPD et technique n'est pas solide.

Approche prudente :

- commencer par SMS et journal d'appels sans audio ;
- information claire ;
- consentement et paramétrage ;
- prestataire télécom sérieux ;
- analyse des risques ;
- prototype isolé ;
- pas d'enregistrement vocal automatique dans le MVP ;
- pas de promesse agressive.

Agent IA :

- éventuellement classer des messages ;
- reformuler les contenus toxiques pour lecture apaisée ;
- produire des synthèses factuelles ;
- ne pas encourager l'escalade.

---

# 13. Roadmap par phases

## Phase 0 — Stabilisation technique et sécurité

Objectif :

> S'assurer que la base est saine avant d'ajouter de l'intelligence.

Tâches :

1. vérifier les variables d'environnement ;
2. unifier `HORODATAGE_SECRET` ;
3. vérifier les migrations Supabase ;
4. vérifier RLS et Storage ;
5. vérifier `quotaIa.ts` ;
6. refuser l'appel IA si l'insertion quota échoue ;
7. vérifier suppression de compte ;
8. vérifier suppression fichiers Storage ;
9. vérifier absence de données sensibles dans les logs ;
10. finaliser pages légales ;
11. réactiver confirmation email/SMTP avant ouverture large.

Critères de succès :

- routes IA authentifiées ;
- quota IA durable ;
- RLS partout ;
- buckets privés ;
- suppression compte testée ;
- documents légaux prêts.

## Phase 1 — Cockpit d'accueil sans IA générative

Objectif :

> Réduire immédiatement l'effet fourre-tout.

Tâches :

1. créer `WidgetActionsPrioritaires` ;
2. améliorer `TableauDeBord` ;
3. créer `WidgetSituationMois` ;
4. créer `WidgetDossierPret` ;
5. transformer `ProchainesEcheances` en widget compact ;
6. limiter l'accueil à quelques informations actionnables ;
7. garder 3 à 4 actions maximum.

Critères de succès :

- l'utilisateur sait quoi faire en moins de 10 secondes ;
- l'accueil ne ressemble pas à un menu ;
- le reste dû est visible ;
- le dossier incomplet est expliqué clairement.

## Phase 2 — Super Agent lecture seule

Objectif :

> Ajouter le Copilote sans risque d'action automatique.

Tâches :

1. créer `lib/agent/agentPrompt.ts` ;
2. créer `lib/agent/agentSchemas.ts` ;
3. créer `lib/agent/agentContext.ts` ;
4. créer `lib/agent/agentGuardrails.ts` ;
5. créer `app/api/ia/agent/route.ts` ;
6. brancher auth serveur ;
7. brancher quota IA ;
8. brancher consentement `agent-dossier` ;
9. intégrer `resumeDossier`, `controleDossier`, `dossierCalculs` ;
10. retourner du JSON structuré ;
11. valider le JSON côté serveur ;
12. afficher dans `WidgetCopiloteDossier`.

Critères de succès :

- l'agent résume l'état du dossier ;
- l'agent propose des actions de navigation ;
- aucune écriture en base ;
- aucune promesse juridique ;
- destinations limitées à une liste fermée.

## Phase 3 — Aide contextuelle par écran

Objectif :

> Faire vivre l'IA au bon endroit, au bon moment.

Tâches :

1. ajouter aide IA dans `/journal` ;
2. ajouter aide IA dans `/frais` ;
3. ajouter aide IA dans `/pension` ;
4. ajouter aide IA dans `/preuves` ;
5. ajouter aide IA dans `/courriers` ;
6. ajouter aide IA dans `/export` ;
7. utiliser des composants courts ;
8. éviter une grande conversation libre.

Critères de succès :

- l'utilisateur reçoit de l'aide sans quitter son écran ;
- les suggestions sont courtes ;
- l'utilisateur valide toujours ;
- pas de chatbot fourre-tout.

## Phase 4 — Brouillons validables

Objectif :

> L'agent prépare, l'utilisateur décide.

Tâches :

1. brouillon d'événement ;
2. brouillon de courrier ;
3. brouillon de note avocat ;
4. brouillon de chronologie ;
5. pré-classement de document ;
6. pré-remplissage contrôlé ;
7. validation obligatoire ;
8. indication claire « proposition IA ».

Critères de succès :

- aucune écriture définitive ;
- brouillons modifiables ;
- sortie factuelle ;
- traçabilité de l'origine IA.

## Phase 5 — Production assistée

Objectif :

> Aider à produire des documents propres.

Tâches :

1. résumé de dossier ;
2. chronologie filtrée ;
3. bordereau de pièces ;
4. note avocat ;
5. dossier audience ;
6. export PDF thématique ;
7. export ZIP avocat ;
8. avertissement données sensibles.

Critères de succès :

- un professionnel peut lire le dossier facilement ;
- les pièces sont numérotées ;
- la chronologie est claire ;
- les limites juridiques sont présentes.

## Phase 6 — Modules de preuve renforcée

Objectif :

> Renforcer la crédibilité technique.

Tâches :

1. recalcul serveur du hash ;
2. QR code de vérification ;
3. page publique minimale de vérification ;
4. journal d'audit ;
5. horodatage qualifié préparé ;
6. export avec empreintes ;
7. avertissement sur valeur probatoire.

Critères de succès :

- rapport plus vérifiable ;
- aucune donnée sensible exposée publiquement ;
- promesse prudente.

## Phase 7 — Communication officielle

Objectif :

> Préparer email suivi et LRE.

Tâches :

1. structurer `courrier_envois` ;
2. statuts d'envoi ;
3. logs prestataire ;
4. pièces jointes ;
5. hash du contenu ;
6. email suivi ;
7. LRE via prestataire ;
8. webhooks ;
9. coffre de preuve ;
10. phrases de prudence.

Critères de succès :

- un courrier peut être généré, conservé, envoyé et suivi ;
- l'utilisateur comprend les limites de chaque canal ;
- pas de promesse de lecture certaine.

## Phase 8 — Ligne dédiée seulement après validation

Objectif :

> Étudier une option premium puissante sans mettre en danger le produit.

Tâches :

1. étude juridique ;
2. étude RGPD ;
3. choix prestataire télécom ;
4. prototype isolé ;
5. SMS entrants ;
6. journal d'appels sans audio ;
7. transcription seulement après cadrage ;
8. information claire ;
9. export dédié ;
10. désactivation simple.

Critères de succès :

- le produit principal reste prudent ;
- aucun enregistrement vocal risqué n'est lancé sans cadre ;
- l'utilisateur comprend exactement ce qui est conservé.

---

# 14. Roadmap synthétique priorisée

## Priorité absolue

1. Stabiliser sécurité, RLS, quotas, suppression, pages légales.
2. Créer un accueil cockpit avec widgets actionnables.
3. Créer `WidgetActionsPrioritaires`.
4. Simplifier la navigation autour de Comprendre / Ajouter / Produire.
5. Ajouter le Copilote en lecture seule.
6. Garder toutes les réponses IA en JSON validé.
7. Réutiliser `controleDossier`, `resumeDossier`, `dossierCalculs`.
8. Conserver validation humaine obligatoire.

## Priorité forte

9. Aide contextuelle IA dans Journal, Frais, Pension, Preuves, Courriers.
10. Brouillons validables.
11. Export dossier par thème.
12. Note avocat factuelle.
13. Dossier audience.
14. QR code de vérification.
15. Recalcul serveur du hash.
16. Export ZIP avocat.
17. Journal d'audit.
18. États vides guidants.

## Priorité premium

19. Email suivi.
20. LRE.
21. Horodatage qualifié.
22. Import de preuves anciennes.
23. Indexation automatique pension.
24. Calendrier enrichi vacances/jours fériés.
25. Registre des demandes de modification.
26. Ligne dédiée après étude.

## À repousser

27. Messagerie entre parents.
28. Enregistrement d'appels sans cadre clair.
29. Assistant juridique.
30. Conclusions automatiques.
31. Conseils procéduraux personnalisés.
32. Prédiction de décision judiciaire.
33. Scoring de chances de succès.
34. Fonctionnalité qui expose publiquement des données sensibles.

---

# 15. Fichiers à créer ou modifier

## 15.1. Nouveaux fichiers agent

```text
lib/agent/agentPrompt.ts
lib/agent/agentSchemas.ts
lib/agent/agentContext.ts
lib/agent/agentTools.ts
lib/agent/agentGuardrails.ts
lib/agent/agentActions.ts
lib/agent/agentValidation.ts
app/api/ia/agent/route.ts
components/AgentDossier.tsx
components/AgentActionCard.tsx
components/WidgetCopiloteDossier.tsx
components/AideContextuelleIA.tsx
app/assistant/page.tsx
```

## 15.2. Fichiers à réutiliser

```text
lib/authServeur.ts
lib/quotaIa.ts
lib/dossierCalculs.ts
lib/controleDossier.ts
lib/etatDossier.ts
lib/resumeDossier.ts
lib/destinationsAssistant.ts
lib/modelesIA.ts
components/ConsentementIA.tsx
components/StatutConsentementIA.tsx
components/TableauDeBord.tsx
components/BoutonCaptureRapide.tsx
app/page.tsx
app/journal/page.tsx
app/frais/page.tsx
app/pension/page.tsx
app/preuves/page.tsx
app/courriers/page.tsx
app/export/page.tsx
```

## 15.3. Migrations possibles

```text
supabase/migrations/00X_agent_sessions.sql
supabase/migrations/00X_agent_messages.sql
supabase/migrations/00X_preuves_verification_qr.sql
supabase/migrations/00X_hash_serveur.sql
supabase/migrations/00X_audit_log.sql
supabase/migrations/00X_email_envois.sql
supabase/migrations/00X_lre_envois.sql
```

---

# 16. Critères de réussite UX

## 16.1. Qualitatifs

Pendant les tests utilisateurs, vérifier :

- l'utilisateur comprend-il le but de l'application ?
- sait-il quoi faire en premier ?
- trouve-t-il le bouton ajouter ?
- comprend-il la différence entre fait, document, preuve, frais et pension ?
- comprend-il que l'application est factuelle et non juridique ?
- arrive-t-il à exporter un dossier sans aide ?
- trouve-t-il l'accueil rassurant ou anxiogène ?
- comprend-il que le Copilote propose mais ne décide pas ?
- comprend-il qu'il doit valider les brouillons IA ?
- comprend-il les limites des preuves photo, email suivi et LRE ?

## 16.2. Quantitatifs

Objectifs :

```text
Temps pour ajouter un fait : moins de 60 secondes
Temps pour ajouter une dépense : moins de 90 secondes
Temps pour comprendre le reste dû : moins de 10 secondes
Temps pour trouver l'export : moins de 15 secondes
Nombre de menus principaux visibles : 5 maximum
Nombre d'actions prioritaires sur l'accueil : 4 maximum
Temps pour comprendre la réponse du Copilote : moins de 20 secondes
Nombre de clics pour valider un brouillon IA : 2 maximum après relecture
```

## 16.3. Test simple

Donner l'application à une personne qui ne connaît pas le projet et lui demander :

1. Ajoute un frais médical de 45 €.
2. Note un retard de remise de l'enfant.
3. Ajoute un paiement partiel de pension.
4. Trouve combien il reste dû.
5. Demande au Copilote ce qu'il faut compléter.
6. Valide un brouillon IA.
7. Exporte un dossier PDF.

Si la personne bloque, ce n'est pas un problème utilisateur : c'est un problème UX.

---

# 17. Règles anti-fourre-tout

## Règle 1 — Tout module doit répondre à une question utilisateur

- Pension : combien est dû ?
- Frais : qu'est-ce qui n'a pas été remboursé ?
- Preuves : qu'est-ce qui est conservé ?
- Chronologie : que s'est-il passé ?
- Export : que puis-je produire ?
- Courriers : que dois-je formaliser ?
- Email suivi : quel envoi technique est conservé ?
- LRE : comment envoyer officiellement via un prestataire ?
- Ligne dédiée : comment centraliser les échanges, plus tard ?
- Copilote : quelle est la prochaine action utile ?

## Règle 2 — Les options avancées apparaissent au bon moment

Ne pas afficher partout :

- LRE ;
- ligne dédiée ;
- export ZIP ;
- horodatage qualifié ;
- QR avancé ;
- assistant complet.

Les options avancées doivent apparaître quand l'utilisateur est dans le bon contexte.

## Règle 3 — L'accueil guide, il ne liste pas

L'accueil doit montrer :

- l'état ;
- les priorités ;
- les échéances ;
- le reste dû ;
- les points à compléter.

Pas la totalité des modules.

## Règle 4 — Une action principale par écran

Chaque écran doit avoir une action principale visible.

Exemples :

- Journal : ajouter un fait ;
- Frais : ajouter un frais ;
- Pension : ajouter un paiement ;
- Preuves : ajouter une preuve ;
- Export : générer un dossier ;
- Copilote : voir les actions proposées.

## Règle 5 — L'IA reste contextuelle

L'IA ne doit pas devenir une grande boîte magique.

Elle doit aider :

- là où l'utilisateur écrit ;
- là où il vérifie ;
- là où il exporte ;
- là où il se demande quoi faire ensuite.

## Règle 6 — Le vocabulaire reste factuel

À préférer :

- élément ;
- fait ;
- statut ;
- reste dû ;
- sans réponse ;
- pièce ;
- chronologie ;
- écart constaté ;
- dossier ;
- brouillon ;
- suggestion ;
- à vérifier.

À éviter :

- faute ;
- condamnation ;
- culpabilité ;
- victoire ;
- preuve irréfutable ;
- recevabilité garantie ;
- saisir le juge ;
- stratégie judiciaire.

---

# 18. Prompt complet à transmettre à Claude/Cursor

```text
Tu es développeur senior, product designer et expert UX. Je travaille sur Parent Preuve, une application française solo pour parents séparés.

Objectif produit :
Aider un parent séparé à transformer les faits, frais, pensions, preuves photo, documents, courriers et échéances en dossier clair, daté, structuré et exportable.

Contraintes absolues :
- outil solo ;
- factuel ;
- jamais de conseil juridique ;
- jamais d'assistant juridique ;
- l'IA propose, l'utilisateur valide ;
- pas de promesse de preuve irréfutable ;
- pas de recevabilité garantie ;
- pas de prédiction judiciaire ;
- pas de conclusions automatiques ;
- RGPD et données sensibles à respecter.

Architecture connue :
- Next.js App Router ;
- TypeScript ;
- Supabase Auth/PostgreSQL/Storage ;
- RLS partout ;
- Mistral côté serveur ;
- routes IA authentifiées ;
- quota IA durable via ia_appels ;
- consentement IA via consentements_ia ;
- dossiers app/, components/, lib/ à la racine, pas de dossier src/.

Problème actuel :
L'application devient riche mais risque de ressembler à un fourre-tout. Je veux restructurer l'UX autour de trois gestes :
1. Comprendre ;
2. Ajouter ;
3. Produire.

Nouvelle mission :
Intégrer un Super Agent IA appelé plutôt "Copilote Parent Preuve", mais sans le transformer en chatbot juridique.
Le Copilote doit :
- résumer l'état du dossier ;
- repérer les éléments incomplets ;
- proposer les prochaines actions utiles ;
- orienter vers les pages autorisées ;
- aider à reformuler factuellement ;
- préparer des brouillons validables ;
- ne jamais écrire définitivement sans validation ;
- ne jamais donner de conseil juridique.

Priorité de développement :
1. Stabiliser sécurité, RLS, quotas et consentements.
2. Créer un accueil cockpit avec widgets actionnables.
3. Ajouter WidgetActionsPrioritaires.
4. Améliorer TableauDeBord.
5. Transformer ProchainesEcheances en widget compact.
6. Réutiliser ControleDossier pour un widget Dossier prêt.
7. Créer lib/agent avec prompt, schémas, contexte, guardrails.
8. Créer app/api/ia/agent/route.ts.
9. Retourner uniquement du JSON structuré et validé.
10. Ajouter WidgetCopiloteDossier sur l'accueil.
11. Ajouter progressivement l'aide contextuelle dans Journal, Frais, Pension, Preuves, Courriers, Export.
12. Ajouter les brouillons validables.
13. Préparer l'export dossier par thème.
14. Ajouter ensuite QR de vérification, hash serveur, journal d'audit, email suivi, LRE.
15. Repousser la ligne dédiée tant que l'étude juridique/RGPD n'est pas faite.

Avant de coder :
- liste les fichiers à modifier ;
- liste les composants à créer ;
- propose l'ordre exact des tâches ;
- indique les risques ;
- indique les critères de validation ;
- ne réécris pas massivement les fichiers sans nécessité ;
- réutilise les composants, couleurs et patterns existants ;
- teste étape par étape.
```

---

# 19. Conclusion

La richesse de Parent Preuve est un avantage uniquement si elle est masquée derrière une expérience simple.

Le bon objectif UX n'est pas :

> Donner accès à toutes les fonctionnalités.

Le bon objectif UX est :

> **Montrer à l'utilisateur la prochaine action utile dans son dossier.**

Le Super Agent IA doit renforcer cette logique. Il ne doit pas devenir une attraction séparée, ni un assistant juridique. Il doit être le moteur discret qui transforme les données du dossier en compréhension, en actions, en brouillons et en documents factuels.

La trajectoire recommandée est donc :

1. sécuriser ;
2. simplifier l'accueil ;
3. structurer les widgets ;
4. intégrer le Copilote en lecture seule ;
5. ajouter l'aide contextuelle ;
6. ajouter les brouillons validables ;
7. renforcer les preuves ;
8. produire des exports professionnels ;
9. seulement ensuite ajouter email suivi, LRE et ligne dédiée.

Parent Preuve doit devenir un outil calme, guidant et structuré : un tableau de bord de dossier parental, enrichi par un copilote factuel, pas une accumulation de modules ni un avocat IA.
