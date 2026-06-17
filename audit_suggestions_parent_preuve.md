# Audit & suggestions d’amélioration – Parent Preuve

## Objectif du document

Ce document regroupe les suggestions issues de l’audit du dépôt Git `parent-preuve` et de la comparaison avec les fonctionnalités importantes observées dans les applications de coparentalité, de gestion de preuves et d’organisation de dossier familial.

L’objectif n’est pas d’ajouter des fonctionnalités “gadgets”, mais de renforcer :

- la fiabilité technique ;
- la valeur juridique des preuves ;
- la sécurité des données ;
- la conformité RGPD ;
- l’utilité quotidienne de l’application ;
- la crédibilité auprès d’un avocat, d’un parent ou d’un juge aux affaires familiales.

---

# 1. Résumé global de l’audit

Parent Preuve est déjà plus avancée qu’un simple MVP.

L’application semble déjà contenir ou prévoir :

- authentification Supabase ;
- procédures cloisonnées ;
- règles de sécurité RLS annoncées ;
- journal factuel ;
- gestion des frais ;
- suivi de pension alimentaire ;
- documents ;
- courriers ;
- preuves photo ;
- empreinte SHA-256 ;
- horodatage interne ;
- export PDF ;
- note de synthèse ;
- extraction IA du jugement ;
- reformulation IA prudente ;
- calendrier de garde ;
- PWA ;
- suppression de compte.

Le positionnement actuel est pertinent : Parent Preuve n’est pas une messagerie entre parents, mais un outil personnel de constitution, d’organisation et d’export d’un dossier factuel.

Le meilleur axe d’amélioration est donc :

> renforcer la traçabilité, la vérifiabilité, la sécurité et la qualité des exports plutôt que copier les applications de coparentalité classiques.

---

# 2. Points forts actuels

## 2.1 Architecture technique cohérente

Stack constatée :

- Next.js ;
- TypeScript ;
- Supabase ;
- Mistral côté serveur ;
- jsPDF / pdf-lib ;
- PWA ;
- déploiement Vercel.

Cette architecture est cohérente pour une application web moderne avec authentification, données personnelles, exports PDF et IA.

## 2.2 IA bien cadrée

Le module IA semble respecter plusieurs bonnes pratiques :

- clé Mistral gardée côté serveur ;
- routes IA protégées par authentification ;
- quota IA prévu ;
- prompt prudent ;
- reformulation minimale ;
- interdiction d’inventer des faits ;
- pas de conseil juridique automatisé.

C’est très important, car une application de ce type peut facilement tomber dans le conseil juridique automatisé non maîtrisé.

## 2.3 Module preuve photo déjà intéressant

Le module preuve photo semble déjà intégrer :

- fichier photo ;
- hash SHA-256 ;
- métadonnées ;
- date appareil ;
- date serveur ;
- GPS ;
- précision GPS ;
- stockage privé ;
- rapport PDF ;
- horodatage HMAC interne.

C’est une très bonne base pour un MVP.

## 2.4 PWA prudente

Le service worker semble éviter de mettre en cache les routes sensibles :

- API ;
- Supabase ;
- Mistral ;
- données personnelles.

C’est une excellente décision pour une application qui manipule des données familiales, judiciaires ou médicales.

---

# 3. Corrections techniques prioritaires

## Priorité critique 1 – Corriger l’incohérence de variable d’environnement

### Problème

Le README semble mentionner une variable du type :

```env
HMAC_SECRET=...
```

Alors que la route d’horodatage semble utiliser :

```env
HORODATAGE_SECRET=...
```

### Risque

Sur un nouveau PC ou en production Vercel, l’horodatage peut échouer simplement parce que la mauvaise variable est configurée.

### Correction recommandée

Choisir un seul nom officiel, par exemple :

```env
HORODATAGE_SECRET=...
```

Puis mettre à jour :

- le code ;
- le README ;
- `.env.example` ;
- Vercel ;
- la documentation Claude/Cursor.

### Tâche Claude/Cursor

