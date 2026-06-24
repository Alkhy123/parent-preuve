# AIPD / DPIA – Parent Preuve  
Version 0.1 – brouillon en cours de développement

## 1. Présentation du projet

Parent Preuve est une application française, solo, factuelle et prudente, destinée à aider un parent séparé à transformer les faits, frais, pensions, preuves photo, documents, courriers et échéances en un dossier clair, daté, structuré et exportable.

L’application :

- s’adresse à un **seul parent** (outil solo, pas collaboratif) ;
- vise à **réduire la charge mentale** et à montrer l’état du dossier et les étapes factuelles suivantes ;
- ne fournit **aucun conseil juridique** et ne remplace ni un avocat, ni un médiateur, ni un juge, ni un commissaire de justice.

Contexte à risque :

- présence de **données concernant des enfants** ;
- situations de **conflits parentaux** et de procédures devant le JAF ;
- documents judiciaires, photos, données potentiellement sensibles (santé, localisation, etc.).

Cette AIPD est une première version (v0.1) destinée à cadrer les risques et mesures principales avant l’ouverture commerciale large.

## 2. Description des traitements et de l’architecture

### 2.1. Traitements principaux

Les traitements concernés par la présente AIPD sont notamment :

- gestion des comptes et authentification ;
- gestion des dossiers parentaux (journal de faits, frais, pension, documents, preuves, courriers, exports) ;
- fonctionnalités d’IA (reformulation, extraction, copilote factuel) ;
- gestion des preuves photo et de l’horodatage interne ;
- logs techniques, quotas IA et sécurité ;
- facturation / abonnements (prévu).

Chaque traitement est décrit dans le registre des activités de traitement associé.

### 2.2. Architecture technique

- Frontend / API : Next.js (App Router), React, TypeScript, déployés sur Vercel.
- Backend de données : Supabase (PostgreSQL + Auth + Storage), avec RLS activée sur l’ensemble des tables et buckets de stockage configurés en privé.
- IA : Mistral, appelé uniquement côté serveur pour la reformulation, l’extraction, l’OCR et le copilote factuel.

Les variables sensibles (HORODATAGE_SECRET, MISTRAL_API_KEY, SUPABASE_SERVICE_ROLE_KEY) sont stockées côté serveur et ne sont jamais exposées au client.

Les données sont hébergées en Union européenne (Supabase en `eu-west-1` – Irlande). L’usage de la ZDR UE de Mistral est prévu.

## 3. Analyse de nécessité et de proportionnalité

### 3.1. Nécessité des données

Les données traitées sont nécessaires pour :

- permettre au parent de suivre les faits, frais, pensions, documents et preuves liés à sa situation familiale ;
- relier ces informations à des décisions judiciaires et à des personnes (enfants, autre parent) pour constituer un dossier compréhensible ;
- générer des exports (chronologies, notes factuelles, tableaux) utiles pour ses démarches (notamment avec un avocat ou un médiateur) ;
- fournir des fonctionnalités d’IA limitées à la réorganisation factuelle, sans conseil juridique.

Des principes de **minimisation** sont appliqués :

- pas de collecte de données sans lien avec le dossier parental ;
- avertissement envisagé avant le dépôt de justificatifs médicaux ;
- limitation des métadonnées exposées via les fonctions de vérification de preuves (QR, page de vérification).

### 3.2. Proportionnalité

Les traitements sont proportionnés à la finalité :

- les données sont principalement saisies par l’utilisateur lui-même, pour son propre usage ;
- l’application ne recherche pas d’enrichissement externe (pas de croisement avec des bases publiques ou privées) ;
- les fonctionnalités d’IA n’interviennent qu’à la demande expresse de l’utilisateur et dans un cadre strictement factuel.

## 4. Analyse des risques pour les droits et libertés

Les principaux risques identifiés sont :

1. **Atteinte à la vie privée des enfants et du parent**  
   - en cas d’accès non autorisé (fuite, piratage, mauvaise configuration des droits) ;
   - en cas de partage imprudent d’exports contenant des informations sensibles.

2. **Atteinte à la réputation ou à la situation familiale**  
   - si des éléments très sensibles (santé, violences, orientation, etc.) sont exposés à des tiers non autorisés.

