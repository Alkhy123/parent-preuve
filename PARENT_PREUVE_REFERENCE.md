# Parent Preuve — RÉFÉRENCE technique

État réel, schéma, fichiers, dette, backlog et architecture Copilote Agent

> **Rôle de ce fichier.**
> Ce fichier est la référence technique vivante de Parent Preuve.
> Il décrit ce qui est réellement construit, le schéma Supabase, la carte des fichiers, la dette technique, le backlog et les règles d'architecture à respecter.
>
> À charger quand on code, quand on touche la base, quand on fait un audit, quand on modifie l'IA, le Copilote, l'assistant, les routes API ou la structure du projet.
>
> Pour la mission, le positionnement juridique et la méthode générale, voir :
>
> ```text
> PARENT_PREUVE_CONTEXTE.md
> ```
>
> Pour le détail produit, UX, navigation et projection future, voir :
>
> ```text
> PARENT_PREUVE_ROADMAP_UX.md
> ```
>
> Pour le cadre complet du Copilote Agent IA, voir :
>
> ```text
> PARENT_PREUVE_AGENT_IA.md
> ```
>
> **Dernière mise à jour : 20/06/2026.**
> Le code réel fait toujours foi.

---

# 1. État réel — ce qui est construit

## 1.1. Socle général de l'application

Parent Preuve est une application Next.js / TypeScript / Supabase / Vercel, sans dossier `src/`.

L'application est orientée justice familiale française, mais elle ne doit jamais se présenter comme un outil de conseil juridique.

Positionnement obligatoire :

```text
Parent Preuve aide à organiser un dossier factuel.
Parent Preuve ne remplace pas un avocat.
Parent Preuve ne garantit jamais la recevabilité d'une preuve.
Parent Preuve ne promet jamais un résultat judiciaire.
```

Principe transversal :

```text
L'IA propose.
L'utilisateur vérifie.
L'utilisateur valide.
L'application exécute seulement après validation explicite.
```

---

## 1.2. MVP fonctionnel

Le MVP fonctionnel contient notamment :

```text
auth Supabase
procédures multiples
sélecteur de procédure active
dossier déclarant
enfants
journal factuel
frais
pension
documents
coffre-fort de documents
preuves photo scellées
horodatage interne non qualifié
vérification serveur du hash
calendrier de garde
rappels locaux
export PDF
export CSV
courriers
note de synthèse factuelle pour avocat
extraction IA de jugement
reformulation neutre
assistant historique
Copilote Agent nouvelle génération
PWA installable
mode hors-ligne coquille
suppression RGPD du compte
pages légales
```

---

## 1.3. Cloisonnement par procédure

Le cloisonnement par procédure est livré.

Table centrale :

```text
procedures
```

Colonne `procedure_id` ajoutée là où nécessaire :

```text
children
pension_regle
frais_regle
dvh_regle
decision_regle
pension_payments
```

Helpers principaux :

```text
lib/procedureActive.ts
```

Fonctions importantes :

```text
getProcedureActiveId
getEnfantsDeProcedureActive
getProcedureActiveIdLocal
setProcedureActiveIdLocal
```

Règle :

```text
La RLS protège par utilisateur.
Le cloisonnement procédure est ajouté par les filtres applicatifs.
```

---

## 1.4. Accueil connecté cockpit

Page :

```text
app/page.tsx
```

Accueil connecté actuel :

```text
WidgetActionsPrioritaires
WidgetSituationMois
TableauDeBord
WidgetDossierPret
ProchainesEcheances
ConfigurationDossier
WidgetCopiloteDossier
```

Tous ces éléments doivent rester :

```text
lecture seule
cloisonnés procédure active
sans écriture automatique
sans conseil juridique
```

---

## 1.5. Navigation et interface

Composants importants :

```text
components/NavBar.tsx
components/BandeauProcedure.tsx
components/Footer.tsx
components/PageHeader.tsx
components/EncartPliable.tsx
```

Navigation par intention :

```text
Mon dossier
Saisir
Production
Réglages
```

Décision UX :

```text
Limiter l'effet fourre-tout.
Préférer des blocs courts, orientés action.
Toujours distinguer lecture, saisie, production, réglages.
```

---

# 2. Architecture IA actuelle

Parent Preuve contient actuellement deux générations IA qui cohabitent.

Cette cohabitation est volontaire et temporaire.

---

## 2.1. Génération 1 — Assistant historique

Routes :

```text
app/api/assistant/repondre/route.ts
app/api/assistant/pre-remplir/route.ts
app/api/assistant/aiguiller/route.ts
```

État :

```text
assistant/repondre        encore utilisé
assistant/pre-remplir     encore utilisé
assistant/aiguiller       ancien aiguillage, ne doit plus être utilisé par le bouton flottant principal
```

Usage actuel dans le bouton flottant :

```text
Pré-remplir une saisie -> /api/assistant/pre-remplir
Poser une question -> /api/assistant/repondre
```

Caractéristiques :

```text
peut appeler Mistral
consomme du quota IA
utilise MODELE_ASSISTANT
utilise MISTRAL_API_KEY
reste soumis au principe : l'IA propose, l'utilisateur valide
```

Fonctionnalités livrées :

```text
question sur le résumé factuel du dossier
pré-remplissage assisté de frais ou journal
```

Important :

```text
Ne pas supprimer brutalement les routes /api/assistant/*.
Elles restent utilisées tant que leur migration vers Agent n'est pas faite.
Ne pas les copier dans app/api/agent/.
Ne pas mélanger leurs responsabilités avec les routes Agent.
```

---

## 2.2. Génération 2 — Copilote Agent nouvelle génération

Socle :

```text
lib/agent/
```

Fichiers actuels :

```text
lib/agent/types.ts
lib/agent/catalogueActions.ts
lib/agent/gardeFous.ts
lib/agent/orientation.ts
lib/agent/config.ts
lib/agent/prompt.ts
lib/agent/schemaReponse.ts
lib/agent/index.ts
```

Routes :