```txt
Vérifie toutes les occurrences de HMAC_SECRET et HORODATAGE_SECRET dans le dépôt.
Unifie le nom de variable en HORODATAGE_SECRET.
Mets à jour le README, .env.example et les routes concernées.
Assure-toi que l’application échoue proprement si la variable n’est pas configurée.
```

---

## Priorité critique 2 – Ajouter un dossier de migrations Supabase

### Problème

Le dépôt ne semble pas contenir de dossier clair :

```txt
supabase/migrations/
```

ou de fichiers SQL permettant de vérifier :

- tables ;
- colonnes ;
- enums ;
- contraintes ;
- index ;
- foreign keys ;
- policies RLS ;
- policies Storage.

### Risque

Sans migrations, il est difficile de :

- réinstaller le projet proprement ;
- auditer la sécurité ;
- versionner les évolutions ;
- vérifier que les données sont bien cloisonnées par utilisateur ;
- monétiser sérieusement l’application ;
- faire auditer le projet par un développeur externe.

### Correction recommandée

Créer :

```txt
supabase/
  migrations/
    001_init_schema.sql
    002_rls_policies.sql
    003_storage_policies.sql
    004_indexes.sql
```

### Contenu à inclure

Les migrations doivent contenir au minimum :

- table `procedures` ;
- table `evenements` ;
- table `frais` ;
- table `pensions` ;
- table `documents` ;
- table `preuves_photo` ;
- table `ia_appels` ;
- table `audit_log` ;
- table `user_profiles` si utilisée ;
- policies RLS pour chaque table ;
- policies Storage pour les buckets privés ;
- index sur `user_id`, `procedure_id`, `created_at`.

### Tâche Claude/Cursor

```txt
Crée un dossier supabase/migrations.
Génère les fichiers SQL permettant de recréer tout le schéma Supabase utilisé par l’application.
Ajoute les policies RLS nécessaires pour garantir qu’un utilisateur ne peut lire, créer, modifier ou supprimer que ses propres données.
Ajoute aussi les policies Storage nécessaires pour les fichiers privés.
```

---

## Priorité critique 3 – Vérifier l’insertion du quota IA

### Problème

Le système de quota IA semble vérifier si l’utilisateur peut appeler l’IA, puis insérer une ligne dans `ia_appels`.

Mais l’insertion ne semble pas suffisamment contrôlée.

### Risque

Si l’insert échoue, un utilisateur pourrait consommer l’IA sans que l’appel soit comptabilisé.

### Correction recommandée

Après l’insert, vérifier explicitement l’erreur.

Exemple :

```ts
const { error: insertError } = await supabase
  .from("ia_appels")
  .insert({ fonctionnalite });

if (insertError) {
  return {
    autorise: false,
    resteSecondes: fenetreSecondes,
  };
}
```

### Tâche Claude/Cursor

```txt
Renforce lib/quotaIa.ts.
Après chaque insert dans ia_appels, vérifie si une erreur est retournée.
Si l’insert échoue, refuse l’appel IA par sécurité.
Ajoute un log serveur non sensible pour diagnostiquer le problème.
```

---

## Priorité critique 4 – Revoir la suppression de compte

### Problème

La route de suppression de compte supprime plusieurs tables mais la table `procedures` ne semble pas explicitement supprimée dans la liste des tables utilisateur.

### Risque

Si la suppression Auth échoue ou si une dépendance bloque, certaines données peuvent rester.

### Correction recommandée

Ajouter explicitement `procedures` dans la suppression, en respectant l’ordre des dépendances.

### Tâche Claude/Cursor

```txt
Audite app/api/compte/supprimer/route.ts.
Vérifie que toutes les tables contenant des données utilisateur sont supprimées.
Ajoute procedures si elle manque.
Assure-toi que l’ordre de suppression respecte les dépendances foreign key.
Ajoute des tests ou une fonction de vérification pour éviter les oublis futurs.
```

---

## Priorité critique 5 – Recalculer le hash côté serveur

### Problème

Le hash SHA-256 est calculé côté navigateur.

C’est utile, mais le hash côté client ne prouve pas totalement que le fichier stocké côté serveur est exactement celui attendu.

### Correction recommandée

Ajouter un recalcul serveur de l’empreinte du fichier réellement stocké.

### Champs recommandés

