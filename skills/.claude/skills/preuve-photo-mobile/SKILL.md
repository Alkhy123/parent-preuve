---
name: preuve-photo-mobile
description: À utiliser pour les fonctionnalités de preuve photo, capture mobile, horodatage, GPS, stockage, vérification, anomalies et export de preuve.
---

# Preuve photo mobile

## Objectif

Développer les fonctionnalités de preuve photo de Parent Preuve sans promettre une certification juridique absolue.

## Positionnement juridique

Ne jamais dire :

- “photo certifiée comme par commissaire de justice”
- “preuve incontestable”
- “preuve automatiquement recevable”
- “preuve légale garantie”
- “constat numérique équivalent à un constat d’huissier”

Dire plutôt :

- “preuve numérique renforcée”
- “preuve scellée et horodatée”
- “traçabilité renforcée”
- “horodatage non qualifié” ou “qualifié” selon le statut réel
- “soumis à l’appréciation du juge”
- “ne remplace pas un constat de commissaire de justice”

## Données à préserver

Pour chaque preuve photo, préserver autant que possible :

- fichier original non modifié
- nom fichier
- type MIME
- taille
- empreinte SHA-256
- date serveur
- date appareil
- écart date appareil / serveur
- latitude
- longitude
- précision GPS
- métadonnées EXIF disponibles
- anomalies détectées
- statut horodatage
- prestataire horodatage
- algorithme
- chemin Storage privé

## Table cible

Table existante :

- `preuves_photo`

Colonnes clés :

- `storage_path`
- `empreinte_sha256`
- `metadonnees`
- `gps_latitude`
- `gps_longitude`
- `gps_precision_metres`
- `heure_appareil`
- `ecart_heure_secondes`
- `anomalies`
- `horodatage_jeton`
- `horodatage_date`
- `horodatage_statut`
- `horodatage_prestataire`
- `horodatage_algorithme`

## Capture mobile

Pour la future version mobile :

- privilégier capture depuis caméra native
- prévoir un mode “preuve stricte”
- en mode strict, limiter ou bloquer l’import galerie si possible
- demander la permission GPS de manière claire
- ne pas bloquer toute preuve si le GPS est refusé
- signaler les limites dans les anomalies
- envisager détection mock location
- envisager détection root/jailbreak
- prévoir fonctionnement réseau faible

## Anomalies

Exemples d’anomalies à tracer :

- GPS refusé
- GPS indisponible
- précision GPS faible
- date appareil très différente du serveur
- métadonnées EXIF absentes
- fichier importé depuis galerie
- horodatage échoué
- appareil potentiellement rooté/jailbreaké
- localisation simulée suspectée

Une anomalie ne signifie pas que la preuve est fausse. Elle doit être présentée comme un élément de contexte.

## Stockage

- bucket `preuves` privé
- original dans `<user_id>/<preuve_id>/<nom_fichier>`
- URL signée courte pour consultation
- ne jamais rendre public un original
- ne jamais compresser l’original scellé
- les miniatures doivent être séparées de l’original

## Horodatage

Statuts :

- `non_qualifie`
- `a_refaire`
- `qualifie`

Règles :

- actuellement HMAC interne = non qualifié
- ne pas appeler cela eIDAS qualifié
- quand QTSP disponible, remplacer la route serveur sans changer toute l’UI
- prévoir bouton “horodater à nouveau” si statut `a_refaire`

## QR de vérification

Pour une version future :

- générer un QR renvoyant vers une page de vérification
- afficher empreinte SHA-256
- afficher date horodatage
- afficher statut
- ne jamais exposer le fichier original publiquement par défaut

## Checklist

Avant de finaliser :

- original préservé ?
- hash calculé ?
- horodatage fait ?
- GPS géré ?
- anomalies tracées ?
- Storage privé ?
- aucun discours de certification absolue ?
- export PDF cohérent ?
