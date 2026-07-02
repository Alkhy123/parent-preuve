# Captures UI — voie simple (baseline locale)

Outil **simple, local et robuste** pour produire une baseline visuelle de
l'application (fin de refonte UI). Il remplace, pour l'usage courant, les
anciens scripts de captures (`captures-ui.mjs`, `captures-ui-variants.mjs`,
`captures-ui-secondary-variants.mjs`, `captures-auth*.mjs`) restés instables.

## 1. Objectif

- une commande simple : `npm run capture:ui:simple` ;
- une session locale simple et fiable : `npm run capture:ui:auth` ;
- localhost uniquement par défaut, aucune dépendance Vercel / URL externe ;
- aucun secret lu ni affiché.

## 2. Différence avec les anciens scripts

- **Ne répare pas** et **n'utilise pas** l'ancien système ; il est autonome.
- Auth **interactive locale** (connexion manuelle) au lieu d'identifiants
  automatiques → plus simple, plus robuste, sans lecture de `.env.local`.
- Captures **viewport** par défaut (pas `fullPage`) → évite les artefacts des
  boutons flottants.
- Sortie **organisée** par variante / viewport + `summary.json` clair.

## 3. Prérequis

```powershell
npm install
npm run e2e:install        # Chromium pour Playwright (si pas déjà installé)
```

## 4. Lancer le serveur local

Dans un terminal dédié :

```powershell
npm run dev
```

Laisser tourner sur `http://localhost:3000`.

## 5. Créer une session auth locale

Dans un second terminal :

```powershell
npm run capture:ui:auth
```

- une fenêtre Chromium **visible** s'ouvre sur `/connexion` ;
- se connecter **manuellement**, accepter le RGPD si demandé ;
- revenir au terminal et **appuyer sur Entrée** ;
- la session est enregistrée dans `.playwright/captures-local-auth.json`
  (fichier **local**, jamais commité).

> Aucun mot de passe n'est saisi ni affiché par le script : la connexion se
> fait à la main dans le navigateur.

## 6. Lancer les captures

```powershell
npm run capture:ui:simple
```

- vérifie que le serveur répond ;
- réutilise la session locale si elle existe ;
- capture 11 pages × 4 variantes UI × 2 viewports = **88 captures** ;
- variantes : `board10-guided`, `board10-comfort`, `vue-ensemble-guided`,
  `vue-ensemble-comfort` ;
- viewports : `desktop` 1440×1000, `mobile` 390×844.

Option (non obligatoire) — captures pleine page :

```powershell
$env:CAPTURE_FULL_PAGE="1"; npm run capture:ui:simple
```

## 7. Où trouver les captures

```text
captures-ui/<AAAA-MM-JJ>_simple-baseline/
  summary.json
  manifest.json
  board10-guided/
    desktop/ accueil.png collecter.png … compte.png
    mobile/  …
  board10-comfort/ …
  vue-ensemble-guided/ …
  vue-ensemble-comfort/ …
```

Le dossier `captures-ui/` est **ignoré par git** : les images ne sont jamais
commitées.

## 8. Lire `summary.json`

```json
{
  "connecte": true,
  "pages": 11,
  "variantes": 4,
  "viewports": 2,
  "attendues": 88,
  "ok": 88,
  "erreurs": 0,
  "redirigees": 0,
  "dossier": "captures-ui/2026-07-02_simple-baseline"
}
```

- `connecte` : au moins une page protégée a été rendue (session valide) ;
- `ok` : captures valides ;
- `redirigees` : pages renvoyées vers `/connexion` (non comptées OK) ;
- `erreurs` : timeout, écran « Chargement… » figé, screenshot manquant, etc.

`manifest.json` détaille chaque entrée (état, URL finale, préférence appliquée,
erreurs console éventuelles).

## 9. En cas de redirection vers /connexion

La session locale est absente ou expirée. Refaire :

```powershell
npm run capture:ui:auth
npm run capture:ui:simple
```

## 10. À ne JAMAIS commiter

- `.env.local` (secrets) ;
- `.playwright/captures-local-auth.json` (cookies / tokens de session) ;
- `captures-ui/**` (images générées).

Tous sont déjà couverts par `.gitignore`.