Dans la table `preuves_photo` :

```txt
empreinte_sha256_client
empreinte_sha256_serveur
hash_verifie
hash_verifie_at
```

### Logique recommandée

1. L’utilisateur sélectionne la photo.
2. Le navigateur calcule le hash client.
3. Le fichier est envoyé au stockage privé.
4. Le serveur récupère le fichier stocké.
5. Le serveur recalcule le hash.
6. Le serveur compare les deux empreintes.
7. Le rapport PDF indique le résultat.

### Affichage dans le rapport PDF

```txt
Empreinte calculée côté appareil : ...
Empreinte recalculée côté serveur : ...
Vérification : conforme / non conforme
Date de vérification serveur : ...
```

### Tâche Claude/Cursor

```txt
Renforce le module preuve photo.
Ajoute un recalcul serveur du hash SHA-256 après upload.
Compare le hash client et le hash serveur.
Stocke les deux empreintes et un booléen hash_verifie.
Affiche cette information dans le rapport PDF de preuve.
```

---

# 4. Fonctionnalités importantes à ajouter

## Priorité 1 – QR code de vérification des preuves

### Pourquoi c’est important

C’est probablement la fonctionnalité la plus utile à ajouter rapidement.

Aujourd’hui, un PDF exporté peut être transmis, mais la personne qui le reçoit ne peut pas facilement vérifier :

- que la preuve existe réellement dans l’application ;
- que le hash correspond ;
- que le rapport n’a pas été modifié ;
- que l’horodatage affiché correspond bien aux données enregistrées.

### Fonctionnalité proposée

Créer une route :

```txt
/preuves/verifier/[id]
```

ou :

```txt
/api/preuves/verifier/[token]
```

Chaque rapport PDF contiendrait un QR code pointant vers cette page.

### Données affichées sur la page de vérification

Afficher seulement les informations nécessaires :

```txt
Statut de vérification : authentique / modifié / introuvable
Identifiant de preuve
Empreinte SHA-256
Date serveur
Date d’horodatage
Statut d’horodatage
Nom du fichier
Taille du fichier
Type MIME
Hash vérifié côté serveur : oui / non
```

### Attention RGPD

Ne pas afficher publiquement :

- nom complet de l’enfant ;
- nom complet de l’autre parent ;
- adresse ;
- commentaire sensible ;
- photo originale ;
- document judiciaire.

Utiliser un token de vérification non devinable.

### Exemple de modèle

```txt
Ce rapport peut être vérifié à l’adresse suivante :
https://parent-preuve.fr/preuves/verifier/xxxxxxxx

Ou en scannant le QR code ci-dessous.
```

### Tâche Claude/Cursor

```txt
Ajoute une fonctionnalité de vérification des preuves par QR code.
Chaque preuve doit avoir un token public non devinable.
Crée une page /preuves/verifier/[token] affichant uniquement les métadonnées minimales de vérification.
Ajoute un QR code dans le rapport PDF de preuve.
Ne jamais exposer la photo originale ni les données sensibles sur la page publique.
```

---

## Priorité 2 – Horodatage eIDAS qualifié

### Situation actuelle

L’application utilise un horodatage interne HMAC non qualifié.

C’est utile pour renforcer la traçabilité, mais ce n’est pas équivalent à un horodatage qualifié eIDAS.

### Fonctionnalité proposée

Prévoir une architecture permettant d’ajouter plus tard un prestataire d’horodatage qualifié.

### Statuts possibles

```txt
interne_non_qualifie
qualifie_en_attente
qualifie_valide
qualifie_echec
```

### Texte prudent à afficher

```txt
Horodatage interne non qualifié :
cet horodatage renforce la traçabilité interne mais ne constitue pas un horodatage qualifié au sens du règlement eIDAS.

Horodatage qualifié :
lorsqu’il est disponible, il est délivré par un prestataire de confiance qualifié et bénéficie d’une présomption d’exactitude de la date et d’intégrité des données liées.
```

### Tâche Claude/Cursor

