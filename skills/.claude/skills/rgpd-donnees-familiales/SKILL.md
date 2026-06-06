---
name: rgpd-donnees-familiales
description: À utiliser pour toute fonctionnalité traitant des données sensibles, enfants, jugements, documents, IA, stockage, logs, exports, consentements ou preuves.
---

# RGPD — Données familiales sensibles

## Objectif

Parent Preuve manipule des données très sensibles :

- enfants
- parents séparés
- décisions judiciaires
- jugements
- frais
- pension
- preuves photo
- documents
- données de localisation
- descriptions de conflits familiaux

Cette skill impose une approche de minimisation, consentement, sécurité et transparence.

## Règles générales

Toujours appliquer :

- minimisation des données
- séparation par utilisateur
- consentement explicite pour l’IA
- consentement par fonctionnalité
- stockage privé
- logs minimaux
- suppression/export des données à prévoir
- accès strictement nécessaire

## IA

Avant d’envoyer une donnée à l’IA :

1. vérifier que l’utilisateur a consenti
2. vérifier que la donnée est nécessaire
3. éviter les données de santé
4. éviter les données excessives
5. expliquer ce qui sera envoyé
6. rappeler que l’IA propose seulement

## Données de santé

Mistral n’est pas considéré ici comme un hébergeur HDS.

Donc :

- ne pas envoyer de données médicales à l’IA
- ne pas envoyer de justificatifs médicaux à l’IA
- ne pas demander à l’IA d’interpréter un document médical
- si un document contient des données de santé, avertir l’utilisateur et ne pas l’analyser automatiquement

## Consentements

Le projet utilise `consentements_ia`.

Règle :

- un consentement par fonctionnalité

Exemples :

- `reformulation`
- `extraction`
- `extraction_pdf`

Ne pas réintroduire de colonnes `consentement_ia` dans `dossier`.

## Logs

Interdit de logger :

- texte complet d’un jugement
- contenu d’un PDF
- nom complet des enfants si évitable
- coordonnées GPS précises
- pièces jointes
- données médicales
- clés API
- jetons
- URLs signées

Autorisé :

- type d’erreur
- code HTTP
- taille approximative
- identifiant technique non sensible
- nom de route

## Uploads temporaires

Pour les PDF de jugement :

- préférer traitement en mémoire
- supprimer tout fichier temporaire
- ne pas stocker sans consentement explicite
- ne pas envoyer le PDF brut à l’IA si le texte suffit

## Mentions UX

Afficher des formulations claires :

- “Ce document peut contenir des données sensibles.”
- “Seul le texte nécessaire à l’analyse est traité.”
- “L’IA propose des informations à vérifier.”
- “Aucune proposition n’est validée automatiquement.”
- “Ne transmettez pas de données de santé.”

## Checklist RGPD

Avant validation :

- La donnée est-elle nécessaire ?
- Le consentement est-il prévu ?
- La finalité est-elle claire ?
- Les logs sont-ils propres ?
- Le stockage est-il privé ?
- La suppression est-elle possible ?
- Les données enfants sont-elles protégées ?
