---
name: parent-preuve-context
description: À utiliser au début de toute tâche sur le projet Parent Preuve. Charge le contexte métier, technique, juridique, IA, Supabase et les conventions de travail du projet.
---

# Parent Preuve — contexte obligatoire

## Objectif

Cette skill sert de point d’entrée pour toute intervention sur le projet **Parent Preuve**.

Avant de modifier le projet, lire en priorité :

- `PARENT_PREUVE_CONTEXTE.md`
- `AGENTS.md` si présent
- `CLAUDE.md` si présent

Si une information du contexte semble contredire le code réel, **le code fait foi**. Dans ce cas, signaler clairement l’écart avant de modifier.

## Positionnement du produit

Parent Preuve aide les parents en coparentalité, après décision du JAF, à organiser un dossier factuel :

- journal d’événements
- frais
- pension
- documents
- courriers
- preuves photo scellées
- export PDF
- extraction assistée par IA des règles d’un jugement

## Règles juridiques absolues

Ne jamais écrire ou laisser entendre que l’application :

- remplace un avocat
- donne un conseil juridique personnalisé
- remplace un commissaire de justice
- certifie une preuve comme un constat
- garantit la recevabilité d’une preuve
- garantit une issue judiciaire

Formulations autorisées :

- “aide à l’organisation du dossier”
- “aide à la rédaction factuelle”
- “preuve numérique renforcée”
- “preuve scellée et horodatée”
- “traçabilité renforcée”
- “soumis à l’appréciation du juge”
- “à faire relire par un professionnel du droit si nécessaire”

## Règles IA

Principe central :

> L’IA propose, l’utilisateur valide.

Règles obligatoires :

- Aucune écriture IA en base sans validation humaine.
- Toute proposition IA doit être tracée avec `source='ia'`.
- Toute proposition IA doit rester `valide=false` jusqu’à validation humaine.
- L’utilisateur doit relire et valider les sorties.
- L’IA ne doit pas inventer.
- L’IA ne doit pas qualifier juridiquement.
- L’IA ne doit pas inférer l’intention d’un parent.
- L’IA ne doit pas inférer un statut procédural depuis le seul type de décision.
- L’IA doit signaler les incertitudes.
- L’IA doit citer le passage source quand elle extrait une règle.

## Élément matériel oui, élément moral jamais

L’application peut documenter des faits constatables :

- montant dû
- montant payé
- date
- absence de remboursement
- existence d’une clause
- modalité de visite
- échéance

Elle ne doit jamais conclure seule :

- “abandon de famille”
- “volontairement”
- “mauvaise foi”
- “manipulation”
- “dangerosité”
- “mensonge”
- “pervers narcissique”

Préférer :

- “il ressort de la pièce…”
- “le texte mentionne…”
- “l’utilisateur indique…”
- “cet élément pourrait être soumis à l’appréciation du juge”

## Stack actuelle

- Next.js 16 App Router
- TypeScript
- dossier `src/`
- Tailwind CSS
- Supabase PostgreSQL / Auth / Storage
- RLS partout
- Mistral côté serveur uniquement
- jsPDF + jspdf-autotable
- Windows / PowerShell

## Règles Next.js du projet

- Route serveur = `route.ts`
- Une fonction par méthode HTTP
- Utiliser `export async function POST(request: Request)`
- Utiliser `await request.json()`
- Utiliser `Response.json({...})`
- En Next.js 16, `headers()` et `cookies()` sont async
- Les secrets restent côté serveur
- Jamais de clé API dans `NEXT_PUBLIC_`

## Règles de travail avec le développeur

Le développeur est débutant.

Toujours :

- expliquer simplement
- avancer étape par étape
- nommer les fichiers exacts
- donner les commandes PowerShell si nécessaire
- donner une URL ou un test attendu après chaque étape
- éviter les réécritures massives inutiles
- préférer une modification ciblée pour les petits changements
- préférer le remplacement complet d’un fichier quand il y a beaucoup de modifications dispersées

## Réutiliser l’existant

Toujours chercher à réutiliser :

- `PageHeader.tsx`
- `EncartPliable.tsx`
- `ConsentementIA.tsx`
- `StatutConsentementIA.tsx`
- `ReglePension.tsx`
- `RegleFrais.tsx`
- `RegleDVH.tsx`
- `RegleDecision.tsx`
- `dossierCalculs.ts`
- `controleDossier.ts`
- `gardeCalendrier.ts`
- `/api/ia/reformuler`
- `/api/ia/extraire`
- les conventions Supabase/RLS existantes

## Checklist avant réponse finale

Avant de proposer ou modifier du code, vérifier :

- Ai-je respecté le positionnement juridique ?
- Ai-je évité les promesses de résultat ?
- Ai-je gardé les secrets côté serveur ?
- Ai-je respecté RLS/Supabase ?
- Ai-je prévu la validation humaine des sorties IA ?
- Ai-je donné un test concret ?
- Ai-je expliqué simplement ?
