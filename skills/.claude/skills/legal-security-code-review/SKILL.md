---
name: legal-security-code-review
description: À utiliser pour relire une fonctionnalité Parent Preuve sous l’angle qualité code, sécurité, RGPD, IA et prudence juridique.
---

# Legal & Security Code Review

## Objectif

Relire toute modification importante du projet Parent Preuve selon 5 angles :

1. fonctionnement
2. sécurité
3. RGPD
4. prudence juridique
5. non-régression

## Questions code

- Le code compile-t-il ?
- Les types TypeScript sont-ils cohérents ?
- La logique est-elle au bon endroit ?
- Les fonctions métier sont-elles centralisées ?
- Les erreurs sont-elles gérées ?
- Les messages utilisateur sont-ils clairs ?
- Y a-t-il une duplication inutile ?

## Questions Supabase

- RLS est-elle respectée ?
- `user_id` est-il protégé ?
- La requête filtre-t-elle bien l’utilisateur ?
- Le bucket est-il privé ?
- Les URLs signées expirent-elles vite ?
- Aucune clé service role côté client ?

## Questions IA

- Consentement présent ?
- Sortie IA validée ?
- Pas d’écriture automatique validée ?
- `source='ia'` ?
- `valide=false` ?
- Citations et avertissements ?
- Pas d’inférence ?
- Pas de conseil juridique ?

## Questions RGPD

- Données minimisées ?
- Logs propres ?
- Pas de données de santé envoyées à l’IA ?
- Pas de jugement complet loggé ?
- Suppression/temporaire prévue ?
- Utilisateur informé ?

## Questions juridiques

Interdire les formulations :

- “certifié”
- “recevable automatiquement”
- “preuve incontestable”
- “constat équivalent”
- “abandon de famille” comme conclusion automatique
- “non-représentation d’enfant” comme conclusion automatique
- “pervers narcissique”
- “mauvaise foi” sans source

Préférer :

- “élément factuel”
- “preuve numérique renforcée”
- “à vérifier”
- “soumis à l’appréciation du juge”
- “selon les informations saisies”

## Questions tests

- Test navigateur prévu ?
- Test PowerShell route prévu ?
- Cas d’erreur prévu ?
- Ancienne page encore fonctionnelle ?
- Export encore fonctionnel ?
- Règles IA non validées bien visibles ?

## Format de réponse attendu

Répondre avec :

1. Points OK
2. Risques bloquants
3. Risques non bloquants
4. Corrections proposées
5. Tests à faire