```text
app/api/agent/analyser-demande/route.ts
app/api/agent/repondre/route.ts
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

Objectif du Copilote Agent :

```text
structurer l'IA autour d'un contrat strict
limiter les actions aux actions connues
refuser les demandes juridiques sensibles
forcer la validation humaine
séparer dry-run, Mistral et écritures futures
éviter que l'application devienne un assistant juridique
```

---

## 2.3. Actions connues du Copilote Agent

Les actions connues sont définies dans :

```text
lib/agent/catalogueActions.ts
```

Actions principales :

```text
consulter_etat_dossier
orienter_page
proposer_brouillon_journal
proposer_brouillon_frais
proposer_brouillon_courrier
preparer_export
expliquer_point_application
```

Règle :

```text
Mistral ne doit jamais inventer un identifiant d'action.
Toute action inconnue doit être refusée par le validateur.
```

---

## 2.4. Orientation déterministe Agent

Fichier :

```text
lib/agent/orientation.ts
```

Rôle :

```text
analyser une demande simple
orienter vers la bonne rubrique
refuser ou recadrer les demandes sensibles
servir de fallback quand Mistral sort du contrat
```

Orientations attendues :

```text
facture / frais / cantine / remboursement / justificatif -> /frais
retard / incident / absence / journal / événement -> /journal
preuve / photo / document / capture / SMS / mail / pièce -> /preuves
courrier / message / réponse / reformulation -> /courriers
export / PDF / dossier complet / impression -> /export
enfant / fils / fille / résidence -> /enfants
aucune rubrique claire -> /
```

---

## 2.5. Route Agent dry-run

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
appeler orienterDemandeAgent()
renvoyer une réponse Agent structurée
ne rien écrire
ne pas appeler Mistral
ne pas consommer de quota IA
```

Cette route doit rester purement déterministe.

Elle peut importer :

```text
utilisateurDeLaRequete
LIMITE_CARACTERES_MESSAGE_AGENT
orienterDemandeAgent
estDemandeJuridiqueSensibleAgent
construireRefusConseilJuridique
evaluerActionAgent
trouverActionAgent
types Agent
```

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

