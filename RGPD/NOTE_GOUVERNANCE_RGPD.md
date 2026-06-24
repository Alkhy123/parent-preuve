1. rgpd/NOTE_GOUVERNANCE_RGPD.md
# Note interne de gouvernance des données – Parent Preuve  
Version 0.1 – en cours de développement

## 1. Contexte et mission

Parent Preuve est une application française, solo, factuelle et prudente, destinée à aider un parent séparé à transformer les faits du quotidien (faits, frais, pension, preuves photo, documents, courriers, échéances) en un dossier clair, daté, structuré et exportable.

L’objectif est de remettre de l’ordre dans les faits pour que le parent reprenne pied, sans lui dire quoi faire en droit. Parent Preuve n’est pas une application de coparentalité collaborative : elle s’adresse à un seul parent qui constitue un dossier factuel.

Contraintes absolues :

- outil SOLO ;
- strictement factuel ;
- jamais de conseil juridique ;
- l’IA propose, l’utilisateur valide ;
- pas de promesse de preuve irréfutable ni de recevabilité garantie ;
- pas de prédiction judiciaire ni de conclusions automatiques ;
- respect du RGPD et des données sensibles.

La présente note décrit la gouvernance générale des données en attendant la finalisation de l’application et sera amenée à évoluer.

## 2. Responsable de traitement

Responsable de traitement :

- Nom / prénom : Anthony Magny  
- Statut : entrepreneur individuel (micro-entreprise)  
- Adresse : [À COMPLÉTER]  
- SIREN / SIRET : [À COMPLÉTER]  
- E-mail de contact : alkhyomgame@gmail.com  

Anthony Magny est responsable des traitements de données personnelles mis en œuvre via Parent Preuve.

## 3. Stack technique et principaux sous-traitants

### 3.1. Architecture

- Frontend / API : Next.js (App Router), React, TypeScript, déployés sur Vercel.
- Backend de données : Supabase (PostgreSQL + Auth + Storage), avec RLS activée partout et buckets privés pour les fichiers.
- IA : Mistral, appels `chat/completions` et OCR depuis le serveur uniquement, via `MISTRAL_API_KEY` (jamais exposée côté client).

Les secrets sensibles (HORODATAGE_SECRET, MISTRAL_API_KEY, SUPABASE_SERVICE_ROLE_KEY) sont stockés uniquement côté serveur / environnement et ne sont jamais exposés dans le code client.

### 3.2. Sous-traitants principaux

- Supabase : hébergement de la base PostgreSQL, authentification et stockage de fichiers, en région UE (`eu-west-1` – Irlande).
- Vercel : hébergement du frontend et des routes API (région Paris pour le front).
- Mistral AI : fournisseur des briques IA (reformulation, extraction, OCR, copilote), appelé uniquement côté serveur avec consentement spécifique de l’utilisateur.

Avant ouverture large / monétisation, la signature d’un DPA (Data Processing Agreement) avec Mistral et l’activation de la zone de données régionale (ZDR) UE sont prévues comme prérequis.

Un prestataire de paiement (non encore choisi) sera ajouté ultérieurement au registre en tant que sous-traitant pour la facturation / encaissement.

## 4. Typologie de données traitées

Parent Preuve manipule potentiellement :

- identité du parent utilisateur (compte, coordonnées) ;
- identité de l’autre parent ;
- identité des enfants ;
- décisions judiciaires (jugements, ordonnances, conventions homologuées) ;
- frais médicaux ou scolaires (factures, justificatifs) ;
- données de localisation ;
- photos ;
- documents (PDF, scans, etc.) ;
- messages / contenus textuels saisis ;
- factures, reçus et justificatifs ;
- événements familiaux conflictuels ;
- données concernant des tiers (enseignants, médecins, etc.).

Ces données concernent des enfants et des situations familiales conflictuelles : le niveau de risque potentiel pour les droits et libertés est évalué comme élevé, ce qui justifie la tenue d’un registre et la réalisation d’une AIPD / DPIA.

## 5. Principes de protection et règles de conception

Règles de conception invariantes :

### 5.1. Minimisation

- seules les données nécessaires à l’organisation du dossier sont collectées ;
- avertissement spécifique envisagé avant le dépôt de justificatifs médicaux.

### 5.2. Sécurité technique

- RLS activée sur 100 % des tables Supabase ;
- buckets de stockage (preuves, documents) en mode privé ;
- pas de stockage public de documents sensibles ;
- pas d’UPDATE sur les objets Storage pour certaines preuves (originaux scellés) ;
- hash serveur sur les photos de preuve, horodatage interne signé par HORODATAGE_SECRET ;
- accès en HTTPS uniquement.

### 5.3. IA encadrée

- consentement IA clair et granulaire par fonctionnalité ;
- possibilité de désactiver l’IA et d’utiliser l’app sans elle ;
- pas de document envoyé à l’IA sans action explicite de l’utilisateur ;
- l’IA ne fait qu’aider à reformuler, extraire et préparer des brouillons ; elle ne :
  - donne pas de conseil juridique ;
  - ne prédit pas l’issue d’une procédure ;
  - ne rédige pas de conclusions prêtes à déposer ;
  - ne promet pas la recevabilité d’une preuve.

### 5.4. Journaux et quotas

- journalisation prudente des appels IA (quota par utilisateur, type de modèle, horodatage, mais pas de contenu sensible inutile) ;
- projet de table `audit_log` en append-only pour tracer les actions sensibles (création / modification / archivage / suppression / export / horodatage / vérification de hash).

### 5.5. Suppression de compte

- possibilité pour l’utilisateur de supprimer son compte ;
- suppression associée des fichiers et données de dossier, conformément à la politique de confidentialité.

## 6. Documents RGPD internes prévus

- Registre des activités de traitement (modèle CNIL, 5–6 fiches couvrant comptes, dossiers parentaux, IA, preuves, logs, facturation).
- AIPD / DPIA Parent Preuve (description des risques et mesures, à finaliser avant ouverture commerciale large).
- Procédures internes simplifiées :
  - gestion des demandes de droits (accès, rectification, effacement, opposition, limitation, portabilité) ;
  - gestion des incidents / violations de données ;
  - revue périodique de la conformité.

## 7. Engagement de mise à jour

Cette note est une version 0.1 adaptée à une application encore en développement.

Elle sera :

- mise à jour avant l’ouverture au public payant, pour refléter l’état réel du code, des flux et des sous-traitants ;
- revue au moins une fois par an ;
- révisée à chaque ajout de fonctionnalité IA importante (niveaux avancés du Copilote, email suivi, LRE, ligne dédiée, etc.).