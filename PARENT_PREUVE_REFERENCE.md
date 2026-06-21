# Parent Preuve — Référence technique synthétique

> Référence technique vivante de Parent Preuve.
> À lire avant toute modification de code, Supabase, IA, Copilote, Assistant, routes API, preuves, exports, documents ou UX principale.
>
> Le code réel reste la source de vérité.
>
> Dernière mise à jour : 21/06/2026.

---

# 1. Rôle du projet

Parent Preuve est une application Next.js / TypeScript / Supabase / Vercel, sans dossier `src/`.

Objectif :

```text
Aider un parent à organiser un dossier factuel de coparentalité.
```

Positionnement obligatoire :

```text
Parent Preuve n'est pas un avocat.
Parent Preuve n'est pas un assistant juridique.
Parent Preuve ne donne pas de stratégie judiciaire.
Parent Preuve ne garantit jamais la recevabilité d'une preuve.
Parent Preuve ne promet jamais un résultat judiciaire.
```

Principe central :

```text
L'IA propose.
L'utilisateur vérifie.
L'utilisateur valide.
L'application exécute seulement après validation explicite.
```

Documents liés :

```text
PARENT_PREUVE_CONTEXTE.md       -> mission, positionnement, cadre juridique produit
PARENT_PREUVE_REFERENCE.md      -> référence technique synthétique
PARENT_PREUVE_ROADMAP_UX.md     -> roadmap produit / UX / ergonomie
PARENT_PREUVE_AGENT_IA.md       -> cadre détaillé du Copilote Agent IA
CLAUDE.md                       -> consignes opérationnelles Claude/Cursor
```

---

# 2. État fonctionnel global

