---
name: parent-preuve-error-ux
description: À utiliser pour concevoir ou améliorer les messages d’erreur, états vides, erreurs API, erreurs PDF, erreurs IA, erreurs Supabase et erreurs d’upload.
---

# Error UX — Parent Preuve

## Objectif

Transformer les erreurs techniques en messages compréhensibles, rassurants et utiles pour l’utilisateur.

Parent Preuve est une application sensible. L’utilisateur peut être stressé, non technicien, et manipuler des documents judiciaires. Les erreurs doivent être claires.

## Principes

Un bon message d’erreur doit dire :

1. ce qui s’est passé
2. si les données sont perdues ou non
3. ce que l’utilisateur peut faire
4. si le problème vient du fichier, du réseau ou du service
5. sans exposer d’informations techniques inutiles

## Ton

Le ton doit être :

- calme
- simple
- rassurant
- précis
- non culpabilisant

Éviter :

- “Erreur 500”
- “Internal server error”
- “JSON invalide”
- “RLS policy violation”
- “Unhandled exception”
- “Bad request”

Préférer :

- “L’analyse n’a pas pu être lancée.”
- “Le fichier semble illisible.”
- “La connexion au service IA a échoué.”
- “Vos données n’ont pas été enregistrées.”
- “Vous pouvez réessayer ou utiliser la saisie manuelle.”

## Messages recommandés

### IA indisponible

> L’analyse IA n’a pas pu aboutir pour le moment. Vos informations n’ont pas été enregistrées automatiquement. Vous pouvez réessayer ou saisir les règles manuellement.

### Consentement IA absent

> Pour utiliser cette fonctionnalité, vous devez d’abord accepter l’analyse IA. Vous pourrez retirer ce consentement à tout moment.

### PDF illisible

> Le PDF semble ne pas contenir de texte lisible. Il s’agit peut-être d’un scan. Vous pouvez copier-coller le passage “PAR CES MOTIFS” dans l’analyse manuelle.

### Fichier trop lourd

> Le fichier est trop volumineux. Essayez d’importer une version plus légère ou uniquement les pages utiles du jugement.

### Supabase / sauvegarde impossible

> L’enregistrement n’a pas pu être effectué. Vérifiez votre connexion puis réessayez. Les informations affichées à l’écran ne sont pas validées tant que vous ne les enregistrez pas.

### Horodatage échoué

> La preuve a été enregistrée, mais l’horodatage n’a pas pu être finalisé. Vous pourrez relancer l’horodatage plus tard.

### GPS refusé

> La photo peut être enregistrée sans localisation, mais la preuve sera moins complète. Cette information sera indiquée dans les anomalies.

### Export bloqué

> Le dossier contient des éléments à corriger avant l’export. Vérifiez les alertes ci-dessous.

## Règles sécurité

Ne jamais afficher à l’utilisateur :

- clé API
- stack trace
- contenu brut complet d’une erreur serveur
- SQL
- politique RLS brute
- token
- URL signée sensible
- contenu complet du jugement dans un message d’erreur

## Règles développeur

Côté serveur :

- logger une erreur technique courte
- ne pas logger les données sensibles
- renvoyer un message utilisateur propre
- garder un code HTTP adapté

Côté client :

- afficher un message clair
- préserver les champs saisis si possible
- éviter de vider le formulaire après erreur
- proposer une action

## Checklist

Avant de finaliser une fonctionnalité :

- [ ] état chargement prévu ?
- [ ] état vide prévu ?
- [ ] erreur réseau prévue ?
- [ ] erreur serveur prévue ?
- [ ] erreur validation prévue ?
- [ ] message compréhensible ?
- [ ] aucune donnée sensible affichée ?
- [ ] action utilisateur proposée ?