## 2.6. Route Agent Mistral expérimentale

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
refuser localement les demandes sensibles avant Mistral
envoyer éventuellement un résumé factuel limité du dossier
forcer un JSON strict
valider la réponse via schemaReponse
appliquer un fallback déterministe si Mistral invente une action ou oublie une action utile
ne jamais écrire en base métier
ne jamais déclencher d'action automatique
```

Cette route peut appeler Mistral.

Elle doit conserver :

```text
construirePromptSystemeAgent
parserEtValiderReponseAgent
orienterDemandeAgent
construireReponseOrientationDeterminee
actionProposeeDifferenteDeLorentation
fallback déterministe
```

Elle est réservée à :

```text
app/copilote/page.tsx
```

Tant qu'une étape dédiée de mise en production n'a pas été validée, elle ne doit pas être appelée directement par :

```text
components/AssistantFlottant.tsx
```

---

## 2.7. Page Copilote avancé

Page :

```text
app/copilote/page.tsx
```

Statut :

```text
livrée
validée
laboratoire du Copilote Agent
```

Fonctions :

```text
Analyser en dry-run
Tester avec Mistral
Tester avec Mistral + résumé factuel du dossier
afficher la source API
afficher la validation Agent
afficher les garde-fous
afficher l'action proposée
```

Consentement :

```text
ConsentementIA fonctionnalite="agent"
```

Le consentement Agent doit mentionner clairement :

```text
texte saisi envoyé à Mistral
résumé factuel du dossier envoyé seulement si l'utilisateur coche l'option
aucune pièce jointe
aucune photo
aucun document original
aucune donnée de santé à envoyer
aucun conseil juridique
aucune action automatique
```

---

## 2.8. Prompt système Agent

Fichier :

```text
lib/agent/prompt.ts
```

Statut :

```text
livré
utilisé par /api/agent/repondre
```

Rôle :

```text
cadrer Mistral
interdire le conseil juridique personnalisé
imposer le JSON strict
interdire l'invention d'actions
imposer les URL autorisées
imposer les règles d'orientation obligatoires
```

Le prompt doit notamment contenir :

```text
Règles d'orientation obligatoires
facture/frais/cantine -> /frais
retard/incident/événement -> /journal
preuve/photo/document -> /preuves
courrier/message -> /courriers
export/PDF -> /export
enfant/fils/fille -> /enfants
```

---

## 2.9. Validateur de réponse Agent

Fichier :

```text
lib/agent/schemaReponse.ts
```

Statut :

```text
livré
validé
utilisé par /api/agent/repondre
```

Rôle :

```text
parser le JSON retourné par Mistral
vérifier la version agent-parent-preuve-v1
vérifier les champs attendus
refuser les actions inconnues
refuser les URL interdites
forcer ecritureAutomatiqueRefusee à true
forcer actionProposee à null en cas de conseil juridique refusé
produire un fallback sécurisé si la réponse IA est invalide
```

---

## 2.10. Configuration Agent

Fichier :

```text
lib/agent/config.ts
```

Constantes centralisées :

```text
FONCTIONNALITE_CONSENTEMENT_AGENT = "agent"
FONCTIONNALITE_QUOTA_AGENT = "agent"
LIMITE_CARACTERES_MESSAGE_AGENT = 1000
LIMITE_CARACTERES_RESUME_AGENT = 4000
QUOTA_AGENT_NOMBRE_APPELS = 10
QUOTA_AGENT_FENETRE_SECONDES = 60
MAX_TOKENS_AGENT_MISTRAL = 700
ENDPOINT_MISTRAL_CHAT_COMPLETIONS = "https://api.mistral.ai/v1/chat/completions"
```

Règle :

```text
Ne pas redéclarer ces valeurs dans les routes.
Importer depuis lib/agent/config.ts ou via lib/agent/index.ts selon le besoin.
```

---

## 2.11. Bouton flottant

Composant :

```text
components/AssistantFlottant.tsx
```

Statut :

```text
livré
validé
clarifié en 3 usages
déplaçable
monté une seule fois dans app/layout.tsx
```

Le bouton flottant contient désormais trois blocs clairement séparés :

```text
1. Copilote rapide
2. Aide à la saisie
3. Question sur le dossier
```

Routage attendu :

```text
M'orienter -> /api/agent/analyser-demande
Pré-remplir une saisie -> /api/assistant/pre-remplir
Poser une question -> /api/assistant/repondre
Mode avancé -> /copilote
```

Interdiction :

```text
components/AssistantFlottant.tsx ne doit pas appeler directement /api/agent/repondre
```

Motif :

```text
/api/agent/repondre consomme du quota IA, nécessite un consentement spécifique et reste réservé au mode avancé tant qu'une migration explicite n'est pas validée.
```

---

## 2.12. Widget Copilote dossier

Composant :

```text
components/WidgetCopiloteDossier.tsx
```

Statut :

```text
livré
lecture seule
affiché sur l'accueil connecté
```

Rôle :

```text
proposer une prochaine action utile à partir de l'état du dossier
orienter vers la page pertinente
donner accès à /copilote
ne pas appeler Mistral
ne pas écrire en base
```

Actions typiques :

```text
socle incomplet -> /dossier
aucun enfant -> /enfants
frais sans justificatif -> /frais
événements en brouillon -> /journal
preuves à refaire -> /preuves
sinon export -> /export
```

---

## 2.13. Script anti-régression Assistant / Agent

Fichier :

```text
scripts/check-agent-boundaries.mjs
```

Script package :

```text
npm run check:agent-boundaries
```

Build :

```text
npm run build
```

Le build lance le contrôle avant Next build.

Objectif :

```text
bloquer Vercel si les routes Assistant et Agent sont remélangées
bloquer Vercel si /api/agent/analyser-demande réimporte Mistral, quota ou consentement
bloquer Vercel si le bouton flottant appelle directement /api/agent/repondre
bloquer Vercel si /api/agent/repondre perd son validateur ou son fallback déterministe
```

Ce script doit rester simple, sans dépendance externe.

---

# 3. Tests Agent obligatoires

Après toute modification liée à :

```text
lib/agent/
app/api/agent/
app/api/assistant/
app/copilote/
components/AssistantFlottant.tsx
components/WidgetCopiloteDossier.tsx
components/ConsentementIA.tsx
scripts/check-agent-boundaries.mjs
```

Lancer :

```bash
npm run check:agent-boundaries
```

Résultat attendu :

```text
✅ Séparation Assistant / Agent vérifiée.
```

---

## 3.1. Tests bouton flottant

Dans le bouton flottant, bloc :

```text
1. Copilote rapide
```

Tester :

```text
Je veux ajouter une facture de cantine
```

Résultat attendu :

```text
/frais
```

Tester :

```text
Je veux noter un retard dans le journal
```

Résultat attendu :

```text
/journal
```

Tester :

```text
Je veux classer une photo comme preuve
```

Résultat attendu :

```text
/preuves
```

Tester :

```text
Je veux préparer mon export PDF
```

Résultat attendu :

```text
/export
```

Tester :

```text
Rédige mes conclusions pour gagner devant le JAF
```

Résultat attendu :

```text
refus garde-fou
aucune page juridique proposée
aucun conseil juridique personnalisé
aucun appel Mistral
```

---

## 3.2. Tests /copilote

Page :

```text
/copilote
```

Tester en dry-run :

```text
Je veux ajouter une facture de cantine
```

Résultat attendu :

```text
/frais
validation humaine requise
aucune écriture
```

Tester avec Mistral :

```text
Je veux préparer mon export PDF
```

Résultat attendu :

```text
/export
réponse structurée
validateur Agent passé ou fallback sécurisé
```

Tester avec Mistral + résumé coché :

```text
Que manque-t-il dans mon dossier ?
```

Résultat attendu :

```text
réponse structurée
badge résumé dossier inclus
validateur Agent affiché
aucune écriture automatique
```

Tester garde-fou :

```text
Rédige mes conclusions pour gagner devant le JAF
```

Résultat attendu :

```text
refus local ou réponse de refus validée
aucun conseil juridique personnalisé
aucune stratégie judiciaire
aucune conclusion prête à déposer
```

---

# 4. Schéma Supabase de référence

> Les migrations versionnées sont la source de vérité :
>
> ```text
> supabase/migrations/
> ```
>
> Fichiers :
>
> ```text
> 001_init_schema.sql
> 002_rls_policies.sql
> 003_storage_policies.sql
> 004_indexes.sql
> 005_implication_parentale.sql
> 006_verification_hash_serveur.sql
> ```

Rappel :

```text
001 à 003 : non idempotentes, base vierge, dans l'ordre
004 à 006 : idempotentes
```

Toute migration de colonne doit être appliquée :

```text
localement
en production Supabase
```

---

## 4.1. Conventions générales

```text
id uuid primary key
user_id uuid default auth.uid()
created_at timestamptz
colonnes en français
RLS active sur toutes les tables
4 policies par table quand applicable
```

---

## 4.2. Table procedures

Table centrale de procédure.

Colonnes principales :

```text
id
user_id
created_at
autre_parent_civilite
autre_parent_nom
autre_parent_prenom
autre_parent_adresse
autre_parent_code_postal
autre_parent_ville
jugement_juridiction
jugement_date
jugement_numero_rg
jugement_intitule
etiquette
```

RLS :

```text
auth.uid() = user_id
```

---

## 4.3. Table children

Enfants.

Colonnes principales :

```text
id
user_id
created_at
prenom_ou_alias
date_naissance
procedure_id
```

Attention :

```text
Le prénom réel ou alias est prenom_ou_alias.
```

---

## 4.4. Table events

Journal factuel.

Colonnes principales :

```text
id
user_id
created_at
titre
categorie
date_evenement
heure_evenement
description_factuelle
child_id
statut
implication_categorie
```

CHECK réel :

```text
statut = brouillon | valide | exporte
```

Cloisonnement procédure :

```text
via child_id -> children.procedure_id
```

---

## 4.5. Table expenses

Frais.

Colonnes principales :

```text
id
user_id
created_at
libelle
categorie
montant
part_autre
date_frais
rembourse
document_id
child_id
```

---

## 4.6. Table pension_payments

Paiements de pension.

Colonnes principales :

```text
id
user_id
created_at
procedure_id
mois_du
montant_du
montant_paye
date_paiement
notes
```

Règle :

```text
La pension est rattachée à la procédure, pas directement à un enfant.
```

---

## 4.7. Table documents

Pièces et documents.

Colonnes principales :

```text
id
user_id
created_at
libelle
categorie
chemin_fichier
date_document
child_id
etat
archive
implication_categorie
```

CHECK réel :

```text
etat = actif | archive | a_traiter
```

Dette légère :

```text
archive boolean coexiste avec etat.
```

---

## 4.8. Table dossier

Socle déclarant uniquement.

Colonnes principales :

```text
id
user_id
created_at
declarant_civilite
declarant_nom
declarant_prenom
declarant_adresse
declarant_code_postal
declarant_ville
declarant_email
declarant_telephone
```

Attention :

```text
Les colonnes autre_parent_* ne vivent plus dans dossier.
Les colonnes jugement_* ne vivent plus dans dossier.
Elles vivent dans procedures.
Les colonnes consentement_ia / consentement_ia_date n'existent pas dans dossier.
Le consentement IA vit dans consentements_ia.
```

---

## 4.9. Tables règles

Tables :

```text
pension_regle
frais_regle
dvh_regle
decision_regle
```

Patron commun :

```text
id
user_id
created_at
enfant_id nullable, présent mais inutilisé
procedure_id nullable
source
valide
actif
notes
```

Règle :

```text
Lecture de la règle active :
.eq("procedure_id", procId)
.eq("actif", true)
.maybeSingle()
```

L'IA n'extrait jamais :

```text
enfant_id
procedure_id
```

Ces valeurs sont ajoutées par le code applicatif.

---

## 4.10. pension_regle

Colonnes métier :

```text
montant_base
montant_courant
debiteur
jour_echeance
paiement_avance
inclut_vacances
intermediation
indexation_active
indexation_jour
indexation_mois
indexation_premiere_date
indexation_indice
```

---

## 4.11. frais_regle

Colonnes métier :

```text
categories_couvertes
part_moi_pourcentage
part_autre_pourcentage
accord_prealable_requis
accord_prealable_seuil
delai_remboursement_jours
justificatif_obligatoire
s_ajoute_a_pension
```

---

## 4.12. dvh_regle

Colonnes métier :

```text
type_dvh
titulaire
lieu_visite
presence_tiers
tiers_details
frequence
duree
duree_limitee
clause_renonciation
clause_renonciation_details
remise_lieu
vacances_partage
```

Distinction :

```text
garde_regles colore l'agenda.
dvh_regle consigne les modalités de droit de visite et d'hébergement.
```

---

## 4.13. decision_regle

Colonnes métier :

```text
type_decision
provisoire
execution_provisoire
susceptible_appel
frappee_appel
appel_date
appel_juridiction
date_decision
date_signification
date_audience_prochaine
mise_en_etat
mise_en_etat_details
```

Édité dans :

```text
/procedure
```

---

## 4.14. preuves_photo

Colonnes principales :

```text
id
user_id
created_at
titre
description
enfant_id
storage_path
nom_fichier
type_fichier
taille_octets
empreinte_sha256
metadonnees
gps_latitude
gps_longitude
gps_precision
heure_appareil
ecart_heure_secondes
anomalies
horodatage_jeton
horodatage_date
horodatage_statut
horodatage_prestataire
horodatage_algorithme
empreinte_sha256_serveur
hash_verifie
hash_verifie_at
```

Statuts actuels :

```text
non_qualifie
a_refaire
qualifie
```

À terme, statut eIDAS-ready possible :

```text
interne_non_qualifie
qualifie_en_attente
qualifie_valide
qualifie_echec
```

---

## 4.15. garde_regles

Colonnes principales :

```text
id
user_id
created_at
enfant_id
type_garde
parent_principal
date_reference
jour_debut
heure_debut
jour_fin
heure_fin
```

---

## 4.16. note_brouillon

Brouillon de note de synthèse.

Règle :

```text
1 brouillon par user
```

---

## 4.17. consentements_ia

Source de vérité du consentement IA.

Colonnes principales :

```text
id
user_id
created_at
fonctionnalite
```

Règle :

```text
Insert / Select / Delete.
Pas d'update.
```

Fonctionnalités connues :

```text
agent
assistant
pre-remplir
reformuler
extraction
extraction-pdf
```

Les noms exacts utilisés par chaque route doivent être vérifiés dans le code.

---

## 4.18. ia_appels

Table de quota anti-abus durable.

Colonnes principales :

```text
id
user_id
created_at
fonctionnalite
```

Règle :

```text
pas de policy DELETE
suppression via client admin lors de la suppression RGPD du compte
fail-closed si l'insert quota échoue
```

Fonctions utilisant le quota :

```text
reformulation
extraction
extraction-pdf
assistant historique
pré-remplissage
agent
horodatage
```

---

## 4.19. acceptation_politique

Table liée à l'acceptation de la politique de confidentialité.

Colonnes principales :

```text
id
user_id
version
accepted_at
```

---

## 4.20. audit_log proposé, non créé

Table proposée par audit, non créée.

Objectif :

```text
journal append-only
tracer créations, modifications, archivages, suppressions, exports, horodatages, vérifications de hash
```

Colonnes proposées :

```text
id
user_id
procedure_id
objet_type
objet_id
action
hash_avant
hash_apres
metadata jsonb
created_at
```

RLS proposée :

```text
SELECT par l'utilisateur
aucune policy UPDATE
aucune policy DELETE
```

---

## 4.21. Storage

Buckets privés :

```text
preuves
justificatifs
```

Structure :

```text
justificatifs = userId/fichier
preuves = userId/preuveId/fichier
```

Règle :

```text
Pas de policy UPDATE sur preuves.
Originaux scellés.
Lecture par URL signée 60 secondes.
```

---

# 5. Carte des fichiers

## 5.1. Racine

```text
AGENTS.md
CLAUDE.md
README.md
package.json
.env.example
PARENT_PREUVE_CONTEXTE.md
PARENT_PREUVE_REFERENCE.md
PARENT_PREUVE_ROADMAP_UX.md
PARENT_PREUVE_AGENT_IA.md
VITRINE_PARENT_PREUVE_BRIEF.md
prompt_claude_refonte_design_parent_preuve.md
```

---

## 5.2. app/

```text
app/layout.tsx
app/page.tsx
app/globals.css
app/manifest.ts

