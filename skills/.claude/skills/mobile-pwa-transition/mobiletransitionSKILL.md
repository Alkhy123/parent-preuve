---
name: mobile-pwa-transition
description: À utiliser pour toute fonctionnalité qui doit rester compatible avec une future version mobile React Native/Expo ou PWA.
---

# Transition mobile / PWA

## Objectif

Parent Preuve est actuellement une application web Next.js, mais la cible à terme est mobile :

- React Native / Expo
- ou PWA
- backend Supabase réutilisable

Cette skill évite de bloquer la migration future.

## Principes

- Isoler la logique métier dans `src/lib`
- Garder les routes serveur indépendantes du front web
- Éviter la logique métier lourde dans les composants React
- Créer des services réutilisables
- Séparer UI web et logique métier
- Prévoir offline-first pour certaines fonctions
- Prévoir une abstraction pour caméra, GPS et notifications

## Fonctions concernées

Très concernées :

- preuve photo
- capture caméra
- GPS
- notifications
- calendrier
- documents
- upload
- auth
- storage
- export PDF
- mode hors connexion

## Web actuel

Sur Next.js :

- continuer à utiliser App Router
- garder les routes IA côté serveur
- garder Supabase côté client uniquement pour les actions autorisées
- ne pas exposer les secrets
- garder les composants simples

## Mobile futur

Prévoir que ces fonctions devront être adaptées :

- capture photo native
- permissions caméra
- permissions GPS
- notifications push
- fichiers locaux
- reprise upload après échec
- stockage temporaire local
- état hors ligne

## PWA

Pour une PWA :

- service worker
- manifest
- notifications push web
- cache prudent
- attention aux données sensibles en cache
- pas de cache public des preuves ou jugements

## Checklist

Avant d’ajouter une fonctionnalité :

- La logique peut-elle être réutilisée en mobile ?
- Les accès caméra/GPS sont-ils abstraits ?
- Les données sensibles sont-elles protégées hors ligne ?
- Le code serveur reste-t-il indépendant ?
- L’UI web ne contient-elle pas trop de logique ?