```txt
Prépare le modèle de données pour supporter un futur horodatage eIDAS qualifié.
Ajoute un champ type_horodatage et un champ statut_horodatage.
Adapte les rapports PDF pour distinguer clairement l’horodatage interne non qualifié et l’horodatage qualifié.
Ne prétends jamais qu’un horodatage interne équivaut à un constat ou à un horodatage qualifié.
```

---

## Priorité 3 – Journal d’audit immuable

### Pourquoi c’est important

Pour un dossier familial, il faut pouvoir montrer :

- quand une donnée a été créée ;
- si elle a été modifiée ;
- quand elle a été exportée ;
- si une preuve a été archivée ;
- si un document a été supprimé.

### Table proposée

```sql
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  procedure_id uuid references procedures(id) on delete cascade,
  objet_type text not null,
  objet_id uuid,
  action text not null,
  hash_avant text,
  hash_apres text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

### Actions possibles

```txt
creation
modification
archivage
suppression
export_pdf
export_zip
horodatage
verification_hash
```

### Tâche Claude/Cursor

```txt
Ajoute un journal d’audit audit_log.
Chaque création, modification, suppression, archivage et export important doit créer une ligne d’audit.
Le journal doit être append-only : aucune modification ni suppression par l’utilisateur.
Ajoute les RLS nécessaires pour que l’utilisateur puisse lire son journal mais pas le modifier directement.
```

---

## Priorité 4 – Indexation automatique de la pension alimentaire

### Pourquoi c’est important

C’est une fonctionnalité très utile pour les parents en France.

L’utilisateur pourrait renseigner :

- montant initial ;
- date du jugement ;
- indice prévu dans le jugement ;
- date annuelle de revalorisation ;
- montant payé chaque mois.

L’application calculerait automatiquement :

- pension revalorisée ;
- montant dû ;
- montant payé ;
- reste dû ;
- retard éventuel.

### Interface proposée

```txt
Pension initiale : 180 €
Date du jugement : 17/06/2025
Date de revalorisation annuelle : 1er janvier
Indice utilisé : indice des prix à la consommation
Montant théorique actualisé : ...
Montant payé : ...
Écart : ...
```

### Exports

Ajouter dans les exports :

```txt
Tableau annuel de pension
Montant dû
Montant payé
Reste dû
Historique des paiements
Retards
Graphique simple
```

### Tâche Claude/Cursor

```txt
Ajoute un module d’indexation de pension alimentaire.
Permets de saisir le montant initial, la date du jugement, l’indice de référence et la date annuelle de revalorisation.
Calcule le montant revalorisé automatiquement.
Ajoute un tableau comparatif dû / payé / reste dû.
Ajoute l’export PDF et CSV.
```

---

## Priorité 5 – Calendrier enrichi avec vacances scolaires et jours fériés

### Pourquoi c’est important

Le calendrier de garde devient beaucoup plus utile s’il tient compte :

- des vacances scolaires ;
- des zones académiques ;
- des jours fériés ;
- des périodes de garde ;
- des conflits d’agenda.

### Fonctionnalités proposées

```txt
Choix de la zone scolaire : A / B / C
Import automatique des vacances scolaires
Affichage des jours fériés
Détection des conflits entre deux obligations
Export iCal en lecture seule
Rappels locaux
```

### Exemple de conflit à détecter

```txt
L’utilisateur doit déposer un enfant à 10h à un lieu A
et être à 10h au même moment dans un lieu B.
```

L’application pourrait afficher :

```txt
Conflit détecté : deux obligations sont prévues le même jour à la même heure.
```

### Tâche Claude/Cursor

```txt
Améliore le calendrier de garde.
Ajoute les vacances scolaires françaises par zone.
Ajoute les jours fériés français.
Ajoute une détection des conflits d’horaires.
Ajoute un export iCal en lecture seule.
```

---

## Priorité 6 – Registre des demandes de modification de garde

### Pourquoi c’est important

Parent Preuve étant une application solo, il vaut mieux éviter une messagerie directe entre parents.

En revanche, il est très utile d’avoir un registre factuel des demandes.

### Fonctionnalité proposée

Créer un module :

```txt
Demandes de modification
```

### Champs recommandés

```txt
Date de la demande
Type : échange de week-end / horaire / vacances / lieu / autre
Canal : SMS / mail / oral / recommandé / application / autre
Demande formulée
Réponse obtenue
Statut : acceptée / refusée / sans réponse / en attente
Date de réponse
Pièce liée
Conséquence pratique
Commentaire factuel
```

### Exemple

```txt
Le 12/06/2026, demande de modification du lieu de remise.
Canal : mail.
Réponse : refusée.
Pièce liée : capture du mail.
Conséquence : impossibilité d’organisation maintenue.
```

### Tâche Claude/Cursor

```txt
Ajoute un module registre des demandes de modification de garde.
Il doit permettre d’enregistrer les demandes, le canal utilisé, la réponse, le statut et les pièces liées.
Ajoute un filtre par période et un export PDF.
Le ton doit rester factuel, sans accusation automatique.
```

---

## Priorité 7 – Check-in géolocalisé d’échange

### Pourquoi c’est important

L’utilisateur peut avoir besoin de prouver qu’il était présent :

- au lieu de remise ;
- à l’heure prévue ;
- avec une marge raisonnable ;
- malgré l’absence ou le retard de l’autre parent.

### Fonctionnalité proposée

Ajouter un bouton :

```txt
Je suis au lieu de remise
```

### Données enregistrées

```txt
Date serveur
Date appareil
Écart heure appareil / serveur
Latitude
Longitude
Précision GPS
Adresse approximative si disponible
Photo optionnelle du lieu
Commentaire factuel court
```

### Rapport PDF

Le rapport pourrait s’appeler :

```txt
Relevé de présence horodaté
```

À éviter :

```txt
Constat
Certificat légal
Preuve irréfutable
```

### Tâche Claude/Cursor

```txt
Ajoute un module check-in géolocalisé pour les remises d’enfant.
Le bouton doit enregistrer la date serveur, la date appareil, les coordonnées GPS, la précision et un commentaire optionnel.
Permets de générer un rapport PDF de présence.
Utilise un vocabulaire prudent : relevé de présence, pas constat.
```

---

## Priorité 8 – Carnet d’informations enfant

### Pourquoi c’est important

Ce module rendrait l’application utile même en dehors du conflit.

### Données possibles

```txt
École
Classe
Enseignant
Médecin traitant
Allergies
Traitements
Contacts d’urgence
Activités extrascolaires
Taille vêtements
Pointure
Documents importants
Informations administratives
```

### Attention particulière

Ce module peut contenir des données sensibles, notamment des données de santé.

Il faut donc :

- minimiser les données ;
- expliquer pourquoi elles sont stockées ;
- permettre leur suppression ;
- éviter tout partage public ;
- protéger les exports ;
- ne pas les envoyer inutilement à l’IA.

### Tâche Claude/Cursor

```txt
Ajoute un carnet d’informations enfant.
Prévois des champs utiles au quotidien : école, médecin, allergies, contacts d’urgence, activités, informations administratives.
Les données de santé doivent être clairement identifiées comme sensibles.
Elles ne doivent jamais être envoyées à l’IA sans action explicite de l’utilisateur.
```

---

## Priorité 9 – Mode dossier audience

### Pourquoi c’est important

L’application doit pouvoir aider l’utilisateur à préparer rapidement un dossier clair pour une audience ou un rendez-vous avocat.

### Fonctionnalité proposée

Créer un écran :

```txt
Dossier audience
```

### Contenu

```txt
1. Résumé de la procédure
2. Points de conflit principaux
3. Chronologie filtrée
4. Pension : dû / payé / retard
5. Frais : demandé / payé / reste dû
6. Demandes de modification de garde
7. Preuves photo
8. Documents importants
9. Bordereau de pièces
10. Points à faire relire par avocat
```

### Export

```txt
dossier_audience.pdf
```

### Tâche Claude/Cursor

```txt
Ajoute un mode dossier audience.
L’utilisateur doit pouvoir sélectionner une période, des catégories et des pièces.
Génère un PDF structuré avec résumé, chronologie, frais, pension, demandes, preuves et bordereau.
Le document doit rester factuel et ne pas rédiger de conclusions juridiques à la place de l’utilisateur.
```

---

## Priorité 10 – Export avocat ZIP

### Pourquoi c’est important

Un avocat ou un utilisateur a besoin d’un dossier complet, structuré et facile à transmettre.

### Fonctionnalité proposée

Créer un export ZIP contenant :

```txt
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