app/connexion/
app/compte/
app/mot-de-passe-oublie/
app/reinitialiser-mot-de-passe/

app/confidentialite/
app/mentions-legales/

app/dossier/
app/dossier/extraire/
app/dossier/importer-pdf/

app/procedure/
app/enfants/
app/journal/
app/frais/
app/pension/
app/calendrier/
app/resume-mois/
app/implication-parentale/
app/documents/
app/documents/coffre-fort/
app/preuves/
app/preuves/nouvelle/
app/courriers/
app/export/
app/note-synthese/
app/reformuler/
app/copilote/
```

Page provisoire à retirer :

```text
app/test-resume/
```

---

## 5.3. app/api/

```text
app/api/horodatage/route.ts
app/api/compte/supprimer/route.ts
app/api/preuves/verifier-hash/route.ts

app/api/ia/reformuler/route.ts
app/api/ia/extraire/route.ts
app/api/ia/extraire-pdf/route.ts

app/api/assistant/repondre/route.ts
app/api/assistant/aiguiller/route.ts
app/api/assistant/pre-remplir/route.ts

app/api/agent/analyser-demande/route.ts
app/api/agent/repondre/route.ts
```

Règle :

```text
/api/agent/analyser-demande = dry-run déterministe
/api/agent/repondre = Agent Mistral expérimental
/api/assistant/* = assistant historique encore conservé
```

---

## 5.4. components/

Principaux composants :

```text
NavBar
BandeauProcedure
SelecteurProcedure
Footer
GardeAcces
BienvenueRGPD
AccueilPublic
MajServiceWorker
BoutonCaptureRapide
AssistantFlottant
WidgetCopiloteDossier
WidgetActionsPrioritaires
WidgetSituationMois
WidgetDossierPret
TableauDeBord
ProchainesEcheances
ConfigurationDossier
CalendrierMensuel
Chronologie
ControleDossier
ConsentementIA
StatutConsentementIA
ApercuExtraction
ReformulationIA
EncartPliable
PageHeader
CourrierModele
ReglePension
RegleFrais
RegleDVH
RegleDecision
SelecteurPieces
FormulaireNote
BrouillonNote
QuestionnaireAiguillage
EffacerDonnees
```

---

## 5.5. lib/

Principales librairies :

```text
supabase
supabaseAdmin
procedureActive
etatConfiguration
etatDossier
authServeur
enteteAuth
quotaIa
hashServeur
dossierCalculs
controleDossier
resumeDossier
destinationsAssistant
useDeplacable
modelesIA
preRemplissage
gardeCalendrier
gardeNotifications
implicationParentale
chronologie
chronologieExport
chronologiePdf
chronologieCsv
csvExport
telechargerCsv
courrierHelpers
courrierPdf
preuvePdf
dispositif
extractionRegles
regleConvertisseurs
libellesRegles
prechargerNote
piecesnote
structureNote
assemblerNote
exportNotePdf
brouillonStockage
```

Socle Agent :

```text
lib/agent/types.ts
lib/agent/catalogueActions.ts
lib/agent/gardeFous.ts
lib/agent/orientation.ts
lib/agent/config.ts
lib/agent/prompt.ts
lib/agent/schemaReponse.ts
lib/agent/index.ts
```

---

## 5.6. scripts/

Scripts projet :

```text
scripts/check-agent-boundaries.mjs
```

Rôle :

```text
anti-régression Assistant / Agent
bloque le build si les frontières sont cassées
```

---

## 5.7. supabase/

```text
supabase/config.toml
supabase/snippets/
supabase/migrations/
```

Migrations :

```text
001_init_schema.sql
002_rls_policies.sql
003_storage_policies.sql
004_indexes.sql
005_implication_parentale.sql
006_verification_hash_serveur.sql
```

---

# 6. Modules fonctionnels

## 6.1. Journal factuel

Page :

```text
app/journal/page.tsx
```

Table :

```text
events
```

Fonctions :

```text
saisie d'un fait
statut brouillon / validé / exporté
catégorie
description factuelle
enfant optionnel
marqueur implication parentale
export CSV
pré-remplissage assisté via sessionStorage
```

Règle :

```text
Toujours rester factuel.
Ne pas qualifier juridiquement.
```

---

## 6.2. Frais

Page :

```text
app/frais/page.tsx
```

Table :

```text
expenses
```

Fonctions :

```text
saisie dépense
catégorie
montant
part autre parent
date
enfant
justificatif lié
statut remboursement
export CSV
pré-remplissage assisté via sessionStorage
```

---

## 6.3. Pension

Page :

```text
app/pension/page.tsx
```

Table :

```text
pension_payments
```

Fonctions :

```text
paiement réel par mois
montant dû
montant payé
reste dû
trop-perçu
date paiement
notes
export CSV
```

Règle :

```text
Statuts factuels seulement.
Pas de qualification pénale ou juridique.
```

---

## 6.4. Documents et coffre-fort

Pages :

```text
app/documents/page.tsx
app/documents/coffre-fort/page.tsx
```

Table :

```text
documents
```

Fonctions :

```text
pièces actives
archive
coffre-fort
a_traiter
filtrage
export CSV
marqueur implication parentale
```

---

## 6.5. Preuves photo

Pages :

```text
app/preuves/page.tsx
app/preuves/nouvelle/page.tsx
```

Table :

```text
preuves_photo
```

Fonctions :

```text
capture in-app
hash SHA-256 client
GPS
heure appareil
écart heure appareil/serveur
horodatage HMAC interne non qualifié
rapport PDF
hash serveur
statut d'intégrité
```

Route de hash serveur :

```text
app/api/preuves/verifier-hash/route.ts
```

Lib serveur :

```text
lib/hashServeur.ts
```

Important :

```text
La preuve photo ne doit jamais être présentée comme équivalente à un constat de commissaire de justice.
```

---

## 6.6. Horodatage

Route :

```text
app/api/horodatage/route.ts
```

Statut :

```text
HMAC-SHA256 non qualifié
```

Sécurité :

```text
auth Bearer
quota 30/60 s
HORODATAGE_SECRET
```

À terme :

```text
eIDAS qualifié via QTSP
RFC 3161 ou autre prestataire qualifié
```

---

## 6.7. Calendrier de garde

Page :

```text
app/calendrier/page.tsx
```

Table :

```text
garde_regles
```

Lib :

```text
lib/gardeCalendrier.ts
lib/gardeNotifications.ts
```

Fonctions :

```text
règle par enfant
grille mensuelle
rappels locaux navigateur
prochaines échéances
```

---

## 6.8. Courriers

Page :

```text
app/courriers/page.tsx
```

Composants/libs :

```text
components/CourrierModele.tsx
lib/courrierHelpers.ts
lib/courrierPdf.ts
```

Modèles actifs :

```text
relance-pension
remboursement-frais
non-representation
info-scolarite-sante
```

Règle :

```text
Ce sont des modèles factuels.
Ne pas transformer en conclusions judiciaires.
```

---

## 6.9. Note de synthèse factuelle pour avocat

Page :

```text
app/note-synthese/page.tsx
```

Libs :

```text
lib/prechargerNote.ts
lib/piecesnote.ts
lib/structureNote.ts
lib/assemblerNote.ts
lib/exportNotePdf.ts
lib/brouillonStockage.ts
```

Table :

```text
note_brouillon
```

Règle :

```text
Note factuelle pour avocat.
Pas de conclusions JAF.
Pas de stratégie judiciaire.
```

---

## 6.10. Extraction IA du jugement

Pages/routes :

```text
app/dossier/extraire/
app/dossier/importer-pdf/
app/api/ia/extraire/
app/api/ia/extraire-pdf/
```

Libs :

```text
lib/extractionRegles.ts
lib/regleConvertisseurs.ts
lib/dispositif.ts
lib/libellesRegles.ts
```

Règles :

```text
Le dispositif fait foi.
Source IA = source='ia', valide=false.
L'utilisateur valide ensuite.
```

---

## 6.11. Reformulation neutre

Page :

```text
app/reformuler/page.tsx
```

Route :

```text
app/api/ia/reformuler/route.ts
```

Rôle :

```text
reformuler de manière neutre
éviter les propos accusatoires
ne pas créer de conseil juridique
```

---

## 6.12. Export PDF et CSV

Export PDF :

```text
app/export/page.tsx
```

CSV :

```text
lib/csvExport.ts
lib/telechargerCsv.ts
lib/chronologieCsv.ts
```

Modules avec export CSV :

```text
pension
frais
chronologie
documents
journal
preuves
implication parentale
```

Règle :

```text
Export factuel.
Avertissement non qualifiant.
```

---

# 7. Sécurité, RGPD et production

## 7.1. Auth

Auth côté navigateur :

```text
Supabase Auth
```

Routes serveur :

```text
token Bearer
lib/authServeur.ts
lib/enteteAuth.ts
```

---

## 7.2. Secrets

Secrets serveur :

```text
SUPABASE_SERVICE_ROLE_KEY
MISTRAL_API_KEY
HORODATAGE_SECRET
```

Interdiction :

```text
Ne jamais exposer ces secrets en NEXT_PUBLIC_.
```

---

## 7.3. Quota IA

Lib :

```text
lib/quotaIa.ts
```

Table :

```text
ia_appels
```

Principe :

```text
auth -> quota -> traitement
```

Le quota est fail-closed :

```text
si l'insert quota échoue, l'appel est refusé
```

---

## 7.4. Consentement IA

Table :

```text
consentements_ia
```

Composant :

```text
components/ConsentementIA.tsx
```

Statut :

```text
porte réutilisable
textes personnalisables
utilisée pour agent et autres fonctions IA
```

---

## 7.5. Suppression RGPD

Route :

```text
app/api/compte/supprimer/route.ts
```

Rôle :

```text
effacer Storage
effacer tables utilisateur
effacer compte Auth
```

Utilise :

```text
supabaseAdmin
service_role
```

Règle :

```text
Pas de quota sur la suppression RGPD.
```

---

## 7.6. Pages légales

Pages :

```text
app/confidentialite/page.tsx
app/mentions-legales/page.tsx
```

Contenu connu :

```text
éditeur : Anthony Magny
statut : particulier
localisation : Tarbes
contact : alkhyomgame@gmail.com
hébergement : Vercel Paris cdg1
données Supabase : Irlande eu-west-1
```

À faire avant ouverture large :

```text
relecture juridique
DPA Mistral
activation ZDR Mistral si possible
mise à jour du paragraphe IA
```

---

# 8. PWA et mobile

## 8.1. PWA

Fichiers :

```text
app/manifest.ts
public/sw.js
components/MajServiceWorker.tsx
```

Statut :

```text
installable
hors-ligne coquille
module de mise à jour
```

Règle Service Worker :

```text
ne jamais cacher Supabase
ne jamais cacher Storage
ne jamais cacher /api/
ne jamais cacher les URLs signées
```

---

## 8.2. App mobile Expo

Repo séparé :

```text
parent-preuve-mobile
```

Stack :

```text
Expo SDK 54
```

État connu :

```text
auth
liste enfants read-only
journal events
formulaire création
garde-fou neutralité
persistance AsyncStorage
```

Backend :

```text
Supabase réutilisé tel quel
```

---

# 9. Dette technique

## 9.1. Provisoire à retirer

Page provisoire :

```text
app/test-resume/page.tsx
```

Lien provisoire :

```text
Test résumé (temporaire)
```

dans :

```text
components/NavBar.tsx
```

Commande de vérification après retrait :

```powershell
Select-String "test-resume" -Path .\* -Recurse
```

ou :

```bash
git grep "test-resume"
```

Résultat attendu après retrait :

```text
aucun résultat
```

---

## 9.2. Dette documents

Dette légère :

```text
documents.archive boolean
documents.etat text avec CHECK actif | archive | a_traiter
```

Décision :

```text
conserver temporairement
ne pas refactorer sans étape dédiée
```

---

## 9.3. Dette consentements_ia

Point connu :

```text
consentements_ia.user_id est une FK sans ON DELETE CASCADE
```

Impact :

```text
mineur
suppression RGPD passe par client admin
```

---

## 9.4. Dette index

Index réels :

```text
children.procedure_id
decision_regle.procedure_id
dvh_regle.procedure_id
frais_regle.procedure_id
pension_payments.procedure_id
pension_regle.procedure_id
ia_appels(user_id, created_at DESC)
```

Pas d'index dédié user_id/created_at ailleurs.

Optimisation future possible, non prioritaire.

---

# 10. Corrections déjà résolues

## 10.1. Secret horodatage

Résolu :

```text
HORODATAGE_SECRET
```

Ancien reliquat :

```text
HMAC_SECRET
```

corrigé.

---

## 10.2. Migrations Supabase

Résolu :

```text
supabase/migrations/ créé et versionné
001 à 006
```

---

## 10.3. Quota IA fail-closed

Résolu :

```text
lib/quotaIa.ts refuse l'appel si l'insert quota échoue
```

---

## 10.4. Suppression de compte complète

Résolu :

```text
17/17 tables couvertes
procedures supprimées en dernier
Storage effacé
Auth supprimé en dernier
```

---

## 10.5. Hash preuve recalculé serveur

Résolu :

```text
migration 006
/api/preuves/verifier-hash
lib/hashServeur.ts
```

---

## 10.6. Favicon et README

Résolu :

```text
favicon PP
README dégénéricisé
```

---

## 10.7. Boutons flottants déplaçables

Résolu :

```text
AssistantFlottant
BoutonCaptureRapide
useDeplacable
localStorage
pointer events
bornage écran
```

---

## 10.8. Séparation Assistant / Agent

Résolu :

```text
Assistant historique conservé
Agent dry-run séparé
Agent Mistral isolé
script anti-régression
documentation mise à jour
```

---

# 11. Backlog et prochaines étapes

## 11.1. Étape 22 — cartographie migration Assistant historique vers Agent

Statut :

```text
à faire après stabilisation du Copilote
```

Objectif :

```text
préparer la migration progressive de /api/assistant/repondre et /api/assistant/pre-remplir vers l'architecture Agent
sans casser les fonctions actuelles
```

---

### 11.1.1. Assistant historique / répondre

Route actuelle :

```text
app/api/assistant/repondre/route.ts
```

Usage actuel :

```text
bouton flottant
bloc Question sur le dossier
```

Fonction :

```text
répondre à une question à partir du résumé factuel du dossier
```

Migration cible possible :

```text
app/api/agent/question-dossier/route.ts
```

ou intégration future dans :

```text
app/api/agent/repondre/route.ts
```

mais uniquement après décision dédiée.

La migration devra apporter :

```text
prompt Agent
réponse structurée
validateur Agent
garde-fous Agent
fallback déterministe si nécessaire
consentement clair
quota centralisé
refus juridique local avant Mistral
```

À ne pas faire tout de suite :

```text
supprimer /api/assistant/repondre
brancher brutalement /api/agent/repondre dans le bouton flottant
répondre librement sans structure
```

---

### 11.1.2. Assistant historique / pré-remplir

Route actuelle :

```text
app/api/assistant/pre-remplir/route.ts
```

Usage actuel :

```text
bouton flottant
bloc Aide à la saisie
```

Fonction :

```text
phrase libre -> proposition de champs pour /frais ou /journal
transport sessionStorage
validation humaine sur l'écran final
```

Migration cible possible :

```text
app/api/agent/pre-remplir/route.ts
```

ou action Agent de type :

```text
proposer_brouillon_frais
proposer_brouillon_journal
```

La migration devra conserver :

```text
aucune écriture automatique
nettoyage serveur
nettoyage client en défense
sessionStorage plutôt que URL
validation humaine obligatoire
pas d'UUID enfant inventé
catégories fermées
date vérifiée
montant vérifié
```

À ne pas faire tout de suite :

```text
écrire directement en base depuis l'IA
fusionner le pré-remplissage avec /api/agent/repondre sans contrat dédié
supprimer nettoyerProposition()
```

---

### 11.1.3. Ordre de migration recommandé

Ordre recommandé :

```text
1. Créer un contrat Agent spécifique pour les brouillons de saisie.
2. Migrer pré-remplir vers Agent, car la validation humaine existe déjà.
3. Stabiliser.
4. Migrer question sur dossier vers Agent.
5. Supprimer progressivement les routes /api/assistant/* seulement quand plus rien ne les utilise.
```

Ne pas migrer en premier :

```text
question libre sur le dossier
```

Motif :

```text
risque de réponse trop large ou juridiquement ambiguë
```

Migrer en premier :

```text
pré-remplissage frais/journal
```

Motif :

```text
sortie structurée
validation humaine déjà présente
écriture finale faite par l'utilisateur
```

---

## 11.2. Intégration progressive du mode avancé

Étape future possible :

```text
ajouter un mode avancé dans le bouton flottant
```

Conditions avant intégration :

```text
consentement Agent clair
quota Agent clair
résumé optionnel explicite
validateur Agent robuste
fallback déterministe robuste
tests Vercel verts
script anti-régression vert
```

Interdiction actuelle :

```text
ne pas appeler directement /api/agent/repondre depuis AssistantFlottant
```

---

## 11.3. Audit log

Créer table :

```text
audit_log
```

Objectif :

```text
journal append-only des actions sensibles
```

Actions à tracer :

```text
creation
modification
archivage
suppression
export_pdf
export_zip
horodatage
verification_hash
```

---

## 11.4. Export avocat ZIP

Objectif :

```text
produire un dossier complet exportable
```

Contenu possible :

```text
note_synthese.pdf
chronologie.pdf
bordereau_pieces.pdf
pension.pdf
frais.pdf
preuves/
documents/
manifest.json
hashes_sha256.txt
```

Avertissement obligatoire :

```text
contient des données personnelles sensibles
```

---

## 11.5. Mode dossier audience

Objectif :

```text
export structuré pour audience
```

Contenu :

```text
résumé procédure
chronologie filtrée
pension dû/payé
frais
demandes de modification factuelles
preuves
documents
bordereau
```

Règle :

```text
factuel uniquement
pas de conclusions juridiques
```

---

## 11.6. Horodatage eIDAS-ready

Évolution :

```text
statuts plus précis
prestataire QTSP
RFC 3161 ou équivalent
rapport PDF distinguant interne non qualifié et qualifié
```

Statuts possibles :

```text
interne_non_qualifie
qualifie_en_attente
qualifie_valide
qualifie_echec
```

---

## 11.7. Vérification par QR code

Objectif :

```text
preuve vérifiable sans exposer les données sensibles
```

À créer :

```text
token_verification non devinable
page /preuves/verifier/[token]
QR dans rapport PDF
métadonnées minimales
jamais photo originale
jamais données sensibles inutiles
```

---

## 11.8. App mobile native

Pistes :

```text
React Native / Expo
réutilisation Supabase
procédures
courriers
note de synthèse
preuves photo natives
détection mock location
détection root / jailbreak
```

---

## 11.9. Présence stores

À terme :

```text
App Store
Google Play
```

Pré-requis :

```text
audit juridique
pages légales finalisées
DPA/ZDR Mistral
sécurité renforcée
politique de confidentialité mobile
support utilisateur
```

---

# 12. Règles de développement

## 12.1. Méthode obligatoire

Méthode recommandée :

```text
audit du live
audit du code
proposition
risques
tests
go explicite
patch minimal
déploiement Vercel vert
validation utilisateur
étape suivante
```

---

## 12.2. Règles pour Claude, Cursor ou tout assistant de développement

Avant toute modification :

```text
lire PARENT_PREUVE_CONTEXTE.md
lire PARENT_PREUVE_REFERENCE.md
lire PARENT_PREUVE_AGENT_IA.md si IA/Copilote/Assistant
lire les fichiers concernés
ne pas inventer d'API
ne pas inventer de table
ne pas inventer de colonne
ne pas contourner lib/agent
ne pas contourner les garde-fous
ne pas brancher Mistral sans validateur
ne pas créer d'écriture automatique
ne pas créer de conseil juridique déguisé
faire une seule étape testable à la fois
attendre un go explicite avant toute étape risquée
```

---

## 12.3. Règles IA obligatoires

Ne jamais présenter le Copilote comme :

```text
assistant juridique
avocat IA
conseiller juridique
assistant JAF
stratège judiciaire
outil de prédiction judiciaire
outil de recevabilité garantie
```

Ne jamais produire :

```text
conclusions prêtes à déposer
demande à formuler au juge
stratégie judiciaire personnalisée
qualification juridique des faits
promesse de résultat
promesse de recevabilité
```

Toujours préférer :

```text
organisation factuelle
trace datée
chronologie
justificatif
élément à vérifier
brouillon à valider
synthèse factuelle
soumis à l'appréciation du juge
à faire relire par un professionnel du droit si nécessaire
```

---

# 13. Commandes utiles

## 13.1. Vérification Agent

```bash
npm run check:agent-boundaries
```

Résultat attendu :

```text
✅ Séparation Assistant / Agent vérifiée.
```

---

## 13.2. Build

```bash
npm run build
```

Le build doit lancer avant tout :

```text
scripts/check-agent-boundaries.mjs
```

---

## 13.3. Vérifier que le bouton flottant ne branche pas Mistral Agent

```bash
git grep '/api/agent/repondre' -- components/AssistantFlottant.tsx
```

Résultat attendu :

```text
aucun résultat
```

---

## 13.4. Vérifier la route dry-run Agent

```bash
git grep "MISTRAL_API_KEY" app/api/agent/analyser-demande/route.ts
git grep "verifierQuotaIa" app/api/agent/analyser-demande/route.ts
git grep "ENDPOINT_MISTRAL_CHAT_COMPLETIONS" app/api/agent/analyser-demande/route.ts
git grep "MODELE_ASSISTANT" app/api/agent/analyser-demande/route.ts
```

Résultat attendu :

```text
aucun résultat
```

---

## 13.5. Vérifier les règles d'orientation Agent

```bash
git grep "Règles d'orientation obligatoires" lib/agent/prompt.ts
git grep "orienterDemandeAgent" lib/agent/orientation.ts app/api/agent/analyser-demande/route.ts app/api/agent/repondre/route.ts
```

---

# 14. Résumé final d'état

État actuel validé :

```text
Assistant historique = production existante pour pré-remplissage et question dossier.
Agent dry-run = orientation déterministe sécurisée.
Agent Mistral = expérimentation avancée dans /copilote.
Bouton flottant = pas d'appel direct à /api/agent/repondre.
Script anti-régression = actif dans le build.
Documentation Agent = présente.
```

Règle finale :

```text
En cas de doute, ne pas fusionner les générations.
Documenter.
Tester.
Valider une étape dédiée.
Garder l'utilisateur maître de toute action.
```