3. **Risque d’utilisation inappropriée des résultats IA**  
   - si l’utilisateur interprète des reformulations ou résumés comme du conseil juridique ou comme une évaluation de la recevabilité des preuves.

4. **Risque de confusion sur la valeur probatoire des preuves**  
   - si l’horodatage interne, le hash ou le QR sont compris comme un équivalent de constat de commissaire de justice alors qu’il ne s’agit pas d’un horodatage qualifié.

5. **Risque de collecte excessive via les logs**  
   - si des données sensibles se retrouvent dans les journaux techniques ou les messages d’erreur.

Compte tenu de la présence d’enfants et de situations de conflit, le niveau de risque brut est considéré comme **élevé**, ce qui justifie la mise en place de mesures fortes.

## 5. Mesures envisagées pour réduire les risques

### 5.1. Mesures techniques

- RLS (Row Level Security) activée sur l’ensemble des tables, cloisonnant les données par utilisateur.
- Buckets Supabase Storage en mode privé, sans accès public par défaut.
- Policies Storage interdisant l’UPDATE sur certains fichiers de preuve (originaux scellés).
- Horodatage interne signé par HORODATAGE_SECRET et possibilité de vérification via un QR code n’exposant que des métadonnées minimales.
- Appels IA effectués uniquement côté serveur, avec clé API non exposée.
- Utilisation de HTTPS sur l’ensemble des communications.
- Mise en place envisagée d’une table `audit_log` en append-only pour tracer les actions sensibles.

### 5.2. Mesures organisationnelles

- Règles de vocabulaire : interdiction d’utiliser les termes “assistant juridique”, “avocat IA”, “preuve recevable”, “preuve certifiée”, “équivalent commissaire de justice” dans l’interface et les exports.
- Bannières et avertissements visibles sur les écrans sensibles (preuves, exports, IA), rappelant :
  - que Parent Preuve ne fournit pas de conseil juridique ;
  - que l’horodatage est interne et non qualifié ;
  - que l’IA produit des brouillons à vérifier.
- Procédure interne pour la gestion des demandes de droits (accès, rectification, effacement, opposition, limitation, portabilité).
- Procédure interne de gestion des incidents (détection, qualification, notification CNIL et personnes concernées si nécessaire).

### 5.3. Mesures contractuelles

- Mise en place d’un DPA (contrat de sous-traitance) avec Mistral, incluant :
  - localisation des données en UE (ZDR) ;
  - engagement de non-réutilisation des données à d’autres fins que la fourniture du service.
- Vérification des engagements de Supabase et du futur prestataire de paiement au regard du RGPD.

## 6. Risques résiduels et plan d’action

Après application des mesures prévues, des risques résiduels subsistent notamment :

- erreurs d’interprétation par certains utilisateurs (prise de l’outil pour un service de conseil juridique) ;
- divulgation d’exports à des tiers de manière non maîtrisée par l’utilisateur.

Plan d’action avant ouverture commerciale large :

1. Finaliser et signer les DPA avec les sous-traitants critiques (Mistral, prestataire de paiement) et activer la ZDR UE.  
2. Vérifier en production la correcte application :
   - des règles RLS sur toutes les tables ;
   - de la confidentialité des buckets Storage (aucun accès public intempestif) ;
   - du fonctionnement complet de la suppression de compte.  
3. Finaliser les textes publics (mentions légales, politique de confidentialité, CGU-CGV) pour assurer une totale cohérence entre :
   - ce que fait réellement l’application ;
   - ce qui est annoncé aux utilisateurs.  
4. Documenter la durée de conservation des logs et l’exclure de toute collecte de données sensibles inutiles.

## 7. Mise à jour de l’AIPD

La présente AIPD est une version 0.1 fondée sur un produit encore en développement.

Elle sera :

- finalisée avant l’ouverture au public payant ;
- mise à jour au moins une fois par an ;
- révisée à chaque ajout de fonctionnalité majeure, en particulier :
  - nouvelles capacités du Copilote IA ;
  - ajout d’email suivi ou de LRE ;
  - mise en place d’une ligne dédiée ou de services annexes.