### Exemple de `manifest.json`

```json
{
  "export_id": "uuid",
  "generated_at": "2026-06-17T10:00:00Z",
  "procedure_id": "uuid",
  "files": [
    {
      "path": "chronologie.pdf",
      "sha256": "...",
      "type": "application/pdf"
    }
  ]
}
```

### Tâche Claude/Cursor

```txt
Ajoute un export avocat ZIP.
Le ZIP doit contenir les principaux PDF, les preuves, les documents et un manifest.json.
Ajoute aussi un fichier hashes_sha256.txt listant l’empreinte de chaque fichier.
L’objectif est de faciliter la transmission à un avocat tout en renforçant l’intégrité du dossier.
```

---

# 5. Fonctionnalités secondaires utiles

## 5.1 Export CSV

Ajouter un export CSV pour :

- événements ;
- frais ;
- pensions ;
- demandes ;
- preuves ;
- documents.

Très utile pour analyse, avocat, comptable ou comparaison.

## 5.2 Filtres avancés

Ajouter des filtres par :

- enfant ;
- procédure ;
- période ;
- catégorie ;
- gravité ;
- statut ;
- pièce liée ;
- paiement complet / partiel / absent ;
- preuve horodatée / non horodatée.

## 5.3 Tags personnalisés

Permettre à l’utilisateur d’ajouter des tags :