Fonctionnalités principales livrées :

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
coffre-fort
preuves photo
horodatage interne non qualifié
vérification serveur du hash
calendrier de garde
rappels locaux
courriers factuels
note de synthèse factuelle
export PDF
export CSV
extraction IA de jugement
reformulation neutre
assistant historique
Copilote Agent nouvelle génération
pré-remplissage Agent branché au bouton flottant
PWA installable
mode hors-ligne coquille
suppression RGPD du compte
pages légales
```

Accueil connecté :

```text
app/page.tsx
```

Widgets principaux :

```text
WidgetActionsPrioritaires
WidgetSituationMois
TableauDeBord
WidgetDossierPret
ProchainesEcheances
ConfigurationDossier
WidgetCopiloteDossier
```

Règle accueil :

```text
lecture seule
procédure active
pas d'écriture automatique
pas de conseil juridique
```

---

# 3. Architecture IA actuelle

Le projet contient encore deux générations IA.

## 3.1. Assistant historique

Routes :

```text
app/api/assistant/repondre/route.ts
app/api/assistant/pre-remplir/route.ts
app/api/assistant/aiguiller/route.ts
```

État :

```text
assistant/repondre      encore utilisé par le bouton flottant pour la question dossier
assistant/pre-remplir   déprécié, conservé temporairement, plus appelé par le bouton flottant
assistant/aiguiller     ancien aiguillage, ne doit plus être utilisé par le bouton flottant principal
```

Usage actuel dans `components/AssistantFlottant.tsx` :

```text
Pré-remplir une saisie -> /api/agent/pre-remplir
Poser une question      -> /api/assistant/repondre
```

Règles :

```text
Ne pas supprimer brutalement /api/assistant/*.
Ne pas réutiliser /api/assistant/pre-remplir dans le bouton flottant.
Ne pas copier les anciennes routes assistant dans /api/agent/.
Ne pas mélanger Assistant historique et Agent nouvelle génération.
```

---

## 3.2. Copilote Agent nouvelle génération

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
lib/agent/index.ts
```

Routes :

```text
app/api/agent/analyser-demande/route.ts
app/api/agent/repondre/route.ts
app/api/agent/pre-remplir/route.ts
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

Objectif Agent :

```text
réponse structurée
actions connues uniquement
garde-fous explicites
validation humaine obligatoire
aucune écriture automatique
refus des demandes juridiques sensibles
séparation claire entre dry-run, Mistral et production
```

---

# 4. Routes Agent

## 4.1. `/api/agent/analyser-demande`

Fichier :

```text
app/api/agent/analyser-demande/route.ts
```

Statut :

```text
livré
validé
utilisé par le bouton flottant pour M'orienter
```

Rôle :

```text
auth obligatoire
analyse déterministe
orientation vers une page
refus local des demandes sensibles
aucun Mistral
aucun quota IA
aucun consentement IA
aucune écriture
```

Interdit dans cette route :

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

## 4.2. `/api/agent/repondre`

Fichier :

```text
app/api/agent/repondre/route.ts
```

Statut :

```text
livré
validé dans /copilote
non branché directement au bouton flottant
```

Rôle :

```text
test Mistral Agent général
auth obligatoire
consentement Agent obligatoire
quota Agent obligatoire
refus local avant Mistral
résumé dossier optionnel
prompt système Agent
JSON strict
validation schemaReponse
fallback déterministe si Mistral invente ou oublie une action
aucune écriture métier
aucune action automatique
```

Doit conserver :

```text
construirePromptSystemeAgent
parserEtValiderReponseAgent
orienterDemandeAgent
construireReponseOrientationDeterminee
fallback déterministe
```

Interdiction :

```text
components/AssistantFlottant.tsx ne doit pas appeler /api/agent/repondre.
```

---

## 4.3. `/api/agent/pre-remplir`

Fichier :

```text
app/api/agent/pre-remplir/route.ts
```

Statut :

```text
livré
validé dans /copilote
validé dans le bouton flottant
branché au bouton flottant pour le pré-remplissage
```

Contrat :

```text
lib/agent/preRemplissage.ts
version : agent-pre-remplissage-v1
```

Rôle :

```text
pré-remplissage Agent avec Mistral
auth obligatoire
consentement Agent obligatoire
quota Agent obligatoire
refus local des demandes sensibles
appel Mistral côté serveur
validation du contrat agent-pre-remplissage-v1
nettoyage via nettoyerProposition()
aucune écriture métier
aucune action automatique
validation humaine obligatoire
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
app/api/assistant/pre-remplir/route.ts
```

Règle :

```text
L'ancienne route reste présente temporairement.
Elle ne doit plus être appelée par le bouton flottant.
Elle pourra être supprimée après stabilisation.
```

---

# 5. Orientation Agent

Fichier :

```text
lib/agent/orientation.ts
```

Orientations attendues :

```text
facture / frais / cantine / remboursement / justificatif -> /frais
retard / incident / absence / journal / événement         -> /journal
preuve / photo / document / capture / SMS / mail / pièce  -> /preuves
courrier / message / réponse / reformulation              -> /courriers
export / PDF / dossier complet / impression               -> /export
enfant / fils / fille / résidence                         -> /enfants
aucune rubrique claire                                    -> /
```

Utilisée par :

```text
/api/agent/analyser-demande
fallback de /api/agent/repondre
```

---

# 6. Bouton flottant

Composant :

```text
components/AssistantFlottant.tsx
```

Statut :

```text
livré
validé
déplaçable
clarifié en 3 usages
monté une seule fois dans app/layout.tsx
```

Blocs UX :

```text
1. Copilote rapide
2. Aide à la saisie
3. Question sur le dossier
```

Routage attendu :

```text
M'orienter              -> /api/agent/analyser-demande
Pré-remplir une saisie  -> /api/agent/pre-remplir
Poser une question      -> /api/assistant/repondre
Mode avancé             -> /copilote
```

Interdictions :

```text
pas d'appel direct à /api/agent/repondre
pas d'appel à /api/assistant/pre-remplir
pas d'écriture automatique
pas de conseil juridique
```

---

# 7. Page `/copilote`

Fichier :

```text
app/copilote/page.tsx
```

Statut :

```text
laboratoire du Copilote Agent
livré
validé
```

Fonctions :

```text
Analyser en dry-run
Tester avec Mistral
Tester avec Mistral + résumé factuel du dossier
Tester le pré-remplissage Agent
Comparer ancien assistant / Agent pré-remplissage
afficher source API
afficher validation Agent
afficher garde-fous
afficher action proposée
afficher proposition structurée frais/journal
```

Règle :

```text
La page correcte est /copilote.
Elle peut rester comme laboratoire ou mode avancé.
```

---

# 8. Consentement IA et quota

Table consentement :

```text
consentements_ia
```

Table quota :

```text
ia_appels
```

Composant :

```text
components/ConsentementIA.tsx
```

Fonctionnalité Agent :

```text
fonctionnalite = "agent"
```

Configuration Agent :

```text
lib/agent/config.ts
```

Constantes principales :

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
Ne pas redéclarer ces constantes dans les routes.
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

Le build doit lancer ce script avant `next build`.

Le script bloque le build si :

```text
/api/agent/analyser-demande contient Mistral, quota ou consentement
/api/agent/repondre perd validateur ou fallback
/api/agent/pre-remplir perd son contrat expérimental
AssistantFlottant appelle /api/agent/repondre
AssistantFlottant appelle /api/assistant/pre-remplir
AssistantFlottant n'appelle plus /api/agent/pre-remplir
les routes assistant historiques disparaissent alors qu'elles sont encore utilisées ou conservées temporairement
```

---

# 10. Tests obligatoires Agent

Après toute modification touchant :

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
npm run build
```

Résultat attendu :

```text
✅ Séparation Assistant / Agent vérifiée.
Build vert.
```

Tests bouton flottant :

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
-> pré-remplissage frais via /api/agent/pre-remplir

Le père est arrivé avec 25 minutes de retard samedi
-> pré-remplissage journal via /api/agent/pre-remplir

Rédige mes conclusions pour gagner devant le JAF
-> refus garde-fou, aucun conseil juridique, aucune écriture
```

Tests `/copilote` :

```text
dry-run
Mistral général
Mistral avec résumé factuel
pré-remplissage Agent
comparaison ancien assistant / Agent
garde-fous juridiques
```

---

# 11. Schéma Supabase — synthèse utile

Les migrations versionnées sont la source de vérité :

```text
supabase/migrations/
```

Fichiers :

```text
001_init_schema.sql
002_rls_policies.sql
003_storage_policies.sql
004_indexes.sql
005_implication_parentale.sql
006_verification_hash_serveur.sql
```

Rappel :

```text
001 à 003 : non idempotentes, base vierge, dans l'ordre
004 à 006 : idempotentes
```

Tables principales :

```text
procedures
children
events
expenses
pension_payments
documents
dossier
pension_regle
frais_regle
dvh_regle
decision_regle
preuves_photo
garde_regles
note_brouillon
consentements_ia
ia_appels
acceptation_politique
```

Table proposée mais non créée :

```text
audit_log
```

Buckets privés :

```text
preuves
justificatifs
```

Règles générales :

```text
RLS active
user_id = auth.uid()
procédure active filtrée côté application
pas de policy UPDATE sur preuves originales
URLs signées temporaires pour lecture de fichiers
```

---

# 12. Cloisonnement procédure

Table centrale :

```text
procedures
```

Colonnes `procedure_id` importantes :

```text
children
pension_regle
frais_regle
dvh_regle
decision_regle
pension_payments
```

Helper principal :

```text
lib/procedureActive.ts
```

Fonctions :

```text
getProcedureActiveId
getEnfantsDeProcedureActive
getProcedureActiveIdLocal
setProcedureActiveIdLocal
```

Règle :

```text
La RLS protège par utilisateur.
Le cloisonnement par procédure est appliqué par les filtres applicatifs.
```

---

# 13. Tables clés — repères rapides

## 13.1. `procedures`

Contient :

```text
autre_parent_*
jugement_*
etiquette
```

Attention :

```text
Les infos autre parent et jugement ne sont plus dans dossier.
```

## 13.2. `dossier`

Contient uniquement le déclarant :

```text
declarant_civilite
declarant_nom
declarant_prenom
declarant_adresse
declarant_code_postal
declarant_ville
declarant_email
declarant_telephone
```

## 13.3. `children`

Colonnes clés :

```text
prenom_ou_alias
date_naissance
procedure_id
```

## 13.4. `events`

Journal factuel.

Colonnes clés :

```text
titre
categorie
date_evenement
heure_evenement
description_factuelle
child_id
statut
implication_categorie
```

Statuts :

```text
brouillon
valide
exporte
```

## 13.5. `expenses`

Frais.

Colonnes clés :

```text
libelle
categorie
montant
part_autre
date_frais
rembourse
document_id
child_id
```

## 13.6. `pension_payments`

Pension.

Colonnes clés :

```text
procedure_id
mois_du
montant_du
montant_paye
date_paiement
notes
```

## 13.7. `documents`

Colonnes clés :

```text
libelle
categorie
chemin_fichier
date_document
child_id
etat
archive
implication_categorie
```

Dette connue :

```text
archive boolean coexiste avec etat.
```

## 13.8. `preuves_photo`

Colonnes clés :

```text
storage_path
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

Règle :

```text
Ne jamais présenter comme équivalent à un constat de commissaire de justice.
```

## 13.9. `consentements_ia`

Colonnes :

```text
user_id
fonctionnalite
created_at
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

## 13.10. `ia_appels`

Quota anti-abus durable.

Règle :

```text
fail-closed si insert quota échoue
pas de policy DELETE
suppression via admin dans suppression RGPD
```

---

# 14. Carte des fichiers — synthèse

Racine :

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
```

Pages principales :

```text
app/page.tsx
app/layout.tsx
app/connexion/
app/compte/
app/dossier/
app/procedure/
app/enfants/
app/journal/
app/frais/
app/pension/
app/calendrier/
app/documents/
app/preuves/
app/courriers/
app/export/
app/note-synthese/
app/reformuler/
app/copilote/
```

Routes API principales :

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
app/api/agent/pre-remplir/route.ts
```

Composants clés :

```text
NavBar
BandeauProcedure
SelecteurProcedure
Footer
GardeAcces
BienvenueRGPD
AssistantFlottant
WidgetCopiloteDossier
WidgetActionsPrioritaires
WidgetSituationMois
WidgetDossierPret
TableauDeBord
ProchainesEcheances
ConfigurationDossier
ConsentementIA
StatutConsentementIA
ReformulationIA
CourrierModele
ReglePension
RegleFrais
RegleDVH
RegleDecision
```

Libs clés :

```text
lib/supabase.ts
lib/supabaseAdmin.ts
lib/authServeur.ts
lib/enteteAuth.ts
lib/procedureActive.ts
lib/etatDossier.ts
lib/etatConfiguration.ts
lib/quotaIa.ts
lib/resumeDossier.ts
lib/preRemplissage.ts
lib/hashServeur.ts
lib/modelesIA.ts
lib/agent/
```

Scripts :

```text
scripts/check-agent-boundaries.mjs
```

---

# 15. Modules métier

## Journal

```text
app/journal/page.tsx
table events
saisie de faits datés
statuts brouillon / valide / exporte
pré-remplissage possible via sessionStorage
```

Règle :

```text
factuel uniquement
pas de qualification juridique
```

## Frais

```text
app/frais/page.tsx
table expenses
montant, date, catégorie, part autre parent, justificatif, enfant
pré-remplissage possible via sessionStorage
```

## Pension

```text
app/pension/page.tsx
table pension_payments
montant dû / payé / reste / date / notes
```

## Documents

```text
app/documents/page.tsx
app/documents/coffre-fort/page.tsx
table documents
états actif / archive / a_traiter
```

## Preuves photo

```text
app/preuves/page.tsx
app/preuves/nouvelle/page.tsx
table preuves_photo
hash client
hash serveur
GPS
heure appareil
horodatage interne
rapport PDF
```

## Courriers

```text
app/courriers/page.tsx
modèles factuels
relance pension
remboursement frais
non-représentation
info scolarité/santé
```

Règle :

```text
modèles factuels uniquement
pas de conclusions judiciaires
```

## Note de synthèse

```text
app/note-synthese/page.tsx
note factuelle pour avocat
pas de stratégie judiciaire
```

## Extraction jugement

```text
app/dossier/extraire/
app/dossier/importer-pdf/
app/api/ia/extraire/
app/api/ia/extraire-pdf/
```

Règle :

```text
Le dispositif fait foi.
Source IA = source='ia', valide=false.
L'utilisateur valide ensuite.
```

## Reformulation neutre

```text
app/reformuler/
app/api/ia/reformuler/
```

Rôle :

```text
reformulation neutre
pas de conseil juridique
```

---

# 16. Sécurité et production

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

Auth serveur :

```text
Bearer token
lib/authServeur.ts
lib/enteteAuth.ts
```

Suppression RGPD :

```text
app/api/compte/supprimer/route.ts
supabaseAdmin
service_role
Storage effacé
tables effacées
Auth supprimé en dernier
```

Pages légales :

```text
app/confidentialite/page.tsx
app/mentions-legales/page.tsx
```

Données connues :

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
ZDR Mistral si possible
mise à jour définitive confidentialité IA
```

---

# 17. PWA et mobile

PWA :

```text
app/manifest.ts
public/sw.js
components/MajServiceWorker.tsx
```

Règle Service Worker :

```text
ne pas cacher Supabase
ne pas cacher Storage
ne pas cacher /api/
ne pas cacher les URLs signées
```

Mobile Expo :

```text
repo séparé parent-preuve-mobile
Expo SDK 54
Supabase partagé
```

État connu mobile :

```text
auth
liste enfants read-only
journal events
formulaire création
garde-fou neutralité
persistance AsyncStorage
```

---

# 18. Dette technique

Dette à surveiller :

```text
app/test-resume/page.tsx provisoire
lien Test résumé temporaire dans NavBar si encore présent
documents.archive coexiste avec documents.etat
consentements_ia.user_id sans ON DELETE CASCADE
index complémentaires possibles plus tard
app/api/assistant/pre-remplir conservée temporairement alors que dépréciée
```

À vérifier pour supprimer `test-resume` :

```bash
git grep "test-resume"
```

Résultat attendu après suppression :

```text
aucun résultat
```

---

# 19. Corrections déjà résolues

Résolu :

```text
HORODATAGE_SECRET remplace HMAC_SECRET
migrations Supabase 001 à 006 versionnées
quota IA fail-closed
suppression RGPD complète
hash preuve recalculé serveur
README dégénéricisé
favicon PP
boutons flottants déplaçables
Copilote Agent dry-run
Copilote Agent Mistral général
pré-remplissage Agent validé et branché
séparation Assistant / Agent
script anti-régression
documentation Agent
```

---

# 20. Backlog prioritaire

## 20.1. Stabilisation pré-remplissage Agent

Statut :

```text
en cours de stabilisation après migration bouton flottant
```

Objectif :

```text
surveiller les retours
vérifier frais/journal/garde-fous
corriger uniquement les écarts constatés
ne pas réintroduire /api/assistant/pre-remplir dans le bouton flottant
```

## 20.2. Retrait futur de l'ancien pré-remplissage assistant

Route dépréciée :

```text
app/api/assistant/pre-remplir/route.ts
```

Condition avant suppression :

```text
aucun appel dans le bouton flottant
aucun appel dans /copilote sauf comparaison temporaire
aucun import indirect
tests Agent pré-remplissage validés
script anti-régression vert
Vercel vert
```

À faire plus tard :

```text
supprimer la route
supprimer les références docs
adapter le script anti-régression
```

## 20.3. Migration question sur dossier vers Agent

À faire plus tard.

Route encore utilisée :

```text
app/api/assistant/repondre/route.ts
```

Motif :

```text
plus risqué que le pré-remplissage structuré
réponses libres potentiellement juridiquement ambiguës
nécessite un contrat Agent dédié ou un validateur plus strict
```

## 20.4. Audit log

À créer :

```text
audit_log
```

Objectif :

```text
journal append-only des actions sensibles
créations
modifications
archivages
suppressions
exports
horodatages
vérifications de hash
```

## 20.5. Export avocat ZIP

Objectif :

```text
dossier complet exportable
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

## 20.6. Horodatage eIDAS-ready

Évolution future :

```text
prestataire QTSP
RFC 3161 ou équivalent
statuts qualifiés
rapport PDF distinguant interne non qualifié et qualifié
```

Statuts possibles :

```text
interne_non_qualifie
qualifie_en_attente
qualifie_valide
qualifie_echec
```

## 20.7. QR code de vérification

À créer :

```text
token_verification non devinable
page /preuves/verifier/[token]
QR dans rapport PDF
métadonnées minimales
jamais photo originale
jamais donnée sensible inutile
```

---

# 21. Règles de développement

Méthode obligatoire :

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
ne pas brancher Mistral sans validateur
ne pas créer d'écriture automatique
ne pas créer de conseil juridique déguisé
```

---

# 22. Commandes utiles

Vérifier séparation Agent :

```bash
npm run check:agent-boundaries
```

Build :

```bash
npm run build
```

Vérifier que le bouton flottant ne branche pas l'Agent général :

```bash
git grep '/api/agent/repondre' -- components/AssistantFlottant.tsx
```

Résultat attendu :

```text
aucun résultat
```

Vérifier que le bouton flottant utilise l'Agent pré-remplissage :

```bash
git grep '/api/agent/pre-remplir' -- components/AssistantFlottant.tsx
```

Résultat attendu :

```text
un résultat dans la fonction preRemplir()
```

Vérifier que le bouton flottant n'utilise plus l'ancien pré-remplissage :

```bash
git grep '/api/assistant/pre-remplir' -- components/AssistantFlottant.tsx
```

Résultat attendu :

```text
aucun résultat
```

Vérifier route dry-run :

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

Vérifier pré-remplissage Agent :

```bash
git grep "agent-pre-remplissage-v1" lib/agent/preRemplissage.ts app/api/agent/pre-remplir/route.ts app/copilote/page.tsx
```

---

# 23. Résumé final d'état

État actuel validé :

```text
Assistant historique = production existante seulement pour question dossier.
Assistant pré-remplir = ancienne route conservée temporairement mais dépréciée.
Agent dry-run = orientation déterministe sécurisée.
Agent Mistral général = expérimentation avancée dans /copilote.
Agent pré-remplissage = validé et branché dans le bouton flottant.
Bouton flottant = Agent pour orientation/pré-remplissage, assistant historique pour question dossier.
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
