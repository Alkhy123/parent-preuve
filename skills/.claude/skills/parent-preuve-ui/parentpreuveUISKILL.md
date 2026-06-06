---
name: parent-preuve-ui
description: À utiliser pour toute modification d’interface Parent Preuve : pages, composants, formulaires, navigation, Tailwind, responsive, lisibilité mobile.
---

# UI Parent Preuve

## Identité visuelle

Couleurs :

- Navy : `#15233F`
- Or : `#C2A24C`
- Crème : `#F8F6F1`
- Texte : `#1F2733`

Typographie :

- Titres : Playfair Display via `.font-display`
- Texte : sobre, lisible, professionnel

## Composants existants à réutiliser

- `PageHeader.tsx`
- `EncartPliable.tsx`
- `NavBar.tsx`
- `ConsentementIA.tsx`
- `StatutConsentementIA.tsx`

## Règles d’interface

- Fond crème pour les cartes principales.
- Champs de formulaire en `bg-white text-[#1F2733]`.
- Boutons sobres.
- Ne pas créer une nouvelle identité visuelle.
- Garder les pages simples pour un utilisateur non juriste.
- Les actions principales doivent être visibles.
- Les avertissements IA doivent être clairs.

## Navigation

La navigation est organisée dans `NavBar.tsx` via `GROUPES`.

Ajouter un lien dans la bonne famille :

- Mon dossier
- Suivi
- Organisation
- Pièces & preuves
- Production

Pour `/dossier/import-pdf`, famille recommandée :

- Mon dossier

Nom possible :

- “Import jugement PDF”
- ou “Analyse PDF du jugement”

## Responsive

À prévoir :

- menu hamburger futur
- formulaires lisibles sur mobile
- boutons empilés sur petit écran
- textes d’avertissement courts mais clairs

## Messages IA

Utiliser des bandeaux visibles :

- “Proposé par l’IA — à vérifier”
- “Aucune donnée n’est enregistrée tant que vous ne validez pas”
- “Ne transmettez pas de données de santé”
- “Cette analyse ne remplace pas un conseil juridique”

## Checklist UI

- `PageHeader` présent ?
- Couleurs respectées ?
- Formulaire lisible ?
- Mobile acceptable ?
- Avertissements visibles ?
- Action principale claire ?
- Pas de jargon inutile ?