```txt
retard
santé
école
pension
frais
vacances
violence
communication
remise enfant
```

## 5.4 Pièces favorites

Permettre de marquer certaines pièces comme importantes pour les retrouver rapidement.

## 5.5 Tableau de bord mensuel

Créer un écran :

```txt
Résumé du mois
```

Avec :

```txt
Nombre d’événements
Frais demandés
Frais payés
Pension due
Pension reçue
Retards
Preuves ajoutées
Documents ajoutés
```

## 5.6 Aide à la rédaction factuelle

Ajouter une aide intégrée pour transformer :

```txt
Il fait toujours exprès de me provoquer
```

en :

```txt
Le 12 juin 2026 à 18h30, l’autre parent n’a pas respecté l’horaire prévu de remise. L’enfant a été remis à 19h10.
```

Attention : toujours garder le contrôle utilisateur et éviter les affirmations juridiques.

---

# 6. Fonctionnalités à éviter pour l’instant

## 6.1 Messagerie directe entre parents

À éviter au stade actuel.

### Pourquoi

Une messagerie directe implique :

- gestion des deux parents ;
- invitations ;
- acceptation ;
- modération ;
- conflits ;
- notifications ;
- conservation probatoire ;
- export des messages ;
- demandes RGPD plus complexes ;
- risque d’escalade entre parents.

Parent Preuve est plus original et plus simple en restant un outil solo.

## 6.2 Assistant juridique automatisé

À éviter dans une version grand public.

### Risque

Un assistant qui dit :

```txt
Vous devez saisir le JAF
```

ou :

```txt
Votre preuve sera recevable
```

peut créer un risque important.

### Formulation préférable

```txt
Cette information peut être utile à organiser dans votre dossier.
Faites vérifier votre situation par un avocat ou un professionnel du droit.
```

## 6.3 Promesses excessives sur les preuves

À éviter absolument :

```txt
Preuve incontestable
Constat numérique
Valeur juridique garantie
Certifié huissier
Recevable automatiquement
```

Préférer :

```txt
Rapport horodaté
Traçabilité renforcée
Empreinte numérique
Éléments d’organisation du dossier
Document à faire vérifier par un professionnel
```

---

# 7. Sécurité et RGPD

## 7.1 Données sensibles

L’application peut contenir :

- données de mineurs ;
- données familiales ;
- données judiciaires ;
- données de santé ;
- documents administratifs ;
- coordonnées GPS ;
- photos ;
- informations financières.

Il faut donc appliquer une approche prudente.

## 7.2 Mesures recommandées

### Minimisation

Ne collecter que les données nécessaires.

