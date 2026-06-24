# Tests end-to-end (Playwright) — remplissage automatique pour les tests

Ces tests **pilotent l'application déployée** (Vercel) avec un **compte de test
dédié** pour remplir automatiquement un dossier réaliste (2 procédures, enfants,
faits, frais). Tu fais ensuite les vérifications visuelles de la checklist
(cloisonnement A/B, calendrier, export, copilote) sans tout saisir à la main.

> ⚠️ Cela écrit dans le Supabase de **production** (seule base du projet), mais
> uniquement sous le **compte de test**. Tout est préfixé `[TEST]` et un mode de
> nettoyage supprime le compte et ses données.

## Installation (une fois)

```bash
npm i -D @playwright/test
npm run e2e:install        # télécharge le navigateur Chromium
```

## Variables d'environnement

Ajoute dans `.env.local` (déjà ignoré par git) :

```
TEST_EMAIL=test-preprod@exemple.com
TEST_PASSWORD=un-mot-de-passe-solide
# Facultatif (défaut = app Vercel de prod) :
# PARENT_PREUVE_URL=https://parent-preuve.vercel.app
```

`NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` doivent déjà être dans
`.env.local` (utilisés pour créer le compte de test).

## Utilisation

```bash
# 1) Créer le compte de test (confirmé, prêt à se connecter)
npm run e2e:compte

# 2) Remplir le dossier de test via l'UI déployée
npm run test:e2e

# 3) Tester à la main : se connecter sur l'app avec TEST_EMAIL / TEST_PASSWORD
#    et dérouler CHECKLIST_TESTS_PREPRODUCTION.md
```

Voir le rapport détaillé en cas d'échec :

```bash
npx playwright show-report
```

Lancer en mode visible (voir le navigateur agir) :

```bash
npx playwright test --headed
```

## Nettoyage

```bash
npm run e2e:compte -- --delete   # supprime le compte de test + ses données (cascade)
```

> Remarque : d'éventuels fichiers Storage ajoutés **manuellement** (preuves,
> documents) ne sont pas purgés par ce script ; supprime-les depuis l'app avant,
> ou via la suppression de compte intégrée.

## Périmètre actuel du seed

Couvert (`seed.spec.ts`) : connexion, 2 procédures (autres parents distincts),
1 enfant + détails procédure/jugement + 1 fait + 1 frais **par procédure**.

Non couvert (à étendre ou à saisir à la main) :
- règle de pension (utile pour tester la question IA « règle de pension ») ;
- preuves photo (upload de fichier + GPS) ;
- calendrier de garde (date de référence + zone vacances).

## Notes techniques

- L'auth Parent Preuve est côté navigateur (session Supabase en `localStorage`) :
  `auth.setup.ts` se connecte une fois et sauvegarde la session
  (`playwright/.auth/user.json`, ignoré par git).
- La procédure active est mémorisée en `localStorage` (`procedure_active_id`) :
  le seed la bascule directement entre A et B.
- `tests-e2e/` et `playwright.config.ts` sont exclus du `tsconfig`/ESLint pour ne
  pas dépendre de Playwright lors de `npm run build`.