### Cloisonnement

Chaque utilisateur ne doit accéder qu’à ses propres données.

### RLS obligatoire

Toutes les tables contenant des données utilisateur doivent avoir RLS activée.

### Storage privé

Les fichiers doivent rester dans des buckets privés.

### URLs signées courtes

Éviter les liens publics permanents vers les fichiers.

### IA limitée

Ne jamais envoyer de données sensibles à l’IA sans action explicite.

### Suppression de compte

La suppression doit être complète et vérifiable.

### Export sécurisé

Prévoir un avertissement avant export :

```txt
Attention : ce fichier peut contenir des données personnelles et sensibles.
Conservez-le dans un espace sécurisé.
```

---

# 8. Roadmap recommandée

## Sprint 1 – Fiabilisation technique

Objectif : corriger les points bloquants avant d’ajouter de nouvelles fonctionnalités.

Tâches :

- corriger `HORODATAGE_SECRET` ;
- ajouter `.env.example` ;
- ajouter migrations Supabase ;
- corriger quota IA ;
- revoir suppression de compte ;
- ajouter tests sur les fonctions critiques ;
- vérifier les imports et routes sensibles ;
- auditer les policies RLS.

## Sprint 2 – Renforcement des preuves

Objectif : rendre les preuves plus solides et vérifiables.

Tâches :

- recalcul serveur du hash ;
- page de vérification ;
- QR code dans les PDF ;
- journal d’audit ;
- manifest d’empreintes ;
- statut horodatage ;
- préparation eIDAS.

## Sprint 3 – Utilité quotidienne

Objectif : rendre l’application vraiment utile dans la vie du parent.

Tâches :

- indexation pension ;
- calendrier enrichi ;
- vacances scolaires ;
- jours fériés ;
- registre des demandes de modification ;
- check-in géolocalisé ;
- carnet enfant.

## Sprint 4 – Export et usage avocat

Objectif : permettre à l’utilisateur de transmettre un dossier propre.

Tâches :

- mode dossier audience ;
- export avocat ZIP ;
- bordereau amélioré ;
- filtres avancés ;
- export CSV ;
- chronologie personnalisée.

## Sprint 5 – Préparation monétisation

Objectif : préparer une version commercialisable.

Tâches :

- registre des traitements RGPD ;
- politique de confidentialité ;
- CGU ;
- mentions légales ;
- DPA Mistral ;
- choix clair sur la conservation des données ;
- politique de sauvegarde ;
- audit sécurité externe ;
- tests utilisateurs ;
- page pricing.

---

# 9. Liste priorisée des fonctionnalités à coder

## Niveau 1 – À faire avant ouverture large

1. Migrations Supabase.
2. Correction variable `HORODATAGE_SECRET`.
3. Correction quota IA.
4. Correction suppression de compte.
5. Recalcul serveur du hash.
6. RLS vérifiées et documentées.
7. `.env.example`.
8. Avertissements RGPD/export.
9. Tests des fonctions critiques.
10. Page confidentialité claire.

## Niveau 2 – Très forte valeur ajoutée

1. QR code de vérification.
2. Page publique de vérification limitée.
3. Journal d’audit.
4. Export avocat ZIP.
5. Manifest SHA-256.
6. Mode dossier audience.
7. Indexation pension.
8. Registre demandes de modification.
9. Check-in géolocalisé.
10. Vacances scolaires / jours fériés.

## Niveau 3 – Amélioration UX

1. Tableau de bord mensuel.
2. Tags personnalisés.
3. Filtres avancés.
4. Pièces favorites.
5. Export CSV.
6. Aide à la rédaction factuelle.
7. Carnet enfant.
8. Rappels locaux.
9. Export iCal.
10. Recherche globale.

---

# 10. Prompts prêts à donner à Claude/Cursor

## Prompt 1 – Audit sécurité Supabase

```txt
Tu es développeur senior Next.js/Supabase.
Audit le projet Parent Preuve.

Objectif :
vérifier que toutes les données utilisateur sont correctement protégées par RLS et par des buckets privés.

Tâches :
1. Liste toutes les tables utilisées dans le code.
2. Vérifie que chaque table contient user_id ou est reliée à une procédure appartenant à l’utilisateur.
3. Génère les migrations SQL manquantes.
4. Ajoute les policies RLS nécessaires.
5. Ajoute les policies Storage nécessaires.
6. Signale toute route API qui pourrait exposer des données d’un autre utilisateur.
7. Ne modifie pas l’UX, concentre-toi sur la sécurité.
```

## Prompt 2 – Renforcement preuve photo

```txt
Tu es développeur senior Next.js/Supabase spécialisé en preuve numérique.
Renforce le module preuve photo de Parent Preuve.

Objectif :
améliorer la traçabilité et l’intégrité des preuves photo.

Tâches :
1. Ajoute un recalcul serveur du hash SHA-256 du fichier stocké.
2. Compare le hash client et le hash serveur.
3. Stocke les deux empreintes.
4. Ajoute un booléen hash_verifie.
5. Ajoute une page de vérification par token non devinable.
6. Ajoute un QR code dans le PDF de preuve.
7. N’expose jamais la photo originale sur la page de vérification.
8. Utilise un vocabulaire prudent : rapport, empreinte, horodatage interne, jamais constat.
```

## Prompt 3 – Export avocat ZIP

```txt
Tu es développeur senior Next.js.
Ajoute un export avocat ZIP à Parent Preuve.

Objectif :
permettre à l’utilisateur de transmettre un dossier propre à son avocat.

Le ZIP doit contenir :
- note_synthese.pdf ;
- chronologie.pdf ;
- bordereau_pieces.pdf ;
- pension.pdf si disponible ;
- frais.pdf si disponible ;
- dossier preuves ;
- dossier documents ;
- manifest.json ;
- hashes_sha256.txt.

Chaque fichier doit être listé avec son empreinte SHA-256.
Ajoute un avertissement indiquant que l’export peut contenir des données personnelles sensibles.
```

## Prompt 4 – Dossier audience

```txt
Tu es développeur produit et développeur Next.js.
Ajoute un mode dossier audience à Parent Preuve.

Objectif :
aider l’utilisateur à préparer un dossier factuel pour une audience ou un rendez-vous avocat.

Le mode doit permettre :
1. de choisir une procédure ;
2. de choisir une période ;
3. de sélectionner les catégories à inclure ;
4. de sélectionner les pièces importantes ;
5. de générer un PDF structuré.

Le PDF doit contenir :
- résumé de la procédure ;
- chronologie ;
- frais ;
- pension ;
- demandes de modification ;
- preuves ;
- documents ;
- bordereau de pièces.

Ne génère pas de conseil juridique.
Reste factuel.
```

## Prompt 5 – Registre des demandes de modification de garde

```txt
Tu es développeur Next.js.
Ajoute un module registre des demandes de modification de garde.

Champs :
- date de demande ;
- type de demande ;
- canal ;
- contenu factuel ;
- réponse ;
- statut ;
- date de réponse ;
- pièce liée ;
- conséquence pratique ;
- commentaire.

Ajoute :
- filtres ;
- export PDF ;
- lien avec la chronologie ;
- lien avec les pièces.

Le module doit rester solo : aucune messagerie avec l’autre parent.
```

---

# 11. Conclusion

Parent Preuve a déjà une base solide.

Les priorités ne sont pas d’ajouter une messagerie ou des fonctionnalités sociales, mais de renforcer :

- la preuve ;
- l’horodatage ;
- les exports ;
- la sécurité ;
- les migrations ;
- la conformité ;
- la préparation de dossier.

Les fonctionnalités les plus importantes à développer sont :

1. QR code de vérification des preuves ;
2. recalcul serveur du hash ;
3. journal d’audit ;
4. migrations Supabase ;
5. indexation pension ;
6. registre de demandes de modification ;
7. check-in géolocalisé ;
8. mode dossier audience ;
9. export avocat ZIP ;
10. préparation d’un futur horodatage eIDAS qualifié.

Avec ces améliorations, Parent Preuve peut devenir un outil beaucoup plus crédible, utile et différenciant pour les parents séparés qui souhaitent organiser un dossier factuel sans tomber dans le conseil juridique automatisé.
